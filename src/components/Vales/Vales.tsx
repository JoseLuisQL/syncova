import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useStockEvents } from '../../utils/stockEventEmitter';
import {
  ArrowCounterClockwise,
  ArrowsClockwise,
  CheckCircle,
  Download,
  Eye,
  Gear,
  Package,
  Plus,
  Receipt,
  SpinnerGap,
  Stack,
  X,
} from '@phosphor-icons/react';
import { ValeEntrega, ValesService, ValeTypeSelectionConfig, type ValesFilters as ValesQueryFilters } from '../../services/valesService';
import { useVales } from '../../hooks/useVales';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import ValeDetalleModal from './ValeDetalleModal';
import ValesConnectionTest from './ValesConnectionTest';
import ValeExportModal from './ValeExportModal';
import ConfirmacionModal from './ConfirmacionModal';
import ValeTypeSelectionModal from './ValeTypeSelectionModal';
import { DataTable, EmptyState, FilterBar, TableCell, TableHeader, TableRow } from '../Establecimientos/components';
import { COMPONENT_STYLES as ESTABLECIMIENTOS_STYLES } from '../Establecimientos/constants';
import { MESES, ANIOS_DISPONIBLES } from './constants';

interface ValesProps {
  initialCentroAcopioId?: string;
  initialVacunaId?: string;
  initialMes?: number;
  initialAnio?: number;
  onClose?: () => void;
}

type ValeEstadoFilter = 'todos' | NonNullable<ValesQueryFilters['estado']>;

