import React, { memo, useCallback } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { Alerta } from '../../../types';
import { NIVELES_ALERTA, TIPOS_ALERTA } from '../constants';

interface AlertaCardProps {
  alerta: Alerta;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onMarcarLeida: (id: string) => void;
  onMarcarNoLeida: (id: string) => void;
  onEliminar: (id: string) => void;
}

const formatearFecha = (fecha: Date | string) => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  const diferencia = ahora.getTime() - fechaObj.getTime();
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;
  return fechaObj.toLocaleDateString('es-PE');
};

export const AlertaCard: React.FC<AlertaCardProps> = memo(({
  alerta,
  isSelected,
  onToggleSelect,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
}) => {
  const tipoInfo = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo);
  const nivelInfo = NIVELES_ALERTA.find((nivel) => nivel.id === alerta.nivel);
  const IconoNivel = nivelInfo?.icon || NIVELES_ALERTA[2].icon;

  const handleToggle = useCallback(() => onToggleSelect(alerta.id), [alerta.id, onToggleSelect]);
  const handleMarcarLeida = useCallback(() => onMarcarLeida(alerta.id), [alerta.id, onMarcarLeida]);
  const handleMarcarNoLeida = useCallback(() => onMarcarNoLeida(alerta.id), [alerta.id, onMarcarNoLeida]);
  const handleEliminar = useCallback(() => onEliminar(alerta.id), [alerta.id, onEliminar]);

  return (
    <article className={`rounded-[20px] border p-4 ${isSelected ? 'border-teal-300 bg-teal-50/70' : !alerta.leida ? 'border-teal-200 bg-white' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleToggle}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          aria-label={`Seleccionar alerta: ${alerta.titulo}`}
        />

        <div className={`mt-0.5 rounded-xl p-2 ${nivelInfo?.bgColor || 'bg-slate-100'}`}>
          <IconoNivel className={`h-4 w-4 ${nivelInfo?.color || 'text-slate-500'}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{alerta.titulo}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{alerta.descripcion}</p>
            </div>
            <span className="text-xs font-medium text-slate-500">{formatearFecha(alerta.fechaCreacion)}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tipoInfo?.bgColor || 'bg-slate-100'} ${tipoInfo?.color || 'text-slate-700'}`}>
              {tipoInfo?.label || alerta.tipo}
            </span>
            <span className={alerta.leida ? 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700' : 'inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700'}>
              {alerta.leida ? 'Leída' : 'Pendiente'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {alerta.leida ? (
              <button type="button" onClick={handleMarcarNoLeida} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <EyeOff className="h-4 w-4" />
                Marcar no leída
              </button>
            ) : (
              <button type="button" onClick={handleMarcarLeida} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
                <Eye className="h-4 w-4" />
                Marcar leída
              </button>
            )}

            <button type="button" onClick={handleEliminar} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100">
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

AlertaCard.displayName = 'AlertaCard';
