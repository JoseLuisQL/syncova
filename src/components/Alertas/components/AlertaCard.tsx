import React, { memo, useCallback } from 'react';
import {
  Check,
  ArrowCounterClockwise,
  Trash,
  Eye,
  Clock,
  CheckCircle,
} from '@phosphor-icons/react';
import { Alerta } from '../../../types';
import {
  COMPONENT_STYLES,
  NIVELES_ALERTA,
  TIPOS_ALERTA,
  formatRelativeAlertDate,
} from '../constants';

interface AlertaCardProps {
  alerta: Alerta;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onMarcarLeida: (id: string) => void;
  onMarcarNoLeida: (id: string) => void;
  onEliminar: (id: string) => void;
  onInspect?: (alerta: Alerta) => void;
}

export const AlertaCard: React.FC<AlertaCardProps> = memo(({
  alerta,
  isSelected,
  onToggleSelect,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
  onInspect,
}) => {
  const tipoInfo = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo) || TIPOS_ALERTA[3];
  const nivelInfo = NIVELES_ALERTA.find((nivel) => nivel.id === alerta.nivel) || NIVELES_ALERTA[2];
  const IconoNivel = nivelInfo.icon;

  const handleToggle = useCallback(() => onToggleSelect(alerta.id), [alerta.id, onToggleSelect]);
  const handleMarcarLeida = useCallback(() => onMarcarLeida(alerta.id), [alerta.id, onMarcarLeida]);
  const handleMarcarNoLeida = useCallback(() => onMarcarNoLeida(alerta.id), [alerta.id, onMarcarNoLeida]);
  const handleEliminar = useCallback(() => onEliminar(alerta.id), [alerta.id, onEliminar]);
  const handleInspect = useCallback(() => onInspect?.(alerta), [alerta, onInspect]);

  return (
    <article
      className={`rounded-xl border p-4 transition-colors ${
        isSelected
          ? 'border-brand/50 bg-surface-tint'
          : !alerta.leida
            ? 'border-line bg-surface'
            : 'border-line-soft bg-surface-soft/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <label className="mt-0.5 inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-surface-soft">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggle}
            className="h-4 w-4 cursor-pointer rounded border-line accent-violet-600 focus:ring-brand/25"
            aria-label={`Seleccionar alerta: ${alerta.titulo}`}
          />
        </label>

        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${nivelInfo.bgColor}`}>
          <IconoNivel className={`h-4 w-4 ${nivelInfo.color}`} weight="fill" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={handleInspect}
              className="text-left focus-visible:outline-none group min-w-0 flex-1"
            >
              <p className={`text-sm group-hover:text-brand transition-colors ${!alerta.leida ? 'font-semibold text-ink' : 'font-medium text-muted-2'}`}>
                {alerta.titulo}
              </p>
            </button>
            <span className="font-mono text-xs text-muted tabular-nums shrink-0">
              {formatRelativeAlertDate(alerta.fechaCreacion)}
            </span>
          </div>

          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-2 line-clamp-2">
            {alerta.descripcion}
          </p>

          {/* Metadatos limpios sin cajas tipo píldora */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-2">
            <span className={`font-medium ${nivelInfo.color}`}>{nivelInfo.label}</span>
            <span aria-hidden="true">·</span>
            <span>{tipoInfo.label}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              {alerta.leida ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" weight="fill" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Atendida</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" weight="fill" />
                  <span className="text-amber-700 dark:text-amber-400 font-medium">Pendiente</span>
                </>
              )}
            </span>
          </div>

          {/* Barra de acciones clara */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-2.5">
            <div className="flex items-center gap-1.5">
              {alerta.leida ? (
                <button
                  type="button"
                  onClick={handleMarcarNoLeida}
                  className={COMPONENT_STYLES.button.secondary}
                >
                  <ArrowCounterClockwise className="h-3.5 w-3.5" weight="bold" />
                  <span>Reabrir</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleMarcarLeida}
                  className={COMPONENT_STYLES.button.primary}
                >
                  <Check className="h-3.5 w-3.5" weight="bold" />
                  <span>Marcar atendida</span>
                </button>
              )}
              {onInspect ? (
                <button
                  type="button"
                  onClick={handleInspect}
                  className={COMPONENT_STYLES.button.ghost}
                >
                  <Eye className="h-3.5 w-3.5" weight="bold" />
                  <span>Ver detalle</span>
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleEliminar}
              className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
              aria-label="Eliminar alerta"
              title="Eliminar alerta"
            >
              <Trash className="h-4 w-4" weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

AlertaCard.displayName = 'AlertaCard';