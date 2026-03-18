import React from 'react';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { Modal } from '../../Inventario/components/ModalComponents';
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
      icon={BarChart3}
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
              <tbody className="divide-y divide-slate-100 bg-white">
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
            <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-slate-900">{emptyTitle}</h4>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{emptyDescription}</p>
            </div>
          )}
        </DataTable>
      </div>
    </Modal>
  );
}

export default React.memo(VisualizarReporteModal) as typeof VisualizarReporteModal;
