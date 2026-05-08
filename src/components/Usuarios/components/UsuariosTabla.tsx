import React, { memo } from 'react';
import { User, PencilSimple, Trash, Key, CheckCircle, XCircle, CircleNotch, Users, Buildings, Clock } from '@phosphor-icons/react';
import { Usuario, Role, CentroAcopio } from '../../../types';
import { COMPONENT_STYLES, ROLE_COLORS } from '../constants';

interface UsuariosTablaProps {
  usuarios: Usuario[];
  selectedUsers: string[];
  roles: Role[];
  centrosAcopio: CentroAcopio[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  } | null;
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: string) => void;
  onToggleEstado: (id: string) => void;
  onChangePassword: (usuario: Usuario) => void;
  onChangePage: (page: number) => void;
}

const UsuariosTabla: React.FC<UsuariosTablaProps> = memo(({
  usuarios,
  selectedUsers,
  roles,
  centrosAcopio,
  isLoading,
  pagination,
  onSelectUser,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleEstado,
  onChangePassword,
  onChangePage,
}) => {
  const getRolLabel = (rol: string) => {
    const roleData = roles.find(r => r.id === rol || r.codigo === rol);
    return roleData?.nombre || rol;
  };

  const getRolColor = (rol: string) => {
    const roleData = roles.find(r => r.id === rol || r.codigo === rol);
    const roleWithColor = roleData as (Role & { color?: string }) | undefined;
    if (roleWithColor?.color) return roleWithColor.color;
    return ROLE_COLORS[rol] || ROLE_COLORS.default;
  };

  const getCentroAcopioNombre = (centroAcopioId?: string) => {
    if (!centroAcopioId) return '-';
    const centroAcopio = centrosAcopio.find(ca => ca.id === centroAcopioId);
    return centroAcopio?.nombre || '-';
  };

  const getCentrosAsignados = (usuario: Usuario) => {
    if (usuario.centrosAcopioAsignados?.length) {
      return usuario.centrosAcopioAsignados.map((item) => item.centroAcopio.nombre);
    }

    if (usuario.centroAcopioIds?.length) {
      return usuario.centroAcopioIds
        .map((id) => getCentroAcopioNombre(id))
        .filter((nombre) => nombre !== '-');
    }

    if (usuario.centroAcopioId) {
      return [getCentroAcopioNombre(usuario.centroAcopioId)];
    }

    return [];
  };

  return (
    <div className={COMPONENT_STYLES.table.container}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={COMPONENT_STYLES.table.header}>
            <tr>
              <th className="w-12 rounded-l-[14px] bg-[#fbfafd] px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === usuarios.length && usuarios.length > 0}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded-[5px] border-[#e7e7ef] text-[#7c3aed] focus:ring-[#7c3aed]/20"
                />
              </th>
              <th className={COMPONENT_STYLES.table.headerCell}>Usuario</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Rol</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Último Acceso</th>
              <th className={`${COMPONENT_STYLES.table.headerCell} text-center`}>Estado</th>
              <th className={`${COMPONENT_STYLES.table.headerCell} rounded-r-[14px] text-center`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <CircleNotch className="h-8 w-8 animate-spin text-zinc-600 mr-3" />
                    <span className="text-zinc-500">Cargando usuarios...</span>
                  </div>
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Users className={COMPONENT_STYLES.table.emptyIcon} />
                  <p className="text-lg font-medium text-zinc-900 mb-1">No se encontraron usuarios</p>
                  <p className="text-sm text-zinc-500">Intenta ajustar los filtros o crear un nuevo usuario</p>
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className={`${COMPONENT_STYLES.table.row} ${
                    selectedUsers.includes(usuario.id) ? COMPONENT_STYLES.table.rowSelected : ''
                  }`}
                >
                  <td className="border-b border-[#eeeef3] px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(usuario.id)}
                      onChange={() => onSelectUser(usuario.id)}
                      className="h-4 w-4 rounded-[5px] border-[#e7e7ef] text-[#7c3aed] focus:ring-[#7c3aed]/20"
                    />
                  </td>
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full border border-[#e7e7ef] bg-[#f8f7fb] flex items-center justify-center">
                          <User className="h-5 w-5 text-[#606571]" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-zinc-900">
                          {usuario.nombres} {usuario.apellidos}
                        </div>
                        <div className="text-sm text-zinc-500">{usuario.email}</div>
                        <div className="text-xs text-zinc-400 font-mono">@{usuario.usuario}</div>
                      </div>
                    </div>
                  </td>
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div className="space-y-1">
                      <span className={`${COMPONENT_STYLES.badge.role} ${getRolColor(usuario.rol)}`}>
                        {getRolLabel(usuario.rol)}
                      </span>
                      {getCentrosAsignados(usuario).length > 0 ? (
                        <div className="flex items-center text-xs text-zinc-500">
                          <Buildings className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[180px]">
                            {getCentrosAsignados(usuario)[0]}
                            {getCentrosAsignados(usuario).length > 1 ? ` +${getCentrosAsignados(usuario).length - 1}` : ''}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div className="space-y-1 text-sm text-zinc-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span>
                          {usuario.ultimoAcceso
                            ? new Date(usuario.ultimoAcceso).toLocaleString('es-PE', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Sin registro'}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        Creado: {new Date(usuario.createdAt).toLocaleDateString('es-PE')}
                      </div>
                    </div>
                  </td>
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <button
                      onClick={() => onToggleEstado(usuario.id)}
                      className={usuario.estado === 'activo' 
                        ? COMPONENT_STYLES.badge.active 
                        : COMPONENT_STYLES.badge.inactive
                      }
                    >
                      {usuario.estado === 'activo' ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(usuario)}
                        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconEdit}`}
                        title="Editar usuario"
                      >
                        <PencilSimple className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onChangePassword(usuario)}
                        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconKey}`}
                        title="Cambiar contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(usuario.id)}
                        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
                        title="Eliminar usuario"
                      >
                        <Trash className="h-4 w-4" />
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
        <div className={COMPONENT_STYLES.pagination.container}>
          <div className="flex items-center justify-between">
            <div className={COMPONENT_STYLES.pagination.info}>
              {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onChangePage(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
              >
                ‹
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.page - 2) + i;
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onChangePage(pageNum)}
                    className={`${COMPONENT_STYLES.pagination.button} ${
                      pageNum === pagination.page
                        ? COMPONENT_STYLES.pagination.buttonActive
                        : COMPONENT_STYLES.pagination.buttonInactive
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onChangePage(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

UsuariosTabla.displayName = 'UsuariosTabla';

export default UsuariosTabla;
   