import React from 'react';
import {
  Warning,
  CircleNotch,
  CheckCircle,
  ArrowRight,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';
import { Modal } from '../../ui/ModalElements';

interface ConfirmacionValeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  establecimientoNombre: string;
  vacunaNombre: string;
  mesNombre: string;
  anio: number;
  valorOriginal: number;
  valorNuevo: number;
  isProcessing?: boolean;
}

const ConfirmacionValeModal: React.FC<ConfirmacionValeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  establecimientoNombre,
  vacunaNombre,
  mesNombre,
  anio,
  valorOriginal,
  valorNuevo,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  const diferencia = valorNuevo - valorOriginal;
  const esReduccion = diferencia < 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? () => undefined : onClose}
      title="Vale activo detectado"
      subtitle="Esta entrega ya tiene un vale generado. Confirma para actualizar planificación, stock y vale."
      icon={Warning}
      size="sm"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row-reverse">
          <button type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`${COMPONENT_STYLES.button.primary} flex-1`}
          >
            {isProcessing ? (
              <>
                <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" weight="bold" />
                <span>Confirmar cambio</span>
              </>
            )}
          </button>
          <button type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className={`${COMPONENT_STYLES.button.secondary} flex-1`}
          >
            Cancelar
          </button>
        </div>
      }
    >
          <div className="space-y-3">
            <div className="divide-y divide-[#eeeef3] rounded-xl border border-[#e7e7ef] bg-[#fbfafd]">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-[#606571]">Establecimiento</span>
                <span className="max-w-[55%] truncate text-right text-sm font-semibold text-[#15171d]">{establecimientoNombre}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-[#606571]">Vacuna</span>
                <span className="text-sm font-semibold text-[#15171d]">{vacunaNombre}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-[#606571]">Período</span>
                <span className="text-sm font-semibold text-[#15171d]">{mesNombre} {anio}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-5 rounded-xl border border-[#e7e7ef] bg-white px-6 py-4">
              <div className="text-center">
                <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[#8b8f9b]">Actual</p>
                <div className="min-w-[72px] rounded-lg border border-[#e7e7ef] bg-white px-4 py-2">
                  <p className="text-xl font-semibold tabular-nums text-[#8b8f9b]">{valorOriginal.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <ArrowRight className="h-4 w-4 text-[#c4c7d0]" weight="bold" />
                <span className={`inline-flex items-center gap-1 rounded-md border border-[#e7e7ef] bg-white px-2 py-0.5 text-[0.68rem] font-semibold ${
                  esReduccion ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {esReduccion
                    ? <TrendDown className="h-3 w-3" weight="bold" />
                    : <TrendUp className="h-3 w-3" weight="bold" />}
                  {diferencia > 0 ? '+' : ''}{diferencia.toLocaleString()}
                </span>
              </div>

              <div className="text-center">
                <p className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[#15171d]">Nueva</p>
                <div className="min-w-[72px] rounded-lg border border-[#c8bbff] bg-[#fbfafd] px-4 py-2">
                  <p className="text-xl font-semibold tabular-nums text-[#15171d]">{valorNuevo.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e7e7ef] bg-[#fbfafd] px-4 py-3">
              <p className="text-sm leading-relaxed text-[#606571]">
                Al confirmar, el stock de vacunas, jeringas y el vale se actualizarán automáticamente.
              </p>
            </div>
          </div>
    </Modal>
  );
};

export default ConfirmacionValeModal;
