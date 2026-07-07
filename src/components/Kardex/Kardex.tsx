import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorAlert } from '../Inventario/components/SharedComponents';
import { useKardexData } from '../../hooks/useKardexData';
import { KardexExportConfig, KardexExportService } from '../../services/KardexExportService';
import { KardexFilters } from '../../services/KardexService';
import { MODULE_LAYOUT } from '../../styles/layout';
import { KARDEX_FILTER_DEBOUNCE } from './constants';
import {
  KardexFiltros,
  KardexHeader,
  KardexPaginacion,
  KardexTabla,
  MovimientoDetalleModal,
} from './components';

import type { KardexMovimientoUI } from './types';
type KardexMovimiento = KardexMovimientoUI;

interface KardexUiFilters {
  selectedTipo: 'vacuna' | 'jeringa' | 'todos';
  selectedItem: string;
  selectedLote: string;
  fechaInicio: string;
  fechaFin: string;
  tipoMovimiento: string;
  searchTerm: string;
  establecimientoOrigenId: string;
  establecimientoDestinoId: string;
}

const DEFAULT_UI_FILTERS: KardexUiFilters = {
  selectedTipo: 'todos',
  selectedItem: '',
  selectedLote: '',
  fechaInicio: '',
  fechaFin: '',
  tipoMovimiento: 'todos',
  searchTerm: '',
  establecimientoOrigenId: '',
  establecimientoDestinoId: '',
};

const toUiFilters = (filtros: KardexFilters): KardexUiFilters => ({
  selectedTipo: filtros.tipo || 'todos',
  selectedItem: filtros.itemId || '',
  selectedLote: filtros.loteId || '',
  fechaInicio: filtros.fechaInicio || '',
  fechaFin: filtros.fechaFin || '',
  tipoMovimiento: filtros.tipoMovimiento || 'todos',
  searchTerm: filtros.search || '',
  establecimientoOrigenId: filtros.establecimientoOrigenId || '',
  establecimientoDestinoId: filtros.establecimientoDestinoId || '',
});

const buildRequestFilters = (uiFilters: KardexUiFilters, limit: number): KardexFilters => ({
  tipo: uiFilters.selectedTipo !== 'todos' ? uiFilters.selectedTipo : undefined,
  itemId: uiFilters.selectedItem || undefined,
  loteId: uiFilters.selectedLote || undefined,
  tipoMovimiento: uiFilters.tipoMovimiento !== 'todos'
    ? (uiFilters.tipoMovimiento as KardexFilters['tipoMovimiento'])
    : undefined,
  fechaInicio: uiFilters.fechaInicio || undefined,
  fechaFin: uiFilters.fechaFin || undefined,
  search: uiFilters.searchTerm.trim() || undefined,
  establecimientoOrigenId: uiFilters.establecimientoOrigenId || undefined,
  establecimientoDestinoId: uiFilters.establecimientoDestinoId || undefined,
  page: 1,
  limit,
});

