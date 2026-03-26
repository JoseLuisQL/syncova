import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { Toaster } from 'sileo';
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
      <Toaster 
        position="bottom-center" 
        offset={24}
        theme="light"
        options={{
          fill: "#18181b",
          roundness: 16,
          styles: {
            title: "text-zinc-50 font-medium tracking-tight!",
            description: "text-zinc-400! text-[0.82rem]!",
            badge: "bg-zinc-800/80! border border-zinc-700/50!",
            button: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700! ring-1 ring-inset ring-zinc-700/50!",
          }
        }}
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
