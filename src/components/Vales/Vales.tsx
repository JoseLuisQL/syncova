import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useStockEvents } from '../../utils/stockEventEmitter';
import { ArrowsClockwise, Gear, X, SpinnerGap } from '@phosphor-icons/react';
import { ValeEntrega, ValesService, ValeTypeSelectionConfig, type ValesFilters as ValesQueryFilters } from '../../services/valesService';
import { useVales } from '../../hooks/useVales';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import { MODULE_LAYOUT } from '../../styles/layout';
import ValeDetalleModal from './ValeDetalleModal';
import ValesConnectionTest from './ValesConnectionTest';
import ValeExportModal from './ValeExportModal';
import ConfirmacionModal from './ConfirmacionModal';
import ValeTypeSelectionModal from './ValeTypeSelectionModal';
import { ValesHeader, ValesFilters, ValesTabla } from './components';
import { MESES, COMPONENT_STYLES } from './constants';

interface ValesProps {
  initialCentroAcopioId?: string;
  initialVacunaId?: string;
  initialMes?: number;
  initialAnio?: number;
  onClose?: () => void;
}

type ValeEstadoFilter = 'todos' | NonNullable<ValesQueryFilters['estado']>;

const Vales: React.FC<ValesProps> = ({
  initialCentroAcopioId,
  initialMes,
  initialAnio,
  onClose
}) => {
  const { toast } = useToastContext();
  const { emitValeGenerated } = useStockEvents();

  // Hooks para gestión de datos
  const {
    vales,
    isLoading,
    isGenerating,
    isReverting,
    isSyncing,
    modificaciones,
    ultimaSincronizacion,
    loadVales,
    generarVale,
    sincronizarVale,
    sincronizarValesAutomaticamente
  } = useVales();

  const { centrosAcopio, loadEstablecimientos, loadCentrosAcopio } = useEstablecimientos();
  const { loadVacunasActivas } = useVacunas();

  // Estados locales para filtros
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>(initialCentroAcopioId || 'todos');
  const [selectedMes, setSelectedMes] = useState<number>(initialMes || new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState<number>(initialAnio || new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<ValeEstadoFilter>('todos');

  // Estados para modales
  const [showDetalleModal, setShowDetalleModal] = useState<boolean>(false);
  const [valeSeleccionado, setValeSeleccionado] = useState<ValeEntrega | null>(null);
  const [showDiagnostico, setShowDiagnostico] = useState<boolean>(false);
  const [showModificacionesModal, setShowModificacionesModal] = useState<boolean>(false);
  const [showValeTypeSelectionModal, setShowValeTypeSelectionModal] = useState<boolean>(false);
  const [modalRefreshKey, setModalRefreshKey] = useState<number>(0);

  // Estados para modales globales
  const [showGlobalDetalleModal, setShowGlobalDetalleModal] = useState<boolean>(false);
  const [showGlobalExportModal, setShowGlobalExportModal] = useState<boolean>(false);
  const [valeGlobalCombinado, setValeGlobalCombinado] = useState<ValeEntrega | null>(null);

  // Estados para confirmación
  const [showConfirmRevertir, setShowConfirmRevertir] = useState<boolean>(false);
  const [valeParaAccion, setValeParaAccion] = useState<ValeEntrega | null>(null);
  const [procesandoAccion, setProcesandoAccion] = useState<boolean>(false);
  const [modalKey, setModalKey] = useState<number>(0);

  // Estado para feedback visual
  const [generandoVale, setGenerandoVale] = useState<boolean>(false);

  // Estados para exportación
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [valeParaExportar, setValeParaExportar] = useState<ValeEntrega | null>(null);

  // Ref para detectar cuando termina la generación
  const wasGeneratingRef = useRef<boolean>(false);

  // Cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadEstablecimientos(),
          loadCentrosAcopio(),
          loadVacunasActivas()
        ]);
      } catch {
        // Error silencioso
      }
    };
    initializeData();
  }, []);

  // Cargar vales cuando cambian los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters = {
        ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
        mes: selectedMes,
        anio: selectedAnio,
        ...(selectedEstado !== 'todos' && { estado: selectedEstado }),
        ...(searchTerm && { search: searchTerm }),
        limit: 100
      };
      loadVales(filters);
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [selectedCentroAcopio, selectedMes, selectedAnio, selectedEstado, searchTerm]);

  // Efecto para detectar cuando se termina de generar un vale
  useEffect(() => {
    const isCurrentlyGenerating = isGenerating || generandoVale;
    if (!isCurrentlyGenerating && wasGeneratingRef.current) {
      setTimeout(() => handleValeGenerado(), 300);
      wasGeneratingRef.current = false;
    } else if (isCurrentlyGenerating) {
      wasGeneratingRef.current = true;
    }
  }, [isGenerating, generandoVale]);

  // Datos derivados
  const centroAcopioSeleccionado = useMemo(() =>
    centrosAcopio.find(c => c.id === selectedCentroAcopio),
    [centrosAcopio, selectedCentroAcopio]
  );

  const valesFiltrados = useMemo(() => {
    return vales.filter(vale => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          vale.numero.toLowerCase().includes(searchLower) ||
          vale.centroAcopio.nombre.toLowerCase().includes(searchLower) ||
          (vale.observaciones && vale.observaciones.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [vales, searchTerm]);

  // Estadísticas eliminadas por requerimiento

  // Funciones de manejo
  const handleGenerarVale = useCallback(() => {
    if (!selectedCentroAcopio || selectedCentroAcopio === 'todos') {
      toast.error('Centro de acopio requerido', 'Debe seleccionar un centro de acopio específico para generar un vale.');
      return;
    }
    setModalRefreshKey(prev => prev + 1);
    setShowValeTypeSelectionModal(true);
  }, [selectedCentroAcopio, toast]);

  const executeGenerarVale = useCallback(async (config: ValeTypeSelectionConfig) => {
    setGenerandoVale(true);
    toast.info('Generando vale...', 'Procesando datos y actualizando stocks.');

    try {
      const result = await generarVale({
        centroAcopioId: selectedCentroAcopio,
        mes: selectedMes,
        anio: selectedAnio,
        usuarioId: 'temp-user-id',
        observaciones: `Vale generado para ${MESES[selectedMes - 1]} ${selectedAnio}`,
        afectarStock: true,
        tipoVale: config.tipoVale,
        entregasAdicionalesSeleccionadas: config.entregasAdicionalesSeleccionadas,
        gruposEntregasSeleccionados: config.gruposEntregasSeleccionados
      });

      if (result) {
        toast.success(
          'Vale generado exitosamente',
          `Vale ${result.vale.numero} creado con ${result.resumen.totalVacunas} vacunas.`
        );
        emitValeGenerated(selectedCentroAcopio, selectedMes, selectedAnio);
        forceUpdateVales();
        setTimeout(forceUpdateVales, 1000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar vale';
      if (errorMessage.includes('Ya existen vales')) {
        toast.error('Grupos ya generados', 'Los grupos seleccionados ya han sido generados.');
        forceUpdateVales();
        setModalRefreshKey(prev => prev + 1);
      } else {
        toast.error('Error al generar vale', errorMessage);
      }
    } finally {
      setGenerandoVale(false);
    }
  }, [selectedCentroAcopio, selectedMes, selectedAnio, generarVale, toast, emitValeGenerated]);

  const handleValeTypeSelection = useCallback((config: ValeTypeSelectionConfig) => {
    setShowValeTypeSelectionModal(false);
    executeGenerarVale(config);
  }, [executeGenerarVale]);

  const handleValeGenerado = useCallback(async () => {
    const filters = {
      ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
      mes: selectedMes,
      anio: selectedAnio,
      ...(selectedEstado !== 'todos' && { estado: selectedEstado }),
      ...(searchTerm && { search: searchTerm }),
      limit: 100
    };
    try {
      await loadVales(filters);
    } catch {
      // Error silencioso
    }
  }, [selectedCentroAcopio, selectedMes, selectedAnio, selectedEstado, searchTerm, loadVales]);

  const forceUpdateVales = useCallback(async () => {
    const basicFilters = {
      ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
      mes: selectedMes,
      anio: selectedAnio,
      limit: 100
    };
    try {
      await loadVales(basicFilters);
    } catch {
      try {
        await loadVales({ mes: selectedMes, anio: selectedAnio, limit: 100 });
      } catch {
        // Error silencioso
      }
    }
  }, [selectedCentroAcopio, selectedMes, selectedAnio, loadVales]);

  const handleSincronizar = useCallback(async () => {
    if (!selectedCentroAcopio || selectedCentroAcopio === 'todos') {
      toast.error('Centro de acopio requerido', 'Debe seleccionar un centro de acopio específico.');
      return;
    }
    try {
      const result = await sincronizarValesAutomaticamente(selectedCentroAcopio, selectedMes, selectedAnio);
      if (result) {
        const { valesSincronizados } = result;
        if (valesSincronizados > 0) {
          toast.success('Sincronización completada', `Se sincronizaron ${valesSincronizados} vales.`);
        } else {
          toast.info('Sin cambios', 'Todos los vales ya están sincronizados.');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo completar la sincronización.';
      toast.error('Error en sincronización', errorMessage);
    }
  }, [selectedCentroAcopio, selectedMes, selectedAnio, sincronizarValesAutomaticamente, toast]);

  const handleVerDetalle = useCallback((vale: ValeEntrega) => {
    if (vale && vale.id) {
      setValeSeleccionado(vale);
      setShowDetalleModal(true);
    } else {
      toast.error('Error', 'No se pudo cargar la información del vale.');
    }
  }, [toast]);

  const handleExportar = useCallback((vale: ValeEntrega) => {
    if (!vale || !vale.id) {
      toast.error('Error', 'Vale inválido para exportar');
      return;
    }
    setValeParaExportar(vale);
    setShowExportModal(true);
  }, [toast]);

  const handleRevertir = useCallback((vale: ValeEntrega) => {
    if (!vale || !vale.id || !vale.numero) {
      toast.error('Error', 'No se pudo identificar el vale.');
      return;
    }
    setShowConfirmRevertir(false);
    setProcesandoAccion(false);
    setValeParaAccion(vale);
    setModalKey(prev => prev + 1);
    setTimeout(() => setShowConfirmRevertir(true), 10);
  }, [toast]);

  const handleConfirmRevertir = useCallback(async () => {
    if (!valeParaAccion || !valeParaAccion.id) {
      toast.error('Error', 'No se pudo identificar el vale.');
      return;
    }
    const valeNumero = valeParaAccion.numero;
    const valeId = valeParaAccion.id;
    setProcesandoAccion(true);
    toast.info('Revirtiendo vale...', 'Procesando reversión y restaurando stocks.');

    try {
      const serviceResponse = await ValesService.revertirVale(valeId);
      if (serviceResponse.success) {
        setProcesandoAccion(false);
        setShowConfirmRevertir(false);
        setValeParaAccion(null);
        toast.success('Vale revertido', `El vale ${valeNumero} ha sido revertido.`);
        await forceUpdateVales();
        setTimeout(forceUpdateVales, 300);
      } else {
        throw new Error(serviceResponse.error || 'No se pudo revertir el vale.');
      }
    } catch (error: unknown) {
      setProcesandoAccion(false);
      setShowConfirmRevertir(false);
      setValeParaAccion(null);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido.';
      toast.error('Error al revertir', errorMessage);
    }
  }, [valeParaAccion, toast, forceUpdateVales]);

  const handleRefresh = useCallback(() => {
    loadVales({
      ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
      mes: selectedMes,
      anio: selectedAnio,
      ...(selectedEstado !== 'todos' && { estado: selectedEstado }),
      ...(searchTerm && { search: searchTerm }),
      limit: 100
    });
  }, [selectedCentroAcopio, selectedMes, selectedAnio, selectedEstado, searchTerm, loadVales]);

  const handleCerrarExportModal = useCallback(() => {
    setShowExportModal(false);
    setValeParaExportar(null);
  }, []);

  const handleCerrarModalesGlobales = useCallback(() => {
    setShowGlobalDetalleModal(false);
    setShowGlobalExportModal(false);
    setValeGlobalCombinado(null);
  }, []);

  return (
    <main className={onClose ? 'w-full bg-zinc-50 flex-1 overflow-y-auto h-full rounded-[24px]' : COMPONENT_STYLES.pageBackground} role="main">
      {/* Header */}
      <ValesHeader
        onGenerarVale={handleGenerarVale}
        onSincronizar={handleSincronizar}
        onClose={onClose}
        isGenerating={isGenerating || generandoVale}
        isSyncing={isSyncing}
        centroAcopioSeleccionado={selectedCentroAcopio !== 'todos'}
      />

      {/* Contenido principal */}
      <section className={`${MODULE_LAYOUT.fullWidth} ${MODULE_LAYOUT.pageSpacingX} py-6 space-y-6`}>

        {/* Filtros */}
        <ValesFilters
          selectedCentroAcopio={selectedCentroAcopio}
          selectedMes={selectedMes}
          selectedAnio={selectedAnio}
          selectedEstado={selectedEstado}
          searchTerm={searchTerm}
          centrosAcopio={centrosAcopio}
          isLoading={isLoading}
          onCentroAcopioChange={setSelectedCentroAcopio}
          onMesChange={setSelectedMes}
          onAnioChange={setSelectedAnio}
          onEstadoChange={setSelectedEstado}
          onSearchChange={setSearchTerm}
          onRefresh={handleRefresh}
        />

        {/* Tabla */}
        <ValesTabla
          vales={valesFiltrados}
          isLoading={isLoading}
          isReverting={isReverting}
          onVerDetalle={handleVerDetalle}
          onExportar={handleExportar}
          onRevertir={handleRevertir}
        />
      </section>

      {/* Modales */}
      {valeSeleccionado && (
        <ValeDetalleModal
          vale={valeSeleccionado}
          isOpen={showDetalleModal && valeSeleccionado !== null}
          onClose={() => {
            setShowDetalleModal(false);
            setValeSeleccionado(null);
          }}
        />
      )}

      {showExportModal && valeParaExportar && (
        <ValeExportModal
          vale={valeParaExportar}
          isOpen={showExportModal}
          onClose={handleCerrarExportModal}
          esExportacionIndividual={true}
        />
      )}

      <ValeTypeSelectionModal
        key={`${selectedCentroAcopio}-${selectedMes}-${selectedAnio}-${modalRefreshKey}`}
        isOpen={showValeTypeSelectionModal}
        onClose={() => setShowValeTypeSelectionModal(false)}
        onConfirm={handleValeTypeSelection}
        centroAcopioId={selectedCentroAcopio}
        centroAcopioNombre={centroAcopioSeleccionado?.nombre || ''}
        mes={selectedMes}
        anio={selectedAnio}
      />

      {showDiagnostico && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
                  <Gear weight="bold" className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Diagnóstico de Conectividad</h3>
                  <p className="text-sm text-gray-600">Verificación del estado del sistema</p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnostico(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X weight="bold" className="h-5 w-5 text-zinc-500" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-120px)] p-6">
              <ValesConnectionTest />
            </div>
          </div>
        </div>
      )}

      {generandoVale && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 animate-pulse">
          <SpinnerGap weight="bold" className="h-5 w-5 animate-spin" />
          <div>
            <p className="font-medium">Generando Vale de Entrega</p>
            <p className="text-sm opacity-90">Procesando datos y actualizando stocks...</p>
          </div>
        </div>
      )}

      {valeParaAccion && valeParaAccion.numero && (
        <ConfirmacionModal
          key={`revertir-${modalKey}`}
          isOpen={showConfirmRevertir}
          onClose={() => {
            if (!procesandoAccion) {
              setShowConfirmRevertir(false);
              setValeParaAccion(null);
            }
          }}
          onConfirm={handleConfirmRevertir}
          valeNumero={valeParaAccion.numero}
          isProcessing={procesandoAccion}
        />
      )}

      {showModificacionesModal && valeSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <ArrowsClockwise weight="bold" className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Modificaciones del Vale {valeSeleccionado.numero}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Sincronización con datos actualizados
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModificacionesModal(false);
                  setValeSeleccionado(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X weight="bold" className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Centro de Acopio</p>
                    <p className="font-medium">{valeSeleccionado.centroAcopio.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Período</p>
                    <p className="font-medium">{valeSeleccionado.mes}/{valeSeleccionado.anio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Vacunas</p>
                    <p className="font-medium">{valeSeleccionado.totalVacunas.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Establecimientos</p>
                    <p className="font-medium">{valeSeleccionado.totalEstablecimientos}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <button
                  onClick={() => sincronizarVale(valeSeleccionado.id)}
                  disabled={isSyncing}
                  className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSyncing ? (
                    <>
                      <SpinnerGap weight="bold" className="h-5 w-5 animate-spin" />
                      <span>Sincronizando vale...</span>
                    </>
                  ) : (
                    <>
                      <ArrowsClockwise weight="bold" className="h-5 w-5" />
                      <span>Sincronizar con datos actualizados</span>
                    </>
                  )}
                </button>
              </div>

              {modificaciones.length > 0 ? (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Modificaciones Detectadas ({modificaciones.length})
                  </h4>
                  <div className="space-y-3">
                    {modificaciones.map((modificacion, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                modificacion.tipo === 'cantidad_programada_modificada' ? 'bg-teal-100 text-teal-800' :
                                modificacion.tipo === 'entrega_adicional_modificada' ? 'bg-amber-100 text-amber-800' :
                                modificacion.tipo === 'entrega_adicional_agregada' ? 'bg-emerald-100 text-emerald-800' :
                                modificacion.tipo === 'establecimiento_agregado' ? 'bg-cyan-100 text-cyan-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {modificacion.tipo.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {modificacion.establecimientoNombre} - {modificacion.vacunaNombre}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span>Anterior: {modificacion.cantidadAnterior.toLocaleString()}</span>
                              <span>→</span>
                              <span>Nueva: {modificacion.cantidadNueva.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className={`text-right ${
                            modificacion.diferencia > 0 ? 'text-emerald-600' :
                            modificacion.diferencia < 0 ? 'text-rose-600' : 'text-gray-600'
                          }`}>
                            <p className="font-medium">
                              {modificacion.diferencia > 0 ? '+' : ''}{modificacion.diferencia.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-200/60 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowsClockwise weight="bold" className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Vale Sincronizado</h4>
                  <p className="text-gray-600">
                    Este vale está actualizado con los datos más recientes.
                  </p>
                </div>
              )}

              {ultimaSincronizacion && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Última sincronización: {ultimaSincronizacion.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {valeGlobalCombinado && (
        <>
          <ValeDetalleModal
            vale={valeGlobalCombinado}
            isOpen={showGlobalDetalleModal}
            onClose={handleCerrarModalesGlobales}
          />
          <ValeExportModal
            vale={valeGlobalCombinado}
            isOpen={showGlobalExportModal}
            onClose={handleCerrarModalesGlobales}
            valesOriginales={valesFiltrados}
            esExportacionGlobal={true}
          />
        </>
      )}
    </main>
  );
};

export default Vales;
