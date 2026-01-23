from fastapi import APIRouter, HTTPException
from typing import List
from models import Seat, SeatStatus
from firebase_service import get_firestore_db

router = APIRouter(prefix="/seats", tags=["seats"])

@router.get("/", response_model=List[Seat])
def get_seats():
    db = get_firestore_db()
    docs = db.collection("hacientos").stream()
    return [Seat(**doc.to_dict()) for doc in docs]

@router.post("/initialize")
def initialize_seats():
    """Script one-off para crear los asientos en Firestore 'hacientos'"""
    db = get_firestore_db()
    batch = db.batch()
    
    # Crear 30 asientos de ejemplo
    for i in range(1, 41): # Aumentamos a 40 para tener más espacio
        seat_id = f"A{i}"
        doc_ref = db.collection("hacientos").document(seat_id)
        
        # 1-15 y 31-35: Groom, Resto: Bride
        section = "esposo" if i <= 15 or (i > 30 and i <= 35) else "esposa"
        
        seat = Seat(
            id=seat_id,
            label=f"Asiento {i}",
            status=SeatStatus.AVAILABLE,
            section=section,
            assigned_guest_id=None
        )
        batch.set(doc_ref, seat.dict())
        
    batch.commit()
    return {"message": "40 asientos inicializados en 'hacientos'"}

@router.put("/{seat_id}/reserve")
def reserve_seat(seat_id: str, guest_id: str):
    db = get_firestore_db()
    doc_ref = db.collection("hacientos").document(seat_id)
    
    # Usar transaccion para evitar conflictos de concurrencia
    transaction = db.transaction()
    
    @firestore.transactional
    def update_in_transaction(transaction, doc_ref):
        snapshot = doc_ref.get(transaction=transaction)
        if not snapshot.exists:
             raise HTTPException(status_code=404, detail="Asiento no encontrado")
        
        seat_data = snapshot.to_dict()
        if seat_data.get("status") != "available":
             raise HTTPException(status_code=400, detail="Asiento ya ocupado")
             
        transaction.update(doc_ref, {
            "status": "occupied",
            "assigned_guest_id": guest_id
        })
        
    # Nota: Firestore transaction en Python requiere estructura especifica.
    # Por simplicidad ahora usaremos update directo con chequeo previo.
    # Si quisieras transacción real necesitarías importar 'transactional' de google.cloud.firestore
    
    # Check simple
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Asiento no encontrado")
    
    if doc.to_dict().get("status") != "available":
        raise HTTPException(status_code=400, detail="Asiento no disponible")
        
    doc_ref.update({
        "status": "occupied",
        "assigned_guest_id": guest_id
    })
    
    return {"message": "Asiento reservado con éxito"}

from pydantic import BaseModel

class SeatBatchRequest(BaseModel):
    guest_id: str
    seat_ids: List[str]

@router.put("/reserve-batch")
def reserve_seats_batch(request: SeatBatchRequest):
    """Reservar múltiples asientos: actualiza asientos y confirma invitado"""
    db = get_firestore_db()
    batch = db.batch()
    
    guest_id = request.guest_id
    seat_ids = request.seat_ids

    # 1. Obtener info del invitado para el nombre y actualizar status
    guest_ref = db.collection("invitados").document(guest_id)
    guest_doc = guest_ref.get()
    
    if not guest_doc.exists:
        raise HTTPException(status_code=404, detail="Invitado no encontrado")
        
    guest_data = guest_doc.to_dict()
    guest_name = guest_data.get("nombre_completo", "Desconocido")
    
    # Confirmar invitado
    batch.update(guest_ref, {"confirmado": True})
    
    # 1.5. Liberar asientos previos que YA NO están en la nueva lista
    # Buscar todos los asientos de este guest
    current_seats_ref = db.collection("hacientos").where("assigned_guest_id", "==", guest_id)
    current_seats = current_seats_ref.get()
    
    for seat in current_seats:
        if seat.id not in seat_ids:
            # Liberar
            batch.update(seat.reference, {
                "status": "available",
                "assigned_guest_id": None,
                "assigned_guest_name": None
            })

    # 2. Actualizar cada asiento nuevo
    for seat_id in seat_ids:
        doc_ref = db.collection("hacientos").document(seat_id)
        doc = doc_ref.get()
        
        if not doc.exists:
             raise HTTPException(status_code=404, detail=f"Asiento {seat_id} no encontrado")
        
        # Permitir re-asignar si ya es del mismo user? O si se quiere corregir.
        # Por ahora check simple de ocupado por otro.
        seat_data = doc.to_dict()
        if seat_data.get("status") != "available" and seat_data.get("assigned_guest_id") != guest_id:
             # Si está ocupado por ALGUIEN MAS, error. Si es el mismo, ok (idempotente)
             raise HTTPException(status_code=400, detail=f"Asiento {seat_id} ya ocupado por otro invitado")
             
        batch.update(doc_ref, {
            "status": "occupied",
            "assigned_guest_id": guest_id,
            "assigned_guest_name": guest_name # Guardamos nombre para mostrar en mapa
        })
        
    batch.commit()
    return {"message": "Asignación actualizada correctamente"}

@router.post("/reset")
def reset_all_seats():
    """Libera TODOS los asientos y des-confirma a TODOS los invitados"""
    db = get_firestore_db()
    batch = db.batch()
    
    # 1. Resetear asientos
    all_seats = db.collection("hacientos").stream()
    for seat in all_seats:
        # Solo resetear si están ocupados para ahorrar escrituras? 
        # Mejor resetear todo para asegurar consistencia.
        batch.update(seat.reference, {
            "status": "available",
            "assigned_guest_id": None,
            "assigned_guest_name": None
        })

    # 2. Des-confirmar invitados
    all_guests = db.collection("invitados").stream()
    for guest in all_guests:
        batch.update(guest.reference, {"confirmado": False})
        
    batch.commit()
    return {"message": "Todo reseteado: Asientos libres e invitados pendientes."}
