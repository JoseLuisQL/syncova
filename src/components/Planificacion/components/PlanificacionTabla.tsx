import React, { memo } from 'react';
import { Package } from '@phosphor-icons/react';
import { DataTable } from '../../Establecimientos/components';
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
      <span className={`inline-flex flex-1 items-center justify-center text-[0.85rem] font-bold tabular-nums text-zinc-900 ${compact ? 'w-full py-2' : ''}`}>
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
        className={`${widthClass} bg-transparent px-2.5 py-2.5 text-center text-[0.85rem] font-bold tabular-nums text-zinc-900 transition-colors focus:bg-white focus:outline-none focus:ring-[1.5px] focus:ring-inset focus:ring-zinc-900 disabled:cursor-not-allowed hover:bg-zinc-100/50 ${pending ? 'bg-amber-50 text-amber-900 focus:bg-amber-50' : ''}`}
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
      ? 'bg-zinc-900 text-white shadow-sm'
      : tone === 'muted'
      ? 'bg-zinc-100 text-zinc-500'
      : 'bg-white border border-zinc-200 text-zinc-900 font-black';

  return (
    <span className={`inline-flex min-w-[3.5rem] items-center justify-center rounded-[6px] px-2 py-1 text-[0.75rem] font-bold tabular-nums tracking-tight ${className}`}>
      {value.toLocaleString()}
    </span>
  );
});

TotalPill.displayName = 'TotalPill';

const EstadoBadge: React.FC<{ total: number }> = memo(({ total }) => (
  <span
    className={`inline-flex items-center rounded-sm px-1.5 py-[2px] text-[0.55rem] font-black uppercase tracking-[0.1em] ${
      total > 0
        ? 'border border-zinc-300 bg-white text-zinc-800'
        : 'border border-zinc-200 bg-zinc-100 text-zinc-400'
    }`}
  >
    {total > 0 ? 'Con Matriz' : 'Pendiente'}
  </span>
));

EstadoBadge.displayName = 'EstadoBadge';

