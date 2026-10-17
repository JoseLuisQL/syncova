import React, { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ArrowRight } from '@phosphor-icons/react';
import type { MovimientosMensuales } from '../../services/dashboardService';
import { useChartTheme } from '../../hooks/useChartTheme';

interface ChartSectionProps {
  movimientosMensuales: MovimientosMensuales[];
  isLoading?: boolean;
}

type PeriodFilter = '3m' | '6m' | '12m';

const PERIOD_OPTIONS: Array<{ id: PeriodFilter; label: string; months: number }> = [
  { id: '3m', label: '3 meses', months: 3 },
  { id: '6m', label: '6 meses', months: 6 },
  { id: '12m', label: '12 meses', months: 12 },
];

export const ChartSkeleton: React.FC = () => (
  <div className="flex h-full min-h-[360px] flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-xs" role="status" aria-live="polite">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5">
        <div className="inventory-skeleton h-4 w-48 rounded-md" />
        <div className="inventory-skeleton h-3 w-64 rounded-md opacity-75" />
      </div>
      <div className="inventory-skeleton h-7 w-36 rounded-lg" />
    </div>
    <div className="my-3 grid grid-cols-3 gap-2.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-line-soft bg-surface-soft/50 p-2.5 space-y-1.5">
          <div className="inventory-skeleton h-2.5 w-16 rounded-full" />
          <div className="inventory-skeleton h-4 w-24 rounded-md" />
        </div>
      ))}
    </div>
    <div className="flex flex-1 items-end gap-3 pt-2">
      {[45, 70, 55, 85, 62, 90].map((h, idx) => (
        <div key={idx} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div className="inventory-skeleton w-full rounded-t-md opacity-80" style={{ height: `${h}%` }} />
          <div className="inventory-skeleton h-2.5 w-8 rounded-full opacity-65" />
        </div>
      ))}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface p-3 shadow-md">
      <p className="mb-1.5 font-mono text-xs font-semibold text-muted-2">
        Mes: {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-semibold text-ink tabular-nums">
              {Number(entry.value || 0).toLocaleString('es-PE')} dosis
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartSection: React.FC<ChartSectionProps> = memo(({ movimientosMensuales, isLoading }) => {
  const chartTheme = useChartTheme();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodFilter>('6m');

  const chartData = useMemo(() => {
    if (!movimientosMensuales.length) return [];
    const currentMonthIndex = new Date().getMonth(); // 0..11
    const availableUpToNow =
      movimientosMensuales.length > currentMonthIndex + 1
        ? movimientosMensuales.slice(0, currentMonthIndex + 1)
        : movimientosMensuales;

    const monthsCount = PERIOD_OPTIONS.find((o) => o.id === period)?.months ?? 6;
    if (period === '12m') {
      return movimientosMensuales;
    }
    return availableUpToNow.slice(Math.max(0, availableUpToNow.length - monthsCount));
  }, [movimientosMensuales, period]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, item) => ({
        entregas: acc.entregas + (item.entregas || 0),
        recepciones: acc.recepciones + (item.recepciones || 0),
      }),
      { entregas: 0, recepciones: 0 }
    );
  }, [chartData]);

  if (isLoading) return <ChartSkeleton />;

  return (
    <section className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-xs">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-ink">
            Flujo mensual de biológicos
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 text-muted-2">
              <span className="h-2 w-2 rounded-full bg-[#0e9f8e]" aria-hidden="true" />
              Entregas:
              <strong className="font-mono font-semibold text-ink tabular-nums">
                {totals.entregas.toLocaleString('es-PE')}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 text-muted-2">
              <span className="h-2 w-2 rounded-full bg-[#0284c7]" aria-hidden="true" />
              Salidas / Aplicadas:
              <strong className="font-mono font-semibold text-ink tabular-nums">
                {totals.recepciones.toLocaleString('es-PE')}
              </strong>
            </span>
          </div>
        </div>

        <div
          className="inline-flex items-center gap-1 self-start rounded-lg border border-line bg-surface-soft p-0.5"
          role="group"
          aria-label="Periodo de movimientos"
        >
          {PERIOD_OPTIONS.map((option) => {
            const active = period === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPeriod(option.id)}
                className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-surface text-ink shadow-2xs'
                    : 'text-muted-2 hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[250px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="entregasFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0e9f8e" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#0e9f8e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="salidasFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: chartTheme.tickColor, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 11, fill: chartTheme.tickColor, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartTheme.cursorColor }} />
            <Area
              type="monotone"
              dataKey="entregas"
              name="Dosis entregadas"
              stroke="#0e9f8e"
              strokeWidth={2}
              fill="url(#entregasFill)"
              activeDot={{ r: 4, fill: '#fff', stroke: '#0e9f8e', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="recepciones"
              name="Dosis salidas / aplicadas"
              stroke="#0284c7"
              strokeWidth={2}
              fill="url(#salidasFill)"
              strokeDasharray="4 4"
              activeDot={{ r: 4, fill: '#fff', stroke: '#0284c7', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3 text-xs text-muted">
        <span>Datos consolidados de movimientos registrados</span>
        <button
          type="button"
          onClick={() => navigate('/movimientos')}
          className="inline-flex items-center gap-1 font-medium text-brand transition-colors hover:text-brand-600 whitespace-nowrap shrink-0"
        >
          Ir a Movimientos
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </section>
  );
});

ChartSection.displayName = 'ChartSection';
export default ChartSection;
