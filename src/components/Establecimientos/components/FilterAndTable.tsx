import React, { memo, useMemo } from 'react';
import { MagnifyingGlass, SlidersHorizontal, X } from '@phosphor-icons/react';
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
    filters.some((filter) => filter.value && filter.value !== 'todos');

  return (
    <section aria-label="Filtros" className={COMPONENT_STYLES.filter.container}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[220px]">
            <label htmlFor="establecimientos-search" className="sr-only">
              Buscar
            </label>
            <MagnifyingGlass className={COMPONENT_STYLES.filter.searchIcon} aria-hidden="true" />
            <input
              id="establecimientos-search"
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              className={COMPONENT_STYLES.filter.searchInput}
            />
          </div>

          {filters.length > 0 ? (
            <details className="group relative">
              <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3.5 text-sm font-semibold text-[#15171d] shadow-sm transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal className="h-4 w-4 text-[#606571]" />
                Filtros
              </summary>
              <div className="absolute left-0 top-11 z-30 w-[280px] rounded-[14px] border border-[#e7e7ef] bg-white p-3 shadow-[0_18px_40px_-28px_rgba(12,15,24,0.45)]">
                <div className="space-y-3">
                  {filters.map((filter) => (
                    <div key={filter.id}>
                      <label htmlFor={filter.id} className="mb-1 block text-xs font-medium text-[#747986]">
                        {filter.label}
                      </label>
                      <select
                        id={filter.id}
                        value={filter.value}
                        onChange={(event) => filter.onChange(event.target.value)}
                        disabled={filter.disabled}
                        className="h-9 w-full rounded-[9px] border border-[#e7e7ef] bg-white px-3 pr-8 text-sm font-medium text-[#15171d] outline-none transition hover:border-[#d7d8e2] focus:border-[#babdca] focus:ring-2 focus:ring-[#dedfea]/70 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ) : null}

          {hasActiveFilters && onClear ? (
            <button type="button" onClick={onClear} className={COMPONENT_STYLES.button.ghost}>
              <X className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
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
          <span className="font-semibold text-[#606571]">{startItem}-{endItem}</span> de{' '}
          <span className="font-semibold text-[#606571]">{total}</span>
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
                pageNum === currentPage
                  ? COMPONENT_STYLES.pagination.buttonActive
                  : COMPONENT_STYLES.pagination.buttonInactive
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
  children: React.ReactNode;
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
  skeletonRows = 5,
  skeletonColumns = 5,
  loadingVariant = 'table',
}) => (
  <div className={`${COMPONENT_STYLES.table.container} flex min-h-0 flex-1 flex-col`}>
    {isLoading ? (
      <div className="inventory-loading-shell p-4 sm:p-5">
        <div className="flex items-center gap-3 pb-4 text-zinc-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 inventory-breathe">
            <div className="h-4 w-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900">{loadingMessage}</p>
            <p className="text-xs text-zinc-500">Mostrando una vista previa mientras llega la información.</p>
          </div>
        </div>

        {loadingVariant === 'cards' ? (
          <div className="grid gap-3">
            {Array.from({ length: skeletonRows }).map((_, index) => (
              <div
                key={`card-skeleton-${index + 1}`}
                className="inventory-reveal rounded-[22px] border border-zinc-200 bg-white/90 p-4 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.14)]"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <SkeletonBlock className="h-5 w-36 rounded-full" />
                    <SkeletonBlock className="mt-2 h-3.5 w-48 max-w-full rounded-full" />
                  </div>
                  <SkeletonBlock className="h-7 w-20 rounded-full" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <SkeletonBlock className="h-[74px] rounded-2xl" />
                  <SkeletonBlock className="h-[74px] rounded-2xl" />
                </div>

                <SkeletonBlock className="mt-4 h-10 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white/95">
            <table className="min-w-full table-fixed">
              <tbody className="bg-white">
                {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <tr
                    key={`table-skeleton-${rowIndex + 1}`}
                    className="inventory-reveal"
                    style={{ animationDelay: `${rowIndex * 45}ms` }}
                  >
                    {Array.from({ length: skeletonColumns }).map((__, columnIndex) => (
                      <td key={`table-skeleton-${rowIndex + 1}-${columnIndex + 1}`} className={COMPONENT_STYLES.table.cell}>
                        <div className="space-y-2">
                          <SkeletonBlock
                            className={`h-4 rounded-full ${
                              columnIndex === 0
                                ? 'w-4/5'
                                : columnIndex === skeletonColumns - 1
                                ? 'ml-auto w-1/2'
                                : 'w-full'
                            }`}
                          />
                          {columnIndex === 0 || columnIndex === 1 ? (
                            <SkeletonBlock className="h-3 w-2/3 rounded-full opacity-80" />
                          ) : null}
                        </div>
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
      <th className="w-10 rounded-l-[14px] border-y border-l border-[#e7e7ef] bg-[#fbfafd] px-3 py-3 text-center">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-[5px] border-[#e0e2ea] text-[#7c3aed] focus:ring-[#7c3aed]/20"
          aria-label="Seleccionar todos"
        />
      </th>
      {columns.map((column, index) => (
        <th
          key={column.key}
          className={`${COMPONENT_STYLES.table.headerCell} ${
            index === columns.length - 1 ? 'rounded-r-[14px] border-r' : ''
          } ${
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
));

TableHeader.displayName = 'TableHeader';

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
}

export const TableRow: React.FC<TableRowProps> = memo(({ children, onClick, isSelected = false }) => (
  <tr
    className={`${COMPONENT_STYLES.table.row} ${isSelected ? 'bg-zinc-100/60' : ''} ${
      onClick ? 'cursor-pointer' : ''
    }`}
    onClick={onClick}
  >
    <td className="w-10 border-b border-[#eeeef3] px-3 py-3 text-center align-middle">
      <input
        type="checkbox"
        className="h-4 w-4 rounded-[5px] border-[#e0e2ea] text-[#7c3aed] focus:ring-[#7c3aed]/20"
        aria-label="Seleccionar fila"
        onClick={(event) => event.stopPropagation()}
      />
    </td>
    {children}
  </tr>
));

TableRow.displayName = 'TableRow';

interface TableCellProps {
  children: React.ReactNode;
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
 