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
  <li className="flex items-start gap-2.5">
    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
    <span className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
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
      <div className="space-y-4">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {CONFIG.question(valeNumero)}
        </p>

        <FormSection title={CONFIG.subtitle}>
          <ul className="mt-1 space-y-2">
            {CONFIG.actions.map((action, index) => (
              <ActionItem key={index} icon={action.icon} text={action.text} />
            ))}
          </ul>
        </FormSection>

        <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-2.5">
            <Warning weight="duotone" className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700 dark:text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">{CONFIG.warning}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(ConfirmacionModal);
