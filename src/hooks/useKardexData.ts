import { useState, useEffect, useCallback } from 'react';
import { KardexService, KardexFilters, KardexMovimiento, KardexEstadisticas } from '../services/KardexService';
import { LotesService } from '../services/LotesService';
import { Vacuna, Jeringa, Establecimiento } from '../types';

/**
 * Estado del hook useKardexData
 */
interface KardexDataState {
  // Datos principales
  movimientos: KardexMovimiento[];
  estadisticas: KardexEstadisticas | null;
  total: number;

  // Datos para filtros
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  establecimientos: Establecimiento[];
  lotes: any[]; // Lotes dinámicos según el item seleccionado

  // Estados de paginación
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;

  // Estados de carga
  loading: boolean;
  loadingEstadisticas: boolean;
  loadingFiltros: boolean;
  
  // Estados de error
  error: string | null;
  errorEstadisticas: string | null;
  errorFiltros: string | null;
  
  // Filtros actuales
  filtros: KardexFilters;
}

/**
 * Acciones disponibles en el hook
 */
interface KardexDataActions {
  // Cargar datos
  cargarMovimientos: (filtros?: KardexFilters) => Promise<void>;
  cargarEstadisticas: (filtros?: Omit<KardexFilters, 'page' | 'limit'>) => Promise<void>;
  cargarDatosFiltros: () => Promise<void>;
  cargarLotes: (tipo: 'vacuna' | 'jeringa', itemId?: string) => Promise<void>;

  // Actualizar filtros
  actualizarFiltros: (nuevosFiltros: Partial<KardexFilters>) => void;
  limpiarFiltros: () => void;

  // Paginación
  cambiarPagina: (page: number) => void;
  cambiarItemsPorPagina: (itemsPerPage: number) => void;
  irAPrimeraPagina: () => void;
  irAUltimaPagina: () => void;

  // Refrescar datos
  refrescarTodo: () => Promise<void>;

  // Limpiar errores
  limpiarErrores: () => void;
}

/**
 * Filtros por defecto
 */
const FILTROS_DEFECTO: KardexFilters = {
  page: 1,
  limit: 10, // Cambiado a 10 elementos por página por defecto
  fechaInicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Inicio del año actual
  fechaFin: new Date().toISOString().split('T')[0] // Fecha actual
};

/**
 * Hook personalizado para manejar datos del Kardex
 * Proporciona estado centralizado y funciones para interactuar con la API
 */
