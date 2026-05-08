import React from 'react';
import { WarningCircle, CheckCircle, Icon } from '@phosphor-icons/react';
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
      const Icon = item.icon;

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
              <Icon className={`h-4 w-4 ${tone.icon}`} aria-hidden="true" />
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
      <header className="border-b border-zinc-100 px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-[1.08rem] font-semibold text-zinc-950">{title}</h2>
            <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
          </div>
          {aside ? <div className="flex flex-wrap items-center gap-2">{aside}</div> : null}
        </div>
      </header>
    ) : null}
    <div className="px-4 py-4 sm:px-5">{children}</div>
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
  return (
    <section className={COMPONENT_STYLES.results.shell}>
      <header className={COMPONENT_STYLES.results.header}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-[0.98rem] font-semibold text-zinc-950">{title}</h3>
            <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
          </div>
          <span className={rows.length > 0 ? COMPONENT_STYLES.badge.count : COMPONENT_STYLES.badge.neutral}>
            {rows.length} registro{rows.length === 1 ? '' : 's'}
          </span>
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
            <table className="min-w-full table-auto border-separate border-spacing-0">
              <TableHeader columns={columns.map((column) => ({
                key: column.key,
                label: column.label,
                align: column.align,
                className: column.className,
              }))} />
              <tbody className="bg-white">
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

      {footer ? <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 sm:px-6">{footer}</div> : null}
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

  const Icon = tone === 'success' ? CheckCircle : WarningCircle;

  return (
    <div className={classes}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </div>
  );
};
