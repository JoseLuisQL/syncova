import React, { memo } from 'react';
import {
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Receipt,
  Save,
  Loader2,
  Building2,
  Package,
  Calendar,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { MESES, ANIOS_DISPONIBLES } from '../constants';
import { Vacuna, CentroAcopio } from '../../../types';
import { COLORES_CENTROS_ACOPIO } from '../../../utils/centroAcopioUtils';

interface MovimientosHeaderCompactProps {
  // Filtros
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
  // Acciones
  pendingChangesCount: number;
  isAutoSaving: boolean;
  isLoading: boolean;
  isExporting: boolean;
  onSaveChanges: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenVales: () => void;
}

export const MovimientosHeaderCompact: React.FC<MovimientosHeaderCompactProps> = memo(({
  // Filtros
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
  // Acciones
  pendingChangesCount,
  isAutoSaving,
  isLoading,
  isExporting,
  onSaveChanges,
  onRefresh,
  onExport,
  onImport,
  onOpenVales,
}) => {
  const coloresAcopio = COLORES_CENTROS_ACOPIO;
  const centroNombre = selectedCentroAcopio === 'todos'
    ? 'Todos los centros'
    : centrosAcopio.find(c => c.id === selectedCentroAcopio)?.nombre || '';

  const selectBaseStyles = `
    w-full pl-9 pr-8 py-2.5 text-sm font-medium 
    bg-white border border-gray-200 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
    hover:border-teal-400 hover:bg-teal-50/30
    transition-all duration-200 cursor-pointer
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
    appearance-none
  `;

  const buttonPrimaryStyles = `
    flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
    text-white bg-gradient-to-r from-teal-600 to-cyan-600
    hover:from-teal-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-teal-500/25
    active:from-teal-800 active:to-cyan-800
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
    transition-all duration-200
  `;

  return (
    <header className="bg-gradient-to-b from-white to-gray-50/80 border-b border-gray-200/80 sticky top-0 z-20">
      {/* Barra Principal */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Layout Grid Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Columna 1: Título e Info (3 cols en lg) */}
            <div className="lg:col-span-3 flex items-center gap-3">
              <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-lg shadow-teal-500/20">
                <BarChart3 className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  Movimientos de Vacunas
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-medium text-gray-600">{datosTablaLength}</span> establecimientos
                  </span>
                </div>
              </div>
            </div>

            {/* Columna 2: Filtros (6 cols en lg) */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-2 p-2 bg-gray-100/60 rounded-2xl">
                {/* Icono de Filtros */}
                <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-sm border border-gray-200/80">
                  <Filter className="h-4 w-4 text-teal-600" />
                </div>

                {/* Grid de Filtros */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Centro de Acopio */}
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 pointer-events-none z-10" />
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      value={selectedCentroAcopio}
                      onChange={(e) => onCentroAcopioChange(e.target.value)}
                      disabled={isLoadingEstablecimientos}
                      className={selectBaseStyles}
                      title="Centro de Acopio"
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
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500 pointer-events-none z-10" />
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      value={selectedVacuna}
                      onChange={(e) => onVacunaChange(e.target.value)}
                      disabled={isLoadingVacunas}
                      className={selectBaseStyles}
                      title="Vacuna"
                    >
                      {vacunasActivas.length === 0 && (
                        <option value="">Seleccione...</option>
                      )}
                      {vacunasActivas.map((vacuna) => (
                        <option key={vacuna.id} value={vacuna.id}>
                          {vacuna.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mes */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 pointer-events-none z-10" />
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      value={selectedMes}
                      onChange={(e) => onMesChange(Number(e.target.value))}
                      className={selectBaseStyles}
                      title="Mes"
                    >
                      {MESES.map((mes, index) => (
                        <option key={index + 1} value={index + 1}>
                          {mes}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Año */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-600 pointer-events-none z-10">
                      AÑO
                    </span>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      value={selectedAnio}
                      onChange={(e) => onAnioChange(Number(e.target.value))}
                      className={`${selectBaseStyles} pl-12`}
                      title="Año"
                    >
                      {ANIOS_DISPONIBLES.map((anio) => (
                        <option key={anio} value={anio}>
                          {anio}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Indicador de carga */}
                {(isLoadingEstablecimientos || isLoadingVacunas || isLoading) && (
                  <div className="hidden sm:flex items-center justify-center w-9 h-9">
                    <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Columna 3: Acciones (3 cols en lg) */}
            <div className="lg:col-span-3 flex items-center justify-end gap-2">
              {/* Guardar cambios pendientes */}
              {pendingChangesCount > 0 && (
                <button
                  onClick={onSaveChanges}
                  disabled={isAutoSaving}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                    text-white bg-gradient-to-r from-amber-500 to-orange-500
                    hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/25
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 animate-pulse
                  `}
                  title={`Guardar ${pendingChangesCount} cambio(s) pendiente(s)`}
                >
                  <Save className={`h-4 w-4 ${isAutoSaving ? 'animate-spin' : ''}`} />
                  <span className="hidden xl:inline">Guardar</span>
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/25 text-xs font-bold">
                    {pendingChangesCount}
                  </span>
                </button>
              )}

              {/* Grupo de botones secundarios */}
              <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Vales */}
                <button
                  onClick={onOpenVales}
                  disabled={!selectedVacuna || selectedCentroAcopio === 'todos'}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium
                             text-gray-700 hover:bg-teal-50 hover:text-teal-700
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
                             transition-all duration-200 border-r border-gray-200"
                  title={selectedCentroAcopio === 'todos' ? 'Seleccione un centro de acopio' : 'Ver vales de entrega'}
                >
                  <Receipt className="h-4 w-4" />
                  <span className="hidden xl:inline">Vales</span>
                </button>

                {/* Actualizar */}
                <button
                  onClick={onRefresh}
                  disabled={isLoading || !selectedVacuna}
                  className="flex items-center justify-center p-2.5 text-gray-600 
                             hover:bg-teal-50 hover:text-teal-700
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200 border-r border-gray-200"
                  title="Actualizar datos"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                {/* Importar */}
                <button
                  onClick={onImport}
                  className="flex items-center justify-center p-2.5 text-gray-600 
                             hover:bg-cyan-50 hover:text-cyan-700
                             transition-all duration-200"
                  title="Importar desde Excel"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>

              {/* Exportar - Botón destacado */}
              <button
                onClick={onExport}
                disabled={isExporting || !selectedVacuna}
                className={buttonPrimaryStyles}
                title={!selectedVacuna ? 'Seleccione una vacuna para exportar' : 'Exportar a Excel'}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isExporting ? 'Exportando...' : 'Exportar'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de contexto inferior */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="flex items-center justify-between text-white text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4 opacity-80" />
              <span className="font-medium">
                {vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Sin seleccionar'}
              </span>
            </span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span className="hidden sm:flex items-center gap-2">
              <Calendar className="h-4 w-4 opacity-80" />
              <span>{MESES[selectedMes - 1]} {selectedAnio}</span>
            </span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:flex items-center gap-2">
              <Building2 className="h-4 w-4 opacity-80" />
              <span>{centroNombre}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {datosTablaLength} registros
            </span>
          </div>
        </div>
      </div>
    </header>
  );
});

MovimientosHeaderCompact.displayName = 'MovimientosHeaderCompact';
