import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import { ToastData, ToastType } from '../components/ui/Toast';

interface ToastContextType {
  toasts: ToastData[];
  addToast: (
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
  ) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toast: {
    success: (title: string, message?: string, options?: { duration?: number; action?: { label: string; onClick: () => void; } }) => string;
    error: (title: string, message?: string, options?: { duration?: number; action?: { label: string; onClick: () => void; } }) => string;
    warning: (title: string, message?: string, options?: { duration?: number; action?: { label: string; onClick: () => void; } }) => string;
    info: (title: string, message?: string, options?: { duration?: number; action?: { label: string; onClick: () => void; } }) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastHook = useToast();

  return (
    <ToastContext.Provider value={toastHook}>
      {children}
      <ToastContainer 
        toasts={toastHook.toasts} 
        onRemoveToast={toastHook.removeToast} 
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export default ToastContext;
