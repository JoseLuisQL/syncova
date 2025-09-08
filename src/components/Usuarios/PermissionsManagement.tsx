import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Key,
  Settings,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  RefreshCw,
  Loader2,
  BarChart3,
  Activity,
  Clock,
  Database,
  Tag,
  Filter
} from 'lucide-react';
import { Permission, CreatePermissionDto, UpdatePermissionDto } from '../../types';
import { PermissionService } from '../../services/permissionService';
import { useToastContext } from '../../contexts/ToastContext';
import { logger } from '../../utils/debug';

interface PermissionsManagementProps {
  onNavigateToRoles?: () => void;
}

const PermissionsManagement: React.FC<PermissionsManagementProps> = ({ onNavigateToRoles }) => {
  // Estados principales
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterRecurso, setFilterRecurso] = useState<string>('todos');
  const [filterAccion, setFilterAccion] = useState<string>('todas');
  
  // Estados para operaciones
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para estadísticas
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    porCategoria: {} as Record<string, number>,
    porRecurso: {} as Record<string, number>,
    asignados: 0
  });

  // Estados para metadatos
  const [categorias, setCategorias] = useState<string[]>([]);
  const [recursos, setRecursos] = useState<string[]>([]);
  const [acciones, setAcciones] = useState<string[]>([]);

  const { addToast } = useToastContext();

  // Cargar datos iniciales
  useEffect(() => {
    loadPermissions();
    loadStats();
    loadMetadata();
  }, []);

  // Filtrar permisos
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = searchTerm === '' || 
      permission.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.recurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.accion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'todos' || permission.estado === filterEstado;
    const matchesCategoria = filterCategoria === 'todas' || permission.categoria === filterCategoria;
    const matchesRecurso = filterRecurso === 'todos' || permission.recurso === filterRecurso;
    const matchesAccion = filterAccion === 'todas' || permission.accion === filterAccion;
    
    return matchesSearch && matchesEstado && matchesCategoria && matchesRecurso && matchesAccion;
  });

  /**
   * Cargar permisos
   */
  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await PermissionService.getAll({ limit: 200 });
      
      setPermissions(result.permissions);
      logger.debug('Permisos cargados:', result.permissions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar permisos';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      logger.error('Error al cargar permisos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas
   */
  const loadStats = async () => {
    try {
      const result = await PermissionService.getStats();
      setStats(result);
    } catch (error) {
      logger.error('Error al cargar estadísticas:', error);
    }
  };

  /**
   * Cargar metadatos
   */
  const loadMetadata = async () => {
    try {
      const [categoriasResult, recursosResult, accionesResult] = await Promise.all([
        PermissionService.getCategorias(),
        PermissionService.getRecursos(),
        PermissionService.getAcciones()
      ]);
      
      setCategorias(categoriasResult);
      setRecursos(recursosResult);
      setAcciones(accionesResult);
    } catch (error) {
      logger.error('Error al cargar metadatos:', error);
    }
  };

  /**
   * Manejar eliminación de permiso
   */
  const handleDelete = async (permission: Permission) => {
    if (!confirm(`¿Está seguro de eliminar el permiso "${permission.nombre}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await PermissionService.delete(permission.id);
      addToast('success', 'Éxito', 'Permiso eliminado correctamente');
      await loadPermissions();
      await loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar permiso';
      addToast('error', 'Error', errorMessage);
      logger.error('Error al eliminar permiso:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Manejar cambio de estado
   */
  const handleToggleEstado = async (permission: Permission) => {
    try {
      const nuevoEstado = permission.estado === 'activo' ? 'inactivo' : 'activo';
      await PermissionService.changeEstado(permission.id, nuevoEstado);
      addToast('success', 'Éxito', `Permiso ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
      await loadPermissions();
      await loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar estado';
      addToast('error', 'Error', errorMessage);
      logger.error('Error al cambiar estado:', error);
    }
  };

  /**
   * Obtener color del estado
   */
  const getEstadoColor = (estado: string) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  /**
   * Obtener color de la acción
   */
  const getAccionColor = (accion: string) => {
    const colors: Record<string, string> = {
      'read': 'bg-blue-100 text-blue-800',
      'write': 'bg-green-100 text-green-800',
      'delete': 'bg-red-100 text-red-800',
      'export': 'bg-purple-100 text-purple-800',
      'manage': 'bg-orange-100 text-orange-800'
    };
    return colors[accion] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Obtener color de la categoría
   */
  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'usuarios': 'bg-indigo-100 text-indigo-800',
      'establecimientos': 'bg-cyan-100 text-cyan-800',
      'vacunas': 'bg-emerald-100 text-emerald-800',
      'planificacion': 'bg-amber-100 text-amber-800',
      'movimientos': 'bg-rose-100 text-rose-800',
      'reportes': 'bg-violet-100 text-violet-800',
      'sistema': 'bg-slate-100 text-slate-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Cargando permisos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Error al cargar permisos</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={loadPermissions}
          className="mt-4 flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Permisos</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Key className="h-8 w-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Activos</p>
              <p className="text-2xl font-bold">{stats.activos}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Inactivos</p>
              <p className="text-2xl font-bold">{stats.inactivos}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Asignados</p>
              <p className="text-2xl font-bold">{stats.asignados}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col space-y-4">
          {/* Primera fila: Búsqueda y botones */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar permisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full lg:w-64"
              />
            </div>

            <div className="flex space-x-2">
              {/* Botón gestionar roles */}
              {onNavigateToRoles && (
                <button
                  onClick={onNavigateToRoles}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Gestionar Roles
                </button>
              )}
            </div>
          </div>

          {/* Segunda fila: Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            {/* Filtro por categoría */}
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </option>
              ))}
            </select>

            {/* Filtro por recurso */}
            <select
              value={filterRecurso}
              onChange={(e) => setFilterRecurso(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todos">Todos los recursos</option>
              {recursos.map(recurso => (
                <option key={recurso} value={recurso}>
                  {recurso.charAt(0).toUpperCase() + recurso.slice(1)}
                </option>
              ))}
            </select>

            {/* Filtro por acción */}
            <select
              value={filterAccion}
              onChange={(e) => setFilterAccion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todas">Todas las acciones</option>
              {acciones.map(accion => (
                <option key={accion} value={accion}>
                  {accion.charAt(0).toUpperCase() + accion.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de permisos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permiso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Key className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">No se encontraron permisos</p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm || filterEstado !== 'todos' || filterCategoria !== 'todas' || filterRecurso !== 'todos' || filterAccion !== 'todas'
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'No hay permisos disponibles'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Key className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {permission.nombre}
                          </div>
                          {permission.descripcion && (
                            <div className="text-sm text-gray-500">
                              {permission.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {permission.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoriaColor(permission.categoria)}`}>
                        {permission.categoria.charAt(0).toUpperCase() + permission.categoria.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {permission.recurso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccionColor(permission.accion)}`}>
                        {permission.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(permission.estado)}`}>
                        {permission.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {permission.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Botón cambiar estado */}
                        <button
                          onClick={() => handleToggleEstado(permission)}
                          className={`p-1 rounded ${
                            permission.estado === 'activo'
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={permission.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        >
                          {permission.estado === 'activo' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
