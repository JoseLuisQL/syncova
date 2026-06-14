import React from 'react';
import { motion, useReducedMotion, type MotionProps } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';

type ChartType = 'bar' | 'line' | 'pie';

interface ChartConfig {
  type?: ChartType;
  title?: string;
  data: Array<Record<string, unknown>>;
  xKey?: string;
  yKey?: string;
  color?: string;
  lines?: { key: string; color: string; label: string }[];
  nameKey?: string;
  valueKey?: string;
}

interface SiBotChartProps {
  payload: string;
  type?: ChartType | string;
  isStreaming?: boolean;
}

interface AxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value?: unknown;
  };
  maxChars?: number;
}

const COLORS = ['#7c3aed', '#606571', '#8b8f9b', '#a78bfa', '#15171d', '#c4c7d0', '#6d28d9'];
const numberFormatter = new Intl.NumberFormat('es-PE');
const compactNumberFormatter = new Intl.NumberFormat('es-PE', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return numberFormatter.format(value);
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return '-';
}

function formatAxisValue(value: unknown): string {
  if (typeof value === 'number') {
    return compactNumberFormatter.format(value);
  }

  return formatValue(value);
}

function chunkWord(word: string, maxChars: number): string[] {
  const chunks: string[] = [];

  for (let index = 0; index < word.length; index += maxChars) {
    chunks.push(word.slice(index, index + maxChars));
  }

  return chunks;
}

