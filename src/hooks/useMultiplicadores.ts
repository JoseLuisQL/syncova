import { useState, useCallback } from 'react';
import {
  MultiplicadoresService,
  MultiplicadorJeringa,
  CreateMultiplicadorDto,
  UpdateMultiplicadorDto,
  MultiplicadorFilters,
  ConfiguracionMultiplicadores,
  CalculoJeringas,
  Jeringa
} from '../services/multiplicadoresService';
import { useApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook personalizado para gestión de multiplicadores de jeringas
 * Proporciona funcionalidades para configurar qué jeringas se necesitan para cada vacuna
 */
export const useMultiplicadores = () => {
  // Estados locales
  const [multiplicadores, setMultiplicadores] = useState<MultiplicadorJeringa[]>([]);
  const [configuracionActual, setConfiguracionActual] = useState<ConfiguracionMultiplicadores | null>(null);
  const [jeringasDisponibles, setJeringasDisponibles] = useState<Jeringa[]>([]);
  const [calculoActual, setCalculoActual] = useState<CalculoJeringas | null>(null);
  const [filters, setFilters] = useState<MultiplicadorFilters>({});
  const [total, setTotal] = useState(0);

  // Estados de carga usando el hook useApi
  const {
    isLoading,
    error,
    execute: executeLoad
  } = useApi();

  const {
    isLoading: isCreating,
    error: createError,
    execute: executeCreate
  } = useApi();

  const {
    isLoading: isUpdating,
    error: updateError,
    execute: executeUpdate
  } = useApi();

  const {
    isLoading: isDeleting,
    error: deleteError,
    execute: executeDelete
  } = useApi();

  const {
    isLoading: isCalculating,
    error: calculateError,
    execute: executeCalculate
  } = useApi();

  const {
    isLoading: isLoadingJeringas,
    error: jeringasError,
    execute: executeLoadJeringas
  } = useApi();

  /**
   * Cargar multiplicadores con filtros
   */
  const loadMultiplicadores = useCallback(async (newFilters: MultiplicadorFilters = {}) => {
    logger.info('🔄 Cargando multiplicadores con filtros:', newFilters);
    
    const result = await executeLoad(async () => {
      const response = await MultiplicadoresService.getMultiplicadores(newFilters);
      if (response.success && response.data) {
        setMultiplicadores(response.data.multiplicadores);
        setTotal(response.data.total);
        setFilters(newFilters);
        logger.success(`✅ ${response.data.multiplicadores.length} multiplicadores cargados`);
        return response.data;
      } else {
        throw new Error(response.error || 'Error al cargar multiplicadores');
      }
    });

    return result;
  }, [executeLoad]);

  /**
   * Cargar configuración de multiplicadores para una vacuna
   */
  const loadConfiguracionVacuna = useCallback(async (vacunaId: string) => {
    logger.info('🔍 Cargando configuración de vacuna:', vacunaId);
    
    const result = await executeLoad(async () => {
      const response = await MultiplicadoresService.getConfiguracionVacuna(vacunaId);
      if (response.success && response.data) {
        setConfiguracionActual(response.data);
        logger.success('✅ Configuración de vacuna cargada exitosamente');
        return response.data;
      } else {
        throw new Error(response.error || 'Error al cargar configuración de vacuna');
      }
    });

    return result;
  }, [executeLoad]);

  /**
   * Cargar jeringas disponibles
   */
  const loadJeringasDisponibles = useCallback(async () => {
    logger.info('💉 Cargando jeringas disponibles');
    
    const result = await executeLoadJeringas(async () => {
      const response = await MultiplicadoresService.getJeringasDisponibles();
      if (response.success && response.data) {
        setJeringasDisponibles(response.data);
        logger.success(`✅ ${response.data.length} jeringas disponibles cargadas`);
        return response.data;
      } else {
        throw new Error(response.error || 'Error al cargar jeringas disponibles');
      }
    });

    return result;
  }, [executeLoadJeringas]);

  /**
   * Crear multiplicador
   */
  const createMultiplicador = useCallback(async (data: CreateMultiplicadorDto): Promise<MultiplicadorJeringa | null> => {
    logger.info('➕ Creando multiplicador:', data);
    
    const result = await executeCreate(async () => {
      const response = await MultiplicadoresService.createMultiplicador(data);
      if (response.success && response.data) {
        logger.success('✅ Multiplicador creado exitosamente');
        
        // Actualizar la lista de multiplicadores
        setMultiplicadores(prev => [...prev, response.data]);
        setTotal(prev => prev + 1);
        
        // Actualizar configuración actual si corresponde
        if (configuracionActual?.vacunaId === data.vacunaId) {
          setConfiguracionActual(prev => prev ? {
            ...prev,
            multiplicadores: [...prev.multiplicadores, response.data]
          } : null);
        }
        
        return response.data;
      } else {
        throw new Error(response.error || 'Error al crear multiplicador');
      }
    });

    return result;
  }, [executeCreate, configuracionActual]);

  /**
   * Actualizar multiplicador
   */
  const updateMultiplicador = useCallback(async (id: string, data: UpdateMultiplicadorDto): Promise<MultiplicadorJeringa | null> => {
    logger.info('✏️ Actualizando multiplicador:', { id, data });
    
    const result = await executeUpdate(async () => {
      const response = await MultiplicadoresService.updateMultiplicador(id, data);
      if (response.success && response.data) {
        logger.success('✅ Multiplicador actualizado exitosamente');
        
        // Actualizar la lista de multiplicadores
        setMultiplicadores(prev => prev.map(mult => 
          mult.id === id ? response.data : mult
        ));
        
        // Actualizar configuración actual si corresponde
        if (configuracionActual) {
          setConfiguracionActual(prev => prev ? {
            ...prev,
            multiplicadores: prev.multiplicadores.map(mult => 
              mult.id === id ? response.data : mult
            )
          } : null);
        }
        
        return response.data;
      } else {
        throw new Error(response.error || 'Error al actualizar multiplicador');
      }
    });

    return result;
  }, [executeUpdate, configuracionActual]);

  /**
   * Eliminar multiplicador
   */
  const deleteMultiplicador = useCallback(async (id: string): Promise<boolean> => {
    logger.info('🗑️ Eliminando multiplicador:', id);
    
    const result = await executeDelete(async () => {
      const response = await MultiplicadoresService.deleteMultiplicador(id);
      if (response.success) {
        logger.success('✅ Multiplicador eliminado exitosamente');
        
        // Actualizar la lista de multiplicadores
        setMultiplicadores(prev => prev.filter(mult => mult.id !== id));
        setTotal(prev => prev - 1);
        
        // Actualizar configuración actual si corresponde
        if (configuracionActual) {
          setConfiguracionActual(prev => prev ? {
            ...prev,
            multiplicadores: prev.multiplicadores.filter(mult => mult.id !== id)
          } : null);
        }
        
        return true;
      } else {
        throw new Error(response.error || 'Error al eliminar multiplicador');
      }
    });

    return result || false;
  }, [executeDelete, configuracionActual]);

  /**
   * Calcular jeringas necesarias
   */
  const calcularJeringas = useCallback(async (vacunaId: string, cantidadVacunas: number) => {
    logger.info('🧮 Calculando jeringas necesarias:', { vacunaId, cantidadVacunas });
    
    const result = await executeCalculate(async () => {
      const response = await MultiplicadoresService.calcularJeringas(vacunaId, cantidadVacunas);
      if (response.success && response.data) {
        setCalculoActual(response.data);
        logger.success('✅ Cálculo de jeringas completado');
        return response.data;
      } else {
        throw new Error(response.error || 'Error al calcular jeringas');
      }
    });

    return result;
  }, [executeCalculate]);

  /**
   * Configurar multiplicadores por defecto
   */
  const configurarPorDefecto = useCallback(async (vacunaId: string) => {
    logger.info('⚙️ Configurando multiplicadores por defecto:', vacunaId);
    
    const result = await executeCreate(async () => {
      const response = await MultiplicadoresService.configurarPorDefecto(vacunaId);
      if (response.success && response.data) {
        setConfiguracionActual(response.data);
        logger.success('✅ Configuración por defecto aplicada');
        return response.data;
      } else {
        throw new Error(response.error || 'Error al configurar por defecto');
      }
    });

    return result;
  }, [executeCreate]);

  /**
   * Limpiar estados
   */
  const clearConfiguracionActual = useCallback(() => {
    setConfiguracionActual(null);
  }, []);

  const clearCalculoActual = useCallback(() => {
    setCalculoActual(null);
  }, []);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    await loadMultiplicadores(filters);
  }, [loadMultiplicadores, filters]);

  return {
    // Datos
    multiplicadores,
    configuracionActual,
    jeringasDisponibles,
    calculoActual,
    filters,
    total,

    // Estados de carga
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isCalculating,
    isLoadingJeringas,

    // Errores
    error,
    createError,
    updateError,
    deleteError,
    calculateError,
    jeringasError,

    // Operaciones principales
    loadMultiplicadores,
    loadConfiguracionVacuna,
    loadJeringasDisponibles,
    createMultiplicador,
    updateMultiplicador,
    deleteMultiplicador,
    calcularJeringas,
    configurarPorDefecto,

    // Utilidades
    clearConfiguracionActual,
    clearCalculoActual,
    refresh
  };
};
