import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../config/api';
import type { CentroAcopioStatus, AlertaReciente, ActividadReciente } from '../services/dashboardService';
import type { Establecimiento } from '../types';

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

interface UsePaginatedSectionResult<T> {
  data: T[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  currentPage: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

const createInitialPagination = (limit: number): PaginationInfo => ({
  page: 1,
  limit,
  total: 0,
  totalPages: 0
});

// Hook para centros de acopio con paginacion
export const usePaginatedCentrosAcopio = (initialLimit: number = 5): UsePaginatedSectionResult<CentroAcopioStatus> => {
  const [data, setData] = useState<CentroAcopioStatus[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(() => createInitialPagination(initialLimit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/dashboard/centros-acopio?page=${page}&limit=${initialLimit}`);
      
      if (!mountedRef.current) return;
      
      if (response.data.success) {
        const paginatedData = response.data.data as PaginatedResponse<CentroAcopioStatus>;
        setData(paginatedData.data);
        setPagination(paginatedData.pagination);
      } else {
        setError(response.data.message || 'Error al cargar centros de acopio');
      }
    } catch {
      if (!mountedRef.current) return;
      setError('Error de conexion al cargar centros de acopio');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [initialLimit]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(1);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    currentPage,
    setPage,
    refresh
  };
};

// Hook para alertas recientes con paginacion
export const usePaginatedAlertas = (initialLimit: number = 3): UsePaginatedSectionResult<AlertaReciente> => {
  const [data, setData] = useState<AlertaReciente[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(() => createInitialPagination(initialLimit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/dashboard/alertas?page=${page}&limit=${initialLimit}`);
      
      if (!mountedRef.current) return;
      
      if (response.data.success) {
        const paginatedData = response.data.data as PaginatedResponse<AlertaReciente>;
        setData(paginatedData.data);
        setPagination(paginatedData.pagination);
      } else {
        setError(response.data.message || 'Error al cargar alertas');
      }
    } catch {
      if (!mountedRef.current) return;
      setError('Error de conexion al cargar alertas');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [initialLimit]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(1);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    currentPage,
    setPage,
    refresh
  };
};

// Hook para actividad reciente con paginacion
export const usePaginatedActividad = (initialLimit: number = 5): UsePaginatedSectionResult<ActividadReciente> => {
  const [data, setData] = useState<ActividadReciente[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(() => createInitialPagination(initialLimit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/dashboard/actividad?page=${page}&limit=${initialLimit}`);
      
      if (!mountedRef.current) return;
      
      if (response.data.success) {
        const paginatedData = response.data.data as PaginatedResponse<ActividadReciente>;
        setData(paginatedData.data);
        setPagination(paginatedData.pagination);
      } else {
        setError(response.data.message || 'Error al cargar actividad');
      }
    } catch {
      if (!mountedRef.current) return;
      setError('Error de conexion al cargar actividad');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [initialLimit]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(1);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    currentPage,
    setPage,
    refresh
  };
};

export const usePaginatedEstablecimientosDashboard = (initialLimit: number = 5): UsePaginatedSectionResult<Establecimiento> => {
  const [data, setData] = useState<Establecimiento[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>(() => createInitialPagination(initialLimit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/establecimientos?page=${page}&limit=${initialLimit}`);
      
      if (!mountedRef.current) return;
      
      if (response.data.success) {
        const payload = response.data.data;
        if (Array.isArray(payload)) {
          setData(payload as Establecimiento[]);
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          } else {
            setPagination(createInitialPagination(payload.length));
          }
        } else if (payload && Array.isArray(payload.data)) {
          setData(payload.data);
          setPagination(payload.pagination || response.data.pagination);
        } else if (payload && Array.isArray(payload.establecimientos)) {
          setData(payload.establecimientos);
          setPagination(payload.pagination || response.data.pagination);
        } else {
          setData([]);
        }
      } else {
        setError(response.data.message || 'Error al cargar establecimientos');
      }
    } catch {
      if (!mountedRef.current) return;
      setError('Error de conexion al cargar establecimientos');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [initialLimit]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(1);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    currentPage,
    setPage,
    refresh
  };
};
