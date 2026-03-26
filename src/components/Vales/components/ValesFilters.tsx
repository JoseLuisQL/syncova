import React, { memo } from 'react';
import { MagnifyingGlass, Buildings, CalendarBlank, ArrowsClockwise, CaretDown, CaretUp } from '@phosphor-icons/react';
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
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className={COMPONENT_STYLES.filter.container}>
      {/* Filtros principales (siempre visibles) */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Centro de Acopio */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Buildings weight="duotone" className="h-4 w-4 text-zinc-500" />
              Centro de Acopio
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCentroAcopio}
              onChange={(e) => onCentroAcopioChange(e.target.value)}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}
            >
              <option value="todos">Todos los centros</option>
              {centrosAcopio.map(centro => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
            {selectedCentroAcopio === 'todos' && (
              <p className="text-xs text-amber-600 mt-1">
                Seleccione un centro para generar vales
              </p>
            )}
          </div>

          {/* Mes */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <CalendarBlank weight="duotone" className="h-4 w-4 text-zinc-500" />
              Mes
            </label>
            <select
              value={selectedMes}
              onChange={(e) => onMesChange(parseInt(e.target.value))}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan}`}
            >
              {MESES.map((mes, index) => (
                <option key={index + 1} value={index + 1}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <CalendarBlank weight="duotone" className="h-4 w-4 text-zinc-500" />
              Ano
            </label>
            <select
              value={selectedAnio}
              onChange={(e) => onAnioChange(parseInt(e.target.value))}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.emerald}`}
            >
              {ANIOS_DISPONIBLES.map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle filtros avanzados */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mt-3 transition-colors outline-none focus:ring-2 focus:ring-zinc-900/10 rounded-md px-2 py-1"
        >
          {showAdvanced ? (
            <>
              <CaretUp weight="bold" className="h-4 w-4" />
              Ocultar filtros avanzados
            </>
          ) : (
            <>
              <CaretDown weight="bold" className="h-4 w-4" />
              Mostrar filtros avanzados
            </>
          )}
        </button>

        {/* Filtros avanzados (colapsables) */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
            {/* Busqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlass weight="bold" className={COMPONENT_STYLES.filter.searchIcon} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar por numero o centro..."
                  className={COMPONENT_STYLES.filter.searchInput}
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Estado
              </label>
              <select
                value={selectedEstado}
                onChange={(e) => onEstadoChange(e.target.value)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}
              >
                {FILTER_OPTIONS.estado.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Barra de acciones */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Periodo: <strong>{MESES[selectedMes - 1]} {selectedAnio}</strong>
        </span>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={COMPONENT_STYLES.button.secondary}
        >
          <ArrowsClockwise weight="bold" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>
    </div>
  );
});

ValesFilters.displayName = 'ValesFilters';
