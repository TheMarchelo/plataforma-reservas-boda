from pydantic import BaseModel, Field
from typing import List, Optional, Any
from enum import Enum

class FamilySide(str, Enum):
    GROOM = "esposo"
    BRIDE = "esposa"
    MIXED = "mixta"
    NOVIOS = "novios"

class GuestBase(BaseModel):
    nombre_completo: str
    familia: str 
    cantidad_invitados: int = 1 
    confirmado: bool = False
    # Movemos esto aquí para que GuestCreate lo herede y permita actualizarlo
    nombres_invitados: Any = Field(default=None, alias="nombre de los invitados")

class Companion(BaseModel):
    nombre_completo: str

class GuestCreate(GuestBase):
    pass

class Guest(GuestBase):
    id: str
    seat_id: Optional[str] = None
    
    class Config:
        allow_population_by_field_name = True

class SeatStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    LOCKED = "locked" # Temporalmente bloqueado mientras selecciona

class Seat(BaseModel):
    id: str # A1, A2... A30
    label: str
    status: SeatStatus
    section: FamilySide # Para mostrar/ocultar según familia
    assigned_guest_id: Optional[str] = None
