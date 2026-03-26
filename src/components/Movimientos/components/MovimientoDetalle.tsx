import React, { memo } from 'react';
import {
  Heartbeat,
  Buildings,
  Calendar,
  Package,
  Syringe,
  TrendDown,
  TrendUp,
} from '@phosphor-icons/react';
import { Modal } from '../../Establecimientos/components';
import { MovimientoCalculado } from '../../../types';
import { MESES } from '../constants';

interface MovimientoDetalleProps {
  movimiento: MovimientoCalculado & { tieneMovimiento: boolean };
  selectedMes: number;
  selectedAnio: number;
  onClose: () => void;
}

const DetailCard: React.FC<{
  label: string;
  value: string;
  tone?: 'base' | 'alt' | 'alert' | 'slate';
}> = ({ label, value, tone = 'slate' }) => {
  const className =
    tone === 'base'
      ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
      : tone === 'alt'
      ? 'border-zinc-300 bg-zinc-50 text-zinc-900'
      : tone === 'alert'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-zinc-200 bg-white text-zinc-900 shadow-sm';

  return (
    <div className={`rounded-xl border px-4 py-3 ${className}`}>
      <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${tone === 'base' ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p>
      <p className={`mt-1 text-lg font-black tracking-tight ${tone === 'base' ? 'text-white' : 'text-zinc-900'}`}>{value}</p>
    </div>
  );
};

export const MovimientoDetalle: React.FC<MovimientoDetalleProps> = memo(({
  movimiento,
  selectedMes,
  selectedAnio,
  onClose,
}) => {
  const disponibilidadTone =
    movimiento.disponibilidad >= 2
      ? 'base'
      : movimiento.disponibilidad >= 1
      ? 'alt'
      : 'alert';

  const totalAdicionales =
    movimiento.entregasAdicionales?.reduce((acumulado, entrega) => acumulado + entrega.cantidad, 0) || 0;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Detalle del movimiento"
      subtitle={`${MESES[selectedMes - 1]} ${selectedAnio}`}
      icon={Package}
      size="lg"
      footer={
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-zinc-50 hover:border-zinc-300">
            Retornar
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Buildings className="h-4 w-4 text-zinc-900" weight="duotone" />
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Establecimiento</p>
            </div>
            <p className="mt-2 text-[0.95rem] font-black tracking-tight text-zinc-900">{movimiento.establecimiento.nombre}</p>
            <p className="mt-1 text-xs font-semibold text-zinc-500">{movimiento.establecimiento.codigo}</p>
          </div>

          <div className="rounded-xl border border-zinc-300 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-zinc-900" weight="duotone" />
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Vacuna</p>
            </div>
            <p className="mt-2 text-[0.95rem] font-black tracking-tight text-zinc-900">{movimiento.vacuna?.nombre || 'Sin vacuna'}</p>
            <span
              className={`mt-2 inline-flex rounded-md px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-widest ${
                movimiento.tieneMovimiento ? 'bg-zinc-900 text-white shadow-sm' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
              }`}
            >
              {movimiento.tieneMovimiento ? 'Registrado' : 'Pendiente'}
            </span>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
            <TrendUp className="h-4 w-4 text-zinc-900" weight="bold" />
            <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Flujo principal</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <DetailCard label="Saldo anterior" value={movimiento.saldoAnterior.toLocaleString()} />
            <DetailCard label="Trans. ingreso" value={movimiento.transIngreso.toLocaleString()} tone="alt" />
            <DetailCard label="Total saldo" value={movimiento.totalSaldo.toLocaleString()} tone="base" />
            <DetailCard label="Stock" value={movimiento.stock.toLocaleString()} tone="slate" />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
              <TrendDown className="h-4 w-4 text-rose-600" weight="bold" />
              <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-rose-900">Salidas</h3>
            </div>
            <div className="mt-3 space-y-2">
              <DetailCard label="Salida" value={movimiento.salida.toLocaleString()} />
              <DetailCard label="Trans. salida" value={movimiento.transSalida.toLocaleString()} />
              <DetailCard label="Saldo final" value={movimiento.saldo.toLocaleString()} tone="base" />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-300 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
              <Package className="h-4 w-4 text-zinc-900" weight="bold" />
              <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Entregas</h3>
            </div>
            <div className="mt-3 grid gap-2">
              <DetailCard label="Entrega base" value={movimiento.entrega.toLocaleString()} tone="base" />
              {totalAdicionales > 0 ? (
                <DetailCard label="Entregas adicionales" value={totalAdicionales.toLocaleString()} tone="alt" />
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <DetailCard label="Promedio consumo" value={movimiento.promedioConsumo.toLocaleString()} tone="slate" />
          <DetailCard label="Disponibilidad" value={`${movimiento.disponibilidad.toFixed(1)} meses`} tone={disponibilidadTone} />
          <div className="rounded-xl border border-zinc-300 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Período</p>
            </div>
            <p className="mt-1 text-lg font-black tracking-tight text-zinc-900">
              {MESES[selectedMes - 1]} {selectedAnio}
            </p>
          </div>
        </section>

        {movimiento.observaciones ? (
          <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Heartbeat className="h-4 w-4 text-zinc-500" weight="duotone" />
              <h3 className="text-[0.85rem] font-bold uppercase tracking-widest text-zinc-900">Observaciones</h3>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-700 border-l-2 border-zinc-300 pl-3">{movimiento.observaciones}</p>
          </section>
        ) : null}
      </div>
    </Modal>
  );
});

MovimientoDetalle.displayName = 'MovimientoDetalle';
