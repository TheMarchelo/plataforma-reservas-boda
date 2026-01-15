import firebase_admin
from firebase_admin import credentials, firestore
import os

print(f"Directorio actual: {os.getcwd()}")

try:
    if not os.path.exists("serviceAccountKey.json"):
        print("ERROR: No se encuentra serviceAccountKey.json")
        exit(1)

    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    print("Firebase inicializado.")

    db = firestore.client()
    
    # Intentar escribir
    doc_ref = db.collection("guests").document("test_manual")
    doc_ref.set({
        "full_name": "Usuario Prueba Script",
        "family_side": "esposo",
        "confirmed": False
    })
    print("¡ÉXITO! Se escribió en la colección 'guests'.")
    
except Exception as e:
    print(f"ERROR: {e}")
