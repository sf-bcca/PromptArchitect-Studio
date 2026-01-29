import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider component for the application-wide notification (toast) system.
 * Manages an array of notifications that auto-dismiss after 5 seconds.
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notify, removeNotification, notifications }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id}
            className={`pointer-events-auto p-4 rounded shadow-lg border border-opacity-20 animate-in slide-in-from-right fade-in duration-300 ${
              n.type === 'error' ? 'bg-red-900 border-red-500 text-white' : 
              n.type === 'success' ? 'bg-green-900 border-green-500 text-white' : 
              'bg-blue-900 border-blue-500 text-white'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <p className="text-sm font-medium">{n.message}</p>
              <button 
                onClick={() => removeNotification(n.id)}
                className="text-white opacity-60 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to access the NotificationContext for triggering toasts.
 * @returns {NotificationContextType} The notify and removeNotification functions.
 * @throws {Error} If used outside of a NotificationProvider.
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
