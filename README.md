# Plataforma de Reservas - Boda Anthony & Daniela

Sistema web para la gestión de invitados y reserva de asientos para la boda.

## 🚀 Funcionalidades Implementadas (Commit Inicial)

### 1. Sistema de Reservas
*   **Mapa Interactivo**: Diseño visual de asientos en distribución de "U".
    *   **Mesa de Honor**: Distribución horizontal con los novios en el centro.
    *   **Mesas Laterales**: Distribución vertical con cabeceras (1-4-4-1).
*   **Gestión de Cupos**: Validación automática de la cantidad de asientos permitidos por invitado.
*   **Estado de Asientos**: Visualización en tiempo real de asientos Disponibles (Azul), Ocupados (Gris) y Selección del usuario (Dorado).

### 2. Panel de Administración
*   **Gestión de Invitados**: CRUD completo (Crear, Leer, Actualizar, Borrar) conectado a Firebase Firestore.
*   **Control de Mesas**:
    *   Liberación automática de asientos al eliminar un invitado.
    *   **Botón de Reset Global**: Funcionalidad para liberar todas las mesas y reiniciar confirmaciones en caso de errores.

### 3. Backend (FastAPI + Firebase)
*   **API REST**: Endpoints para gestión de invitados y transacciones de asientos.
*   **Batch Operations**: Optimización de escrituras para reservar múltiples asientos en una sola transacción.
*   **Protección de Cuota**: Lógica optimizada para minimizar lecturas a la base de datos (eliminación de polling excesivo).

## 🛠️ Tecnologías
*   **Frontend**: React + Vite + TailwindCSS + Framer Motion.
*   **Backend**: Python FastAPI.
*   **Base de Datos**: Google Firebase Firestore.