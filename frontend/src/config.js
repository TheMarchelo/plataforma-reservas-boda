
// En desarrollo, Vite usa el proxy o localhost. 
// En producción, necesitamos la URL real del backend.
// Vite expone variables de entorno con import.meta.env

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
