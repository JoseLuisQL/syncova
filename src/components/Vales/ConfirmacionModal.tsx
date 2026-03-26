import React, { memo } from 'react';
import { ArrowCounterClockwise, Warning } from '@phosphor-icons/react';
import { Modal, ModalFooter, FormSection } from '../ui/ModalElements';

interface ConfirmacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  valeNumero: string;
  isProcessing?: boolean;
}

const CONFIG = {
  title: 'Cambiar Estado a Pendiente',
  question: (vale: string) => `¿Desea cambiar el estado del vale "${vale}" a Pendiente?`,
  subtitle: 'Efectos de cambiar a estado Pendiente:',
  actions: [
    { icon: '🔄', text: 'Cambiará el estado del vale a "Pendiente"' },
    { icon: '📦', text: 'Restaurará automáticamente los stocks de vacunas y jeringas' },
    { icon: '✏️', text: 'Permitirá realizar modificaciones al vale' },
    { icon: '🔄', text: 'Posibilitará regenerar el vale con nuevos datos' }
  ],
  warning: 'Esta operación es segura y reversible. El vale volverá a estado "Pendiente" y podrá ser modificado.',
  confirmText: 'Sí, Cambiar a Pendiente',
  processingText: 'Cambiando estado...'
};

const ActionItem = memo<{ icon: string; text: string; }>(({ icon, text }) => (
  <li className="flex items-start gap-3">
    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
    <span className="text-sm text-zinc-700 leading-relaxed">
      {icon} {text}
    </span>
  </li>
));
ActionItem.displayName = 'ActionItem';

const ConfirmacionModal: React.FC<ConfirmacionModalProps> = ({
  isOpen, onClose, onConfirm, valeNumero, isProcessing = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={CONFIG.title}
      subtitle={`Vale: ${valeNumero}`}
      icon={ArrowCounterClockwise}
      size="md"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={onConfirm}
          submitType="button"
          submitLabel={isProcessing ? CONFIG.processingText : CONFIG.confirmText}
          isLoading={isProcessing}
        />
      }
    >
      <div className="space-y-5">
        <p className="text-zinc-800 text-base font-medium">
          {CONFIG.question(valeNumero)}
        </p>

        <FormSection title={CONFIG.subtitle}>
          <ul className="space-y-2 mt-2">
            {CONFIG.actions.map((action, index) => (
              <ActionItem key={index} icon={action.icon} text={action.text} />
            ))}
          </ul>
        </FormSection>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Warning weight="duotone" className="h-5 w-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{CONFIG.warning}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(ConfirmacionModal);
