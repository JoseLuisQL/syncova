import React, { useState } from 'react';
import {
  Calendar
} from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900">Programación y Seguimiento Anual</h2>
            <p className="text-gray-600">Gestión y monitoreo de entregas CENARES</p>
          </div>
        </div>
      </div>

      {/* Year Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Año de Programación
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-semibold"
              value={selectedAnio}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
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
