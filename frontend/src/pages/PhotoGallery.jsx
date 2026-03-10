import React, { useState, useEffect, useRef } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoGallery() {
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [guestName, setGuestName] = useState(localStorage.getItem('guestName') || '');
    const fileInputRef = useRef();

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

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const storageRef = ref(storage, `wedding_photos/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(p);
            }, 
            (error) => {
                console.error("Error subiendo", error);
                setUploading(false);
            }, 
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                try {
                    await axios.post(`${API_URL}/photos/`, {
                        url,
                        guest_name: guestName || "Invitado",
                        caption: ""
                    });
                    setUploading(false);
                    setProgress(0);
                    fetchPhotos();
                } catch (err) {
                    console.error("Error guardando metadata", err);
                    setUploading(false);
                }
            }
        );
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres borrar esta foto?")) return;
        try {
            await axios.delete(`${API_URL}/photos/${id}`);
            setPhotos(photos.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error borrando", err);
        }
    };

    const [selectedPhoto, setSelectedPhoto] = useState(null);

    return (
        <div className="min-h-screen bg-white pb-20">
            <header className="py-12 px-6 text-center">
                <h1 className="text-4xl md:text-5xl text-royal-blue font-serif mb-2 tracking-tight">Galería de Momentos</h1>
                <p className="text-gold uppercase tracking-[0.3em] text-xs font-bold">Captura y Comparte</p>
            </header>

            <div className="max-w-4xl mx-auto px-6">
                {/* Upload Section */}
                <div className="bg-gray-50 rounded-2xl p-8 mb-12 text-center border border-gray-100 shadow-sm">
                    <input 
                        type="text" 
                        placeholder="Tu Nombre (Opcional)" 
                        className="mb-4 p-2 border-b border-gray-300 bg-transparent focus:outline-none focus:border-royal-blue text-center text-sm"
                        value={guestName}
                        onChange={(e) => {
                            setGuestName(e.target.value);
                            localStorage.setItem('guestName', e.target.value);
                        }}
                    />
                    <br />
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className={`bg-royal-blue text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${uploading ? 'opacity-50' : 'hover:scale-105 active:scale-95 shadow-md'}`}
                    >
                        {uploading ? `Subiendo ${Math.round(progress)}%` : '📸 Subir Nueva Foto'}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleUpload} 
                    />
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {photos.map((photo) => (
                            <motion.div 
                                key={photo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setSelectedPhoto(photo)}
                                className="group relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-zoom-in"
                            >
                                <img 
                                    src={photo.url} 
                                    alt="Wedding moment" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <p className="text-white text-[10px] font-bold uppercase tracking-wider">{photo.guest_name}</p>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(photo.id);
                                        }}
                                        className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-1 text-white border border-white/30 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                
                {photos.length === 0 && !uploading && (
                    <div className="text-center py-20 text-gray-400 italic">
                        Aún no hay fotos. ¡Sé el primero en compartir un momento!
                    </div>
                )}
            </div>

            {/* Photo Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                    >
                        <motion.button
                            className="absolute top-6 right-6 text-white hover:text-gray-300 z-[110]"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl max-h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img 
                                src={selectedPhoto.url} 
                                alt="Shared moment" 
                                className="rounded-lg shadow-2xl max-w-full max-h-[85vh] object-contain border border-white/10"
                            />
                            <div className="absolute bottom-[-40px] left-0 right-0 text-center">
                                <p className="text-white text-sm font-serif italic">Compartido por {selectedPhoto.guest_name}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
