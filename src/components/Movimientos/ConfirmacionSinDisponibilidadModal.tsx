import React from 'react';
import { X, AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { COMPONENT_STYLES, COLORS } from './constants';

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
    if (!isProcessing) onConfirm();
  };

  const handleClose = () => {
    if (!isProcessing) onClose();
  };

  return (
    <div className={COMPONENT_STYLES.modal.overlay} onClick={handleClose}>
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${COLORS.warning.bg} ${COLORS.warning.border} border`}>
                <AlertCircle className={`h-5 w-5 ${COLORS.warning.icon}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sin disponibilidad programada
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Se registrará en el mes actual
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Mensaje principal */}
          <div className={`p-4 rounded-xl ${COLORS.warning.bg} border ${COLORS.warning.border}`}>
            <p className={`text-sm ${COLORS.warning.text}`}>
              <span className="font-medium">{establecimientoNombre}</span> no tiene entregas 
              programadas disponibles para {anio}.
            </p>
          </div>

          {/* Detalles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Vacuna</span>
              <span className="font-medium text-gray-900">{vacunaNombre}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tipo</span>
              <span className={`font-medium px-2 py-0.5 rounded-md text-xs ${
                tipoEntrega === 'base' 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {tipoEntrega === 'base' ? 'Entrega Base' : 'Adicional'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Cantidad</span>
              <span className="font-semibold text-gray-900 text-lg">
                {cantidad.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Período</span>
              <span className="font-medium text-gray-900 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {mesActual} {anio}
              </span>
            </div>
          </div>

          {/* Qué sucederá */}
          <div className={`p-4 rounded-xl ${COLORS.success.bg} border ${COLORS.success.border}`}>
            <div className="flex items-start gap-2.5">
              <CheckCircle className={`h-4 w-4 ${COLORS.success.icon} flex-shrink-0 mt-0.5`} />
              <p className={`text-sm ${COLORS.success.text}`}>
                Se registrará la entrega y se actualizará automáticamente la planificación.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className={`flex-1 ${COMPONENT_STYLES.button.secondary}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex-1 ${COMPONENT_STYLES.button.success}`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Confirmar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionSinDisponibilidadModal;
