import React, { memo, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { COMPONENT_STYLES, ITEMS_PER_PAGE_OPTIONS } from '../constants';

interface KardexPaginacionProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
}

const KardexPaginacionComponent: React.FC<KardexPaginacionProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  total,
  loading,
  onPageChange,
  onItemsPerPageChange,
  onFirstPage,
  onLastPage,
}) => {
  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  const pageNumbers = useMemo(() => {
    const pages: Array<number | string> = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    return pages;
  }, [currentPage, totalPages]);

  if (total === 0) {
    return null;
  }

  return (
    <nav aria-label="Paginación del kardex" className={COMPONENT_STYLES.pagination.container}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <label htmlFor="kardex-page-size" className="text-sm text-slate-600">
              Mostrar
            </label>
            <select
              id="kardex-page-size"
              value={itemsPerPage}
              onChange={(event) => onItemsPerPageChange(Number(event.target.value))}
              disabled={loading}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} h-10 w-auto min-w-[90px] px-3 py-2`}
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-600">filas</span>
          </div>

          <p className={COMPONENT_STYLES.pagination.info}>
            Mostrando <span className="font-semibold text-slate-900">{startItem}</span> a{' '}
            <span className="font-semibold text-slate-900">{endItem}</span> de{' '}
            <span className="font-semibold text-slate-900">{total}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onFirstPage}
            disabled={currentPage <= 1 || loading}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            title="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map((pageNumber, index) =>
            pageNumber === '...' ? (
              <span key={`ellipsis-${index + 1}`} className="px-2 text-sm text-slate-400">
                …
              </span>
            ) : (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber as number)}
                disabled={loading}
                className={`${COMPONENT_STYLES.pagination.button} ${
                  pageNumber === currentPage
                    ? COMPONENT_STYLES.pagination.buttonActive
                    : COMPONENT_STYLES.pagination.buttonInactive
                } min-w-[42px]`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onLastPage}
            disabled={currentPage >= totalPages || loading}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export const KardexPaginacion = memo(KardexPaginacionComponent);
KardexPaginacion.displayName = 'KardexPaginacion';
