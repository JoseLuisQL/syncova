import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStockEvents } from '../../utils/stockEventEmitter';
import {
  Plus,
  Download,
  Calendar,
  Building2,
  Package,
  AlertTriangle,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Users,
  BarChart3,
  Target,
  Zap,
  Archive,
  Calculator,
  Loader2,
  Save,
  Truck as TruckIcon,
  AlertCircle,
  Receipt,
  Upload
} from 'lucide-react';
import './enhanced-table.css';
import {
  Establecimiento,
  Vacuna,
  MovimientoVacuna,
  MovimientoConRelaciones,
  MovimientoCalculado,
  CreateMovimientoDto,
  UpdateMovimientoDto,
  CentroAcopio
} from '../../types';
import { useMovimientos } from '../../hooks/useMovimientos';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAutoSync } from '../../hooks/useAutoSync';
import { debounce } from '../../utils/debounce';
import { PlanificacionService } from '../../services/planificacionService';
import { MovimientosService } from '../../services/movimientosService';
import { MovimientosExportService, MovimientosExportConfig } from '../../services/movimientosExportService';
import { ValesService } from '../../services/valesService';
import {
  ordenarEstablecimientos,
  getEstiloEstablecimiento,
  getColoresEstablecimiento,
  getIconoTipoEstablecimiento,
  getCentroAcopioPorNombre,
  COLORES_CENTROS_ACOPIO
} from '../../utils/centroAcopioUtils';
import Vales from '../Vales/Vales';
import ValesErrorBoundary from '../Vales/ValesErrorBoundary';
import ImportarModal from './ImportarModal';
import ConfirmacionModificacionModal from './ConfirmacionModificacionModal';
import ConfirmacionSinDisponibilidadModal from './ConfirmacionSinDisponibilidadModal';

