import { useState, useEffect, useCallback, useRef } from 'react';
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
  deleteMultipleAlertas: (ids: string[]) => Promise<boolean>;
  getAlertaById: (id: string) => Promise<Alerta | null>;
  markAsRead: (id: string) => Promise<Alerta | null>;
  markMultipleAsRead: (ids: string[]) => Promise<boolean>;
  markMultipleAsUnread: (ids: string[]) => Promise<boolean>;
  cleanupOldAlerts: (days?: number) => Promise<boolean>;
  refreshData: () => Promise<void>;
  reset: () => void;
}

export const useAlertas = (): UseAlertasResult => {
  const initialLoadRef = useRef(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertaActual, setAlertaActual] = useState<Alerta | null>(null);
  const [alertasNoLeidas, setAlertasNoLeidas] = useState<Alerta[]>([]);
  const [filters, setFilters] = useState<AlertaFilters>({});
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const listApi = useApi<{
    alertas: Alerta[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>();
  const crudApi = useCrudApi<Alerta>();
  const statsApi = useApi<AlertaStats>();
  const unreadApi = useApi<Alerta[]>();
  const markAsReadApi = useApi<Alerta>();
  const markMultipleApi = useApi<{ count: number }>();
  const cleanupApi = useApi<{ count: number }>();

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

  const loadAlertas = useCallback(async (newFilters?: AlertaFilters) => {
    const currentFilters = newFilters || filters;
    logger.debug('🔄 useAlertas.loadAlertas - Iniciando carga', { filters: currentFilters });

    const result = await listApi.execute(() => AlertasService.getAll(currentFilters));

    if (result && Array.isArray(result.alertas)) {
      setAlertas(result.alertas);
      setTotal(result.total);
      setCurrentPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);

      if (newFilters) {
        setFilters(newFilters);
      }
    }
  }, [filters, listApi.execute]);

  const loadStats = useCallback(async () => {
    await statsApi.execute(() => AlertasService.getStats());
  }, [statsApi.execute]);

  const loadUnreadAlertas = useCallback(async () => {
    const result = await unreadApi.execute(() => AlertasService.getUnreadForUser());
    if (Array.isArray(result)) {
      setAlertasNoLeidas(result);
    }
  }, [unreadApi.execute]);

  const createAlerta = useCallback(async (data: CreateAlertaDto): Promise<Alerta | null> => {
    const result = await crudApi.create.execute(() => AlertasService.create(data));
    if (result) {
      setAlertas((prev) => [result, ...prev]);
      setTotal((prev) => prev + 1);
      await Promise.all([loadStats(), loadUnreadAlertas()]);
    }
    return result;
  }, [crudApi.create.execute, loadStats, loadUnreadAlertas]);

  const updateAlerta = useCallback(async (id: string, data: UpdateAlertaDto): Promise<Alerta | null> => {
    const now = new Date();
    setAlertas((prev) =>
      prev.map((alerta) =>
        alerta.id === id
          ? {
              ...alerta,
              ...data,
              updatedAt: now,
            }
          : alerta,
      ),
    );

    try {
      const result = await AlertasService.update(id, data);
      if (result && result.id) {
        setAlertas((prev) => prev.map((alerta) => (alerta.id === id ? result : alerta)));
        if (alertaActual?.id === id) {
          setAlertaActual(result);
        }
      }
      await Promise.all([loadStats(), loadUnreadAlertas()]);
      return result;
    } catch (err) {
      await loadAlertas();
      throw err;
    }
  }, [alertaActual, loadAlertas, loadStats, loadUnreadAlertas]);

  const deleteAlerta = useCallback(async (id: string): Promise<boolean> => {
    setAlertas((prev) => prev.filter((alerta) => alerta.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    if (alertaActual?.id === id) {
      setAlertaActual(null);
    }

    try {
      await AlertasService.delete(id);
      await Promise.all([loadStats(), loadUnreadAlertas()]);
      return true;
    } catch (err) {
      await loadAlertas();
      throw err;
    }
  }, [alertaActual, loadAlertas, loadStats, loadUnreadAlertas]);

  const deleteMultipleAlertas = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return true;
    const idSet = new Set(ids);

    setAlertas((prev) => prev.filter((alerta) => !idSet.has(alerta.id)));
    setTotal((prev) => Math.max(0, prev - ids.length));
    if (alertaActual && idSet.has(alertaActual.id)) {
      setAlertaActual(null);
    }

    try {
      await Promise.all(ids.map((id) => AlertasService.delete(id)));
      await Promise.all([loadStats(), loadUnreadAlertas()]);
      return true;
    } catch (err) {
      await loadAlertas();
      throw err;
    }
  }, [alertaActual, loadAlertas, loadStats, loadUnreadAlertas]);

  const getAlertaById = useCallback(async (id: string): Promise<Alerta | null> => {
    const result = await crudApi.getById.execute(() => AlertasService.getById(id));
    if (result) {
      setAlertaActual(result);
    }
    return result;
  }, [crudApi.getById.execute]);

  const markAsRead = useCallback(async (id: string): Promise<Alerta | null> => {
    const now = new Date();
    setAlertas((prev) =>
      prev.map((alerta) => (alerta.id === id ? { ...alerta, leida: true, updatedAt: now } : alerta)),
    );

    try {
      const result = await AlertasService.markAsRead(id);
      if (result && result.id) {
        setAlertas((prev) => prev.map((alerta) => (alerta.id === id ? result : alerta)));
        if (alertaActual?.id === id) {
          setAlertaActual(result);
        }
      }
      await Promise.all([loadUnreadAlertas(), loadStats()]);
      return result;
    } catch (err) {
      await loadAlertas();
      throw err;
    }
  }, [alertaActual, loadAlertas, loadUnreadAlertas, loadStats]);

  const markMultipleAsRead = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return true;
    const idSet = new Set(ids);
    const now = new Date();

    setAlertas((prev) =>
      prev.map((alerta) => (idSet.has(alerta.id) ? { ...alerta, leida: true, updatedAt: now } : alerta)),
    );

    try {
      await AlertasService.markMultipleAsRead(ids);
      await Promise.all([loadUnreadAlertas(), loadStats()]);
      return true;
    } catch (err) {
      await loadAlertas();
      throw err;
    }
  }, [loadAlertas, loadUnreadAlertas, loadStats]);

  const markMultipleAsUnread = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return true;
    const idSet = new Set(ids);
    const now = new Date();

    setAlertas((prev) =>
      prev.map((alerta) => (idSet.has(alerta.id) ? { ...alerta, leida: false, updatedAt: now } : alerta)),
    );

    try {
      await Promise.all(ids.map((id) => AlertasService.update(id, { leida: false })));
      await Promise.all([loadUnreadAlertas(), loadStats()]);
      return true;
    } catch (err) {
      await loadAlertas();
      throw err;
    }
  }, [loadAlertas, loadUnreadAlertas, loadStats]);

  const cleanupOldAlerts = useCallback(async (days: number = 30): Promise<boolean> => {
    const result = await cleanupApi.execute(() => AlertasService.cleanupOldAlerts(days));
    if (result) {
      await Promise.all([loadAlertas(), loadStats()]);
      return true;
    }
    return false;
  }, [cleanupApi.execute, loadAlertas, loadStats]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadAlertas(),
      loadStats(),
      loadUnreadAlertas(),
    ]);
  }, [loadAlertas, loadStats, loadUnreadAlertas]);

  const reset = useCallback(() => {
    setAlertas([]);
    setAlertaActual(null);
    setAlertasNoLeidas([]);
    setFilters({});
    setTotal(0);
    setCurrentPage(1);
    setTotalPages(0);

    listApi.reset();
    crudApi.reset();
    statsApi.reset();
    unreadApi.reset();
    markAsReadApi.reset();
    markMultipleApi.reset();
    cleanupApi.reset();
  }, [listApi, crudApi, statsApi, unreadApi, markAsReadApi, markMultipleApi, cleanupApi]);

  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    void loadAlertas();
    void loadStats();
    void loadUnreadAlertas();
  }, [loadAlertas, loadStats, loadUnreadAlertas]);

  return {
    alertas,
    alertaActual,
    stats: statsApi.data,
    alertasNoLeidas,
    total,
    currentPage,
    totalPages,
    filters,

    isLoading,
    isLoadingStats,
    isLoadingUnread,
    isCreating,
    isUpdating,
    isDeleting,
    isMarkingAsRead,

    error,
    statsError,
    unreadError,
    createError,
    updateError,
    deleteError,
    markAsReadError,

    setFilters,
    loadAlertas,
    loadStats,
    loadUnreadAlertas,
    createAlerta,
    updateAlerta,
    deleteAlerta,
    deleteMultipleAlertas,
    getAlertaById,
    markAsRead,
    markMultipleAsRead,
    markMultipleAsUnread,
    cleanupOldAlerts,
    refreshData,
    reset,
  };
};
