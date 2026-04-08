import React, { memo } from 'react';
import {
  ArrowRight,
  Buildings,
  CalendarBlank,
  CheckCircle,
  CaretDown,
  DownloadSimple,
  CircleNotch,
  Package,
  ArrowsClockwise,
  FloppyDisk,
  UploadSimple,
} from '@phosphor-icons/react';
import { Vacuna, CentroAcopio } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface PlanificacionHeaderProps {
  isReadOnly?: boolean;
  hasOperativeEditPermission?: boolean;
  hideImportAction?: boolean;
  hideExportAction?: boolean;
  lockedCentroAcopioLabel?: string;
  showReadOnlyCentroFilter?: boolean;
  allCentrosLabel?: string;
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
  isLoading: boolean;
  isLoadingAnios?: boolean;
  isUpdating: boolean;
  isImporting: boolean;
  isExporting: boolean;
  pendingChangesCount: number;
  onRefresh: () => void;
  onImportar: () => void;
  onExportar: () => void;
  onGuardarPendientes: () => void;
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

export const PlanificacionHeader: React.FC<PlanificacionHeaderProps> = memo(({
  isReadOnly = false,
  hasOperativeEditPermission = false,
  hideImportAction = false,
  hideExportAction = false,
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
  const vacunaSeleccionada = vacunas.find((vacuna) => vacuna.id === selectedVacuna);
  const shouldRenderCentroSelect = !isReadOnly || showReadOnlyCentroFilter;
  const centroNombre = selectedCentroAcopio === 'todos'
    ? allCentrosLabel
    : centrosAcopio.find((centro) => centro.id === selectedCentroAcopio)?.nombre || lockedCentroAcopioLabel || allCentrosLabel;

  return (
    <section className="flex h-full flex-col bg-transparent">
      <div className="border-b border-zinc-200 px-3 py-2.5 sm:px-4 sm:py-3 bg-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {shouldRenderCentroSelect ? (
                <label className="block">
                  <span className={COMPONENT_STYLES.input.label}>Operador Base</span>
                  <div className="relative">
                    <Buildings className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:left-3 sm:h-4 sm:w-4" weight="duotone" />
                    <select
                      value={selectedCentroAcopio}
                      onChange={(event) => onCentroAcopioChange(event.target.value)}
                      disabled={isLoading}
                      className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal} pl-8 pr-8 text-xs sm:pl-10 sm:pr-10 sm:text-sm font-medium`}
                    >
                      <option value="todos">{allCentrosLabel}</option>
                      {centrosAcopio.map((centro) => (
                        <option key={centro.id} value={centro.id}>
                          {centro.nombre}
                        </option>
                      ))}
                    </select>
                    <CaretDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:right-3 sm:h-4 sm:w-4" weight="bold" />
                  </div>
                </label>
              ) : (
                <div>
                  <span className={COMPONENT_STYLES.input.label}>Nodo Fijo Asignado</span>
                  <div className="flex min-h-[40px] items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-900 sm:min-h-[44px] sm:px-4 sm:py-2.5 sm:text-sm shadow-sm">
                    <Buildings className="h-3.5 w-3.5 shrink-0 text-zinc-500 sm:h-4 sm:w-4" weight="duotone" />
                    <span className="truncate">{lockedCentroAcopioLabel || centroNombre}</span>
                  </div>
                </div>
              )}

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Biológico</span>
                <div className="relative">
                  <Package className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:left-3 sm:h-4 sm:w-4" weight="duotone" />
                  <select
                    value={selectedVacuna}
                    onChange={(event) => onVacunaChange(event.target.value)}
                    disabled={isLoading}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan} pl-8 pr-8 text-xs sm:pl-10 sm:pr-10 sm:text-sm font-medium`}
                  >
                    {vacunas.length === 0 ? <option value="">Inicializando...</option> : null}
                    {vacunas.map((vacuna) => (
                      <option key={vacuna.id} value={vacuna.id}>
                        {vacuna.nombre}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:right-3 sm:h-4 sm:w-4" weight="bold" />
                </div>
              </label>

              <label className="block">
                <span className={COMPONENT_STYLES.input.label}>Fiscal (Año)</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400 sm:left-3 sm:text-[10px] uppercase tracking-wider">
                    YR
                  </span>
                  <select
                    value={selectedAnio}
                    onChange={(event) => onAnioChange(Number(event.target.value))}
                    disabled={isLoadingAnios}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan} pl-10 pr-8 text-xs sm:pl-12 sm:pr-10 sm:text-sm font-bold`}
                  >
                    {aniosDisponibles.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}
                      </option>
                    ))}
                  </select>
                  <CaretDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 sm:right-3 sm:h-4 sm:w-4" weight="bold" />
                </div>
              </label>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5 pt-4 lg:pt-0">
            {!isReadOnly && pendingChangesCount > 0 ? (
              <ActionButton
                label={isUpdating ? 'Guardando' : 'Fijar Matriz'}
                icon={isUpdating ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <FloppyDisk className="h-4 w-4" weight="bold" />}
                onClick={onGuardarPendientes}
                disabled={isUpdating}
                isPrimary
                count={pendingChangesCount}
              />
            ) : null}

            <ActionButton
              label="Sincronizar"
              icon={<ArrowsClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="bold" />}
              onClick={onRefresh}
              disabled={isLoading || !selectedVacuna}
            />

            {!isReadOnly && !hideImportAction ? (
              <ActionButton
                label="Importar Excel"
                icon={isImporting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <UploadSimple className="h-4 w-4" weight="bold" />}
                onClick={onImportar}
                disabled={isImporting}
                showLabel={false}
              />
            ) : (
              <span className={`inline-flex min-h-[38px] items-center rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-wider sm:text-sm sm:min-h-[44px] ${
                hasOperativeEditPermission
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-500'
              }`}>
                {hasOperativeEditPermission ? 'Edición habilitada' : 'Solo lectura'}
              </span>
            )}

            {!hideExportAction ? (
              <ActionButton
                label={isExporting ? 'Procesando' : 'Extraer'}
                icon={isExporting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <DownloadSimple className="h-4 w-4" weight="bold" />}
                onClick={onExportar}
                disabled={isExporting || !selectedVacuna}
                isPrimary
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 px-3 py-2.5 sm:px-4 sm:py-3 bg-zinc-50/50">
        {!selectedVacuna ? (
          <div className="flex items-center gap-2.5 rounded-[14px] bg-teal-600 border border-teal-600 px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Package className="h-4 w-4 text-white" weight="duotone" />
            </div>
            <p className="text-sm font-semibold tracking-tight text-white">Selecciona una vacuna para visualizar el marco operativo.</p>
          </div>
        ) : (
          <div className="relative rounded-[16px] border border-teal-200 bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-600 px-[5px] py-[5px] shadow-sm">
            <div className="flex flex-wrap items-center gap-y-1">
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/12 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/18 sm:h-8 sm:w-8">
                  <Package className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" weight="duotone" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-teal-100/80 sm:text-[0.6rem]">Biológico</p>
                  <p className="text-xs font-black tracking-tight text-white sm:text-sm">{vacunaSeleccionada?.nombre || 'Indefinido'}</p>
                </div>
              </div>

              <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-white/45 sm:mx-1.5 sm:h-3.5 sm:w-3.5" weight="bold" />

              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/12 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/18 sm:h-8 sm:w-8">
                  <CalendarBlank className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" weight="duotone" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-teal-100/80 sm:text-[0.6rem]">Periodo</p>
                  <p className="text-xs font-black tracking-tight text-white sm:text-sm">{selectedAnio}</p>
                </div>
              </div>

              <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-white/45 sm:mx-1.5 sm:h-3.5 sm:w-3.5" weight="bold" />

              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/12 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/18 sm:h-8 sm:w-8">
                  <Buildings className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" weight="duotone" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-teal-100/80 sm:text-[0.6rem]">Operador base</p>
                  <p className="text-xs font-black tracking-tight text-white sm:text-sm">{centroNombre}</p>
                </div>
              </div>

              <ArrowRight className="mx-1 h-3 w-3 shrink-0 text-white/45 sm:mx-1.5 sm:h-3.5 sm:w-3.5" weight="bold" />

              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/12 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/18 sm:h-8 sm:w-8">
                  <CheckCircle className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" weight="fill" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-teal-100/80 sm:text-[0.6rem]">Establecimientos</p>
                  <p className="text-xs font-black tracking-tight text-white sm:text-sm">{establecimientosCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2 px-1 py-1">
                <span className="inline-flex items-center rounded-lg border border-white/20 bg-white/14 px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-wider text-white shadow-sm">
                  Total Anual: {totalGeneral.toLocaleString()}
                </span>
                {pendingChangesCount > 0 ? (
                  <span className="inline-flex items-center rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-wider text-amber-300">
                    Cambios pendientes: {pendingChangesCount}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[0.7rem] font-black uppercase tracking-wider text-teal-50">
                    Sincronización completa
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

PlanificacionHeader.displayName = 'PlanificacionHeader';