export const useKardexData = () => {
  const [state, setState] = useState<KardexDataState>({
    // Datos principales
    movimientos: [],
    estadisticas: null,
    total: 0,

    // Datos para filtros
    vacunas: [],
    jeringas: [],
    establecimientos: [],
    lotes: [],

    // Estados de paginación
    currentPage: 1,
    itemsPerPage: 10, // Cambiado a 10 elementos por página por defecto
    totalPages: 0,

    // Estados de carga
    loading: false,
    loadingEstadisticas: false,
    loadingFiltros: false,

    // Estados de error
    error: null,
    errorEstadisticas: null,
    errorFiltros: null,

    // Filtros actuales
    filtros: FILTROS_DEFECTO
  });

  /**
   * Cargar movimientos de kardex
   */
  const cargarMovimientos = useCallback(async (filtros?: KardexFilters) => {
    // Obtener filtros finales antes de setState
    const filtrosFinales = filtros || state.filtros;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🔍 Cargando movimientos con filtros:', filtrosFinales); // Debug log
      const resultado = await KardexService.getMovimientos(filtrosFinales);
      console.log('📊 Resultado obtenido:', { total: resultado.total, movimientos: resultado.movimientos.length }); // Debug log

      setState(prev => {
        const totalPages = Math.ceil(resultado.total / (filtrosFinales.limit || 10));
        return {
          ...prev,
          movimientos: resultado.movimientos,
          total: resultado.total,
          totalPages,
          currentPage: filtrosFinales.page || 1,
          itemsPerPage: filtrosFinales.limit || 10,
          loading: false
        };
      });
    } catch (error) {
      console.error('❌ Error al cargar movimientos:', error); // Debug log
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar movimientos'
      }));
    }
  }, [state.filtros]); // Incluir state.filtros como dependencia

  /**
   * Cargar estadísticas del kardex
   */
  const cargarEstadisticas = useCallback(async (filtros?: Omit<KardexFilters, 'page' | 'limit'>) => {
    // Obtener filtros finales antes de setState
    const filtrosEstadisticas = filtros || {
      tipo: state.filtros.tipo,
      itemId: state.filtros.itemId,
      loteId: state.filtros.loteId,
      tipoMovimiento: state.filtros.tipoMovimiento,
      establecimientoOrigenId: state.filtros.establecimientoOrigenId,
      establecimientoDestinoId: state.filtros.establecimientoDestinoId,
      fechaInicio: state.filtros.fechaInicio,
      fechaFin: state.filtros.fechaFin,
      search: state.filtros.search
    };

    setState(prev => ({ ...prev, loadingEstadisticas: true, errorEstadisticas: null }));

    try {
      console.log('📈 Cargando estadísticas con filtros:', filtrosEstadisticas); // Debug log
      const estadisticas = await KardexService.getEstadisticas(filtrosEstadisticas);

      setState(prev => ({
        ...prev,
        estadisticas,
        loadingEstadisticas: false
      }));
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error); // Debug log
      setState(prev => ({
        ...prev,
        loadingEstadisticas: false,
        errorEstadisticas: error instanceof Error ? error.message : 'Error al cargar estadísticas'
      }));
    }
  }, [state.filtros]); // Incluir state.filtros como dependencia

  /**
   * Cargar datos para filtros (vacunas, jeringas, establecimientos)
   */
  const cargarDatosFiltros = useCallback(async () => {
    setState(prev => ({ ...prev, loadingFiltros: true, errorFiltros: null }));

    try {
      const [vacunas, jeringas, establecimientos] = await Promise.all([
        KardexService.getVacunas(),
        KardexService.getJeringas(),
        KardexService.getEstablecimientos()
      ]);

      setState(prev => ({
        ...prev,
        vacunas,
        jeringas,
        establecimientos,
        loadingFiltros: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loadingFiltros: false,
        errorFiltros: error instanceof Error ? error.message : 'Error al cargar datos para filtros'
      }));
    }
  }, []);

  /**
   * Cargar lotes dinámicamente según el tipo y item seleccionado
   */
  const cargarLotes = useCallback(async (tipo: 'vacuna' | 'jeringa', itemId?: string) => {
    setState(prev => ({ ...prev, loadingFiltros: true, errorFiltros: null }));

    try {
      let lotes: any[] = [];

      if (tipo === 'vacuna' && itemId) {
        lotes = await LotesService.getLotesVacunas(itemId);
      } else if (tipo === 'jeringa' && itemId) {
        lotes = await LotesService.getLotesJeringas(itemId);
      }

      setState(prev => ({
        ...prev,
        lotes,
        loadingFiltros: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loadingFiltros: false,
        errorFiltros: error instanceof Error ? error.message : 'Error al cargar lotes'
      }));
    }
  }, []);

  /**
   * Actualizar filtros y recargar datos
   */
  const actualizarFiltros = useCallback(async (nuevosFiltros: Partial<KardexFilters>) => {
    // Resetear a página 1 si no se especifica página en los nuevos filtros
    const filtrosActualizados = {
      ...state.filtros,
      ...nuevosFiltros,
      page: nuevosFiltros.page || 1 // Reset to page 1 when filters change
    };

    setState(prev => ({
      ...prev,
      filtros: filtrosActualizados,
      currentPage: filtrosActualizados.page,
      loading: true,
      loadingEstadisticas: true
    }));

    // Luego cargar datos con los filtros actualizados
    try {
      await Promise.all([
        cargarMovimientos(filtrosActualizados),
        cargarEstadisticas(filtrosActualizados)
      ]);
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    }
  }, [state.filtros, cargarMovimientos, cargarEstadisticas]);

  /**
   * Limpiar filtros y volver a los valores por defecto
   */
  const limpiarFiltros = useCallback(async () => {
    setState(prev => ({
      ...prev,
      filtros: FILTROS_DEFECTO,
      loading: true,
      loadingEstadisticas: true
    }));

    // Recargar datos con filtros por defecto
    try {
      await Promise.all([
        cargarMovimientos(FILTROS_DEFECTO),
        cargarEstadisticas(FILTROS_DEFECTO)
      ]);
    } catch (error) {
      console.error('Error al limpiar filtros:', error);
    }
  }, [cargarMovimientos, cargarEstadisticas]);

  /**
   * Refrescar todos los datos
   */
  const refrescarTodo = useCallback(async () => {
    await Promise.all([
      cargarMovimientos(),
      cargarEstadisticas(),
      cargarDatosFiltros()
    ]);
  }, [cargarMovimientos, cargarEstadisticas, cargarDatosFiltros]);

  /**
   * Limpiar todos los errores
   */
  const limpiarErrores = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      errorEstadisticas: null,
      errorFiltros: null
    }));
  }, []);

  /**
   * Cambiar página actual
   */
  const cambiarPagina = useCallback((page: number) => {
    const nuevosFiltros = { ...state.filtros, page };
    setState(prev => ({ ...prev, currentPage: page }));
    cargarMovimientos(nuevosFiltros);
  }, [state.filtros, cargarMovimientos]);

  /**
   * Cambiar items por página
   */
  const cambiarItemsPorPagina = useCallback((itemsPerPage: number) => {
    const nuevosFiltros = { ...state.filtros, limit: itemsPerPage, page: 1 };
    setState(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1
    }));
    cargarMovimientos(nuevosFiltros);
  }, [state.filtros, cargarMovimientos]);

  /**
   * Ir a primera página
   */
  const irAPrimeraPagina = useCallback(() => {
    cambiarPagina(1);
  }, [cambiarPagina]);

  /**
   * Ir a última página
   */
  const irAUltimaPagina = useCallback(() => {
    if (state.totalPages > 0) {
      cambiarPagina(state.totalPages);
    }
  }, [state.totalPages, cambiarPagina]);

  /**
   * Cargar datos iniciales al montar el componente
   */
  useEffect(() => {
    cargarDatosFiltros();
    cargarMovimientos();
    cargarEstadisticas();
  }, []); // Solo se ejecuta una vez al montar

  // Retornar estado y acciones
  const actions: KardexDataActions = {
    cargarMovimientos,
    cargarEstadisticas,
    cargarDatosFiltros,
    cargarLotes,
    actualizarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarItemsPorPagina,
    irAPrimeraPagina,
    irAUltimaPagina,
    refrescarTodo,
    limpiarErrores
  };

  return {
    ...state,
    ...actions
  };
};

/**
 * Hook para obtener solo los datos de filtros (más liviano)
 */
export const useKardexFiltros = () => {
  const [state, setState] = useState({
    vacunas: [] as Vacuna[],
    jeringas: [] as Jeringa[],
    establecimientos: [] as Establecimiento[],
    loading: false,
    error: null as string | null
  });

  const cargarDatos = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [vacunas, jeringas, establecimientos] = await Promise.all([
        KardexService.getVacunas(),
        KardexService.getJeringas(),
        KardexService.getEstablecimientos()
      ]);
      
      setState({
        vacunas,
        jeringas,
        establecimientos,
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error al cargar datos'
      }));
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    ...state,
    refrescar: cargarDatos
  };
};
