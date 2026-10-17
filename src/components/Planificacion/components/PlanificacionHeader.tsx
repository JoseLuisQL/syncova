import React, { memo } from 'react';
import {
  ArrowsClockwise,
  Buildings,
  CalendarBlank,
  CaretDown,
  CheckCircle,
  CircleNotch,
  DownloadSimple,
  FloppyDisk,
  Package,
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

interface SummaryBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string;
  emphasis?: boolean;
}

const FILTER_LABEL_CLASS = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted';
const SELECT_BASE_CLASS =
  'h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-8 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted';

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

const SummaryBadge: React.FC<SummaryBadgeProps> = ({ icon: Icon, label, value, emphasis = false }) => (
  <span
    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs ${
      emphasis
        ? 'border-teal-500/30 bg-teal-500/10 text-ink'
        : 'border-line bg-surface text-muted'
    }`}
  >
    <Icon className={emphasis ? 'h-3.5 w-3.5 text-teal-600 dark:text-teal-400' : 'h-3.5 w-3.5 text-muted'} weight="duotone" />
    <span className="text-[11px] font-medium text-muted">{label}:</span>
    <strong className="font-semibold text-ink tabular-nums">{value}</strong>
  </span>
);

export const PlanificacionHeader: React.FC<PlanificacionHeaderProps> = memo(({
  isReadOnly = false,
  hasOperativeEditPermission = false,
  hideImportAction = false,
  hideExportAction = false,
  lockedCentroAcopioLabel,
  showReadOnlyCentroFilter = false,
  allCentrosLabel = 'Todos los centros',
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
    <section className="border-b border-line bg-surface" aria-label="Filtros de planificación">
      <div className="px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 max-w-3xl">
            {shouldRenderCentroSelect ? (
              <label className="block min-w-0">
                <span className={FILTER_LABEL_CLASS}>Centro de acopio</span>
                <div className="relative">
                  <Buildings className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" weight="duotone" />
                  <select
                    value={selectedCentroAcopio}
                    onChange={(event) => onCentroAcopioChange(event.target.value)}
                    disabled={isLoading}
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
                <span className={FILTER_LABEL_CLASS}>Centro de acopio</span>
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
                  disabled={isLoading}
                  className={SELECT_BASE_CLASS}
                >
                  {vacunas.length === 0 ? <option value="">Cargando vacunas...</option> : null}
                  {vacunas.map((vacuna) => (
                    <option key={vacuna.id} value={vacuna.id}>
                      {vacuna.nombre}
                    </option>
                  ))}
                </select>
                <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" weight="bold" />
              </div>
            </label>

            <label className="col-span-2 sm:col-span-1 block min-w-0">
              <span className={FILTER_LABEL_CLASS}>Año de programación</span>
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

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {!isReadOnly && pendingChangesCount > 0 ? (
              <ActionButton
                label={isUpdating ? 'Guardando' : 'Guardar'}
                icon={isUpdating ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <FloppyDisk className="h-4 w-4" weight="bold" />}
                onClick={onGuardarPendientes}
                disabled={isUpdating}
                isPrimary
                count={pendingChangesCount}
              />
            ) : null}

            <ActionButton
              label="Actualizar"
              icon={<ArrowsClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="bold" />}
              onClick={onRefresh}
              disabled={isLoading || !selectedVacuna}
              showLabel={false}
            />

            {!isReadOnly && !hideImportAction ? (
              <ActionButton
                label="Importar"
                icon={isImporting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <UploadSimple className="h-4 w-4" weight="bold" />}
                onClick={onImportar}
                disabled={isImporting}
              />
            ) : (
              <span className="inline-flex h-9 items-center rounded-lg border border-line bg-surface-muted px-3 text-xs font-semibold text-muted">
                {hasOperativeEditPermission ? 'Edición habilitada' : 'Solo lectura'}
              </span>
            )}

            {!hideExportAction ? (
              <ActionButton
                label={isExporting ? 'Exportando' : 'Exportar'}
                icon={isExporting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <DownloadSimple className="h-4 w-4" weight="bold" />}
                onClick={onExportar}
                disabled={isExporting || !selectedVacuna}
                isPrimary
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Cinta de resumen compacta */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-muted/60 px-3 py-2 sm:px-5">
        {!selectedVacuna ? (
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted">
            <Package className="h-4 w-4 text-teal-600 dark:text-teal-400" weight="duotone" />
            Selecciona una vacuna para cargar la matriz de planificación anual.
          </div>
        ) : (
          <>
            <SummaryBadge icon={Package} label="Vacuna" value={vacunaSeleccionada?.nombre || 'Sin nombre'} emphasis />
            <SummaryBadge icon={CalendarBlank} label="Año" value={String(selectedAnio)} />
            <SummaryBadge icon={Buildings} label="Centro" value={centroNombre} />
            <SummaryBadge icon={CheckCircle} label="EESS" value={establecimientosCount.toLocaleString()} />
            <SummaryBadge icon={CheckCircle} label="Meta anual" value={totalGeneral.toLocaleString()} emphasis />
            <div className="ml-auto">
              {pendingChangesCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Pendientes: {pendingChangesCount}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Sincronizado
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
});

PlanificacionHeader.displayName = 'PlanificacionHeader';
