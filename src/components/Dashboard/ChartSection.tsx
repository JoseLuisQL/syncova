import React, { memo, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { TrendUp, Package } from '@phosphor-icons/react';
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
    <div className="h-[280px] bg-zinc-50 rounded-2xl border border-zinc-100/50" />
  </div>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string; payload?: { fill?: string } }>;
  label?: string;
}

/* ─── Tooltip NYT Style (Sobrio, Tabular, Data-Ink Ratio 1:1) ─── */
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-3 border border-zinc-200/50">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 border-b border-zinc-100 pb-1.5">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, i: number) => (
          <div key={i} className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[12px] font-semibold text-zinc-600">{entry.name}</span>
            </div>
            <span className="text-[13px] font-bold text-zinc-900 tabular-nums">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Pie Tooltip ─── */
const PieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const e = payload[0];
  return (
    <div className="bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-xl px-4 py-3 border border-zinc-800">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.payload?.fill || '#fff' }} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">{e.name}</span>
      </div>
      <p className="text-[15px] font-extrabold text-white tabular-nums">
        {e.value.toLocaleString()} <span className="text-[10px] font-medium text-zinc-500 Normal ml-0.5">UDS</span>
      </p>
    </div>
  );
};

/* ════════════════════════════════════════════
   Area Chart — Movimientos Mensuales (Tufte)
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
      <div className="bg-white rounded-[20px] border border-zinc-200/60 p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-300">
        {/* Header Analítico */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <TrendUp className="h-4 w-4 text-zinc-900" weight="bold" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight">Movimientos de red</h3>
              <p className="text-[12px] font-medium text-zinc-500 mt-0.5">Último semestre</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block leading-none mb-1">Entregas</span>
                <span className="text-[15px] font-extrabold text-zinc-900 tabular-nums">{totals.entregas.toLocaleString()}</span>
              </div>
              <span className="w-1 h-8 rounded-full bg-zinc-900" />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block leading-none mb-1">Recepciones</span>
                <span className="text-[15px] font-bold text-zinc-500 tabular-nums">{totals.recepciones.toLocaleString()}</span>
              </div>
              <span className="w-1 h-8 rounded-full bg-zinc-400" />
            </div>
          </div>
        </div>

        {/* Chart Lineal Puro (Sin Gridlines superfluas, ratio 1:1) */}
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AREA.entregas.stroke} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={AREA.entregas.stroke} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AREA.recepciones.stroke} stopOpacity={0.04} />
                  <stop offset="100%" stopColor={AREA.recepciones.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }} 
                tickLine={false} 
                axisLine={{ stroke: '#e4e4e7', strokeWidth: 1 }} 
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
                tickLine={false} 
                axisLine={false} 
                width={50}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d4d4d8', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone" dataKey="entregas" name="Entregas"
                stroke={AREA.entregas.stroke} strokeWidth={2.5} fill="url(#gEnt)"
                activeDot={{ r: 4, fill: '#fff', stroke: AREA.entregas.stroke, strokeWidth: 2 }}
              />
              <Area
                type="monotone" dataKey="recepciones" name="Recepciones"
                stroke={AREA.recepciones.stroke} strokeWidth={2} fill="url(#gRec)" strokeDasharray="4 4"
                activeDot={{ r: 4, fill: '#fff', stroke: AREA.recepciones.stroke, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);
AreaChartSection.displayName = 'AreaChartSection';

/* ════════════════════════════════════════════
   Donut Chart — Stock por Vacuna (ALL vaccines)
   ════════════════════════════════════════════ */
const DonutChartSection: React.FC<{ data: StockPorVacuna[]; isLoading?: boolean }> = memo(
  ({ data, isLoading }) => {
    const chartData = useMemo(() => {
      const sorted = [...data].sort((a,b) => b.stockTotal - a.stockTotal).filter(item => item.stockTotal > 0);
      return sorted.map((item, index) => ({
        ...item,
        fill: PALETA_ZINC[index % PALETA_ZINC.length], // Palette allocation
      }));
    }, [data]);

    const totalStock = useMemo(
      () => chartData.reduce((s, i) => s + i.stockTotal, 0),
      [chartData]
    );

    if (isLoading) return <ChartSkeleton />;

    if (chartData.length === 0) {
      return (
        <div className="bg-white rounded-[20px] border border-zinc-200/60 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-zinc-900" weight="bold" />
            </div>
            <h3 className="text-[15px] font-bold text-zinc-900">Stock por Biológico</h3>
          </div>
          <div className="h-[260px] flex items-center justify-center">
            <p className="text-zinc-400 text-sm font-medium">Data no disponible</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[20px] border border-zinc-200/60 p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
              <Package className="h-4 w-4 text-zinc-900" weight="bold" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight">Segmentación</h3>
              <p className="text-[12px] font-medium text-zinc-500 mt-0.5">Tipos de biológico</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[22px] font-extrabold text-zinc-900 tabular-nums leading-none block">
              {totalStock >= 1000 ? `${(totalStock / 1000).toFixed(1)}k` : totalStock.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1 block">Existencias</span>
          </div>
        </div>

        {/* Layout Visual: Data Tufte Style */}
        <div className="flex items-center gap-8 h-[260px]">
          {/* Donut Abstracto */}
          <div className="w-[180px] h-[180px] flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={88}
                  paddingAngle={2}
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
              <span className="text-[22px] font-extrabold text-zinc-900 leading-none tabular-nums">{chartData.length}</span>
            </div>
          </div>

          {/* Leyenda Tabular Discreta */}
          <div className="flex-1 h-full space-y-3 overflow-y-auto pr-3 custom-scrollbar py-2">
            {chartData.map((item, i) => {
              const pct = totalStock > 0 ? (item.stockTotal / totalStock) * 100 : 0;
              return (
                <div key={i} className="group relative">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="text-[12px] font-semibold text-zinc-700 truncate group-hover:text-zinc-900 transition-colors">
                        {item.vacunaNombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                      <span className="text-[12px] font-bold text-zinc-900 tabular-nums">
                        {item.stockTotal.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400 tabular-nums w-8 text-right">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  {/* Subtle bar visual in the background or below */}
                  <div className="w-full h-[2px] rounded-full bg-zinc-100 mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 opacity-80"
                      style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);
DonutChartSection.displayName = 'DonutChartSection';

const ChartSection: React.FC<ChartSectionProps> = memo(({
  movimientosMensuales,
  stockPorVacuna,
  isLoading = false,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <AreaChartSection data={movimientosMensuales} isLoading={isLoading} />
    <DonutChartSection data={stockPorVacuna} isLoading={isLoading} />
  </div>
));
ChartSection.displayName = 'ChartSection';

export default ChartSection;
