import { useCallback } from 'react';
import { sileo } from 'sileo';
import { ToastType, ToastData } from '../components/ui/Toast';

/**
 * Hook personalizado para gestión de toast notifications
 * Refactorizado a Sileo Physics Engine ("Cockpit Mode")
 */
export function useToast() {
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
    const config: any = {
      title,
      description: message,
      type: type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : 'success',
      duration: options?.duration ?? (type === 'error' ? 8000 : 5000),
    };

    if (options?.action) {
      config.button = {
        title: options.action.label,
        onClick: options.action.onClick,
      };
      return sileo.action(config);
    }

    if (type === 'success') return sileo.success(config);
    if (type === 'error') return sileo.error(config);
    if (type === 'warning') return sileo.warning(config);
    if (type === 'info') return sileo.info(config);
    
    return sileo.show(config);
  }, []);

  const removeToast = useCallback((id: string) => {
    sileo.dismiss(id);
  }, []);

  const clearToasts = useCallback(() => {
    sileo.clear();
  }, []);

  const toast = {
    success: (title: string, message?: string, options?: any) => 
      addToast('success', title, message, options),
    
    error: (title: string, message?: string, options?: any) => 
      addToast('error', title, message, options),
    
    warning: (title: string, message?: string, options?: any) => 
      addToast('warning', title, message, options),
    
    info: (title: string, message?: string, options?: any) => 
      addToast('info', title, message, options),
  };

  return {
    toasts: [] as ToastData[], // Mantener dummy para evitar brechar tipados del Provider dependiente
    addToast,
    removeToast,
    clearToasts,
    toast,
  };
}

export default useToast;
