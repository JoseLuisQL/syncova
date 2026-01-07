import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useKardexData } from '../../hooks/useKardexData';
import { KardexExportService, KardexExportConfig } from '../../services/KardexExportService';
import { COMPONENT_STYLES } from './constants';
import {
  KardexHeader,
  KardexFiltros,
  KardexEstadisticas,
  KardexTabla,
  KardexPaginacion,
  MovimientoDetalleModal,
} from './components';

// Tipo para movimiento de Kardex
interface KardexMovimiento {
  id: string;
  tipo: 'vacuna' | 'jeringa';
  itemId: string;
  loteId: string;
  tipoMovimiento: string;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  fechaMovimiento: string;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  usuarioId: string;
  item?: { nombre: string };
  lote?: { numero: string; fechaVencimiento?: string };
  usuario?: { nombres: string; apellidos: string; email: string };
  establecimientoOrigen?: { nombre: string };
  establecimientoDestino?: { nombre: string };
}

const Kardex: React.FC = () => {
  // Hook personalizado para manejar los datos del kardex
  const {
    movimientos,
    estadisticas,
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
    cambiarPagina,
    cambiarItemsPorPagina,
    irAPrimeraPagina,
    irAUltimaPagina,
    refrescarTodo,
    limpiarErrores,
  } = useKardexData();

  // Estados locales para los filtros del UI
  const [selectedTipo, setSelectedTipo] = useState<'vacuna' | 'jeringa' | 'todos'>('todos');
  const [selectedItem, setSelectedItem] = useState<string>('todos');
  const [selectedLote, setSelectedLote] = useState<string>('todos');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [tipoMovimiento, setTipoMovimiento] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para exportación
  const [exportando, setExportando] = useState(false);
  const [errorExportacion, setErrorExportacion] = useState<string | null>(null);

  // Estado para modal de detalles
  const [selectedMovimiento, setSelectedMovimiento] = useState<KardexMovimiento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ref para controlar inicialización de fechas (solo una vez)
  const fechasInicializadas = useRef(false);

  // Inicializar fechas solo una vez al cargar
  useEffect(() => {
    if (!fechasInicializadas.current && filtros.fechaInicio && filtros.fechaFin) {
      setFechaInicio(filtros.fechaInicio);
      setFechaFin(filtros.fechaFin);
      fechasInicializadas.current = true;
    }
  }, [filtros.fechaInicio, filtros.fechaFin]);

  // Cargar lotes cuando cambie el tipo o item seleccionado
  useEffect(() => {
    if (selectedItem !== 'todos' && selectedTipo !== 'todos') {
      cargarLotes(selectedTipo as 'vacuna' | 'jeringa', selectedItem);
    }
  }, [selectedTipo, selectedItem, cargarLotes]);

  // Aplicar filtros
  const handleAplicarFiltros = useCallback(() => {
    const nuevosFiltros = {
      tipo: selectedTipo !== 'todos' ? (selectedTipo as 'vacuna' | 'jeringa') : undefined,
      itemId: selectedItem !== 'todos' ? selectedItem : undefined,
      loteId: selectedLote !== 'todos' ? selectedLote : undefined,
      tipoMovimiento: tipoMovimiento !== 'todos' ? tipoMovimiento : undefined,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      search: searchTerm || undefined,
      page: 1,
      limit: 20, // 20 items por página según ISO 25010
    };
    actualizarFiltros(nuevosFiltros);
  }, [selectedTipo, selectedItem, selectedLote, tipoMovimiento, fechaInicio, fechaFin, searchTerm, actualizarFiltros]);

  // Limpiar filtros
  const handleLimpiarFiltros = useCallback(() => {
    setSelectedTipo('todos');
    setSelectedItem('todos');
    setSelectedLote('todos');
    setTipoMovimiento('todos');
    setSearchTerm('');
    setFechaInicio('');
    setFechaFin('');
  }, []);

  // Exportar a Excel
  const handleExportarExcel = useCallback(async () => {
    if (!fechaInicio || !fechaFin) {
      setErrorExportacion('Debe seleccionar las fechas de inicio y fin para exportar');
      return;
    }

    try {
      setExportando(true);
      setErrorExportacion(null);

      const filtrosExportacion = {
        tipo: selectedTipo !== 'todos' ? (selectedTipo as 'vacuna' | 'jeringa') : undefined,
        itemId: selectedItem !== 'todos' ? selectedItem : undefined,
        loteId: selectedLote !== 'todos' ? selectedLote : undefined,
        tipoMovimiento: tipoMovimiento !== 'todos' ? tipoMovimiento : undefined,
        fechaInicio,
        fechaFin,
        search: searchTerm || undefined,
      };

      const config: KardexExportConfig = {
        incluirDetalleCompleto: true,
        incluirTrazabilidad: true,
        incluirEstadisticas: true,
        formatoExportacion: 'excel',
        filtros: filtrosExportacion,
      };

      await KardexExportService.exportToExcel(config);
    } catch (err) {
      setErrorExportacion(err instanceof Error ? err.message : 'Error al exportar');
    } finally {
      setExportando(false);
    }
  }, [selectedTipo, selectedItem, selectedLote, tipoMovimiento, fechaInicio, fechaFin, searchTerm]);

  // Verificar si la exportación está habilitada
  const isExportEnabled = !!(fechaInicio && fechaFin) && !exportando;

  // Obtener tooltip para exportar
  const getExportTooltip = () => {
    if (exportando) return 'Exportando...';
    if (!fechaInicio || !fechaFin) return 'Seleccione fechas para exportar';
    return 'Exportar a Excel';
  };

  // Ver detalles de movimiento
  const handleVerDetalle = useCallback((movimiento: KardexMovimiento) => {
    setSelectedMovimiento(movimiento);
    setIsModalOpen(true);
  }, []);

  // Cerrar modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMovimiento(null);
  }, []);

  // Verificar si hay filtros activos
  const filtrosActivos = selectedTipo !== 'todos' || selectedItem !== 'todos' || 
                          selectedLote !== 'todos' || tipoMovimiento !== 'todos' || 
                          searchTerm || fechaInicio || fechaFin;

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header */}
      <KardexHeader
        loading={loading}
        loadingEstadisticas={loadingEstadisticas}
        loadingFiltros={loadingFiltros}
        onRefresh={refrescarTodo}
        onExport={handleExportarExcel}
        exportando={exportando}
        isExportEnabled={isExportEnabled}
        exportTooltip={getExportTooltip()}
      />

      {/* Contenido Principal */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Errores */}
        {(error || errorEstadisticas || errorFiltros || errorExportacion) && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-rose-600 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-rose-800">Error</h3>
                <div className="mt-1 text-sm text-rose-700">
                  {error && <p>• Movimientos: {error}</p>}
                  {errorEstadisticas && <p>• Estadísticas: {errorEstadisticas}</p>}
                  {errorFiltros && <p>• Filtros: {errorFiltros}</p>}
                  {errorExportacion && <p>• Exportación: {errorExportacion}</p>}
                </div>
                <button
                  onClick={() => {
                    limpiarErrores();
                    setErrorExportacion(null);
                  }}
                  className="mt-2 text-sm text-rose-600 hover:text-rose-800 underline"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <KardexFiltros
          selectedTipo={selectedTipo}
          selectedItem={selectedItem}
          selectedLote={selectedLote}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          tipoMovimiento={tipoMovimiento}
          searchTerm={searchTerm}
          vacunas={vacunas}
          jeringas={jeringas}
          lotes={lotes}
          loadingFiltros={loadingFiltros}
          onTipoChange={setSelectedTipo}
          onItemChange={setSelectedItem}
          onLoteChange={setSelectedLote}
          onFechaInicioChange={setFechaInicio}
          onFechaFinChange={setFechaFin}
          onTipoMovimientoChange={setTipoMovimiento}
          onSearchChange={setSearchTerm}
          onAplicarFiltros={handleAplicarFiltros}
          onLimpiarFiltros={handleLimpiarFiltros}
        />

        {/* Estadísticas */}
        <KardexEstadisticas
          estadisticas={estadisticas}
          loading={loadingEstadisticas}
        />

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <KardexTabla
            movimientos={movimientos}
            total={total}
            loading={loading}
            vacunas={vacunas}
            jeringas={jeringas}
            establecimientos={establecimientos}
            onVerDetalle={handleVerDetalle}
            filtrosActivos={filtrosActivos}
          />

          {/* Paginación */}
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
        </div>
      </div>

      {/* Modal de Detalles */}
      <MovimientoDetalleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        movimiento={selectedMovimiento}
        establecimientos={establecimientos}
      />
    </main>
  );
};

export default Kardex;
