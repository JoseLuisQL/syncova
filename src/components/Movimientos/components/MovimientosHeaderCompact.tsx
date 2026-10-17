import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Warning,
  Buildings,
  CalendarBlank,
  CheckCircle,
  CaretDown,
  CaretLeft,
  CaretRight,
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
    {showLabel ? <span className="hidden sm:inline">{label}</span> : null}
    {count ? (
      <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold text-inherit tabular-nums">
        {count}
      </span>
    ) : null}
  </button>
);

const FILTER_LABEL_CLASS = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted';
const SELECT_BASE_CLASS =
  'h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-8 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted';

export const MovimientosHeaderCompact: React.FC<MovimientosHeaderCompactProps> = memo(({
  isReadOnly = false,
  hasOperativeEditPermission = false,
  hideValesAction = false,
  hideImportAction = false,
  hideExportAction = false,
  lockedCentroAcopioLabel,
  showReadOnlyCentroFilter = false,
  allCentrosLabel = 'Todos los centros',
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
  datosTablaLength,
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
      (stockInfo?.lotes || [])
        .filter((lote) => (lote?.cantidadActual ?? 0) > 0)
        .sort(
          (a, b) =>
            new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime(),
        ),
    [stockInfo?.lotes],
  );

  const handleStepMonth = (delta: number) => {
    let nextMes = selectedMes + delta;
    let nextAnio = selectedAnio;
    if (nextMes < 1) {
      nextMes = 12;
      nextAnio -= 1;
    } else if (nextMes > 12) {
      nextMes = 1;
      nextAnio += 1;
    }
    if (nextAnio !== selectedAnio && aniosDisponibles.includes(nextAnio)) {
      onAnioChange(nextAnio);
    }
    onMesChange(nextMes);
  };

  const stockDisponibleVal = stockInfo?.stockDisponible ?? 0;
  const stockActualVal = stockInfo?.stockActual ?? 0;
  const totalEntregasVal = stockInfo?.totalEntregas ?? 0;

  const stockPanelContent = hideStockMetrics ? null : (
    <div className="relative z-[90] overflow-visible border-t border-line bg-surface-muted/60 px-3 py-2 sm:px-5">
      {!selectedVacuna ? (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-muted">
          <Package className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" weight="duotone" />
          <span>Selecciona una vacuna para visualizar el balance y lotes operativos.</span>
        </div>
      ) : isLoadingStock || isUpdatingStock ? (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-medium text-muted">
          <CircleNotch className="h-4 w-4 shrink-0 animate-spin text-teal-600 dark:text-teal-400" weight="bold" />
          <span>Sincronizando balances del almacén...</span>
        </div>
      ) : stockError ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Warning className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" weight="fill" />
            <p className="truncate text-xs font-medium text-rose-800 dark:text-rose-200">{stockError}</p>
          </div>
          <button type="button" onClick={onRetryStock} className={COMPONENT_STYLES.button.secondary}>
            <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
            <span>Reintentar</span>
          </button>
        </div>
      ) : stockInfo ? (
        <div className="relative z-[90] flex flex-wrap items-center gap-2 overflow-visible">
          {/* Periodo objetivo */}
          <div className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 shadow-2xs">
            <CalendarBlank className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" weight="duotone" />
            <div className="leading-none">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Entrega</p>
              <p className="mt-0.5 text-xs font-semibold text-ink">{periodoEntrega.etiqueta}</p>
            </div>
          </div>

          {/* Apertura */}
          <div className="relative z-[110]" ref={stockInicialRef}>
            <button
              type="button"
              onClick={() => setShowStockInicialDropdown((prev) => !prev)}
              className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-left shadow-2xs transition hover:border-line-strong hover:bg-surface-muted"
            >
              <div className="leading-none">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Apertura</p>
                <p className="mt-0.5 text-xs font-semibold text-ink tabular-nums">
                  {stockInfo.tieneHistorialInicial ? (stockInfo.stockInicialHistorico?.toLocaleString() || '0') : '—'}
                </p>
              </div>
              <CaretDown className={`h-3 w-3 text-muted transition-transform ${showStockInicialDropdown ? 'rotate-180' : ''}`} weight="bold" />
            </button>

            {showStockInicialDropdown ? (
              <div className="absolute left-0 top-full z-[180] mt-1.5 w-[260px] rounded-xl border border-line bg-surface p-3 shadow-lg">
                <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">Volumen desglosado</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-line bg-surface-muted px-2.5 py-2">
                    <p className="text-[10px] font-medium text-muted">Base histórica</p>
                    <p className="mt-0.5 text-xs font-semibold text-ink tabular-nums">
                      {(stockInfo.stockInicialOriginal ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-line bg-surface-muted px-2.5 py-2">
                    <p className="text-[10px] font-medium text-muted">Nuevos ingresos</p>
                    <p className="mt-0.5 text-xs font-semibold text-ink tabular-nums">
                      {(stockInfo.ingresosLotesDelMes ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial ? (
                  <p className="mt-2 text-right text-[10px] text-muted">
                    Ref: {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString('es-PE')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Entregas y Progreso de Vales */}
          <EntregasProgressBadge
            totalEntregas={totalEntregasVal}
            progresoVales={progresoVales}
            isLoading={isLoadingProgresoVales}
            onRefresh={onRefreshProgresoVales}
          />

          {/* Disponible / Déficit */}
          <button
            type="button"
            onClick={stockDisponibleVal < 0 && !isReadOnly && onOpenAjusteDeficit ? onOpenAjusteDeficit : undefined}
            disabled={stockDisponibleVal >= 0 || isReadOnly || !onOpenAjusteDeficit}
            title={
              stockDisponibleVal < 0
                ? ajusteDeficitDisponible
                  ? 'Abrir ajuste automático de déficit'
                  : 'Revisar déficit detectado'
                : 'Stock disponible después de entregas'
            }
            className={`flex h-10 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left shadow-2xs transition ${
              stockDisponibleVal < 0
                ? 'cursor-pointer border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20'
                : 'border-line bg-surface'
            }`}
          >
            {stockDisponibleVal < 0 ? (
              <Warning className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" weight="fill" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" weight="fill" />
            )}
            <div className="leading-none">
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${stockDisponibleVal < 0 ? 'text-rose-700 dark:text-rose-300' : 'text-muted'}`}>
                {stockDisponibleVal < 0 ? 'Déficit' : 'Disponible'}
              </p>
              <p className={`mt-0.5 text-xs font-semibold tabular-nums ${stockDisponibleVal < 0 ? 'text-rose-900 dark:text-rose-100' : 'text-ink'}`}>
                {stockDisponibleVal.toLocaleString()}
              </p>
            </div>
            {stockDisponibleVal < 0 && !isReadOnly && onOpenAjusteDeficit ? (
              <Faders className="ml-0.5 h-3.5 w-3.5 text-rose-600 dark:text-rose-400" weight="bold" />
            ) : null}
          </button>

          {/* Stock actual + Lotes */}
          <div className="relative z-[110]" ref={stockActualRef}>
            <button
              type="button"
              onClick={() => setShowStockActualDropdown((prev) => !prev)}
              className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-left shadow-2xs transition hover:border-line-strong hover:bg-surface-muted"
            >
              <div className="leading-none">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Stock físico</p>
                <p className="mt-0.5 text-xs font-semibold text-ink tabular-nums">{stockActualVal.toLocaleString()}</p>
              </div>
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted tabular-nums">
                {lotesDisponibles.length} {lotesDisponibles.length === 1 ? 'lote' : 'lotes'}
              </span>
              <CaretDown className={`h-3 w-3 text-muted transition-transform ${showStockActualDropdown ? 'rotate-180' : ''}`} weight="bold" />
            </button>

            {showStockActualDropdown ? (
              <div className="absolute right-0 top-full z-[180] mt-1.5 w-[280px] rounded-xl border border-line bg-surface p-3 shadow-lg">
                <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Lotes disponibles ({lotesDisponibles.length})
                </h4>
                {lotesDisponibles.length > 0 ? (
                  <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                    {lotesDisponibles.map((lote, index) => (
                      <div
                        key={lote.id}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 ${
                          index === 0
                            ? 'border-teal-500/30 bg-teal-500/10 text-ink'
                            : 'border-line bg-surface text-ink'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">{lote.numero}</p>
                          <p className="text-[10px] text-muted">
                            Vence: {new Date(lote.fechaVencimiento).toLocaleDateString('es-PE')}
                          </p>
                        </div>
                        <span className="shrink-0 rounded border border-line bg-surface px-2 py-0.5 text-xs font-semibold text-ink tabular-nums">
                          {lote.cantidadActual.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-center text-xs text-muted">No existen lotes disponibles.</p>
                )}
              </div>
            ) : null}
          </div>

          <span className="hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-muted">
            <strong className="font-semibold text-ink tabular-nums">{datosTablaLength}</strong> EESS
          </span>

          {stockInfo.tieneHistorialInicial ? (
            <div className="ml-auto flex items-center">
              <button
                type="button"
                onClick={onActualizarStockSiguienteMes}
                disabled={isUpdatingStockSiguienteMes}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink shadow-2xs transition hover:border-line-strong hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                title={`Actualizar stock inicial de ${periodoSiguiente}`}
              >
                {isUpdatingStockSiguienteMes ? (
                  <CircleNotch className="h-3.5 w-3.5 animate-spin text-teal-600 dark:text-teal-400" weight="bold" />
                ) : (
                  <ArrowsClockwise className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" weight="bold" />
                )}
                <span className="hidden sm:inline">Cerrar hacia</span>
                <span className="font-bold text-ink">{periodoSiguiente}</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <section className="relative z-[80] flex flex-col overflow-visible bg-surface">
      {/* Barra compacta de filtros y acciones */}
      <div className="border-b border-line px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
          {/* Grid de selectores */}
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
            {shouldRenderCentroSelect ? (
              <label className="block min-w-0">
                <span className={FILTER_LABEL_CLASS}>Centro de acopio</span>
                <div className="relative">
                  <Buildings className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" weight="duotone" />
                  <select
                    value={selectedCentroAcopio}
                    onChange={(event) => onCentroAcopioChange(event.target.value)}
                    disabled={isLoadingEstablecimientos}
                    className={SELECT_BASE_CLASS}
                  >
                    <option value="todos">{allCentrosLabel}</option>
                    {centrosAcopio.map((centro) => (
                      <option key={centro.id} value={centro.id}>
                        {centro.nombre}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" weight="bold" />
                </div>
              </label>
            ) : (
              <div className="min-w-0">
                <span className={FILTER_LABEL_CLASS}>Centro asignado</span>
                <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-muted px-3 text-xs sm:text-sm font-semibold text-ink">
                  <Buildings className="h-4 w-4 shrink-0 text-muted" weight="duotone" />
                  <span className="truncate">{lockedCentroAcopioLabel || centroNombre}</span>
                </div>
              </div>
            )}

            <label className="block min-w-0">
              <span className={FILTER_LABEL_CLASS}>Biológico / Vacuna</span>
              <div className="relative">
                <Package className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" weight="duotone" />
                <select
                  value={selectedVacuna}
                  onChange={(event) => onVacunaChange(event.target.value)}
                  disabled={isLoadingVacunas}
                  className={SELECT_BASE_CLASS}
                >
                  {vacunasActivas.length === 0 ? <option value="">Cargando...</option> : null}
                  {vacunasActivas.map((vacuna) => (
                    <option key={vacuna.id} value={vacuna.id}>
                      {vacuna.nombre}
                    </option>
                  ))}
                </select>
                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" weight="bold" />
              </div>
            </label>

            <div className="min-w-0">
              <span className={FILTER_LABEL_CLASS}>Mes operativo</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStepMonth(-1)}
                  className="inline-flex h-9 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted transition hover:border-line-strong hover:bg-surface-muted hover:text-ink"
                  title="Mes anterior"
                  aria-label="Mes anterior"
                >
                  <CaretLeft className="h-3.5 w-3.5" weight="bold" />
                </button>
                <div className="relative min-w-0 flex-1">
                  <select
                    value={selectedMes}
                    onChange={(event) => onMesChange(Number(event.target.value))}
                    className="h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-2.5 pr-7 text-xs sm:text-sm font-medium text-ink shadow-2xs transition hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
                    aria-label="Seleccionar mes"
                  >
                    {MESES.map((mes, index) => (
                      <option key={mes} value={index + 1}>
                        {mes}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" weight="bold" />
                </div>
                <button
                  type="button"
                  onClick={() => handleStepMonth(1)}
                  className="inline-flex h-9 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted transition hover:border-line-strong hover:bg-surface-muted hover:text-ink"
                  title="Mes siguiente"
                  aria-label="Mes siguiente"
                >
                  <CaretRight className="h-3.5 w-3.5" weight="bold" />
                </button>
              </div>
            </div>

            <label className="block min-w-0">
              <span className={FILTER_LABEL_CLASS}>Año</span>
              <div className="relative">
                <CalendarBlank className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" weight="duotone" />
                <select
                  value={selectedAnio}
                  onChange={(event) => onAnioChange(Number(event.target.value))}
                  disabled={isLoadingAnios}
                  className={`${SELECT_BASE_CLASS} tabular-nums font-semibold`}
                >
                  {aniosDisponibles.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </select>
                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" weight="bold" />
              </div>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {!isReadOnly && pendingChangesCount > 0 ? (
              <ActionButton
                label={isAutoSaving ? 'Guardando' : 'Guardar'}
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
                title={selectedCentroAcopio === 'todos' ? 'Seleccione un centro de acopio para gestionar vales' : 'Generar o ver vales'}
              >
                <Receipt className="h-4 w-4" weight="bold" />
                <span className="hidden sm:inline">Vales</span>
              </button>
            ) : (
              <span className="inline-flex h-9 items-center rounded-lg border border-line bg-surface-muted px-3 text-xs font-semibold text-muted">
                {hasOperativeEditPermission ? 'Edición habilitada' : 'Solo lectura'}
              </span>
            )}

            <ActionButton
              label="Actualizar"
              icon={<ArrowsClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="bold" />}
              onClick={onRefresh}
              disabled={isLoading || !selectedVacuna}
              showLabel={false}
            />

            {!isReadOnly && !hideImportAction ? (
              <ActionButton
                label="Importar Excel"
                icon={<UploadSimple className="h-4 w-4" weight="bold" />}
                onClick={onImport}
                showLabel={false}
              />
            ) : null}

            {!hideExportAction ? (
              <ActionButton
                label={isExporting ? 'Exportando' : 'Exportar'}
                icon={isExporting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <DownloadSimple className="h-4 w-4" weight="bold" />}
                onClick={onExport}
                disabled={isExporting || !selectedVacuna}
                isPrimary
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Cinta compacta de stock y balance */}
      {stockPanelContent}
    </section>
  );
});

MovimientosHeaderCompact.displayName = 'MovimientosHeaderCompact';
