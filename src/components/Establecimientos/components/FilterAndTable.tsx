import React, { memo, useMemo } from 'react';
import { Search } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

// ============================================================================
// FILTER BAR COMPONENT
// ============================================================================

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
}

export const FilterBar: React.FC<FilterBarProps> = memo(({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
}) => (
  <section 
    aria-label="Filtros" 
    className={COMPONENT_STYLES.filter.container}
  >
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <label htmlFor="search" className={COMPONENT_STYLES.input.label}>
          Buscar
        </label>
        <div className="relative">
          <Search className={COMPONENT_STYLES.filter.searchIcon} aria-hidden="true" />
          <input
            id="search"
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={COMPONENT_STYLES.filter.searchInput}
          />
        </div>
      </div>
      
      {filters.map((filter) => (
        <div key={filter.id} className="lg:w-44">
          <label htmlFor={filter.id} className={COMPONENT_STYLES.input.label}>
            {filter.label}
          </label>
          <select
            id={filter.id}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            disabled={filter.disabled}
            className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
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
  </section>
));

FilterBar.displayName = 'FilterBar';

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

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
  const startItem = useMemo(() => ((currentPage - 1) * limit) + 1, [currentPage, limit]);
  const endItem = useMemo(() => Math.min(currentPage * limit, total), [currentPage, limit, total]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav 
      aria-label="Paginacion" 
      className={COMPONENT_STYLES.pagination.container}
    >
      <div className="flex items-center justify-between">
        {/* Mobile pagination */}
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600 self-center">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
          >
            Siguiente
          </button>
        </div>

        {/* Desktop pagination */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <p className={COMPONENT_STYLES.pagination.info}>
            Mostrando{' '}
            <span className="font-semibold text-teal-600">{startItem}</span>
            {' '}a{' '}
            <span className="font-semibold text-teal-600">{endItem}</span>
            {' '}de{' '}
            <span className="font-semibold text-teal-600">{total}</span>
            {' '}resultados
          </p>
          
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive} rounded-l-lg`}
            >
              Anterior
            </button>
            
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
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
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive} rounded-r-lg`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

// ============================================================================
// DATA TABLE WRAPPER COMPONENT
// ============================================================================

interface DataTableProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = memo(({
  children,
  isLoading = false,
  loadingMessage = 'Cargando datos...',
}) => (
  <div className={COMPONENT_STYLES.table.container}>
    {isLoading ? (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        <span className="ml-3 text-gray-600">{loadingMessage}</span>
      </div>
    ) : (
      <div className="overflow-x-auto">
        {children}
      </div>
    )}
  </div>
));

DataTable.displayName = 'DataTable';

// ============================================================================
// TABLE HEADER COMPONENT
// ============================================================================

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
      {columns.map((column) => (
        <th
          key={column.key}
          className={`${COMPONENT_STYLES.table.headerCell} ${
            column.align === 'right' ? 'text-right' : 
            column.align === 'center' ? 'text-center' : 'text-left'
          } ${column.className || ''}`}
        >
          {column.label}
        </th>
      ))}
    </tr>
  </thead>
));

TableHeader.displayName = 'TableHeader';
