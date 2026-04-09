import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Warning } from '@phosphor-icons/react';
import {
  Establecimiento,
  PlanificacionConRelaciones,
  CreatePlanificacionDto,
  UpdatePlanificacionDto,
} from '../../types';
import { ordenarEstablecimientos } from '../../utils/centroAcopioUtils';
import { PlanificacionExportService } from '../../services/planificacionExportService';
import { usePlanificacion } from '../../hooks/usePlanificacion';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { PlanificacionService } from '../../services/planificacionService';
import { ValesService } from '../../services/valesService';
import { PermisoOperativoService, MisPermisos } from '../../services/permisoOperativoService';
import { MESES } from './constants';
import {
  PlanificacionHeader,
  PlanificacionTabla,
  PlanificacionAcciones,
  ConfirmacionValeModal,
} from './components';
import ImportarModal from './ImportarModal';

interface EstablecimientoData {
  establecimiento: Establecimiento;
  distribucionMensual: number[];
  total: number;
  estado: string;
  planificacionId?: string;
}

interface CentroAcopioFilterOption {
  id: string;
  nombre: string;
  codigo?: string;
}

const Planificacion: React.FC = () => {
  const { user } = useAuth();
  const isResponsableAcopio = user?.rol === 'responsable_acopio';
  const [permisosOperativos, setPermisosOperativos] = useState<MisPermisos | null>(null);
  const hasPlanificacionEdicion = permisosOperativos?.planificacion_edicion ?? false;
  const isReadOnlyMode = isResponsableAcopio && !hasPlanificacionEdicion;
  const canImportPlanificacion = !isResponsableAcopio;
  const canExportPlanificacion = true;
  const canUseAdminPlanificacionActions = !isResponsableAcopio;
  const lockedCentroAcopioIds = user?.centroAcopioIds?.length
    ? user.centroAcopioIds
    : user?.centroAcopioId
      ? [user.centroAcopioId]
      : [];
  const lockedCentroAcopioLabel = lockedCentroAcopioIds.length > 1
    ? `${lockedCentroAcopioIds.length} centros asignados`
    : user?.centroAcopio?.nombre || 'Centro asignado';
  // Estados de filtros
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [isLoadingAnios, setIsLoadingAnios] = useState(true);
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>('todos');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [planificacionesPorVacuna, setPlanificacionesPorVacuna] = useState<PlanificacionConRelaciones[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Estado para manejar valores temporales durante la edición
  const [tempValues, setTempValues] = useState<{[key: string]: number}>({});
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  const debounceTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({});
  const initialDataLoadedRef = useRef(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Estados para modal de confirmación de vale
  const [showConfirmacionValeModal, setShowConfirmacionValeModal] = useState(false);
  const [isProcessingValeChange, setIsProcessingValeChange] = useState(false);
  const [pendingValeModification, setPendingValeModification] = useState<{
    estIndex: number;
    mesIndex: number;
    valorNuevo: number;
    valorOriginal: number;
    establecimientoNombre: string;
    establecimientoId: string;
  } | null>(null);

  // Estado de vales generados por celda: Set de claves "establecimientoId-mesIndex"
  const [valesEstado, setValesEstado] = useState<Set<string>>(new Set());

  // Refs para mantener valores actualizados en closures
  const selectedVacunaRef = useRef(selectedVacuna);
  const datosVacunaRef = useRef<typeof datosVacuna>(null);

  const { toast } = useToastContext();

  // Hooks para gestión de datos
  const {
    isLoading,
    error,
    createPlanificacion,
    updatePlanificacion,
    loadByVacunaAndYear,
    descargarPlantillaVacuna,
    descargarPlantillaMasiva,
    importarDesdeExcelVacuna,
    importarDesdeExcelMasivo,
    isUpdating,
    isImporting,
    isDownloadingTemplate,
    isImportingExcel,
  } = usePlanificacion();

  const {
    establecimientos,
    centrosAcopio,
    loadEstablecimientos,
    loadCentrosAcopio,
    isLoading: isLoadingEstablecimientos
  } = useEstablecimientos({ limit: 1000 });

  const { vacunas, loadVacunasActivas, isLoading: isLoadingVacunas } = useVacunas();
  const centrosAcopioPermitidos = useMemo<CentroAcopioFilterOption[]>(() => {
    const options = new Map<string, CentroAcopioFilterOption>();

    user?.centrosAcopioAsignados?.forEach(({ centroAcopio }) => {
      if (!centroAcopio?.id) {
        return;
      }

      options.set(centroAcopio.id, {
        id: centroAcopio.id,
        nombre: centroAcopio.nombre,
        codigo: centroAcopio.codigo,
      });
    });

    establecimientos.forEach((establecimiento) => {
      const centro = establecimiento.centroAcopio;
      if (!centro?.id || !lockedCentroAcopioIds.includes(centro.id) || options.has(centro.id)) {
        return;
      }

      options.set(centro.id, {
        id: centro.id,
        nombre: centro.nombre,
        codigo: centro.codigo,
      });
    });

    centrosAcopio.forEach((centro) => {
      if (!lockedCentroAcopioIds.includes(centro.id) || options.has(centro.id)) {
        return;
      }

      options.set(centro.id, {
        id: centro.id,
        nombre: centro.nombre,
        codigo: centro.codigo,
      });
    });

    return Array.from(options.values());
  }, [centrosAcopio, establecimientos, lockedCentroAcopioIds, user?.centrosAcopioAsignados]);
  const centrosAcopioFiltro = isReadOnlyMode ? centrosAcopioPermitidos : centrosAcopio;
  const canFilterAssignedCentros = isReadOnlyMode && centrosAcopioPermitidos.length > 1;
  const allCentrosLabel = 'Todos';

  // Obtener establecimientos filtrados
  const establecimientosFiltrados = useMemo(() => {
    let filtrados: Establecimiento[];

    if (selectedCentroAcopio === 'todos') {
      filtrados = establecimientos.filter(e => (e.tipo as any) !== 'centro_acopio');
    } else {
      filtrados = establecimientos.filter(e => e.centroAcopioId === selectedCentroAcopio);
    }

    return ordenarEstablecimientos(filtrados);
  }, [establecimientos, selectedCentroAcopio]);

  // Cargar años disponibles desde la API
  useEffect(() => {
    const fetchAniosDisponibles = async () => {
      try {
        setIsLoadingAnios(true);
        const response = await PlanificacionService.getAniosDisponibles();
        setAniosDisponibles(response.anios);
        // Establecer el año actual si está disponible
        if (response.anios.includes(response.anioActual)) {
          setSelectedAnio(response.anioActual);
        } else if (response.anios.length > 0) {
          // Usar el último año disponible
          setSelectedAnio(response.anios[response.anios.length - 1]);
        }
      } catch (error) {
        console.error('Error al cargar años disponibles:', error);
        // Fallback
        const currentYear = new Date().getFullYear();
        setAniosDisponibles([currentYear - 1, currentYear, currentYear + 1]);
      } finally {
        setIsLoadingAnios(false);
      }
    };

    fetchAniosDisponibles();
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (initialDataLoadedRef.current) {
      return;
    }

    if (isReadOnlyMode && lockedCentroAcopioIds.length === 0) {
      return;
    }

    initialDataLoadedRef.current = true;
    loadEstablecimientos({ limit: 1000 });
    if (!isReadOnlyMode) {
      loadCentrosAcopio();
    }
    loadVacunasActivas();
  }, [isReadOnlyMode, lockedCentroAcopioIds.length]);

  useEffect(() => {
    if (isReadOnlyMode) {
      setSelectedCentroAcopio('todos');
    }
  }, [isReadOnlyMode]);

  useEffect(() => {
    if (selectedCentroAcopio === 'todos') {
      return;
    }

    if (!centrosAcopioFiltro.some((centro) => centro.id === selectedCentroAcopio)) {
      setSelectedCentroAcopio('todos');
    }
  }, [centrosAcopioFiltro, selectedCentroAcopio]);

  useEffect(() => {
    if (!isResponsableAcopio) {
      setPermisosOperativos(null);
      return;
    }

    const cargarPermisos = async () => {
      try {
        const permisos = await PermisoOperativoService.getMisPermisosPorAnio(selectedAnio);
        setPermisosOperativos(permisos);
      } catch {
        setPermisosOperativos(null);
      }
    };

    void cargarPermisos();
  }, [isResponsableAcopio, selectedAnio]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Cargar planificaciones cuando cambien los filtros
  useEffect(() => {
    if (selectedVacuna && selectedAnio) {
      loadPlanificacionesPorVacuna();
    }
  }, [selectedVacuna, selectedAnio, selectedCentroAcopio]);

  // Seleccionar primera vacuna automáticamente
  useEffect(() => {
    if (vacunas.length > 0 && !selectedVacuna) {
      setSelectedVacuna(vacunas[0].id);
    }
  }, [vacunas, selectedVacuna]);

  // Cargar estado de vales generados para la vacuna/año seleccionados
  const cargarEstadoVales = useCallback(async (planificaciones: PlanificacionConRelaciones[]) => {
    if (!selectedVacuna || !selectedAnio || planificaciones.length === 0) return;

    const nuevosVales = new Set<string>();

    await Promise.allSettled(
      planificaciones.flatMap((plan) =>
        Array.from({ length: 12 }, (_, mesIndex) => async () => {
          if ((plan.distribucionMensual[mesIndex] ?? 0) === 0) return;
          try {
            const verificacion = await ValesService.verificarValesExistentes(
              plan.establecimientoId,
              selectedVacuna,
              mesIndex + 1,
              selectedAnio
            );
            if (verificacion.success && verificacion.data?.existenVales) {
              nuevosVales.add(`${plan.establecimientoId}-${mesIndex}`);
            }
          } catch {
            // Ignorar errores individuales
          }
        })
      ).flat().map(fn => fn())
    );

    setValesEstado(nuevosVales);
  }, [selectedVacuna, selectedAnio]);

  // Cargar planificaciones por vacuna y año
  const loadPlanificacionesPorVacuna = async (preserveTempValues: boolean = false) => {
    if (!selectedVacuna || !selectedAnio) return;

    try {
      const planificaciones = await loadByVacunaAndYear(
        selectedVacuna,
        selectedAnio,
        selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined
      );
      setPlanificacionesPorVacuna(planificaciones);
      // Solo limpiar tempValues si no estamos preservando (ej: cambio de filtros)
      if (!preserveTempValues) {
        setTempValues({});
        setPendingChanges({});
      }
      // Cargar estado de vales en background sin bloquear la UI
      void cargarEstadoVales(planificaciones);
    } catch (error) {
      console.error('Error al cargar planificaciones:', error);
      toast.error('Error al cargar planificaciones');
    }
  };

  // Funciones para edición
  const getFieldKey = useCallback((estIndex: number, mesIndex: number) => {
    return `${estIndex}-${mesIndex}`;
  }, []);

  const getCurrentValue = useCallback((estIndex: number, mesIndex: number, originalValue: number) => {
    const key = getFieldKey(estIndex, mesIndex);
    return tempValues[key] !== undefined ? tempValues[key] : originalValue;
  }, [getFieldKey, tempValues]);

  const hasPendingChange = useCallback((estIndex: number, mesIndex: number) => {
    const key = getFieldKey(estIndex, mesIndex);
    return pendingChanges[key] || false;
  }, [getFieldKey, pendingChanges]);

  const handleTempValueChange = useCallback(async (estIndex: number, mesIndex: number, newValue: number) => {
    const key = getFieldKey(estIndex, mesIndex);
    const currentDatosVacuna = datosVacunaRef.current;
    const currentSelectedVacuna = selectedVacunaRef.current;

    // Actualizar valor temporal inmediatamente para UI responsiva
    setTempValues(prev => ({
      ...prev,
      [key]: newValue
    }));

    setPendingChanges(prev => ({
      ...prev,
      [key]: true
    }));

    // Cancelar timeout anterior si existe
    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
    }

    // Obtener datos del establecimiento
    const establecimientoData = currentDatosVacuna?.establecimientos[estIndex];
    if (!establecimientoData || !currentSelectedVacuna) {
      // Si no hay datos, guardar directamente
      debounceTimeouts.current[key] = setTimeout(() => {
        handleSaveFieldValue(estIndex, mesIndex, newValue);
      }, 2000);
      return;
    }

    const valorOriginal = establecimientoData.distribucionMensual[mesIndex] || 0;

    // Si el valor no cambió, no hacer nada
    if (valorOriginal === newValue) {
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

    // Verificar si hay vale generado para este establecimiento/vacuna/mes
    debounceTimeouts.current[key] = setTimeout(async () => {
      try {
        const verificacion = await ValesService.verificarValesExistentes(
          establecimientoData.establecimiento.id,
          currentSelectedVacuna,
          mesIndex + 1, // mes es 1-indexed
          selectedAnio
        );

        if (verificacion.success && verificacion.data?.existenVales) {
          // Hay vale generado - mostrar modal de confirmación
          setPendingValeModification({
            estIndex,
            mesIndex,
            valorNuevo: newValue,
            valorOriginal,
            establecimientoNombre: establecimientoData.establecimiento.nombre,
            establecimientoId: establecimientoData.establecimiento.id
          });
          setShowConfirmacionValeModal(true);
        } else {
          // No hay vale - guardar directamente
          handleSaveFieldValue(estIndex, mesIndex, newValue);
        }
      } catch (error) {
        console.error('Error verificando vales:', error);
        // En caso de error, guardar directamente
        handleSaveFieldValue(estIndex, mesIndex, newValue);
      }
    }, 1500);
  }, [getFieldKey, selectedAnio]);

  const handleSaveFieldValue = async (estIndex: number, mesIndex: number, value: number) => {
    const key = getFieldKey(estIndex, mesIndex);

    // No guardar si hay una modificación pendiente de confirmación de vale para este campo
    if (pendingValeModification && 
        pendingValeModification.estIndex === estIndex && 
        pendingValeModification.mesIndex === mesIndex) {
      return;
    }

    try {
      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
        delete debounceTimeouts.current[key];
      }

      await handleActualizarDistribucion(estIndex, mesIndex, value);

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
    } catch (error) {
      console.error('Error al guardar campo:', error);
    }
  };

  const handleFieldBlur = useCallback((estIndex: number, mesIndex: number) => {
    // No procesar blur si hay un modal de confirmación de vale abierto
    if (showConfirmacionValeModal) return;
    
    const key = getFieldKey(estIndex, mesIndex);
    const tempValue = tempValues[key];

    // No guardar si hay una modificación pendiente de confirmación para este campo
    if (pendingValeModification && 
        pendingValeModification.estIndex === estIndex && 
        pendingValeModification.mesIndex === mesIndex) {
      return;
    }

    if (tempValue !== undefined && pendingChanges[key]) {
      handleSaveFieldValue(estIndex, mesIndex, tempValue);
    }
  }, [getFieldKey, tempValues, pendingChanges, showConfirmacionValeModal, pendingValeModification]);

  // Funciones para modal de confirmación de vale
  const handleConfirmValeModification = async () => {
    if (!pendingValeModification) return;

    const key = getFieldKey(pendingValeModification.estIndex, pendingValeModification.mesIndex);
    
    // Cancelar cualquier timeout pendiente para este campo
    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
      delete debounceTimeouts.current[key];
    }

    // Guardar los datos antes de limpiar el estado
    const { estIndex, mesIndex, valorNuevo, establecimientoId } = pendingValeModification;

    setIsProcessingValeChange(true);
    try {
      // Llamar directamente a handleActualizarDistribucion (no handleSaveFieldValue que tiene la protección)
      await handleActualizarDistribucion(estIndex, mesIndex, valorNuevo);
      
      // Limpiar tempValues y pendingChanges
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
      
      // Sincronizar los vales del establecimiento para este período
      // Esperar un momento para asegurar que el backend haya procesado los movimientos
      try {
        console.log('🔄 Iniciando sincronización de vales...');
        
        // Pequeño delay para asegurar que los movimientos se actualicen
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const verificacion = await ValesService.verificarValesExistentes(
          establecimientoId,
          selectedVacunaRef.current,
          mesIndex + 1,
          selectedAnio
        );
        
        console.log('📋 Verificación de vales:', verificacion);
        
        if (verificacion.success && verificacion.data?.valesEncontrados) {
          console.log(`📋 Encontrados ${verificacion.data.valesEncontrados.length} vales para sincronizar`);
          for (const vale of verificacion.data.valesEncontrados) {
            console.log(`🔄 Sincronizando vale: ${vale.id}`);
            const syncResult = await ValesService.sincronizarVale(vale.id);
            console.log(`✅ Resultado sincronización:`, syncResult);
          }
        } else {
          console.log('⚠️ No se encontraron vales para sincronizar');
        }
      } catch (syncError) {
        console.error('Error sincronizando vales:', syncError);
      }
      
      toast.success('Modificación aplicada - Vale y stocks actualizados');
    } catch (error) {
      console.error('Error al aplicar modificación con vale:', error);
      toast.error('Error al aplicar la modificación');
    } finally {
      setIsProcessingValeChange(false);
      setShowConfirmacionValeModal(false);
      setPendingValeModification(null);
    }
  };

  const handleCancelValeModification = () => {
    if (!pendingValeModification) return;

    const key = getFieldKey(pendingValeModification.estIndex, pendingValeModification.mesIndex);

    // Cancelar cualquier timeout pendiente para este campo
    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
      delete debounceTimeouts.current[key];
    }

    // Limpiar el valor temporal - esto hará que el input vuelva a mostrar el valor original
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

    setShowConfirmacionValeModal(false);
    setPendingValeModification(null);
    toast.info('Modificación cancelada');
  };

  const handleSaveAllPendingChanges = async () => {
    const pendingKeys = Object.keys(pendingChanges).filter(key => pendingChanges[key]);

    if (pendingKeys.length === 0) {
      toast.info('No hay cambios pendientes para guardar');
      return;
    }

    try {
      const savePromises = pendingKeys.map(key => {
        const [estIndex, mesIndex] = key.split('-').map(Number);
        const value = tempValues[key];

        if (value !== undefined) {
          return handleSaveFieldValue(estIndex, mesIndex, value);
        }
      });

      await Promise.all(savePromises.filter(Boolean));
      toast.success(`${pendingKeys.length} cambio(s) guardado(s) exitosamente`);
    } catch (error) {
      console.error('Error al guardar cambios pendientes:', error);
      toast.error('Error al guardar algunos cambios');
    }
  };

  // Datos de la vacuna
  const vacunaSeleccionada = vacunas.find(v => v.id === selectedVacuna);

  const datosVacuna = useMemo(() => {
    if (!vacunaSeleccionada) return null;

    return {
      vacuna: vacunaSeleccionada,
      establecimientos: establecimientosFiltrados.map(establecimiento => {
        const planificacionExistente = planificacionesPorVacuna.find(
          p => p.establecimientoId === establecimiento.id
        );

        return {
          establecimiento,
          distribucionMensual: planificacionExistente?.distribucionMensual || Array(12).fill(0),
          total: planificacionExistente?.metaAnual || 0,
          estado: planificacionExistente ? 'programado' : 'pendiente',
          planificacionId: planificacionExistente?.id
        };
      })
    };
  }, [vacunaSeleccionada, establecimientosFiltrados, planificacionesPorVacuna]);

  // Mantener refs actualizados
  useEffect(() => {
    selectedVacunaRef.current = selectedVacuna;
  }, [selectedVacuna]);

  useEffect(() => {
    datosVacunaRef.current = datosVacuna;
  }, [datosVacuna]);

  // Cálculos de totales
  const calcularTotalMes = useCallback((mesIndex: number) => {
    if (!datosVacuna) return 0;
    return datosVacuna.establecimientos.reduce((sum, est) =>
      sum + est.distribucionMensual[mesIndex], 0
    );
  }, [datosVacuna]);

  const calcularTotalGeneral = useCallback(() => {
    if (!datosVacuna) return 0;
    return datosVacuna.establecimientos.reduce((sum, est) => sum + est.total, 0);
  }, [datosVacuna]);

  // CRUD de planificación
  const handleCreatePlanificacion = async (data: CreatePlanificacionDto) => {
    try {
      if (!data.establecimientoId || !data.vacunaId || !data.anio) {
        toast.error('Faltan datos requeridos para crear la planificación');
        return;
      }

      if (data.metaAnual <= 0) {
        toast.error('La meta anual debe ser mayor a 0');
        return;
      }

      await createPlanificacion(data);
      toast.success('Planificación creada exitosamente');
      // Para creación, necesitamos recargar para obtener el ID del servidor
      await loadPlanificacionesPorVacuna(true); // preserveTempValues: true
    } catch (error: unknown) {
      console.error('Error al crear planificación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear planificación';
      toast.error(errorMessage);
    }
  };

  const handleUpdatePlanificacion = async (id: string, data: UpdatePlanificacionDto, skipReload: boolean = false) => {
    try {
      if (!id) {
        toast.error('ID de planificación requerido');
        return;
      }

      if (data.metaAnual !== undefined && data.metaAnual <= 0) {
        toast.error('La meta anual debe ser mayor a 0');
        return;
      }

      await updatePlanificacion(id, data);
      
      // Actualización optimista del estado local
      if (data.distribucionMensual && data.metaAnual !== undefined) {
        setPlanificacionesPorVacuna(prev => 
          prev.map(p => p.id === id 
            ? { ...p, distribucionMensual: data.distribucionMensual!, metaAnual: data.metaAnual! }
            : p
          )
        );
      }
      
      if (!skipReload) {
        toast.success('Planificación actualizada exitosamente');
      }
    } catch (error: unknown) {
      console.error('Error al actualizar planificación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar planificación';
      toast.error(errorMessage);
      // En caso de error, recargar para sincronizar con el servidor
      await loadPlanificacionesPorVacuna();
    }
  };

  const handleActualizarDistribucion = async (establecimientoIndex: number, mesIndex: number, valor: number) => {
    // Usar refs para obtener valores actualizados
    const currentDatosVacuna = datosVacunaRef.current;
    const currentSelectedVacuna = selectedVacunaRef.current;

    if (!currentDatosVacuna || !currentSelectedVacuna) {
      toast.error('No hay datos de vacuna seleccionados');
      return;
    }

    if (establecimientoIndex < 0 || establecimientoIndex >= currentDatosVacuna.establecimientos.length) {
      toast.error('Índice de establecimiento inválido');
      return;
    }

    if (mesIndex < 0 || mesIndex >= 12) {
      toast.error('Índice de mes inválido');
      return;
    }

    if (valor < 0) {
      toast.error('El valor no puede ser negativo');
      return;
    }

    const establecimientoData = currentDatosVacuna.establecimientos[establecimientoIndex];

    if (!establecimientoData || !establecimientoData.establecimiento) {
      toast.error('Datos de establecimiento inválidos');
      return;
    }

    const nuevaDistribucion = [...establecimientoData.distribucionMensual];
    nuevaDistribucion[mesIndex] = valor;

    const nuevoTotal = nuevaDistribucion.reduce((sum: number, val: number) => sum + val, 0);

    try {
      if (establecimientoData.planificacionId) {
        await handleUpdatePlanificacion(establecimientoData.planificacionId, {
          distribucionMensual: nuevaDistribucion,
          metaAnual: nuevoTotal
        }, true); // skipReload: true - ya actualizamos el estado localmente
      } else {
        if (nuevoTotal > 0) {
          await handleCreatePlanificacion({
            establecimientoId: establecimientoData.establecimiento.id,
            vacunaId: currentSelectedVacuna,
            anio: selectedAnio,
            metaAnual: nuevoTotal,
            distribucionMensual: nuevaDistribucion,
            estado: 'borrador'
          });
        }
      }
    } catch (error: unknown) {
      console.error('Error al actualizar distribución:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar distribución';
      toast.error(errorMessage);
    }
  };

  const handleGuardarProgramacion = async () => {
    if (!datosVacuna || !selectedVacuna) {
      toast.error('No hay datos para guardar');
      return;
    }

    const establecimientosConDatos = datosVacuna.establecimientos.filter((estData: EstablecimientoData) => estData.total > 0);

    if (establecimientosConDatos.length === 0) {
      toast.error('No hay establecimientos con programación para guardar');
      return;
    }

    try {
      let exitosos = 0;
      let errores = 0;

      const promesas = datosVacuna.establecimientos.map(async (estData: EstablecimientoData) => {
        if (estData.total > 0) {
          try {
            if (estData.planificacionId) {
              await handleUpdatePlanificacion(estData.planificacionId, {
                distribucionMensual: estData.distribucionMensual,
                metaAnual: estData.total,
                estado: 'aprobado'
              });
            } else {
              await handleCreatePlanificacion({
                establecimientoId: estData.establecimiento.id,
                vacunaId: selectedVacuna,
                anio: selectedAnio,
                metaAnual: estData.total,
                distribucionMensual: estData.distribucionMensual,
                estado: 'aprobado'
              });
            }
            exitosos++;
          } catch (error) {
            console.error(`Error al guardar planificación para ${estData.establecimiento.nombre}:`, error);
            errores++;
          }
        }
      });

      await Promise.all(promesas.filter(Boolean));

      if (errores === 0) {
        toast.success(`Programación guardada exitosamente (${exitosos} establecimientos)`);
      } else if (exitosos > 0) {
        toast.warning(`Programación parcialmente guardada: ${exitosos} exitosos, ${errores} errores`);
      } else {
        toast.error('Error al guardar la programación');
      }
    } catch (error: unknown) {
      console.error('Error al guardar programación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar programación';
      toast.error(errorMessage);
    }
  };

  const handleSincronizarConMovimientos = async () => {
    if (!datosVacuna || !selectedVacuna) {
      toast.error('No hay datos de vacuna seleccionados');
      return;
    }

    try {
      let totalSincronizados = 0;
      let totalErrores = 0;

      for (const estData of datosVacuna.establecimientos) {
        if (estData.planificacionId) {
          try {
            const resultado = await PlanificacionService.sincronizarConMovimientos(estData.planificacionId);
            totalSincronizados += resultado.movimientosActualizados;

            if (resultado.errores.length > 0) {
              console.warn(`Errores en sincronización de ${estData.establecimiento.nombre}:`, resultado.errores);
              totalErrores += resultado.errores.length;
            }
          } catch (error) {
            console.error(`Error al sincronizar ${estData.establecimiento.nombre}:`, error);
            totalErrores++;
          }
        }
      }

      if (totalSincronizados > 0) {
        toast.success(`Sincronización completada - ${totalSincronizados} movimientos actualizados`);
      } else if (totalErrores > 0) {
        toast.warning(`Sincronización con errores - ${totalErrores} errores encontrados`);
      } else {
        toast.info('No se encontraron diferencias para sincronizar');
      }

      await loadPlanificacionesPorVacuna();
    } catch (error: unknown) {
      console.error('Error en sincronización:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al sincronizar con movimientos';
      toast.error(errorMessage);
    }
  };

  // Exportar
  const handleExportar = async () => {
    try {
      setIsExporting(true);

      if (!selectedVacuna) {
        toast.error('Seleccione una vacuna para exportar');
        return;
      }

      const config = PlanificacionExportService.crearConfiguracionDesdeFiltros(
        selectedAnio,
        selectedVacuna,
        selectedCentroAcopio,
        'Usuario del Sistema',
        `Reporte de planificación - ${vacunaSeleccionada?.nombre} - ${selectedAnio}`
      );

      await PlanificacionExportService.exportarYDescargarPorVacuna(
        selectedVacuna,
        config,
        vacunaSeleccionada?.nombre
      );

      toast.success(`Exportación de ${vacunaSeleccionada?.nombre} completada exitosamente`);
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar la programación');
    } finally {
      setIsExporting(false);
    }
  };

  // Handlers para importación
  const handleDescargarPlantillaVacuna = async (vacunaId: string, anio: number): Promise<boolean> => {
    try {
      const success = await descargarPlantillaVacuna(vacunaId, anio);
      if (success) {
        toast.success('Plantilla descargada exitosamente');
      } else {
        toast.error('Error al descargar plantilla');
      }
      return success;
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      toast.error('Error al descargar plantilla');
      return false;
    }
  };

  const handleDescargarPlantillaMasiva = async (anio: number): Promise<boolean> => {
    try {
      const success = await descargarPlantillaMasiva(anio);
      if (success) {
        toast.success('Plantilla masiva descargada exitosamente');
      } else {
        toast.error('Error al descargar plantilla masiva');
      }
      return success;
    } catch (error) {
      console.error('Error al descargar plantilla masiva:', error);
      toast.error('Error al descargar plantilla masiva');
      return false;
    }
  };

  const handleImportarDesdeExcelVacuna = async (
    vacunaId: string,
    anio: number,
    archivo: File
  ): Promise<{
    creadas: number;
    actualizadas: number;
    errores: string[];
  } | null> => {
    try {
      const resultado = await importarDesdeExcelVacuna(vacunaId, anio, archivo);
      if (resultado) {
        const { creadas, actualizadas, errores } = resultado;
        if (errores.length === 0) {
          toast.success(`Importación exitosa: ${creadas} creadas, ${actualizadas} actualizadas`);
        } else {
          toast.warning(`Importación con errores: ${creadas} creadas, ${actualizadas} actualizadas, ${errores.length} errores`);
        }
        await loadPlanificacionesPorVacuna();
      } else {
        toast.error('Error al importar desde Excel');
      }
      return resultado;
    } catch (error) {
      console.error('Error al importar desde Excel:', error);
      toast.error('Error al importar desde Excel');
      return null;
    }
  };

  const handleImportarDesdeExcelMasivo = async (
    anio: number,
    archivo: File
  ): Promise<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: { vacuna: string; errores: string[] }[];
    vacunasProcesadas: number;
  } | null> => {
    try {
      const resultado = await importarDesdeExcelMasivo(anio, archivo);
      if (resultado) {
        const { totalCreadas, totalActualizadas, erroresPorVacuna, vacunasProcesadas } = resultado;
        if (erroresPorVacuna.length === 0) {
          toast.success(`Importación masiva exitosa: ${totalCreadas} creadas, ${totalActualizadas} actualizadas en ${vacunasProcesadas} vacunas`);
        } else {
          toast.warning(`Importación masiva con errores: ${totalCreadas} creadas, ${totalActualizadas} actualizadas, ${erroresPorVacuna.length} vacunas con errores`);
        }
        await loadPlanificacionesPorVacuna();
      } else {
        toast.error('Error al importar masivamente desde Excel');
      }
      return resultado;
    } catch (error) {
      console.error('Error al importar masivamente desde Excel:', error);
      toast.error('Error al importar masivamente desde Excel');
      return null;
    }
  };

  const pendingChangesCount = Object.values(pendingChanges).filter(Boolean).length;
  const isContextLoading = isLoadingEstablecimientos || isLoadingVacunas;
  const isPageLoading = isLoading || isContextLoading;

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col bg-zinc-50">
      <div className="mx-auto flex w-full max-w-full flex-1 flex-col overflow-hidden p-2 sm:p-4 lg:p-6">
        <section className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white shadow-sm ring-1 ring-zinc-200/40">
          <div className="shrink-0">
            <PlanificacionHeader
              isReadOnly={isReadOnlyMode}
              hasOperativeEditPermission={isResponsableAcopio && hasPlanificacionEdicion}
              hideImportAction={!canImportPlanificacion}
              hideExportAction={!canExportPlanificacion}
              lockedCentroAcopioLabel={lockedCentroAcopioLabel}
              showReadOnlyCentroFilter={canFilterAssignedCentros}
              allCentrosLabel={allCentrosLabel}
              selectedAnio={selectedAnio}
              selectedCentroAcopio={selectedCentroAcopio}
              selectedVacuna={selectedVacuna}
              centrosAcopio={centrosAcopioFiltro as any}
              vacunas={vacunas}
              aniosDisponibles={aniosDisponibles}
              establecimientosCount={datosVacuna?.establecimientos.length || 0}
              totalGeneral={calcularTotalGeneral()}
              onAnioChange={setSelectedAnio}
              onCentroAcopioChange={setSelectedCentroAcopio}
              onVacunaChange={setSelectedVacuna}
              isLoading={isPageLoading}
              isLoadingAnios={isLoadingAnios}
              isUpdating={isUpdating}
              isImporting={isImporting}
              isExporting={isExporting}
              pendingChangesCount={pendingChangesCount}
              onRefresh={loadPlanificacionesPorVacuna}
              onImportar={() => {
                if (!canImportPlanificacion) {
                  return;
                }
                setShowModalImportar(true);
              }}
              onExportar={handleExportar}
              onGuardarPendientes={handleSaveAllPendingChanges}
            />
          </div>

          {error ? (
            <div className="shrink-0 border-b border-zinc-100 px-4 py-3">
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-rose-100 shadow-sm text-rose-600">
                  <Warning className="h-4 w-4" weight="bold" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black tracking-tight text-rose-900">Error en resolución de Sandbox</p>
                  <p className="mt-0.5 text-xs font-semibold text-rose-700">{error}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col gap-0 p-0">
            <div className="min-h-0 flex-1">
              <PlanificacionTabla
                readOnly={isReadOnlyMode}
                establecimientos={datosVacuna?.establecimientos || []}
                selectedCentroAcopio={selectedCentroAcopio}
                isLoading={isPageLoading}
                isUpdating={isUpdating}
                selectedRowId={selectedRowId}
                onRowSelect={setSelectedRowId}
                getCurrentValue={getCurrentValue}
                hasPendingChange={hasPendingChange}
                onTempValueChange={handleTempValueChange}
                onFieldBlur={handleFieldBlur}
                calcularTotalMes={calcularTotalMes}
                calcularTotalGeneral={calcularTotalGeneral}
                hasValeGenerado={(establecimientoId, mesIndex) =>
                  valesEstado.has(`${establecimientoId}-${mesIndex}`)
                }
              />
            </div>

            <div>
              <PlanificacionAcciones
                readOnly={isReadOnlyMode}
                hideAdminActions={!canUseAdminPlanificacionActions}
                isLoading={isPageLoading}
                isUpdating={isUpdating}
                pendingChangesCount={pendingChangesCount}
                hasData={!!datosVacuna && datosVacuna.establecimientos.length > 0}
                onGuardarProgramacion={handleGuardarProgramacion}
                onRecalcular={loadPlanificacionesPorVacuna}
                onSincronizar={handleSincronizarConMovimientos}
                onGuardarPendientes={handleSaveAllPendingChanges}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Modal Importar */}
      {canImportPlanificacion && (
        <ImportarModal
          isOpen={showModalImportar}
          onClose={() => setShowModalImportar(false)}
          vacunas={vacunas}
          onDescargarPlantillaVacuna={handleDescargarPlantillaVacuna}
          onDescargarPlantillaMasiva={handleDescargarPlantillaMasiva}
          onImportarVacuna={handleImportarDesdeExcelVacuna}
          onImportarMasivo={handleImportarDesdeExcelMasivo}
          isDownloadingTemplate={isDownloadingTemplate}
          isImportingExcel={isImportingExcel}
        />
      )}

      {/* Modal de Confirmación de Vale */}
      {!isReadOnlyMode && showConfirmacionValeModal && pendingValeModification && (
        <ConfirmacionValeModal
          isOpen={showConfirmacionValeModal}
          onClose={() => !isProcessingValeChange && handleCancelValeModification()}
          onConfirm={handleConfirmValeModification}
          onCancel={handleCancelValeModification}
          establecimientoNombre={pendingValeModification.establecimientoNombre}
          vacunaNombre={vacunaSeleccionada?.nombre || 'Vacuna'}
          mesNombre={MESES[pendingValeModification.mesIndex]}
          anio={selectedAnio}
          valorOriginal={pendingValeModification.valorOriginal}
          valorNuevo={pendingValeModification.valorNuevo}
          isProcessing={isProcessingValeChange}
        />
      )}
    </main>
  );
};

export default Planificacion;
