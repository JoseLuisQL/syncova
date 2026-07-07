import React, { memo, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import type { MovimientosMensuales } from '../../services/dashboardService';

interface ChartSectionProps {
  movimientosMensuales: MovimientosMensuales[];
  isLoading?: boolean;
}

const ChartSkeleton: React.FC = () => (
  <div className="flex h-full animate-pulse flex-col rounded-[18px] border border-[#e3e9f0] bg-white p-4 sm:p-5">
    <div className="mb-8 h-5 w-64 rounded bg-[#eef3f6]" />
    <div className="flex-1 rounded-[14px] bg-[#eef3f6]" />
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[14px] border border-[#e3e9f0] bg-white p-3 shadow-[0_12px_35px_-25px_rgba(15,42,59,0.5)]">
      <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-secondary">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-3 mb-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[12px] font-medium text-secondary">{entry.name}:</span>
          <span className="text-[13px] font-semibold text-primary">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const ChartSection: React.FC<ChartSectionProps> = memo(({ movimientosMensuales, isLoading }) => {
  const chartData = useMemo(() => {
    const m = new Date().getMonth();
    return movimientosMensuales.slice(Math.max(0, m - 5), m + 1);
  }, [movimientosMensuales]);

  if (isLoading) return <ChartSkeleton />;

  return (
    <section className="flex h-full flex-col rounded-[18px] border border-[#e3e9f0] bg-white p-4 shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)] sm:p-5">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff6d9] text-[12px]">☼</span>
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#171b22]">
              Patient overview
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#7a8797]">
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#0e9f8e]" /> Total pacientes</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#44c4dd]" /> Prom. hospitalizados</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#dfe4eb]" /> Atención ambulatoria</span>
          </div>
        </div>
        <select className="rounded-[12px] border border-[#e3e9f0] bg-white px-3 py-2 text-[12px] font-medium text-[#556575] outline-none focus:border-[#0e9f8e]">
          <option>Últimos 6 meses</option>
          <option>Mensual</option>
        </select>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#edf1f5" />
            <XAxis 
              dataKey="mes" 
              tick={{ fontSize: 11, fill: '#7a8797', fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9aa4b2', fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false} 
              width={40}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#dfe4eb' }} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="plainline"
              wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#7a8797', paddingBottom: '20px' }}
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
