import React, { useEffect, useState, useCallback, memo } from 'react';
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react';

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

const TOAST_STYLES = {
  success: {
    container: 'bg-white border-l-4 border-l-emerald-500',
    icon: 'text-emerald-500',
    title: 'text-zinc-900',
    progress: 'bg-emerald-500',
  },
  error: {
    container: 'bg-white border-l-4 border-l-rose-500',
    icon: 'text-rose-500',
    title: 'text-zinc-900',
    progress: 'bg-rose-500',
  },
  warning: {
    container: 'bg-white border-l-4 border-l-amber-500',
    icon: 'text-amber-500',
    title: 'text-zinc-900',
    progress: 'bg-amber-500',
  },
  info: {
    container: 'bg-white border-l-4 border-l-blue-500',
    icon: 'text-blue-500',
    title: 'text-zinc-900',
    progress: 'bg-blue-500',
  },
} as const;

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: Warning,
  info: Info,
} as const;

const Toast: React.FC<ToastProps> = memo(({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // Auto-dismiss por timeout único. Antes esto usaba un requestAnimationFrame
  // loop que llamaba setProgress en cada frame, causando re-renders constantes
  // del árbol React (patrón prohibido). La barra de progreso ahora es una
  // animación CSS (keyframe progress-shrink en toast.css) con duration dinámica
  // vía style inline, que es GPU-acelerada y respetar prefers-reduced-motion.
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const timer = setTimeout(handleClose, toast.duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration, toast.id]);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onClose(toast.id), 150);
  }, [onClose, toast.id]);

  const styles = TOAST_STYLES[toast.type];
  const Icon = ICONS[toast.type];

  const baseClasses = `
    relative flex items-start gap-3 px-4 py-3
    ${styles.container}
    rounded-lg shadow-md
    transition-all duration-150 ease-out
  `;

  const animationClasses = isVisible && !isLeaving
    ? 'translate-x-0 opacity-100'
    : 'translate-x-4 opacity-0';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`${baseClasses} ${animationClasses}`}
    >
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${styles.icon}`} weight="fill" aria-hidden="true" />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${styles.title}`}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-zinc-500">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="flex-shrink-0 p-1 -m-1 text-zinc-400 hover:text-zinc-500 rounded transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>

      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100 overflow-hidden rounded-b-lg">
          <div
            className={`h-full ${styles.progress}`}
            style={{
              animationName: 'progress-shrink',
              animationDuration: `${toast.duration}ms`,
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards',
            }}
          />
        </div>
      )}
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;
