import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStockEvents } from '../../utils/stockEventEmitter';
import {
  Receipt,
  Search,
  Building2,
  Package,
  Eye,
  XCircle,
  RefreshCw,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  RotateCcw,
  Settings,
  FileSpreadsheet,
  Target,
  Layers,
  Hash,
  Calendar
} from 'lucide-react';
import { ValeEntrega, ValesService, ValeTypeSelectionConfig } from '../../services/valesService';
import { useVales } from '../../hooks/useVales';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import ValeDetalleModal from './ValeDetalleModal';
import ValesConnectionTest from './ValesConnectionTest';
import ValeExportModal from './ValeExportModal';
import ConfirmacionModal from './ConfirmacionModal';
import ValeTypeSelectionModal from './ValeTypeSelectionModal';
import './vales.css';

interface ValesProps {
  // Props opcionales para filtros iniciales (cuando se abre desde Movimientos)
  initialCentroAcopioId?: string;
  initialVacunaId?: string;
  initialMes?: number;
  initialAnio?: number;
  onClose?: () => void;
}

// Función para analizar los detalles del vale y determinar tipos de entrega específicos
const analyzeValeDeliveryTypes = (vale: ValeEntrega) => {
  const deliveryTypes = [];
  let hasBase = false;
  const additionalGroups = new Set<number>();

  // Analizar cada detalle del vale
  vale.detalles?.forEach(detalle => {
    // Verificar si tiene entrega base
    if (detalle.cantidadProgramada > 0) {
      hasBase = true;
    }

    // Verificar entregas adicionales y sus números
    if (detalle.cantidadAdicional > 0 && detalle.numeroEntregaAdicional) {
      additionalGroups.add(detalle.numeroEntregaAdicional);
    }
  });

  // Agregar tipo base si existe
  if (hasBase) {
    deliveryTypes.push({
      type: 'base',
      label: 'Base',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Target className="h-3 w-3" />,
      priority: 1
    });
  }

  // Agregar tipos adicionales ordenados con colores diferenciados
  const sortedAdditionalGroups = Array.from(additionalGroups).sort((a, b) => a - b);
  sortedAdditionalGroups.forEach(groupNumber => {
    // Colores diferenciados para cada grupo adicional
    const additionalColors = [
      'bg-orange-100 text-orange-800 border-orange-200',    // Grupo 1
      'bg-red-100 text-red-800 border-red-200',            // Grupo 2
      'bg-purple-100 text-purple-800 border-purple-200',   // Grupo 3
      'bg-pink-100 text-pink-800 border-pink-200',         // Grupo 4
      'bg-indigo-100 text-indigo-800 border-indigo-200'    // Grupo 5+
    ];

    const colorIndex = Math.min(groupNumber - 1, additionalColors.length - 1);

    deliveryTypes.push({
      type: 'additional',
      groupNumber,
      label: `Adicional #${groupNumber}`,
      color: additionalColors[colorIndex],
      icon: <Hash className="h-3 w-3" />,
      priority: 2 + groupNumber
    });
  });

  return deliveryTypes.sort((a, b) => a.priority - b.priority);
};

