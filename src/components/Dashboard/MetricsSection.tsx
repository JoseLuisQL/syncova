import React, { memo } from 'react';
import { DotsThree, Package, Syringe, Users, Warning } from '@phosphor-icons/react';
import type { DashboardStats } from '../../services/dashboardService';

interface MetricsSectionProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  subtitle?: string;
}

// Alturas del mini-gráfico de barras — constante a nivel módulo para que no
// se cree un array nuevo en cada render.
const BAR_HEIGHTS = [42, 70, 38, 78, 55, 88, 64, 96];

const MetricCard: React.FC<MetricCardProps> = memo(({ title, value, trend, trendUp, icon: Icon, subtitle }) => (
  <article className="min-h-[128px] rounded-[18px] border border-[#e3e9f0] bg-white p-4 shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-32px_rgba(15,42,59,0.65)]">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e4edf2] bg-[#f8fbfd] text-[#0e9f8e]">
          <Icon size={15} weight="bold" />
        </div>
        <h3 className="text-[12px] font-medium text-[#556575]">{title}</h3>
      </div>
      <DotsThree className="h-5 w-5 text-[#9aa4b2]" weight="bold" />
    </div>

    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[25px] font-semibold leading-none tracking-[-0.04em] text-[#171b22] tabular-nums">
          {value}
        </div>
        <p className="mt-2 max-w-[160px] text-[11px] leading-snug text-[#7a8797]">{subtitle}</p>
      </div>
      {trend && (
        <span className={`mt-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
          trendUp ? 'border-[#bdeee5] bg-[#effbf8] text-[#0a8276]' : 'border-[#f3d1d1] bg-[#fff5f5] text-[#c15d5d]'
        }`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>

    <div className="mt-3 flex h-8 items-end gap-1 overflow-hidden">
      {BAR_HEIGHTS.map((height, index) => (
        <div
          key={index}
          className={`w-2 rounded-sm ${trendUp === false ? 'bg-[#f0c05a]' : 'bg-[#44c4dd]'}`}
          style={{ height: `${height}%`, opacity: 0.42 + index * 0.06 }}
        />
      ))}
      </div>
  </article>
));
MetricCard.displayName = 'MetricCard';

const MetricsSection: React.FC<MetricsSectionProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-[128px] animate-pulse rounded-[18px] border border-[#e3e9f0] bg-white p-4">
            <div className="mb-5 h-3 w-1/2 rounded bg-[#eef3f6]" />
            <div className="h-8 w-3/4 rounded bg-[#eef3f6]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard 
        title="Dosis Distribuidas"
        value={stats.entregasMes.toLocaleString() || "34,616"}
        trend="12.4%"
        trendUp={true}
        subtitle="Incremento respecto al mes anterior"
        icon={Package}
      />
      <MetricCard 
        title="Dosis Aplicadas"
        value={(stats.movimientosUltimoMes || 31013).toLocaleString()}
        trend="9.8%"
        trendUp={true}
        subtitle="Datos de los últimos 7 días"
        icon={Syringe}
      />
      <MetricCard 
        title="Cobertura Acumulada"
        value="82.6%"
        trend="4.7 pp"
        trendUp={true}
        subtitle="Promedio de cumplimiento"
        icon={Users}
      />
      <MetricCard 
        title="Alertas Activas"
        value={stats.alertasPendientes || "7"}
        trend="2"
        trendUp={false}
        subtitle="vs. mes anterior"
        icon={Warning}
      />
    </div>
  );
};

export default MetricsSection;
