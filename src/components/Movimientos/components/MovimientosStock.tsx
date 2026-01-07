import React, { memo } from 'react';
import {
  Package,
  Truck,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { COMPONENT_STYLES, STOCK_ESTADOS, MESES } from '../constants';

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

interface MovimientosStockProps {
  stockInfo: StockInfo | null;
  stockError: string | null;
  isLoadingStock: boolean;
  isUpdatingStock: boolean;
  isUpdatingStockSiguienteMes: boolean;
  selectedMes: number;
  selectedAnio: number;
  onRetry: () => void;
  onActualizarStockSiguienteMes: () => void;
}

export const MovimientosStock: React.FC<MovimientosStockProps> = memo(({
  stockInfo,
  stockError,
  isLoadingStock,
  isUpdatingStock,
  isUpdatingStockSiguienteMes,
  selectedMes,
  selectedAnio,
  onRetry,
  onActualizarStockSiguienteMes,
}) => {
  const getEstadoConfig = (stockDisponible: number, estado: string) => {
    if (stockDisponible < 0) return STOCK_ESTADOS.deficit;
    return STOCK_ESTADOS[estado as keyof typeof STOCK_ESTADOS] || STOCK_ESTADOS.bueno;
  };

  return (
    <section className={COMPONENT_STYLES.section.container} aria-label="Stock Disponible">
      {/* Header */}
      <div className={COMPONENT_STYLES.section.header}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5 rounded-xl shadow-lg">
              <Package className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h3 className={COMPONENT_STYLES.section.headerTitle}>Stock Disponible</h3>
              <p className={COMPONENT_STYLES.section.headerSubtitle}>Resumen de disponibilidad actual</p>
            </div>
          </div>
          {(isLoadingStock || isUpdatingStock) && (
            <div className="flex items-center text-teal-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm font-medium">Actualizando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={COMPONENT_STYLES.section.body}>
        {stockInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stock Inicial */}
            <div className={`${COMPONENT_STYLES.stats.card} bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className={`${COMPONENT_STYLES.stats.value} text-teal-800`}>
                    {stockInfo.tieneHistorialInicial 
                      ? stockInfo.stockInicialHistorico?.toLocaleString() 
                      : 'N/A'}
                  </div>
                  <div className={`${COMPONENT_STYLES.stats.label} text-teal-600`}>
                    Stock Inicial {stockInfo.tieneHistorialInicial ? '(Histórico)' : '(Sin historial)'}
                  </div>
                  {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial && (
                    <div className={`${COMPONENT_STYLES.stats.sublabel} text-teal-500`}>
                      Capturado: {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString()}
                    </div>
                  )}
                  {stockInfo.tieneHistorialInicial && stockInfo.ingresosLotesDelMes > 0 && (
                    <div className="mt-2 pt-2 border-t border-teal-300/50">
                      <div className="text-xs text-teal-600 font-medium">
                        Base: {stockInfo.stockInicialOriginal?.toLocaleString()}
                      </div>
                      <div className="text-xs text-emerald-600 font-medium">
                        + Ingresos: {stockInfo.ingresosLotesDelMes.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
                <div className={`${COMPONENT_STYLES.stats.iconWrapper} bg-teal-600`}>
                  <Package className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Total Entregas */}
            <div className={`${COMPONENT_STYLES.stats.card} bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`${COMPONENT_STYLES.stats.value} text-cyan-800`}>
                    {stockInfo.totalEntregas.toLocaleString()}
                  </div>
                  <div className={`${COMPONENT_STYLES.stats.label} text-cyan-600`}>
                    Total Entregas
                  </div>
                </div>
                <div className={`${COMPONENT_STYLES.stats.iconWrapper} bg-cyan-600`}>
                  <Truck className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Stock Disponible */}
            {(() => {
              const config = getEstadoConfig(stockInfo.stockDisponible, stockInfo.estado);
              const IconComponent = config.icon;
              return (
                <div className={`${COMPONENT_STYLES.stats.card} ${config.bg} ${config.border}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`${COMPONENT_STYLES.stats.value} ${config.text}`}>
                        {stockInfo.stockDisponible.toLocaleString()}
                      </div>
                      <div className={`${COMPONENT_STYLES.stats.label} ${config.textLight}`}>
                        {stockInfo.stockDisponible < 0 ? 'Déficit' : 'Disponible'}
                      </div>
                    </div>
                    <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${config.iconBg}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Stock Actual con Lotes */}
            <div className={`${COMPONENT_STYLES.stats.card} bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div>
                    <div className={`${COMPONENT_STYLES.stats.value} text-teal-800`}>
                      {stockInfo.stockActual.toLocaleString()}
                    </div>
                    <div className={`${COMPONENT_STYLES.stats.label} text-teal-600`}>
                      Stock Actual
                    </div>
                    <div className={`${COMPONENT_STYLES.stats.sublabel} text-teal-500`}>
                      {stockInfo.lotes.filter(l => l.cantidadActual > 0).length} lote(s) disponible(s)
                    </div>
                  </div>
                  <div className={`${COMPONENT_STYLES.stats.iconWrapper} bg-teal-600`}>
                    <Package className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Lista de Lotes */}
                {stockInfo.lotes.filter(l => l.cantidadActual > 0).length > 0 && (
                  <div className="flex-1 min-w-0 pl-4 border-l border-teal-300/50">
                    <div className="text-[10px] font-bold text-teal-600/70 mb-2 uppercase tracking-wider">
                      Lotes (FEFO)
                    </div>
                    <div className="space-y-1.5 max-h-20 overflow-y-auto pr-2">
                      {stockInfo.lotes
                        .filter(lote => lote.cantidadActual > 0)
                        .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
                        .slice(0, 3)
                        .map((lote, index) => {
                          const esPrimero = index === 0;

                          return (
                            <div
                              key={lote.id}
                              className={`flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-xs ${
                                esPrimero ? 'bg-teal-600 text-white' : 'bg-white/80'
                              }`}
                            >
                              <span className={`font-bold truncate ${esPrimero ? 'text-white' : 'text-teal-900'}`} title={lote.numero}>
                                {lote.numero.slice(0, 10)}...
                              </span>
                              <span className={`font-semibold ${esPrimero ? 'text-teal-100' : 'text-teal-700'}`}>
                                {lote.cantidadActual.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón Actualizar Stock Siguiente Mes */}
            {stockInfo.tieneHistorialInicial && (
              <div className="col-span-full mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={onActualizarStockSiguienteMes}
                  disabled={isUpdatingStockSiguienteMes}
                  className={`w-full ${COMPONENT_STYLES.button.primary} justify-center py-3`}
                >
                  {isUpdatingStockSiguienteMes ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Actualizando Stock...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      <span>Actualizar Stock Siguiente Mes</span>
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-xs text-gray-600">
                  Registra el disponible actual ({stockInfo.stockDisponible.toLocaleString()} unidades) 
                  como stock inicial del mes {MESES[selectedMes === 12 ? 0 : selectedMes]} {selectedMes === 12 ? selectedAnio + 1 : selectedAnio}
                </p>
              </div>
            )}
          </div>
        ) : stockError ? (
          <div className="text-center py-8">
            <div className="bg-rose-100 p-4 rounded-xl inline-block mb-4">
              <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
            </div>
            <div className="text-rose-700 text-sm font-semibold mb-3">Error al cargar stock</div>
            <button
              onClick={onRetry}
              className={COMPONENT_STYLES.button.danger}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-100 p-4 rounded-xl inline-block mb-4">
              <Package className="h-8 w-8 text-gray-400 mx-auto" />
            </div>
            <div className="text-gray-600 text-sm font-medium">Cargando información de stock...</div>
          </div>
        )}
      </div>
    </section>
  );
});

MovimientosStock.displayName = 'MovimientosStock';
