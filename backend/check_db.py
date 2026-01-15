from firebase_service import get_firestore_db

def check():
    db = get_firestore_db()
    print("Conectado a Firestore.")
    
    collection = db.collection("hacientos")
    docs = list(collection.stream())
    
    print(f"Total documentos en 'hacientos': {len(docs)}")
    
    if len(docs) > 0:
        first_doc = docs[0]
        print(f"ID: {first_doc.id}")
        print(f"Data: {first_doc.to_dict()}")
    else:
        print("La colección está vacía.")

if __name__ == "__main__":
    check()
