import { useState, useEffect, useCallback } from 'react';
import {
  Lote,
  CreateLoteVacunaDto,
  UpdateLoteVacunaDto,
  LoteVacunaFilters,
  LoteVacunaStats
} from '../types';
import LoteVacunaService from '../services/loteVacunaService';
import { useApi, useCrudApi } from './useApi';
import { logger } from '../utils/debug';
import { getDefaultLimit } from '../config/pagination';

/**
 * Hook personalizado para gestión de lotes de vacunas
 */
export function useLotesVacunas(initialFilters?: LoteVacunaFilters) {
  // Estados principales
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [stats, setStats] = useState<LoteVacunaStats | null>(null);
  const [proximosVencer, setProximosVencer] = useState<Lote[]>([]);
  const [filters, setFilters] = useState<LoteVacunaFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: getDefaultLimit('LOTES_VACUNAS'), // Use configurable default limit
    total: 0,
    totalPages: 0
  });

  // APIs para operaciones CRUD
  const listApi = useApi<{
    lotes: Lote[];
    total: number;
    pagination: any;
  }>();
  const crudApi = useCrudApi<Lote>();
  const statsApi = useApi<LoteVacunaStats>();
  const proximosVencerApi = useApi<Lote[]>();
  const byVacunaApi = useApi<Lote[]>();

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
  const loadLotes = useCallback(async (newFilters?: LoteVacunaFilters) => {
    const filtersToUse = newFilters || filters;

    logger.debug('Cargando lotes de vacunas con filtros:', filtersToUse);

    const result = await listApi.execute(() => LoteVacunaService.getAll(filtersToUse));

    if (result) {
      setLotes(result.lotes);
      setPagination(result.pagination);
      setFilters(filtersToUse);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Cargar estadísticas
   */
  const loadStats = useCallback(async () => {
    logger.debug('Cargando estadísticas de lotes de vacunas');

    const result = await statsApi.execute(() => LoteVacunaService.getStats());

    if (result) {
      setStats(result);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Cargar lotes próximos a vencer
   */
  const loadProximosVencer = useCallback(async (dias: number = 30) => {
    logger.debug('Cargando lotes próximos a vencer', { dias });

    const result = await proximosVencerApi.execute(() => LoteVacunaService.getProximosVencer(dias));
    
    if (result) {
      setProximosVencer(result);
    }
  }, [proximosVencerApi]);

  /**
   * Crear nuevo lote de vacuna
   */
  const createLote = useCallback(async (data: CreateLoteVacunaDto): Promise<boolean> => {
    logger.debug('Creando nuevo lote de vacuna:', data);

    const result = await crudApi.create.execute(() => LoteVacunaService.create(data));
    
    if (result) {
      // Recargar la lista después de crear
      await loadLotes();
      await loadStats();
      return true;
    }
    
    return false;
  }, [crudApi.create, loadLotes, loadStats]);

  /**
   * Actualizar lote de vacuna
   */
  const updateLote = useCallback(async (id: string, data: UpdateLoteVacunaDto): Promise<boolean> => {
    logger.debug('Actualizando lote de vacuna:', { id, data });

    const result = await crudApi.update.execute(() => LoteVacunaService.update(id, data));
    
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
   * Eliminar lote de vacuna
   */
  const deleteLote = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Eliminando lote de vacuna:', { id });

    const result = await crudApi.delete.execute(() => LoteVacunaService.delete(id));
    
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
  const getLoteById = useCallback(async (id: string): Promise<Lote | null> => {
    logger.debug('Obteniendo lote por ID:', { id });

    const result = await crudApi.getById.execute(() => LoteVacunaService.getById(id));
    return result;
  }, [crudApi.getById]);

  /**
   * Obtener lotes por vacuna específica
   */
  const getLotesByVacuna = useCallback(async (vacunaId: string): Promise<Lote[]> => {
    logger.debug('Obteniendo lotes por vacuna:', { vacunaId });

    const result = await byVacunaApi.execute(() => LoteVacunaService.getByVacuna(vacunaId));
    return result || [];
  }, [byVacunaApi]);

  /**
   * Buscar lotes
   */
  const search = useCallback(async (searchTerm: string) => {
    const newFilters = {
      ...filters,
      search: searchTerm,
      page: 1 // Resetear a la primera página cuando se busca
    };
    
    await loadLotes(newFilters);
  }, [filters, loadLotes]);

  /**
   * Aplicar filtros
   */
  const applyFilters = useCallback(async (newFilters: Partial<LoteVacunaFilters>) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
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
      loadProximosVencer()
    ]);
  }, [loadLotes, loadStats, loadProximosVencer]);

  // Cargar datos iniciales
  useEffect(() => {
    loadLotes();
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Estados principales
    lotes,
    stats,
    proximosVencer,
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
    getLotesByVacuna,
    loadProximosVencer,

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

export default useLotesVacunas;
