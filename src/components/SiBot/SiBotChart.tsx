import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';

type ChartType = 'bar' | 'line' | 'pie';

interface ChartData {
  type: ChartType;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  title?: string;
  nameKey?: string;
  valueKey?: string;
}

interface SiBotChartProps {
  payload: string; // JSON string
}

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#06b6d4', '#e11d48'];

export const SiBotChart: React.FC<SiBotChartProps> = ({ payload }) => {
  let config: ChartData;
  try {
    config = JSON.parse(payload);
  } catch (e) {
    return <div className="text-red-500 text-sm">Error cargando gráfico</div>;
  }

  if (!config.data || !Array.isArray(config.data)) {
    return null;
  }

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl p-4 my-4 shadow-sm">
      {config.title && <h4 className="text-sm font-semibold text-zinc-800 mb-4 text-center">{config.title}</h4>}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {config.type === 'bar' ? (
            <BarChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis dataKey={config.xAxis || 'name'} tick={{ fontSize: 12, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey={config.yAxis || 'value'} fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : config.type === 'line' ? (
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
              <XAxis dataKey={config.xAxis || 'name'} tick={{ fontSize: 12, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#71717A' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey={config.yAxis || 'value'} stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
            </LineChart>
          ) : config.type === 'pie' ? (
            <PieChart>
              <Pie
                data={config.data}
                dataKey={config.valueKey || config.yAxis || 'value'}
                nameKey={config.nameKey || config.xAxis || 'name'}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {config.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              Tipo de gráfico no soportado
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

