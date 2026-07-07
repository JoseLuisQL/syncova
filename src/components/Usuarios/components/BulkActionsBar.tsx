import React, { memo } from 'react';
import { UserCheck, Trash, CheckCircle, XCircle } from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

interface BulkActionsBarProps {
  selectedCount: number;
  onActivar: () => void;
  onDesactivar: () => void;
  onEliminar: () => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = memo(({
  selectedCount,
  onActivar,
  onDesactivar,
  onEliminar,
  onClearSelection,
  isProcessing = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="rounded-xl border border-[#e7e7ef] bg-[#fbfafd] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e7e7ef] bg-white text-[#606571]">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <p className={COMPONENT_STYLES.bulkActions.text}>
              {selectedCount} usuario{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-zinc-700/80">Aplica acciones masivas sin perder el contexto de la tabla.</p>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-zinc-600 hover:text-zinc-800 text-sm font-medium underline"
            disabled={isProcessing}
          >
            Limpiar selección
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onActivar}
            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconShield} flex items-center gap-1 px-3`}
            title="Activar seleccionados"
            disabled={isProcessing}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Activar</span>
          </button>
          <button
            type="button"
            onClick={onDesactivar}
            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconKey} flex items-center gap-1 px-3`}
            title="Desactivar seleccionados"
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Desactivar</span>
          </button>
          <button
            type="button"
            onClick={onEliminar}
            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete} flex items-center gap-1 px-3`}
            title="Eliminar seleccionados"
            disabled={isProcessing}
          >
            <Trash className="h-4 w-4" />
            <span className="text-sm">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
});

BulkActionsBar.displayName = 'BulkActionsBar';

export default BulkActionsBar;
   