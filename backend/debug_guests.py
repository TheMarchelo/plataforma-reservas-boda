import firebase_admin
from firebase_admin import credentials, firestore
import os

print("--- DEBUG SCRIPT START ---")
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    print("Conectado a Firestore.")
    
    collection_ref = db.collection("invitados")
    docs = list(collection_ref.stream())
    
    print(f"Número de documentos encontrados en 'invitados': {len(docs)}")
    
    for doc in docs:
        print(f"\nID: {doc.id}")
        print(f"DATA: {doc.to_dict()}")
        
except Exception as e:
    print(f"ERROR: {e}")
print("--- DEBUG SCRIPT END ---")
