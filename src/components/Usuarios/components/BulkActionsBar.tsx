import React, { memo } from 'react';
import { UserCheck, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface BulkActionsBarProps {
  selectedCount: number;
  onActivar: () => void;
  onDesactivar: () => void;
  onEliminar: () => void;
  onClearSelection: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = memo(({
  selectedCount,
  onActivar,
  onDesactivar,
  onEliminar,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className={COMPONENT_STYLES.bulkActions.container}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-600">
            <UserCheck className="h-4 w-4 text-white" />
          </div>
          <span className={COMPONENT_STYLES.bulkActions.text}>
            {selectedCount} usuario{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClearSelection}
            className="text-teal-600 hover:text-teal-800 text-sm font-medium underline"
          >
            Limpiar selección
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onActivar}
            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconShield} flex items-center gap-1 px-3`}
            title="Activar seleccionados"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Activar</span>
          </button>
          <button
            onClick={onDesactivar}
            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconKey} flex items-center gap-1 px-3`}
            title="Desactivar seleccionados"
          >
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Desactivar</span>
          </button>
          <button
            onClick={onEliminar}
            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete} flex items-center gap-1 px-3`}
            title="Eliminar seleccionados"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
});

BulkActionsBar.displayName = 'BulkActionsBar';

export default BulkActionsBar;
