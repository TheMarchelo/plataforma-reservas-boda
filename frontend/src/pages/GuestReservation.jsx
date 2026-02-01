import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SeatMap from '../components/SeatMap';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

export default function GuestReservation() {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSeats();
    }, []);

    const fetchSeats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/seats/`);
            if (res.data) setSeats(res.data);
        } catch (error) {
            console.error("Error fetching seats", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <header className="p-8 text-center border-b border-gray-100">
                <h1 className="text-5xl text-royal-blue font-serif mb-2 tracking-tight">Anthony & Daniela</h1>
                <p className="text-gold uppercase tracking-[0.3em] text-xs font-bold">Distribución de Mesas</p>
            </header>

            <main className="flex-1 w-full bg-white">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full flex justify-center py-10"
                >
                    {loading && seats.length === 0 ? (
                        <div className="flex justify-center items-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div>
                        </div>
                    ) : (
                        <div className="w-full max-w-screen-2xl scale-90 md:scale-100 origin-top">
                            <SeatMap
                                seats={seats}
                                selectedFamily={null}
                                onSelectSeat={() => { }}
                                currentSelection={[]}
                            />
                        </div>
                    )}
                </motion.div>
            </main>

            <footer className="p-8 text-center text-gray-300 text-[10px] uppercase tracking-widest border-t border-gray-50 flex flex-col gap-2 items-center">
                <span>&copy; 2026 Anthony & Daniela</span>
                <div className="flex gap-4 mt-2">
                    <a href="https://github.com/TheMarchelo/plataforma-reservas-boda" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-gray-400 transition-colors">Ver Código en GitHub</a>
                    <a href="/admin/dashboard" className="text-gray-200 hover:text-gray-400 transition-colors">Admin Panel</a>
                </div>
            </footer>
        </div>
    );
}
