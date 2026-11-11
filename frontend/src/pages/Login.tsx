import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  BookOpen,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Por favor ingrese su usuario/correo y contraseña.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login({
        identifier: identifier.trim(),
        password: password.trim(),
      });
      success(`¡Bienvenido al sistema, ${loggedUser.fullName}!`, 'Sesión Iniciada');
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Error al iniciar sesión. Verifique sus credenciales.';
      setErrorMessage(msg);
      notifyError(msg, 'Error de Autenticación');
    } finally {
      setSubmitting(false);
    }
  };

  const autofillAdmin = () => {
    setIdentifier('admin@uma.pt');
    setPassword('Admin123*');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
            <BookOpen className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Universidad de Madeira
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sistema Integrado de Gestión Bibliotecaria (SIGB)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Iniciar Sesión</h3>
            <p className="text-xs text-slate-400 mt-1">
              Ingrese su correo institucional o código universitario para acceder a su rol.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start gap-2.5">
              <span className="font-semibold text-rose-300">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo institucional o Código universitario
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@uma.pt ó ADMIN01"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Acceder a la Plataforma</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Helper Card with Admin Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="bg-indigo-950/40 border border-indigo-900/60 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Cuenta de Administrador Inicial</span>
                </div>
                <button
                  type="button"
                  onClick={autofillAdmin}
                  className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-900/40 hover:bg-indigo-900/70 px-2 py-0.5 rounded border border-indigo-700/50 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Autocompletar</span>
                </button>
              </div>
              <div className="text-xs space-y-1 text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Correo:</span>
                  <span className="font-semibold text-white">admin@uma.pt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Código:</span>
                  <span className="font-semibold text-white">ADMIN01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contraseña:</span>
                  <span className="font-semibold text-emerald-400">Admin123*</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles note footer */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Roles disponibles: Administrador, Bibliotecario, Profesor y Estudiante.
        </p>
      </div>
    </div>
  );
};

export default Login;
