import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-gold text-dark-black shadow-lg sticky top-0 z-50 font-serif">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold tracking-wider mr-8">
                            BODA ADMIN
                        </span>
                        <div className="hidden md:flex space-x-8">
                            <Link
                                to="/admin/dashboard"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive('/admin/dashboard')
                                        ? 'border-dark-black text-black'
                                        : 'border-transparent text-gray-800 hover:text-black hover:border-gray-300'
                                    }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/admin/asignar"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive('/admin/asignar')
                                        ? 'border-dark-black text-black'
                                        : 'border-transparent text-gray-800 hover:text-black hover:border-gray-300'
                                    }`}
                            >
                                Asignación Manual
                            </Link>
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-800 hover:text-black hover:border-gray-300"
                            >
                                Ver Mapa Público
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={handleLogout}
                            className="bg-white/20 hover:bg-white/40 text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile menu could go here, keeping it simple for now */}
        </nav>
    );
}
