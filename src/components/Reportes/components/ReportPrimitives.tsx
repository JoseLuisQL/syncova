import React, { useState } from 'react';
import { WarningCircle, CheckCircle, Icon, Rows, Table, X } from '@phosphor-icons/react';
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
}

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
}: ResultsTableProps<T>) {
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
  const primaryCol = columns[0];
  const detailCols = columns.slice(1);

  return (
    <section className={COMPONENT_STYLES.results.shell}>
      <header className={COMPONENT_STYLES.results.header}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            <span className="font-mono text-xs text-muted-2 tabular-nums">
              {rows.length} {rows.length === 1 ? 'registro' : 'registros'}
              {summaryText ? ` · ${summaryText}` : ''}
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
                  {rows.map((row, index) => (
                    <article
                      key={`mobile-report-${title}-${index + 1}`}
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
                              key={`mobile-col-${col.key}-${index}`}
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
                    {rows.map((row, index) => (
                      <tr key={`${title}-${index + 1}`} className={COMPONENT_STYLES.table.row}>
                        {columns.map((column) => (
                          <td
                            key={`${column.key}-${index + 1}`}
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
