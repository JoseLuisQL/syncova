import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Key,
  AlertTriangle,
  RefreshCw,
  Loader2,
  BarChart3,
  Activity,
  Clock,
  Database
} from 'lucide-react';
import { Role, CreateRoleDto, UpdateRoleDto, Permission } from '../../types';
import { RoleService } from '../../services/roleService';
import { PermissionService } from '../../services/permissionService';
import { useToastContext } from '../../contexts/ToastContext';
import { logger } from '../../utils/debug';
import RoleModal from './RoleModal';
import PermissionsModal from './PermissionsModal';

interface RolesManagementProps {
  onNavigateToPermissions?: () => void;
}

const RolesManagement: React.FC<RolesManagementProps> = ({ onNavigateToPermissions }) => {
  // Estados principales
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  
  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Estados para operaciones
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para permisos
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
  // Estados para estadísticas
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    porDefecto: 0,
    personalizados: 0,
    conUsuarios: 0
  });

  const { addToast } = useToastContext();

  // Cargar datos iniciales
  useEffect(() => {
    loadRoles();
    loadStats();
  }, []);

  // Filtrar roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = searchTerm === '' || 
      role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'todos' || role.estado === filterEstado;
    
    return matchesSearch && matchesEstado;
  });

  /**
   * Cargar roles
   */
  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await RoleService.getAll({
        includePermissions: false,
        limit: 100
      });
      
      setRoles(result.roles);
      logger.debug('Roles cargados:', result.roles);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar roles';
      setError(errorMessage);
      addToast('error', 'Error', errorMessage);
      logger.error('Error al cargar roles:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas
   */
  const loadStats = async () => {
    try {
      const result = await RoleService.getStats();
      setStats(result);
    } catch (error) {
      logger.error('Error al cargar estadísticas:', error);
    }
  };

  /**
   * Cargar permisos disponibles
   */
  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const result = await PermissionService.getAll({ limit: 200 });
      setPermissions(result.permissions);
    } catch (error) {
      logger.error('Error al cargar permisos:', error);
      addToast('error', 'Error', 'Error al cargar permisos disponibles');
    } finally {
      setLoadingPermissions(false);
    }
  };

  /**
   * Cargar permisos de un rol
   */
  const loadRolePermissions = async (roleId: string) => {
    try {
      setLoadingPermissions(true);
      const result = await RoleService.getRolePermissions(roleId);
      setRolePermissions(result);
      setSelectedPermissions(result.map(p => p.id));
    } catch (error) {
      logger.error('Error al cargar permisos del rol:', error);
      addToast('error', 'Error', 'Error al cargar permisos del rol');
    } finally {
      setLoadingPermissions(false);
    }
  };

  /**
   * Manejar creación/edición de rol
   */
  const handleSubmit = async (formData: CreateRoleDto | UpdateRoleDto) => {
    try {
      if (editingRole) {
        setIsUpdating(true);
        await RoleService.update(editingRole.id, formData as UpdateRoleDto);
        addToast('success', 'Éxito', 'Rol actualizado correctamente');
      } else {
        setIsCreating(true);
        await RoleService.create(formData as CreateRoleDto);
        addToast('success', 'Éxito', 'Rol creado correctamente');
      }
      
      setShowModal(false);
      setEditingRole(null);
      await loadRoles();
      await loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar rol';
      addToast('error', 'Error', errorMessage);
      logger.error('Error al guardar rol:', error);
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  /**
   * Manejar eliminación de rol
   */
  const handleDelete = async (role: Role) => {
    if (!confirm(`¿Está seguro de eliminar el rol "${role.nombre}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await RoleService.delete(role.id);
      addToast('success', 'Éxito', 'Rol eliminado correctamente');
      await loadRoles();
      await loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar rol';
      addToast('error', 'Error', errorMessage);
      logger.error('Error al eliminar rol:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Manejar cambio de estado
   */
  const handleToggleEstado = async (role: Role) => {
    try {
      const nuevoEstado = role.estado === 'activo' ? 'inactivo' : 'activo';
      await RoleService.changeEstado(role.id, nuevoEstado);
      addToast('success', 'Éxito', `Rol ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
      await loadRoles();
      await loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar estado';
      addToast('error', 'Error', errorMessage);
      logger.error('Error al cambiar estado:', error);
    }
  };

  /**
   * Manejar edición de rol
   */
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  /**
   * Manejar gestión de permisos
   */
  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role);
    await loadPermissions();
    await loadRolePermissions(role.id);
    setShowPermissionsModal(true);
  };

  /**
   * Guardar permisos del rol
   */
  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setLoadingPermissions(true);
      await RoleService.assignPermissions(selectedRole.id, selectedPermissions);
      addToast('success', 'Éxito', 'Permisos asignados correctamente');
      setShowPermissionsModal(false);
      setSelectedRole(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al asignar permisos';
      addToast('error', 'Error', errorMessage);
      logger.error('Error al asignar permisos:', error);
    } finally {
      setLoadingPermissions(false);
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
   * Obtener color del tipo de rol
   */
  const getTipoColor = (esDefault: boolean) => {
    return esDefault
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="text-gray-600">Cargando roles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Error al cargar roles</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={loadRoles}
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Total Roles</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Shield className="h-8 w-8 text-teal-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Activos</p>
              <p className="text-2xl font-bold">{stats.activos}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm">Inactivos</p>
              <p className="text-2xl font-bold">{stats.inactivos}</p>
            </div>
            <XCircle className="h-8 w-8 text-rose-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Por Defecto</p>
              <p className="text-2xl font-bold">{stats.porDefecto}</p>
            </div>
            <Database className="h-8 w-8 text-cyan-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Personalizados</p>
              <p className="text-2xl font-bold">{stats.personalizados}</p>
            </div>
            <Settings className="h-8 w-8 text-teal-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Con Usuarios</p>
              <p className="text-2xl font-bold">{stats.conUsuarios}</p>
            </div>
            <Users className="h-8 w-8 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Controles y filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Filtro por estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div className="flex space-x-2">
            {/* Botón gestionar permisos */}
            {onNavigateToPermissions && (
              <button
                onClick={onNavigateToPermissions}
                className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Key className="h-4 w-4 mr-2" />
                Gestionar Permisos
              </button>
            )}

            {/* Botón nuevo rol */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Rol
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de roles */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permisos
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
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Shield className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">No se encontraron roles</p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm || filterEstado !== 'todos'
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'Comienza creando tu primer rol personalizado'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {role.nombre}
                          </div>
                          {role.descripcion && (
                            <div className="text-sm text-gray-500">
                              {role.descripcion}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {role.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(role.esDefault)}`}>
                        {role.esDefault ? 'Sistema' : 'Personalizado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(role.estado)}`}>
                        {role.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        {role._count?.usuarios || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 text-gray-400 mr-1" />
                        {role._count?.rolePermissions || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {role.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Botón gestionar permisos */}
                        <button
                          onClick={() => handleManagePermissions(role)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Gestionar permisos"
                        >
                          <Key className="h-4 w-4" />
                        </button>

                        {/* Botón editar */}
                        <button
                          onClick={() => handleEdit(role)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Editar rol"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* Botón cambiar estado */}
                        <button
                          onClick={() => handleToggleEstado(role)}
                          className={`p-1 rounded ${
                            role.estado === 'activo'
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={role.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          disabled={role.esDefault && role.estado === 'activo'}
                        >
                          {role.estado === 'activo' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>

                        {/* Botón eliminar */}
                        {!role.esDefault && (
                          <button
                            onClick={() => handleDelete(role)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Eliminar rol"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear/editar rol */}
      <RoleModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRole(null);
        }}
        onSubmit={handleSubmit}
        editingRole={editingRole}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal para gestionar permisos */}
      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedRole(null);
          setSelectedPermissions([]);
        }}
        onSave={handleSavePermissions}
        role={selectedRole}
        permissions={permissions}
        selectedPermissions={selectedPermissions}
        onPermissionToggle={(permissionId) => {
          setSelectedPermissions(prev =>
            prev.includes(permissionId)
              ? prev.filter(id => id !== permissionId)
              : [...prev, permissionId]
          );
        }}
        isLoading={loadingPermissions}
      />
    </div>
  );
};

export default RolesManagement;
