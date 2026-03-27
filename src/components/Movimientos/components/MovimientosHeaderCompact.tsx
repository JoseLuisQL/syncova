import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Warning,
  ArrowRight,
  Buildings,
  CalendarBlank,
  CheckCircle,
  CaretDown,
  DownloadSimple,
  CircleNotch,
  Package,
  Receipt,
  ArrowsClockwise,
  FloppyDisk,
  Faders,
  UploadSimple,
} from '@phosphor-icons/react';
import { MESES, COMPONENT_STYLES } from '../constants';
import { Vacuna, CentroAcopio } from '../../../types';
import { EntregasProgressBadge } from './EntregasProgressBadge';
import { ProgresoValesResponse } from '../../../services/movimientosService';

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
  isReadOnly?: boolean;
  lockedCentroAcopioLabel?: string;
  showReadOnlyCentroFilter?: boolean;
  allCentrosLabel?: string;
  hideStockMetrics?: boolean;
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
  stockInfo: StockInfo | null;
  stockError: string | null;
  isLoadingStock: boolean;
  isUpdatingStock: boolean;
  isUpdatingStockSiguienteMes: boolean;
  onRetryStock: () => void;
  onActualizarStockSiguienteMes: () => void;
  pendingChangesCount: number;
  isAutoSaving: boolean;
  isLoading: boolean;
  isExporting: boolean;
  onSaveChanges: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenVales: () => void;
  onOpenAjusteDeficit?: () => void;
  ajusteDeficitDisponible?: boolean;
  progresoVales?: ProgresoValesResponse | null;
  isLoadingProgresoVales?: boolean;
  onRefreshProgresoVales?: () => void;
}

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isPrimary?: boolean;
  count?: number;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
  isPrimary = false,
  count,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={isPrimary ? COMPONENT_STYLES.button.primary : COMPONENT_STYLES.button.secondary}
    title={label}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
    {count ? (
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-inherit">{count}</span>
    ) : null}
  </button>
);

