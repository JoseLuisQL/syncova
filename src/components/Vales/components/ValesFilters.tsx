import React, { memo } from 'react';
import {
  MagnifyingGlass,
  Buildings,
  CalendarBlank,
  ArrowsClockwise,
  CaretDown,
  X,
} from '@phosphor-icons/react';
import { COMPONENT_STYLES, MESES, ANIOS_DISPONIBLES, FILTER_OPTIONS } from '../constants';

interface CentroAcopio {
  id: string;
  nombre: string;
  codigo?: string;
}

interface ValesFiltersProps {
  selectedCentroAcopio: string;
  selectedMes: number;
  selectedAnio: number;
  selectedEstado: string;
  searchTerm: string;
  centrosAcopio: CentroAcopio[];
  isLoading: boolean;
  onCentroAcopioChange: (value: string) => void;
  onMesChange: (value: number) => void;
  onAnioChange: (value: number) => void;
  onEstadoChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

const FILTER_LABEL_CLASS = 'mb-1 block truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-muted';
const SELECT_BASE_CLASS =
  'h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-8 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15';

export const ValesFilters: React.FC<ValesFiltersProps> = memo(({
  selectedCentroAcopio,
  selectedMes,
  selectedAnio,
  selectedEstado,
  searchTerm,
  centrosAcopio,
  isLoading,
  onCentroAcopioChange,
  onMesChange,
  onAnioChange,
  onEstadoChange,
  onSearchChange,
  onRefresh,
}) => {
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedEstado !== 'todos' ||
    selectedCentroAcopio !== 'todos';

  return (
    <section
      aria-label="Filtros de vales"
      className="rounded-xl border border-line bg-surface p-3 shadow-2xs sm:p-4"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {/* Centro de Acopio */}
          <div className="col-span-2 sm:col-span-1 min-w-0">
            <label className={FILTER_LABEL_CLASS}>
              Centro de Acopio <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Buildings weight="duotone" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <select
                value={selectedCentroAcopio}
                onChange={(e) => onCentroAcopioChange(e.target.value)}
                className={SELECT_BASE_CLASS}
              >
                <option value="todos">Todos los centros</option>
                {centrosAcopio.map((centro) => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
              <CaretDown weight="bold" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
            </div>
          </div>

          {/* Mes */}
          <div className="min-w-0">
            <label className={FILTER_LABEL_CLASS}>Mes</label>
            <div className="relative">
              <CalendarBlank weight="duotone" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <select
                value={selectedMes}
                onChange={(e) => onMesChange(parseInt(e.target.value, 10))}
                className={SELECT_BASE_CLASS}
              >
                {MESES.map((mes, index) => (
                  <option key={index + 1} value={index + 1}>
                    {mes}
                  </option>
                ))}
              </select>
              <CaretDown weight="bold" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
            </div>
          </div>

          {/* Año */}
          <div className="min-w-0">
            <label className={FILTER_LABEL_CLASS}>Año</label>
            <div className="relative">
              <CalendarBlank weight="duotone" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <select
                value={selectedAnio}
                onChange={(e) => onAnioChange(parseInt(e.target.value, 10))}
                className={`${SELECT_BASE_CLASS} tabular-nums font-semibold`}
              >
                {ANIOS_DISPONIBLES.map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
              <CaretDown weight="bold" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
            </div>
          </div>

          {/* Estado */}
          <div className="min-w-0">
            <label className={FILTER_LABEL_CLASS}>Estado</label>
            <div className="relative">
              <select
                value={selectedEstado}
                onChange={(e) => onEstadoChange(e.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
              >
                {FILTER_OPTIONS.estado.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <CaretDown weight="bold" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
            </div>
          </div>

          {/* Buscador */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 min-w-0">
            <label className={FILTER_LABEL_CLASS}>Buscar vale</label>
            <div className="relative">
              <MagnifyingGlass weight="bold" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="N° de vale o centro..."
                className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition placeholder:text-muted hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:bg-surface-soft hover:text-ink"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Acciones e indicador de periodo */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-2.5 xl:border-t-0 xl:pt-0">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>
              Periodo: <strong className="font-semibold text-ink">{MESES[selectedMes - 1]} {selectedAnio}</strong>
            </span>
            {selectedCentroAcopio === 'todos' ? (
              <span className="rounded-md border border-status-warning-border bg-status-warning-bg px-2 py-0.5 text-[11px] font-medium text-status-warning-text">
                Elija un centro para emitir vales
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onEstadoChange('todos');
                  onCentroAcopioChange('todos');
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface-soft px-2.5 text-xs font-semibold text-muted-2 transition hover:bg-surface hover:text-ink"
              >
                <X className="h-3.5 w-3.5" weight="bold" />
                <span>Limpiar</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className={COMPONENT_STYLES.button.secondary}
            >
              <ArrowsClockwise weight="bold" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

ValesFilters.displayName = 'ValesFilters';