const TABLE_COLUMNS = [
  { key: 'numero', label: 'Número' },
  { key: 'centro', label: 'Centro de acopio' },
  { key: 'tipo', label: 'Tipo', align: 'center' as const },
  { key: 'totales', label: 'Totales', align: 'center' as const },
  { key: 'estado', label: 'Estado', align: 'center' as const },
  { key: 'fecha', label: 'Fecha', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const getTipoVale = (vale: ValeEntrega) => {
  const adicionales = new Set<number>();
  const tieneBase = vale.detalles?.some((detalle) => detalle.cantidadProgramada > 0) ?? false;

  vale.detalles?.forEach((detalle) => {
    if (detalle.cantidadAdicional > 0 && detalle.numeroEntregaAdicional) {
      adicionales.add(detalle.numeroEntregaAdicional);
    }
  });

  if (tieneBase && adicionales.size > 0) {
    return { label: 'Completo', icon: Stack };
  }

  if (adicionales.size > 0) {
    return { label: `Adic. #${adicionales.size}`, icon: Plus };
  }

  return { label: 'Base', icon: CheckCircle };
};

const estadoClassName: Record<ValeEntrega['estado'], string> = {
  generado: ESTABLECIMIENTOS_STYLES.badge.active,
  impreso: ESTABLECIMIENTOS_STYLES.badge.warning,
  entregado: ESTABLECIMIENTOS_STYLES.badge.neutral,
};

const estadoLabel: Record<ValeEntrega['estado'], string> = {
  generado: 'Generado',
  impreso: 'Impreso',
  entregado: 'Entregado',
};

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
    total,
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

  const { centrosAcopio, loadEstablecimientos, loadCentrosAcopio } = useEstablecimientos(undefined, { autoLoad: false });
  const { loadVacunasActivas } = useVacunas(undefined, { autoLoad: false });

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
  }, [loadCentrosAcopio, loadEstablecimientos, loadVacunasActivas]);

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
  }, [loadVales, selectedCentroAcopio, selectedMes, selectedAnio, selectedEstado, searchTerm]);

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

  const filtersConfig = useMemo(
    () => [
      {
        id: 'vales-centro-acopio',
        label: 'Centro de acopio',
        value: selectedCentroAcopio,
        options: [
          { value: 'todos', label: 'Todos los centros' },
          ...centrosAcopio.map((centro) => ({
            value: centro.id,
            label: centro.nombre,
          })),
        ],
        onChange: setSelectedCentroAcopio,
      },
      {
        id: 'vales-mes',
        label: 'Mes',
        value: String(selectedMes),
        options: MESES.map((mes, index) => ({
          value: String(index + 1),
          label: mes,
        })),
        onChange: (value: string) => setSelectedMes(Number(value)),
      },
      {
        id: 'vales-anio',
        label: 'Año',
        value: String(selectedAnio),
        options: ANIOS_DISPONIBLES.map((anioDisponible) => ({
          value: String(anioDisponible),
          label: String(anioDisponible),
        })),
        onChange: (value: string) => setSelectedAnio(Number(value)),
      },
      {
        id: 'vales-estado',
        label: 'Estado',
        value: selectedEstado,
        options: [
          { value: 'todos', label: 'Todos los estados' },
          { value: 'generado', label: 'Generado' },
          { value: 'impreso', label: 'Impreso' },
          { value: 'entregado', label: 'Entregado' },
        ],
        onChange: (value: string) => setSelectedEstado(value as ValeEstadoFilter),
      },
    ],
    [centrosAcopio, selectedAnio, selectedCentroAcopio, selectedEstado, selectedMes],
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCentroAcopio(initialCentroAcopioId || 'todos');
    setSelectedMes(initialMes || new Date().getMonth() + 1);
    setSelectedAnio(initialAnio || new Date().getFullYear());
    setSelectedEstado('todos');
  }, [initialAnio, initialCentroAcopioId, initialMes]);

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
    <main className={onClose ? 'h-full w-full flex-1 overflow-y-auto bg-white' : ESTABLECIMIENTOS_STYLES.pageBackground} role="main">
      <section className={`${ESTABLECIMIENTOS_STYLES.surface} p-4 sm:p-6`}>
        <div className="space-y-4">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por número, centro u observación"
            filters={filtersConfig}
            onClear={handleClearFilters}
            actions={
              <>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className={ESTABLECIMIENTOS_STYLES.button.secondary}
                >
                  <ArrowsClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="bold" />
                  <span>Actualizar</span>
                </button>
                <button
                  type="button"
                  onClick={handleSincronizar}
                  disabled={selectedCentroAcopio === 'todos' || isSyncing || isGenerating || generandoVale}
                  className={ESTABLECIMIENTOS_STYLES.button.secondary}
                >
                  <ArrowsClockwise className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} weight="bold" />
                  <span>Sincronizar</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerarVale}
                  disabled={selectedCentroAcopio === 'todos' || isGenerating || generandoVale}
                  className={ESTABLECIMIENTOS_STYLES.button.primary}
                >
                  {isGenerating || generandoVale ? (
                    <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" />
                  ) : (
                    <Plus className="h-4 w-4" weight="bold" />
                  )}
                  <span>{isGenerating || generandoVale ? 'Generando...' : 'Generar vale'}</span>
                </button>
                {onClose ? (
                  <button type="button" onClick={onClose} className={ESTABLECIMIENTOS_STYLES.button.ghost}>
                    <X className="h-4 w-4" weight="bold" />
                    <span>Cerrar</span>
                  </button>
                ) : null}
              </>
            }
          />

          <div className="hidden lg:block">
            <DataTable
              isLoading={isLoading}
              loadingMessage="Cargando vales..."
              skeletonRows={5}
              skeletonColumns={TABLE_COLUMNS.length}
              loadingVariant="table"
            >
              <table className="min-w-full border-separate border-spacing-0">
                <TableHeader columns={TABLE_COLUMNS} />
                <tbody className="bg-white">
                  {valesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={TABLE_COLUMNS.length + 1}>
                        <EmptyState
                          icon={Receipt}
                          title="Sin vales generados"
                          description="Ajuste los filtros o genere un nuevo vale para el centro seleccionado."
                          action={selectedCentroAcopio !== 'todos' ? { label: 'Generar vale', onClick: handleGenerarVale } : undefined}
                        />
                      </td>
                    </tr>
                  ) : (
                    valesFiltrados.map((vale) => (
                      <ValeDesktopRow
                        key={vale.id}
                        vale={vale}
                        isLoading={isReverting}
                        onVerDetalle={() => handleVerDetalle(vale)}
                        onExportar={() => handleExportar(vale)}
                        onRevertir={() => handleRevertir(vale)}
                      />
                    ))
                  )}
                </tbody>
              </table>

              <div className={ESTABLECIMIENTOS_STYLES.pagination.container}>
                <p className={ESTABLECIMIENTOS_STYLES.pagination.info}>
                  <span className="font-semibold text-[#606571]">{valesFiltrados.length}</span> de{' '}
                  <span className="font-semibold text-[#606571]">{total || valesFiltrados.length}</span> vales
                </p>
              </div>
            </DataTable>
          </div>

          <div className="space-y-3 lg:hidden">
            {isLoading ? (
              <DataTable isLoading loadingMessage="Cargando vales..." skeletonRows={4} loadingVariant="cards" />
            ) : valesFiltrados.length === 0 ? (
              <div className={ESTABLECIMIENTOS_STYLES.panel}>
                <EmptyState
                  icon={Receipt}
                  title="Sin vales generados"
                  description="Ajuste los filtros o genere un nuevo vale para el centro seleccionado."
                  action={selectedCentroAcopio !== 'todos' ? { label: 'Generar vale', onClick: handleGenerarVale } : undefined}
                />
              </div>
            ) : (
              valesFiltrados.map((vale) => (
                <ValeMobileCard
                  key={vale.id}
                  vale={vale}
                  isLoading={isReverting}
                  onVerDetalle={() => handleVerDetalle(vale)}
                  onExportar={() => handleExportar(vale)}
                  onRevertir={() => handleRevertir(vale)}
                />
              ))
            )}
          </div>
        </div>
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#111318]/20 p-4 backdrop-blur-[2px]">
          <div className="max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-[10px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]">
            <div className="flex items-center justify-between border-b border-[#eeeef3] bg-white px-5 py-3.5">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#e7e7ef] bg-[#fbfafd] text-amber-600">
                  <Gear weight="bold" className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold leading-5 text-[#15171d]">Diagnóstico de Conectividad</h3>
                  <p className="mt-1 text-[12px] leading-4 text-[#606571]">Verificación del estado del sistema</p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnostico(false)}
                className="rounded-[7px] p-1.5 transition-colors hover:bg-[#fbfafd]"
              >
                <X weight="bold" className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
            <div className="max-h-[calc(95vh-120px)] overflow-y-auto px-5 py-4">
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#111318]/20 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[10px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]">
            <div className="flex items-center justify-between border-b border-[#eeeef3] px-5 py-3.5">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#e7e7ef] bg-[#fbfafd] text-[#606571]">
                  <ArrowsClockwise weight="bold" className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold leading-5 text-[#15171d]">
                    Modificaciones del Vale {valeSeleccionado.numero}
                  </h3>
                  <p className="mt-1 text-[12px] leading-4 text-[#606571]">
                    Sincronización con datos actualizados
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModificacionesModal(false);
                  setValeSeleccionado(null);
                }}
                className="rounded-[7px] p-1.5 text-[#8b8f9b] transition-colors hover:bg-[#fbfafd] hover:text-[#15171d]"
              >
                <X weight="bold" className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-5 py-4">
              <div className="mb-5 rounded-[8px] border border-[#e7e7ef] bg-[#fbfafd] p-3">
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
                  className="flex h-9 w-full items-center justify-center space-x-2 rounded-[7px] bg-[#7c3aed] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
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
                      <div key={index} className="rounded-[8px] border border-[#e7e7ef] bg-white p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                modificacion.tipo === 'cantidad_programada_modificada' ? 'bg-[#f3f0ff] text-[#7c3aed]' :
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

