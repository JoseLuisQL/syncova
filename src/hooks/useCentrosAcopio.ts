import { useState, useEffect, useCallback } from 'react';
import { CentroAcopio, CreateCentroAcopioDto, UpdateCentroAcopioDto, CentroAcopioFilters } from '../types';
import centrosAcopioService from '../services/centrosAcopioService';
import { logger } from '../utils/debug';

interface UseCentrosAcopioResult {
  centrosAcopio: CentroAcopio[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
  filters: CentroAcopioFilters;
  setFilters: (filters: CentroAcopioFilters) => void;
  fetchCentrosAcopio: () => Promise<void>;
  createCentroAcopio: (data: CreateCentroAcopioDto) => Promise<boolean>;
  updateCentroAcopio: (id: string, data: UpdateCentroAcopioDto) => Promise<boolean>;
  deleteCentroAcopio: (id: string) => Promise<boolean>;
  getCentroAcopioById: (id: string) => Promise<CentroAcopio | null>;
  getCentrosAcopioByMicrored: (microredId: string) => Promise<CentroAcopio[]>;
  getCentrosAcopioByRed: (redId: string) => Promise<CentroAcopio[]>;
}

export const useCentrosAcopio = (initialFilters: CentroAcopioFilters = {}): UseCentrosAcopioResult => {
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFiltersState] = useState<CentroAcopioFilters>(initialFilters);

  const setFilters = useCallback((newFilters: CentroAcopioFilters) => {
    setFiltersState(newFilters);
    setCurrentPage(newFilters.page || 1);
  }, []);

  const fetchCentrosAcopio = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Cargando centros de acopio con filtros:', filters);

      const response = await centrosAcopioService.getCentrosAcopio(filters);

      if (response.success) {
        setCentrosAcopio(response.data || []);
        setTotal(response.pagination?.total || 0);
        setCurrentPage(response.pagination?.page || 1);
        setTotalPages(response.pagination?.totalPages || 0);

        logger.info(`Centros de acopio cargados: ${response.data?.length || 0}`);
      } else {
        throw new Error(response.message || 'Error al obtener centros de acopio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al cargar centros de acopio:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCentroAcopio = useCallback(async (data: CreateCentroAcopioDto): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Creando centro de acopio:', data);

      const response = await centrosAcopioService.createCentroAcopio(data);

      if (response.success) {
        logger.info('Centro de acopio creado exitosamente:', response.data);
        await fetchCentrosAcopio(); // Recargar la lista
        return true;
      } else {
        throw new Error(response.message || 'Error al crear centro de acopio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al crear centro de acopio:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCentrosAcopio]);

  const updateCentroAcopio = useCallback(async (id: string, data: UpdateCentroAcopioDto): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Actualizando centro de acopio:', { id, data });

      const response = await centrosAcopioService.updateCentroAcopio(id, data);

      if (response.success) {
        logger.info('Centro de acopio actualizado exitosamente:', response.data);
        await fetchCentrosAcopio(); // Recargar la lista
        return true;
      } else {
        throw new Error(response.message || 'Error al actualizar centro de acopio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al actualizar centro de acopio:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCentrosAcopio]);

  const deleteCentroAcopio = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      logger.debug('Eliminando centro de acopio:', id);

      const response = await centrosAcopioService.deleteCentroAcopio(id);

      if (response.success) {
        logger.info('Centro de acopio eliminado exitosamente');
        await fetchCentrosAcopio(); // Recargar la lista
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar centro de acopio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al eliminar centro de acopio:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCentrosAcopio]);

  const getCentroAcopioById = useCallback(async (id: string): Promise<CentroAcopio | null> => {
    try {
      logger.debug('Obteniendo centro de acopio por ID:', id);

      const response = await centrosAcopioService.getCentroAcopioById(id);

      if (response.success) {
        return response.data || null;
      } else {
        throw new Error(response.message || 'Error al obtener centro de acopio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al obtener centro de acopio por ID:', err);
      return null;
    }
  }, []);

  const getCentrosAcopioByMicrored = useCallback(async (microredId: string): Promise<CentroAcopio[]> => {
    try {
      logger.debug('Obteniendo centros de acopio por microred:', microredId);

      const centros = await centrosAcopioService.getCentrosAcopioByMicrored(microredId);

      logger.info(`Centros de acopio obtenidos para microred ${microredId}:`, centros.length);
      return centros;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al obtener centros de acopio por microred:', err);
      return [];
    }
  }, []);

  const getCentrosAcopioByRed = useCallback(async (redId: string): Promise<CentroAcopio[]> => {
    try {
      logger.debug('Obteniendo centros de acopio por red:', redId);

      const centros = await centrosAcopioService.getCentrosAcopioByRed(redId);

      logger.info(`Centros de acopio obtenidos para red ${redId}:`, centros.length);
      return centros;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error al obtener centros de acopio por red:', err);
      return [];
    }
  }, []);

  // Fetch centros de acopio when filters change
  useEffect(() => {
    fetchCentrosAcopio();
  }, [fetchCentrosAcopio]);

  return {
    centrosAcopio,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    fetchCentrosAcopio,
    createCentroAcopio,
    updateCentroAcopio,
    deleteCentroAcopio,
    getCentroAcopioById,
    getCentrosAcopioByMicrored,
    getCentrosAcopioByRed,
  };
};

export default useCentrosAcopio;
