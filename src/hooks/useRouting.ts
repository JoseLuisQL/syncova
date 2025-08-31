import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo, useState, useEffect } from 'react';

/**
 * Hook personalizado para navegación con utilidades adicionales
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToModule = useCallback((module: string, subModule?: string, params?: Record<string, string>) => {
    let path = `/${module}`;
    
    if (subModule) {
      path += `/${subModule}`;
    }

    // Agregar parámetros de consulta si se proporcionan
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      path += `?${searchParams.toString()}`;
    }

    navigate(path);
  }, [navigate]);

  const navigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const navigateToHome = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return {
    navigate,
    navigateToModule,
    navigateBack,
    navigateToHome,
    currentPath: location.pathname,
    currentSearch: location.search,
    currentState: location.state
  };
};

/**
 * Hook para obtener información de la ruta actual
 */
export const useCurrentRoute = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const pathSegments = useMemo(() => {
    return location.pathname.split('/').filter(segment => segment !== '');
  }, [location.pathname]);

  const currentModule = useMemo(() => {
    return pathSegments[0] || 'dashboard';
  }, [pathSegments]);

  const currentSubModule = useMemo(() => {
    return pathSegments[1] || null;
  }, [pathSegments]);

  const breadcrumbs = useMemo(() => {
    const crumbs = [];
    let path = '';

    pathSegments.forEach((segment, index) => {
      path += `/${segment}`;
      crumbs.push({
        label: getSegmentLabel(segment, index),
        path,
        isLast: index === pathSegments.length - 1
      });
    });

    return crumbs;
  }, [pathSegments]);

  return {
    currentModule,
    currentSubModule,
    pathSegments,
    breadcrumbs,
    params,
    searchParams,
    fullPath: location.pathname
  };
};

/**
 * Hook para sincronizar estado con URL
 */
export const useUrlState = <T extends Record<string, any>>(
  initialState: T,
  options: {
    syncToUrl?: boolean;
    urlKeys?: (keyof T)[];
  } = {}
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { syncToUrl = true, urlKeys } = options;

  // Obtener estado desde URL
  const getStateFromUrl = useCallback((): Partial<T> => {
    const urlState: Partial<T> = {};

    if (!syncToUrl) return urlState;

    const keysToSync = urlKeys || Object.keys(initialState) as (keyof T)[];

    keysToSync.forEach(key => {
      const value = searchParams.get(String(key));
      if (value !== null) {
        // Intentar parsear el valor
        try {
          urlState[key] = JSON.parse(value) as T[keyof T];
        } catch {
          urlState[key] = value as T[keyof T];
        }
      }
    });

    return urlState;
  }, [searchParams, syncToUrl, urlKeys, initialState]);

  // Actualizar URL con estado
  const updateUrlWithState = useCallback((newState: Partial<T>) => {
    if (!syncToUrl) return;

    const keysToSync = urlKeys || Object.keys(newState) as (keyof T)[];
    const newSearchParams = new URLSearchParams(searchParams);

    keysToSync.forEach(key => {
      if (newState[key] !== undefined && newState[key] !== null) {
        const value = typeof newState[key] === 'string'
          ? newState[key] as string
          : JSON.stringify(newState[key]);
        newSearchParams.set(String(key), value);
      } else {
        newSearchParams.delete(String(key));
      }
    });

    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams, syncToUrl, urlKeys]);

  return {
    getStateFromUrl,
    updateUrlWithState
  };
};

/**
 * Hook para gestionar estado de componente sincronizado con URL
 */
export const useUrlSyncedState = <T extends Record<string, any>>(
  initialState: T,
  options: {
    syncToUrl?: boolean;
    urlKeys?: (keyof T)[];
  } = {}
) => {
  const { getStateFromUrl, updateUrlWithState } = useUrlState(initialState, options);
  const [state, setState] = useState<T>(() => {
    const urlState = getStateFromUrl();
    return { ...initialState, ...urlState };
  });

  // Actualizar estado y URL
  const updateState = useCallback((newState: Partial<T> | ((prev: T) => Partial<T>)) => {
    setState(prevState => {
      const updatedState = typeof newState === 'function'
        ? { ...prevState, ...newState(prevState) }
        : { ...prevState, ...newState };

      // Sincronizar con URL
      updateUrlWithState(updatedState);

      return updatedState;
    });
  }, [updateUrlWithState]);

  // Sincronizar con cambios en URL (navegación del navegador)
  useEffect(() => {
    const urlState = getStateFromUrl();
    if (Object.keys(urlState).length > 0) {
      setState(prevState => ({ ...prevState, ...urlState }));
    }
  }, [getStateFromUrl]);

  return [state, updateState] as const;
};

