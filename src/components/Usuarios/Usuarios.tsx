import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, Loader2, RefreshCw, UserPlus } from 'lucide-react';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto, Role } from '../../types';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useCentrosAcopio } from '../../hooks/useCentrosAcopio';
import { useToastContext } from '../../contexts/ToastContext';
import { RoleService } from '../../services/roleService';
import { COMPONENT_STYLES } from './constants';
import {
  UsuariosFiltros,
  UsuariosTabla,
  UsuarioModal,
  CambiarPasswordModal,
  BulkActionsBar,
} from './components';

const Usuarios: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterCentroAcopio, setFilterCentroAcopio] = useState<string>('todos');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const {
    usuarios,
    pagination,
    isLoading,
    error,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    changePassword,
    changeEstado,
    search,
    applyFilters,
    changePage,
    refresh,
    exportUsuarios,
    isCreating,
    isUpdating,
  } = useUsuarios();

  const { centrosAcopio, fetchCentrosAcopio } = useCentrosAcopio({ estado: 'activo', limit: 1000 });
  const { toast } = useToastContext();

  const loadRoles = useCallback(async () => {
    try {
      const result = await RoleService.getAll({ includePermissions: false, limit: 100 });
      setRoles(result.roles);
    } catch {
      toast.error('Error al cargar roles');
    }
  }, [toast]);

  useEffect(() => {
    void fetchCentrosAcopio();
    void loadRoles();
  }, [fetchCentrosAcopio, loadRoles]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void search(searchTerm);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, search]);

  useEffect(() => {
    void applyFilters({
      rol: filterRol === 'todos' ? undefined : filterRol as UpdateUsuarioDto['rol'],
      estado: filterEstado === 'todos' ? undefined : filterEstado as UpdateUsuarioDto['estado'],
      centroAcopioId: filterCentroAcopio === 'todos' ? undefined : filterCentroAcopio,
    });
  }, [applyFilters, filterCentroAcopio, filterEstado, filterRol]);

  const usuariosActivos = useMemo(
    () => usuarios.filter((usuario) => usuario.estado === 'activo').length,
    [usuarios],
  );

  const usuariosInactivos = usuarios.length - usuariosActivos;

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === usuarios.length) {
      setSelectedUsers([]);
      return;
    }

    setSelectedUsers(usuarios.map((usuario) => usuario.id));
  }, [selectedUsers.length, usuarios]);

  const handleEdit = useCallback((usuario: Usuario) => {
    setEditingUser(usuario);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const usuario = usuarios.find((item) => item.id === id);
    const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'este usuario';

    if (!window.confirm(`¿Está seguro de eliminar a ${nombreCompleto}?`)) {
      return;
    }

    const success = await deleteUsuario(id);
    if (!success) {
      toast.error('No se pudo eliminar el usuario');
      return;
    }

    toast.success(`Usuario ${nombreCompleto} eliminado exitosamente`);
    setSelectedUsers((prev) => prev.filter((userId) => userId !== id));
  }, [deleteUsuario, toast, usuarios]);

  const handleToggleEstado = useCallback(async (id: string) => {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) return;

    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    const success = await changeEstado(id, nuevoEstado);

    if (!success) {
      toast.error('No se pudo cambiar el estado del usuario');
      return;
    }

    toast.success(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
  }, [changeEstado, toast, usuarios]);

  const handleChangePassword = useCallback((usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowPasswordModal(true);
  }, []);

  const handlePasswordSubmit = useCallback(async (newPassword: string) => {
    if (!selectedUser) return;

    const passwordData: ChangePasswordDto = { newPassword };
    const success = await changePassword(selectedUser.id, passwordData);

    if (!success) {
      toast.error('No se pudo actualizar la contraseña');
      return;
    }

    toast.success('Contraseña actualizada exitosamente');
    setShowPasswordModal(false);
    setSelectedUser(null);
  }, [changePassword, selectedUser, toast]);

  const handleSubmit = useCallback(async (formData: {
    nombres: string;
    apellidos: string;
    email: string;
    usuario: string;
    password: string;
    rol: string;
    centroAcopioIds: string[];
    estado: string;
  }) => {
    try {
      const primaryCentroAcopioId = formData.centroAcopioIds[0] || undefined;

      if (editingUser) {
        const updateData: UpdateUsuarioDto = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          usuario: formData.usuario,
          rol: formData.rol as UpdateUsuarioDto['rol'],
          centroAcopioId: primaryCentroAcopioId,
          centroAcopioIds: formData.centroAcopioIds,
          estado: formData.estado as UpdateUsuarioDto['estado'],
        };

        const success = await updateUsuario(editingUser.id, updateData);
        if (!success) {
          toast.error('No se pudo actualizar el usuario');
          return;
        }

        toast.success('Usuario actualizado exitosamente');
      } else {
        const createData: CreateUsuarioDto = {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          usuario: formData.usuario,
          password: formData.password,
          rol: formData.rol as CreateUsuarioDto['rol'],
          centroAcopioId: primaryCentroAcopioId,
          centroAcopioIds: formData.centroAcopioIds,
        };

        const success = await createUsuario(createData);
        if (!success) {
          toast.error('No se pudo crear el usuario');
          return;
        }

        toast.success('Usuario creado exitosamente');
      }

      setShowModal(false);
      setEditingUser(null);
    } catch {
      toast.error('Error al guardar usuario');
    }
  }, [createUsuario, editingUser, toast, updateUsuario]);

  const handleBulkAction = useCallback(async (action: 'activar' | 'desactivar' | 'eliminar') => {
    if (action === 'eliminar' && !window.confirm(`¿Está seguro de eliminar ${selectedUsers.length} usuarios?`)) {
      return;
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
      if (success) exitosos += 1;
    }

    if (exitosos === 0) {
      toast.error('No se pudieron completar las acciones masivas');
      return;
    }

    const mensajes = {
      activar: 'activados',
      desactivar: 'desactivados',
      eliminar: 'eliminados',
    };

    toast.success(`${exitosos} usuarios ${mensajes[action]} exitosamente`);
    setSelectedUsers([]);
  }, [changeEstado, deleteUsuario, selectedUsers, toast]);

  const handleExportar = useCallback(async () => {
    const success = await exportUsuarios();
    if (!success) {
      toast.error('No se pudo exportar el listado de usuarios');
      return;
    }

    toast.success('Listado de usuarios exportado correctamente');
  }, [exportUsuarios, toast]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingUser(null);
  }, []);

  const handleClosePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  }, []);

  return (
    <div className="space-y-4">
      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Cuentas y auditoría operativa</h3>
              <p className="mt-1 text-sm text-slate-500">
                Filtra por rol, estado y centro de acopio. La exportación respeta los filtros activos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void refresh()}
                className={COMPONENT_STYLES.button.secondary}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span>Actualizar</span>
              </button>
              <button
                type="button"
                onClick={() => void handleExportar()}
                className={COMPONENT_STYLES.button.secondary}
              >
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setShowModal(true);
                }}
                className={COMPONENT_STYLES.button.primary}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                <span>Nuevo usuario</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <UsuariosFiltros
            searchTerm={searchTerm}
            filterRol={filterRol}
            filterEstado={filterEstado}
            filterCentroAcopio={filterCentroAcopio}
            roles={roles}
            centrosAcopio={centrosAcopio}
            totalUsuarios={usuarios.length}
            usuariosActivos={usuariosActivos}
            usuariosInactivos={usuariosInactivos}
            onSearchChange={setSearchTerm}
            onRolChange={setFilterRol}
            onEstadoChange={setFilterEstado}
            onCentroAcopioChange={setFilterCentroAcopio}
          />

          <BulkActionsBar
            selectedCount={selectedUsers.length}
            onActivar={() => void handleBulkAction('activar')}
            onDesactivar={() => void handleBulkAction('desactivar')}
            onEliminar={() => void handleBulkAction('eliminar')}
            onClearSelection={() => setSelectedUsers([])}
          />

          <UsuariosTabla
            usuarios={usuarios}
            selectedUsers={selectedUsers}
            roles={roles}
            centrosAcopio={centrosAcopio}
            isLoading={isLoading}
            pagination={pagination}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={(id) => void handleDelete(id)}
            onToggleEstado={(id) => void handleToggleEstado(id)}
            onChangePassword={handleChangePassword}
            onChangePage={(page) => void changePage(page)}
          />
        </div>
      </section>

      <UsuarioModal
        usuario={editingUser}
        centrosAcopio={centrosAcopio}
        roles={roles}
        isOpen={showModal}
        isLoading={isCreating || isUpdating}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {selectedUser ? (
        <CambiarPasswordModal
          usuario={selectedUser}
          isOpen={showPasswordModal}
          isLoading={false}
          onClose={handleClosePasswordModal}
          onSubmit={(password) => void handlePasswordSubmit(password)}
        />
      ) : null}
    </div>
  );
};

export default Usuarios;
