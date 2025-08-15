import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar,
  Upload,
  Download,
  Target,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Users,
  Building2,
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  FileText,
  Calculator,
  Eye,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import {
  Establecimiento,
  Vacuna,
  PlanificacionAnual,
  PlanificacionConRelaciones,
  CreatePlanificacionDto,
  UpdatePlanificacionDto,
  CentroAcopio
} from '../../types';
import { usePlanificacion } from '../../hooks/usePlanificacion';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import ImportarModal from './ImportarModal';
import { PlanificacionService } from '../../services/planificacionService';

const Planificacion: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'programacion' | 'importar' | 'distribucion' | 'reportes'>('programacion');
  const [selectedAnio, setSelectedAnio] = useState<number>(2025);
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>('todos');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  const [showModalPlan, setShowModalPlan] = useState(false);
  const [showModalDistribucion, setShowModalDistribucion] = useState(false);
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanificacionAnual | null>(null);
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

  const tabs = [
    { id: 'programacion', label: 'Programación por Vacuna', icon: Package },
    { id: 'importar', label: 'Importar Programación', icon: Upload },
    { id: 'distribucion', label: 'Distribución Automática', icon: Calculator },
    { id: 'reportes', label: 'Reportes y Análisis', icon: BarChart3 },
  ];

  // Obtener establecimientos según el filtro seleccionado
  const getEstablecimientosFiltrados = () => {
    if (selectedCentroAcopio === 'todos') {
      // Retornar todos los establecimientos que no sean centros de acopio
      return establecimientos.filter(e => e.tipo !== 'centro_acopio');
    } else {
      // Retornar solo los establecimientos del centro de acopio seleccionado
      return establecimientos.filter(e => e.centroAcopioId === selectedCentroAcopio);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Planificación y Programación de Vacunas</h2>
          <p className="text-gray-600 mt-1">Gestión de programación anual por vacuna y distribución mensual</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleImportarPorVacuna}
            disabled={isImporting}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Importar por Vacuna
          </button>
          <button
            onClick={handleExportarExcel}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar a Excel
          </button>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'programacion' && (
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
      )}

      {activeTab === 'importar' && (
        <ImportarPorVacunaTab onImportar={handleImportarPorVacuna} />
      )}

      {activeTab === 'distribucion' && (
        <DistribucionAutomaticaTab
          vacunas={vacunas}
          onGenerar={generarDistribucionAutomatica}
          isGenerating={isGeneratingDistribution}
        />
      )}

      {activeTab === 'reportes' && (
        <ReportesTab stats={stats} isLoadingStats={isLoadingStats} />
      )}

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
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Centro de Acopio</label>
            <select
              value={selectedCentroAcopio}
              onChange={(e) => setSelectedCentroAcopio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">🌐 Todos los Centros de Acopio</option>
              {centrosAcopio.map((centro) => (
                <option key={centro.id} value={centro.id}>
                  🏢 {centro.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vacuna</label>
            <select
              value={selectedVacuna}
              onChange={(e) => setSelectedVacuna(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vacunas.map((vacuna) => (
                <option key={vacuna.id} value={vacuna.id}>
                  💉 {vacuna.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={selectedAnio}
              onChange={(e) => setSelectedAnio(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2025}>📅 2025</option>
              <option value={2026}>📅 2026</option>
              <option value={2024}>📅 2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Header de la Programación */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              📝 Asignación de Población - {vacunaSeleccionada?.nombre.toUpperCase()} {selectedAnio}
            </h3>
            <p className="text-blue-100 mt-1">
              {getCentroAcopioTexto()} - {vacunaSeleccionada?.presentacion} - {vacunaSeleccionada?.dosisPorFrasco} dosis por frasco
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{calcularTotalGeneral().toLocaleString()}</div>
            <div className="text-blue-100">Total Programado</div>
          </div>
        </div>
      </div>

      {/* Información del filtro activo */}
      {selectedCentroAcopio !== 'todos' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Mostrando programación para: {centrosAcopio.find(c => c.id === selectedCentroAcopio)?.nombre}
            </span>
            <span className="ml-2 text-blue-600 text-sm">
              ({datosVacuna?.establecimientos.length || 0} establecimientos)
            </span>
          </div>
        </div>
      )}

      {selectedCentroAcopio === 'todos' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Mostrando programación consolidada de todos los centros de acopio
            </span>
            <span className="ml-2 text-green-600 text-sm">
              ({datosVacuna?.establecimientos.length || 0} establecimientos totales)
            </span>
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

      {/* Tabla de Programación */}
      {datosVacuna && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                  🏥 Establecimiento
                </th>
                {mesesCortos.map((mes, index) => (
                  <th key={index} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-blue-500">
                    {mes}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-bold uppercase tracking-wider bg-blue-700">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Fila Total DISA */}
              <tr className="bg-green-100 font-bold border-b-2 border-green-300">
                <td className="px-4 py-3 text-sm font-bold text-green-800 border-r border-gray-200">
                  📊 TOTAL DISA
                </td>
                {mesesCortos.map((_, mesIndex) => (
                  <td key={mesIndex} className="px-3 py-3 text-center text-sm font-bold text-green-800 border-r border-gray-200">
                    {calcularTotalMes(mesIndex)}
                  </td>
                ))}
                <td className="px-4 py-3 text-center text-sm font-bold text-green-800 bg-green-200">
                  {calcularTotalGeneral()}
                </td>
              </tr>

              {/* Filas de establecimientos */}
              {datosVacuna?.establecimientos.map((estData: any, estIndex: number) => {
                const esHospital = estData.establecimiento.nombre.includes('HOSPITAL') || estData.establecimiento.nombre.includes('ESSALUD');
                const esCentroSalud = estData.establecimiento.tipo === 'centro_salud' && !esHospital;
                
                let bgColor = 'bg-white';
                let textColor = 'text-gray-900';
                let iconoTipo = '🏥';
                
                if (esHospital) {
                  bgColor = 'bg-green-50';
                  textColor = 'text-green-900';
                  iconoTipo = '🏥';
                } else if (esCentroSalud) {
                  bgColor = 'bg-green-50';
                  textColor = 'text-green-900';
                  iconoTipo = '🏥';
                } else if (estData.establecimiento.tipo === 'puesto_salud') {
                  bgColor = 'bg-orange-50';
                  textColor = 'text-orange-900';
                  iconoTipo = '🏪';
                }
                
                return (
                  <tr key={estIndex} className={`${bgColor} hover:bg-gray-100 border-b border-gray-200`}>
                    <td className={`px-4 py-3 text-sm font-medium ${textColor} border-r border-gray-200`}>
                      <div className="flex items-center">
                        <span className="mr-2">{iconoTipo}</span>
                        <div>
                          <div className="font-medium">{estData.establecimiento.nombre}</div>
                          {selectedCentroAcopio === 'todos' && (
                            <div className="text-xs text-gray-500">
                              {establecimientos.find(ca => ca.id === estData.establecimiento.centroAcopioId)?.nombre}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {estData.distribucionMensual.map((valor: number, mesIndex: number) => {
                      const currentValue = getCurrentValue(estIndex, mesIndex, valor);
                      const isPending = hasPendingChange(estIndex, mesIndex);

                      return (
                        <td key={mesIndex} className="px-2 py-2 text-center border-r border-gray-200 relative">
                          <input
                            type="number"
                            min="0"
                            value={currentValue}
                            onChange={(e) => handleTempValueChange(estIndex, mesIndex, parseInt(e.target.value) || 0)}
                            onBlur={() => handleFieldBlur(estIndex, mesIndex)}
                            disabled={isUpdating}
                            className={`w-12 px-1 py-1 text-center text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                              isPending
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                            title={isPending ? 'Cambios pendientes - Se guardará automáticamente' : ''}
                          />
                          {isPending && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                                 title="Cambios pendientes"></div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center text-sm font-bold bg-gray-100 border-l-2 border-gray-300">
                      {estData.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Acciones */}
      {datosVacuna && (
      <>
      <div className="flex justify-between items-center bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            onClick={handleGuardarProgramacion}
            disabled={isUpdating || isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isUpdating ? 'Guardando...' : 'Guardar Programación'}
          </button>
          <button
            onClick={loadPlanificacionesPorVacuna}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Cargando...' : 'Recalcular Totales'}
          </button>
          <button
            onClick={handleSincronizarConMovimientos}
            disabled={isLoading || isUpdating || !datosVacuna}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
            title="Sincronizar entregas con módulo de movimientos"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sincronizar Movimientos
          </button>
          {Object.keys(pendingChanges).length > 0 && (
            <button
              onClick={handleSaveAllPendingChanges}
              disabled={isUpdating}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar Cambios Pendientes ({Object.keys(pendingChanges).length})
            </button>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {Object.keys(pendingChanges).length > 0 ? (
            <div className="flex items-center text-yellow-600">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
              {Object.keys(pendingChanges).length} cambio(s) pendiente(s) - Se guardarán automáticamente
            </div>
          ) : isLoading ? (
            'Cargando datos...'
          ) : (
            `Última actualización: ${new Date().toLocaleString()}`
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">Leyenda de Colores y Filtros</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Tipos de Establecimientos:</h5>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">🏥 Hospitales y Centros de Salud</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">🏪 Puestos de Salud</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded mr-2"></div>
              <span className="text-sm text-gray-600">📊 Total DISA (Consolidado)</span>
            </div>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Opciones de Filtro:</h5>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">🌐 <strong>Todos los Acopios:</strong> Muestra todos los establecimientos</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600">🏢 <strong>Acopio Individual:</strong> Muestra solo establecimientos del acopio seleccionado</span>
            </div>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800">Edición Inteligente:</h5>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded mr-2"></div>
              <span className="text-sm text-gray-600">📝 <strong>Campos con cambios pendientes</strong></span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600">⏱️ <strong>Auto-guardado:</strong> 2 segundos después de escribir</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 ml-5">💡 <strong>Tip:</strong> Los cambios se guardan al salir del campo o automáticamente</span>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🧮 Distribución Automática Inteligente</h3>
        <p className="text-gray-600 mb-6">
          Utilice criterios avanzados para distribuir automáticamente las metas anuales en cantidades mensuales por vacuna
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {criterios.map((criterio) => (
            <div key={criterio.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{criterio.nombre}</h4>
                <span className="text-2xl">{criterio.icono}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{criterio.descripcion}</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Aplicar Criterio
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">⚙️ Configuración Avanzada</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Vacuna a Distribuir
              </label>
              <select className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>BCG</option>
                <option>Pentavalente</option>
                <option>HVB Pediátrico</option>
                <option>Neumococo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Factor de Estacionalidad
              </label>
              <select className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Estándar (1.0)</option>
                <option>Alto (1.5)</option>
                <option>Muy Alto (2.0)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Reserva de Seguridad
              </label>
              <select className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
const ReportesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Métricas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vacunas Programadas</p>
              <p className="text-3xl font-bold text-blue-600">10</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Programado</p>
              <p className="text-3xl font-bold text-green-600">15,847</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Establecimientos</p>
              <p className="text-3xl font-bold text-purple-600">15</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eficiencia</p>
              <p className="text-3xl font-bold text-orange-600">94%</p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Reportes y Análisis Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Programación por Vacuna</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Reporte detallado de la programación anual por cada tipo de vacuna
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Generar Reporte
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <PieChart className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Distribución por Centro</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Análisis de distribución de vacunas por centro de acopio
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Generar Reporte
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-900">Cronograma Mensual</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Cronograma detallado de entregas mensuales programadas
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Generar Reporte
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <FileText className="h-5 w-5 text-orange-600 mr-2" />
              <h4 className="font-medium text-gray-900">Reporte Ejecutivo</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Resumen ejecutivo con métricas clave y recomendaciones estratégicas
            </p>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planificacion;