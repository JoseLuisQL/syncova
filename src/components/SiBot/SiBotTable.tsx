import React, { useMemo, useRef, useState } from 'react';
import { Check, CircleNotch, Copy, FileXls, Table as TableIcon } from '@phosphor-icons/react';
import { useToastContext } from '../../contexts/ToastContext';
import {
  exportTableToExcel,
  sanitizeFileName,
} from './sibotExportUtils';

interface SiBotTableProps {
  children: React.ReactNode;
}

export const SiBotTable: React.FC<SiBotTableProps> = ({ children }) => {
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToastContext();

  const fileBaseName = useMemo(
    () => sanitizeFileName(`reporte_sibot_${new Date().toISOString().slice(0, 10)}`, 'reporte_sibot'),
    [],
  );

  const handleExcel = async () => {
    if (!tableRef.current) return;

    setIsExporting(true);
    try {
      await exportTableToExcel(tableRef.current, `${fileBaseName}.xlsx`);
      toast.success('Excel exportado', 'La tabla se descargó con formato corporativo.', {
        duration: 2400,
      });
    } catch (error) {
      toast.error('No se pudo exportar Excel', error instanceof Error ? error.message : 'Intenta nuevamente.', {
        duration: 3200,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyTable = async () => {
    if (!tableRef.current) return;
    try {
      const rows = Array.from(tableRef.current.querySelectorAll('tr'));
      const tsv = rows
        .map((row) =>
          Array.from(row.querySelectorAll('th, td'))
            .map((cell) => (cell.textContent || '').trim().replace(/\s+/g, ' '))
            .join('\t'),
        )
        .join('\n');

      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Error al copiar', 'No se pudo copiar el contenido de la tabla.');
    }
  };

  return (
    <div className="my-3.5 overflow-hidden rounded-xl border border-line bg-surface">
      <div
        data-export-ignore="true"
        className="flex items-center justify-between gap-2 border-b border-line bg-surface-soft/70 px-3 py-2"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-2">
          <TableIcon className="h-3.5 w-3.5 text-brand" weight="duotone" />
          <span>Datos estructurados</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void handleCopyTable()}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-2 transition-colors hover:border-line-strong hover:bg-surface-soft hover:text-ink"
            title="Copiar tabla para hoja de cálculo"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" weight="bold" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => void handleExcel()}
            disabled={isExporting}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-surface-tint/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isExporting ? (
              <CircleNotch className="h-3.5 w-3.5 animate-spin text-brand" />
            ) : (
              <FileXls className="h-3.5 w-3.5 text-emerald-600" weight="duotone" />
            )}
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-surface scrollbar-thin scrollbar-thumb-zinc-200">
        <table
          ref={tableRef}
          className="min-w-full border-collapse text-left text-xs tabular-nums"
        >
          {children}
        </table>
      </div>
    </div>
  );
};
