import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { EstadoGeneral } from '@prisma/client';
import { clearPermissionsCache } from '@/middleware/permissions';
import { getAssignablePermissionCodesForRole } from '@/config/defaultRolePermissions';

export interface IRole {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  estado: EstadoGeneral;
  esDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Información adicional incluida en respuestas
  _count?: {
    usuarios: number;
    rolePermissions: number;
  };
  permissions?: IPermission[];
}

export interface IPermission {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  recurso: string;
  accion: string;
  categoria: string;
  estado: EstadoGeneral;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDto {
  nombre: string;
  descripcion?: string;
  codigo: string;
  estado?: EstadoGeneral;
}

export interface UpdateRoleDto {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  estado?: EstadoGeneral;
}

/**
 * Servicio para gestión de roles
 */
export class RoleService {
  /**
   * Obtener todos los roles con filtros opcionales
   */
  static async getAll(filters?: {
    estado?: EstadoGeneral | 'todos';
    search?: string;
    includePermissions?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ roles: IRole[]; total: number }>> {
    try {
      const {
        estado,
        search,
        includePermissions = false,
        page = 1,
        limit = 50
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (estado && estado !== 'todos') {
        where.estado = estado;
      }

      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener roles con conteos
      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          where,
          include: {
            _count: {
              select: {
                usuarios: true,
                rolePermissions: true,
              },
            },
            ...(includePermissions && {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            }),
          },
          orderBy: [
            { esDefault: 'desc' }, // Roles por defecto primero
            { nombre: 'asc' },
          ],
          skip: offset,
          take: limit,
        }),
        prisma.role.count({ where }),
      ]);

      // Transformar datos si se incluyen permisos
      const transformedRoles = roles.map(role => ({
        ...role,
        ...(includePermissions && {
          permissions: role.rolePermissions?.map(rp => rp.permission) || [],
        }),
      }));

