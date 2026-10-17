import React, { useState } from 'react';
import { CalendarBlank, CaretDown, Buildings, Package } from '@phosphor-icons/react';
import { Establecimiento, Vacuna } from '../../types';
import { FiltrosReporteBase } from '../../types/reportes';
import ProgramacionSeguimientoAnualTable from './ProgramacionSeguimientoAnualTable';

interface ProgramacionSeguimientoAnualTabProps {
  filtros: FiltrosReporteBase;
  setFiltros: (filtros: FiltrosReporteBase) => void;
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
  onGenerarReporte: (tipo: string) => void;
}

const SELECT_CLASS =
  'h-9 w-full appearance-none rounded-[9px] border border-line bg-surface pl-8 pr-8 text-[0.8rem] font-medium text-ink shadow-xs transition hover:border-line-strong focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/60 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted';

const LABEL_CLASS =
  'mb-1 block text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-muted-2';

const ProgramacionSeguimientoAnualTab: React.FC<ProgramacionSeguimientoAnualTabProps> = () => {
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleYearChange = (year: number) => {
    setSelectedAnio(year);
  };

  return (
    <div className="space-y-4 p-3 sm:p-5">
      <div className="rounded-xl border border-line bg-surface p-3 shadow-xs sm:p-3.5">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS}>Año de programación</label>
            <div className="relative">
              <CalendarBlank className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
              <select
                className={SELECT_CLASS}
                value={selectedAnio}
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Centro de acopio</label>
            <div className="relative">
              <Buildings className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
              <select className={SELECT_CLASS} disabled>
                <option>Todos los centros</option>
              </select>
              <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Tipo de ítem</label>
            <div className="relative">
              <Package className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
              <select className={SELECT_CLASS} disabled>
                <option>Todos los tipos</option>
              </select>
              <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
            </div>
          </div>
        </div>
      </div>

      <ProgramacionSeguimientoAnualTable anio={selectedAnio} />
    </div>
  );
};

export default ProgramacionSeguimientoAnualTab;
