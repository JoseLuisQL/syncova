import React, { memo } from 'react';
import { Loader2, Package, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../Establecimientos/components';
import { INPUT_FIELD_STYLES } from '../constants';
import { MovimientoCalculado } from '../../../types';
import { ValeIndicator } from './ValeIndicator';

interface EntregasAdicionalesModalProps {
  movimiento: MovimientoCalculado & { tieneMovimiento: boolean };
  isProcessing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  tempEntregasValues: { [key: string]: number };
  pendingEntregasChanges: { [key: string]: boolean };
  getCurrentEntregaValue: (entregaId: string, originalValue: number) => number;
  hasPendingEntregaChange: (entregaId: string) => boolean;
  onClose: () => void;
  onAgregarEntrega: (establecimientoId: string) => void;
  onTempValueChange: (entregaId: string, value: number) => void;
  onBlur: (entregaId: string) => void;
  onEliminarEntrega: (entregaId: string) => void;
}

const SummaryMetric: React.FC<{
  label: string;
  value: string;
  tone?: 'teal' | 'amber' | 'emerald';
}> = ({ label, value, tone = 'teal' }) => {
  const className =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : 'border-teal-200 bg-teal-50 text-teal-900';

  return (
    <div className={`rounded-[18px] border px-4 py-3 ${className}`}>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
};

export const EntregasAdicionalesModal: React.FC<EntregasAdicionalesModalProps> = memo(({
  movimiento,
  isProcessing,
  isCreating,
  isUpdating,
  getCurrentEntregaValue,
  hasPendingEntregaChange,
  onClose,
  onAgregarEntrega,
  onTempValueChange,
  onBlur,
  onEliminarEntrega,
}) => {
  const entregaBase = movimiento.entregasAdicionales?.length
    ? movimiento.entregaBase ?? movimiento.entrega
    : movimiento.entrega;
  const totalAdicionales =
    movimiento.entregasAdicionales?.reduce(
      (acumulado, entrega) => acumulado + getCurrentEntregaValue(entrega.id, entrega.cantidad),
      0,
    ) || 0;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Entregas adicionales"
      subtitle={movimiento.establecimiento.nombre}
      icon={Package}
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button type="button" onClick={onClose} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => onAgregarEntrega(movimiento.establecimientoId)}
            disabled={isCreating || isUpdating || isProcessing}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Agregar entrega</span>
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-900">{movimiento.establecimiento.nombre}</p>
          <p className="mt-1 text-sm text-slate-500">{movimiento.establecimiento.codigo}</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <SummaryMetric label="Entrega base" value={entregaBase.toLocaleString()} tone="emerald" />
          <SummaryMetric label="Adicionales" value={totalAdicionales.toLocaleString()} tone="amber" />
          <SummaryMetric label="Total general" value={movimiento.entrega.toLocaleString()} tone="teal" />
        </section>

        <section className="space-y-3 rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Detalle editable</h3>
              <p className="mt-1 text-sm text-slate-500">
                Ajusta cantidades existentes con validación inmediata y conserva el control por vale.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {movimiento.entregasAdicionales?.length || 0} registros
            </span>
          </div>

          {movimiento.entregasAdicionales?.length ? (
            <div className="space-y-3">
              {movimiento.entregasAdicionales.map((entrega) => (
                <div
                  key={entrega.id}
                  className={`rounded-[20px] border px-4 py-3 ${
                    entrega.tieneValeGenerado
                      ? 'border-emerald-200 bg-emerald-50/70'
                      : 'border-slate-200 bg-slate-50/70'
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">Entrega #{entrega.numeroEntrega}</p>
                        <ValeIndicator tieneVale={Boolean(entrega.tieneValeGenerado)} valeNumero={entrega.valeNumero} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(entrega.fechaEntrega).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {entrega.motivo ? <p className="mt-2 text-sm text-slate-600">{entrega.motivo}</p> : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={getCurrentEntregaValue(entrega.id, entrega.cantidad)}
                          onChange={(event) => onTempValueChange(entrega.id, parseInt(event.target.value, 10) || 0)}
                          onBlur={() => onBlur(entrega.id)}
                          disabled={isCreating || isUpdating || isProcessing}
                          className={`w-24 rounded-xl border px-3 py-2 text-center text-sm font-semibold tabular-nums transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                            entrega.tieneValeGenerado
                              ? 'border-emerald-300 bg-white text-emerald-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                              : hasPendingEntregaChange(entrega.id)
                              ? INPUT_FIELD_STYLES.entregaAdicional.pending
                              : `${INPUT_FIELD_STYLES.entregaAdicional.normal} ${INPUT_FIELD_STYLES.entregaAdicional.focus}`
                          }`}
                        />
                        {hasPendingEntregaChange(entrega.id) && !entrega.tieneValeGenerado ? (
                          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-amber-400 animate-pulse" />
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => onEliminarEntrega(entrega.id)}
                        disabled={isCreating || isUpdating || isProcessing}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
                          entrega.tieneValeGenerado
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                        title="Eliminar entrega adicional"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-300">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No hay entregas adicionales</p>
              <p className="mt-1 text-sm text-slate-500">Agrega una entrega para habilitar la edición detallada.</p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
});

EntregasAdicionalesModal.displayName = 'EntregasAdicionalesModal';
