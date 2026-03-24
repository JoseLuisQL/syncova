import React, { memo } from 'react';
import {
  Activity,
  Building2,
  Calendar,
  Package,
  Syringe,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
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
  tone?: 'teal' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
}> = ({ label, value, tone = 'slate' }) => {
  const className =
    tone === 'teal'
      ? 'border-teal-200 bg-teal-50 text-teal-900'
      : tone === 'cyan'
      ? 'border-cyan-200 bg-cyan-50 text-cyan-900'
      : tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : tone === 'rose'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-slate-200 bg-slate-50 text-slate-900';

  return (
    <div className={`rounded-[18px] border px-4 py-3 ${className}`}>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-none">{value}</p>
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
      ? 'emerald'
      : movimiento.disponibilidad >= 1
      ? 'amber'
      : 'rose';

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
          <button type="button" onClick={onClose} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Cerrar
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-600" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Establecimiento</p>
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">{movimiento.establecimiento.nombre}</p>
            <p className="mt-1 text-sm text-slate-500">{movimiento.establecimiento.codigo}</p>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-cyan-600" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Vacuna</p>
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">{movimiento.vacuna?.nombre || 'Sin vacuna'}</p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                movimiento.tieneMovimiento ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {movimiento.tieneMovimiento ? 'Registrado' : 'Pendiente'}
            </span>
          </div>
        </section>

        <section className="space-y-3 rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-800">Flujo principal</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <DetailCard label="Saldo anterior" value={movimiento.saldoAnterior.toLocaleString()} />
            <DetailCard label="Trans. ingreso" value={movimiento.transIngreso.toLocaleString()} tone="teal" />
            <DetailCard label="Total saldo" value={movimiento.totalSaldo.toLocaleString()} tone="teal" />
            <DetailCard label="Stock" value={movimiento.stock.toLocaleString()} tone="cyan" />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-800">Salidas</h3>
            </div>
            <div className="mt-4 space-y-2">
              <DetailCard label="Salida" value={movimiento.salida.toLocaleString()} />
              <DetailCard label="Trans. salida" value={movimiento.transSalida.toLocaleString()} />
              <DetailCard label="Saldo final" value={movimiento.saldo.toLocaleString()} tone="emerald" />
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-800">Entregas</h3>
            </div>
            <div className="mt-4 grid gap-2">
              <DetailCard label="Entrega base" value={movimiento.entrega.toLocaleString()} tone="emerald" />
              {totalAdicionales > 0 ? (
                <DetailCard label="Entregas adicionales" value={totalAdicionales.toLocaleString()} tone="amber" />
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <DetailCard label="Promedio consumo" value={movimiento.promedioConsumo.toLocaleString()} tone="slate" />
          <DetailCard label="Disponibilidad" value={`${movimiento.disponibilidad.toFixed(1)} meses`} tone={disponibilidadTone} />
          <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Período</p>
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {MESES[selectedMes - 1]} {selectedAnio}
            </p>
          </div>
        </section>

        {movimiento.observaciones ? (
          <section className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">Observaciones</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{movimiento.observaciones}</p>
          </section>
        ) : null}
      </div>
    </Modal>
  );
});

MovimientoDetalle.displayName = 'MovimientoDetalle';
