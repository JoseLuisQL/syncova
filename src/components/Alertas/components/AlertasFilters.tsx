import React, { memo } from 'react';
import { MagnifyingGlass, CaretDown, X } from '@phosphor-icons/react';
import { COMPONENT_STYLES, NIVELES_ALERTA, TIPOS_ALERTA } from '../constants';

export type SortOrderAlerta = 'recientes' | 'severidad' | 'vencimiento';

interface AlertasFiltersProps {
  searchTerm: string;
  filtroTipo: string;
  filtroNivel: string;
  filtroEstado: string;
  sortBy?: SortOrderAlerta;
  counts?: {
    total: number;
    noLeidas: number;
    leidas: number;
  };
  onSearchChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onNivelChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onSortChange?: (value: SortOrderAlerta) => void;
}

const selectBaseClass =
  'h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-xs sm:text-sm font-medium text-ink transition-colors hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

export const AlertasFilters: React.FC<AlertasFiltersProps> = memo(({
  searchTerm,
  filtroTipo,
  filtroNivel,
  filtroEstado,
  sortBy = 'recientes',
  counts,
  onSearchChange,
  onTipoChange,
  onNivelChange,
  onEstadoChange,
  onSortChange,
}) => {
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    filtroTipo !== 'todos' ||
    filtroNivel !== 'todos' ||
    filtroEstado !== 'todos';

  const handleClear = () => {
    onSearchChange('');
    onTipoChange('todos');
    onNivelChange('todos');
    onEstadoChange('todos');
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-3 sm:p-3.5">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
        {/* Selector simétrico de Estado (3 columnas iguales) */}
        <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-3 gap-1 rounded-lg border border-line bg-surface-soft p-1 h-9 items-center">
          <button
            type="button"
            onClick={() => onEstadoChange('todos')}
            className={`inline-flex h-full items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors whitespace-nowrap ${
              filtroEstado === 'todos'
                ? 'bg-surface text-ink font-semibold shadow-2xs'
                : 'text-muted-2 hover:text-ink'
            }`}
          >
            <span>Todas</span>
            {counts ? (
              <span className="font-mono text-[11px] text-muted tabular-nums">{counts.total}</span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => onEstadoChange('no_leidas')}
            className={`inline-flex h-full items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors whitespace-nowrap ${
              filtroEstado === 'no_leidas'
                ? 'bg-surface text-ink font-semibold shadow-2xs'
                : 'text-muted-2 hover:text-ink'
            }`}
          >
            <span>Pendientes</span>
            {counts ? (
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  counts.noLeidas > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted'
                }`}
              >
                {counts.noLeidas}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => onEstadoChange('leidas')}
            className={`inline-flex h-full items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors whitespace-nowrap ${
              filtroEstado === 'leidas'
                ? 'bg-surface text-ink font-semibold shadow-2xs'
                : 'text-muted-2 hover:text-ink'
            }`}
          >
            <span>Atendidas</span>
            {counts ? (
              <span className="font-mono text-[11px] text-muted tabular-nums">{counts.leidas}</span>
            ) : null}
          </button>
        </div>

        {/* Buscador */}
        <div className="relative sm:col-span-2 lg:col-span-3">
          <MagnifyingGlass className={COMPONENT_STYLES.filter.searchIcon} weight="bold" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar vacuna, lote o incidente..."
            className={COMPONENT_STYLES.filter.searchInput}
            aria-label="Buscar alertas"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" weight="bold" />
            </button>
          ) : null}
        </div>

        {/* Selector simétrico: Categoría */}
        <div className="relative lg:col-span-2">
          <select
            value={filtroTipo}
            onChange={(e) => onTipoChange(e.target.value)}
            className={selectBaseClass}
            aria-label="Filtrar por categoría"
          >
            <option value="todos">Categoría: Todas</option>
            {TIPOS_ALERTA.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.label}
              </option>
            ))}
          </select>
          <CaretDown
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
            weight="bold"
          />
        </div>

        {/* Selector simétrico: Severidad */}
        <div className="relative lg:col-span-1">
          <select
            value={filtroNivel}
            onChange={(e) => onNivelChange(e.target.value)}
            className={selectBaseClass}
            aria-label="Filtrar por severidad"
          >
            <option value="todos">Severidad</option>
            {NIVELES_ALERTA.map((nivel) => (
              <option key={nivel.id} value={nivel.id}>
                {nivel.label}
              </option>
            ))}
          </select>
          <CaretDown
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
            weight="bold"
          />
        </div>

        {/* Selector simétrico: Orden + Limpiar */}
        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
          {onSortChange ? (
            <div className="relative flex-1 min-w-0">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOrderAlerta)}
                className={selectBaseClass}
                aria-label="Ordenar alertas"
              >
                <option value="recientes">Más recientes</option>
                <option value="severidad">Mayor severidad</option>
                <option value="vencimiento">Por vencimiento</option>
              </select>
              <CaretDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                weight="bold"
              />
            </div>
          ) : null}

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-soft text-muted-2 transition-colors hover:border-line-strong hover:bg-surface hover:text-ink"
              title="Restablecer filtros"
              aria-label="Restablecer filtros"
            >
              <X className="h-4 w-4" weight="bold" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
});

AlertasFilters.displayName = 'AlertasFilters';