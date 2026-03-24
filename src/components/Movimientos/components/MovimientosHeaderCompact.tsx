import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Building2,
  Calendar,
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
    <span className="hidden sm:inline">{label}</span>
    {count ? (
      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-inherit">{count}</span>
    ) : null}
  </button>
);

const StatChip: React.FC<{
  label: string;
  value: string;
  subtle?: boolean;
}> = ({ label, value, subtle = false }) => (
  <div
    className={`rounded-2xl border px-3 py-2 ${
      subtle ? 'border-slate-200 bg-slate-50/80' : 'border-teal-100 bg-teal-50/60'
    }`}
  >
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
  </div>
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

  const disponibilidadConfig = useMemo(() => {
    if (!stockInfo) {
      return {
        className: 'border-slate-200 bg-slate-50 text-slate-700',
        label: 'Sin datos',
      };
    }

    if (stockInfo.stockDisponible < 0) {
      return {
        className: 'border-rose-200 bg-rose-50 text-rose-700',
        label: 'Déficit',
      };
    }

    if (stockInfo.estado === 'critico') {
      return {
        className: 'border-amber-200 bg-amber-50 text-amber-700',
        label: 'Crítico',
      };
    }

    return {
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      label: 'Disponible',
    };
  }, [stockInfo]);

  const stockPanel = hideStockMetrics ? null : (
    <section className={COMPONENT_STYLES.panel}>
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Resumen operativo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Estado del período de entrega, disponibilidad y progreso de vales.
            </p>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${disponibilidadConfig.className}`}>
            {disponibilidadConfig.label}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {!selectedVacuna ? (
          <div className="inventory-loading-shell rounded-[20px] border border-slate-200 bg-slate-50/70 px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Selecciona una vacuna</p>
                <p className="text-xs text-slate-500">
                  El resumen de stock y entregas se activa cuando eliges una vacuna.
                </p>
              </div>
            </div>
          </div>
        ) : isLoadingStock || isUpdatingStock ? (
          <div className="inventory-loading-shell rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 inventory-breathe">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Cargando resumen de stock</p>
                <p className="text-xs text-slate-500">Preparando disponibilidad, entregas y lotes.</p>
              </div>
            </div>
          </div>
        ) : stockError ? (
          <div className="rounded-[20px] border border-rose-200 bg-rose-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-900">No se pudo cargar el stock</p>
                <p className="mt-1 text-xs text-rose-700">{stockError}</p>
              </div>
              <button type="button" onClick={onRetryStock} className={COMPONENT_STYLES.button.secondary}>
                <RefreshCw className="h-4 w-4" />
                <span>Reintentar</span>
              </button>
            </div>
          </div>
        ) : stockInfo ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <StatChip label="Periodo de entrega" value={periodoEntrega.etiqueta} />
            <StatChip label="Stock actual" value={`${stockInfo.stockActual.toLocaleString()} unidades`} subtle />

            <div className="relative sm:col-span-2" ref={stockInicialRef}>
              <button
                type="button"
                onClick={() => setShowStockInicialDropdown((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-200 bg-white text-teal-600">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Stock inicial</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {stockInfo.tieneHistorialInicial
                        ? `${stockInfo.stockInicialHistorico?.toLocaleString() || 0} unidades`
                        : 'No disponible'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showStockInicialDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showStockInicialDropdown ? (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-[20px] border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatChip label="Base" value={`${stockInfo.stockInicialOriginal?.toLocaleString() || 0}`} subtle />
                    <StatChip label="Ingresos del mes" value={stockInfo.ingresosLotesDelMes.toLocaleString()} />
                  </div>
                  {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial ? (
                    <p className="mt-3 text-xs text-slate-500">
                      Capturado el {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <EntregasProgressBadge
                totalEntregas={stockInfo.totalEntregas}
                progresoVales={progresoVales}
                isLoading={isLoadingProgresoVales}
                onRefresh={onRefreshProgresoVales}
              />
            </div>

            <div className="relative" ref={stockActualRef}>
              <button
                type="button"
                onClick={() => setShowStockActualDropdown((prev) => !prev)}
                className="flex h-full w-full items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Lotes disponibles</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {lotesDisponibles.length} lote{lotesDisponibles.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showStockActualDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showStockActualDropdown ? (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-[20px] border border-slate-200 bg-white p-4 shadow-xl">
                  {lotesDisponibles.length > 0 ? (
                    <div className="space-y-2">
                      {lotesDisponibles.map((lote, index) => (
                        <div
                          key={lote.id}
                          className={`rounded-2xl border px-3 py-2 ${
                            index === 0
                              ? 'border-teal-200 bg-teal-50/80'
                              : 'border-slate-200 bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">{lote.numero}</p>
                              <p className="text-xs text-slate-500">
                                Vence {new Date(lote.fechaVencimiento).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {lote.cantidadActual.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No hay lotes con disponibilidad actual.</p>
                  )}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && onOpenAjusteDeficit ? onOpenAjusteDeficit : undefined}
              className={`flex items-center justify-between rounded-[20px] border px-4 py-3 text-left ${
                stockInfo.stockDisponible < 0
                  ? 'border-rose-200 bg-rose-50/80'
                  : 'border-emerald-200 bg-emerald-50/80'
              } ${
                stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && onOpenAjusteDeficit
                  ? 'transition hover:brightness-[0.98]'
                  : ''
              }`}
              disabled={stockInfo.stockDisponible >= 0 || !ajusteDeficitDisponible || !onOpenAjusteDeficit}
            >
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {stockInfo.stockDisponible < 0 ? 'Déficit' : 'Disponible'}
                </p>
                <p className={`mt-1 text-sm font-semibold ${stockInfo.stockDisponible < 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {stockInfo.stockDisponible.toLocaleString()} unidades
                </p>
              </div>
              {stockInfo.stockDisponible < 0 && ajusteDeficitDisponible && onOpenAjusteDeficit ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  <Settings2 className="h-3 w-3" />
                  Ajustar
                </span>
              ) : null}
            </button>

            {stockInfo.tieneHistorialInicial ? (
              <button
                type="button"
                onClick={onActualizarStockSiguienteMes}
                disabled={isUpdatingStockSiguienteMes}
                className={`${COMPONENT_STYLES.button.secondary} sm:col-span-2`}
                title={`Actualizar stock inicial de ${periodoSiguiente}`}
              >
                {isUpdatingStockSiguienteMes ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Actualizar sig. mes</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {periodoSiguiente}
                </span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
      <section className={COMPONENT_STYLES.panel}>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
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
              <span className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Vista solo lectura
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

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {shouldRenderCentroSelect ? (
              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Centro de acopio</span>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-500" />
                  <select
                    value={selectedCentroAcopio}
                    onChange={(event) => onCentroAcopioChange(event.target.value)}
                    disabled={isLoadingEstablecimientos}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal} pl-10 pr-10`}
                  >
                    <option value="todos">{allCentrosLabel}</option>
                    {centrosAcopio.map((centro) => (
                      <option key={centro.id} value={centro.id}>
                        {centro.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>
            ) : (
              <div>
                <span className={COMPONENT_STYLES.input.label}>Centro asignado</span>
                <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-700">
                  <Building2 className="h-4 w-4 text-teal-600" />
                  <span className="truncate">{lockedCentroAcopioLabel || centroNombre}</span>
                </div>
              </div>
            )}

            <label className="block">
              <span className={COMPONENT_STYLES.input.label}>Vacuna</span>
              <div className="relative">
                <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500" />
                <select
                  value={selectedVacuna}
                  onChange={(event) => onVacunaChange(event.target.value)}
                  disabled={isLoadingVacunas}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan} pl-10 pr-10`}
                >
                  {vacunasActivas.length === 0 ? <option value="">Seleccione...</option> : null}
                  {vacunasActivas.map((vacuna) => (
                    <option key={vacuna.id} value={vacuna.id}>
                      {vacuna.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className={COMPONENT_STYLES.input.label}>Mes base</span>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-500" />
                <select
                  value={selectedMes}
                  onChange={(event) => onMesChange(Number(event.target.value))}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal} pl-10 pr-10`}
                >
                  {MESES.map((mes, index) => (
                    <option key={mes} value={index + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className={COMPONENT_STYLES.input.label}>Año</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cyan-600">
                  AÑO
                </span>
                <select
                  value={selectedAnio}
                  onChange={(event) => onAnioChange(Number(event.target.value))}
                  disabled={isLoadingAnios}
                  className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan} pl-12 pr-10`}
                >
                  {aniosDisponibles.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </label>
          </div>

        </div>
      </section>

      {stockPanel}
    </div>
  );
});

MovimientosHeaderCompact.displayName = 'MovimientosHeaderCompact';
