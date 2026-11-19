import React, { useState } from 'react';
import Modal from './Modal';
import Badge from './Badge';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/api';
import { UserRole } from '../../types';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Estados para cambio de contraseña
  const [currentPassword1, setCurrentPassword1] = useState('');
  const [currentPassword2, setCurrentPassword2] = useState('');
  const [currentPasswordValidated, setCurrentPasswordValidated] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  if (!user) return null;

  const resetForm = () => {
    setCurrentPassword1('');
    setCurrentPassword2('');
    setCurrentPasswordValidated(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setStepError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Paso 1: Validar confirmación de contraseña actual 2 veces
  const handleValidateCurrentPasswords = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    if (!currentPassword1.trim() || !currentPassword2.trim()) {
      setStepError('Debe ingresar y confirmar su contraseña actual en ambos campos.');
      return;
    }

    if (currentPassword1 !== currentPassword2) {
      setStepError('Las dos contraseñas actuales ingresadas no coinciden. Verifíquelas.');
      return;
    }

    // Contraseña actual confirmada 2 veces de forma idéntica
    setCurrentPasswordValidated(true);
  };

  // Paso 2: Actualizar con nueva contraseña
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    if (!newPassword.trim()) {
      setStepError('Debe ingresar una nueva contraseña.');
      return;
    }

    if (newPassword.length < 6) {
      setStepError('La nueva contraseña debe tener como mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setStepError('La confirmación de la nueva contraseña no coincide.');
      return;
    }

    if (newPassword === currentPassword1) {
      setStepError('La nueva contraseña no puede ser idéntica a la contraseña actual.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword({
        currentPassword: currentPassword1.trim(),
        newPassword: newPassword.trim(),
      });
      success('Tu contraseña ha sido actualizada exitosamente.', 'Contraseña Actualizada');
      handleClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Error al cambiar la contraseña. Asegúrese de que su contraseña actual sea la correcta.';
      setStepError(msg);
      notifyError(msg, 'Error al Actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger';
      case UserRole.BIBLIOTECARIO:
        return 'warning';
      case UserRole.PROFESOR:
        return 'success';
      case UserRole.ESTUDIANTE:
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Perfil de Usuario"
      subtitle="Consulta tu información institucional y gestiona la seguridad de tu cuenta"
      maxWidth="md"
    >
      {/* Selector de Pestañas */}
      <div className="flex border-b border-slate-200 mb-5">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Información de Usuario</span>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Cambiar Contraseña</span>
        </button>
      </div>

      {/* Pestaña 1: Información de Usuario */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {user.fullName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                <Badge variant={user.isActive ? 'success' : 'neutral'}>
                  {user.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-slate-400 font-medium block mb-1">
                Código Universitario
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {user.code}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-slate-400 font-medium block mb-1">
                Identificación / DNI
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {user.identification}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl sm:col-span-2">
              <span className="text-slate-400 font-medium block mb-1">
                Correo Institucional
              </span>
              <span className="text-slate-800 font-semibold flex items-center gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                {user.email}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-slate-400 font-medium block mb-1">
                Plan Académico / Carrera
              </span>
              <span className="text-slate-800 font-medium flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                {user.academicPlan || 'No especificado'}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-slate-400 font-medium block mb-1">
                Semestre Cursado
              </span>
              <span className="text-slate-800 font-medium">
                {user.semester ? `Semestre ${user.semester}` : 'N/A'}
              </span>
            </div>

            {user.createdBy && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl sm:col-span-2">
                <span className="text-slate-400 font-medium block mb-1">
                  Registrado en el Sistema por
                </span>
                <span className="text-slate-700 font-medium">
                  {user.createdBy.fullName} ({user.createdBy.role})
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* Pestaña 2: Cambiar Contraseña */}
      {activeTab === 'password' && (
        <div className="space-y-4">
          {stepError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{stepError}</span>
            </div>
          )}

          {!currentPasswordValidated ? (
            /* PASO 1: Confirmar Contraseña Actual 2 veces */
            <form onSubmit={handleValidateCurrentPasswords} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Paso 1: Verificación de Identidad</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Para habilitar el cambio de credenciales, ingrese y confirme su contraseña actual dos veces consecutivas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  1. Ingrese su Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword1}
                    onChange={(e) => setCurrentPassword1(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  2. Confirme nuevamente su Contraseña Actual
                </label>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword2}
                  onChange={(e) => setCurrentPassword2(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <span>Verificar y Desbloquear Nueva Clave</span>
                </Button>
              </div>
            </form>
          ) : (
            /* PASO 2: Ingresar Nueva Contraseña */
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Paso 2: Contraseña actual verificada</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Defina a continuación su nueva contraseña institucional (mínimo 6 caracteres).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="block w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repita la nueva contraseña"
                  className="block w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentPasswordValidated(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
                >
                  ← Volver a verificar contraseña
                </button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" type="button" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
                    <span>Guardar Nueva Contraseña</span>
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ProfileModal;
