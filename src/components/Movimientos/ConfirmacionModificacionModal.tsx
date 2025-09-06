import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmacionModificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  establecimientoNombre: string;
  vacunaNombre: string;
  cantidadOriginal: number;
  cantidadNueva: number;
  valesAfectados: Array<{
    numero: string;
    fechaGeneracion: Date;
  }>;
  isProcessing?: boolean;
}

const ConfirmacionModificacionModal: React.FC<ConfirmacionModificacionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  establecimientoNombre,
  vacunaNombre,
  cantidadOriginal,
  cantidadNueva,
  valesAfectados,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  const diferencia = cantidadNueva - cantidadOriginal;
  const esIncremento = diferencia > 0;
  const cambioTexto = esIncremento ? 'incremento' : 'reducción';
  const cambioIcono = esIncremento ? '📈' : '📉';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-200 bg-amber-50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg border border-amber-200">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmación de Modificación de Entrega
              </h3>
              <p className="text-sm text-amber-700">
                Esta modificación afectará vales ya generados
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-amber-600" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Información del cambio */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Detalles de la Modificación</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Establecimiento:</span>
                  <span className="font-medium text-blue-900">{establecimientoNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Vacuna:</span>
                  <span className="font-medium text-blue-900">{vacunaNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Cantidad Original:</span>
                  <span className="font-medium text-blue-900">{cantidadOriginal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Cantidad Nueva:</span>
                  <span className="font-medium text-blue-900">{cantidadNueva.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-700">Cambio:</span>
                  <span className={`font-bold ${esIncremento ? 'text-green-600' : 'text-red-600'}`}>
                    {cambioIcono} {esIncremento ? '+' : ''}{diferencia.toLocaleString()} ({cambioTexto})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Advertencia sobre vales afectados */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-amber-900 mb-3">⚠️ Sistemas que serán afectados:</h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span><strong>Vales ya generados:</strong> {valesAfectados.length} vale(s) serán actualizados automáticamente</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span><strong>Movimientos de Kardex:</strong> Se registrarán los ajustes correspondientes</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span><strong>Lotes de vacunas:</strong> Los stocks serán ajustados automáticamente</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span><strong>Lotes de jeringas:</strong> Las cantidades serán recalculadas</span>
              </li>
            </ul>
          </div>

          {/* Lista de vales afectados */}
          {valesAfectados.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">📄 Vales que serán actualizados:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {valesAfectados.map((vale, index) => (
                  <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                    <span className="font-medium text-gray-900">{vale.numero}</span>
                    <span className="text-gray-600">
                      {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje de confirmación */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-center font-medium">
              ¿Está seguro de que desea continuar con esta modificación?
            </p>
            <p className="text-red-600 text-center text-sm mt-2">
              Esta acción actualizará automáticamente todos los sistemas relacionados.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Procesando...' : 'Cancelar'}
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Sí, Continuar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModificacionModal;
