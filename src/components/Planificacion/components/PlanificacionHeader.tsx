import React, { memo } from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Loader2,
  Package,
  RefreshCw,
  Save,
  Upload,
} from 'lucide-react';
import { Vacuna, CentroAcopio } from '../../../types';
import { COMPONENT_STYLES } from '../constants';

interface PlanificacionHeaderProps {
  isReadOnly?: boolean;
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

export const PlanificacionHeader: React.FC<PlanificacionHeaderProps> = memo(({
  isReadOnly = false,
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
    <section className={COMPONENT_STYLES.panel}>
      <div className="border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:gap-4">
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {shouldRenderCentroSelect ? (
                <label className="block">
                  <span className={COMPONENT_STYLES.input.label}>Centro de acopio</span>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-teal-500 sm:left-3 sm:h-4 sm:w-4" />
                    <select
                      value={selectedCentroAcopio}
                      onChange={(event) => onCentroAcopioChange(event.target.value)}
                      disabled={isLoading}
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
                    disabled={isLoading}
                    className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan} pl-8 pr-8 text-xs sm:pl-10 sm:pr-10 sm:text-sm`}
                  >
                    {vacunas.length === 0 ? <option value="">Seleccione...</option> : null}
                    {vacunas.map((vacuna) => (
                      <option key={vacuna.id} value={vacuna.id}>
                        {vacuna.nombre}
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

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {!isReadOnly && pendingChangesCount > 0 ? (
              <ActionButton
                label={isUpdating ? 'Guardando' : 'Guardar cambios'}
                icon={isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                onClick={onGuardarPendientes}
                disabled={isUpdating}
                isPrimary
                count={pendingChangesCount}
              />
            ) : null}

            <ActionButton
              label="Actualizar"
              icon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={onRefresh}
              disabled={isLoading || !selectedVacuna}
            />

            {!isReadOnly ? (
              <ActionButton
                label="Importar"
                icon={isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                onClick={onImportar}
                disabled={isImporting}
              />
            ) : (
              <span className="inline-flex min-h-[38px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:text-sm">
                Solo lectura
              </span>
            )}

            {!isReadOnly ? (
              <ActionButton
                label={isExporting ? 'Exportando' : 'Exportar'}
                icon={isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                onClick={onExportar}
                disabled={isExporting || !selectedVacuna}
                isPrimary
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
        {!selectedVacuna ? (
          <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Package className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-white/90">Selecciona una vacuna para ver el resumen anual de programación</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 px-1 py-1">
            <div className="flex flex-wrap items-center gap-y-1">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                  <Package className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-[0.6rem]">Vacuna</p>
                  <p className="text-xs font-bold text-white sm:text-sm">{vacunaSeleccionada?.nombre || 'Sin seleccionar'}</p>
                </div>
              </div>

              <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-white/40 sm:mx-1 sm:h-3.5 sm:w-3.5" />

              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                  <Calendar className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-[0.6rem]">Período</p>
                  <p className="text-xs font-bold text-white sm:text-sm">{selectedAnio}</p>
                </div>
              </div>

              <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-white/40 sm:mx-1 sm:h-3.5 sm:w-3.5" />

              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                  <Building2 className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-[0.6rem]">Cobertura</p>
                  <p className="text-xs font-bold text-white sm:text-sm">{centroNombre}</p>
                </div>
              </div>

              <ArrowRight className="mx-0.5 h-3 w-3 shrink-0 text-white/40 sm:mx-1 sm:h-3.5 sm:w-3.5" />

              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 sm:gap-2.5 sm:px-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-8 sm:w-8">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                </div>
                <div>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/70 sm:text-[0.6rem]">Establecimientos</p>
                  <p className="text-xs font-bold text-white sm:text-sm">{establecimientosCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2 px-1 py-1">
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  Total anual: {totalGeneral.toLocaleString()}
                </span>
                {pendingChangesCount > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    {pendingChangesCount} cambios pendientes
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90">
                    Todo sincronizado
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
