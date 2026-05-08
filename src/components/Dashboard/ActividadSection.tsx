import React, { memo } from 'react';
import { ArrowRight, Clock, FileText, Package } from '@phosphor-icons/react';
import { usePaginatedActividad } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const getActivityIcon = (tipo: string) => {
  switch (tipo) {
    case 'vale_generado': return <FileText size={14} className="text-primary" weight="fill" />;
    case 'lote_recibido': return <Package size={14} className="text-tertiary" weight="fill" />;
    case 'movimiento_registrado': return <ArrowRight size={14} className="text-secondary" weight="bold" />;
    default: return <Clock size={14} className="text-secondary" weight="bold" />;
  }
};

const formatTimeOnly = (fecha: Date): string => {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(fecha));
};

const ActividadSection: React.FC = memo(() => {
  const { data, loading, error } = usePaginatedActividad(6);

  return (
    <section className="flex h-full flex-col rounded-[18px] border border-[#e3e9f0] bg-white shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)]">
      <header className="border-b border-[#eef1f5] px-5 py-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa4b2]">Auditoría</p>
          <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#171b22]">Actividad reciente</h3>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto p-5">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={5} />
        ) : error ? (
          <div className="text-center text-sm text-rose-600">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState title="Sin actividad" description="No hay registros recientes." icon={<Clock />} />
        ) : (
          <div className="divide-y divide-zinc-100">
            {data.map((actividad) => (
              <div key={actividad.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#e3e9f0] bg-[#f8fbfd]">
                  {getActivityIcon(actividad.tipo)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
                      {actividad.tipo.replace('_', ' ')}
                    </span>
                    <time className="whitespace-nowrap font-mono text-[10px] font-medium text-secondary/70">
                      {formatTimeOnly(actividad.fecha)}
                    </time>
                  </div>
                  <p className="line-clamp-2 text-[13px] font-medium text-[#171b22]">
                    {actividad.descripcion}
                  </p>
                  <div className="mt-1 truncate text-[11px] font-medium text-secondary">
                    {actividad.usuario && <span>{actividad.usuario}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-zinc-100 px-5 py-4">
        <button className="flex items-center gap-1 text-[13px] font-semibold text-[#35bfa8] transition-colors hover:text-[#269b8b]">
          Ver registro completo <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

ActividadSection.displayName = 'ActividadSection';
export default ActividadSection;
