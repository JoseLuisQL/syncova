import { useState, useCallback } from 'react';

/**
 * Estados posibles para operaciones API
 */
export type ApiState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Resultado de una operación API
 */
export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Hook genérico para manejar estados de API
 */
export interface UseApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  state: ApiState;
}

/**
 * Hook genérico para operaciones API con manejo de estados
 */
export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    state: 'idle'
  });

  /**
   * Ejecutar una operación API y devolver resultado con error
   */
  const executeWithResult = useCallback(async (apiCall: () => Promise<T>): Promise<ApiResult<T>> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      state: 'loading'
    }));

    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
        state: 'success'
      });
      return { data: result, error: null, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        state: 'error'
      });
      return { data: null, error: errorMessage, success: false };
    }
  }, []);

  /**
   * Ejecutar una operación API (compatibilidad con código existente)
   */
  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    const result = await executeWithResult(apiCall);
    return result.data;
  }, [executeWithResult]);

  /**
   * Limpiar el estado
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      state: 'idle'
    });
  }, []);

  /**
   * Establecer datos manualmente
   */
  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      state: 'success'
    }));
  }, []);

  /**
   * Establecer error manualmente
   */
  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      state: 'error'
    }));
  }, []);

  return {
    ...state,
    isLoading: state.loading,
    execute,
    executeWithResult,
    reset,
    setData,
    setError
  };
}

/**
 * Hook específico para operaciones CRUD
 */
export function useCrudApi<T = any>() {
  const createApi = useApi<T>();
  const updateApi = useApi<T>();
  const deleteApi = useApi<void>();
  const fetchApi = useApi<T>();
  const getByIdApi = useApi<T>();

  const isLoading = createApi.loading || updateApi.loading || deleteApi.loading || fetchApi.loading || getByIdApi.loading;
  const hasError = createApi.error || updateApi.error || deleteApi.error || fetchApi.error || getByIdApi.error;

  return {
    create: createApi,
    update: updateApi,
    delete: deleteApi,
    fetch: fetchApi,
    getById: getByIdApi,
    isLoading,
    hasError,
    reset: () => {
      createApi.reset();
      updateApi.reset();
      deleteApi.reset();
      fetchApi.reset();
      getByIdApi.reset();
    }
  };
}

export default useApi;
