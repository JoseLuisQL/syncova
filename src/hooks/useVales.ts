import { useState, useCallback } from 'react';
import {
  ValesService,
  ValeEntrega,
  GenerarValeDto,
  ValesFilters,
  ResumenGeneracion,
  VistaPrevia,
  ModificacionVale,
  SincronizacionValeResponse
} from '../services/valesService';
import { useApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook personalizado para gestión de Vales de Entrega
 * Módulo 11: VALES DE ENTREGA
 * Proporciona funcionalidades CRUD y operaciones especiales para vales
 */
export const useVales = () => {
  // Estados locales
  const [vales, setVales] = useState<ValeEntrega[]>([]);
  const [valeActual, setValeActual] = useState<ValeEntrega | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<VistaPrevia | null>(null);
  const [filters, setFilters] = useState<ValesFilters>({});
  const [total, setTotal] = useState(0);

  // Estados de carga usando el hook useApi
  const {
    isLoading,
    error,
    execute: executeLoad
  } = useApi();

  const {
    isLoading: isGenerating,
    error: generateError,
    execute: executeGenerate
  } = useApi();

  const {
    isLoading: isLoadingPreview,
    error: previewError,
    execute: executePreview
  } = useApi();

  const {
    isLoading: isDeleting,
    error: deleteError,
    execute: executeDelete
  } = useApi();

  const {
    isLoading: isReverting,
    error: revertError,
    execute: executeRevert
  } = useApi();

  const {
    isLoading: isChangingState,
    error: stateError,
    execute: executeStateChange
  } = useApi();

  const {
    isLoading: isSyncing,
    error: syncError,
    execute: executeSync
  } = useApi();

  // Estados adicionales para sincronización
  const [modificaciones, setModificaciones] = useState<ModificacionVale[]>([]);
  const [ultimaSincronizacion, setUltimaSincronizacion] = useState<Date | null>(null);

  /**
   * Cargar vales con filtros
   */
  const loadVales = useCallback(async (newFilters: ValesFilters = {}) => {
    logger.info('🔄 Cargando vales con filtros:', newFilters);
    
    const result = await executeLoad(async () => {
      const response = await ValesService.getVales(newFilters);
      if (response.success && response.data) {
        setVales(response.data.vales);
        setTotal(response.data.total);
        setFilters(newFilters);
        logger.success(`✅ ${response.data.vales.length} vales cargados`);
        return response.data;
      } else {
        throw new Error(response.error || 'Error al cargar vales');
      }
    });

    return result;
  }, [executeLoad]);

  /**
   * Obtener vale por ID
   */
  const getValeById = useCallback(async (id: string) => {
    logger.info('🔍 Obteniendo vale por ID:', id);
    
    const result = await executeLoad(async () => {
      const response = await ValesService.getValeById(id);
      if (response.success && response.data) {
        setValeActual(response.data);
        logger.success('✅ Vale obtenido exitosamente');
        return response.data;
      } else {
        throw new Error(response.error || 'Error al obtener vale');
      }
    });

    return result;
  }, [executeLoad]);

  /**
   * Generar vale de entrega con actualización automática garantizada
   */
  const generarVale = useCallback(async (data: GenerarValeDto): Promise<ResumenGeneracion | null> => {
    logger.info('🏭 Generando vale de entrega:', data);

    const result = await executeGenerate(async () => {
      const response = await ValesService.generarVale(data);
      if (response.success && response.data) {
        logger.success('✅ Vale generado exitosamente:', response.data.vale.numero);

        // SOLUCIÓN SIMPLE: Dejar que el componente maneje la actualización
        // El hook solo se encarga de generar el vale exitosamente
        logger.success('✅ Vale generado exitosamente, delegando actualización al componente');

        return response.data;
      } else {
        const errorMessage = response.error || 'Error al generar vale';
        logger.error('❌ Error al generar vale:', errorMessage);
        throw new Error(errorMessage);
      }
    });

    return result;
  }, [executeGenerate]);

  /**
   * Obtener vista previa de vale
   */
  const getVistaPrevia = useCallback(async (centroAcopioId: string, mes: number, anio: number) => {
    logger.info('👁️ Obteniendo vista previa de vale:', { centroAcopioId, mes, anio });

    const result = await executePreview(async () => {
      const response = await ValesService.getVistaPrevia(centroAcopioId, mes, anio);
      if (response.success && response.data) {
        setVistaPrevia(response.data);
        logger.success('✅ Vista previa obtenida exitosamente');
        return response.data;
      } else {
        throw new Error(response.error || 'Error al obtener vista previa');
      }
    });

    return result;
  }, [executePreview]);

  /**
   * Eliminar vale - delegando actualización al componente
   */
  const deleteVale = useCallback(async (id: string): Promise<boolean> => {
    logger.info('🗑️ Eliminando vale:', id);

    const result = await executeDelete(async () => {
      const response = await ValesService.deleteVale(id);
      if (response.success) {
        logger.success('✅ Vale eliminado exitosamente, delegando actualización al componente');

        // Limpiar vale actual si es el que se eliminó
        if (valeActual?.id === id) {
          setValeActual(null);
        }

        return true;
      } else {
        throw new Error(response.error || 'Error al eliminar vale');
      }
    });

    return result || false;
  }, [executeDelete, valeActual]);

  /**
   * Revertir vale a estado pendiente - delegando actualización al componente
   */
  const revertirVale = useCallback(async (id: string): Promise<boolean> => {
    logger.info('↩️ Revirtiendo vale:', id);

    const result = await executeRevert(async () => {
      const response = await ValesService.revertirVale(id);
      if (response.success) {
        logger.success('✅ Vale revertido exitosamente, delegando actualización al componente');

        // Limpiar vale actual si es el que se revirtió
        if (valeActual?.id === id) {
          setValeActual(null);
        }

        return true;
      } else {
        throw new Error(response.error || 'Error al revertir vale');
      }
    });

    return result || false;
  }, [executeRevert, valeActual]);

  /**
   * Cambiar estado de vale con actualización automática
   */
  const cambiarEstado = useCallback(async (id: string, estado: 'generado' | 'impreso' | 'entregado'): Promise<ValeEntrega | null> => {
    logger.info('🔄 Cambiando estado de vale:', { id, estado });

    const result = await executeStateChange(async () => {
      const response = await ValesService.cambiarEstado(id, estado);
      if (response.success && response.data) {
        logger.success('✅ Estado cambiado exitosamente');

        // Actualización inmediata del estado en la lista
        setVales(prev => prev.map(vale =>
          vale.id === id ? { ...vale, estado, updatedAt: new Date() } : vale
        ));

        // Actualizar vale actual si es el mismo
        if (valeActual?.id === id) {
          setValeActual(prev => prev ? { ...prev, estado, updatedAt: new Date() } : null);
        }

        return response.data;
      } else {
        throw new Error(response.error || 'Error al cambiar estado');
      }
    });

    return result;
  }, [executeStateChange, valeActual]);

  /**
   * Limpiar vista previa
   */
  const clearVistaPrevia = useCallback(() => {
    setVistaPrevia(null);
  }, []);

  /**
   * Limpiar vale actual
   */
  const clearValeActual = useCallback(() => {
    setValeActual(null);
  }, []);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    await loadVales(filters);
  }, [loadVales, filters]);

  /**
   * Sincronizar vale con movimientos actualizados
   */
  const sincronizarVale = useCallback(async (valeId: string, usuarioId: string = 'temp-user-id') => {
    logger.info('🔄 Sincronizando vale:', valeId);

    const result = await executeSync(async () => {
      const response = await ValesService.sincronizarVale(valeId, usuarioId);
      if (response.success && response.data) {
        // Actualizar el vale en la lista local
        setVales(prev => prev.map(vale =>
          vale.id === valeId ? response.data!.valeActualizado : vale
        ));

        // Actualizar vale actual si es el mismo
        if (valeActual?.id === valeId) {
          setValeActual(response.data.valeActualizado);
        }

        // Guardar modificaciones
        setModificaciones(response.data.modificaciones);
        setUltimaSincronizacion(new Date());

        logger.success(`✅ Vale sincronizado. Modificaciones: ${response.data.modificaciones.length}`);
        return response.data;
      } else {
        throw new Error(response.error || 'Error al sincronizar vale');
      }
    });

    return result;
  }, [executeSync, valeActual]);

  /**
   * Obtener historial de modificaciones
   */
  const getModificaciones = useCallback(async (valeId: string) => {
    logger.info('📋 Obteniendo modificaciones del vale:', valeId);

    const result = await executeLoad(async () => {
      const response = await ValesService.getModificaciones(valeId);
      if (response.success && response.data) {
        setModificaciones(response.data);
        logger.success(`✅ ${response.data.length} modificaciones obtenidas`);
        return response.data;
      } else {
        throw new Error(response.error || 'Error al obtener modificaciones');
      }
    });

    return result;
  }, [executeLoad]);

  /**
   * Sincronizar automáticamente todos los vales de un período
   */
  const sincronizarValesAutomaticamente = useCallback(async (
    centroAcopioId: string,
    mes: number,
    anio: number
  ) => {
    logger.info('🔄 Sincronización automática:', { centroAcopioId, mes, anio });

    const result = await executeSync(async () => {
      const response = await ValesService.sincronizarValesAutomaticamente(centroAcopioId, mes, anio);
      if (response.success && response.data) {
        // Recargar vales después de la sincronización
        await loadVales(filters);
        logger.success(`✅ Sincronización automática completada. Vales sincronizados: ${response.data.valesSincronizados}`);
        return response.data;
      } else {
        throw new Error(response.error || 'Error en sincronización automática');
      }
    });

    return result;
  }, [executeSync, loadVales, filters]);

  return {
    // Datos
    vales,
    valeActual,
    vistaPrevia,
    filters,
    total,
    modificaciones,
    ultimaSincronizacion,

    // Estados de carga
    isLoading,
    isGenerating,
    isLoadingPreview,
    isDeleting,
    isReverting,
    isChangingState,
    isSyncing,

    // Errores
    error,
    generateError,
    previewError,
    deleteError,
    revertError,
    stateError,
    syncError,

    // Operaciones principales
    loadVales,
    getValeById,
    generarVale,
    getVistaPrevia,
    deleteVale,
    revertirVale,
    cambiarEstado,

    // Operaciones de sincronización
    sincronizarVale,
    getModificaciones,
    sincronizarValesAutomaticamente,

    // Utilidades
    clearVistaPrevia,
    clearValeActual,
    refresh
  };
};
