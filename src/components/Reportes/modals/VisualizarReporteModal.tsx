import React, { useState } from 'react';
import { WarningCircle, ChartBar, Rows, Table } from '@phosphor-icons/react';
import { Modal } from '../../ui/ModalElements';
import { DataTable, TableCell, TableHeader, TableRow } from '../../Inventario/components/FilterAndTable';
import { COMPONENT_STYLES } from '../constants';
import { ReportTableColumn } from '../components/ReportPrimitives';

interface VisualizarReporteModalProps<T> {
  isOpen: boolean;
  title: string;
  subtitle: string;
  rows: T[];
  columns: ReportTableColumn<T>[];
  onClose: () => void;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyTitle: string;
  emptyDescription: string;
}

function VisualizarReporteModal<T>({
  isOpen,
  title,
  subtitle,
  rows,
  columns,
  onClose,
  isLoading = false,
  loadingMessage = 'Generando vista previa...',
  emptyTitle,
  emptyDescription,
}: VisualizarReporteModalProps<T>) {
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
  const primaryCol = columns[0];
  const detailCols = columns.slice(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={ChartBar}
      size="xl"
      footer={(
        <div className="flex w-full sm:w-auto justify-end">
          <button type="button" onClick={onClose} className={`${COMPONENT_STYLES.button.secondary} w-full sm:w-auto justify-center`}>
            Cerrar
          </button>
        </div>
      )}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={rows.length > 0 ? COMPONENT_STYLES.badge.count : COMPONENT_STYLES.badge.neutral}>
            {rows.length} registro{rows.length === 1 ? '' : 's'}
          </span>

          {rows.length > 0 && (
            <div className="inline-flex items-center rounded-lg border border-line bg-surface-soft p-0.5 md:hidden">
              <button
                type="button"
                onClick={() => setMobileViewMode('cards')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  mobileViewMode === 'cards' ? 'bg-surface text-ink shadow-2xs' : 'text-muted-2'
                }`}
              >
                <Rows className="h-3.5 w-3.5" />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('table')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  mobileViewMode === 'table' ? 'bg-surface text-ink shadow-2xs' : 'text-muted-2'
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                <span>Tabla</span>
              </button>
            </div>
          )}
        </div>

        <DataTable
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          skeletonRows={5}
          skeletonColumns={columns.length}
        >
          {rows.length > 0 ? (
            <>
              {/* Vista de Tarjetas Automática para Móviles (< md) */}
              {mobileViewMode === 'cards' && (
                <div className="grid grid-cols-1 gap-2.5 md:hidden">
                  {rows.map((row, index) => (
                    <article
                      key={`modal-mobile-report-${title}-${index + 1}`}
                      className="rounded-xl border border-line bg-surface p-3.5 shadow-2xs"
                    >
                      {primaryCol && (
                        <div className="border-b border-line-soft pb-2.5">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                            {primaryCol.label}
                          </span>
                          <div className="mt-0.5 text-sm font-semibold text-ink">
                            {primaryCol.render(row)}
                          </div>
                        </div>
                      )}
                      {detailCols.length > 0 && (
                        <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                          {detailCols.map((col) => (
                            <div
                              key={`modal-mobile-col-${col.key}-${index}`}
                              className="rounded-lg border border-line-soft bg-surface-soft/50 p-2 min-w-0"
                            >
                              <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-muted">
                                {col.label}
                              </span>
                              <div className="mt-1 font-medium text-ink break-words">
                                {col.render(row)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {/* Vista de Tabla (siempre en >= md, o en móvil si eligen 'table') */}
              <div className={`${mobileViewMode === 'table' ? 'block' : 'hidden'} md:block overflow-x-auto touch-pan-x-smooth rounded-xl border border-line md:border-0`}>
                <table className="min-w-full table-auto">
                  <TableHeader columns={columns.map((column) => ({
                    key: column.key,
                    label: column.label,
                    align: column.align,
                    className: column.className,
                  }))} />
                  <tbody className="bg-surface">
                    {rows.map((row, index) => (
                      <TableRow key={`${title}-${index + 1}`}>
                        {columns.map((column) => (
                          <TableCell
                            key={`${column.key}-${index + 1}`}
                            align={column.align}
                            className={column.className}
                          >
                            {column.render(row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-soft px-4 py-12 sm:px-6 sm:py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted">
                <WarningCircle weight="duotone" className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-ink">{emptyTitle}</h4>
              <p className="mt-2 max-w-xl text-xs sm:text-sm leading-6 text-muted-2">{emptyDescription}</p>
            </div>
          )}
        </DataTable>
      </div>
    </Modal>
  );
}

export default React.memo(VisualizarReporteModal) as typeof VisualizarReporteModal;
