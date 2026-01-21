import React from 'react';
import { AlertTriangle, X, Loader2, Package, FileText, Syringe } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface ConfirmacionValeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  establecimientoNombre: string;
  vacunaNombre: string;
  mesNombre: string;
  anio: number;
  valorOriginal: number;
  valorNuevo: number;
  isProcessing?: boolean;
}

const ConfirmacionValeModal: React.FC<ConfirmacionValeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  establecimientoNombre,
  vacunaNombre,
  mesNombre,
  anio,
  valorOriginal,
  valorNuevo,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  const diferencia = valorNuevo - valorOriginal;

  return (
    <div className={COMPONENT_STYLES.modal.overlay}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Vale ya generado
                </h3>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Establecimiento y período */}
          <div className="text-center space-y-1">
            <p className="font-semibold text-gray-900">{establecimientoNombre}</p>
            <p className="text-sm text-gray-600">
              {mesNombre} {anio} - <span className="font-medium text-teal-700">{vacunaNombre}</span>
            </p>
          </div>

          {/* Cambio de valor */}
          <div className="flex items-center justify-center gap-4 py-3 px-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">Actual</p>
              <p className="text-xl font-bold text-gray-700">{valorOriginal.toLocaleString()}</p>
            </div>
            <div className="text-gray-400">→</div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Nuevo</p>
              <p className={`text-xl font-bold ${diferencia > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {valorNuevo.toLocaleString()}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-lg text-sm font-semibold ${
              diferencia > 0 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-rose-100 text-rose-700'
            }`}>
              {diferencia > 0 ? '+' : ''}{diferencia.toLocaleString()}
            </div>
          </div>

          {/* Mensaje de advertencia */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 mb-3">
              Este establecimiento ya tiene un <span className="font-semibold">vale generado</span> para este período.
              Si continúa, se reajustará:
            </p>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock de vacunas
              </li>
              <li className="flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                Stock de jeringas
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Kardex y vale generado
              </li>
            </ul>
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
            className={`flex-1 ${COMPONENT_STYLES.button.warning}`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              'Continuar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionValeModal;
