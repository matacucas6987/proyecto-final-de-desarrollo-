import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
}

interface NotificationContextProps {
  notify: (type: NotificationType, message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (type: NotificationType, message: string, title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newNotification: NotificationItem = { id, type, message, title };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 4500);
    },
    [removeNotification],
  );

  const success = useCallback((msg: string, title = 'Operación Exitosa') => notify('success', msg, title), [notify]);
  const error = useCallback((msg: string, title = 'Error') => notify('error', msg, title), [notify]);
  const warning = useCallback((msg: string, title = 'Advertencia') => notify('warning', msg, title), [notify]);
  const info = useCallback((msg: string, title = 'Información') => notify('info', msg, title), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info }}>
      {children}
      {/* Toast floating container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {notifications.map((item) => {
          const typeConfig = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
              accent: 'bg-emerald-500',
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
              bg: 'bg-rose-50 border-rose-200 text-rose-900',
              accent: 'bg-rose-500',
            },
            warning: {
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
              bg: 'bg-amber-50 border-amber-200 text-amber-900',
              accent: 'bg-amber-500',
            },
            info: {
              icon: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
              bg: 'bg-sky-50 border-sky-200 text-sky-900',
              accent: 'bg-sky-500',
            },
          }[item.type];

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-up ${typeConfig.bg}`}
            >
              {typeConfig.icon}
              <div className="flex-1 min-w-0">
                {item.title && (
                  <h4 className="text-sm font-semibold leading-tight">{item.title}</h4>
                )}
                <p className="text-xs mt-0.5 leading-relaxed text-slate-700">{item.message}</p>
              </div>
              <button
                onClick={() => removeNotification(item.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