function wrapLabel(value: unknown, maxChars: number, maxLines = 2): string[] {
  const label = formatValue(value);

  if (label.length <= maxChars) {
    return [label];
  }

  const words = label.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const segments = word.length > maxChars ? chunkWord(word, maxChars) : [word];

    for (const segment of segments) {
      const candidate = currentLine ? `${currentLine} ${segment}` : segment;

      if (candidate.length <= maxChars) {
        currentLine = candidate;
        continue;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = segment;

      if (lines.length === maxLines - 1) {
        break;
      }
    }

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines.slice(0, maxLines).map((line, index, allLines) => {
    if (index === allLines.length - 1 && line.length > maxChars - 1) {
      return `${line.slice(0, maxChars - 1)}…`;
    }

    return line;
  });
}

function AxisTick({ x = 0, y = 0, payload, maxChars = 10 }: AxisTickProps) {
  const lines = wrapLabel(payload?.value, maxChars, 2);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill="#71717a"
        fontSize={11}
        fontWeight={500}
      >
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={0} dy={index === 0 ? 16 : 13}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function ChartLoadingState() {
  const shouldReduceMotion = useReducedMotion();

  const bars = [0, 1, 2, 3];

  return (
    <motion.section
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="my-3 w-full rounded-[14px] border border-[#e7e7ef] bg-white"
    >
      <div className="px-4 py-4">
        <div className="rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd] px-4 py-5">
          <div className="mb-4 space-y-3">
            {[0, 1, 2, 3].map((line) => (
              <div key={line} className="h-px w-full bg-[linear-gradient(90deg,rgba(228,228,231,0),rgba(228,228,231,1),rgba(228,228,231,0))]" />
            ))}
          </div>

          <div className="flex h-[180px] items-end justify-between gap-3">
            {bars.map((bar, index) => (
              <div key={bar} className="flex flex-1 flex-col items-center justify-end gap-3">
                <motion.div
                  className="w-full max-w-[34px] rounded-b-[4px] rounded-t-[10px] bg-[#c8bbff]"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : { height: [42, 108, 72, 94, 42], opacity: [0.45, 0.9, 0.65, 0.82, 0.45] }
                  }
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : {
                          duration: 1.6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.12,
                        }
                  }
                  style={{ height: 72 }}
                />
                <motion.div
                  className="h-2 rounded-full bg-[#e7e7ef]"
                  animate={shouldReduceMotion ? undefined : { width: [18, 26, 18], opacity: [0.5, 0.9, 0.5] }}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : {
                          duration: 1.6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.12,
                        }
                  }
                  style={{ width: 22 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export const SiBotChart: React.FC<SiBotChartProps> = ({ payload, type: propType, isStreaming = false }) => {
  const shouldReduceMotion = useReducedMotion();

  if (isStreaming) {
    return <ChartLoadingState />;
  }

  let config: ChartConfig;
  try {
    config = JSON.parse(payload);
  } catch {
    return (
      <div className="my-4 rounded-[14px] border border-[#e7e7ef] bg-[#fbfafd] px-4 py-3 text-[12px] font-medium text-[#606571]">
        No se pudo completar la visualización del gráfico.
      </div>
    );
  }

  if (!Array.isArray(config.data) || config.data.length === 0) {
    return null;
  }

  const resolvedChartType = (propType || config.type || 'bar') as ChartType;
  const dataPoints = config.data.length;
  const xTickChars = dataPoints > 10 ? 8 : 11;
  const scrollWidth = resolvedChartType === 'pie'
    ? 320
    : Math.max(420, dataPoints * (resolvedChartType === 'bar' ? 88 : 84));
  const plotHeight = resolvedChartType === 'pie' ? 300 : 292;
  const cardMotion: MotionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
      };

  const plotMotion: MotionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.985 },
        animate: { opacity: 1, scale: 1 },
        transition: { delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      };

  const tooltipProps = {
    contentStyle: {
      borderRadius: '14px',
      border: '1px solid #e7e7ef',
      boxShadow: 'none',
      padding: '10px 12px',
      fontSize: '12px',
      fontWeight: 600,
      color: '#18181b',
      backgroundColor: 'rgba(255,255,255,0.98)',
    },
    labelStyle: {
      color: '#18181b',
      fontWeight: 700,
      marginBottom: '6px',
    },
    itemStyle: {
      color: '#3f3f46',
      padding: 0,
    },
    formatter: (value: unknown, name: unknown) => [
      formatValue(value),
      typeof name === 'string' ? name : 'Valor',
    ],
  };

  const renderChart = () => {
    switch (resolvedChartType) {
      case 'bar': {
        const barXKey = config.xKey || 'name';
        const barYKey = config.yKey || 'value';

        return (
          <BarChart data={config.data} margin={{ top: 12, right: 12, left: 6, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey={barXKey}
              interval={0}
              height={58}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
              tick={<AxisTick maxChars={xTickChars} />}
            />
            <YAxis
              width={52}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#71717a', fontWeight: 500 }}
              tickFormatter={(value) => formatAxisValue(value)}
            />
            <Tooltip
              {...tooltipProps}
              labelFormatter={(label) => formatValue(label)}
      cursor={{ fill: 'rgba(124,58,237,0.06)' }}
            />
            <Bar
              dataKey={barYKey}
              name={config.title || 'Valor'}
              fill={config.color || '#7c3aed'}
              radius={[8, 8, 2, 2]}
              maxBarSize={34}
              animationDuration={shouldReduceMotion ? 0 : 620}
              animationBegin={shouldReduceMotion ? 0 : 120}
              animationEasing="ease-out"
            />
          </BarChart>
        );
      }

      case 'line': {
        const lineXKey = config.xKey || 'name';

        return (
          <LineChart data={config.data} margin={{ top: 18, right: 12, left: 6, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 5" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey={lineXKey}
              interval={0}
              height={58}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
              tick={<AxisTick maxChars={xTickChars} />}
            />
            <YAxis
              width={52}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#71717a', fontWeight: 500 }}
              tickFormatter={(value) => formatAxisValue(value)}
            />
            <Tooltip
              {...tooltipProps}
              labelFormatter={(label) => formatValue(label)}
            />
            {config.lines && config.lines.length > 1 ? (
              <Legend
                verticalAlign="top"
                align="left"
                wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingBottom: '8px' }}
                iconType="circle"
                iconSize={6}
              />
            ) : null}
            {config.lines ? (
              config.lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  dot={{ r: 2.5, fill: line.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 4, stroke: '#ffffff', strokeWidth: 2 }}
                  connectNulls
                  animationDuration={shouldReduceMotion ? 0 : 700}
                  animationBegin={shouldReduceMotion ? 0 : 120}
                  animationEasing="ease-out"
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={config.yKey || 'value'}
                name={config.title || 'Valor'}
                stroke={config.color || '#7c3aed'}
                strokeWidth={2.5}
                strokeLinecap="round"
                dot={{ r: 2.5, fill: config.color || '#7c3aed', stroke: '#ffffff', strokeWidth: 1.5 }}
                activeDot={{ r: 4, stroke: '#ffffff', strokeWidth: 2 }}
                connectNulls
                animationDuration={shouldReduceMotion ? 0 : 700}
                animationBegin={shouldReduceMotion ? 0 : 120}
                animationEasing="ease-out"
              />
            )}
          </LineChart>
        );
      }

      case 'pie': {
        const pieValueKey = config.valueKey || 'value';
        const pieNameKey = config.nameKey || 'name';

        return (
          <PieChart margin={{ top: 4, right: 8, left: 8, bottom: 16 }}>
            <Pie
              data={config.data}
              dataKey={pieValueKey}
              nameKey={pieNameKey}
              cx="50%"
              cy="45%"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
              animationDuration={shouldReduceMotion ? 0 : 620}
              animationBegin={shouldReduceMotion ? 0 : 120}
              animationEasing="ease-out"
            >
              {config.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              {...tooltipProps}
              labelFormatter={(label) => formatValue(label)}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingTop: '12px' }}
              iconType="circle"
              iconSize={6}
            />
          </PieChart>
        );
      }

      default:
        return (
          <div className="flex h-full items-center justify-center text-[12px] font-medium text-zinc-500">
            Tipo de gráfico no soportado
          </div>
        );
    }
  };

  return (
    <motion.section
      {...cardMotion}
      className="my-3 w-full rounded-[14px] border border-[#e7e7ef] bg-white"
    >
      <div className="bg-white py-3">
        <div className="overflow-x-auto overflow-y-hidden px-4 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-200">
          <motion.div
            {...plotMotion}
            style={{
              width: resolvedChartType === 'pie' ? '100%' : `${scrollWidth}px`,
              minWidth: `${scrollWidth}px`,
              height: `${plotHeight}px`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
