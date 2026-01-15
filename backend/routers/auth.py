from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

# Credenciales hardcodeadas por solicitud del usuario
ADMIN_EMAIL = "themarchelo.cr@gmail.com"
ADMIN_PASS = "Airwalk351507"

@router.post("/login")
def login(request: LoginRequest):
    if request.email == ADMIN_EMAIL and request.password == ADMIN_PASS:
        return {"token": "fake-super-secret-admin-token", "message": "Login exitoso"}
    else:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
