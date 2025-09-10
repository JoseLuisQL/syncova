import { useState, useEffect, useCallback } from 'react';
import { Red, CreateRedDto, UpdateRedDto, RedFilters } from '@/types';
import { getApiBaseUrl } from '../utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();

interface UseRedesResult {
  redes: Red[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  filters: RedFilters;
  setFilters: (filters: RedFilters) => void;
  fetchRedes: () => Promise<void>;
  createRed: (data: CreateRedDto) => Promise<Red | null>;
  updateRed: (id: string, data: UpdateRedDto) => Promise<Red | null>;
  deleteRed: (id: string) => Promise<boolean>;
  getRedById: (id: string) => Promise<Red | null>;
}

export const useRedes = (initialFilters: RedFilters = {}): UseRedesResult => {
  const [redes, setRedes] = useState<Red[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFiltersState] = useState<RedFilters>(initialFilters);

  const setFilters = useCallback((newFilters: RedFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(newFilters.page || 1);
  }, []);

  const fetchRedes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (filters.estado) queryParams.append('estado', filters.estado);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/redes?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sivac_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token and redirect to login
          localStorage.removeItem('sivac_auth_token');
          localStorage.removeItem('sivac_refresh_token');
          localStorage.removeItem('sivac_user');
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setRedes(data.data || []);
        setTotal(data.pagination?.total || 0);
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.totalPages || 0);
      } else {
        throw new Error(data.message || 'Error al obtener redes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching redes:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createRed = useCallback(async (data: CreateRedDto): Promise<Red | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/redes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sivac_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        await fetchRedes(); // Refresh the list
        return result.data;
      } else {
        throw new Error(result.message || 'Error al crear red');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error creating red:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchRedes]);

  const updateRed = useCallback(async (id: string, data: UpdateRedDto): Promise<Red | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/redes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sivac_auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        await fetchRedes(); // Refresh the list
        return result.data;
      } else {
        throw new Error(result.message || 'Error al actualizar red');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error updating red:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchRedes]);

  const deleteRed = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/redes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sivac_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        await fetchRedes(); // Refresh the list
        return true;
      } else {
        throw new Error(result.message || 'Error al eliminar red');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error deleting red:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRedes]);

  const getRedById = useCallback(async (id: string): Promise<Red | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/redes/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sivac_auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error al obtener red');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching red by id:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch redes when filters change
  useEffect(() => {
    fetchRedes();
  }, [fetchRedes]);

  return {
    redes,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    fetchRedes,
    createRed,
    updateRed,
    deleteRed,
    getRedById,
  };
};

export default useRedes;
