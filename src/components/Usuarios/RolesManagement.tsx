import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Warning, CheckCircle, Clock, PencilSimple, Key, CircleNotch, Plus, ArrowsClockwise, MagnifyingGlass, Faders, Shield, Trash, Users, XCircle } from '@phosphor-icons/react';
import { CreateRoleDto, Permission, Role, UpdateRoleDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { PermissionService } from '../../services/permissionService';
import { RoleService } from '../../services/roleService';
import { logger } from '../../utils/debug';
import { DeleteConfirmModal } from './components';
import { COMPONENT_STYLES, DEFAULT_ROLE_ASSIGNABLE_PERMISSION_CODES } from './constants';
import PermissionsModal from './PermissionsModal';
import RoleModal from './RoleModal';

interface RolesManagementProps {
  onNavigateToPermissions?: () => void;
}

interface DeleteRoleState {
  isOpen: boolean;
  role: Role | null;
}

const RolesManagement: React.FC<RolesManagementProps> = ({ onNavigateToPermissions }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');

  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionsReadOnly, setPermissionsReadOnly] = useState(false);
  const [deleteRoleState, setDeleteRoleState] = useState<DeleteRoleState>({ isOpen: false, role: null });

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const { toast } = useToastContext();

  const modalPermissions = useMemo(() => {
    if (!selectedRole?.esDefault) {
      return permissions;
    }

    const allowedCodes = DEFAULT_ROLE_ASSIGNABLE_PERMISSION_CODES[selectedRole.codigo];
    if (!allowedCodes) {
      return permissions;
    }

    return permissions.filter((permission) => allowedCodes.includes(permission.codigo));
  }, [permissions, selectedRole]);

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) => {
        const matchesSearch = searchTerm === ''
          || role.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          || role.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
          || role.codigo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstado = filterEstado === 'todos' || role.estado === filterEstado;
        return matchesSearch && matchesEstado;
      }),
    [filterEstado, roles, searchTerm],
  );

  const hasActiveFilters = searchTerm.trim() !== '' || filterEstado !== 'todos';

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await RoleService.getAll({
        includePermissions: false,
        limit: 100,
      });

      setRoles(result.roles);
      logger.debug('Roles cargados:', result.roles);
    } catch (loadError) {
      const errorMessage = loadError instanceof Error ? loadError.message : 'Error al cargar roles';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Error al cargar roles:', loadError);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadPermissions = useCallback(async () => {
    try {
      setLoadingPermissions(true);
      const result = await PermissionService.getAll({ limit: 200 });
      setPermissions(result.permissions);
    } catch (loadError) {
      logger.error('Error al cargar permisos:', loadError);
      toast.error('Error al cargar permisos disponibles');
    } finally {
      setLoadingPermissions(false);
    }
  }, [toast]);

  const loadRolePermissions = useCallback(async (roleId: string) => {
    try {
      setLoadingPermissions(true);
      const result = await RoleService.getRolePermissions(roleId);
      setSelectedPermissions(result.map((permission) => permission.id));
    } catch (loadError) {
      logger.error('Error al cargar permisos del rol:', loadError);
      toast.error('Error al cargar permisos del rol');
    } finally {
      setLoadingPermissions(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const handleSubmit = async (formData: CreateRoleDto | UpdateRoleDto) => {
    try {
      if (editingRole) {
        setIsUpdating(true);
        await RoleService.update(editingRole.id, formData as UpdateRoleDto);
        toast.success('Rol actualizado correctamente');
      } else {
        setIsCreating(true);
        await RoleService.create(formData as CreateRoleDto);
        toast.success('Rol creado correctamente');
      }

      setShowModal(false);
      setEditingRole(null);
      await loadRoles();
    } catch (submitError) {
      const errorMessage = submitError instanceof Error ? submitError.message : 'Error al guardar rol';
      toast.error(errorMessage);
      logger.error('Error al guardar rol:', submitError);
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  const handleDelete = (role: Role) => {
    setDeleteRoleState({ isOpen: true, role });
  };

  const confirmDelete = async () => {
    if (!deleteRoleState.role) return;

    try {
      setIsDeleting(true);
      await RoleService.delete(deleteRoleState.role.id);
      toast.success('Rol eliminado correctamente');
      setDeleteRoleState({ isOpen: false, role: null });
      await loadRoles();
    } catch (deleteError) {
      const errorMessage = deleteError instanceof Error ? deleteError.message : 'Error al eliminar rol';
      toast.error(errorMessage);
      logger.error('Error al eliminar rol:', deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleEstado = async (role: Role) => {
    try {
      const nuevoEstado = role.estado === 'activo' ? 'inactivo' : 'activo';
      await RoleService.changeEstado(role.id, nuevoEstado);
      toast.success(`Rol ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
      await loadRoles();
    } catch (toggleError) {
      const errorMessage = toggleError instanceof Error ? toggleError.message : 'Error al cambiar estado';
      toast.error(errorMessage);
      logger.error('Error al cambiar estado:', toggleError);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role);
    setPermissionsReadOnly(role.codigo === 'administrador');
    await loadPermissions();
    await loadRolePermissions(role.id);
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setLoadingPermissions(true);
      await RoleService.assignPermissions(selectedRole.id, selectedPermissions);
      toast.success('Permisos asignados correctamente');
      setShowPermissionsModal(false);
      setSelectedRole(null);
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : 'Error al asignar permisos';
      toast.error(errorMessage);
      logger.error('Error al asignar permisos:', saveError);
    } finally {
      setLoadingPermissions(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-zinc-700">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-700">
            <CircleNotch className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Cargando roles</p>
            <p className="text-xs text-zinc-500">Preparando métricas, filtros y listado de roles.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 p-6">
        <div className="flex items-center gap-2 text-rose-800">
          <Warning className="h-5 w-5" />
          <span className="font-medium">Error al cargar roles</span>
        </div>
        <p className="mt-2 text-rose-700">{error}</p>
        <button
          onClick={() => void loadRoles()}
          className={`${COMPONENT_STYLES.button.secondary} mt-4`}
        >
          <ArrowsClockwise className="h-4 w-4" />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <Faders className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <span>Filtros y acciones</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                void loadRoles();
              }}
              className={COMPONENT_STYLES.button.secondary}
            >
              <ArrowsClockwise className="h-4 w-4" />
              <span>Actualizar</span>
            </button>
            {onNavigateToPermissions ? (
              <button
                onClick={onNavigateToPermissions}
                className={COMPONENT_STYLES.button.secondary}
              >
                <Key className="h-4 w-4" />
                <span>Ver permisos</span>
              </button>
            ) : null}
            <button
              onClick={() => setShowModal(true)}
              className={COMPONENT_STYLES.button.primary}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo rol</span>
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_240px_auto]">
          <div className="relative">
            <label htmlFor="roles-search" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Buscar rol
            </label>
            <MagnifyingGlass className="pointer-events-none absolute left-3.5 top-[calc(50%+0.875rem)] h-4 w-4 -tranzinc-y-1/2 text-zinc-400" />
            <input
              id="roles-search"
              type="text"
              placeholder="Buscar por nombre, descripción o código"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={`${COMPONENT_STYLES.filter.searchInput} pl-10`}
            />
          </div>

          <div>
            <label htmlFor="roles-estado" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Estado
            </label>
            <select
              id="roles-estado"
              value={filterEstado}
              onChange={(event) => setFilterEstado(event.target.value as 'todos' | 'activo' | 'inactivo')}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterEstado('todos');
                }}
                className={COMPONENT_STYLES.button.secondary}
              >
                <ArrowsClockwise className="h-4 w-4" />
                <span>Limpiar filtros</span>
              </button>
            ) : (
              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
                {filteredRoles.length} roles visibles
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={COMPONENT_STYLES.table.container}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={COMPONENT_STYLES.table.header}>
              <tr>
                <th className={COMPONENT_STYLES.table.headerCell}>Rol</th>
                <th className={COMPONENT_STYLES.table.headerCell}>Código</th>
                <th className={COMPONENT_STYLES.table.headerCell}>Tipo</th>
                <th className={COMPONENT_STYLES.table.headerCell}>Estado</th>
                <th className={COMPONENT_STYLES.table.headerCell}>Usuarios</th>
                <th className={COMPONENT_STYLES.table.headerCell}>Permisos</th>
                <th className={COMPONENT_STYLES.table.headerCell}>Creado</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-right`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
                        <Shield className="h-8 w-8 text-zinc-400" />
                      </div>
                      <p className="text-base font-medium text-zinc-900">No se encontraron roles</p>
                      <p className="max-w-md text-sm text-zinc-500">
                        {hasActiveFilters
                          ? 'Intenta ajustar los filtros para encontrar el rol que buscas.'
                          : 'Todavía no hay roles personalizados registrados en el sistema.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className={COMPONENT_STYLES.table.row}>
                    <td className={COMPONENT_STYLES.table.cell}>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                          role.esDefault
                            ? 'border-zinc-200 bg-zinc-50 text-zinc-700'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                        }`}>
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-zinc-900">{role.nombre}</div>
                          <div className="text-sm text-zinc-500">{role.descripcion || 'Sin descripción registrada.'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 font-mono text-sm text-[#15171d]">
                        {role.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]">
                        {role.esDefault ? 'Sistema' : 'Personalizado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:mt-[5px] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full ${role.estado === 'activo' ? 'before:bg-emerald-500' : 'before:bg-rose-500'}`}>
                        {role.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-700">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-zinc-400" />
                        <span>{role._count?.usuarios || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-700">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-zinc-400" />
                        <span>{role._count?.rolePermissions || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span>{new Date(role.createdAt).toLocaleDateString('es-PE')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => void handleManagePermissions(role)}
                          className={`${COMPONENT_STYLES.button.icon} text-zinc-600 bg-zinc-50 hover:bg-zinc-100 focus:ring-zinc-500`}
                          title="Gestionar permisos"
                        >
                          <Key className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleEdit(role)}
                          className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconEdit}`}
                          title={role.esDefault ? 'Rol protegido del sistema' : 'Editar rol'}
                          disabled={role.esDefault}
                        >
                          <PencilSimple className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => void handleToggleEstado(role)}
                          className={`${COMPONENT_STYLES.button.icon} ${
                            role.estado === 'activo'
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 focus:ring-amber-500'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 focus:ring-emerald-500'
                          }`}
                          title={role.estado === 'activo' ? 'Desactivar rol' : 'Activar rol'}
                          disabled={role.esDefault}
                        >
                          {role.estado === 'activo' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>

                        {!role.esDefault ? (
                          <button
                            onClick={() => handleDelete(role)}
                            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
                            title="Eliminar rol"
                            disabled={isDeleting}
                          >
                            {isDeleting && deleteRoleState.role?.id === role.id ? (
                              <CircleNotch className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

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

      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedRole(null);
          setSelectedPermissions([]);
          setPermissionsReadOnly(false);
        }}
        onSave={handleSavePermissions}
        role={selectedRole}
        permissions={modalPermissions}
        selectedPermissions={selectedPermissions}
        onPermissionToggle={(permissionId) => {
          setSelectedPermissions((prev) =>
            prev.includes(permissionId)
              ? prev.filter((id) => id !== permissionId)
              : [...prev, permissionId],
          );
        }}
        isLoading={loadingPermissions}
        isReadOnly={permissionsReadOnly}
      />

      <DeleteConfirmModal
        isOpen={deleteRoleState.isOpen}
        onClose={() => setDeleteRoleState({ isOpen: false, role: null })}
        onConfirm={() => void confirmDelete()}
        title="Eliminar rol"
        description="El rol será retirado del sistema y dejará de estar disponible para nuevas asignaciones."
        itemName={deleteRoleState.role?.nombre}
        confirmLabel="Eliminar rol"
        isLoading={isDeleting}
        warningMessage={
          deleteRoleState.role && (deleteRoleState.role._count?.usuarios || 0) > 0
            ? 'Este rol tiene usuarios asociados. Verifica primero la reasignación o el impacto operativo antes de eliminarlo.'
            : 'Verifica que el rol no forme parte de un flujo operativo pendiente antes de confirmar la eliminación.'
        }
      />
    </div>
  );
};

export default RolesManagement;
   