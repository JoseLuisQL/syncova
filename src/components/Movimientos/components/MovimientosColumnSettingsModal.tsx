import React, { memo } from 'react';
import { Check, ArrowCounterClockwise, Faders } from '@phosphor-icons/react';
import { Modal } from '../../ui/ModalElements';
import {
  COLUMNAS_CONFIGURABLES,
  COMPONENT_STYLES,
  type ColumnaConfigurableKey,
  type VisibleColumnsState,
} from '../constants';
import { useAuth } from '../../../contexts/AuthContext';

interface MovimientosColumnSettingsModalProps {
  isOpen: boolean;
  visibleColumns: VisibleColumnsState;
  onClose: () => void;
  onToggleColumn: (column: ColumnaConfigurableKey) => void;
  onSelectAll: () => void;
  onReset: () => void;
}

export const MovimientosColumnSettingsModal: React.FC<MovimientosColumnSettingsModalProps> = memo(({
  isOpen,
  visibleColumns,
  onClose,
  onToggleColumn,
  onSelectAll,
  onReset,
}) => {
  const { user } = useAuth();
  const isResponsable = user?.rol === 'responsable_acopio';

  if (!isOpen) return null;

  const columnasConfigurablesPermitidas = COLUMNAS_CONFIGURABLES.filter(
    (c) => !(isResponsable && c.key === 'ici')
  );

  const visibleCount = columnasConfigurablesPermitidas.filter(
    (c) => visibleColumns[c.key]
  ).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de columnas"
      subtitle={`${visibleCount} de ${columnasConfigurablesPermitidas.length} columnas visibles en la tabla`}
      icon={Faders}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              className={COMPONENT_STYLES.button.secondary}
            >
              <Check className="h-4 w-4" weight="bold" />
              <span>Activar todas</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className={COMPONENT_STYLES.button.ghost}
            >
              <ArrowCounterClockwise className="h-4 w-4" weight="bold" />
              <span>Restaurar por defecto</span>
            </button>
          </div>
          <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.primary}>
            Aplicar vista
          </button>
        </div>
      }
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {columnasConfigurablesPermitidas.map((column) => {
          const active = visibleColumns[column.key];

          return (
            <button
              key={column.key}
              type="button"
              onClick={() => onToggleColumn(column.key)}
              className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                active
                  ? 'border-brand-100 bg-surface-soft'
                  : 'border-line bg-surface hover:border-line-strong hover:bg-surface-soft'
              }`}
            >
              <div>
                <p className={`text-[0.8125rem] font-semibold tracking-tight ${active ? 'text-brand' : 'text-ink'}`}>
                  {column.label}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-muted-2">
                  {active ? 'Visible en tabla' : 'Oculta'}
                </p>
              </div>
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  active
                    ? 'border-brand bg-brand text-white'
                    : 'border-line-strong bg-surface text-transparent'
                }`}
              >
                <Check className="h-3.5 w-3.5" weight="bold" />
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
});

MovimientosColumnSettingsModal.displayName = 'MovimientosColumnSettingsModal';

