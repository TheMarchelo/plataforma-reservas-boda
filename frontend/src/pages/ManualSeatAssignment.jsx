import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SeatMap from '../components/SeatMap';
import AdminNavbar from '../components/AdminNavbar';

export default function ManualSeatAssignment() {
    const [guests, setGuests] = useState([]);
    const [seats, setSeats] = useState([]);
    const [selectedGuestId, setSelectedGuestId] = useState('');
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const navigate = useNavigate();

    // Cargar datos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [guestsRes, seatsRes] = await Promise.all([
                    axios.get('http://localhost:8000/guests/'),
                    axios.get('http://localhost:8000/seats/')
                ]);
                setGuests(guestsRes.data);
                setSeats(seatsRes.data);
            } catch (error) {
                console.error("Error loading data", error);
                alert("Error cargando datos");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const selectedGuest = guests.find(g => g.id === selectedGuestId);

    // Efecto para cargar los asientos actuales del invitado seleccionado
    useEffect(() => {
        if (selectedGuestId) {
            const guestSeats = seats.filter(s => s.assigned_guest_id === selectedGuestId);
            setSelectedSeatIds(guestSeats.map(s => s.id));
        } else {
            setSelectedSeatIds([]);
        }
    }, [selectedGuestId, seats]); // Dependencia seats importante por si recargamos data


    const handleSeatClick = (seat) => {
        if (!selectedGuest) {
            alert("Primero selecciona un invitado");
            return;
        }

        // Si el asiento ya está ocupado por OTRO, avisar (pero permitir si es admin? Por ahora bloqueamos)
        // La lógica del SeatMap deshabilita ocupados, así que asumimos que vienen libres o son del usuario.

        if (selectedSeatIds.includes(seat.id)) {
            setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
        } else {
            // Verificar límite estricto
            const maxSeats = selectedGuest.cantidad_invitados || 1;
            if (selectedSeatIds.length >= maxSeats) {
                alert(`Este invitado solo tiene ${maxSeats} cupos asignados.`);
                return;
            }
            setSelectedSeatIds(prev => [...prev, seat.id]);
        }
    };

    const initiateSave = () => {
        if (!selectedGuestId || selectedSeatIds.length === 0) return;
        setShowConfirmModal(true);
    };

    const executeSave = async () => {
        setShowConfirmModal(false);
        setSaving(true);
        try {
            await axios.put('http://localhost:8000/seats/reserve-batch', {
                guest_id: selectedGuestId,
                seat_ids: selectedSeatIds
            });

            alert("Asignación guardada con éxito");

            // Recargar datos
            const seatsRes = await axios.get('http://localhost:8000/seats/');
            setSeats(seatsRes.data);
            // No reseteamos guestId para que pueda seguir editando si quiere, pero refrescamos asientos
            // setSelectedSeatIds se actualiza solo por el useEffect al cambiar seats
        } catch (error) {
            console.error("Error saving", error);
            alert("Error guardando asignación: " + (error.response?.data?.detail || error.message));
        } finally {
            setSaving(false);
        }
    };

    // Helper para marcar asientos seleccionados visualmente en el mapa
    // El SeatMap usa `currentSelection` (array de objetos seat).
    const currentSelectionObjects = seats.filter(s => selectedSeatIds.includes(s.id));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <AdminNavbar />

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Sidebar de Control */}
                <div className="w-full lg:w-80 bg-white shadow-lg p-6 flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">1. Seleccionar Invitado</label>
                        <select
                            value={selectedGuestId}
                            onChange={(e) => {
                                setSelectedGuestId(e.target.value);
                                setSelectedSeatIds([]); // Reset selection on change
                            }}
                            className="w-full border border-gray-300 rounded p-2"
                        >
                            <option value="">-- Elegir Invitado --</option>
                            {guests.map(g => (
                                <option key={g.id} value={g.id}>
                                    {g.nombre_completo} ({g.cantidad_invitados} pax) - {g.confirmado ? 'Confirmado' : 'Pendiente'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedGuest && (
                        <div className="bg-blue-50 p-4 rounded border border-blue-100">
                            <p className="text-sm text-blue-800 font-bold mb-2">Detalles:</p>
                            <p className="text-sm">Familia: {selectedGuest.familia}</p>
                            <p className="text-sm">Cupos: {selectedGuest.cantidad_invitados}</p>
                            <p className="text-sm mt-2">
                                <span className="font-bold">Seleccionados: {selectedSeatIds.length}</span>
                            </p>
                        </div>
                    )}

                    <div className="mt-auto">
                        <button
                            onClick={initiateSave}
                            disabled={!selectedGuestId || selectedSeatIds.length === 0 || saving}
                            className={`w-full py-3 rounded font-bold text-white shadow transition ${!selectedGuestId || selectedSeatIds.length === 0
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {saving ? 'Guardando...' : 'Confirmar Asignación'}
                        </button>
                    </div>
                </div>

                {/* Área del Mapa */}
                <div className="flex-1 bg-gray-100 overflow-auto relative flex justify-center">
                    {loading ? (
                        <div className="mt-20">Cargando mapa...</div>
                    ) : (
                        <div className="scale-75 origin-top mt-10 lg:scale-90">
                            <SeatMap
                                seats={seats}
                                onSelectSeat={handleSeatClick}
                                selectedFamily={null} // Mostrar todos
                                currentSelection={currentSelectionObjects} // Para resaltar (aunque el componente SeatMap usa lógica interna de isSelected si se pasa)
                            // Nota: SeatMap actual usa `onSelectSeat` pero el resaltado visual depende del estado `isSelected` interno del map de render?
                            // Vamos a revisar SeatMap.jsx para asegurar que pinte los seleccionados.
                            // La lógica original coloreaba 'bg-gold' si estaba en 'currentSelection'.
                            // Vamos a pasar `currentSelection` correctamente.
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Confirmación */}
            {showConfirmModal && selectedGuest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar Asignación</h3>
                        <p className="text-gray-600 mb-4">
                            Invitado: <span className="font-bold text-royal-blue">{selectedGuest.nombre_completo}</span>
                        </p>
                        <p className="text-gray-600 mb-6">
                            Asientos seleccionados: <span className="font-bold">{selectedSeatIds.join(', ')}</span> ({selectedSeatIds.length})
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeSave}
                                className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow"
                            >
                                Confirmar y Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
