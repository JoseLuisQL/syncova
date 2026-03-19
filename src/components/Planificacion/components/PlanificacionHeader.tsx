import React, { memo } from 'react';
import {
  Calendar,
  RefreshCw,
  Download,
  Upload,
  Save,
  Loader2,
  Building2,
  Package,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Vacuna, CentroAcopio } from '../../../types';

interface PlanificacionHeaderProps {
  isReadOnly?: boolean;
  lockedCentroAcopioLabel?: string;
  showReadOnlyCentroFilter?: boolean;
  allCentrosLabel?: string;
  // Filtros
  selectedAnio: number;
  selectedCentroAcopio: string;
  selectedVacuna: string;
  centrosAcopio: CentroAcopio[];
  vacunas: Vacuna[];
  aniosDisponibles: number[];
  establecimientosCount: number;
  totalGeneral: number;
  onAnioChange: (anio: number) => void;
  onCentroAcopioChange: (id: string) => void;
  onVacunaChange: (id: string) => void;
  // Estados
  isLoading: boolean;
  isLoadingAnios?: boolean;
  isUpdating: boolean;
  isImporting: boolean;
  isExporting: boolean;
  pendingChangesCount: number;
  // Acciones
  onRefresh: () => void;
  onImportar: () => void;
  onExportar: () => void;
  onGuardarPendientes: () => void;
}

export const PlanificacionHeader: React.FC<PlanificacionHeaderProps> = memo(({
  isReadOnly = false,
  lockedCentroAcopioLabel,
  showReadOnlyCentroFilter = false,
  allCentrosLabel = 'Todos',
  selectedAnio,
  selectedCentroAcopio,
  selectedVacuna,
  centrosAcopio,
  vacunas,
  aniosDisponibles,
  establecimientosCount,
  totalGeneral,
  onAnioChange,
  onCentroAcopioChange,
  onVacunaChange,
  isLoading,
  isLoadingAnios,
  isUpdating,
  isImporting,
  isExporting,
  pendingChangesCount,
  onRefresh,
  onImportar,
  onExportar,
  onGuardarPendientes,
}) => {
  const vacunaSeleccionada = vacunas.find(v => v.id === selectedVacuna);
  const shouldRenderCentroSelect = !isReadOnly || showReadOnlyCentroFilter;
  const centroNombre = selectedCentroAcopio === 'todos'
    ? allCentrosLabel
    : centrosAcopio.find(c => c.id === selectedCentroAcopio)?.nombre || '';

  return (
    <header className="sticky top-0 z-20">
      {/* Barra Principal */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Izquierda: Título */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl blur-lg opacity-40"></div>
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Planificación Anual
                </h1>
                <p className="text-sm text-gray-500">
                  Programación de vacunas por establecimiento
                </p>
              </div>
            </div>

            {/* Centro: Filtros */}
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100">
                  <Filter className="h-4 w-4 text-teal-600" />
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {/* Centro de Acopio */}
                  {shouldRenderCentroSelect ? (
                    <div className="relative group">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 z-10 transition-colors group-hover:text-teal-600" />
                      <select
                        value={selectedCentroAcopio}
                        onChange={(e) => onCentroAcopioChange(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-10 pr-8 py-2.5 text-sm font-medium bg-white rounded-xl border border-gray-200
                                   focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400
                                   hover:border-teal-300 hover:shadow-sm transition-all duration-200 cursor-pointer
                                   disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="todos">{allCentrosLabel}</option>
                        {centrosAcopio.map((centro) => (
                          <option key={centro.id} value={centro.id}>
                            {centro.nombre}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-700">
                      <Building2 className="h-4 w-4 text-teal-600" />
                      <span className="truncate">{lockedCentroAcopioLabel || centroNombre}</span>
                    </div>
                  )}

                  {/* Vacuna */}
                  <div className="relative group">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500 z-10 transition-colors group-hover:text-cyan-600" />
                    <select
                      value={selectedVacuna}
                      onChange={(e) => onVacunaChange(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-8 py-2.5 text-sm font-medium bg-white rounded-xl border border-gray-200
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400
                                 hover:border-cyan-300 hover:shadow-sm transition-all duration-200 cursor-pointer
                                 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    >
                      {vacunas.length === 0 && <option value="">Seleccione...</option>}
                      {vacunas.map((vacuna) => (
                        <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Año */}
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-teal-600 z-10">AÑO</span>
                    <select
                      value={selectedAnio}
                      onChange={(e) => onAnioChange(Number(e.target.value))}
                      disabled={isLoadingAnios}
                      className="w-full pl-12 pr-8 py-2.5 text-sm font-medium bg-white rounded-xl border border-gray-200
                                 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400
                                 hover:border-teal-300 hover:shadow-sm transition-all duration-200 cursor-pointer appearance-none
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aniosDisponibles.map((anio) => (
                        <option key={anio} value={anio}>{anio}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {isLoading && (
                  <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />
                )}
              </div>
            </div>

            {/* Derecha: Acciones */}
            <div className="flex items-center gap-2">
              {!isReadOnly && pendingChangesCount > 0 && (
                <button
                  onClick={onGuardarPendientes}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                             text-white bg-gradient-to-r from-amber-500 to-orange-500
                             hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25
                             disabled:opacity-50 transition-all duration-200"
                >
                  <Save className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                  <span className="hidden xl:inline">Guardar</span>
                  <span className="bg-white/25 px-1.5 py-0.5 rounded-full text-xs">{pendingChangesCount}</span>
                </button>
              )}

              <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={onRefresh}
                  disabled={isLoading || !selectedVacuna}
                  className="flex items-center justify-center p-2.5 text-gray-600 hover:bg-gray-50
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all border-r border-gray-200"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                {!isReadOnly ? (
                  <button
                    onClick={onImportar}
                    disabled={isImporting}
                    className="flex items-center justify-center p-2.5 text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
                  >
                    <Upload className={`h-4 w-4 ${isImporting ? 'animate-spin' : ''}`} />
                  </button>
                ) : null}
              </div>

              {!isReadOnly ? (
                <button
                  onClick={onExportar}
                  disabled={isExporting || !selectedVacuna}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                             text-white bg-gradient-to-r from-teal-500 to-cyan-500
                             hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/25
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'Exportar'}</span>
                </button>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                  Vista solo lectura
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Contexto */}
      <div style={{ backgroundColor: '#11a394' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Izquierda: Contexto */}
            <div className="flex items-center gap-4">
              {/* Badge de Vacuna */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Package className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  {vacunaSeleccionada?.nombre || 'Sin seleccionar'}
                </span>
              </div>

              {/* Separador */}
              <div className="hidden sm:block w-px h-5 bg-white/30"></div>

              {/* Año y Centro */}
              <div className="hidden sm:flex items-center gap-3 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white/70" />
                  {selectedAnio}
                </span>
                <span className="text-white/50">•</span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-white/70" />
                  {centroNombre}
                </span>
              </div>

              {/* Separador */}
              <div className="hidden md:block w-px h-5 bg-white/30"></div>

              {/* Contador de Establecimientos */}
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-sm font-medium text-white">{establecimientosCount}</span>
                <span className="text-xs text-white/70">establecimientos</span>
              </div>
            </div>

            {/* Derecha: Total */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <div className="text-right">
                  <div className="text-[10px] text-white/80 font-medium uppercase tracking-wide">Total Programado</div>
                  <div className="text-xl font-bold text-white leading-none">{totalGeneral.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

PlanificacionHeader.displayName = 'PlanificacionHeader';
