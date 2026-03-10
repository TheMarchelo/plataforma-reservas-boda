from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from firebase_service import get_firestore_db
import time

router = APIRouter(prefix="/photos", tags=["photos"])
db = get_firestore_db()

class PhotoCreate(BaseModel):
    url: str
    guest_name: Optional[str] = "Invitado"
    caption: Optional[str] = ""

class PhotoResponse(PhotoCreate):
    id: str
    timestamp: float

@router.post("/", response_model=PhotoResponse)
async def add_photo(photo: PhotoCreate):
    try:
        photo_data = photo.dict()
        photo_data["timestamp"] = time.time()
        
        doc_ref = db.collection("photos").document()
        doc_ref.set(photo_data)
        
        return {**photo_data, "id": doc_ref.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[PhotoResponse])
async def get_photos():
    try:
        photos_ref = db.collection("photos").order_by("timestamp", direction="DESCENDING")
        docs = photos_ref.stream()
        
        return [{**doc.to_dict(), "id": doc.id} for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{photo_id}")
async def delete_photo(photo_id: str):
    try:
        db.collection("photos").document(photo_id).delete()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
