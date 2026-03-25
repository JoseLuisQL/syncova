import React, { memo } from 'react';
import { Building2, Calculator, Package } from 'lucide-react';
import { DataTable } from '../../Establecimientos/components';
import { MESES_CORTOS, INPUT_FIELD_STYLES, COMPONENT_STYLES } from '../constants';
import { Establecimiento } from '../../../types';
import { getEstiloEstablecimiento } from '../../../utils/centroAcopioUtils';

interface EstablecimientoData {
  establecimiento: Establecimiento;
  distribucionMensual: number[];
  total: number;
  estado: string;
  planificacionId?: string;
}

interface PlanificacionTablaProps {
  readOnly?: boolean;
  establecimientos: EstablecimientoData[];
  selectedCentroAcopio: string;
  isLoading: boolean;
  isUpdating: boolean;
  selectedRowId: string | null;
  onRowSelect: (id: string | null) => void;
  getCurrentValue: (estIndex: number, mesIndex: number, originalValue: number) => number;
  hasPendingChange: (estIndex: number, mesIndex: number) => boolean;
  onTempValueChange: (estIndex: number, mesIndex: number, newValue: number) => void;
  onFieldBlur: (estIndex: number, mesIndex: number) => void;
  calcularTotalMes: (mesIndex: number) => number;
  calcularTotalGeneral: () => number;
}

interface EditablePlanningFieldProps {
  readOnly?: boolean;
  value: number;
  pending: boolean;
  disabled: boolean;
  ariaLabel: string;
  compact?: boolean;
  onRowFocus: () => void;
  onChange?: (value: number) => void;
  onBlur?: () => void;
}

const EditablePlanningField: React.FC<EditablePlanningFieldProps> = memo(({
  readOnly = false,
  value,
  pending,
  disabled,
  ariaLabel,
  compact = false,
  onRowFocus,
  onChange,
  onBlur,
}) => {
  const styles = INPUT_FIELD_STYLES.programacion;
  const widthClass = compact ? 'w-full' : 'w-16';

  if (readOnly) {
    return (
      <span className={`inline-flex min-w-[4rem] justify-center rounded-xl border border-slate-200 bg-white/80 px-2 py-2 text-sm font-semibold text-slate-700 tabular-nums ${compact ? 'w-full' : ''}`}>
        {value.toLocaleString()}
      </span>
    );
  }

  return (
    <div className="relative" onClick={(event) => { event.stopPropagation(); onRowFocus(); }}>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange?.(parseInt(event.target.value, 10) || 0)}
        onBlur={onBlur}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`${widthClass} rounded-xl border px-2.5 py-2 text-center text-sm font-semibold tabular-nums transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${pending ? styles.pending : `${styles.normal} ${styles.focus}`}`}
      />
      {pending ? (
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-amber-400 animate-pulse" />
      ) : null}
    </div>
  );
});

EditablePlanningField.displayName = 'EditablePlanningField';

const TotalPill: React.FC<{
  value: number;
  tone?: 'teal' | 'cyan' | 'emerald' | 'neutral';
}> = memo(({ value, tone = 'teal' }) => {
  const className =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'cyan'
      ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
      : tone === 'neutral'
      ? 'border-slate-200 bg-slate-50 text-slate-700'
      : 'border-teal-200 bg-teal-50 text-teal-800';

  return (
    <span className={`inline-flex min-w-[4.6rem] justify-center rounded-xl border px-2.5 py-2 text-sm font-semibold tabular-nums ${className}`}>
      {value.toLocaleString()}
    </span>
  );
});

TotalPill.displayName = 'TotalPill';

