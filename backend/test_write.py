from firebase_service import get_firestore_db
import time

def test_write():
    print("Intentando escribir un documento de prueba...")
    try:
        db = get_firestore_db()
        # Intentar crear un documento en una colección temporal
        doc_ref = db.collection("test_quota").document("test_doc")
        doc_ref.set({
            "timestamp": time.time(),
            "status": "testing write quota"
        })
        print("¡ÉXITO! Se pudo escribir en la base de datos. NO es problema de cuota global.")
    except Exception as e:
        print(f"FALLO DE ESCRITURA: {e}")

if __name__ == "__main__":
    test_write()
