import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../config/api';
import type { CentroAcopioStatus, AlertaReciente, ActividadReciente } from '../services/dashboardService';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

interface SectionState<T> {
  data: T[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  currentPage: number;
}

const initialPagination: PaginationInfo = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 0
};

const createInitialState = <T>(limit: number): SectionState<T> => ({
  data: [],
  pagination: { ...initialPagination, limit },
  loading: false,
  error: null,
  currentPage: 1
});

interface DashboardSectionsConfig {
  centrosLimit?: number;
  alertasLimit?: number;
  actividadLimit?: number;
}

interface UseDashboardSectionsResult {
  centros: SectionState<CentroAcopioStatus>;
  alertas: SectionState<AlertaReciente>;
  actividad: SectionState<ActividadReciente>;
  loading: boolean;
  setCentrosPage: (page: number) => void;
  setAlertasPage: (page: number) => void;
  setActividadPage: (page: number) => void;
  refreshCentros: () => void;
  refreshAlertas: () => void;
  refreshActividad: () => void;
  refreshAll: () => void;
}

export function useDashboardSections(config: DashboardSectionsConfig = {}): UseDashboardSectionsResult {
  const { centrosLimit = 5, alertasLimit = 4, actividadLimit = 5 } = config;

  const [centros, setCentros] = useState<SectionState<CentroAcopioStatus>>(() => 
    createInitialState<CentroAcopioStatus>(centrosLimit)
  );
  const [alertas, setAlertas] = useState<SectionState<AlertaReciente>>(() => 
    createInitialState<AlertaReciente>(alertasLimit)
  );
  const [actividad, setActividad] = useState<SectionState<ActividadReciente>>(() => 
    createInitialState<ActividadReciente>(actividadLimit)
  );

  const mountedRef = useRef(true);
  const initialLoadRef = useRef(false);

  const fetchCentros = useCallback(async (page: number, showLoading = true) => {
    if (showLoading) {
      setCentros(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const response = await apiClient.get(`/dashboard/centros-acopio?page=${page}&limit=${centrosLimit}`);
      
      if (!mountedRef.current) return;

      if (response.data.success) {
        const paginatedData = response.data.data as PaginatedResponse<CentroAcopioStatus>;
        setCentros(prev => ({
          ...prev,
          data: paginatedData.data,
          pagination: paginatedData.pagination,
          loading: false,
          currentPage: page
        }));
      } else {
        setCentros(prev => ({
          ...prev,
          loading: false,
          error: response.data.message || 'Error al cargar centros de acopio'
        }));
      }
    } catch {
      if (!mountedRef.current) return;
      setCentros(prev => ({
        ...prev,
        loading: false,
        error: 'Error de conexion al cargar centros de acopio'
      }));
    }
  }, [centrosLimit]);

  const fetchAlertas = useCallback(async (page: number, showLoading = true) => {
    if (showLoading) {
      setAlertas(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const response = await apiClient.get(`/dashboard/alertas?page=${page}&limit=${alertasLimit}`);
      
      if (!mountedRef.current) return;

      if (response.data.success) {
        const paginatedData = response.data.data as PaginatedResponse<AlertaReciente>;
        setAlertas(prev => ({
          ...prev,
          data: paginatedData.data,
          pagination: paginatedData.pagination,
          loading: false,
          currentPage: page
        }));
      } else {
        setAlertas(prev => ({
          ...prev,
          loading: false,
          error: response.data.message || 'Error al cargar alertas'
        }));
      }
    } catch {
      if (!mountedRef.current) return;
      setAlertas(prev => ({
        ...prev,
        loading: false,
        error: 'Error de conexion al cargar alertas'
      }));
    }
  }, [alertasLimit]);

  const fetchActividad = useCallback(async (page: number, showLoading = true) => {
    if (showLoading) {
      setActividad(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const response = await apiClient.get(`/dashboard/actividad?page=${page}&limit=${actividadLimit}`);
      
      if (!mountedRef.current) return;

      if (response.data.success) {
        const paginatedData = response.data.data as PaginatedResponse<ActividadReciente>;
        setActividad(prev => ({
          ...prev,
          data: paginatedData.data,
          pagination: paginatedData.pagination,
          loading: false,
          currentPage: page
        }));
      } else {
        setActividad(prev => ({
          ...prev,
          loading: false,
          error: response.data.message || 'Error al cargar actividad'
        }));
      }
    } catch {
      if (!mountedRef.current) return;
      setActividad(prev => ({
        ...prev,
        loading: false,
        error: 'Error de conexion al cargar actividad'
      }));
    }
  }, [actividadLimit]);

  const loadAllParallel = useCallback(async () => {
    setCentros(prev => ({ ...prev, loading: true, error: null }));
    setAlertas(prev => ({ ...prev, loading: true, error: null }));
    setActividad(prev => ({ ...prev, loading: true, error: null }));

    await Promise.all([
      fetchCentros(1, false),
      fetchAlertas(1, false),
      fetchActividad(1, false)
    ]);
  }, [fetchCentros, fetchAlertas, fetchActividad]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadAllParallel();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [loadAllParallel]);

  const setCentrosPage = useCallback((page: number) => {
    fetchCentros(page);
  }, [fetchCentros]);

  const setAlertasPage = useCallback((page: number) => {
    fetchAlertas(page);
  }, [fetchAlertas]);

  const setActividadPage = useCallback((page: number) => {
    fetchActividad(page);
  }, [fetchActividad]);

  const refreshCentros = useCallback(() => {
    fetchCentros(centros.currentPage);
  }, [fetchCentros, centros.currentPage]);

  const refreshAlertas = useCallback(() => {
    fetchAlertas(alertas.currentPage);
  }, [fetchAlertas, alertas.currentPage]);

  const refreshActividad = useCallback(() => {
    fetchActividad(actividad.currentPage);
  }, [fetchActividad, actividad.currentPage]);

  const refreshAll = useCallback(() => {
    loadAllParallel();
  }, [loadAllParallel]);

  const loading = centros.loading || alertas.loading || actividad.loading;

  return {
    centros,
    alertas,
    actividad,
    loading,
    setCentrosPage,
    setAlertasPage,
    setActividadPage,
    refreshCentros,
    refreshAlertas,
    refreshActividad,
    refreshAll
  };
}
