from fastapi import APIRouter, HTTPException
from typing import List
from models import Guest, GuestCreate, GuestBase
from firebase_service import get_firestore_db

router = APIRouter(
    prefix="/guests",
    tags=["guests"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[Guest])
def get_guests():
    db = get_firestore_db()
    docs = db.collection("invitados").stream()
    
    results = []
    for doc in docs:
        try:
            data = doc.to_dict()
            data['id'] = doc.id 
            guest = Guest(**data)
            results.append(guest)
        except Exception as e:
            print(f"ERROR parseando invitado {doc.id}: {e}")
            with open("error.log", "a") as f:
                f.write(f"DOC {doc.id} ERROR: {str(e)}\nDATA: {doc.to_dict()}\n\n")
            continue
            
    return results

@router.post("/", response_model=Guest)
def create_guest(guest: GuestCreate):
    try:
        db = get_firestore_db()
        doc_ref = db.collection("invitados").document()
        
        new_guest_data = guest.dict()
        # new_guest_data['nombres_invitados'] = [] # Ya viene en el modelo base si es necesario
        
        new_guest = Guest(id=doc_ref.id, **new_guest_data)
        doc_ref.set(new_guest.dict())
        return new_guest
    except Exception as e:
        print(f"ERROR CREATING GUEST: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{guest_id}", response_model=Guest)
def update_guest(guest_id: str, guest: GuestCreate):
    try:
        db = get_firestore_db()
        doc_ref = db.collection("invitados").document(guest_id)
        
        if not doc_ref.get().exists:
             raise HTTPException(status_code=404, detail="Invitado no encontrado")

        update_data = guest.dict()
        # No queremos sobrescribir nombres_invitados si ya existen, a menos que lo manejemos explícitamente.
        # Por ahora, asumimos que el admin edita datos base.
        # Si update_data tiene nombres vacios, cuidado. 
        # Pydantic .dict() devuelve todo. 
        
        # En este caso simple, reemplazamos los campos editables.
        doc_ref.update(update_data)

        # Actualizar nombre en asientos asignados si cambió
        new_name = update_data.get("nombre_completo")
        if new_name:
            seats_ref = db.collection("hacientos").where("assigned_guest_id", "==", guest_id)
            occupied_seats = seats_ref.get()
            
            if occupied_seats:
                batch = db.batch()
                for seat in occupied_seats:
                    batch.update(seat.reference, {"assigned_guest_name": new_name})
                batch.commit()
        
        # Leemos de nuevo para devolver el objeto completo
        updated_doc = doc_ref.get()
        data = updated_doc.to_dict()
        data['id'] = updated_doc.id
        return Guest(**data)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"ERROR UPDATING GUEST: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{guest_id}")
def delete_guest(guest_id: str):
    db = get_firestore_db()
    batch = db.batch()
    
    # 1. Buscar asientos ocupados por este guest
    seats_ref = db.collection("hacientos").where("assigned_guest_id", "==", guest_id)
    occupied_seats = seats_ref.get()
    
    # 2. Liberar asientos
    for seat in occupied_seats:
        batch.update(seat.reference, {
            "status": "available",
            "assigned_guest_id": None,
            "assigned_guest_name": None
        })
        
    # 3. Eliminar invitado
    guest_ref = db.collection("invitados").document(guest_id)
    batch.delete(guest_ref)
    
    batch.commit()
    return {"message": f"Guest deleted and {len(occupied_seats)} seats released"}
