import React, { useState } from 'react';
import {
  Funnel,
  ChartBar
} from '@phosphor-icons/react';
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

const ProgramacionSeguimientoAnualTab: React.FC<ProgramacionSeguimientoAnualTabProps> = () => {
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Handle year change.
  // La recarga de datos la dispara automáticamente ProgramacionSeguimientoAnualTable
  // vía su useEffect con dependencia [anio], así que aquí solo actualizamos el estado.
  const handleYearChange = (year: number) => {
    setSelectedAnio(year);
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header Premium */}
      <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-4 shadow-sm sm:p-6">
        <div className="flex items-center mb-4">
          <div className="rounded-xl bg-teal-600 p-3 shadow-lg shadow-teal-500/20">
            <ChartBar weight="duotone" className="h-8 w-8 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-zinc-900">Programación y Seguimiento Anual</h2>
            <p className="text-zinc-600">Gestión integral y monitoreo de entregas CENARES</p>
          </div>
        </div>
      </div>

      {/* Filters Premium */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 flex items-center text-lg font-semibold text-zinc-900">
          <Funnel className="mr-2 h-5 w-5 text-teal-600" />
          Filtros de Programación
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700">Año de Programación</label>
            <select
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg font-semibold shadow-sm transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
              value={selectedAnio}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Placeholder for future filters */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700">Centro de Acopio</label>
            <select
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
              disabled
            >
              <option>Todos los centros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700">Tipo de Ítem</label>
            <select
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
              disabled
            >
              <option>Todos los tipos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Table */}
      <ProgramacionSeguimientoAnualTable
        anio={selectedAnio}
      />
    </div>
  );
};

export default ProgramacionSeguimientoAnualTab;
