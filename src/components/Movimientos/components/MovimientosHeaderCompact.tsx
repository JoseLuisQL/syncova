import React, { memo, useState, useRef, useEffect } from 'react';
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
  Truck,
  TrendingUp,
  Boxes,
  AlertTriangle,
  ArrowRight,
  Settings2,
} from 'lucide-react';
import { MESES } from '../constants';
import { Vacuna, CentroAcopio } from '../../../types';

interface StockInfo {
  stockInicialHistorico: number | null;
  stockInicialOriginal: number | null;
  ingresosLotesDelMes: number;
  fechaCapturaStockInicial: Date | null;
  stockActual: number;
  totalEntregas: number;
  stockDisponible: number;
  estado: 'bueno' | 'medio' | 'critico';
  tieneHistorialInicial: boolean;
  lotes: Array<{
    id: string;
    numero: string;
    cantidadActual: number;
    fechaVencimiento: Date;
    estado: string;
  }>;
}

interface MovimientosHeaderCompactProps {
  // Filtros
  selectedCentroAcopio: string;
  selectedVacuna: string;
  selectedMes: number;
  selectedAnio: number;
  centrosAcopio: CentroAcopio[];
  vacunasActivas: Vacuna[];
  aniosDisponibles: number[];
  isLoadingEstablecimientos: boolean;
  isLoadingVacunas: boolean;
  isLoadingAnios?: boolean;
  datosTablaLength: number;
  onCentroAcopioChange: (value: string) => void;
  onVacunaChange: (value: string) => void;
  onMesChange: (value: number) => void;
  onAnioChange: (value: number) => void;
  // Stock
  stockInfo: StockInfo | null;
  stockError: string | null;
  isLoadingStock: boolean;
  isUpdatingStock: boolean;
  isUpdatingStockSiguienteMes: boolean;
  onRetryStock: () => void;
  onActualizarStockSiguienteMes: () => void;
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
  // Ajuste de Deficit
  onOpenAjusteDeficit?: () => void;
  ajusteDeficitDisponible?: boolean;
}

