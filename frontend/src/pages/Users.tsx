import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/api';
import { User, UserRole } from '../types';
import {
  Users as UsersIcon,
  GraduationCap,
  Briefcase,
  UserCheck,
  ShieldAlert,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Power,
  Mail,
  Layers,
} from 'lucide-react';

export const Users: React.FC = () => {
  const { success, error } = useNotification();
  const { user: currentUser, isAdmin, isLibrarian } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userForm, setUserForm] = useState({
    identification: '',
    code: '',
    fullName: '',
    email: '',
    password: '',
    role: UserRole.ESTUDIANTE,
    academicPlan: '',
    semester: 1,
  });

  const roles = [
    { role: UserRole.ESTUDIANTE, label: 'Estudiantes', icon: <GraduationCap className="w-4 h-4" /> },
    { role: UserRole.PROFESOR, label: 'Profesores', icon: <Briefcase className="w-4 h-4" /> },
    { role: UserRole.BIBLIOTECARIO, label: 'Bibliotecarios', icon: <UserCheck className="w-4 h-4" /> },
    { role: UserRole.ADMIN, label: 'Administradores', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersService.getAll();
      setUsers(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar usuarios';
      error(msg, 'Error de Carga');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Manejo de Creación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawIdentification = String(userForm.identification).trim();
    const rawCode = String(userForm.code).trim();
    const rawFullName = String(userForm.fullName).trim();
    const rawEmail = String(userForm.email).trim().toLowerCase();
    const rawPassword = userForm.password.trim() || undefined;

    if (!rawIdentification || !rawCode || !rawFullName || !rawEmail) {
      error('Por favor complete todos los campos obligatorios.', 'Campos Requeridos');
      return;
    }

    // Asegurar rol en MAYÚSCULAS según enum oficial de NestJS
    const normalizedRole = (String(userForm.role || UserRole.ESTUDIANTE).trim().toUpperCase()) as UserRole;

    // Validación de permisos por rol: Un bibliotecario no puede registrar administradores ni bibliotecarios
    if (isLibrarian && (normalizedRole === UserRole.ADMIN || normalizedRole === UserRole.BIBLIOTECARIO)) {
      error('Los bibliotecarios solo tienen permiso para registrar Estudiantes y Profesores.', 'Permiso Denegado');
      return;
    }

    // Asegurar semestre como número entero si es estudiante
    const parsedSemester =
      normalizedRole === UserRole.ESTUDIANTE
        ? Math.max(1, parseInt(String(userForm.semester), 10) || 1)
        : undefined;

    setSubmitting(true);
    try {
      await usersService.create({
        identification: rawIdentification,
        code: rawCode,
        fullName: rawFullName,
        email: rawEmail,
        password: rawPassword,
        role: normalizedRole,
        academicPlan: userForm.academicPlan.trim() || undefined,
        semester: parsedSemester,
        createdById: currentUser?.id,
      });

      success('El usuario institucional ha sido registrado con éxito.', 'Usuario Creado');
      setIsModalOpen(false);
      setUserForm({
        identification: '',
        code: '',
        fullName: '',
        email: '',
        password: '',
        role: UserRole.ESTUDIANTE,
        academicPlan: '',
        semester: 1,
      });
      fetchUsers();
    } catch (err: any) {
      let errorMessage = 'No se pudo crear el usuario';
      if (err?.response?.data) {
        const data = err.response.data;
        if (Array.isArray(data.message)) {
          errorMessage = data.message.join('. ');
        } else if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      error(errorMessage, 'Error al Registrar');
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleActive = async (user: User) => {
    try {
      await usersService.update(user.id, { isActive: !user.isActive });
      success(
        `Usuario ${!user.isActive ? 'activado' : 'inactivado'} correctamente.`,
        'Estado Actualizado',
      );
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al modificar estado';
      error(Array.isArray(msg) ? msg.join('. ') : msg);
    }
  };

  // Eliminar usuario
  const handleDelete = async (id: string, name: string) => {
    if (!isAdmin) {
      error('Solo el Administrador del sistema tiene permisos para eliminar usuarios.', 'Permiso Insuficiente');
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar al usuario institucional "${name}"?`)) return;
    try {
      await usersService.delete(id);
      success('Usuario eliminado del sistema bibliotecario.', 'Usuario Eliminado');
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al eliminar usuario';
      error(Array.isArray(msg) ? msg.join('. ') : msg);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      u.fullName.toLowerCase().includes(query) ||
      u.code.toLowerCase().includes(query) ||
      u.identification.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query);
    return matchesRole && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Directorio institucional con registro y auditoría de creadores ({isAdmin ? 'Modo Administrador Total' : 'Modo Bibliotecario: Estudiantes y Profesores'}).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            isLoading={loading}
            title="Recargar usuarios"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </Button>
        </div>
      </div>

      {/* Selector de Roles Institucionales */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={() => setSelectedRole('ALL')}
          className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${
            selectedRole === 'ALL'
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-1.5 w-fit rounded-lg ${
              selectedRole === 'ALL' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Todos</span>
            <span className="text-[10px] opacity-80">{users.length} registrados</span>
          </div>
        </button>

        {roles.map((r) => {
          const count = users.filter((u) => u.role === r.role).length;
          const isSelected = selectedRole === r.role;

          return (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-500 text-indigo-700 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-1.5 w-fit rounded-lg ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {r.icon}
              </div>
              <div>
                <span className="text-xs font-bold block">{r.label}</span>
                <span className="text-[10px] text-slate-400 font-medium">{count} miembros</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Buscador */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuario por nombre, código institucional, cédula o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <Card>
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Cargando directorio de usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-14">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
              <UsersIcon className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              No se encontraron usuarios
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No hay coincidencias para el rol seleccionado o el término de búsqueda.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-1" /> Registrar primer usuario
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Código / Doc.</th>
                  <th className="py-3.5 px-4">Nombre y Correo</th>
                  <th className="py-3.5 px-4">Rol</th>
                  <th className="py-3.5 px-4">Plan / Semestre</th>
                  <th className="py-3.5 px-4">Registrado Por</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => {
                  const roleVariant = {
                    [UserRole.ESTUDIANTE]: 'info',
                    [UserRole.PROFESOR]: 'success',
                    [UserRole.BIBLIOTECARIO]: 'warning',
                    [UserRole.ADMIN]: 'danger',
                  }[item.role] as 'info' | 'success' | 'warning' | 'danger';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {item.code}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            ID: {item.identification}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 text-sm">{item.fullName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {item.email}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={roleVariant}>{item.role}</Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {item.academicPlan ? (
                          <span>
                            {item.academicPlan}
                            {item.semester ? ` • Semestre ${item.semester}` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No especificado</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {item.createdBy ? (
                          <div>
                            <span className="font-medium text-slate-800 block">
                              {item.createdBy.fullName}
                            </span>
                            <span className="text-[10px] text-indigo-600 font-medium">
                              {item.createdBy.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Sistema / Inicial
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={item.isActive ? 'success' : 'neutral'}>
                          {item.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={item.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(item.id, item.fullName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar usuario (Solo Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Registrar Usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Usuario Institucional"
        subtitle={
          isLibrarian
            ? 'Como Bibliotecario, puede registrar Estudiantes y Profesores.'
            : 'Como Administrador, puede registrar todos los roles del sistema.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Documento / Cédula *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 1020304050"
                value={userForm.identification}
                onChange={(e) => setUserForm({ ...userForm, identification: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Código Universitario *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 413, EST01, etc."
                value={userForm.code}
                onChange={(e) => setUserForm({ ...userForm, code: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Ana Beatriz Gómez"
                value={userForm.fullName}
                onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico Institucional *
              </label>
              <input
                type="email"
                required
                placeholder="Ej. agomez@uma.pt"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value.toLowerCase() })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Rol Institucional *
              </label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={UserRole.ESTUDIANTE}>Estudiante</option>
                <option value={UserRole.PROFESOR}>Profesor / Docente</option>
                {isAdmin && (
                  <>
                    <option value={UserRole.BIBLIOTECARIO}>Bibliotecario</option>
                    <option value={UserRole.ADMIN}>Administrador General</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contraseña Inicial
              </label>
              <input
                type="text"
                placeholder="Por defecto: Madeira2026*"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Opcional. Si se deja vacía, será <code className="text-indigo-600">Madeira2026*</code>
              </span>
            </div>

            {userForm.role === UserRole.ESTUDIANTE && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Semestre Actual
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={userForm.semester}
                  onChange={(e) => setUserForm({ ...userForm, semester: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className={userForm.role === UserRole.ESTUDIANTE ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Plan de Estudios / Departamento
              </label>
              <input
                type="text"
                placeholder="Ej. Ingeniería Informática, Dpto. Matemáticas"
                value={userForm.academicPlan}
                onChange={(e) => setUserForm({ ...userForm, academicPlan: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Guardar Usuario
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
