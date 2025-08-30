import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Users as UsersIcon,
  Shield,
  Key,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Download,
  Settings,
  UserPlus,
  UserCheck,
  Building2,
  Activity,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Loader2,
  FolderOpen,
  Database,
  FileText,
  Clock,
  Calendar,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { Usuario, Establecimiento, CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto } from '../../types';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useToastContext } from '../../contexts/ToastContext';
import { logger } from '../../utils/debug';

// Configuración de secciones organizadas jerárquicamente
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'gestion' | 'permisos' | 'auditoria';
  description?: string;
}

const USER_SECTIONS: SectionConfig[] = [
  // Sección Gestión
  { 
    id: 'usuarios', 
    label: 'Gestión de Usuarios', 
    icon: UsersIcon, 
    path: '/usuarios/usuarios', 
    category: 'gestion',
    description: 'Administración de usuarios del sistema'
  },
  { 
    id: 'roles', 
    label: 'Roles y Perfiles', 
    icon: Shield, 
    path: '/usuarios/roles', 
    category: 'gestion',
    description: 'Configuración de roles de usuario'
  },
  
  // Sección Permisos
  { 
    id: 'permisos', 
    label: 'Gestión de Permisos', 
    icon: Key, 
    path: '/usuarios/permisos', 
    category: 'permisos',
    description: 'Control de acceso por módulos'
  },
  
  // Sección Auditoría
  { 
    id: 'auditoria', 
    label: 'Registro de Actividad', 
    icon: Activity, 
    path: '/usuarios/auditoria', 
    category: 'auditoria',
    description: 'Trazabilidad y logs del sistema'
  },
  { 
    id: 'reportes', 
    label: 'Reportes de Usuario', 
    icon: BarChart3, 
    path: '/usuarios/reportes', 
    category: 'auditoria',
    description: 'Análisis y estadísticas'
  }
];

const CATEGORY_CONFIG = {
  gestion: { label: 'Gestión de Usuarios', icon: FolderOpen, color: 'blue' },
  permisos: { label: 'Control de Acceso', icon: Database, color: 'emerald' },
  auditoria: { label: 'Auditoría y Reportes', icon: FileText, color: 'purple' }
};

