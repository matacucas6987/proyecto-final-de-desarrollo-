import React, { useState } from 'react';
import { BookOpen, LogOut, User as UserIcon, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import ProfileModal from '../common/ProfileModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return {
          label: 'Administrador',
          classes: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case UserRole.BIBLIOTECARIO:
        return {
          label: 'Bibliotecario',
          classes: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case UserRole.PROFESOR:
        return {
          label: 'Profesor',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case UserRole.ESTUDIANTE:
        return {
          label: 'Estudiante',
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      default:
        return {
          label: 'Usuario',
          classes: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  const getInitials = (name?: string) => {
    if (!name) return 'UM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
            Universidad de Madeira
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Sistema Integrado de Gestión Bibliotecaria (SIGB)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Neon DB: Conectada</span>
        </div>

        {/* User profile avatar and details */}
        {user ? (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors text-left"
              title="Ver mi perfil de usuario"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs shadow-sm ring-2 ring-indigo-50">
                {getInitials(user.fullName)}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="font-semibold text-slate-800 block leading-tight hover:text-indigo-600 transition-colors">
                  {user.fullName}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${roleInfo.classes}`}
                  >
                    {roleInfo.label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {user.code}
                  </span>
                </div>
              </div>
            </button>

            {/* Profile modal button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title="Abrir Mi Perfil y Seguridad"
              className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Mi Perfil</span>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="ml-1 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <UserIcon className="w-5 h-5 text-slate-400" />
            <span className="text-xs text-slate-500">Invitado</span>
          </div>
        )}
      </div>

      {/* Mini ventana / Modal de perfil */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};

export default Navbar;
