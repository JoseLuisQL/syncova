import React, { memo, useMemo, useCallback } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = memo(({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}) => {
  const { startItem, endItem } = useMemo(() => ({
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems),
  }), [currentPage, itemsPerPage, totalItems]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 3;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) {
    return null;
  }

  const buttonBaseClass = `inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-medium 
    rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1`;
  
  const disabledClass = 'opacity-40 cursor-not-allowed';
  const activeClass = 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm';
  const inactiveClass = 'text-zinc-600 hover:bg-zinc-100 bg-white border border-zinc-200';

  return (
    <nav
      className={`flex items-center justify-between px-4 py-3 bg-zinc-50/50 border-t border-zinc-100 ${className}`}
      aria-label="Paginación"
    >
      <p className="text-xs text-zinc-600">
        <span className="font-medium">{startItem}</span>
        {' - '}
        <span className="font-medium">{endItem}</span>
        {' de '}
        <span className="font-medium">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <button type="button"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`${buttonBaseClass} ${inactiveClass} ${currentPage === 1 ? disabledClass : ''}`}
          aria-label="Página anterior"
        >
          <CaretLeft weight="bold" className="h-4 w-4" aria-hidden="true" />
        </button>

        {visiblePages.map((page) => (
          <button type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={`${buttonBaseClass} min-w-[32px] ${page === currentPage ? activeClass : inactiveClass}`}
            aria-label={`Página ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        <button type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`${buttonBaseClass} ${inactiveClass} ${currentPage === totalPages ? disabledClass : ''}`}
          aria-label="Página siguiente"
        >
          <CaretRight weight="bold" className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
