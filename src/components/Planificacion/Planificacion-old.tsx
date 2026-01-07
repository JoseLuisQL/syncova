import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Calendar,
  Upload,
  Download,
  FileSpreadsheet,
  Settings,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Calculator,
  Eye,
  Filter,
  Search,
  Loader2,
  FolderOpen,
  Database,
  Info,
  Package,
  Building2,
  Clock,
  Wrench,
  TrendingUp
} from 'lucide-react';
import './enhanced-planning-table.css';
import {
  Establecimiento,
  Vacuna,
  PlanificacionAnual,
  PlanificacionConRelaciones,
  CreatePlanificacionDto,
  UpdatePlanificacionDto,
  CentroAcopio
} from '../../types';
import {
  ordenarEstablecimientos,
  getEstiloEstablecimiento,
  getColoresEstablecimiento,
  getIconoTipoEstablecimiento,
  getCentroAcopioPorNombre
} from '../../utils/centroAcopioUtils';
import { PlanificacionExportService } from '../../services/planificacionExportService';
import { usePlanificacion } from '../../hooks/usePlanificacion';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import ImportarModal from './ImportarModal';
import { PlanificacionService } from '../../services/planificacionService';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';

// Configuración de secciones organizadas jerárquicamente
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'planificacion' | 'importacion' | 'analisis';
  description?: string;
}

const PLANNING_SECTIONS: SectionConfig[] = [
  // Sección Planificación
  { 
    id: 'programacion', 
    label: 'Programación por Vacuna', 
    icon: Package, 
    path: '/planificacion/programacion', 
    category: 'planificacion',
    description: 'Gestión anual de metas por vacuna'
  },
  { 
    id: 'distribucion', 
    label: 'Distribución Automática', 
    icon: Calculator, 
    path: '/planificacion/distribucion', 
    category: 'planificacion',
    description: 'Criterios inteligentes de distribución'
  },
  
  // Sección Importación
  { 
    id: 'importar', 
    label: 'Importar Programación', 
    icon: Upload, 
    path: '/planificacion/importar', 
    category: 'importacion',
    description: 'Carga masiva desde Excel'
  },
  
  // Sección Análisis
  { 
    id: 'reportes', 
    label: 'Reportes y Análisis', 
    icon: BarChart3, 
    path: '/planificacion/reportes', 
    category: 'analisis',
    description: 'Análisis estadístico y reportes'
  }
];

const CATEGORY_CONFIG = {
  planificacion: { label: 'Planificación', icon: FolderOpen, color: 'blue' },
  importacion: { label: 'Importación', icon: Database, color: 'emerald' },
  analisis: { label: 'Análisis', icon: BarChart3, color: 'purple' }
};

