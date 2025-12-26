import React, { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { CHART_COLORS } from './constants';
import type { MovimientosMensuales, StockPorVacuna } from '../../services/dashboardService';

interface ChartSectionProps {
  movimientosMensuales: MovimientosMensuales[];
  stockPorVacuna: StockPorVacuna[];
  isLoading?: boolean;
}

const ChartSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-[280px] bg-gray-100 rounded-lg" />
  </div>
);

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
      <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const BarChartSection: React.FC<{ data: MovimientosMensuales[]; isLoading?: boolean }> = memo(
  ({ data, isLoading }) => {
    const chartData = useMemo(() => {
      const currentMonth = new Date().getMonth();
      return data.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    }, [data]);

    if (isLoading) return <ChartSkeleton />;

    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-teal-600" aria-hidden="true" />
            Movimientos Mensuales
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
              Entregas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.success }} />
              Recepciones
            </span>
          </div>
        </div>
        
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="entregas" 
                name="Entregas"
                fill={CHART_COLORS.primary} 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="recepciones" 
                name="Recepciones"
                fill={CHART_COLORS.success} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

BarChartSection.displayName = 'BarChartSection';

const PieChartSection: React.FC<{ data: StockPorVacuna[]; isLoading?: boolean }> = memo(
  ({ data, isLoading }) => {
    const chartData = useMemo(() => {
      return data
        .filter(item => item.stockTotal > 0)
        .slice(0, 6)
        .map((item, index) => ({
          ...item,
          color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length],
        }));
    }, [data]);

    if (isLoading) return <ChartSkeleton />;

    if (chartData.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-teal-600" aria-hidden="true" />
            Stock por Vacuna
          </h3>
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-gray-500 text-sm">Sin datos de stock disponibles</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <PieChartIcon className="h-5 w-5 text-teal-600" aria-hidden="true" />
          Stock por Vacuna
        </h3>
        
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="stockTotal"
                nameKey="vacunaNombre"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [value.toLocaleString(), name]}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

PieChartSection.displayName = 'PieChartSection';

const ChartSection: React.FC<ChartSectionProps> = memo(({
  movimientosMensuales,
  stockPorVacuna,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <BarChartSection data={movimientosMensuales} isLoading={isLoading} />
      <PieChartSection data={stockPorVacuna} isLoading={isLoading} />
    </div>
  );
});

ChartSection.displayName = 'ChartSection';

export default ChartSection;
