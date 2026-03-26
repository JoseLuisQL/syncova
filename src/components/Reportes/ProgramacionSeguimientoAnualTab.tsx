import React, { useState } from 'react';
import {
  Filter,
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

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedAnio(year);
    // TODO: Load data for the selected year
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Premium */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
            <ChartBar weight="duotone" className="h-8 w-8 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">Programación y Seguimiento Anual</h2>
            <p className="text-gray-600">Gestión integral y monitoreo de entregas CENARES</p>
          </div>
        </div>
      </div>

      {/* Filters Premium */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl border border-blue-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          Filtros de Programación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Año de Programación</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold bg-white shadow-sm transition-all duration-200 hover:border-blue-400"
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
            <label className="block text-sm font-semibold text-gray-700">Centro de Acopio</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-blue-400"
              disabled
            >
              <option>Todos los centros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tipo de Ítem</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 hover:border-blue-400"
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
        onDataChange={() => {
          // Handle data changes if needed
          console.log('Data changed for year:', selectedAnio);
        }}
      />
    </div>
  );
};

export default ProgramacionSeguimientoAnualTab;
