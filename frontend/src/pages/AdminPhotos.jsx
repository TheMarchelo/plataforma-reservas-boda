import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

export default function AdminPhotos() {
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            const res = await axios.get(`${API_URL}/photos/`);
            setPhotos(res.data);
        } catch (err) {
            console.error("Error al cargar fotos", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta foto del servidor permanentemente?")) return;
        try {
            await axios.delete(`${API_URL}/photos/${id}`);
            setPhotos(photos.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error borrando", err);
        }
    };

    const downloadImage = (url, name) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `boda_${name || 'foto'}_${Date.now()}.jpg`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-serif text-royal-blue">Gestión de Fotos</h1>
                    <p className="text-gray-400 text-sm mt-1">Modera y descarga los momentos compartidos por los invitados.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {photos.map((photo) => (
                    <motion.div 
                        key={photo.id}
                        className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 flex flex-col"
                    >
                        <div className="aspect-square">
                            <img src={photo.url} className="w-full h-full object-cover" alt="Guest upload" />
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Subido por:</p>
                                <p className="text-sm font-bold text-royal-blue truncate">{photo.guest_name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => downloadImage(photo.url, photo.guest_name)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                >
                                    Descargar
                                </button>
                                <button 
                                    onClick={() => handleDelete(photo.id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {photos.length === 0 && (
                <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-300 italic">No hay fotos subidas todavía.</p>
                </div>
            )}
        </div>
    );
}
