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
import { Vacuna } from '../../../types';
import { EntregasProgressBadge } from './EntregasProgressBadge';
import { ProgresoValesResponse } from '../../../services/movimientosService';

import type { StockInfo, CentroAcopioFilterOption } from '../types';

interface MovimientosHeaderCompactProps {
  isReadOnly?: boolean;
  hasOperativeEditPermission?: boolean;
  hideValesAction?: boolean;
  hideImportAction?: boolean;
  hideExportAction?: boolean;
  lockedCentroAcopioLabel?: string;
  showReadOnlyCentroFilter?: boolean;
  allCentrosLabel?: string;
  hideStockMetrics?: boolean;
  selectedCentroAcopio: string;
  selectedVacuna: string;
  selectedMes: number;
  selectedAnio: number;
  centrosAcopio: CentroAcopioFilterOption[];
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
  showLabel?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
  isPrimary = false,
  count,
  showLabel = true,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={isPrimary ? COMPONENT_STYLES.button.primary : COMPONENT_STYLES.button.secondary}
    title={label}
  >
    {icon}
    {showLabel ? <span className="hidden lg:inline">{label}</span> : null}
    {count ? (
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-inherit">{count}</span>
    ) : null}
  </button>
);

export const MovimientosHeaderCompact: React.FC<MovimientosHeaderCompactProps> = memo(({
  isReadOnly = false,
  hasOperativeEditPermission = false,
  hideValesAction = false,
  hideImportAction = false,
  hideExportAction = false,
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
    <div className="relative z-[90] overflow-visible border-t border-[#eeeef3] bg-white px-5 py-3 sm:px-6">
      {!selectedVacuna ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#e7e7ef] bg-[#fbfafd] px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e7e7ef] bg-white text-[#606571]">
            <Package className="h-4 w-4" weight="duotone" />
          </div>
          <p className="text-sm font-semibold tracking-tight text-[#15171d]">Selecciona una vacuna para visualizar el stock operativo.</p>
        </div>
      ) : isLoadingStock || isUpdatingStock ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-[#e7e7ef] bg-[#fbfafd] px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e7e7ef] bg-white text-[#606571]">
            <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
          </div>
          <p className="text-sm font-semibold tracking-tight text-[#15171d]">Sincronizando balances...</p>
        </div>
      ) : stockError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600">
              <Warning className="h-4 w-4" weight="fill" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8rem] font-semibold text-rose-900 tracking-tight">Fallo en la lectura de stock</p>
              <p className="mt-0.5 text-[0.7rem] font-medium text-rose-700">{stockError}</p>
            </div>
            <button type="button" onClick={onRetryStock} className={COMPONENT_STYLES.button.secondary}>
              <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
              <span>Recargar</span>
            </button>
          </div>
        </div>
      ) : stockInfo ? (
        <div className="relative z-[90] space-y-2 overflow-visible">
          <div className="relative z-[90] flex flex-wrap items-stretch gap-2 overflow-visible">
            <div className="flex min-h-14 items-center gap-2 rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd] px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e7e7ef] bg-white text-[#606571]">
                <CalendarBlank className="h-4 w-4" weight="duotone" />
              </div>
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8b8f9b]">Periodo objetivo</p>
                <p className="text-sm font-semibold tracking-tight text-[#15171d]">{periodoEntrega.etiqueta}</p>
              </div>
            </div>

            <ArrowRight className="hidden h-14 w-3 shrink-0 text-[#8b8f9b] lg:block" weight="bold" />

            <div className="relative z-[110]" ref={stockInicialRef}>
              <button
                type="button"
                onClick={() => setShowStockInicialDropdown((prev) => !prev)}
                className="flex min-h-14 items-center gap-2 rounded-[12px] border border-[#e7e7ef] bg-white px-3 py-2 text-left transition hover:bg-[#fbfafd]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e7e7ef] bg-[#fbfafd] text-[#606571]">
                  <Package className="h-4 w-4" weight="duotone" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8b8f9b]">Apertura</p>
                  <p className="text-sm font-semibold tracking-tight text-[#15171d]">
                    {stockInfo.tieneHistorialInicial ? (stockInfo.stockInicialHistorico?.toLocaleString() || '0') : '—'}
                  </p>
                </div>
                <CaretDown className={`h-3.5 w-3.5 text-[#606571] transition-transform ${showStockInicialDropdown ? 'rotate-180' : ''}`} weight="bold" />
              </button>

              {showStockInicialDropdown ? (
                <div className="absolute left-0 top-full z-[180] mt-2 w-[min(280px,calc(100vw-3rem))] rounded-xl border border-[#e7e7ef] bg-white p-3 shadow-[0_24px_60px_-28px_rgba(12,15,24,0.55)] sm:w-[280px]">
                  <h4 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-[#8b8f9b]">Volumen desglosado</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-[#e7e7ef] bg-[#fbfafd] px-3 py-2">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#8b8f9b]">Base histórica</p>
                      <p className="mt-1 text-sm font-semibold text-[#15171d]">{stockInfo.stockInicialOriginal?.toLocaleString() || 0}</p>
                    </div>
                    <div className="rounded-lg border border-[#e7e7ef] bg-white px-3 py-2">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#8b8f9b]">Nuevos ingresos</p>
                      <p className="mt-1 text-sm font-semibold text-[#15171d]">{(stockInfo.ingresosLotesDelMes ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                  {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial ? (
                    <p className="mt-3 text-right text-[0.65rem] font-medium text-zinc-400">
                      Ref: {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <ArrowRight className="hidden h-14 w-3 shrink-0 text-[#8b8f9b] lg:block" weight="bold" />

            <EntregasProgressBadge
              totalEntregas={stockInfo.totalEntregas}
              progresoVales={progresoVales}
              isLoading={isLoadingProgresoVales}
              onRefresh={onRefreshProgresoVales}
            />

            <ArrowRight className="hidden h-14 w-3 shrink-0 text-[#8b8f9b] lg:block" weight="bold" />

            <button
              type="button"
              onClick={stockInfo.stockDisponible < 0 && !isReadOnly && onOpenAjusteDeficit ? onOpenAjusteDeficit : undefined}
              disabled={stockInfo.stockDisponible >= 0 || isReadOnly || !onOpenAjusteDeficit}
              title={
                stockInfo.stockDisponible < 0
                  ? ajusteDeficitDisponible
                    ? 'Abrir ajuste automático de déficit'
                    : 'Revisar déficit detectado'
                  : 'Stock disponible'
              }
              className={`flex min-h-14 items-center gap-2 rounded-[12px] border px-3 py-2 text-left transition ${
                stockInfo.stockDisponible < 0
                  ? 'cursor-pointer border-rose-200 bg-rose-50 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60'
                  : 'border-[#e7e7ef] bg-white hover:bg-[#fbfafd] disabled:cursor-not-allowed disabled:opacity-60'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                stockInfo.stockDisponible < 0 ? 'border-rose-200 bg-white text-rose-600' : 'border-[#e7e7ef] bg-[#fbfafd] text-[#606571]'
              }`}>
                {stockInfo.stockDisponible < 0
                  ? <Warning className="h-4 w-4" weight="fill" />
                  : <CheckCircle className="h-4 w-4" weight="fill" />}
              </div>
              <div>
                <p className={`text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${stockInfo.stockDisponible < 0 ? 'text-rose-700' : 'text-[#8b8f9b]'}`}>
                  {stockInfo.stockDisponible < 0 ? 'Déficit' : 'Disponible'}
                </p>
                <p className={`text-sm font-semibold tracking-tight ${stockInfo.stockDisponible < 0 ? 'text-rose-900' : 'text-[#15171d]'}`}>
                  {stockInfo.stockDisponible.toLocaleString()}
                </p>
              </div>
              {stockInfo.stockDisponible < 0 && !isReadOnly && onOpenAjusteDeficit ? (
                <Faders className="ml-1 h-3.5 w-3.5 text-rose-600" weight="bold" />
              ) : null}
            </button>

            <ArrowRight className="hidden h-14 w-3 shrink-0 text-[#8b8f9b] lg:block" weight="bold" />

            <div className="relative z-[110]" ref={stockActualRef}>
              <button
                type="button"
                onClick={() => setShowStockActualDropdown((prev) => !prev)}
                className="flex min-h-14 items-center gap-2 rounded-[12px] border border-[#e7e7ef] bg-white px-3 py-2 text-left transition hover:bg-[#fbfafd]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e7e7ef] bg-[#fbfafd] text-[#606571]">
                  <Package className="h-4 w-4" weight="duotone" />
                </div>
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8b8f9b]">Stock actual</p>
                  <p className="text-sm font-semibold tracking-tight text-[#15171d]">{stockInfo.stockActual.toLocaleString()}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#e7e7ef] bg-[#fbfafd] px-2 py-0.5 text-[0.65rem] font-semibold tracking-widest text-[#606571]">
                  {lotesDisponibles.length} lotes
                </span>
                <CaretDown className={`h-3.5 w-3.5 text-[#606571] transition-transform ${showStockActualDropdown ? 'rotate-180' : ''}`} weight="bold" />
              </button>

              {showStockActualDropdown ? (
                <div className="absolute right-0 top-full z-[180] mt-2 w-[min(300px,calc(100vw-3rem))] rounded-xl border border-[#e7e7ef] bg-white p-3 shadow-[0_24px_60px_-28px_rgba(12,15,24,0.55)] sm:w-[300px]">
                  <h4 className="mb-2 text-[0.65rem] font-semibold uppercase tracking-widest text-[#8b8f9b]">
                    Lotes disponibles ({lotesDisponibles.length})
                  </h4>
                  {lotesDisponibles.length > 0 ? (
                    <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                      {lotesDisponibles.map((lote, index) => (
                        <div
                          key={lote.id}
                          className={`rounded-lg border px-3 py-2.5 ${
                            index === 0
                              ? 'border-[#d7d8e2] bg-[#fbfafd] text-[#15171d]'
                              : 'border-[#e7e7ef] bg-white hover:bg-[#fbfafd] text-zinc-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[0.85rem] font-semibold tracking-tight">{lote.numero}</p>
                              <p className="text-[0.65rem] font-medium text-zinc-500">
                                Vence: {new Date(lote.fechaVencimiento).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-[0.75rem] font-semibold tracking-tight text-[#15171d]">
                              {lote.cantidadActual.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-[0.8rem] font-medium text-zinc-500">No existen lotes disponibles.</p>
                  )}
                </div>
              ) : null}
            </div>

            {stockInfo.tieneHistorialInicial ? (
              <div className="ml-auto flex min-h-14 shrink-0 items-stretch">
                <button
                  type="button"
                  onClick={onActualizarStockSiguienteMes}
                  disabled={isUpdatingStockSiguienteMes}
                  className="flex min-h-14 items-center gap-2 rounded-[12px] border border-[#e7e7ef] bg-white px-3 py-2 text-left text-sm font-semibold text-[#15171d] shadow-sm transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 disabled:cursor-not-allowed disabled:opacity-60"
                  title={`Actualizar stock de ${periodoSiguiente}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e7e7ef] bg-[#fbfafd] text-[#606571]">
                    {isUpdatingStockSiguienteMes ? (
                      <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                    ) : (
                      <ArrowsClockwise className="h-4 w-4" weight="bold" />
                    )}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span>Actualizar siguiente mes</span>
                    <span className="mt-0.5 text-[0.65rem] font-semibold text-[#8b8f9b]">{periodoSiguiente}</span>
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <section className="relative z-[80] flex h-full flex-col overflow-visible bg-white">
      {/* Filtros + Acciones */}
      <div className="border-b border-[#eeeef3] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {shouldRenderCentroSelect ? (
                <label className="block">
                  <span className={COMPONENT_STYLES.input.label}>Centro de acopio</span>
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
                  <span className={COMPONENT_STYLES.input.label}>Centro asignado</span>
                  <div className="flex min-h-[44px] items-center gap-2.5 rounded-lg border border-[#e7e7ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#15171d] shadow-sm">
                    <Buildings className="h-4 w-4 shrink-0 text-zinc-500" weight="duotone" />
                    <span className="truncate">{lockedCentroAcopioLabel || centroNombre}</span>
                  </div>
                </div>
              )}

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Vacuna</span>
                <div className="relative">
                  <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" weight="duotone" />
                  <select
                    value={selectedVacuna}
                    onChange={(event) => onVacunaChange(event.target.value)}
                    disabled={isLoadingVacunas}
                    className={COMPONENT_STYLES.select.base + ' pl-9 pr-9 focus:ring-zinc-900 font-medium'}
                  >
                    {vacunasActivas.length === 0 ? <option value="">Inicializando...</option> : null}
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
                <span className={COMPONENT_STYLES.input.label}>Mes</span>
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
                <span className={COMPONENT_STYLES.input.label}>Año</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    AÑO
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
                label={isAutoSaving ? 'Guardando' : 'Guardar cambios'}
                icon={isAutoSaving ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <FloppyDisk className="h-4 w-4" weight="bold" />}
                onClick={onSaveChanges}
                disabled={isAutoSaving}
                isPrimary
                count={pendingChangesCount}
              />
            ) : null}

            {!isReadOnly && !hideValesAction ? (
              <button
                type="button"
                onClick={onOpenVales}
                disabled={!selectedVacuna || selectedCentroAcopio === 'todos'}
                className={
                  !selectedVacuna || selectedCentroAcopio === 'todos'
                    ? COMPONENT_STYLES.button.secondary
                    : COMPONENT_STYLES.button.primary
                }
                title="Vales"
              >
                <Receipt className="h-4 w-4" weight="bold" />
                <span className="hidden lg:inline">Vales</span>
              </button>
            ) : (
              <span className={`inline-flex min-h-9 items-center rounded-[9px] border px-3.5 py-1.5 text-sm font-semibold ${
                hasOperativeEditPermission
                  ? 'border-[#e7e7ef] bg-white text-[#15171d]'
                  : 'border-[#e7e7ef] bg-[#fbfafd] text-[#606571]'
              }`}>
                {hasOperativeEditPermission ? 'Edición habilitada' : 'Solo lectura'}
              </span>
            )}

            <ActionButton
              label="Sincronizar"
              icon={<ArrowsClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="bold" />}
              onClick={onRefresh}
              disabled={isLoading || !selectedVacuna}
            />

            {!isReadOnly && !hideImportAction ? (
              <ActionButton label="Importar Excel" icon={<UploadSimple className="h-4 w-4" weight="bold" />} onClick={onImport} showLabel={false} />
            ) : null}

            {!hideExportAction ? (
              <ActionButton
                label={isExporting ? 'Procesando' : 'Exportar'}
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
