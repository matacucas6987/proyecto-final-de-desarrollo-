import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  BookMarked,
  Clock,
  AlertTriangle,
  Users,
  Shield,
  GraduationCap,
  Briefcase,
  BookKey,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: 'Catálogo y Colecciones',
    path: '/resources',
    icon: <Library className="w-5 h-5" />,
  },
  {
    name: 'Préstamos y Renovaciones',
    path: '/loans',
    icon: <BookMarked className="w-5 h-5" />,
  },
  {
    name: 'Cola de Reservas',
    path: '/reservations',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    name: 'Multas y Moras',
    path: '/fines',
    icon: <AlertTriangle className="w-5 h-5" />,
    allowedRoles: [UserRole.BIBLIOTECARIO, UserRole.ADMIN],
  },
  {
    name: 'Gestión de Usuarios',
    path: '/users',
    icon: <Users className="w-5 h-5" />,
    allowedRoles: [UserRole.BIBLIOTECARIO, UserRole.ADMIN],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.role;

  const filteredNavItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!currentRole) return false;
    return item.allowedRoles.includes(currentRole);
  });

  const getRoleBadgeIcon = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="w-4 h-4 text-rose-400" />;
      case UserRole.BIBLIOTECARIO:
        return <BookKey className="w-4 h-4 text-indigo-400" />;
      case UserRole.PROFESOR:
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case UserRole.ESTUDIANTE:
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-800">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Módulos del Sistema
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Role badge card */}
      <div className="p-4 m-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
          {getRoleBadgeIcon(currentRole)}
          <span>Rol: {currentRole || 'Invitado'}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {currentRole === UserRole.ADMIN && 'Control total y auditoría de registros.'}
          {currentRole === UserRole.BIBLIOTECARIO && 'Gestión de préstamos, multas y recursos.'}
          {currentRole === UserRole.PROFESOR && 'Búsqueda, préstamos y seguimiento estudiantil.'}
          {currentRole === UserRole.ESTUDIANTE && 'Búsqueda de catálogo, préstamos y reservas.'}
        </p>
        <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-500">
          <span>Universidad de Madeira</span>
          <span>v1.0 RBAC</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
