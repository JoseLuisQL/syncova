import { useState, useEffect, useCallback } from 'react';
import {
  Vacuna,
  CreateVacunaDto,
  UpdateVacunaDto,
  VacunaFilters
} from '../types';
import VacunaService from '../services/vacunaService';
import { useApi, useCrudApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook personalizado para gestión de vacunas
 */
export function useVacunas(initialFilters?: VacunaFilters) {
  // Estados principales
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [vacunasActivas, setVacunasActivas] = useState<Vacuna[]>([]);
  const [filters, setFilters] = useState<VacunaFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 1000, // Increased from 50 to handle larger datasets
    total: 0,
    totalPages: 0
  });

  // APIs para operaciones CRUD
  const listApi = useApi<{
    vacunas: Vacuna[];
    total: number;
    pagination: any;
  }>();
  const crudApi = useCrudApi<Vacuna>();
  const activasApi = useApi<Vacuna[]>();
  const stockStatsApi = useApi<any>();

  // Estados derivados
  const isLoading = listApi.loading;
  const isLoadingActivas = activasApi.loading;
  const error = listApi.error;
  const errorActivas = activasApi.error;
  const isCreating = crudApi.create.loading;
  const isUpdating = crudApi.update.loading;
  const isDeleting = crudApi.delete.loading;
  const createError = crudApi.create.error;
  const updateError = crudApi.update.error;
  const deleteError = crudApi.delete.error;

  /**
   * Cargar vacunas con filtros
   */
  const loadVacunas = useCallback(async (newFilters?: VacunaFilters) => {
    const filtersToUse = newFilters || filters;
    
    logger.debug('Cargando vacunas con filtros:', filtersToUse);

    const result = await listApi.execute(() => VacunaService.getAll(filtersToUse));
    
    if (result) {
      setVacunas(result.vacunas);
      setPagination(result.pagination);
      
      if (newFilters) {
        setFilters(newFilters);
      }
    }
  }, [filters, listApi]);

  /**
   * Cargar vacunas activas
   */
  const loadVacunasActivas = useCallback(async () => {
    logger.debug('Cargando vacunas activas');
    console.log('🔄 Iniciando carga de vacunas activas...');

    const result = await activasApi.execute(() => VacunaService.getActivas());

    console.log('📊 Resultado de vacunas activas:', result);
    console.log('⚠️ Error en activasApi:', activasApi.error);
    console.log('🔄 Loading state:', activasApi.loading);

    if (result) {
      console.log('✅ Vacunas activas cargadas:', result.length, 'vacunas');
      setVacunasActivas(result);
    } else {
      console.log('❌ No se pudieron cargar las vacunas activas');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Crear nueva vacuna
   */
  const createVacuna = useCallback(async (data: CreateVacunaDto): Promise<boolean> => {
    logger.debug('Creando nueva vacuna:', data);

    const result = await crudApi.create.execute(() => VacunaService.create(data));
    
    if (result) {
      // Recargar la lista después de crear
      await loadVacunas();
      await loadVacunasActivas(); // Actualizar también las activas
      return true;
    }
    
    return false;
  }, [crudApi.create, loadVacunas, loadVacunasActivas]);

  /**
   * Actualizar vacuna
   */
  const updateVacuna = useCallback(async (id: string, data: UpdateVacunaDto): Promise<boolean> => {
    logger.debug('Actualizando vacuna:', { id, data });

    const result = await crudApi.update.execute(() => VacunaService.update(id, data));
    
    if (result) {
      // Recargar la lista después de actualizar
      await loadVacunas();
      await loadVacunasActivas(); // Actualizar también las activas
      return true;
    }
    
    return false;
  }, [crudApi.update, loadVacunas, loadVacunasActivas]);

  /**
   * Eliminar vacuna
   */
  const deleteVacuna = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Eliminando vacuna:', { id });

    const result = await crudApi.delete.execute(() => VacunaService.delete(id));
    
    if (result !== null) { // delete devuelve void, así que verificamos que no sea null (error)
      // Recargar la lista después de eliminar
      await loadVacunas();
      await loadVacunasActivas(); // Actualizar también las activas
      return true;
    }
    
    return false;
  }, [crudApi.delete, loadVacunas, loadVacunasActivas]);

  /**
   * Buscar vacunas
   */
  const search = useCallback(async (searchTerm: string) => {
    const newFilters = {
      ...filters,
      search: searchTerm,
      page: 1 // Resetear a la primera página
    };
    
    await loadVacunas(newFilters);
  }, [filters, loadVacunas]);

  /**
   * Aplicar filtros
   */
  const applyFilters = useCallback(async (newFilters: Partial<VacunaFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: 1 // Resetear a la primera página cuando se cambian filtros
    };
    
    await loadVacunas(updatedFilters);
  }, [filters, loadVacunas]);

  /**
   * Cambiar página
   */
  const changePage = useCallback(async (page: number) => {
    if (page < 1 || page > pagination.totalPages) {
      return;
    }
    
    const newFilters = {
      ...filters,
      page
    };
    
    await loadVacunas(newFilters);
  }, [filters, pagination.totalPages, loadVacunas]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadVacunas(),
      loadVacunasActivas()
    ]);
  }, [loadVacunas, loadVacunasActivas]);

  /**
   * Obtener estadísticas de stock
   */
  const getStockStats = useCallback(async (vacunaId?: string) => {
    logger.debug('Obteniendo estadísticas de stock:', { vacunaId });

    const result = await stockStatsApi.execute(() => VacunaService.getStockStats(vacunaId));
    return result;
  }, [stockStatsApi]);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    crudApi.reset();
    listApi.reset();
    activasApi.reset();
    stockStatsApi.reset();
  }, [crudApi, listApi, activasApi, stockStatsApi]);

  // Cargar datos iniciales
  useEffect(() => {
    loadVacunas();
    loadVacunasActivas();
  }, []); // Solo al montar el componente

  return {
    // Datos
    vacunas,
    vacunasActivas,
    pagination,
    filters,

    // Estados de carga
    isLoading,
    isLoadingActivas,
    error,
    errorActivas,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,

    // Operaciones CRUD
    createVacuna,
    updateVacuna,
    deleteVacuna,

    // Operaciones de consulta
    search,
    applyFilters,
    changePage,
    refresh,
    getStockStats,
    loadVacunasActivas,

    // Utilidades
    clearErrors
  };
}

export default useVacunas;
