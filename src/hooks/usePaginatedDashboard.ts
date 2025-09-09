import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboardService';
import type { CentroAcopioStatus, AlertaReciente, ActividadReciente } from '@/types/dashboard';

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

// Hook para centros de acopio con paginación
export const usePaginatedCentrosAcopio = (initialLimit: number = 5): UsePaginatedSectionResult<CentroAcopioStatus> => {
  const [data, setData] = useState<CentroAcopioStatus[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dashboard/centros-acopio?page=${page}&limit=${initialLimit}`);
      const result = await response.json();
      
      if (result.success) {
        const paginatedData = result.data as PaginatedResponse<CentroAcopioStatus>;
        setData(paginatedData.data);
        setPagination(paginatedData.pagination);
      } else {
        setError(result.message || 'Error al cargar centros de acopio');
      }
    } catch (err) {
      setError('Error de conexión al cargar centros de acopio');
      console.error('Error fetching centros acopio:', err);
    } finally {
      setLoading(false);
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
    fetchData(1);
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

// Hook para alertas recientes con paginación
export const usePaginatedAlertas = (initialLimit: number = 3): UsePaginatedSectionResult<AlertaReciente> => {
  const [data, setData] = useState<AlertaReciente[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dashboard/alertas?page=${page}&limit=${initialLimit}`);
      const result = await response.json();
      
      if (result.success) {
        const paginatedData = result.data as PaginatedResponse<AlertaReciente>;
        setData(paginatedData.data);
        setPagination(paginatedData.pagination);
      } else {
        setError(result.message || 'Error al cargar alertas');
      }
    } catch (err) {
      setError('Error de conexión al cargar alertas');
      console.error('Error fetching alertas:', err);
    } finally {
      setLoading(false);
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
    fetchData(1);
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

// Hook para actividad reciente con paginación
export const usePaginatedActividad = (initialLimit: number = 5): UsePaginatedSectionResult<ActividadReciente> => {
  const [data, setData] = useState<ActividadReciente[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dashboard/actividad?page=${page}&limit=${initialLimit}`);
      const result = await response.json();
      
      if (result.success) {
        const paginatedData = result.data as PaginatedResponse<ActividadReciente>;
        setData(paginatedData.data);
        setPagination(paginatedData.pagination);
      } else {
        setError(result.message || 'Error al cargar actividad');
      }
    } catch (err) {
      setError('Error de conexión al cargar actividad');
      console.error('Error fetching actividad:', err);
    } finally {
      setLoading(false);
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
    fetchData(1);
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
