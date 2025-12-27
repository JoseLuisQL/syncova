import React, { memo } from 'react';
import { Package, Plus, X, Eye, Zap, Loader2 } from 'lucide-react';
import { COMPONENT_STYLES, INPUT_FIELD_STYLES } from '../constants';
import { MovimientoCalculado } from '../../../types';
import { getEstiloEstablecimiento } from '../../../utils/centroAcopioUtils';

interface MovimientosTablaProps {
  datosTabla: Array<MovimientoCalculado & { tieneMovimiento: boolean }>;
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
  onVerDetalle: (movimiento: MovimientoCalculado & { tieneMovimiento: boolean }) => void;
  onGestionarEntregas: (movimiento: MovimientoCalculado & { tieneMovimiento: boolean }) => void;
}

export const MovimientosTabla: React.FC<MovimientosTablaProps> = memo(({
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
  onVerDetalle,
  onGestionarEntregas,
}) => {
  const isDisabled = isCreating || isUpdating || isAutoSaving;

  const renderEditableInput = (
    movimiento: MovimientoCalculado & { tieneMovimiento: boolean },
    campo: 'transIngreso' | 'salida' | 'transSalida',
    value: number
  ) => {
    const currentValue = getCurrentValue(movimiento.establecimientoId, campo, value);
    const isPending = hasPendingChange(movimiento.establecimientoId, campo);
    const styles = INPUT_FIELD_STYLES[campo];

    return (
      <div className="relative inline-block">
        <input
          type="number"
          min="0"
          value={currentValue}
          onChange={(e) => onTempValueChange(movimiento.establecimientoId, campo, parseInt(e.target.value) || 0)}
          onBlur={() => onFieldBlur(movimiento.establecimientoId, campo)}
          className={`w-20 px-2 py-1.5 text-center text-sm font-semibold border-2 rounded-lg 
                     focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed 
                     transition-all duration-200 tabular-nums ${
            isPending ? styles.pending : `${styles.normal} ${styles.focus}`
          }`}
          disabled={isDisabled}
          aria-label={`${campo} para ${movimiento.establecimiento.nombre}`}
        />
        {isPending && (
          <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse border border-white" />
        )}
      </div>
    );
  };

  const renderEntregaInput = (movimiento: MovimientoCalculado & { tieneMovimiento: boolean }) => {
    const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
    const fieldKey = tieneEntregasAdicionales ? 'entregaBase' : 'entrega';
    const originalValue = tieneEntregasAdicionales 
      ? (movimiento.entregaBase ?? movimiento.entrega)
      : movimiento.entrega;
    const currentValue = getCurrentValue(movimiento.establecimientoId, fieldKey, originalValue);
    const isPending = hasPendingChange(movimiento.establecimientoId, fieldKey);
    const key = getFieldKey(movimiento.establecimientoId, fieldKey);
    const isUserTyping = isTyping[key];
    const styles = INPUT_FIELD_STYLES.entrega;

    return (
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {/* Input principal de entrega */}
        <div className="relative">
          <input
            type="number"
            min="0"
            value={currentValue}
            onChange={(e) => onTempValueChange(
              movimiento.establecimientoId, 
              fieldKey, 
              parseInt(e.target.value) || 0
            )}
            onBlur={() => onFieldBlur(movimiento.establecimientoId, fieldKey)}
            className={`w-20 px-2 py-1.5 text-center text-sm font-semibold border-2 rounded-lg 
                       focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed 
                       transition-all duration-200 tabular-nums ${
              isPending ? styles.pending : `${styles.normal} ${styles.focus}`
            }`}
            disabled={isDisabled}
            title={isUserTyping ? 'Escribiendo...' : isPending ? 'Cambios pendientes' : 'Entrega base'}
            aria-label={`Entrega para ${movimiento.establecimiento.nombre}`}
          />
          {isUserTyping && (
            <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce border border-white" />
          )}
          {!isUserTyping && isPending && (
            <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse border border-white" />
          )}
        </div>

        {/* Entregas adicionales */}
        {movimiento.entregasAdicionales?.map((entrega) => (
          <div 
            key={entrega.id} 
            className="flex items-center gap-0.5 bg-amber-50 rounded-lg px-1.5 py-0.5 border border-amber-200"
          >
            <input
              type="number"
              min="0"
              value={getCurrentEntregaValue(entrega.id, entrega.cantidad)}
              onChange={(e) => onTempEntregaValueChange(entrega.id, parseInt(e.target.value) || 0)}
              onBlur={() => onEntregaFieldBlur(entrega.id)}
              className={`w-16 px-1.5 py-1 text-center text-sm font-semibold border-2 rounded-lg 
                         focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed 
                         transition-all duration-200 tabular-nums ${
                hasPendingEntregaChange(entrega.id)
                  ? INPUT_FIELD_STYLES.entregaAdicional.pending
                  : `${INPUT_FIELD_STYLES.entregaAdicional.normal} ${INPUT_FIELD_STYLES.entregaAdicional.focus}`
              }`}
              disabled={isDisabled || isProcessingEntrega}
              title={`Entrega adicional #${entrega.numeroEntrega}`}
            />
            <button
              onClick={() => onEliminarEntregaAdicional(entrega.id)}
              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
              disabled={isDisabled || isProcessingEntrega}
              title="Eliminar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Botón agregar entrega */}
        <button
          onClick={() => onAgregarEntregaAdicional(movimiento.establecimientoId)}
          className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg 
                     border border-dashed border-teal-300 hover:border-teal-400 
                     transition-colors disabled:opacity-50"
          disabled={isDisabled}
          title="Agregar entrega adicional"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <section className={COMPONENT_STYLES.section.container} aria-label="Tabla de Movimientos">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          {/* Header de la tabla */}
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 min-w-[200px]">
                Establecimiento
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24">
                Saldo Ant.
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24">
                Trans. Ing.
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24 bg-teal-50/50">
                Total
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24">
                Salida
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24">
                Trans. Sal.
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24 bg-emerald-50/50">
                Saldo
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 min-w-[180px]">
                Entrega
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24 bg-cyan-50/50">
                Stock
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24">
                Promedio
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-28">
                Disponib.
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-28">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {/* Fila de totales */}
            <tr className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b-2 border-teal-300 font-semibold">
              <td className="px-4 py-3">
                <div className="font-bold text-gray-900">TOTALES</div>
                <div className="text-xs text-gray-600">{datosTabla.length} establecimientos</div>
              </td>
              <td className="px-3 py-3 text-center text-sm font-bold text-teal-700 tabular-nums">
                {totalesGenerales.saldoAnterior.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center text-sm font-bold text-teal-700 tabular-nums">
                {totalesGenerales.transIngreso.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center bg-teal-100/50">
                <span className="px-2 py-1 bg-teal-600 text-white text-sm font-bold rounded-lg tabular-nums">
                  {totalesGenerales.totalSaldo.toLocaleString()}
                </span>
              </td>
              <td className="px-3 py-3 text-center text-sm font-bold text-cyan-700 tabular-nums">
                {totalesGenerales.salida.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center text-sm font-bold text-cyan-700 tabular-nums">
                {totalesGenerales.transSalida.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-center bg-emerald-100/50">
                <span className="px-2 py-1 bg-emerald-600 text-white text-sm font-bold rounded-lg tabular-nums">
                  {totalesGenerales.saldo.toLocaleString()}
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                <span className="px-2 py-1 bg-teal-600 text-white text-sm font-bold rounded-lg tabular-nums">
                  {totalesGenerales.entrega.toLocaleString()}
                </span>
              </td>
              <td className="px-3 py-3 text-center bg-cyan-100/50">
                <span className="px-2 py-1 bg-cyan-600 text-white text-sm font-bold rounded-lg tabular-nums">
                  {totalesGenerales.stock.toLocaleString()}
                </span>
              </td>
              <td className="px-3 py-3 text-center text-sm text-gray-400">-</td>
              <td className="px-3 py-3 text-center text-sm text-gray-400">-</td>
              <td className="px-3 py-3 text-center text-sm text-gray-400">-</td>
            </tr>

            {/* Filas de datos */}
            {datosTabla.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                      <span>Cargando movimientos...</span>
                    </div>
                  ) : (
                    <div>
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="font-medium">No hay establecimientos para mostrar</p>
                      <p className="text-sm">Seleccione filtros válidos para ver los movimientos</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              datosTabla.map((movimiento) => {
                const estiloEstablecimiento = getEstiloEstablecimiento(movimiento.establecimiento);
                const { colores, centro } = estiloEstablecimiento;

                return (
                  <tr
                    key={`${movimiento.establecimientoId}-${selectedMes}-${selectedAnio}`}
                    className={`${COMPONENT_STYLES.table.row} ${colores.bg} group`}
                  >
                    {/* Establecimiento */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          movimiento.tieneMovimiento
                            ? 'bg-emerald-500 ring-2 ring-emerald-200'
                            : 'bg-gray-300 ring-2 ring-gray-200'
                        }`} />
                        <div className="min-w-0">
                          <div className={`text-sm font-semibold ${colores.text} truncate group-hover:text-gray-900`}>
                            {movimiento.establecimiento.nombre}
                          </div>
                          <div className="text-xs text-gray-500">
                            {movimiento.establecimiento.codigo}
                          </div>
                          {selectedCentroAcopio === 'todos' && (
                            <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium ${colores.bg} ${colores.text} border ${colores.border}`}>
                              {centro !== 'DEFAULT' ? centro : 'Regional'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Saldo Anterior */}
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-bold text-teal-700 tabular-nums">
                        {movimiento.saldoAnterior.toLocaleString()}
                      </span>
                    </td>

                    {/* Trans. Ingreso (Editable) */}
                    <td className="px-3 py-3 text-center">
                      {renderEditableInput(movimiento, 'transIngreso', movimiento.transIngreso)}
                    </td>

                    {/* Total Saldo (Calculado) */}
                    <td className="px-3 py-3 text-center bg-teal-50/30">
                      <span className="px-2 py-1 bg-teal-100 text-teal-800 text-sm font-bold rounded-lg tabular-nums">
                        {movimiento.totalSaldo.toLocaleString()}
                      </span>
                    </td>

                    {/* Salida (Editable) */}
                    <td className="px-3 py-3 text-center">
                      {renderEditableInput(movimiento, 'salida', movimiento.salida)}
                    </td>

                    {/* Trans. Salida (Editable) */}
                    <td className="px-3 py-3 text-center">
                      {renderEditableInput(movimiento, 'transSalida', movimiento.transSalida)}
                    </td>

                    {/* Saldo (Calculado) */}
                    <td className="px-3 py-3 text-center bg-emerald-50/30">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-lg tabular-nums">
                        {movimiento.saldo.toLocaleString()}
                      </span>
                    </td>

                    {/* Entrega (Editable con adicionales) */}
                    <td className="px-3 py-3">
                      {renderEntregaInput(movimiento)}
                    </td>

                    {/* Stock (Calculado) */}
                    <td className="px-3 py-3 text-center bg-cyan-50/30">
                      <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-sm font-bold rounded-lg tabular-nums">
                        {movimiento.stock.toLocaleString()}
                      </span>
                    </td>

                    {/* Promedio Consumo */}
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-700 tabular-nums">
                        {movimiento.promedioConsumo.toLocaleString()}
                      </span>
                    </td>

                    {/* Disponibilidad */}
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex flex-col items-center px-2 py-1 rounded-lg text-xs font-bold ${
                        movimiento.disponibilidad >= 2
                          ? 'bg-emerald-100 text-emerald-800'
                          : movimiento.disponibilidad >= 1
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        <span className="tabular-nums">{movimiento.disponibilidad.toFixed(1)}</span>
                        <span className="text-[10px] font-medium opacity-80">meses</span>
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onVerDetalle(movimiento)}
                          className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`}
                          title="Ver detalle"
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0 && (
                          <button
                            onClick={() => onGestionarEntregas(movimiento)}
                            className="p-2 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 focus:ring-amber-500 transition-all"
                            title="Gestionar entregas"
                            disabled={isLoading}
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
});

MovimientosTabla.displayName = 'MovimientosTabla';
