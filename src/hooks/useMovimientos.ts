import { useState, useCallback } from 'react';
import { MovimientosService } from '../services/movimientosService';
import {
  MovimientoVacuna,
  MovimientoConRelaciones,
  MovimientoCalculado,
  CreateMovimientoDto,
  UpdateMovimientoDto,
  MovimientosFilters,
  MovimientosStats,
  EntregaAdicional,
  CreateEntregaAdicionalDto
} from '../types';
import { useApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook personalizado para gestión de movimientos de vacunas
 * Proporciona funcionalidades CRUD y operaciones especiales
 */
export const useMovimientos = () => {
  // Estados locales
  const [movimientos, setMovimientos] = useState<MovimientoConRelaciones[]>([]);
  const [stats, setStats] = useState<MovimientosStats | null>(null);
  const [filters, setFilters] = useState<MovimientosFilters>({});
  const [total, setTotal] = useState(0);

  // Hooks para llamadas a la API
  const listApi = useApi();
  const getByIdApi = useApi();
  const createApi = useApi();
  const updateApi = useApi();
  const deleteApi = useApi();
  const statsApi = useApi();
  const generateFromPlanApi = useApi();
  const stockApi = useApi();
  const createEntregaApi = useApi();
  const updateEntregaApi = useApi();
  const deleteEntregaApi = useApi();

  // Estados de carga derivados
  const isLoading = listApi.loading;
  const isLoadingStats = statsApi.loading;
  const isCreating = createApi.loading;
  const isUpdating = updateApi.loading;
  const isDeleting = deleteApi.loading;
  const isGeneratingFromPlan = generateFromPlanApi.loading;
  const isLoadingStock = stockApi.loading;
  const isCreatingEntrega = createEntregaApi.loading;
  const isUpdatingEntrega = updateEntregaApi.loading;
  const isDeletingEntrega = deleteEntregaApi.loading;

  // Errores derivados
  const error = listApi.error;
  const createError = createApi.error;
  const updateError = updateApi.error;
  const deleteError = deleteApi.error;
  const statsError = statsApi.error;
  const generateError = generateFromPlanApi.error;
  const stockError = stockApi.error;
  const entregaError = createEntregaApi.error || updateEntregaApi.error || deleteEntregaApi.error;

  /**
   * Cargar movimientos con filtros
   */
  const loadMovimientos = useCallback(async (newFilters?: MovimientosFilters) => {
    const filtersToUse = newFilters || filters;

    logger.debug('🔄 useMovimientos.loadMovimientos - Iniciando carga con filtros:', filtersToUse);

    try {
      const result = await listApi.execute(() => MovimientosService.getAll(filtersToUse));

      if (result) {
        logger.info(`✅ useMovimientos.loadMovimientos - Movimientos cargados: ${result.movimientos.length} de ${result.total}`);

        // Log detallado de establecimientos con movimientos
        const establecimientosConMovimientos = [...new Set(result.movimientos.map(m => m.establecimiento.nombre))];
        logger.debug(`🏥 Establecimientos con movimientos: ${establecimientosConMovimientos.length}`, establecimientosConMovimientos);

        setMovimientos(result.movimientos);
        setTotal(result.total);
        if (newFilters) {
          setFilters(filtersToUse);
        }
      } else {
        logger.warn('⚠️ useMovimientos.loadMovimientos - No se obtuvieron resultados');
        setMovimientos([]);
        setTotal(0);
      }
    } catch (error) {
      logger.error('❌ useMovimientos.loadMovimientos - Error al cargar movimientos:', error);
      setMovimientos([]);
      setTotal(0);
    }
  }, [filters, listApi]);

  /**
   * Obtener movimiento por ID
   */
  const getMovimiento = useCallback(async (id: string): Promise<MovimientoConRelaciones | null> => {
    logger.debug('Obteniendo movimiento por ID:', id);

    const result = await getByIdApi.execute(() => MovimientosService.getById(id));
    return result || null;
  }, [getByIdApi]);

  /**
   * Crear nuevo movimiento
   */
  const createMovimiento = useCallback(async (data: CreateMovimientoDto): Promise<MovimientoVacuna | null> => {
    logger.debug('Creando movimiento:', data);

    const result = await createApi.execute(() => MovimientosService.create(data));

    if (result) {
      // Recargar la lista después de crear
      await loadMovimientos();
    }

    return result || null;
  }, [createApi, loadMovimientos]);

  /**
   * Actualizar movimiento existente
   */
  const updateMovimiento = useCallback(async (
    id: string,
    data: UpdateMovimientoDto
  ): Promise<MovimientoVacuna | null> => {
    logger.debug('Actualizando movimiento:', { id, data });

    const result = await updateApi.execute(() => MovimientosService.update(id, data));

    if (result) {
      // Recargar la lista después de actualizar
      await loadMovimientos();
    }

    return result || null;
  }, [updateApi, loadMovimientos]);

  /**
   * Eliminar movimiento
   */
  const deleteMovimiento = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Eliminando movimiento:', id);

    const result = await deleteApi.execute(() => MovimientosService.delete(id));

    if (result !== null) {
      // Recargar la lista después de eliminar
      await loadMovimientos();
      return true;
    }

    return false;
  }, [deleteApi, loadMovimientos]);

  /**
   * Cargar estadísticas de movimientos
   */
  const loadStats = useCallback(async (anio?: number) => {
    logger.debug('Cargando estadísticas de movimientos:', { anio });

    const result = await statsApi.execute(() => MovimientosService.getEstadisticas(anio));

    if (result) {
      setStats(result);
    }
  }, [statsApi]);

  /**
   * Generar movimientos desde planificación anual
   */
  const generarDesdePlanificacion = useCallback(async (
    planificacionId: string,
    usuarioId: string
  ): Promise<{
    creados: number;
    actualizados: number;
    errores: string[];
  } | null> => {
    logger.debug('Generando movimientos desde planificación:', { planificacionId, usuarioId });

    const result = await generateFromPlanApi.execute(() =>
      MovimientosService.generarDesdePlanificacion(planificacionId, usuarioId)
    );

    if (result) {
      // Recargar la lista después de generar
      await loadMovimientos();
    }

    return result || null;
  }, [generateFromPlanApi, loadMovimientos]);

  /**
   * Obtener stock disponible por vacuna
   */
  const getStockDisponible = useCallback(async (
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<{
    stockInicial: number;
    totalEntregas: number;
    stockDisponible: number;
    porcentajeUtilizado: number;
    estado: 'bueno' | 'medio' | 'critico';
    lotes: Array<{
      id: string;
      numero: string;
      cantidadActual: number;
      fechaVencimiento: Date;
      estado: string;
    }>;
  } | null> => {
    logger.debug('Obteniendo stock disponible:', { vacunaId, mes, anio });

    const result = await stockApi.execute(() =>
      MovimientosService.getStockDisponible(vacunaId, mes, anio)
    );

    return result || null;
  }, [stockApi]);

  /**
   * Sincronizar saldo anterior del siguiente mes
   */
  const sincronizarSaldoAnterior = useCallback(async (
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<{ actualizado: boolean; stockCalculado: number } | null> => {
    logger.debug('Sincronizando saldo anterior:', { establecimientoId, vacunaId, mes, anio });

    const result = await stockApi.execute(() =>
      MovimientosService.sincronizarSaldoAnterior(establecimientoId, vacunaId, mes, anio)
    );

    if (result) {
      // Recargar movimientos después de sincronizar para reflejar los cambios
      await loadMovimientos();
    }

    return result || null;
  }, [stockApi, loadMovimientos]);

  /**
   * Crear entrega adicional
   */
  const createEntregaAdicional = useCallback(async (
    data: CreateEntregaAdicionalDto
  ): Promise<EntregaAdicional | null> => {
    logger.debug('Creando entrega adicional:', data);

    const result = await createEntregaApi.execute(() =>
      MovimientosService.createEntregaAdicional(data)
    );

    if (result) {
      // Recargar la lista después de crear
      await loadMovimientos();
    }

    return result || null;
  }, [createEntregaApi, loadMovimientos]);

  /**
   * Actualizar entrega adicional
   */
  const updateEntregaAdicional = useCallback(async (
    id: string,
    data: Partial<CreateEntregaAdicionalDto>
  ): Promise<EntregaAdicional | null> => {
    logger.debug('Actualizando entrega adicional:', { id, data });

    const result = await updateEntregaApi.execute(() =>
      MovimientosService.updateEntregaAdicional(id, data)
    );

    if (result) {
      // Recargar la lista después de actualizar
      await loadMovimientos();
    }

    return result || null;
  }, [updateEntregaApi, loadMovimientos]);

  /**
   * Eliminar entrega adicional
   */
  const deleteEntregaAdicional = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Eliminando entrega adicional:', id);

    const result = await deleteEntregaApi.execute(() =>
      MovimientosService.deleteEntregaAdicional(id)
    );

    if (result !== null) {
      // Recargar la lista después de eliminar
      await loadMovimientos();
      return true;
    }

    return false;
  }, [deleteEntregaApi, loadMovimientos]);

  /**
   * Función de utilidad para refrescar datos
   */
  const refresh = useCallback(async () => {
    await loadMovimientos();
  }, [loadMovimientos]);

  /**
   * Calcular campos derivados para la tabla
   * FUNCIONALIDAD AVANZADA: Manejo de entrega base vs entregas adicionales
   */
  const calcularCamposDerivados = useCallback((movimiento: MovimientoConRelaciones): MovimientoCalculado => {
    const totalSaldo = movimiento.saldoAnterior + movimiento.transIngreso;
    const saldo = totalSaldo - movimiento.salida - movimiento.transSalida;

    // LÓGICA AVANZADA: Calcular entrega base y total
    const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
    const entregaBase = tieneEntregasAdicionales
      ? (movimiento.entregaBase ?? movimiento.entrega) // Usar entrega_base si existe, sino entrega
      : movimiento.entrega; // Sin entregas adicionales, usar entrega normal

    const totalEntregasAdicionales = tieneEntregasAdicionales
      ? movimiento.entregasAdicionales.reduce((sum, ea) => sum + ea.cantidad, 0)
      : 0;

    const entregaTotal = entregaBase + totalEntregasAdicionales;

    // El stock se calcula con la entrega total (base + adicionales)
    const stock = saldo + entregaTotal;
    const promedioConsumo = movimiento.salida * 1.2; // Factor de cálculo
    const disponibilidad = promedioConsumo > 0 ? stock / promedioConsumo : 0;

    return {
      ...movimiento,
      totalSaldo,
      saldo,
      stock,
      promedioConsumo: Math.round(promedioConsumo),
      disponibilidad: Math.round(disponibilidad * 100) / 100,
      // Campos adicionales para el frontend
      entregaBase: entregaBase,
      entregaTotal: entregaTotal,
      totalEntregasAdicionales: totalEntregasAdicionales
    } as MovimientoCalculado & {
      entregaBase: number;
      entregaTotal: number;
      totalEntregasAdicionales: number;
    };
  }, []);

  return {
    // Datos
    movimientos,
    stats,
    filters,
    total,

    // Estados de carga
    isLoading,
    isLoadingStats,
    isCreating,
    isUpdating,
    isDeleting,
    isGeneratingFromPlan,
    isLoadingStock,
    isCreatingEntrega,
    isUpdatingEntrega,
    isDeletingEntrega,

    // Errores
    error,
    createError,
    updateError,
    deleteError,
    statsError,
    generateError,
    stockError,
    entregaError,

    // Operaciones CRUD
    loadMovimientos,
    getMovimiento,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento,

    // Operaciones especiales
    loadStats,
    generarDesdePlanificacion,
    getStockDisponible,
    sincronizarSaldoAnterior,

    // Entregas adicionales
    createEntregaAdicional,
    updateEntregaAdicional,
    deleteEntregaAdicional,

    // Utilidades
    refresh,
    calcularCamposDerivados
  };
};
