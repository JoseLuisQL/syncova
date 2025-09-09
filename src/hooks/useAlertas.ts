import { useState, useEffect, useCallback } from 'react';
import { Alerta, CreateAlertaDto, UpdateAlertaDto, AlertaFilters, AlertaStats } from '../types';
import { AlertasService } from '../services/alertasService';
import { useApi, useCrudApi } from './useApi';
import { logger } from '../utils/debug';

interface UseAlertasResult {
  // Datos
  alertas: Alerta[];
  alertaActual: Alerta | null;
  stats: AlertaStats | null;
  alertasNoLeidas: Alerta[];
  total: number;
  currentPage: number;
  totalPages: number;
  filters: AlertaFilters;

  // Estados de carga
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingUnread: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isMarkingAsRead: boolean;

  // Errores
  error: string | null;
  statsError: string | null;
  unreadError: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  markAsReadError: string | null;

  // Acciones
  setFilters: (filters: AlertaFilters) => void;
  loadAlertas: (newFilters?: AlertaFilters) => Promise<void>;
  loadStats: () => Promise<void>;
  loadUnreadAlertas: () => Promise<void>;
  createAlerta: (data: CreateAlertaDto) => Promise<Alerta | null>;
  updateAlerta: (id: string, data: UpdateAlertaDto) => Promise<Alerta | null>;
  deleteAlerta: (id: string) => Promise<boolean>;
  getAlertaById: (id: string) => Promise<Alerta | null>;
  markAsRead: (id: string) => Promise<Alerta | null>;
  markMultipleAsRead: (ids: string[]) => Promise<boolean>;
  cleanupOldAlerts: (days?: number) => Promise<boolean>;
  refreshData: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook personalizado para gestión de alertas del sistema
 * Proporciona funcionalidades CRUD y operaciones especiales para alertas
 */
export const useAlertas = (): UseAlertasResult => {
  // Estados locales
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertaActual, setAlertaActual] = useState<Alerta | null>(null);
  const [alertasNoLeidas, setAlertasNoLeidas] = useState<Alerta[]>([]);
  const [filters, setFilters] = useState<AlertaFilters>({});
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // APIs para operaciones CRUD
  const listApi = useApi<{
    alertas: Alerta[];
    total: number;
    pagination: any;
  }>();
  const crudApi = useCrudApi<Alerta>();
  const statsApi = useApi<AlertaStats>();
  const unreadApi = useApi<Alerta[]>();
  const markAsReadApi = useApi<Alerta>();
  const markMultipleApi = useApi<{ count: number }>();
  const cleanupApi = useApi<{ count: number }>();

  // Estados derivados
  const isLoading = listApi.loading;
  const isLoadingStats = statsApi.loading;
  const isLoadingUnread = unreadApi.loading;
  const error = listApi.error;
  const statsError = statsApi.error;
  const unreadError = unreadApi.error;
  const isCreating = crudApi.create.loading;
  const isUpdating = crudApi.update.loading;
  const isDeleting = crudApi.delete.loading;
  const isMarkingAsRead = markAsReadApi.loading || markMultipleApi.loading;
  const createError = crudApi.create.error;
  const updateError = crudApi.update.error;
  const deleteError = crudApi.delete.error;
  const markAsReadError = markAsReadApi.error || markMultipleApi.error;

  /**
   * Cargar alertas con filtros
   */
  const loadAlertas = useCallback(async (newFilters?: AlertaFilters) => {
    // Evitar múltiples llamadas simultáneas
    if (listApi.loading) {
      logger.debug('🔄 useAlertas.loadAlertas - Ya hay una carga en progreso, saltando...');
      return;
    }

    const currentFilters = newFilters || filters;
    
    logger.debug('🔄 useAlertas.loadAlertas - Iniciando carga', { filters: currentFilters });

    const result = await listApi.execute(() => AlertasService.getAll(currentFilters));
    
    if (result) {
      setAlertas(result.alertas);
      setTotal(result.total);
      setCurrentPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
      
      if (newFilters) {
        setFilters(newFilters);
      }
      
      logger.debug('✅ useAlertas.loadAlertas - Carga completada', {
        alertasCount: result.alertas.length,
        total: result.total,
        page: result.pagination.page
      });
    }
  }, [filters, listApi]);

