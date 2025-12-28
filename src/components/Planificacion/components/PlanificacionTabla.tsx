import React, { memo } from 'react';
import { Building2, Calculator, BarChart3, Loader2, Package } from 'lucide-react';
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
  establecimientos: EstablecimientoData[];
  selectedCentroAcopio: string;
  isLoading: boolean;
  isUpdating: boolean;
  // Funciones de edición
  getCurrentValue: (estIndex: number, mesIndex: number, originalValue: number) => number;
  hasPendingChange: (estIndex: number, mesIndex: number) => boolean;
  onTempValueChange: (estIndex: number, mesIndex: number, newValue: number) => void;
  onFieldBlur: (estIndex: number, mesIndex: number) => void;
  // Totales
  calcularTotalMes: (mesIndex: number) => number;
  calcularTotalGeneral: () => number;
}

export const PlanificacionTabla: React.FC<PlanificacionTablaProps> = memo(({
  establecimientos,
  selectedCentroAcopio,
  isLoading,
  isUpdating,
  getCurrentValue,
  hasPendingChange,
  onTempValueChange,
  onFieldBlur,
  calcularTotalMes,
  calcularTotalGeneral,
}) => {
  const isDisabled = isUpdating || isLoading;

  if (!establecimientos || establecimientos.length === 0) {
    return (
      <div className={COMPONENT_STYLES.section.container}>
        <div className="p-12 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span className="text-gray-600">Cargando programación...</span>
            </div>
          ) : (
            <div>
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-600">No hay datos para mostrar</p>
              <p className="text-sm text-gray-500 mt-1">Seleccione una vacuna para ver la programación</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className={COMPONENT_STYLES.section.container} aria-label="Tabla de Planificación">
      <div className="relative overflow-hidden rounded-lg border border-gray-200">
        {/* Cabecera fija */}
        <div className="planning-sticky-header">
          <div className="overflow-x-auto">
            <table className="planning-professional-table-layout" role="table" aria-label="Cabecera de Programación">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="planning-col-establecimiento px-6 py-4 text-left text-sm font-bold uppercase tracking-wider border-r border-gray-600">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Establecimiento
                    </div>
                  </th>
                  {MESES_CORTOS.map((mes, index) => (
                    <th key={index} className="planning-col-mes px-3 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-gray-600">
                      {mes}
                    </th>
                  ))}
                  <th className="planning-col-total px-6 py-4 text-center text-sm font-bold uppercase tracking-wider bg-gray-900">
                    <div className="flex items-center justify-center">
                      <Calculator className="h-4 w-4 mr-2" />
                      TOTAL
                    </div>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* Fila de totales fija */}
        <div className="planning-sticky-totals">
          <div className="overflow-x-auto">
            <table className="planning-professional-table-layout">
              <tbody>
                <tr className="planning-totals-row bg-gradient-to-r from-emerald-100 to-green-100 font-bold border-b-2 border-emerald-300">
                  <td className="planning-col-establecimiento px-6 py-4 text-sm font-bold text-emerald-900 border-r border-emerald-200">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-emerald-700" />
                      TOTAL DISA
                    </div>
                  </td>
                  {MESES_CORTOS.map((_, mesIndex) => (
                    <td key={mesIndex} className="planning-col-mes px-3 py-4 text-center text-sm font-bold text-emerald-900 border-r border-emerald-200">
                      <div className="bg-white rounded-lg px-2 py-1 shadow-sm">
                        {calcularTotalMes(mesIndex).toLocaleString()}
                      </div>
                    </td>
                  ))}
                  <td className="planning-col-total px-6 py-4 text-center text-sm font-bold text-emerald-900 bg-gradient-to-r from-emerald-200 to-green-200">
                    <div className="bg-white rounded-lg px-3 py-2 shadow-md text-lg">
                      {calcularTotalGeneral().toLocaleString()}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="max-h-[calc(100vh-380px)] min-h-[400px] planning-scroll-container planning-scrollbar-thin">
          <table className="planning-professional-table-layout bg-white" role="table" aria-label="Datos de Programación">
            <tbody>
              {establecimientos.map((estData, estIndex) => {
                const estiloEstablecimiento = getEstiloEstablecimiento(estData.establecimiento);
                const { colores, icono, centro } = estiloEstablecimiento;

                return (
                  <tr 
                    key={estIndex} 
                    className={`${estIndex === 0 ? 'planning-first-establishment-row' : ''} ${colores.bg} hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200`}
                  >
                    <td className={`planning-col-establecimiento px-6 py-4 text-sm font-medium ${colores.text} border-r border-gray-100`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${colores.bg} ${colores.border} border`}>
                          <span className="text-lg">{icono}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {estData.establecimiento.nombre}
                          </div>
                          {selectedCentroAcopio === 'todos' && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colores.bg} ${colores.text} border ${colores.border}`}>
                                {centro !== 'DEFAULT' ? centro : 'Regional'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {estData.distribucionMensual.map((valor, mesIndex) => {
                      const currentValue = getCurrentValue(estIndex, mesIndex, valor);
                      const isPending = hasPendingChange(estIndex, mesIndex);
                      const styles = INPUT_FIELD_STYLES.programacion;

                      return (
                        <td key={mesIndex} className="planning-col-mes px-3 py-4 text-center border-r border-gray-100 relative">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={currentValue}
                              onChange={(e) => onTempValueChange(estIndex, mesIndex, parseInt(e.target.value) || 0)}
                              onBlur={() => onFieldBlur(estIndex, mesIndex)}
                              disabled={isDisabled}
                              className={`planning-enhanced-input w-16 px-2 py-2 text-center text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                                isPending
                                  ? styles.pending
                                  : 'border-gray-300 hover:border-teal-400'
                              }`}
                              title={isPending ? 'Cambios pendientes - Se guardará automáticamente' : ''}
                            />
                            {isPending && (
                              <div 
                                className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-sm"
                                title="Cambios pendientes"
                              >
                                <div className="w-full h-full bg-amber-400 rounded-full animate-ping"></div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="planning-col-total px-6 py-4 text-center text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-50 border-l-2 border-gray-300">
                      <div className="bg-white rounded-lg px-3 py-2 shadow-sm font-bold text-gray-900">
                        {estData.total.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
});

PlanificacionTabla.displayName = 'PlanificacionTabla';
