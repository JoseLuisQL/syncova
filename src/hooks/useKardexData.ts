import { useCallback, useEffect, useRef, useState } from 'react';
import { KardexEstadisticas, KardexFilters, KardexMovimiento, KardexService } from '../services/KardexService';
import { LotesService } from '../services/LotesService';
import { Establecimiento, Jeringa, Vacuna } from '../types';

interface KardexLote {
  id: string;
  numero: string;
  fechaVencimiento?: Date | null;
  cantidadActual?: number;
  cantidadInicial?: number;
  estado?: string;
}

interface KardexDataState {
  movimientos: KardexMovimiento[];
  estadisticas: KardexEstadisticas | null;
  total: number;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  establecimientos: Establecimiento[];
  lotes: KardexLote[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  loading: boolean;
  loadingEstadisticas: boolean;
  loadingFiltros: boolean;
  error: string | null;
  errorEstadisticas: string | null;
  errorFiltros: string | null;
  filtros: KardexFilters;
}

interface KardexDataActions {
  cargarMovimientos: (filtros?: KardexFilters) => Promise<void>;
  cargarEstadisticas: (filtros?: Omit<KardexFilters, 'page' | 'limit'>) => Promise<void>;
  cargarDatosFiltros: () => Promise<void>;
  cargarLotes: (tipo: 'vacuna' | 'jeringa', itemId?: string) => Promise<void>;
  actualizarFiltros: (nuevosFiltros: Partial<KardexFilters>) => Promise<void>;
  limpiarFiltros: () => Promise<void>;
  cambiarPagina: (page: number) => void;
  cambiarItemsPorPagina: (itemsPerPage: number) => void;
  irAPrimeraPagina: () => void;
  irAUltimaPagina: () => void;
  refrescarTodo: () => Promise<void>;
  limpiarErrores: () => void;
}

const DEFAULT_ITEMS_PER_PAGE = 20;
const FILTROS_DEFECTO: KardexFilters = {
  page: 1,
  limit: DEFAULT_ITEMS_PER_PAGE,
};

const normalizeFilters = (filters: Partial<KardexFilters>): KardexFilters => {
  const next: KardexFilters = {
    page: FILTROS_DEFECTO.page,
    limit: FILTROS_DEFECTO.limit,
    ...filters,
  };

  if (!next.page || next.page < 1) {
    next.page = 1;
  }

  if (!next.limit || next.limit < 1) {
    next.limit = DEFAULT_ITEMS_PER_PAGE;
  }

  (Object.keys(next) as Array<keyof KardexFilters>).forEach((key) => {
    const value = next[key];

    if (value === '' || value === null) {
      delete next[key];
    }
  });

  return next;
};

const stripPagination = (filters: KardexFilters): Omit<KardexFilters, 'page' | 'limit'> => {
  const { page: _page, limit: _limit, ...rest } = filters;
  return rest;
};

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useKardexData = () => {
  const [state, setState] = useState<KardexDataState>({
    movimientos: [],
    estadisticas: null,
    total: 0,
    vacunas: [],
    jeringas: [],
    establecimientos: [],
    lotes: [],
    currentPage: 1,
    itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    totalPages: 0,
    loading: false,
    loadingEstadisticas: false,
    loadingFiltros: false,
    error: null,
    errorEstadisticas: null,
    errorFiltros: null,
    filtros: FILTROS_DEFECTO,
  });

  const filtersRef = useRef<KardexFilters>(FILTROS_DEFECTO);
  const mountedRef = useRef(true);
  const movimientosRequestIdRef = useRef(0);
  const estadisticasRequestIdRef = useRef(0);
  const lotesRequestIdRef = useRef(0);

  const cargarMovimientos = useCallback(async (filtros?: KardexFilters) => {
    const filtrosFinales = normalizeFilters(filtros ?? filtersRef.current);
    const requestId = ++movimientosRequestIdRef.current;

    filtersRef.current = filtrosFinales;

    setState((prev) => ({
      ...prev,
      filtros: filtrosFinales,
      currentPage: filtrosFinales.page || 1,
      itemsPerPage: filtrosFinales.limit || DEFAULT_ITEMS_PER_PAGE,
      loading: true,
      error: null,
    }));

    try {
      const resultado = await KardexService.getMovimientos(filtrosFinales);

      if (!mountedRef.current || requestId !== movimientosRequestIdRef.current) {
        return;
      }

      const totalPages = resultado.total > 0
        ? Math.ceil(resultado.total / (filtrosFinales.limit || DEFAULT_ITEMS_PER_PAGE))
        : 0;

      setState((prev) => ({
        ...prev,
        movimientos: resultado.movimientos,
        total: resultado.total,
        totalPages,
        currentPage: filtrosFinales.page || 1,
        itemsPerPage: filtrosFinales.limit || DEFAULT_ITEMS_PER_PAGE,
        filtros: filtrosFinales,
        loading: false,
      }));
    } catch (error) {
      if (!mountedRef.current || requestId !== movimientosRequestIdRef.current) {
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: toErrorMessage(error, 'Error al cargar movimientos'),
      }));
    }
  }, []);

  const cargarEstadisticas = useCallback(async (filtros?: Omit<KardexFilters, 'page' | 'limit'>) => {
    const filtrosBase = filtros ? { ...filtros } : stripPagination(filtersRef.current);
    const requestId = ++estadisticasRequestIdRef.current;

    setState((prev) => ({
      ...prev,
      loadingEstadisticas: true,
      errorEstadisticas: null,
    }));

    try {
      const estadisticas = await KardexService.getEstadisticas(filtrosBase);

      if (!mountedRef.current || requestId !== estadisticasRequestIdRef.current) {
        return;
      }

      setState((prev) => ({
        ...prev,
        estadisticas,
        loadingEstadisticas: false,
      }));
    } catch (error) {
      if (!mountedRef.current || requestId !== estadisticasRequestIdRef.current) {
        return;
      }

      setState((prev) => ({
        ...prev,
        loadingEstadisticas: false,
        errorEstadisticas: toErrorMessage(error, 'Error al cargar estadísticas'),
      }));
    }
  }, []);

  const cargarDatosFiltros = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loadingFiltros: true,
      errorFiltros: null,
    }));

    try {
      const [vacunas, jeringas, establecimientos] = await Promise.all([
        KardexService.getVacunas(),
        KardexService.getJeringas(),
        KardexService.getEstablecimientos(),
      ]);

      if (!mountedRef.current) {
        return;
      }

      setState((prev) => ({
        ...prev,
        vacunas,
        jeringas,
        establecimientos,
        loadingFiltros: false,
      }));
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setState((prev) => ({
        ...prev,
        loadingFiltros: false,
        errorFiltros: toErrorMessage(error, 'Error al cargar datos para filtros'),
      }));
    }
  }, []);

  const cargarLotes = useCallback(async (tipo: 'vacuna' | 'jeringa', itemId?: string) => {
    const requestId = ++lotesRequestIdRef.current;

    if (!itemId) {
      setState((prev) => ({
        ...prev,
        lotes: [],
        loadingFiltros: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loadingFiltros: true,
      errorFiltros: null,
    }));

    try {
      const lotes = tipo === 'vacuna'
        ? await LotesService.getLotesVacunas(itemId)
        : await LotesService.getLotesJeringas(itemId);

      if (!mountedRef.current || requestId !== lotesRequestIdRef.current) {
        return;
      }

      setState((prev) => ({
        ...prev,
        lotes,
        loadingFiltros: false,
      }));
    } catch (error) {
      if (!mountedRef.current || requestId !== lotesRequestIdRef.current) {
        return;
      }

      setState((prev) => ({
        ...prev,
        lotes: [],
        loadingFiltros: false,
        errorFiltros: toErrorMessage(error, 'Error al cargar lotes'),
      }));
    }
  }, []);

  const actualizarFiltros = useCallback(async (nuevosFiltros: Partial<KardexFilters>) => {
    const shouldResetPage = Object.keys(nuevosFiltros).some((key) => key !== 'page' && key !== 'limit');
    const filtrosActualizados = normalizeFilters({
      ...filtersRef.current,
      ...nuevosFiltros,
      page: nuevosFiltros.page ?? (shouldResetPage ? 1 : filtersRef.current.page),
    });

    filtersRef.current = filtrosActualizados;

    setState((prev) => ({
      ...prev,
      filtros: filtrosActualizados,
      currentPage: filtrosActualizados.page || 1,
      itemsPerPage: filtrosActualizados.limit || DEFAULT_ITEMS_PER_PAGE,
    }));

    await Promise.all([
      cargarMovimientos(filtrosActualizados),
      cargarEstadisticas(stripPagination(filtrosActualizados)),
    ]);
  }, [cargarEstadisticas, cargarMovimientos]);

  const limpiarFiltros = useCallback(async () => {
    filtersRef.current = FILTROS_DEFECTO;

    setState((prev) => ({
      ...prev,
      filtros: FILTROS_DEFECTO,
      lotes: [],
      currentPage: 1,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    }));

    await Promise.all([
      cargarMovimientos(FILTROS_DEFECTO),
      cargarEstadisticas(stripPagination(FILTROS_DEFECTO)),
    ]);
  }, [cargarEstadisticas, cargarMovimientos]);

  const refrescarTodo = useCallback(async () => {
    const filtrosActuales = filtersRef.current;

    await Promise.all([
      cargarDatosFiltros(),
      cargarMovimientos(filtrosActuales),
      cargarEstadisticas(stripPagination(filtrosActuales)),
      filtrosActuales.tipo && filtrosActuales.itemId
        ? cargarLotes(filtrosActuales.tipo, filtrosActuales.itemId)
        : Promise.resolve(),
    ]);
  }, [cargarDatosFiltros, cargarEstadisticas, cargarLotes, cargarMovimientos]);

  const limpiarErrores = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      errorEstadisticas: null,
      errorFiltros: null,
    }));
  }, []);

  const cambiarPagina = useCallback((page: number) => {
    const filtrosActualizados = normalizeFilters({
      ...filtersRef.current,
      page,
    });

    filtersRef.current = filtrosActualizados;

    setState((prev) => ({
      ...prev,
      filtros: filtrosActualizados,
      currentPage: page,
    }));

    void cargarMovimientos(filtrosActualizados);
  }, [cargarMovimientos]);

  const cambiarItemsPorPagina = useCallback((itemsPerPage: number) => {
    const filtrosActualizados = normalizeFilters({
      ...filtersRef.current,
      limit: itemsPerPage,
      page: 1,
    });

    filtersRef.current = filtrosActualizados;

    setState((prev) => ({
      ...prev,
      filtros: filtrosActualizados,
      itemsPerPage,
      currentPage: 1,
    }));

    void cargarMovimientos(filtrosActualizados);
  }, [cargarMovimientos]);

  const irAPrimeraPagina = useCallback(() => {
    cambiarPagina(1);
  }, [cambiarPagina]);

  const irAUltimaPagina = useCallback(() => {
    if (state.totalPages > 1) {
      cambiarPagina(state.totalPages);
    }
  }, [cambiarPagina, state.totalPages]);

  useEffect(() => {
    mountedRef.current = true;

    void cargarDatosFiltros();
    void cargarMovimientos(FILTROS_DEFECTO);
    void cargarEstadisticas(stripPagination(FILTROS_DEFECTO));

    return () => {
      mountedRef.current = false;
    };
  }, [cargarDatosFiltros, cargarEstadisticas, cargarMovimientos]);

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
    limpiarErrores,
  };

  return {
    ...state,
    ...actions,
  };
};

export const useKardexFiltros = () => {
  const [state, setState] = useState({
    vacunas: [] as Vacuna[],
    jeringas: [] as Jeringa[],
    establecimientos: [] as Establecimiento[],
    centrosAcopio: [] as Array<{ id: string; nombre: string; codigo?: string }>,
    loading: false,
    error: null as string | null,
  });

  const cargarDatos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [vacunas, jeringas, establecimientos, centrosAcopio] = await Promise.all([
        KardexService.getVacunas(),
        KardexService.getJeringas(),
        KardexService.getEstablecimientos(),
        KardexService.getCentrosAcopio(),
      ]);

      setState({
        vacunas,
        jeringas,
        establecimientos,
        centrosAcopio,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: toErrorMessage(error, 'Error al cargar datos'),
      }));
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  return {
    ...state,
    refrescar: cargarDatos,
  };
};