export const MovimientosHeaderCompact: React.FC<MovimientosHeaderCompactProps> = memo(({
  // Filtros
  selectedCentroAcopio,
  selectedVacuna,
  selectedMes,
  selectedAnio,
  centrosAcopio,
  vacunasActivas,
  aniosDisponibles,
  isLoadingEstablecimientos,
  isLoadingVacunas,
  isLoadingAnios,
  datosTablaLength,
  onCentroAcopioChange,
  onVacunaChange,
  onMesChange,
  onAnioChange,
  // Stock
  stockInfo,
  stockError,
  isLoadingStock,
  isUpdatingStock,
  isUpdatingStockSiguienteMes,
  onRetryStock,
  onActualizarStockSiguienteMes,
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
  // Ajuste de Deficit
  onOpenAjusteDeficit,
  ajusteDeficitDisponible = false,
}) => {
  const [showStockInicialDropdown, setShowStockInicialDropdown] = useState(false);
  const [showStockActualDropdown, setShowStockActualDropdown] = useState(false);
  
  const stockInicialRef = useRef<HTMLDivElement>(null);
  const stockActualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stockInicialRef.current && !stockInicialRef.current.contains(event.target as Node)) {
        setShowStockInicialDropdown(false);
      }
      if (stockActualRef.current && !stockActualRef.current.contains(event.target as Node)) {
        setShowStockActualDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const centroNombre = selectedCentroAcopio === 'todos'
    ? 'Todos los centros'
    : centrosAcopio.find(c => c.id === selectedCentroAcopio)?.nombre || '';

  const lotesDisponibles = stockInfo?.lotes.filter(l => l.cantidadActual > 0) || [];

  return (
    <header className="sticky top-0 z-20">
      {/* Barra Principal - Fondo blanco elegante */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Izquierda: Título */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl blur-lg opacity-40"></div>
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Movimientos de Vacunas
                </h1>
                <p className="text-sm text-gray-500">
                  Gestión de entregas y movimientos por establecimiento
                </p>
              </div>
            </div>

            {/* Centro: Filtros */}
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100">
                  <Filter className="h-4 w-4 text-teal-600" />
                </div>
                
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Centro de Acopio */}
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 z-10 transition-colors group-hover:text-teal-600" />
                    <select
                      value={selectedCentroAcopio}
                      onChange={(e) => onCentroAcopioChange(e.target.value)}
                      disabled={isLoadingEstablecimientos}
                      className="w-full pl-10 pr-8 py-2.5 text-sm font-medium bg-white rounded-xl border border-gray-200
                                 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400
                                 hover:border-teal-300 hover:shadow-sm transition-all duration-200 cursor-pointer
                                 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    >
                      <option value="todos">Todos</option>
                      {centrosAcopio.map((centro) => (
                        <option key={centro.id} value={centro.id}>
                          {centro.nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Vacuna */}
                  <div className="relative group">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500 z-10 transition-colors group-hover:text-cyan-600" />
                    <select
                      value={selectedVacuna}
                      onChange={(e) => onVacunaChange(e.target.value)}
                      disabled={isLoadingVacunas}
                      className="w-full pl-10 pr-8 py-2.5 text-sm font-medium bg-white rounded-xl border border-gray-200
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400
                                 hover:border-cyan-300 hover:shadow-sm transition-all duration-200 cursor-pointer
                                 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    >
                      {vacunasActivas.length === 0 && <option value="">Seleccione...</option>}
                      {vacunasActivas.map((vacuna) => (
                        <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Mes */}
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500 z-10 transition-colors group-hover:text-teal-600" />
                    <select
                      value={selectedMes}
                      onChange={(e) => onMesChange(Number(e.target.value))}
                      className="w-full pl-10 pr-8 py-2.5 text-sm font-medium bg-white rounded-xl border border-gray-200
                                 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400
                                 hover:border-teal-300 hover:shadow-sm transition-all duration-200 cursor-pointer appearance-none"
                    >
                      {MESES.map((mes, index) => (
                        <option key={index + 1} value={index + 1}>{mes}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Año */}
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cyan-600 z-10">AÑO</span>
                    <select
                      value={selectedAnio}
                      onChange={(e) => onAnioChange(Number(e.target.value))}
                      disabled={isLoadingAnios}
                      className="w-full pl-12 pr-8 py-2.5 text-sm font-medium bg-white rounded-xl border border-gray-200
                                 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400
                                 hover:border-cyan-300 hover:shadow-sm transition-all duration-200 cursor-pointer appearance-none
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aniosDisponibles.map((anio) => (
                        <option key={anio} value={anio}>{anio}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {(isLoadingEstablecimientos || isLoadingVacunas || isLoading) && (
                  <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />
                )}
              </div>
            </div>

            {/* Derecha: Acciones */}
            <div className="flex items-center gap-2">
              {pendingChangesCount > 0 && (
                <button
                  onClick={onSaveChanges}
                  disabled={isAutoSaving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                             text-white bg-gradient-to-r from-amber-500 to-orange-500
                             hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25
                             disabled:opacity-50 transition-all duration-200"
                >
                  <Save className={`h-4 w-4 ${isAutoSaving ? 'animate-spin' : ''}`} />
                  <span className="hidden xl:inline">Guardar</span>
                  <span className="bg-white/25 px-1.5 py-0.5 rounded-full text-xs">{pendingChangesCount}</span>
                </button>
              )}

              <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={onOpenVales}
                  disabled={!selectedVacuna || selectedCentroAcopio === 'todos'}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600
                             hover:bg-teal-50 hover:text-teal-700 border-r border-gray-200
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Receipt className="h-4 w-4" />
                  <span className="hidden xl:inline">Vales</span>
                </button>
                <button
                  onClick={onRefresh}
                  disabled={isLoading || !selectedVacuna}
                  className="flex items-center justify-center p-2.5 text-gray-600 hover:bg-gray-50
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all border-r border-gray-200"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onImport}
                  className="flex items-center justify-center p-2.5 text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={onExport}
                disabled={isExporting || !selectedVacuna}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           text-white bg-gradient-to-r from-teal-500 to-cyan-500
                           hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/25
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="hidden sm:inline">{isExporting ? 'Exportando...' : 'Exportar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Stock - Color sólido teal */}
      <div style={{ backgroundColor: '#11a394' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Izquierda: Contexto + Registros */}
            <div className="flex items-center gap-4">
              {/* Badge de Vacuna */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Package className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  {vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Sin seleccionar'}
                </span>
              </div>

              {/* Separador */}
              <div className="hidden sm:block w-px h-5 bg-white/30"></div>

              {/* Periodo y Centro */}
              <div className="hidden sm:flex items-center gap-3 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-white/70" />
                  {MESES[selectedMes - 1]} {selectedAnio}
                </span>
                <span className="text-white/50">•</span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-white/70" />
                  {centroNombre}
                </span>
              </div>

              {/* Separador */}
              <div className="hidden md:block w-px h-5 bg-white/30"></div>

              {/* Contador de Registros */}
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-sm font-medium text-white">{datosTablaLength}</span>
                <span className="text-xs text-white/70">registros</span>
              </div>
            </div>

            {/* Centro/Derecha: Stock Cards */}
            {selectedVacuna && (
              <div className="hidden lg:flex items-center gap-2">
                {isLoadingStock || isUpdatingStock ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="text-sm text-white/80">Cargando stock...</span>
                  </div>
                ) : stockError ? (
                  <button
                    onClick={onRetryStock}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/30 hover:bg-rose-500/40 rounded-xl border border-rose-300/50 transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4 text-white" />
                    <span className="text-sm text-white">Error - Reintentar</span>
                  </button>
                ) : stockInfo ? (
                  <>
                    {/* Badge del Período - Separado */}
                    {(() => {
                      let mesRealVisualizado = selectedMes + 1;
                      let anioRealVisualizado = selectedAnio;
                      if (mesRealVisualizado > 12) {
                        mesRealVisualizado = 1;
                        anioRealVisualizado++;
                      }
                      return (
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/20 border border-white/20">
                          <div className="p-1.5 bg-white/30 rounded-lg">
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] text-white/80 font-medium uppercase tracking-wide">Período</div>
                            <div className="text-lg font-bold text-white leading-none">
                              {MESES[mesRealVisualizado - 1]?.slice(0, 3).toUpperCase()} {anioRealVisualizado}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <ArrowRight className="h-4 w-4 text-white/50" />

                    <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      {/* Stock Inicial */}
                      <div className="relative" ref={stockInicialRef}>
                      <button
                        onClick={() => setShowStockInicialDropdown(!showStockInicialDropdown)}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/20 
                                   hover:bg-white/30 border border-white/20 transition-all group"
                      >
                        <div className="p-1.5 bg-white/30 rounded-lg">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] text-white/80 font-medium uppercase tracking-wide">Inicial</div>
                          <div className="text-lg font-bold text-white leading-none">
                            {stockInfo.tieneHistorialInicial ? stockInfo.stockInicialHistorico?.toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-white/80 transition-transform ${showStockInicialDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showStockInicialDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
                          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                              <Package className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-gray-800">Stock Inicial</span>
                          </div>
                          {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              Capturado: <span className="font-semibold text-gray-800">
                                {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <div className="text-xs text-gray-500 font-medium">Base</div>
                              <div className="text-xl font-bold text-gray-800">{stockInfo.stockInicialOriginal?.toLocaleString() || 0}</div>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-xl">
                              <div className="text-xs text-emerald-600 font-medium">+ Ingresos</div>
                              <div className="text-xl font-bold text-emerald-700">{stockInfo.ingresosLotesDelMes.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-500">Total Inicial</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                              {stockInfo.stockInicialHistorico?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="h-4 w-4 text-white/50" />

                    {/* Total Entregas */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/20 border border-white/20">
                      <div className="p-1.5 bg-white/30 rounded-lg">
                        <Truck className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-white/80 font-medium uppercase tracking-wide">Entregas</div>
                        <div className="text-lg font-bold text-white leading-none">{stockInfo.totalEntregas.toLocaleString()}</div>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-white/50" />

                    {/* Disponible */}
                    {(() => {
                      const isDeficit = stockInfo.stockDisponible < 0;
                      const canAdjust = isDeficit && ajusteDeficitDisponible && onOpenAjusteDeficit;
                      
                      const content = (
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
                          isDeficit 
                            ? 'bg-rose-500/40 border-rose-300/50' 
                            : 'bg-emerald-500/40 border-emerald-300/50'
                        } ${canAdjust ? 'cursor-pointer hover:bg-rose-500/60 transition-colors' : ''}`}>
                          <div className={`p-1.5 rounded-lg ${isDeficit ? 'bg-rose-500/50' : 'bg-emerald-500/50'}`}>
                            <TrendingUp className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-[10px] font-medium uppercase tracking-wide text-white/90">
                              {isDeficit ? 'Deficit' : 'Disponible'}
                            </div>
                            <div className="text-lg font-bold text-white leading-none">{stockInfo.stockDisponible.toLocaleString()}</div>
                          </div>
                          {canAdjust && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full">
                              <Settings2 className="h-3 w-3 text-white" />
                              <span className="text-[10px] text-white font-medium">Ajustar</span>
                            </div>
                          )}
                        </div>
                      );

                      if (canAdjust) {
                        return (
                          <button onClick={onOpenAjusteDeficit} className="focus:outline-none">
                            {content}
                          </button>
                        );
                      }
                      return content;
                    })()}

                    <ArrowRight className="h-4 w-4 text-white/50" />

                    {/* Stock Actual */}
                    <div className="relative" ref={stockActualRef}>
                      <button
                        onClick={() => setShowStockActualDropdown(!showStockActualDropdown)}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/20 
                                   hover:bg-white/30 border border-white/20 transition-all group"
                      >
                        <div className="p-1.5 bg-white/30 rounded-lg">
                          <Boxes className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] text-white/80 font-medium uppercase tracking-wide">Actual</div>
                          <div className="text-lg font-bold text-white leading-none">{stockInfo.stockActual.toLocaleString()}</div>
                        </div>
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                          {lotesDisponibles.length} <span className="text-white/70">lotes</span>
                        </span>
                        <ChevronDown className={`h-4 w-4 text-white/80 transition-transform ${showStockActualDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showStockActualDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                                <Boxes className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-bold text-gray-800">Stock Actual</span>
                            </div>
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                              {lotesDisponibles.length} lote(s)
                            </span>
                          </div>
                          
                          {lotesDisponibles.length > 0 ? (
                            <div className="mt-3">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Lotes (FEFO - Primero en Expirar)
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {lotesDisponibles
                                  .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
                                  .map((lote, index) => {
                                    const esPrimero = index === 0;
                                    return (
                                      <div
                                        key={lote.id}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                                          esPrimero 
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                                            : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                      >
                                        <div>
                                          <div className={`font-semibold text-sm ${esPrimero ? 'text-white' : 'text-gray-800'}`}>{lote.numero}</div>
                                          <div className={`text-[10px] ${esPrimero ? 'text-teal-100' : 'text-gray-500'}`}>
                                            Vence: {new Date(lote.fechaVencimiento).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <div className={`text-xl font-bold ${esPrimero ? 'text-white' : 'text-teal-700'}`}>
                                          {lote.cantidadActual.toLocaleString()}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-400">No hay lotes disponibles</div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-500">Total Stock</span>
                            <span className="text-2xl font-bold text-gray-800">{stockInfo.stockActual.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botón Actualizar Siguiente Mes */}
                    {/* NOTA: Debido al desplazamiento de +1 mes en el filtro, el mes REAL visualizado es selectedMes+1 */}
                    {/* Por lo tanto, el "siguiente mes" para actualizar es selectedMes+2 desde el filtro original */}
                    {stockInfo.tieneHistorialInicial && (() => {
                      // Calcular el mes REAL visualizado (filtro + 1 por desplazamiento)
                      let mesRealVisualizado = selectedMes + 1;
                      let anioRealVisualizado = selectedAnio;
                      if (mesRealVisualizado > 12) {
                        mesRealVisualizado = 1;
                        anioRealVisualizado++;
                      }
                      // Calcular el mes SIGUIENTE al real visualizado
                      let mesSiguiente = mesRealVisualizado + 1;
                      let anioSiguiente = anioRealVisualizado;
                      if (mesSiguiente > 12) {
                        mesSiguiente = 1;
                        anioSiguiente++;
                      }
                      return (
                      <>
                        <div className="w-px h-8 bg-white/30 mx-1"></div>
                        <button
                          onClick={onActualizarStockSiguienteMes}
                          disabled={isUpdatingStockSiguienteMes}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 
                                     hover:bg-white/30 border border-white/30 
                                     text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                          title={`Actualizar stock inicial de ${MESES[mesSiguiente - 1]} ${anioSiguiente}`}
                        >
                          {isUpdatingStockSiguienteMes ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                          )}
                          <span className="text-sm font-medium">Sig. Mes</span>
                        </button>
                      </>
                    );
                    })()}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra Mobile para Stock */}
      {selectedVacuna && stockInfo && !isLoadingStock && (
        <div className="lg:hidden" style={{ backgroundColor: '#0e8a7d' }}>
          <div className="w-full px-4 py-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {/* Badge del Período - Mobile */}
              {(() => {
                let mesRealVisualizadoMobile = selectedMes + 1;
                let anioRealVisualizadoMobile = selectedAnio;
                if (mesRealVisualizadoMobile > 12) {
                  mesRealVisualizadoMobile = 1;
                  anioRealVisualizadoMobile++;
                }
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium text-white whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-bold">{MESES[mesRealVisualizadoMobile - 1]?.slice(0, 3).toUpperCase()} {anioRealVisualizadoMobile}</span>
                  </div>
                );
              })()}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium text-white whitespace-nowrap">
                <Package className="h-3.5 w-3.5" />
                Inicial: <span className="font-bold">{stockInfo.stockInicialHistorico?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium text-white whitespace-nowrap">
                <Truck className="h-3.5 w-3.5" />
                Entregas: <span className="font-bold">{stockInfo.totalEntregas.toLocaleString()}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                stockInfo.stockDisponible < 0 ? 'bg-rose-500/50 text-white' : 'bg-emerald-500/50 text-white'
              } ${stockInfo.stockDisponible < 0 && ajusteDeficitDisponible ? 'cursor-pointer' : ''}`}
              onClick={stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && onOpenAjusteDeficit ? onOpenAjusteDeficit : undefined}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {stockInfo.stockDisponible < 0 ? 'Deficit:' : 'Disponible:'} 
                <span className="font-bold">{stockInfo.stockDisponible.toLocaleString()}</span>
                {stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && (
                  <Settings2 className="h-3 w-3 ml-1" />
                )}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium text-white whitespace-nowrap">
                <Boxes className="h-3.5 w-3.5" />
                Actual: <span className="font-bold">{stockInfo.stockActual.toLocaleString()}</span>
                <span className="text-white/70">({lotesDisponibles.length})</span>
              </div>
              {stockInfo.tieneHistorialInicial && (
                <button
                  onClick={onActualizarStockSiguienteMes}
                  disabled={isUpdatingStockSiguienteMes}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium text-white whitespace-nowrap"
                >
                  {isUpdatingStockSiguienteMes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Sig. Mes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

MovimientosHeaderCompact.displayName = 'MovimientosHeaderCompact';
