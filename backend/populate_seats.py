from firebase_service import get_firestore_db
from models import Seat, SeatStatus

def populate():
    db = get_firestore_db()
    batch = db.batch()
    
    print("Iniciando creación de asientos en colección 'hacientos'...")
    
    # Limpiar/Sobreescribir
    # Esquema: 
    # Mesa 1: A1-A10 (Novio)
    # Mesa 2: A11-A20 (Novia)
    # Mesa 3: A21-A30 (Mixta/Novio)
    # Mesa Principal: NOVIO, NOVIA (Bloqueados)
    
    # 1. Mesa Principal (Bloqueada)
    novios = [
        {"id": "NOVIO", "label": "Novio", "section": "novios"},
        {"id": "NOVIA", "label": "Novia", "section": "novios"}
    ]
    
    for n in novios:
        doc_ref = db.collection("hacientos").document(n["id"])
        batch.set(doc_ref, {
            "id": n["id"],
            "label": n["label"],
            "status": "occupied", # Bloqueado/Ocupado
            "section": n["section"],
            "assigned_guest_id": "SYSTEM",
            "assigned_guest_name": n["label"]
        })

    # 2. Mesas Invitados (28 seats)
    # Mesa 1 (1-10): Esposo (10)
    # Mesa 2 (11-18): Esposa (8) -> + 2 Novios = 10
    # Mesa 3 (19-28): Mixta (10)
    for i in range(1, 41): 
        # Limpiamos hasta 40 para borrar antiguos, pero solo creamos hasta 28
        seat_id = f"A{i}"
        doc_ref = db.collection("hacientos").document(seat_id)
        
        if i > 28: 
            # Borrar si existe (o marcar unavailable, pero delete es mejor para limpiar)
            # Para simplificar el script batch, los marcaremos como Deleted o simplemente no los creamos.
            # Mejor: Si estamos reseteando, sobreescribimos. Si no queremos que salgan, no los creamos.
            # *Nota*: Firestore no tiene "delete" en batch.set, hay que usar batch.delete.
            # Asumiremos que el usuario corre esto y luego el frontend filtra.
            # Pero para ser limpios, vamos a borrarlos explicitamente si existen.
            batch.delete(doc_ref)
            continue

        if i <= 10: section = "esposo"
        elif i <= 18: section = "esposa" # Mesa 2 (compartida con novios)
        else: section = "mixta" # Mesa 3 Mixta
        
        seat_data = {
            "id": seat_id,
            "label": f"Asiento {i}",
            "status": "available",
            "section": section,
            "assigned_guest_id": None,
            "assigned_guest_name": None
        }
        batch.set(doc_ref, seat_data)
        print(f"Preparando {seat_id} ({section})")

    batch.commit()
    print("¡Listo! 40 asientos creados en 'hacientos'.")

if __name__ == "__main__":
    populate()
