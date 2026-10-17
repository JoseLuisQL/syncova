import React, { useState } from 'react';
import { WarningCircle, CheckCircle, Icon, Rows, Table } from '@phosphor-icons/react';
import { DataTable, TableCell, TableHeader, TableRow } from '../../Inventario/components/FilterAndTable';
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
  subtitle: string;
  rows: T[];
  columns: ReportTableColumn<T>[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyTitle: string;
  emptyDescription: string;
  footer?: React.ReactNode;
}

export const ReportMetricsGrid: React.FC<{ items: ReportMetricItem[] }> = ({ items }) => (
  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => {
      const tone = COLORS[item.tone || 'neutral'];
      const IconComponent = item.icon;

      return (
        <article
          key={item.id}
          className={`${COMPONENT_STYLES.stats.card} ${tone.border} ${tone.surfaceSoft}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`${COMPONENT_STYLES.stats.label} ${tone.text}`}>{item.label}</p>
              <p className={`${COMPONENT_STYLES.stats.value} ${tone.textStrong}`}>{item.value}</p>
              {item.description ? <p className="mt-1.5 text-[0.74rem] leading-5 text-zinc-500">{item.description}</p> : null}
            </div>
            <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${tone.border} ${tone.surface}`}>
              <IconComponent className={`h-4 w-4 ${tone.icon}`} aria-hidden="true" />
            </div>
          </div>
        </article>
      );
    })}
  </div>
);

export const ReportSectionCard: React.FC<{
  title: string;
  subtitle: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  showHeader?: boolean;
}> = ({ title, subtitle, aside, children, showHeader = true }) => (
  <section className={COMPONENT_STYLES.surface}>
    {showHeader ? (
      <header className="border-b border-zinc-100 px-3.5 py-3 sm:px-5 sm:py-3.5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-base sm:text-[1.08rem] font-semibold text-zinc-950">{title}</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-zinc-500">{subtitle}</p>
          </div>
          {aside ? <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">{aside}</div> : null}
        </div>
      </header>
    ) : null}
    <div className="px-3.5 py-3.5 sm:px-5 sm:py-4">{children}</div>
  </section>
);

export function ReportResultsTable<T>({
  title,
  subtitle,
  rows,
  columns,
  isLoading = false,
  loadingMessage = 'Preparando resultados...',
  emptyTitle,
  emptyDescription,
  footer,
}: ResultsTableProps<T>) {
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
  const primaryCol = columns[0];
  const detailCols = columns.slice(1);

  return (
    <section className={COMPONENT_STYLES.results.shell}>
      <header className={COMPONENT_STYLES.results.header}>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-[0.98rem] font-semibold text-ink">{title}</h3>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-2">{subtitle}</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {rows.length > 0 && (
              <div className="inline-flex items-center rounded-lg border border-line bg-surface-soft p-0.5 md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileViewMode('cards')}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    mobileViewMode === 'cards' ? 'bg-surface text-ink shadow-2xs' : 'text-muted-2'
                  }`}
                >
                  <Rows className="h-3.5 w-3.5" />
                  <span>Tarjetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('table')}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    mobileViewMode === 'table' ? 'bg-surface text-ink shadow-2xs' : 'text-muted-2'
                  }`}
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>Tabla</span>
                </button>
              </div>
            )}
            <span className={rows.length > 0 ? COMPONENT_STYLES.badge.count : COMPONENT_STYLES.badge.neutral}>
              {rows.length} registro{rows.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
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
              {/* Vista de Tarjetas Automática para Móviles (< md) */}
              {mobileViewMode === 'cards' && (
                <div className="grid grid-cols-1 gap-2.5 p-3 md:hidden">
                  {rows.map((row, index) => (
                    <article
                      key={`mobile-report-${title}-${index + 1}`}
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

              {/* Vista de Tabla (siempre en >= md, o en móvil si eligen 'table') */}
              <div className={`${mobileViewMode === 'table' ? 'block' : 'hidden'} md:block overflow-x-auto touch-pan-x-smooth`}>
                <table className="min-w-full table-auto border-separate border-spacing-0">
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

      {footer ? <div className="border-t border-line-soft bg-surface-soft px-4 py-3.5 sm:px-6 sm:py-4">{footer}</div> : null}
    </section>
  );
}

export const ReportInlineStatus: React.FC<{
  tone?: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
}> = ({ tone = 'info', title, description }) => {
  const classes = {
    success: 'rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-800',
    warning: COMPONENT_STYLES.alert.warning,
    danger: COMPONENT_STYLES.alert.error,
    info: COMPONENT_STYLES.alert.info,
  }[tone];

  const IconComponent = tone === 'success' ? CheckCircle : WarningCircle;

  return (
    <div className={classes}>
      <div className="flex items-start gap-3">
        <IconComponent className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </div>
  );
};
