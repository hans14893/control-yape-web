import React, { useState, useCallback } from 'react';
import type { NotificationType, Notification } from './NotificationContextDef';
import { NotificationContext } from './NotificationContextDef';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message };
    
    setNotifications((prev) => [...prev, notification]);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
