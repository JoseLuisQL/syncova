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
  const crudApi = useCrudApi<Usuario, boolean>();
  const activosApi = useApi<Usuario[]>();
  const statsApi = useApi<any>();
  const passwordApi = useApi<void>();
  const estadoApi = useApi<Usuario>();

  const listExecute = listApi.execute;
  const listReset = listApi.reset;
  const activosExecute = activosApi.execute;
  const activosReset = activosApi.reset;
  const statsExecute = statsApi.execute;
  const statsReset = statsApi.reset;
  const passwordExecute = passwordApi.execute;
  const passwordReset = passwordApi.reset;
  const estadoExecute = estadoApi.execute;
  const estadoReset = estadoApi.reset;
  const createExecute = crudApi.create.execute;
  const updateExecute = crudApi.update.execute;
  const deleteExecute = crudApi.delete.execute;
  const crudReset = crudApi.reset;

  // Estados derivados
  const isLoading = listApi.loading;
  const error = listApi.error;
  const isCreating = crudApi.create.loading;
  const isUpdating = crudApi.update.loading;
  const isDeleting = crudApi.delete.loading;
  const isChangingPassword = passwordApi.loading;
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

    if (currentFilters.centroAcopioId) {
      cleanFilters.centroAcopioId = currentFilters.centroAcopioId;
    }

    logger.debug('Cargando usuarios con filtros limpios:', cleanFilters);

    const result = await listExecute(() => UsuarioService.getAll(cleanFilters));

    if (result) {
      setUsuarios(result.usuarios);
      setPagination(result.pagination);
    }
  }, [listExecute]);

  /**
   * Cargar usuarios activos
   */
  const loadUsuariosActivos = useCallback(async () => {
    logger.debug('Cargando usuarios activos');

    const result = await activosExecute(() => UsuarioService.getActivos());
    
    if (result) {
      setUsuariosActivos(result);
    }
  }, [activosExecute]);

  /**
   * Crear usuario
   */
  const createUsuario = useCallback(async (data: CreateUsuarioDto): Promise<boolean> => {
    logger.debug('Creando usuario:', { ...data, password: '[OCULTA]' });

    const result = await createExecute(() => UsuarioService.create(data));
    
    if (result) {
      // Recargar la lista después de crear
      await loadUsuarios();
      await loadUsuariosActivos();
      return true;
    }
    
    return false;
  }, [createExecute, loadUsuarios, loadUsuariosActivos]);

  /**
   * Actualizar usuario
   */
  const updateUsuario = useCallback(async (id: string, data: UpdateUsuarioDto): Promise<boolean> => {
    logger.debug('Actualizando usuario:', { id, data });

    const result = await updateExecute(() => UsuarioService.update(id, data));
    
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
  }, [loadUsuariosActivos, updateExecute]);

  /**
   * Eliminar usuario
   */
  const deleteUsuario = useCallback(async (id: string): Promise<boolean> => {
    logger.debug('Hook deleteUsuario - Iniciando eliminación:', id);

    try {
      const result = await deleteExecute(() => UsuarioService.delete(id));

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
  }, [deleteExecute]);

  /**
   * Cambiar contraseña
   */
  const changePassword = useCallback(async (id: string, data: ChangePasswordDto): Promise<boolean> => {
    logger.debug('Cambiando contraseña de usuario:', id);

    const result = await passwordExecute(() => UsuarioService.changePassword(id, data));
    
    return result !== undefined;
  }, [passwordExecute]);

  /**
   * Cambiar estado de usuario
   */
  const changeEstado = useCallback(async (id: string, estado: 'activo' | 'inactivo'): Promise<boolean> => {
    logger.debug('Cambiando estado de usuario:', { id, estado });

    const result = await estadoExecute(() => UsuarioService.changeEstado(id, estado));
    
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
  }, [estadoExecute, loadUsuariosActivos]);

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

    const result = await statsExecute(() => UsuarioService.getStats());
    return result;
  }, [statsExecute]);

  /**
   * Exportar usuarios filtrados a CSV
   */
  const exportUsuarios = useCallback(async (): Promise<boolean> => {
    try {
      const exportResult = await UsuarioService.getAll({
        ...filtersRef.current,
        page: 1,
        limit: 1000,
      });

      const rows = exportResult.usuarios.map((usuario) => ({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        usuario: usuario.usuario,
        rol: usuario.rol,
        centroAcopio: usuario.centroAcopio?.nombre || '',
        estado: usuario.estado,
        ultimoAcceso: usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleString('es-PE') : '',
        creado: new Date(usuario.createdAt).toLocaleDateString('es-PE'),
      }));

      const headers = ['Nombres', 'Apellidos', 'Email', 'Usuario', 'Rol', 'Centro de acopio', 'Estado', 'Último acceso', 'Creado'];
      const csv = [
        headers.join(','),
        ...rows.map((row) => [
          row.nombres,
          row.apellidos,
          row.email,
          row.usuario,
          row.rol,
          row.centroAcopio,
          row.estado,
          row.ultimoAcceso,
          row.creado,
        ].map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      logger.error('Error al exportar usuarios:', error);
      return false;
    }
  }, []);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    crudReset();
    listReset();
    activosReset();
    statsReset();
    passwordReset();
    estadoReset();
  }, [activosReset, crudReset, estadoReset, listReset, passwordReset, statsReset]);

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
    isChangingPassword,
    
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
    exportUsuarios,
    clearErrors,
    
    // Utilidades
    loadUsuarios,
    loadUsuariosActivos
  };
};