interface ValeRowProps {
  vale: ValeEntrega;
  isLoading?: boolean;
  onVerDetalle: () => void;
  onExportar: () => void;
  onRevertir: () => void;
}

const ValeTypeBadge: React.FC<{ vale: ValeEntrega }> = ({ vale }) => {
  const tipo = getTipoVale(vale);
  const Icon = tipo.icon;

  return (
    <span className={ESTABLECIMIENTOS_STYLES.badge.neutral}>
      <Icon className="mr-1 h-3 w-3" weight="bold" aria-hidden="true" />
      {tipo.label}
    </span>
  );
};

const ValeEstadoBadge: React.FC<{ estado: ValeEntrega['estado'] }> = ({ estado }) => (
  <span className={estadoClassName[estado] || ESTABLECIMIENTOS_STYLES.badge.neutral}>
    {estadoLabel[estado] || estado}
  </span>
);

const ValeActions: React.FC<Omit<ValeRowProps, 'vale'>> = ({
  isLoading = false,
  onVerDetalle,
  onExportar,
  onRevertir,
}) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      type="button"
      onClick={onVerDetalle}
      disabled={isLoading}
      className={`${ESTABLECIMIENTOS_STYLES.button.icon} ${ESTABLECIMIENTOS_STYLES.button.iconView}`}
      title="Ver detalle"
    >
      <Eye className="h-4 w-4" weight="bold" aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={onExportar}
      disabled={isLoading}
      className={`${ESTABLECIMIENTOS_STYLES.button.icon} ${ESTABLECIMIENTOS_STYLES.button.iconView}`}
      title="Exportar"
    >
      <Download className="h-4 w-4" weight="bold" aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={onRevertir}
      disabled={isLoading}
      className={`${ESTABLECIMIENTOS_STYLES.button.icon} ${ESTABLECIMIENTOS_STYLES.button.iconDelete}`}
      title="Revertir"
    >
      <ArrowCounterClockwise className="h-4 w-4" weight="bold" aria-hidden="true" />
    </button>
  </div>
);

