import React, { memo } from 'react';
import { Buildings, Package, CalendarBlank, CaretDown, CircleNotch } from '@phosphor-icons/react';
import { MESES } from '../constants';
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

const FILTER_LABEL_CLASS = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted';
const SELECT_BASE_CLASS =
  'h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-8 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted';

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
    <section className="rounded-xl border border-line bg-surface p-3.5 shadow-2xs sm:p-4" aria-label="Filtros">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <label className="block min-w-0">
          <span className={FILTER_LABEL_CLASS}>Centro de Acopio</span>
          <div className="relative">
            <Buildings weight="duotone" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <select
              value={selectedCentroAcopio}
              onChange={(e) => onCentroAcopioChange(e.target.value)}
              disabled={isLoadingEstablecimientos}
              className={SELECT_BASE_CLASS}
            >
              <option value="todos">Todos los centros</option>
              {centrosAcopio.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  {centro.nombre}
                </option>
              ))}
            </select>
            <CaretDown weight="bold" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </label>

        <label className="block min-w-0">
          <span className={FILTER_LABEL_CLASS}>Vacuna</span>
          <div className="relative">
            <Package weight="duotone" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <select
              value={selectedVacuna}
              onChange={(e) => onVacunaChange(e.target.value)}
              disabled={isLoadingVacunas}
              className={SELECT_BASE_CLASS}
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
            <CaretDown weight="bold" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </label>

        <label className="block min-w-0">
          <span className={FILTER_LABEL_CLASS}>Período</span>
          <div className="relative">
            <CalendarBlank weight="duotone" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <select
              value={selectedMes}
              onChange={(e) => onMesChange(Number(e.target.value))}
              className={SELECT_BASE_CLASS}
            >
              {MESES.map((mes, index) => (
                <option key={index + 1} value={index + 1}>
                  {mes}
                </option>
              ))}
            </select>
            <CaretDown weight="bold" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </label>

        <label className="block min-w-0">
          <span className={FILTER_LABEL_CLASS}>Año</span>
          <div className="relative">
            <CalendarBlank weight="duotone" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <select
              value={selectedAnio}
              onChange={(e) => onAnioChange(Number(e.target.value))}
              className={`${SELECT_BASE_CLASS} tabular-nums font-semibold`}
            >
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
            <CaretDown weight="bold" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </label>
      </div>

      {selectedVacuna && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <span className="font-semibold text-ink">
              {datosTablaLength} establecimientos • {MESES[selectedMes - 1]} {selectedAnio}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(isLoadingEstablecimientos || isLoadingVacunas) && (
              <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
                <CircleNotch weight="bold" className="h-3.5 w-3.5 animate-spin" />
                Cargando...
              </span>
            )}
            <span className="font-medium text-muted">
              {selectedCentroAcopio === 'todos'
                ? 'Todos los centros'
                : centrosAcopio.find((c) => c.id === selectedCentroAcopio)?.nombre}
            </span>
          </div>
        </div>
      )}
    </section>
  );
});

MovimientosFiltros.displayName = 'MovimientosFiltros';
