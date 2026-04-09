import React from 'react';
import {
  Warning,
  WarningCircle,
  ArrowRight,
  CheckCircle,
  CircleNotch,
} from '@phosphor-icons/react';
import { Modal } from '../Establecimientos/components';
import { ImpactoModificacion } from '../../services/valesService';
import { COMPONENT_STYLES } from './constants';

interface ConfirmacionModificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  impacto: ImpactoModificacion | null;
  isLoading?: boolean;
  isProcessing?: boolean;
}

const ConfirmacionModificacionModal: React.FC<ConfirmacionModificacionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  impacto,
  isLoading = false,
  isProcessing = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading && !isProcessing) onClose();
      }}
      title="Validación de Alteración"
      subtitle="La modificación impactará directamente en balance, kardex y facturas emitidas."
      icon={Warning}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing || isLoading}
            className={COMPONENT_STYLES.button.secondary}
          >
            Abortar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing || isLoading || !impacto}
            className={COMPONENT_STYLES.button.primary}
          >
            {isProcessing ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <CheckCircle className="h-4 w-4" weight="bold" />
            )}
            <span>{isProcessing ? 'Guardando cambios...' : 'Confirmar Alteración'}</span>
          </button>
        </div>
      }
    >
      {/* ── Cargando ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <CircleNotch className="h-6 w-6 text-zinc-400 animate-spin" weight="bold" />
          <p className="text-sm text-zinc-500">Calculando impacto…</p>
        </div>

      ) : impacto ? (
        <div className="space-y-5">

          {/* ── Bloque 1: Establecimiento + cambio de cantidad ── */}
          <div className="rounded-2xl bg-zinc-950 px-5 py-4">
            <p className="text-white font-bold text-sm tracking-tight">
              {impacto.resumen.establecimientoNombre}
            </p>
            <p className="text-zinc-400 text-xs mt-0.5">{impacto.resumen.vacunaNombre}</p>

            <div className="mt-4 flex items-center gap-3">
              <div className="text-center">
                <p className="text-[0.6rem] text-zinc-500 uppercase tracking-widest mb-1">Actual</p>
                <p className="text-3xl font-black text-zinc-300 tabular-nums">
                  {impacto.resumen.cantidadActual.toLocaleString()}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-zinc-600 mt-4" weight="bold" />
              <div className="text-center">
                <p className="text-[0.6rem] text-zinc-500 uppercase tracking-widest mb-1">Nuevo</p>
                <p className="text-3xl font-black text-white tabular-nums">
                  {impacto.resumen.cantidadNueva.toLocaleString()}
                </p>
              </div>
              <div className="ml-auto">
                <span
                  className={`text-sm font-black px-3 py-1.5 rounded-xl tabular-nums ${
                    impacto.resumen.diferencia > 0
                      ? 'bg-zinc-800 text-white'
                      : impacto.resumen.diferencia < 0
                      ? 'bg-rose-500 text-white'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {impacto.resumen.diferencia > 0 ? '+' : ''}
                  {impacto.resumen.diferencia.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ── Bloque 2: Resumen de stock afectado ── */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 divide-y divide-zinc-100">
            {/* Vacunas */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm font-medium text-zinc-600">Vacunas</p>
              <div className="flex items-center gap-2 text-sm tabular-nums">
                <span className="text-zinc-400 font-medium">
                  {impacto.impactoVacunas.stockTotalActual.toLocaleString()}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-300" weight="bold" />
                <span className="font-bold text-zinc-900">
                  {impacto.impactoVacunas.stockTotalDespues.toLocaleString()}
                </span>
                <span
                  className={`ml-1 text-xs font-black px-1.5 py-0.5 rounded-md ${
                    impacto.impactoVacunas.stockTotalDespues - impacto.impactoVacunas.stockTotalActual < 0
                      ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {impacto.impactoVacunas.stockTotalDespues - impacto.impactoVacunas.stockTotalActual > 0 ? '+' : ''}
                  {(impacto.impactoVacunas.stockTotalDespues - impacto.impactoVacunas.stockTotalActual).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Jeringas */}
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm font-medium text-zinc-600">Jeringas</p>
              <div className="flex items-center gap-2 text-sm tabular-nums">
                <span className="text-zinc-400 font-medium">
                  {impacto.impactoJeringas.stockTotalActual.toLocaleString()}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-300" weight="bold" />
                <span className="font-bold text-zinc-900">
                  {impacto.impactoJeringas.stockTotalDespues.toLocaleString()}
                </span>
                <span
                  className={`ml-1 text-xs font-black px-1.5 py-0.5 rounded-md ${
                    impacto.impactoJeringas.stockTotalDespues - impacto.impactoJeringas.stockTotalActual < 0
                      ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {impacto.impactoJeringas.stockTotalDespues - impacto.impactoJeringas.stockTotalActual > 0 ? '+' : ''}
                  {(impacto.impactoJeringas.stockTotalDespues - impacto.impactoJeringas.stockTotalActual).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ── Bloque 3: Vales afectados ── */}
          {impacto.valesAfectados.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">
                Vales afectados
              </p>
              <div className="rounded-2xl border border-zinc-100 divide-y divide-zinc-100">
                {impacto.valesAfectados.map((vale) => (
                  <div key={vale.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{vale.numero}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm tabular-nums text-zinc-500">
                      <span>{vale.cantidadAnterior.toLocaleString()}</span>
                      <ArrowRight className="h-3 w-3 text-zinc-300" weight="bold" />
                      <span className="font-bold text-zinc-900">{vale.cantidadNueva.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Bloque 4: Advertencias ── */}
          {impacto.advertencias.length > 0 && (
            <div className="space-y-2">
              {impacto.advertencias.map((advertencia, index) => (
                <div
                  key={`${advertencia}-${index}`}
                  className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3"
                >
                  <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" weight="fill" />
                  <p className="text-sm font-medium text-rose-800">{advertencia}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (
        /* ── Error / sin datos ── */
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <Warning className="h-8 w-8 text-zinc-300" weight="duotone" />
          <p className="text-sm text-zinc-500">No se pudo calcular el impacto.</p>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmacionModificacionModal;
