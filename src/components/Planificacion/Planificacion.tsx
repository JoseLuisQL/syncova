import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import './enhanced-planning-table.css';
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
import { useToastContext } from '../../contexts/ToastContext';
import { PlanificacionService } from '../../services/planificacionService';
import { COMPONENT_STYLES } from './constants';
import {
  PlanificacionHeader,
  PlanificacionTabla,
  PlanificacionAcciones,
  PlanificacionLeyenda,
} from './components';
import ImportarModal from './ImportarModal';

interface EstablecimientoData {
  establecimiento: Establecimiento;
  distribucionMensual: number[];
  total: number;
  estado: string;
  planificacionId?: string;
}

const Planificacion: React.FC = () => {
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

  // Obtener establecimientos filtrados
  const establecimientosFiltrados = useMemo(() => {
    let filtrados: Establecimiento[];

    if (selectedCentroAcopio === 'todos') {
      filtrados = establecimientos.filter(e => e.tipo !== 'centro_acopio');
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
    loadEstablecimientos({ limit: 1000 });
    loadCentrosAcopio();
    loadVacunasActivas();
  }, []);

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

  const handleTempValueChange = useCallback((estIndex: number, mesIndex: number, newValue: number) => {
    const key = getFieldKey(estIndex, mesIndex);

    setTempValues(prev => ({
      ...prev,
      [key]: newValue
    }));

    setPendingChanges(prev => ({
      ...prev,
      [key]: true
    }));

    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
    }

    debounceTimeouts.current[key] = setTimeout(() => {
      handleSaveFieldValue(estIndex, mesIndex, newValue);
    }, 2000);
  }, [getFieldKey]);

  const handleSaveFieldValue = async (estIndex: number, mesIndex: number, value: number) => {
    const key = getFieldKey(estIndex, mesIndex);

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
    const key = getFieldKey(estIndex, mesIndex);
    const tempValue = tempValues[key];

    if (tempValue !== undefined && pendingChanges[key]) {
      handleSaveFieldValue(estIndex, mesIndex, tempValue);
    }
  }, [getFieldKey, tempValues, pendingChanges]);

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

  // Loading state
  if (isLoadingEstablecimientos || isLoadingVacunas) {
    return (
      <div className={COMPONENT_STYLES.pageBackground}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            <span className="text-gray-600">Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={COMPONENT_STYLES.pageBackground}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">Error al cargar datos: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header */}
      <PlanificacionHeader
        selectedAnio={selectedAnio}
        selectedCentroAcopio={selectedCentroAcopio}
        selectedVacuna={selectedVacuna}
        centrosAcopio={centrosAcopio}
        vacunas={vacunas}
        aniosDisponibles={aniosDisponibles}
        establecimientosCount={datosVacuna?.establecimientos.length || 0}
        totalGeneral={calcularTotalGeneral()}
        onAnioChange={setSelectedAnio}
        onCentroAcopioChange={setSelectedCentroAcopio}
        onVacunaChange={setSelectedVacuna}
        isLoading={isLoading}
        isLoadingAnios={isLoadingAnios}
        isUpdating={isUpdating}
        isImporting={isImporting}
        isExporting={isExporting}
        pendingChangesCount={pendingChangesCount}
        onRefresh={loadPlanificacionesPorVacuna}
        onImportar={() => setShowModalImportar(true)}
        onExportar={handleExportar}
        onGuardarPendientes={handleSaveAllPendingChanges}
      />

      {/* Contenido */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tabla */}
        <PlanificacionTabla
          establecimientos={datosVacuna?.establecimientos || []}
          selectedCentroAcopio={selectedCentroAcopio}
          isLoading={isLoading}
          isUpdating={isUpdating}
          getCurrentValue={getCurrentValue}
          hasPendingChange={hasPendingChange}
          onTempValueChange={handleTempValueChange}
          onFieldBlur={handleFieldBlur}
          calcularTotalMes={calcularTotalMes}
          calcularTotalGeneral={calcularTotalGeneral}
        />

        {/* Acciones */}
        <PlanificacionAcciones
          isLoading={isLoading}
          isUpdating={isUpdating}
          pendingChangesCount={pendingChangesCount}
          hasData={!!datosVacuna && datosVacuna.establecimientos.length > 0}
          onGuardarProgramacion={handleGuardarProgramacion}
          onRecalcular={loadPlanificacionesPorVacuna}
          onSincronizar={handleSincronizarConMovimientos}
          onGuardarPendientes={handleSaveAllPendingChanges}
        />

        {/* Leyenda */}
        <PlanificacionLeyenda />
      </div>

      {/* Modal Importar */}
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
    </main>
  );
};

export default Planificacion;
