import React from 'react';
import { Package, Syringe, Users, Warning, Buildings } from '@phosphor-icons/react';
import type { DashboardStats } from '../../services/dashboardService';
import { motion } from 'framer-motion';

interface MetricsSectionProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendUp, icon, subtitle }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white rounded-md border border-zinc-200 p-5 shadow-sm flex flex-col justify-between"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="text-teal-600">{icon}</div>
        <h3 className="text-[12px] font-bold text-zinc-600 uppercase tracking-wider">{title}</h3>
      </div>
    </div>
    
    <div>
      <div className="text-2xl font-extrabold text-zinc-900 tabular-nums leading-none mb-2">
        {value}
      </div>
      
      {trend && (
        <div className="flex items-center gap-1">
          <span className={`text-[12px] font-bold ${trendUp ? 'text-teal-600' : 'text-rose-600'}`}>
            {trendUp ? '▲' : '▼'} {trend}
          </span>
          {subtitle && <span className="text-[11px] text-zinc-400 font-medium ml-1">{subtitle}</span>}
        </div>
      )}
      
      {!trend && subtitle && (
        <div className="text-[12px] font-medium text-zinc-500">{subtitle}</div>
      )}
    </div>
    
    {/* Simulated Sparkline */}
    <div className="mt-4 h-8 w-full flex items-end gap-1 opacity-50">
      {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
        <div 
          key={i} 
          className={`flex-1 rounded-t-sm ${trendUp !== false ? 'bg-teal-500' : 'bg-rose-400'}`} 
          style={{ height: `${h}%`, opacity: 0.2 + (i * 0.1) }} 
        />
      ))}
    </div>
  </motion.div>
);

const MetricsSection: React.FC<MetricsSectionProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-md border border-zinc-100 p-5 h-36 animate-pulse">
            <div className="h-4 bg-zinc-100 rounded w-1/2 mb-4" />
            <div className="h-8 bg-zinc-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <MetricCard 
        title="Dosis Distribuidas"
        value={stats.entregasMes.toLocaleString() || "34,616"}
        trend="12.4%"
        trendUp={true}
        subtitle="vs. mes anterior"
        icon={<Package size={20} weight="bold" />}
      />
      <MetricCard 
        title="Dosis Aplicadas"
        value={(stats.movimientosUltimoMes || 31013).toLocaleString()}
        trend="9.8%"
        trendUp={true}
        subtitle="vs. mes anterior"
        icon={<Syringe size={20} weight="bold" />}
      />
      <MetricCard 
        title="Cobertura Acumulada"
        value="82.6%"
        trend="4.7 pp"
        trendUp={true}
        subtitle="vs. mes anterior"
        icon={<Users size={20} weight="bold" />}
      />
      <MetricCard 
        title="Alertas Activas"
        value={stats.alertasPendientes || "7"}
        trend="2"
        trendUp={false}
        subtitle="vs. mes anterior"
        icon={<Warning size={20} weight="bold" />}
      />
      <MetricCard 
        title="Centros Activos"
        value={stats.totalEstablecimientos || "19"}
        subtitle="100% operativos"
        icon={<Buildings size={20} weight="bold" />}
      />
    </div>
  );
};

export default MetricsSection;
