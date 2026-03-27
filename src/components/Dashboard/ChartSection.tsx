import React, { memo, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { TrendUp, Package } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import type { MovimientosMensuales, StockPorVacuna } from '../../services/dashboardService';

interface ChartSectionProps {
  movimientosMensuales: MovimientosMensuales[];
  stockPorVacuna: StockPorVacuna[];
  isLoading?: boolean;
}

/* ─── Paletas SEMÁNTICAS (Tufte/Data-Viz 2025) ─── */
const PALETA_ZINC = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'];
const AREA = {
  entregas:   { stroke: '#09090b', grad: 'rgba(9,9,11,' },    // zinc-950
  recepciones:{ stroke: '#71717a', grad: 'rgba(113,113,122,' }, // zinc-500
};

/* ─── Esqueletos ─── */
const ChartSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-zinc-100" />
      <div className="h-4 w-40 bg-zinc-100 rounded-lg" />
    </div>
    <div className="h-[280px] bg-zinc-50 rounded-[20px] border border-zinc-100/50" />
  </div>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string; payload?: { fill?: string } }>;
  label?: string;
}

/* ─── Tooltip Premium ─── */
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/90 backdrop-blur-xl rounded-[16px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] px-5 py-4 border border-zinc-200/60"
    >
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-100/50 pb-2">{label}</p>
      <div className="space-y-2.5">
        {payload.map((entry, i: number) => (
          <div key={i} className="flex items-center justify-between gap-10">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[13px] font-bold text-zinc-700">{entry.name}</span>
            </div>
            <span className="text-[14px] font-extrabold text-zinc-950 tabular-nums">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ─── Pie Tooltip ─── */
const PieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const e = payload[0];
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950/90 backdrop-blur-xl rounded-[16px] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] px-5 py-4 border border-zinc-800"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.payload?.fill || '#fff' }} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{e.name}</span>
      </div>
      <p className="text-[18px] font-extrabold text-white tabular-nums tracking-tight">
        {e.value.toLocaleString()} <span className="text-[11px] font-medium text-zinc-500 Normal ml-1">UDS</span>
      </p>
    </motion.div>
  );
};

/* ════════════════════════════════════════════
   Area Chart — Salidas vs Recepciones
   ════════════════════════════════════════════ */
const AreaChartSection: React.FC<{ data: MovimientosMensuales[]; isLoading?: boolean }> = memo(
  ({ data, isLoading }) => {
    const chartData = useMemo(() => {
      const m = new Date().getMonth();
      return data.slice(Math.max(0, m - 5), m + 1);
    }, [data]);

    const totals = useMemo(() =>
      chartData.reduce(
        (a, d) => ({ entregas: a.entregas + d.entregas, recepciones: a.recepciones + d.recepciones }),
        { entregas: 0, recepciones: 0 }
      ), [chartData]);

    if (isLoading) return <ChartSkeleton />;

    return (
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white rounded-[24px] border border-zinc-200/60 p-7 shadow-sm hover:shadow-[0_20px_40px_-15px_rgb(0,0,0,0.05)] transition-all duration-500"
      >
        {/* Header Analítico */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center border border-zinc-200/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
              <TrendUp className="h-5 w-5 text-zinc-900" weight="bold" />
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-zinc-950 tracking-tight">Salidas vs Recepciones</h3>
              <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Historial semestral de la zona</p>
            </div>
          </div>
          <div className="flex items-center gap-6 hidden sm:flex">
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block leading-none mb-1.5">Salidas (Entregas)</span>
                <span className="text-[16px] font-extrabold text-zinc-900 tabular-nums">{totals.entregas.toLocaleString()}</span>
              </div>
              <span className="w-1.5 h-8 rounded-full bg-zinc-900" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block leading-none mb-1.5">Recepciones</span>
                <span className="text-[16px] font-bold text-zinc-500 tabular-nums">{totals.recepciones.toLocaleString()}</span>
              </div>
              <span className="w-1.5 h-8 rounded-full bg-zinc-400" />
            </div>
          </div>
        </div>

        {/* Chart Lineal Puro */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AREA.entregas.stroke} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={AREA.entregas.stroke} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AREA.recepciones.stroke} stopOpacity={0.06} />
                  <stop offset="100%" stopColor={AREA.recepciones.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 11, fill: '#71717a', fontWeight: 700 }} 
                tickLine={false} 
                axisLine={{ stroke: '#e4e4e7', strokeWidth: 1.5 }} 
                dy={15}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 600 }} 
                tickLine={false} 
                axisLine={false} 
                width={50}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d4d4d8', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
              <Area
                type="monotone" dataKey="entregas" name="Salidas"
                stroke={AREA.entregas.stroke} strokeWidth={3} fill="url(#gEnt)"
                activeDot={{ r: 5, fill: '#fff', stroke: AREA.entregas.stroke, strokeWidth: 2.5 }}
              />
              <Area
                type="monotone" dataKey="recepciones" name="Recepciones"
                stroke={AREA.recepciones.stroke} strokeWidth={2.5} fill="url(#gRec)" strokeDasharray="5 5"
                activeDot={{ r: 5, fill: '#fff', stroke: AREA.recepciones.stroke, strokeWidth: 2.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  }
);
AreaChartSection.displayName = 'AreaChartSection';