  /**
   * Cargar estadísticas de alertas
   */
  const loadStats = useCallback(async () => {
    logger.debug('🔄 useAlertas.loadStats - Cargando estadísticas');
    
    const result = await statsApi.execute(() => AlertasService.getStats());
    
    if (result) {
      logger.debug('✅ useAlertas.loadStats - Estadísticas cargadas', result);
    }
  }, [statsApi]);

  /**
   * Cargar alertas no leídas
   */
  const loadUnreadAlertas = useCallback(async () => {
    logger.debug('🔄 useAlertas.loadUnreadAlertas - Cargando alertas no leídas');
    
    const result = await unreadApi.execute(() => AlertasService.getUnreadForUser());
    
    if (result) {
      setAlertasNoLeidas(result);
      logger.debug('✅ useAlertas.loadUnreadAlertas - Alertas no leídas cargadas', {
        count: result.length
      });
    }
  }, [unreadApi]);

  /**
   * Crear nueva alerta
   */
  const createAlerta = useCallback(async (data: CreateAlertaDto): Promise<Alerta | null> => {
    logger.debug('🔄 useAlertas.createAlerta - Creando alerta', { data });

    const result = await crudApi.create.execute(() => AlertasService.create(data));

    if (result) {
      // Actualizar la lista local
      setAlertas(prev => [result, ...prev]);
      setTotal(prev => prev + 1);
      
      logger.debug('✅ useAlertas.createAlerta - Alerta creada exitosamente', { id: result.id });
      
      // Recargar datos para mantener sincronización
      await loadAlertas();
      await loadStats();
      await loadUnreadAlertas();
    }

    return result;
  }, [crudApi.create, loadAlertas, loadStats, loadUnreadAlertas]);

  /**
   * Actualizar alerta existente
   */
  const updateAlerta = useCallback(async (id: string, data: UpdateAlertaDto): Promise<Alerta | null> => {
    logger.debug('🔄 useAlertas.updateAlerta - Actualizando alerta', { id, data });

    const result = await crudApi.update.execute(() => AlertasService.update(id, data));

    if (result) {
      // Actualizar la lista local
      setAlertas(prev => prev.map(alerta => alerta.id === id ? result : alerta));
      
      // Actualizar alerta actual si es la misma
      if (alertaActual?.id === id) {
        setAlertaActual(result);
      }
      
      logger.debug('✅ useAlertas.updateAlerta - Alerta actualizada exitosamente', { id });
      
      // Recargar estadísticas y alertas no leídas
      await loadStats();
      await loadUnreadAlertas();
    }

    return result;
  }, [crudApi.update, alertaActual, loadStats, loadUnreadAlertas]);

  /**
   * Eliminar alerta
   */
  const deleteAlerta = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('🔄 useAlertas.deleteAlerta - Eliminando alerta', { id });

    const result = await crudApi.delete.execute(() => AlertasService.delete(id));

    if (result !== null) {
      // Actualizar la lista local
      setAlertas(prev => prev.filter(alerta => alerta.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      
      // Limpiar alerta actual si es la misma
      if (alertaActual?.id === id) {
        setAlertaActual(null);
      }
      
      logger.debug('✅ useAlertas.deleteAlerta - Alerta eliminada exitosamente', { id });
      
      // Recargar datos
      await loadStats();
      await loadUnreadAlertas();
      
      return true;
    }

    return false;
  }, [crudApi.delete, alertaActual, loadStats, loadUnreadAlertas]);

  /**
   * Obtener alerta por ID
   */
  const getAlertaById = useCallback(async (id: string): Promise<Alerta | null> => {
    logger.debug('🔄 useAlertas.getAlertaById - Obteniendo alerta por ID', { id });

    const result = await crudApi.getById.execute(() => AlertasService.getById(id));

    if (result) {
      setAlertaActual(result);
      logger.debug('✅ useAlertas.getAlertaById - Alerta obtenida exitosamente', { id });
    }

    return result;
  }, [crudApi.getById]);

