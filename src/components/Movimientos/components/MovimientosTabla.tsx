import React, { memo, useMemo } from 'react';
import { Package, Plus, Settings2, X } from 'lucide-react';
import { DataTable } from '../../Establecimientos/components';
import {
  COLUMNAS_CONFIGURABLES,
  COMPONENT_STYLES,
  DEFAULT_VISIBLE_COLUMNS,
  INPUT_FIELD_STYLES,
  MESES,
  TABLA_COLUMNAS,
  type ColumnaConfigurableKey,
  type VisibleColumnsState,
} from '../constants';
import { MovimientoCalculado } from '../../../types';
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
    ? 'border-teal-300 bg-teal-50 text-teal-800 focus:border-teal-500 focus:ring-teal-500/20'
    : pending
    ? styles.pending
    : `${styles.normal} ${styles.focus}`;

  const indicatorClassName = typing
    ? 'bg-teal-400 animate-pulse'
    : pending
    ? 'bg-amber-400 animate-pulse'
    : hasVale
    ? 'bg-emerald-500'
    : '';

  if (readOnly) {
    return (
      <span className="inline-flex min-w-[4.75rem] justify-center rounded-xl border border-slate-200 bg-white/80 px-2.5 py-2 text-sm font-semibold text-slate-700 tabular-nums">
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
        title={title}
        aria-label={ariaLabel}
        className={`${widthClass} rounded-xl border px-2.5 py-2 text-center text-sm font-semibold tabular-nums transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${resolvedClassName}`}
      />
      {indicatorClassName ? (
        <span className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white ${indicatorClassName}`} />
      ) : null}
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
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'cyan'
      ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
      : tone === 'teal'
      ? 'border-teal-200 bg-teal-50 text-teal-800'
      : 'border-slate-200 bg-slate-50 text-slate-700';

  return (
    <span className={`inline-flex min-w-[4.5rem] justify-center rounded-xl border px-2.5 py-2 text-sm font-semibold tabular-nums ${className}`}>
      {value.toLocaleString()}
    </span>
  );
});

MetricPill.displayName = 'MetricPill';

const AvailabilityBadge: React.FC<{ value: number }> = memo(({ value }) => {
  const className =
    value >= 2
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : value >= 1
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  return (
    <span className={`inline-flex min-w-[4.8rem] flex-col items-center rounded-xl border px-2 py-1.5 text-xs font-semibold ${className}`}>
      <span className="text-sm font-semibold tabular-nums">{value.toFixed(1)}</span>
      <span className="text-[10px] uppercase tracking-[0.12em] opacity-80">meses</span>
    </span>
  );
});

AvailabilityBadge.displayName = 'AvailabilityBadge';

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
  const estiloEstablecimiento = getEstiloEstablecimiento(movimiento.establecimiento);
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
        className="flex flex-col items-center space-y-2"
        onClick={(event) => { event.stopPropagation(); onRowSelect(movimiento.establecimientoId); }}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
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
            widthClass="w-24"
            onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
            onChange={(nextValue) => onTempValueChange(movimiento.establecimientoId, fieldKey, nextValue)}
            onBlur={() => onFieldBlur(movimiento.establecimientoId, fieldKey)}
          />

          {totalEntregaAdicional > 0 ? (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              +{totalEntregaAdicional.toLocaleString()} adicional
            </span>
          ) : null}

          {!readOnly ? (
            <button
              type="button"
              onClick={() => onAgregarEntregaAdicional(movimiento.establecimientoId)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-teal-300 bg-white text-teal-600 transition hover:border-teal-400 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDisabled}
              title="Agregar entrega adicional"
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {movimiento.entregasAdicionales?.length ? (
          <div className="flex flex-wrap justify-center gap-2">
            {movimiento.entregasAdicionales.map((entrega) => (
              <div
                key={entrega.id}
                className={`flex items-center gap-1.5 rounded-2xl border px-2 py-1.5 ${
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
                  title={entrega.tieneValeGenerado ? `Vale: ${entrega.valeNumero}` : `Entrega adicional #${entrega.numeroEntrega}`}
                  hasVale={Boolean(entrega.tieneValeGenerado)}
                  widthClass="w-16"
                  onRowFocus={() => onRowSelect(movimiento.establecimientoId)}
                  onChange={(nextValue) => onTempEntregaValueChange(entrega.id, nextValue)}
                  onBlur={() => onEntregaFieldBlur(entrega.id)}
                />

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  #{entrega.numeroEntrega}
                </span>

                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => onEliminarEntregaAdicional(entrega.id)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      entrega.tieneValeGenerado
                        ? 'text-emerald-600 hover:bg-emerald-100'
                        : 'text-rose-500 hover:bg-rose-50'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    disabled={isDisabled || isProcessingEntrega}
                    title="Eliminar entrega adicional"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
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
        return <MetricPill value={movimiento.saldo} tone="emerald" />;
      case 'entrega':
        return renderEntregaInput(movimiento);
      case 'stock':
        return <MetricPill value={movimiento.stock} tone="cyan" />;
      case 'promedioConsumo':
        return (
          <span className="inline-flex min-w-[4.5rem] justify-center rounded-xl border border-slate-200 bg-white/80 px-2.5 py-2 text-sm font-semibold text-slate-700 tabular-nums">
            {movimiento.promedioConsumo.toLocaleString()}
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
        return <MetricPill value={totalesGenerales.transIngreso} tone="teal" />;
      case 'totalSaldo':
        return <MetricPill value={totalesGenerales.totalSaldo} tone="teal" />;
      case 'salida':
        return <MetricPill value={totalesGenerales.salida} tone="neutral" />;
      case 'transSalida':
        return <MetricPill value={totalesGenerales.transSalida} tone="neutral" />;
      case 'saldo':
        return <MetricPill value={totalesGenerales.saldo} tone="emerald" />;
      case 'entrega':
        return <MetricPill value={totalesGenerales.entrega} tone="teal" />;
      case 'stock':
        return <MetricPill value={totalesGenerales.stock} tone="cyan" />;
      case 'promedioConsumo':
      case 'disponibilidad':
        return <span className="text-sm text-slate-400">-</span>;
      default:
        return null;
    }
  };

  return (
    <section className={`${COMPONENT_STYLES.panel} relative flex h-full flex-col`} aria-label="Tabla de movimientos">
      <button
        type="button"
        onClick={onOpenColumnSettings}
        className="absolute right-2 top-2 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md shadow-slate-200/70 backdrop-blur transition hover:border-teal-200 hover:text-teal-700 sm:right-3 sm:top-3"
        title={`Configurar columnas (${visibleCount}/${COLUMNAS_CONFIGURABLES.length})`}
        aria-label="Configurar columnas visibles"
      >
        <Settings2 className="h-4 w-4" />
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
        <div className="hidden min-h-0 flex-1 overflow-auto md:block">
          <table className="w-max min-w-full table-auto divide-y divide-slate-200">
            <thead className="sticky top-0 z-20 bg-white">
              <tr className="border-b border-slate-200 bg-slate-50/95">
                {columnasVisibles.map((column, index) => {
                  const isFirst = index === 0;

                  return (
                    <th
                      key={column.key}
                      className={`${COMPONENT_STYLES.table.headerCell} ${column.width} ${
                        isFirst
                          ? 'sticky left-0 z-30 bg-slate-50/95 shadow-[8px_0_14px_-12px_rgba(15,23,42,0.16)]'
                          : ''
                      } ${
                        column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {column.key === 'entrega' ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span>{column.label}</span>
                          <span className="text-[10px] font-semibold normal-case tracking-normal text-teal-600">{periodoEntrega}</span>
                        </div>
                      ) : (
                        column.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <tr className="sticky top-[52px] z-[15] bg-slate-50 shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1)]">
                <td className="sticky left-0 z-20 border-r border-slate-200 bg-slate-50 px-4 py-3 shadow-[8px_0_14px_-12px_rgba(15,23,42,0.12)]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Totales</p>
                    <p className="mt-1 text-xs text-slate-500">{datosTabla.length} establecimientos</p>
                  </div>
                </td>
                {columnasVisibles
                  .filter((column) => column.key !== 'establecimiento')
                  .map((column) => (
                    <td key={column.key} className={`bg-slate-50 px-3 py-3 ${column.key === 'entrega' ? 'align-top text-center' : 'text-center'}`}>
                      {renderTotalCell(column.key)}
                    </td>
                  ))}
              </tr>

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
                const estiloEstablecimiento = getEstiloEstablecimiento(movimiento.establecimiento);
                const { colores, centro } = estiloEstablecimiento;
                const isSelected = selectedRowId === movimiento.establecimientoId;
                const rowBg = isSelected ? 'bg-teal-50' : colores.bg;
                const stickyCellBg = isSelected ? 'bg-teal-50' : colores.bg;

                return (
                  <tr
                    key={`${movimiento.establecimientoId}-${selectedMes}-${selectedAnio}`}
                    onClick={() => onRowSelect(movimiento.establecimientoId)}
                    className={`${rowBg} ${COMPONENT_STYLES.table.row} cursor-pointer ${isSelected ? 'relative z-[1] shadow-[inset_0_0_0_2px_rgba(13,148,136,0.6)]' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className={`sticky left-0 z-10 border-r border-white/60 px-4 py-3 shadow-[8px_0_14px_-12px_rgba(15,23,42,0.12)] ${stickyCellBg} ${isSelected ? 'shadow-[8px_0_14px_-12px_rgba(15,23,42,0.12),inset_0_0_0_2px_rgba(13,148,136,0.6)]' : ''}`}>
                      <div className={`flex items-start gap-3`}>
                        <span
                          className={`mt-2 h-2.5 w-2.5 rounded-full ${
                            movimiento.tieneMovimiento ? 'bg-emerald-500' : 'bg-slate-300'
                          } ${isSelected ? 'ring-4 ring-teal-300' : 'ring-2 ring-white/80'}`}
                        />
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-semibold ${isSelected ? 'text-teal-800' : colores.text}`}>{movimiento.establecimiento.nombre}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{movimiento.establecimiento.codigo}</span>
                            <span className="text-slate-300">•</span>
                            <span>{movimiento.tieneMovimiento ? 'Con movimiento' : 'Pendiente'}</span>
                          </div>
                          {selectedCentroAcopio === 'todos' ? (
                            <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${colores.border} ${colores.text}`}>
                              {centro !== 'DEFAULT' ? centro : 'Regional'}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    {columnasVisibles
                      .filter((column) => column.key !== 'establecimiento')
                      .map((column) => (
                        <td
                          key={column.key}
                          className={`px-3 py-3 ${
                            column.key === 'entrega' ? 'align-top' : 'text-center'
                          }`}
                        >
                          {renderCellContent(movimiento, column.key)}
                        </td>
                      ))}
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
