import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { EstadoGeneral } from '@prisma/client';

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
  // Información adicional incluida en respuestas
  _count?: {
    rolePermissions: number;
  };
}

export interface CreatePermissionDto {
  nombre: string;
  descripcion?: string;
  codigo: string;
  recurso: string;
  accion: string;
  categoria: string;
  estado?: EstadoGeneral;
}

export interface UpdatePermissionDto {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  recurso?: string;
  accion?: string;
  categoria?: string;
  estado?: EstadoGeneral;
}

/**
 * Servicio para gestión de permisos
 */
export class PermissionService {
  /**
   * Obtener todos los permisos con filtros opcionales
   */
  static async getAll(filters?: {
    estado?: EstadoGeneral | 'todos';
    search?: string;
    categoria?: string;
    recurso?: string;
    accion?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ permissions: IPermission[]; total: number }>> {
    try {
      const {
        estado,
        search,
        categoria,
        recurso,
        accion,
        page = 1,
        limit = 100
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (estado && estado !== 'todos') {
        where.estado = estado;
      }

      if (categoria) {
        where.categoria = categoria;
      }

      if (recurso) {
        where.recurso = recurso;
      }

      if (accion) {
        where.accion = accion;
      }

      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
          { recurso: { contains: search, mode: 'insensitive' } },
          { categoria: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener permisos con conteos
      const [permissions, total] = await Promise.all([
        prisma.permission.findMany({
          where,
          include: {
            _count: {
              select: {
                rolePermissions: true,
              },
            },
          },
          orderBy: [
            { categoria: 'asc' },
            { recurso: 'asc' },
            { accion: 'asc' },
            { nombre: 'asc' },
          ],
          skip: offset,
          take: limit,
        }),
        prisma.permission.count({ where }),
      ]);

      return {
        success: true,
        data: {
          permissions,
          total,
        },
      };
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener permisos',
      };
    }
  }

  /**
   * Obtener un permiso por ID
   */
  static async getById(id: string): Promise<ServiceResult<IPermission>> {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
      });

      if (!permission) {
        return {
          success: false,
          error: 'Permiso no encontrado',
        };
      }

      return {
        success: true,
        data: permission,
      };
    } catch (error) {
      console.error('Error al obtener permiso:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener permiso',
      };
    }
  }

  /**
   * Obtener un permiso por código
   */
  static async getByCodigo(codigo: string): Promise<ServiceResult<IPermission>> {
    try {
      const permission = await prisma.permission.findUnique({
        where: { codigo },
        include: {
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
      });

      if (!permission) {
        return {
          success: false,
          error: 'Permiso no encontrado',
        };
      }

      return {
        success: true,
        data: permission,
      };
    } catch (error) {
      console.error('Error al obtener permiso por código:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener permiso',
      };
    }
  }

  /**
   * Crear nuevo permiso
   */
  static async create(data: CreatePermissionDto): Promise<ServiceResult<IPermission>> {
    void data;
    return {
      success: false,
      error: 'El catálogo de permisos del sistema es de solo lectura',
    };
  }

  /**
   * Actualizar permiso
   */
  static async update(id: string, data: UpdatePermissionDto): Promise<ServiceResult<IPermission>> {
    void id;
    void data;
    return {
      success: false,
      error: 'El catálogo de permisos del sistema es de solo lectura',
    };
  }

  /**
   * Eliminar permiso
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    void id;
    return {
      success: false,
      error: 'El catálogo de permisos del sistema es de solo lectura',
    };
  }

  /**
   * Cambiar estado del permiso
   */
  static async changeEstado(id: string, estado: EstadoGeneral): Promise<ServiceResult<IPermission>> {
    void id;
    void estado;
    return {
      success: false,
      error: 'El catálogo de permisos del sistema es de solo lectura',
    };
  }

  /**
   * Obtener categorías de permisos
   */
  static async getCategorias(): Promise<ServiceResult<string[]>> {
    try {
      const categorias = await prisma.permission.findMany({
        select: {
          categoria: true,
        },
        distinct: ['categoria'],
        where: {
          estado: 'activo',
        },
        orderBy: {
          categoria: 'asc',
        },
      });

      return {
        success: true,
        data: categorias.map(c => c.categoria),
      };
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener categorías',
      };
    }
  }

  /**
   * Obtener recursos de permisos
   */
  static async getRecursos(): Promise<ServiceResult<string[]>> {
    try {
      const recursos = await prisma.permission.findMany({
        select: {
          recurso: true,
        },
        distinct: ['recurso'],
        where: {
          estado: 'activo',
        },
        orderBy: {
          recurso: 'asc',
        },
      });

      return {
        success: true,
        data: recursos.map(r => r.recurso),
      };
    } catch (error) {
      console.error('Error al obtener recursos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener recursos',
      };
    }
  }

  /**
   * Obtener acciones de permisos
   */
  static async getAcciones(): Promise<ServiceResult<string[]>> {
    try {
      const acciones = await prisma.permission.findMany({
        select: {
          accion: true,
        },
        distinct: ['accion'],
        where: {
          estado: 'activo',
        },
        orderBy: {
          accion: 'asc',
        },
      });

      return {
        success: true,
        data: acciones.map(a => a.accion),
      };
    } catch (error) {
      console.error('Error al obtener acciones:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener acciones',
      };
    }
  }

  /**
   * Obtener estadísticas de permisos
   */
  static async getStats(): Promise<ServiceResult<{
    total: number;
    activos: number;
    inactivos: number;
    porCategoria: Record<string, number>;
    porRecurso: Record<string, number>;
    asignados: number;
  }>> {
    try {
      const [total, activos, inactivos, categorias, recursos, asignados] = await Promise.all([
        prisma.permission.count(),
        prisma.permission.count({ where: { estado: 'activo' } }),
        prisma.permission.count({ where: { estado: 'inactivo' } }),
        prisma.permission.groupBy({
          by: ['categoria'],
          _count: true,
        }),
        prisma.permission.groupBy({
          by: ['recurso'],
          _count: true,
        }),
        prisma.permission.count({
          where: {
            rolePermissions: {
              some: {},
            },
          },
        }),
      ]);

      const porCategoria = categorias.reduce((acc, cat) => {
        acc[cat.categoria] = cat._count;
        return acc;
      }, {} as Record<string, number>);

      const porRecurso = recursos.reduce((acc, rec) => {
        acc[rec.recurso] = rec._count;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        data: {
          total,
          activos,
          inactivos,
          porCategoria,
          porRecurso,
          asignados,
        },
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de permisos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
      };
    }
  }

  /**
   * Obtener permisos agrupados por categoría
   */
  static async getGroupedByCategory(): Promise<ServiceResult<Record<string, IPermission[]>>> {
    try {
      const permissions = await prisma.permission.findMany({
        where: {
          estado: 'activo',
        },
        include: {
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
        orderBy: [
          { categoria: 'asc' },
          { recurso: 'asc' },
          { accion: 'asc' },
          { nombre: 'asc' },
        ],
      });

      const grouped = permissions.reduce((acc, permission) => {
        if (!acc[permission.categoria]) {
          acc[permission.categoria] = [];
        }
        acc[permission.categoria].push(permission);
        return acc;
      }, {} as Record<string, IPermission[]>);

      return {
        success: true,
        data: grouped,
      };
    } catch (error) {
      console.error('Error al obtener permisos agrupados:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener permisos agrupados',
      };
    }
  }
}
