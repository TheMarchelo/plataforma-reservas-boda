import firebase_admin
from firebase_admin import credentials, firestore, db

# Se espera que el archivo serviceAccountKey.json esté en la carpeta backend
# IMPORTANTE: El usuario debe colocar sus credenciales aquí.
cred = credentials.Certificate("serviceAccountKey.json")

# Inicialización de la app (Singleton)
try:
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://anthony-daniela-boda-default-rtdb.firebaseio.com/' 
        })
    print("Firebase inicializado correctamente.")
except Exception as e:
    print(f"ADVERTENCIA: No se pudo inicializar Firebase. Asegúrate de tener serviceAccountKey.json. Error: {e}")

class MockFirestore:
    def collection(self, name):
        return self
    def document(self, name=None):
        return self
    def set(self, data):
        print(f"MOCK DB WRITE: {data}")
    def delete(self):
        print("MOCK DB DELETE")
    def stream(self):
        return []

class MockRealtime:
    def child(self, name):
        return self
    def get(self):
        return {}
    def set(self, data):
        print(f"MOCK RTDB WRITE: {data}")
    def update(self, data):
        print(f"MOCK RTDB UPDATE: {data}")

def get_firestore_db():
    if not firebase_admin._apps:
        return MockFirestore()
    return firestore.client()

def get_realtime_db():
    if not firebase_admin._apps:
        return MockRealtime()
    return db.reference()
