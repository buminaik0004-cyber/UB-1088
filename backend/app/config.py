import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from dotenv import load_dotenv
import os

load_dotenv()

_initialized = False

def get_firebase_app():
    global _initialized
    if not _initialized:
        service_account_path = os.getenv("SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET")
        })
        _initialized = True
    return firebase_admin.get_app()

def get_db():
    get_firebase_app()
    return firestore.client()

def get_storage():
    get_firebase_app()
    return storage.bucket()

def get_auth():
    get_firebase_app()
    return auth
