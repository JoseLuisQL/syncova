import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Jeringa,
  CreateJeringaDto,
  UpdateJeringaDto,
  JeringaFilters
} from '../types';
import JeringaService from '../services/jeringaService';
import { useApi, useCrudApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook personalizado para gestión de jeringas
 */
export function useJeringas(initialFilters?: JeringaFilters) {
  // Referencias para throttling
  const lastCallTime = useRef<number>(0);
  const throttleDelay = 1000; // 1 segundo entre llamadas

  // Estados principales
  const [jeringas, setJeringas] = useState<Jeringa[]>([]);
  const [jeringasActivas, setJeringasActivas] = useState<Jeringa[]>([]);
  const [filters, setFilters] = useState<JeringaFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 1000, // Increased from 50 to handle larger datasets
    total: 0,
    totalPages: 0
  });

  // APIs para operaciones CRUD
  const listApi = useApi<{
    jeringas: Jeringa[];
    total: number;
    pagination: any;
  }>();
  const crudApi = useCrudApi<Jeringa>();
  const activasApi = useApi<Jeringa[]>();
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
   * Función para throttling de llamadas API
   */
  const shouldThrottle = useCallback(() => {
    const now = Date.now();
    if (now - lastCallTime.current < throttleDelay) {
      logger.debug('Llamada throttled, muy pronto desde la última');
      return true;
    }
    lastCallTime.current = now;
    return false;
  }, [throttleDelay]);

  /**
   * Cargar jeringas con filtros
   */
  const loadJeringas = useCallback(async (newFilters?: JeringaFilters) => {
    if (shouldThrottle()) {
      return;
    }

    const filtersToUse = newFilters || filters;

    logger.debug('Cargando jeringas con filtros:', filtersToUse);

    const result = await listApi.execute(() => JeringaService.getAll(filtersToUse));

    if (result) {
      setJeringas(result.jeringas);
      setPagination(result.pagination);

      if (newFilters) {
        setFilters(newFilters);
      }
    }
  }, [filters, listApi, shouldThrottle]);

  /**
   * Cargar jeringas activas
   */
  const loadJeringasActivas = useCallback(async () => {
    logger.debug('Cargando jeringas activas');

    const result = await activasApi.execute(() => JeringaService.getActivas());

    if (result) {
      setJeringasActivas(result);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Crear jeringa
   */
  const createJeringa = useCallback(async (data: CreateJeringaDto): Promise<boolean> => {
    logger.debug('Creando jeringa:', data);

    const result = await crudApi.create.execute(() => JeringaService.create(data));
    
    if (result) {
      // Recargar la lista después de crear
      await loadJeringas();
      await loadJeringasActivas();
      return true;
    }
    
    return false;
  }, [crudApi.create, loadJeringas, loadJeringasActivas]);

  /**
   * Actualizar jeringa
   */
  const updateJeringa = useCallback(async (id: string, data: UpdateJeringaDto): Promise<boolean> => {
    logger.debug('Actualizando jeringa:', { id, data });

    const result = await crudApi.update.execute(() => JeringaService.update(id, data));
    
    if (result) {
      // Recargar la lista después de actualizar
      await loadJeringas();
      await loadJeringasActivas();
      return true;
    }
    
    return false;
  }, [crudApi.update, loadJeringas, loadJeringasActivas]);

  /**
   * Eliminar jeringa
   */
  const deleteJeringa = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Eliminando jeringa:', { id });

    const result = await crudApi.delete.execute(() => JeringaService.delete(id));
    
    if (result !== null) { // null indica error, undefined indica éxito para delete
      // Recargar la lista después de eliminar
      await loadJeringas();
      await loadJeringasActivas();
      return true;
    }
    
    return false;
  }, [crudApi.delete, loadJeringas, loadJeringasActivas]);

  /**
   * Buscar jeringas
   */
  const search = useCallback(async (searchTerm: string) => {
    const newFilters = {
      ...filters,
      search: searchTerm,
      page: 1 // Resetear a la primera página cuando se busca
    };
    
    await loadJeringas(newFilters);
  }, [filters, loadJeringas]);

  /**
   * Aplicar filtros
   */
  const applyFilters = useCallback(async (newFilters: Partial<JeringaFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: 1 // Resetear a la primera página cuando se cambian filtros
    };
    
    await loadJeringas(updatedFilters);
  }, [filters, loadJeringas]);

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
    
    await loadJeringas(newFilters);
  }, [filters, pagination.totalPages, loadJeringas]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadJeringas(),
      loadJeringasActivas()
    ]);
  }, [loadJeringas, loadJeringasActivas]);

  /**
   * Obtener estadísticas de stock
   */
  const getStockStats = useCallback(async (jeringaId?: string) => {
    logger.debug('Obteniendo estadísticas de stock:', { jeringaId });

    const result = await stockStatsApi.execute(() => JeringaService.getStockStats(jeringaId));
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
    loadJeringas();
    loadJeringasActivas();
  }, []); // Solo al montar el componente

  // Evitar dependencias circulares en loadJeringas
  const loadJeringasStable = useCallback(async (newFilters?: JeringaFilters) => {
    const filtersToUse = newFilters || filters;

    logger.debug('Cargando jeringas con filtros:', filtersToUse);

    const result = await listApi.execute(() => JeringaService.getAll(filtersToUse));

    if (result) {
      setJeringas(result.jeringas);
      setPagination(result.pagination);

      if (newFilters) {
        setFilters(newFilters);
      }
    }
  }, [listApi]); // Solo depende de listApi

  return {
    // Datos
    jeringas,
    jeringasActivas,
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
    createJeringa,
    updateJeringa,
    deleteJeringa,
    
    // Operaciones de consulta
    search,
    applyFilters,
    changePage,
    refresh,
    getStockStats,
    loadJeringasActivas,

    // Utilidades
    clearErrors
  };
}

export default useJeringas;
