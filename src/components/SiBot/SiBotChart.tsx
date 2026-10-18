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
import { useChartTheme } from '../../hooks/useChartTheme';

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
  fillColor?: string;
}

const COLORS = ['#7c3aed', '#0e9f8e', '#8b5cf6', '#3b82f6', '#f59e0b', '#64748b', '#ec4899'];
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

function AxisTick({ x = 0, y = 0, payload, maxChars = 10, fillColor = '#71717a' }: AxisTickProps) {
  const lines = wrapLabel(payload?.value, maxChars, 2);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill={fillColor}
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
      className="my-3 w-full rounded-xl border border-line bg-surface"
    >
      <div className="px-4 py-4">
        <div className="rounded-lg border border-line bg-surface-soft px-4 py-5">
          <div className="flex h-[160px] items-end justify-between gap-3">
            {bars.map((bar, index) => (
              <div key={bar} className="flex flex-1 flex-col items-center justify-end gap-3">
                <motion.div
                  className="w-full max-w-[32px] rounded-t-md bg-brand/30"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : { height: [40, 100, 68, 88, 40], opacity: [0.45, 0.85, 0.6, 0.8, 0.45] }
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
                  style={{ height: 68 }}
                />
                <div className="h-2 w-6 rounded-full bg-line" />
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
  const chartTheme = useChartTheme();
  const [overrideType, setOverrideType] = React.useState<ChartType | null>(null);

  if (isStreaming) {
    return <ChartLoadingState />;
  }

  let config: ChartConfig;
  try {
    config = JSON.parse(payload);
  } catch {
    return (
      <div className="my-3 rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-xs font-medium text-muted-2">
        No se pudo completar la visualización del gráfico.
      </div>
    );
  }

  if (!Array.isArray(config.data) || config.data.length === 0) {
    return null;
  }

  const initialChartType = (propType || config.type || 'bar') as ChartType;
  const resolvedChartType = overrideType || initialChartType;
  const dataPoints = config.data.length;
  const xTickChars = dataPoints > 10 ? 8 : 11;
  const scrollWidth =
    resolvedChartType === 'pie'
      ? 300
      : Math.max(340, dataPoints * (resolvedChartType === 'bar' ? 76 : 72));
  const plotHeight = resolvedChartType === 'pie' ? 270 : 260;

  const cardMotion: MotionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      };

  const tooltipProps = {
    contentStyle: {
      borderRadius: '10px',
      border: `1px solid ${chartTheme.tooltipBorder}`,
      boxShadow: 'none',
      padding: '8px 10px',
      fontSize: '12px',
      fontWeight: 600,
      color: chartTheme.tooltipText,
      backgroundColor: chartTheme.tooltipBg,
    },
    labelStyle: {
      color: chartTheme.tooltipText,
      fontWeight: 700,
      marginBottom: '4px',
    },
    itemStyle: {
      color: chartTheme.subtextColor,
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
          <BarChart data={config.data} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 5" vertical={false} stroke={chartTheme.gridColor} />
            <XAxis
              dataKey={barXKey}
              interval={0}
              height={54}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              tick={<AxisTick maxChars={xTickChars} fillColor={chartTheme.tickColor} />}
            />
            <YAxis
              width={48}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chartTheme.tickColor, fontWeight: 500 }}
              tickFormatter={(value) => formatAxisValue(value)}
            />
            <Tooltip
              {...tooltipProps}
              labelFormatter={(label) => formatValue(label)}
              cursor={{ fill: chartTheme.isDark ? 'rgba(139,92,246,0.12)' : 'rgba(124,58,237,0.06)' }}
            />
            <Bar
              dataKey={barYKey}
              name={config.title || 'Valor'}
              fill={config.color || '#7c3aed'}
              radius={[6, 6, 2, 2]}
              maxBarSize={32}
              animationDuration={shouldReduceMotion ? 0 : 500}
              animationEasing="ease-out"
            />
          </BarChart>
        );
      }

      case 'line': {
        const lineXKey = config.xKey || 'name';

        return (
          <LineChart data={config.data} margin={{ top: 16, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 5" vertical={false} stroke={chartTheme.gridColor} />
            <XAxis
              dataKey={lineXKey}
              interval={0}
              height={54}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              tick={<AxisTick maxChars={xTickChars} fillColor={chartTheme.tickColor} />}
            />
            <YAxis
              width={48}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: chartTheme.tickColor, fontWeight: 500 }}
              tickFormatter={(value) => formatAxisValue(value)}
            />
            <Tooltip {...tooltipProps} labelFormatter={(label) => formatValue(label)} />
            {config.lines && config.lines.length > 1 ? (
              <Legend
                verticalAlign="top"
                align="left"
                wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingBottom: '8px', color: chartTheme.tickColor }}
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
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  dot={{ r: 2.5, fill: line.color, stroke: chartTheme.tooltipBg, strokeWidth: 1.5 }}
                  activeDot={{ r: 4, stroke: chartTheme.tooltipBg, strokeWidth: 2 }}
                  connectNulls
                  animationDuration={shouldReduceMotion ? 0 : 550}
                  animationEasing="ease-out"
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={config.yKey || 'value'}
                name={config.title || 'Valor'}
                stroke={config.color || '#7c3aed'}
                strokeWidth={2.25}
                strokeLinecap="round"
                dot={{ r: 2.5, fill: config.color || '#7c3aed', stroke: chartTheme.tooltipBg, strokeWidth: 1.5 }}
                activeDot={{ r: 4, stroke: chartTheme.tooltipBg, strokeWidth: 2 }}
                connectNulls
                animationDuration={shouldReduceMotion ? 0 : 550}
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
          <PieChart margin={{ top: 4, right: 8, left: 8, bottom: 12 }}>
            <Pie
              data={config.data}
              dataKey={pieValueKey}
              nameKey={pieNameKey}
              cx="50%"
              cy="45%"
              innerRadius={52}
              outerRadius={82}
              paddingAngle={2}
              stroke={chartTheme.tooltipBg}
              strokeWidth={2}
              animationDuration={shouldReduceMotion ? 0 : 500}
              animationEasing="ease-out"
            >
              {config.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipProps} labelFormatter={(label) => formatValue(label)} />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingTop: '8px', color: chartTheme.tickColor }}
              iconType="circle"
              iconSize={6}
            />
          </PieChart>
        );
      }

      default:
        return (
          <div className="flex h-full items-center justify-center text-xs font-medium text-muted">
            Tipo de gráfico no soportado
          </div>
        );
    }
  };

  return (
    <motion.section
      {...cardMotion}
      className="my-3.5 w-full overflow-hidden rounded-xl bg-surface-soft/50 font-sans"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5 text-[11.5px] font-medium text-muted-2">
          <span className="truncate font-semibold text-ink">
            {config.title || 'Visualización analítica'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums text-muted">{dataPoints} registros</span>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg bg-surface p-0.5">
          {([
            { id: 'bar', label: 'Barras' },
            { id: 'line', label: 'Líneas' },
            { id: 'pie', label: 'Circular' },
          ] as const).map((tab) => {
            const active = resolvedChartType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOverrideType(tab.id)}
                className={`whitespace-nowrap shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-semibold transition-colors ${
                  active
                    ? 'bg-brand text-white'
                    : 'text-muted-2 hover:bg-surface-soft hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-surface py-2.5">
        <div className="overflow-x-auto overflow-y-hidden px-3 pb-1 scrollbar-thin">
          <div
            style={{
              width: resolvedChartType === 'pie' ? '100%' : `${scrollWidth}px`,
              minWidth: `${scrollWidth}px`,
              height: `${plotHeight}px`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
