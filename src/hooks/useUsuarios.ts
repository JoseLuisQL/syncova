import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
  UsuarioFilters
} from '../types';
import UsuarioService from '../services/usuarioService';
import { useApi, useCrudApi } from './useApi';
import { logger } from '../utils/debug';

/**
 * Hook personalizado para gestión de usuarios
 */
export const useUsuarios = () => {
  // Estados locales
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosActivos, setUsuariosActivos] = useState<Usuario[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filtros actuales
  const filtersRef = useRef<UsuarioFilters>({
    page: 1,
    limit: 50
  });

  // APIs para operaciones CRUD
  const listApi = useApi<{
    usuarios: Usuario[];
    total: number;
    pagination: any;
  }>();
  const crudApi = useCrudApi<Usuario>();
  const activosApi = useApi<Usuario[]>();
  const statsApi = useApi<any>();
  const passwordApi = useApi<void>();
  const estadoApi = useApi<Usuario>();

  // Estados derivados
  const isLoading = listApi.loading;
  const error = listApi.error;
  const isCreating = crudApi.create.loading;
  const isUpdating = crudApi.update.loading;
  const isDeleting = crudApi.delete.loading;
  const createError = crudApi.create.error;
  const updateError = crudApi.update.error;
  const deleteError = crudApi.delete.error;
  const passwordError = passwordApi.error;
  const estadoError = estadoApi.error;

  /**
   * Cargar usuarios con filtros
   */
  const loadUsuarios = useCallback(async (filters?: UsuarioFilters) => {
    const currentFilters = { ...filtersRef.current, ...filters };
    filtersRef.current = currentFilters;

    // Limpiar filtros para el backend (remover valores 'todos')
    const cleanFilters: UsuarioFilters = {
      page: currentFilters.page,
      limit: currentFilters.limit
    };

    if (currentFilters.estado && currentFilters.estado !== 'todos') {
      cleanFilters.estado = currentFilters.estado;
    }

    if (currentFilters.rol && currentFilters.rol !== 'todos') {
      cleanFilters.rol = currentFilters.rol;
    }

    if (currentFilters.search) {
      cleanFilters.search = currentFilters.search;
    }

    if (currentFilters.establecimientoId) {
      cleanFilters.establecimientoId = currentFilters.establecimientoId;
    }

    logger.debug('Cargando usuarios con filtros limpios:', cleanFilters);

    const result = await listApi.execute(() => UsuarioService.getAll(cleanFilters));

    if (result) {
      setUsuarios(result.usuarios);
      setPagination(result.pagination);
    }
  }, [listApi]);

  /**
   * Cargar usuarios activos
   */
  const loadUsuariosActivos = useCallback(async () => {
    logger.debug('Cargando usuarios activos');

    const result = await activosApi.execute(() => UsuarioService.getActivos());
    
    if (result) {
      setUsuariosActivos(result);
    }
  }, [activosApi]);

  /**
   * Crear usuario
   */
  const createUsuario = useCallback(async (data: CreateUsuarioDto): Promise<boolean> => {
    logger.debug('Creando usuario:', { ...data, password: '[OCULTA]' });

    const result = await crudApi.create.execute(() => UsuarioService.create(data));
    
    if (result) {
      // Recargar la lista después de crear
      await loadUsuarios();
      await loadUsuariosActivos();
      return true;
    }
    
    return false;
  }, [crudApi.create, loadUsuarios, loadUsuariosActivos]);

  /**
   * Actualizar usuario
   */
  const updateUsuario = useCallback(async (id: string, data: UpdateUsuarioDto): Promise<boolean> => {
    logger.debug('Actualizando usuario:', { id, data });

    const result = await crudApi.update.execute(() => UsuarioService.update(id, data));
    
    if (result) {
      // Actualizar en la lista local
      setUsuarios(prev => prev.map(usuario => 
        usuario.id === id ? result : usuario
      ));
      
      // Recargar usuarios activos si es necesario
      if (data.estado !== undefined) {
        await loadUsuariosActivos();
      }
      
      return true;
    }
    
    return false;
  }, [crudApi.update, loadUsuariosActivos]);

  /**
   * Eliminar usuario
   */
  const deleteUsuario = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Hook deleteUsuario - Iniciando eliminación:', id);

    try {
      const result = await crudApi.delete.execute(() => UsuarioService.delete(id));

      logger.debug('Hook deleteUsuario - Resultado de execute:', {
        result,
        resultType: typeof result
      });

      // Si result es true, la operación fue exitosa
      // Si result es null, significa que hubo un error
      if (result === true) {
        logger.debug('Hook deleteUsuario - Operación exitosa, actualizando estado local');

        // Remover de la lista local
        setUsuarios(prev => {
          const newList = prev.filter(usuario => usuario.id !== id);
          logger.debug('Hook deleteUsuario - Lista actualizada:', {
            antes: prev.length,
            despues: newList.length
          });
          return newList;
        });

        setUsuariosActivos(prev => prev.filter(usuario => usuario.id !== id));

        // Actualizar paginación
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));

        logger.debug('Hook deleteUsuario - Usuario eliminado exitosamente del estado local');
        return true;
      }

      logger.error('Hook deleteUsuario - Error en la operación (result es null)');
      return false;
    } catch (error) {
      logger.error('Hook deleteUsuario - Excepción capturada:', error);
      return false;
    }
  }, [crudApi.delete]);

  /**
   * Cambiar contraseña
   */
  const changePassword = useCallback(async (id: string, data: ChangePasswordDto): Promise<boolean> => {
    logger.debug('Cambiando contraseña de usuario:', id);

    const result = await passwordApi.execute(() => UsuarioService.changePassword(id, data));
    
    return result !== undefined;
  }, [passwordApi]);

  /**
   * Cambiar estado de usuario
   */
  const changeEstado = useCallback(async (id: string, estado: 'activo' | 'inactivo'): Promise<boolean> => {
    logger.debug('Cambiando estado de usuario:', { id, estado });

    const result = await estadoApi.execute(() => UsuarioService.changeEstado(id, estado));
    
    if (result) {
      // Actualizar en la lista local
      setUsuarios(prev => prev.map(usuario => 
        usuario.id === id ? result : usuario
      ));
      
      // Recargar usuarios activos
      await loadUsuariosActivos();
      
      return true;
    }
    
    return false;
  }, [estadoApi, loadUsuariosActivos]);

  /**
   * Buscar usuarios
   */
  const search = useCallback(async (searchTerm: string) => {
    logger.debug('Buscando usuarios:', searchTerm);
    
    await loadUsuarios({
      ...filtersRef.current,
      search: searchTerm,
      page: 1 // Reset a la primera página
    });
  }, [loadUsuarios]);

  /**
   * Aplicar filtros
   */
  const applyFilters = useCallback(async (filters: Partial<UsuarioFilters>) => {
    logger.debug('Aplicando filtros:', filters);
    
    await loadUsuarios({
      ...filtersRef.current,
      ...filters,
      page: 1 // Reset a la primera página
    });
  }, [loadUsuarios]);

  /**
   * Cambiar página
   */
  const changePage = useCallback(async (page: number) => {
    logger.debug('Cambiando a página:', page);
    
    await loadUsuarios({
      ...filtersRef.current,
      page
    });
  }, [loadUsuarios]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    logger.debug('Refrescando datos de usuarios');
    
    await Promise.all([
      loadUsuarios(),
      loadUsuariosActivos()
    ]);
  }, [loadUsuarios, loadUsuariosActivos]);

  /**
   * Obtener estadísticas
   */
  const getStats = useCallback(async () => {
    logger.debug('Obteniendo estadísticas de usuarios');

    const result = await statsApi.execute(() => UsuarioService.getStats());
    return result;
  }, [statsApi]);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    crudApi.reset();
    listApi.reset();
    activosApi.reset();
    statsApi.reset();
    passwordApi.reset();
    estadoApi.reset();
  }, [crudApi, listApi, activosApi, statsApi, passwordApi, estadoApi]);

  // Cargar datos iniciales
  useEffect(() => {
    loadUsuarios();
    loadUsuariosActivos();
  }, []); // Solo al montar el componente

  return {
    // Datos
    usuarios,
    usuariosActivos,
    pagination,
    
    // Estados de carga
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Errores
    error,
    createError,
    updateError,
    deleteError,
    passwordError,
    estadoError,
    
    // Acciones
    createUsuario,
    updateUsuario,
    deleteUsuario,
    changePassword,
    changeEstado,
    search,
    applyFilters,
    changePage,
    refresh,
    getStats,
    clearErrors,
    
    // Utilidades
    loadUsuarios,
    loadUsuariosActivos
  };
};
