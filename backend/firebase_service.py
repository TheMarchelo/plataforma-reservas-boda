import firebase_admin
from firebase_admin import credentials, firestore, db

import os
import json
import base64

# Se espera que el archivo serviceAccountKey.json esté en la carpeta backend
# IMPORTANTE: El usuario debe colocar sus credenciales aquí.
# Para producción (Render), usaremos una variable de entorno con el contenido del JSON.
if os.environ.get("FIREBASE_CREDENTIALS"):
    try:
        # Decodificar base64 si es necesario, o leer directo string json
        # Asumiremos que viene como string JSON directo para facilitar lectura, 
        # o base64 si tiene saltos de linea. 
        # Render maneja secrets values.
        cred_json = json.loads(base64.b64decode(os.environ["FIREBASE_CREDENTIALS"]))
        cred = credentials.Certificate(cred_json)
    except Exception as e:
        print(f"Error cargando credenciales de ENV: {e}")
        cred = None
else:
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
    except:
        cred = None

# Inicialización de la app (Singleton)
try:
    if not firebase_admin._apps and cred:
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://anthony-daniela-boda-default-rtdb.firebaseio.com/' 
        })
        print("Firebase inicializado correctamente.")
    elif not cred:
        print("ADVERTENCIA: No se encontraron credenciales de Firebase (ni ENV ni archivo).")
except Exception as e:
    print(f"ADVERTENCIA: No se pudo inicializar Firebase. Error: {e}")

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
