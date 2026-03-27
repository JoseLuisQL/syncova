import React, { memo, useMemo } from 'react';
import { Package, Plus, Faders, X, CheckCircle } from '@phosphor-icons/react';
import { DataTable } from '../../Establecimientos/components';
import {
  COLUMNAS_CONFIGURABLES,
  COMPONENT_STYLES,
  INPUT_FIELD_STYLES,
  MESES,
  TABLA_COLUMNAS,
  type ColumnaConfigurableKey,
  type VisibleColumnsState,
} from '../constants';
import { MovimientoCalculado, Establecimiento } from '../../../types';
import { getEstiloEstablecimiento } from '../../../utils/centroAcopioUtils';

type TablaMovimiento = MovimientoCalculado & { tieneMovimiento: boolean };

interface MovimientosTablaProps {
  readOnly?: boolean;
  datosTabla: Array<TablaMovimiento>;
  totalesGenerales: {
    saldoAnterior: number;
    transIngreso: number;
    totalSaldo: number;
    salida: number;
    transSalida: number;
    saldo: number;
    ici?: number;
    entrega: number;
    stock: number;
  };
  selectedMes: number;
  selectedAnio: number;
  selectedCentroAcopio: string;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isAutoSaving: boolean;
  isProcessingEntrega: boolean;
  isTyping: { [key: string]: boolean };
  getCurrentValue: (establecimientoId: string, campo: string, originalValue: number) => number;
  hasPendingChange: (establecimientoId: string, campo: string) => boolean;
  getCurrentEntregaValue: (entregaId: string, originalValue: number) => number;
  hasPendingEntregaChange: (entregaId: string) => boolean;
  getFieldKey: (establecimientoId: string, campo: string) => string;
  onTempValueChange: (establecimientoId: string, campo: string, value: number) => void;
  onFieldBlur: (establecimientoId: string, campo: string) => void;
  onTempEntregaValueChange: (entregaId: string, value: number) => void;
  onEntregaFieldBlur: (entregaId: string) => void;
  onAgregarEntregaAdicional: (establecimientoId: string) => void;
  onEliminarEntregaAdicional: (entregaId: string) => void;

  selectedRowId: string | null;
  onRowSelect: (id: string | null) => void;
  visibleColumns: VisibleColumnsState;
  onOpenColumnSettings: () => void;
}

interface EditableNumberFieldProps {
  readOnly?: boolean;
  value: number;
  pending: boolean;
  typing: boolean;
  disabled: boolean;
  styles: {
    normal: string;
    focus: string;
    pending: string;
  };
  ariaLabel: string;
  widthClass?: string;
  title?: string;
  hasVale?: boolean;
  onRowFocus: () => void;
  onChange?: (value: number) => void;
  onBlur?: () => void;
}

const EditableNumberField: React.FC<EditableNumberFieldProps> = memo(({
  readOnly = false,
  value,
  pending,
  typing,
  disabled,
  styles,
  ariaLabel,
  widthClass = 'w-20',
  title,
  hasVale = false,
  onRowFocus,
  onChange,
  onBlur,
}) => {
  const resolvedClassName = hasVale
    ? 'border border-emerald-200 bg-white text-emerald-950 shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-lg'
    : pending
    ? styles.pending
    : `${styles.normal} ${styles.focus}`;

  const indicatorClassName = typing
    ? 'bg-zinc-900 animate-pulse'
    : pending
    ? 'bg-amber-400 animate-pulse'
    : '';

  if (readOnly) {
    return (
      <span className={`inline-flex flex-1 items-center justify-center text-[0.85rem] font-bold tabular-nums text-zinc-900 ${widthClass}`}>
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
        title={title}
        aria-label={ariaLabel}
        className={`${widthClass} bg-transparent min-h-[44px] px-2.5 py-2.5 text-center text-[0.85rem] font-bold tabular-nums transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${resolvedClassName}`}
      />
      {indicatorClassName ? (
        <span className={`absolute right-1 top-1 h-2 w-2 rounded-full border border-white ${indicatorClassName}`} />
      ) : null}
      {hasVale && !indicatorClassName && (
        <CheckCircle weight="fill" className="absolute right-1 top-1 h-3.5 w-3.5 text-emerald-500 drop-shadow-sm" />
      )}
    </div>
  );
});

EditableNumberField.displayName = 'EditableNumberField';

const MetricPill: React.FC<{
  value: number;
  tone: 'teal' | 'cyan' | 'emerald' | 'neutral';
}> = memo(({ value, tone }) => {
  const className =
    tone === 'emerald'
      ? 'bg-transparent text-zinc-900 font-bold'
      : tone === 'cyan'
      ? 'bg-transparent text-zinc-900 font-bold'
      : tone === 'teal'
      ? 'bg-zinc-900 text-white shadow-sm font-black'
      : 'bg-transparent text-zinc-600 font-semibold';

  return (
    <span className={`inline-flex min-w-[3.5rem] items-center justify-center rounded-[6px] px-2 py-1 text-[0.75rem] tabular-nums tracking-tight ${className}`}>
      {value === 0 && tone !== 'teal' ? <span className="text-zinc-300">-</span> : value.toLocaleString()}
    </span>
  );
});

MetricPill.displayName = 'MetricPill';

const AvailabilityBadge: React.FC<{ value: number }> = memo(({ value }) => {
  const className =
    value >= 2
      ? 'border-zinc-200 bg-white text-zinc-900'
      : value >= 1
      ? 'border-amber-200 bg-amber-50 text-amber-900 shadow-sm'
      : 'border-rose-300 bg-rose-50 text-rose-900 shadow-sm shadow-rose-100';

  return (
    <span className={`inline-flex min-w-[4.8rem] flex-col items-center rounded-xl border px-2 py-1.5 text-xs font-semibold ${className}`}>
      <span className="text-sm font-semibold tabular-nums">{value.toFixed(1)}</span>
      <span className="text-[10px] uppercase tracking-[0.12em] opacity-80">meses</span>
    </span>
  );
});

AvailabilityBadge.displayName = 'AvailabilityBadge';

const IciPill: React.FC<{ value: number }> = memo(({ value }) => (
  <span className="inline-flex min-w-[3.5rem] items-center justify-center rounded-[6px] bg-indigo-50/80 px-2 py-1 text-[0.75rem] font-black tabular-nums tracking-tight text-indigo-700 ring-1 ring-inset ring-indigo-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
    {value === 0 ? <span className="text-indigo-300 opacity-60">-</span> : value.toLocaleString()}
  </span>
));

IciPill.displayName = 'IciPill';

// ============================================================================
// MOBILE METRIC ROW
// ============================================================================

interface MobileMetricRowProps {
  label: string;
  children: React.ReactNode;
}

const MobileMetricRow: React.FC<MobileMetricRowProps> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </div>
);

