import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardService, DashboardData, DashboardStats } from '../services/dashboardService';
import { useApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Estado del hook de dashboard
 */
interface DashboardState {
  data: DashboardData | null;
  estadisticas: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook personalizado para gestión del dashboard con datos en tiempo real
 */
export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    estadisticas: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  // APIs para diferentes operaciones
  const dashboardApi = useApi<DashboardData>();
  const estadisticasApi = useApi<DashboardStats>();

  // Referencia para el intervalo de actualización automática
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cargar todos los datos del dashboard
   */
  const loadDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    logger.debug('🔄 useDashboard.loadDashboardData - Iniciando carga');

    const result = await dashboardApi.execute(() => DashboardService.getDashboardData());

    if (result) {
      setState(prev => ({
        ...prev,
        data: result,
        estadisticas: result.estadisticas,
        loading: false,
        lastUpdated: new Date()
      }));

      logger.debug('✅ useDashboard.loadDashboardData - Datos cargados exitosamente');
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
        error: dashboardApi.error || 'Error al cargar datos del dashboard'
      }));

      logger.error('❌ useDashboard.loadDashboardData - Error al cargar datos');
    }
  }, [dashboardApi]);

  /**
   * Cargar solo las estadísticas (más rápido para actualizaciones frecuentes)
   */
  const loadEstadisticas = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    logger.debug('📊 useDashboard.loadEstadisticas - Cargando estadísticas');

    const result = await estadisticasApi.execute(() => DashboardService.getEstadisticas());

    if (result) {
      setState(prev => ({
        ...prev,
        estadisticas: result,
        loading: false,
        lastUpdated: new Date()
      }));

      logger.debug('✅ useDashboard.loadEstadisticas - Estadísticas cargadas');
    } else {
      if (showLoading) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: estadisticasApi.error || 'Error al cargar estadísticas'
        }));
      }

      logger.error('❌ useDashboard.loadEstadisticas - Error al cargar estadísticas');
    }
  }, [estadisticasApi]);

  /**
   * Refrescar datos completos
   */
  const refresh = useCallback(async () => {
    await loadDashboardData(true);
  }, [loadDashboardData]);

  /**
   * Actualización silenciosa (sin mostrar loading)
   */
  const silentRefresh = useCallback(async () => {
    await loadDashboardData(false);
  }, [loadDashboardData]);

  /**
   * Iniciar actualizaciones automáticas
   */
  const startAutoRefresh = useCallback((intervalMs: number = 30000) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      logger.debug('🔄 useDashboard - Actualización automática');
      loadEstadisticas(false); // Actualizar solo estadísticas para mejor rendimiento
    }, intervalMs);

    logger.debug(`🔄 useDashboard - Auto-refresh iniciado cada ${intervalMs}ms`);
  }, [loadEstadisticas]);

  /**
   * Detener actualizaciones automáticas
   */
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      logger.debug('⏹️ useDashboard - Auto-refresh detenido');
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Efecto para cargar datos iniciales (solo una vez)
   */
  useEffect(() => {
    loadDashboardData(true);
  }, []); // Sin dependencias para evitar bucles infinitos

  /**
   * Efecto para limpiar intervalos al desmontar
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // Estado
    data: state.data,
    estadisticas: state.estadisticas,
    loading: state.loading || dashboardApi.loading || estadisticasApi.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Estados de APIs individuales
    dashboardLoading: dashboardApi.loading,
    estadisticasLoading: estadisticasApi.loading,
    dashboardError: dashboardApi.error,
    estadisticasError: estadisticasApi.error,

    // Funciones
    loadDashboardData,
    loadEstadisticas,
    refresh,
    silentRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    clearError,

    // Datos específicos (con fallbacks seguros)
    movimientosMensuales: state.data?.movimientosMensuales || [],
    stockPorVacuna: state.data?.stockPorVacuna || [],
    centrosAcopio: state.data?.centrosAcopio || [],
    alertasRecientes: state.data?.alertasRecientes || [],
    actividadReciente: state.data?.actividadReciente || [],

    // Indicadores de estado
    hasData: !!state.data,
    hasEstadisticas: !!state.estadisticas,
    isStale: state.lastUpdated ? (Date.now() - state.lastUpdated.getTime()) > 60000 : true, // Datos obsoletos después de 1 minuto
  };
}
