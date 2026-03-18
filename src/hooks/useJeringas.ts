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
export function useJeringas(initialFilters?: JeringaFilters, options?: { autoLoad?: boolean }) {
  const { autoLoad = true } = options || {};
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
  const pendingListKeyRef = useRef<string | null>(null);
  const pendingActivasRef = useRef(false);
  const loadedListKeyRef = useRef<string | null>(null);
  const hasLoadedActivasRef = useRef(false);

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
   * Cargar jeringas con filtros
   */
  const loadJeringas = useCallback(async (newFilters?: JeringaFilters, options?: { force?: boolean }) => {
    const filtersToUse = newFilters || filters;
    const requestKey = JSON.stringify(filtersToUse || {});
    const force = options?.force === true;

    if (pendingListKeyRef.current === requestKey) {
      return;
    }

    if (!force && loadedListKeyRef.current === requestKey) {
      return;
    }

    logger.debug('Cargando jeringas con filtros:', filtersToUse);
    pendingListKeyRef.current = requestKey;

    try {
      const result = await listApi.execute(() => JeringaService.getAll(filtersToUse));

      if (result) {
        setJeringas(result.jeringas);
        setPagination(result.pagination);
        loadedListKeyRef.current = requestKey;

        if (newFilters) {
          setFilters(newFilters);
        }
      }
    } finally {
      if (pendingListKeyRef.current === requestKey) {
        pendingListKeyRef.current = null;
      }
    }
  }, [filters, listApi]);

  /**
   * Cargar jeringas activas
   */
  const loadJeringasActivas = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force === true;

    if (pendingActivasRef.current) {
      return;
    }

    if (!force && hasLoadedActivasRef.current) {
      return;
    }

    logger.debug('Cargando jeringas activas');
    pendingActivasRef.current = true;

    try {
      const result = await activasApi.execute(() => JeringaService.getActivas());

      if (result) {
        setJeringasActivas(result);
        hasLoadedActivasRef.current = true;
      }
    } finally {
      pendingActivasRef.current = false;
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
      await loadJeringas(undefined, { force: true });
      await loadJeringasActivas({ force: true });
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
      await loadJeringas(undefined, { force: true });
      await loadJeringasActivas({ force: true });
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
      await loadJeringas(undefined, { force: true });
      await loadJeringasActivas({ force: true });
      return true;
    }
    
    return false;
  }, [crudApi.delete, loadJeringas, loadJeringasActivas]);

  /**
   * Buscar jeringas
   */
  const search = useCallback(async (searchTerm: string) => {
    const normalizedSearch = searchTerm.trim();
    const newFilters = {
      ...filters,
      search: normalizedSearch || undefined,
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
      search: typeof newFilters.search === 'string' ? newFilters.search.trim() || undefined : filters.search,
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
      loadJeringas(undefined, { force: true }),
      loadJeringasActivas({ force: true })
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
    if (!autoLoad) {
      return;
    }

    loadJeringas();
    loadJeringasActivas();
  }, [autoLoad]); // Solo al montar el componente

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
