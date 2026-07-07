import React, { memo } from 'react';
import { CircleNotch, Package, Plus, Trash } from '@phosphor-icons/react';
import { Modal } from '../../Establecimientos/components';
import { COMPONENT_STYLES } from '../constants';
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
  tone?: 'base' | 'alt' | 'neutral';
}> = ({ label, value, tone = 'base' }) => {
  const className =
    tone === 'alt'
      ? 'border-line-focus bg-[#f3f0ff] text-brand'
      : tone === 'base'
      ? 'border-brand-100 bg-surface-soft text-brand'
      : 'border-line bg-white text-zinc-800';

  return (
    <div className={`rounded-xl border px-5 py-4 ${className}`}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${tone === 'base' ? 'text-brand' : 'text-zinc-900'}`}>{value}</p>
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
      subtitle="Detalle de entregas fraccionadas para el establecimiento seleccionado."
      icon={Package}
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.secondary}>
            Volver
          </button>
          <button
            type="button"
            onClick={() => onAgregarEntrega(movimiento.establecimientoId)}
            disabled={isCreating || isUpdating || isProcessing}
            className={COMPONENT_STYLES.button.primary}
          >
            {isProcessing ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <Plus className="h-4 w-4" weight="bold" />}
            <span>Nueva entrega</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-line bg-surface-soft p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-[12px] border border-line bg-white p-3">
              <Package className="h-5 w-5 text-zinc-900" weight="duotone" />
            </div>
            <div>
              <p className="text-[0.95rem] font-semibold tracking-tight text-zinc-900">{movimiento.establecimiento.nombre}</p>
              <p className="text-[0.7rem] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{movimiento.establecimiento.codigo}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryMetric label="Entrega base" value={entregaBase.toLocaleString()} tone="neutral" />
          <SummaryMetric label="Adicionales" value={totalAdicionales.toLocaleString()} tone="alt" />
          <SummaryMetric label="Total" value={movimiento.entrega.toLocaleString()} tone="base" />
        </section>

        <section className="rounded-xl border border-line bg-white p-5">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-line-soft pb-4">
            <div>
              <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Entregas registradas</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Cada entrega adicional se controla de forma independiente.
              </p>
            </div>
            <span className="rounded-md border border-line bg-surface-soft px-2.5 py-1 text-[0.7rem] font-semibold tracking-widest text-muted-2 uppercase">
              {movimiento.entregasAdicionales?.length || 0} registros
            </span>
          </div>

          {movimiento.entregasAdicionales?.length ? (
            <div className="space-y-3">
              {movimiento.entregasAdicionales.map((entrega) => (
                <div
                  key={entrega.id}
                  className={`flex flex-col gap-4 rounded-xl border px-5 py-4 transition-colors lg:flex-row lg:items-center lg:justify-between ${
                    entrega.tieneValeGenerado
                      ? 'border-zinc-300 bg-zinc-50/50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[0.85rem] font-semibold text-zinc-900 tracking-tight">Entrega #{entrega.numeroEntrega}</span>
                      <ValeIndicator tieneVale={Boolean(entrega.tieneValeGenerado)} valeNumero={entrega.valeNumero} />
                    </div>
                    <div className="mt-2 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">
                      Fecha: {new Date(entrega.fechaEntrega).toLocaleDateString('es-PE')}
                    </div>
                    {entrega.motivo ? (
                      <div className="mt-2 text-xs font-medium text-zinc-600 border-l-2 border-zinc-200 pl-2">
                        {entrega.motivo}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={getCurrentEntregaValue(entrega.id, entrega.cantidad)}
                        onChange={(event) => onTempValueChange(entrega.id, parseInt(event.target.value, 10) || 0)}
                        onBlur={() => onBlur(entrega.id)}
                        disabled={isCreating || isUpdating || isProcessing}
                        className={`w-28 rounded-lg border px-3 py-2.5 text-center text-[0.95rem] font-semibold tabular-nums transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${
                          entrega.tieneValeGenerado
                            ? 'border-zinc-200 bg-zinc-100 text-zinc-700 cursor-not-allowed shadow-inner'
                            : hasPendingEntregaChange(entrega.id)
                            ? 'border-brand-100 bg-surface-soft text-brand focus:ring-brand/20'
                            : 'border-line bg-white text-zinc-900 focus:border-line-focus-strong focus:ring-line-focus/70'
                        }`}
                      />
                      {hasPendingEntregaChange(entrega.id) && !entrega.tieneValeGenerado ? (
                        <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand animate-pulse" />
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => onEliminarEntrega(entrega.id)}
                      disabled={isCreating || isUpdating || isProcessing}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all shadow-sm ${
                        entrega.tieneValeGenerado
                          ? 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          : 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      title={entrega.tieneValeGenerado ? 'No se puede purgar un segmento acoplado financieramente' : 'Purgar segmento'}
                    >
                      {isProcessing ? <CircleNotch className="h-5 w-5 animate-spin" /> : <Trash className="h-4 w-4" weight={entrega.tieneValeGenerado ? 'regular' : 'bold'} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-soft px-4 py-12 text-center">
              <Package className="mb-4 h-8 w-8 text-zinc-300" weight="duotone" />
              <p className="text-[0.95rem] font-bold text-zinc-900 tracking-tight">Sin entregas adicionales</p>
              <p className="mt-1 text-sm text-zinc-500">Agrega una entrega adicional para completar la distribución.</p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
});

EntregasAdicionalesModal.displayName = 'EntregasAdicionalesModal';
