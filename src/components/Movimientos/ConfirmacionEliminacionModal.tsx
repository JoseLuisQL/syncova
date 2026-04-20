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
      title="Eliminar movimiento"
      subtitle="Esta acción no se puede deshacer."
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
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={COMPONENT_STYLES.button.danger}
          >
            {isProcessing ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <Trash className="h-4 w-4" weight="bold" />
            )}
            <span>{isProcessing ? 'Eliminando...' : 'Sí, eliminar'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">

        {/* ── Datos del movimiento ── */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">
            Movimiento
          </p>
          <p className="text-base font-bold text-zinc-900">
            Entrega #{entrega.numeroEntrega}
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">{entrega.establecimientoNombre}</p>
        </div>

        {/* ── Vale vinculado (si aplica) ── */}
        {entrega.tieneVale && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <Warning className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" weight="fill" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Este movimiento tiene un vale vinculado
                </p>
                {entrega.valeNumero && (
                  <p className="text-xs text-amber-700 mt-1 font-mono">
                    {entrega.valeNumero}
                  </p>
                )}
                <p className="text-xs text-amber-700 mt-1.5 leading-relaxed">
                  Al eliminar, el vale asociado también será anulado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Mensaje de confirmación ── */}
        <p className="text-sm text-zinc-500 leading-relaxed px-1">
          ¿Estás seguro de que quieres eliminar este movimiento? El stock y los registros relacionados serán actualizados automáticamente.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmacionEliminacionModal;