export const MovimientosHeaderCompact: React.FC<MovimientosHeaderCompactProps> = memo(({
  isReadOnly = false,
  lockedCentroAcopioLabel,
  showReadOnlyCentroFilter = false,
  allCentrosLabel = 'Todos',
  hideStockMetrics = false,
  selectedCentroAcopio,
  selectedVacuna,
  selectedMes,
  selectedAnio,
  centrosAcopio,
  vacunasActivas,
  aniosDisponibles,
  isLoadingEstablecimientos,
  isLoadingVacunas,
  isLoadingAnios = false,
  onCentroAcopioChange,
  onVacunaChange,
  onMesChange,
  onAnioChange,
  stockInfo,
  stockError,
  isLoadingStock,
  isUpdatingStock,
  isUpdatingStockSiguienteMes,
  onRetryStock,
  onActualizarStockSiguienteMes,
  pendingChangesCount,
  isAutoSaving,
  isLoading,
  isExporting,
  onSaveChanges,
  onRefresh,
  onExport,
  onImport,
  onOpenVales,
  onOpenAjusteDeficit,
  ajusteDeficitDisponible = false,
  progresoVales = null,
  isLoadingProgresoVales = false,
  onRefreshProgresoVales,
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

  const shouldRenderCentroSelect = !isReadOnly || showReadOnlyCentroFilter;
  const centroNombre = useMemo(() => {
    if (selectedCentroAcopio === 'todos') return allCentrosLabel;
    return centrosAcopio.find((centro) => centro.id === selectedCentroAcopio)?.nombre || allCentrosLabel;
  }, [allCentrosLabel, centrosAcopio, selectedCentroAcopio]);

  const periodoEntrega = useMemo(() => {
    let mesEntrega = selectedMes + 1;
    let anioEntrega = selectedAnio;
    if (mesEntrega > 12) {
      mesEntrega = 1;
      anioEntrega += 1;
    }

    return {
      mesEntrega,
      anioEntrega,
      etiqueta: `${MESES[mesEntrega - 1]} ${anioEntrega}`,
    };
  }, [selectedAnio, selectedMes]);

  const periodoSiguiente = useMemo(() => {
    let mesSiguiente = periodoEntrega.mesEntrega + 1;
    let anioSiguiente = periodoEntrega.anioEntrega;
    if (mesSiguiente > 12) {
      mesSiguiente = 1;
      anioSiguiente += 1;
    }

    return `${MESES[mesSiguiente - 1]} ${anioSiguiente}`;
  }, [periodoEntrega.anioEntrega, periodoEntrega.mesEntrega]);

  const lotesDisponibles = useMemo(
    () =>
      stockInfo?.lotes
        .filter((lote) => lote.cantidadActual > 0)
        .sort(
          (a, b) =>
            new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime(),
        ) || [],
    [stockInfo?.lotes],
  );

  const stockPanelContent = hideStockMetrics ? null : (
    <div className="border-t border-zinc-100 px-3 py-2.5 sm:px-4 sm:py-3 bg-zinc-50/50">
      {!selectedVacuna ? (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-zinc-900 border border-zinc-900 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Package className="h-4 w-4 text-white" weight="duotone" />
          </div>
          <p className="text-sm font-semibold tracking-tight text-white">Selecciona una vacuna para visualizar el marco operativo.</p>
        </div>
      ) : isLoadingStock || isUpdatingStock ? (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-zinc-900 border border-zinc-900 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <CircleNotch className="h-4 w-4 animate-spin text-white" weight="bold" />
          </div>
          <p className="text-sm font-semibold tracking-tight text-white">Sincronizando balances estáticos...</p>
        </div>
      ) : stockError ? (
        <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-rose-200 text-rose-600 shadow-sm">
              <Warning className="h-4 w-4" weight="fill" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8rem] font-bold text-rose-900 tracking-tight">Fallo en la lectura de stock</p>
              <p className="mt-0.5 text-[0.7rem] font-medium text-rose-700">{stockError}</p>
            </div>
            <button type="button" onClick={onRetryStock} className={COMPONENT_STYLES.button.secondary}>
              <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
              <span>Forzar recarga</span>
            </button>
          </div>
        </div>
      ) : stockInfo ? (
        <div className="space-y-2">
          {/* Barra de resumen estilo terminal (Cockpit Mode) */}
          <div className="relative rounded-[16px] bg-zinc-900 border border-zinc-900 px-[5px] py-[5px] shadow-sm">
            <div className="flex flex-wrap items-center gap-y-1">
              {/* PERÍODO */}
              <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/5 px-3 py-2 sm:gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/40 sm:h-8 sm:w-8">
                  <CalendarBlank className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" weight="duotone" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-zinc-400 sm:text-[0.6rem]">Target</p>
                  <p className="text-xs font-black tracking-tight text-white sm:text-sm">{periodoEntrega.etiqueta.toUpperCase()}</p>
                </div>
              </div>

              <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-zinc-500 sm:mx-1.5 sm:h-3.5 sm:w-3.5" weight="bold" />

              {/* INICIAL - expandible */}
              <div className="relative" ref={stockInicialRef}>
                <button
                  type="button"
                  onClick={() => setShowStockInicialDropdown((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-white/10 border border-transparent px-3 py-2 text-left transition hover:bg-white/15 hover:border-white/10 sm:gap-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/40 sm:h-8 sm:w-8">
                    <Package className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-zinc-400 sm:text-[0.6rem]">Apertura</p>
                    <p className="text-xs font-black tracking-tight text-white sm:text-sm">
                      {stockInfo.tieneHistorialInicial
                        ? (stockInfo.stockInicialHistorico?.toLocaleString() || '0')
                        : '—'}
                    </p>
                  </div>
                  <CaretDown className={`h-3 w-3 text-zinc-500 transition-transform ${showStockInicialDropdown ? 'rotate-180' : ''}`} weight="bold" />
                </button>

                {showStockInicialDropdown ? (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-[260px] rounded-[16px] border border-zinc-200 bg-white p-3 shadow-xl sm:min-w-[280px]">
                    <h4 className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">Volumen Desglosado</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Base Histórica</p>
                        <p className="text-sm font-black text-zinc-900 mt-1">{stockInfo.stockInicialOriginal?.toLocaleString() || 0}</p>
                      </div>
                      <div className="rounded-xl border border-zinc-300 bg-white px-3 py-2 shadow-sm">
                        <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-900">Nuevos Ingresos</p>
                        <p className="text-sm font-black text-zinc-900 mt-1">{stockInfo.ingresosLotesDelMes.toLocaleString()}</p>
                      </div>
                    </div>
                    {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial ? (
                      <p className="mt-3 text-[0.65rem] font-medium text-zinc-400 text-right">
                        Ref: {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-zinc-500 sm:mx-1.5 sm:h-3.5 sm:w-3.5" weight="bold" />

              {/* BARRA ENTREGAS */}
              <div className="relative">
                <EntregasProgressBadge
                  totalEntregas={stockInfo.totalEntregas}
                  progresoVales={progresoVales}
                  isLoading={isLoadingProgresoVales}
                  onRefresh={onRefreshProgresoVales}
                />
              </div>

              <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-zinc-500 sm:mx-1.5 sm:h-3.5 sm:w-3.5" weight="bold" />

              {/* DISPONIBLE */}
              <button
                type="button"
                onClick={stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && onOpenAjusteDeficit ? onOpenAjusteDeficit : undefined}
                disabled={stockInfo.stockDisponible >= 0 || !ajusteDeficitDisponible || !onOpenAjusteDeficit}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition sm:gap-2.5 ${
                  stockInfo.stockDisponible < 0
                    ? 'border-rose-500/50 bg-rose-500/20 hover:bg-rose-500/30'
                    : 'border-white/5 bg-white/10 hover:bg-white/15 hover:border-white/10'
                }`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${
                  stockInfo.stockDisponible < 0 ? 'bg-rose-500/40' : 'bg-black/40'
                }`}>
                  {stockInfo.stockDisponible < 0
                    ? <Warning className="h-3.5 w-3.5 text-rose-100 sm:h-4 sm:w-4" weight="fill" />
                    : <CheckCircle className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" weight="fill" />}
                </div>
                <div>
                  <p className={`text-[0.55rem] font-bold uppercase tracking-[0.15em] sm:text-[0.6rem] ${
                    stockInfo.stockDisponible < 0 ? 'text-rose-200' : 'text-zinc-400'
                  }`}>
                    {stockInfo.stockDisponible < 0 ? 'Fractura' : 'Clearance'}
                  </p>
                  <p className={`text-xs font-black tracking-tight sm:text-sm ${
                    stockInfo.stockDisponible < 0 ? 'text-rose-50' : 'text-white'
                  }`}>{stockInfo.stockDisponible.toLocaleString()}</p>
                </div>
                {stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && onOpenAjusteDeficit ? (
                  <Faders className="h-3.5 w-3.5 text-rose-200/80 ml-1" weight="bold" />
                ) : null}
              </button>

              <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-zinc-500 sm:mx-1.5 sm:h-3.5 sm:w-3.5" weight="bold" />

              {/* ACTUAL (CIERRE) + LOTES */}
              <div className="relative" ref={stockActualRef}>
                <button
                  type="button"
                  onClick={() => setShowStockActualDropdown((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-white/10 border border-transparent px-3 py-2 text-left transition hover:bg-white/15 hover:border-white/10 sm:gap-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/40 sm:h-8 sm:w-8">
                    <Package className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-zinc-400 sm:text-[0.6rem]">Cierre Operativo</p>
                    <p className="text-xs font-black tracking-tight text-white sm:text-sm">{stockInfo.stockActual.toLocaleString()}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[0.65rem] font-bold tracking-widest text-zinc-300">
                    {lotesDisponibles.length} LTX
                  </span>
                  <CaretDown className={`h-3 w-3 text-zinc-500 transition-transform ${showStockActualDropdown ? 'rotate-180' : ''}`} weight="bold" />
                </button>

                {showStockActualDropdown ? (
                  <div className="absolute right-0 top-full z-50 mt-2 min-w-[280px] rounded-[16px] border border-zinc-200 bg-white p-3 shadow-xl sm:min-w-[300px]">
                    <h4 className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">
                      Rastreo de Lotes ({lotesDisponibles.length})
                    </h4>
                    {lotesDisponibles.length > 0 ? (
                      <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
                        {lotesDisponibles.map((lote, index) => (
                          <div
                            key={lote.id}
                            className={`rounded-xl border px-3 py-2.5 ${
                              index === 0
                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[0.85rem] font-black tracking-tight">{lote.numero}</p>
                                <p className={`text-[0.65rem] font-medium ${index === 0 ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                  EXP: {new Date(lote.fechaVencimiento).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[0.75rem] font-black tracking-tight ${
                                index === 0 ? 'bg-white text-zinc-900' : 'bg-zinc-100 text-zinc-900'
                              }`}>
                                {lote.cantidadActual.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-[0.8rem] text-zinc-500 font-medium">Bóveda vacía. No existen lotes líquidos.</p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Botón actualizar sig. mes */}
          {stockInfo.tieneHistorialInicial ? (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onActualizarStockSiguienteMes}
                disabled={isUpdatingStockSiguienteMes}
                className={COMPONENT_STYLES.button.secondary}
                title={`Proyectar saltos a ${periodoSiguiente}`}
              >
                {isUpdatingStockSiguienteMes ? (
                  <CircleNotch className="h-3.5 w-3.5 animate-spin" weight="bold" />
                ) : (
                  <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
                )}
                <span className="hidden sm:inline font-bold">Bridging Mes Siguiente</span>
                <span className="sm:hidden font-bold">Bridge</span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest font-black text-zinc-900 ml-1 border border-zinc-200">
                  {periodoSiguiente}
                </span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <section className="flex h-full flex-col bg-white">
      {/* Filtros + Acciones - Top Bar */}
      <div className="border-b border-zinc-200 px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {shouldRenderCentroSelect ? (
                <label className="block">
                  <span className={COMPONENT_STYLES.input.label}>Operador Base</span>
                  <div className="relative">
                    <Buildings className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" weight="duotone" />
                    <select
                      value={selectedCentroAcopio}
                      onChange={(event) => onCentroAcopioChange(event.target.value)}
                      disabled={isLoadingEstablecimientos}
                      className={COMPONENT_STYLES.select.base + ' pl-9 pr-9 focus:ring-zinc-900'}
                    >
                      <option value="todos">{allCentrosLabel}</option>
                      {centrosAcopio.map((centro) => (
                        <option key={centro.id} value={centro.id}>
                          {centro.nombre}
                        </option>
                      ))}
                    </select>
                    <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" weight="bold" />
                  </div>
                </label>
              ) : (
                <div>
                  <span className={COMPONENT_STYLES.input.label}>Nodo Fijo Asignado</span>
                  <div className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 shadow-sm">
                    <Buildings className="h-4 w-4 shrink-0 text-zinc-500" weight="duotone" />
                    <span className="truncate">{lockedCentroAcopioLabel || centroNombre}</span>
                  </div>
                </div>
              )}

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Biológico</span>
                <div className="relative">
                  <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" weight="duotone" />
                  <select
                    value={selectedVacuna}
                    onChange={(event) => onVacunaChange(event.target.value)}
                    disabled={isLoadingVacunas}
                    className={COMPONENT_STYLES.select.base + ' pl-9 pr-9 focus:ring-zinc-900 font-medium'}
                  >
                    {vacunasActivas.length === 0 ? <option value="">Incializando...</option> : null}
                    {vacunasActivas.map((vacuna) => (
                      <option key={vacuna.id} value={vacuna.id}>
                        {vacuna.nombre}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" weight="bold" />
                </div>
              </label>

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Clúster (Mes)</span>
                <div className="relative">
                  <CalendarBlank className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" weight="duotone" />
                  <select
                    value={selectedMes}
                    onChange={(event) => onMesChange(Number(event.target.value))}
                    className={COMPONENT_STYLES.select.base + ' pl-9 pr-9 focus:ring-zinc-900 font-medium'}
                  >
                    {MESES.map((mes, index) => (
                      <option key={mes} value={index + 1}>
                        {mes}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" weight="bold" />
                </div>
              </label>

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Fiscal (Año)</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                    YR
                  </span>
                  <select
                    value={selectedAnio}
                    onChange={(event) => onAnioChange(Number(event.target.value))}
                    disabled={isLoadingAnios}
                    className={COMPONENT_STYLES.select.base + ' pl-10 pr-9 focus:ring-zinc-900 font-bold'}
                  >
                    {aniosDisponibles.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" weight="bold" />
                </div>
              </label>
            </div>
          </div>

          {/* Action Dock */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {!isReadOnly && pendingChangesCount > 0 ? (
              <ActionButton
                label={isAutoSaving ? 'Sincronizando' : 'Fijar Matriz'}
                icon={isAutoSaving ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <FloppyDisk className="h-4 w-4" weight="bold" />}
                onClick={onSaveChanges}
                disabled={isAutoSaving}
                isPrimary
                count={pendingChangesCount}
              />
            ) : null}

            {!isReadOnly ? (
              <button
                type="button"
                onClick={onOpenVales}
                disabled={!selectedVacuna || selectedCentroAcopio === 'todos'}
                className={
                  !selectedVacuna || selectedCentroAcopio === 'todos'
                    ? COMPONENT_STYLES.button.secondary
                    : 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-transparent bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:ring-offset-white'
                }
                title="Tickets (Vales)"
              >
                <Receipt className="h-4 w-4" weight="bold" />
                <span className="hidden lg:inline">Tickets (Vales)</span>
              </button>
            ) : (
              <span className="inline-flex min-h-[44px] items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-500 uppercase tracking-wider">
                Read Only
              </span>
            )}

            <ActionButton
              label="Sync"
              icon={<ArrowsClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="bold" />}
              onClick={onRefresh}
              disabled={isLoading || !selectedVacuna}
            />

            {!isReadOnly ? (
              <ActionButton label="I/O Excel" icon={<UploadSimple className="h-4 w-4" weight="bold" />} onClick={onImport} />
            ) : null}

            {!isReadOnly ? (
              <ActionButton
                label={isExporting ? 'Procesando' : 'Extraer'}
                icon={isExporting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <DownloadSimple className="h-4 w-4" weight="bold" />}
                onClick={onExport}
                disabled={isExporting || !selectedVacuna}
                isPrimary
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Metricas de Stock */}
      {stockPanelContent}
    </section>
  );
});

MovimientosHeaderCompact.displayName = 'MovimientosHeaderCompact';
