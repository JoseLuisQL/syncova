import React, { memo, useCallback } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { Alerta } from '../../../types';
import { TIPOS_ALERTA, NIVELES_ALERTA } from '../constants';

interface AlertaCardProps {
  alerta: Alerta;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onMarcarLeida: (id: string) => void;
  onMarcarNoLeida: (id: string) => void;
  onEliminar: (id: string) => void;
}

const formatearFecha = (fecha: Date | string): string => {
  if (!fecha) return 'Fecha no disponible';

  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(fechaObj.getTime())) return 'Fecha invalida';

  const ahora = new Date();
  const diferencia = ahora.getTime() - fechaObj.getTime();
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;

  return fechaObj.toLocaleDateString();
};

export const AlertaCard: React.FC<AlertaCardProps> = memo(({
  alerta,
  isSelected,
  onToggleSelect,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
}) => {
  const tipoInfo = TIPOS_ALERTA.find(t => t.id === alerta.tipo);
  const nivelInfo = NIVELES_ALERTA.find(n => n.id === alerta.nivel);

  const IconoTipo = tipoInfo?.icon || TIPOS_ALERTA[3].icon;
  const IconoNivel = nivelInfo?.icon || NIVELES_ALERTA[2].icon;

  const handleToggle = useCallback(() => onToggleSelect(alerta.id), [alerta.id, onToggleSelect]);
  const handleMarcarLeida = useCallback(() => onMarcarLeida(alerta.id), [alerta.id, onMarcarLeida]);
  const handleMarcarNoLeida = useCallback(() => onMarcarNoLeida(alerta.id), [alerta.id, onMarcarNoLeida]);
  const handleEliminar = useCallback(() => onEliminar(alerta.id), [alerta.id, onEliminar]);

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
        !alerta.leida ? 'bg-teal-50/50' : ''
      } ${isSelected ? 'bg-teal-100/50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleToggle}
          className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          aria-label={`Seleccionar alerta: ${alerta.titulo}`}
        />

        <div className={`p-2 ${nivelInfo?.bgColor || 'bg-gray-100'} rounded-lg flex-shrink-0`}>
          <IconoNivel className={`h-4 w-4 ${nivelInfo?.color || 'text-gray-600'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-medium truncate ${!alerta.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                  {alerta.titulo}
                </h4>
                {!alerta.leida && (
                  <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                {alerta.descripcion}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <IconoTipo className={`h-3 w-3 ${tipoInfo?.color || 'text-gray-500'}`} />
                  <span className="text-xs text-gray-500 capitalize">
                    {alerta.tipo.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatearFecha(alerta.fechaCreacion)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {alerta.leida ? (
                <button
                  onClick={handleMarcarNoLeida}
                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Marcar como no leida"
                  aria-label="Marcar como no leida"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleMarcarLeida}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Marcar como leida"
                  aria-label="Marcar como leida"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleEliminar}
                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Eliminar alerta"
                aria-label="Eliminar alerta"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AlertaCard.displayName = 'AlertaCard';
