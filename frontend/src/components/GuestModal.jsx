import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuestModal({ isOpen, onClose, onSave, guest }) {
    const [formData, setFormData] = useState({
        nombre_completo: '',
        familia: 'esposo',
        cantidad_invitados: 0,
        confirmado: false
    });

    useEffect(() => {
        if (guest) {
            setFormData(guest);
        } else {
            setFormData({
                nombre_completo: '',
                familia: 'esposo',
                cantidad_invitados: 0,
                confirmado: false
            });
        }
    }, [guest, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-2xl font-serif text-royal-blue mb-4">
                    {guest ? 'Editar Invitado' : 'Nuevo Invitado'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded p-2 focus:border-royal-blue outline-none"
                                value={formData.nombre_completo}
                                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">Familia</label>
                            <select
                                className="w-full border rounded p-2 focus:border-royal-blue outline-none"
                                value={formData.familia}
                                onChange={(e) => setFormData({ ...formData, familia: e.target.value })}
                            >
                                <option value="esposo">Familia del Esposo (Anthony)</option>
                                <option value="esposa">Familia de la Esposa (Daniela)</option>
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-gray-700 font-semibold mb-1">Máx. Acompañantes</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    className="w-full border rounded p-2 focus:border-royal-blue outline-none"
                                    value={formData.cantidad_invitados}
                                    onChange={(e) => setFormData({ ...formData, cantidad_invitados: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-royal-blue text-white rounded hover:bg-blue-800 transition-colors"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
