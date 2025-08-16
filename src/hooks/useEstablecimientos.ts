
import { useState, useEffect, useCallback } from 'react';
import {
  Establecimiento,
  CreateEstablecimientoDto,
  UpdateEstablecimientoDto,
  EstablecimientoFilters,
  CentroAcopio
} from '../types';
import EstablecimientoService from '../services/establecimientoService';
import { useApi, useCrudApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook personalizado para gestión de establecimientos
 */
export function useEstablecimientos(initialFilters?: EstablecimientoFilters) {
  // Estados principales
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [filters, setFilters] = useState<EstablecimientoFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: initialFilters?.page || 1,
    limit: initialFilters?.limit || 50,
    total: 0,
    totalPages: 0
  });

  // APIs para operaciones CRUD
  const listApi = useApi<{
    establecimientos: Establecimiento[];
    total: number;
    pagination: any;
  }>();
  const crudApi = useCrudApi<Establecimiento>();
  const centrosApi = useApi<CentroAcopio[]>();

  /**
   * Cargar establecimientos con filtros
   */
  const loadEstablecimientos = useCallback(async (newFilters?: EstablecimientoFilters) => {
    // Evitar múltiples llamadas simultáneas
    if (listApi.isLoading) {
      logger.debug('🔄 useEstablecimientos.loadEstablecimientos - Ya hay una carga en progreso, saltando...');
      return;
    }

    const currentFilters = newFilters || filters;

    try {
      logger.debug('🔄 useEstablecimientos.loadEstablecimientos - Cargando con filtros:', currentFilters);

      const result = await listApi.execute(() =>
        EstablecimientoService.getAll(currentFilters)
      );

      if (result) {
        logger.info(`✅ useEstablecimientos.loadEstablecimientos - Establecimientos cargados: ${result.establecimientos.length} de ${result.pagination.total}`);

        // Log detallado por tipo de establecimiento
        const porTipo = result.establecimientos.reduce((acc, est) => {
          acc[est.tipo] = (acc[est.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        logger.debug('🏥 Establecimientos por tipo:', porTipo);

        // Log de centros de acopio únicos
        const centrosUnicos = [...new Set(result.establecimientos.map(e => e.centroAcopioId).filter(Boolean))];
        logger.debug(`🏢 Centros de acopio únicos: ${centrosUnicos.length}`, centrosUnicos);

        setEstablecimientos(result.establecimientos);
        setPagination(result.pagination);

        // Actualizar filtros si se pasaron nuevos
        if (newFilters) {
          setFilters(newFilters);
        }
      } else {
        logger.warn('⚠️ useEstablecimientos.loadEstablecimientos - No se obtuvieron resultados');
        setEstablecimientos([]);
      }
    } catch (error) {
      logger.error('❌ useEstablecimientos.loadEstablecimientos - Error al cargar establecimientos:', error);
      setEstablecimientos([]);
    }
  }, [listApi]); // Solo depende de la API para evitar problemas de dependencias circulares

  /**
   * Cargar centros de acopio
   */
  const loadCentrosAcopio = useCallback(async () => {
    try {
      const result = await centrosApi.execute(() =>
        EstablecimientoService.getCentrosAcopio()
      );

      if (result) {
        setCentrosAcopio(result);
      }
    } catch (error) {
      console.error('Error al cargar centros de acopio:', error);
      setCentrosAcopio([]);
    }
  }, [centrosApi]);

  /**
   * Crear nuevo establecimiento
   */
  const createEstablecimiento = useCallback(async (data: CreateEstablecimientoDto): Promise<boolean> => {
    try {
      const result = await crudApi.create.execute(() =>
        EstablecimientoService.create(data)
      );

      if (result) {
        // Recargar la lista después de crear
        await loadEstablecimientos();
        // Si es un centro de acopio, recargar también la lista de centros
        if (data.tipo === 'centro_acopio') {
          await loadCentrosAcopio();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al crear establecimiento:', error);
      return false;
    }
  }, [crudApi.create, loadEstablecimientos, loadCentrosAcopio]);

  /**
   * Actualizar establecimiento
   */
  const updateEstablecimiento = useCallback(async (id: string, data: UpdateEstablecimientoDto): Promise<boolean> => {
    try {
      const result = await crudApi.update.execute(() =>
        EstablecimientoService.update(id, data)
      );

      if (result) {
        // Actualizar en la lista local
        setEstablecimientos(prev =>
          prev.map(est => est.id === id ? { ...est, ...result } : est)
        );

        // Si cambió a centro de acopio o desde centro de acopio, recargar centros
        if (data.tipo === 'centro_acopio' || result.tipo === 'centro_acopio') {
          await loadCentrosAcopio();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al actualizar establecimiento:', error);
      return false;
    }
  }, [crudApi.update, loadCentrosAcopio]);

  /**
   * Eliminar establecimiento
   */
  const deleteEstablecimiento = useCallback(async (id: string): Promise<boolean> => {
    const establecimiento = establecimientos.find(est => est.id === id);

    try {
      const result = await crudApi.delete.execute(() =>
        EstablecimientoService.delete(id)
      );

      if (result !== null) {
        // Remover de la lista local
        setEstablecimientos(prev => prev.filter(est => est.id !== id));

        // Si era un centro de acopio, recargar la lista de centros
        if (establecimiento?.tipo === 'centro_acopio') {
          await loadCentrosAcopio();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al eliminar establecimiento:', error);
      return false;
    }
  }, [crudApi.delete, establecimientos, loadCentrosAcopio]);

  /**
   * Cambiar estado de establecimiento
   */
  const toggleEstado = useCallback(async (id: string, estado: 'activo' | 'inactivo'): Promise<boolean> => {
    const result = await crudApi.update.execute(() => 
      EstablecimientoService.toggleEstado(id, estado)
    );

    if (result) {
      // Actualizar en la lista local
      setEstablecimientos(prev => 
        prev.map(est => est.id === id ? { ...est, estado } : est)
      );
      return true;
    }
    return false;
  }, [crudApi.update]);

  /**
   * Aplicar filtros - versión simplificada sin dependencias
   */
  const applyFilters = useCallback(async (newFilters: EstablecimientoFilters) => {
    // Evitar aplicar los mismos filtros múltiples veces
    const currentFiltersStr = JSON.stringify(filters);
    const newFiltersStr = JSON.stringify(newFilters);

    if (currentFiltersStr === newFiltersStr) {
      logger.debug('Filtros idénticos, saltando aplicación');
      return;
    }

    logger.debug('Aplicando nuevos filtros:', newFilters);
    setFilters(newFilters);

    try {
      const result = await listApi.execute(() =>
        EstablecimientoService.getAll(newFilters)
      );

      if (result) {
        setEstablecimientos(result.establecimientos);
        setPagination(result.pagination);
        logger.info(`Filtros aplicados: ${result.establecimientos.length} resultados`);
      }
    } catch (error) {
      logger.error('Error al aplicar filtros:', error);
    }
  }, []); // Sin dependencias para evitar bucles

  /**
   * Cambiar página
   */
  const changePage = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadEstablecimientos(newFilters);
  }, [filters, loadEstablecimientos]);

  /**
   * Buscar establecimientos
   */
  const search = useCallback((searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    loadEstablecimientos(newFilters);
  }, [filters, loadEstablecimientos]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(() => {
    loadEstablecimientos();
    loadCentrosAcopio();
  }, [loadEstablecimientos, loadCentrosAcopio]);

  // Cargar datos iniciales - SIN DEPENDENCIAS para evitar bucle infinito
  useEffect(() => {
    logger.info('Inicializando hook useEstablecimientos');
    const initializeData = async () => {
      try {
        // Usar los filtros iniciales si están disponibles, sino usar filtros por defecto
        if (initialFilters) {
          await loadEstablecimientos(initialFilters);
        } else {
          await loadEstablecimientos();
        }
        await loadCentrosAcopio();
      } catch (error) {
        logger.error('Error al inicializar datos:', error);
      }
    };
    initializeData();
  }, []); // Array vacío para ejecutar solo una vez

  // Estados derivados
  const isLoading = listApi.loading || crudApi.isLoading || centrosApi.loading;
  const error = listApi.error || crudApi.hasError || centrosApi.error;

  return {
    // Datos
    establecimientos,
    centrosAcopio,
    pagination,
    filters,

    // Estados
    isLoading,
    error,

    // Operaciones CRUD
    createEstablecimiento,
    updateEstablecimiento,
    deleteEstablecimiento,
    toggleEstado,

    // Operaciones de consulta
    loadEstablecimientos,
    loadCentrosAcopio,
    applyFilters,
    changePage,
    search,
    refresh,

    // Estados específicos para UI
    isCreating: crudApi.create.loading,
    isUpdating: crudApi.update.loading,
    isDeleting: crudApi.delete.loading,
    createError: crudApi.create.error,
    updateError: crudApi.update.error,
    deleteError: crudApi.delete.error,
  };
}

export default useEstablecimientos;
