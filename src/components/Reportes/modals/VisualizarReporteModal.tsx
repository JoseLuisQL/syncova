import React from 'react';
import { WarningCircle, ChartBar } from '@phosphor-icons/react';
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={ChartBar}
      size="xl"
      footer={(
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={COMPONENT_STYLES.button.secondary}>
            Cerrar
          </button>
        </div>
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={rows.length > 0 ? COMPONENT_STYLES.badge.count : COMPONENT_STYLES.badge.neutral}>
            {rows.length} registro{rows.length === 1 ? '' : 's'}
          </span>
        </div>

        <DataTable
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          skeletonRows={5}
          skeletonColumns={columns.length}
        >
          {rows.length > 0 ? (
            <table className="min-w-full table-auto">
              <TableHeader columns={columns.map((column) => ({
                key: column.key,
                label: column.label,
                align: column.align,
                className: column.className,
              }))} />
              <tbody className="divide-y divide-zinc-100 bg-white">
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
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                <WarningCircle weight="duotone" className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-zinc-900">{emptyTitle}</h4>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">{emptyDescription}</p>
            </div>
          )}
        </DataTable>
      </div>
    </Modal>
  );
}

export default React.memo(VisualizarReporteModal) as typeof VisualizarReporteModal;
