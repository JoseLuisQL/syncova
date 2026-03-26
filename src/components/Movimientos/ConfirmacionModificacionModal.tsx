import React from 'react';
import {
  WarningCircle,
  Warning,
  ArrowRight,
  CheckCircle,
  FileText,
  CircleNotch,
  Package,
  Syringe,
  TrendDown,
  TrendUp,
  Receipt,
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

const ImpactSummaryCard: React.FC<{
  label: string;
  current: number;
  next: number;
  tone: 'base' | 'alt';
}> = ({ label, current, next, tone }) => {
  const diff = next - current;

  return (
    <div className={`rounded-[16px] border p-5 ${tone === 'alt' ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-200 shadow-sm'}`}>
      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-bold tracking-widest uppercase text-zinc-500 mb-1">Base</p>
          <p className="text-xl font-black tracking-tight text-zinc-900">{current.toLocaleString()}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-zinc-300" weight="bold" />
        <div className="text-right">
          <p className="text-[0.65rem] font-bold tracking-widest uppercase text-zinc-900 mb-1">Target</p>
          <p className="text-xl font-black tracking-tight text-zinc-900">{next.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-zinc-100 pt-3 flex justify-between items-center">
        <span className="text-xs font-semibold text-zinc-500">Delta</span>
        <span className={`text-[0.9rem] font-bold px-2 py-0.5 rounded-md border ${
          diff > 0 ? 'bg-zinc-900 text-white border-zinc-900' : diff < 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
        }`}>
          {diff > 0 ? '+' : ''}{diff.toLocaleString()} U
        </span>
      </div>
    </div>
  );
};

const ConfirmacionModificacionModal: React.FC<ConfirmacionModificacionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  impacto,
  isLoading = false,
  isProcessing = false,
}) => {
  const esRestauracion = impacto?.resumen?.diferencia ? impacto.resumen.diferencia < 0 : false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading && !isProcessing) onClose();
      }}
      title="Validación de Alteración"
      subtitle="La modificación impactará directamente en balance, kardex y facturas emitidas."
      icon={Warning}
      size="xl"
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
            {isProcessing ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <CheckCircle className="h-4 w-4" weight="bold" />}
            <span>{isProcessing ? 'Firmando Operación...' : 'Confirmar Alteración'}</span>
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="rounded-[16px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
          <CircleNotch className="h-8 w-8 text-zinc-900 animate-spin mb-4" weight="bold" />
          <p className="text-[0.95rem] font-bold text-zinc-900 tracking-tight">Simulando el impacto matricial...</p>
          <p className="mt-1 text-sm text-zinc-500">El motor de proyecciones está resolviendo el delta.</p>
        </div>
      ) : impacto ? (
        <div className="space-y-6">
          <section className={`rounded-[16px] border p-5 ${esRestauracion ? 'border-zinc-300 bg-zinc-50 shadow-sm' : 'border-zinc-900 bg-zinc-900 shadow-md'}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className={`text-[0.95rem] font-black tracking-tight ${esRestauracion ? 'text-zinc-900' : 'text-white'}`}>{impacto.resumen.establecimientoNombre}</p>
                <p className={`mt-1 text-sm font-medium ${esRestauracion ? 'text-zinc-500' : 'text-zinc-400'}`}>{impacto.resumen.vacunaNombre}</p>
              </div>
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${esRestauracion ? 'bg-white border-zinc-200' : 'bg-black/30 border-white/10'}`}>
                <div>
                  <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${esRestauracion ? 'text-zinc-400' : 'text-zinc-500'}`}>Estático</p>
                  <p className={`text-xl font-black tracking-tight ${esRestauracion ? 'text-zinc-900' : 'text-white'}`}>{impacto.resumen.cantidadActual.toLocaleString()}</p>
                </div>
                <ArrowRight className={`h-4 w-4 ${esRestauracion ? 'text-zinc-300' : 'text-zinc-600'}`} weight="bold" />
                <div>
                  <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${esRestauracion ? 'text-zinc-900' : 'text-zinc-300'}`}>Shift</p>
                  <p className={`text-xl font-black tracking-tight ${esRestauracion ? 'text-zinc-900' : 'text-white'}`}>{impacto.resumen.cantidadNueva.toLocaleString()}</p>
                </div>
                <div className="pl-3 ml-2 border-l border-white/10 flex items-center h-full">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-black tracking-widest ${
                    impacto.resumen.diferencia > 0 ? 'bg-zinc-800 text-white border-zinc-700' : impacto.resumen.diferencia < 0 ? 'bg-white text-zinc-900 border-zinc-200' : 'bg-transparent text-zinc-500 border-zinc-600'
                  }`}>
                    {impacto.resumen.diferencia > 0 ? <TrendUp className="h-3 w-3" weight="bold" /> : impacto.resumen.diferencia < 0 ? <TrendDown className="h-3 w-3" weight="bold" /> : null}
                    {impacto.resumen.diferencia > 0 ? '+' : ''}{impacto.resumen.diferencia.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <ImpactSummaryCard
              label="Impacto en Biológicos"
              current={impacto.impactoVacunas.stockTotalActual}
              next={impacto.impactoVacunas.stockTotalDespues}
              tone="base"
            />
            <ImpactSummaryCard
              label="Impacto en Insumos (Jeringas)"
              current={impacto.impactoJeringas.stockTotalActual}
              next={impacto.impactoJeringas.stockTotalDespues}
              tone="alt"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[16px] border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-5 border-b border-zinc-100 pb-3">
                <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <Package className="h-4 w-4 text-zinc-900" weight="duotone" />
                </div>
                <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Map de Lotes Affected</h3>
              </div>
              <div className="space-y-2">
                {impacto.impactoVacunas.lotesAfectados.length ? (
                  impacto.impactoVacunas.lotesAfectados.slice(0, 4).map((lote) => {
                    const diferencia = lote.cantidadDespues - lote.cantidadActual;
                    return (
                      <div key={lote.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-[0.85rem] font-bold tracking-tight text-zinc-900">{lote.numero}</p>
                          <p className="text-[0.7rem] font-medium text-zinc-500 mt-0.5 whitespace-nowrap">
                            <span className="line-through opacity-70">{lote.cantidadActual.toLocaleString()}</span> &rarr; <span className="font-bold text-zinc-800">{lote.cantidadDespues.toLocaleString()}</span>
                          </p>
                        </div>
                        <span className={`shrink-0 text-[0.8rem] font-black px-2 py-0.5 rounded-md border ${
                          diferencia > 0 ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 border-zinc-200'
                        }`}>
                          {diferencia > 0 ? '+' : ''}{diferencia.toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[0.8rem] font-medium text-zinc-400 py-2">Matriz vacía. Ningún lote será alterado.</p>
                )}
              </div>
            </div>

            <div className="rounded-[16px] border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-5 border-b border-zinc-100 pb-3">
                <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <Syringe className="h-4 w-4 text-zinc-900" weight="duotone" />
                </div>
                <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Insumos Secundarios</h3>
              </div>
              <div className="space-y-2">
                {impacto.impactoJeringas.lotesAfectados.length ? (
                  impacto.impactoJeringas.lotesAfectados.slice(0, 4).map((lote) => {
                    const diferencia = lote.cantidadDespues - lote.cantidadActual;
                    return (
                      <div key={lote.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-[0.85rem] font-bold tracking-tight text-zinc-900">
                            {lote.tipo} {lote.capacidad} | <span className="font-normal text-zinc-500">{lote.numero}</span>
                          </p>
                          <p className="text-[0.7rem] font-medium text-zinc-500 mt-0.5 whitespace-nowrap">
                            <span className="line-through opacity-70">{lote.cantidadActual.toLocaleString()}</span> &rarr; <span className="font-bold text-zinc-800">{lote.cantidadDespues.toLocaleString()}</span>
                          </p>
                        </div>
                        <span className={`shrink-0 text-[0.8rem] font-black px-2 py-0.5 rounded-md border ${
                          diferencia > 0 ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 border-zinc-200'
                        }`}>
                          {diferencia > 0 ? '+' : ''}{diferencia.toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[0.8rem] font-medium text-zinc-400 py-2">No requerirá auto-balance en insumos.</p>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-[16px] border border-zinc-200 bg-zinc-50 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-4 w-4 text-zinc-500" weight="duotone" />
                <h3 className="text-[0.75rem] font-bold uppercase tracking-widest text-zinc-900">Log de Kardex</h3>
              </div>
              <div className="rounded-xl bg-white border border-zinc-200 p-4">
                <p className="text-[0.95rem] font-bold tracking-tight text-zinc-900">
                  {impacto.kardex.registrosNuevos} traza(s) de tipo{' '}
                  <span className={`px-2 py-0.5 rounded-md border uppercase text-[0.65rem] tracking-wider ${impacto.kardex.tipoMovimiento === 'ingreso' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 text-zinc-600 border-zinc-300'}`}>
                    {impacto.kardex.tipoMovimiento === 'ingreso' ? 'In' : 'Out'}
                  </span>
                </p>
                <p className="mt-2 text-xs font-mono text-zinc-400 bg-zinc-50 p-2 rounded-lg border border-zinc-100">REF: VALE_ENTREGA_AJUSTE</p>
              </div>
            </div>

            <div className="rounded-[16px] border border-zinc-200 bg-zinc-50 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Receipt className="h-4 w-4 text-zinc-500" weight="duotone" />
                <h3 className="text-[0.75rem] font-bold uppercase tracking-widest text-zinc-900">Tickets Ligados</h3>
              </div>
              <div className="space-y-2">
                {impacto.valesAfectados.length ? (
                  impacto.valesAfectados.map((vale) => (
                    <div key={vale.id} className="rounded-xl bg-white border border-zinc-200 p-3 flex justify-between items-center">
                      <div>
                        <p className="text-[0.85rem] font-black tracking-tight text-zinc-900">{vale.numero}</p>
                        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
                          {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.85rem] font-bold text-zinc-900">
                          {vale.cantidadAnterior.toLocaleString()} <ArrowRight className="inline mx-1 h-3 w-3 text-zinc-400" /> {vale.cantidadNueva.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[0.8rem] font-medium text-zinc-400 py-3 bg-white rounded-xl border border-zinc-100 text-center">Desacoplado de vales.</p>
                )}
              </div>
            </div>
          </section>

          {impacto.advertencias.length ? (
            <section className="space-y-2 pt-2 border-t border-zinc-100">
              {impacto.advertencias.map((advertencia, index) => (
                <div key={`${advertencia}-${index}`} className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" weight="fill" />
                  <p className="text-[0.85rem] font-bold text-rose-900 tracking-tight">{advertencia}</p>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[16px] border border-zinc-200 bg-zinc-50 px-4 py-16 text-center">
          <Warning className="mb-4 h-10 w-10 text-zinc-300" weight="duotone" />
          <p className="text-[0.95rem] font-bold text-zinc-900 tracking-tight">Cálculo abortado</p>
          <p className="mt-1 text-sm text-zinc-500">Un error fatal privó a la UI de renderizar el impacto prospectivo.</p>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmacionModificacionModal;
