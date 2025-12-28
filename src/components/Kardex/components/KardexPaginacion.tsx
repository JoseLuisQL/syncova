import React, { memo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ITEMS_PER_PAGE_OPTIONS, COMPONENT_STYLES } from '../constants';

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

export const KardexPaginacion: React.FC<KardexPaginacionProps> = memo(({
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
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (total === 0) return null;

  return (
    <div className={COMPONENT_STYLES.pagination.wrapper}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Info y selector de items por página */}
        <div className="flex items-center gap-6">
          {/* Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Mostrar</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={loading}
              className={COMPONENT_STYLES.pagination.select}
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <span className="text-sm font-medium text-gray-600">registros</span>
          </div>

          {/* Info de resultados */}
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{startItem.toLocaleString()}</span>
            <span className="mx-1">-</span>
            <span className="font-semibold text-gray-700">{endItem.toLocaleString()}</span>
            <span className="mx-2">de</span>
            <span className="font-semibold text-teal-600">{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Controles de navegación */}
        <div className="flex items-center gap-1.5">
          {/* Primera página */}
          <button
            onClick={onFirstPage}
            disabled={currentPage === 1 || loading}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            title="Ir al inicio"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Página anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            title="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400 font-medium">
                  •••
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum as number)}
                  disabled={loading}
                  className={`${COMPONENT_STYLES.pagination.button} min-w-[40px] ${
                    pageNum === currentPage
                      ? COMPONENT_STYLES.pagination.buttonActive
                      : COMPONENT_STYLES.pagination.buttonInactive
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))}
          </div>

          {/* Página siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            title="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Última página */}
          <button
            onClick={onLastPage}
            disabled={currentPage === totalPages || loading}
            className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
            title="Ir al final"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

KardexPaginacion.displayName = 'KardexPaginacion';
