import React from 'react';
import { Warning, Icon } from '@phosphor-icons/react';
import { Modal, ModalFooter } from '../../ui/ModalElements';

interface ActionConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  icon?: Icon;
}

const ActionConfirmationDialog: React.FC<ActionConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onClose,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  icon = Warning,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    subtitle="Verifica esta acción antes de continuar."
    icon={icon}
    size="sm"
    footer={(
      <ModalFooter
        onCancel={onClose}
        onSubmit={onConfirm}
        cancelLabel={cancelLabel}
        submitLabel={confirmLabel}
        submitType="button"
        isLoading={isLoading}
      />
    )}
  >
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm leading-6 text-zinc-700">{description}</p>
    </div>
  </Modal>
);

export default ActionConfirmationDialog;
