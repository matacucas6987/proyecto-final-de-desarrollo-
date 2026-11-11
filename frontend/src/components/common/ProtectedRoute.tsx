import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from './Button';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Verificando credenciales de acceso...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acceso No Autorizado</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-md">
          Su rol institucional (<span className="font-semibold text-indigo-600">{user.role}</span>)
          no posee los privilegios requeridos para acceder a este módulo del sistema.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Volver al Inicio</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
