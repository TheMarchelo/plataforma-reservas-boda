from fastapi import FastAPI
from routers import guests, seats, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Boda Anthony & Daniela API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir todo por ahora para evitar problemas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import guests_router, seats_router, auth_router, photos_router

app.include_router(guests_router)
app.include_router(seats_router)
app.include_router(auth_router)
app.include_router(photos_router)


@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de la boda de Anthony y Daniela"}
