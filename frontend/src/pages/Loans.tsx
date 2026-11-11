import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { loansService, renewalsService, usersService, resourcesService } from '../services/api';
import {
  Loan,
  LoanStatus,
  Renewal,
  User,
  UserRole,
  Resource,
  ResourceStatus,
} from '../types';
import {
  BookMarked,
  RefreshCw,
  Plus,
  CheckCircle,
  RotateCcw,
  Search,
  Filter,
  GraduationCap,
  Layers,
} from 'lucide-react';

export const Loans: React.FC = () => {
  const { success, error } = useNotification();
  const { user: currentUser, isProfessor, isStudent, canManageLoans } = useAuth();

  // Tab activo: 'all_loans' | 'my_loans' | 'student_loans' | 'renewals'
  const defaultTab = isStudent || isProfessor ? 'my_loans' : 'all_loans';
  const [activeTab, setActiveTab] = useState<'all_loans' | 'my_loans' | 'student_loans' | 'renewals'>(defaultTab);

  const [loans, setLoans] = useState<Loan[]>([]);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<'ALL' | LoanStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Nuevo Préstamo
  const [isLoanModalOpen, setIsLoanModalOpen] = useState<boolean>(false);
  const [submittingLoan, setSubmittingLoan] = useState<boolean>(false);
  const [loanForm, setLoanForm] = useState({
    userId: '',
    resourceId: '',
    dueDate: '',
    notes: '',
  });

  // Modal Renovar Plazo
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState<boolean>(false);
  const [submittingRenewal, setSubmittingRenewal] = useState<boolean>(false);
  const [selectedLoanForRenewal, setSelectedLoanForRenewal] = useState<Loan | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');

  // Carga de datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [loansData, renewalsData, usersData, resourcesData] = await Promise.all([
        loansService.getAll(),
        renewalsService.getAll(),
        usersService.getAll(),
        resourcesService.getAll(),
      ]);
      setLoans(loansData || []);
      setRenewals(renewalsData || []);
      setUsers(usersData || []);
      setResources(resourcesData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los préstamos';
      error(msg, 'Error de Carga');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Inicializar fecha de vencimiento por defecto (+7 días)
  const calculateDefaultDueDate = (days = 7): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const openNewLoanModal = () => {
    const defaultUserId = canManageLoans
      ? users[0]?.id || ''
      : currentUser?.id || '';

    setLoanForm({
      userId: defaultUserId,
      resourceId: resources.find((r) => r.status === ResourceStatus.DISPONIBLE)?.id || '',
      dueDate: calculateDefaultDueDate(isProfessor ? 14 : 7),
      notes: '',
    });
    setIsLoanModalOpen(true);
  };

  // Enviar Nuevo Préstamo
  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUserId = canManageLoans ? loanForm.userId : currentUser?.id;

    if (!effectiveUserId || !loanForm.resourceId || !loanForm.dueDate) {
      error('Por favor complete todos los campos obligatorios.', 'Campos Requeridos');
      return;
    }

    setSubmittingLoan(true);
    try {
      await loansService.create({
        userId: effectiveUserId,
        resourceId: loanForm.resourceId,
        dueDate: new Date(loanForm.dueDate).toISOString(),
        notes: loanForm.notes.trim() || undefined,
      });

      success('Préstamo registrado correctamente. El recurso ha sido asignado.', 'Préstamo Activo');
      setIsLoanModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo registrar el préstamo';
      error(msg, 'Error al Prestar');
    } finally {
      setSubmittingLoan(false);
    }
  };

  // Registrar Devolución (solo personal de biblioteca / admin)
  const handleReturn = async (loanId: string, resourceTitle?: string) => {
    if (!canManageLoans) {
      error('Solo el personal bibliotecario puede registrar devoluciones de material.');
      return;
    }

    if (!window.confirm(`¿Confirmar la recepción y devolución del recurso "${resourceTitle || 'seleccionado'}"?`)) {
      return;
    }
    try {
      await loansService.returnResource(loanId);
      success('Devolución procesada. El recurso ahora está Disponible para nuevos préstamos.', 'Recurso Devuelto');
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar devolución';
      error(msg);
    }
  };

  // Abrir Modal de Renovación
  const openRenewalModal = (loan: Loan) => {
    setSelectedLoanForRenewal(loan);
    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + (isProfessor ? 14 : 7));
    setNewDueDate(currentDue.toISOString().split('T')[0]);
    setIsRenewalModalOpen(true);
  };

  // Enviar Renovación
  const handleCreateRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForRenewal || !newDueDate) return;

    setSubmittingRenewal(true);
    try {
      await renewalsService.create({
        loanId: selectedLoanForRenewal.id,
        newDueDate: new Date(newDueDate).toISOString(),
      });

      success('El plazo del préstamo ha sido renovado con éxito.', 'Renovación Aprobada');
      setIsRenewalModalOpen(false);
      setSelectedLoanForRenewal(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al renovar préstamo';
      error(msg);
    } finally {
      setSubmittingRenewal(false);
    }
  };

  // Filtrado según Tab y Criterios
  const getContextualLoans = () => {
    if (activeTab === 'my_loans') {
      return loans.filter((l) => l.userId === currentUser?.id);
    }
    if (activeTab === 'student_loans') {
      // Requerimiento docente: "mirar que libros han sacado los estudiantes"
      return loans.filter((l) => l.user?.role === UserRole.ESTUDIANTE);
    }
    return loans;
  };

  const contextualLoans = getContextualLoans();

  const filteredLoans = contextualLoans.filter((l) => {
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (l.user?.fullName && l.user.fullName.toLowerCase().includes(query)) ||
      (l.user?.code && l.user.code.toLowerCase().includes(query)) ||
      (l.resource?.title && l.resource.title.toLowerCase().includes(query)) ||
      (l.resource?.code && l.resource.code.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  const getFilteredRenewals = () => {
    if (isStudent) {
      return renewals.filter((r) => r.loan?.userId === currentUser?.id);
    }
    return renewals;
  };

  const displayedRenewals = getFilteredRenewals();

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Préstamos y Renovaciones
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isStudent && 'Consulta el estado de tus libros en préstamo y solicita renovaciones de fecha.'}
            {isProfessor && 'Gestiona tus préstamos personales e inspecciona los libros en préstamo de los estudiantes.'}
            {canManageLoans && 'Circulación y préstamo de material a estudiantes, profesores y personal.'}
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
          <Button variant="primary" onClick={openNewLoanModal} className="shadow-sm">
            <Plus className="w-4 h-4" />
            <span>{isStudent || isProfessor ? 'Solicitar Préstamo' : 'Nuevo Préstamo'}</span>
          </Button>
        </div>
      </div>

      {/* Pestañas (Tabs) según Rol */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        {canManageLoans && (
          <button
            onClick={() => setActiveTab('all_loans')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'all_loans'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Todos los Préstamos ({loans.length})</span>
          </button>
        )}

        {(isStudent || isProfessor) && (
          <button
            onClick={() => setActiveTab('my_loans')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'my_loans'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Mis Préstamos ({loans.filter((l) => l.userId === currentUser?.id).length})</span>
          </button>
        )}

        {isProfessor && (
          <button
            onClick={() => setActiveTab('student_loans')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'student_loans'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Préstamos de Estudiantes ({loans.filter((l) => l.user?.role === UserRole.ESTUDIANTE).length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('renewals')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'renewals'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Renovaciones ({displayedRenewals.length})</span>
        </button>
      </div>

      {/* Vista de Préstamos */}
      {activeTab !== 'renewals' && (
        <div className="space-y-4">
          {/* Banner informativo para profesores */}
          {activeTab === 'student_loans' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Modo Docente:</strong> Visualizando los libros y recursos solicitados por estudiantes para acompañamiento académico.
              </span>
            </div>
          )}

          {/* Barra de Filtros */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, código institucional o título de recurso..."
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
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | LoanStatus)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="ALL">Todos los estados</option>
                <option value={LoanStatus.ACTIVO}>Activos</option>
                <option value={LoanStatus.DEVUELTO}>Devueltos</option>
                <option value={LoanStatus.VENCIDO}>Vencidos</option>
              </select>
            </div>
          </div>

          <Card>
            {loading ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Cargando registros de préstamos...</p>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="text-center py-14">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                  <BookMarked className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-slate-800">No hay préstamos para mostrar</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {activeTab === 'student_loans'
                    ? 'No hay préstamos registrados de estudiantes en este momento.'
                    : 'Registra un nuevo préstamo para llevar el seguimiento de fechas y circulación.'}
                </p>
                {activeTab !== 'student_loans' && (
                  <Button variant="outline" size="sm" onClick={openNewLoanModal} className="mt-4">
                    <Plus className="w-4 h-4 mr-1" /> Solicitar préstamo
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 -my-6">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Recurso / Colección</th>
                      <th className="py-3.5 px-4">Usuario</th>
                      <th className="py-3.5 px-4">Fecha Préstamo</th>
                      <th className="py-3.5 px-4">Fecha Límite</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLoans.map((item) => {
                      const isOverdue =
                        item.status === LoanStatus.ACTIVO &&
                        new Date(item.dueDate) < new Date();

                      const statusVariant = {
                        [LoanStatus.ACTIVO]: 'info',
                        [LoanStatus.DEVUELTO]: 'success',
                        [LoanStatus.VENCIDO]: 'danger',
                      }[item.status] as 'info' | 'success' | 'danger';

                      const canRenewThis =
                        canManageLoans || item.userId === currentUser?.id;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-semibold text-slate-800 block text-sm">
                              {item.resource?.title || 'Recurso no disponible'}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                {item.resource?.code}
                              </span>
                              <span>•</span>
                              <span>{item.resource?.collection}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-slate-800 block text-sm">
                              {item.user?.fullName || 'Usuario no asignado'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {item.user?.code} ({item.user?.role})
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                            {new Date(item.loanDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-4 px-4 text-xs whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                isOverdue ? 'text-rose-600' : 'text-slate-700'
                              }`}
                            >
                              {new Date(item.dueDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {isOverdue && (
                              <span className="block text-[10px] text-rose-500 font-medium">
                                ¡Plazo Vencido!
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={isOverdue ? 'danger' : statusVariant}>
                              {isOverdue ? 'Vencido' : item.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {item.status === LoanStatus.ACTIVO && (
                                <>
                                  {canRenewThis && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openRenewalModal(item)}
                                      title="Extender fecha de vencimiento"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>Renovar</span>
                                    </Button>
                                  )}
                                  {canManageLoans && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleReturn(item.id, item.resource?.title)}
                                      title="Marcar como devuelto a biblioteca"
                                      className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>Devolver</span>
                                    </Button>
                                  )}
                                </>
                              )}
                              {item.status === LoanStatus.DEVUELTO && (
                                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 justify-end">
                                  <CheckCircle className="w-3.5 h-3.5" /> Devuelto el{' '}
                                  {item.returnDate
                                    ? new Date(item.returnDate).toLocaleDateString('es-ES')
                                    : 'Recientemente'}
                                </span>
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
        </div>
      )}

      {/* Vista de Historial de Renovaciones */}
      {activeTab === 'renewals' && (
        <Card>
          {loading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Cargando historial de renovaciones...</p>
            </div>
          ) : displayedRenewals.length === 0 ? (
            <div className="text-center py-14">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">
                No hay renovaciones registradas
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Cuando se amplíe el plazo de un préstamo activo, se registrará aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 -my-6">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6"># Renovación</th>
                    <th className="py-3.5 px-4">Recurso</th>
                    <th className="py-3.5 px-4">Usuario</th>
                    <th className="py-3.5 px-4">Fecha Renovación</th>
                    <th className="py-3.5 px-4">Vencimiento Anterior</th>
                    <th className="py-3.5 px-6">Nuevo Vencimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedRenewals.map((ren) => (
                    <tr key={ren.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-800 text-xs">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">
                          Renovación #{ren.renewalNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 text-sm block">
                          {ren.loan?.resource?.title || 'Recurso'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {ren.loan?.resource?.code}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <span className="font-medium text-slate-800 block">
                          {ren.loan?.user?.fullName || 'Usuario'}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {ren.loan?.user?.code}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {new Date(ren.renewalDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400 line-through whitespace-nowrap">
                        {new Date(ren.previousDueDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold text-emerald-600 whitespace-nowrap">
                        {new Date(ren.newDueDate).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Modal Registrar Préstamo */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        title={isStudent || isProfessor ? 'Solicitar Préstamo de Recurso' : 'Registrar Nuevo Préstamo'}
        subtitle={
          isStudent || isProfessor
            ? 'Selecciona un recurso disponible del catálogo para solicitar en préstamo.'
            : 'Asigna un recurso del catálogo universitario a un usuario activo.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleCreateLoan} className="space-y-4">
          {/* Selección de Usuario */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Usuario Solicitante *
            </label>
            {canManageLoans ? (
              <select
                required
                value={loanForm.userId}
                onChange={(e) => setLoanForm({ ...loanForm, userId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Seleccionar usuario --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    [{u.code}] {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
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
          </div>

          {/* Selección de Recurso */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Recurso a Prestar *
            </label>
            <select
              required
              value={loanForm.resourceId}
              onChange={(e) => setLoanForm({ ...loanForm, resourceId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Seleccionar recurso disponible --</option>
              {resources.map((r) => (
                <option
                  key={r.id}
                  value={r.id}
                  disabled={r.status !== ResourceStatus.DISPONIBLE}
                >
                  [{r.collection}] {r.title} ({r.code}) — {r.status}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Solo recursos con estado &quot;Disponible&quot; pueden ser seleccionados.
            </p>
          </div>

          {/* Fecha Límite */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Fecha Límite de Devolución *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={loanForm.dueDate}
              onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {/* Accesos rápidos de días */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setLoanForm({ ...loanForm, dueDate: calculateDefaultDueDate(3) })}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs transition-colors"
              >
                +3 días (Reserva)
              </button>
              <button
                type="button"
                onClick={() => setLoanForm({ ...loanForm, dueDate: calculateDefaultDueDate(7) })}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs transition-colors"
              >
                +7 días (Estándar)
              </button>
              <button
                type="button"
                onClick={() => setLoanForm({ ...loanForm, dueDate: calculateDefaultDueDate(14) })}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs transition-colors"
              >
                +14 días (Docentes)
              </button>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Observaciones / Notas
            </label>
            <textarea
              rows={2}
              placeholder="Condiciones de entrega, motivo del préstamo..."
              value={loanForm.notes}
              onChange={(e) => setLoanForm({ ...loanForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsLoanModalOpen(false)}
              disabled={submittingLoan}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingLoan}>
              Confirmar Préstamo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Renovar Plazo */}
      <Modal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        title="Renovar Plazo de Préstamo"
        subtitle={`Ampliación de fecha límite para: ${selectedLoanForRenewal?.resource?.title || 'Recurso'}`}
        maxWidth="sm"
      >
        <form onSubmit={handleCreateRenewal} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <p>
              <strong>Usuario:</strong> {selectedLoanForRenewal?.user?.fullName} ({selectedLoanForRenewal?.user?.code})
            </p>
            <p>
              <strong>Vencimiento Actual:</strong>{' '}
              {selectedLoanForRenewal?.dueDate
                ? new Date(selectedLoanForRenewal.dueDate).toLocaleDateString('es-ES')
                : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nueva Fecha Límite de Entrega *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRenewalModalOpen(false)}
              disabled={submittingRenewal}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingRenewal}>
              Confirmar Renovación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Loans;
