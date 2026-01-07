import React, { memo } from 'react';
import { X, Package, Plus, Trash2, Loader2 } from 'lucide-react';
import { COMPONENT_STYLES, INPUT_FIELD_STYLES } from '../constants';
import { MovimientoCalculado } from '../../../types';
import { ValeIndicator } from './ValeIndicator';

interface EntregasAdicionalesModalProps {
  movimiento: MovimientoCalculado & { tieneMovimiento: boolean };
  isProcessing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  tempEntregasValues: { [key: string]: number };
  pendingEntregasChanges: { [key: string]: boolean };
  getCurrentEntregaValue: (entregaId: string, originalValue: number) => number;
  hasPendingEntregaChange: (entregaId: string) => boolean;
  onClose: () => void;
  onAgregarEntrega: (establecimientoId: string) => void;
  onTempValueChange: (entregaId: string, value: number) => void;
  onBlur: (entregaId: string) => void;
  onEliminarEntrega: (entregaId: string) => void;
}

export const EntregasAdicionalesModal: React.FC<EntregasAdicionalesModalProps> = memo(({
  movimiento,
  isProcessing,
  isCreating,
  isUpdating,
  getCurrentEntregaValue,
  hasPendingEntregaChange,
  onClose,
  onAgregarEntrega,
  onTempValueChange,
  onBlur,
  onEliminarEntrega,
}) => {
  const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
  const entregaBase = tieneEntregasAdicionales
    ? (movimiento.entregaBase ?? 0)
    : movimiento.entrega;

  const totalAdicionales = movimiento.entregasAdicionales?.reduce((sum, e) => {
    return sum + getCurrentEntregaValue(e.id, e.cantidad);
  }, 0) || 0;

  return (
    <div className={COMPONENT_STYLES.modal.overlay} onClick={onClose}>
      <div 
        className={COMPONENT_STYLES.modal.containerLarge}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Gestionar Entregas Adicionales
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
          {/* Info Establecimiento */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{movimiento.establecimiento.nombre}</p>
                <p className="text-sm text-gray-600">{movimiento.establecimiento.codigo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Entrega Base</p>
                <p className="text-xl font-bold text-emerald-600">
                  {entregaBase.toLocaleString()} unidades
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Entregas Adicionales */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Entregas Adicionales</h4>
              <button
                onClick={() => onAgregarEntrega(movimiento.establecimientoId)}
                className={COMPONENT_STYLES.button.primary}
                disabled={isCreating || isUpdating || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{isProcessing ? 'Procesando...' : 'Agregar Entrega'}</span>
              </button>
            </div>

            {movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0 ? (
              <div className="space-y-3">
                {movimiento.entregasAdicionales.map((entrega) => (
                  <div 
                    key={entrega.id}
                    className={`rounded-xl p-4 transition-all duration-300 ${
                      entrega.tieneValeGenerado 
                        ? 'bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border-2 border-emerald-300 shadow-sm' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2.5 shadow-sm ${
                          entrega.tieneValeGenerado 
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500' 
                            : 'bg-amber-100'
                        }`}>
                          <Package className={`h-5 w-5 ${
                            entrega.tieneValeGenerado 
                              ? 'text-white' 
                              : 'text-amber-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              Entrega #{entrega.numeroEntrega}
                            </p>
                            <ValeIndicator 
                              tieneVale={entrega.tieneValeGenerado || false} 
                              valeNumero={entrega.valeNumero}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(entrega.fechaEntrega).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {entrega.motivo && (
                            <p className="text-sm text-gray-500 mt-1">{entrega.motivo}</p>
                          )}
                          {entrega.tieneValeGenerado && entrega.valeNumero && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                              Vale: {entrega.valeNumero}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right relative">
                          <label className={`block text-sm mb-1 font-medium ${
                            entrega.tieneValeGenerado ? 'text-emerald-700' : 'text-gray-600'
                          }`}>Cantidad</label>
                          <input
                            type="number"
                            min="0"
                            value={getCurrentEntregaValue(entrega.id, entrega.cantidad)}
                            onChange={(e) => onTempValueChange(entrega.id, parseInt(e.target.value) || 0)}
                            onBlur={() => onBlur(entrega.id)}
                            className={`w-24 px-3 py-2 text-center text-sm font-semibold border-2 rounded-xl 
                                       focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed 
                                       transition-all duration-200 ${
                              entrega.tieneValeGenerado
                                ? 'border-emerald-400 bg-white focus:ring-emerald-300 focus:border-emerald-500'
                                : hasPendingEntregaChange(entrega.id)
                                  ? INPUT_FIELD_STYLES.entregaAdicional.pending
                                  : `${INPUT_FIELD_STYLES.entregaAdicional.normal} ${INPUT_FIELD_STYLES.entregaAdicional.focus}`
                            }`}
                            disabled={isCreating || isUpdating || isProcessing}
                          />
                          {hasPendingEntregaChange(entrega.id) && !entrega.tieneValeGenerado && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                          )}
                        </div>

                        <button
                          onClick={() => onEliminarEntrega(entrega.id)}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            entrega.tieneValeGenerado
                              ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100'
                              : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                          disabled={isCreating || isUpdating || isProcessing}
                          title="Eliminar entrega adicional"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay entregas adicionales</p>
                <p className="text-sm text-gray-400">
                  Haga clic en "Agregar Entrega" para crear una nueva
                </p>
              </div>
            )}
          </div>

          {/* Resumen Total */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <h5 className="font-semibold text-teal-900 mb-3">Resumen Total</h5>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-teal-600">Entrega Base</p>
                <p className="text-xl font-bold text-teal-800">
                  {entregaBase.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-teal-600">Adicionales</p>
                <p className="text-xl font-bold text-teal-800">
                  {totalAdicionales.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-teal-600">Total General</p>
                <p className="text-xl font-bold text-teal-800">
                  {movimiento.entrega.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
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

EntregasAdicionalesModal.displayName = 'EntregasAdicionalesModal';
