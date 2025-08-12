import { useState, useCallback } from 'react';

/**
 * Estados posibles para operaciones API
 */
export type ApiState = 'idle' | 'loading' | 'success' | 'error';

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
   * Ejecutar una operación API
   */
  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
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
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        state: 'error'
      });
      return null;
    }
  }, []);

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
    execute,
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
