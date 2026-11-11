import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import Loans from './pages/Loans';
import Reservations from './pages/Reservations';
import Fines from './pages/Fines';
import Users from './pages/Users';
import Login from './pages/Login';
import { UserRole } from './types';

export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta pública de Autenticación */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas dentro del Layout Principal */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard: Disponible para todos los roles */}
              <Route index element={<Dashboard />} />

              {/* Catálogo y Colecciones: Disponible para todos los roles */}
              <Route path="resources" element={<Resources />} />

              {/* Préstamos y Renovaciones: Disponible para todos los roles (con vistas diferenciadas) */}
              <Route path="loans" element={<Loans />} />

              {/* Cola de Reservas: Disponible para todos los roles */}
              <Route path="reservations" element={<Reservations />} />

              {/* Multas y Moras: Solo Bibliotecarios y Administradores */}
              <Route
                path="fines"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.BIBLIOTECARIO, UserRole.ADMIN]}>
                    <Fines />
                  </ProtectedRoute>
                }
              />

              {/* Gestión de Usuarios: Solo Bibliotecarios y Administradores */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.BIBLIOTECARIO, UserRole.ADMIN]}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
