import React from 'react';
import {
  Warning,
  X,
  CircleNotch,
  CheckCircle,
  ArrowRight,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

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
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className={COMPONENT_STYLES.modal.container}>
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-zinc-200/60">

          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 pt-6 pb-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                <Warning className="h-5 w-5" weight="fill" />
              </div>
              <div>
                <h2 className="text-[0.97rem] font-semibold tracking-tight text-zinc-900">
                  Vale activo detectado
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Esta entrega ya tiene un vale generado. ¿Deseas modificarla?
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="ml-2 shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            )}
          </div>

          {/* ── Body ── */}
          <div className="px-6 pb-5 space-y-3">

            {/* Establecimiento + período */}
            <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-100 bg-zinc-50">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500">Establecimiento</span>
                <span className="text-sm font-semibold text-zinc-900 text-right max-w-[55%] truncate">{establecimientoNombre}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500">Vacuna</span>
                <span className="text-sm font-semibold text-zinc-900">{vacunaNombre}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-zinc-500">Período</span>
                <span className="text-sm font-semibold text-zinc-900">{mesNombre} {anio}</span>
              </div>
            </div>

            {/* Cambio de cantidad */}
            <div className="flex items-center justify-center gap-5 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-4">
              <div className="text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Cantidad actual</p>
                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-2 min-w-[72px]">
                  <p className="text-xl font-bold tabular-nums text-zinc-400">{valorOriginal.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <ArrowRight className="h-4 w-4 text-zinc-300" weight="bold" />
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold
                  ${esReduccion ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {esReduccion
                    ? <TrendDown className="h-3 w-3" weight="bold" />
                    : <TrendUp className="h-3 w-3" weight="bold" />}
                  {diferencia > 0 ? '+' : ''}{diferencia.toLocaleString()}
                </span>
              </div>

              <div className="text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-900 mb-1.5">Cantidad nueva</p>
                <div className="rounded-xl border-2 border-zinc-900 bg-white px-4 py-2 min-w-[72px]">
                  <p className="text-xl font-bold tabular-nums text-zinc-900">{valorNuevo.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Aviso de impacto */}
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <p className="text-sm text-zinc-500 leading-relaxed">
                Al confirmar, el stock de vacunas, jeringas y el vale se actualizarán automáticamente.
              </p>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex gap-2.5 border-t border-zinc-100 px-6 py-4">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className={COMPONENT_STYLES.button.secondary + ' flex-1'}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={COMPONENT_STYLES.button.primary + ' flex-1'}
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
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmacionValeModal;
