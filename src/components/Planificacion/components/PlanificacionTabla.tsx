import React, { memo } from 'react';
import { Package, CheckCircle } from '@phosphor-icons/react';
import { DataTable, EmptyState } from '../../Establecimientos/components';
import { MESES_CORTOS } from '../constants';
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
  hasValeGenerado?: (establecimientoId: string, mesIndex: number) => boolean;
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
  const widthClass = compact ? 'w-full' : 'w-full h-full min-h-[44px]';

  if (readOnly) {
    return (
      <span className={`inline-flex flex-1 items-center justify-center text-[0.85rem] font-bold tabular-nums text-zinc-900 ${compact ? 'w-full py-2' : 'w-full h-full min-h-[44px]'}`}>
        {value === 0 ? <span className="text-zinc-300">-</span> : value.toLocaleString()}
      </span>
    );
  }

  return (
    <div className="relative h-full w-full" onClick={(event) => { event.stopPropagation(); onRowFocus(); }}>
      <input
        type="number"
        min="0"
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(event) => onChange?.(parseInt(event.target.value, 10) || 0)}
        onBlur={onBlur}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`${widthClass} min-w-0 bg-transparent px-2.5 py-2.5 text-center text-[0.85rem] font-semibold tabular-nums text-[#15171d] transition-colors hover:bg-[#fbfafd] focus:bg-white focus:outline-none focus:ring-[1.5px] focus:ring-inset focus:ring-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-60 ${pending ? 'bg-amber-50 text-amber-900 focus:bg-amber-50' : ''}`}
      />
      {pending ? (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-white bg-amber-500" />
      ) : null}
    </div>
  );
});

EditablePlanningField.displayName = 'EditablePlanningField';

const TotalPill: React.FC<{
  value: number;
  tone?: 'zinc' | 'dark' | 'muted';
}> = memo(({ value, tone = 'zinc' }) => {
  const className =
    tone === 'dark'
      ? 'bg-[#7c3aed] text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)]'
      : tone === 'muted'
      ? 'border border-[#e7e7ef] bg-[#fbfafd] text-[#8b8f9b]'
      : 'border border-[#e7e7ef] bg-white text-[#15171d] font-semibold';

  return (
    <span className={`inline-flex min-w-[3.5rem] items-center justify-center rounded-md px-2 py-1 text-[0.75rem] font-semibold tabular-nums tracking-tight ${className}`}>
      {value.toLocaleString()}
    </span>
  );
});

TotalPill.displayName = 'TotalPill';