// Componente profesional para mostrar identificadores visuales de tipos de entrega
const DeliveryTypeIdentifiers: React.FC<{ vale: ValeEntrega }> = ({ vale }) => {
  const deliveryTypes = analyzeValeDeliveryTypes(vale);

  if (deliveryTypes.length === 0) {
    // Fallback al sistema legacy si no hay detalles
    const tipoInfo = {
      'solo_base': {
        texto: 'Base',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" />
      },
      'solo_adicionales': {
        texto: 'Adicionales',
        color: 'bg-orange-100 text-orange-800',
        icon: <Plus className="h-3 w-3" />
      }
    }[vale.tipoVale || 'solo_base'] || {
      texto: 'Base',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-3 w-3" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm ${tipoInfo.color}`}>
        {tipoInfo.icon}
        <span className="ml-1.5">{tipoInfo.texto}</span>
      </span>
    );
  }

  // Si es un vale completo (tiene base + adicionales), mostrar badge especial
  const hasBase = deliveryTypes.some(dt => dt.type === 'base');
  const additionalGroups = deliveryTypes.filter(dt => dt.type === 'additional');

  if (hasBase && additionalGroups.length > 0) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm bg-blue-100 text-blue-800 border-blue-200 transition-all hover:shadow-md">
          <Layers className="h-3 w-3" />
          <span className="ml-1.5">Completo</span>
        </span>
        <span className="text-xs text-gray-500 self-center">
          (Base + {additionalGroups.length} adicional{additionalGroups.length > 1 ? 'es' : ''})
        </span>
      </div>
    );
  }

  // Mostrar badges individuales para tipos específicos
  return (
    <div className="flex flex-wrap gap-1.5 max-w-sm">
      {deliveryTypes.map((deliveryType, index) => (
        <span
          key={`${deliveryType.type}-${deliveryType.groupNumber || 'base'}`}
          className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${deliveryType.color} transition-all hover:shadow-md hover:scale-105 cursor-help`}
          title={deliveryType.type === 'base'
            ? 'Entrega Base: Vacunas programadas en la planificación anual'
            : `Entrega Adicional #${deliveryType.groupNumber}: Vacunas agregadas posteriormente, no programadas en planificación`
          }
        >
          {deliveryType.icon}
          <span className="ml-1.5 tracking-wide hidden sm:inline">{deliveryType.label}</span>
          <span className="ml-1.5 tracking-wide sm:hidden">
            {deliveryType.type === 'base' ? 'B' : `A${deliveryType.groupNumber}`}
          </span>
          {deliveryType.type === 'additional' && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-white bg-opacity-40 rounded-full text-xs font-bold min-w-[1.25rem] text-center hidden sm:inline">
              {deliveryType.groupNumber}
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

// Componente para mostrar resumen de entregas en la columna Totales
const DeliveryTotalsSummary: React.FC<{ vale: ValeEntrega }> = ({ vale }) => {
  const deliveryTypes = analyzeValeDeliveryTypes(vale);
  const hasBase = deliveryTypes.some(dt => dt.type === 'base');
  const additionalGroups = deliveryTypes.filter(dt => dt.type === 'additional');

  // Calcular totales por tipo
  let baseVaccines = 0;
  let additionalVaccines = 0;

  vale.detalles?.forEach(detalle => {
    baseVaccines += detalle.cantidadProgramada || 0;
    additionalVaccines += detalle.cantidadAdicional || 0;
  });

  return (
    <div className="flex flex-col space-y-1">
      {/* Total general */}
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          <Package className="h-3 w-3 mr-1" />
          {vale.totalVacunas.toLocaleString()} vacunas
        </span>
        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
          <Building2 className="h-3 w-3 mr-1" />
          {vale.totalEstablecimientos} centros
        </span>
      </div>

      {/* Desglose por tipo si es mixto */}
      {hasBase && additionalGroups.length > 0 && (
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
            Base: {baseVaccines.toLocaleString()}
          </span>
          <span className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">
            +{additionalVaccines.toLocaleString()} adicional
          </span>
        </div>
      )}
    </div>
  );
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
    isDeleting,
    isReverting,
    isSyncing,
    modificaciones,
    ultimaSincronizacion,
    loadVales,
    deleteVale,
    revertirVale,
    generarVale,
    sincronizarVale,
    getModificaciones,
    sincronizarValesAutomaticamente
  } = useVales();

  const {
    establecimientos,
    centrosAcopio,
    loadEstablecimientos,
    loadCentrosAcopio
  } = useEstablecimientos();

  const {
    loadVacunasActivas
  } = useVacunas();

  // Estados locales para filtros
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>(
    initialCentroAcopioId || 'todos'
  );
  const [selectedMes, setSelectedMes] = useState<number>(
    initialMes || new Date().getMonth() + 1
  );
  const [selectedAnio, setSelectedAnio] = useState<number>(
    initialAnio || new Date().getFullYear()
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');

  // Estados para modales
  const [showDetalleModal, setShowDetalleModal] = useState<boolean>(false);
  const [valeSeleccionado, setValeSeleccionado] = useState<ValeEntrega | null>(null);
  const [showDiagnostico, setShowDiagnostico] = useState<boolean>(false);
  const [showModificacionesModal, setShowModificacionesModal] = useState<boolean>(false);
  const [showSincronizacionModal, setShowSincronizacionModal] = useState<boolean>(false);
  const [showValeTypeSelectionModal, setShowValeTypeSelectionModal] = useState<boolean>(false);
  const [modalRefreshKey, setModalRefreshKey] = useState<number>(0);

  // Estados para modales globales
  const [showGlobalDetalleModal, setShowGlobalDetalleModal] = useState<boolean>(false);
  const [showGlobalExportModal, setShowGlobalExportModal] = useState<boolean>(false);
  const [valeGlobalCombinado, setValeGlobalCombinado] = useState<ValeEntrega | null>(null);

  // Removed unused sync status states for cleaner design

  // Estados para modales de confirmación profesionales - AISLADOS
  const [showConfirmRevertir, setShowConfirmRevertir] = useState<boolean>(false);
  const [showConfirmEliminar, setShowConfirmEliminar] = useState<boolean>(false);
  const [valeParaAccion, setValeParaAccion] = useState<ValeEntrega | null>(null);
  const [procesandoAccion, setProcesandoAccion] = useState<boolean>(false);

  // Estados adicionales para evitar conflictos
  const [modalKey, setModalKey] = useState<number>(0);

  // Estado para indicador de actualización en tiempo real
  const [actualizandoTabla, setActualizandoTabla] = useState<boolean>(false);

  // Estado para feedback visual durante generación
  const [generandoVale, setGenerandoVale] = useState<boolean>(false);

  // Estados para exportación directa
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [valeParaExportar, setValeParaExportar] = useState<ValeEntrega | null>(null);

  // Estados para selección múltiple profesional
  const [selectedVales, setSelectedVales] = useState<Set<string>>(new Set());
  const [selectAllMode, setSelectAllMode] = useState<boolean>(false);

  // Ref para detectar cuando termina la generación
  const wasGeneratingRef = useRef<boolean>(false);

  // Funciones para selección múltiple profesional
  const handleSelectVale = (valeId: string, checked: boolean) => {
    setSelectedVales(prev => {
      const newSelection = new Set(prev);
      if (checked) {
        newSelection.add(valeId);
      } else {
        newSelection.delete(valeId);
      }
      return newSelection;
    });
  };

  // Funciones temporales que serán redefinidas después de declarar valesFiltrados
  const handleSelectAllVales = (checked: boolean) => {
    // Esta función será redefinida después de declarar valesFiltrados
    console.warn('handleSelectAllVales called before valesFiltrados initialization');
  };

  const handleClearSelection = () => {
    setSelectedVales(new Set());
    setSelectAllMode(false);
    toast.info('Selección limpiada', 'Se han deseleccionado todos los vales.', { duration: 2000 });
  };

  // Función para seleccionar/deseleccionar con teclado (Ctrl+A)
  const handleKeyDown = (event: KeyboardEvent) => {
    // Esta función será redefinida después de declarar valesFiltrados
    console.warn('handleKeyDown called before valesFiltrados initialization');
  };

  // Variables temporales para evitar error de inicialización
  const selectedValesCount = selectedVales.size;

  // Constantes
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const estadosVale = [
    { value: 'todos', label: 'Todos los estados', color: 'gray' },
    { value: 'generado', label: 'Generado', color: 'blue' },
    { value: 'impreso', label: 'Impreso', color: 'yellow' },
    { value: 'entregado', label: 'Entregado', color: 'green' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadEstablecimientos(),
          loadCentrosAcopio(), // CORRECCIÓN: Cargar centros de acopio
          loadVacunasActivas()
        ]);
        console.log('✅ Datos iniciales cargados para Vales');
        console.log(`🏢 Centros de acopio cargados: ${centrosAcopio.length}`);
      } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
      }
    };

    initializeData();
  }, []); // Sin dependencias para evitar bucles infinitos

  // Cargar vales cuando cambian los filtros (con debounce para búsqueda)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters = {
        ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
        mes: selectedMes,
        anio: selectedAnio,
        ...(selectedEstado !== 'todos' && { estado: selectedEstado as any }),
        ...(searchTerm && { search: searchTerm }),
        limit: 100
      };

      console.log('🔄 Cargando vales con filtros:', filters);
      loadVales(filters);

      // Limpiar selección cuando cambian los filtros
      setSelectedVales(new Set());
      setSelectAllMode(false);
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [selectedCentroAcopio, selectedMes, selectedAnio, selectedEstado, searchTerm]);

  // Efecto para detectar cuando se termina de generar un vale y actualizar automáticamente
  useEffect(() => {
    const isCurrentlyGenerating = isGenerating || generandoVale;

    if (!isCurrentlyGenerating && wasGeneratingRef.current) {
      // Si acabamos de terminar de generar un vale, actualizar la tabla
      console.log('🔄 Detectado fin de generación, actualizando tabla automáticamente...');
      setTimeout(() => {
        handleValeGenerado();
      }, 300);
      wasGeneratingRef.current = false;
    } else if (isCurrentlyGenerating) {
      wasGeneratingRef.current = true;
    }
  }, [isGenerating, generandoVale]);

  // Datos derivados - Usar centrosAcopio directamente del hook

  const centroAcopioSeleccionado = useMemo(() =>
    centrosAcopio.find(c => c.id === selectedCentroAcopio),
    [centrosAcopio, selectedCentroAcopio]
  );

  // Vales filtrados
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

  // Variables que dependen de valesFiltrados - después de su declaración
  const isAllSelected = valesFiltrados.length > 0 && selectedVales.size === valesFiltrados.length;
  const isIndeterminate = selectedVales.size > 0 && selectedVales.size < valesFiltrados.length;

  // Redefinir funciones que dependen de valesFiltrados - después de su declaración
  const handleSelectAllValesFinal = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(valesFiltrados.map(vale => vale.id));
      setSelectedVales(allIds);
      setSelectAllMode(true);
    } else {
      setSelectedVales(new Set());
      setSelectAllMode(false);
    }
  };

  const handleKeyDownFinal = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'a' && valesFiltrados.length > 0) {
      event.preventDefault();
      const shouldSelectAll = selectedVales.size !== valesFiltrados.length;
      handleSelectAllValesFinal(shouldSelectAll);
      toast.info(
        shouldSelectAll ? 'Todos seleccionados' : 'Selección limpiada',
        shouldSelectAll
          ? `Se han seleccionado ${valesFiltrados.length} vales.`
          : 'Se han deseleccionado todos los vales.',
        { duration: 2000 }
      );
    }
  };

  // Agregar listener para atajos de teclado - después de declarar valesFiltrados
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDownFinal);
    return () => document.removeEventListener('keydown', handleKeyDownFinal);
  }, [valesFiltrados, selectedVales]);

  // Estadísticas calculadas
  const estadisticas = useMemo(() => {
    const totalVales = valesFiltrados.length;
    const valesGenerados = valesFiltrados.filter(v => v.estado === 'generado').length;
    const valesImpresos = valesFiltrados.filter(v => v.estado === 'impreso').length;
    const valesEntregados = valesFiltrados.filter(v => v.estado === 'entregado').length;
    const totalVacunas = valesFiltrados.reduce((sum, vale) => sum + vale.totalVacunas, 0);
    const centrosUnicos = new Set(valesFiltrados.map(v => v.centroAcopio.id)).size;

    return {
      totalVales,
      valesGenerados,
      valesImpresos,
      valesEntregados,
      totalVacunas,
      centrosUnicos,
      porcentajeEntregados: totalVales > 0 ? Math.round((valesEntregados / totalVales) * 100) : 0
    };
  }, [valesFiltrados]);

  // Funciones de manejo con toast profesionales
  const handleGenerarValeDirecto = async () => {
    if (!selectedCentroAcopio || selectedCentroAcopio === 'todos') {
      toast.error(
        'Centro de acopio requerido',
        'Debe seleccionar un centro de acopio específico para generar un vale.',
        { duration: 4000 }
      );
      return;
    }

    // Siempre abrir el modal de selección para que el usuario pueda elegir el tipo
    setModalRefreshKey(prev => prev + 1); // Forzar refresh de datos del modal
    setShowValeTypeSelectionModal(true);
  };

  // Función para ejecutar la generación del vale con configuración específica
  const executeGenerarVale = async (config: ValeTypeSelectionConfig) => {
    // Activar estado de generación para feedback visual
    setGenerandoVale(true);

    // Toast de inicio del proceso
    toast.info(
      'Generando vale...',
      'Procesando datos y actualizando stocks. Por favor espere.',
      { duration: 3000 }
    );

    try {
      // Generar vale con configuración específica
      const result = await generarVale({
        centroAcopioId: selectedCentroAcopio,
        mes: selectedMes,
        anio: selectedAnio,
        usuarioId: 'temp-user-id', // TODO: Obtener del contexto de usuario
        observaciones: `Vale generado para ${meses[selectedMes - 1]} ${selectedAnio}`,
        afectarStock: true,
        tipoVale: config.tipoVale,
        entregasAdicionalesSeleccionadas: config.entregasAdicionalesSeleccionadas,
        gruposEntregasSeleccionados: config.gruposEntregasSeleccionados
      });

      if (result) {
        // Notificación principal de éxito
        toast.success(
          'Vale generado exitosamente',
          `Vale ${result.vale.numero} creado con ${result.resumen.totalVacunas} vacunas para ${result.resumen.totalEstablecimientos} establecimientos. Los stocks han sido actualizados automáticamente.`,
          { duration: 6000 }
        );

        // EMITIR EVENTO PARA ACTUALIZACIÓN AUTOMÁTICA DE STOCK
        console.log('📡 Emitiendo evento de vale generado para actualización automática de stock...');
        emitValeGenerated(selectedCentroAcopio, selectedMes, selectedAnio);

        // SOLUCIÓN DIRECTA: Actualización inmediata y verificación
        console.log('🔄 Iniciando actualización inmediata después de generar vale...');

        // Actualización inmediata (sin esperar)
        forceUpdateVales();

        // Actualización adicional después de 1 segundo para asegurar
        setTimeout(() => {
          console.log('🔄 Ejecutando actualización de verificación...');
          forceUpdateVales();
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ Error al generar vale:', error);

      // Mostrar mensaje de error específico con mejor UX
      const errorMessage = error.message || 'Error desconocido al generar vale';

      if (errorMessage.includes('Ya existen vales para los grupos')) {
        // Error específico de grupos ya generados
        toast.error(
          'Grupos ya generados',
          'Los grupos de entregas adicionales seleccionados ya han sido generados. Por favor, actualice la página y seleccione grupos disponibles.',
          { duration: 8000 }
        );

        // Forzar actualización de datos para refrescar el estado
        console.log('🔄 Forzando actualización después de error de grupos duplicados...');
        forceUpdateVales();
        setModalRefreshKey(prev => prev + 1); // También refrescar el modal para próxima apertura

      } else if (errorMessage.includes('Ya existe un vale')) {
        toast.error('Vale ya existe', errorMessage);
      } else if (errorMessage.includes('No hay movimientos')) {
        toast.error('Sin datos', 'No hay datos de planificación para generar el vale en este período');
      } else {
        toast.error('Error al generar vale', errorMessage);
      }
    } finally {
      // Desactivar estado de generación
      setGenerandoVale(false);
    }
  };

  // Handler para el modal de selección de tipo de vale
  const handleValeTypeSelection = (config: ValeTypeSelectionConfig) => {
    setShowValeTypeSelectionModal(false);
    executeGenerarVale(config);
  };



  const handleValeGenerado = async () => {
    // Recargar vales después de generar uno nuevo con actualización automática
    const filters = {
      ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
      mes: selectedMes,
      anio: selectedAnio,
      ...(selectedEstado !== 'todos' && { estado: selectedEstado as any }),
      ...(searchTerm && { search: searchTerm }),
      limit: 100
    };

    console.log('🔄 Actualizando tabla de vales con filtros:', filters);

    // Actualización inmediata y profesional
    try {
      await loadVales(filters);
      console.log('✅ Tabla de vales actualizada exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar tabla de vales:', error);
    }
  };

  // Función para forzar actualización sin filtros complejos - MEJORADA Y ROBUSTA
  const forceUpdateVales = async () => {
    console.log('🔄 Forzando actualización completa de vales...');

    // Filtros básicos para la actualización
    const basicFilters = {
      ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
      mes: selectedMes,
      anio: selectedAnio,
      limit: 100
    };

    try {
      console.log('📋 Filtros para actualización forzada:', basicFilters);

      // Intentar actualización con filtros básicos
      await loadVales(basicFilters);
      console.log('✅ Actualización forzada completada exitosamente');

      return true;
    } catch (error) {
      console.error('❌ Error en actualización forzada:', error);

      // Fallback 1: Intentar con filtros mínimos
      try {
        console.log('🔄 Fallback 1: Intentando con filtros mínimos...');
        await loadVales({ mes: selectedMes, anio: selectedAnio, limit: 100 });
        console.log('✅ Actualización con filtros mínimos exitosa');
        return true;
      } catch (minimalError) {
        console.error('❌ Error con filtros mínimos:', minimalError);

        // Fallback 2: Intentar solo con mes y año actuales
        try {
          console.log('🔄 Fallback 2: Intentando recarga básica...');
          const currentDate = new Date();
          await loadVales({
            mes: currentDate.getMonth() + 1,
            anio: currentDate.getFullYear(),
            limit: 50
          });
          console.log('✅ Recarga básica exitosa');
          return true;
        } catch (basicError) {
          console.error('❌ Error incluso con recarga básica:', basicError);
          return false;
        }
      }
    }
  };

  // Función profesional para actualizar solo la tabla de vales en tiempo real
  const actualizarTablaVales = async () => {
    console.log('🔄 Actualizando tabla de vales de manera profesional...');

    // Activar indicador visual sutil
    setActualizandoTabla(true);

    try {
      // Preparar filtros actuales para la actualización
      const filtrosActuales = {
        ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
        mes: selectedMes,
        anio: selectedAnio,
        ...(selectedEstado !== 'todos' && { estado: selectedEstado as any }),
        ...(searchTerm && { search: searchTerm }),
        limit: 100
      };

      console.log('📋 Actualizando con filtros:', filtrosActuales);

      // Usar el hook loadVales que maneja el estado internamente
      await loadVales(filtrosActuales);

      console.log(`✅ Tabla actualizada exitosamente`);

      // Pequeña animación de éxito (opcional)
      setTimeout(() => {
        console.log('🎉 Actualización completada con éxito');
      }, 100);

      return true;
    } catch (error) {
      console.error('❌ Error al actualizar tabla de vales:', error);

      // Fallback: usar el hook como respaldo
      try {
        console.log('🔄 Usando método de respaldo...');
        await forceUpdateVales();
        return true;
      } catch (fallbackError) {
        console.error('❌ Error en método de respaldo:', fallbackError);
        return false;
      }
    } finally {
      // Desactivar indicador visual
      setActualizandoTabla(false);
    }
  };

  const handleVerDetalle = (vale: ValeEntrega) => {
    if (vale && vale.id) {
      setValeSeleccionado(vale);
      setShowDetalleModal(true);
    } else {
      toast.error(
        'Error de validación',
        'No se pudo cargar la información del vale seleccionado.',
        { duration: 4000 }
      );
    }
  };

  // Funciones para abrir modales de confirmación - MEJORADAS CON VALIDACIÓN
  const handleAbrirConfirmEliminar = (vale: ValeEntrega) => {
    // Validación de entrada
    if (!vale || !vale.id || !vale.numero) {
      console.error('❌ Error: Vale inválido para eliminar:', vale);
      toast.error(
        'Error de validación',
        'No se pudo cargar la información del vale seleccionado.',
        { duration: 4000 }
      );
      return;
    }

    // Limpiar estados previos
    setShowConfirmEliminar(false);
    setShowConfirmRevertir(false);
    setProcesandoAccion(false);

    // Establecer nuevos estados
    setValeParaAccion(vale);
    setModalKey(prev => prev + 1); // Forzar re-render

    // Usar setTimeout para asegurar que el estado se actualice
    setTimeout(() => {
      setShowConfirmEliminar(true);
    }, 10);
  };

  const handleAbrirConfirmRevertir = (vale: ValeEntrega) => {
    // Validación de entrada
    if (!vale || !vale.id || !vale.numero) {
      console.error('❌ Error: Vale inválido para revertir:', vale);
      toast.error(
        'Error de validación',
        'No se pudo cargar la información del vale seleccionado.',
        { duration: 4000 }
      );
      return;
    }

    // Limpiar estados previos
    setShowConfirmRevertir(false);
    setShowConfirmEliminar(false);
    setProcesandoAccion(false);

    // Establecer nuevos estados
    setValeParaAccion(vale);
    setModalKey(prev => prev + 1); // Forzar re-render

    // Usar setTimeout para asegurar que el estado se actualice
    setTimeout(() => {
      setShowConfirmRevertir(true);
    }, 10);
  };

  // Función mejorada para eliminar vale con actualización automática garantizada
  const handleEliminarVale = async () => {
    if (!valeParaAccion || !valeParaAccion.id || !valeParaAccion.numero) {
      console.error('❌ Error: No hay vale válido para eliminar');
      toast.error(
        'Error de validación',
        'No se pudo identificar el vale a eliminar.',
        { duration: 4000 }
      );
      return;
    }

    const valeNumero = valeParaAccion.numero;
    const valeId = valeParaAccion.id;

    setProcesandoAccion(true);

    // Toast de inicio del proceso
    toast.info(
      'Eliminando vale...',
      'Procesando eliminación y restaurando stocks. Por favor espere.',
      { duration: 3000 }
    );

    try {
      console.log('🗑️ Iniciando eliminación del vale:', valeNumero);

      // SOLUCIÓN DIRECTA: Llamar al servicio directamente para evitar problemas con useApi
      console.log('🔄 Llamando directamente al servicio de eliminación...');
      const serviceResponse = await ValesService.deleteVale(valeId);

      console.log('📋 Respuesta del servicio:', serviceResponse);

      if (serviceResponse.success) {
        console.log('✅ Vale eliminado exitosamente en el backend');

        // PASO 1: Cerrar modal y limpiar estados inmediatamente
        setProcesandoAccion(false);
        setShowConfirmEliminar(false);
        setValeParaAccion(null);

        // PASO 2: Notificación de éxito
        toast.success(
          'Vale eliminado correctamente',
          `El vale ${valeNumero} ha sido eliminado y los stocks han sido restaurados.`,
          { duration: 5000 }
        );

        // PASO 3: ACTUALIZACIÓN PROFESIONAL EN TIEMPO REAL (SOLO LA TABLA)
        console.log('🔄 Iniciando actualización profesional en tiempo real...');

        // Actualización inmediata y elegante de la tabla
        await actualizarTablaVales();

        // Verificación adicional después de 300ms para asegurar consistencia
        setTimeout(async () => {
          console.log('🔄 Verificación de consistencia...');
          await actualizarTablaVales();
        }, 300);

      } else {
        // La operación falló, usar el mensaje de error del servicio
        const errorMessage = serviceResponse.error || `No se pudo eliminar el vale ${valeNumero}. Es posible que el vale ya haya sido eliminado o que haya un problema con la restauración de stocks.`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Error al eliminar vale:', error);

      // En caso de error, también cerrar el modal
      setProcesandoAccion(false);
      setShowConfirmEliminar(false);
      setValeParaAccion(null);

      // Determinar el mensaje de error más apropiado
      let errorTitle = 'Error al eliminar vale';
      let errorMessage = '';

      if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorTitle = 'Error de conexión';
          errorMessage = `No se pudo conectar con el servidor. Verifique su conexión a internet e intente nuevamente.`;
        } else if (error.message.includes('404')) {
          errorTitle = 'Vale no encontrado';
          errorMessage = `El vale ${valeNumero} no fue encontrado en el sistema. Es posible que ya haya sido eliminado.`;
        } else if (error.message.includes('403') || error.message.includes('401')) {
          errorTitle = 'Sin permisos';
          errorMessage = `No tiene permisos suficientes para eliminar este vale. Contacte al administrador del sistema.`;
        } else if (error.message.includes('500')) {
          errorTitle = 'Error del servidor';
          errorMessage = `Error interno del servidor al procesar la eliminación. Intente nuevamente en unos momentos.`;
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = `Error desconocido al eliminar el vale ${valeNumero}. Intente nuevamente o contacte al soporte técnico.`;
      }

      toast.error(
        errorTitle,
        errorMessage,
        { duration: 8000 }
      );
    }
  };

  // Función mejorada para revertir vale con actualización automática garantizada
  const handleRevertirVale = async () => {
    if (!valeParaAccion || !valeParaAccion.id || !valeParaAccion.numero) {
      console.error('❌ Error: No hay vale válido para revertir');
      toast.error(
        'Error de validación',
        'No se pudo identificar el vale a revertir.',
        { duration: 4000 }
      );
      return;
    }

    const valeNumero = valeParaAccion.numero;
    const valeId = valeParaAccion.id;

    setProcesandoAccion(true);

    // Toast de inicio del proceso
    toast.info(
      'Revirtiendo vale...',
      'Procesando reversión y restaurando stocks. Por favor espere.',
      { duration: 3000 }
    );

    try {
      console.log('🔄 Iniciando reversión del vale:', valeNumero);

      // SOLUCIÓN DIRECTA: Llamar al servicio directamente para evitar problemas con useApi
      console.log('🔄 Llamando directamente al servicio de reversión...');
      const serviceResponse = await ValesService.revertirVale(valeId);

      console.log('📋 Respuesta del servicio:', serviceResponse);

      if (serviceResponse.success) {
        console.log('✅ Vale revertido exitosamente en el backend');

        // PASO 1: Cerrar modal y limpiar estados inmediatamente
        setProcesandoAccion(false);
        setShowConfirmRevertir(false);
        setValeParaAccion(null);

        // PASO 2: Notificación de éxito
        toast.success(
          'Vale revertido correctamente',
          `El vale ${valeNumero} ha sido revertido y los stocks han sido restaurados.`,
          { duration: 5000 }
        );

        // PASO 3: ACTUALIZACIÓN PROFESIONAL EN TIEMPO REAL (SOLO LA TABLA)
        console.log('🔄 Iniciando actualización profesional en tiempo real...');

        // Actualización inmediata y elegante de la tabla
        await actualizarTablaVales();

        // Verificación adicional después de 300ms para asegurar consistencia
        setTimeout(async () => {
          console.log('🔄 Verificación de consistencia...');
          await actualizarTablaVales();
        }, 300);

      } else {
        // La operación falló, usar el mensaje de error del servicio
        const errorMessage = serviceResponse.error || `No se pudo revertir el vale ${valeNumero}. Es posible que el vale ya esté en estado pendiente o que haya un problema con los stocks.`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Error al revertir vale:', error);

      // En caso de error, también cerrar el modal
      setProcesandoAccion(false);
      setShowConfirmRevertir(false);
      setValeParaAccion(null);

      // Determinar el mensaje de error más apropiado
      let errorTitle = 'Error al revertir vale';
      let errorMessage = '';

      if (error.message) {
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorTitle = 'Error de conexión';
          errorMessage = `No se pudo conectar con el servidor. Verifique su conexión a internet e intente nuevamente.`;
        } else if (error.message.includes('404')) {
          errorTitle = 'Vale no encontrado';
          errorMessage = `El vale ${valeNumero} no fue encontrado en el sistema. Es posible que ya haya sido eliminado.`;
        } else if (error.message.includes('403') || error.message.includes('401')) {
          errorTitle = 'Sin permisos';
          errorMessage = `No tiene permisos suficientes para revertir este vale. Contacte al administrador del sistema.`;
        } else if (error.message.includes('500')) {
          errorTitle = 'Error del servidor';
          errorMessage = `Error interno del servidor al procesar la reversión. Intente nuevamente en unos momentos.`;
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = `Error desconocido al revertir el vale ${valeNumero}. Intente nuevamente o contacte al soporte técnico.`;
      }

      toast.error(
        errorTitle,
        errorMessage,
        { duration: 8000 }
      );
    }
  };

  // Funciones para manejo de modificaciones y sincronización
  const handleVerModificaciones = async (vale: ValeEntrega) => {
    if (!vale || !vale.id) {
      toast.error(
        'Error de validación',
        'No se pudo identificar el vale para ver modificaciones.',
        { duration: 4000 }
      );
      return;
    }

    setValeSeleccionado(vale);
    setShowModificacionesModal(true);

    // Cargar modificaciones del vale
    try {
      await getModificaciones(vale.id);
    } catch (error) {
      console.error('Error al cargar modificaciones:', error);
      toast.error(
        'Error al cargar modificaciones',
        'No se pudieron cargar las modificaciones del vale.',
        { duration: 4000 }
      );
    }
  };

  const handleSincronizarVale = async (valeId: string) => {
    if (!valeId) {
      toast.error(
        'Error de validación',
        'No se pudo identificar el vale para sincronizar.',
        { duration: 4000 }
      );
      return;
    }

    try {
      console.log(`🔄 Iniciando sincronización de vale: ${valeId}`);

      const result = await sincronizarVale(valeId);

      if (result && result.modificaciones) {
        const numModificaciones = result.modificaciones.length;

        if (numModificaciones > 0) {
          toast.success(
            `✅ Vale sincronizado exitosamente`,
            `Se detectaron y aplicaron ${numModificaciones} modificaciones. Los stocks han sido ajustados automáticamente.`,
            { duration: 6000 }
          );
        } else {
          toast.info(
            '✅ Vale verificado',
            'El vale ya está sincronizado con los datos actuales. No se requieren modificaciones.',
            { duration: 4000 }
          );
        }

        // Actualizar la tabla automáticamente
        await actualizarTablaVales();
      }
    } catch (error) {
      console.error('Error al sincronizar vale:', error);
      toast.error(
        'Error en sincronización',
        error instanceof Error ? error.message : 'No se pudo sincronizar el vale.',
        { duration: 6000 }
      );
    }
  };

  const handleSincronizacionAutomatica = async () => {
    if (!selectedCentroAcopio || selectedCentroAcopio === 'todos') {
      toast.error(
        'Centro de acopio requerido',
        'Debe seleccionar un centro de acopio específico para la sincronización automática.',
        { duration: 4000 }
      );
      return;
    }

    try {
      console.log(`🔄 Iniciando sincronización automática para ${selectedCentroAcopio}, ${selectedMes}/${selectedAnio}`);

      const result = await sincronizarValesAutomaticamente(selectedCentroAcopio, selectedMes, selectedAnio);

      if (result) {
        const { valesSincronizados, errores } = result;

        if (valesSincronizados > 0) {
          toast.success(
            `✅ Sincronización automática completada`,
            `Se sincronizaron ${valesSincronizados} vales exitosamente.${errores.length > 0 ? ` ${errores.length} errores encontrados.` : ''}`,
            { duration: 6000 }
          );
        } else {
          toast.info(
            '✅ Sincronización verificada',
            'Todos los vales ya están sincronizados con los datos actuales.',
            { duration: 4000 }
          );
        }

        if (errores.length > 0) {
          console.warn('Errores en sincronización automática:', errores);
        }
      }
    } catch (error) {
      console.error('Error en sincronización automática:', error);
      toast.error(
        'Error en sincronización automática',
        error instanceof Error ? error.message : 'No se pudo completar la sincronización automática.',
        { duration: 6000 }
      );
    }
  };

  // Función para abrir modal de exportación directa
  const handleAbrirExportModal = (vale: ValeEntrega) => {
    if (!vale || !vale.id) {
      toast.error('Error', 'Vale inválido para exportar');
      return;
    }

    console.log('🚀 Abriendo modal de exportación para vale:', vale.numero);
    setValeParaExportar(vale);
    setShowExportModal(true);
  };

  // Función para cerrar modal de exportación
  const handleCerrarExportModal = () => {
    setShowExportModal(false);
    setValeParaExportar(null);
  };

  // ========================================
  // FUNCIONES PARA ACCIONES GLOBALES
  // ========================================

  /**
   * Combina vales específicos seleccionados en un solo vale virtual para mostrar detalle completo
   */
  const combinarValesSeleccionados = (valesSeleccionados: ValeEntrega[]): ValeEntrega | null => {
    if (valesSeleccionados.length === 0) {
      return null;
    }

    // Si solo hay un vale, retornarlo directamente
    if (valesSeleccionados.length === 1) {
      return valesSeleccionados[0];
    }

    console.log('🔄 Combinando', valesSeleccionados.length, 'vales seleccionados para detalle');

    // Combinar múltiples vales con agregación correcta
    const primerVale = valesSeleccionados[0];
    let totalVacunasCombinado = 0;
    const establecimientosSet = new Set<string>();

    // Mapas para agregar datos por establecimiento y vacuna
    const detallesCombinados = new Map<string, any>();

    // Procesar todos los vales seleccionados
    valesSeleccionados.forEach((vale, valeIndex) => {
      console.log(`📋 Procesando vale seleccionado ${valeIndex + 1}/${valesSeleccionados.length}: ${vale.numero}`);

      if (vale.detalles) {
        totalVacunasCombinado += vale.totalVacunas;

        vale.detalles.forEach(detalle => {
          establecimientosSet.add(detalle.establecimientoId);

          // Crear clave única para establecimiento + vacuna
          const claveDetalle = `${detalle.establecimientoId}-${detalle.vacunaId}`;

          if (!detallesCombinados.has(claveDetalle)) {
            // Crear nuevo detalle combinado
            detallesCombinados.set(claveDetalle, {
              ...detalle,
              cantidadProgramada: 0,
              cantidadAdicional: 0,
              cantidadTotal: 0,
              // Mantener información de entregas adicionales como array
              entregasAdicionales: []
            });
          }

          const detalleCombinado = detallesCombinados.get(claveDetalle);

          // Sumar cantidades
          const cantidadProgramada = Number(detalle.cantidadProgramada) || 0;
          const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;
          const cantidadTotal = Number(detalle.cantidadTotal) || (cantidadProgramada + cantidadAdicional);

          detalleCombinado.cantidadProgramada += cantidadProgramada;
          detalleCombinado.cantidadAdicional += cantidadAdicional;
          detalleCombinado.cantidadTotal += cantidadTotal;

          // Agregar información de entregas adicionales si existe
          if (detalle.numeroEntregaAdicional && cantidadAdicional > 0) {
            detalleCombinado.entregasAdicionales.push({
              numero: detalle.numeroEntregaAdicional,
              cantidad: cantidadAdicional,
              valeOrigen: vale.numero
            });
          }

          console.log(`  ✅ ${detalle.vacuna.nombre}: +${cantidadTotal} (Total acumulado: ${detalleCombinado.cantidadTotal})`);
        });
      }
    });

    // Convertir el mapa a array de detalles
    const detallesFinales = Array.from(detallesCombinados.values());

    console.log('📊 Resumen de combinación de vales seleccionados:');
    console.log(`  - Vales combinados: ${valesSeleccionados.length}`);
    console.log(`  - Detalles únicos: ${detallesFinales.length}`);
    console.log(`  - Total vacunas: ${totalVacunasCombinado}`);
    console.log(`  - Establecimientos únicos: ${establecimientosSet.size}`);

    // Crear vale combinado usando la estructura del primer vale como base
    const valeCombinado: ValeEntrega = {
      ...primerVale,
      numero: valesSeleccionados.length === 1
        ? primerVale.numero
        : `COMBINADO-${valesSeleccionados.length}-VALES`,
      detalles: detallesFinales,
      totalVacunas: totalVacunasCombinado,
      totalEstablecimientos: establecimientosSet.size,
      observaciones: valesSeleccionados.length === 1
        ? primerVale.observaciones
        : `Vale combinado de ${valesSeleccionados.length} vales seleccionados del período ${selectedMes}/${selectedAnio}. Cantidades agregadas por tipo de vacuna y establecimiento.`
    };

    return valeCombinado;
  };

  /**
   * Combina todos los vales filtrados en un solo vale virtual para mostrar detalle completo (legacy)
   * CORREGIDO: Ahora agrega correctamente las cantidades de vacunas por tipo
   */
  const combinarValesParaDetalle = (): ValeEntrega | null => {
    return combinarValesSeleccionados(valesFiltrados);
  };

  /**
   * Maneja la apertura del modal de detalle global con selección múltiple
   */
  const handleVerDetalleGlobal = () => {
    if (selectedValesCount === 0) {
      toast.error(
        'Selección requerida',
        'Por favor selecciona al menos un vale para ver el detalle.',
        { duration: 4000 }
      );
      return;
    }

    const selectedValesList = valesFiltrados.filter(vale => selectedVales.has(vale.id));

    if (selectedValesList.length === 0) {
      toast.error(
        'Error de selección',
        'Los vales seleccionados no están disponibles.',
        { duration: 4000 }
      );
      return;
    }

    const valeCombinado = combinarValesSeleccionados(selectedValesList);
    if (valeCombinado) {
      setValeGlobalCombinado(valeCombinado);
      setShowGlobalDetalleModal(true);
    } else {
      toast.error(
        'Error al combinar vales',
        'No se pudo generar el detalle completo de los vales seleccionados.',
        { duration: 4000 }
      );
    }
  };

  /**
   * Maneja la apertura del modal de exportación global con selección múltiple
   */
  const handleExportarGlobal = () => {
    if (selectedValesCount === 0) {
      toast.error(
        'Selección requerida',
        'Por favor selecciona al menos un vale para exportar.',
        { duration: 4000 }
      );
      return;
    }

    const selectedValesList = valesFiltrados.filter(vale => selectedVales.has(vale.id));

    if (selectedValesList.length === 0) {
      toast.error(
        'Error de selección',
        'Los vales seleccionados no están disponibles.',
        { duration: 4000 }
      );
      return;
    }

    // Para la exportación, usamos el primer vale seleccionado como base
    const valeBase = selectedValesList[0];

    // Crear un vale virtual que represente la combinación para el modal
    const valeParaModal: ValeEntrega = {
      ...valeBase,
      numero: selectedValesCount === 1
        ? valeBase.numero
        : `MULTI-${selectedValesCount}-VALES`,
      observaciones: selectedValesCount === 1
        ? valeBase.observaciones
        : `Exportación múltiple de ${selectedValesCount} vales del período ${selectedMes}/${selectedAnio}`,
      totalVacunas: selectedValesList.reduce((total, vale) => total + vale.totalVacunas, 0),
      totalEstablecimientos: new Set(selectedValesList.flatMap(vale =>
        vale.detalles?.map(d => d.establecimientoId) || []
      )).size
    };

    console.log('🚀 Abriendo modal de exportación múltiple para', selectedValesCount, 'vales seleccionados');
    setValeGlobalCombinado(valeParaModal);
    setShowGlobalExportModal(true);
  };

  /**
   * Cierra los modales globales y limpia el estado
   */
  const handleCerrarModalesGlobales = () => {
    setShowGlobalDetalleModal(false);
    setShowGlobalExportModal(false);
    setValeGlobalCombinado(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'generado': return 'bg-blue-100 text-blue-800';
      case 'impreso': return 'bg-yellow-100 text-yellow-800';
      case 'entregado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'generado': return <Clock className="h-4 w-4" />;
      case 'impreso': return <FileText className="h-4 w-4" />;
      case 'entregado': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Función legacy para compatibilidad con tipos de vale básicos
  const getTipoValeInfo = (tipoVale: string) => {
    switch (tipoVale) {
      case 'solo_base':
        return {
          texto: 'Base',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-3 w-3" />
        };
      case 'solo_adicionales':
        return {
          texto: 'Adicionales',
          color: 'bg-orange-100 text-orange-800',
          icon: <Plus className="h-3 w-3" />
        };
      default:
        return {
          texto: 'Base',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-3 w-3" />
        };
    }
  };

  // Removed DeliveryTypeLegend component for cleaner design

  return (
    <main className="min-h-screen bg-gray-50 overflow-y-auto" role="main" aria-label="Sistema de gestión de vales de entrega">
      {/* SEO and Accessibility Meta Information */}
      <div className="sr-only">
        <h1>Sistema de Gestión de Vales de Entrega - Syncova</h1>
        <p>Plataforma profesional para la gestión, generación y seguimiento de vales de entrega de vacunas por centro de acopio. Incluye funcionalidades de exportación, sincronización y control de estados.</p>
      </div>

      {/* Modern Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm" role="banner">
        <div className={`${onClose ? 'w-full px-4 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6'} py-4 sm:py-6`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Title Section */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vales de Entrega</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Sistema de gestión profesional de vales por centro de acopio</p>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Primary Action: Generate Voucher */}
              <button
                onClick={handleGenerarValeDirecto}
                disabled={selectedCentroAcopio === 'todos' || isGenerating || generandoVale}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base"
                title={selectedCentroAcopio === 'todos' ? 'Seleccione un centro de acopio específico' : 'Generar nuevo vale de entrega'}
              >
                {(isGenerating || generandoVale) ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                <span>{(isGenerating || generandoVale) ? 'Generando...' : 'Generar Vale'}</span>
              </button>

              {/* Secondary Actions */}
              <div className="flex items-center space-x-2">


                <button
                  onClick={handleSincronizacionAutomatica}
                  disabled={selectedCentroAcopio === 'todos' || isSyncing || isGenerating || generandoVale}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 shadow-md text-sm"
                  title="Sincronizar vales con datos actualizados"
                >
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                </button>

                <button
                  onClick={() => setShowDiagnostico(true)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 shadow-md text-sm"
                  title="Diagnóstico del sistema"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Diagnóstico</span>
                </button>
              </div>

              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-end sm:self-center"
                  title="Cerrar vista de vales"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className={`${onClose ? 'w-full px-4 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6'} py-4 sm:py-6`} role="region" aria-label="Contenido principal de gestión de vales">

        {/* Professional Filters Panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filtros de Búsqueda
                    {selectedValesCount > 0 && (
                      <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {selectedValesCount} seleccionado{selectedValesCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure los criterios para mostrar los vales
                    {selectedValesCount > 0 && (
                      <span className="text-indigo-600 font-medium">
                        • Manteniendo selección actual
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => loadVales({
                  ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio }),
                  mes: selectedMes,
                  anio: selectedAnio,
                  ...(selectedEstado !== 'todos' && { estado: selectedEstado as any }),
                  ...(searchTerm && { search: searchTerm }),
                  limit: 100
                })}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Centro de Acopio - Priority 1 */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span>Centro de Acopio</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCentroAcopio}
                  onChange={(e) => setSelectedCentroAcopio(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-sm"
                >
                  <option value="todos">Todos los centros de acopio</option>
                  {centrosAcopio.map(centro => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre}
                    </option>
                  ))}
                </select>
                {selectedCentroAcopio === 'todos' && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Seleccione un centro específico para generar vales</span>
                  </p>
                )}
              </div>

              {/* Período - Priority 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Mes</span>
                </label>
                <select
                  value={selectedMes}
                  onChange={(e) => setSelectedMes(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-sm"
                >
                  {meses.map((mes, index) => (
                    <option key={index + 1} value={index + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Año</span>
                </label>
                <select
                  value={selectedAnio}
                  onChange={(e) => setSelectedAnio(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado - Priority 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span>Estado</span>
                </label>
                <select
                  value={selectedEstado}
                  onChange={(e) => setSelectedEstado(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-sm"
                >
                  {estadosVale.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Bar - Full Width */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <span>Búsqueda</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por número de vale, centro de acopio u observaciones..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Vales de Entrega - {meses[selectedMes - 1]} {selectedAnio}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{valesFiltrados.length}</span> vales encontrados
                    </p>
                    {selectedCentroAcopio !== 'todos' && centroAcopioSeleccionado && (
                      <div className="flex items-center space-x-1 text-sm text-blue-600 font-medium">
                        <Building2 className="h-3 w-3" />
                        <span>{centroAcopioSeleccionado.nombre}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Loading Indicator */}
                {(isLoading || generandoVale || actualizandoTabla) && (
                  <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      {generandoVale ? 'Generando vale...' :
                       actualizandoTabla ? 'Actualizando...' : 'Cargando...'}
                    </span>
                  </div>
                )}

                {/* Global Action Buttons */}
                {valesFiltrados.length > 0 && (
                  <div className="flex items-center space-x-3">
                    {/* Indicador de selección */}
                    {selectedValesCount > 0 && (
                      <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-1 text-indigo-700">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {selectedValesCount} vale{selectedValesCount !== 1 ? 's' : ''} seleccionado{selectedValesCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          onClick={handleClearSelection}
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded p-1 transition-colors"
                          title="Limpiar selección"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleVerDetalleGlobal}
                        disabled={procesandoAccion || isLoading || selectedValesCount === 0}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm font-medium text-sm ${
                          selectedValesCount === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transform hover:scale-105'
                        }`}
                        title={selectedValesCount === 0 ? 'Selecciona al menos un vale para ver el detalle' : 'Ver detalle completo de los vales seleccionados'}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Ver Detalle</span>
                        {selectedValesCount > 0 && (
                          <span className="bg-blue-500 text-blue-100 px-2 py-1 rounded-full text-xs font-semibold">
                            {selectedValesCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={handleExportarGlobal}
                        disabled={procesandoAccion || isLoading || selectedValesCount === 0}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm font-medium text-sm ${
                          selectedValesCount === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md transform hover:scale-105'
                        }`}
                        title={selectedValesCount === 0 ? 'Selecciona al menos un vale para exportar' : 'Exportar vales seleccionados'}
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span className="hidden sm:inline">Exportar</span>
                        {selectedValesCount > 0 && (
                          <span className="bg-green-500 text-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                            {selectedValesCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-visible">
            <table className={`w-full ${onClose ? 'min-w-[1400px]' : 'min-w-[1200px]'} transition-opacity duration-300 ${actualizandoTabla ? 'opacity-75' : 'opacity-100'}`}>
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {/* Columna de selección */}
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 w-16">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAllValesFinal(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                        title={isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                      />
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${onClose ? 'w-32' : 'w-28'}`}>
                    Vale
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${onClose ? 'w-64' : 'w-48'}`}>
                    Centro de Acopio
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${onClose ? 'w-40' : 'w-32'}`}>
                    Fecha
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-b border-gray-200 bg-blue-50 ${onClose ? 'w-36' : 'w-32'}`}>
                    Estado
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${onClose ? 'w-56' : 'w-48'}`}>
                    Tipos de Entrega
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${onClose ? 'w-56' : 'w-48'}`}>
                    Resumen
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${onClose ? 'w-48' : 'w-40'}`}>
                    Usuario
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${onClose ? 'w-64' : 'w-56'}`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {valesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-6">
                        {isLoading ? (
                          <>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-700">
                                Cargando vales...
                              </p>
                              <p className="text-gray-500 text-sm mt-2">
                                Por favor espere mientras obtenemos la información
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Receipt className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-700">
                                No hay vales generados
                              </p>
                              <p className="text-gray-500 text-sm mt-2">
                                {selectedCentroAcopio === 'todos'
                                  ? 'Seleccione un centro de acopio específico para ver o generar vales'
                                  : `No se encontraron vales para ${meses[selectedMes - 1]} ${selectedAnio}`
                                }
                              </p>
                            </div>
                            {vales.length === 0 && (
                              <div className="flex flex-col items-center space-y-4">
                                {selectedCentroAcopio !== 'todos' ? (
                                  <>
                                    <button
                                      onClick={handleGenerarValeDirecto}
                                      disabled={isGenerating || generandoVale}
                                      className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-base font-semibold disabled:opacity-50 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                      {(isGenerating || generandoVale) ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                      ) : (
                                        <Plus className="h-5 w-5" />
                                      )}
                                      <span>{(isGenerating || generandoVale) ? 'Generando Vale...' : 'Generar Primer Vale'}</span>
                                    </button>
                                    <button
                                      onClick={() => setShowDiagnostico(true)}
                                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center space-x-2"
                                    >
                                      <Settings className="h-4 w-4" />
                                      <span>Diagnóstico del Sistema</span>
                                    </button>
                                  </>
                                ) : (
                                  <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-4">
                                      Para generar vales, primero seleccione un centro de acopio específico en los filtros
                                    </p>
                                    <button
                                      onClick={() => setShowDiagnostico(true)}
                                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2 mx-auto"
                                    >
                                      <Settings className="h-4 w-4" />
                                      <span>Diagnóstico del Sistema</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  valesFiltrados.map((vale) => (
                    <tr key={vale.id} className={`transition-all duration-200 border-b border-gray-100 ${
                      selectedVales.has(vale.id) ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-blue-50'
                    }`}>
                      {/* Columna de selección */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={selectedVales.has(vale.id)}
                          onChange={(e) => handleSelectVale(vale.id, e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                          title={selectedVales.has(vale.id) ? 'Deseleccionar este vale' : 'Seleccionar este vale'}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Receipt className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {vale.numero}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {vale.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {vale.centroAcopio.nombre}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            📍 {vale.centroAcopio.codigo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(vale.fechaGeneracion).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          🕒 {new Date(vale.fechaGeneracion).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap bg-blue-25">
                        <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-bold shadow-sm ${getEstadoColor(vale.estado)} border`}>
                          {getEstadoIcon(vale.estado)}
                          <span className="ml-2 capitalize">{vale.estado}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <DeliveryTypeIdentifiers vale={vale} />
                      </td>
                      <td className="px-6 py-4">
                        <DeliveryTotalsSummary vale={vale} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          👤 {vale.usuario.nombres} {vale.usuario.apellidos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Primary Actions - Most Important */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleVerDetalle(vale)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                              title="Ver detalle completo"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden xl:inline">Ver</span>
                            </button>
                            <button
                              onClick={() => handleAbrirExportModal(vale)}
                              disabled={procesandoAccion || !vale || !vale.id}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                              title="Exportar Vale"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                              <span className="hidden xl:inline">Exportar</span>
                            </button>
                          </div>

                          {/* Secondary Actions - Management */}
                          <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
                            <button
                              onClick={() => handleVerModificaciones(vale)}
                              disabled={isSyncing || procesandoAccion || !vale || !vale.id}
                              className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                              title={isSyncing || procesandoAccion ? "Procesando..." : "Sincronizar"}
                            >
                              {(isSyncing || procesandoAccion) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Settings className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (vale && vale.id && vale.numero) {
                                  handleAbrirConfirmRevertir(vale);
                                }
                              }}
                              disabled={isReverting || procesandoAccion || !vale || !vale.id}
                              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm"
                              title={
                                isReverting || procesandoAccion ? "Procesando reversión..." :
                                "Cambiar estado del vale a 'Pendiente' - Permite modificaciones posteriores"
                              }
                            >
                              {(isReverting || procesandoAccion) ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="hidden lg:inline">Revirtiendo...</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="h-4 w-4" />
                                  <span className="hidden lg:inline">Cambiar a Pendiente</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Danger Actions - Least Important */}
                          <div className="border-l border-gray-200 pl-2">
                            <button
                              onClick={() => {
                                if (vale && vale.id && vale.numero) {
                                  handleAbrirConfirmEliminar(vale);
                                }
                              }}
                              disabled={isDeleting || procesandoAccion || !vale || !vale.id}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                              title={isDeleting || procesandoAccion ? "Procesando..." : "Eliminar vale"}
                            >
                              {(isDeleting || procesandoAccion) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

      {/* Modal de Exportación Directa */}
      {showExportModal && valeParaExportar && (
        <ValeExportModal
          vale={valeParaExportar}
          isOpen={showExportModal}
          onClose={handleCerrarExportModal}
          esExportacionIndividual={true}
        />
      )}

      {/* Modal de Selección de Tipo de Vale */}
      <ValeTypeSelectionModal
        key={`${selectedCentroAcopio}-${selectedMes}-${selectedAnio}-${modalRefreshKey}`} // Forzar remount para datos frescos
        isOpen={showValeTypeSelectionModal}
        onClose={() => setShowValeTypeSelectionModal(false)}
        onConfirm={handleValeTypeSelection}
        centroAcopioId={selectedCentroAcopio}
        centroAcopioNombre={centroAcopioSeleccionado?.nombre || ''}
        mes={selectedMes}
        anio={selectedAnio}
      />

      {showDiagnostico && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Diagnóstico de Conectividad</h3>
                  <p className="text-sm text-gray-600">Verificación del estado del sistema</p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnostico(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-all duration-200"
                title="Cerrar diagnóstico"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-120px)] p-6">
              <ValesConnectionTest />
            </div>
          </div>
        </div>
      )}

      {/* Indicador flotante de generación de vale */}
      {generandoVale && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <p className="font-medium">Generando Vale de Entrega</p>
            <p className="text-sm opacity-90">Procesando datos y actualizando stocks...</p>
          </div>
        </div>
      )}

      {/* Modales de confirmación profesionales - CON CLAVE ÚNICA Y VALIDACIÓN */}
      {valeParaAccion && valeParaAccion.numero && (
        <>
          <ConfirmacionModal
            key={`revertir-${modalKey}`}
            isOpen={showConfirmRevertir}
            onClose={() => {
              if (!procesandoAccion) {
                setShowConfirmRevertir(false);
                setValeParaAccion(null);
              }
            }}
            onConfirm={handleRevertirVale}
            tipo="revertir"
            valeNumero={valeParaAccion.numero}
            isProcessing={procesandoAccion}
          />

          <ConfirmacionModal
            key={`eliminar-${modalKey}`}
            isOpen={showConfirmEliminar}
            onClose={() => {
              if (!procesandoAccion) {
                setShowConfirmEliminar(false);
                setValeParaAccion(null);
              }
            }}
            onConfirm={handleEliminarVale}
            tipo="eliminar"
            valeNumero={valeParaAccion.numero}
            isProcessing={procesandoAccion}
          /> 
        </>
      )}

      {/* Modal de Modificaciones */}
      {showModificacionesModal && valeSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-white" />
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
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Información del vale */}
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

              {/* Botón de sincronización */}
              <div className="mb-6">
                <button
                  onClick={() => handleSincronizarVale(valeSeleccionado.id)}
                  disabled={isSyncing}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sincronizando vale...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      <span>Sincronizar con datos actualizados</span>
                    </>
                  )}
                </button>
              </div>

              {/* Lista de modificaciones */}
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
                                modificacion.tipo === 'cantidad_programada_modificada' ? 'bg-blue-100 text-blue-800' :
                                modificacion.tipo === 'entrega_adicional_modificada' ? 'bg-yellow-100 text-yellow-800' :
                                modificacion.tipo === 'entrega_adicional_agregada' ? 'bg-green-100 text-green-800' :
                                modificacion.tipo === 'establecimiento_agregado' ? 'bg-purple-100 text-purple-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {modificacion.tipo.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              {modificacion.numeroEntregaAdicional && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  Entrega #{modificacion.numeroEntregaAdicional}
                                </span>
                              )}
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
                            modificacion.diferencia > 0 ? 'text-green-600' :
                            modificacion.diferencia < 0 ? 'text-red-600' : 'text-gray-600'
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
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Vale Sincronizado</h4>
                  <p className="text-gray-600">
                    Este vale está actualizado con los datos más recientes. No se requieren modificaciones.
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

      {/* Modales Globales */}
      {valeGlobalCombinado && (
        <>
          {/* Modal de Detalle Global */}
          <ValeDetalleModal
            vale={valeGlobalCombinado}
            isOpen={showGlobalDetalleModal}
            onClose={handleCerrarModalesGlobales}
          />

          {/* Modal de Exportación Global */}
          <ValeExportModal
            vale={valeGlobalCombinado}
            isOpen={showGlobalExportModal}
            onClose={handleCerrarModalesGlobales}
            valesOriginales={valesFiltrados.filter(vale => selectedVales.has(vale.id))}
            esExportacionGlobal={true}
          />
        </>
      )}

      {/* Global Action Bar - Bottom */}
      {valesFiltrados.length > 0 && (
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className={`${onClose ? 'w-full px-4 sm:px-6' : 'max-w-7xl mx-auto px-4 sm:px-6'} py-4`}>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                <span className="font-semibold">{valesFiltrados.length}</span> vales disponibles
                {selectedValesCount > 0 && (
                  <span className="text-indigo-600 font-semibold">
                    • {selectedValesCount} seleccionado{selectedValesCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleVerDetalleGlobal}
                  disabled={procesandoAccion || isLoading || selectedValesCount === 0}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md font-medium ${
                    selectedValesCount === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                  }`}
                  title={selectedValesCount === 0 ? 'Selecciona vales para ver el detalle' : 'Ver detalle completo de los vales seleccionados'}
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalle Completo</span>
                  {selectedValesCount > 0 && (
                    <span className="bg-blue-500 text-blue-100 px-2 py-1 rounded-full text-xs font-semibold">
                      {selectedValesCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleExportarGlobal}
                  disabled={procesandoAccion || isLoading || selectedValesCount === 0}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md font-medium ${
                    selectedValesCount === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
                  }`}
                  title={selectedValesCount === 0 ? 'Selecciona vales para exportar' : 'Exportar vales seleccionados'}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Exportar Vales</span>
                  {selectedValesCount > 0 && (
                    <span className="bg-green-500 text-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                      {selectedValesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Vales;
