import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GuestModal from '../components/GuestModal';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

export default function AdminDashboard() {
    const [guests, setGuests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [guestToDelete, setGuestToDelete] = useState(null);
    const [loading, setLoading] = useState(false);

    // navigate unused for logout now handled in navbar, but kept if needed for other things
    const navigate = useNavigate();

    // Cargar invitados
    const fetchGuests = async () => {
        setLoading(true);
        try {
            // Ajustar URL
            const res = await axios.get('http://localhost:8000/guests/');
            setGuests(res.data);
        } catch (error) {
            console.error("Error cargando invitados", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    const handleSaveGuest = async (guestData) => {
        try {
            if (editingGuest) {
                // Modo Edición: Usar PUT real
                await axios.put(`http://localhost:8000/guests/${editingGuest.id}`, guestData);
            } else {
                // Modo Creación: Usar POST
                await axios.post('http://localhost:8000/guests/', guestData);
            }

            fetchGuests();
            setIsModalOpen(false);
            setEditingGuest(null);
        } catch (error) {
            console.error("Error guardando invitado", error);
            const detail = error.response?.data?.detail;
            const errorMsg = typeof detail === 'object'
                ? JSON.stringify(detail, null, 2)
                : (detail || error.message || "Error desconocido");

            alert(`Error guardando: ${errorMsg}`);
        }
    };

    const handleDelete = (guest) => {
        setGuestToDelete(guest);
    };

    const confirmDelete = async () => {
        if (!guestToDelete) return;
        try {
            await axios.delete(`http://localhost:8000/guests/${guestToDelete.id}`);
            fetchGuests();
            setGuestToDelete(null);
        } catch (error) {
            console.error("Error eliminando", error);
            alert("Error al eliminar invitado");
        }
    };

    const handleResetAll = async () => {
        if (window.confirm('PELIGRO: ¿Estás seguro de que quieres LIBERAR TODAS LAS MESAS? Esto borrará todas las reservas actuales y pondrá a todos los invitados como "No Confirmados".')) {
            try {
                await axios.post('http://localhost:8000/seats/reset');
                alert("Se han liberado todas las mesas.");
                fetchGuests(); // Recargar lista para ver status actualizados
            } catch (error) {
                console.error("Error resetting seats:", error);
                alert("Error al resetear mesas.");
            }
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <AdminNavbar />
            <main className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl text-dark-black font-serif">Lista de Invitados</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={handleResetAll}
                            className="bg-red-500 text-white px-4 py-2 rounded font-bold shadow hover:bg-red-600 transition"
                        >
                            Liberar Mesas
                        </button>
                        <button
                            onClick={() => navigate('/admin/asignar')}
                            className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-blue-700 transition"
                        >
                            Asignar Asientos
                        </button>
                        <button
                            onClick={() => { setEditingGuest(null); setIsModalOpen(true); }}
                            className="bg-gold text-dark-black px-4 py-2 rounded font-bold shadow hover:bg-yellow-400 transition"
                        >
                            + Nuevo Invitado
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando invitados...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-sm">
                                    <th className="p-4">Nombre</th>
                                    <th className="p-4">Familia</th>
                                    <th className="p-4">Acompañantes Max</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guests.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-gray-500">No hay invitados registrados o error de conexión.</td>
                                    </tr>
                                )}
                                {guests.map(guest => (
                                    <tr key={guest.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800">{guest.nombre_completo}</td>
                                        <td className="p-4">
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${guest.familia === 'esposo' ? 'bg-blue-600' : 'bg-pink-600'}`}></span>
                                            {guest.familia === 'esposo' ? 'Esposo' : 'Esposa'}
                                        </td>
                                        <td className="p-4">{guest.cantidad_invitados}</td>

                                        <td className="p-4">
                                            {guest.confirmado ?
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">Confirmado</span> :
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">Pendiente</span>
                                            }
                                        </td>
                                        <td className="p-4 text-right gap-2">
                                            <button
                                                onClick={() => { setEditingGuest(guest); setIsModalOpen(true); }}
                                                className="text-royal-blue hover:text-blue-800 font-semibold text-sm mr-3"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(guest)}
                                                className="text-red-500 hover:text-red-700 font-semibold text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <GuestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveGuest}
                guest={editingGuest}
            />

            {/* Modal Confirmación Eliminación */}
            {guestToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar Invitado?</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar a <span className="font-bold text-royal-blue">{guestToDelete.nombre_completo}</span>?
                            <br /><span className="text-xs text-red-500 mt-2 block">Esta acción liberará sus asientos asignados.</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setGuestToDelete(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 shadow-lg transition"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
