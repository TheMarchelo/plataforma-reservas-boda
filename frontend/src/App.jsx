import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManualSeatAssignment from './pages/ManualSeatAssignment';

import GuestReservation from './pages/GuestReservation';
import PhotoGallery from './pages/PhotoGallery';
import AdminPhotos from './pages/AdminPhotos';
import Navbar from './components/Navbar';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Rutas Publicas (Invitados) */}
        <Route path="/" element={<GuestReservation />} />
        <Route path="/photos" element={<PhotoGallery />} />

        {/* Rutas Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/asignar"
          element={
            <PrivateRoute>
              <ManualSeatAssignment />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/fotos"
          element={
            <PrivateRoute>
              <AdminPhotos />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
