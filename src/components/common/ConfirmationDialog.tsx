import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  isLoading = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } catch (error) {
      console.error('Error en confirmación:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          titleColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          titleColor: 'text-yellow-800'
        };
      case 'info':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-blue-600" />,
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          titleColor: 'text-blue-800'
        };
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          titleColor: 'text-red-800'
        };
    }
  };

  const styles = getTypeStyles();
  const loading = isLoading || isProcessing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full m-4 shadow-xl">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
              {styles.icon}
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className={`text-lg leading-6 font-medium ${styles.titleColor}`}>
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="ml-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook para usar el diálogo de confirmación
export const useConfirmationDialog = () => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  const showConfirmation = (options: {
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
  }) => {
    setDialogState({
      isOpen: true,
      ...options
    });
  };

  const hideConfirmation = () => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      isOpen={dialogState.isOpen}
      onClose={hideConfirmation}
      onConfirm={async () => {
        await dialogState.onConfirm();
        hideConfirmation();
      }}
      title={dialogState.title}
      message={dialogState.message}
      type={dialogState.type}
      confirmText={dialogState.confirmText}
      cancelText={dialogState.cancelText}
    />
  );

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent
  };
};

// Componente específico para confirmación de eliminación
interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
  additionalWarning?: string;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'elemento',
  isLoading = false,
  additionalWarning
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Eliminar ${itemType}`}
      message={
        `¿Está seguro que desea eliminar "${itemName}"? Esta acción no se puede deshacer.` +
        (additionalWarning ? ` ${additionalWarning}` : '')
      }
      confirmText="Eliminar"
      cancelText="Cancelar"
      type="danger"
      isLoading={isLoading}
    />
  );
};

export default ConfirmationDialog;
