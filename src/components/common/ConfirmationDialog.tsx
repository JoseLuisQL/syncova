import React, { useState } from 'react';
import { Warning, Info } from '@phosphor-icons/react';
import { Modal, ModalFooter } from '../ui/ModalElements';

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

  const getIcon = () => {
    switch (type) {
      case 'danger':
      case 'warning':
        return Warning;
      case 'info':
        return Info;
      default:
        return Warning;
    }
  };

  const loading = isLoading || isProcessing;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={getIcon()}
      size="sm"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleConfirm}
          cancelLabel={cancelText}
          submitLabel={confirmText}
          submitType="button"
          isLoading={loading}
        />
      }
    >
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm leading-6 text-gray-700">{message}</p>
      </div>
    </Modal>
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
