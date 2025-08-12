import { useState, useCallback } from 'react';
import { ToastData, ToastType } from '../components/ui/Toast';

/**
 * Hook personalizado para gestión de toast notifications
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  /**
   * Agregar un nuevo toast
   */
  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration: options?.duration ?? (type === 'error' ? 8000 : 5000), // Errores duran más
      action: options?.action,
    };

    setToasts(prev => [...prev, newToast]);

    return id;
  }, []);

  /**
   * Remover un toast específico
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Limpiar todos los toasts
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Métodos de conveniencia para diferentes tipos de toast
   */
  const toast = {
    success: (title: string, message?: string, options?: { duration?: number; action?: { label: string; onClick: () => void; } }) => 
      addToast('success', title, message, options),
    
    error: (title: string, message?: string, options?: { duration?: number; action?: { label: string; onClick: () => void; } }) => 
      addToast('error', title, message, options),
    
    warning: (title: string, message?: string, options?: { duration?: number; action?: { label: string; onClick: () => void; } }) => 
      addToast('warning', title, message, options),
    
    info: (title: string, message?: string, options?: { duration?: number; action?: { label: string; onClick: () => void; } }) => 
      addToast('info', title, message, options),
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast,
  };
}

export default useToast;
