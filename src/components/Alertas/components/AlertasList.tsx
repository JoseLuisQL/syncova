import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Checks,
  ArrowCounterClockwise,
  Trash,
  Eye,
  Clock,
  CheckCircle,
  X,
} from '@phosphor-icons/react';
import { Alerta } from '../../../types';
import { DataTable, Pagination } from '../../Inventario/components/FilterAndTable';
import {
  COMPONENT_STYLES,
  ITEMS_PER_PAGE,
  NIVELES_ALERTA,
  TIPOS_ALERTA,
  formatExactAlertDate,
  formatRelativeAlertDate,
} from '../constants';
import { AlertaCard } from './AlertaCard';
import { EmptyState } from './EmptyState';

interface AlertasListProps {
  alertas: Alerta[];
  selectedAlertas: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarcarLeida: (id: string) => void;
  onMarcarNoLeida: (id: string) => void;
  onEliminar: (id: string) => void;
  onMarcarSeleccionadasLeidas: () => void;
  onMarcarSeleccionadasNoLeidas?: () => void;
  onEliminarSeleccionadas: () => void;
  onInspect?: (alerta: Alerta) => void;
  onEmptyAction?: () => void;
  isLoading?: boolean;
}

export const AlertasList: React.FC<AlertasListProps> = memo(({
  alertas,
  selectedAlertas,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
  onMarcarSeleccionadasLeidas,
  onMarcarSeleccionadasNoLeidas,
  onEliminarSeleccionadas,
  onInspect,
  onEmptyAction,
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(alertas.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const alertasPaginadas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return alertas.slice(start, start + ITEMS_PER_PAGE);
  }, [alertas, currentPage]);

  const selectionSummary = useMemo(() => {
    const selectedSet = new Set(selectedAlertas);
    const items = alertas.filter((a) => selectedSet.has(a.id));
    const unreadCount = items.filter((a) => !a.leida).length;
    const readCount = items.filter((a) => a.leida).length;
    return {
      hasUnread: unreadCount > 0,
      hasRead: readCount > 0,
      unreadCount,
      readCount,
      count: items.length,
    };
  }, [alertas, selectedAlertas]);

  const allFilteredSelected =
    alertas.length > 0 && alertas.every((a) => selectedAlertas.includes(a.id));

  if (!isLoading && alertas.length === 0) {
    return (
      <EmptyState
        title="No hay alertas que coincidan con la vista actual"
        description="Puedes ajustar los filtros de búsqueda o ejecutar un análisis automático del inventario para verificar lotes por vencer y stock crítico."
        action={
          onEmptyAction
            ? {
                label: 'Analizar inventario ahora',
                onClick: onEmptyAction,
              }
            : undefined
        }
      />
    );
  }

  return (
    <section className="space-y-3">
      {/* Barra contextual de selección múltiple (solo aparece cuando hay selección activa) */}
      {selectionSummary.count > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand/30 bg-surface-tint px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-ink tabular-nums">
              {selectionSummary.count} alerta{selectionSummary.count === 1 ? '' : 's'} seleccionada{selectionSummary.count === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectionSummary.hasUnread ? (
              <button
                type="button"
                onClick={onMarcarSeleccionadasLeidas}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 whitespace-nowrap"
              >
                <Checks className="h-3.5 w-3.5" weight="bold" />
                <span>Atender ({selectionSummary.unreadCount})</span>
              </button>
            ) : null}

            {selectionSummary.hasRead && onMarcarSeleccionadasNoLeidas ? (
              <button
                type="button"
                onClick={onMarcarSeleccionadasNoLeidas}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:bg-surface-soft whitespace-nowrap"
              >
                <ArrowCounterClockwise className="h-3.5 w-3.5" weight="bold" />
                <span>Reabrir ({selectionSummary.readCount})</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onEliminarSeleccionadas}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-3 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-colors hover:bg-rose-100 whitespace-nowrap"
            >
              <Trash className="h-3.5 w-3.5" weight="bold" />
              <span>Eliminar ({selectionSummary.count})</span>
            </button>

            <button
              type="button"
              onClick={onDeselectAll}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-2 hover:bg-surface hover:text-ink"
              aria-label="Cancelar selección"
              title="Cancelar selección"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Vista móvil en tarjetas limpias */}
      <div className="block md:hidden space-y-2.5">
        {alertasPaginadas.map((alerta) => (
          <AlertaCard
            key={alerta.id}
            alerta={alerta}
            isSelected={selectedAlertas.includes(alerta.id)}
            onToggleSelect={onToggleSelect}
            onMarcarLeida={onMarcarLeida}
            onMarcarNoLeida={onMarcarNoLeida}
            onEliminar={onEliminar}
            onInspect={onInspect}
          />
        ))}
      </div>

      {/* Vista desktop en tabla operativa limpia y sin redundancias */}
      <div className="hidden md:block">
        <DataTable isLoading={isLoading} loadingMessage="Cargando bandeja de alertas..." skeletonRows={6} skeletonColumns={6}>
          <div className={COMPONENT_STYLES.table.container}>
            <table className="min-w-full table-auto border-collapse">
              <thead className={COMPONENT_STYLES.table.header}>
                <tr>
                  <th className="w-11 px-3.5 py-3 text-center">
                    <label className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-surface">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={() => {
                          if (allFilteredSelected) {
                            onDeselectAll();
                            return;
                          }
                          onSelectAll();
                        }}
                        className="h-4 w-4 cursor-pointer rounded border-line accent-violet-600 focus:ring-brand/20"
                        aria-label="Seleccionar todas las alertas"
                      />
                    </label>
                  </th>
                  <th className={COMPONENT_STYLES.table.headerCell}>Tipo / Severidad</th>
                  <th className={COMPONENT_STYLES.table.headerCell}>Incidente</th>
                  <th className={COMPONENT_STYLES.table.headerCell}>Fecha</th>
                  <th className={COMPONENT_STYLES.table.headerCell}>Estado</th>
                  <th className={`${COMPONENT_STYLES.table.headerCell} text-right`}>Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft bg-surface">
                {alertasPaginadas.map((alerta) => {
                  const tipoInfo = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo) || TIPOS_ALERTA[3];
                  const nivelInfo = NIVELES_ALERTA.find((nivel) => nivel.id === alerta.nivel) || NIVELES_ALERTA[2];
                  const NivelIcon = nivelInfo.icon;
                  const isSelected = selectedAlertas.includes(alerta.id);

                  return (
                    <tr
                      key={alerta.id}
                      className={`${COMPONENT_STYLES.table.row} ${
                        isSelected
                          ? 'bg-surface-tint'
                          : !alerta.leida
                            ? 'bg-surface'
                            : 'bg-surface-soft/35'
                      }`}
                    >
                      <td className="w-11 px-3.5 py-3 text-center align-middle">
                        <label className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-surface-soft">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect(alerta.id)}
                            className="h-4 w-4 cursor-pointer rounded border-line accent-violet-600 focus:ring-brand/20"
                            aria-label={`Seleccionar alerta: ${alerta.titulo}`}
                          />
                        </label>
                      </td>

                      {/* Tipo y Severidad compactos en una sola línea visual */}
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${nivelInfo.bgColor}`}>
                            <NivelIcon className={`h-4 w-4 ${nivelInfo.color}`} weight="fill" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-ink">
                              {tipoInfo.label}
                            </p>
                            <p className={`text-[11px] font-medium ${nivelInfo.color}`}>
                              {nivelInfo.label}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Incidente y descripción */}
                      <td className="px-4 py-3 align-middle max-w-md xl:max-w-xl">
                        <button
                          type="button"
                          onClick={() => onInspect?.(alerta)}
                          className="text-left group focus-visible:outline-none block w-full"
                        >
                          <p className={`text-sm group-hover:text-brand transition-colors truncate ${!alerta.leida ? 'font-semibold text-ink' : 'font-medium text-muted-2'}`}>
                            {alerta.titulo}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-2 line-clamp-1">
                            {alerta.descripcion}
                          </p>
                        </button>
                      </td>

                      {/* Fecha sin duplicar líneas */}
                      <td
                        className="px-4 py-3 align-middle whitespace-nowrap"
                        title={formatExactAlertDate(alerta.fechaCreacion)}
                      >
                        <span className="font-mono text-xs text-muted-2 tabular-nums">
                          {formatRelativeAlertDate(alerta.fechaCreacion)}
                        </span>
                      </td>

                      {/* Estado semántico con icono + texto */}
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        {alerta.leida ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <CheckCircle className="h-4 w-4 shrink-0" weight="fill" />
                            <span>Atendida</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                            <Clock className="h-4 w-4 shrink-0" weight="fill" />
                            <span>Pendiente</span>
                          </span>
                        )}
                      </td>

                      {/* Acciones claras e intuitivas */}
                      <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {alerta.leida ? (
                            <button
                              type="button"
                              onClick={() => onMarcarNoLeida(alerta.id)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-soft"
                              title="Marcar nuevamente como pendiente"
                            >
                              <ArrowCounterClockwise className="h-3.5 w-3.5" weight="bold" />
                              <span>Reabrir</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onMarcarLeida(alerta.id)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/70"
                              title="Marcar alerta como atendida"
                            >
                              <Check className="h-3.5 w-3.5" weight="bold" />
                              <span>Atender</span>
                            </button>
                          )}

                          {onInspect ? (
                            <button
                              type="button"
                              onClick={() => onInspect(alerta)}
                              className={COMPONENT_STYLES.button.icon}
                              aria-label="Ver detalle completo"
                              title="Ver detalle completo"
                            >
                              <Eye className="h-4 w-4" weight="bold" />
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => onEliminar(alerta.id)}
                            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
                            aria-label="Eliminar alerta"
                            title="Eliminar alerta"
                          >
                            <Trash className="h-4 w-4" weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataTable>
      </div>

      {totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={alertas.length}
          limit={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </section>
  );
});

AlertasList.displayName = 'AlertasList';