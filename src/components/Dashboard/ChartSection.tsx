import React, { memo, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import type { MovimientosMensuales } from '../../services/dashboardService';
import { useChartTheme } from '../../hooks/useChartTheme';

interface ChartSectionProps {
  movimientosMensuales: MovimientosMensuales[];
  isLoading?: boolean;
}

const ChartSkeleton: React.FC = () => (
  <div className="flex h-full animate-pulse flex-col rounded-3xl border border-line bg-surface p-4 sm:p-5">
    <div className="mb-8 h-5 w-64 rounded bg-surface-soft" />
    <div className="flex-1 rounded-xl bg-surface-soft" />
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-lg">
      <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-3 mb-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm font-medium text-muted-2">{entry.name}:</span>
          <span className="text-base font-semibold text-ink">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const ChartSection: React.FC<ChartSectionProps> = memo(({ movimientosMensuales, isLoading }) => {
  const chartTheme = useChartTheme();
  const chartData = useMemo(() => {
    const m = new Date().getMonth();
    return movimientosMensuales.slice(Math.max(0, m - 5), m + 1);
  }, [movimientosMensuales]);

  if (isLoading) return <ChartSkeleton />;

  return (
    <section className="flex h-full flex-col rounded-3xl border border-line bg-surface p-4 shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)] sm:p-5">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-tint text-brand text-sm">☼</span>
            <h3 className="text-md font-semibold tracking-[-0.02em] text-ink">
              Resumen de movimientos
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-2">
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#0e9f8e]" /> Total entregado</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#44c4dd]" /> Prom. mensual</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#7c3aed]" /> Planificado</span>
          </div>
        </div>
        <select className="rounded-[12px] border border-line bg-surface px-3 py-2 text-sm font-medium text-muted-2 outline-none focus:border-brand">
          <option>Últimos 6 meses</option>
          <option>Mensual</option>
        </select>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chartTheme.gridColor} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fill: chartTheme.tickColor, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: chartTheme.tickColor, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartTheme.cursorColor }} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="plainline"
              wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: chartTheme.subtextColor, paddingBottom: '20px' }}
            />
            <Area
              type="monotone" dataKey="entregas" name="Dosis entregadas"
              stroke="#44c4dd" strokeWidth={2.5} fill="transparent"
              activeDot={{ r: 4, fill: '#fff', stroke: '#44c4dd', strokeWidth: 2 }}
            />
            <Area
              type="monotone" dataKey="recepciones" name="Dosis aplicadas"
              stroke="#0e9f8e" strokeWidth={2.5} fill="transparent" strokeDasharray="5 5"
              activeDot={{ r: 4, fill: '#fff', stroke: '#0e9f8e', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
});

ChartSection.displayName = 'ChartSection';
export default ChartSection;