const ValeDesktopRow: React.FC<ValeRowProps> = ({
  vale,
  isLoading = false,
  onVerDetalle,
  onExportar,
  onRevertir,
}) => (
  <TableRow>
    <TableCell>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#15171d]">{vale.numero}</p>
        <p className="text-xs text-[#8b8f9b]">{MESES[vale.mes - 1]} {vale.anio}</p>
      </div>
    </TableCell>
    <TableCell>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#15171d]">{vale.centroAcopio.nombre}</p>
        <p className="text-xs text-[#8b8f9b]">{vale.centroAcopio.codigo || 'Sin código'}</p>
      </div>
    </TableCell>
    <TableCell align="center">
      <ValeTypeBadge vale={vale} />
    </TableCell>
    <TableCell align="center">
      <div className="flex flex-col items-center gap-1">
        <span className={ESTABLECIMIENTOS_STYLES.badge.count}>
          <Package className="mr-1 h-3 w-3" weight="bold" aria-hidden="true" />
          {vale.totalVacunas.toLocaleString('es-PE')}
        </span>
        <span className="text-xs text-[#8b8f9b]">
          {vale.totalEstablecimientos} establecimientos
        </span>
      </div>
    </TableCell>
    <TableCell align="center">
      <ValeEstadoBadge estado={vale.estado} />
    </TableCell>
    <TableCell align="center">
      <span className="text-sm text-[#606571]">
        {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </span>
    </TableCell>
    <TableCell align="right">
      <ValeActions
        isLoading={isLoading}
        onVerDetalle={onVerDetalle}
        onExportar={onExportar}
        onRevertir={onRevertir}
      />
    </TableCell>
  </TableRow>
);

const ValeMobileCard: React.FC<ValeRowProps> = ({
  vale,
  isLoading = false,
  onVerDetalle,
  onExportar,
  onRevertir,
}) => (
  <article className={`${ESTABLECIMIENTOS_STYLES.panel} p-4`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-zinc-950">{vale.numero}</p>
        <p className="mt-1 text-sm text-zinc-500">{vale.centroAcopio.nombre}</p>
      </div>
      <ValeEstadoBadge estado={vale.estado} />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2.5">
      <div className={ESTABLECIMIENTOS_STYLES.mutedPanel}>
        <div className="p-3">
          <p className="text-xs font-medium text-[#747986]">Periodo</p>
          <p className="mt-1 text-sm font-semibold text-[#15171d]">{MESES[vale.mes - 1]} {vale.anio}</p>
        </div>
      </div>
      <div className={ESTABLECIMIENTOS_STYLES.mutedPanel}>
        <div className="p-3">
          <p className="text-xs font-medium text-[#747986]">Total</p>
          <p className="mt-1 text-sm font-semibold text-[#15171d]">{vale.totalVacunas.toLocaleString('es-PE')} vacunas</p>
        </div>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between gap-3">
      <ValeTypeBadge vale={vale} />
      <ValeActions
        isLoading={isLoading}
        onVerDetalle={onVerDetalle}
        onExportar={onExportar}
        onRevertir={onRevertir}
      />
    </div>
  </article>
);

export default Vales;
