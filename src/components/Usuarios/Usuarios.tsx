import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto, Role } from '../../types';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useToastContext } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { RoleService } from '../../services/roleService';
import { COMPONENT_STYLES, SectionId, USER_SECTIONS } from './constants';
import {
  UsuariosHeader,
  UsuariosFiltros,
  UsuariosTabla,
  UsuarioModal,
  CambiarPasswordModal,
  BulkActionsBar,
} from './components';
import RolesManagement from './RolesManagement';
import PermissionsManagement from './PermissionsManagement';

const Usuarios: React.FC = () => {
  // Permisos
  const { canAccessSection, hasPermission } = usePermissions();
  
  // Filtrar secciones según permisos
  const filteredSections = useMemo(() => {
    return USER_SECTIONS.filter(section => canAccessSection('usuarios', section.id));
  }, [canAccessSection]);

  // Permisos específicos
  const canCreateUser = hasPermission('usuarios:write');
  const canExportUsers = hasPermission('usuarios:read');

  // Estados de navegación
  const [activeSection, setActiveSection] = useState<SectionId>('usuarios');

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  // Estados de selección
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Estados de roles
  const [roles, setRoles] = useState<Role[]>([]);

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
  } = useUsuarios();

  const { establecimientos, loadEstablecimientos } = useEstablecimientos();
  const { toast } = useToastContext();

  // Cargar roles
  const loadRoles = useCallback(async () => {
    try {
      const result = await RoleService.getAll({ includePermissions: false, limit: 100 });
      setRoles(result.roles);
    } catch (error) {
      toast.error('Error al cargar roles');
    }
  }, [toast]);

  // Efectos iniciales
  useEffect(() => {
    loadEstablecimientos();
    loadRoles();
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        search(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Efecto de filtros
  useEffect(() => {
    applyFilters({
      rol: filterRol === 'todos' ? undefined : filterRol as any,
      estado: filterEstado === 'todos' ? undefined : filterEstado as any,
    });
  }, [filterRol, filterEstado]);

  // Estadísticas memoizadas
  const usuariosActivos = useMemo(
    () => usuarios.filter(u => u.estado === 'activo').length,
    [usuarios]
  );

  // Handlers
  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === usuarios.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usuarios.map(u => u.id));
    }
  }, [usuarios, selectedUsers.length]);

  const handleEdit = useCallback((usuario: Usuario) => {
    setEditingUser(usuario);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const usuario = usuarios.find(u => u.id === id);
    const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'este usuario';

    if (window.confirm(`¿Está seguro de eliminar a ${nombreCompleto}?`)) {
      const success = await deleteUsuario(id);
      if (success) {
        toast.success(`Usuario ${nombreCompleto} eliminado exitosamente`);
        setSelectedUsers(prev => prev.filter(userId => userId !== id));
      }
    }
  }, [usuarios, deleteUsuario, toast]);

  const handleToggleEstado = useCallback(async (id: string) => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    const success = await changeEstado(id, nuevoEstado);

    if (success) {
      toast.success(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    }
  }, [usuarios, changeEstado, toast]);

  const handleChangePassword = useCallback((usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowPasswordModal(true);
  }, []);

  const handlePasswordSubmit = useCallback(async (newPassword: string) => {
    if (!selectedUser) return;

    const passwordData: ChangePasswordDto = { newPassword };
    const success = await changePassword(selectedUser.id, passwordData);

    if (success) {
      toast.success('Contraseña actualizada exitosamente');
      setShowPasswordModal(false);
      setSelectedUser(null);
    }
  }, [selectedUser, changePassword, toast]);

  const handleSubmit = useCallback(async (formData: any) => {
    try {
      if (editingUser) {
        const updateData: UpdateUsuarioDto = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          usuario: formData.usuario,
          rol: formData.rol,
          establecimientoId: formData.establecimientoId || undefined,
          estado: formData.estado,
        };

        const success = await updateUsuario(editingUser.id, updateData);
        if (success) {
          toast.success('Usuario actualizado exitosamente');
          setShowModal(false);
          setEditingUser(null);
        }
      } else {
        const createData: CreateUsuarioDto = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          usuario: formData.usuario,
          password: formData.password,
          rol: formData.rol,
          establecimientoId: formData.establecimientoId || undefined,
        };

        const success = await createUsuario(createData);
        if (success) {
          toast.success('Usuario creado exitosamente');
          setShowModal(false);
          setEditingUser(null);
        }
      }
    } catch (error) {
      toast.error('Error al guardar usuario');
    }
  }, [editingUser, createUsuario, updateUsuario, toast]);

  const handleBulkAction = useCallback(async (action: 'activar' | 'desactivar' | 'eliminar') => {
    if (action === 'eliminar') {
      if (!window.confirm(`¿Está seguro de eliminar ${selectedUsers.length} usuarios?`)) {
        return;
      }
    }

    let exitosos = 0;
    for (const userId of selectedUsers) {
      let success = false;
      if (action === 'activar') {
        success = await changeEstado(userId, 'activo');
      } else if (action === 'desactivar') {
        success = await changeEstado(userId, 'inactivo');
      } else {
        success = await deleteUsuario(userId);
      }
      if (success) exitosos++;
    }

    const mensajes = {
      activar: 'activados',
      desactivar: 'desactivados',
      eliminar: 'eliminados',
    };

    toast.success(`${exitosos} usuarios ${mensajes[action]} exitosamente`);
    setSelectedUsers([]);
  }, [selectedUsers, changeEstado, deleteUsuario, toast]);

  const handleExportar = useCallback(() => {
    toast.info('Exportando usuarios...');
  }, [toast]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingUser(null);
  }, []);

  const handleClosePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  }, []);

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header con navegación */}
      <UsuariosHeader
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onNuevoUsuario={() => {
          setEditingUser(null);
          setShowModal(true);
        }}
        onRefresh={refresh}
        onExportar={handleExportar}
        isLoading={isLoading}
        isCreating={isCreating}
        sections={filteredSections}
        canCreateUser={canCreateUser}
        canExportUsers={canExportUsers}
      />

      {/* Contenido */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {activeSection === 'usuarios' && (
            <div className="p-6 space-y-4">
              {/* Filtros y Stats */}
              <UsuariosFiltros
                searchTerm={searchTerm}
                filterRol={filterRol}
                filterEstado={filterEstado}
                roles={roles}
                totalUsuarios={usuarios.length}
                usuariosActivos={usuariosActivos}
                onSearchChange={setSearchTerm}
                onRolChange={setFilterRol}
                onEstadoChange={setFilterEstado}
              />

              {/* Bulk Actions */}
              <BulkActionsBar
                selectedCount={selectedUsers.length}
                onActivar={() => handleBulkAction('activar')}
                onDesactivar={() => handleBulkAction('desactivar')}
                onEliminar={() => handleBulkAction('eliminar')}
                onClearSelection={() => setSelectedUsers([])}
              />

              {/* Tabla */}
              <UsuariosTabla
                usuarios={usuarios}
                selectedUsers={selectedUsers}
                roles={roles}
                establecimientos={establecimientos}
                isLoading={isLoading}
                pagination={pagination}
                onSelectUser={handleSelectUser}
                onSelectAll={handleSelectAll}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleEstado={handleToggleEstado}
                onChangePassword={handleChangePassword}
                onChangePage={changePage}
              />
            </div>
          )}

          {activeSection === 'roles' && (
            <div className="p-6">
              <RolesManagement
                onNavigateToPermissions={() => setActiveSection('permisos')}
              />
            </div>
          )}

          {activeSection === 'permisos' && (
            <div className="p-6">
              <PermissionsManagement
                onNavigateToRoles={() => setActiveSection('roles')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <UsuarioModal
        usuario={editingUser}
        establecimientos={establecimientos}
        roles={roles}
        isOpen={showModal}
        isLoading={isCreating || isUpdating}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {selectedUser && (
        <CambiarPasswordModal
          usuario={selectedUser}
          isOpen={showPasswordModal}
          isLoading={false}
          onClose={handleClosePasswordModal}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </main>
  );
};

export default Usuarios;
