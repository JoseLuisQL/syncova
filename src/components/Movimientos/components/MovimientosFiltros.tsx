import React, { memo } from 'react';
import { Settings, Building2, Package, Calendar, Loader2 } from 'lucide-react';
import { COMPONENT_STYLES, MESES, ANIOS_DISPONIBLES } from '../constants';
import { Vacuna, CentroAcopio } from '../../../types';
import { COLORES_CENTROS_ACOPIO } from '../../../utils/centroAcopioUtils';

interface MovimientosFiltrosProps {
  selectedCentroAcopio: string;
  selectedVacuna: string;
  selectedMes: number;
  selectedAnio: number;
  centrosAcopio: CentroAcopio[];
  vacunasActivas: Vacuna[];
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
  isLoadingEstablecimientos,
  isLoadingVacunas,
  datosTablaLength,
  onCentroAcopioChange,
  onVacunaChange,
  onMesChange,
  onAnioChange,
}) => {
  const coloresAcopio = COLORES_CENTROS_ACOPIO;

  return (
    <section className={COMPONENT_STYLES.filter.container} aria-label="Filtros">
      {/* Header */}
      <div className={COMPONENT_STYLES.filter.header}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-2.5 rounded-xl shadow-lg">
              <Settings className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filtros de Análisis</h3>
              <p className="text-sm text-gray-600">Configura los parámetros de consulta</p>
            </div>
          </div>
          {(isLoadingEstablecimientos || isLoadingVacunas) && (
            <div className="flex items-center text-teal-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Building2 className="h-4 w-4 mr-2 text-teal-600" />
              Centro de Acopio
            </label>
            <select
              value={selectedCentroAcopio}
              onChange={(e) => onCentroAcopioChange(e.target.value)}
              disabled={isLoadingEstablecimientos}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}
            >
              <option value="todos">Todos los Centros</option>
              {centrosAcopio.map((centro) => {
                const colores = coloresAcopio[centro.nombre as keyof typeof coloresAcopio] || coloresAcopio['DEFAULT'];
                return (
                  <option key={centro.id} value={centro.id}>
                    {colores.icon} {centro.nombre}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Vacuna */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Package className="h-4 w-4 mr-2 text-cyan-600" />
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
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Calendar className="h-4 w-4 mr-2 text-teal-600" />
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
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <Calendar className="h-4 w-4 mr-2 text-cyan-600" />
              Año
            </label>
            <select
              value={selectedAnio}
              onChange={(e) => onAnioChange(Number(e.target.value))}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan}`}
            >
              {ANIOS_DISPONIBLES.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estado de selección */}
        {selectedVacuna && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-800">
                  {datosTablaLength} establecimientos • {MESES[selectedMes - 1]} {selectedAnio}
                </span>
              </div>
              <span className="text-sm text-gray-600 font-medium">
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