const MobileTotalesSummary: React.FC<{
  count: number;
  totalGeneral: number;
  calcularTotalMes: PlanificacionTablaProps['calcularTotalMes'];
}> = memo(({ count, totalGeneral, calcularTotalMes }) => (
  <div className="rounded-[16px] border border-zinc-200 bg-white p-3 shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
      <div>
        <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400">Total Global</p>
        <p className="mt-0.5 text-xs font-semibold text-zinc-600">{count} unidades</p>
      </div>
      <span className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[0.75rem] font-black text-white shadow-sm">
        Volumen: {totalGeneral.toLocaleString()}
      </span>
    </div>
    <div className="mt-3 grid grid-cols-4 gap-1.5">
      {MESES_CORTOS.map((mes, mesIndex) => {
        const total = calcularTotalMes(mesIndex);
        return (
          <div key={mes} className="rounded-lg bg-zinc-50 border border-zinc-100 px-1.5 py-2 text-center">
            <p className="text-[0.55rem] font-bold uppercase tracking-wider text-zinc-400">{mes}</p>
            <p className={`mt-0.5 text-[0.7rem] font-black tabular-nums ${total > 0 ? 'text-zinc-900' : 'text-zinc-300'}`}>
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
  const { centro, colores } = estiloEstablecimiento;

  return (
    <div
      onClick={() => onRowSelect(estData.establecimiento.id)}
      className={`rounded-[16px] border p-3 transition-colors ${
        isSelected
          ? 'border-zinc-900 bg-zinc-50 shadow-sm ring-1 ring-zinc-900'
          : `border-zinc-200 ${colores.bg} hover:border-zinc-300`
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-black tracking-tight ${isSelected ? 'text-zinc-900' : 'text-zinc-800'}`}>
            {estData.establecimiento.nombre}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {selectedCentroAcopio === 'todos' ? (
              <span className={`inline-flex rounded-sm border border-zinc-200 bg-zinc-100 px-1.5 py-[2px] text-[0.55rem] font-black uppercase tracking-[0.1em] text-zinc-500`}>
                {centro !== 'DEFAULT' ? centro : 'Base'}
              </span>
            ) : null}
            <EstadoBadge total={estData.total} />
          </div>
        </div>
        <TotalPill value={estData.total} tone={isSelected ? "dark" : "zinc"} />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5 border-t border-zinc-100 pt-3">
        {MESES_CORTOS.map((mes, mesIndex) => {
          const currentValue = getCurrentValue(estIndex, mesIndex, estData.distribucionMensual[mesIndex]);
          const isPending = hasPendingChange(estIndex, mesIndex);

          return (
            <div key={`${estData.establecimiento.id}-${mes}`} className="rounded-lg border border-zinc-200 bg-white p-1">
              <div className="mb-0.5 flex items-center justify-between px-1">
                <span className="text-[0.55rem] font-bold uppercase tracking-wider text-zinc-400">{mes}</span>
                {isPending ? <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> : null}
              </div>
              <div className="rounded-md bg-zinc-50 overflow-hidden">
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
}) => {
  const isDisabled = readOnly || isUpdating || isLoading;
  const totalGeneral = calcularTotalGeneral();

  return (
    <section className="relative flex h-full flex-1 flex-col bg-white" aria-label="Matriz General de Planificación">
      <DataTable
        isLoading={isLoading}
        loadingMessage="Renderizando matriz Tufte-Style..."
        skeletonRows={10}
        skeletonColumns={14}
        loadingVariant="table"
      >
        <div className="hidden min-h-0 flex-1 overflow-auto md:block selection:bg-zinc-200">
          <table className="w-max min-w-full table-fixed border-collapse" role="table" aria-label="Matriz de datos">
            <thead className="sticky top-0 z-20">
              <tr className="border-b-[3px] border-zinc-900 bg-white">
                <th className={`sticky left-0 z-30 w-[260px] min-w-[260px] bg-white px-2 py-2.5 text-left text-[0.65rem] font-black uppercase tracking-[0.15em] text-zinc-600 border-r border-zinc-200/60`}>
                  Nomenclatura (Punto de Entrega)
                </th>
                {MESES_CORTOS.map((mes) => (
                  <th key={mes} className={`w-[70px] min-w-[70px] px-2 py-2.5 text-center text-[0.65rem] font-black uppercase tracking-[0.15em] text-zinc-500 border-r border-zinc-100`}>
                    {mes}
                  </th>
                ))}
                <th className={`w-[90px] min-w-[90px] px-2 py-2.5 text-center text-[0.65rem] font-black uppercase tracking-[0.15em] text-zinc-900`}>
                  Suma
                </th>
              </tr>
            </thead>

            <tbody className="text-[0.85rem]">
              <tr className="sticky top-[35px] z-[15] border-b border-zinc-300 bg-zinc-50/90 backdrop-blur-sm">
                <td className="sticky left-0 z-20 border-r border-zinc-200 bg-zinc-50/90 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-600">Total Macro</span>
                    <span className="text-xs font-bold text-zinc-400">{establecimientos.length} un.</span>
                  </div>
                </td>
                {MESES_CORTOS.map((mes, mesIndex) => {
                  const val = calcularTotalMes(mesIndex);
                  return (
                    <td key={`total-${mes}`} className="border-r border-zinc-100 bg-transparent px-1 py-1 text-center align-middle">
                       <span className={`text-[0.75rem] font-black tabular-nums tracking-tight ${val > 0 ? 'text-zinc-900' : 'text-zinc-300'}`}>
                         {val > 0 ? val.toLocaleString() : '-'}
                       </span>
                    </td>
                  );
                })}
                <td className="bg-transparent px-2 py-1 text-center align-middle">
                  <TotalPill value={totalGeneral} tone="dark" />
                </td>
              </tr>

              {establecimientos.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-[240px] flex-col items-center">
                      <Package className="mb-4 h-12 w-12 text-zinc-200" weight="duotone" />
                      <p className="text-base font-black tracking-tight text-zinc-900">Cuadrícula vacía</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Los filtros actuales no devuelven centros acopiables. Reajusta la selección para inyectar datos.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {establecimientos.map((estData, estIndex) => {
                const isSelected = selectedRowId === estData.establecimiento.id;
                const estiloEstablecimiento = getEstiloEstablecimiento(estData.establecimiento);
                const { colores } = estiloEstablecimiento;
                const rowBg = isSelected ? 'bg-zinc-100/60' : colores.bg;
                
                return (
                  <tr
                    key={estData.planificacionId ?? estData.establecimiento.id}
                    onClick={() => onRowSelect(estData.establecimiento.id)}
                    className={`${rowBg} cursor-pointer transition-colors border-b border-zinc-100 ${!isSelected && 'hover:brightness-[0.97]'}`}
                  >
                    <td className={`sticky left-0 z-10 box-border border-r border-zinc-200 px-3 py-2.5 ${isSelected ? 'bg-zinc-100/60 ring-inset ring-[1.5px] ring-zinc-900' : colores.bg}`}>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`truncate text-xs font-black tracking-tight ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                            {estData.establecimiento.nombre}
                          </p>
                          {estData.total === 0 && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-amber-400"></span>}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                           {estData.establecimiento.codigo && (
                             <span className="font-mono text-[0.6rem] font-bold text-zinc-400">{estData.establecimiento.codigo}</span>
                           )}
                           <EstadoBadge total={estData.total} />
                        </div>
                      </div>
                    </td>

                    {estData.distribucionMensual.map((valor, mesIndex) => {
                      const currentValue = getCurrentValue(estIndex, mesIndex, valor);
                      const isPending = hasPendingChange(estIndex, mesIndex);

                      return (
                        <td key={`${estData.establecimiento.id}-${mesIndex}`} className={`border-r border-zinc-100 p-0 align-middle ${isSelected ? 'border-y border-y-zinc-900 border-r-zinc-300' : ''}`}>
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

                    <td className={`p-0 text-center align-middle ${isSelected ? 'border-y border-y-zinc-900 border-r-2 border-r-zinc-900 bg-zinc-100' : ''}`}>
                      <div className="flex h-full w-full items-center justify-center p-2 text-[0.8rem] font-black tabular-nums text-zinc-900">
                         {estData.total > 0 ? estData.total.toLocaleString() : <span className="text-zinc-300">-</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-2.5 md:hidden bg-zinc-50/50">
          <MobileTotalesSummary
            count={establecimientos.length}
            totalGeneral={totalGeneral}
            calcularTotalMes={calcularTotalMes}
          />

          {establecimientos.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center py-10">
              <Package className="mb-3 h-10 w-10 text-zinc-300" weight="duotone" />
              <p className="text-sm font-black text-zinc-800">No hay establecimientos</p>
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
