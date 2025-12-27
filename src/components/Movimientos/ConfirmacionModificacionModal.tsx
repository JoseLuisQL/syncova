import React from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { COMPONENT_STYLES, COLORS } from './constants';

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

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${COLORS.warning.bg} ${COLORS.warning.border} border`}>
                <AlertTriangle className={`h-5 w-5 ${COLORS.warning.icon}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar modificación
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {valesAfectados.length} vale(s) serán actualizados
                </p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Resumen del cambio */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Establecimiento</span>
              <span className="font-medium text-gray-900 text-right max-w-[200px] truncate">
                {establecimientoNombre}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Vacuna</span>
              <span className="font-medium text-gray-900">{vacunaNombre}</span>
            </div>
            
            {/* Cambio visual */}
            <div className={`flex items-center justify-center gap-3 py-4 px-4 rounded-xl ${COLORS.neutral.bg} border ${COLORS.neutral.border}`}>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Actual</p>
                <p className="text-xl font-bold text-gray-700">{cantidadOriginal.toLocaleString()}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Nuevo</p>
                <p className={`text-xl font-bold ${esIncremento ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {cantidadNueva.toLocaleString()}
                </p>
              </div>
              <div className={`ml-2 px-2.5 py-1 rounded-lg text-sm font-medium ${
                esIncremento 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {esIncremento ? '+' : ''}{diferencia.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className={`flex gap-3 p-3 rounded-xl ${COLORS.warning.bg} border ${COLORS.warning.border}`}>
            <AlertTriangle className={`h-4 w-4 ${COLORS.warning.icon} flex-shrink-0 mt-0.5`} />
            <p className={`text-sm ${COLORS.warning.text}`}>
              Los vales, kardex y stocks se actualizarán automáticamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className={`flex-1 ${COMPONENT_STYLES.button.secondary}`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 ${COMPONENT_STYLES.button.primary}`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </div>
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModificacionModal;
