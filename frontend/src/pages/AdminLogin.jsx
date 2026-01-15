import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Guardar token para persistencia simple (o usar onAuthStateChanged)
            const token = await user.getIdToken();
            localStorage.setItem('adminToken', token);

            console.log("Login exitoso:", user.email);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error("Firebase Login Error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales inválidas. Verifica tu correo y contraseña.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos fallidos. Intenta más tarde.');
            } else {
                setError('Error al iniciar sesión: ' + err.message);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-royal-blue">
                <h1 className="text-3xl font-serif text-center mb-6 text-royal-blue">Admin Panel</h1>
                {error && <p className="text-red-500 text-center mb-4 text-sm font-semibold">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full border p-2 rounded focus:outline-none focus:border-royal-blue"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full border p-2 rounded focus:outline-none focus:border-royal-blue"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-sm text-gray-500 hover:text-royal-blue"
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-royal-blue text-white py-2 rounded hover:bg-blue-800 transition-colors font-semibold shadow-md"
                    >
                        Ingresar con Firebase
                    </button>
                </form>
            </div>
        </div>
    );
}
