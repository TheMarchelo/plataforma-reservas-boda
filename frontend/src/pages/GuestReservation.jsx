import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SeatMap from '../components/SeatMap';
import { motion } from 'framer-motion';

export default function GuestReservation() {
    // Estados
    const [step, setStep] = useState(1);
    // 1: Familia, 2: Selección Nombre (Lista), 3: Verificación Datos, 4: Asiento

    const [selectedFamily, setSelectedFamily] = useState(null);
    const [allGuests, setAllGuests] = useState([]);
    const [filteredGuests, setFilteredGuests] = useState([]);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(false);

    // Cargar asientos solo al inicio (Sin polling para proteger cuota)
    useEffect(() => {
        fetchSeats();
    }, []);

    // Cargar lista de guests al inicio
    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const res = await axios.get('http://localhost:8000/guests/');
                setAllGuests(res.data);
            } catch (error) {
                console.error("Error loading guests", error);
            }
        };
        fetchGuests();
    }, []);

    // Filtrar cuando cambia familia
    useEffect(() => {
        if (selectedFamily) {
            const filtered = allGuests.filter(g =>
                g.familia === selectedFamily && !g.confirmado // Solo mostrar no confirmados
            );
            setFilteredGuests(filtered);
        }
    }, [selectedFamily, allGuests]);


    const fetchSeats = async () => {
        try {
            const res = await axios.get('http://localhost:8000/seats/');
            if (res.data) setSeats(res.data);
        } catch (error) {
            console.error("Error fetching seats", error);
        }
    };

    const handleFamilySelect = (side) => {
        setSelectedFamily(side);
        setStep(2);
    };

    const handleGuestSelect = (guest) => {
        setSelectedGuest(guest);
        setStep(3); // Confirmar datos
    };

    const handleConfirmData = () => {
        setStep(4); // Ir al mapa
    };

    const handleSeatClick = (seat) => {
        // Verificar límite
        const maxSeats = selectedGuest.cantidad_invitados > 0 ? selectedGuest.cantidad_invitados : 1;

        if (selectedSeats.find(s => s.id === seat.id)) {
            // Deseleccionar
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            // Seleccionar
            if (selectedSeats.length >= maxSeats) {
                alert(`Solo puedes reservar hasta ${maxSeats} asientos.`);
                return;
            }
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const confirmReservation = async (e) => {
        e.preventDefault();
        const maxSeats = selectedGuest.cantidad_invitados > 0 ? selectedGuest.cantidad_invitados : 1;

        if (selectedSeats.length !== maxSeats) {
            if (!confirm(`Has seleccionado ${selectedSeats.length} asientos, pero tienes derecho a ${maxSeats}. ¿Quieres confirmar de todas formas?`)) {
                return;
            }
        }

        setLoading(true);
        try {
            // Usar endpoint batch
            const seatIds = selectedSeats.map(s => s.id);
            await axios.put(`http://localhost:8000/seats/reserve-batch?guest_id=${selectedGuest.id}`, seatIds);

            alert(`¡Reserva Exitosa! Se han asignado los asientos: ${seatIds.join(", ")}`);
            window.location.reload();
        } catch (error) {
            console.error("Error reservando", error);
            alert("Error reservando. Alguien pudo haber ganado el lugar. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header igual... */}
            <header className="p-6 text-center bg-white shadow-sm border-b-4 border-gold">
                <h1 className="text-4xl text-royal-blue font-serif mb-2">Anthony & Daniela</h1>
                <p className="text-gray-500 uppercase tracking-widest text-sm">Reserva de Asientos</p>
            </header>

            <main className="flex-1 p-4 flex flex-col items-center w-full">
                {/* Steps 1, 2, 3 igual ... */}
                {step === 1 && (
                    // ... codigo existente
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="max-w-md w-full text-center mt-10"
                    >
                        <h2 className="text-2xl font-serif text-dark-black mb-8">¿De qué familia eres invitado?</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => handleFamilySelect('esposo')} className="p-6 bg-royal-blue text-white rounded-lg shadow-lg hover:bg-blue-800 transition transform hover:-translate-y-1">
                                <span className="block text-2xl font-serif mb-2">Familia del Novio</span>
                                <span className="text-blue-200 text-sm">(Anthony)</span>
                            </button>
                            <button onClick={() => handleFamilySelect('esposa')} className="p-6 bg-pink-600 text-white rounded-lg shadow-lg hover:bg-pink-700 transition transform hover:-translate-y-1">
                                <span className="block text-2xl font-serif mb-2">Familia de la Novia</span>
                                <span className="text-pink-200 text-sm">(Daniela)</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    // ... codigo existente
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg w-full">
                        <button onClick={() => setStep(1)} className="text-gray-500 mb-4 hover:underline">&larr; Volver</button>
                        <h2 className="text-2xl font-serif text-center mb-6">Busca tu nombre en la lista</h2>
                        {filteredGuests.length === 0 ? (
                            <div className="text-center p-6 bg-yellow-50 text-yellow-800 rounded">No se encontraron invitados pendientes.</div>
                        ) : (
                            <div className="bg-white shadow rounded max-h-96 overflow-y-auto divide-y">
                                {filteredGuests.map(guest => (
                                    <button key={guest.id} onClick={() => handleGuestSelect(guest)} className="w-full text-left p-4 hover:bg-blue-50 transition flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">{guest.nombre_completo}</span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">+{guest.cantidad_invitados} Pax</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {step === 3 && selectedGuest && (
                    // ... codigo existente
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full bg-white p-6 rounded shadow-lg">
                        <button onClick={() => setStep(2)} className="text-gray-500 mb-4 hover:underline">&larr; Volver</button>
                        <h2 className="text-2xl font-serif mb-4 text-royal-blue">Confirma tus datos</h2>
                        <div className="mb-4">
                            <label className="block text-gray-500 text-sm">Nombre</label>
                            <div className="text-xl font-bold">{selectedGuest.nombre_completo}</div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-500 text-sm">Asientos a Reservar</label>
                            <div className="text-4xl font-bold text-gold">{selectedGuest.cantidad_invitados}</div>
                            <p className="text-xs text-gray-400 mt-1">Podrás seleccionar {selectedGuest.cantidad_invitados} sillas en el mapa.</p>
                        </div>
                        <button onClick={handleConfirmData} className="w-full bg-royal-blue text-white py-3 rounded font-bold hover:bg-blue-800 transition shadow">
                            Seleccionar Asientos
                        </button>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-full max-w-6xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setStep(3)} className="text-gray-500 hover:text-royal-blue underline">&larr; Volver</button>
                            <div className="text-lg font-serif">Reservando para: <span className="font-bold text-royal-blue">{selectedGuest?.nombre_completo}</span></div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            <div className="flex-1 w-full overflow-x-auto">
                                <SeatMap
                                    seats={seats}
                                    selectedFamily={selectedFamily}
                                    onSelectSeat={handleSeatClick}
                                    currentSelection={selectedSeats}
                                // NOTE: Updated SeatMap to support array or update here to just pass array
                                // Pero SeatMap espera 'currentSelection' como objeto o array? 
                                // Vamos a actualizar SeatMap tambien.
                                />
                            </div>

                            <div className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-xl sticky top-4">
                                <h3 className="text-xl font-serif text-royal-blue mb-4 border-b pb-2">Tus Asientos</h3>
                                {selectedSeats.length === 0 ? (
                                    <p className="text-gray-500 italic">Selecciona {selectedGuest.cantidad_invitados} asientos en el mapa.</p>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-gray-100 p-3 rounded text-center grid grid-cols-3 gap-2">
                                            {selectedSeats.map(s => (
                                                <span key={s.id} className="text-lg font-bold text-royal-blue border border-blue-200 bg-white rounded p-1">{s.id}</span>
                                            ))}
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            {selectedSeats.length} / {selectedGuest.cantidad_invitados} seleccionados
                                        </div>
                                        <button
                                            onClick={confirmReservation}
                                            disabled={loading || selectedSeats.length === 0}
                                            className="w-full bg-gold text-dark-black font-bold py-3 rounded hover:bg-yellow-400 transition shadow-lg disabled:opacity-50"
                                        >
                                            {loading ? 'Confirmando...' : 'CONFIRMAR RESERVA'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
