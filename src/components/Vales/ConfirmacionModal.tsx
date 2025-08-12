import React from 'react';
import { RotateCcw, XCircle, X } from 'lucide-react';

interface ConfirmacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tipo: 'revertir' | 'eliminar';
  valeNumero: string;
  isProcessing?: boolean;
}

const ConfirmacionModal: React.FC<ConfirmacionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tipo,
  valeNumero,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  // Configuración simple según el tipo
  const isRevertir = tipo === 'revertir';

  const title = isRevertir ? 'Cambiar Estado a Pendiente' : 'Eliminar Vale de Entrega';
  const bgColor = isRevertir ? 'bg-amber-50' : 'bg-red-50';
  const borderColor = isRevertir ? 'border-amber-200' : 'border-red-200';
  const buttonColor = isRevertir ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : 'bg-red-600 hover:bg-red-700';
  const iconColor = isRevertir ? 'text-amber-600' : 'text-red-600';

  const actions = isRevertir
    ? [
        '🔄 Cambiará el estado del vale a "Pendiente"',
        '📦 Restaurará automáticamente los stocks de vacunas y jeringas',
        '✏️ Permitirá realizar modificaciones al vale',
        '🔄 Posibilitará regenerar el vale con nuevos datos'
      ]
    : [
        '🗑️ Eliminará permanentemente el vale del sistema',
        '📦 Restaurará automáticamente los stocks afectados',
        '⚠️ Esta acción no se puede deshacer'
      ];

  const warning = isRevertir
    ? '💡 Esta operación es segura y reversible. El vale volverá a estado "Pendiente" y podrá ser modificado o regenerado según sea necesario.'
    : '⚠️ ATENCIÓN: Esta acción es irreversible. El vale será eliminado permanentemente del sistema.';

  const confirmText = isRevertir ? 'Sí, Cambiar a Pendiente' : 'Sí, Eliminar Vale';
  const processingText = isRevertir ? 'Cambiando estado...' : 'Eliminando...';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor} ${bgColor}`}>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-12 h-12 ${bgColor} rounded-lg border ${borderColor}`}>
              {isRevertir ? (
                <RotateCcw className={`h-8 w-8 ${iconColor}`} />
              ) : (
                <XCircle className={`h-8 w-8 ${iconColor}`} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">Vale: {valeNumero}</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-6 text-lg">
              {isRevertir
                ? `¿Desea cambiar el estado del vale ${valeNumero} a "Pendiente"?`
                : `¿Está seguro de eliminar permanentemente el vale ${valeNumero}?`
              }
            </p>

            <div className="space-y-3 mb-6">
              <p className="text-base font-semibold text-gray-900">
                {isRevertir ? '🔄 Efectos de cambiar a estado Pendiente:' : '⚠️ Consecuencias de la eliminación:'}
              </p>
              <ul className="space-y-2">
                {actions.map((action, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <div className={`h-2 w-2 ${isRevertir ? 'bg-amber-500' : 'bg-red-500'} rounded-full mr-3 mt-2 flex-shrink-0`}></div>
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-3 ${bgColor} border ${borderColor} rounded-lg`}>
              <div className="flex items-start">
                <div className={`h-5 w-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`}>⚠️</div>
                <p className={`text-sm ${isRevertir ? 'text-yellow-800' : 'text-red-800'}`}>
                  {warning}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${buttonColor}`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{processingText}</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionModal;
