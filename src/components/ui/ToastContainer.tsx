import React, { memo } from 'react';
import Toast, { ToastData } from './Toast';

interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

const POSITIONS = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
} as const;

const ToastContainer: React.FC<ToastContainerProps> = memo(({
  toasts,
  onRemoveToast,
  position = 'top-right',
  maxVisible = 4,
}) => {
  if (toasts.length === 0) return null;

  const visible = toasts.slice(-maxVisible);

  return (
    <div
      className={`fixed z-50 ${POSITIONS[position]} w-full max-w-sm space-y-2 pointer-events-none`}
      role="region"
      aria-label="Notificaciones"
    >
      {visible.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onRemoveToast} />
        </div>
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';

export default ToastContainer;
