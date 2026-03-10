import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();
    
    // No mostrar en login de admin
    if (location.pathname === '/admin/login') return null;

    const navLinks = [
        { name: 'Mapa de Asientos', path: '/' },
        { name: 'Galería de Fotos', path: '/photos' }
    ];

    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
            <div className="flex gap-8">
                {navLinks.map(link => (
                    <Link 
                        key={link.path}
                        to={link.path}
                        className={`text-xs uppercase tracking-widest font-bold transition-colors ${
                            location.pathname === link.path ? 'text-royal-blue' : 'text-gray-400 hover:text-royal-blue'
                        }`}
                    >
                        {link.name}
                    </Link>
                ))}
            </div>
            
            {isAdmin && (
                <Link 
                    to="/admin/dashboard"
                    className="text-[10px] uppercase tracking-widest bg-royal-blue text-white px-3 py-1 rounded-full font-bold"
                >
                    Dashboard Admin
                </Link>
            )}
        </nav>
    );
}
