import React, { memo } from 'react';
import { Check, ArrowCounterClockwise, Faders, X } from '@phosphor-icons/react';
import Portal from '../../common/Portal';
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
    <Portal>
      <div className={COMPONENT_STYLES.modal.overlay} onClick={onClose}>
        <div className={COMPONENT_STYLES.modal.container} onClick={(event) => event.stopPropagation()}>
          <div className={`${COMPONENT_STYLES.modal.panel} max-w-2xl overflow-hidden`}>
            <div className={COMPONENT_STYLES.modal.header}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-900 text-white shadow-sm">
                    <Faders className="h-6 w-6" weight="duotone" />
                  </div>
                  <div>
                    <h2 className="text-[1.05rem] font-black tracking-tight text-zinc-900">Configuración de Columnas</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
                  aria-label="Cerrar modal de columnas"
                >
                  <X className="h-4 w-4" weight="bold" />
                </button>
              </div>
            </div>

            <div className={COMPONENT_STYLES.modal.body}>
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 shadow-sm">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-500">Visibilidad global</p>
                  <p className="mt-1 text-[0.95rem] font-black tracking-tight text-zinc-900">
                    {visibleCount} de {columnasConfigurablesPermitidas.length} columnas activas
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {columnasConfigurablesPermitidas.map((column) => {
                  const active = visibleColumns[column.key];

                  return (
                    <button
                      key={column.key}
                      type="button"
                      onClick={() => onToggleColumn(column.key)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-zinc-900 bg-zinc-900 shadow-md'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div>
                        <p className={`text-[0.85rem] font-black tracking-tight ${active ? 'text-white' : 'text-zinc-900'}`}>
                          {column.label}
                        </p>
                        <p className={`mt-0.5 text-[0.65rem] font-semibold uppercase tracking-widest ${active ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {active ? 'Visible en tabla' : 'Oculta'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          active
                            ? 'border-white bg-white text-zinc-900'
                            : 'border-zinc-200 bg-transparent text-transparent'
                        }`}
                      >
                        <Check className="h-4 w-4" weight="bold" />
                      </span>
                    </button>
                  );
                })}
              </div>


            </div>

            <div className={`${COMPONENT_STYLES.modal.footer} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-100 bg-zinc-50/50`}>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onSelectAll} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900">
                  <Check className="h-4 w-4" weight="bold" />
                  <span>Activar todas</span>
                </button>
                <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900">
                  <ArrowCounterClockwise className="h-4 w-4" weight="bold" />
                  <span>Formato origen</span>
                </button>
              </div>
              <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-zinc-800">
                Aprobar Vista
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
});

MovimientosColumnSettingsModal.displayName = 'MovimientosColumnSettingsModal';
