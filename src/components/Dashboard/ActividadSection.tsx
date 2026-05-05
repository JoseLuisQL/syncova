import React, { memo } from 'react';
import { ArrowRight, Clock, FileText, Package } from '@phosphor-icons/react';
import { usePaginatedActividad } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const getActivityIcon = (tipo: string) => {
  switch (tipo) {
    case 'vale_generado': return <FileText size={14} className="text-violet-500" weight="fill" />;
    case 'lote_recibido': return <Package size={14} className="text-emerald-500" weight="fill" />;
    case 'movimiento_registrado': return <ArrowRight size={14} className="text-blue-500" weight="bold" />;
    default: return <Clock size={14} className="text-zinc-400" weight="bold" />;
  }
};

const formatTimeOnly = (fecha: Date): string => {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(fecha));
};

const ActividadSection: React.FC = memo(() => {
  const { data, loading, error } = usePaginatedActividad(6);

  return (
    <section className="bg-white rounded-md border border-zinc-200 shadow-sm flex flex-col h-full">
      <header className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-zinc-400" />
          <h3 className="text-[15px] font-extrabold text-zinc-900 tracking-tight">Actividad contable</h3>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={5} />
        ) : error ? (
          <div className="text-center text-sm text-rose-600">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState title="Sin actividad" description="No hay registros recientes." icon={<Clock />} />
        ) : (
          <div className="relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-zinc-100">
            {data.map((actividad, index) => (
              <div key={actividad.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${index !== data.length - 1 ? 'mb-6' : ''}`}>
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-zinc-50 shadow-sm text-slate-500 z-10 absolute left-0 md:left-1/2 md:-translate-x-1/2">
                  {getActivityIcon(actividad.tipo)}
                </div>
                
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] ml-10 md:ml-0 flex flex-col">
                  <div className="bg-white rounded-md border border-zinc-100 p-3 shadow-sm group-hover:border-zinc-200 transition-colors relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        {actividad.tipo.replace('_', ' ')}
                      </span>
                      <time className="text-[11px] font-medium text-zinc-400">
                        {formatTimeOnly(actividad.fecha)}
                      </time>
                    </div>
                    <p className="text-[13px] font-medium text-zinc-800 line-clamp-2">
                      {actividad.descripcion}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400 font-semibold truncate">
                      {actividad.usuario && <span>{actividad.usuario}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 mt-auto">
        <button className="text-[13px] font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
          Ver registro completo <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

ActividadSection.displayName = 'ActividadSection';
export default ActividadSection;
