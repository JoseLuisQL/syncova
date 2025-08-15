import { useState, useEffect, useCallback } from 'react';
import { Microred, CreateMicroredDto, UpdateMicroredDto, MicroredFilters } from '../types';
import microredesService from '../services/microredesService';
import { logger } from '../utils/debug';

interface UseMicroredesResult {
  microredes: Microred[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  filters: MicroredFilters;
  setFilters: (filters: MicroredFilters) => void;
  fetchMicroredes: () => Promise<void>;
  createMicrored: (data: CreateMicroredDto) => Promise<boolean>;
  updateMicrored: (id: string, data: UpdateMicroredDto) => Promise<boolean>;
  deleteMicrored: (id: string) => Promise<boolean>;
  getMicroredById: (id: string) => Promise<Microred | null>;
  getMicroredesByRed: (redId: string) => Promise<Microred[]>;
}

export const useMicroredes = (initialFilters: MicroredFilters = {}): UseMicroredesResult => {
  const [microredes, setMicroredes] = useState<Microred[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFiltersState] = useState<MicroredFilters>(initialFilters);

  const setFilters = useCallback((newFilters: MicroredFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(newFilters.page || 1);
  }, []);

  const fetchMicroredes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Cargando microredes con filtros:', filters);

      const response = await microredesService.getMicroredes(filters);

      if (response.success) {
        setMicroredes(response.data || []);
        setTotal(response.pagination?.total || 0);
        setCurrentPage(response.pagination?.page || 1);
        setTotalPages(response.pagination?.totalPages || 0);

        logger.info(`Microredes cargadas: ${response.data?.length || 0}`);
      } else {
        throw new Error(response.message || 'Error al obtener microredes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al cargar microredes:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createMicrored = useCallback(async (data: CreateMicroredDto): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Creando microred:', data);

      const response = await microredesService.createMicrored(data);

      if (response.success) {
        logger.info('Microred creada exitosamente:', response.data);
        await fetchMicroredes(); // Recargar la lista
        return true;
      } else {
        throw new Error(response.message || 'Error al crear microred');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al crear microred:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMicroredes]);

  const updateMicrored = useCallback(async (id: string, data: UpdateMicroredDto): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Actualizando microred:', { id, data });

      const response = await microredesService.updateMicrored(id, data);

      if (response.success) {
        logger.info('Microred actualizada exitosamente:', response.data);
        await fetchMicroredes(); // Recargar la lista
        return true;
      } else {
        throw new Error(response.message || 'Error al actualizar microred');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al actualizar microred:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMicroredes]);

  const deleteMicrored = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Eliminando microred:', id);

      const response = await microredesService.deleteMicrored(id);

      if (response.success) {
        logger.info('Microred eliminada exitosamente');
        await fetchMicroredes(); // Recargar la lista
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar microred');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al eliminar microred:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMicroredes]);

  const getMicroredById = useCallback(async (id: string): Promise<Microred | null> => {
    try {
      logger.debug('Obteniendo microred por ID:', id);

      const response = await microredesService.getMicroredById(id);

      if (response.success) {
        return response.data || null;
      } else {
        throw new Error(response.message || 'Error al obtener microred');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al obtener microred por ID:', err);
      return null;
    }
  }, []);

  const getMicroredesByRed = useCallback(async (redId: string): Promise<Microred[]> => {
    try {
      logger.debug('Obteniendo microredes por red:', redId);

      const microredes = await microredesService.getMicroredesByRed(redId);

      logger.info(`Microredes obtenidas para red ${redId}:`, microredes.length);
      return microredes;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al obtener microredes por red:', err);
      return [];
    }
  }, []);

  // Fetch microredes when filters change
  useEffect(() => {
    fetchMicroredes();
  }, [fetchMicroredes]);

  return {
    microredes,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    fetchMicroredes,
    createMicrored,
    updateMicrored,
    deleteMicrored,
    getMicroredById,
    getMicroredesByRed,
  };
};

export default useMicroredes;