const Movimientos: React.FC = () => {
  // Hooks para gestión de datos
  const {
    movimientos,
    isLoading,
    isCreating,
    isUpdating,
    error,
    entregaError,
    loadMovimientos,
    createMovimiento,
    updateMovimiento,
    getStockDisponible,
    forceRefreshStock,
    createEntregaAdicional,
    updateEntregaAdicional,
    deleteEntregaAdicional,
    calcularCamposDerivados,
    sincronizarSaldoAnterior,
    descargarPlantillaVacuna,
    descargarPlantillaMasiva,
    importarDesdeExcelVacuna,
    importarDesdeExcelMasivo,
    generarReporteErrores,
    isDownloadingTemplate,
    isImportingExcel,
    actualizarStockSiguienteMes // 🚀 NUEVA FUNCIONALIDAD
  } = useMovimientos();

  // Hook para eventos de stock
  const { onValeGenerated } = useStockEvents();

  const {
    establecimientos,
    centrosAcopio,
    isLoading: isLoadingEstablecimientos,
    loadEstablecimientos,
    loadCentrosAcopio
  } = useEstablecimientos({ noPagination: true }); // CORRECCIÓN: Desactivar paginación para cargar TODOS los establecimientos

  const {
    vacunasActivas,
    isLoadingActivas,
    loadVacunasActivas
  } = useVacunas();

  const { toast } = useToastContext();
  const { user } = useAuth();

  // 🚀 Hook para sincronización automática en tiempo real
  const {
    onEntregaBaseChanged,
    onEntregaAdicionalChanged,
    onDataChanged
  } = useAutoSync();

  // Funciones auxiliares para el sistema de edición profesional
  const getFieldKey = (establecimientoId: string, campo: string) => `${establecimientoId}-${campo}`;

  const getCurrentValue = (establecimientoId: string, campo: string, originalValue: number): number => {
    const key = getFieldKey(establecimientoId, campo);
    // CRÍTICO: Si no existe valor temporal, usar el valor original
    // Esto permite que la cancelación funcione correctamente eliminando el valor temporal
    return tempValues[key] !== undefined ? tempValues[key] : originalValue;
  };

  const hasPendingChange = (establecimientoId: string, campo: string): boolean => {
    const key = getFieldKey(establecimientoId, campo);
    return pendingChanges[key] || false;
  };

  // Funciones auxiliares para entregas adicionales
  const getEntregaFieldKey = (entregaId: string) => `entrega-${entregaId}`;

  const getCurrentEntregaValue = (entregaId: string, originalValue: number): number => {
    const key = getEntregaFieldKey(entregaId);
    return tempEntregasValues[key] !== undefined ? tempEntregasValues[key] : originalValue;
  };

  const hasPendingEntregaChange = (entregaId: string): boolean => {
    const key = getEntregaFieldKey(entregaId);
    return pendingEntregasChanges[key] || false;
  };

  // Función para validar relaciones y dependencias
  const validateMovimientoForEntregaAdicional = (movimiento: MovimientoCalculado & { tieneMovimiento: boolean }): string | null => {
    if (!movimiento.tieneMovimiento) {
      return 'Debe crear primero el movimiento principal antes de agregar entregas adicionales';
    }

    const maxEntregas = 10; // Límite del backend
    const currentEntregas = movimiento.entregasAdicionales?.length || 0;
    if (currentEntregas >= maxEntregas) {
      return `No se pueden crear más de ${maxEntregas} entregas adicionales por movimiento`;
    }

    return null; // Sin errores
  };

  // Estados locales para filtros
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>('todos');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  const [selectedMes, setSelectedMes] = useState<number>(new Date().getMonth() + 1);
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());

  // Estado para modal de vales
  const [showValesModal, setShowValesModal] = useState<boolean>(false);

  // Estado para modal de importación
  const [showImportarModal, setShowImportarModal] = useState<boolean>(false);

  // Estados para modal de confirmación de modificación
  const [showConfirmacionModal, setShowConfirmacionModal] = useState<boolean>(false);
  const [pendingModification, setPendingModification] = useState<{
    establecimientoId: string;
    campo: string;
    valorOriginal: number;
    valorNuevo: number;
    establecimientoNombre: string;
    valesAfectados: Array<{
      numero: string;
      fechaGeneracion: Date;
    }>;
  } | null>(null);

  // Estados para modal de confirmación sin disponibilidad
  const [showSinDisponibilidadModal, setShowSinDisponibilidadModal] = useState<boolean>(false);
  const [pendingSinDisponibilidad, setPendingSinDisponibilidad] = useState<{
    establecimientoId: string;
    campo: string;
    valor: number;
    establecimientoNombre: string;
    tipoEntrega: 'base' | 'adicional';
    entregaAdicionalId?: string;
  } | null>(null);

  // Estados para stock disponible
  const [stockInfo, setStockInfo] = useState<{
    stockInicialHistorico: number | null;
    stockInicialOriginal: number | null;
    ingresosLotesDelMes: number;
    fechaCapturaStockInicial: Date | null;
    stockActual: number;
    totalEntregas: number;
    stockDisponible: number;
    estado: 'bueno' | 'medio' | 'critico';
    tieneHistorialInicial: boolean;
    lotes: Array<{
      id: string;
      numero: string;
      cantidadActual: number;
      fechaVencimiento: Date;
      estado: string;
    }>;
  } | null>(null);

  // Estados para la interfaz
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoCalculado | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false); // Para mostrar cuando se actualiza en tiempo real
  const [showEntregasAdicionalesModal, setShowEntregasAdicionalesModal] = useState(false);
  const [movimientoParaEntregas, setMovimientoParaEntregas] = useState<MovimientoCalculado | null>(null);

  // 🚀 Función auxiliar para actualizar stock en tiempo real con indicadores visuales
  const updateStockInRealTime = async (showToastOnDeficit: boolean = true) => {
    if (!selectedVacuna) return;

    setIsUpdatingStock(true);
    try {
      const stock = await getStockDisponible(selectedVacuna, selectedMes, selectedAnio);
      setStockInfo(stock);
      setStockError(null);

      // Mostrar notificación si hay déficit después del cambio
      if (showToastOnDeficit && stock && stock.stockDisponible < 0) {
        const vacunaNombre = vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna';
        toast.warning(`⚠️ Déficit detectado • ${vacunaNombre} • ${meses[selectedMes - 1]} ${selectedAnio} • ${Math.abs(stock.stockDisponible).toLocaleString()} unidades`);
      }
    } catch (error: any) {
      console.error('Error al actualizar stock disponible:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar stock';
      setStockError(errorMessage);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Estados para el sistema de edición profesional
  const [tempValues, setTempValues] = useState<{[key: string]: number}>({});
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  const debounceTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Estados específicos para entregas adicionales
  const [tempEntregasValues, setTempEntregasValues] = useState<{[key: string]: number}>({});
  const [pendingEntregasChanges, setPendingEntregasChanges] = useState<{[key: string]: boolean}>({});
  const entregasDebounceTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({});
  const [isProcessingEntrega, setIsProcessingEntrega] = useState(false);

  // Estados para exportación
  const [isExporting, setIsExporting] = useState(false);

  // Estados para manejo avanzado de validación de vales
  const voucherValidationTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({});
  const [isTyping, setIsTyping] = useState<{[key: string]: boolean}>({});

  // 🚀 Estado para actualización de stock siguiente mes
  const [isUpdatingStockSiguienteMes, setIsUpdatingStockSiguienteMes] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          // CORRECCIÓN: Asegurar que los establecimientos se cargan con noPagination
          loadEstablecimientos({ noPagination: true }),
          loadCentrosAcopio(),
          loadVacunasActivas()
        ]);
        console.log(`✅ Datos iniciales cargados: ${establecimientos.length} establecimientos`);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast.error('Error al cargar datos iniciales');
      }
    };

    loadInitialData();
  }, []); // Solo ejecutar una vez al montar el componente

  // Configurar vacuna por defecto cuando se cargan las vacunas
  useEffect(() => {
    if (vacunasActivas.length > 0 && !selectedVacuna) {
      setSelectedVacuna(vacunasActivas[0].id);
    }
  }, [vacunasActivas, selectedVacuna]);

  // Cargar movimientos cuando cambian los filtros
  useEffect(() => {
    if (selectedVacuna) {
      const filters = {
        vacunaId: selectedVacuna,
        mes: selectedMes,
        anio: selectedAnio,
        ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
      };

      console.log(`🔄 Cargando movimientos con filtros:`, filters);
      console.log(`🏥 Estado actual de establecimientos: ${establecimientos.length} cargados`);
      console.log(`🏥 Centro de acopio seleccionado: ${selectedCentroAcopio}`);

      loadMovimientos(filters);
    }
  }, [selectedVacuna, selectedMes, selectedAnio, selectedCentroAcopio]); // Removido loadMovimientos para evitar loop

  // Cargar stock disponible cuando cambian los filtros
  useEffect(() => {
    const loadStock = async () => {
      if (selectedVacuna) {
        setIsLoadingStock(true);
        setStockError(null);
        try {
          const stock = await getStockDisponible(selectedVacuna, selectedMes, selectedAnio);
          setStockInfo(stock);

          // Mostrar notificación si hay déficit
          if (stock && stock.stockDisponible < 0) {
            const vacunaNombre = vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna';
            toast.warning(`⚠️ Déficit detectado • ${vacunaNombre} • ${meses[selectedMes - 1]} ${selectedAnio} • ${Math.abs(stock.stockDisponible).toLocaleString()} unidades`);
          }
        } catch (error: any) {
          console.error('Error al cargar stock disponible:', error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Error al cargar stock disponible';
          setStockError(errorMessage);
          setStockInfo(null);
          toast.error(`❌ Error al cargar stock • ${errorMessage}`);
        } finally {
          setIsLoadingStock(false);
        }
      } else {
        setStockInfo(null);
        setStockError(null);
      }
    };

    loadStock();
  }, [selectedVacuna, selectedMes, selectedAnio, vacunasActivas]); // Agregado vacunasActivas para las notificaciones

  // 📡 EFECTO PARA ACTUALIZACIÓN AUTOMÁTICA EN TIEMPO REAL
  // Escucha eventos de generación de vales y actualiza el stock automáticamente
  useEffect(() => {
    const unsubscribe = onValeGenerated(async (event) => {
      console.log('🔄 [Movimientos] Recibido evento de vale generado:', event);
      
      // Verificar si estamos en el mismo período que se generó el vale
      if (event.mes === selectedMes && event.anio === selectedAnio) {
        console.log('✅ [Movimientos] Período coincidente - Actualizando stock automáticamente...');
        
        // Si hay una vacuna seleccionada, actualizar su stock
        if (selectedVacuna) {
          try {
            setIsLoadingStock(true);
            setStockError(null);
            
            // Usar forceRefreshStock para obtener datos frescos
            const freshStock = await forceRefreshStock(selectedVacuna, selectedMes, selectedAnio);
            
            if (freshStock) {
              setStockInfo(freshStock);
              console.log('✅ [Movimientos] Stock actualizado automáticamente:', freshStock);
              
              // Mostrar notificación sutil de actualización
              toast.info(
                'Stock actualizado automáticamente',
                `Los datos de stock se han actualizado después de generar el vale.`,
                { 
                  duration: 4000,
                  style: {
                    background: '#3B82F6',
                    color: 'white'
                  }
                }
              );
            }
          } catch (error: any) {
            console.error('❌ [Movimientos] Error actualizando stock automáticamente:', error);
            setStockError('Error al actualizar stock automáticamente');
          } finally {
            setIsLoadingStock(false);
          }
        }
        
        // También recargar los movimientos para reflejar los cambios
        console.log('🔄 [Movimientos] Recargando movimientos después de generar vale...');
        const filters = {
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          centroAcopioId: selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined
        };
        
        await loadMovimientos(filters);
      } else {
        console.log(`ℹ️  [Movimientos] Vale generado para período diferente: ${event.mes}/${event.anio} vs ${selectedMes}/${selectedAnio}`);
      }
    });

    // Cleanup al desmontar el componente
    return unsubscribe;
  }, [onValeGenerated, selectedVacuna, selectedMes, selectedAnio, selectedCentroAcopio, forceRefreshStock, loadMovimientos, toast]);

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      // Limpiar timeouts de campos principales
      Object.values(debounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });

      // Limpiar timeouts de entregas adicionales
      Object.values(entregasDebounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });

      // Limpiar timeouts de validación de vales
      Object.values(voucherValidationTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // 🚀 NUEVA FUNCIONALIDAD: Manejar actualización de stock inicial siguiente mes
  const handleActualizarStockSiguienteMes = async () => {
    if (!selectedVacuna || !stockInfo) {
      toast.error('❌ Error • Debe seleccionar una vacuna y tener stock disponible cargado');
      return;
    }

    try {
      setIsUpdatingStockSiguienteMes(true);

      const resultado = await actualizarStockSiguienteMes(selectedVacuna, selectedMes, selectedAnio);

      if (resultado) {
        const vacunaNombre = vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna';
        const mesActualNombre = meses[selectedMes - 1];
        const mesSiguienteNombre = meses[resultado.mesSiguiente.mes - 1];

        toast.success(
          `✅ ${resultado.mensaje}`,
          `${vacunaNombre} • ${mesActualNombre}: ${resultado.mesActual.disponible.toLocaleString()} unidades → ${mesSiguienteNombre}: ${resultado.mesSiguiente.stockInicialRegistrado.toLocaleString()} unidades`,
          { duration: 6000 }
        );

        // Recargar stock disponible para reflejar los cambios
        await updateStockInRealTime(false);
      } else {
        toast.error('❌ Error al actualizar stock inicial del siguiente mes');
      }
    } catch (error: any) {
      console.error('Error al actualizar stock siguiente mes:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar stock inicial del siguiente mes';
      toast.error(`❌ Error • ${errorMessage}`, '', { duration: 6000 });
    } finally {
      setIsUpdatingStockSiguienteMes(false);
    }
  };

  // Datos derivados

  const vacunaSeleccionada = useMemo(() =>
    vacunasActivas.find(v => v.id === selectedVacuna),
    [vacunasActivas, selectedVacuna]
  );

  const establecimientosFiltrados = useMemo(() => {
    let filtrados: Establecimiento[];

    if (selectedCentroAcopio === 'todos') {
      // CORRECCIÓN: Los establecimientos ya no incluyen centros de acopio por diseño de BD
      filtrados = establecimientos;
      console.log(`🏥 Filtro "Todos": ${filtrados.length} establecimientos de ${establecimientos.length} totales`);
    } else {
      filtrados = establecimientos.filter(e => e.centroAcopioId === selectedCentroAcopio);
      console.log(`🏥 Filtro específico (${selectedCentroAcopio}): ${filtrados.length} establecimientos`);
    }

    // Aplicar ordenamiento profesional por centro de acopio
    const ordenados = ordenarEstablecimientos(filtrados);
    console.log(`📋 Establecimientos ordenados: ${ordenados.length}`);
    return ordenados;
  }, [establecimientos, selectedCentroAcopio]);

  // Calcular movimientos con campos derivados
  const movimientosCalculados = useMemo(() => 
    movimientos.map(mov => calcularCamposDerivados(mov)),
    [movimientos, calcularCamposDerivados]
  );

  // Generar datos para la tabla (incluyendo establecimientos sin movimientos) con valores temporales
  const datosTabla = useMemo(() => {
    console.log(`📊 Generando datos de tabla:`);
    console.log(`   - Establecimientos filtrados: ${establecimientosFiltrados.length}`);
    console.log(`   - Movimientos calculados: ${movimientosCalculados.length}`);
    console.log(`   - Centro de acopio seleccionado: ${selectedCentroAcopio}`);

    const datos = establecimientosFiltrados.map(establecimiento => {
      // Buscar movimiento existente
      const movimientoExistente = movimientosCalculados.find(
        m => m.establecimientoId === establecimiento.id
      );

      if (movimientoExistente) {
        // Aplicar valores temporales si existen
        const transIngreso = getCurrentValue(establecimiento.id, 'transIngreso', movimientoExistente.transIngreso);
        const salida = getCurrentValue(establecimiento.id, 'salida', movimientoExistente.salida);
        const transSalida = getCurrentValue(establecimiento.id, 'transSalida', movimientoExistente.transSalida);
        const entrega = getCurrentValue(establecimiento.id, 'entrega', movimientoExistente.entrega);

        // Recalcular campos derivados con valores temporales
        const totalSaldo = movimientoExistente.saldoAnterior + transIngreso;
        const saldo = totalSaldo - salida - transSalida;
        const stock = saldo + entrega;

        console.log(`   ✅ ${establecimiento.nombre}: CON movimiento (${movimientoExistente.id})`);

        return {
          ...movimientoExistente,
          transIngreso,
          salida,
          transSalida,
          entrega,
          totalSaldo,
          saldo,
          stock,
          establecimiento,
          tieneMovimiento: true
        };
      } else {
        // Crear registro vacío para establecimiento sin movimiento
        const transIngreso = getCurrentValue(establecimiento.id, 'transIngreso', 0);
        const salida = getCurrentValue(establecimiento.id, 'salida', 0);
        const transSalida = getCurrentValue(establecimiento.id, 'transSalida', 0);
        const entrega = getCurrentValue(establecimiento.id, 'entrega', 0);

        // Calcular campos derivados
        const totalSaldo = 0 + transIngreso;
        const saldo = totalSaldo - salida - transSalida;
        const stock = saldo + entrega;

        console.log(`   ⚠️  ${establecimiento.nombre}: SIN movimiento (creando temporal)`);

        return {
          id: `temp-${establecimiento.id}`,
          establecimientoId: establecimiento.id,
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          saldoAnterior: 0,
          transIngreso,
          salida,
          transSalida,
          entrega,
          totalSaldo,
          saldo,
          stock,
          promedioConsumo: 0,
          disponibilidad: 0,
          observaciones: '',
          fechaMovimiento: new Date(),
          usuarioId: '', // Se asignará al crear
          createdAt: new Date(),
          updatedAt: new Date(),
          establecimiento,
          vacuna: vacunaSeleccionada!,
          usuario: { id: '', nombres: '', apellidos: '', email: '' },
          entregasAdicionales: [],
          tieneMovimiento: false
        } as MovimientoCalculado & { tieneMovimiento: boolean };
      }
    });

    console.log(`📊 Datos de tabla generados: ${datos.length} registros`);
    const conMovimiento = datos.filter(d => d.tieneMovimiento).length;
    const sinMovimiento = datos.filter(d => !d.tieneMovimiento).length;
    console.log(`   - Con movimiento: ${conMovimiento}`);
    console.log(`   - Sin movimiento: ${sinMovimiento}`);

    return datos;
  }, [establecimientosFiltrados, movimientosCalculados, selectedVacuna, selectedMes, selectedAnio, vacunaSeleccionada, tempValues]);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Usar colores profesionales del sistema centralizado
  const coloresAcopio = COLORES_CENTROS_ACOPIO;

  // Función para manejar cambios temporales (onChange)
  const handleTempValueChange = async (establecimientoId: string, campo: string, newValue: number) => {
    const key = getFieldKey(establecimientoId, campo);

    // VALIDACIÓN DE PLANIFICACIÓN: Solo validar cuando se modifica el campo 'entrega'
    if (campo === 'entrega' && newValue > 0) {
      try {
        const verificacion = await PlanificacionService.verificarExistenciaPlanificacion(
          establecimientoId,
          selectedVacuna!,
          selectedAnio
        );

        if (!verificacion.existe) {
          const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
          const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

          toast.error(
            'No se puede asignar cantidad',
            `Este establecimiento no tiene planificación programada para ${selectedAnio}. Debe crear una planificación primero desde el módulo de Planificación.`,
            { duration: 6000 }
          );

          // Revertir el valor temporal inmediatamente
          setTempValues(prev => {
            const newTemp = { ...prev };
            delete newTemp[key];
            return newTemp;
          });

          setPendingChanges(prev => {
            const newPending = { ...prev };
            delete newPending[key];
            return newPending;
          });

          return;
        }
      } catch (error) {
        console.error('Error al verificar planificación:', error);
        toast.error('Error de validación', 'No se pudo verificar la planificación. Intente nuevamente.');
        return;
      }
    }

    // Actualizar valor temporal
    setTempValues(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Marcar como cambio pendiente
    setPendingChanges(prev => ({
      ...prev,
      [key]: true
    }));

    // Limpiar timeout anterior si existe
    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
    }

    // Marcar que el usuario está escribiendo
    setIsTyping(prev => ({
      ...prev,
      [key]: true
    }));

    // Limpiar timeouts anteriores de validación de vales
    if (voucherValidationTimeouts.current[key]) {
      clearTimeout(voucherValidationTimeouts.current[key]);
    }

    // Para campos de entrega, usar validación avanzada con debounce profesional
    if ((campo === 'entrega' || campo === 'entregaBase') && selectedVacuna) {
      handleAdvancedVoucherValidation(establecimientoId, campo, newValue, key);
    } else {
      // Para otros campos, configurar auto-guardado normal
      debounceTimeouts.current[key] = setTimeout(() => {
        setIsTyping(prev => ({
          ...prev,
          [key]: false
        }));
        handleSaveFieldValue(establecimientoId, campo, newValue);
      }, 2000);
    }
  };

  // Función avanzada para validación de vales con debounce profesional
  const handleAdvancedVoucherValidation = (establecimientoId: string, campo: string, newValue: number, key: string) => {
    // Configurar timeout para validación de vales (más largo para permitir completar la escritura)
    const voucherTimeout = setTimeout(async () => {
      // Marcar que ya no está escribiendo
      setIsTyping(prev => ({
        ...prev,
        [key]: false
      }));

      // Verificar si necesita validación de vales
      const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
      const esCreacion = !movimientoExistente?.tieneMovimiento;
      const valorOriginal = movimientoExistente?.[campo as keyof typeof movimientoExistente] as number || 0;

      // Solo verificar para modificaciones donde el valor realmente cambió
      if (!esCreacion && valorOriginal !== newValue) {
        const necesitaConfirmacion = await checkForVoucherConfirmation(establecimientoId, campo, newValue);

        if (!necesitaConfirmacion) {
          // Si no necesita confirmación, configurar auto-guardado
          debounceTimeouts.current[key] = setTimeout(() => {
            handleSaveFieldValue(establecimientoId, campo, newValue);
          }, 500); // Tiempo más corto ya que la validación ya se hizo
        }
        // Si necesita confirmación, el modal ya se mostró y no se configura auto-guardado
      } else {
        // Para creaciones o valores sin cambio, configurar auto-guardado normal
        debounceTimeouts.current[key] = setTimeout(() => {
          handleSaveFieldValue(establecimientoId, campo, newValue);
        }, 500);
      }
    }, 1500); // 1.5 segundos para permitir completar la escritura

    // Guardar el timeout para poder cancelarlo si es necesario
    voucherValidationTimeouts.current[key] = voucherTimeout;
  };

  // Función para verificar si se necesita confirmación antes de guardar
  const checkForVoucherConfirmation = async (establecimientoId: string, campo: string, value: number): Promise<boolean> => {
    // Si ya hay un modal de confirmación abierto, no procesar más verificaciones
    if (showConfirmacionModal) {
      return true; // Bloquear cualquier guardado adicional
    }

    // Obtener el movimiento existente para determinar si es creación o actualización
    const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
    const esCreacion = !movimientoExistente?.tieneMovimiento;
    const valorOriginal = movimientoExistente?.[campo as keyof typeof movimientoExistente] as number || 0;

    // Solo verificar para modificaciones de entrega en establecimientos existentes
    if (!esCreacion && campo === 'entrega' && selectedVacuna && valorOriginal !== value) {
      try {
        const verificacionVales = await ValesService.verificarValesExistentes(
          establecimientoId,
          selectedVacuna,
          selectedMes,
          selectedAnio
        );

        if (verificacionVales.success && verificacionVales.data?.existenVales) {
          // Hay vales existentes - configurar modal de confirmación
          const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
          const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

          // CRÍTICO: Cancelar cualquier timeout de auto-guardado antes de mostrar modal
          const key = getFieldKey(establecimientoId, campo);
          if (debounceTimeouts.current[key]) {
            clearTimeout(debounceTimeouts.current[key]);
            delete debounceTimeouts.current[key];
          }

          setPendingModification({
            establecimientoId,
            campo,
            valorOriginal,
            valorNuevo: value,
            establecimientoNombre: nombreEstablecimiento,
            valesAfectados: verificacionVales.data.valesEncontrados.map(vale => ({
              numero: vale.numero,
              fechaGeneracion: vale.fechaGeneracion
            }))
          });
          setShowConfirmacionModal(true);
          return true; // Necesita confirmación
        }
      } catch (error) {
        console.error('Error verificando vales existentes:', error);
        // Si hay error en la verificación, continuar con la modificación normal
      }
    }

    return false; // No necesita confirmación
  };

  // Función para verificar disponibilidad de entregas antes de guardar
  const verificarDisponibilidadAntesDeGuardar = async (
    establecimientoId: string,
    campo: string,
    value: number
  ): Promise<boolean> => {
    // Solo verificar para entregas base (campo 'entrega')
    if (campo !== 'entrega' || !selectedVacuna || value <= 0) {
      return true; // Permitir guardar sin verificación
    }

    try {
      // Verificar disponibilidad en la planificación
      const disponibilidad = await PlanificacionService.verificarDisponibilidadEntregas(
        establecimientoId,
        selectedVacuna,
        selectedMes,
        selectedAnio
      );

      // Si NO tiene disponibilidad, mostrar el modal de confirmación
      if (!disponibilidad.tieneDisponibilidad) {
        const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
        const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

        setPendingSinDisponibilidad({
          establecimientoId,
          campo,
          valor: value,
          establecimientoNombre: nombreEstablecimiento,
          tipoEntrega: 'base'
        });
        setShowSinDisponibilidadModal(true);

        return false; // Bloquear el guardado normal
      }

      return true; // Tiene disponibilidad, permitir guardar normalmente
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      // En caso de error, permitir guardar (para no bloquear el flujo)
      return true;
    }
  };

  // Función para guardar un campo específico (ahora con verificación previa)
  const handleSaveFieldValue = async (establecimientoId: string, campo: string, value: number) => {
    const key = getFieldKey(establecimientoId, campo);

    try {
      setIsAutoSaving(true);

      // NUEVA FUNCIONALIDAD: Verificar disponibilidad antes de guardar entregas
      const puedeGuardar = await verificarDisponibilidadAntesDeGuardar(establecimientoId, campo, value);
      if (!puedeGuardar) {
        // No guardar, el modal se mostrará
        setIsAutoSaving(false);
        return;
      }

      // Limpiar timeout si existe
      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
        delete debounceTimeouts.current[key];
      }

      // VERIFICACIÓN CRÍTICA: Comprobar si se necesita confirmación ANTES de guardar
      const necesitaConfirmacion = await checkForVoucherConfirmation(establecimientoId, campo, value);

      if (necesitaConfirmacion) {
        // Modal de confirmación mostrado - NO guardar todavía
        setIsAutoSaving(false);
        return;
      }

      // Proceder con el guardado normal (sin confirmación necesaria)
      await saveFieldValueToDatabase(establecimientoId, campo, value);

    } catch (error: any) {
      console.error('Error al guardar campo:', error);

      // Obtener información del establecimiento para el toast de error
      const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
      const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';
      const campoNombre = {
        'transIngreso': 'Trans. Ingreso',
        'salida': 'Salida',
        'transSalida': 'Trans. Salida',
        'entrega': 'Entrega',
        'entregaBase': 'Entrega Base'
      }[campo] || campo;

      toast.error(
        `❌ Error al guardar ${campoNombre} • ${nombreEstablecimiento} • Valor: ${value.toLocaleString()} • Los cambios se mantienen`
      );

      // En caso de error, mantener el valor temporal para que el usuario pueda intentar de nuevo
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Función separada para guardar en la base de datos (sin verificaciones de confirmación)
  const saveFieldValueToDatabase = async (establecimientoId: string, campo: string, value: number) => {
    const key = getFieldKey(establecimientoId, campo);

    // Obtener información del establecimiento para el toast
    const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
    const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

    // Obtener el movimiento existente para determinar si es creación o actualización
    const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
    const esCreacion = !movimientoExistente?.tieneMovimiento;

    // Intentar actualizar en el backend (con redistribución automática)
    try {
      await handleActualizarCampoMovimiento(establecimientoId, campo as keyof UpdateMovimientoDto, value);

      // Limpiar estado temporal
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[key];
        return newTemp;
      });

      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });

      // Mostrar toast de confirmación profesional
      const campoNombre = {
        'transIngreso': 'Trans. Ingreso',
        'salida': 'Salida',
        'transSalida': 'Trans. Salida',
        'entrega': 'Entrega'
      }[campo] || campo;

      if (esCreacion) {
        toast.success(
          `✅ Movimiento creado • ${nombreEstablecimiento} • ${campoNombre}: ${value.toLocaleString()}`
        );
      } else {
        const mensajeBase = `✅ ${campoNombre} actualizado • ${nombreEstablecimiento} • Valor: ${value.toLocaleString()}`;
        const mensajeSincronizacion = campo === 'entrega' ? ' • Sincronizado con planificación' : '';
        toast.success(mensajeBase + mensajeSincronizacion);
      }
    } catch (redistributionError: any) {
      // Detectar error específico de redistribución (sin disponibilidad)
      const errorMessage = redistributionError?.response?.data?.message || redistributionError?.response?.data?.error || redistributionError?.message || '';
      
      // Si el error es de falta de disponibilidad para redistribuir, mostrar el modal
      if (errorMessage.includes('No hay cantidades suficientes') || 
          errorMessage.includes('Faltan') || 
          errorMessage.includes('redistribuir')) {
        
        console.log('🚨 Error de redistribución detectado en entrega base, mostrando modal de sin disponibilidad');
        
        // Mostrar el modal de sin disponibilidad
        setPendingSinDisponibilidad({
          establecimientoId,
          campo,
          valor: value,
          establecimientoNombre: nombreEstablecimiento,
          tipoEntrega: 'base'
        });
        setShowSinDisponibilidadModal(true);
        
        // NO lanzar el error, solo salir
        return;
      }
      
      // Si es otro tipo de error, re-lanzarlo
      throw redistributionError;
    }

    // FUNCIONALIDAD NUEVA: Recargar datos automáticamente después de actualizar campos que afectan el stock
    // Esto asegura que los cambios en el saldo anterior del siguiente mes se reflejen inmediatamente
    if (['saldoAnterior', 'transIngreso', 'salida', 'transSalida', 'entrega', 'entregaBase'].includes(campo)) {
      // Recargar los datos con un pequeño delay para permitir que el trigger de base de datos se ejecute
      setTimeout(async () => {
        if (selectedVacuna) {
          const filters = {
            vacunaId: selectedVacuna,
            mes: selectedMes,
            anio: selectedAnio,
            ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
          };
          await loadMovimientos(filters);

          // 🚀 NUEVA FUNCIONALIDAD: Actualizar Stock Disponible en tiempo real cuando cambia la entrega
          if (campo === 'entrega') {
            await updateStockInRealTime();
          }
        }
      }, 500); // 500ms de delay para asegurar que el trigger se ejecute
    }
  };

  // Funciones para manejar el modal de confirmación de modificación
  const handleConfirmModification = async () => {
    if (!pendingModification) return;

    try {
      setIsAutoSaving(true);

      // Proceder con la modificación usando la función de guardado en base de datos
      await saveFieldValueToDatabase(
        pendingModification.establecimientoId,
        pendingModification.campo,
        pendingModification.valorNuevo
      );

      // Mostrar toast de confirmación específico para modificaciones con vales
      toast.success(
        `✅ Entrega modificada • ${pendingModification.establecimientoNombre} • Valor: ${pendingModification.valorNuevo.toLocaleString()} • Vales sincronizados automáticamente`
      );

      // Recargar datos para reflejar cambios
      if (selectedVacuna) {
        const filters = {
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
        };
        await loadMovimientos(filters);
      }

      // Cerrar modal
      setShowConfirmacionModal(false);
      setPendingModification(null);
    } catch (error: any) {
      console.error('Error al confirmar modificación:', error);
      toast.error(
        `❌ Error al modificar entrega • ${pendingModification.establecimientoNombre} • ${error.message || 'Error desconocido'}`
      );
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleCancelModification = () => {
    if (!pendingModification) return;

    const key = getFieldKey(pendingModification.establecimientoId, pendingModification.campo);

    // CRÍTICO: Cancelar cualquier timeout de auto-guardado pendiente
    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
      delete debounceTimeouts.current[key];
    }

    // CRÍTICO: Cancelar cualquier timeout de validación de vales pendiente
    if (voucherValidationTimeouts.current[key]) {
      clearTimeout(voucherValidationTimeouts.current[key]);
      delete voucherValidationTimeouts.current[key];
    }

    // CORRECCIÓN CRÍTICA: Eliminar completamente el valor temporal para revertir al original
    // NO establecer el valor temporal al original, sino eliminarlo completamente
    setTempValues(prev => {
      const newTemp = { ...prev };
      delete newTemp[key]; // Eliminar completamente para que getCurrentValue use el valor original
      return newTemp;
    });

    // Limpiar cambios pendientes
    setPendingChanges(prev => {
      const newPending = { ...prev };
      delete newPending[key];
      return newPending;
    });

    // Limpiar estado de escritura
    setIsTyping(prev => {
      const newTyping = { ...prev };
      delete newTyping[key];
      return newTyping;
    });

    // Cerrar modal
    setShowConfirmacionModal(false);
    setPendingModification(null);

    toast.info(
      `🔄 Modificación cancelada • ${pendingModification.establecimientoNombre} • Valor revertido a: ${pendingModification.valorOriginal.toLocaleString()}`
    );
  };

  const handleCloseConfirmationModal = () => {
    if (!isAutoSaving) {
      handleCancelModification();
    }
  };

  // Funciones para manejar el modal de sin disponibilidad
  const handleConfirmSinDisponibilidad = async () => {
    if (!pendingSinDisponibilidad || !selectedVacuna) return;

    try {
      setIsAutoSaving(true);
      setIsProcessingEntrega(true);

      // Llamar al servicio para registrar en mes actual (actualiza la planificación)
      const resultado = await PlanificacionService.registrarEntregaMesActual(
        pendingSinDisponibilidad.establecimientoId,
        selectedVacuna,
        selectedMes,
        selectedAnio,
        pendingSinDisponibilidad.valor,
        user?.id
      );

      // Ahora procesar según el tipo de entrega
      if (pendingSinDisponibilidad.tipoEntrega === 'adicional' && pendingSinDisponibilidad.entregaAdicionalId) {
        // Para entregas adicionales: actualizar la entrega adicional en la BD
        // IMPORTANTE: Usar axios directamente para actualizar SOLO la cantidad, sin redistribución
        console.log('🔄 Actualizando entrega adicional en BD (sin redistribución)...');
        
        try {
          // Actualizar directamente con axios, evitando la redistribución automática
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          const token = localStorage.getItem('token');
          
          const response = await fetch(`${apiUrl}/movimientos/entregas-adicionales/${pendingSinDisponibilidad.entregaAdicionalId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              cantidad: pendingSinDisponibilidad.valor,
              skipRedistribucion: true // Flag para evitar redistribución
            })
          });
          
          if (!response.ok) {
            throw new Error('Error al actualizar entrega adicional');
          }
          
          console.log('✅ Entrega adicional actualizada en BD');
          
        } catch (updateError) {
          console.error('Error al actualizar entrega adicional:', updateError);
          // Continuar de todas formas, ya que la planificación ya se actualizó
        }

        // Mostrar toast de éxito específico para entrega adicional
        toast.success(
          `✅ Entrega adicional registrada exitosamente • ${pendingSinDisponibilidad.establecimientoNombre} • ${pendingSinDisponibilidad.valor.toLocaleString()} unidades • Planificación actualizada automáticamente`,
          '',
          { duration: 6000 }
        );

        // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales para entrega adicional
        onEntregaAdicionalChanged(pendingSinDisponibilidad.establecimientoId, selectedVacuna, selectedMes, selectedAnio);
      } else {
        // Para entregas base: el movimiento ya se actualizó con la sincronización automática
        // Solo mostrar toast de éxito
        toast.success(
          `✅ Entrega base registrada exitosamente • ${pendingSinDisponibilidad.establecimientoNombre} • ${pendingSinDisponibilidad.valor.toLocaleString()} unidades • Planificación actualizada automáticamente`,
          '',
          { duration: 6000 }
        );

        // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales para entrega base
        onEntregaBaseChanged(pendingSinDisponibilidad.establecimientoId, selectedVacuna, selectedMes, selectedAnio);
      }

      // Recargar datos para reflejar los cambios
      if (selectedVacuna) {
        const filters = {
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
        };
        await loadMovimientos(filters);
        await updateStockInRealTime(false);
      }

      // Cerrar modal y limpiar estado
      setShowSinDisponibilidadModal(false);
      setPendingSinDisponibilidad(null);

      // Limpiar valores temporales según el tipo
      if (pendingSinDisponibilidad.tipoEntrega === 'adicional' && pendingSinDisponibilidad.entregaAdicionalId) {
        // Limpiar valores temporales de entrega adicional
        const key = getEntregaFieldKey(pendingSinDisponibilidad.entregaAdicionalId);
        setTempEntregasValues(prev => {
          const newTemp = { ...prev };
          delete newTemp[key];
          return newTemp;
        });
        setPendingEntregasChanges(prev => {
          const newPending = { ...prev };
          delete newPending[key];
          return newPending;
        });
      } else {
        // Limpiar valores temporales de entrega base
        const key = getFieldKey(pendingSinDisponibilidad.establecimientoId, pendingSinDisponibilidad.campo);
        setTempValues(prev => {
          const newTemp = { ...prev };
          delete newTemp[key];
          return newTemp;
        });
        setPendingChanges(prev => {
          const newPending = { ...prev };
          delete newPending[key];
          return newPending;
        });
      }

    } catch (error: any) {
      console.error('Error al confirmar registro sin disponibilidad:', error);
      const tipoEntregaTexto = pendingSinDisponibilidad.tipoEntrega === 'adicional' ? 'entrega adicional' : 'entrega base';
      toast.error(
        `❌ Error al registrar ${tipoEntregaTexto} • ${pendingSinDisponibilidad.establecimientoNombre} • ${error.message || 'Error desconocido'}`,
        '',
        { duration: 6000 }
      );
    } finally {
      setIsAutoSaving(false);
      setIsProcessingEntrega(false);
    }
  };

  const handleCancelSinDisponibilidad = () => {
    if (!pendingSinDisponibilidad) return;

    // Limpiar según el tipo de entrega
    if (pendingSinDisponibilidad.tipoEntrega === 'adicional' && pendingSinDisponibilidad.entregaAdicionalId) {
      // Para entregas adicionales
      const key = getEntregaFieldKey(pendingSinDisponibilidad.entregaAdicionalId);

      // Cancelar cualquier timeout pendiente
      if (entregasDebounceTimeouts.current[key]) {
        clearTimeout(entregasDebounceTimeouts.current[key]);
        delete entregasDebounceTimeouts.current[key];
      }

      // Eliminar completamente el valor temporal para revertir al original
      setTempEntregasValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[key];
        return newTemp;
      });

      setPendingEntregasChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });
    } else {
      // Para entregas base
      const key = getFieldKey(pendingSinDisponibilidad.establecimientoId, pendingSinDisponibilidad.campo);

      // Cancelar cualquier timeout pendiente
      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
        delete debounceTimeouts.current[key];
      }

      if (voucherValidationTimeouts.current[key]) {
        clearTimeout(voucherValidationTimeouts.current[key]);
        delete voucherValidationTimeouts.current[key];
      }

      // Eliminar completamente el valor temporal para revertir al original
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[key];
        return newTemp;
      });

      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });

      setIsTyping(prev => {
        const newTyping = { ...prev };
        delete newTyping[key];
        return newTyping;
      });
    }

    // Cerrar modal
    setShowSinDisponibilidadModal(false);
    setPendingSinDisponibilidad(null);

    const tipoEntregaTexto = pendingSinDisponibilidad.tipoEntrega === 'adicional' ? 'entrega adicional' : 'entrega base';
    toast.info(
      `🔄 Registro de ${tipoEntregaTexto} cancelado • ${pendingSinDisponibilidad.establecimientoNombre} • Valor revertido`
    );
  };

  const handleCloseSinDisponibilidadModal = () => {
    if (!isAutoSaving) {
      handleCancelSinDisponibilidad();
    }
  };

  // Función profesional para manejar cuando el usuario sale del campo (onBlur)
  const handleFieldBlur = async (establecimientoId: string, campo: string) => {
    const key = getFieldKey(establecimientoId, campo);
    const tempValue = tempValues[key];

    // Limpiar timeouts de validación de vales si existen
    if (voucherValidationTimeouts.current[key]) {
      clearTimeout(voucherValidationTimeouts.current[key]);
      delete voucherValidationTimeouts.current[key];
    }

    // Marcar que ya no está escribiendo
    setIsTyping(prev => ({
      ...prev,
      [key]: false
    }));

    if (tempValue !== undefined && pendingChanges[key]) {
      // Para campos de entrega, verificar si necesita confirmación
      if ((campo === 'entrega' || campo === 'entregaBase') && selectedVacuna) {
        const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
        const esCreacion = !movimientoExistente?.tieneMovimiento;
        const valorOriginal = movimientoExistente?.[campo as keyof typeof movimientoExistente] as number || 0;

        // Solo verificar para modificaciones donde el valor realmente cambió
        if (!esCreacion && valorOriginal !== tempValue) {
          const necesitaConfirmacion = await checkForVoucherConfirmation(establecimientoId, campo, tempValue);
          if (!necesitaConfirmacion) {
            handleSaveFieldValue(establecimientoId, campo, tempValue);
          }
        } else {
          // Para creaciones o valores sin cambio, guardar directamente
          handleSaveFieldValue(establecimientoId, campo, tempValue);
        }
      } else {
        // Para otros campos, guardar directamente
        handleSaveFieldValue(establecimientoId, campo, tempValue);
      }
    }
  };

  // Función para guardar todos los cambios pendientes
  const handleSaveAllPendingChanges = async () => {
    const pendingKeys = Object.keys(pendingChanges).filter(key => pendingChanges[key]);
    const pendingEntregasKeys = Object.keys(pendingEntregasChanges).filter(key => pendingEntregasChanges[key]);

    if (pendingKeys.length === 0 && pendingEntregasKeys.length === 0) {
      toast.info('💡 No hay cambios pendientes para guardar');
      return;
    }

    try {
      setIsAutoSaving(true);
      setIsProcessingEntrega(true);
      let exitosos = 0;
      let errores = 0;

      // Procesar cambios de campos principales
      for (const key of pendingKeys) {
        try {
          const [establecimientoId, campo] = key.split('-');
          const value = tempValues[key];

          if (value !== undefined) {
            await handleSaveFieldValue(establecimientoId, campo, value);
            exitosos++;
          }
        } catch (error) {
          console.error(`Error al guardar ${key}:`, error);
          errores++;
        }
      }

      // Procesar cambios de entregas adicionales
      for (const key of pendingEntregasKeys) {
        try {
          const entregaId = key.replace('entrega-', '');
          const value = tempEntregasValues[key];

          if (value !== undefined) {
            await handleSaveEntregaAdicionalValue(entregaId, value);
            exitosos++;
          }
        } catch (error) {
          console.error(`Error al guardar entrega ${key}:`, error);
          errores++;
        }
      }

      // Mostrar resultado final profesional
      if (errores === 0) {
        toast.success(`✅ Todos los cambios guardados exitosamente • ${exitosos} campo(s) actualizado(s)`);
      } else if (exitosos > 0) {
        toast.warning(`⚠️ Guardado parcial • ${exitosos} exitosos, ${errores} errores • Revise los campos con error`);
      } else {
        toast.error(`❌ Error al guardar cambios • ${errores} campo(s) fallaron • Intente nuevamente`);
      }
    } catch (error) {
      console.error('Error general al guardar cambios pendientes:', error);
      toast.error('❌ Error inesperado al guardar cambios • Intente nuevamente');
    } finally {
      setIsAutoSaving(false);
      setIsProcessingEntrega(false);
    }
  };

  // Función para crear o actualizar movimiento con redistribución automática
  const handleActualizarCampoMovimiento = async (
    establecimientoId: string,
    campo: keyof UpdateMovimientoDto,
    valor: number
  ) => {
    try {
      // Validaciones básicas
      if (valor < 0) {
        toast.error('❌ Valor inválido • Los valores no pueden ser negativos');
        throw new Error('Valor negativo no permitido');
      }

      if (!selectedVacuna) {
        toast.error('❌ Error de configuración • Debe seleccionar una vacuna primero');
        throw new Error('Vacuna no seleccionada');
      }

      // Buscar movimiento existente y establecimiento
      const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
      const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
      const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

      if (movimientoExistente && movimientoExistente.tieneMovimiento) {
        // Validar que no se modifique entrega directamente si hay entregas adicionales
        // Pero permitir modificar entregaBase
        if (campo === 'entrega' && movimientoExistente.entregasAdicionales && movimientoExistente.entregasAdicionales.length > 0) {
          toast.error(`🔒 Campo bloqueado • ${nombreEstablecimiento} • Use el campo de entrega base para modificar la entrega cuando hay entregas adicionales`);
          throw new Error('Campo bloqueado por entregas adicionales');
        }

        // Mostrar feedback visual para redistribución automática
        if (campo === 'entrega' && valor !== movimientoExistente.entrega) {
          const diferencia = valor - movimientoExistente.entrega;
          const tipoOperacion = diferencia > 0 ? 'incremento' : 'disminución';
          const cantidadOperacion = Math.abs(diferencia);

          toast.info(
            'Redistribuyendo automáticamente',
            `${nombreEstablecimiento} • ${tipoOperacion} de ${cantidadOperacion} unidades`,
            { duration: 3000 }
          );
        }

        // Actualizar movimiento existente (con redistribución automática en backend)
        const updateData = { [campo]: valor, usuarioId: user?.id || 'system-auto' };
        await updateMovimiento(movimientoExistente.id, updateData);

        // Mostrar mensaje de éxito para redistribución
        if (campo === 'entrega' && valor !== movimientoExistente.entrega) {
          toast.success(
            'Redistribución completada',
            `${nombreEstablecimiento} • Entregas redistribuidas automáticamente`,
            { duration: 4000 }
          );
        }

        // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales si cambió la entrega o entrega base
        if (campo === 'entrega' || campo === 'entregaBase') {
          onEntregaBaseChanged(establecimientoId, selectedVacuna, selectedMes, selectedAnio);
        }
      } else {
        // Validar que solo se permita crear movimientos con valores válidos
        if (valor === 0 && campo !== 'saldoAnterior') {
          // No crear movimiento si el valor es 0 (excepto para saldo anterior)
          return;
        }

        // Crear nuevo movimiento
        const createData: CreateMovimientoDto = {
          establecimientoId,
          vacunaId: selectedVacuna,
          mes: selectedMes,
          anio: selectedAnio,
          saldoAnterior: campo === 'saldoAnterior' ? valor : 0,
          transIngreso: campo === 'transIngreso' ? valor : 0,
          salida: campo === 'salida' ? valor : 0,
          transSalida: campo === 'transSalida' ? valor : 0,
          entrega: campo === 'entrega' ? valor : 0,
          usuarioId: user?.id || 'system-auto'
        };

        await createMovimiento(createData);

        // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales si se creó con entrega
        if (campo === 'entrega' && valor > 0) {
          onEntregaBaseChanged(establecimientoId, selectedVacuna, selectedMes, selectedAnio);
        }
      }
    } catch (error: any) {
      console.error('Error al manejar movimiento:', error);

      // Manejo específico de errores de redistribución
      if (error.message?.includes('No hay cantidades suficientes')) {
        toast.error(
          'Redistribución fallida',
          `${nombreEstablecimiento} • ${error.message}`,
          { duration: 6000 }
        );
      } else if (error.message?.includes('Campo bloqueado') ||
                 error.message?.includes('Valor negativo') ||
                 error.message?.includes('Vacuna no seleccionada')) {
        // Errores ya manejados con toast específico
      } else {
        // Manejo genérico de errores
        if (error?.response?.status === 400) {
          const errorMsg = error.response.data.message || error.response.data.error || 'Verifique los valores ingresados';
          toast.error(
            'Datos inválidos',
            `${nombreEstablecimiento} • ${errorMsg}`,
            { duration: 5000 }
          );
        } else if (error?.response?.status === 404) {
          toast.error(
            'No encontrado',
            `${nombreEstablecimiento} • Establecimiento o vacuna no válidos`
          );
        } else if (error?.response?.status === 409) {
          toast.error(
            'Conflicto',
            `${nombreEstablecimiento} • Ya existe un movimiento para este período`
          );
        } else {
          toast.error(
            'Error de conexión',
            `${nombreEstablecimiento} • Intente nuevamente`
          );
        }
      }

      // Re-lanzar el error para que sea manejado por handleSaveFieldValue
      throw error;
    }
  };

  // Funciones profesionales para entregas adicionales
  const handleTempEntregaValueChange = async (entregaId: string, newValue: number) => {
    const key = getEntregaFieldKey(entregaId);

    // Buscar el movimiento asociado para validar planificación
    const movimientoAsociado = movimientos.find(m =>
      m.entregasAdicionales?.some(e => e.id === entregaId)
    );

    if (movimientoAsociado && newValue > 0) {
      try {
        // VALIDACIÓN DE PLANIFICACIÓN: Verificar que exista planificación antes de permitir el cambio
        const verificacion = await PlanificacionService.verificarExistenciaPlanificacion(
          movimientoAsociado.establecimientoId,
          movimientoAsociado.vacunaId,
          movimientoAsociado.anio
        );

        if (!verificacion.existe) {
          toast.error(
            'No se puede asignar cantidad',
            `Este establecimiento no tiene planificación programada para ${movimientoAsociado.anio}. Debe crear una planificación primero desde el módulo de Planificación.`,
            { duration: 6000 }
          );

          // Revertir el valor temporal inmediatamente
          setTempEntregasValues(prev => {
            const newTemp = { ...prev };
            delete newTemp[key];
            return newTemp;
          });

          setPendingEntregasChanges(prev => {
            const newPending = { ...prev };
            delete newPending[key];
            return newPending;
          });

          return;
        }
      } catch (error) {
        console.error('Error al verificar planificación:', error);
        toast.error('Error de validación', 'No se pudo verificar la planificación. Intente nuevamente.');
        return;
      }
    }

    // Actualizar valor temporal
    setTempEntregasValues(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Marcar como cambio pendiente
    setPendingEntregasChanges(prev => ({
      ...prev,
      [key]: true
    }));

    // Limpiar timeout anterior si existe
    if (entregasDebounceTimeouts.current[key]) {
      clearTimeout(entregasDebounceTimeouts.current[key]);
    }

    // Configurar nuevo timeout para auto-guardar después de 2 segundos de inactividad
    // (Las entregas adicionales no necesitan verificación de vales ya que son modificaciones menores)
    entregasDebounceTimeouts.current[key] = setTimeout(() => {
      handleSaveEntregaAdicionalValue(entregaId, newValue);
    }, 2000);
  };

  // Función para verificar disponibilidad antes de guardar entregas adicionales
  const verificarDisponibilidadAntesDeGuardarEntrega = async (
    entregaId: string,
    value: number,
    movimientoAsociado: any
  ): Promise<boolean> => {
    // Solo verificar si hay valor positivo
    if (!selectedVacuna || value <= 0 || !movimientoAsociado) {
      return true; // Permitir guardar sin verificación
    }

    try {
      // Verificar disponibilidad en la planificación
      const disponibilidad = await PlanificacionService.verificarDisponibilidadEntregas(
        movimientoAsociado.establecimientoId,
        selectedVacuna,
        selectedMes,
        selectedAnio
      );

      // Si NO tiene disponibilidad, mostrar el modal de confirmación
      if (!disponibilidad.tieneDisponibilidad) {
        const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado.establecimientoId);
        const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

        setPendingSinDisponibilidad({
          establecimientoId: movimientoAsociado.establecimientoId,
          campo: 'entregaAdicional',
          valor: value,
          establecimientoNombre: nombreEstablecimiento,
          tipoEntrega: 'adicional',
          entregaAdicionalId: entregaId
        });
        setShowSinDisponibilidadModal(true);

        return false; // Bloquear el guardado normal
      }

      return true; // Tiene disponibilidad, permitir guardar normalmente
    } catch (error) {
      console.error('Error al verificar disponibilidad para entrega adicional:', error);
      // En caso de error, permitir guardar (para no bloquear el flujo)
      return true;
    }
  };

  const handleSaveEntregaAdicionalValue = async (entregaId: string, value: number) => {
    const key = getEntregaFieldKey(entregaId);

    try {
      setIsProcessingEntrega(true);

      // Limpiar timeout si existe
      if (entregasDebounceTimeouts.current[key]) {
        clearTimeout(entregasDebounceTimeouts.current[key]);
        delete entregasDebounceTimeouts.current[key];
      }

      // Buscar el movimiento asociado y entrega adicional actual
      const movimientoAsociado = movimientos.find(m =>
        m.entregasAdicionales?.some(e => e.id === entregaId)
      );
      const entregaAdicionalActual = movimientoAsociado?.entregasAdicionales?.find(e => e.id === entregaId);

      // NUEVA FUNCIONALIDAD: Verificar disponibilidad antes de guardar entregas adicionales
      const puedeGuardar = await verificarDisponibilidadAntesDeGuardarEntrega(entregaId, value, movimientoAsociado);
      if (!puedeGuardar) {
        // No guardar, el modal se mostrará
        setIsProcessingEntrega(false);
        return;
      }

      if (movimientoAsociado && entregaAdicionalActual) {
        const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado.establecimientoId);
        const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

        // Mostrar feedback visual para redistribución automática
        if (value !== entregaAdicionalActual.cantidad) {
          const diferencia = value - entregaAdicionalActual.cantidad;
          const tipoOperacion = diferencia > 0 ? 'incremento' : 'disminución';
          const cantidadOperacion = Math.abs(diferencia);

          toast.info(
            'Redistribuyendo automáticamente',
            `${nombreEstablecimiento} • Entrega adicional • ${tipoOperacion} de ${cantidadOperacion} unidades`,
            { duration: 3000 }
          );
        }
      }

      // Intentar actualizar en el backend (con redistribución automática)
      // NOTA: Llamar directamente al servicio para poder capturar el error inmediatamente
      try {
        console.log('🔍 [DEBUG] Llamando a MovimientosService.updateEntregaAdicional directamente...');
        
        await MovimientosService.updateEntregaAdicional(entregaId, { cantidad: value });
        
        console.log('✅ [SUCCESS] updateEntregaAdicional exitoso');
        
        // Recargar movimientos para reflejar cambios
        await loadMovimientos();
        
        // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales cuando cambia entrega adicional
        if (movimientoAsociado) {
          onEntregaAdicionalChanged(
            movimientoAsociado.establecimientoId,
            movimientoAsociado.vacunaId,
            movimientoAsociado.mes,
            movimientoAsociado.anio
          );

          // Mostrar mensaje de éxito para redistribución
          const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado.establecimientoId);
          const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

          toast.success(
            'Redistribución completada',
            `${nombreEstablecimiento} • Entrega adicional actualizada • Entregas redistribuidas automáticamente`,
            { duration: 4000 }
          );
        }
      } catch (redistributionError: any) {
        console.log('🚨 [DETECTED] Error capturado!', redistributionError);
        
        // Extraer mensaje de error (puede ser string, Error, o AxiosError)
        let errorMessage = '';
        
        if (typeof redistributionError === 'string') {
          errorMessage = redistributionError;
        } else if (redistributionError?.response?.data?.message) {
          errorMessage = redistributionError.response.data.message;
        } else if (redistributionError?.response?.data?.error) {
          errorMessage = redistributionError.response.data.error;
        } else if (redistributionError?.message) {
          errorMessage = redistributionError.message;
        }
        
        console.log('🔍 [DEBUG] Error message extraído:', errorMessage);
        
        // Detectar error de redistribución por el mensaje
        if (errorMessage.includes('No hay cantidades suficientes') || 
            errorMessage.includes('Faltan') || 
            errorMessage.includes('redistribuir')) {
          
          console.log('🚨 [SUCCESS] Error de redistribución confirmado! Mostrando modal');
          
          // Mostrar el modal de sin disponibilidad
          const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado!.establecimientoId);
          const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';
          
          console.log('🚨 [SUCCESS] Configurando modal con:', {
            establecimientoId: movimientoAsociado!.establecimientoId,
            nombreEstablecimiento,
            valor: value,
            tipoEntrega: 'adicional'
          });

          setPendingSinDisponibilidad({
            establecimientoId: movimientoAsociado!.establecimientoId,
            campo: 'entregaAdicional',
            valor: value,
            establecimientoNombre: nombreEstablecimiento,
            tipoEntrega: 'adicional',
            entregaAdicionalId: entregaId
          });
          setShowSinDisponibilidadModal(true);
          
          console.log('🚨 [SUCCESS] Modal configurado para mostrarse');
          
          // No marcar como procesando para que el modal pueda mostrarse
          setIsProcessingEntrega(false);
          return; // Salir sin mostrar error
        }
        
        // Si no es error de redistribución, re-lanzar para manejo normal
        console.log('⚠️ [DEBUG] Error NO es de redistribución, re-lanzando');
        throw redistributionError;
      }

      // Limpiar estado temporal
      setTempEntregasValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[key];
        return newTemp;
      });

      setPendingEntregasChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });

      // 🚀 NUEVA FUNCIONALIDAD: Actualizar Stock Disponible en tiempo real cuando cambia entrega adicional
      await updateStockInRealTime();

    } catch (error: any) {
      console.error('Error al guardar entrega adicional:', error);

      // Mostrar mensaje específico del backend si está disponible
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'Error desconocido';
      console.error('Mensaje específico del backend:', errorMessage);

      toast.error(`❌ Error al guardar entrega adicional • Cantidad: ${value.toLocaleString()} • ${errorMessage}`);
    } finally {
      setIsProcessingEntrega(false);
    }
  };

  const handleEntregaFieldBlur = (entregaId: string) => {
    const key = getEntregaFieldKey(entregaId);
    const tempValue = tempEntregasValues[key];

    if (tempValue !== undefined && pendingEntregasChanges[key]) {
      handleSaveEntregaAdicionalValue(entregaId, tempValue);
    }
  };

  // Calcular número de cambios pendientes (incluyendo entregas adicionales)
  const pendingChangesCount = Object.values(pendingChanges).filter(Boolean).length +
                              Object.values(pendingEntregasChanges).filter(Boolean).length;

  // Calcular totales generales
  const totalesGenerales = useMemo(() => {
    return datosTabla.reduce((totales, movimiento) => {
      // CORRECCIÓN FINAL: El backend ya actualiza el campo 'entrega' con el total (base + adicionales)
      // cuando hay entregas adicionales, por lo que NO debemos sumar las adicionales nuevamente
      const entregaTotal = movimiento.entrega; // Este campo ya contiene el total correcto del backend

      return {
        saldoAnterior: totales.saldoAnterior + movimiento.saldoAnterior,
        transIngreso: totales.transIngreso + movimiento.transIngreso,
        totalSaldo: totales.totalSaldo + movimiento.totalSaldo,
        salida: totales.salida + movimiento.salida,
        transSalida: totales.transSalida + movimiento.transSalida,
        saldo: totales.saldo + movimiento.saldo,
        entrega: totales.entrega + entregaTotal, // CORRECCIÓN: Usar directamente el campo entrega del backend
        stock: totales.stock + movimiento.stock,
      };
    }, {
      saldoAnterior: 0,
      transIngreso: 0,
      totalSaldo: 0,
      salida: 0,
      transSalida: 0,
      saldo: 0,
      entrega: 0,
      stock: 0,
    });
  }, [datosTabla]);

  // Funciones profesionales para manejar entregas adicionales con validaciones
  const handleAgregarEntregaAdicional = async (establecimientoId: string) => {
    try {
      setIsProcessingEntrega(true);

      // Buscar el movimiento existente para este establecimiento
      const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
      const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
      const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

      // Validar usando la función profesional
      const validationError = validateMovimientoForEntregaAdicional(movimientoExistente!);
      if (validationError) {
        toast.error(`❌ Acción no permitida • ${nombreEstablecimiento} • ${validationError}`);
        return;
      }

      // Calcular el siguiente número de entrega de manera segura
      const entregasExistentes = movimientoExistente!.entregasAdicionales || [];
      const numerosExistentes = entregasExistentes.map(e => e.numeroEntrega).filter(n => typeof n === 'number');
      const siguienteNumero = numerosExistentes.length > 0 ? Math.max(...numerosExistentes) + 1 : 1;

      // Validar que el número no exceda límites razonables
      if (siguienteNumero > 10) {
        toast.error(`❌ Límite excedido • ${nombreEstablecimiento} • Número de entrega muy alto: ${siguienteNumero}`);
        return;
      }

      // Crear la entrega adicional con datos completos
      await createEntregaAdicional({
        movimientoVacunaId: movimientoExistente!.id,
        numeroEntrega: siguienteNumero,
        cantidad: 0, // Inicia en 0 para edición posterior
        fechaEntrega: new Date(),
        motivo: `Entrega adicional #${siguienteNumero}`,
        usuarioId: 'temp-user-id' // El backend lo convertirá a un usuario válido
      });

      // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales cuando se crea entrega adicional
      onEntregaAdicionalChanged(establecimientoId, selectedVacuna, selectedMes, selectedAnio);

      // Recargar datos para mostrar la nueva entrega
      const filters = {
        vacunaId: selectedVacuna!,
        mes: selectedMes,
        anio: selectedAnio,
        ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
      };
      await loadMovimientos(filters);

      toast.success(`✅ Entrega adicional creada • ${nombreEstablecimiento} • Entrega #${siguienteNumero} • Sincronizado con planificación`);

      // 🚀 NUEVA FUNCIONALIDAD: Actualizar Stock Disponible en tiempo real cuando se crea entrega adicional
      await updateStockInRealTime();
    } catch (error: any) {
      console.error('Error al agregar entrega adicional:', error);

      // Obtener nombre del establecimiento para el error
      const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
      const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

      if (error?.response?.status === 400) {
        const mensaje = error.response.data.message || 'Verifique la información';
        toast.error(`❌ Datos inválidos • ${nombreEstablecimiento} • ${mensaje}`);
      } else if (error?.response?.status === 404) {
        toast.error(`❌ No encontrado • ${nombreEstablecimiento} • Movimiento no válido`);
      } else if (error?.response?.status === 409) {
        toast.error(`❌ Conflicto • ${nombreEstablecimiento} • Ya existe una entrega con ese número`);
      } else {
        toast.error(`❌ Error de conexión • ${nombreEstablecimiento} • Intente agregar la entrega nuevamente`);
      }
    } finally {
      setIsProcessingEntrega(false);
    }
  };

  // Esta función ahora es manejada por handleSaveEntregaAdicionalValue
  // Mantenemos compatibilidad para llamadas directas
  const handleActualizarEntregaAdicional = async (entregaId: string, cantidad: number) => {
    await handleSaveEntregaAdicionalValue(entregaId, cantidad);
  };

  const handleEliminarEntregaAdicional = async (entregaId: string) => {
    try {
      // Confirmación antes de eliminar
      if (!window.confirm('🗑️ ¿Está seguro de que desea eliminar esta entrega adicional?\n\nEsta acción no se puede deshacer.')) {
        return;
      }

      // Buscar el movimiento asociado y entrega adicional antes de eliminar
      const movimientoAsociado = movimientos.find(m =>
        m.entregasAdicionales?.some(e => e.id === entregaId)
      );
      const entregaAdicionalActual = movimientoAsociado?.entregasAdicionales?.find(e => e.id === entregaId);

      if (movimientoAsociado && entregaAdicionalActual) {
        const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado.establecimientoId);
        const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

        // Mostrar feedback visual para redistribución automática al eliminar
        if (entregaAdicionalActual.cantidad > 0) {
          toast.info(
            'Redistribuyendo automáticamente',
            `${nombreEstablecimiento} • Eliminando entrega adicional • Trasladando ${entregaAdicionalActual.cantidad} unidades`,
            { duration: 3000 }
          );
        }
      }

      await deleteEntregaAdicional(entregaId);

      // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales cuando se elimina entrega adicional
      if (movimientoAsociado) {
        onEntregaAdicionalChanged(
          movimientoAsociado.establecimientoId,
          movimientoAsociado.vacunaId,
          movimientoAsociado.mes,
          movimientoAsociado.anio
        );

        const establecimiento = establecimientosFiltrados.find(e => e.id === movimientoAsociado.establecimientoId);
        const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

        toast.success(
          'Redistribución completada',
          `${nombreEstablecimiento} • Entrega adicional eliminada • Entregas redistribuidas automáticamente`,
          { duration: 4000 }
        );
      }

      // 🚀 NUEVA FUNCIONALIDAD: Actualizar Stock Disponible en tiempo real cuando se elimina entrega adicional
      await updateStockInRealTime();
    } catch (error: any) {
      console.error('Error al eliminar entrega adicional:', error);

      if (error?.response?.status === 404) {
        toast.error('❌ No encontrada • Entrega adicional no válida');
      } else if (error?.response?.status === 409) {
        toast.error('❌ Acción bloqueada • La entrega adicional está siendo utilizada');
      } else {
        toast.error('❌ Error de conexión • Intente eliminar nuevamente');
      }
    }
  };

  // Función para manejar la exportación
  const handleExportar = async () => {
    try {
      setIsExporting(true);

      // Validar que se haya seleccionado una vacuna
      if (!selectedVacuna) {
        toast.error('❌ Seleccione una vacuna para exportar');
        return;
      }

      // Obtener información de la vacuna seleccionada
      const vacunaSeleccionada = vacunasActivas.find(v => v.id === selectedVacuna);
      if (!vacunaSeleccionada) {
        toast.error('❌ Vacuna no encontrada');
        return;
      }

      // Crear configuración de exportación
      const config: MovimientosExportConfig = MovimientosExportService.crearConfiguracionDesdeFiltros(
        selectedMes,
        selectedAnio,
        selectedVacuna,
        selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined,
        undefined, // establecimientoId - no se filtra por establecimiento específico
        user?.nombres && user?.apellidos ? `${user.nombres} ${user.apellidos}` : 'Usuario del Sistema',
        `Exportación de movimientos - ${vacunaSeleccionada.nombre} - ${meses[selectedMes - 1]} ${selectedAnio}`
      );

      console.log('🔄 Iniciando exportación con configuración:', config);

      // Mostrar toast de inicio
      toast.info('📊 Generando archivo Excel...', 'Esto puede tomar unos momentos');

      // Exportar y descargar
      await MovimientosExportService.exportarYDescargarPorVacuna(
        selectedVacuna,
        config,
        vacunaSeleccionada.nombre
      );

      // Mostrar toast de éxito
      toast.success(
        '✅ Exportación completada',
        `Movimientos de ${vacunaSeleccionada.nombre} exportados exitosamente`,
        { duration: 4000 }
      );

    } catch (error: any) {
      console.error('❌ Error en exportación:', error);

      if (error.message.includes('validación')) {
        toast.error('❌ Error de validación', error.message);
      } else if (error.message.includes('conexión')) {
        toast.error('❌ Error de conexión', 'Verifique su conexión a internet');
      } else {
        toast.error('❌ Error en exportación', 'No se pudo generar el archivo Excel');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Movimientos de Vacunas</h1>
                <p className="text-gray-600">Gestión de entregas y movimientos de vacunas por establecimiento</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {pendingChangesCount > 0 && (
                <button
                  onClick={handleSaveAllPendingChanges}
                  disabled={isAutoSaving}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  title={`Guardar ${pendingChangesCount} cambio(s) pendiente(s)`}
                >
                  <Save className={`h-4 w-4 mr-2 ${isAutoSaving ? 'animate-spin' : ''}`} />
                  Guardar Cambios ({pendingChangesCount})
                </button>
              )}
              <button
                onClick={() => setShowValesModal(true)}
                disabled={!selectedVacuna || selectedCentroAcopio === 'todos'}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                title={selectedCentroAcopio === 'todos' ? 'Seleccione un centro de acopio específico' : 'Ver vales de entrega para este centro de acopio'}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Vales por Acopio
              </button>
              <button
                onClick={() => {
                  if (selectedVacuna) {
                    const filters = {
                      vacunaId: selectedVacuna,
                      mes: selectedMes,
                      anio: selectedAnio,
                      ...(selectedCentroAcopio !== 'todos' && { centroAcopioId: selectedCentroAcopio })
                    };
                    loadMovimientos(filters);
                    const vacunaNombre = vacunaSeleccionada?.nombre || 'vacuna seleccionada';
                    const mesNombre = meses[selectedMes - 1];
                    toast.success(`🔄 Datos actualizados • ${vacunaNombre} • ${mesNombre} ${selectedAnio}`);
                  } else {
                    toast.warning('⚠️ Seleccione una vacuna para actualizar los datos');
                  }
                }}
                disabled={isLoading || !selectedVacuna}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                onClick={() => setShowImportarModal(true)}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                title="Importar movimientos desde Excel"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Movimientos
              </button>
              <button
                onClick={handleExportar}
                disabled={isExporting || !selectedVacuna}
                className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform ${
                  isExporting || !selectedVacuna
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5'
                }`}
                title={
                  !selectedVacuna
                    ? 'Seleccione una vacuna para exportar'
                    : isExporting
                      ? 'Generando archivo Excel...'
                      : 'Exportar movimientos a Excel'
                }
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exportando...' : 'Exportar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area Premium */}
      <div className="max-w-full px-6 py-6 space-y-6">

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {(isCreating || isUpdating || isAutoSaving) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
            <span className="text-blue-800">
              {isCreating ? 'Creando movimiento...' :
               isUpdating ? 'Actualizando movimiento...' :
               'Guardando cambios automáticamente...'}
            </span>
          </div>
        </div>
      )}

      {pendingChangesCount > 0 && !isAutoSaving && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Tienes {pendingChangesCount} cambio(s) pendiente(s) que se guardarán automáticamente
              </span>
            </div>
            <button
              onClick={handleSaveAllPendingChanges}
              className="text-yellow-700 hover:text-yellow-900 font-medium text-sm underline"
            >
              Guardar ahora
            </button>
          </div>
        </div>
      )}

        {/* Panel de Filtros Premium */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Filtros de Análisis</h3>
                  <p className="text-sm text-gray-600">Configura los parámetros de consulta</p>
                </div>
              </div>
              {(isLoadingEstablecimientos || isLoadingActivas) && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm font-medium">Cargando...</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Centro de Acopio */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-800">
                  <Building2 className="h-4 w-4 mr-2 text-emerald-600" />
                  Centro de Acopio
                </label>
                <select
                  value={selectedCentroAcopio}
                  onChange={(e) => setSelectedCentroAcopio(e.target.value)}
                  disabled={isLoadingEstablecimientos}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm font-medium transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed hover:border-emerald-300"
                >
                  <option value="todos">🌐 Todos los Centros</option>
                  {centrosAcopio.map((centro) => {
                    const colores = coloresAcopio[centro.nombre as keyof typeof coloresAcopio] || coloresAcopio['DEFAULT'];
                    return (
                      <option key={centro.id} value={centro.id}>
                        {colores.icon} {centro.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Vacuna */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-800">
                  <Package className="h-4 w-4 mr-2 text-purple-600" />
                  Vacuna
                </label>
                <select
                  value={selectedVacuna}
                  onChange={(e) => setSelectedVacuna(e.target.value)}
                  disabled={isLoadingActivas}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm font-medium transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed hover:border-purple-300"
                >
                  {vacunasActivas.length === 0 && (
                    <option value="">Seleccione una vacuna</option>
                  )}
                  {vacunasActivas.map((vacuna) => (
                    <option key={vacuna.id} value={vacuna.id}>
                      💉 {vacuna.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mes */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-800">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Período
                </label>
                <select
                  value={selectedMes}
                  onChange={(e) => setSelectedMes(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium transition-all duration-200 hover:border-blue-300"
                >
                  {meses.map((mes, index) => (
                    <option key={index + 1} value={index + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>

              {/* Año */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-800">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-600" />
                  Año
                </label>
                <select
                  value={selectedAnio}
                  onChange={(e) => setSelectedAnio(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm font-medium transition-all duration-200 hover:border-indigo-300"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>

            {/* Estado de Selección Premium */}
            {selectedVacuna && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-800">
                      {datosTabla.length} establecimientos • {meses[selectedMes - 1]} {selectedAnio}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {selectedCentroAcopio === 'todos' ? 'Todos los centros' : centrosAcopio.find(c => c.id === selectedCentroAcopio)?.nombre}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stock Disponible Premium */}
        {selectedVacuna && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-2.5 rounded-xl shadow-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Stock Disponible</h3>
                    <p className="text-sm text-gray-600">Resumen de disponibilidad actual</p>
                  </div>
                </div>
                {(isLoadingStock || isUpdatingStock) && (
                  <div className="flex items-center text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm font-medium">Actualizando...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-6">

              {stockInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Stock Inicial Histórico Premium */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-indigo-800">
                          {stockInfo.tieneHistorialInicial ? stockInfo.stockInicialHistorico?.toLocaleString() : 'N/A'}
                        </div>
                        <div className="text-sm text-indigo-600 font-semibold mt-1">
                          Stock Inicial {stockInfo.tieneHistorialInicial ? '(Histórico)' : '(Sin historial)'}
                        </div>
                        {stockInfo.tieneHistorialInicial && stockInfo.fechaCapturaStockInicial && (
                          <div className="text-xs text-indigo-500 mt-1">
                            Capturado: {new Date(stockInfo.fechaCapturaStockInicial).toLocaleDateString()}
                          </div>
                        )}
                        {/* Mostrar información de ingresos de lotes si existen */}
                        {stockInfo.tieneHistorialInicial && stockInfo.ingresosLotesDelMes > 0 && (
                          <div className="mt-2 pt-2 border-t border-indigo-300">
                            <div className="text-xs text-indigo-600 font-medium">
                              Base: {stockInfo.stockInicialOriginal?.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              + Ingresos: {stockInfo.ingresosLotesDelMes.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Total Entregas Premium */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-orange-800">
                          {stockInfo.totalEntregas.toLocaleString()}
                        </div>
                        <div className="text-sm text-orange-600 font-semibold mt-1">Entregas</div>
                      </div>
                      <div className="bg-orange-600 p-3 rounded-xl shadow-lg">
                        <TruckIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Stock Disponible Premium */}
                  <div className={`rounded-xl p-6 border-2 shadow-sm hover:shadow-md transition-all duration-200 ${
                    stockInfo.stockDisponible < 0 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
                    stockInfo.estado === 'bueno' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
                    stockInfo.estado === 'medio' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
                    'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${
                          stockInfo.stockDisponible < 0 ? 'text-red-800' :
                          stockInfo.estado === 'bueno' ? 'text-green-800' :
                          stockInfo.estado === 'medio' ? 'text-yellow-800' :
                          'text-red-800'
                        }`}>
                          {stockInfo.stockDisponible.toLocaleString()}
                        </div>
                        <div className={`text-sm font-semibold mt-1 ${
                          stockInfo.stockDisponible < 0 ? 'text-red-600' :
                          stockInfo.estado === 'bueno' ? 'text-green-600' :
                          stockInfo.estado === 'medio' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {stockInfo.stockDisponible < 0 ? 'Déficit' : 'Disponible'}
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl shadow-lg ${
                        stockInfo.stockDisponible < 0 ? 'bg-red-600' :
                        stockInfo.estado === 'bueno' ? 'bg-green-600' :
                        stockInfo.estado === 'medio' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {stockInfo.stockDisponible < 0 ? (
                          <AlertTriangle className="h-6 w-6 text-white" />
                        ) : stockInfo.estado === 'bueno' ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : stockInfo.estado === 'medio' ? (
                          <AlertCircle className="h-6 w-6 text-white" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Actual Premium con Lotes */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between gap-6">
                      {/* Sección Izquierda: Información Principal */}
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div>
                          <div className="text-2xl font-bold text-blue-800">
                            {stockInfo.stockActual.toLocaleString()}
                          </div>
                          <div className="text-sm text-blue-600 font-semibold mt-1">Stock Actual</div>
                          <div className="text-xs text-blue-500 mt-1">
                            {stockInfo.lotes.filter(l => l.cantidadActual > 0).length} lote{stockInfo.lotes.filter(l => l.cantidadActual > 0).length !== 1 ? 's' : ''} disponible{stockInfo.lotes.filter(l => l.cantidadActual > 0).length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Sección Derecha: Lista de Lotes Minimalista */}
                      {stockInfo.lotes.filter(l => l.cantidadActual > 0).length > 0 && (
                        <div className="flex-1 min-w-0 pl-6 border-l border-blue-300/50">
                          <div className="text-[10px] font-bold text-blue-600/70 mb-2.5 uppercase tracking-wider">
                            Lotes (FEFO)
                          </div>
                          <div className="space-y-2 max-h-20 overflow-y-auto pr-2 custom-scrollbar">
                            {stockInfo.lotes
                              .filter(lote => lote.cantidadActual > 0)
                              .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
                              .map((lote, index) => {
                                const fechaVenc = new Date(lote.fechaVencimiento);
                                const hoy = new Date();
                                const diasParaVencer = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                                const esPrimerLote = index === 0;

                                return (
                                  <div
                                    key={lote.id}
                                    className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                                      esPrimerLote
                                        ? 'bg-blue-600 shadow-sm'
                                        : 'bg-white/80 hover:bg-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <span
                                        className={`text-xs font-bold truncate cursor-help lote-tooltip ${
                                          esPrimerLote ? 'text-white' : 'text-blue-900'
                                        }`}
                                        title={lote.numero}
                                        data-tooltip={lote.numero}
                                      >
                                        {lote.numero}
                                      </span>
                                      {esPrimerLote && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white whitespace-nowrap">
                                          1°
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 whitespace-nowrap">
                                      <span className={`text-xs font-bold tabular-nums ${
                                        esPrimerLote ? 'text-white' : 'text-blue-700'
                                      }`}>
                                        {lote.cantidadActual.toLocaleString()}
                                      </span>
                                      <span className={`text-[11px] font-semibold tabular-nums ${
                                        esPrimerLote ? 'text-blue-100' :
                                        diasParaVencer <= 30 ? 'text-red-600' :
                                        diasParaVencer <= 90 ? 'text-yellow-600' :
                                        'text-gray-500'
                                      }`}>
                                        {fechaVenc.toLocaleDateString('es-PE', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric'
                                        }).replace('.', '')}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 🚀 NUEVO BOTÓN: Actualizar Stock Siguiente Mes */}
                  {stockInfo.tieneHistorialInicial && (
                    <div className="col-span-full mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleActualizarStockSiguienteMes}
                        disabled={isUpdatingStockSiguienteMes}
                        className={`w-full px-6 py-3.5 rounded-xl font-semibold text-white text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                          isUpdatingStockSiguienteMes
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
                        }`}
                      >
                        {isUpdatingStockSiguienteMes ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Actualizando Stock...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-5 w-5" />
                            <span>Actualizar Stock Siguiente Mes</span>
                          </>
                        )}
                      </button>
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-600">
                          Registra el disponible actual ({stockInfo.stockDisponible.toLocaleString()} unidades) como stock inicial del mes {meses[selectedMes === 12 ? 0 : selectedMes]} {selectedMes === 12 ? selectedAnio + 1 : selectedAnio}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : stockError ? (
                <div className="text-center py-8">
                  <div className="bg-red-100 p-4 rounded-xl inline-block mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                  </div>
                  <div className="text-red-700 text-sm font-semibold mb-3">Error al cargar stock</div>
                  <button
                    onClick={() => {
                      if (selectedVacuna) {
                        setStockError(null);
                        setIsLoadingStock(true);
                        getStockDisponible(selectedVacuna, selectedMes, selectedAnio)
                          .then(setStockInfo)
                          .catch((error: any) => {
                            const errorMessage = error?.response?.data?.message || error?.message || 'Error al cargar stock disponible';
                            setStockError(errorMessage);
                          })
                          .finally(() => setIsLoadingStock(false));
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 p-4 rounded-xl inline-block mb-4">
                    <Package className="h-8 w-8 text-gray-400 mx-auto" />
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Cargando información de stock...</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabla de Movimientos Premium con Scroll Profesional */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-2.5 rounded-xl shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Movimientos de Vacunas - {meses[selectedMes - 1]} {selectedAnio}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {datosTabla.length} establecimientos • Total entregas: {totalesGenerales.entrega.toLocaleString()}
                  </p>
                </div>
              </div>
              {isLoading && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm font-medium">Cargando...</span>
                </div>
              )}
            </div>
          </div>

          {/* Contenedor de tabla con scroll profesional */}
          <div className="relative">
            {/* Cabecera fija */}
            <div className="sticky-header">
              <div className="overflow-x-auto">
                <table className="professional-table-layout" role="table" aria-label="Cabecera de Movimientos de Vacunas">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr role="row">
                      <th
                        className="col-establecimiento px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-sort="none"
                      >
                        Establecimiento
                      </th>
                      <th
                        className="col-saldo-anterior px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Saldo Anterior"
                      >
                        Saldo Anterior
                      </th>
                      <th
                        className="col-trans-ingreso px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Transferencia Ingreso"
                      >
                        Trans. Ingreso
                      </th>
                      <th
                        className="col-total-saldo px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Total Saldo"
                      >
                        Total Saldo
                      </th>
                      <th
                        className="col-salida px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Salida"
                      >
                        Salida
                      </th>
                      <th
                        className="col-trans-salida px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Transferencia Salida"
                      >
                        Trans. Salida
                      </th>
                      <th
                        className="col-saldo px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Saldo Final"
                      >
                        Saldo
                      </th>
                      <th
                        className="col-entrega px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Entrega"
                      >
                        Entrega
                      </th>
                      <th
                        className="col-stock px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Stock Disponible"
                      >
                        Stock
                      </th>
                      <th
                        className="col-promedio px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Promedio de Consumo"
                      >
                        Promedio Consumo
                      </th>
                      <th
                        className="col-disponibilidad px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300"
                        scope="col"
                        aria-label="Disponibilidad en Meses"
                      >
                        Disponibilidad
                      </th>
                      <th
                        className="col-acciones px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider"
                        scope="col"
                        aria-label="Acciones Disponibles"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>

            {/* Fila de totales fija */}
            <div className="sticky-totals">
              <div className="overflow-x-auto">
                <table className="professional-table-layout">
                  <tbody>
                    <tr
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-4 border-blue-500 border-b-2 border-blue-300"
                      role="row"
                      aria-label="Fila de totales generales"
                    >
                      <td className="col-establecimiento px-6 py-5 text-base font-bold text-gray-900 border-r border-blue-200">
                        <div>
                          <div className="text-base font-bold text-gray-900">TOTALES GENERALES</div>
                          <div className="text-sm text-gray-600 font-medium">
                            {datosTabla.length} establecimientos registrados
                          </div>
                        </div>
                      </td>
                      <td className="col-saldo-anterior px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-lg font-bold text-blue-700 tabular-nums">
                          {totalesGenerales.saldoAnterior.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">unidades</div>
                      </td>
                      <td className="col-trans-ingreso px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-lg font-bold text-green-700 tabular-nums">
                          {totalesGenerales.transIngreso.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">ingresos</div>
                      </td>
                      <td className="col-total-saldo px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-lg font-bold text-blue-700 tabular-nums bg-blue-100 px-3 py-1 rounded-lg">
                          {totalesGenerales.totalSaldo.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium mt-1">total</div>
                      </td>
                      <td className="col-salida px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-lg font-bold text-orange-700 tabular-nums">
                          {totalesGenerales.salida.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">salidas</div>
                      </td>
                      <td className="col-trans-salida px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-lg font-bold text-purple-700 tabular-nums">
                          {totalesGenerales.transSalida.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">transferencias</div>
                      </td>
                      <td className="col-saldo px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-lg font-bold text-green-700 tabular-nums bg-green-100 px-3 py-1 rounded-lg">
                          {totalesGenerales.saldo.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium mt-1">saldo final</div>
                      </td>
                      <td className="col-entrega px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-lg font-bold text-emerald-700 tabular-nums bg-emerald-100 px-3 py-1 rounded-lg">
                          {totalesGenerales.entrega.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium mt-1">entregas</div>
                      </td>
                      <td className="col-stock px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-lg font-bold text-indigo-700 tabular-nums">
                          {totalesGenerales.stock.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">stock total</div>
                      </td>
                      <td className="col-promedio px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-sm font-medium text-gray-500">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                            N/A
                          </span>
                        </div>
                      </td>
                      <td className="col-disponibilidad px-4 py-5 text-center border-r border-blue-200">
                        <div className="text-sm font-medium text-gray-500">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                            N/A
                          </span>
                        </div>
                      </td>
                      <td className="col-acciones px-4 py-5 text-center">
                        <div className="text-sm font-medium text-gray-500">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                            N/A
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="max-h-[calc(100vh-400px)] min-h-[400px] scroll-container scrollbar-thin">
              <table className="professional-table-layout divide-y divide-gray-200 bg-white" role="table" aria-label="Datos de Movimientos de Vacunas">
                <tbody className="bg-white divide-y divide-gray-200">
                  {datosTabla.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando movimientos...
                          </div>
                        ) : (
                          <div>
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p>No hay establecimientos para mostrar</p>
                            <p className="text-sm">Seleccione filtros válidos para ver los movimientos</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* Health establishments data rows */}
                      {datosTabla.map((movimiento) => {
                        // Obtener estilo profesional basado en centro de acopio
                        const estiloEstablecimiento = getEstiloEstablecimiento(movimiento.establecimiento);
                        const { colores, icono, centro } = estiloEstablecimiento;

                        return (
                          <tr
                            key={`${movimiento.establecimientoId}-${selectedVacuna}-${selectedMes}-${selectedAnio}`}
                            className={`${colores.bg} hover:bg-gray-50 hover:shadow-sm border-b border-gray-200 ${colores.border} transition-all duration-200 ease-in-out group`}
                            role="row"
                            aria-label={`Datos de ${movimiento.establecimiento.nombre}`}
                          >
                      <td className="col-establecimiento px-6 py-5 border-r border-gray-300" role="gridcell">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full flex-shrink-0 transition-all duration-200 ${
                            movimiento.tieneMovimiento
                              ? 'bg-green-500 shadow-sm ring-2 ring-green-200'
                              : 'bg-gray-300 ring-2 ring-gray-200'
                          }`} aria-label={movimiento.tieneMovimiento ? 'Con movimiento' : 'Sin movimiento'}></div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-base font-semibold ${colores.text} group-hover:text-gray-900 transition-colors duration-200`}>
                              <span className="truncate">{movimiento.establecimiento.nombre}</span>
                            </div>
                            <div className="text-sm text-gray-500 font-medium mt-1">
                              Código: {movimiento.establecimiento.codigo}
                            </div>
                            {selectedCentroAcopio === 'todos' && (
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colores.bg} ${colores.text} border ${colores.border} shadow-sm`}>
                                  {centro !== 'DEFAULT' ? centro : 'Regional'}
                                </span>
                              </div>
                            )}
                            {!movimiento.tieneMovimiento && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                                  Sin movimiento
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    <td className="col-saldo-anterior px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-blue-700 tabular-nums">
                        {movimiento.saldoAnterior.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">unidades</div>
                    </td>
                    <td className="col-trans-ingreso px-4 py-5 text-center border-r border-gray-300 relative" role="gridcell">
                      <div className="relative inline-block">
                        <input
                          type="number"
                          min="0"
                          value={getCurrentValue(movimiento.establecimientoId, 'transIngreso', movimiento.transIngreso)}
                          onChange={(e) => handleTempValueChange(movimiento.establecimientoId, 'transIngreso', parseInt(e.target.value) || 0)}
                          onBlur={() => handleFieldBlur(movimiento.establecimientoId, 'transIngreso')}
                          className={`w-20 px-3 py-2 text-center text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 tabular-nums ${
                            hasPendingChange(movimiento.establecimientoId, 'transIngreso')
                              ? 'border-yellow-400 bg-yellow-50 shadow-md ring-2 ring-yellow-200'
                              : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
                          }`}
                          title={hasPendingChange(movimiento.establecimientoId, 'transIngreso') ? 'Cambios pendientes - Se guardará automáticamente' : 'Campo editable - Trans. Ingreso'}
                          disabled={isCreating || isUpdating || isAutoSaving}
                          aria-label={`Transferencia ingreso para ${movimiento.establecimiento.nombre}`}
                        />
                        {hasPendingChange(movimiento.establecimientoId, 'transIngreso') && (
                          <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm border-2 border-white"
                               title="Cambios pendientes" aria-label="Cambios pendientes"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">ingresos</div>
                    </td>
                    <td className="col-total-saldo px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-blue-700 tabular-nums bg-blue-100 px-3 py-2 rounded-lg inline-block shadow-sm">
                        {movimiento.totalSaldo.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">total</div>
                    </td>
                    <td className="col-salida px-4 py-5 text-center border-r border-gray-300 relative" role="gridcell">
                      <div className="relative inline-block">
                        <input
                          type="number"
                          min="0"
                          value={getCurrentValue(movimiento.establecimientoId, 'salida', movimiento.salida)}
                          onChange={(e) => handleTempValueChange(movimiento.establecimientoId, 'salida', parseInt(e.target.value) || 0)}
                          onBlur={() => handleFieldBlur(movimiento.establecimientoId, 'salida')}
                          className={`w-20 px-3 py-2 text-center text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-orange-300 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 tabular-nums ${
                            hasPendingChange(movimiento.establecimientoId, 'salida')
                              ? 'border-yellow-400 bg-yellow-50 shadow-md ring-2 ring-yellow-200'
                              : 'border-orange-300 bg-orange-50 hover:bg-orange-100 hover:border-orange-400'
                          }`}
                          title={hasPendingChange(movimiento.establecimientoId, 'salida') ? 'Cambios pendientes - Se guardará automáticamente' : 'Campo editable - Salida'}
                          disabled={isCreating || isUpdating || isAutoSaving}
                          aria-label={`Salida para ${movimiento.establecimiento.nombre}`}
                        />
                        {hasPendingChange(movimiento.establecimientoId, 'salida') && (
                          <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm border-2 border-white"
                               title="Cambios pendientes" aria-label="Cambios pendientes"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">salidas</div>
                    </td>
                    <td className="col-trans-salida px-4 py-5 text-center border-r border-gray-300 relative" role="gridcell">
                      <div className="relative inline-block">
                        <input
                          type="number"
                          min="0"
                          value={getCurrentValue(movimiento.establecimientoId, 'transSalida', movimiento.transSalida)}
                          onChange={(e) => handleTempValueChange(movimiento.establecimientoId, 'transSalida', parseInt(e.target.value) || 0)}
                          onBlur={() => handleFieldBlur(movimiento.establecimientoId, 'transSalida')}
                          className={`w-20 px-3 py-2 text-center text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-purple-300 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 tabular-nums ${
                            hasPendingChange(movimiento.establecimientoId, 'transSalida')
                              ? 'border-yellow-400 bg-yellow-50 shadow-md ring-2 ring-yellow-200'
                              : 'border-purple-300 bg-purple-50 hover:bg-purple-100 hover:border-purple-400'
                          }`}
                          title={hasPendingChange(movimiento.establecimientoId, 'transSalida') ? 'Cambios pendientes - Se guardará automáticamente' : 'Campo editable - Trans. Salida'}
                          disabled={isCreating || isUpdating || isAutoSaving}
                          aria-label={`Transferencia salida para ${movimiento.establecimiento.nombre}`}
                        />
                        {hasPendingChange(movimiento.establecimientoId, 'transSalida') && (
                          <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm border-2 border-white"
                               title="Cambios pendientes" aria-label="Cambios pendientes"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">transferencias</div>
                    </td>
                    <td className="col-saldo px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-green-700 tabular-nums bg-green-100 px-3 py-2 rounded-lg inline-block shadow-sm">
                        {movimiento.saldo.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">saldo final</div>
                    </td>
                    <td className="col-entrega px-4 py-5 text-center border-r border-gray-300 relative" role="gridcell">
                      <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={(() => {
                              // LÓGICA MEJORADA: Siempre mostrar valor editable
                              const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
                              if (tieneEntregasAdicionales) {
                                // Con entregas adicionales, mostrar entrega base editable
                                return getCurrentValue(movimiento.establecimientoId, 'entregaBase', movimiento.entregaBase ?? movimiento.entrega);
                              } else {
                                // Sin entregas adicionales, mostrar valor normal (editable)
                                return getCurrentValue(movimiento.establecimientoId, 'entrega', movimiento.entrega);
                              }
                            })()}
                            onChange={(e) => {
                              const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
                              if (tieneEntregasAdicionales) {
                                // Editar entrega base cuando hay entregas adicionales
                                handleTempValueChange(movimiento.establecimientoId, 'entregaBase', parseInt(e.target.value) || 0);
                              } else {
                                // Editar entrega normal cuando no hay entregas adicionales
                                handleTempValueChange(movimiento.establecimientoId, 'entrega', parseInt(e.target.value) || 0);
                              }
                            }}
                            onBlur={() => {
                              const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
                              if (tieneEntregasAdicionales) {
                                // Guardar cambios en entrega base
                                handleFieldBlur(movimiento.establecimientoId, 'entregaBase');
                              } else {
                                // Guardar cambios en entrega normal
                                handleFieldBlur(movimiento.establecimientoId, 'entrega');
                              }
                            }}
                            className={`w-20 px-3 py-2 text-center text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-3 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 tabular-nums ${
                              (() => {
                                const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
                                const fieldKey = tieneEntregasAdicionales ? 'entregaBase' : 'entrega';
                                const hasPending = hasPendingChange(movimiento.establecimientoId, fieldKey);

                                if (hasPending) {
                                  return 'border-yellow-400 bg-yellow-50 focus:ring-green-300 focus:border-green-500 shadow-md ring-2 ring-yellow-200';
                                } else {
                                  return 'border-green-300 bg-green-50 focus:ring-green-300 focus:border-green-500 hover:bg-green-100 hover:border-green-400';
                                }
                              })()
                            }`}
                            title={(() => {
                              const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
                              const fieldKey = tieneEntregasAdicionales ? 'entregaBase' : 'entrega';
                              const key = getFieldKey(movimiento.establecimientoId, fieldKey);
                              const isUserTyping = isTyping[key];
                              const hasPending = hasPendingChange(movimiento.establecimientoId, fieldKey);

                              if (isUserTyping) {
                                return 'Escribiendo... - Complete la entrada para validar';
                              } else if (hasPending) {
                                return 'Cambios pendientes - Se guardará automáticamente';
                              } else if (tieneEntregasAdicionales) {
                                return 'Entrega base (editable) - Valor original de planificación';
                              } else {
                                return 'Entrega base de planificación';
                              }
                            })()}
                            disabled={isCreating || isUpdating || isAutoSaving}
                            aria-label={`Entrega base para ${movimiento.establecimiento.nombre}`}
                          />
                          {(() => {
                            const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
                            const fieldKey = tieneEntregasAdicionales ? 'entregaBase' : 'entrega';
                            const key = getFieldKey(movimiento.establecimientoId, fieldKey);
                            const isUserTyping = isTyping[key];
                            const hasPending = hasPendingChange(movimiento.establecimientoId, fieldKey);

                            if (isUserTyping) {
                              return (
                                <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-sm border-2 border-white"
                                     title="Escribiendo..."></div>
                              );
                            } else if (hasPending) {
                              return (
                                <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm border-2 border-white"
                                     title="Cambios pendientes"></div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        {movimiento.entregasAdicionales?.map((entrega) => (
                          <div key={entrega.id} className="flex items-center space-x-1 relative bg-orange-50 rounded-lg px-2 py-1 border border-orange-200">
                            <input
                              type="number"
                              min="0"
                              value={getCurrentEntregaValue(entrega.id, entrega.cantidad)}
                              onChange={(e) => handleTempEntregaValueChange(entrega.id, parseInt(e.target.value) || 0)}
                              onBlur={() => handleEntregaFieldBlur(entrega.id)}
                              className={`w-20 px-3 py-2 text-center text-base font-semibold border-2 rounded-lg focus:outline-none focus:ring-3 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 tabular-nums ${
                                hasPendingEntregaChange(entrega.id)
                                  ? 'border-yellow-400 bg-yellow-50 focus:ring-orange-300 focus:border-orange-500 shadow-md ring-2 ring-yellow-200'
                                  : 'border-orange-300 bg-white focus:ring-orange-300 focus:border-orange-500 hover:bg-orange-50 hover:border-orange-400'
                              }`}
                              title={hasPendingEntregaChange(entrega.id) ? 'Cambios pendientes - Se guardará automáticamente' : `Entrega adicional #${entrega.numeroEntrega}`}
                              disabled={isCreating || isUpdating || isProcessingEntrega}
                              aria-label={`Entrega adicional ${entrega.numeroEntrega}`}
                            />
                            {hasPendingEntregaChange(entrega.id) && (
                              <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm border-2 border-white"
                                   title="Cambios pendientes" aria-label="Cambios pendientes"></div>
                            )}
                            <button
                              onClick={() => handleEliminarEntregaAdicional(entrega.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors duration-200"
                              disabled={isCreating || isUpdating || isProcessingEntrega}
                              title="Eliminar entrega adicional"
                              aria-label={`Eliminar entrega adicional ${entrega.numeroEntrega}`}
                            >
                              {isProcessingEntrega ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAgregarEntregaAdicional(movimiento.establecimientoId)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors duration-200 border-2 border-dashed border-blue-300 hover:border-blue-400"
                          title="Agregar entrega adicional"
                          disabled={isCreating || isUpdating}
                          aria-label="Agregar nueva entrega adicional"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">entregas</div>
                    </td>
                    <td className="col-stock px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-indigo-700 tabular-nums">
                        {movimiento.stock.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">stock</div>
                    </td>
                    <td className="col-promedio px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-yellow-700 tabular-nums">
                        {movimiento.promedioConsumo.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">promedio</div>
                    </td>
                    <td className="col-disponibilidad px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className={`inline-flex flex-col items-center px-4 py-2 rounded-xl font-bold shadow-sm border-2 transition-all duration-200 ${
                        movimiento.disponibilidad >= 2
                          ? 'bg-green-100 text-green-800 border-green-300' :
                        movimiento.disponibilidad >= 1
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        <span className="text-lg font-bold tabular-nums">
                          {movimiento.disponibilidad.toFixed(1)}
                        </span>
                        <span className="text-xs font-medium">
                          {movimiento.disponibilidad >= 2 ? 'meses' : movimiento.disponibilidad >= 1 ? 'mes' : 'crítico'}
                        </span>
                      </div>
                    </td>
                    <td className="col-acciones px-4 py-5 text-center" role="gridcell">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => setSelectedMovimiento(movimiento)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 hover:border-blue-400 focus:outline-none focus:ring-3 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                          title="Ver detalle completo del movimiento"
                          disabled={isLoading}
                          aria-label={`Ver detalle de ${movimiento.establecimiento.nombre}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Detalle</span>
                        </button>
                        {movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0 && (
                          <button
                            onClick={() => {
                              setMovimientoParaEntregas(movimiento);
                              setShowEntregasAdicionalesModal(true);
                            }}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded-lg hover:bg-orange-200 hover:border-orange-400 focus:outline-none focus:ring-3 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                            title="Gestionar entregas adicionales"
                            disabled={isLoading}
                            aria-label={`Gestionar entregas adicionales de ${movimiento.establecimiento.nombre}`}
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Entregas</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                          );
                        })
                      }
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Modal de Detalle del Movimiento */}
      {selectedMovimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalle del Movimiento
                </h3>
                <button
                  onClick={() => setSelectedMovimiento(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Información del Establecimiento</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Nombre:</span>
                      <p className="font-medium">{selectedMovimiento.establecimiento.nombre}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Código:</span>
                      <p className="font-medium">{selectedMovimiento.establecimiento.codigo}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Tipo:</span>
                      <p className="font-medium capitalize">{selectedMovimiento.establecimiento.tipo.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Información de la Vacuna</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Vacuna:</span>
                      <p className="font-medium">{selectedMovimiento.vacuna?.nombre}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Período:</span>
                      <p className="font-medium">{meses[selectedMes - 1]} {selectedAnio}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Estado:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (selectedMovimiento as any).tieneMovimiento ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(selectedMovimiento as any).tieneMovimiento ? 'Con movimiento' : 'Sin movimiento'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Datos del Movimiento</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600 font-medium">Saldo Anterior</div>
                    <div className="text-lg font-bold text-blue-800">{selectedMovimiento.saldoAnterior}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600 font-medium">Trans. Ingreso</div>
                    <div className="text-lg font-bold text-green-800">{selectedMovimiento.transIngreso}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600 font-medium">Salida</div>
                    <div className="text-lg font-bold text-orange-800">{selectedMovimiento.salida}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-600 font-medium">Trans. Salida</div>
                    <div className="text-lg font-bold text-purple-800">{selectedMovimiento.transSalida}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="text-sm text-emerald-600 font-medium">Entrega</div>
                    <div className="text-lg font-bold text-emerald-800">{selectedMovimiento.entrega}</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <div className="text-sm text-indigo-600 font-medium">Stock</div>
                    <div className="text-lg font-bold text-indigo-800">{selectedMovimiento.stock}</div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3">
                    <div className="text-sm text-pink-600 font-medium">Promedio Consumo</div>
                    <div className="text-lg font-bold text-pink-800">{selectedMovimiento.promedioConsumo}</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-sm text-yellow-600 font-medium">Disponibilidad</div>
                    <div className="text-lg font-bold text-yellow-800">{selectedMovimiento.disponibilidad.toFixed(1)}</div>
                  </div>
                </div>
              </div>

              {selectedMovimiento.entregasAdicionales && selectedMovimiento.entregasAdicionales.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Entregas Adicionales</h4>
                  <div className="space-y-2">
                    {selectedMovimiento.entregasAdicionales.map((entrega) => (
                      <div key={entrega.id} className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                        <div>
                          <span className="font-medium">Entrega #{entrega.numeroEntrega}</span>
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(entrega.fechaEntrega).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-orange-800">
                          {entrega.cantidad} unidades
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMovimiento.observaciones && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Observaciones</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700">{selectedMovimiento.observaciones}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedMovimiento(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Entregas Adicionales */}
      {showEntregasAdicionalesModal && movimientoParaEntregas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestionar Entregas Adicionales
                </h3>
                <button
                  onClick={() => {
                    setShowEntregasAdicionalesModal(false);
                    setMovimientoParaEntregas(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Establecimiento</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{movimientoParaEntregas.establecimiento.nombre}</p>
                      <p className="text-sm text-gray-600">{movimientoParaEntregas.establecimiento.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Entrega Principal</p>
                      <p className="text-lg font-bold text-green-600">
                        {(() => {
                          // CORRECCIÓN: Mostrar entrega base (valor original de planificación)
                          const tieneEntregasAdicionales = movimientoParaEntregas.entregasAdicionales && movimientoParaEntregas.entregasAdicionales.length > 0;
                          return tieneEntregasAdicionales
                            ? (movimientoParaEntregas.entregaBase ?? 0) // Mostrar solo la base original
                            : movimientoParaEntregas.entrega;
                        })()} unidades
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Entregas Adicionales</h4>
                  <button
                    onClick={() => handleAgregarEntregaAdicional(movimientoParaEntregas.establecimientoId)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isCreating || isUpdating || isProcessingEntrega}
                  >
                    {isProcessingEntrega ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isProcessingEntrega ? 'Procesando...' : 'Agregar Entrega'}
                  </button>
                </div>

                {movimientoParaEntregas.entregasAdicionales && movimientoParaEntregas.entregasAdicionales.length > 0 ? (
                  <div className="space-y-3">
                    {movimientoParaEntregas.entregasAdicionales.map((entrega) => (
                      <div key={entrega.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-orange-100 rounded-full p-2">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Entrega #{entrega.numeroEntrega}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(entrega.fechaEntrega).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              {entrega.motivo && (
                                <p className="text-sm text-gray-500 mt-1">{entrega.motivo}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right relative">
                              <label className="block text-sm text-gray-600 mb-1">Cantidad</label>
                              <input
                                type="number"
                                min="0"
                                value={getCurrentEntregaValue(entrega.id, entrega.cantidad)}
                                onChange={(e) => handleTempEntregaValueChange(entrega.id, parseInt(e.target.value) || 0)}
                                onBlur={() => handleEntregaFieldBlur(entrega.id)}
                                className={`w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-center disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                  hasPendingEntregaChange(entrega.id)
                                    ? 'border-yellow-400 bg-yellow-50 focus:ring-orange-500'
                                    : 'border-orange-300 bg-white focus:ring-orange-500'
                                }`}
                                title={hasPendingEntregaChange(entrega.id) ? 'Cambios pendientes - Se guardará automáticamente' : 'Campo editable - Cantidad de entrega adicional'}
                                disabled={isCreating || isUpdating || isProcessingEntrega}
                              />
                              {hasPendingEntregaChange(entrega.id) && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                                     title="Cambios pendientes"></div>
                              )}
                            </div>

                            <button
                              onClick={() => handleEliminarEntregaAdicional(entrega.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              disabled={isCreating || isUpdating || isProcessingEntrega}
                              title="Eliminar entrega adicional"
                            >
                              {isProcessingEntrega ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay entregas adicionales</p>
                    <p className="text-sm text-gray-400">Haga clic en "Agregar Entrega" para crear una nueva</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">Resumen Total</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-600">Entrega Principal</p>
                    <p className="text-lg font-bold text-blue-800">
                      {(() => {
                        // CORRECCIÓN: Mostrar entrega base (valor original de planificación)
                        const tieneEntregasAdicionales = movimientoParaEntregas.entregasAdicionales && movimientoParaEntregas.entregasAdicionales.length > 0;
                        return tieneEntregasAdicionales
                          ? (movimientoParaEntregas.entregaBase ?? 0) // Mostrar solo la base original
                          : movimientoParaEntregas.entrega;
                      })()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-600">Entregas Adicionales</p>
                    <p className="text-lg font-bold text-blue-800">
                      {movimientoParaEntregas.entregasAdicionales?.reduce((sum, e) => {
                        const currentValue = getCurrentEntregaValue(e.id, e.cantidad);
                        return sum + currentValue;
                      }, 0) || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-600">Total General</p>
                    <p className="text-lg font-bold text-blue-800">
                      {/* CORRECCIÓN FINAL: El backend ya calcula el total en el campo 'entrega' */}
                      {movimientoParaEntregas.entrega}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEntregasAdicionalesModal(false);
                  setMovimientoParaEntregas(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vales por Acopio */}
      {showValesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2">
          <div className="bg-white rounded-xl shadow-xl w-[98vw] max-w-none max-h-[98vh] overflow-hidden">
            <ValesErrorBoundary>
              <Vales
                initialCentroAcopioId={selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined}
                initialVacunaId={selectedVacuna}
                initialMes={selectedMes}
                initialAnio={selectedAnio}
                onClose={() => setShowValesModal(false)}
              />
            </ValesErrorBoundary>
          </div>
        </div>
      )}

      {/* Modal de Importación */}
      {showImportarModal && (
        <ImportarModal
          isOpen={showImportarModal}
          onClose={() => setShowImportarModal(false)}
          vacunas={vacunasActivas}
          onDescargarPlantillaVacuna={descargarPlantillaVacuna}
          onDescargarPlantillaMasiva={descargarPlantillaMasiva}
          onImportarVacuna={async (vacunaId: string, anio: number, archivo: File) => {
            const resultado = await importarDesdeExcelVacuna(vacunaId, anio, archivo);
            if (resultado) {
              const { creadas, actualizadas, errores } = resultado;
              if (errores.length === 0) {
                toast.success(`Importación exitosa: ${creadas} creados, ${actualizadas} actualizados`);
              } else {
                toast.warning(`Importación con errores: ${creadas} creados, ${actualizadas} actualizados, ${errores.length} errores`);
              }
            }
            return resultado;
          }}
          onImportarMasivo={async (anio: number, archivo: File) => {
            const resultado = await importarDesdeExcelMasivo(anio, archivo);
            if (resultado) {
              const { totalCreadas, totalActualizadas, erroresPorVacuna, vacunasProcesadas } = resultado;
              if (erroresPorVacuna.length === 0) {
                toast.success(`Importación masiva exitosa: ${totalCreadas} creados, ${totalActualizadas} actualizados en ${vacunasProcesadas} vacunas`);
              } else {
                toast.warning(`Importación masiva con errores: ${totalCreadas} creados, ${totalActualizadas} actualizados, ${erroresPorVacuna.length} vacunas con errores`);
              }
            }
            return resultado;
          }}
          onGenerarReporteErrores={generarReporteErrores}
          isDownloadingTemplate={isDownloadingTemplate}
          isImportingExcel={isImportingExcel}
        />
      )}

      {/* Modal de Confirmación de Modificación */}
      {showConfirmacionModal && pendingModification && (
        <ConfirmacionModificacionModal
          isOpen={showConfirmacionModal}
          onClose={handleCloseConfirmationModal}
          onConfirm={handleConfirmModification}
          onCancel={handleCancelModification}
          establecimientoNombre={pendingModification.establecimientoNombre}
          vacunaNombre={vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna'}
          cantidadOriginal={pendingModification.valorOriginal}
          cantidadNueva={pendingModification.valorNuevo}
          valesAfectados={pendingModification.valesAfectados}
          isProcessing={isAutoSaving}
        />
      )}

      {/* Modal de Confirmación Sin Disponibilidad */}
      {showSinDisponibilidadModal && pendingSinDisponibilidad && (
        <ConfirmacionSinDisponibilidadModal
          isOpen={showSinDisponibilidadModal}
          onClose={handleCloseSinDisponibilidadModal}
          onConfirm={handleConfirmSinDisponibilidad}
          establecimientoNombre={pendingSinDisponibilidad.establecimientoNombre}
          vacunaNombre={vacunasActivas.find(v => v.id === selectedVacuna)?.nombre || 'Vacuna'}
          cantidad={pendingSinDisponibilidad.valor}
          mesActual={meses[selectedMes - 1]}
          anio={selectedAnio}
          isProcessing={isAutoSaving}
          tipoEntrega={pendingSinDisponibilidad.tipoEntrega}
        />
      )}
      </div>
    </div>
  );
};

export default Movimientos;
