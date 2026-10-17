import React, { memo, useMemo } from 'react';
import { CaretDown, MagnifyingGlass, X } from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inventory-skeleton ${className}`} aria-hidden="true" />
);

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onClear?: () => void;
  actions?: React.ReactNode;
  layout?: 'default' | 'inline';
}

export const FilterBar: React.FC<FilterBarProps> = memo(({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  onClear,
  actions,
}) => {
  const hasActiveFilters =
    Boolean(searchValue.trim()) ||
    filters.some((filter) => filter.value && filter.value !== 'todos' && filter.value !== '');

  return (
    <section
      aria-label="Filtros"
      className="rounded-xl border border-line bg-surface p-3 shadow-2xs sm:p-3.5"
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-end">
          {/* Buscador */}
          <div className="w-full sm:w-[240px] lg:w-[260px]">
            <label htmlFor="inventory-search" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Búsqueda rápida
            </label>
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" aria-hidden="true" />
              <input
                id="inventory-search"
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-xs sm:text-sm font-medium text-ink shadow-2xs transition placeholder:text-muted hover:border-line-strong focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted transition hover:bg-surface-soft hover:text-ink"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Selectores directos en línea (sin popovers ocultos) */}
          {filters.length > 0 ? (
            <div className={`grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-end ${
              filters.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {filters.map((filter) => {
                const isFiltered = Boolean(filter.value && filter.value !== 'todos' && filter.value !== '');
                return (
                  <div key={filter.id} className="min-w-0 sm:w-[175px]">
                    <label
                      htmlFor={filter.id}
                      className="mb-1 block truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-muted"
                    >
                      {filter.label}
                    </label>
                    <div className="relative">
                      <select
                        id={filter.id}
                        value={filter.value}
                        onChange={(event) => filter.onChange(event.target.value)}
                        disabled={filter.disabled}
                        className={`h-9 w-full appearance-none rounded-lg border pl-3 pr-8 text-xs sm:text-sm font-medium shadow-2xs transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/15 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted ${
                          isFiltered
                            ? 'border-status-success-border bg-status-success-bg/70 text-status-success-text'
                            : 'border-line bg-surface text-ink hover:border-line-strong'
                        }`}
                      >
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <CaretDown
                        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                        weight="bold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {hasActiveFilters && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-9 items-center justify-center gap-1.5 self-start sm:self-end rounded-lg border border-line bg-surface-soft px-3 text-xs font-semibold text-muted-2 transition hover:border-line-strong hover:bg-surface hover:text-ink"
            >
              <X className="h-3.5 w-3.5" weight="bold" />
              <span>Limpiar</span>
            </button>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line-soft pt-2 sm:border-t-0 sm:pt-0">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
});

FilterBar.displayName = 'FilterBar';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = memo(({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}) => {
  const startItem = useMemo(() => (total === 0 ? 0 : (currentPage - 1) * limit + 1), [currentPage, limit, total]);
  const endItem = useMemo(() => Math.min(currentPage * limit, total), [currentPage, limit, total]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginacion" className={COMPONENT_STYLES.pagination.container}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={COMPONENT_STYLES.pagination.info}>
          <span className="font-semibold text-muted-2">{startItem}-{endItem}</span> de{' '}
          <span className="font-semibold text-muted-2">{total}</span>
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            aria-label="Página anterior"
          >
            ‹
          </button>

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`${COMPONENT_STYLES.pagination.button} ${
                pageNum === currentPage ? COMPONENT_STYLES.pagination.buttonActive : COMPONENT_STYLES.pagination.buttonInactive
              }`}
              aria-current={pageNum === currentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            aria-label="Página siguiente"
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

interface DataTableProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  skeletonRows?: number;
  skeletonColumns?: number;
  loadingVariant?: 'table' | 'cards';
}

export const DataTable: React.FC<DataTableProps> = memo(({
  children,
  isLoading = false,
  loadingMessage = 'Cargando datos...',
  skeletonRows = 6,
  skeletonColumns = 5,
  loadingVariant = 'table',
}) => (
  <div className={`${COMPONENT_STYLES.table.container} flex min-h-0 flex-1 flex-col`}>
    {isLoading ? (
      <div className="inventory-loading-shell p-4 sm:p-5" role="status" aria-live="polite" aria-label={loadingMessage}>
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-soft inventory-breathe">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink">{loadingMessage}</p>
              <p className="truncate text-[11px] text-muted">Sincronizando registros de inventario y lotes...</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <SkeletonBlock className="h-5 w-20 rounded-md" />
          </div>
        </div>

        {loadingVariant === 'cards' ? (
          <div className="grid gap-3">
            {Array.from({ length: skeletonRows }).map((_, index) => (
              <div
                key={`card-skeleton-${index + 1}`}
                className="inventory-reveal rounded-2xl border border-line bg-surface p-4 shadow-2xs"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <SkeletonBlock className="h-9 w-9 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <SkeletonBlock className="h-4 w-36 rounded-md" />
                      <SkeletonBlock className="h-3 w-48 max-w-full rounded-md opacity-75" />
                    </div>
                  </div>
                  <SkeletonBlock className="h-6 w-16 shrink-0 rounded-md" />
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-line-soft bg-surface-soft/50 p-2.5 space-y-1.5">
                    <SkeletonBlock className="h-2.5 w-14 rounded-full" />
                    <SkeletonBlock className="h-4 w-20 rounded-md" />
                  </div>
                  <div className="rounded-xl border border-line-soft bg-surface-soft/50 p-2.5 space-y-1.5">
                    <SkeletonBlock className="h-2.5 w-14 rounded-full" />
                    <SkeletonBlock className="h-4 w-20 rounded-md" />
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-line-soft pt-3">
                  <SkeletonBlock className="h-3 w-24 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <SkeletonBlock className="h-7 w-7 rounded-lg" />
                    <SkeletonBlock className="h-7 w-7 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="border-b border-line bg-surface-soft/80">
                  {Array.from({ length: skeletonColumns }).map((_, colIdx) => (
                    <th key={`th-skeleton-${colIdx + 1}`} className="px-4 py-3 text-left">
                      <SkeletonBlock
                        className={`h-3 rounded-full ${
                          colIdx === 0
                            ? 'w-28'
                            : colIdx === skeletonColumns - 1
                            ? 'ml-auto w-16'
                            : 'w-20'
                        }`}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft bg-surface">
                {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <tr key={`table-skeleton-${rowIndex + 1}`} className="inventory-reveal" style={{ animationDelay: `${rowIndex * 35}ms` }}>
                    {Array.from({ length: skeletonColumns }).map((__, columnIndex) => (
                      <td key={`table-skeleton-${rowIndex + 1}-${columnIndex + 1}`} className={COMPONENT_STYLES.table.cell}>
                        {columnIndex === 0 ? (
                          <div className="flex items-center gap-3">
                            <SkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <SkeletonBlock className="h-3.5 w-4/5 rounded-md" />
                              <SkeletonBlock className="h-2.5 w-1/2 rounded-md opacity-75" />
                            </div>
                          </div>
                        ) : columnIndex === skeletonColumns - 1 ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <SkeletonBlock className="h-7 w-7 rounded-lg" />
                            <SkeletonBlock className="h-7 w-7 rounded-lg" />
                          </div>
                        ) : columnIndex === skeletonColumns - 2 ? (
                          <SkeletonBlock className="h-5 w-16 rounded-md" />
                        ) : (
                          <div className="space-y-1.5">
                            <SkeletonBlock className="h-3.5 w-3/4 rounded-md" />
                            {(columnIndex === 1) ? (
                              <SkeletonBlock className="h-2.5 w-1/2 rounded-md opacity-75" />
                            ) : null}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ) : (
      <div className="inventory-reveal flex min-h-0 flex-1 flex-col overflow-x-auto">{children}</div>
    )}
  </div>
));

DataTable.displayName = 'DataTable';

interface TableHeaderProps {
  columns: Array<{
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
  }>;
}

export const TableHeader: React.FC<TableHeaderProps> = memo(({ columns }) => (
  <thead className={COMPONENT_STYLES.table.header}>
    <tr>
      <th className="w-10 rounded-l-[14px] bg-surface-soft px-3 py-3 text-center">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-[5px] border-[#e0e2ea] text-brand focus:ring-brand/20"
          aria-label="Seleccionar todos"
        />
      </th>
      {columns.map((column, index) => (
        <th
          key={column.key}
          className={`${COMPONENT_STYLES.table.headerCell} ${
            index === columns.length - 1 ? 'rounded-r-[14px]' : ''
          } ${
            column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
          } ${column.className || ''}`}
        >
          {column.label}
        </th>
      ))}
    </tr>
  </thead>
));

TableHeader.displayName = 'TableHeader';

interface TableRowProps {
  children?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
}

export const TableRow: React.FC<TableRowProps> = memo(({ children, onClick, isSelected = false }) => (
  <tr
    className={`${COMPONENT_STYLES.table.row} ${isSelected ? 'bg-surface-soft' : ''} ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <td className="w-10 border-b border-line-soft px-3 py-3 text-center align-middle">
      <input
        type="checkbox"
        className="h-4 w-4 rounded-[5px] border-[#e0e2ea] text-brand focus:ring-brand/20"
        aria-label="Seleccionar fila"
        onClick={(event) => event.stopPropagation()}
      />
    </td>
    {children}
  </tr>
));

TableRow.displayName = 'TableRow';

interface TableCellProps {
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = memo(({ children, align = 'left', className = '' }) => (
  <td
    className={`${COMPONENT_STYLES.table.cell} ${
      align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
    } ${className}`}
  >
    {children}
  </td>
));

TableCell.displayName = 'TableCell';
