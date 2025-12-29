import React, { memo, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Alerta } from '../../../types';
import { COMPONENT_STYLES, ITEMS_PER_PAGE } from '../constants';
import { AlertaCard } from './AlertaCard';
import { EmptyState } from './EmptyState';

interface AlertasListProps {
  alertas: Alerta[];
  selectedAlertas: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarcarLeida: (id: string) => void;
  onMarcarNoLeida: (id: string) => void;
  onEliminar: (id: string) => void;
  onMarcarSeleccionadasLeidas: () => void;
  onEliminarSeleccionadas: () => void;
}

export const AlertasList: React.FC<AlertasListProps> = memo(({
  alertas,
  selectedAlertas,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onMarcarLeida,
  onMarcarNoLeida,
  onEliminar,
  onMarcarSeleccionadasLeidas,
  onEliminarSeleccionadas,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(alertas.length / ITEMS_PER_PAGE);

  const alertasPaginadas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return alertas.slice(start, start + ITEMS_PER_PAGE);
  }, [alertas, currentPage]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(p => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(p => Math.min(totalPages, p + 1));
  }, [totalPages]);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (alertas.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50/50">
        <h3 className="text-base font-semibold text-gray-900">
          Alertas ({alertas.length})
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={onSelectAll}
            className="text-teal-600 hover:text-teal-800 font-medium"
          >
            Seleccionar todas
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={onDeselectAll}
            className="text-gray-600 hover:text-gray-800"
          >
            Deseleccionar
          </button>
        </div>
      </div>

      {selectedAlertas.length > 0 && (
        <div className="px-5 py-3 bg-teal-50 border-b border-teal-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-sm font-medium text-teal-900">
            {selectedAlertas.length} alerta{selectedAlertas.length > 1 ? 's' : ''} seleccionada{selectedAlertas.length > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onMarcarSeleccionadasLeidas}
              className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
            >
              Marcar leidas
            </button>
            <button
              onClick={onEliminarSeleccionadas}
              className="px-3 py-1.5 bg-rose-600 text-white text-sm rounded-lg hover:bg-rose-700 transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={onDeselectAll}
              className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {alertasPaginadas.map((alerta) => (
          <AlertaCard
            key={alerta.id}
            alerta={alerta}
            isSelected={selectedAlertas.includes(alerta.id)}
            onToggleSelect={onToggleSelect}
            onMarcarLeida={onMarcarLeida}
            onMarcarNoLeida={onMarcarNoLeida}
            onEliminar={onEliminar}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={COMPONENT_STYLES.pagination.container}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className={COMPONENT_STYLES.pagination.info}>
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, alertas.length)} de {alertas.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
                aria-label="Pagina anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
                aria-label="Pagina siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AlertasList.displayName = 'AlertasList';
