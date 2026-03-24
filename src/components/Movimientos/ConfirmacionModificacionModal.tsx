import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileText,
  Loader2,
  Package,
  Syringe,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
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

const ImpactSummaryCard: React.FC<{
  label: string;
  current: number;
  next: number;
  tone: 'teal' | 'cyan';
}> = ({ label, current, next, tone }) => {
  const diff = next - current;
  const className =
    tone === 'cyan'
      ? 'border-cyan-200 bg-cyan-50/70 text-cyan-900'
      : 'border-teal-200 bg-teal-50/70 text-teal-900';

  return (
    <div className={`rounded-[20px] border p-4 ${className}`}>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">Actual</p>
          <p className="text-lg font-semibold">{current.toLocaleString()}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400" />
        <div className="text-right">
          <p className="text-xs text-slate-500">Después</p>
          <p className="text-lg font-semibold">{next.toLocaleString()}</p>
        </div>
      </div>
      <p className={`mt-3 text-sm font-semibold ${diff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
        {diff >= 0 ? '+' : ''}
        {diff.toLocaleString()} unidades
      </p>
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
      title="Confirmar modificación"
      subtitle="La actualización afectará stock, kardex y vales ya generados."
      icon={AlertTriangle}
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing || isLoading}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing || isLoading || !impacto}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            <span>{isProcessing ? 'Procesando...' : 'Confirmar modificación'}</span>
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="inventory-loading-shell rounded-[22px] border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-200 bg-white text-teal-600 inventory-breathe">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Calculando impacto de la modificación</p>
              <p className="text-xs text-slate-500">Preparando el resumen de stock, vales y kardex.</p>
            </div>
          </div>
        </div>
      ) : impacto ? (
        <div className="space-y-5">
          <section
            className={`rounded-[22px] border p-4 ${
              esRestauracion ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'
            }`}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{impacto.resumen.establecimientoNombre}</p>
                <p className="mt-1 text-sm text-slate-500">{impacto.resumen.vacunaNombre}</p>
              </div>
              <div className="flex items-center gap-3 rounded-[18px] border border-white/70 bg-white/80 px-4 py-3">
                <div>
                  <p className="text-xs text-slate-500">Actual</p>
                  <p className="text-lg font-semibold text-slate-900">{impacto.resumen.cantidadActual.toLocaleString()}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Nuevo</p>
                  <p className="text-lg font-semibold text-slate-900">{impacto.resumen.cantidadNueva.toLocaleString()}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    impacto.resumen.diferencia >= 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {impacto.resumen.diferencia >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {impacto.resumen.diferencia > 0 ? '+' : ''}
                  {impacto.resumen.diferencia.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ImpactSummaryCard
              label="Stock de vacunas"
              current={impacto.impactoVacunas.stockTotalActual}
              next={impacto.impactoVacunas.stockTotalDespues}
              tone="teal"
            />
            <ImpactSummaryCard
              label="Stock de jeringas"
              current={impacto.impactoJeringas.stockTotalActual}
              next={impacto.impactoJeringas.stockTotalDespues}
              tone="cyan"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-teal-600" />
                <h3 className="text-sm font-semibold text-slate-900">Lotes de vacunas</h3>
              </div>
              <div className="mt-4 space-y-2">
                {impacto.impactoVacunas.lotesAfectados.length ? (
                  impacto.impactoVacunas.lotesAfectados.slice(0, 4).map((lote) => {
                    const diferencia = lote.cantidadDespues - lote.cantidadActual;
                    return (
                      <div key={lote.id} className="rounded-[18px] border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{lote.numero}</p>
                            <p className="text-xs text-slate-500">
                              {lote.cantidadActual.toLocaleString()} → {lote.cantidadDespues.toLocaleString()}
                            </p>
                          </div>
                          <span className={`text-sm font-semibold ${diferencia >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {diferencia > 0 ? '+' : ''}
                            {diferencia.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No se reportaron lotes afectados.</p>
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Syringe className="h-4 w-4 text-cyan-600" />
                <h3 className="text-sm font-semibold text-slate-900">Lotes de jeringas</h3>
              </div>
              <div className="mt-4 space-y-2">
                {impacto.impactoJeringas.lotesAfectados.length ? (
                  impacto.impactoJeringas.lotesAfectados.slice(0, 4).map((lote) => {
                    const diferencia = lote.cantidadDespues - lote.cantidadActual;
                    return (
                      <div key={lote.id} className="rounded-[18px] border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {lote.tipo} {lote.capacidad}
                            </p>
                            <p className="text-xs text-slate-500">
                              {lote.numero} · {lote.cantidadActual.toLocaleString()} → {lote.cantidadDespues.toLocaleString()}
                            </p>
                          </div>
                          <span className={`text-sm font-semibold ${diferencia >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {diferencia > 0 ? '+' : ''}
                            {diferencia.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No se reportaron lotes afectados.</p>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Kardex</h3>
              </div>
              <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {impacto.kardex.registrosNuevos} registro(s) de{' '}
                  <span className={impacto.kardex.tipoMovimiento === 'ingreso' ? 'text-emerald-700' : 'text-amber-700'}>
                    {impacto.kardex.tipoMovimiento === 'ingreso' ? 'ingreso' : 'salida'}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">Documento asociado: VALE_ENTREGA_AJUSTE</p>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Vales afectados</h3>
              </div>
              <div className="mt-4 space-y-2">
                {impacto.valesAfectados.length ? (
                  impacto.valesAfectados.map((vale) => (
                    <div key={vale.id} className="rounded-[18px] border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{vale.numero}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {vale.cantidadAnterior.toLocaleString()} → {vale.cantidadNueva.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No hay vales afectados para esta modificación.</p>
                )}
              </div>
            </div>
          </section>

          {impacto.advertencias.length ? (
            <section className="space-y-2">
              {impacto.advertencias.map((advertencia, index) => (
                <div key={`${advertencia}-${index}`} className="flex items-start gap-3 rounded-[18px] border border-amber-200 bg-amber-50/70 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">{advertencia}</p>
                </div>
              ))}
            </section>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800">No se pudo calcular el impacto</p>
          <p className="mt-1 text-sm text-slate-500">Intenta nuevamente antes de confirmar la modificación.</p>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmacionModificacionModal;