  /**
   * Marcar alerta como leída
   */
  const markAsRead = useCallback(async (id: string): Promise<Alerta | null> => {
    logger.debug('🔄 useAlertas.markAsRead - Marcando alerta como leída', { id });

    const result = await markAsReadApi.execute(() => AlertasService.markAsRead(id));

    if (result) {
      // Actualizar la lista local
      setAlertas(prev => prev.map(alerta => alerta.id === id ? result : alerta));
      
      // Actualizar alerta actual si es la misma
      if (alertaActual?.id === id) {
        setAlertaActual(result);
      }
      
      logger.debug('✅ useAlertas.markAsRead - Alerta marcada como leída', { id });
      
      // Recargar alertas no leídas
      await loadUnreadAlertas();
      await loadStats();
    }

    return result;
  }, [markAsReadApi, alertaActual, loadUnreadAlertas, loadStats]);

  /**
   * Marcar múltiples alertas como leídas
   */
  const markMultipleAsRead = useCallback(async (ids: string[]): Promise<boolean> => {
    logger.debug('🔄 useAlertas.markMultipleAsRead - Marcando múltiples alertas como leídas', { ids });

    const result = await markMultipleApi.execute(() => AlertasService.markMultipleAsRead(ids));

    if (result) {
      logger.debug('✅ useAlertas.markMultipleAsRead - Alertas marcadas como leídas', { 
        count: result.count,
        ids 
      });
      
      // Recargar datos
      await loadAlertas();
      await loadUnreadAlertas();
      await loadStats();
      
      return true;
    }

    return false;
  }, [markMultipleApi, loadAlertas, loadUnreadAlertas, loadStats]);

  /**
   * Limpiar alertas antiguas
   */
  const cleanupOldAlerts = useCallback(async (days: number = 30): Promise<boolean> => {
    logger.debug('🔄 useAlertas.cleanupOldAlerts - Limpiando alertas antiguas', { days });

    const result = await cleanupApi.execute(() => AlertasService.cleanupOldAlerts(days));

    if (result) {
      logger.debug('✅ useAlertas.cleanupOldAlerts - Alertas antiguas eliminadas', { 
        count: result.count 
      });
      
      // Recargar datos
      await loadAlertas();
      await loadStats();
      
      return true;
    }

    return false;
  }, [cleanupApi, loadAlertas, loadStats]);

  /**
   * Refrescar todos los datos
   */
  const refreshData = useCallback(async () => {
    logger.debug('🔄 useAlertas.refreshData - Refrescando todos los datos');
    
    await Promise.all([
      loadAlertas(),
      loadStats(),
      loadUnreadAlertas()
    ]);
    
    logger.debug('✅ useAlertas.refreshData - Datos refrescados');
  }, [loadAlertas, loadStats, loadUnreadAlertas]);

  /**
   * Resetear todos los estados
   */
  const reset = useCallback(() => {
    logger.debug('🔄 useAlertas.reset - Reseteando estados');
    
    setAlertas([]);
    setAlertaActual(null);
    setAlertasNoLeidas([]);
    setFilters({});
    setTotal(0);
    setCurrentPage(1);
    setTotalPages(0);
    
    // Resetear APIs
    listApi.reset();
    crudApi.reset();
    statsApi.reset();
    unreadApi.reset();
    markAsReadApi.reset();
    markMultipleApi.reset();
    cleanupApi.reset();
  }, [listApi, crudApi, statsApi, unreadApi, markAsReadApi, markMultipleApi, cleanupApi]);

  // Cargar datos iniciales
  useEffect(() => {
    loadAlertas();
    loadStats();
    loadUnreadAlertas();
  }, []);

  return {
    // Datos
    alertas,
    alertaActual,
    stats: statsApi.data,
    alertasNoLeidas,
    total,
    currentPage,
    totalPages,
    filters,

    // Estados de carga
    isLoading,
    isLoadingStats,
    isLoadingUnread,
    isCreating,
    isUpdating,
    isDeleting,
    isMarkingAsRead,

    // Errores
    error,
    statsError,
    unreadError,
    createError,
    updateError,
    deleteError,
    markAsReadError,

    // Acciones
    setFilters,
    loadAlertas,
    loadStats,
    loadUnreadAlertas,
    createAlerta,
    updateAlerta,
    deleteAlerta,
    getAlertaById,
    markAsRead,
    markMultipleAsRead,
    cleanupOldAlerts,
    refreshData,
    reset
  };
};
