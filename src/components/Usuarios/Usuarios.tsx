import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto, Role } from '../../types';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useCentrosAcopio } from '../../hooks/useCentrosAcopio';
import { useToastContext } from '../../contexts/ToastContext';
import { RoleService } from '../../services/roleService';
import {
  UsuariosFiltros,
  UsuariosTabla,
  UsuarioModal,
  CambiarPasswordModal,
  BulkActionsBar,
  DeleteConfirmModal,
} from './components';

interface DeleteConfirmationState {
  isOpen: boolean;
  ids: string[];
  names: string[];
}

const createInitialDeleteConfirmation = (): DeleteConfirmationState => ({
  isOpen: false,
  ids: [],
  names: [],
});

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
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>(createInitialDeleteConfirmation);

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
    isDeleting,
    isChangingPassword,
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

  const closeDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation(createInitialDeleteConfirmation());
  }, []);

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

  const handleDelete = useCallback((id: string) => {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) {
      return;
    }

    setDeleteConfirmation({
      isOpen: true,
      ids: [id],
      names: [`${usuario.nombres} ${usuario.apellidos}`.trim()],
    });
  }, [usuarios]);

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
    if (action === 'eliminar') {
      const selectedUserNames = selectedUsers
        .map((userId) => usuarios.find((usuario) => usuario.id === userId))
        .filter((usuario): usuario is Usuario => Boolean(usuario))
        .map((usuario) => `${usuario.nombres} ${usuario.apellidos}`.trim());

      setDeleteConfirmation({
        isOpen: true,
        ids: selectedUsers,
        names: selectedUserNames,
      });
      return;
    }

    let exitosos = 0;

    for (const userId of selectedUsers) {
      let success = false;
      if (action === 'activar') {
        success = await changeEstado(userId, 'activo');
      } else {
        success = await changeEstado(userId, 'inactivo');
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
    };

    toast.success(`${exitosos} usuarios ${mensajes[action]} exitosamente`);
    setSelectedUsers([]);
  }, [changeEstado, selectedUsers, toast, usuarios]);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmation.ids.length === 0) {
      return;
    }

    const successfulIds: string[] = [];
    let exitosos = 0;

    for (const userId of deleteConfirmation.ids) {
      const success = await deleteUsuario(userId);
      if (success) {
        exitosos += 1;
        successfulIds.push(userId);
      }
    }

    if (exitosos === 0) {
      toast.error(
        deleteConfirmation.ids.length > 1
          ? 'No se pudieron eliminar los usuarios seleccionados'
          : 'No se pudo eliminar el usuario',
      );
      return;
    }

    setSelectedUsers((prev) => prev.filter((userId) => !successfulIds.includes(userId)));

    if (deleteConfirmation.ids.length === 1) {
      toast.success(`Usuario ${deleteConfirmation.names[0]} eliminado exitosamente`);
    } else {
      toast.success(`${exitosos} usuarios eliminados exitosamente`);
      if (exitosos < deleteConfirmation.ids.length) {
        toast.error('Algunos usuarios no pudieron eliminarse. Revise dependencias o intente nuevamente.');
      }
    }

    closeDeleteConfirmation();
  }, [closeDeleteConfirmation, deleteConfirmation.ids, deleteConfirmation.names, deleteUsuario, toast]);

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
        <div className="space-y-4 p-4 sm:p-6">
          <UsuariosFiltros
            searchTerm={searchTerm}
            filterRol={filterRol}
            filterEstado={filterEstado}
            filterCentroAcopio={filterCentroAcopio}
            roles={roles}
            centrosAcopio={centrosAcopio}
            onSearchChange={setSearchTerm}
            onRolChange={setFilterRol}
            onEstadoChange={setFilterEstado}
            onCentroAcopioChange={setFilterCentroAcopio}
            onRefresh={() => void refresh()}
            onExportar={() => void handleExportar()}
            onNuevoUsuario={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            isRefreshing={isLoading}
            isCreating={isCreating}
          />

          <BulkActionsBar
            selectedCount={selectedUsers.length}
            onActivar={() => void handleBulkAction('activar')}
            onDesactivar={() => void handleBulkAction('desactivar')}
            onEliminar={() => void handleBulkAction('eliminar')}
            onClearSelection={() => setSelectedUsers([])}
            isProcessing={isUpdating || isDeleting}
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
          isLoading={isChangingPassword}
          onClose={handleClosePasswordModal}
          onSubmit={(password) => void handlePasswordSubmit(password)}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={() => void confirmDelete()}
        title={deleteConfirmation.ids.length > 1 ? 'Eliminar usuarios' : 'Eliminar usuario'}
        description={
          deleteConfirmation.ids.length > 1
            ? `Se eliminarán permanentemente ${deleteConfirmation.ids.length} usuarios seleccionados del sistema.`
            : 'La cuenta será eliminada del sistema y dejará de estar disponible para futuras operaciones.'
        }
        itemName={
          deleteConfirmation.ids.length > 1
            ? deleteConfirmation.names.slice(0, 2).join(', ') + (deleteConfirmation.names.length > 2 ? ` y ${deleteConfirmation.names.length - 2} más` : '')
            : deleteConfirmation.names[0]
        }
        confirmLabel={deleteConfirmation.ids.length > 1 ? 'Eliminar usuarios' : 'Eliminar usuario'}
        isLoading={isDeleting}
        warningMessage={
          deleteConfirmation.ids.length > 1
            ? 'Verifica que los usuarios no tengan dependencias activas antes de confirmar la eliminación masiva.'
            : 'Verifica que el usuario no tenga procesos operativos pendientes o relaciones activas en otros módulos.'
        }
      />
    </div>
  );
};

export default Usuarios;
