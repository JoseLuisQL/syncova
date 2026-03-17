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
    <div className="h-[300px] bg-gray-100 rounded-xl" />
  </div>
);

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3.5">
      <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
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
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50">
              <BarChart3 className="h-4 w-4 text-teal-600" aria-hidden="true" />
            </div>
            Movimientos Mensuales
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
              Entregas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS.success }} />
              Recepciones
            </span>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="entregas" 
                name="Entregas"
                fill={CHART_COLORS.primary} 
                radius={[6, 6, 0, 0]} 
              />
              <Bar 
                dataKey="recepciones" 
                name="Recepciones"
                fill={CHART_COLORS.success} 
                radius={[6, 6, 0, 0]} 
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
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2.5 mb-5">
            <div className="p-1.5 rounded-lg bg-teal-50">
              <PieChartIcon className="h-4 w-4 text-teal-600" aria-hidden="true" />
            </div>
            Stock por Vacuna
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-400 text-sm">Sin datos de stock disponibles</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2.5 mb-5">
          <div className="p-1.5 rounded-lg bg-teal-50">
            <PieChartIcon className="h-4 w-4 text-teal-600" aria-hidden="true" />
          </div>
          Stock por Vacuna
        </h3>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
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
                formatter={(value) => <span className="text-xs text-gray-500">{value}</span>}
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BarChartSection data={movimientosMensuales} isLoading={isLoading} />
      <PieChartSection data={stockPorVacuna} isLoading={isLoading} />
    </div>
  );
});

ChartSection.displayName = 'ChartSection';

export default ChartSection;