const Planificacion: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule } = useCurrentRoute();
  const [selectedAnio, setSelectedAnio] = useState<number>(2025);
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>('todos');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [planificacionesPorVacuna, setPlanificacionesPorVacuna] = useState<PlanificacionConRelaciones[]>([]);

  // Estado para manejar valores temporales durante la edición
  const [tempValues, setTempValues] = useState<{[key: string]: number}>({});
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  const debounceTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({});

  const { toast } = useToastContext();

  // Hooks para gestión de datos
  const {
    planificaciones,
    stats,
    isLoading,
    isLoadingStats,
    error,
    createPlanificacion,
    updatePlanificacion,
    deletePlanificacion,
    loadByVacunaAndYear,
    importarPlanificaciones,
    generarDistribucionAutomatica,
    descargarPlantillaVacuna,
    descargarPlantillaMasiva,
    importarDesdeExcelVacuna,
    importarDesdeExcelMasivo,
    isCreating,
    isUpdating,
    isDeleting,
    isImporting,
    isGeneratingDistribution,
    isDownloadingTemplate,
    isImportingExcel,
    createError,
    updateError,
    deleteError,
    importError,
    distributionError,
    templateError,
    importExcelError,
    refresh
  } = usePlanificacion();

  const {
    establecimientos,
    centrosAcopio,
    loadEstablecimientos,
    loadCentrosAcopio,
    isLoading: isLoadingEstablecimientos
  } = useEstablecimientos({ limit: 1000 }); // Cargar hasta 1000 establecimientos para planificaciones
  const { vacunas, loadVacunasActivas, isLoading: isLoadingVacunas } = useVacunas();

  // Agrupar secciones por categoría
  const sectionsByCategory = PLANNING_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  // Obtener establecimientos según el filtro seleccionado con ordenamiento profesional
  const getEstablecimientosFiltrados = () => {
    let filtrados: Establecimiento[];

    if (selectedCentroAcopio === 'todos') {
      // Retornar todos los establecimientos que no sean centros de acopio
      filtrados = establecimientos.filter(e => e.tipo !== 'centro_acopio');
    } else {
      // Retornar solo los establecimientos del centro de acopio seleccionado
      filtrados = establecimientos.filter(e => e.centroAcopioId === selectedCentroAcopio);
    }

    // Aplicar ordenamiento profesional por centro de acopio
    return ordenarEstablecimientos(filtrados);
  };

  const establecimientosFiltrados = getEstablecimientosFiltrados();



  // Cargar datos iniciales
  useEffect(() => {
    // Cargar establecimientos con límite alto para planificaciones
    loadEstablecimientos({ limit: 1000 });
    loadCentrosAcopio();
    loadVacunasActivas();
  }, []);

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Cargar planificaciones cuando cambie la vacuna, año o centro de acopio
  useEffect(() => {
    if (selectedVacuna && selectedAnio) {
      loadPlanificacionesPorVacuna();
    }
  }, [selectedVacuna, selectedAnio, selectedCentroAcopio]);

  // Seleccionar primera vacuna cuando se carguen las vacunas
  useEffect(() => {
    if (vacunas.length > 0 && !selectedVacuna) {
      setSelectedVacuna(vacunas[0].id);
    }
  }, [vacunas, selectedVacuna]);

  // Cargar planificaciones por vacuna y año
  const loadPlanificacionesPorVacuna = async () => {
    if (!selectedVacuna || !selectedAnio) return;

    try {
      const planificaciones = await loadByVacunaAndYear(
        selectedVacuna,
        selectedAnio,
        selectedCentroAcopio !== 'todos' ? selectedCentroAcopio : undefined
      );
      setPlanificacionesPorVacuna(planificaciones);
      // Limpiar valores temporales cuando se cargan nuevos datos
      setTempValues({});
      setPendingChanges({});
    } catch (error) {
      console.error('Error al cargar planificaciones:', error);
      toast.error('Error al cargar planificaciones');
    }
  };

  // Función para generar clave única para cada campo
  const getFieldKey = (estIndex: number, mesIndex: number) => {
    return `${estIndex}-${mesIndex}`;
  };

  // Función para obtener el valor actual (temporal o real)
  const getCurrentValue = (estIndex: number, mesIndex: number, originalValue: number) => {
    const key = getFieldKey(estIndex, mesIndex);
    return tempValues[key] !== undefined ? tempValues[key] : originalValue;
  };

  // Función para verificar si hay cambios pendientes
  const hasPendingChange = (estIndex: number, mesIndex: number) => {
    const key = getFieldKey(estIndex, mesIndex);
    return pendingChanges[key] || false;
  };

  // Función para manejar cambios temporales (onChange)
  const handleTempValueChange = (estIndex: number, mesIndex: number, newValue: number) => {
    const key = getFieldKey(estIndex, mesIndex);

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
      handleSaveFieldValue(estIndex, mesIndex, newValue);
    }, 2000);
  };

  // Función para guardar un campo específico
  const handleSaveFieldValue = async (estIndex: number, mesIndex: number, value: number) => {
    const key = getFieldKey(estIndex, mesIndex);

    try {
      // Limpiar timeout si existe
      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
        delete debounceTimeouts.current[key];
      }

      // Actualizar en el backend
      await handleActualizarDistribucion(estIndex, mesIndex, value);

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

    } catch (error) {
      console.error('Error al guardar campo:', error);
      // En caso de error, mantener el valor temporal para que el usuario pueda intentar de nuevo
    }
  };

  // Función para manejar cuando el usuario sale del campo (onBlur)
  const handleFieldBlur = (estIndex: number, mesIndex: number) => {
    const key = getFieldKey(estIndex, mesIndex);
    const tempValue = tempValues[key];

    if (tempValue !== undefined && pendingChanges[key]) {
      handleSaveFieldValue(estIndex, mesIndex, tempValue);
    }
  };

  // Función para guardar todos los cambios pendientes
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

  // Funciones para manejar las operaciones CRUD
  const handleCreatePlanificacion = async (data: CreatePlanificacionDto) => {
    try {
      // Validaciones adicionales en el frontend
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
      await loadPlanificacionesPorVacuna();
    } catch (error: any) {
      console.error('Error al crear planificación:', error);
      const errorMessage = error?.message || 'Error al crear planificación';
      toast.error(errorMessage);
    }
  };

  const handleUpdatePlanificacion = async (id: string, data: UpdatePlanificacionDto) => {
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
      toast.success('Planificación actualizada exitosamente');
      await loadPlanificacionesPorVacuna();
    } catch (error: any) {
      console.error('Error al actualizar planificación:', error);
      const errorMessage = error?.message || 'Error al actualizar planificación';
      toast.error(errorMessage);
    }
  };

  const handleDeletePlanificacion = async (id: string) => {
    try {
      if (!id) {
        toast.error('ID de planificación requerido');
        return;
      }

      // Confirmar eliminación
      if (!window.confirm('¿Está seguro de que desea eliminar esta planificación?')) {
        return;
      }

      await deletePlanificacion(id);
      toast.success('Planificación eliminada exitosamente');
      await loadPlanificacionesPorVacuna();
    } catch (error: any) {
      console.error('Error al eliminar planificación:', error);
      const errorMessage = error?.message || 'Error al eliminar planificación';
      toast.error(errorMessage);
    }
  };

  // Constantes
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const mesesCortos = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  // Obtener vacuna seleccionada
  const vacunaSeleccionada = vacunas.find(v => v.id === selectedVacuna);

  // Crear estructura de datos compatible con el componente existente
  const datosVacuna = vacunaSeleccionada ? {
    vacuna: vacunaSeleccionada,
    establecimientos: establecimientosFiltrados.map(establecimiento => {
      // Buscar planificación existente para este establecimiento
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
  } : null;

  const handleImportarPorVacuna = () => {
    setShowModalImportar(true);
  };

  const handleExportarExcel = () => {
    const centroTexto = selectedCentroAcopio === 'todos' ? 'Todos los Acopios' : centrosAcopio.find(c => c.id === selectedCentroAcopio)?.nombre;
    toast.info(`Exportando programación de ${vacunaSeleccionada?.nombre} - ${centroTexto} a Excel...`);
    // TODO: Implementar exportación real
  };

  // Handlers para las nuevas funcionalidades de importación
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
      console.error('Error al descargar plantilla de vacuna:', error);
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
        // Recargar datos
        await loadPlanificacionesPorVacuna();
      } else {
        toast.error('Error al importar desde Excel');
      }
      return resultado;
    } catch (error) {
      console.error('Error al importar desde Excel por vacuna:', error);
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
        // Recargar datos
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

  const handleActualizarDistribucion = async (establecimientoIndex: number, mesIndex: number, valor: number) => {
    // Validaciones básicas
    if (!datosVacuna || !selectedVacuna) {
      toast.error('No hay datos de vacuna seleccionados');
      return;
    }

    if (establecimientoIndex < 0 || establecimientoIndex >= datosVacuna.establecimientos.length) {
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

    const establecimientoData = datosVacuna.establecimientos[establecimientoIndex];

    if (!establecimientoData || !establecimientoData.establecimiento) {
      toast.error('Datos de establecimiento inválidos');
      return;
    }

    const nuevaDistribucion = [...establecimientoData.distribucionMensual];
    nuevaDistribucion[mesIndex] = valor;

    const nuevoTotal = nuevaDistribucion.reduce((sum: number, val: number) => sum + val, 0);

    try {
      if (establecimientoData.planificacionId) {
        // Actualizar planificación existente
        await handleUpdatePlanificacion(establecimientoData.planificacionId, {
          distribucionMensual: nuevaDistribucion,
          metaAnual: nuevoTotal
        });
      } else {
        // Crear nueva planificación solo si hay valores > 0
        if (nuevoTotal > 0) {
          await handleCreatePlanificacion({
            establecimientoId: establecimientoData.establecimiento.id,
            vacunaId: selectedVacuna,
            anio: selectedAnio,
            metaAnual: nuevoTotal,
            distribucionMensual: nuevaDistribucion,
            estado: 'borrador'
          });
        }
      }
    } catch (error: any) {
      console.error('Error al actualizar distribución:', error);
      const errorMessage = error?.message || 'Error al actualizar distribución';
      toast.error(errorMessage);
    }
  };

  // Función para guardar toda la programación
  const handleGuardarProgramacion = async () => {
    if (!datosVacuna || !selectedVacuna) {
      toast.error('No hay datos para guardar');
      return;
    }

    if (!vacunaSeleccionada) {
      toast.error('Vacuna no encontrada');
      return;
    }

    // Validar que hay al menos una planificación con datos
    const establecimientosConDatos = datosVacuna.establecimientos.filter((estData: any) => estData.total > 0);

    if (establecimientosConDatos.length === 0) {
      toast.error('No hay establecimientos con programación para guardar');
      return;
    }

    try {
      let exitosos = 0;
      let errores = 0;

      const promesas = datosVacuna.establecimientos.map(async (estData: any) => {
        if (estData.total > 0) {
          try {
            if (estData.planificacionId) {
              // Actualizar existente
              await handleUpdatePlanificacion(estData.planificacionId, {
                distribucionMensual: estData.distribucionMensual,
                metaAnual: estData.total,
                estado: 'aprobado'
              });
            } else {
              // Crear nueva
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
    } catch (error: any) {
      console.error('Error al guardar programación:', error);
      const errorMessage = error?.message || 'Error al guardar programación';
      toast.error(errorMessage);
    }
  };

  const calcularTotalMes = (mesIndex: number) => {
    if (!datosVacuna) return 0;
    return datosVacuna.establecimientos.reduce((sum: number, est: any) =>
      sum + est.distribucionMensual[mesIndex], 0
    );
  };

  const calcularTotalGeneral = () => {
    if (!datosVacuna) return 0;
    return datosVacuna.establecimientos.reduce((sum: number, est: any) => sum + est.total, 0);
  };

  const getCentroAcopioTexto = () => {
    if (selectedCentroAcopio === 'todos') {
      return 'TODOS LOS CENTROS DE ACOPIO';
    }
    const centro = centrosAcopio.find(c => c.id === selectedCentroAcopio);
    return centro?.nombre.toUpperCase() || '';
  };

  // Función para sincronizar planificación con movimientos
  const handleSincronizarConMovimientos = async () => {
    if (!datosVacuna || !selectedVacuna) {
      toast.error('No hay datos de vacuna seleccionados');
      return;
    }

    try {
      let totalSincronizados = 0;
      let totalErrores = 0;

      // Sincronizar cada establecimiento que tenga planificación
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
        toast.success(`✅ Sincronización completada • ${totalSincronizados} movimientos actualizados`);
      } else if (totalErrores > 0) {
        toast.warning(`⚠️ Sincronización con errores • ${totalErrores} errores encontrados`);
      } else {
        toast.info('ℹ️ No se encontraron diferencias para sincronizar');
      }

      // Recargar datos para mostrar cambios
      await loadPlanificacionesPorVacuna();
    } catch (error: any) {
      console.error('Error en sincronización:', error);
      const errorMessage = error?.message || 'Error al sincronizar con movimientos';
      toast.error(`❌ Error en sincronización • ${errorMessage}`);
    }
  };

  // Mostrar loading si los datos están cargando
  if (isLoadingEstablecimientos || isLoadingVacunas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando datos...</span>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Error al cargar datos: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planificación</h1>
                <p className="text-gray-600">Gestión integral de programación de vacunas</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleImportarPorVacuna}
                disabled={isImporting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:from-emerald-400 disabled:to-emerald-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              >
                {isImporting ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 mr-2" />
                )}
                Importar Avanzado
              </button>
              <button
                onClick={refresh}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2" />
                )}
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(sectionsByCategory).map(([categoryKey, sections]) => {
              const category = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
              const CategoryIcon = category.icon;
              
              return (
                <div key={categoryKey} className="relative group">
                  {/* Category Header */}
                  <div className={`flex items-center justify-center py-4 border-b-4 border-${category.color}-500 bg-${category.color}-50`}>
                    <CategoryIcon className={`h-5 w-5 text-${category.color}-600 mr-2`} />
                    <span className={`font-semibold text-${category.color}-800`}>{category.label}</span>
                  </div>
                  
                  {/* Section Buttons */}
                  <div className="bg-white">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = currentSubModule === section.id || (!currentSubModule && section.id === 'programacion');
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => navigateToModule('planificacion', section.id)}
                          className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            isActive ? `bg-${category.color}-50 border-l-4 border-l-${category.color}-500` : ''
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${isActive ? `text-${category.color}-600` : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${isActive ? `text-${category.color}-800` : 'text-gray-900'}`}>
                              {section.label}
                            </div>
                            {section.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {section.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area Premium */}
      <div className="max-w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="programacion" replace />} />
            <Route
              path="programacion"
              element={
                <ProgramacionPorVacunaTab
                  selectedAnio={selectedAnio}
                  setSelectedAnio={setSelectedAnio}
                  selectedCentroAcopio={selectedCentroAcopio}
                  setSelectedCentroAcopio={setSelectedCentroAcopio}
                  selectedVacuna={selectedVacuna}
                  setSelectedVacuna={setSelectedVacuna}
                  centrosAcopio={centrosAcopio}
                  vacunas={vacunas}
                  datosVacuna={datosVacuna}
                  mesesCortos={mesesCortos}
                  handleActualizarDistribucion={handleActualizarDistribucion}
                  calcularTotalMes={calcularTotalMes}
                  calcularTotalGeneral={calcularTotalGeneral}
                  getCentroAcopioTexto={getCentroAcopioTexto}
                  isLoading={isLoading}
                  isUpdating={isUpdating}
                  establecimientos={establecimientos}
                  handleGuardarProgramacion={handleGuardarProgramacion}
                  loadPlanificacionesPorVacuna={loadPlanificacionesPorVacuna}
                  getCurrentValue={getCurrentValue}
                  hasPendingChange={hasPendingChange}
                  handleTempValueChange={handleTempValueChange}
                  handleFieldBlur={handleFieldBlur}
                  handleSaveAllPendingChanges={handleSaveAllPendingChanges}
                  pendingChanges={pendingChanges}
                  handleSincronizarConMovimientos={handleSincronizarConMovimientos}
                />
              }
            />
            <Route
              path="importar"
              element={<ImportarPorVacunaTab onImportar={handleImportarPorVacuna} />}
            />
            <Route
              path="distribucion"
              element={
                <DistribucionAutomaticaTab
                  vacunas={vacunas}
                  onGenerar={generarDistribucionAutomatica}
                  isGenerating={isGeneratingDistribution}
                />
              }
            />
            <Route
              path="reportes"
              element={
                <ReportesTab
                  selectedAnio={selectedAnio}
                  selectedVacuna={selectedVacuna}
                  selectedCentroAcopio={selectedCentroAcopio}
                  vacunas={vacunas}
                  centrosAcopio={centrosAcopio}
                  stats={stats}
                  isLoadingStats={isLoadingStats}
                />
              }
            />
          </Routes>
        </div>
      </div>

      {/* Modal Importar Avanzado */}
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
    </div>
  );
};

// Tab de Programación por Vacuna (Principal)
interface ProgramacionPorVacunaTabProps {
  selectedAnio: number;
  setSelectedAnio: (anio: number) => void;
  selectedCentroAcopio: string;
  setSelectedCentroAcopio: (id: string) => void;
  selectedVacuna: string;
  setSelectedVacuna: (id: string) => void;
  centrosAcopio: CentroAcopio[];
  vacunas: Vacuna[];
  datosVacuna: any;
  mesesCortos: string[];
  handleActualizarDistribucion: (estIndex: number, mesIndex: number, valor: number) => void;
  calcularTotalMes: (mesIndex: number) => number;
  calcularTotalGeneral: () => number;
  getCentroAcopioTexto: () => string;
  isLoading: boolean;
  isUpdating: boolean;
  establecimientos: Establecimiento[];
  handleGuardarProgramacion: () => void;
  loadPlanificacionesPorVacuna: () => void;
  // Funciones para el nuevo sistema de edición
  getCurrentValue: (estIndex: number, mesIndex: number, originalValue: number) => number;
  hasPendingChange: (estIndex: number, mesIndex: number) => boolean;
  handleTempValueChange: (estIndex: number, mesIndex: number, newValue: number) => void;
  handleFieldBlur: (estIndex: number, mesIndex: number) => void;
  handleSaveAllPendingChanges: () => void;
  pendingChanges: {[key: string]: boolean};
  handleSincronizarConMovimientos: () => void;
}

const ProgramacionPorVacunaTab: React.FC<ProgramacionPorVacunaTabProps> = ({
  selectedAnio,
  setSelectedAnio,
  selectedCentroAcopio,
  setSelectedCentroAcopio,
  selectedVacuna,
  setSelectedVacuna,
  centrosAcopio,
  vacunas,
  datosVacuna,
  mesesCortos,
  handleActualizarDistribucion,
  calcularTotalMes,
  calcularTotalGeneral,
  getCentroAcopioTexto,
  isLoading,
  isUpdating,
  establecimientos,
  handleGuardarProgramacion,
  loadPlanificacionesPorVacuna,
  getCurrentValue,
  hasPendingChange,
  handleTempValueChange,
  handleFieldBlur,
  handleSaveAllPendingChanges,
  pendingChanges,
  handleSincronizarConMovimientos,
}) => {
  const vacunaSeleccionada = vacunas.find(v => v.id === selectedVacuna);

  return (
    <div className="space-y-6 p-6">
      {/* Filters Premium */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          Filtros de Programación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Centro de Acopio</label>
            <select
              value={selectedCentroAcopio}
              onChange={(e) => setSelectedCentroAcopio(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all hover:border-blue-400"
            >
              <option value="todos">🌐 Todos los Centros de Acopio</option>
              {centrosAcopio.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  🏢 {centro.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Vacuna</label>
            <select
              value={selectedVacuna}
              onChange={(e) => setSelectedVacuna(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all hover:border-blue-400"
            >
              {vacunas.map((vacuna) => (
                <option key={vacuna.id} value={vacuna.id}>
                  💉 {vacuna.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Año</label>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all hover:border-blue-400"
            >
              <option value={2025}>📅 2025</option>
              <option value={2026}>📅 2026</option>
              <option value={2024}>📅 2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Header de la Programación - Simplificado */}
      {vacunaSeleccionada && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {vacunaSeleccionada.nombre} - {selectedAnio}
                </h3>
                <p className="text-blue-100 text-sm">
                  {getCentroAcopioTexto()} • {datosVacuna?.establecimientos.length || 0} establecimientos
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{calcularTotalGeneral().toLocaleString()}</div>
              <div className="text-blue-100 text-sm">Total Programado</div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {!datosVacuna && !isLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mb-4" />
            <h3 className="text-lg font-medium text-yellow-800 mb-2">No hay datos para mostrar</h3>
            <p className="text-yellow-700 mb-4">
              {!selectedVacuna
                ? 'Seleccione una vacuna para ver la programación'
                : 'No se encontraron datos de programación para los filtros seleccionados'
              }
            </p>
            {selectedVacuna && (
              <button
                onClick={loadPlanificacionesPorVacuna}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Recargar datos
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabla de Programación Premium con Scroll Profesional */}
      {datosVacuna && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xl">
          {/* Contenedor de tabla con scroll profesional */}
          <div className="relative">
            {/* Cabecera fija */}
            <div className="planning-sticky-header">
              <div className="overflow-x-auto">
                <table className="planning-professional-table-layout" role="table" aria-label="Cabecera de Programación de Vacunas">
                  <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <tr>
                      <th className="planning-col-establecimiento px-6 py-4 text-left text-sm font-bold uppercase tracking-wider border-r border-slate-700">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          Establecimiento
                        </div>
                      </th>
                      {mesesCortos.map((mes, index) => (
                        <th key={index} className="planning-col-mes px-3 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-slate-700">
                          {mes}
                        </th>
                      ))}
                      <th className="planning-col-total px-6 py-4 text-center text-sm font-bold uppercase tracking-wider bg-slate-900">
                        <div className="flex items-center justify-center">
                          <Calculator className="h-4 w-4 mr-2" />
                          TOTAL
                        </div>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>

            {/* Fila de totales fija */}
            <div className="planning-sticky-totals">
              <div className="overflow-x-auto">
                <table className="planning-professional-table-layout">
                  <tbody>
                    <tr className="planning-totals-row bg-gradient-to-r from-emerald-100 to-green-100 font-bold border-b-2 border-emerald-300">
                      <td className="planning-col-establecimiento px-6 py-4 text-sm font-bold text-emerald-900 border-r border-emerald-200">
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 text-emerald-700" />
                          TOTAL DISA
                        </div>
                      </td>
                      {mesesCortos.map((_, mesIndex) => (
                        <td key={mesIndex} className="planning-col-mes px-3 py-4 text-center text-sm font-bold text-emerald-900 border-r border-emerald-200">
                          <div className="bg-white rounded-lg px-2 py-1 shadow-sm">
                            {calcularTotalMes(mesIndex).toLocaleString()}
                          </div>
                        </td>
                      ))}
                      <td className="planning-col-total px-6 py-4 text-center text-sm font-bold text-emerald-900 bg-gradient-to-r from-emerald-200 to-green-200">
                        <div className="bg-white rounded-lg px-3 py-2 shadow-md text-lg">
                          {calcularTotalGeneral().toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="max-h-[calc(100vh-450px)] min-h-[400px] planning-scroll-container planning-scrollbar-thin">
              <table className="planning-professional-table-layout bg-white" role="table" aria-label="Datos de Programación de Vacunas">
                <tbody>
                  {/* Filas de establecimientos con diseño premium */}
                  {datosVacuna?.establecimientos.map((estData: any, estIndex: number) => {
                    // Obtener estilo profesional basado en centro de acopio
                    const estiloEstablecimiento = getEstiloEstablecimiento(estData.establecimiento);
                    const { colores, icono, centro } = estiloEstablecimiento;

                    return (
                      <tr key={estIndex} className={`${estIndex === 0 ? 'planning-first-establishment-row' : ''} ${colores.bg} hover:bg-slate-50 border-b border-gray-100 transition-colors duration-200`}>
                        <td className={`planning-col-establecimiento px-6 py-4 text-sm font-medium ${colores.text} border-r border-gray-100`}>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${colores.bg} ${colores.border} border`}>
                              <span className="text-lg">{icono}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate">
                                {estData.establecimiento.nombre}
                              </div>
                              {selectedCentroAcopio === 'todos' && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colores.bg} ${colores.text} border ${colores.border}`}>
                                    {centro !== 'DEFAULT' ? centro : 'Regional'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {estData.distribucionMensual.map((valor: number, mesIndex: number) => {
                          const currentValue = getCurrentValue(estIndex, mesIndex, valor);
                          const isPending = hasPendingChange(estIndex, mesIndex);

                          return (
                            <td key={mesIndex} className="planning-col-mes px-3 py-4 text-center border-r border-gray-100 relative">
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  value={currentValue}
                                  onChange={(e) => handleTempValueChange(estIndex, mesIndex, parseInt(e.target.value) || 0)}
                                  onBlur={() => handleFieldBlur(estIndex, mesIndex)}
                                  disabled={isUpdating}
                                  className={`planning-enhanced-input w-16 px-2 py-2 text-center text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                                    isPending
                                      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                                      : 'border-gray-300 hover:border-blue-400'
                                  }`}
                                  title={isPending ? 'Cambios pendientes - Se guardará automáticamente' : ''}
                                />
                                {isPending && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-sm"
                                       title="Cambios pendientes">
                                    <div className="w-full h-full bg-amber-400 rounded-full animate-ping"></div>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="planning-col-total px-6 py-4 text-center text-sm font-bold bg-gradient-to-r from-slate-100 to-gray-100 border-l-2 border-slate-300">
                          <div className="bg-white rounded-lg px-3 py-2 shadow-sm font-bold text-gray-900">
                            {estData.total.toLocaleString()}
                          </div>
                        </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* Acciones Premium */}
      {datosVacuna && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGuardarProgramacion}
                disabled={isUpdating || isLoading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:from-emerald-400 disabled:to-green-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isUpdating ? 'Guardando...' : 'Guardar Programación'}
              </button>
              <button
                onClick={loadPlanificacionesPorVacuna}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Cargando...' : 'Recalcular'}
              </button>
              <button
                onClick={handleSincronizarConMovimientos}
                disabled={isLoading || isUpdating || !datosVacuna}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 disabled:from-purple-400 disabled:to-violet-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                title="Sincronizar entregas con módulo de movimientos"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2" />
                )}
                Sincronizar
              </button>
              {Object.keys(pendingChanges).length > 0 && (
                <button
                  onClick={handleSaveAllPendingChanges}
                  disabled={isUpdating}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 disabled:from-amber-400 disabled:to-yellow-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Guardar Pendientes ({Object.keys(pendingChanges).length})
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600 min-w-0">
              {Object.keys(pendingChanges).length > 0 ? (
                <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse mr-2"></div>
                  <span className="font-medium">{Object.keys(pendingChanges).length} cambio(s) pendiente(s)</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Todo guardado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leyenda Simplificada */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-gray-700"><strong>Campos editándose:</strong> Auto-guardado en 2s</span>
          </div>
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 text-emerald-600 mr-2" />
            <span className="text-gray-700"><strong>Total DISA:</strong> Suma consolidada</span>
          </div>
          <div className="flex items-center">
            <Building2 className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-gray-700"><strong>Establecimientos:</strong> Por centro de acopio</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab de Importar por Vacuna
const ImportarPorVacunaTab: React.FC<{ onImportar: () => void }> = ({ onImportar }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Importar Programación de Vacunas</h3>
          <p className="text-gray-600 mb-6">
            Importe programación anual desde archivos Excel de manera profesional y eficiente
          </p>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Importación por Vacuna */}
              <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="text-center">
                  <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Por Vacuna Específica</h4>
                  <p className="text-gray-600 mb-4">
                    Importe programación para una vacuna en particular con plantilla personalizada
                  </p>
                  <button
                    onClick={onImportar}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Importar por Vacuna
                  </button>
                </div>
              </div>

              {/* Importación Masiva */}
              <div className="border border-gray-200 rounded-lg p-6 hover:border-green-300 hover:shadow-md transition-all">
                <div className="text-center">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Importación Masiva</h4>
                  <p className="text-gray-600 mb-4">
                    Importe todas las vacunas desde un archivo con múltiples hojas
                  </p>
                  <button
                    onClick={onImportar}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Importar Masivamente
                  </button>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Plantillas Profesionales
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Diseño empresarial moderno</li>
                  <li>• Formato Excel optimizado</li>
                  <li>• Fórmulas automáticas</li>
                  <li>• Validación de datos</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validaciones Inteligentes
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Verificación de establecimientos</li>
                  <li>• Validación de números</li>
                  <li>• Detección de errores</li>
                  <li>• Reportes detallados</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Procesamiento Avanzado
                </h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Importación por lotes</li>
                  <li>• Actualización automática</li>
                  <li>• Manejo de conflictos</li>
                  <li>• Historial de cambios</li>
                </ul>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Instrucciones de Uso
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h5 className="font-medium mb-2">📋 Pasos para Importar:</h5>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Seleccione el tipo de importación</li>
                    <li>Configure vacuna y año (si aplica)</li>
                    <li>Descargue la plantilla Excel</li>
                    <li>Complete los datos en la plantilla</li>
                    <li>Suba el archivo y procese</li>
                  </ol>
                </div>
                <div>
                  <h5 className="font-medium mb-2">⚠️ Consideraciones:</h5>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Use solo plantillas oficiales</li>
                    <li>No modifique la estructura</li>
                    <li>Verifique códigos de establecimientos</li>
                    <li>Revise totales antes de importar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab de Distribución Automática
const DistribucionAutomaticaTab: React.FC = () => {
  const criterios = [
    { id: 'uniforme', nombre: 'Distribución Uniforme', descripcion: 'Divide la meta anual en 12 partes iguales', icono: '📊' },
    { id: 'estacional', nombre: 'Distribución Estacional', descripcion: 'Mayor cantidad en meses de campaña (Mar-May, Sep-Nov)', icono: '🌱' },
    { id: 'poblacional', nombre: 'Basado en Población', descripcion: 'Según densidad poblacional y nacimientos esperados', icono: '👥' },
    { id: 'historico', nombre: 'Histórico', descripcion: 'Basado en consumo histórico de años anteriores', icono: '📈' },
    { id: 'personalizado', nombre: 'Personalizado', descripcion: 'Definir manualmente cada mes según criterios específicos', icono: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Estado en Desarrollo */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-100 p-3 rounded-xl">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900">Funcionalidad en Desarrollo</h3>
              <p className="text-amber-700 mt-1">
                La Distribución Automática está siendo desarrollada y estará disponible próximamente
              </p>
            </div>
          </div>
          <div className="bg-amber-100 px-4 py-2 rounded-full">
            <span className="text-amber-800 font-semibold text-sm">🚧 Próximamente</span>
          </div>
        </div>
        <div className="mt-4 bg-white/60 rounded-lg p-4 border border-amber-200">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-2">Características que estarán disponibles:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Algoritmos inteligentes de distribución automática</li>
                <li>Criterios basados en datos históricos y poblacionales</li>
                <li>Configuración avanzada de parámetros de distribución</li>
                <li>Validación automática de coherencia en las distribuciones</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 opacity-75">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-blue-600" />
          Distribución Automática Inteligente
          <span className="ml-3 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
            Vista Previa
          </span>
        </h3>
        <p className="text-gray-600 mb-6">
          Utilice criterios avanzados para distribuir automáticamente las metas anuales en cantidades mensuales por vacuna
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {criterios.map((criterio) => (
            <div key={criterio.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-60 cursor-not-allowed">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-500">{criterio.nombre}</h4>
                <span className="text-2xl opacity-50">{criterio.icono}</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">{criterio.descripcion}</p>
              <button
                disabled
                className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm"
              >
                En Desarrollo
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6 opacity-60">
          <h4 className="font-medium text-gray-500 mb-3 flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            Configuración Avanzada
            <span className="ml-2 bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">
              Próximamente
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Vacuna a Distribuir
              </label>
              <select disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
                <option>BCG</option>
                <option>Pentavalente</option>
                <option>HVB Pediátrico</option>
                <option>Neumococo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Factor de Estacionalidad
              </label>
              <select disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
                <option>Estándar (1.0)</option>
                <option>Alto (1.5)</option>
                <option>Muy Alto (2.0)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Reserva de Seguridad
              </label>
              <select disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed">
                <option>5%</option>
                <option>10%</option>
                <option>15%</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab de Reportes
interface ReportesTabProps {
  selectedAnio: number;
  selectedVacuna: string;
  selectedCentroAcopio: string;
  vacunas: Vacuna[];
  centrosAcopio: CentroAcopio[];
  stats: any;
  isLoadingStats: boolean;
}

const ReportesTab: React.FC<ReportesTabProps> = ({
  selectedAnio,
  selectedVacuna,
  selectedCentroAcopio,
  vacunas,
  centrosAcopio,
  stats,
  isLoadingStats
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportAnio, setExportAnio] = useState(selectedAnio);
  const [exportVacuna, setExportVacuna] = useState('todos');
  const [exportCentroAcopio, setExportCentroAcopio] = useState(selectedCentroAcopio);
  const { toast } = useToastContext();

  // Inicializar filtros al cargar el componente
  useEffect(() => {
    setExportAnio(selectedAnio);
    setExportVacuna('todos');
    setExportCentroAcopio(selectedCentroAcopio);
  }, [selectedAnio, selectedCentroAcopio]);

  // Manejar exportación
  const handleExportarProgramacion = async (exportarTodasVacunas: boolean = false) => {
    try {
      setIsExporting(true);

      // Usar los filtros del modal
      const vacunaIdParaExportar = exportarTodasVacunas || exportVacuna === 'todos' ? undefined : exportVacuna;

      // Crear configuración de exportación
      const config = PlanificacionExportService.crearConfiguracionDesdeFiltros(
        exportAnio,
        vacunaIdParaExportar,
        exportCentroAcopio,
        'Usuario del Sistema',
        `Reporte generado desde el módulo de planificación - Filtros aplicados: Año ${exportAnio}, Vacuna: ${exportVacuna === 'todos' ? 'Todas' : vacunas.find(v => v.id === exportVacuna)?.nombre || 'Específica'}, Centro de Acopio: ${exportCentroAcopio === 'todos' ? 'Todos' : 'Específico'}`
      );

      if (exportarTodasVacunas || exportVacuna === 'todos') {
        // Exportar todas las vacunas
        await PlanificacionExportService.exportarYDescargarTodasVacunas(config);
        toast.success('Exportación de todas las vacunas completada exitosamente');
      } else {
        // Exportar vacuna específica
        const vacunaSeleccionada = vacunas.find(v => v.id === exportVacuna);
        await PlanificacionExportService.exportarYDescargarPorVacuna(
          exportVacuna,
          config,
          vacunaSeleccionada?.nombre
        );
        toast.success(`Exportación de ${vacunaSeleccionada?.nombre || 'la vacuna'} completada exitosamente`);
      }

    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error(error instanceof Error ? error.message : 'Error al exportar la programación');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Exportación de Programación */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <Download className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">📊 Exportar Programación por Vacuna</h3>
            <p className="text-sm text-gray-600">Generar reporte Excel con filtros aplicados</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-medium text-gray-900 mb-4">Configurar Filtros de Exportación:</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año de Programación
              </label>
              <select
                value={exportAnio}
                onChange={(e) => setExportAnio(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Vacuna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vacuna
              </label>
              <select
                value={exportVacuna}
                onChange={(e) => setExportVacuna(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todas las vacunas</option>
                {vacunas.map(vacuna => (
                  <option key={vacuna.id} value={vacuna.id}>
                    {vacuna.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Centro de Acopio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centro de Acopio
              </label>
              <select
                value={exportCentroAcopio}
                onChange={(e) => setExportCentroAcopio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos los centros</option>
                {centrosAcopio.map(centro => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botón de Exportación */}
        <div className="flex justify-center">
          <button
            onClick={() => handleExportarProgramacion(false)}
            disabled={isExporting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium shadow-lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-5 w-5 mr-3" />
                {exportVacuna === 'todos' ? 'Exportar Todas las Vacunas' : `Exportar ${vacunas.find(v => v.id === exportVacuna)?.nombre || 'Vacuna Seleccionada'}`}
              </>
            )}
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Información sobre la exportación:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>El reporte incluirá la programación detallada por establecimiento y mes</li>
                <li>Los datos se exportarán en formato Excel con diseño profesional</li>
                <li>Se aplicarán los filtros seleccionados arriba</li>
                <li>La descarga comenzará automáticamente una vez completada la exportación</li>
              </ul>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Planificacion;