import React, { memo } from 'react';
import {
  Package,
  Truck,
  Warning,
  ArrowsClockwise,
  CircleNotch
} from '@phosphor-icons/react';
import { STOCK_ESTADOS, MESES } from '../constants';
import type { StockInfo } from '../types';

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
  const getEstadoConfig = (
    stockDisponible: number,
    estado: string,
  ): { bg: string; border: string; text: string; textLight: string; iconBg: string; icon: React.ElementType } => {
    if (stockDisponible < 0) return STOCK_ESTADOS.deficit;
    return (STOCK_ESTADOS as Record<string, { bg: string; border: string; text: string; textLight: string; iconBg: string; icon: React.ElementType }>)[estado]
      || STOCK_ESTADOS.bueno;
  };

  return (
    <section className="rounded-[14px] border border-[#e7e7ef] bg-white p-5" aria-label="Stock disponible">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 border-b border-[#eeeef3] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd]">
            <Package className="h-5 w-5 text-[#7c3aed]" weight="duotone" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-[0.95rem] font-semibold tracking-tight text-zinc-900">Stock disponible</h3>
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">Resumen de disponibilidad actual</p>
          </div>
        </div>
        {(isLoadingStock || isUpdatingStock) && (
          <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 border border-zinc-200">
            <CircleNotch className="h-4 w-4 animate-spin text-[#7c3aed]" weight="bold" />
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-zinc-900">Actualizando...</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="">
        {stockInfo ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Stock Inicial */}
            <div className="rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd] p-4 transition hover:border-[#d7d8e2]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-2xl font-semibold tracking-tight text-zinc-900">
                    {stockInfo.tieneHistorialInicial 
                      ? stockInfo.stockInicialHistorico?.toLocaleString() 
                      : 'N/A'}
                  </div>
                  <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                    Stock base {stockInfo.tieneHistorialInicial ? '(histórico)' : ''}
                  </div>
                  {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial && (
                    <div className="mt-1 text-[0.65rem] font-semibold text-zinc-400">
                      Fecha: {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString('es-PE')}
                    </div>
                  )}
                  {stockInfo.tieneHistorialInicial && (stockInfo.ingresosLotesDelMes ?? 0) > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-200">
                      <div className="text-[0.7rem] font-semibold text-zinc-600">
                        Base: {stockInfo.stockInicialOriginal?.toLocaleString()}
                      </div>
                      <div className="text-[0.7rem] font-semibold text-zinc-900 mt-0.5 flex items-center gap-1">
                        <span>+ Ingresos:</span>
                        <span className="bg-zinc-200 px-1 py-0.5 rounded-sm line-clamp-1 truncate">{(stockInfo.ingresosLotesDelMes ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-white border border-[#e7e7ef] rounded-lg">
                  <Package className="h-4 w-4 text-zinc-600" weight="duotone" />
                </div>
              </div>
            </div>

            {/* Total Entregas */}
            <div className="rounded-[12px] border border-[#e7e7ef] bg-white p-4 transition hover:border-[#d7d8e2]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-semibold tracking-tight text-zinc-900">
                    {stockInfo.totalEntregas.toLocaleString()}
                  </div>
                  <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                    Entregas
                  </div>
                </div>
                <div className="p-2 bg-[#fbfafd] border border-[#e7e7ef] rounded-lg">
                  <Truck className="h-4 w-4 text-zinc-600" weight="duotone" />
                </div>
              </div>
            </div>

            {/* Stock Disponible */}
            {(() => {
              const config = getEstadoConfig(stockInfo.stockDisponible, stockInfo.estado);
              const IconComponent = config.icon as React.ElementType;
              return (
                <div className={`rounded-[12px] border p-4 transition ${config.bg} ${config.border}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`text-2xl font-semibold tracking-tight ${config.text}`}>
                        {stockInfo.stockDisponible.toLocaleString()}
                      </div>
                      <div className={`mt-1 text-[0.65rem] font-bold uppercase tracking-widest ${config.textLight || config.text}`}>
                        {stockInfo.stockDisponible < 0 ? 'Déficit' : 'Disponible'}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${config.iconBg || 'bg-white/10'}`}>
                      <IconComponent className={`h-4 w-4 ${config.text}`} weight={stockInfo.stockDisponible < 0 ? "bold" : "duotone"} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Stock Actual con Lotes */}
            <div className="rounded-[12px] border border-[#dedfea] bg-[#f3f0ff] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div>
                    <div className="text-2xl font-semibold tracking-tight text-[#7c3aed]">
                      {stockInfo.stockActual.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                      Balance local
                    </div>
                    <div className="mt-1 text-[0.65rem] font-semibold text-zinc-500">
                      {stockInfo.lotes.filter(l => l.cantidadActual > 0).length} lotes
                    </div>
                  </div>
                  <div className="p-2 bg-white border border-[#dedfea] rounded-lg">
                    <Package className="h-4 w-4 text-[#7c3aed]" weight="duotone" />
                  </div>
                </div>

                {/* Lista de Lotes */}
                {stockInfo.lotes.filter(l => l.cantidadActual > 0).length > 0 && (
                  <div className="flex-1 min-w-0 pl-4 border-l border-[#dedfea]">
                    <div className="text-[0.6rem] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                      Lotes activos (FEFO)
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
                              className={`flex items-center justify-between gap-2 px-2 py-1 rounded border text-xs ${
                                esPrimero ? 'bg-white text-zinc-900 border-[#dedfea]' : 'bg-transparent text-zinc-500 border-[#dedfea]'
                              }`}
                            >
                              <span className={`font-bold truncate`} title={lote.numero}>
                                {lote.numero.slice(0, 10)}...
                              </span>
                              <span className="font-semibold tabular-nums">
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
            {stockInfo.tieneHistorialInicial && (() => {
              let mesRealVisualizado = selectedMes + 1;
              let anioRealVisualizado = selectedAnio;
              if (mesRealVisualizado > 12) {
                mesRealVisualizado = 1;
                anioRealVisualizado++;
              }
              let mesSiguiente = mesRealVisualizado + 1;
              let anioSiguiente = anioRealVisualizado;
              if (mesSiguiente > 12) {
                mesSiguiente = 1;
                anioSiguiente++;
              }
              return (
              <div className="col-span-full mt-2 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[0.7rem] font-bold text-zinc-500 max-w-lg">
                  Se registrarán <span className="text-zinc-900 font-semibold">{stockInfo.stockDisponible.toLocaleString()}</span> unidades
                  como stock inicial de <span className="bg-zinc-100 px-1.5 py-0.5 rounded-sm border border-zinc-200">{MESES[mesSiguiente - 1]} {anioSiguiente}</span>
                </p>
                <button type="button"
                  onClick={onActualizarStockSiguienteMes}
                  disabled={isUpdatingStockSiguienteMes}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[9px] bg-[#7c3aed] px-4 text-xs font-bold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingStockSiguienteMes ? (
                    <>
                      <CircleNotch className="h-3.5 w-3.5 animate-spin" weight="bold" />
                      <span>Transfiriendo...</span>
                    </>
                  ) : (
                    <>
                      <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
                      <span>Actualizar mes siguiente</span>
                    </>
                  )}
                </button>
              </div>
            );
            })()}
          </div>
        ) : stockError ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 mb-4 shadow-sm">
              <Warning className="h-6 w-6 text-rose-600" weight="duotone" />
            </div>
            <div className="text-[0.95rem] font-semibold text-rose-900 tracking-tight">No se pudo sincronizar el stock</div>
            <div className="text-[0.7rem] font-medium text-rose-800/80 mt-1 max-w-md text-center">No se pudo acceder al stock del sistema principal.</div>
            <button type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-rose-200 bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors shadow-sm"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200 mb-4 shadow-sm">
              <Package className="h-6 w-6 text-zinc-400" weight="duotone" />
            </div>
            <div className="text-[0.85rem] font-bold text-zinc-600">Procesando stock local...</div>
          </div>
        )}
      </div>
    </section>
  );
});

MovimientosStock.displayName = 'MovimientosStock';
