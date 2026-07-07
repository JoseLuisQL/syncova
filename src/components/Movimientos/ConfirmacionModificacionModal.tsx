import React, { useState } from 'react';
import {
  Warning,
  WarningCircle,
  ArrowRight,
  CircleNotch,
} from '@phosphor-icons/react';
import { Modal } from '../Establecimientos/components';
import { ImpactoModificacion } from '../../services/valesService';

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
  const [internalLoading, setInternalLoading] = useState(false);

  const handleConfirmInternal = () => {
    if (internalLoading || isProcessing || isLoading || !impacto) return;
    setInternalLoading(true);
    // Ejecuta inmediatamente la función padre
    onConfirm();
    
    // Safety check, por si el modal se queda mucho rato
    setTimeout(() => {
       setInternalLoading(false);
    }, 5000);
  };

  const currentProcessing = isProcessing || internalLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading && !currentProcessing) onClose();
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
            disabled={currentProcessing || isLoading}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-[#4F6B7C] transition hover:bg-[#F1F5F7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Abortar
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
               // Evita problemas de focus/click racing en algunos navegadores/React versions
               e.preventDefault();
               handleConfirmInternal();
            }}
            disabled={currentProcessing || isLoading || !impacto}
            className="flex items-center gap-2 rounded-md bg-[#0E9F8E] px-5 py-2 text-sm font-semibold text-[#0F2A3B] transition hover:bg-[#0c8a7b] disabled:cursor-not-allowed disabled:opacity-60 text-white"
          >
            {currentProcessing && <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />}
            <span>{currentProcessing ? 'Guardando...' : 'Confirmar cambio'}</span>
          </button>
        </div>
      }
    >
      {/* ── Cargando ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-14">
          <CircleNotch className="h-6 w-6 animate-spin text-[#4F6B7C]" weight="bold" />
          <p className="text-sm text-[#4F6B7C]">Calculando impacto…</p>
        </div>
      ) : impacto ? (
        <div className="space-y-6">

          {/* Main Action Banner */}
          <div className="rounded-md bg-[#F1F5F7] p-4 text-[#0F2A3B]">
            <p className="text-sm">
              Estás modificando la entrega de <strong className="font-semibold">{impacto.resumen.vacunaNombre}</strong> para el establecimiento <strong className="font-semibold">{impacto.resumen.establecimientoNombre}</strong>.
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-[#4F6B7C]">Cantidad Original</span>
                <span className="text-xl font-medium text-[#4F6B7C] line-through">{impacto.resumen.cantidadActual.toLocaleString()}</span>
              </div>
              <ArrowRight className="h-5 w-5 text-[#4F6B7C] mt-4" weight="bold" />
              <div className="flex flex-col">
                <span className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-[#4F6B7C]">Nueva Cantidad</span>
                <span className="text-xl font-bold text-[#0E9F8E]">{impacto.resumen.cantidadNueva.toLocaleString()}</span>
              </div>
              <div className="ml-auto flex flex-col items-end">
                 <span className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-[#4F6B7C]">Diferencia</span>
                 <span className={"text-lg font-bold " + (impacto.resumen.diferencia > 0 ? "text-[#0E9F8E]" : impacto.resumen.diferencia < 0 ? "text-rose-600" : "text-[#0F2A3B]")}>
                    {impacto.resumen.diferencia > 0 ? '+' : ''}{impacto.resumen.diferencia.toLocaleString()}
                 </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Stock Impact Table */}
            <div>
              <p className="mb-2 font-mono text-[0.7rem] font-bold uppercase tracking-wider text-[#4F6B7C]">Impacto en Kardex (Stock)</p>
              <div className="overflow-hidden rounded-md border border-[#e5e7eb]">
                <table className="w-full text-left text-sm text-[#0F2A3B]">
                  <thead className="bg-[#F1F5F7] font-mono text-[0.65rem] uppercase tracking-wider text-[#4F6B7C]">
                    <tr>
                      <th className="px-4 py-2 font-semibold border-b border-[#e5e7eb]">Producto</th>
                      <th className="px-4 py-2 font-semibold text-right border-b border-[#e5e7eb]">Saldo Actual</th>
                      <th className="px-4 py-2 font-semibold text-right border-b border-[#e5e7eb]">Nuevo Saldo</th>
                      <th className="px-4 py-2 font-semibold text-right border-b border-[#e5e7eb]">Resumen de Impacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e7eb]">
                    <tr>
                      <td className="px-4 py-2 font-medium">Vacunas</td>
                      <td className="px-4 py-2 text-right tabular-nums text-[#4F6B7C] line-through opacity-70">{impacto.impactoVacunas.stockTotalActual.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-medium tabular-nums text-[#0F2A3B]">{impacto.impactoVacunas.stockTotalDespues.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-bold tabular-nums">
                        {(() => {
                           const delta = impacto.impactoVacunas.stockTotalDespues - impacto.impactoVacunas.stockTotalActual;
                           if (delta === 0) return <span className="text-[#4F6B7C]">0</span>;
                           return (
                             <span className={delta > 0 ? "text-[#0E9F8E]" : "text-rose-600"}>
                               {delta > 0 ? '+' : ''}{delta.toLocaleString()}
                             </span>
                           )
                        })()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">Jeringas</td>
                      <td className="px-4 py-2 text-right tabular-nums text-[#4F6B7C] line-through opacity-70">{impacto.impactoJeringas.stockTotalActual.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-medium tabular-nums text-[#0F2A3B]">{impacto.impactoJeringas.stockTotalDespues.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-bold tabular-nums">
                        {(() => {
                           const delta = impacto.impactoJeringas.stockTotalDespues - impacto.impactoJeringas.stockTotalActual;
                           if (delta === 0) return <span className="text-[#4F6B7C]">0</span>;
                           return (
                             <span className={delta > 0 ? "text-[#0E9F8E]" : "text-rose-600"}>
                               {delta > 0 ? '+' : ''}{delta.toLocaleString()}
                             </span>
                           )
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vales Impact Table */}
            {impacto.valesAfectados.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[0.7rem] font-bold uppercase tracking-wider text-[#4F6B7C]">Vales a re-emitir</p>
                <div className="overflow-hidden rounded-md border border-[#e5e7eb]">
                  <table className="w-full text-left text-sm text-[#0F2A3B]">
                    <thead className="bg-[#F1F5F7] font-mono text-[0.65rem] uppercase tracking-wider text-[#4F6B7C]">
                      <tr>
                        <th className="px-4 py-2 font-semibold border-b border-[#e5e7eb]">Nº de Vale</th>
                        <th className="px-4 py-2 font-semibold text-right border-b border-[#e5e7eb]">Salida (Antes)</th>
                        <th className="px-4 py-2 font-semibold text-right border-b border-[#e5e7eb]">Salida (Nuevo)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb]">
                      {impacto.valesAfectados.map(vale => (
                        <tr key={vale.id}>
                          <td className="px-4 py-2">
                            <span className="font-medium text-[#0F2A3B]">{vale.numero}</span>
                            <span className="ml-3 text-xs text-[#4F6B7C]">{new Date(vale.fechaGeneracion).toLocaleDateString('es-PE')}</span>
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-[#4F6B7C] line-through opacity-70">{vale.cantidadAnterior.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-medium tabular-nums text-[#0F2A3B]">{vale.cantidadNueva.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Bloque 4: Advertencias ── */}
          {impacto.advertencias.length > 0 && (
            <div className="space-y-2 pt-2">
              {impacto.advertencias.map((advertencia, index) => (
                <div
                  key={`${advertencia}-${index}`}
                  className="flex items-start gap-2 text-[#0F2A3B]"
                >
                  <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#0E9F8E]" weight="bold" />
                  <p className="text-sm">{advertencia}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Error / sin datos ── */
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
          <Warning className="h-8 w-8 text-[#4F6B7C]" weight="duotone" />
          <p className="text-sm text-[#4F6B7C]">No se pudo calcular el impacto.</p>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmacionModificacionModal;



