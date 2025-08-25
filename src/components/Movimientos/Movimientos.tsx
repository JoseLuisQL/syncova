import React, { useState, useEffect, useMemo, useRef } from 'react';
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

const Movimientos: React.FC = () => {
  // Hooks para gestión de datos
  const {
    movimientos,
    isLoading,
    isCreating,
    isUpdating,
    error,
    loadMovimientos,
    createMovimiento,
    updateMovimiento,
    getStockDisponible,
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
    isImportingExcel
  } = useMovimientos();

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

  // Estados para stock disponible
  const [stockInfo, setStockInfo] = useState<{
    stockInicial: number;
    totalEntregas: number;
    stockDisponible: number;
    estado: 'bueno' | 'medio' | 'critico';
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
    };
  }, []);

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
  const handleTempValueChange = (establecimientoId: string, campo: string, newValue: number) => {
    const key = getFieldKey(establecimientoId, campo);

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

    // Configurar nuevo timeout para auto-guardar después de 2 segundos de inactividad
    debounceTimeouts.current[key] = setTimeout(() => {
      handleSaveFieldValue(establecimientoId, campo, newValue);
    }, 2000);
  };

  // Función para guardar un campo específico
  const handleSaveFieldValue = async (establecimientoId: string, campo: string, value: number) => {
    const key = getFieldKey(establecimientoId, campo);

    try {
      setIsAutoSaving(true);

      // Limpiar timeout si existe
      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
        delete debounceTimeouts.current[key];
      }

      // Obtener información del establecimiento para el toast
      const establecimiento = establecimientosFiltrados.find(e => e.id === establecimientoId);
      const nombreEstablecimiento = establecimiento?.nombre || 'Establecimiento';

      // Obtener el movimiento existente para determinar si es creación o actualización
      const movimientoExistente = datosTabla.find(m => m.establecimientoId === establecimientoId);
      const esCreacion = !movimientoExistente?.tieneMovimiento;

      // Actualizar en el backend
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

    } catch (error) {
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

  // Función para manejar cuando el usuario sale del campo (onBlur)
  const handleFieldBlur = (establecimientoId: string, campo: string) => {
    const key = getFieldKey(establecimientoId, campo);
    const tempValue = tempValues[key];

    if (tempValue !== undefined && pendingChanges[key]) {
      handleSaveFieldValue(establecimientoId, campo, tempValue);
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
  const handleTempEntregaValueChange = (entregaId: string, newValue: number) => {
    const key = getEntregaFieldKey(entregaId);

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
    entregasDebounceTimeouts.current[key] = setTimeout(() => {
      handleSaveEntregaAdicionalValue(entregaId, newValue);
    }, 2000);
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

      // Actualizar en el backend (con redistribución automática)
      await updateEntregaAdicional(entregaId, { cantidad: value });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos de Vacunas</h1>
          <p className="text-gray-600">Gestión de entregas y movimientos de vacunas por establecimiento</p>
        </div>
        <div className="flex items-center space-x-3">
          {pendingChangesCount > 0 && (
            <button
              onClick={handleSaveAllPendingChanges}
              disabled={isAutoSaving}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={`Guardar ${pendingChangesCount} cambio(s) pendiente(s)`}
            >
              <Save className={`h-4 w-4 mr-2 ${isAutoSaving ? 'animate-spin' : ''}`} />
              Guardar Cambios ({pendingChangesCount})
            </button>
          )}
          <button
            onClick={() => setShowValesModal(true)}
            disabled={!selectedVacuna || selectedCentroAcopio === 'todos'}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowImportarModal(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            title="Importar movimientos desde Excel"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Movimientos
          </button>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Funcionalidad de exportación en desarrollo"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

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

      {/* Panel de Filtros Compacto */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Filtros de Análisis</h3>
            </div>
            {(isLoadingEstablecimientos || isLoadingActivas) && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Cargando...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Centro de Acopio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1 text-emerald-600" />
                Centro de Acopio
              </label>
              <select
                value={selectedCentroAcopio}
                onChange={(e) => setSelectedCentroAcopio(e.target.value)}
                disabled={isLoadingEstablecimientos}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm font-medium transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="h-4 w-4 inline mr-1 text-purple-600" />
                Vacuna
              </label>
              <select
                value={selectedVacuna}
                onChange={(e) => setSelectedVacuna(e.target.value)}
                disabled={isLoadingActivas}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm font-medium transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1 text-blue-600" />
                Mes
              </label>
              <select
                value={selectedMes}
                onChange={(e) => setSelectedMes(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium transition-colors"
              >
                {meses.map((mes, index) => (
                  <option key={index + 1} value={index + 1}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1 text-blue-600" />
                Año
              </label>
              <select
                value={selectedAnio}
                onChange={(e) => setSelectedAnio(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium transition-colors"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>

          {/* Estado Compacto */}
          {selectedVacuna && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">
                    {datosTabla.length} establecimientos • {meses[selectedMes - 1]} {selectedAnio}
                  </span>
                </div>
                <div className="text-gray-500">
                  {selectedCentroAcopio === 'todos' ? 'Todos los centros' : centrosAcopio.find(c => c.id === selectedCentroAcopio)?.nombre}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Disponible Compacto */}
      {selectedVacuna && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 rounded-lg p-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Stock Disponible</h3>
              </div>
              {(isLoadingStock || isUpdatingStock) && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Actualizando...</span>
                </div>
              )}
            </div>

            {stockInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stock Inicial */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-blue-700">
                        {stockInfo.stockInicial.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Stock Inicial</div>
                    </div>
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                {/* Total Entregas */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-orange-700">
                        {stockInfo.totalEntregas.toLocaleString()}
                      </div>
                      <div className="text-sm text-orange-600 font-medium">Entregas</div>
                    </div>
                    <TruckIcon className="h-5 w-5 text-orange-600" />
                  </div>
                </div>

                {/* Stock Disponible */}
                <div className={`rounded-lg p-4 border ${
                  stockInfo.stockDisponible < 0 ? 'bg-red-50 border-red-200' :
                  stockInfo.estado === 'bueno' ? 'bg-green-50 border-green-200' :
                  stockInfo.estado === 'medio' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xl font-bold ${
                        stockInfo.stockDisponible < 0 ? 'text-red-700' :
                        stockInfo.estado === 'bueno' ? 'text-green-700' :
                        stockInfo.estado === 'medio' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {stockInfo.stockDisponible.toLocaleString()}
                      </div>
                      <div className={`text-sm font-medium ${
                        stockInfo.stockDisponible < 0 ? 'text-red-600' :
                        stockInfo.estado === 'bueno' ? 'text-green-600' :
                        stockInfo.estado === 'medio' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {stockInfo.stockDisponible < 0 ? 'Déficit' : 'Disponible'}
                      </div>
                    </div>
                    {stockInfo.stockDisponible < 0 ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : stockInfo.estado === 'bueno' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : stockInfo.estado === 'medio' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            ) : stockError ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-red-600 text-sm font-medium mb-2">Error al cargar stock</div>
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
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="text-gray-600 text-sm">Cargando información de stock...</div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Tabla de Movimientos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Movimientos de Vacunas - {meses[selectedMes - 1]} {selectedAnio}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {datosTabla.length} establecimientos • Total entregas: {totalesGenerales.entrega.toLocaleString()}
              </p>
            </div>
            {isLoading && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Cargando...</span>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible shadow-sm">
          <table className="min-w-full divide-y divide-gray-300 bg-white" role="table" aria-label="Movimientos de Vacunas">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
              <tr role="row">
                <th
                  className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[280px]"
                  scope="col"
                  aria-sort="none"
                >
                  Establecimiento
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[120px]"
                  scope="col"
                  aria-label="Saldo Anterior"
                >
                  Saldo Anterior
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[130px]"
                  scope="col"
                  aria-label="Transferencia Ingreso"
                >
                  Trans. Ingreso
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[120px]"
                  scope="col"
                  aria-label="Total Saldo"
                >
                  Total Saldo
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[100px]"
                  scope="col"
                  aria-label="Salida"
                >
                  Salida
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[130px]"
                  scope="col"
                  aria-label="Transferencia Salida"
                >
                  Trans. Salida
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[100px]"
                  scope="col"
                  aria-label="Saldo Final"
                >
                  Saldo
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[140px]"
                  scope="col"
                  aria-label="Entrega"
                >
                  Entrega
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[100px]"
                  scope="col"
                  aria-label="Stock Disponible"
                >
                  Stock
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[140px]"
                  scope="col"
                  aria-label="Promedio de Consumo"
                >
                  Promedio Consumo
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 min-w-[130px]"
                  scope="col"
                  aria-label="Disponibilidad en Meses"
                >
                  Disponibilidad
                </th>
                <th
                  className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider min-w-[120px]"
                  scope="col"
                  aria-label="Acciones Disponibles"
                >
                  Acciones
                </th>
              </tr>
            </thead>
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
                  {/* TOTALES ROW - Enhanced with better visual hierarchy */}
                  <tr
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-4 border-blue-500 border-b-2 border-blue-300 sticky top-[73px] z-10 shadow-sm"
                    role="row"
                    aria-label="Fila de totales generales"
                  >
                    <td className="px-6 py-5 text-base font-bold text-gray-900 border-r border-blue-200">
                      <div>
                        <div className="text-base font-bold text-gray-900">TOTALES GENERALES</div>
                        <div className="text-sm text-gray-600 font-medium">
                          {datosTabla.length} establecimientos registrados
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-lg font-bold text-blue-700 tabular-nums">
                        {totalesGenerales.saldoAnterior.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">unidades</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-lg font-bold text-green-700 tabular-nums">
                        {totalesGenerales.transIngreso.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">ingresos</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-lg font-bold text-blue-700 tabular-nums bg-blue-100 px-3 py-1 rounded-lg">
                        {totalesGenerales.totalSaldo.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">total</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-lg font-bold text-orange-700 tabular-nums">
                        {totalesGenerales.salida.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">salidas</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-lg font-bold text-purple-700 tabular-nums">
                        {totalesGenerales.transSalida.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">transferencias</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-lg font-bold text-green-700 tabular-nums bg-green-100 px-3 py-1 rounded-lg">
                        {totalesGenerales.saldo.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">saldo final</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-lg font-bold text-emerald-700 tabular-nums bg-emerald-100 px-3 py-1 rounded-lg">
                        {totalesGenerales.entrega.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">entregas</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-lg font-bold text-indigo-700 tabular-nums">
                        {totalesGenerales.stock.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">stock total</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-sm font-medium text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                          N/A
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-blue-200">
                      <div className="text-sm font-medium text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                          N/A
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="text-sm font-medium text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                          N/A
                        </span>
                      </div>
                    </td>
                  </tr>

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
                      <td className="px-6 py-5 whitespace-nowrap border-r border-gray-300" role="gridcell">
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
                    <td className="px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-blue-700 tabular-nums">
                        {movimiento.saldoAnterior.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">unidades</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-gray-300 relative" role="gridcell">
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
                    <td className="px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-blue-700 tabular-nums bg-blue-100 px-3 py-2 rounded-lg inline-block shadow-sm">
                        {movimiento.totalSaldo.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">total</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-gray-300 relative" role="gridcell">
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
                    <td className="px-4 py-5 text-center border-r border-gray-300 relative" role="gridcell">
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
                    <td className="px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-green-700 tabular-nums bg-green-100 px-3 py-2 rounded-lg inline-block shadow-sm">
                        {movimiento.saldo.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">saldo final</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-gray-300 relative" role="gridcell">
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
                              const hasPending = hasPendingChange(movimiento.establecimientoId, fieldKey);

                              if (hasPending) {
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
                            return hasPendingChange(movimiento.establecimientoId, fieldKey) && (
                              <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm border-2 border-white"
                                   title="Cambios pendientes"></div>
                            );
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
                    <td className="px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-indigo-700 tabular-nums">
                        {movimiento.stock.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">stock</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-gray-300" role="gridcell">
                      <div className="text-lg font-bold text-yellow-700 tabular-nums">
                        {movimiento.promedioConsumo.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">promedio</div>
                    </td>
                    <td className="px-4 py-5 text-center border-r border-gray-300" role="gridcell">
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
                    <td className="px-4 py-5 text-center" role="gridcell">
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
    </div>
  );
};

export default Movimientos;
