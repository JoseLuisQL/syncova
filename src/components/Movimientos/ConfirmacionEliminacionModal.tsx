import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Modal } from '../Establecimientos/components';

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
      title="Eliminar entrega adicional"
      subtitle="Esta acción no se puede deshacer."
      icon={AlertTriangle}
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-rose-700 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>{isProcessing ? 'Eliminando...' : 'Eliminar'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="rounded-[22px] border border-rose-200 bg-rose-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                ¿Estás seguro de eliminar la entrega adicional #{entrega.numeroEntrega}?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Establecimiento: <span className="font-medium text-slate-800">{entrega.establecimientoNombre}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Vale warning */}
        {entrega.tieneVale ? (
          <div className="flex items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50/70 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Esta entrega tiene un vale generado</p>
              {entrega.valeNumero ? (
                <p className="mt-0.5 text-xs text-amber-700">Vale: {entrega.valeNumero}</p>
              ) : null}
              <p className="mt-1 text-xs text-amber-700">
                Al eliminar esta entrega, el vale asociado y los movimientos de stock serán revertidos automáticamente.
              </p>
            </div>
          </div>
        ) : null}

        {/* Info */}
        <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-xs text-slate-500">
            Se eliminarán los datos de esta entrega adicional y se recalcularán los totales del movimiento.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmacionEliminacionModal;
