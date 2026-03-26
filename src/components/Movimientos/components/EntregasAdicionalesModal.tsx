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
      ? 'border-zinc-300 bg-zinc-50 text-zinc-900'
      : tone === 'base'
      ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
      : 'border-zinc-200 bg-white text-zinc-800 shadow-sm';

  return (
    <div className={`rounded-2xl border px-5 py-4 ${className}`}>
      <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${tone === 'base' ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p>
      <p className={`mt-2 text-2xl font-black tracking-tight ${tone === 'base' ? 'text-white' : 'text-zinc-900'}`}>{value}</p>
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
      title="Inyecciones Múltiples"
      subtitle="Detalle de split allocations y entregas fraccionadas para el hub seleccionado."
      icon={Package}
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.secondary}>
            Retornar
          </button>
          <button
            type="button"
            onClick={() => onAgregarEntrega(movimiento.establecimientoId)}
            disabled={isCreating || isUpdating || isProcessing}
            className={COMPONENT_STYLES.button.primary}
          >
            {isProcessing ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <Plus className="h-4 w-4" weight="bold" />}
            <span>Nueva Inyección</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white border border-zinc-200 rounded-xl shadow-sm">
              <Package className="h-5 w-5 text-zinc-900" weight="duotone" />
            </div>
            <div>
              <p className="text-[0.95rem] font-black tracking-tight text-zinc-900">{movimiento.establecimiento.nombre}</p>
              <p className="text-[0.7rem] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{movimiento.establecimiento.codigo}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryMetric label="Core Allocation" value={entregaBase.toLocaleString()} tone="neutral" />
          <SummaryMetric label="Split (Adicional)" value={totalAdicionales.toLocaleString()} tone="alt" />
          <SummaryMetric label="Gross Total" value={movimiento.entrega.toLocaleString()} tone="base" />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5 border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Bitácora Lineal</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Punteros directos a la matriz. Tienen control independiente por ticket.
              </p>
            </div>
            <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-[0.7rem] font-black tracking-widest text-white uppercase">
              {movimiento.entregasAdicionales?.length || 0} Traces
            </span>
          </div>

          {movimiento.entregasAdicionales?.length ? (
            <div className="space-y-3">
              {movimiento.entregasAdicionales.map((entrega) => (
                <div
                  key={entrega.id}
                  className={`rounded-2xl border px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between transition-colors ${
                    entrega.tieneValeGenerado
                      ? 'border-zinc-300 bg-zinc-50/50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[0.85rem] font-black text-zinc-900 tracking-tight">Segmento #{entrega.numeroEntrega}</span>
                      <ValeIndicator tieneVale={Boolean(entrega.tieneValeGenerado)} valeNumero={entrega.valeNumero} />
                    </div>
                    <div className="mt-2 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">
                      SYS_TIMESTAMP: {new Date(entrega.fechaEntrega).toLocaleDateString('en-CA')}
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
                        className={`w-28 rounded-xl border px-3 py-2.5 text-center text-[0.95rem] font-black tabular-nums transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${
                          entrega.tieneValeGenerado
                            ? 'border-zinc-200 bg-zinc-100 text-zinc-700 cursor-not-allowed shadow-inner'
                            : hasPendingEntregaChange(entrega.id)
                            ? 'border-zinc-900 bg-zinc-50 text-zinc-900 focus:ring-zinc-900'
                            : 'border-zinc-300 bg-white text-zinc-900 focus:border-zinc-900 focus:ring-zinc-900/30 shadow-sm'
                        }`}
                      />
                      {hasPendingEntregaChange(entrega.id) && !entrega.tieneValeGenerado ? (
                        <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-white bg-zinc-900 animate-pulse" />
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-4 py-12 text-center">
              <Package className="mb-4 h-8 w-8 text-zinc-300" weight="duotone" />
              <p className="text-[0.95rem] font-bold text-zinc-900 tracking-tight">Memoria fragmentada limpia</p>
              <p className="mt-1 text-sm text-zinc-500">Agrega una inyección adicional para segmentar la entrega base.</p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
});

EntregasAdicionalesModal.displayName = 'EntregasAdicionalesModal';
