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

  if (isLoading) {
    return (
      <div className={`${COMPONENT_STYLES.table.container} px-6 py-12 text-center`}>
        <div className="flex items-center justify-center">
          <CircleNotch className="h-8 w-8 animate-spin text-muted mr-3" />
          <span className="text-muted-2">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className={`${COMPONENT_STYLES.table.container} px-6 py-12 text-center`}>
        <Users className={COMPONENT_STYLES.table.emptyIcon} />
        <p className="text-lg font-medium text-ink mb-1">No se encontraron usuarios</p>
        <p className="text-sm text-muted">Intenta ajustar los filtros o crear un nuevo usuario</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Vista de Tarjetas Automática para Móviles (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {usuarios.map((usuario) => {
          const isSelected = selectedUsers.includes(usuario.id);
          const centros = getCentrosAsignados(usuario);
          return (
            <article
              key={`mobile-user-${usuario.id}`}
              className={`rounded-xl border p-3.5 shadow-2xs transition-colors ${
                isSelected ? 'border-brand bg-brand/5' : 'border-line bg-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectUser(usuario.id)}
                    className="mt-1 h-4 w-4 shrink-0 rounded-[5px] border-line text-brand focus:ring-brand/20"
                    aria-label={`Seleccionar a ${usuario.nombres}`}
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-soft">
                    <User className="h-4 w-4 text-muted-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {usuario.nombres} {usuario.apellidos}
                    </p>
                    <p className="truncate text-xs text-muted-2">{usuario.email}</p>
                    <p className="font-mono text-[11px] text-muted">@{usuario.usuario}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleEstado(usuario.id)}
                  className={`shrink-0 ${
                    usuario.estado === 'activo'
                      ? COMPONENT_STYLES.badge.active
                      : COMPONENT_STYLES.badge.inactive
                  }`}
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
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-line-soft bg-surface-soft/60 p-2.5 text-xs">
                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Rol y Asignación
                  </span>
                  <div className="mt-1 flex flex-col items-start gap-1">
                    <span className={`${COMPONENT_STYLES.badge.role} ${getRolColor(usuario.rol)}`}>
                      {getRolLabel(usuario.rol)}
                    </span>
                    {centros.length > 0 && (
                      <span className="flex items-center gap-1 truncate max-w-full text-[11px] text-muted-2">
                        <Buildings className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {centros[0]}
                          {centros.length > 1 ? ` +${centros.length - 1}` : ''}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Último Acceso
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-ink">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted" />
                    <span className="truncate">
                      {usuario.ultimoAcceso
                        ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Sin registro'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted">
                    Creado: {new Date(usuario.createdAt).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-line-soft pt-2.5">
                <button
                  type="button"
                  onClick={() => onEdit(usuario)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-soft"
                >
                  <PencilSimple className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangePassword(usuario)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-soft"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Clave</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(usuario.id)}
                  className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete} h-8 w-8 shrink-0`}
                  title="Eliminar usuario"
                  aria-label="Eliminar usuario"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Vista de Tabla para Tablet y Escritorio (>= md) */}
      <div className={`hidden md:block ${COMPONENT_STYLES.table.container}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={COMPONENT_STYLES.table.header}>
              <tr>
                <th className="w-12 rounded-l-[14px] bg-surface-soft px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === usuarios.length && usuarios.length > 0}
                    onChange={onSelectAll}
                    className="h-4 w-4 rounded-[5px] border-line text-brand focus:ring-brand/20"
                  />
                </th>
                <th className={COMPONENT_STYLES.table.headerCell}>Usuario</th>
                <th className={COMPONENT_STYLES.table.headerCell}>Rol</th>
                <th className={COMPONENT_STYLES.table.headerCell}>Último Acceso</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} text-center`}>Estado</th>
                <th className={`${COMPONENT_STYLES.table.headerCell} rounded-r-[14px] text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-surface">
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className={`${COMPONENT_STYLES.table.row} ${
                    selectedUsers.includes(usuario.id) ? COMPONENT_STYLES.table.rowSelected : ''
                  }`}
                >
                  <td className="border-b border-line-soft px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(usuario.id)}
                      onChange={() => onSelectUser(usuario.id)}
                      className="h-4 w-4 rounded-[5px] border-line text-brand focus:ring-brand/20"
                    />
                  </td>
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full border border-line bg-surface-soft flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-2" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-ink">
                          {usuario.nombres} {usuario.apellidos}
                        </div>
                        <div className="text-sm text-muted-2">{usuario.email}</div>
                        <div className="text-xs text-muted font-mono">@{usuario.usuario}</div>
                      </div>
                    </div>
                  </td>
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div className="space-y-1">
                      <span className={`${COMPONENT_STYLES.badge.role} ${getRolColor(usuario.rol)}`}>
                        {getRolLabel(usuario.rol)}
                      </span>
                      {getCentrosAsignados(usuario).length > 0 ? (
                        <div className="flex items-center text-xs text-muted-2">
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
                    <div className="space-y-1 text-sm text-muted-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted" />
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
                      <div className="text-xs text-muted">
                        Creado: {new Date(usuario.createdAt).toLocaleDateString('es-PE')}
                      </div>
                    </div>
                  </td>
                  <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                    <button type="button"
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
                      <button type="button"
                        onClick={() => onEdit(usuario)}
                        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconEdit}`}
                        title="Editar usuario"
                      >
                        <PencilSimple className="h-4 w-4" />
                      </button>
                      <button type="button"
                        onClick={() => onChangePassword(usuario)}
                        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconKey}`}
                        title="Cambiar contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button type="button"
                        onClick={() => onDelete(usuario.id)}
                        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
                        title="Eliminar usuario"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación Responsiva (visible tanto en Móvil como en Escritorio) */}
      {pagination && pagination.totalPages > 1 && (
        <div className={`rounded-xl border border-line bg-surface ${COMPONENT_STYLES.pagination.container}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className={COMPONENT_STYLES.pagination.info}>
              {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button type="button"
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
                  <button type="button"
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

              <button type="button"
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