/**
 * Obtener etiqueta legible para un segmento de ruta
 */
const getSegmentLabel = (segment: string, _index: number): string => {
  const labels: Record<string, string> = {
    // Módulos principales
    'dashboard': 'Dashboard',
    'establecimientos': 'Establecimientos',
    'inventario': 'Inventario',
    'movimientos': 'Movimientos',
    'planificacion': 'Planificación',
    'kardex': 'Kardex',
    'reportes': 'Reportes',
    'alertas': 'Alertas',
    'usuarios': 'Usuarios',
    'configuracion': 'Configuración',
    'debug': 'Debug',
    
    // Sub-módulos de Establecimientos
    'redes': 'Redes',
    'microredes': 'Microredes',
    'centros-acopio': 'Centros de Acopio',
    
    // Sub-módulos de Inventario
    'vacunas': 'Vacunas',
    'jeringas': 'Jeringas',
    'lotes-vacunas': 'Lotes de Vacunas',
    'lotes-jeringas': 'Lotes de Jeringas',
    'recepcion': 'Nuevo Ingreso',
    
    // Sub-módulos de Planificación
    'programacion': 'Programación',
    'importar': 'Importar',
    'distribucion': 'Distribución',
    
    // Acciones comunes
    'nuevo': 'Nuevo',
    'editar': 'Editar',
    'ver': 'Ver',
    'detalle': 'Detalle'
  };

  return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
};

/**
 * Hook para obtener el título de la página basado en la ruta actual
 */
export const usePageTitle = () => {
  const { currentModule, currentSubModule, breadcrumbs } = useCurrentRoute();

  const pageTitle = useMemo(() => {
    const baseTitle = 'SIVAC - Sistema de Gestión de Vacunas';
    
    if (currentModule === 'dashboard') {
      return baseTitle;
    }

    const moduleTitle = getSegmentLabel(currentModule, 0);
    
    if (currentSubModule) {
      const subModuleTitle = getSegmentLabel(currentSubModule, 1);
      return `${subModuleTitle} - ${moduleTitle} | ${baseTitle}`;
    }

    return `${moduleTitle} | ${baseTitle}`;
  }, [currentModule, currentSubModule, breadcrumbs]);

  return pageTitle;
};

/**
 * Configuración de rutas del sistema
 */
export const ROUTES = {
  DASHBOARD: '/dashboard',
  ESTABLECIMIENTOS: {
    ROOT: '/establecimientos',
    REDES: '/establecimientos/redes',
    MICROREDES: '/establecimientos/microredes',
    CENTROS_ACOPIO: '/establecimientos/centros-acopio',
    ESTABLECIMIENTOS: '/establecimientos/establecimientos'
  },
  INVENTARIO: {
    ROOT: '/inventario',
    VACUNAS: '/inventario/vacunas',
    JERINGAS: '/inventario/jeringas',
    LOTES_VACUNAS: '/inventario/lotes-vacunas',
    LOTES_JERINGAS: '/inventario/lotes-jeringas',
    RECEPCION: '/inventario/recepcion'
  },
  MOVIMIENTOS: '/movimientos',
  PLANIFICACION: {
    ROOT: '/planificacion',
    PROGRAMACION: '/planificacion/programacion',
    IMPORTAR: '/planificacion/importar',
    DISTRIBUCION: '/planificacion/distribucion',
    REPORTES: '/planificacion/reportes'
  },
  KARDEX: '/kardex',
  REPORTES: '/reportes',
  ALERTAS: {
    ROOT: '/alertas',
    DASHBOARD: '/alertas/dashboard',
    ALERTAS: '/alertas/alertas',
    REPORTES: '/alertas/reportes',
    CONFIGURACION: '/alertas/configuracion'
  },
  USUARIOS: '/usuarios',
  CONFIGURACION: '/configuracion',
  DEBUG: '/debug'
} as const;