/* ════════════════════════════════════════════
   Donut Chart — Disponibilidad de Vacunas
   ════════════════════════════════════════════ */
const DonutChartSection: React.FC<{ data: StockPorVacuna[]; isLoading?: boolean }> = memo(
  ({ data, isLoading }) => {
    const chartData = useMemo(() => {
      const sorted = [...data].sort((a,b) => b.stockTotal - a.stockTotal).filter(item => item.stockTotal > 0);
      return sorted.map((item, index) => ({
        ...item,
        fill: PALETA_ZINC[index % PALETA_ZINC.length],
      }));
    }, [data]);

    const totalStock = useMemo(
      () => chartData.reduce((s, i) => s + i.stockTotal, 0),
      [chartData]
    );

    if (isLoading) return <ChartSkeleton />;

    if (chartData.length === 0) {
      return (
        <div className="bg-white rounded-[24px] border border-zinc-200/60 p-7 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-[16px] bg-zinc-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-zinc-900" weight="bold" />
            </div>
            <h3 className="text-[16px] font-extrabold text-zinc-950">Disponibilidad de Vacunas</h3>
          </div>
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-zinc-400 text-[13px] font-bold">Data no disponible</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white rounded-[24px] border border-zinc-200/60 p-7 shadow-sm hover:shadow-[0_20px_40px_-15px_rgb(0,0,0,0.05)] transition-all duration-500"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center border border-zinc-200/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
              <Package className="h-5 w-5 text-zinc-900" weight="bold" />
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-zinc-950 tracking-tight">Disponibilidad Actual</h3>
              <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Vacunas en stock en la zona</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[24px] font-extrabold text-zinc-950 tabular-nums leading-none block">
              {totalStock >= 1000 ? `${(totalStock / 1000).toFixed(1)}k` : totalStock.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1 block">Existencias Tot</span>
          </div>
        </div>

        {/* Layout Visual */}
        <div className="flex items-center gap-8 h-[280px]">
          {/* Donut */}
          <div className="w-[190px] h-[190px] flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={70} outerRadius={95}
                  paddingAngle={3}
                  dataKey="stockTotal" nameKey="vacunaNombre"
                  stroke="none"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={`c-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[26px] font-extrabold text-zinc-950 leading-none tabular-nums tracking-tight">{chartData.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Tipos</span>
            </div>
          </div>

          {/* Leyenda Tabular */}
          <div className="flex-1 h-full space-y-4 overflow-y-auto pr-2 custom-scrollbar py-2">
            {chartData.map((item, i) => {
              const pct = totalStock > 0 ? (item.stockTotal / totalStock) * 100 : 0;
              return (
                <div key={i} className="group relative">
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.fill }} />
                      <span className="text-[13px] font-bold text-zinc-600 truncate group-hover:text-zinc-950 transition-colors">
                        {item.vacunaNombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 pl-2">
                      <span className="text-[13px] font-extrabold text-zinc-900 tabular-nums">
                        {item.stockTotal.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-400 tabular-nums w-8 text-right bg-zinc-50 py-0.5 rounded">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-[3px] rounded-full bg-zinc-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, 1)}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                      className="h-full rounded-full opacity-90"
                      style={{ backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }
);
DonutChartSection.displayName = 'DonutChartSection';

const ChartSection: React.FC<ChartSectionProps> = memo(({
  movimientosMensuales,
  stockPorVacuna,
  isLoading = false,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <AreaChartSection data={movimientosMensuales} isLoading={isLoading} />
    <DonutChartSection data={stockPorVacuna} isLoading={isLoading} />
  </div>
));
ChartSection.displayName = 'ChartSection';

export default ChartSection;
