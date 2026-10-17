import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarBlank, CaretDown, MagnifyingGlass, SlidersHorizontal, X } from '@phosphor-icons/react';
import { Establecimiento, Jeringa, Vacuna } from '../../../types';
import {
  getMovimientoConfig,
  MOVIMIENTO_OPTIONS,
  TIPO_ITEM_OPTIONS,
} from '../constants';

interface Lote {
  id: string;
  numero: string;
  fechaVencimiento?: Date | string | null;
}

interface KardexFiltrosProps {
  selectedTipo: 'vacuna' | 'jeringa' | 'todos';
  selectedItem: string;
  selectedLote: string;
  fechaInicio: string;
  fechaFin: string;
  tipoMovimiento: string;
  searchTerm: string;
  establecimientoOrigenId: string;
  establecimientoDestinoId: string;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  establecimientos: Establecimiento[];
  lotes: Lote[];
  exportHint: string;
  onTipoChange: (tipo: 'vacuna' | 'jeringa' | 'todos') => void;
  onItemChange: (itemId: string) => void;
  onLoteChange: (loteId: string) => void;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  onTipoMovimientoChange: (tipo: string) => void;
  onSearchChange: (term: string) => void;
  onEstablecimientoOrigenChange: (establecimientoId: string) => void;
  onEstablecimientoDestinoChange: (establecimientoId: string) => void;
  onLimpiarFiltros: () => void;
}

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
}

interface SearchableSelectProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const FILTER_LABEL_CLASS = 'mb-1 block truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-muted';
const SELECT_BASE_CLASS =
  'h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted';

