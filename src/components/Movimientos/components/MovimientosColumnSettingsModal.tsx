import React, { memo } from 'react';
import { Check, RotateCcw, Settings2, X } from 'lucide-react';
import Portal from '../../common/Portal';
import {
  COLUMNAS_CONFIGURABLES,
  COMPONENT_STYLES,
  type ColumnaConfigurableKey,
  type VisibleColumnsState,
} from '../constants';

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
  if (!isOpen) return null;

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <Portal>
      <div className={COMPONENT_STYLES.modal.overlay} onClick={onClose}>
        <div className={COMPONENT_STYLES.modal.container} onClick={(event) => event.stopPropagation()}>
          <div className={`${COMPONENT_STYLES.modal.panel} max-w-2xl overflow-hidden`}>
            <div className={COMPONENT_STYLES.modal.header}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-sm">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Configurar columnas</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Muestra u oculta columnas de la tabla sin afectar cálculos, guardado ni stock.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Cerrar modal de columnas"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className={COMPONENT_STYLES.modal.body}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Visibilidad actual</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {visibleCount} de {COLUMNAS_CONFIGURABLES.length} columnas visibles
                  </p>
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                  Establecimiento siempre visible
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {COLUMNAS_CONFIGURABLES.map((column) => {
                  const active = visibleColumns[column.key];

                  return (
                    <button
                      key={column.key}
                      type="button"
                      onClick={() => onToggleColumn(column.key)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-teal-200 bg-teal-50/80 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${active ? 'text-teal-900' : 'text-slate-800'}`}>
                          {column.label}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {active ? 'Visible en tabla y tarjetas' : 'Oculta visualmente'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                          active
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
                Si ocultas una columna, sus datos seguirán funcionando internamente de forma normal.
              </div>
            </div>

            <div className={`${COMPONENT_STYLES.modal.footer} flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onSelectAll} className={COMPONENT_STYLES.button.secondary}>
                  <Check className="h-4 w-4" />
                  <span>Seleccionar todo</span>
                </button>
                <button type="button" onClick={onReset} className={COMPONENT_STYLES.button.ghost}>
                  <RotateCcw className="h-4 w-4" />
                  <span>Restaurar por defecto</span>
                </button>
              </div>
              <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.primary}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
});

MovimientosColumnSettingsModal.displayName = 'MovimientosColumnSettingsModal';