const EstadoBadge: React.FC<{ total: number }> = memo(({ total }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
      total > 0
        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border border-amber-200 bg-amber-50 text-amber-700'
    }`}
  >
    {total > 0 ? 'Programado' : 'Pendiente'}
  </span>
));

EstadoBadge.displayName = 'EstadoBadge';

const MobileTotalesSummary: React.FC<{
  count: number;
  totalGeneral: number;
  calcularTotalMes: PlanificacionTablaProps['calcularTotalMes'];
}> = memo(({ count, totalGeneral, calcularTotalMes }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Totales</p>
        <p className="text-[0.68rem] text-slate-500">{count} establecimientos</p>
      </div>
      <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-[0.68rem] font-semibold text-teal-700">
        Anual: {totalGeneral.toLocaleString()}
      </span>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      {MESES_CORTOS.map((mes, mesIndex) => (
        <div key={mes} className="rounded-lg border border-white/70 bg-white/80 px-2 py-1.5 text-center">
          <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-slate-500">{mes}</p>
          <p className="mt-1 text-xs font-semibold text-slate-800 tabular-nums">
            {calcularTotalMes(mesIndex).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  </div>
));

MobileTotalesSummary.displayName = 'MobileTotalesSummary';

interface MobilePlanificacionCardProps {
  readOnly: boolean;
  estData: EstablecimientoData;
  estIndex: number;
  isSelected: boolean;
  isDisabled: boolean;
  selectedCentroAcopio: string;
  getCurrentValue: PlanificacionTablaProps['getCurrentValue'];
  hasPendingChange: PlanificacionTablaProps['hasPendingChange'];
  onTempValueChange: PlanificacionTablaProps['onTempValueChange'];
  onFieldBlur: PlanificacionTablaProps['onFieldBlur'];
  onRowSelect: (id: string | null) => void;
}

const MobilePlanificacionCard: React.FC<MobilePlanificacionCardProps> = memo(({
  readOnly,
  estData,
  estIndex,
  isSelected,
  isDisabled,
  selectedCentroAcopio,
  getCurrentValue,
  hasPendingChange,
  onTempValueChange,
  onFieldBlur,
  onRowSelect,
}) => {
  const estiloEstablecimiento = getEstiloEstablecimiento(estData.establecimiento);
  const { colores, centro } = estiloEstablecimiento;

  return (
    <div
      onClick={() => onRowSelect(estData.establecimiento.id)}
      className={`rounded-xl border p-3 transition-all ${
        isSelected
          ? 'border-teal-400 bg-teal-50/50 shadow-sm ring-1 ring-teal-300'
          : `border-slate-200 ${colores.bg} hover:border-slate-300 hover:shadow-sm`
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
            estData.total > 0 ? 'bg-emerald-500' : 'bg-amber-400'
          } ${isSelected ? 'ring-3 ring-teal-300' : 'ring-2 ring-white/80'}`}
        />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${isSelected ? 'text-teal-800' : colores.text}`}>
            {estData.establecimiento.nombre}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[0.68rem] text-slate-500">
            {estData.establecimiento.codigo ? <span>{estData.establecimiento.codigo}</span> : null}
            {estData.establecimiento.codigo ? <span className="text-slate-300">•</span> : null}
            <span>{estData.total > 0 ? 'Con programación' : 'Sin programación'}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {selectedCentroAcopio === 'todos' ? (
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${colores.border} ${colores.text}`}>
                {centro !== 'DEFAULT' ? centro : 'Regional'}
              </span>
            ) : null}
            <EstadoBadge total={estData.total} />
          </div>
        </div>
        <TotalPill value={estData.total} tone="teal" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        {MESES_CORTOS.map((mes, mesIndex) => {
          const currentValue = getCurrentValue(estIndex, mesIndex, estData.distribucionMensual[mesIndex]);
          const isPending = hasPendingChange(estIndex, mesIndex);

          return (
            <div key={`${estData.establecimiento.id}-${mes}`} className="rounded-xl border border-white/70 bg-white/80 p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[0.62rem] font-semibold uppercase tracking-wide text-slate-500">{mes}</span>
                {isPending ? <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> : null}
              </div>
              <EditablePlanningField
                readOnly={readOnly}
                value={currentValue}
                pending={isPending}
                disabled={isDisabled}
                ariaLabel={`${mes} para ${estData.establecimiento.nombre}`}
                compact
                onRowFocus={() => onRowSelect(estData.establecimiento.id)}
                onChange={(value) => onTempValueChange(estIndex, mesIndex, value)}
                onBlur={() => onFieldBlur(estIndex, mesIndex)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

MobilePlanificacionCard.displayName = 'MobilePlanificacionCard';

export const PlanificacionTabla: React.FC<PlanificacionTablaProps> = memo(({
  readOnly = false,
  establecimientos,
  selectedCentroAcopio,
  isLoading,
  isUpdating,
  selectedRowId,
  onRowSelect,
  getCurrentValue,
  hasPendingChange,
  onTempValueChange,
  onFieldBlur,
  calcularTotalMes,
  calcularTotalGeneral,
}) => {
  const isDisabled = readOnly || isUpdating || isLoading;
  const totalGeneral = calcularTotalGeneral();

  return (
    <section className="relative flex h-full flex-1 flex-col bg-transparent" aria-label="Tabla de planificación">
      <DataTable
        isLoading={isLoading}
        loadingMessage="Cargando planificación anual..."
        skeletonRows={7}
        skeletonColumns={14}
        loadingVariant="table"
      >
        <div className="hidden min-h-0 flex-1 overflow-auto md:block">
          <table className="w-max min-w-full table-auto divide-y divide-slate-200" role="table" aria-label="Datos de programación">
            <thead className="sticky top-0 z-20 bg-white">
              <tr className="border-b border-slate-200 bg-slate-50/95">
                <th className={`${COMPONENT_STYLES.table.headerCell} sticky left-0 z-30 w-[280px] min-w-[280px] bg-slate-50/95 text-left shadow-[8px_0_14px_-12px_rgba(15,23,42,0.16)]`}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    Establecimiento
                  </div>
                </th>
                {MESES_CORTOS.map((mes) => (
                  <th key={mes} className={`${COMPONENT_STYLES.table.headerCell} w-[94px] min-w-[94px] text-center`}>
                    {mes}
                  </th>
                ))}
                <th className={`${COMPONENT_STYLES.table.headerCell} w-[128px] min-w-[128px] text-center`}>
                  <div className="flex items-center justify-center gap-2">
                    <Calculator className="h-4 w-4 text-slate-500" />
                    Total
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <tr className="sticky top-[41px] z-[15] bg-slate-50 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1)]">
                <td className="sticky left-0 z-20 border-r border-slate-200 bg-slate-50 px-4 py-3 shadow-[8px_0_14px_-12px_rgba(15,23,42,0.12)]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Total DISA</p>
                    <p className="mt-1 text-xs text-slate-500">{establecimientos.length} establecimientos</p>
                  </div>
                </td>
                {MESES_CORTOS.map((mes, mesIndex) => (
                  <td key={`total-${mes}`} className="bg-slate-50 px-2 py-3 text-center">
                    <TotalPill value={calcularTotalMes(mesIndex)} tone="emerald" />
                  </td>
                ))}
                <td className="bg-slate-50 px-3 py-3 text-center">
                  <TotalPill value={totalGeneral} tone="cyan" />
                </td>
              </tr>

              {establecimientos.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-300">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">No hay establecimientos para mostrar</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Ajusta los filtros para visualizar la programación anual.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {establecimientos.map((estData, estIndex) => {
                const estiloEstablecimiento = getEstiloEstablecimiento(estData.establecimiento);
                const { colores, centro, icono } = estiloEstablecimiento;
                const isSelected = selectedRowId === estData.establecimiento.id;
                const rowBg = isSelected ? 'bg-teal-50' : colores.bg;
                const stickyCellBg = isSelected ? 'bg-teal-50' : colores.bg;

                return (
                  <tr
                    key={estData.planificacionId ?? estData.establecimiento.id}
                    onClick={() => onRowSelect(estData.establecimiento.id)}
                    className={`${rowBg} ${COMPONENT_STYLES.table.row} cursor-pointer ${isSelected ? 'relative z-[1] shadow-[inset_0_0_0_2px_rgba(13,148,136,0.6)]' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className={`sticky left-0 z-10 border-r border-white/60 px-4 py-3 shadow-[8px_0_14px_-12px_rgba(15,23,42,0.12)] ${stickyCellBg} ${isSelected ? 'shadow-[8px_0_14px_-12px_rgba(15,23,42,0.12),inset_0_0_0_2px_rgba(13,148,136,0.6)]' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-2 h-2.5 w-2.5 rounded-full ${
                            estData.total > 0 ? 'bg-emerald-500' : 'bg-amber-400'
                          } ${isSelected ? 'ring-4 ring-teal-300' : 'ring-2 ring-white/80'}`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded-xl border border-white/60 bg-white/70 px-2 py-1 text-sm">{icono}</span>
                            <p className={`truncate text-sm font-semibold ${isSelected ? 'text-teal-800' : colores.text}`}>
                              {estData.establecimiento.nombre}
                            </p>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            {estData.establecimiento.codigo ? <span>{estData.establecimiento.codigo}</span> : null}
                            {estData.establecimiento.codigo ? <span className="text-slate-300">•</span> : null}
                            <span>{estData.total > 0 ? 'Con programación' : 'Pendiente'}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {selectedCentroAcopio === 'todos' ? (
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${colores.border} ${colores.text}`}>
                                {centro !== 'DEFAULT' ? centro : 'Regional'}
                              </span>
                            ) : null}
                            <EstadoBadge total={estData.total} />
                          </div>
                        </div>
                      </div>
                    </td>

                    {estData.distribucionMensual.map((valor, mesIndex) => {
                      const currentValue = getCurrentValue(estIndex, mesIndex, valor);
                      const isPending = hasPendingChange(estIndex, mesIndex);

                      return (
                        <td key={`${estData.establecimiento.id}-${mesIndex}`} className="px-2 py-3 text-center">
                          <EditablePlanningField
                            readOnly={readOnly}
                            value={currentValue}
                            pending={isPending}
                            disabled={isDisabled}
                            ariaLabel={`${MESES_CORTOS[mesIndex]} para ${estData.establecimiento.nombre}`}
                            onRowFocus={() => onRowSelect(estData.establecimiento.id)}
                            onChange={(nextValue) => onTempValueChange(estIndex, mesIndex, nextValue)}
                            onBlur={() => onFieldBlur(estIndex, mesIndex)}
                          />
                        </td>
                      );
                    })}

                    <td className="px-3 py-3 text-center">
                      <TotalPill value={estData.total} tone="teal" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-2.5 md:hidden">
          <MobileTotalesSummary
            count={establecimientos.length}
            totalGeneral={totalGeneral}
            calcularTotalMes={calcularTotalMes}
          />

          {establecimientos.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center py-10">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-300">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No hay establecimientos</p>
              <p className="mt-1 text-xs text-slate-500">Ajusta los filtros para ver la programación.</p>
            </div>
          ) : (
            <div className="mt-2.5 space-y-2">
              {establecimientos.map((estData, estIndex) => (
                <MobilePlanificacionCard
                  key={`mobile-${estData.planificacionId ?? estData.establecimiento.id}`}
                  readOnly={readOnly}
                  estData={estData}
                  estIndex={estIndex}
                  isSelected={selectedRowId === estData.establecimiento.id}
                  isDisabled={isDisabled}
                  selectedCentroAcopio={selectedCentroAcopio}
                  getCurrentValue={getCurrentValue}
                  hasPendingChange={hasPendingChange}
                  onTempValueChange={onTempValueChange}
                  onFieldBlur={onFieldBlur}
                  onRowSelect={onRowSelect}
                />
              ))}
            </div>
          )}
        </div>
      </DataTable>
    </section>
  );
});

PlanificacionTabla.displayName = 'PlanificacionTabla';
