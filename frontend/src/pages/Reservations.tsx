import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { reservationsService, usersService, resourcesService } from '../services/api';
import {
  Reservation,
  ReservationStatus,
  User,
  Resource,
  CollectionType,
} from '../types';
import {
  Clock,
  Tablet,
  BookOpen,
  Plus,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Trash2,
  User as UserIcon,
  Filter,
} from 'lucide-react';

export const Reservations: React.FC = () => {
  const { success, error } = useNotification();
  const { user: currentUser, canManageLoans } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'GENERAL' | 'TABLETA'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReservationStatus>('ALL');

  // Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    userId: '',
    resourceId: '',
    category: 'GENERAL',
  });

  const openCreateModal = () => {
    setFormData({
      userId: canManageLoans ? (users[0]?.id || '') : (currentUser?.id || ''),
      resourceId: '',
      category: 'GENERAL',
    });
    setIsModalOpen(true);
  };

  // Carga de datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, usrData, resrcData] = await Promise.all([
        reservationsService.getAll(),
        usersService.getAll(),
        resourcesService.getAll(),
      ]);
      setReservations(resData || []);
      setUsers(usrData || []);
      setResources(resrcData || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar las reservaciones';
      error(message, 'Error de Carga');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejo de Creación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUserId = canManageLoans ? formData.userId : currentUser?.id;
    if (!effectiveUserId) {
      error('Por favor seleccione o ingrese el usuario solicitante.', 'Campo Requerido');
      return;
    }

    setSubmitting(true);
    try {
      await reservationsService.create({
        userId: effectiveUserId,
        resourceId: formData.resourceId || undefined,
        category: formData.category,
      });
      success('La reservación ha sido añadida a la cola con éxito.', 'Reservación Creada');
      setIsModalOpen(false);
      setFormData({
        userId: '',
        resourceId: '',
        category: 'GENERAL',
      });
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la reservación';
      error(message, 'Fallo al Crear');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancelar reservación
  const handleCancel = async (id: string) => {
    if (!window.confirm('¿Está seguro de cancelar esta reservación en cola?')) return;
    try {
      await reservationsService.cancel(id);
      success('La reservación ha sido cancelada.', 'Estado Actualizado');
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cancelar la reservación';
      error(message);
    }
  };

  // Cambiar estado a ASIGNADA
  const handleAssign = async (id: string) => {
    try {
      await reservationsService.updateStatus(id, ReservationStatus.ASIGNADA);
      success('Reservación marcada como asignada al usuario.', 'Recurso Asignado');
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar estado';
      error(message);
    }
  };

  // Eliminar reservación
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Desea eliminar definitivamente este registro de reservación?')) return;
    try {
      await reservationsService.delete(id);
      success('Reservación eliminada de la base de datos.', 'Registro Eliminado');
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar reservación';
      error(message);
    }
  };

  // Filtrado de reservaciones en memoria
  const filteredReservations = reservations.filter((item) => {
    const matchesCategory =
      filterCategory === 'ALL' || item.category.toUpperCase() === filterCategory;
    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  // Recursos sugeridos para el modal según categoría seleccionada
  const selectableResources = resources.filter((r) => {
    if (formData.category === 'TABLETA') {
      return r.collection === CollectionType.TECNOTECA;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cola de Reservas
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestión y orden de espera para material general y dispositivos tecnológicos (tabletas/laptops).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            isLoading={loading}
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Reservación</span>
          </Button>
        </div>
      </div>

      {/* Controles de Filtrado */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Selector de Categoría de Cola */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              filterCategory === 'ALL'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas las colas ({reservations.length})
          </button>
          <button
            onClick={() => setFilterCategory('GENERAL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all whitespace-nowrap ${
              filterCategory === 'GENERAL'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cola General</span>
          </button>
          <button
            onClick={() => setFilterCategory('TABLETA')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all whitespace-nowrap ${
              filterCategory === 'TABLETA'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Cola Tecnoteca</span>
          </button>
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ReservationStatus)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value={ReservationStatus.PENDIENTE}>Pendiente</option>
            <option value={ReservationStatus.ASIGNADA}>Asignada</option>
            <option value={ReservationStatus.CANCELADA}>Cancelada</option>
            <option value={ReservationStatus.EXPIRADA}>Expirada</option>
          </select>
        </div>
      </div>

      {/* Contenedor Principal: Tabla o Lista */}
      <Card>
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Cargando cola de reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-14">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              No hay reservas en esta categoría
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Las solicitudes de espera se organizan automáticamente en orden FIFO según la fecha de registro.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-1" /> Crear primera reservación
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Turno</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Usuario Solicitante</th>
                  <th className="py-3.5 px-4">Recurso</th>
                  <th className="py-3.5 px-4">Fecha Solicitud</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.map((item) => {
                  const statusVariant = {
                    [ReservationStatus.PENDIENTE]: 'warning',
                    [ReservationStatus.ASIGNADA]: 'success',
                    [ReservationStatus.CANCELADA]: 'neutral',
                    [ReservationStatus.EXPIRADA]: 'danger',
                  }[item.status] as 'warning' | 'success' | 'neutral' | 'danger';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs">
                          #{item.queuePosition}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          {item.category === 'TABLETA' ? (
                            <Tablet className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                          )}
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">
                              {item.user?.fullName || 'Usuario no asignado'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {item.user?.code || item.userId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {item.resource ? (
                          <div>
                            <p className="font-medium text-slate-800 text-xs line-clamp-1">
                              {item.resource.title}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Cód: {item.resource.code}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Dispositivo/recurso general
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(item.reservationDate || item.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={statusVariant}>{item.status}</Badge>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === ReservationStatus.PENDIENTE && (
                            <>
                              {canManageLoans && (
                                <button
                                  onClick={() => handleAssign(item.id)}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Marcar como asignado"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {(canManageLoans || item.userId === currentUser?.id) && (
                                <button
                                  onClick={() => handleCancel(item.id)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Cancelar reservación"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                          {canManageLoans && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar registro"
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

      {/* Modal de Creación de Reservación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Reservación"
        subtitle="Agrega un estudiante, profesor o usuario a la lista de espera oficial."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Categoría de la Cola *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'GENERAL', resourceId: '' })}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.category === 'GENERAL'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>General (Libros)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'TABLETA', resourceId: '' })}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.category === 'TABLETA'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Tablet className="w-4 h-4" />
                <span>Tableta / Laptop</span>
              </button>
            </div>
          </div>

          {/* Selección de Usuario */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Usuario Solicitante *
            </label>
            {canManageLoans ? (
              users.length > 0 ? (
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Seleccione un usuario --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.code}] {u.fullName} - {u.role}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="Ingrese UUID o ID del usuario"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {currentUser?.fullName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Código: {currentUser?.code}
                  </span>
                </div>
                <Badge variant="info">{currentUser?.role}</Badge>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Usuario al que se le notificará cuando el recurso quede disponible.
            </p>
          </div>

          {/* Selección de Recurso (Opcional según categoría) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Recurso Específico (Opcional)
            </label>
            <select
              value={formData.resourceId}
              onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Asignación automática / Cualquier unidad --</option>
              {selectableResources.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.collection}] {r.title} ({r.code}) - {r.status}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Si se deja vacío, se reservará el primer ítem que se libere en la categoría.
            </p>
          </div>

          {/* Botones de acción del Modal */}
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
              Guardar Reservación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reservations;
