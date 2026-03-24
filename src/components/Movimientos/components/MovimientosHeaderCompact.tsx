import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Loader2,
  Package,
  Receipt,
  RefreshCw,
  Save,
  Settings2,
  Upload,
} from 'lucide-react';
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
    <div className="border-t border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
      {/* Contenido del resumen */}
      {!selectedVacuna ? (
        <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Package className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-medium text-white/90">Selecciona una vacuna para ver el resumen operativo</p>
        </div>
      ) : isLoadingStock || isUpdatingStock ? (
        <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
          <p className="text-sm font-medium text-white/90">Cargando resumen de stock...</p>
        </div>
      ) : stockError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-3 py-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8rem] font-semibold text-rose-900">No se pudo cargar el stock</p>
              <p className="mt-0.5 text-[0.7rem] text-rose-700">{stockError}</p>
            </div>
            <button type="button" onClick={onRetryStock} className={COMPONENT_STYLES.button.secondary}>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      ) : stockInfo ? (
        <div className="space-y-2">
          {/* Barra de resumen estilo gradiente */}
          <div className="relative rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 px-1 py-1">
            <div className="flex flex-wrap items-center gap-y-1">
              {/* PERÍODO */}
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                  <Calendar className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-[0.6rem]">Período</p>
                  <p className="text-xs font-bold text-white sm:text-sm">{periodoEntrega.etiqueta.toUpperCase()}</p>
                </div>
              </div>

              <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-white/40 sm:mx-1 sm:h-3.5 sm:w-3.5" />

              {/* INICIAL - expandible */}
              <div className="relative" ref={stockInicialRef}>
                <button
                  type="button"
                  onClick={() => setShowStockInicialDropdown((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 text-left transition hover:bg-white/15 sm:gap-2.5 sm:px-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                    <Package className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                  </div>
                  <div>
                    <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-[0.6rem]">Inicial</p>
                    <p className="text-xs font-bold text-white sm:text-sm">
                      {stockInfo.tieneHistorialInicial
                        ? (stockInfo.stockInicialHistorico?.toLocaleString() || '0')
                        : '—'}
                    </p>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-white/50 transition-transform ${showStockInicialDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showStockInicialDropdown ? (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-[260px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:min-w-[280px]">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Desglose stock inicial</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-400">Base</p>
                        <p className="text-sm font-bold text-slate-800">{stockInfo.stockInicialOriginal?.toLocaleString() || 0}</p>
                      </div>
                      <div className="rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-1.5">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-teal-500">Ingresos del mes</p>
                        <p className="text-sm font-bold text-teal-800">{stockInfo.ingresosLotesDelMes.toLocaleString()}</p>
                      </div>
                    </div>
                    {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial ? (
                      <p className="mt-2 text-[0.68rem] text-slate-500">
                        Capturado el {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-white/40 sm:mx-1 sm:h-3.5 sm:w-3.5" />

              {/* ENTREGAS */}
              <div className="relative">
                <EntregasProgressBadge
                  totalEntregas={stockInfo.totalEntregas}
                  progresoVales={progresoVales}
                  isLoading={isLoadingProgresoVales}
                  onRefresh={onRefreshProgresoVales}
                />
              </div>

              <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-white/40 sm:mx-1 sm:h-3.5 sm:w-3.5" />

              {/* DISPONIBLE */}
              <button
                type="button"
                onClick={stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && onOpenAjusteDeficit ? onOpenAjusteDeficit : undefined}
                disabled={stockInfo.stockDisponible >= 0 || !ajusteDeficitDisponible || !onOpenAjusteDeficit}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition sm:gap-2.5 sm:px-3 ${
                  stockInfo.stockDisponible < 0
                    ? 'bg-rose-500/30 hover:bg-rose-500/40'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                  stockInfo.stockDisponible < 0 ? 'bg-rose-400/30' : 'bg-white/20'
                }`}>
                  {stockInfo.stockDisponible < 0
                    ? <AlertTriangle className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                    : <CheckCircle2 className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />}
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-[0.6rem]">
                    {stockInfo.stockDisponible < 0 ? 'Déficit' : 'Disponible'}
                  </p>
                  <p className="text-xs font-bold text-white sm:text-sm">{stockInfo.stockDisponible.toLocaleString()}</p>
                </div>
                {stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && onOpenAjusteDeficit ? (
                  <Settings2 className="h-3.5 w-3.5 text-white/60" />
                ) : null}
              </button>

              <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-white/40 sm:mx-1 sm:h-3.5 sm:w-3.5" />

              {/* ACTUAL + LOTES */}
              <div className="relative" ref={stockActualRef}>
                <button
                  type="button"
                  onClick={() => setShowStockActualDropdown((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 text-left transition hover:bg-white/15 sm:gap-2.5 sm:px-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                    <Boxes className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                  </div>
                  <div>
                    <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-[0.6rem]">Actual</p>
                    <p className="text-xs font-bold text-white sm:text-sm">{stockInfo.stockActual.toLocaleString()}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white sm:px-2 sm:text-[0.65rem]">
                    {lotesDisponibles.length} Lote{lotesDisponibles.length === 1 ? '' : 's'}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-white/50 transition-transform ${showStockActualDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showStockActualDropdown ? (
                  <div className="absolute right-0 top-full z-50 mt-2 min-w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:min-w-[300px]">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Lotes disponibles ({lotesDisponibles.length})
                    </h4>
                    {lotesDisponibles.length > 0 ? (
                      <div className="max-h-48 space-y-1.5 overflow-y-auto">
                        {lotesDisponibles.map((lote, index) => (
                          <div
                            key={lote.id}
                            className={`rounded-xl border px-3 py-2 ${
                              index === 0
                                ? 'border-teal-200 bg-teal-50/80'
                                : 'border-slate-200 bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[0.8rem] font-semibold text-slate-800">{lote.numero}</p>
                                <p className="text-[0.68rem] text-slate-500">
                                  Vence {new Date(lote.fechaVencimiento).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-[0.8rem] font-bold text-slate-900">
                                {lote.cantidadActual.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-3 text-center text-[0.8rem] text-slate-500">No hay lotes con disponibilidad.</p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Botón actualizar sig. mes */}
          {stockInfo.tieneHistorialInicial ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onActualizarStockSiguienteMes}
                disabled={isUpdatingStockSiguienteMes}
                className={COMPONENT_STYLES.button.secondary}
                title={`Actualizar stock inicial de ${periodoSiguiente}`}
              >
                {isUpdatingStockSiguienteMes ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Actualizar sig. mes</span>
                <span className="sm:hidden">Sig. mes</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
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
    <section className={COMPONENT_STYLES.panel}>
      {/* Filtros + Acciones */}
      <div className="border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">
          {/* Filtros - grid 2-col on mobile, 4-col on xl */}
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
              {shouldRenderCentroSelect ? (
                <label className="block">
                  <span className={COMPONENT_STYLES.input.label}>Centro de acopio</span>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-500 sm:left-3 sm:h-4 sm:w-4" />
                    <select
                      value={selectedCentroAcopio}
                      onChange={(event) => onCentroAcopioChange(event.target.value)}
                      disabled={isLoadingEstablecimientos}
                      className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal} pl-8 pr-8 text-xs sm:pl-10 sm:pr-10 sm:text-sm`}
                    >
                      <option value="todos">{allCentrosLabel}</option>
                      {centrosAcopio.map((centro) => (
                        <option key={centro.id} value={centro.id}>
                          {centro.nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:right-3 sm:h-4 sm:w-4" />
                  </div>
                </label>
              ) : (
                <div>
                  <span className={COMPONENT_STYLES.input.label}>Centro asignado</span>
                  <div className="flex min-h-[40px] items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 sm:min-h-[44px] sm:px-4 sm:py-2.5 sm:text-sm">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-teal-600 sm:h-4 sm:w-4" />
                    <span className="truncate">{lockedCentroAcopioLabel || centroNombre}</span>
                  </div>
                </div>
              )}

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Vacuna</span>
                <div className="relative">
                  <Package className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyan-500 sm:left-3 sm:h-4 sm:w-4" />
                  <select
                    value={selectedVacuna}
                    onChange={(event) => onVacunaChange(event.target.value)}
                    disabled={isLoadingVacunas}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan} pl-8 pr-8 text-xs sm:pl-10 sm:pr-10 sm:text-sm`}
                  >
                    {vacunasActivas.length === 0 ? <option value="">Seleccione...</option> : null}
                    {vacunasActivas.map((vacuna) => (
                      <option key={vacuna.id} value={vacuna.id}>
                        {vacuna.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:right-3 sm:h-4 sm:w-4" />
                </div>
              </label>

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Mes base</span>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-500 sm:left-3 sm:h-4 sm:w-4" />
                  <select
                    value={selectedMes}
                    onChange={(event) => onMesChange(Number(event.target.value))}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal} pl-8 pr-8 text-xs sm:pl-10 sm:pr-10 sm:text-sm`}
                  >
                    {MESES.map((mes, index) => (
                      <option key={mes} value={index + 1}>
                        {mes}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:right-3 sm:h-4 sm:w-4" />
                </div>
              </label>

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Año</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-cyan-600 sm:left-3 sm:text-[10px]">
                    AÑO
                  </span>
                  <select
                    value={selectedAnio}
                    onChange={(event) => onAnioChange(Number(event.target.value))}
                    disabled={isLoadingAnios}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan} pl-10 pr-8 text-xs sm:pl-12 sm:pr-10 sm:text-sm`}
                  >
                    {aniosDisponibles.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 sm:right-3 sm:h-4 sm:w-4" />
                </div>
              </label>
            </div>
          </div>

          {/* Botones de acción - horizontal scroll on small screens */}
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {!isReadOnly && pendingChangesCount > 0 ? (
              <ActionButton
                label={isAutoSaving ? 'Guardando' : 'Guardar cambios'}
                icon={isAutoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                onClick={onSaveChanges}
                disabled={isAutoSaving}
                isPrimary
                count={pendingChangesCount}
              />
            ) : null}

            {!isReadOnly ? (
              <ActionButton
                label="Vales"
                icon={<Receipt className="h-4 w-4" />}
                onClick={onOpenVales}
                disabled={!selectedVacuna || selectedCentroAcopio === 'todos'}
              />
            ) : (
              <span className="inline-flex min-h-[38px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                Solo lectura
              </span>
            )}

            <ActionButton
              label="Actualizar"
              icon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={onRefresh}
              disabled={isLoading || !selectedVacuna}
            />

            {!isReadOnly ? (
              <ActionButton label="Importar" icon={<Upload className="h-4 w-4" />} onClick={onImport} />
            ) : null}

            {!isReadOnly ? (
              <ActionButton
                label={isExporting ? 'Exportando' : 'Exportar'}
                icon={isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                onClick={onExport}
                disabled={isExporting || !selectedVacuna}
                isPrimary
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Resumen operativo debajo de los filtros */}
      {stockPanelContent}
    </section>
  );
});

MovimientosHeaderCompact.displayName = 'MovimientosHeaderCompact';
