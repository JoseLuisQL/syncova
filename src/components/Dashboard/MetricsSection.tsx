import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ClockCountdown,
  ArrowsLeftRight,
  WarningCircle,
  ArrowUpRight,
} from '@phosphor-icons/react';
import type { DashboardStats, StockPorVacuna } from '../../services/dashboardService';

interface MetricsSectionProps {
  stats: DashboardStats | null;
  stockPorVacuna?: StockPorVacuna[];
  isLoading: boolean;
}

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  metaPrimary: string;
  metaSecondary: string;
  statusLabel: string;
  statusTone: 'nominal' | 'warning' | 'critical';
  icon: React.ElementType;
  onClick: () => void;
}

const TONE_STYLES: Record<MetricCardProps['statusTone'], { dot: string; text: string }> = {
  nominal: {
    dot: 'bg-emerald-600',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
  critical: {
    dot: 'bg-rose-600',
    text: 'text-rose-700 dark:text-rose-400',
  },
};

const MetricCard: React.FC<MetricCardProps> = memo(({
  label,
  value,
  unit,
  metaPrimary,
  metaSecondary,
  statusLabel,
  statusTone,
  icon: Icon,
  onClick,
}) => {
  const tone = TONE_STYLES[statusTone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col justify-between rounded-xl border border-line bg-surface p-4 text-left shadow-xs transition-all duration-150 hover:border-line-strong hover:bg-surface-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-soft text-muted-2 transition-colors group-hover:border-brand/30 group-hover:text-brand">
            <Icon size={15} weight="duotone" />
          </span>
          <span className="truncate text-xs font-medium text-muted-2">
            {label}
          </span>
        </div>
        <ArrowUpRight
          size={14}
          weight="bold"
          className="shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
        />
      </div>

      <div className="my-3 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-semibold tracking-tight text-ink tabular-nums">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-normal text-muted">
              {unit}
            </span>
          )}
        </div>

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
          <span>{statusLabel}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 truncate border-t border-line-soft pt-2.5 text-xs text-muted">
        <span className="font-mono font-medium text-muted-2 tabular-nums">{metaPrimary}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{metaSecondary}</span>
      </div>
    </button>
  );
});

MetricCard.displayName = 'MetricCard';

const MetricsSection: React.FC<MetricsSectionProps> = ({
  stats,
  stockPorVacuna = [],
  isLoading,
}) => {
  const navigate = useNavigate();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-live="polite">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="inventory-reveal flex h-[132px] flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-xs"
            style={{ animationDelay: `${i * 35}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="inventory-skeleton h-3.5 w-32 rounded-md" />
              <div className="inventory-skeleton h-6 w-6 rounded-md" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="inventory-skeleton h-7 w-24 rounded-md" />
              <div className="inventory-skeleton h-3 w-12 rounded-full opacity-75" />
            </div>
            <div className="flex items-center justify-between border-t border-line-soft pt-2">
              <div className="inventory-skeleton h-3 w-28 rounded-full" />
              <div className="inventory-skeleton h-3 w-16 rounded-full opacity-70" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stockTotal =
    stats.stockTotalVacunas > 0
      ? stats.stockTotalVacunas
      : stockPorVacuna.reduce((acc, item) => acc + item.stockTotal, 0);

  const lotesPorVencer = stats.lotesProximosVencer;
  const stockCritico = stats.stockCritico;
  const alertasActivas = stats.alertasPendientes;

  return (
    <section
      aria-label="Indicadores principales del sistema"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        label="Stock total disponible"
        value={stockTotal.toLocaleString('es-PE')}
        unit="dosis"
        metaPrimary={`${stats.lotesActivos} lotes vigentes`}
        metaSecondary={`${stats.totalVacunas} biológicos activos`}
        statusLabel={stockCritico > 0 ? `${stockCritico} en nivel crítico` : 'Abastecimiento normal'}
        statusTone={stockCritico > 0 ? 'warning' : 'nominal'}
        icon={Package}
        onClick={() => navigate('/inventario')}
      />

      <MetricCard
        label="Lotes próximos a vencer"
        value={lotesPorVencer.toLocaleString('es-PE')}
        unit={lotesPorVencer === 1 ? 'lote' : 'lotes'}
        metaPrimary={`${stockCritico} con stock ≤ 20%`}
        metaSecondary="Ventana de 45 días"
        statusLabel={
          lotesPorVencer > 0
            ? 'Priorizar distribución'
            : 'Sin riesgo inmediato'
        }
        statusTone={lotesPorVencer > 0 ? 'warning' : 'nominal'}
        icon={ClockCountdown}
        onClick={() => navigate('/inventario')}
      />

      <MetricCard
        label="Entregas del mes"
        value={stats.entregasMes.toLocaleString('es-PE')}
        unit="dosis"
        metaPrimary={`${stats.movimientosUltimoMes} movimientos`}
        metaSecondary={
          stats.dosisAplicadasMes > 0
            ? `${stats.dosisAplicadasMes.toLocaleString('es-PE')} dosis salidas`
            : `${stats.totalEstablecimientos} establecimientos`
        }
        statusLabel="Flujo operativo activo"
        statusTone="nominal"
        icon={ArrowsLeftRight}
        onClick={() => navigate('/movimientos')}
      />

      <MetricCard
        label="Alertas activas"
        value={alertasActivas.toLocaleString('es-PE')}
        unit={alertasActivas === 1 ? 'pendiente' : 'pendientes'}
        metaPrimary={`${stats.centrosAcopio} centros de acopio`}
        metaSecondary={`${stats.totalEstablecimientos} establecimientos en red`}
        statusLabel={
          alertasActivas > 0
            ? 'Requiere revisión'
            : 'Sin incidencias'
        }
        statusTone={alertasActivas > 2 ? 'critical' : alertasActivas > 0 ? 'warning' : 'nominal'}
        icon={WarningCircle}
        onClick={() => navigate('/alertas')}
      />
    </section>
  );
};

export default MetricsSection;