// ============================================================================
// MOBILE CARD COMPONENT
// ============================================================================

interface MobileMovimientoCardProps {
  readOnly: boolean;
  movimiento: TablaMovimiento;
  isSelected: boolean;
  isDisabled: boolean;
  isProcessingEntrega: boolean;
  isTyping: { [key: string]: boolean };
  selectedCentroAcopio: string;
  periodoEntrega: string;
  getCurrentValue: MovimientosTablaProps['getCurrentValue'];
  hasPendingChange: MovimientosTablaProps['hasPendingChange'];
  getCurrentEntregaValue: MovimientosTablaProps['getCurrentEntregaValue'];
  hasPendingEntregaChange: MovimientosTablaProps['hasPendingEntregaChange'];
  getFieldKey: MovimientosTablaProps['getFieldKey'];
  onTempValueChange: MovimientosTablaProps['onTempValueChange'];
  onFieldBlur: MovimientosTablaProps['onFieldBlur'];
  onTempEntregaValueChange: MovimientosTablaProps['onTempEntregaValueChange'];
  onEntregaFieldBlur: MovimientosTablaProps['onEntregaFieldBlur'];
  onAgregarEntregaAdicional: MovimientosTablaProps['onAgregarEntregaAdicional'];
  onEliminarEntregaAdicional: MovimientosTablaProps['onEliminarEntregaAdicional'];
  onRowSelect: (id: string | null) => void;
  visibleColumns: VisibleColumnsState;
}

