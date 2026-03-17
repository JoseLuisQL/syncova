import React, { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Package } from 'lucide-react';
import { CHART_COLORS, CHART_GRADIENT_COLORS } from './constants';
import type { MovimientosMensuales, StockPorVacuna } from '../../services/dashboardService';

interface ChartSectionProps {
  movimientosMensuales: MovimientosMensuales[];
  stockPorVacuna: StockPorVacuna[];
  isLoading?: boolean;
}

/* ─── Area chart color pair (teal & cyan — system brand) ─── */
const AREA = {
  entregas:   { stroke: '#0D9488', grad: 'rgba(13,148,136,' },   // teal-600
  recepciones:{ stroke: '#0891B2', grad: 'rgba(8,145,178,' },    // cyan-600
};

/* ─── Skeletons ─── */
const ChartSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-50" />
      <div className="h-4 w-40 bg-gray-100 rounded-lg" />
    </div>
    <div className="h-[280px] bg-gray-50 rounded-2xl" />
  </div>
);

/* ─── Dark Tooltip ─── */
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl px-4 py-3 border border-white/10">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[13px] text-gray-300">{entry.name}</span>
            </div>
            <span className="text-[13px] font-semibold text-white tabular-nums">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Pie Tooltip ─── */
const PieTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const e = payload[0];
  return (
    <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl px-4 py-3 border border-white/10">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.payload.color }} />
        <span className="text-[13px] font-medium text-gray-200">{e.name}</span>
      </div>
      <p className="text-lg font-bold text-white tabular-nums">
        {e.value.toLocaleString()} <span className="text-xs font-normal text-gray-400">uds</span>
      </p>
    </div>
  );
};

/* ════════════════════════════════════════════
   Area Chart — Movimientos Mensuales
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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-teal-50 transition-all duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">Movimientos Mensuales</h3>
              <p className="text-xs text-gray-400 mt-0.5">Últimos meses</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-teal-600" />
              <div className="text-right">
                <span className="text-xs text-gray-400 block leading-none">Entregas</span>
                <span className="text-sm font-semibold text-gray-700 tabular-nums">{totals.entregas.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-cyan-600" />
              <div className="text-right">
                <span className="text-xs text-gray-400 block leading-none">Recepciones</span>
                <span className="text-sm font-semibold text-gray-700 tabular-nums">{totals.recepciones.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AREA.entregas.stroke} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={AREA.entregas.stroke} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AREA.recepciones.stroke} stopOpacity={0.14} />
                  <stop offset="95%" stopColor={AREA.recepciones.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={45}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="entregas" name="Entregas"
                stroke={AREA.entregas.stroke} strokeWidth={2.5} fill="url(#gEnt)"
                dot={false} activeDot={{ r: 5, fill: AREA.entregas.stroke, stroke: '#fff', strokeWidth: 2.5 }}
              />
              <Area
                type="monotone" dataKey="recepciones" name="Recepciones"
                stroke={AREA.recepciones.stroke} strokeWidth={2.5} fill="url(#gRec)"
                dot={false} activeDot={{ r: 5, fill: AREA.recepciones.stroke, stroke: '#fff', strokeWidth: 2.5 }}
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
    // Show ALL vaccines with stock > 0 (no arbitrary limit)
    const chartData = useMemo(() => {
      return data
        .filter(item => item.stockTotal > 0)
        .map((item, index) => ({
          ...item,
          color: CHART_GRADIENT_COLORS[index % CHART_GRADIENT_COLORS.length].main,
        }));
    }, [data]);

    const totalStock = useMemo(
      () => chartData.reduce((s, i) => s + i.stockTotal, 0),
      [chartData]
    );

    if (isLoading) return <ChartSkeleton />;

    if (chartData.length === 0) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Package className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-[15px] font-semibold text-gray-900">Stock por Vacuna</h3>
          </div>
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-gray-400 text-sm">Sin datos de stock disponibles</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-teal-50 transition-all duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Package className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">Stock por Vacuna</h3>
              <p className="text-xs text-gray-400 mt-0.5">Distribución actual</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900 tabular-nums">
              {totalStock >= 1000 ? `${(totalStock / 1000).toFixed(1)}k` : totalStock.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 block">unidades totales</span>
          </div>
        </div>

        {/* Chart + Legend */}
        <div className="flex items-start gap-5">
          {/* Donut */}
          <div className="w-[180px] h-[180px] flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={82}
                  paddingAngle={3}
                  dataKey="stockTotal" nameKey="vacunaNombre"
                  cornerRadius={4} stroke="none"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={`c-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-gray-900 leading-none tabular-nums">{chartData.length}</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">vacunas</span>
            </div>
          </div>

          {/* Legend — progress bars */}
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[240px] pr-1">
            {chartData.map((item, i) => {
              const pct = totalStock > 0 ? (item.stockTotal / totalStock) * 100 : 0;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[12px] font-medium text-gray-600 truncate max-w-[150px]">
                      {item.vacunaNombre}
                    </span>
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      <span className="text-[11px] text-gray-400 tabular-nums">{pct.toFixed(0)}%</span>
                      <span className="text-[12px] font-semibold text-gray-700 tabular-nums">
                        {item.stockTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-[5px] rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 group-hover:brightness-110"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: CHART_GRADIENT_COLORS[i % CHART_GRADIENT_COLORS.length].main,
                      }}
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

/* ─── Wrapper ─── */
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
