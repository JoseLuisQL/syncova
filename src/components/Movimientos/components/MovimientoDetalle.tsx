import React, { memo } from 'react';
import { X, Package } from 'lucide-react';
import { COMPONENT_STYLES, MESES } from '../constants';
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
  return (
    <div className={COMPONENT_STYLES.modal.overlay} onClick={onClose}>
      <div 
        className={COMPONENT_STYLES.modal.container}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-2 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Detalle del Movimiento
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={COMPONENT_STYLES.modal.body}>
          {/* Info del Establecimiento y Vacuna */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full" />
                Establecimiento
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Nombre:</span>
                  <p className="font-medium text-gray-900">{movimiento.establecimiento.nombre}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Código:</span>
                  <p className="font-medium text-gray-900">{movimiento.establecimiento.codigo}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Tipo:</span>
                  <p className="font-medium text-gray-900 capitalize">
                    {movimiento.establecimiento.tipo.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                Información de la Vacuna
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Vacuna:</span>
                  <p className="font-medium text-gray-900">{movimiento.vacuna?.nombre}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Período:</span>
                  <p className="font-medium text-gray-900">
                    {MESES[selectedMes - 1]} {selectedAnio}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Estado:</span>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ml-2 ${
                    movimiento.tieneMovimiento 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {movimiento.tieneMovimiento ? 'Con movimiento' : 'Sin movimiento'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del Movimiento */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Datos del Movimiento
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Saldo Anterior', value: movimiento.saldoAnterior, color: 'teal' },
                { label: 'Trans. Ingreso', value: movimiento.transIngreso, color: 'cyan' },
                { label: 'Total Saldo', value: movimiento.totalSaldo, color: 'teal' },
                { label: 'Salida', value: movimiento.salida, color: 'amber' },
                { label: 'Trans. Salida', value: movimiento.transSalida, color: 'cyan' },
                { label: 'Saldo', value: movimiento.saldo, color: 'emerald' },
                { label: 'Entrega', value: movimiento.entrega, color: 'teal' },
                { label: 'Stock', value: movimiento.stock, color: 'cyan' },
              ].map((item) => (
                <div 
                  key={item.label}
                  className={`bg-${item.color}-50 rounded-xl p-3 border border-${item.color}-200`}
                >
                  <div className={`text-sm text-${item.color}-600 font-medium`}>{item.label}</div>
                  <div className={`text-lg font-bold text-${item.color}-800`}>
                    {item.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <div className="text-sm text-amber-600 font-medium">Promedio Consumo</div>
              <div className="text-lg font-bold text-amber-800">
                {movimiento.promedioConsumo.toLocaleString()}
              </div>
            </div>
            <div className={`rounded-xl p-3 border ${
              movimiento.disponibilidad >= 2
                ? 'bg-emerald-50 border-emerald-200'
                : movimiento.disponibilidad >= 1
                ? 'bg-amber-50 border-amber-200'
                : 'bg-rose-50 border-rose-200'
            }`}>
              <div className={`text-sm font-medium ${
                movimiento.disponibilidad >= 2
                  ? 'text-emerald-600'
                  : movimiento.disponibilidad >= 1
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}>Disponibilidad</div>
              <div className={`text-lg font-bold ${
                movimiento.disponibilidad >= 2
                  ? 'text-emerald-800'
                  : movimiento.disponibilidad >= 1
                  ? 'text-amber-800'
                  : 'text-rose-800'
              }`}>
                {movimiento.disponibilidad.toFixed(1)} meses
              </div>
            </div>
          </div>

          {/* Entregas Adicionales */}
          {movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                Entregas Adicionales
              </h4>
              <div className="space-y-2">
                {movimiento.entregasAdicionales.map((entrega) => (
                  <div 
                    key={entrega.id} 
                    className="flex items-center justify-between bg-amber-50 rounded-xl p-3 border border-amber-200"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">
                        Entrega #{entrega.numeroEntrega}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {new Date(entrega.fechaEntrega).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-amber-800">
                      {entrega.cantidad.toLocaleString()} unidades
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {movimiento.observaciones && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Observaciones</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700">{movimiento.observaciones}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={COMPONENT_STYLES.modal.footer}>
          <button
            onClick={onClose}
            className={COMPONENT_STYLES.button.secondary}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
});

MovimientoDetalle.displayName = 'MovimientoDetalle';
