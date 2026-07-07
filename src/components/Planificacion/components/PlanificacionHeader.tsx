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
}

interface SummaryBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string;
  emphasis?: boolean;
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
    <span>{label}</span>
    {count ? (
      <span className="rounded-[7px] bg-white/20 px-2 py-0.5 text-xs font-semibold text-inherit">{count}</span>
    ) : null}
  </button>
);

const SummaryBadge: React.FC<SummaryBadgeProps> = ({ icon: Icon, label, value, emphasis = false }) => (
  <span
    className={`inline-flex min-h-9 items-center gap-2 rounded-[9px] border px-3 py-1.5 text-sm ${
      emphasis
        ? 'border-brand-100 bg-surface-soft text-ink'
        : 'border-line bg-white text-muted-2'
    }`}
  >
    <Icon className={emphasis ? 'h-4 w-4 text-brand' : 'h-4 w-4 text-muted-2'} weight="bold" />
    <span className="text-xs font-medium text-muted">{label}</span>
    <strong className="font-semibold text-ink">{value}</strong>
  </span>
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
    <section className="border-b border-line-soft bg-white p-3 sm:p-4" aria-label="Filtros de planificación">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
          {shouldRenderCentroSelect ? (
            <label className="w-full sm:w-[230px]">
              <span className={COMPONENT_STYLES.input.label}>Centro de acopio</span>
              <div className="relative">
                <Buildings className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" weight="bold" />
                <select
                  value={selectedCentroAcopio}
                  onChange={(event) => onCentroAcopioChange(event.target.value)}
                  disabled={isLoading}
                  className={`${COMPONENT_STYLES.select.base} pl-9`}
                >
                  <option value="todos">{allCentrosLabel}</option>
                  {centrosAcopio.map((centro) => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre}
                    </option>
                  ))}
                </select>
                <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" weight="bold" />
              </div>
            </label>
          ) : (
            <div className="w-full sm:w-[230px]">
              <span className={COMPONENT_STYLES.input.label}>Centro de acopio</span>
              <div className="flex h-9 items-center gap-2 rounded-[9px] border border-line bg-white px-3 text-sm font-semibold text-ink shadow-sm">
                <Buildings className="h-4 w-4 shrink-0 text-muted-2" weight="bold" />
                <span className="truncate">{lockedCentroAcopioLabel || centroNombre}</span>
              </div>
            </div>
          )}

          <label className="w-full sm:w-[230px]">
            <span className={COMPONENT_STYLES.input.label}>Vacuna</span>
            <div className="relative">
              <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" weight="bold" />
              <select
                value={selectedVacuna}
                onChange={(event) => onVacunaChange(event.target.value)}
                disabled={isLoading}
                className={`${COMPONENT_STYLES.select.base} pl-9`}
              >
                {vacunas.length === 0 ? <option value="">Cargando vacunas...</option> : null}
                {vacunas.map((vacuna) => (
                  <option key={vacuna.id} value={vacuna.id}>
                    {vacuna.nombre}
                  </option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" weight="bold" />
            </div>
          </label>

          <label className="w-full sm:w-[150px]">
            <span className={COMPONENT_STYLES.input.label}>Año</span>
            <div className="relative">
              <CalendarBlank className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" weight="bold" />
              <select
                value={selectedAnio}
                onChange={(event) => onAnioChange(Number(event.target.value))}
                disabled={isLoadingAnios}
                className={`${COMPONENT_STYLES.select.base} pl-9`}
              >
                {aniosDisponibles.map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" weight="bold" />
            </div>
          </label>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!isReadOnly && pendingChangesCount > 0 ? (
            <ActionButton
              label={isUpdating ? 'Guardando' : 'Guardar cambios'}
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
          />

          {!isReadOnly && !hideImportAction ? (
            <ActionButton
              label="Importar"
              icon={isImporting ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <UploadSimple className="h-4 w-4" weight="bold" />}
              onClick={onImportar}
              disabled={isImporting}
            />
          ) : (
            <span className={hasOperativeEditPermission ? COMPONENT_STYLES.badge.active : COMPONENT_STYLES.badge.neutral}>
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

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
        {!selectedVacuna ? (
          <div className="flex min-h-9 items-center gap-2 rounded-[9px] border border-line bg-surface-soft px-3 py-1.5 text-sm font-medium text-muted-2">
            <Package className="h-4 w-4 text-muted-2" weight="bold" />
            Selecciona una vacuna para cargar la matriz de planificación.
          </div>
        ) : (
          <>
            <SummaryBadge icon={Package} label="Vacuna" value={vacunaSeleccionada?.nombre || 'Sin nombre'} emphasis />
            <SummaryBadge icon={CalendarBlank} label="Periodo" value={String(selectedAnio)} />
            <SummaryBadge icon={Buildings} label="Centro" value={centroNombre} />
            <SummaryBadge icon={CheckCircle} label="Establecimientos" value={establecimientosCount.toLocaleString()} />
            <SummaryBadge icon={CheckCircle} label="Total anual" value={totalGeneral.toLocaleString()} emphasis />
            {pendingChangesCount > 0 ? (
              <span className={COMPONENT_STYLES.badge.warning}>Cambios pendientes: {pendingChangesCount}</span>
            ) : (
              <span className={COMPONENT_STYLES.badge.active}>Sin cambios pendientes</span>
            )}
          </>
        )}
      </div>
    </section>
  );
});

PlanificacionHeader.displayName = 'PlanificacionHeader';
