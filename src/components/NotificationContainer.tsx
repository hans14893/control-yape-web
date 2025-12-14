import React from 'react';
import { useNotification } from '../context/useNotification';
import { Check, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 text-white border border-emerald-700';
      case 'error':
        return 'bg-red-600 text-white border border-red-700';
      case 'warning':
        return 'bg-amber-600 text-white border border-amber-700';
      case 'info':
        return 'bg-blue-600 text-white border border-blue-700';
      default:
        return 'bg-slate-600 text-white border border-slate-700';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getStyles(
            notification.type
          )} px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 transition-all pointer-events-auto max-w-sm`}
        >
          {getIcon(notification.type)}
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
