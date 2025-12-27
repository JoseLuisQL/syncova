import React, { memo } from 'react';
import { X, Building2, Syringe, TrendingUp, TrendingDown, Package, Calendar } from 'lucide-react';
import { COMPONENT_STYLES, COLORS, MESES } from '../constants';
import { MovimientoCalculado } from '../../../types';

interface MovimientoDetalleProps {
  movimiento: MovimientoCalculado & { tieneMovimiento: boolean };
  selectedMes: number;
  selectedAnio: number;
  onClose: () => void;
}

export const MovimientoDetalle: React.FC<MovimientoDetalleProps> = memo(({
  movimiento,
  selectedMes,
  selectedAnio,
  onClose,
}) => {
  const disponibilidadEstado = movimiento.disponibilidad >= 2 
    ? 'success' 
    : movimiento.disponibilidad >= 1 
    ? 'warning' 
    : 'danger';

  const estadoColors = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', value: 'text-emerald-800' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', value: 'text-amber-800' },
    danger: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', value: 'text-rose-800' },
  };

  return (
    <div className={COMPONENT_STYLES.modal.overlay} onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detalle del Movimiento</h3>
                <p className="text-sm text-gray-500">{MESES[selectedMes - 1]} {selectedAnio}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5">
          {/* Establecimiento y Vacuna */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${COLORS.primary.bg} border ${COLORS.primary.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className={`h-4 w-4 ${COLORS.primary.icon}`} />
                <span className={`text-xs font-medium ${COLORS.primary.text}`}>Establecimiento</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">
                {movimiento.establecimiento.nombre}
              </p>
              <p className="text-xs text-gray-500 mt-1">{movimiento.establecimiento.codigo}</p>
            </div>

            <div className={`p-4 rounded-xl ${COLORS.secondary.bg} border ${COLORS.secondary.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <Syringe className={`h-4 w-4 ${COLORS.secondary.icon}`} />
                <span className={`text-xs font-medium ${COLORS.secondary.text}`}>Vacuna</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">
                {movimiento.vacuna?.nombre}
              </p>
              <span className={`inline-flex mt-2 px-2 py-0.5 text-xs font-medium rounded-md ${
                movimiento.tieneMovimiento 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {movimiento.tieneMovimiento ? 'Registrado' : 'Sin registro'}
              </span>
            </div>
          </div>

          {/* Flujo de Stock */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              Flujo de Stock
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'S. Anterior', value: movimiento.saldoAnterior },
                { label: '+ Ingreso', value: movimiento.transIngreso },
                { label: '= Total', value: movimiento.totalSaldo },
                { label: 'Stock', value: movimiento.stock, highlight: true },
              ].map((item) => (
                <div 
                  key={item.label}
                  className={`p-3 rounded-xl text-center ${
                    item.highlight 
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white' 
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <p className={`text-xs ${item.highlight ? 'text-teal-100' : 'text-gray-500'}`}>
                    {item.label}
                  </p>
                  <p className={`text-lg font-bold ${item.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {item.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Salidas y Entregas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-rose-500" />
                Salidas
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Salida</span>
                  <span className="font-semibold text-gray-900">{movimiento.salida.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Trans. Salida</span>
                  <span className="font-semibold text-gray-900">{movimiento.transSalida.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-cyan-50 rounded-lg border border-cyan-100">
                  <span className="text-sm text-cyan-700 font-medium">Saldo</span>
                  <span className="font-bold text-cyan-800">{movimiento.saldo.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-500" />
                Entregas
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-sm text-emerald-700 font-medium">Base</span>
                  <span className="font-bold text-emerald-800">{movimiento.entrega.toLocaleString()}</span>
                </div>
                {movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0 && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-amber-700 font-medium">Adicionales</span>
                      <span className="font-bold text-amber-800">
                        {movimiento.entregasAdicionales.reduce((sum, e) => sum + e.cantidad, 0).toLocaleString()}
                      </span>
                    </div>
                    {movimiento.entregasAdicionales.length > 1 && (
                      <p className="text-xs text-amber-600 mt-1">
                        {movimiento.entregasAdicionales.length} entregas
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500">Promedio Consumo</p>
              <p className="text-xl font-bold text-gray-900">{movimiento.promedioConsumo.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-xl border ${estadoColors[disponibilidadEstado].bg} ${estadoColors[disponibilidadEstado].border}`}>
              <p className={`text-xs ${estadoColors[disponibilidadEstado].text}`}>Disponibilidad</p>
              <p className={`text-xl font-bold ${estadoColors[disponibilidadEstado].value}`}>
                {movimiento.disponibilidad.toFixed(1)} <span className="text-sm font-medium">meses</span>
              </p>
            </div>
          </div>

          {/* Observaciones */}
          {movimiento.observaciones && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Observaciones</p>
              <p className="text-sm text-gray-700">{movimiento.observaciones}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className={`w-full ${COMPONENT_STYLES.button.secondary}`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
});

MovimientoDetalle.displayName = 'MovimientoDetalle';