const Usuarios: React.FC = () => {
  // Estados locales
  const [activeSection, setActiveSection] = useState<string>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Hooks personalizados
  const {
    usuarios,
    pagination,
    isLoading,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    changePassword,
    changeEstado,
    search,
    applyFilters,
    changePage,
    refresh,
    isCreating,
    isUpdating,
    createError,
    updateError,
    deleteError,
    passwordError,
    estadoError
  } = useUsuarios();

  const { establecimientos, loadEstablecimientos } = useEstablecimientos();
  const { toast } = useToastContext();

  // Agrupar secciones por categoría
  const sectionsByCategory = USER_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  // Efectos para manejar filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        search(searchTerm);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Removido 'search' de dependencias

  useEffect(() => {
    applyFilters({
      rol: filterRol === 'todos' ? undefined : filterRol as any,
      estado: filterEstado === 'todos' ? undefined : filterEstado as any
    });
  }, [filterRol, filterEstado]); // Removido 'applyFilters' de dependencias

  // Cargar establecimientos al montar el componente
  useEffect(() => {
    loadEstablecimientos();
  }, []); // Removido 'loadEstablecimientos' de dependencias

  // Manejar errores con toast
  useEffect(() => {
    if (createError) {
      toast.error(`Error al crear usuario: ${createError}`);
    }
    if (updateError) {
      toast.error(`Error al actualizar usuario: ${updateError}`);
    }
    if (deleteError) {
      toast.error(`Error al eliminar usuario: ${deleteError}`);
    }
    if (passwordError) {
      toast.error(`Error al cambiar contraseña: ${passwordError}`);
    }
    if (estadoError) {
      toast.error(`Error al cambiar estado: ${estadoError}`);
    }
  }, [createError, updateError, deleteError, passwordError, estadoError, toast]);

  const roles = [
    { id: 'administrador', nombre: 'Administrador', descripcion: 'Acceso completo al sistema', color: 'bg-red-100 text-red-800', usuarios: usuarios.filter(u => u.rol === 'administrador').length },
    { id: 'coordinador', nombre: 'Coordinador', descripcion: 'Gestión y supervisión general', color: 'bg-blue-100 text-blue-800', usuarios: usuarios.filter(u => u.rol === 'coordinador').length },
    { id: 'responsable_acopio', nombre: 'Responsable de Acopio', descripcion: 'Gestión de centros de acopio', color: 'bg-green-100 text-green-800', usuarios: usuarios.filter(u => u.rol === 'responsable_acopio').length },
    { id: 'operador', nombre: 'Operador', descripcion: 'Operaciones básicas del sistema', color: 'bg-yellow-100 text-yellow-800', usuarios: usuarios.filter(u => u.rol === 'operador').length },
  ];

  // Los usuarios ya vienen filtrados del backend
  const filteredUsers = usuarios;

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const usuario = usuarios.find(u => u.id === id);
      const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'este usuario';

      logger.debug('handleDelete llamado para usuario:', { id, nombreCompleto });

      if (window.confirm(`¿Está seguro de eliminar a ${nombreCompleto}?`)) {
        logger.debug('Confirmación aceptada, iniciando eliminación de usuario:', id);

        const success = await deleteUsuario(id);

        logger.debug('Resultado de deleteUsuario:', { success, deleteError });

        if (success) {
          logger.debug('Mostrando toast de éxito');
          toast.success(`Usuario ${nombreCompleto} eliminado exitosamente`);
          setSelectedUsers(prev => prev.filter(userId => userId !== id));
          logger.debug('Usuario eliminado exitosamente del componente:', id);
        } else {
          logger.error('Error al eliminar usuario - success false:', { id, deleteError });
          toast.error(`Error al eliminar el usuario: ${deleteError || 'Error desconocido'}`);
        }
      } else {
        logger.debug('Eliminación cancelada por el usuario');
      }
    } catch (error) {
      logger.error('Error en handleDelete:', error);
      toast.error('Error inesperado al eliminar el usuario');
    }
  };

  const handleToggleEstado = async (id: string) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    const success = await changeEstado(id, nuevoEstado);

    if (success) {
      toast.success(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    }
  };

  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'activar':
        for (const userId of selectedUsers) {
          await changeEstado(userId, 'activo');
        }
        toast.success(`${selectedUsers.length} usuarios activados exitosamente`);
        break;
      case 'desactivar':
        for (const userId of selectedUsers) {
          await changeEstado(userId, 'inactivo');
        }
        toast.success(`${selectedUsers.length} usuarios desactivados exitosamente`);
        break;
      case 'eliminar':
        if (window.confirm(`¿Está seguro de eliminar ${selectedUsers.length} usuarios?`)) {
          let eliminados = 0;
          for (const userId of selectedUsers) {
            const success = await deleteUsuario(userId);
            if (success) eliminados++;
          }
          toast.success(`${eliminados} usuarios eliminados exitosamente`);
        }
        break;
    }
    setSelectedUsers([]);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingUser) {
        // Editar usuario existente
        const updateData: UpdateUsuarioDto = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          usuario: formData.usuario,
          rol: formData.rol,
          establecimientoId: formData.establecimientoId || undefined,
          estado: formData.estado
        };

        const success = await updateUsuario(editingUser.id, updateData);
        if (success) {
          toast.success('Usuario actualizado exitosamente');
          setShowModal(false);
          setEditingUser(null);
        }
      } else {
        // Crear nuevo usuario
        const createData: CreateUsuarioDto = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          usuario: formData.usuario,
          password: formData.password,
          rol: formData.rol,
          establecimientoId: formData.establecimientoId || undefined
        };

        const success = await createUsuario(createData);
        if (success) {
          toast.success('Usuario creado exitosamente');
          setShowModal(false);
          setEditingUser(null);
        }
      }
    } catch (error) {
      logger.error('Error en handleSubmit:', error);
    }
  };

  const getRolLabel = (rol: string) => {
    const roleData = roles.find(r => r.id === rol);
    return roleData?.nombre || rol;
  };

  const getRolColor = (rol: string) => {
    const roleData = roles.find(r => r.id === rol);
    return roleData?.color || 'bg-gray-100 text-gray-800';
  };

  const getEstablecimientoNombre = (establecimientoId?: string) => {
    if (!establecimientoId) return '-';
    const establecimiento = establecimientos.find(e => e.id === establecimientoId);
    return establecimiento?.nombre || '-';
  };

  const handlePasswordChange = async (newPassword: string) => {
    if (!selectedUser) return;

    const passwordData: ChangePasswordDto = {
      newPassword
    };

    const success = await changePassword(selectedUser.id, passwordData);
    if (success) {
      toast.success('Contraseña actualizada exitosamente');
      setShowPasswordModal(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-600 mt-1">Administración integral de usuarios y permisos</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refresh}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                title="Actualizar datos"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Actualizar
              </button>
              <button
                onClick={() => alert('Exportando usuarios...')}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button 
                onClick={() => {
                  setEditingUser(null);
                  setShowModal(true);
                }}
                disabled={isCreating}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-5 w-5 mr-2" />
                )}
                Nuevo Usuario
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(sectionsByCategory).map(([categoryKey, sections]) => {
              const category = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
              const CategoryIcon = category.icon;
              
              return (
                <div key={categoryKey} className="relative group">
                  {/* Category Header */}
                  <div className={`flex items-center justify-center py-4 border-b-4 border-${category.color}-500 bg-${category.color}-50`}>
                    <CategoryIcon className={`h-5 w-5 text-${category.color}-600 mr-2`} />
                    <span className={`font-semibold text-${category.color}-800`}>{category.label}</span>
                  </div>
                  
                  {/* Section Buttons */}
                  <div className="bg-white">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            isActive ? `bg-${category.color}-50 border-l-4 border-l-${category.color}-500` : ''
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${isActive ? `text-${category.color}-600` : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${isActive ? `text-${category.color}-800` : 'text-gray-900'}`}>
                              {section.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area Premium */}
      <div className="max-w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {activeSection === 'usuarios' && (
            <GestionUsuariosTab
              usuarios={filteredUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterRol={filterRol}
              setFilterRol={setFilterRol}
              filterEstado={filterEstado}
              setFilterEstado={setFilterEstado}
              selectedUsers={selectedUsers}
              handleSelectUser={handleSelectUser}
              handleSelectAll={handleSelectAll}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleToggleEstado={handleToggleEstado}
              handleBulkAction={handleBulkAction}
              getRolLabel={getRolLabel}
              getRolColor={getRolColor}
              getEstablecimientoNombre={getEstablecimientoNombre}
              setShowPasswordModal={setShowPasswordModal}
              setSelectedUser={setSelectedUser}
              setShowPermisosModal={setShowPermisosModal}
              roles={roles}
              isLoading={isLoading}
              pagination={pagination}
              changePage={changePage}
            />
          )}
          
          {activeSection === 'roles' && (
            <RolesTab roles={roles} usuarios={usuarios} />
          )}
          
          {activeSection === 'permisos' && (
            <PermisosTab />
          )}
          
          {activeSection === 'auditoria' && (
            <AuditoriaTab usuarios={usuarios} />
          )}
          
          {activeSection === 'reportes' && (
            <ReportesUsuariosTab usuarios={usuarios} roles={roles} />
          )}
        </div>
      </div>

      {/* Modal Usuario */}
      {showModal && (
        <UsuarioModal
          usuario={editingUser}
          establecimientos={establecimientos}
          roles={roles}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      )}

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && selectedUser && (
        <CambiarPasswordModal
          usuario={selectedUser}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handlePasswordChange}
          isLoading={false}
        />
      )}

      {/* Modal Permisos */}
      {showPermisosModal && selectedUser && (
        <PermisosUsuarioModal
          usuario={selectedUser}
          onClose={() => {
            setShowPermisosModal(false);
            setSelectedUser(null);
          }}
          onSubmit={() => {
            alert(`Permisos actualizados para ${selectedUser.nombres}`);
            setShowPermisosModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

// Tab de Gestión de Usuarios
interface GestionUsuariosTabProps {
  usuarios: Usuario[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterRol: string;
  setFilterRol: (rol: string) => void;
  filterEstado: string;
  setFilterEstado: (estado: string) => void;
  selectedUsers: string[];
  handleSelectUser: (id: string) => void;
  handleSelectAll: () => void;
  handleEdit: (usuario: Usuario) => void;
  handleDelete: (id: string) => Promise<void>;
  handleToggleEstado: (id: string) => void;
  handleBulkAction: (action: string) => void;
  getRolLabel: (rol: string) => string;
  getRolColor: (rol: string) => string;
  getEstablecimientoNombre: (id?: string) => string;
  setShowPasswordModal: (show: boolean) => void;
  setSelectedUser: (user: Usuario | null) => void;
  setShowPermisosModal: (show: boolean) => void;
  roles: any[];
  isLoading: boolean;
  pagination: any;
  changePage: (page: number) => void;
}

const GestionUsuariosTab: React.FC<GestionUsuariosTabProps> = ({
  usuarios,
  searchTerm,
  setSearchTerm,
  filterRol,
  setFilterRol,
  filterEstado,
  setFilterEstado,
  selectedUsers,
  handleSelectUser,
  handleSelectAll,
  handleEdit,
  handleDelete,
  handleToggleEstado,
  handleBulkAction,
  getRolLabel,
  getRolColor,
  getEstablecimientoNombre,
  setShowPasswordModal,
  setSelectedUser,
  setShowPermisosModal,
  roles,
  isLoading,
  pagination,
  changePage,
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Usuarios</p>
              <p className="text-2xl font-bold">{usuarios.length}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Usuarios Activos</p>
              <p className="text-2xl font-bold">
                {usuarios.filter(u => u.estado === 'activo').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Roles Disponibles</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters Premium */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre, email o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm min-w-[160px]"
            >
              <option value="todos">Todos los roles</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </select>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm min-w-[160px]"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Premium */}
      {selectedUsers.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-900 font-semibold">
                {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activar')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Activar
              </button>
              <button
                onClick={() => handleBulkAction('desactivar')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors shadow-sm"
              >
                Desactivar
              </button>
              <button
                onClick={() => handleBulkAction('eliminar')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Premium */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === usuarios.length && usuarios.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Rol & Establecimiento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Estado & Acceso
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-100">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600 mr-3" />
                      <span className="text-gray-500">Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</p>
                      <p className="text-gray-500">Intenta ajustar los filtros o crear un nuevo usuario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(usuario.id)}
                        onChange={() => handleSelectUser(usuario.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {usuario.nombres} {usuario.apellidos}
                          </div>
                          <div className="text-sm text-gray-600">
                            {usuario.email}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            @{usuario.usuario}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRolColor(usuario.rol)}`}>
                          {getRolLabel(usuario.rol)}
                        </span>
                        <div className="text-xs text-gray-600">
                          <Building2 className="h-3 w-3 inline mr-1" />
                          {getEstablecimientoNombre(usuario.establecimientoId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleToggleEstado(usuario.id)}
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                            usuario.estado === 'activo' 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {usuario.estado === 'activo' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactivo
                            </>
                          )}
                        </button>
                        <div className="text-xs text-gray-500">
                          {usuario.ultimoAcceso ? (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {usuario.ultimoAcceso.toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin acceso</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(usuario);
                            setShowPasswordModal(true);
                          }}
                          className="inline-flex items-center p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Cambiar contraseña"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(usuario);
                            setShowPermisosModal(true);
                          }}
                          className="inline-flex items-center p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Gestionar permisos"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!isLoading && usuarios.length > 0 && pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} usuarios
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {/* Números de página */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.page - 2) + i;
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`px-3 py-1 border rounded text-sm ${
                      pageNum === pagination.page
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Tab de Roles
const RolesTab: React.FC<{ roles: any[], usuarios: Usuario[] }> = ({ roles }) => {
  return (
    <div className="space-y-6">
      {/* Stats de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((rol) => (
          <div key={rol.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{rol.nombre}</h3>
                <p className="text-sm text-gray-600 mt-1">{rol.descripcion}</p>
                <div className="mt-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rol.color}`}>
                    {rol.usuarios} usuario(s)
                  </span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Matriz de Permisos por Rol */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Matriz de Permisos por Rol</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Módulo/Función</th>
                {roles.map((rol) => (
                  <th key={rol.id} className="text-center py-3 px-4 font-medium text-gray-900">
                    {rol.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { modulo: 'Dashboard', permisos: ['Ver', 'Ver', 'Ver', 'Ver'] },
                { modulo: 'Establecimientos', permisos: ['Completo', 'Completo', 'Ver', 'Ver'] },
                { modulo: 'Inventario', permisos: ['Completo', 'Completo', 'Editar', 'Ver'] },
                { modulo: 'Movimientos', permisos: ['Completo', 'Completo', 'Editar', 'Ver'] },
                { modulo: 'Planificación', permisos: ['Completo', 'Completo', 'Ver', 'Ver'] },
                { modulo: 'Kardex', permisos: ['Completo', 'Ver', 'Ver', 'Ver'] },
                { modulo: 'Reportes', permisos: ['Completo', 'Completo', 'Ver', 'Ver'] },
                { modulo: 'Alertas', permisos: ['Completo', 'Ver', 'Ver', 'Ver'] },
                { modulo: 'Usuarios', permisos: ['Completo', 'Ver', 'No', 'No'] },
                { modulo: 'Configuración', permisos: ['Completo', 'Parcial', 'No', 'No'] },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.modulo}</td>
                  {item.permisos.map((permiso, pIndex) => (
                    <td key={pIndex} className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        permiso === 'Completo' ? 'bg-green-100 text-green-800' :
                        permiso === 'Editar' || permiso === 'Parcial' ? 'bg-yellow-100 text-yellow-800' :
                        permiso === 'Ver' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {permiso}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gestión de Roles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Gestión de Roles</h3>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Rol
          </button>
        </div>
        <div className="space-y-4">
          {roles.map((rol) => (
            <div key={rol.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">{rol.nombre}</h4>
                  <p className="text-sm text-gray-600">{rol.descripcion}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rol.color} mt-1`}>
                    {rol.usuarios} usuario(s) asignado(s)
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Tab de Permisos
const PermisosTab: React.FC = () => {
  const modulos = [
    { id: 'dashboard', nombre: 'Dashboard', descripcion: 'Visualización de métricas y estadísticas', icono: BarChart3 },
    { id: 'establecimientos', nombre: 'Establecimientos', descripcion: 'Gestión de centros de acopio y establecimientos', icono: Building2 },
    { id: 'inventario', nombre: 'Inventario', descripcion: 'Control de vacunas, jeringas y stock', icono: UsersIcon },
    { id: 'movimientos', nombre: 'Movimientos', descripcion: 'Registro de entregas y transferencias', icono: Activity },
    { id: 'planificacion', nombre: 'Planificación', descripcion: 'Programación anual de vacunas', icono: Calendar },
    { id: 'kardex', nombre: 'Kardex', descripcion: 'Historial detallado de movimientos', icono: FileText },
    { id: 'reportes', nombre: 'Reportes', descripcion: 'Generación de informes y análisis', icono: BarChart3 },
    { id: 'alertas', nombre: 'Alertas', descripcion: 'Sistema de notificaciones automáticas', icono: AlertTriangle },
    { id: 'usuarios', nombre: 'Usuarios', descripcion: 'Gestión de usuarios y permisos', icono: UsersIcon },
    { id: 'configuracion', nombre: 'Configuración', descripcion: 'Configuración general del sistema', icono: Settings },
  ];

  const permisos = ['Ver', 'Crear', 'Editar', 'Eliminar', 'Exportar', 'Configurar'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Detallada de Permisos</h3>
        <p className="text-gray-600 mb-6">
          Configure los permisos específicos para cada módulo del sistema. Los permisos se asignan por rol de usuario.
        </p>

        <div className="space-y-6">
          {modulos.map((modulo) => {
            const Icono = modulo.icono;
            return (
              <div key={modulo.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icono className="h-6 w-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{modulo.nombre}</h4>
                      <p className="text-sm text-gray-600">{modulo.descripcion}</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-900">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {permisos.map((permiso) => (
                    <div key={permiso} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${modulo.id}-${permiso}`}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        defaultChecked={Math.random() > 0.3}
                      />
                      <label htmlFor={`${modulo.id}-${permiso}`} className="text-sm text-gray-700">
                        {permiso}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Guardar Permisos
          </button>
        </div>
      </div>
    </div>
  );
};

// Tab de Auditoría
const AuditoriaTab: React.FC<{ usuarios: Usuario[] }> = ({ usuarios }) => {
  const actividadesRecientes = [
    { id: 1, usuario: 'María Rodríguez', accion: 'Inicio de sesión', modulo: 'Sistema', fecha: new Date(), ip: '192.168.1.100', resultado: 'Exitoso' },
    { id: 2, usuario: 'Carlos Mendoza', accion: 'Creó nuevo lote', modulo: 'Inventario', fecha: new Date(Date.now() - 3600000), ip: '192.168.1.101', resultado: 'Exitoso' },
    { id: 3, usuario: 'Ana García', accion: 'Exportó reporte', modulo: 'Reportes', fecha: new Date(Date.now() - 7200000), ip: '192.168.1.102', resultado: 'Exitoso' },
    { id: 4, usuario: 'Sistema', accion: 'Backup automático', modulo: 'Sistema', fecha: new Date(Date.now() - 10800000), ip: 'localhost', resultado: 'Exitoso' },
    { id: 5, usuario: 'José Huamán', accion: 'Intento de acceso', modulo: 'Sistema', fecha: new Date(Date.now() - 14400000), ip: '192.168.1.103', resultado: 'Fallido' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats de Auditoría */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actividades Hoy</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accesos Exitosos</p>
              <p className="text-2xl font-bold text-gray-900">234</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accesos Fallidos</p>
              <p className="text-2xl font-bold text-gray-900">13</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Eventos Críticos</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Auditoría */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Todos los usuarios</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombres} {usuario.apellidos}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Módulo</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Todos los módulos</option>
              <option value="sistema">Sistema</option>
              <option value="inventario">Inventario</option>
              <option value="movimientos">Movimientos</option>
              <option value="reportes">Reportes</option>
              <option value="usuarios">Usuarios</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Actividades */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Registro de Actividades</h3>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Módulo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resultado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actividadesRecientes.map((actividad) => (
                <tr key={actividad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{actividad.fecha.toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {actividad.fecha.toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {actividad.usuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {actividad.accion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {actividad.modulo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {actividad.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      actividad.resultado === 'Exitoso' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {actividad.resultado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Tab de Reportes de Usuarios
const ReportesUsuariosTab: React.FC<{ usuarios: Usuario[], roles: any[] }> = ({ usuarios, roles }) => {
  return (
    <div className="space-y-6">
      {/* Métricas de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios por Rol</p>
              <p className="text-3xl font-bold text-purple-600">{roles.length}</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actividad Mensual</p>
              <p className="text-3xl font-bold text-blue-600">1,247</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-3xl font-bold text-green-600">2.5h</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reportes de Usuarios Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <UsersIcon className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-900">Reporte de Usuarios Activos</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Lista detallada de todos los usuarios activos con sus roles y último acceso
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Generar Reporte
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Actividad por Usuario</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Análisis de actividad y uso del sistema por cada usuario
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Generar Reporte
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Permisos y Roles</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Matriz de permisos asignados por rol y usuario
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Generar Reporte
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <h4 className="font-medium text-gray-900">Eventos de Seguridad</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Reporte de intentos de acceso fallidos y eventos de seguridad
            </p>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Generar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Distribución por Roles */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Usuarios por Rol</h3>
        <div className="space-y-4">
          {roles.map((rol) => {
            const porcentaje = Math.round((rol.usuarios / usuarios.length) * 100);
            return (
              <div key={rol.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rol.color}`}>
                    {rol.nombre}
                  </span>
                  <span className="text-sm text-gray-600">{rol.usuarios} usuarios</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{porcentaje}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Modal de Usuario
interface UsuarioModalProps {
  usuario: Usuario | null;
  establecimientos: Establecimiento[];
  roles: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const UsuarioModal: React.FC<UsuarioModalProps> = ({
  usuario,
  establecimientos,
  roles,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nombres: usuario?.nombres || '',
    apellidos: usuario?.apellidos || '',
    email: usuario?.email || '',
    usuario: usuario?.usuario || '',
    password: '',
    rol: usuario?.rol || 'operador',
    establecimientoId: usuario?.establecimientoId || '',
    estado: usuario?.estado || 'activo',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombres}
                  onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario *
              </label>
              <input
                type="text"
                required
                value={formData.usuario}
                onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Campo de contraseña solo para nuevos usuarios */}
            {!usuario && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  required
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Establecimiento {formData.rol === 'responsable_acopio' && '*'}
                </label>
                <select
                  required={formData.rol === 'responsable_acopio'}
                  value={formData.establecimientoId}
                  onChange={(e) => setFormData({...formData, establecimientoId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Sin asignar</option>
                  {establecimientos.filter(est => est.estado === 'activo').map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo de estado solo para edición */}
            {usuario && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {usuario ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  usuario ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal Cambiar Contraseña
interface CambiarPasswordModalProps {
  usuario: Usuario;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
  isLoading?: boolean;
}

const CambiarPasswordModal: React.FC<CambiarPasswordModalProps> = ({
  usuario,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (formData.newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    onSubmit(formData.newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full m-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cambiar Contraseña
          </h2>
          <p className="text-gray-600 mb-4">
            Usuario: <strong>{usuario.nombres} {usuario.apellidos}</strong>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">Requisitos de contraseña:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Mínimo 8 caracteres</li>
                <li>• Al menos una letra mayúscula</li>
                <li>• Al menos un número</li>
                <li>• Al menos un carácter especial</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal Permisos de Usuario
interface PermisosUsuarioModalProps {
  usuario: Usuario;
  onClose: () => void;
  onSubmit: (permisos: any) => void;
}

const PermisosUsuarioModal: React.FC<PermisosUsuarioModalProps> = ({
  usuario,
  onClose,
  onSubmit,
}) => {
  const modulos = [
    { id: 'dashboard', nombre: 'Dashboard' },
    { id: 'establecimientos', nombre: 'Establecimientos' },
    { id: 'inventario', nombre: 'Inventario' },
    { id: 'movimientos', nombre: 'Movimientos' },
    { id: 'planificacion', nombre: 'Planificación' },
    { id: 'kardex', nombre: 'Kardex' },
    { id: 'reportes', nombre: 'Reportes' },
    { id: 'alertas', nombre: 'Alertas' },
    { id: 'usuarios', nombre: 'Usuarios' },
    { id: 'configuracion', nombre: 'Configuración' },
  ];

  const permisos = ['Ver', 'Crear', 'Editar', 'Eliminar'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gestionar Permisos
          </h2>
          <p className="text-gray-600 mb-6">
            Usuario: <strong>{usuario.nombres} {usuario.apellidos}</strong> - 
            Rol: <strong>{usuario.rol}</strong>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Módulo</th>
                    {permisos.map((permiso) => (
                      <th key={permiso} className="text-center py-3 px-4 font-medium text-gray-900">
                        {permiso}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {modulos.map((modulo) => (
                    <tr key={modulo.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{modulo.nombre}</td>
                      {permisos.map((permiso) => (
                        <td key={permiso} className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            defaultChecked={Math.random() > 0.3}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Guardar Permisos
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;