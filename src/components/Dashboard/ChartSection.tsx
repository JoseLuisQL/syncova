import React, { memo, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { Info } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import type { MovimientosMensuales } from '../../services/dashboardService';

interface ChartSectionProps {
  movimientosMensuales: MovimientosMensuales[];
  isLoading?: boolean;
}

const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-md border border-zinc-200 p-6 shadow-sm h-full animate-pulse flex flex-col">
    <div className="h-6 w-64 bg-zinc-100 rounded mb-8" />
    <div className="flex-1 bg-zinc-50 rounded" />
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-md shadow-lg border border-zinc-200 p-3">
      <p className="text-[12px] font-bold text-zinc-500 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-3 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[12px] font-semibold text-zinc-700">{entry.name}:</span>
          <span className="text-[13px] font-bold text-zinc-900">{entry.value.toLocaleString()}</span>
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
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white rounded-md border border-zinc-200 p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-extrabold text-zinc-900 tracking-tight">Distribución de dosis: entregadas vs. aplicadas</h3>
          <Info size={16} className="text-zinc-400" />
        </div>
        <select className="text-[12px] font-semibold text-zinc-600 bg-transparent border-none cursor-pointer outline-none">
          <option>Acumulado</option>
          <option>Mensual</option>
        </select>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis 
              dataKey="mes" 
              tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
              tickLine={false} 
              axisLine={false} 
              width={40}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7' }} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="plainline"
              wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#52525b', paddingBottom: '20px' }}
            />
            <Area
              type="monotone" dataKey="entregas" name="Dosis entregadas"
              stroke="#0f9fa8" strokeWidth={2.5} fill="transparent"
              activeDot={{ r: 4, fill: '#fff', stroke: '#0f9fa8', strokeWidth: 2 }}
            />
            <Area
              type="monotone" dataKey="recepciones" name="Dosis aplicadas"
              stroke="#14b8a6" strokeWidth={2.5} fill="transparent" strokeDasharray="5 5"
              activeDot={{ r: 4, fill: '#fff', stroke: '#14b8a6', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

ChartSection.displayName = 'ChartSection';
export default ChartSection;
