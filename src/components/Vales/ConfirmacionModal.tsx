import React, { memo } from 'react';
import { RotateCcw, X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  valeNumero: string;
  isProcessing?: boolean;
}

// Configuración para revertir
const CONFIG = {
  title: 'Cambiar Estado a Pendiente',
  question: (vale: string) => `¿Desea cambiar el estado del vale "${vale}" a Pendiente?`,
  subtitle: 'Efectos de cambiar a estado Pendiente:',
  actions: [
    { icon: '🔄', text: 'Cambiará el estado del vale a "Pendiente"' },
    { icon: '📦', text: 'Restaurará automáticamente los stocks de vacunas y jeringas' },
    { icon: '✏️', text: 'Permitirá realizar modificaciones al vale' },
    { icon: '🔄', text: 'Posibilitará regenerar el vale con nuevos datos' }
  ],
  warning: 'Esta operación es segura y reversible. El vale volverá a estado "Pendiente" y podrá ser modificado.',
  confirmText: 'Sí, Cambiar a Pendiente',
  processingText: 'Cambiando estado...'
};

// Componente de acción individual
const ActionItem = memo<{
  icon: string;
  text: string;
}>(({ icon, text }) => (
  <li className="flex items-start gap-3">
    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
    <span className="text-sm text-gray-700 leading-relaxed">
      {icon} {text}
    </span>
  </li>
));

ActionItem.displayName = 'ActionItem';

const ConfirmacionModal: React.FC<ConfirmacionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  valeNumero,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
              <RotateCcw className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{CONFIG.title}</h3>
              <p className="text-sm text-gray-600">Vale: {valeNumero}</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </header>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Question */}
          <p className="text-gray-800 text-base font-medium">
            {CONFIG.question(valeNumero)}
          </p>

          {/* Actions list */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">{CONFIG.subtitle}</p>
            <ul className="space-y-2">
              {CONFIG.actions.map((action, index) => (
                <ActionItem
                  key={index}
                  icon={action.icon}
                  text={action.text}
                />
              ))}
            </ul>
          </div>

          {/* Warning */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-800 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                {CONFIG.warning}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{CONFIG.processingText}</span>
              </>
            ) : (
              <span>{CONFIG.confirmText}</span>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default memo(ConfirmacionModal);
