import React, { useMemo, useRef, useState } from 'react';
import { CircleNotch, FileXls } from '@phosphor-icons/react';
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
  const { toast } = useToastContext();

  const fileBaseName = useMemo(
    () => sanitizeFileName(`tabla_sibot_${new Date().toISOString().slice(0, 10)}`, 'tabla_sibot'),
    [],
  );

  const handleExcel = async () => {
    if (!tableRef.current) return;

    setIsExporting(true);
    try {
      await exportTableToExcel(tableRef.current, `${fileBaseName}.xlsx`);
      toast.success('Excel exportado', 'La tabla se descargó correctamente.', {
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

  return (
    <div className="my-3 overflow-hidden rounded-[1rem] border border-zinc-200/80 bg-white shadow-sm relative">
      <div
        data-export-ignore="true"
        className="absolute right-3 top-3 z-10"
      >
        <button
          type="button"
          onClick={() => void handleExcel()}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white/96 px-3 py-1.5 text-[10px] font-medium text-zinc-600 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] backdrop-blur-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isExporting ? (
            <CircleNotch className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileXls className="h-3.5 w-3.5" />
          )}
          <span>Excel</span>
        </button>
      </div>

      <div className="bg-white">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-200 pt-12">
          <table
            ref={tableRef}
            className="min-w-full text-[11.5px] text-left divide-y divide-zinc-200/80"
          >
            {children}
          </table>
        </div>
      </div>
    </div>
  );
};
