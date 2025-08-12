import { useState, useCallback, useEffect } from 'react';
import { PlanificacionService } from '../services/planificacionService';
import {
  PlanificacionAnual,
  PlanificacionConRelaciones,
  CreatePlanificacionDto,
  UpdatePlanificacionDto,
  PlanificacionFilters,
  PlanificacionStats,
  ImportarPlanificacionDto,
  DistribucionAutomaticaDto
} from '../types';
import { useApi, useCrudApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook para gestión de planificación anual de vacunas
 * Proporciona estado y operaciones CRUD integradas con el backend
 */
export const usePlanificacion = () => {
  // Estados locales
  const [planificaciones, setPlanificaciones] = useState<PlanificacionConRelaciones[]>([]);
  const [stats, setStats] = useState<PlanificacionStats | null>(null);
  const [filters, setFilters] = useState<PlanificacionFilters>({
    page: 1,
    limit: 50,
    estado: 'todos'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  });

  // APIs para operaciones CRUD
  const listApi = useApi<{
    planificaciones: PlanificacionConRelaciones[];
    total: number;
    pagination: any;
  }>();
  const crudApi = useCrudApi<PlanificacionAnual>();
  const statsApi = useApi<PlanificacionStats>();
  const byVacunaApi = useApi<PlanificacionConRelaciones[]>();
  const importarApi = useApi<{ creadas: number; actualizadas: number; errores: string[] }>();
  const distribucionApi = useApi<PlanificacionConRelaciones[]>();
  const plantillaVacunaApi = useApi<Blob>();
  const plantillaMasivaApi = useApi<Blob>();
  const importarExcelVacunaApi = useApi<{ creadas: number; actualizadas: number; errores: string[] }>();
  const importarExcelMasivoApi = useApi<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: { vacuna: string; errores: string[] }[];
    vacunasProcesadas: number;
  }>();

  // Estados derivados
  const isLoading = listApi.loading;
  const isLoadingStats = statsApi.loading;
  const error = listApi.error;
  const isCreating = crudApi.create.loading;
  const isUpdating = crudApi.update.loading;
  const isDeleting = crudApi.delete.loading;
  const isImporting = importarApi.loading;
  const isGeneratingDistribution = distribucionApi.loading;
  const isDownloadingTemplate = plantillaVacunaApi.loading || plantillaMasivaApi.loading;
  const isImportingExcel = importarExcelVacunaApi.loading || importarExcelMasivoApi.loading;
  const createError = crudApi.create.error;
  const updateError = crudApi.update.error;
  const deleteError = crudApi.delete.error;
  const importError = importarApi.error;
  const distributionError = distribucionApi.error;
  const templateError = plantillaVacunaApi.error || plantillaMasivaApi.error;
  const importExcelError = importarExcelVacunaApi.error || importarExcelMasivoApi.error;

  /**
   * Cargar planificaciones con filtros
   */
  const loadPlanificaciones = useCallback(async (newFilters?: PlanificacionFilters) => {
    const filtersToUse = newFilters || filters;

    logger.debug('Cargando planificaciones con filtros:', filtersToUse);

    const result = await listApi.execute(() => PlanificacionService.getAll(filtersToUse));

    if (result) {
      setPlanificaciones(result.planificaciones);
      setPagination(result.pagination);
      setFilters(filtersToUse);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Cargar estadísticas
   */
  const loadStats = useCallback(async (anio?: number) => {
    logger.debug('Cargando estadísticas de planificación:', { anio });

    const result = await statsApi.execute(() => PlanificacionService.getStats(anio));

    if (result) {
      setStats(result);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Crear nueva planificación
   */
  const createPlanificacion = useCallback(async (data: CreatePlanificacionDto): Promise<PlanificacionAnual | null> => {
    try {
      // Validaciones básicas
      if (!data.establecimientoId || !data.vacunaId || !data.anio) {
        throw new Error('Faltan datos requeridos para crear la planificación');
      }

      if (data.distribucionMensual.length !== 12) {
        throw new Error('La distribución mensual debe tener exactamente 12 elementos');
      }

      const sumaDistribucion = data.distribucionMensual.reduce((sum, val) => sum + val, 0);
      if (sumaDistribucion !== data.metaAnual) {
        throw new Error('La suma de la distribución mensual debe coincidir con la meta anual');
      }

      logger.debug('Creando nueva planificación:', data);

      const result = await crudApi.create.execute(() => PlanificacionService.create(data));

      if (result) {
        // Recargar la lista después de crear
        await loadPlanificaciones();
        return result;
      }

      return null;
    } catch (error) {
      logger.error('Error en createPlanificacion:', error);
      throw error;
    }
  }, [loadPlanificaciones]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Actualizar planificación existente
   */
  const updatePlanificacion = useCallback(async (id: string, data: UpdatePlanificacionDto): Promise<PlanificacionAnual | null> => {
    try {
      // Validaciones básicas
      if (!id) {
        throw new Error('ID de planificación requerido');
      }

      if (data.distribucionMensual && data.distribucionMensual.length !== 12) {
        throw new Error('La distribución mensual debe tener exactamente 12 elementos');
      }

      if (data.distribucionMensual && data.metaAnual) {
        const sumaDistribucion = data.distribucionMensual.reduce((sum, val) => sum + val, 0);
        if (sumaDistribucion !== data.metaAnual) {
          throw new Error('La suma de la distribución mensual debe coincidir con la meta anual');
        }
      }

      logger.debug('Actualizando planificación:', { id, data });

      const result = await crudApi.update.execute(() => PlanificacionService.update(id, data));

      if (result) {
        // Recargar la lista después de actualizar
        await loadPlanificaciones();
        return result;
      }

      return null;
    } catch (error) {
      logger.error('Error en updatePlanificacion:', error);
      throw error;
    }
  }, [loadPlanificaciones]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Eliminar planificación
   */
  const deletePlanificacion = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Eliminando planificación:', id);

    const result = await crudApi.delete.execute(() => PlanificacionService.delete(id));

    if (result !== null) {
      // Recargar la lista después de eliminar
      await loadPlanificaciones();
      return true;
    }

    return false;
  }, [loadPlanificaciones]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Obtener planificaciones por vacuna y año
   */
  const loadByVacunaAndYear = useCallback(async (
    vacunaId: string, 
    anio: number, 
    centroAcopioId?: string
  ): Promise<PlanificacionConRelaciones[]> => {
    logger.debug('Cargando planificaciones por vacuna y año:', { vacunaId, anio, centroAcopioId });

    const result = await byVacunaApi.execute(() => 
      PlanificacionService.getByVacunaAndYear(vacunaId, anio, centroAcopioId)
    );

    return result || [];
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Importar planificaciones
   */
  const importarPlanificaciones = useCallback(async (data: ImportarPlanificacionDto): Promise<{
    creadas: number;
    actualizadas: number;
    errores: string[];
  } | null> => {
    logger.debug('Importando planificaciones:', data);

    const result = await importarApi.execute(() => PlanificacionService.importar(data));

    if (result) {
      // Recargar la lista después de importar
      await loadPlanificaciones();
      return result;
    }

    return null;
  }, [loadPlanificaciones]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Generar distribución automática
   */
  const generarDistribucionAutomatica = useCallback(async (data: DistribucionAutomaticaDto): Promise<PlanificacionConRelaciones[]> => {
    logger.debug('Generando distribución automática:', data);

    const result = await distribucionApi.execute(() => PlanificacionService.distribucionAutomatica(data));

    if (result) {
      // Recargar la lista después de generar distribución
      await loadPlanificaciones();
      return result;
    }

    return [];
  }, [loadPlanificaciones]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Actualizar filtros y recargar
   */
  const updateFilters = useCallback(async (newFilters: Partial<PlanificacionFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    await loadPlanificaciones(updatedFilters);
  }, [filters, loadPlanificaciones]);

  /**
   * Cambiar página
   */
  const changePage = useCallback(async (page: number) => {
    const updatedFilters = { ...filters, page };
    await loadPlanificaciones(updatedFilters);
  }, [filters, loadPlanificaciones]);

  /**
   * Descargar plantilla Excel para vacuna específica
   */
  const descargarPlantillaVacuna = useCallback(async (vacunaId: string, anio: number): Promise<boolean> => {
    logger.debug('Descargando plantilla de vacuna:', { vacunaId, anio });

    const result = await plantillaVacunaApi.execute(() =>
      PlanificacionService.descargarPlantillaVacuna(vacunaId, anio)
    );

    if (result) {
      // Crear URL para descarga
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Plantilla_Programacion_${anio}_Vacuna.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    }

    return false;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Descargar plantilla Excel masiva
   */
  const descargarPlantillaMasiva = useCallback(async (anio: number): Promise<boolean> => {
    logger.debug('Descargando plantilla masiva:', { anio });

    const result = await plantillaMasivaApi.execute(() =>
      PlanificacionService.descargarPlantillaMasiva(anio)
    );

    if (result) {
      // Crear URL para descarga
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Plantilla_Programacion_Masiva_${anio}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    }

    return false;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Importar desde Excel por vacuna específica
   */
  const importarDesdeExcelVacuna = useCallback(async (
    vacunaId: string,
    anio: number,
    archivo: File
  ): Promise<{
    creadas: number;
    actualizadas: number;
    errores: string[];
  } | null> => {
    logger.debug('Importando desde Excel por vacuna:', { vacunaId, anio, archivo: archivo.name });

    const result = await importarExcelVacunaApi.execute(() =>
      PlanificacionService.importarDesdeExcelVacuna(vacunaId, anio, archivo)
    );

    if (result) {
      // Recargar la lista después de importar
      await loadPlanificaciones();
      return result;
    }

    return null;
  }, [loadPlanificaciones]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Importar masivamente desde Excel
   */
  const importarDesdeExcelMasivo = useCallback(async (
    anio: number,
    archivo: File
  ): Promise<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: { vacuna: string; errores: string[] }[];
    vacunasProcesadas: number;
  } | null> => {
    logger.debug('Importando masivamente desde Excel:', { anio, archivo: archivo.name });

    const result = await importarExcelMasivoApi.execute(() =>
      PlanificacionService.importarDesdeExcelMasivo(anio, archivo)
    );

    if (result) {
      // Recargar la lista después de importar
      await loadPlanificaciones();
      return result;
    }

    return null;
  }, [loadPlanificaciones]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadPlanificaciones(),
      loadStats(filters.anio)
    ]);
  }, [loadPlanificaciones, loadStats, filters.anio]);

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    loadPlanificaciones();
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Datos
    planificaciones,
    stats,
    filters,
    pagination,

    // Estados de carga
    isLoading,
    isLoadingStats,
    isCreating,
    isUpdating,
    isDeleting,
    isImporting,
    isGeneratingDistribution,
    isDownloadingTemplate,
    isImportingExcel,

    // Errores
    error,
    createError,
    updateError,
    deleteError,
    importError,
    distributionError,
    templateError,
    importExcelError,

    // Operaciones CRUD
    createPlanificacion,
    updatePlanificacion,
    deletePlanificacion,

    // Operaciones especiales
    loadByVacunaAndYear,
    importarPlanificaciones,
    generarDistribucionAutomatica,

    // Operaciones de plantillas e importación Excel
    descargarPlantillaVacuna,
    descargarPlantillaMasiva,
    importarDesdeExcelVacuna,
    importarDesdeExcelMasivo,

    // Utilidades
    loadPlanificaciones,
    loadStats,
    updateFilters,
    changePage,
    refresh
  };
};
