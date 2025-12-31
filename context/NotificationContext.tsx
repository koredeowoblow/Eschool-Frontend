import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, LucideIcon } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const current = Array.isArray(prev) ? prev : [];
      return current.filter(n => n && n.id !== id);
    });
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => {
      const current = Array.isArray(prev) ? prev : [];
      return [...current, { id, message, type }];
    });
    setTimeout(() => removeNotification(id), 5000);
  }, [removeNotification]);

  const icons: Record<NotificationType, LucideIcon> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  };

  const colors: Record<NotificationType, string> = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    error: 'bg-red-50 text-red-600 border-red-100',
    info: 'bg-blue-50 text-blue-600 border-blue-100',
    warning: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 w-full max-w-sm">
        {safeNotifications.map(n => {
          if (!n) return null;
          const Icon = icons[n.type] || Info;
          return (
            <div key={n.id} className={`p-4 rounded-2xl border shadow-2xl flex items-center justify-between gap-4 glass-effect animate-in slide-in-from-right-10 fade-in duration-300 ${colors[n.type] || colors.info}`}>
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <p className="text-sm font-bold leading-tight">{n.message}</p>
              </div>
              <button onClick={() => removeNotification(n.id)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                <X size={16} />
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
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};