const Kardex: React.FC = () => {
  const {
    movimientos,
    total,
    vacunas,
    jeringas,
    establecimientos,
    lotes,
    currentPage,
    itemsPerPage,
    totalPages,
    loading,
    loadingEstadisticas,
    loadingFiltros,
    error,
    errorEstadisticas,
    errorFiltros,
    filtros,
    cargarLotes,
    actualizarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarItemsPorPagina,
    irAPrimeraPagina,
    irAUltimaPagina,
    refrescarTodo,
  } = useKardexData();

  const [uiFilters, setUiFilters] = useState<KardexUiFilters>(DEFAULT_UI_FILTERS);
  const [exportando, setExportando] = useState(false);
  const [errorExportacion, setErrorExportacion] = useState<string | null>(null);
  const [selectedMovimiento, setSelectedMovimiento] = useState<KardexMovimiento | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filtersHydratedRef = useRef(false);
  const skipNextDebounceRef = useRef(false);
  const itemsPerPageRef = useRef(itemsPerPage);

  useEffect(() => {
    itemsPerPageRef.current = itemsPerPage;
  }, [itemsPerPage]);

  useEffect(() => {
    if (filtersHydratedRef.current) {
      return;
    }

    filtersHydratedRef.current = true;
    skipNextDebounceRef.current = true;
    setUiFilters(toUiFilters(filtros));
  }, [filtros]);

  useEffect(() => {
    if (!filtersHydratedRef.current) {
      return undefined;
    }

    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      void actualizarFiltros(buildRequestFilters(uiFilters, itemsPerPageRef.current));
    }, KARDEX_FILTER_DEBOUNCE);

    return () => window.clearTimeout(timeoutId);
  }, [actualizarFiltros, uiFilters]);

  const handleTipoChange = useCallback((tipo: 'vacuna' | 'jeringa' | 'todos') => {
    setUiFilters((current) => ({
      ...current,
      selectedTipo: tipo,
      selectedItem: '',
      selectedLote: '',
    }));

    void cargarLotes('vacuna', undefined);
  }, [cargarLotes]);

  const handleItemChange = useCallback((itemId: string) => {
    setUiFilters((current) => ({
      ...current,
      selectedItem: itemId,
      selectedLote: '',
    }));

    if (itemId && uiFilters.selectedTipo !== 'todos') {
      void cargarLotes(uiFilters.selectedTipo, itemId);
      return;
    }

    void cargarLotes('vacuna', undefined);
  }, [cargarLotes, uiFilters.selectedTipo]);

  const handleClearFilters = useCallback(() => {
    skipNextDebounceRef.current = true;
    setUiFilters(DEFAULT_UI_FILTERS);
    setErrorExportacion(null);
    void cargarLotes('vacuna', undefined);
    void limpiarFiltros();
  }, [cargarLotes, limpiarFiltros]);

  const handleExportarExcel = useCallback(async () => {
    if (!uiFilters.fechaInicio || !uiFilters.fechaFin) {
      setErrorExportacion('Seleccione un rango de fechas para exportar el kardex.');
      return;
    }

    try {
      setExportando(true);
      setErrorExportacion(null);

      const config: KardexExportConfig = {
        incluirDetalleCompleto: true,
        incluirTrazabilidad: true,
        incluirEstadisticas: true,
        formatoExportacion: 'excel',
        filtros: buildRequestFilters(uiFilters, itemsPerPageRef.current),
      };

      await KardexExportService.exportToExcel(config);
    } catch (error) {
      setErrorExportacion(error instanceof Error ? error.message : 'No se pudo exportar el kardex.');
    } finally {
      setExportando(false);
    }
  }, [uiFilters]);

  const handleVerDetalle = useCallback((movimiento: KardexMovimiento) => {
    setSelectedMovimiento(movimiento);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetalle = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedMovimiento(null);
  }, []);

  const exportHint = useMemo(() => {
    if (exportando) {
      return 'Preparando exportación...';
    }

    if (uiFilters.fechaInicio && uiFilters.fechaFin) {
      return 'Exportación disponible.';
    }

    return 'Define el periodo para exportar.';
  }, [exportando, uiFilters.fechaFin, uiFilters.fechaInicio]);

  const errorMessage = useMemo(
    () =>
      [
        error ? `Movimientos: ${error}` : null,
        errorEstadisticas ? `Estadísticas: ${errorEstadisticas}` : null,
        errorFiltros ? `Filtros: ${errorFiltros}` : null,
        errorExportacion ? `Exportación: ${errorExportacion}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
    [error, errorEstadisticas, errorExportacion, errorFiltros],
  );

  const liveRegionMessage = loading || loadingEstadisticas
    ? 'Actualizando resultados del kardex.'
    : `Mostrando ${total.toLocaleString()} movimientos.`;

  const canRetry = Boolean(error || errorEstadisticas || errorFiltros);
  const isExportEnabled = Boolean(uiFilters.fechaInicio && uiFilters.fechaFin) && !exportando;

  return (
    <main className="min-h-[calc(100dvh-128px)] overflow-hidden rounded-4xl border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] sm:-m-2">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col`}>
        <KardexHeader
          loading={loading}
          loadingEstadisticas={loadingEstadisticas}
          loadingFiltros={loadingFiltros}
          onRefresh={() => {
            void refrescarTodo();
          }}
          onExport={() => {
            void handleExportarExcel();
          }}
          exportando={exportando}
          isExportEnabled={isExportEnabled}
        />

        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div aria-live="polite" className="sr-only">
            {liveRegionMessage}
          </div>

        {errorMessage ? (
          <ErrorAlert
            message={errorMessage}
            onRetry={
              canRetry
                ? () => {
                    void refrescarTodo();
                  }
                : undefined
            }
          />
        ) : null}

        <KardexFiltros
          selectedTipo={uiFilters.selectedTipo}
          selectedItem={uiFilters.selectedItem}
          selectedLote={uiFilters.selectedLote}
          fechaInicio={uiFilters.fechaInicio}
          fechaFin={uiFilters.fechaFin}
          tipoMovimiento={uiFilters.tipoMovimiento}
          searchTerm={uiFilters.searchTerm}
          establecimientoOrigenId={uiFilters.establecimientoOrigenId}
          establecimientoDestinoId={uiFilters.establecimientoDestinoId}
          vacunas={vacunas}
          jeringas={jeringas}
          establecimientos={establecimientos}
          lotes={lotes}
          exportHint={exportHint}
          onTipoChange={handleTipoChange}
          onItemChange={handleItemChange}
          onLoteChange={(selectedLote) =>
            setUiFilters((current) => ({
              ...current,
              selectedLote,
            }))}
          onFechaInicioChange={(fechaInicio) =>
            setUiFilters((current) => ({
              ...current,
              fechaInicio,
            }))}
          onFechaFinChange={(fechaFin) =>
            setUiFilters((current) => ({
              ...current,
              fechaFin,
            }))}
          onTipoMovimientoChange={(tipoMovimiento) =>
            setUiFilters((current) => ({
              ...current,
              tipoMovimiento,
            }))}
          onSearchChange={(searchTerm) =>
            setUiFilters((current) => ({
              ...current,
              searchTerm,
            }))}
          onEstablecimientoOrigenChange={(establecimientoOrigenId) =>
            setUiFilters((current) => ({
              ...current,
              establecimientoOrigenId,
            }))}
          onEstablecimientoDestinoChange={(establecimientoDestinoId) =>
            setUiFilters((current) => ({
              ...current,
              establecimientoDestinoId,
            }))}
          onLimpiarFiltros={handleClearFilters}
        />

        <KardexTabla
          movimientos={movimientos}
          total={total}
          loading={loading}
          vacunas={vacunas}
          jeringas={jeringas}
          establecimientos={establecimientos}
          onVerDetalle={handleVerDetalle}
        />

        <section className="bg-transparent">
          <KardexPaginacion
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            total={total}
            loading={loading}
            onPageChange={cambiarPagina}
            onItemsPerPageChange={cambiarItemsPorPagina}
            onFirstPage={irAPrimeraPagina}
            onLastPage={irAUltimaPagina}
          />
        </section>
        </div>
      </div>

      <MovimientoDetalleModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetalle}
        movimiento={selectedMovimiento}
        establecimientos={establecimientos}
      />
    </main>
  );
};

export default Kardex;
 