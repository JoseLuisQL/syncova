import { useState, useEffect, useCallback } from 'react';
import {
  LoteJeringa,
  CreateLoteJeringaDto,
  UpdateLoteJeringaDto,
  LoteJeringaFilters,
  LoteJeringaStats
} from '../types';
import LoteJeringaService from '../services/loteJeringaService';
import { useApi, useCrudApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook personalizado para gestión de lotes de jeringas
 */
export function useLotesJeringas(initialFilters?: LoteJeringaFilters) {
  // Estados principales
  const [lotes, setLotes] = useState<LoteJeringa[]>([]);
  const [stats, setStats] = useState<LoteJeringaStats | null>(null);
  const [stockBajo, setStockBajo] = useState<LoteJeringa[]>([]);
  const [filters, setFilters] = useState<LoteJeringaFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 1000, // Increased from 50 to handle larger datasets
    total: 0,
    totalPages: 0
  });

  // APIs para operaciones CRUD
  const listApi = useApi<{
    lotes: LoteJeringa[];
    total: number;
    pagination: any;
  }>();
  const crudApi = useCrudApi<LoteJeringa>();
  const statsApi = useApi<LoteJeringaStats>();
  const stockBajoApi = useApi<LoteJeringa[]>();
  const byJeringaApi = useApi<LoteJeringa[]>();

  // Estados derivados
  const isLoading = listApi.loading;
  const isLoadingStats = statsApi.loading;
  const error = listApi.error;
  const isCreating = crudApi.create.loading;
  const isUpdating = crudApi.update.loading;
  const isDeleting = crudApi.delete.loading;
  const createError = crudApi.create.error;
  const updateError = crudApi.update.error;
  const deleteError = crudApi.delete.error;

  /**
   * Cargar lotes con filtros
   */
  const loadLotes = useCallback(async (newFilters?: LoteJeringaFilters) => {
    const filtersToUse = newFilters || filters;

    logger.debug('Cargando lotes de jeringas con filtros:', filtersToUse);

    const result = await listApi.execute(() => LoteJeringaService.getAll(filtersToUse));

    if (result) {
      setLotes(result.lotes);
      setPagination(result.pagination);
      setFilters(filtersToUse);
    }
  }, [filters, listApi]);

  /**
   * Cargar estadísticas
   */
  const loadStats = useCallback(async () => {
    logger.debug('Cargando estadísticas de lotes de jeringas');

    const result = await statsApi.execute(() => LoteJeringaService.getStats());

    if (result) {
      setStats(result);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Cargar lotes con stock bajo
   */
  const loadStockBajo = useCallback(async (porcentaje: number = 20) => {
    logger.debug('Cargando lotes con stock bajo', { porcentaje });

    const result = await stockBajoApi.execute(() => LoteJeringaService.getStockBajo(porcentaje));
    
    if (result) {
      setStockBajo(result);
    }
  }, [stockBajoApi]);

  /**
   * Crear nuevo lote de jeringa
   */
  const createLote = useCallback(async (data: CreateLoteJeringaDto): Promise<{ success: boolean; error?: string }> => {
    logger.debug('Creando nuevo lote de jeringa:', data);

    const result = await crudApi.create.executeWithResult(() => LoteJeringaService.create(data));
    
    if (result.success && result.data) {
      // Recargar la lista después de crear
      await loadLotes();
      await loadStats();
      return { success: true };
    }
    
    return { success: false, error: result.error || 'Error al crear el lote de jeringa' };
  }, [crudApi.create, loadLotes, loadStats]);

  /**
   * Actualizar lote de jeringa
   */
  const updateLote = useCallback(async (id: string, data: UpdateLoteJeringaDto): Promise<boolean> => {
    logger.debug('Actualizando lote de jeringa:', { id, data });

    const result = await crudApi.update.execute(() => LoteJeringaService.update(id, data));
    
    if (result) {
      // Actualizar el lote en la lista local
      setLotes(prev => prev.map(lote => 
        lote.id === id ? result : lote
      ));
      await loadStats(); // Recargar estadísticas
      return true;
    }
    
    return false;
  }, [crudApi.update, loadStats]);

  /**
   * Eliminar lote de jeringa
   */
  const deleteLote = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Eliminando lote de jeringa:', { id });

    const result = await crudApi.delete.execute(() => LoteJeringaService.delete(id));
    
    if (result !== null) {
      // Remover el lote de la lista local
      setLotes(prev => prev.filter(lote => lote.id !== id));
      await loadStats(); // Recargar estadísticas
      return true;
    }
    
    return false;
  }, [crudApi.delete, loadStats]);

  /**
   * Obtener lote por ID
   */
  const getLoteById = useCallback(async (id: string): Promise<LoteJeringa | null> => {
    logger.debug('Obteniendo lote por ID:', { id });

    const result = await crudApi.fetch.execute(() => LoteJeringaService.getById(id));
    return result;
  }, [crudApi.fetch]);

  /**
   * Obtener lotes por jeringa específica
   */
  const getLotesByJeringa = useCallback(async (jeringaId: string): Promise<LoteJeringa[]> => {
    logger.debug('Obteniendo lotes por jeringa:', { jeringaId });

    const result = await byJeringaApi.execute(() => LoteJeringaService.getByJeringa(jeringaId));
    return result || [];
  }, [byJeringaApi]);

  /**
   * Buscar lotes
   */
  const search = useCallback(async (searchTerm: string) => {
    const normalizedSearch = searchTerm.trim();
    const newFilters = {
      ...filters,
      search: normalizedSearch || undefined,
      page: 1 // Resetear a la primera página cuando se busca
    };
    
    await loadLotes(newFilters);
  }, [filters, loadLotes]);

  /**
   * Aplicar filtros
   */
  const applyFilters = useCallback(async (newFilters: Partial<LoteJeringaFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      search: typeof newFilters.search === 'string' ? newFilters.search.trim() || undefined : filters.search,
      page: 1 // Resetear a la primera página cuando se cambian filtros
    };
    
    await loadLotes(updatedFilters);
  }, [filters, loadLotes]);

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
    
    await loadLotes(newFilters);
  }, [filters, pagination.totalPages, loadLotes]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadLotes(),
      loadStats(),
      loadStockBajo()
    ]);
  }, [loadLotes, loadStats, loadStockBajo]);

  // Cargar datos iniciales
  useEffect(() => {
    loadLotes();
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Estados principales
    lotes,
    stats,
    stockBajo,
    pagination,
    filters,

    // Estados de carga
    isLoading,
    isLoadingStats,
    isCreating,
    isUpdating,
    isDeleting,

    // Estados de error
    error,
    createError,
    updateError,
    deleteError,

    // Operaciones CRUD
    createLote,
    updateLote,
    deleteLote,
    getLoteById,

    // Operaciones especiales
    getLotesByJeringa,
    loadStockBajo,

    // Filtros y búsqueda
    applyFilters,
    search,
    changePage,
    refresh,

    // Funciones de carga
    loadLotes,
    loadStats
  };
}

export default useLotesJeringas;
