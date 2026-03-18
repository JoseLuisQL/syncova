import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from 'lucide-react';
import { Establecimiento, Jeringa, Vacuna } from '../../../types';
import {
  COMPONENT_STYLES,
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
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className={COMPONENT_STYLES.input.label}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} flex items-center justify-between gap-3 text-left ${
          disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="min-w-0">
          {selectedOption ? (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-slate-900">{selectedOption.label}</span>
              {selectedOption.description ? (
                <span className="truncate text-xs text-slate-500">{selectedOption.description}</span>
              ) : null}
            </span>
          ) : (
            <span className="text-sm text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 z-30 mt-2 w-full rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.35)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar ${label.toLowerCase()}...`}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} pl-9`}
              autoFocus
            />
          </div>

          <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/60 p-1">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              <span>{placeholder}</span>
              {!value ? <span className="text-xs font-medium text-teal-700">Activo</span> : null}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-500">No se encontraron coincidencias.</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    option.value === value
                      ? 'bg-white shadow-sm ring-1 ring-teal-200'
                      : 'hover:bg-white hover:shadow-sm'
                  }`}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">{option.label}</span>
                    {option.description ? (
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{option.description}</span>
                    ) : null}
                  </span>
                  {option.value === value ? (
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">Actual</span>
                  ) : null}
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  return (
    <section aria-label="Filtros del kardex" className={COMPONENT_STYLES.panel}>
      <div className="space-y-4 p-4">
        <div className="grid gap-3 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <label htmlFor="kardex-search" className={COMPONENT_STYLES.input.label}>
              Buscar
            </label>
            <div className="relative">
              <Search className={COMPONENT_STYLES.filter.searchIcon} aria-hidden="true" />
              <input
                id="kardex-search"
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Documento, lote, observación o producto"
                className={COMPONENT_STYLES.filter.searchInput}
              />
            </div>
          </div>

          <div className="xl:col-span-2">
            <label htmlFor="kardex-fecha-inicio" className={COMPONENT_STYLES.input.label}>
              Desde
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="kardex-fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(event) => onFechaInicioChange(event.target.value)}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} pl-9`}
              />
            </div>
          </div>

          <div className="xl:col-span-2">
            <label htmlFor="kardex-fecha-fin" className={COMPONENT_STYLES.input.label}>
              Hasta
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="kardex-fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(event) => onFechaFinChange(event.target.value)}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} pl-9`}
              />
            </div>
          </div>

          <div className="xl:col-span-3">
            <label className={COMPONENT_STYLES.input.label}>Movimiento</label>
            <div className="flex flex-wrap gap-1.5">
              {MOVIMIENTO_OPTIONS.map((option) => {
                const isSelected = tipoMovimiento === option.value;
                const selectedClass =
                  option.value === 'todos'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : getMovimientoConfig(option.value).chipClassName;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onTipoMovimientoChange(option.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      isSelected
                        ? selectedClass
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-12">
          <div className="xl:col-span-3">
            <label htmlFor="kardex-tipo-item" className={COMPONENT_STYLES.input.label}>
              Tipo de producto
            </label>
            <select
              id="kardex-tipo-item"
              value={selectedTipo}
              onChange={(event) => onTipoChange(event.target.value as 'vacuna' | 'jeringa' | 'todos')}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
            >
              {TIPO_ITEM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="xl:col-span-5">
            <SearchableSelect
              id="kardex-item"
              label="Producto específico"
              value={selectedItem}
              options={itemOptions}
              placeholder={selectedTipo === 'todos' ? 'Seleccione antes el tipo' : 'Todos los productos'}
              disabled={selectedTipo === 'todos'}
              onChange={(value) => onItemChange(value)}
            />
          </div>

          <div className="xl:col-span-4">
            <SearchableSelect
              id="kardex-lote"
              label="Lote"
              value={selectedLote}
              options={loteOptions}
              placeholder={selectedItem ? 'Todos los lotes' : 'Seleccione antes un producto'}
              disabled={!selectedItem}
              onChange={(value) => onLoteChange(value)}
            />
          </div>
        </div>

        {showAdvanced ? (
          <div className="grid gap-3 border-t border-slate-100 pt-3 md:grid-cols-2">
            <SearchableSelect
              id="kardex-origen"
              label="Establecimiento origen"
              value={establecimientoOrigenId}
              options={establecimientoOptions}
              placeholder="Todos los orígenes"
              onChange={(value) => onEstablecimientoOrigenChange(value)}
            />

            <SearchableSelect
              id="kardex-destino"
              label="Establecimiento destino"
              value={establecimientoDestinoId}
              options={establecimientoOptions}
              placeholder="Todos los destinos"
              onChange={(value) => onEstablecimientoDestinoChange(value)}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.clear}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  <span>{filter.label}</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${fechaInicio && fechaFin ? 'text-emerald-700' : 'text-amber-700'}`}>
              {exportHint}
            </span>

            <div className="flex items-center gap-2">
              {activeFilters.length > 0 ? (
                <button type="button" onClick={onLimpiarFiltros} className={COMPONENT_STYLES.button.ghost}>
                  <X className="h-4 w-4" />
                  <span>Limpiar</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setShowAdvanced((current) => !current)}
                className={COMPONENT_STYLES.button.ghost}
                aria-expanded={showAdvanced}
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>{showAdvanced ? 'Ocultar filtros' : 'Más filtros'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const KardexFiltros = memo(KardexFiltrosComponent);
KardexFiltros.displayName = 'KardexFiltros';