const MobileMovimientoCard: React.FC<MobileMovimientoCardProps> = memo(({
  readOnly,
  movimiento,
  isSelected,
  isDisabled,
  isProcessingEntrega,
  isTyping: isTypingState,
  selectedCentroAcopio,
  getCurrentValue,
  hasPendingChange,
  getCurrentEntregaValue,
  hasPendingEntregaChange,
  getFieldKey,
  onTempValueChange,
  onFieldBlur,
  onTempEntregaValueChange,
  onEntregaFieldBlur,
  onAgregarEntregaAdicional,
  onEliminarEntregaAdicional,
  onRowSelect,
  visibleColumns,
}) => {
  const estiloEstablecimiento = getEstiloEstablecimiento(movimiento.establecimiento as Establecimiento);
  const { colores, centro } = estiloEstablecimiento;

  const tieneEntregasAdicionales = Boolean(
    movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0,
  );
  const entregaFieldKey = tieneEntregasAdicionales ? 'entregaBase' : 'entrega';
  const entregaOriginalValue = tieneEntregasAdicionales
    ? movimiento.entregaBase ?? movimiento.entrega
    : movimiento.entrega;
  const entregaCurrentValue = getCurrentValue(movimiento.establecimientoId, entregaFieldKey, entregaOriginalValue);
  const entregaIsPending = hasPendingChange(movimiento.establecimientoId, entregaFieldKey);
  const entregaKey = getFieldKey(movimiento.establecimientoId, entregaFieldKey);
  const totalEntregaAdicional =
    movimiento.entregasAdicionales?.reduce(
      (acumulado, entrega) => acumulado + getCurrentEntregaValue(entrega.id, entrega.cantidad),
      0,
    ) || 0;

  const visibleMetricRows = [
    visibleColumns.saldoAnterior ? (
      <MobileMetricRow key="saldoAnterior" label="Saldo Ant.">
        <MetricPill value={movimiento.saldoAnterior} tone="neutral" />
      </MobileMetricRow>
    ) : null,
    visibleColumns.totalSaldo ? (
      <MobileMetricRow key="totalSaldo" label="Total">
        <MetricPill value={movimiento.totalSaldo} tone="teal" />
      </MobileMetricRow>
    ) : null,
    visibleColumns.saldo ? (
      <MobileMetricRow key="saldo" label="Saldo">
        <MetricPill value={movimiento.saldo} tone="emerald" />
      </MobileMetricRow>
    ) : null,
    visibleColumns.ici ? (
      <MobileMetricRow key="ici" label="ICI">
        <IciPill value={movimiento.ici ?? 0} />
      </MobileMetricRow>
    ) : null,
    visibleColumns.stock ? (
      <MobileMetricRow key="stock" label="Stock">
        <MetricPill value={movimiento.stock} tone="cyan" />
      </MobileMetricRow>
    ) : null,
  ].filter(Boolean);

  const visibleEditableFields = [
    visibleColumns.transIngreso ? (
      <div key="transIngreso" className="flex flex-col items-center gap-1">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-teal-600">T. Ingreso</span>
        <EditableNumberField
          readOnly={readOnly}
          value={getCurrentValue(movimiento.establecimientoId, 'transIngreso', movimiento.transIngreso)}
          pending={hasPendingChange(movimiento.establecimientoId, 'transIngreso')}
          typing={Boolean(isTypingState[getFieldKey(movimiento.establecimientoId, 'transIngreso')])}
          disabled={isDisabled}
          styles={INPUT_FIELD_STYLES.transIngreso}
          ariaLabel={`Trans ingreso para ${movimiento.establecimiento.nombre}`}
          widthClass="w-full"
          onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
          onChange={(v) => onTempValueChange(movimiento.establecimientoId, 'transIngreso', v)}
          onBlur={() => onFieldBlur(movimiento.establecimientoId, 'transIngreso')}
        />
      </div>
    ) : null,
    visibleColumns.salida ? (
      <div key="salida" className="flex flex-col items-center gap-1">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-cyan-600">Salida</span>
        <EditableNumberField
          readOnly={readOnly}
          value={getCurrentValue(movimiento.establecimientoId, 'salida', movimiento.salida)}
          pending={hasPendingChange(movimiento.establecimientoId, 'salida')}
          typing={Boolean(isTypingState[getFieldKey(movimiento.establecimientoId, 'salida')])}
          disabled={isDisabled}
          styles={INPUT_FIELD_STYLES.salida}
          ariaLabel={`Salida para ${movimiento.establecimiento.nombre}`}
          widthClass="w-full"
          onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
          onChange={(v) => onTempValueChange(movimiento.establecimientoId, 'salida', v)}
          onBlur={() => onFieldBlur(movimiento.establecimientoId, 'salida')}
        />
      </div>
    ) : null,
    visibleColumns.transSalida ? (
      <div key="transSalida" className="flex flex-col items-center gap-1">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-sky-600">T. Salida</span>
        <EditableNumberField
          readOnly={readOnly}
          value={getCurrentValue(movimiento.establecimientoId, 'transSalida', movimiento.transSalida)}
          pending={hasPendingChange(movimiento.establecimientoId, 'transSalida')}
          typing={Boolean(isTypingState[getFieldKey(movimiento.establecimientoId, 'transSalida')])}
          disabled={isDisabled}
          styles={INPUT_FIELD_STYLES.transSalida}
          ariaLabel={`Trans salida para ${movimiento.establecimiento.nombre}`}
          widthClass="w-full"
          onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
          onChange={(v) => onTempValueChange(movimiento.establecimientoId, 'transSalida', v)}
          onBlur={() => onFieldBlur(movimiento.establecimientoId, 'transSalida')}
        />
      </div>
    ) : null,
  ].filter(Boolean);

  return (
    <div
      onClick={() => onRowSelect(movimiento.establecimientoId)}
      className={`rounded-xl border p-3 transition-all ${
        isSelected
          ? 'border-teal-400 bg-teal-50/50 shadow-sm ring-1 ring-teal-300'
          : `border-slate-200 ${colores.bg} hover:border-slate-300 hover:shadow-sm`
      }`}
    >
      {/* Card header: nombre + estado */}
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
            movimiento.tieneMovimiento ? 'bg-emerald-500' : 'bg-slate-300'
          } ${isSelected ? 'ring-3 ring-teal-300' : 'ring-2 ring-white/80'}`}
        />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${isSelected ? 'text-teal-800' : colores.text}`}>
            {movimiento.establecimiento.nombre}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[0.68rem] text-slate-500">
            <span>{movimiento.establecimiento.codigo}</span>
            <span className="text-slate-300">•</span>
            <span>{movimiento.tieneMovimiento ? 'Con movimiento' : 'Pendiente'}</span>
          </div>
          {selectedCentroAcopio === 'todos' ? (
            <span className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${colores.border} ${colores.text}`}>
              {centro !== 'DEFAULT' ? centro : 'Regional'}
            </span>
          ) : null}
        </div>
        {visibleColumns.disponibilidad ? <AvailabilityBadge value={movimiento.disponibilidad} /> : null}
      </div>

      {/* Metrics grid */}
      <div className="mt-3 space-y-1.5 rounded-lg border border-slate-100 bg-white/60 p-2.5">
        {visibleMetricRows.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {visibleMetricRows}
          </div>
        ) : null}

        {/* Editable fields */}
        {visibleEditableFields.length > 0 ? (
          <div
            className={`grid gap-2 border-t border-slate-100 pt-2 ${
              visibleEditableFields.length === 1
                ? 'grid-cols-1'
                : visibleEditableFields.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
            }`}
          >
            {visibleEditableFields}
          </div>
        ) : null}

        {/* Entrega section */}
        {visibleColumns.entrega ? (
          <div className="border-t border-slate-100 pt-2">
          <div className="flex flex-wrap items-center gap-2" onClick={(event) => { event.stopPropagation(); onRowSelect(movimiento.establecimientoId); }}>
            <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-emerald-600">Entrega</span>
            <EditableNumberField
              readOnly={readOnly}
              value={entregaCurrentValue}
              pending={entregaIsPending}
              typing={Boolean(isTypingState[entregaKey])}
              disabled={isDisabled}
              styles={INPUT_FIELD_STYLES.entrega}
              ariaLabel={`Entrega para ${movimiento.establecimiento.nombre}`}
              title={
                movimiento.entregaBaseTieneVale
                  ? `Vale: ${movimiento.valeNumeroEntregaBase}`
                  : tieneEntregasAdicionales
                  ? 'Entrega base'
                  : 'Entrega'
              }
              hasVale={Boolean(movimiento.entregaBaseTieneVale)}
              widthClass="w-20"
              onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
              onChange={(v) => onTempValueChange(movimiento.establecimientoId, entregaFieldKey, v)}
              onBlur={() => onFieldBlur(movimiento.establecimientoId, entregaFieldKey)}
            />

            {totalEntregaAdicional > 0 ? (
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                +{totalEntregaAdicional.toLocaleString()}
              </span>
            ) : null}

            {!readOnly ? (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); onAgregarEntregaAdicional(movimiento.establecimientoId); }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-teal-300 bg-white text-teal-600 transition hover:border-teal-400 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isDisabled}
                title="Agregar entrega adicional"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {movimiento.entregasAdicionales?.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {movimiento.entregasAdicionales.map((entrega) => (
                <div
                  key={entrega.id}
                  className={`flex items-center gap-1 rounded-xl border px-1.5 py-1 ${
                    entrega.tieneValeGenerado
                      ? 'border-emerald-200 bg-emerald-50/80'
                      : 'border-amber-200 bg-white/80'
                  }`}
                >
                  <EditableNumberField
                    readOnly={readOnly}
                    value={getCurrentEntregaValue(entrega.id, entrega.cantidad)}
                    pending={hasPendingEntregaChange(entrega.id)}
                    typing={false}
                    disabled={isDisabled || isProcessingEntrega}
                    styles={INPUT_FIELD_STYLES.entregaAdicional}
                    ariaLabel={`Entrega adicional ${entrega.numeroEntrega} para ${movimiento.establecimiento.nombre}`}
                    title={entrega.tieneValeGenerado ? `Vale: ${entrega.valeNumero}` : `Adicional #${entrega.numeroEntrega}`}
                    hasVale={Boolean(entrega.tieneValeGenerado)}
                    widthClass="w-14"
                    onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
                    onChange={(v) => onTempEntregaValueChange(entrega.id, v)}
                    onBlur={() => onEntregaFieldBlur(entrega.id)}
                  />
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                    #{entrega.numeroEntrega}
                  </span>
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); onEliminarEntregaAdicional(entrega.id); }}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md transition ${
                        entrega.tieneValeGenerado
                          ? 'text-emerald-600 hover:bg-emerald-100'
                          : 'text-rose-500 hover:bg-rose-50'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      disabled={isDisabled || isProcessingEntrega}
                      title="Eliminar"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          </div>
        ) : null}

        {/* Promedio */}
        {visibleColumns.promedioConsumo ? (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-slate-500">Promedio</span>
            <span className="inline-flex min-w-[4rem] justify-center rounded-xl border border-slate-200 bg-white/80 px-2 py-1.5 text-sm font-semibold text-slate-700 tabular-nums">
              {movimiento.promedioConsumo.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
});

MobileMovimientoCard.displayName = 'MobileMovimientoCard';

// ============================================================================
// MOBILE TOTALS SUMMARY
// ============================================================================

const MobileTotalesSummary: React.FC<{
  totalesGenerales: MovimientosTablaProps['totalesGenerales'];
  count: number;
  visibleColumns: VisibleColumnsState;
}> = memo(({ totalesGenerales, count, visibleColumns }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Totales</p>
        <p className="text-[0.68rem] text-slate-500">{count} establecimientos</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {visibleColumns.saldoAnterior ? (
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[0.65rem] font-semibold text-slate-600">
            Ant: {totalesGenerales.saldoAnterior.toLocaleString()}
          </span>
        ) : null}
        {visibleColumns.totalSaldo ? (
          <span className="rounded-lg bg-teal-50 px-2 py-1 text-[0.65rem] font-semibold text-teal-700">
            Total: {totalesGenerales.totalSaldo.toLocaleString()}
          </span>
        ) : null}
        {visibleColumns.saldo ? (
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[0.65rem] font-semibold text-emerald-700">
            Saldo: {totalesGenerales.saldo.toLocaleString()}
          </span>
        ) : null}
        {visibleColumns.ici ? (
          <span className="rounded-lg bg-amber-50 px-2 py-1 text-[0.65rem] font-semibold text-amber-700">
            ICI: {(totalesGenerales.ici ?? 0).toLocaleString()}
          </span>
        ) : null}
        {visibleColumns.stock ? (
          <span className="rounded-lg bg-cyan-50 px-2 py-1 text-[0.65rem] font-semibold text-cyan-700">
            Stock: {totalesGenerales.stock.toLocaleString()}
          </span>
        ) : null}
      </div>
    </div>
  </div>
));

MobileTotalesSummary.displayName = 'MobileTotalesSummary';

// ============================================================================
// MAIN TABLE COMPONENT
// ============================================================================

export const MovimientosTabla: React.FC<MovimientosTablaProps> = memo(({
  readOnly = false,
  datosTabla,
  totalesGenerales,
  selectedMes,
  selectedAnio,
  selectedCentroAcopio,
  isLoading,
  isCreating,
  isUpdating,
  isAutoSaving,
  isProcessingEntrega,
  isTyping,
  getCurrentValue,
  hasPendingChange,
  getCurrentEntregaValue,
  hasPendingEntregaChange,
  getFieldKey,
  onTempValueChange,
  onFieldBlur,
  onTempEntregaValueChange,
  onEntregaFieldBlur,
  onAgregarEntregaAdicional,
  onEliminarEntregaAdicional,
  selectedRowId,
  onRowSelect,
  visibleColumns,
  onOpenColumnSettings,
}) => {
  const isDisabled = readOnly || isCreating || isUpdating || isAutoSaving;
  const columnasVisibles = useMemo(
    () =>
      TABLA_COLUMNAS.filter(
        (column) =>
          column.key === 'establecimiento' ||
          visibleColumns[column.key as ColumnaConfigurableKey],
      ),
    [visibleColumns],
  );
  const visibleCount = useMemo(
    () => COLUMNAS_CONFIGURABLES.filter((column) => visibleColumns[column.key]).length,
    [visibleColumns],
  );
  const periodoEntrega = useMemo(() => {
    let mesEntrega = selectedMes + 1;
    let anioEntrega = selectedAnio;
    if (mesEntrega > 12) {
      mesEntrega = 1;
      anioEntrega += 1;
    }

    return `${MESES[mesEntrega - 1]?.slice(0, 3)} ${anioEntrega}`;
  }, [selectedAnio, selectedMes]);

  const renderEditableInput = (
    movimiento: TablaMovimiento,
    campo: 'transIngreso' | 'salida' | 'transSalida',
    value: number,
  ) => {
    const currentValue = getCurrentValue(movimiento.establecimientoId, campo, value);
    const isPending = hasPendingChange(movimiento.establecimientoId, campo);
    const key = getFieldKey(movimiento.establecimientoId, campo);

    return (
      <EditableNumberField
        value={currentValue}
        pending={isPending}
        typing={Boolean(isTyping[key])}
        disabled={isDisabled}
        styles={INPUT_FIELD_STYLES[campo]}
        ariaLabel={`${campo} para ${movimiento.establecimiento.nombre}`}
        onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
        onChange={(nextValue) => onTempValueChange(movimiento.establecimientoId, campo, nextValue)}
        onBlur={() => onFieldBlur(movimiento.establecimientoId, campo)}
      />
    );
  };

  const renderEntregaInput = (movimiento: TablaMovimiento) => {
    const tieneEntregasAdicionales = Boolean(
      movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0,
    );
    const fieldKey = tieneEntregasAdicionales ? 'entregaBase' : 'entrega';
    const originalValue = tieneEntregasAdicionales
      ? movimiento.entregaBase ?? movimiento.entrega
      : movimiento.entrega;
    const currentValue = getCurrentValue(movimiento.establecimientoId, fieldKey, originalValue);
    const isPending = hasPendingChange(movimiento.establecimientoId, fieldKey);
    const key = getFieldKey(movimiento.establecimientoId, fieldKey);
    const totalEntregaAdicional =
      movimiento.entregasAdicionales?.reduce(
        (acumulado, entrega) => acumulado + getCurrentEntregaValue(entrega.id, entrega.cantidad),
        0,
      ) || 0;

    return (
      <div
        className="flex flex-col items-center gap-2 py-1.5"
        onClick={(event) => { event.stopPropagation(); onRowSelect(movimiento.establecimientoId); }}
      >
        <div className="flex items-center justify-center gap-2">
          <EditableNumberField
            readOnly={readOnly}
            value={currentValue}
            pending={isPending}
            typing={Boolean(isTyping[key])}
            disabled={isDisabled}
            styles={INPUT_FIELD_STYLES.entrega}
            ariaLabel={`Entrega para ${movimiento.establecimiento.nombre}`}
            title={
              movimiento.entregaBaseTieneVale
                ? `Vale: ${movimiento.valeNumeroEntregaBase}`
                : tieneEntregasAdicionales
                ? 'Entrega base'
                : 'Entrega'
            }
            hasVale={Boolean(movimiento.entregaBaseTieneVale)}
            widthClass="w-20"
            onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
            onChange={(nextValue) => onTempValueChange(movimiento.establecimientoId, fieldKey, nextValue)}
            onBlur={() => onFieldBlur(movimiento.establecimientoId, fieldKey)}
          />

          <div className="flex flex-col justify-center gap-1.5 w-[42px]">
            {totalEntregaAdicional > 0 ? (
              <span className="inline-flex w-full items-center justify-center rounded border border-amber-200/60 bg-amber-50 py-0.5 text-[0.55rem] font-bold text-amber-700">
                +{totalEntregaAdicional}
              </span>
            ) : null}

            {!readOnly ? (
              <button
                type="button"
                onClick={() => onAgregarEntregaAdicional(movimiento.establecimientoId)}
                className={`inline-flex w-full ${totalEntregaAdicional > 0 ? 'h-5' : 'h-11'} items-center justify-center rounded-lg border border-dashed border-teal-300 bg-teal-50/50 text-teal-600 transition hover:border-teal-400 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isDisabled}
                title="Agregar entrega adicional"
              >
                <Plus className={totalEntregaAdicional > 0 ? "h-3.5 w-3.5" : "h-4 w-4"} weight="bold" />
              </button>
            ) : null}
          </div>
        </div>

        {movimiento.entregasAdicionales?.length ? (
          <div className="flex flex-col gap-2 items-center w-full">
            {movimiento.entregasAdicionales.map((entrega) => (
              <div
                key={entrega.id}
                className={`flex items-center gap-2 rounded-xl border pl-1 pr-1.5 py-1 transition-colors ${
                  entrega.tieneValeGenerado
                    ? 'border-emerald-200/60 bg-emerald-50/40 shadow-sm'
                    : 'border-amber-200/60 bg-amber-50/30 shadow-sm'
                }`}
              >
                <EditableNumberField
                  readOnly={readOnly}
                  value={getCurrentEntregaValue(entrega.id, entrega.cantidad)}
                  pending={hasPendingEntregaChange(entrega.id)}
                  typing={false}
                  disabled={isDisabled || isProcessingEntrega}
                  styles={INPUT_FIELD_STYLES.entregaAdicional}
                  ariaLabel={`Entrega adicional ${entrega.numeroEntrega} para ${movimiento.establecimiento.nombre}`}
                  title={entrega.tieneValeGenerado ? `Vale: ${entrega.valeNumero}` : `Entrega adicional #${entrega.numeroEntrega}`}
                  hasVale={Boolean(entrega.tieneValeGenerado)}
                  widthClass="w-20"
                  onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
                  onChange={(nextValue) => onTempEntregaValueChange(entrega.id, nextValue)}
                  onBlur={() => onEntregaFieldBlur(entrega.id)}
                />

                <div className="flex flex-col justify-center gap-1.5 w-[42px]">
                  <span className="inline-flex w-full items-center justify-center rounded bg-white border border-slate-200/80 py-0.5 text-[0.6rem] font-bold text-slate-500 shadow-sm">
                    #{entrega.numeroEntrega}
                  </span>

                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => onEliminarEntregaAdicional(entrega.id)}
                      className={`inline-flex h-5 w-full items-center justify-center rounded transition focus:outline-none focus:ring-2 focus:ring-rose-500/30 ${
                        entrega.tieneValeGenerado
                          ? 'text-emerald-600 hover:bg-emerald-100'
                          : 'text-rose-500 hover:bg-rose-100 hover:text-rose-600'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      disabled={isDisabled || isProcessingEntrega}
                      title="Eliminar entrega adicional"
                    >
                      <X className="h-3.5 w-3.5" weight="bold" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderCellContent = (movimiento: TablaMovimiento, key: string) => {
    switch (key) {
      case 'saldoAnterior':
        return <MetricPill value={movimiento.saldoAnterior} tone="neutral" />;
      case 'transIngreso':
        return renderEditableInput(movimiento, 'transIngreso', movimiento.transIngreso);
      case 'totalSaldo':
        return <MetricPill value={movimiento.totalSaldo} tone="teal" />;
      case 'salida':
        return renderEditableInput(movimiento, 'salida', movimiento.salida);
      case 'transSalida':
        return renderEditableInput(movimiento, 'transSalida', movimiento.transSalida);
      case 'saldo':
        return <MetricPill value={movimiento.saldo} tone="teal" />;
      case 'ici':
        return <IciPill value={movimiento.ici ?? 0} />;
      case 'entrega':
        return renderEntregaInput(movimiento);
      case 'stock':
        return <MetricPill value={movimiento.stock} tone="teal" />;
      case 'promedioConsumo':
        return (
          <span className="inline-flex min-w-[3.5rem] justify-center rounded-[6px] px-2 py-1 text-[0.75rem] font-bold tabular-nums text-zinc-700">
            {movimiento.promedioConsumo === 0 ? <span className="text-zinc-300">-</span> : movimiento.promedioConsumo.toLocaleString()}
          </span>
        );
      case 'disponibilidad':
        return <AvailabilityBadge value={movimiento.disponibilidad} />;
      default:
        return null;
    }
  };

  const renderTotalCell = (key: string) => {
    switch (key) {
      case 'saldoAnterior':
        return <MetricPill value={totalesGenerales.saldoAnterior} tone="neutral" />;
      case 'transIngreso':
        return <MetricPill value={totalesGenerales.transIngreso} tone="neutral" />;
      case 'totalSaldo':
        return <MetricPill value={totalesGenerales.totalSaldo} tone="teal" />;
      case 'salida':
        return <MetricPill value={totalesGenerales.salida} tone="neutral" />;
      case 'transSalida':
        return <MetricPill value={totalesGenerales.transSalida} tone="neutral" />;
      case 'saldo':
        return <MetricPill value={totalesGenerales.saldo} tone="teal" />;
      case 'ici':
        return <IciPill value={totalesGenerales.ici ?? 0} />;
      case 'entrega':
        return <MetricPill value={totalesGenerales.entrega} tone="teal" />;
      case 'stock':
        return <MetricPill value={totalesGenerales.stock} tone="teal" />;
      case 'promedioConsumo':
      case 'disponibilidad':
        return <span className="text-sm text-slate-400">-</span>;
      default:
        return null;
    }
  };

  return (
    <section className="relative flex h-full flex-1 flex-col bg-transparent" aria-label="Tabla de movimientos">
      <button
        type="button"
        onClick={onOpenColumnSettings}
        className="absolute right-2 top-2 z-30 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/95 text-zinc-900 shadow-sm backdrop-blur transition hover:bg-zinc-900 hover:text-white sm:right-3 sm:top-3"
        title={`Configurar columnas (${visibleCount}/${COLUMNAS_CONFIGURABLES.length})`}
        aria-label="Configurar columnas visibles"
      >
        <Faders className="h-4 w-4" weight="bold" />
      </button>
      <DataTable
        isLoading={isLoading}
        loadingMessage="Cargando movimientos..."
        skeletonRows={7}
        skeletonColumns={columnasVisibles.length}
        loadingVariant="table"
      >
        {/* ============================================================== */}
        {/* DESKTOP TABLE (hidden on mobile) */}
        {/* ============================================================== */}
        <div className="hidden min-h-0 flex-1 overflow-auto md:block selection:bg-zinc-200">
          <table className="w-max min-w-full table-fixed border-collapse" role="table" aria-label="Matriz de datos">
            <thead className="sticky top-0 z-20">
              <tr className="border-b-[3px] border-zinc-900 bg-white">
                {columnasVisibles.map((column, index) => {
                  const isFirst = index === 0;

                  return (
                    <th
                      key={column.key}
                      className={`${COMPONENT_STYLES.table.headerCell} ${column.width} ${
                        isFirst
                          ? 'sticky left-0 z-30 bg-white border-r border-zinc-200/60'
                          : 'border-r border-zinc-100'
                      } ${
                        column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {column.key === 'entrega' ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span>{column.label}</span>
                          <span className="text-[10px] font-semibold normal-case tracking-normal text-emerald-600">{periodoEntrega}</span>
                        </div>
                      ) : (
                        column.label
                      )}
                    </th>
                  );
                })}
              </tr>
              {/* Totales Macro movidos aquí al thead para sticky automático sin gaps */}
              <tr className="border-b border-zinc-300 bg-zinc-50/95 shadow-sm backdrop-blur-sm">
                <th className="sticky left-0 z-30 border-r border-zinc-200 bg-zinc-50/95 px-3 py-2 text-left font-normal">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-600">Total Macro</span>
                    <span className="text-xs font-bold text-zinc-400">{datosTabla.length} un.</span>
                  </div>
                </th>
                {columnasVisibles
                  .filter((column) => column.key !== 'establecimiento')
                  .map((column) => (
                    <th key={column.key} className={`border-r border-zinc-100 bg-zinc-50/95 px-1 py-1 font-normal ${column.key === 'entrega' ? 'align-top text-center' : 'text-center align-middle'}`}>
                      {renderTotalCell(column.key)}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody className="text-[0.85rem]">

              {datosTabla.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={columnasVisibles.length} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-300">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">No hay establecimientos para mostrar</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Ajusta los filtros para visualizar los movimientos del período.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {datosTabla.map((movimiento) => {
                const estiloEstablecimiento = getEstiloEstablecimiento(movimiento.establecimiento as Establecimiento);
                const { colores, centro } = estiloEstablecimiento;
                const isSelected = selectedRowId === movimiento.establecimientoId;
                const rowBg = isSelected ? 'bg-zinc-100/60' : colores.bg;

                return (
                  <tr
                    key={`${movimiento.establecimientoId}-${selectedMes}-${selectedAnio}`}
                    onClick={() => onRowSelect(movimiento.establecimientoId)}
                    className={`${rowBg} cursor-pointer transition-colors border-b border-zinc-100 ${!isSelected && 'hover:brightness-[0.97]'}`}
                  >
                    <td className={`sticky left-0 z-10 box-border border-r border-zinc-200 px-3 py-2.5 ${isSelected ? 'bg-zinc-100/60 ring-inset ring-[1.5px] ring-zinc-900' : colores.bg}`}>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`truncate text-xs font-black tracking-tight ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                            {movimiento.establecimiento.nombre}
                          </p>
                          {!movimiento.tieneMovimiento && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-amber-400"></span>}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                           {movimiento.establecimiento.codigo && (
                             <span className="font-mono text-[0.6rem] font-bold text-zinc-400">{movimiento.establecimiento.codigo}</span>
                           )}
                           <span
                             className={`inline-flex items-center rounded-sm px-1.5 py-[2px] text-[0.55rem] font-black uppercase tracking-[0.1em] ${
                               movimiento.tieneMovimiento
                                 ? 'border border-zinc-300 bg-white text-zinc-800'
                                 : 'border border-zinc-200 bg-zinc-100 text-zinc-400'
                             }`}
                           >
                             {movimiento.tieneMovimiento ? 'Con mov' : 'Pendiente'}
                           </span>
                           {selectedCentroAcopio === 'todos' ? (
                             <span className={`inline-flex rounded-sm border px-1.5 py-[2px] text-[0.55rem] font-black uppercase tracking-[0.1em] ${colores.border} text-zinc-500`}>
                               {centro !== 'DEFAULT' ? centro : 'Base'}
                             </span>
                           ) : null}
                        </div>
                      </div>
                    </td>

                    {columnasVisibles
                      .filter((column) => column.key !== 'establecimiento')
                      .map((column) => {
                        const isEditable = column.key === 'transIngreso' || column.key === 'salida' || column.key === 'transSalida' || column.key === 'entrega';
                        
                        return (
                          <td
                            key={column.key}
                            className={`border-r border-zinc-100 align-middle ${isEditable ? 'p-0' : 'px-2 py-1'} ${isSelected ? 'border-y border-y-zinc-900 border-r-zinc-300' : ''} ${
                              column.key === 'entrega' ? 'align-top' : 'text-center'
                            } ${column.key === 'totalSaldo' || column.key === 'saldo' ? 'bg-zinc-50/50' : ''}`}
                          >
                            {renderCellContent(movimiento, column.key)}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ============================================================== */}
        {/* MOBILE CARD VIEW (shown only on mobile) */}
        {/* ============================================================== */}
        <div className="min-h-0 flex-1 overflow-auto p-2.5 md:hidden">
          {/* Totals summary */}
          <MobileTotalesSummary
            totalesGenerales={totalesGenerales}
            count={datosTabla.length}
            visibleColumns={visibleColumns}
          />

          {/* Card list */}
          {datosTabla.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center py-10">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-300">
                <Package className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No hay establecimientos</p>
              <p className="mt-1 text-xs text-slate-500">Ajusta los filtros para ver los movimientos.</p>
            </div>
          ) : (
            <div className="mt-2.5 space-y-2">
              {datosTabla.map((movimiento) => (
                <MobileMovimientoCard
                  key={`mobile-${movimiento.establecimientoId}-${selectedMes}-${selectedAnio}`}
                  readOnly={readOnly}
                  movimiento={movimiento}
                  isSelected={selectedRowId === movimiento.establecimientoId}
                  isDisabled={isDisabled}
                  isProcessingEntrega={isProcessingEntrega}
                  isTyping={isTyping}
                  selectedCentroAcopio={selectedCentroAcopio}
                  periodoEntrega={periodoEntrega}
                  getCurrentValue={getCurrentValue}
                  hasPendingChange={hasPendingChange}
                  getCurrentEntregaValue={getCurrentEntregaValue}
                  hasPendingEntregaChange={hasPendingEntregaChange}
                  getFieldKey={getFieldKey}
                  onTempValueChange={onTempValueChange}
                  onFieldBlur={onFieldBlur}
                  onTempEntregaValueChange={onTempEntregaValueChange}
                  onEntregaFieldBlur={onEntregaFieldBlur}
                  onAgregarEntregaAdicional={onAgregarEntregaAdicional}
                  onEliminarEntregaAdicional={onEliminarEntregaAdicional}
                  onRowSelect={onRowSelect}
                  visibleColumns={visibleColumns}
                />
              ))}
            </div>
          )}
        </div>
      </DataTable>
    </section>
  );
});

MovimientosTabla.displayName = 'MovimientosTabla';
