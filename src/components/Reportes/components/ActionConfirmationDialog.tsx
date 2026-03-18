import React from 'react';
import { AlertTriangle, LucideIcon } from 'lucide-react';
import { Modal, ModalFooter } from '../../Inventario/components/ModalComponents';

interface ActionConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  icon?: LucideIcon;
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
  icon = AlertTriangle,
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
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-sm leading-6 text-slate-700">{description}</p>
    </div>
  </Modal>
);

export default ActionConfirmationDialog;