const EstadoBadge: React.FC<{ total: number }> = memo(({ total }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-md border bg-white px-2 py-0.5 text-[0.68rem] font-medium ${
      total > 0
        ? 'border-[#e7e7ef] text-[#15171d] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500 before:content-[""]'
        : 'border-[#e7e7ef] text-[#606571] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400 before:content-[""]'
    }`}
  >
    {total > 0 ? 'Con matriz' : 'Pendiente'}
  </span>
));

EstadoBadge.displayName = 'EstadoBadge';

const MobileTotalesSummary: React.FC<{
  count: number;
  totalGeneral: number;
  calcularTotalMes: PlanificacionTablaProps['calcularTotalMes'];
}> = memo(({ count, totalGeneral, calcularTotalMes }) => (
  <div className="rounded-xl border border-[#e7e7ef] bg-white p-3">
    <div className="flex items-center justify-between gap-3 border-b border-[#eeeef3] pb-3">
      <div>
        <p className="text-xs font-medium text-[#8b8f9b]">Total anual</p>
        <p className="mt-0.5 text-sm font-semibold text-[#15171d]">{count} establecimientos</p>
      </div>
      <span className="rounded-md bg-[#7c3aed] px-3 py-1.5 text-[0.75rem] font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)]">
        {totalGeneral.toLocaleString()}
      </span>
    </div>
    <div className="mt-3 grid grid-cols-4 gap-1.5">
      {MESES_CORTOS.map((mes, mesIndex) => {
        const total = calcularTotalMes(mesIndex);
        return (
          <div key={mes} className="rounded-[9px] border border-[#eeeef3] bg-[#fbfafd] px-1.5 py-2 text-center">
            <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-[#8b8f9b]">{mes}</p>
            <p className={`mt-0.5 text-[0.7rem] font-semibold tabular-nums ${total > 0 ? 'text-[#15171d]' : 'text-[#c4c7d0]'}`}>
              {total > 0 ? total.toLocaleString() : '-'}
            </p>
          </div>
        );
      })}
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
  hasValeGenerado?: (establecimientoId: string, mesIndex: number) => boolean;
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
  hasValeGenerado,
}) => {
  const estiloEstablecimiento = getEstiloEstablecimiento(estData.establecimiento);
  const { centro, colores } = estiloEstablecimiento;

  return (
    <div
      onClick={() => onRowSelect(estData.establecimiento.id)}
      className={`rounded-xl border p-3 transition-colors ${
        isSelected
          ? `${colores.bg} ${colores.border} ring-1 ring-[#7c3aed]/25`
          : `${colores.bg} ${colores.border} hover:brightness-[0.98]`
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white ${colores.border}`}>
          <span className={`h-3 w-3 rounded-full ${colores.accent}`} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight text-[#15171d]">
            {estData.establecimiento.nombre}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {selectedCentroAcopio === 'todos' ? (
              <span className={`inline-flex rounded-md border bg-white px-2 py-0.5 text-[0.68rem] font-medium ${colores.border} ${colores.text}`}>
                {centro !== 'DEFAULT' ? centro : 'Base'}
              </span>
            ) : null}
            <EstadoBadge total={estData.total} />
          </div>
        </div>
        <TotalPill value={estData.total} tone={isSelected ? "dark" : "zinc"} />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-[#eeeef3] pt-3">
        {MESES_CORTOS.map((mes, mesIndex) => {
          const currentValue = getCurrentValue(estIndex, mesIndex, estData.distribucionMensual[mesIndex]);
          const isPending = hasPendingChange(estIndex, mesIndex);
          const tieneVale = hasValeGenerado?.(estData.establecimiento.id, mesIndex) ?? false;

          return (
            <div key={`${estData.establecimiento.id}-${mes}`} className="rounded-[9px] border border-[#e7e7ef] bg-white p-1">
              <div className="mb-0.5 flex items-center justify-between px-1">
                <span className="text-[0.58rem] font-semibold uppercase tracking-wider text-[#8b8f9b]">{mes}</span>
                <div className="flex items-center gap-0.5">
                  {tieneVale && <CheckCircle className="h-3 w-3 text-[#7c3aed]" weight="fill" />}
                  {isPending ? <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> : null}
                </div>
              </div>
              <div className="overflow-hidden rounded-[7px] bg-[#fbfafd]">
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
  hasValeGenerado,
}) => {
  const isDisabled = readOnly || isUpdating || isLoading;
  const totalGeneral = calcularTotalGeneral();

  return (
    <section className="relative flex h-full flex-1 flex-col bg-white" aria-label="Matriz de planificación">
      <DataTable
        isLoading={isLoading}
        loadingMessage="Cargando planificación..."
        skeletonRows={10}
        skeletonColumns={14}
        loadingVariant="table"
      >
        <div className="hidden min-h-0 flex-1 overflow-auto md:block selection:bg-zinc-200">
          <table className="w-full border-separate border-spacing-0" role="table" aria-label="Matriz de datos">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#fbfafd]">
                <th className="sticky left-0 z-30 w-[260px] min-w-[260px] border-b border-r border-[#e7e7ef] bg-[#fbfafd] px-4 py-3 text-left text-sm font-medium tracking-[-0.01em] text-[#8b8f9b]">
                  Establecimiento
                </th>
                {MESES_CORTOS.map((mes) => (
                  <th key={mes} className="w-[70px] min-w-[70px] border-b border-r border-[#eeeef3] bg-[#fbfafd] px-2 py-3 text-center text-sm font-medium tracking-[-0.01em] text-[#8b8f9b]">
                    {mes}
                  </th>
                ))}
                <th className="w-[90px] min-w-[90px] border-b border-[#eeeef3] bg-[#fbfafd] px-2 py-3 text-center text-sm font-medium tracking-[-0.01em] text-[#606571]">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="text-[0.85rem]">
              <tr className="sticky top-[45px] z-[15] border-b border-[#eeeef3] bg-white/95 backdrop-blur-sm">
                <td className="sticky left-0 z-20 border-b border-r border-[#e7e7ef] bg-white/95 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#606571]">Total mensual</span>
                    <span className="text-xs font-medium text-[#8b8f9b]">{establecimientos.length} estab.</span>
                  </div>
                </td>
                {MESES_CORTOS.map((mes, mesIndex) => {
                  const val = calcularTotalMes(mesIndex);
                  return (
                    <td key={`total-${mes}`} className="border-b border-r border-[#eeeef3] bg-transparent px-1 py-1 text-center align-middle">
                       <span className={`text-[0.75rem] font-semibold tabular-nums tracking-tight ${val > 0 ? 'text-[#15171d]' : 'text-[#c4c7d0]'}`}>
                         {val > 0 ? val.toLocaleString() : '-'}
                       </span>
                    </td>
                  );
                })}
                <td className="border-b border-[#eeeef3] bg-transparent px-2 py-1 text-center align-middle">
                  <TotalPill value={totalGeneral} tone="dark" />
                </td>
              </tr>

              {establecimientos.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-16 text-center">
                    <EmptyState
                      icon={Package}
                      title="Sin establecimientos"
                      description="Ajusta los filtros para cargar la matriz de planificación."
                    />
                  </td>
                </tr>
              ) : null}

              {establecimientos.map((estData, estIndex) => {
                const isSelected = selectedRowId === estData.establecimiento.id;
                const estiloEstablecimiento = getEstiloEstablecimiento(estData.establecimiento);
                const { colores, centro } = estiloEstablecimiento;
                const rowBg = colores.bg;
                
                return (
                  <tr
                    key={estData.planificacionId ?? estData.establecimiento.id}
                    onClick={() => onRowSelect(estData.establecimiento.id)}
                    className={`${rowBg} cursor-pointer transition-[filter] hover:brightness-[0.98]`}
                  >
                    <td className={`sticky left-0 z-10 box-border border-b border-r px-4 py-3 ${colores.border} ${rowBg} ${isSelected ? 'ring-inset ring-[1.5px] ring-[#7c3aed]' : ''}`}>
                      <div className="min-w-0">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-white ${colores.border}`}>
                            <span className={`h-3 w-3 rounded-full ${colores.accent}`} aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold tracking-tight text-[#15171d]">
                                {estData.establecimiento.nombre}
                              </p>
                              {estData.total === 0 && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"></span>}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {estData.establecimiento.codigo && (
                                <span className="font-mono text-[0.68rem] font-medium text-[#8b8f9b]">{estData.establecimiento.codigo}</span>
                              )}
                              {selectedCentroAcopio === 'todos' ? (
                                <span className={`inline-flex rounded-md border bg-white px-2 py-0.5 text-[0.68rem] font-medium ${colores.border} ${colores.text}`}>
                                  {centro !== 'DEFAULT' ? centro : 'Regional'}
                                </span>
                              ) : null}
                              <EstadoBadge total={estData.total} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {estData.distribucionMensual.map((valor, mesIndex) => {
                      const currentValue = getCurrentValue(estIndex, mesIndex, valor);
                      const isPending = hasPendingChange(estIndex, mesIndex);
                      const tieneVale = hasValeGenerado?.(estData.establecimiento.id, mesIndex) ?? false;

                      return (
                        <td key={`${estData.establecimiento.id}-${mesIndex}`} className={`relative border-b border-r border-[#eeeef3] p-0 align-middle ${isSelected ? `${rowBg} ring-inset ring-[1px] ring-[#c8bbff]` : ''}`}>
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
                          {tieneVale && (
                            <span className="pointer-events-none absolute right-0.5 top-0.5 z-10 flex items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-[#c8bbff]">
                              <CheckCircle className="h-3 w-3 text-[#7c3aed]" weight="fill" />
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className={`border-b border-[#eeeef3] p-0 text-center align-middle ${isSelected ? `${rowBg} ring-inset ring-[1.5px] ring-[#7c3aed]` : ''}`}>
                      <div className="flex h-full w-full items-center justify-center p-2 text-[0.8rem] font-semibold tabular-nums text-[#15171d]">
                         {estData.total > 0 ? estData.total.toLocaleString() : <span className="text-[#c4c7d0]">-</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-white p-2.5 md:hidden">
          <MobileTotalesSummary
            count={establecimientos.length}
            totalGeneral={totalGeneral}
            calcularTotalMes={calcularTotalMes}
          />

          {establecimientos.length === 0 && !isLoading ? (
            <div className="rounded-xl border border-[#e7e7ef] bg-white">
              <EmptyState
                icon={Package}
                title="Sin establecimientos"
                description="Ajusta los filtros para cargar la matriz de planificación."
              />
            </div>
          ) : (
            <div className="mt-2.5 space-y-2.5">
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
                  hasValeGenerado={hasValeGenerado}
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
