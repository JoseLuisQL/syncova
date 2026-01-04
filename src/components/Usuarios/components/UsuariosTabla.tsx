import React, { memo } from 'react';
import {
  User,
  Edit,
  Trash2,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Building2,
} from 'lucide-react';
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
    if (roleData && (roleData as any).color) return (roleData as any).color;
    return ROLE_COLORS[rol] || ROLE_COLORS.default;
  };

  const getCentroAcopioNombre = (centroAcopioId?: string) => {
    if (!centroAcopioId) return '-';
    const centroAcopio = centrosAcopio.find(ca => ca.id === centroAcopioId);
    return centroAcopio?.nombre || '-';
  };

  return (
    <div className={COMPONENT_STYLES.table.container}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={COMPONENT_STYLES.table.header}>
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === usuarios.length && usuarios.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
              </th>
              <th className={COMPONENT_STYLES.table.headerCell}>Usuario</th>
              <th className={COMPONENT_STYLES.table.headerCell}>Rol</th>
              <th className={`${COMPONENT_STYLES.table.headerCell} text-center`}>Estado</th>
              <th className={`${COMPONENT_STYLES.table.headerCell} text-center`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-3" />
                    <span className="text-gray-500">Cargando usuarios...</span>
                  </div>
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Users className={COMPONENT_STYLES.table.emptyIcon} />
                  <p className="text-lg font-medium text-gray-900 mb-1">No se encontraron usuarios</p>
                  <p className="text-sm text-gray-500">Intenta ajustar los filtros o crear un nuevo usuario</p>
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
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(usuario.id)}
                      onChange={() => onSelectUser(usuario.id)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {usuario.nombres} {usuario.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">{usuario.email}</div>
                        <div className="text-xs text-gray-400 font-mono">@{usuario.usuario}</div>
                      </div>
                    </div>
                  </td>
                  <td className={COMPONENT_STYLES.table.cell}>
                    <div className="space-y-1">
                      <span className={`${COMPONENT_STYLES.badge.role} ${getRolColor(usuario.rol)}`}>
                        {getRolLabel(usuario.rol)}
                      </span>
                      {usuario.centroAcopioId && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Building2 className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[150px]">
                            {getCentroAcopioNombre(usuario.centroAcopioId)}
                          </span>
                        </div>
                      )}
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
                        <Edit className="h-4 w-4" />
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
        <div className={COMPONENT_STYLES.pagination.container}>
          <div className="flex items-center justify-between">
            <div className={COMPONENT_STYLES.pagination.info}>
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} usuarios
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onChangePage(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={`${COMPONENT_STYLES.pagination.button} ${COMPONENT_STYLES.pagination.buttonInactive}`}
              >
                Anterior
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
                Siguiente
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
