import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import '../../styles/toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-close después del duration
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    let classes = `toast toast-${toast.type}`;

    if (isLeaving) {
      classes += ' toast-leaving';
    }

    return classes;
  };

  const getIcon = () => {
    const iconClass = "toast-icon";

    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getTitleColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={getToastStyles()}>
      {/* Icono */}
      {getIcon()}

      {/* Contenido */}
      <div className="toast-content">
        <h4 className={`toast-title ${getTitleColor()}`}>
          {toast.title}
        </h4>
        {toast.message && (
          <p className="toast-message">
            {toast.message}
          </p>
        )}

        {/* Acción opcional */}
        {toast.action && (
          <div className="toast-action">
            <button
              onClick={toast.action.onClick}
              className={`${
                toast.type === 'success' ? 'text-green-700 hover:text-green-800' :
                toast.type === 'error' ? 'text-red-700 hover:text-red-800' :
                toast.type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' :
                'text-blue-700 hover:text-blue-800'
              }`}
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Botón de cerrar */}
      <button
        onClick={handleClose}
        className="toast-close"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Barra de progreso para auto-close */}
      {toast.duration && toast.duration > 0 && (
        <div className="toast-progress">
          <div
            className={`toast-progress-bar ${toast.type}`}
            style={{
              animation: `progress-shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;
