import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { finesService, usersService } from '../services/api';
import { Fine, FineStatus, User } from '../types';
import {
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  ShieldAlert,
  Plus,
  RefreshCw,
  Search,
  Filter,
  User as UserIcon,
  CreditCard,
  Ban,
} from 'lucide-react';

export const Fines: React.FC = () => {
  const { success, error } = useNotification();

  const [fines, setFines] = useState<Fine[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | FineStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal y Formulario
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fineForm, setFineForm] = useState({
    userId: '',
    amount: 5.0,
    daysOverdue: 1,
    reason: 'Retraso en devolución de material',
  });

  const fetchFines = useCallback(async () => {
    setLoading(true);
    try {
      const [finesData, usersData] = await Promise.all([
        finesService.getAll(),
        usersService.getAll(),
      ]);
      setFines(finesData || []);
      setUsers(usersData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las multas';
      error(msg, 'Error de Carga');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Registrar pago de multa
  const handlePay = async (id: string, amount: number) => {
    if (!window.confirm(`¿Confirmar el pago y recepción de $${amount.toFixed(2)} por esta sanción?`)) {
      return;
    }
    try {
      await finesService.payFine(id);
      success(`Multa por $${amount.toFixed(2)} pagada y liquidada.`, 'Pago Registrado');
      fetchFines();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar pago';
      error(msg);
    }
  };

  // Condonar multa
  const handleWaive = async (id: string, amount: number) => {
    if (!window.confirm(`¿Está seguro de condonar/exonerar la multa de $${amount.toFixed(2)}?`)) {
      return;
    }
    try {
      await finesService.waiveFine(id);
      success('La sanción ha sido condonada institucionalmente.', 'Multa Exonerada');
      fetchFines();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al condonar multa';
      error(msg);
    }
  };

  // Crear multa manual
  const handleCreateFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fineForm.userId) {
      error('Seleccione un usuario para asociar la sanción.', 'Campo Requerido');
      return;
    }

    setSubmitting(true);
    try {
      await finesService.create({
        userId: fineForm.userId,
        amount: Number(fineForm.amount),
        daysOverdue: Number(fineForm.daysOverdue),
        reason: fineForm.reason.trim(),
        status: FineStatus.PENDIENTE,
      });

      success('Sanción registrada correctamente en el expediente del usuario.', 'Multa Creada');
      setIsModalOpen(false);
      setFineForm({
        userId: '',
        amount: 5.0,
        daysOverdue: 1,
        reason: 'Retraso en devolución de material',
      });
      fetchFines();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar multa';
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculos de métricas financieras
  const totalPending = fines
    .filter((f) => f.status === FineStatus.PENDIENTE)
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);

  const totalPaid = fines
    .filter((f) => f.status === FineStatus.PAGADA)
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);

  const totalWaived = fines
    .filter((f) => f.status === FineStatus.CONDONADA)
    .reduce((acc, f) => acc + Number(f.amount || 0), 0);

  // Filtrado de multas
  const filteredFines = fines.filter((f) => {
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (f.user?.fullName && f.user.fullName.toLowerCase().includes(query)) ||
      (f.user?.code && f.user.code.toLowerCase().includes(query)) ||
      (f.reason && f.reason.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Control de Multas y Moras
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de sanciones pecuniarias por retraso o deterioro de material bibliográfico.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFines}
            isLoading={loading}
            title="Recargar multas"
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
            <span>Registrar Multa</span>
          </Button>
        </div>
      </div>

      {/* Resumen Financiero de Estados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Multas Pendientes
            </span>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              ${totalPending.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {fines.filter((f) => f.status === FineStatus.PENDIENTE).length} sanciones por cobrar
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Total Cobrado
            </span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              ${totalPaid.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {fines.filter((f) => f.status === FineStatus.PAGADA).length} pagos liquidados
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Total Condonado
            </span>
            <h3 className="text-2xl font-bold text-slate-700 mt-1">
              ${totalWaived.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {fines.filter((f) => f.status === FineStatus.CONDONADA).length} sanciones exoneradas
            </p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario sancionado, código o motivo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | FineStatus)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          >
            <option value="ALL">Todos ({fines.length})</option>
            <option value={FineStatus.PENDIENTE}>Pendientes</option>
            <option value={FineStatus.PAGADA}>Pagadas</option>
            <option value={FineStatus.CONDONADA}>Condonadas</option>
          </select>
        </div>
      </div>

      {/* Tabla de Multas */}
      <Card>
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Cargando sanciones pecuniarias...</p>
          </div>
        ) : filteredFines.length === 0 ? (
          <div className="text-center py-14">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              No hay multas que coincidan con el filtro
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Todos los usuarios se encuentran al día con sus préstamos y sin sanciones activas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 -my-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Usuario Sancionado</th>
                  <th className="py-3.5 px-4">Monto</th>
                  <th className="py-3.5 px-4">Días Mora</th>
                  <th className="py-3.5 px-4">Motivo</th>
                  <th className="py-3.5 px-4">Fecha Emisión</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFines.map((item) => {
                  const statusVariant = {
                    [FineStatus.PENDIENTE]: 'warning',
                    [FineStatus.PAGADA]: 'success',
                    [FineStatus.CONDONADA]: 'neutral',
                  }[item.status] as 'warning' | 'success' | 'neutral';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">
                              {item.user?.fullName || 'Usuario N/A'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {item.user?.code} ({item.user?.role})
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        ${Number(item.amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-600">
                        {item.daysOverdue} {item.daysOverdue === 1 ? 'día' : 'días'}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {item.reason || 'Retraso de entrega'}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={statusVariant}>{item.status}</Badge>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {item.status === FineStatus.PENDIENTE ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handlePay(item.id, Number(item.amount))}
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                              title="Registrar pago de la sanción"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Cobrar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWaive(item.id, Number(item.amount))}
                              className="text-xs text-slate-600"
                              title="Exonerar / condonar multa"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Condonar</span>
                            </Button>
                          </div>
                        ) : item.status === FineStatus.PAGADA ? (
                          <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Liquidada
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">
                            Exonerada
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Registrar Multa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Sanción Pecuniaria"
        subtitle="Ingresa una multa por mora, deterioro o extravío a un usuario."
        maxWidth="md"
      >
        <form onSubmit={handleCreateFine} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Usuario a Sancionar *
            </label>
            <select
              required
              value={fineForm.userId}
              onChange={(e) => setFineForm({ ...fineForm, userId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Seleccionar usuario --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  [{u.code}] {u.fullName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Monto ($) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={fineForm.amount}
                onChange={(e) => setFineForm({ ...fineForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Días de Retraso
              </label>
              <input
                type="number"
                min="0"
                value={fineForm.daysOverdue}
                onChange={(e) => setFineForm({ ...fineForm, daysOverdue: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Motivo o Justificación *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Devolución tardía de laptop, hojas rasgadas..."
              value={fineForm.reason}
              onChange={(e) => setFineForm({ ...fineForm, reason: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              Registrar Sanción
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Fines;
