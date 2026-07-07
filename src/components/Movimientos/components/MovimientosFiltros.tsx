import React, { memo } from 'react';
import { Gear, Buildings, Package, CalendarBlank, SpinnerGap } from '@phosphor-icons/react';
import { COMPONENT_STYLES, MESES } from '../constants';
import { Vacuna, CentroAcopio } from '../../../types';

interface MovimientosFiltrosProps {
  selectedCentroAcopio: string;
  selectedVacuna: string;
  selectedMes: number;
  selectedAnio: number;
  centrosAcopio: CentroAcopio[];
  vacunasActivas: Vacuna[];
  aniosDisponibles?: number[];
  isLoadingEstablecimientos: boolean;
  isLoadingVacunas: boolean;
  datosTablaLength: number;
  onCentroAcopioChange: (value: string) => void;
  onVacunaChange: (value: string) => void;
  onMesChange: (value: number) => void;
  onAnioChange: (value: number) => void;
}

export const MovimientosFiltros: React.FC<MovimientosFiltrosProps> = memo(({
  selectedCentroAcopio,
  selectedVacuna,
  selectedMes,
  selectedAnio,
  centrosAcopio,
  vacunasActivas,
  aniosDisponibles = [],
  isLoadingEstablecimientos,
  isLoadingVacunas,
  datosTablaLength,
  onCentroAcopioChange,
  onVacunaChange,
  onMesChange,
  onAnioChange,
}) => {

  return (
    <section className={COMPONENT_STYLES.filter.container} aria-label="Filtros">
      {/* Header */}
      <div className={COMPONENT_STYLES.filter.header}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-[12px] border border-line bg-surface-soft p-2.5">
              <Gear weight="bold" className="h-5 w-5 text-brand" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">Filtros de análisis</h3>
              <p className="text-sm text-zinc-600">Configura los parámetros de consulta</p>
            </div>
          </div>
          {(isLoadingEstablecimientos || isLoadingVacunas) && (
            <div className="flex items-center text-brand">
              <SpinnerGap weight="bold" className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm font-medium">Cargando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className={COMPONENT_STYLES.filter.body}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Centro de Acopio */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-zinc-700">
              <Buildings weight="bold" className="h-4 w-4 mr-2 text-brand" />
              Centro de Acopio
            </label>
            <select
              value={selectedCentroAcopio}
              onChange={(e) => onCentroAcopioChange(e.target.value)}
              disabled={isLoadingEstablecimientos}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}
            >
              <option value="todos">Todos los Centros</option>
              {centrosAcopio.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Vacuna */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-zinc-700">
              <Package weight="bold" className="h-4 w-4 mr-2 text-brand" />
              Vacuna
            </label>
            <select
              value={selectedVacuna}
              onChange={(e) => onVacunaChange(e.target.value)}
              disabled={isLoadingVacunas}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan}`}
            >
              {vacunasActivas.length === 0 && (
                <option value="">Seleccione una vacuna</option>
              )}
              {vacunasActivas.map((vacuna) => (
                <option key={vacuna.id} value={vacuna.id}>
                  {vacuna.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Mes */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-zinc-700">
              <CalendarBlank weight="bold" className="h-4 w-4 mr-2 text-brand" />
              Período
            </label>
            <select
              value={selectedMes}
              onChange={(e) => onMesChange(Number(e.target.value))}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}
            >
              {MESES.map((mes, index) => (
                <option key={index + 1} value={index + 1}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          {/* Año */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-zinc-700">
              <CalendarBlank weight="bold" className="h-4 w-4 mr-2 text-brand" />
              Año
            </label>
            <select
              value={selectedAnio}
              onChange={(e) => onAnioChange(Number(e.target.value))}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan}`}
            >
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estado de selección */}
        {selectedVacuna && (
          <div className="mt-6 pt-6 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-brand rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-zinc-800">
                  {datosTablaLength} establecimientos • {MESES[selectedMes - 1]} {selectedAnio}
                </span>
              </div>
              <span className="text-sm text-zinc-600 font-medium">
                {selectedCentroAcopio === 'todos' 
                  ? 'Todos los centros' 
                  : centrosAcopio.find(c => c.id === selectedCentroAcopio)?.nombre}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

MovimientosFiltros.displayName = 'MovimientosFiltros';