      return {
        success: true,
        data: {
          roles: transformedRoles,
          total,
        },
      };
    } catch (error) {
      console.error('Error al obtener roles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener roles',
      };
    }
  }

  /**
   * Obtener un rol por ID
   */
  static async getById(id: string, includePermissions = false): Promise<ServiceResult<IRole>> {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              usuarios: true,
              rolePermissions: true,
            },
          },
          ...(includePermissions && {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          }),
        },
      });

      if (!role) {
        return {
          success: false,
          error: 'Rol no encontrado',
        };
      }

      // Transformar datos si se incluyen permisos
      const transformedRole = {
        ...role,
        ...(includePermissions && {
          permissions: role.rolePermissions?.map(rp => rp.permission) || [],
        }),
      };

      return {
        success: true,
        data: transformedRole,
      };
    } catch (error) {
      console.error('Error al obtener rol:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener rol',
      };
    }
  }

  /**
   * Obtener un rol por código
   */
  static async getByCodigo(codigo: string): Promise<ServiceResult<IRole>> {
    try {
      const role = await prisma.role.findUnique({
        where: { codigo },
        include: {
          _count: {
            select: {
              usuarios: true,
              rolePermissions: true,
            },
          },
        },
      });

      if (!role) {
        return {
          success: false,
          error: 'Rol no encontrado',
        };
      }

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      console.error('Error al obtener rol por código:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener rol',
      };
    }
  }

  /**
   * Crear nuevo rol
   */
  static async create(data: CreateRoleDto): Promise<ServiceResult<IRole>> {
    try {
      // Verificar que el código no exista
      const existingRole = await prisma.role.findUnique({
        where: { codigo: data.codigo },
      });

      if (existingRole) {
        return {
          success: false,
          error: 'Ya existe un rol con ese código',
        };
      }

      // Verificar que el nombre no exista
      const existingName = await prisma.role.findUnique({
        where: { nombre: data.nombre },
      });

      if (existingName) {
        return {
          success: false,
          error: 'Ya existe un rol con ese nombre',
        };
      }

      const role = await prisma.role.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          codigo: data.codigo,
          estado: data.estado || 'activo',
          esDefault: false, // Los roles creados por usuarios no son por defecto
        },
        include: {
          _count: {
            select: {
              usuarios: true,
              rolePermissions: true,
            },
          },
        },
      });

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      console.error('Error al crear rol:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear rol',
      };
    }
  }

  /**
   * Actualizar rol
   */
  static async update(id: string, data: UpdateRoleDto): Promise<ServiceResult<IRole>> {
    try {
      // Verificar que el rol existe
      const existingRole = await prisma.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        return {
          success: false,
          error: 'Rol no encontrado',
        };
      }

      if (existingRole.esDefault) {
        return {
          success: false,
          error: 'Los roles por defecto del sistema son de solo lectura',
        };
      }

      // Verificar unicidad de código si se está cambiando
      if (data.codigo && data.codigo !== existingRole.codigo) {
        const codeExists = await prisma.role.findUnique({
          where: { codigo: data.codigo },
        });

        if (codeExists) {
          return {
            success: false,
            error: 'Ya existe un rol con ese código',
          };
        }
      }

      // Verificar unicidad de nombre si se está cambiando
      if (data.nombre && data.nombre !== existingRole.nombre) {
        const nameExists = await prisma.role.findUnique({
          where: { nombre: data.nombre },
        });

        if (nameExists) {
          return {
            success: false,
            error: 'Ya existe un rol con ese nombre',
          };
        }
      }

      const role = await prisma.role.update({
        where: { id },
        data,
        include: {
          _count: {
            select: {
              usuarios: true,
              rolePermissions: true,
            },
          },
        },
      });

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar rol',
      };
    }
  }

  /**
   * Eliminar rol
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Verificar que el rol existe
      const existingRole = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              usuarios: true,
            },
          },
        },
      });

      if (!existingRole) {
        return {
          success: false,
          error: 'Rol no encontrado',
        };
      }

      // No permitir eliminar roles por defecto del sistema
      if (existingRole.esDefault) {
        return {
          success: false,
          error: 'No se puede eliminar un rol por defecto del sistema',
        };
      }

      // No permitir eliminar si tiene usuarios asignados
      if (existingRole._count.usuarios > 0) {
        return {
          success: false,
          error: `No se puede eliminar el rol porque tiene ${existingRole._count.usuarios} usuario(s) asignado(s)`,
        };
      }

      // Eliminar el rol (las relaciones role_permissions se eliminan automáticamente por CASCADE)
      await prisma.role.delete({
        where: { id },
      });

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar rol',
      };
    }
  }

  /**
   * Cambiar estado del rol
   */
  static async changeEstado(id: string, estado: EstadoGeneral): Promise<ServiceResult<IRole>> {
    try {
      // Verificar que el rol existe
      const existingRole = await prisma.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        return {
          success: false,
          error: 'Rol no encontrado',
        };
      }

      // No permitir desactivar roles por defecto del sistema
      if (existingRole.esDefault && estado === 'inactivo') {
        return {
          success: false,
          error: 'No se puede desactivar un rol por defecto del sistema',
        };
      }

      const role = await prisma.role.update({
        where: { id },
        data: { estado },
        include: {
          _count: {
            select: {
              usuarios: true,
              rolePermissions: true,
            },
          },
        },
      });

      return {
        success: true,
        data: role,
      };
    } catch (error) {
      console.error('Error al cambiar estado del rol:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar estado del rol',
      };
    }
  }

  /**
   * Obtener estadísticas de roles
   */
  static async getStats(): Promise<ServiceResult<{
    total: number;
    activos: number;
    inactivos: number;
    porDefecto: number;
    personalizados: number;
    conUsuarios: number;
  }>> {
    try {
      const [total, activos, inactivos, porDefecto, conUsuarios] = await Promise.all([
        prisma.role.count(),
        prisma.role.count({ where: { estado: 'activo' } }),
        prisma.role.count({ where: { estado: 'inactivo' } }),
        prisma.role.count({ where: { esDefault: true } }),
        prisma.role.count({
          where: {
            usuarios: {
              some: {},
            },
          },
        }),
      ]);

      return {
        success: true,
        data: {
          total,
          activos,
          inactivos,
          porDefecto,
          personalizados: total - porDefecto,
          conUsuarios,
        },
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de roles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
      };
    }
  }

  /**
   * Asignar permisos a un rol
   */
  static async assignPermissions(roleId: string, permissionIds: string[]): Promise<ServiceResult<void>> {
    try {
      // Verificar que el rol existe
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return {
          success: false,
          error: 'Rol no encontrado',
        };
      }

      const permissions = await prisma.permission.findMany({
        where: {
          estado: 'activo',
          ...(role.codigo !== 'administrador' ? { id: { in: permissionIds } } : {}),
        },
      });

      if (role.codigo !== 'administrador' && permissions.length !== permissionIds.length) {
        return {
          success: false,
          error: 'Uno o más permisos no existen o están inactivos',
        };
      }

      const assignableCodes = getAssignablePermissionCodesForRole(role.codigo);
      if (assignableCodes) {
        const invalidPermissions = permissions.filter((permission) => !assignableCodes.includes(permission.codigo));
        if (invalidPermissions.length > 0) {
          return {
            success: false,
            error: `El rol ${role.nombre} solo permite permisos operativos compatibles con su alcance`,
          };
        }
      }

      // Eliminar permisos actuales y asignar los nuevos en una transacción
      await prisma.$transaction(async (tx) => {
        // Eliminar permisos actuales
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });

        // Asignar nuevos permisos
        if (permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: permissions.map(({ id: permissionId }) => ({
              roleId,
              permissionId,
            })),
          });
        }
      });

      const usuariosAfectados = await prisma.usuario.findMany({
        where: { roleId },
        select: { id: true },
      });

      usuariosAfectados.forEach((usuario) => clearPermissionsCache(usuario.id));

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error('Error al asignar permisos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al asignar permisos',
      };
    }
  }

  /**
   * Obtener permisos de un rol
   */
  static async getRolePermissions(roleId: string): Promise<ServiceResult<IPermission[]>> {
    try {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId },
        include: {
          permission: true,
        },
      });

      const permissions = rolePermissions.map(rp => rp.permission);

      return {
        success: true,
        data: permissions,
      };
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener permisos',
      };
    }
  }
}
