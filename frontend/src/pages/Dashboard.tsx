import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  Layers,
  Laptop,
  Users,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Library,
} from 'lucide-react';
import {
  resourcesService,
  loansService,
  reservationsService,
  finesService,
  usersService,
} from '../services/api';
import { LoanStatus, ReservationStatus, FineStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, canManageUsers } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loading, setLoading] = useState<boolean>(true);

  const [metrics, setMetrics] = useState({
    totalResources: 0,
    activeLoans: 0,
    pendingReservations: 0,
    pendingFinesAmount: 0,
    pendingFinesCount: 0,
    totalUsers: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [resourcesData, loansData, reservationsData, finesData, usersData] =
        await Promise.all([
          resourcesService.getAll(),
          loansService.getAll(LoanStatus.ACTIVO),
          reservationsService.getAll(ReservationStatus.PENDIENTE),
          finesService.getAll(FineStatus.PENDIENTE),
          usersService.getAll(),
        ]);

      setBackendStatus('online');

      const finesSum = (finesData || []).reduce(
        (acc, curr) => acc + Number(curr.amount || 0),
        0,
      );

      setMetrics({
        totalResources: resourcesData?.length || 0,
        activeLoans: loansData?.length || 0,
        pendingReservations: reservationsData?.length || 0,
        pendingFinesAmount: finesSum,
        pendingFinesCount: finesData?.length || 0,
        totalUsers: usersData?.length || 0,
      });
    } catch {
      setBackendStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            ¡Bienvenido/a, {user?.fullName || 'Usuario'}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sesión activa como <strong className="text-indigo-600">{user?.role}</strong> ({user?.code}) — Sistema de Gestión Bibliotecaria Universidad de Madeira.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={loading}
            title="Refrescar métricas"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>

          <div className="flex items-center gap-2">
            {backendStatus === 'checking' && <Badge variant="warning">Comprobando API...</Badge>}
            {backendStatus === 'online' && <Badge variant="success">API Online (:3000)</Badge>}
            {backendStatus === 'offline' && <Badge variant="danger">API Desconectada</Badge>}
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas en Tiempo Real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link to="/resources" className="block group">
          <Card className="transition-all duration-200 group-hover:border-indigo-400 group-hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Catálogo Total
                </p>
                <h4 className="text-3xl font-bold text-slate-800 mt-1.5">
                  {metrics.totalResources}
                </h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                  <span>En 6 colecciones</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </div>
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Library className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/loans" className="block group">
          <Card className="transition-all duration-200 group-hover:border-sky-400 group-hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Préstamos Activos
                </p>
                <h4 className="text-3xl font-bold text-slate-800 mt-1.5">
                  {metrics.activeLoans}
                </h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-sky-600 transition-colors">
                  <span>En circulación</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </div>
              <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/reservations" className="block group">
          <Card className="transition-all duration-200 group-hover:border-amber-400 group-hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cola de Espera
                </p>
                <h4 className="text-3xl font-bold text-slate-800 mt-1.5">
                  {metrics.pendingReservations}
                </h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                  <span>General y Tecnoteca</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/fines" className="block group">
          <Card className="transition-all duration-200 group-hover:border-rose-400 group-hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Multas por Cobrar
                </p>
                <h4 className="text-3xl font-bold text-rose-600 mt-1.5">
                  ${metrics.pendingFinesAmount.toFixed(2)}
                </h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-rose-600 transition-colors">
                  <span>{metrics.pendingFinesCount} sanciones pendientes</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </div>
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Secciones de Acciones Rápidas y Arquitectura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accesos directos a los módulos */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Accesos Directos
          </h3>

          <Link
            to="/resources"
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Gestionar Catálogo</h4>
                <p className="text-xs text-slate-500">6 colecciones universitarias</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/loans"
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Préstamos y Devoluciones</h4>
                <p className="text-xs text-slate-500">Circulación y renovaciones</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          {canManageUsers ? (
            <Link
              to="/users"
              className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Directorio Institucional</h4>
                  <p className="text-xs text-slate-500">{metrics.totalUsers} usuarios registrados</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          ) : (
            <Link
              to="/reservations"
              className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Cola de Reservas</h4>
                  <p className="text-xs text-slate-500">Libros y tabletas en espera</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          )}
        </div>

        {/* Card de información y estado de la plataforma */}
        <div className="lg:col-span-2">
          <Card
            title="Arquitectura End-to-End Conectada"
            subtitle="Plataforma Integral de la Universidad de Madeira"
            icon={<Laptop className="w-5 h-5" />}
          >
            <div className="space-y-4 text-sm text-slate-600">
              <p>
                Todos los módulos del frontend se encuentran conectados con las APIs REST en tiempo real:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">Cola de Reservas</span>
                    <span className="text-[11px] text-slate-500">Modales de creación, asignación y cancelación con prioridad FIFO.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">Catálogo Polimórfico</span>
                    <span className="text-[11px] text-slate-500">6 colecciones con campos dinámicos y cambios de estado en vivo.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">Préstamos y Renovaciones</span>
                    <span className="text-[11px] text-slate-500">Control de devolución y ampliación de plazos con historial.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">Gestión de Sanciones</span>
                    <span className="text-[11px] text-slate-500">Cobro de multas y condonaciones institucionales.</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
