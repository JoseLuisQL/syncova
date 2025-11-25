import React from 'react';
import { X, AlertTriangle, Calendar, Package, CheckCircle } from 'lucide-react';

interface ConfirmacionSinDisponibilidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  establecimientoNombre: string;
  vacunaNombre: string;
  cantidad: number;
  mesActual: string;
  anio: number;
  isProcessing?: boolean;
  tipoEntrega: 'base' | 'adicional';
}

/**
 * Modal profesional para confirmar el registro de entregas cuando
 * no hay disponibilidad en los próximos meses de la planificación
 */
const ConfirmacionSinDisponibilidadModal: React.FC<ConfirmacionSinDisponibilidadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  establecimientoNombre,
  vacunaNombre,
  cantidad,
  mesActual,
  anio,
  isProcessing = false,
  tipoEntrega
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isProcessing) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay con animación */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fade-in"
        onClick={handleClose}
      >
        {/* Modal Container con animación de entrada */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Profesional con Gradiente */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Sin Disponibilidad Programada
                  </h2>
                  <p className="text-orange-100 mt-1">
                    Confirmación Especial Requerida
                  </p>
                </div>
              </div>
              {!isProcessing && (
                <button
                  onClick={handleClose}
                  className="text-white hover:text-orange-100 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  title="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Mensaje Principal */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 text-lg mb-2">
                    Ya no hay entregas disponibles para este año
                  </h3>
                  <p className="text-orange-800 leading-relaxed">
                    <strong>{establecimientoNombre}</strong> ya no tiene entregas programadas en los 
                    próximos meses de <strong>{anio}</strong>. Todas las entregas planificadas ya fueron 
                    asignadas en su totalidad.
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles de la Operación */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-blue-900 flex items-center space-x-2 mb-3">
                <Package className="w-5 h-5" />
                <span>Detalles de la Operación</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Establecimiento</p>
                  <p className="text-blue-900 font-semibold">{establecimientoNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Vacuna</p>
                  <p className="text-blue-900 font-semibold">{vacunaNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Cantidad a Registrar</p>
                  <p className="text-blue-900 font-semibold text-xl">{cantidad.toLocaleString()} unidades</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Tipo de Entrega</p>
                  <p className="text-blue-900 font-semibold">
                    {tipoEntrega === 'base' ? 'Entrega Base' : 'Entrega Adicional'}
                  </p>
                </div>
              </div>
            </div>

            {/* Acción que se realizará */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h4 className="font-semibold text-green-900 flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span>Si confirma, se realizará lo siguiente:</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-green-900 font-medium">Registro en Mes Actual</p>
                    <p className="text-green-700 text-sm mt-1">
                      Se registrarán <strong>{cantidad.toLocaleString()} unidades</strong> en el mes de <strong>{mesActual} {anio}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-green-900 font-medium">Actualización de Planificación</p>
                    <p className="text-green-700 text-sm mt-1">
                      La planificación anual se actualizará automáticamente sumando esta cantidad al mes actual
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-green-900 font-medium">Sincronización Automática</p>
                    <p className="text-green-700 text-sm mt-1">
                      Los movimientos de vacuna se sincronizarán automáticamente con la nueva programación
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota Importante */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Nota:</span> Esta es una función especial para casos 
                excepcionales donde ya no hay disponibilidad programada. La cantidad se registrará y 
                reflejará inmediatamente en el sistema sin necesidad de recargar la página.
              </p>
            </div>
          </div>

          {/* Footer con Botones */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirmar y Registrar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos de Animación */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ConfirmacionSinDisponibilidadModal;
