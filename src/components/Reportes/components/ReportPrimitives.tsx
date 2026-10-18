import React, { useEffect, useMemo, useState } from 'react';
import {
  WarningCircle,
  CheckCircle,
  Icon,
  Rows,
  Table,
  X,
  CaretLeft,
  CaretRight,
  CaretDown,
} from '@phosphor-icons/react';
import { DataTable } from '../../Inventario/components/FilterAndTable';
import { ColorScheme, COLORS, COMPONENT_STYLES } from '../constants';

export interface ReportMetricItem {
  id: string;
  label: string;
  value: React.ReactNode;
  icon: Icon;
  tone?: ColorScheme;
  description?: string;
}

export interface ReportTableColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface ResultsTableProps<T> {
  title: string;
  subtitle?: string;
  summaryText?: string;
  rows: T[];
  columns: ReportTableColumn<T>[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyTitle: string;
  emptyDescription: string;
  headerActions?: React.ReactNode;
  onClose?: () => void;
  footer?: React.ReactNode;
  defaultPageSize?: number;
}

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100] as const;

export const ReportMetricsGrid: React.FC<{ items: ReportMetricItem[] }> = ({ items }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => {
      const tone = COLORS[item.tone || 'neutral'];
      const IconComponent = item.icon;

      return (
        <article key={item.id} className={COMPONENT_STYLES.stats.card}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={COMPONENT_STYLES.stats.label}>{item.label}</p>
              <p className={COMPONENT_STYLES.stats.value}>{item.value}</p>
              {item.description ? <p className="mt-1.5 text-xs text-muted-2">{item.description}</p> : null}
            </div>
            <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${tone.border} ${tone.surface}`}>
              <IconComponent className={`h-4 w-4 ${tone.icon}`} weight="bold" aria-hidden="true" />
            </div>
          </div>
        </article>
      );
    })}
  </div>
);

export const ReportSectionCard: React.FC<{
  title?: string;
  subtitle?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  showHeader?: boolean;
}> = ({ title, subtitle, aside, children, showHeader = false }) => (
  <section className={COMPONENT_STYLES.surface}>
    {showHeader && title ? (
      <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line-soft pb-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs sm:text-sm text-muted-2">{subtitle}</p> : null}
        </div>
        {aside ? <div className="flex flex-wrap items-center gap-2 shrink-0">{aside}</div> : null}
      </header>
    ) : null}
    <div>{children}</div>
  </section>
);

export function ReportResultsTable<T>({
  title,
  subtitle,
  summaryText,
  rows,
  columns,
  isLoading = false,
  loadingMessage = 'Preparando resultados...',
  emptyTitle,
  emptyDescription,
  headerActions,
  onClose,
  footer,
  defaultPageSize = 15,
}: ResultsTableProps<T>) {
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const primaryCol = columns[0];
  const detailCols = columns.slice(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows, title, pageSize]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, rows.length);

  const paginatedRows = useMemo(
    () => rows.slice(startIndex, endIndex),
    [rows, startIndex, endIndex],
  );

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: Array<number | 'ellipsis-start' | 'ellipsis-end'> = [1];
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);

    if (start > 2) pages.push('ellipsis-start');
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    if (end < totalPages - 1) pages.push('ellipsis-end');
    pages.push(totalPages);
    return pages;
  }, [safePage, totalPages]);

  return (
    <section className={COMPONENT_STYLES.results.shell}>
      <header className={COMPONENT_STYLES.results.header}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            <span className="font-mono text-xs text-muted-2 tabular-nums">
              {rows.length.toLocaleString('es-PE')} {rows.length === 1 ? 'registro' : 'registros'}
              {summaryText ? ` · ${summaryText}` : ''}
              {totalPages > 1 ? ` · Pág. ${safePage}/${totalPages}` : ''}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {rows.length > 0 && (
              <div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5 md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileViewMode('cards')}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    mobileViewMode === 'cards' ? 'bg-surface-soft text-ink' : 'text-muted-2'
                  }`}
                >
                  <Rows className="h-3.5 w-3.5" />
                  <span>Tarjetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('table')}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    mobileViewMode === 'table' ? 'bg-surface-soft text-ink' : 'text-muted-2'
                  }`}
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>Tabla</span>
                </button>
              </div>
            )}

            {headerActions}

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className={COMPONENT_STYLES.button.icon}
                aria-label="Cerrar vista previa"
                title="Cerrar vista previa"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            ) : null}
          </div>
        </div>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-2">{subtitle}</p> : null}
      </header>

      <div className={COMPONENT_STYLES.results.body}>
        <DataTable
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          skeletonRows={5}
          skeletonColumns={columns.length}
        >
          {rows.length > 0 ? (
            <>
              {mobileViewMode === 'cards' && (
                <div className="grid grid-cols-1 gap-2.5 p-3 md:hidden">
                  {paginatedRows.map((row, index) => (
                    <article
                      key={`mobile-report-${title}-${startIndex + index + 1}`}
                      className="rounded-xl border border-line bg-surface p-3.5"
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
                        <div className="mt-2.5 grid grid-cols-2 gap-2.5 text-xs">
                          {detailCols.map((col) => (
                            <div
                              key={`mobile-col-${col.key}-${startIndex + index}`}
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

              <div className={`${mobileViewMode === 'table' ? 'block' : 'hidden'} md:block overflow-x-auto`}>
                <table className="min-w-full table-auto border-collapse">
                  <thead className={COMPONENT_STYLES.table.header}>
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={`${COMPONENT_STYLES.table.headerCell} ${
                            column.align === 'right'
                              ? 'text-right'
                              : column.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                          } ${column.className || ''}`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft bg-surface">
                    {paginatedRows.map((row, index) => (
                      <tr key={`${title}-${startIndex + index + 1}`} className={COMPONENT_STYLES.table.row}>
                        {columns.map((column) => (
                          <td
                            key={`${column.key}-${startIndex + index + 1}`}
                            className={`px-4 py-3 align-middle text-sm text-ink ${
                              column.align === 'right'
                                ? 'text-right'
                                : column.align === 'center'
                                  ? 'text-center'
                                  : 'text-left'
                            } ${column.className || ''}`}
                          >
                            {column.render(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Barra minimalista de paginación */}
              <div className={COMPONENT_STYLES.pagination.container}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={COMPONENT_STYLES.pagination.info}>
                      Mostrando {startIndex + 1}–{endIndex} de {rows.length.toLocaleString('es-PE')}
                    </span>

                    <div className="relative inline-flex items-center">
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="h-8 appearance-none rounded-lg border border-line bg-surface pl-2.5 pr-7 font-mono text-xs font-medium text-ink transition-colors hover:border-line-strong focus:border-brand focus:outline-none tabular-nums"
                        aria-label="Registros por página"
                      >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size} / pág.
                          </option>
                        ))}
                      </select>
                      <CaretDown
                        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-2"
                        weight="bold"
                      />
                    </div>
                  </div>

                  {totalPages > 1 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className={`${COMPONENT_STYLES.pagination.button} inline-flex items-center gap-1`}
                        aria-label="Página anterior"
                      >
                        <CaretLeft className="h-3.5 w-3.5" weight="bold" />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>

                      {visiblePages.map((item) =>
                        typeof item === 'number' ? (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCurrentPage(item)}
                            className={`${COMPONENT_STYLES.pagination.button} font-mono tabular-nums ${
                              safePage === item
                                ? COMPONENT_STYLES.pagination.buttonActive
                                : COMPONENT_STYLES.pagination.buttonInactive
                            }`}
                          >
                            {item}
                          </button>
                        ) : (
                          <span key={item} className="px-1 font-mono text-xs text-muted">
                            …
                          </span>
                        ),
                      )}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className={`${COMPONENT_STYLES.pagination.button} inline-flex items-center gap-1`}
                        aria-label="Página siguiente"
                      >
                        <span className="hidden sm:inline">Siguiente</span>
                        <CaretRight className="h-3.5 w-3.5" weight="bold" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-soft text-muted">
                <WarningCircle weight="duotone" className="h-5 w-5" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-ink">{emptyTitle}</h4>
              <p className="mt-1 max-w-md text-xs sm:text-sm text-muted-2">{emptyDescription}</p>
            </div>
          )}
        </DataTable>
      </div>

      {footer ? <div className="border-t border-line-soft bg-surface-soft px-4 py-3 sm:px-5">{footer}</div> : null}
    </section>
  );
}

export const ReportInlineStatus: React.FC<{
  tone?: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
}> = ({ tone = 'info', title, description }) => {
  const classes = {
    success:
      'rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 text-emerald-900 dark:text-emerald-200',
    warning: COMPONENT_STYLES.alert.warning,
    danger: COMPONENT_STYLES.alert.error,
    info: COMPONENT_STYLES.alert.info,
  }[tone];

  const IconComponent = tone === 'success' ? CheckCircle : WarningCircle;

  return (
    <div className={classes}>
      <div className="flex items-start gap-2.5">
        <IconComponent className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
        <div>
          <p className="text-xs sm:text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
};