const formatExpiry = (value?: Date | string | null) => {
  if (!value) return 'Sin vencimiento';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin vencimiento';

  return `Vence ${date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`;
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      `${option.label} ${option.description || ''} ${option.keywords || ''}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [options, query]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <label htmlFor={id} className={FILTER_LABEL_CLASS}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-xs sm:text-sm font-medium shadow-2xs transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15 ${
          disabled
            ? 'cursor-not-allowed border-line bg-surface-muted text-muted'
            : selectedOption
            ? 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300'
            : 'border-line bg-surface text-ink hover:border-line-strong'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="min-w-0 truncate">
          {selectedOption ? selectedOption.label : <span className="text-muted font-normal">{placeholder}</span>}
        </span>
        <CaretDown className={`h-3.5 w-3.5 shrink-0 text-muted transition ${isOpen ? 'rotate-180' : ''}`} weight="bold" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 z-40 mt-1.5 w-[min(300px,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-2.5 shadow-lg">
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Filtrar ${label.toLowerCase()}...`}
              className="h-8 w-full rounded-lg border border-line bg-surface-muted pl-8 pr-2.5 text-xs text-ink outline-none focus:border-teal-600 focus:bg-surface"
              autoFocus
            />
          </div>

          <div className="mt-2 max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <span>{placeholder}</span>
              {!value ? <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300">Todos</span> : null}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-2.5 py-3 text-xs text-muted">Sin coincidencias.</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition ${
                    option.value === value
                      ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'hover:bg-surface-muted text-ink'
                  }`}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium">{option.label}</span>
                    {option.description ? (
                      <span className="block truncate text-[10px] text-muted">{option.description}</span>
                    ) : null}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const KardexFiltrosComponent: React.FC<KardexFiltrosProps> = ({
  selectedTipo,
  selectedItem,
  selectedLote,
  fechaInicio,
  fechaFin,
  tipoMovimiento,
  searchTerm,
  establecimientoOrigenId,
  establecimientoDestinoId,
  vacunas,
  jeringas,
  establecimientos,
  lotes,
  exportHint,
  onTipoChange,
  onItemChange,
  onLoteChange,
  onFechaInicioChange,
  onFechaFinChange,
  onTipoMovimientoChange,
  onSearchChange,
  onEstablecimientoOrigenChange,
  onEstablecimientoDestinoChange,
  onLimpiarFiltros,
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const itemOptions = useMemo<SelectOption[]>(() => {
    if (selectedTipo === 'vacuna') {
      return vacunas.map((vacuna) => ({
        value: vacuna.id,
        label: vacuna.nombre,
        description: vacuna.tipo,
        keywords: vacuna.presentacion,
      }));
    }

    if (selectedTipo === 'jeringa') {
      return jeringas.map((jeringa) => ({
        value: jeringa.id,
        label: jeringa.tipo,
        description: [jeringa.capacidad, jeringa.color].filter(Boolean).join(' · '),
        keywords: jeringa.estado,
      }));
    }

    return [];
  }, [jeringas, selectedTipo, vacunas]);

  const loteOptions = useMemo<SelectOption[]>(
    () =>
      lotes.map((lote) => ({
        value: lote.id,
        label: lote.numero,
        description: formatExpiry(lote.fechaVencimiento),
      })),
    [lotes],
  );

  const establecimientoOptions = useMemo<SelectOption[]>(
    () =>
      establecimientos.map((establecimiento) => ({
        value: establecimiento.id,
        label: establecimiento.nombre,
        description: establecimiento.codigo,
        keywords: [establecimiento.tipo, establecimiento.responsable].filter(Boolean).join(' '),
      })),
    [establecimientos],
  );

  const activeFilters = useMemo(() => {
    const movementLabel =
      tipoMovimiento !== 'todos'
        ? getMovimientoConfig(tipoMovimiento).label
        : '';
    const itemLabel = itemOptions.find((option) => option.value === selectedItem)?.label || '';
    const loteLabel = loteOptions.find((option) => option.value === selectedLote)?.label || '';
    const origenLabel =
      establecimientoOptions.find((option) => option.value === establecimientoOrigenId)?.label || '';
    const destinoLabel =
      establecimientoOptions.find((option) => option.value === establecimientoDestinoId)?.label || '';

    return [
      selectedTipo !== 'todos'
        ? {
            key: 'tipo',
            label: selectedTipo === 'vacuna' ? 'Tipo: Vacunas' : 'Tipo: Jeringas',
            clear: () => onTipoChange('todos'),
          }
        : null,
      fechaInicio
        ? {
            key: 'fechaInicio',
            label: `Desde: ${fechaInicio}`,
            clear: () => onFechaInicioChange(''),
          }
        : null,
      fechaFin
        ? {
            key: 'fechaFin',
            label: `Hasta: ${fechaFin}`,
            clear: () => onFechaFinChange(''),
          }
        : null,
      searchTerm.trim()
        ? {
            key: 'search',
            label: `Buscar: ${searchTerm.trim()}`,
            clear: () => onSearchChange(''),
          }
        : null,
      movementLabel
        ? {
            key: 'tipoMovimiento',
            label: `Movimiento: ${movementLabel}`,
            clear: () => onTipoMovimientoChange('todos'),
          }
        : null,
      itemLabel
        ? {
            key: 'item',
            label: `Producto: ${itemLabel}`,
            clear: () => onItemChange(''),
          }
        : null,
      loteLabel
        ? {
            key: 'lote',
            label: `Lote: ${loteLabel}`,
            clear: () => onLoteChange(''),
          }
        : null,
      origenLabel
        ? {
            key: 'origen',
            label: `Origen: ${origenLabel}`,
            clear: () => onEstablecimientoOrigenChange(''),
          }
        : null,
      destinoLabel
        ? {
            key: 'destino',
            label: `Destino: ${destinoLabel}`,
            clear: () => onEstablecimientoDestinoChange(''),
          }
        : null,
    ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;
  }, [
    establecimientoDestinoId,
    establecimientoOptions,
    establecimientoOrigenId,
    fechaFin,
    fechaInicio,
    itemOptions,
    loteOptions,
    onEstablecimientoDestinoChange,
    onEstablecimientoOrigenChange,
    onFechaFinChange,
    onFechaInicioChange,
    onItemChange,
    onLoteChange,
    onSearchChange,
    onTipoChange,
    onTipoMovimientoChange,
    searchTerm,
    selectedItem,
    selectedLote,
    selectedTipo,
    tipoMovimiento,
  ]);

  const advancedCount = [selectedLote, establecimientoOrigenId, establecimientoDestinoId].filter(Boolean).length;

  return (
    <section
      aria-label="Filtros del kardex"
      className="rounded-xl border border-line bg-surface p-3 shadow-2xs sm:p-4"
    >
      <div className="flex flex-col gap-3">
        {/* Fila principal de filtros directos */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {/* Buscador */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 min-w-0">
            <label htmlFor="kardex-search" className={FILTER_LABEL_CLASS}>
              Búsqueda rápida
            </label>
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="kardex-search"
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Documento, lote, producto..."
                className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-xs sm:text-sm text-ink shadow-2xs transition placeholder:text-muted hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:bg-surface-muted hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Tipo de producto */}
          <div className="min-w-0">
            <label htmlFor="kardex-tipo-item" className={FILTER_LABEL_CLASS}>
              Categoría
            </label>
            <div className="relative">
              <select
                id="kardex-tipo-item"
                value={selectedTipo}
                onChange={(event) => onTipoChange(event.target.value as 'vacuna' | 'jeringa' | 'todos')}
                className={SELECT_BASE_CLASS}
              >
                {TIPO_ITEM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" weight="bold" />
            </div>
          </div>

          {/* Producto específico */}
          <SearchableSelect
            id="kardex-item"
            label="Biológico / Insumo"
            value={selectedItem}
            options={itemOptions}
            placeholder={selectedTipo === 'todos' ? 'Elija categoría' : 'Todos'}
            disabled={selectedTipo === 'todos'}
            onChange={(value) => onItemChange(value)}
          />

          {/* Tipo de movimiento */}
          <div className="min-w-0">
            <label htmlFor="kardex-tipo-movimiento" className={FILTER_LABEL_CLASS}>
              Movimiento
            </label>
            <div className="relative">
              <select
                id="kardex-tipo-movimiento"
                value={tipoMovimiento}
                onChange={(event) => onTipoMovimientoChange(event.target.value)}
                className={SELECT_BASE_CLASS}
              >
                {MOVIMIENTO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" weight="bold" />
            </div>
          </div>

          {/* Botón de filtros avanzados (Fechas, Lote, Origen/Destino) */}
          <div className="flex items-end gap-1.5">
            <button
              type="button"
              onClick={() => setShowMoreFilters((prev) => !prev)}
              className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                showMoreFilters || fechaInicio || fechaFin || advancedCount > 0
                  ? 'border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                  : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-muted'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" weight="bold" />
              <span>Fechas y Lotes</span>
              {advancedCount + (fechaInicio ? 1 : 0) + (fechaFin ? 1 : 0) > 0 ? (
                <span className="rounded-full bg-teal-600 px-1.5 py-0.2 text-[10px] text-white tabular-nums">
                  {advancedCount + (fechaInicio ? 1 : 0) + (fechaFin ? 1 : 0)}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Panel colapsable limpio para Rango de Fechas, Lote, Origen y Destino */}
        {showMoreFilters ? (
          <div className="grid grid-cols-2 gap-2.5 border-t border-line pt-3 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <label htmlFor="kardex-fecha-inicio" className={FILTER_LABEL_CLASS}>
                Desde
              </label>
              <div className="relative">
                <CalendarBlank className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="kardex-fecha-inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(event) => onFechaInicioChange(event.target.value)}
                  className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-2.5 text-xs sm:text-sm font-medium text-ink outline-none transition hover:border-line-strong focus:border-teal-600 focus:ring-2 focus:ring-teal-500/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="kardex-fecha-fin" className={FILTER_LABEL_CLASS}>
                Hasta
              </label>
              <div className="relative">
                <CalendarBlank className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="kardex-fecha-fin"
                  type="date"
                  value={fechaFin}
                  onChange={(event) => onFechaFinChange(event.target.value)}
                  className="h-9 w-full rounded-lg border border-line bg-surface pl-8 pr-2.5 text-xs sm:text-sm font-medium text-ink outline-none transition hover:border-line-strong focus:border-teal-600 focus:ring-2 focus:ring-teal-500/15"
                />
              </div>
            </div>

            <SearchableSelect
              id="kardex-lote"
              label="Lote"
              value={selectedLote}
              options={loteOptions}
              placeholder={selectedItem ? 'Todos los lotes' : 'Elija producto'}
              disabled={!selectedItem}
              onChange={(value) => onLoteChange(value)}
            />

            <SearchableSelect
              id="kardex-origen"
              label="EESS Origen"
              value={establecimientoOrigenId}
              options={establecimientoOptions}
              placeholder="Todos los orígenes"
              onChange={(value) => onEstablecimientoOrigenChange(value)}
            />

            <SearchableSelect
              id="kardex-destino"
              label="EESS Destino"
              value={establecimientoDestinoId}
              options={establecimientoOptions}
              placeholder="Todos los destinos"
              onChange={(value) => onEstablecimientoDestinoChange(value)}
            />
          </div>
        ) : null}

        {/* Barra inferior de chips activos y estado de exportación */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {activeFilters.length > 0 ? (
              <>
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={filter.clear}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink transition hover:border-line-strong hover:bg-surface-strong"
                  >
                    <span>{filter.label}</span>
                    <X className="h-3 w-3 text-muted" weight="bold" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onLimpiarFiltros}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/10"
                >
                  <X className="h-3 w-3" weight="bold" />
                  <span>Limpiar todo</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-muted">Mostrando todos los registros de kardex</span>
            )}
          </div>

          <span className={`text-xs font-medium ${fechaInicio && fechaFin ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>
            {exportHint}
          </span>
        </div>
      </div>
    </section>
  );
};

export const KardexFiltros = memo(KardexFiltrosComponent);
KardexFiltros.displayName = 'KardexFiltros';