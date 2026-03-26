import React from 'react';
import { Warning, CircleNotch, Trash } from '@phosphor-icons/react';
import { Modal } from '../Establecimientos/components';
import { COMPONENT_STYLES } from './constants';

export interface EntregaToDelete {
  id: string;
  numeroEntrega: number;
  establecimientoNombre: string;
  tieneVale: boolean;
  valeNumero?: string;
}

interface ConfirmacionEliminacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entrega: EntregaToDelete | null;
  isProcessing?: boolean;
}

const ConfirmacionEliminacionModal: React.FC<ConfirmacionEliminacionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  entrega,
  isProcessing = false,
}) => {
  if (!entrega) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isProcessing) onClose();
      }}
      title="Borrado de Transacción"
      subtitle="La purga lógica es permanente e irreparable. Ejecute con absoluta precaución."
      icon={Warning}
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className={COMPONENT_STYLES.button.secondary}
          >
            Abortar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={COMPONENT_STYLES.button.danger}
          >
            {isProcessing ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <Trash className="h-4 w-4" weight="bold" />}
            <span>{isProcessing ? 'Purgando sistema...' : 'Confirmar Purga'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[16px] border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-rose-200 text-rose-600 shadow-sm">
              <Trash className="h-5 w-5" weight="duotone" />
            </div>
            <div>
              <p className="text-[0.95rem] font-black text-rose-900 tracking-tight">
                Anulación Transaccional #{entrega.numeroEntrega}
              </p>
              <div className="mt-2 text-[0.85rem] font-medium text-rose-800/80">
                Hub Operativo: <span className="font-bold text-rose-900 border-b border-rose-200">{entrega.establecimientoNombre}</span>
              </div>
            </div>
          </div>
        </div>

        {entrega.tieneVale ? (
          <div className="flex items-start gap-3 rounded-[16px] border border-zinc-900 bg-zinc-900 px-5 py-4 shadow-md">
            <Warning className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" weight="fill" />
            <div>
              <p className="text-[0.9rem] font-bold text-white tracking-tight">Vinculación Financiera Detectada</p>
              {entrega.valeNumero ? (
                <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-widest text-zinc-400">
                  Target TICKET: <span className="text-white bg-zinc-800 px-1 py-0.5 rounded ml-1">{entrega.valeNumero}</span>
                </p>
              ) : null}
              <p className="mt-2 text-[0.8rem] text-zinc-300 leading-relaxed">
                La anulación purgará esta traza provocando el rollback en cascada del Ticket en el libro contable de stock.
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-[16px] border border-zinc-200 bg-white px-5 py-4 shadow-sm border-l-[3px] border-l-zinc-900">
          <p className="text-[0.8rem] font-bold text-zinc-700 leading-relaxed tracking-tight">
            Los punteros de memoria sumarios recalcularán la matriz general perdiendo el historial de esta capa de inyección especial.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmacionEliminacionModal;
