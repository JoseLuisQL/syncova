import { prisma } from '@/config/database';
import { ServiceResult, IRed, CreateRedDto, UpdateRedDto, EstadoGeneral } from '@/types';
import { createError } from '@/middleware/errorHandler';

/**
 * Servicio para gestión de redes
 */
export class RedService {
  /**
   * Obtener todas las redes con filtros opcionales
   */
  static async getAll(filters?: {
    estado?: EstadoGeneral | 'todos';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ redes: IRed[]; total: number }>> {
    try {
      const {
        estado,
        search,
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
          { codigo: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener redes con relaciones
      const [redes, total] = await Promise.all([
        prisma.red.findMany({
          where,
          include: {
            microredes: {
              select: {
                id: true,
                nombre: true,
                estado: true
              }
            },
            _count: {
              select: {
                microredes: true
              }
            }
          },
          orderBy: [
            { nombre: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.red.count({ where })
      ]);

      return {
        success: true,
        data: {
          redes,
          total
        }
      };
    } catch (error) {
      console.error('Error al obtener redes:', error);
      return {
        success: false,
        error: 'Error al obtener redes'
      };
    }
  }

  /**
   * Obtener red por ID
   */
  static async getById(id: string): Promise<ServiceResult<IRed | null>> {
    try {
      const red = await prisma.red.findUnique({
        where: { id },
        include: {
          microredes: {
            include: {
              centrosAcopio: {
                select: {
                  id: true,
                  nombre: true,
                  estado: true
                }
              },
              _count: {
                select: {
                  centrosAcopio: true
                }
              }
            }
          },
          _count: {
            select: {
              microredes: true
            }
          }
        }
      });

      return {
        success: true,
        data: red
      };
    } catch (error) {
      console.error(`Error al obtener red ${id}:`, error);
      return {
        success: false,
        error: 'Error al obtener red'
      };
    }
  }

  /**
   * Crear nueva red
   */
  static async create(data: CreateRedDto): Promise<ServiceResult<IRed>> {
    try {
      // Validaciones de negocio
      await this.validateRedData(data);

      const red = await prisma.red.create({
        data: {
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion
        },
        include: {
          _count: {
            select: {
              microredes: true
            }
          }
        }
      });

      return {
        success: true,
        data: red
      };
    } catch (error) {
      console.error('Error al crear red:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear red'
      };
    }
  }

  /**
   * Actualizar red
   */
  static async update(id: string, data: UpdateRedDto): Promise<ServiceResult<IRed>> {
    try {
      // Verificar que la red existe
      const existingRed = await prisma.red.findUnique({
        where: { id }
      });

      if (!existingRed) {
        throw createError.notFound('Red no encontrada');
      }

      // Validaciones de negocio para la actualización
      await this.validateRedData(data, id);

      const red = await prisma.red.update({
        where: { id },
        data: {
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion,
          estado: data.estado
        },
        include: {
          _count: {
            select: {
              microredes: true
            }
          }
        }
      });

      return {
        success: true,
        data: red
      };
    } catch (error) {
      console.error('Error al actualizar red:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar red'
      };
    }
  }

  /**
   * Eliminar red (soft delete)
   */
  static async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      // Verificar que la red existe
      const red = await prisma.red.findUnique({
        where: { id },
        include: {
          microredes: true
        }
      });

      if (!red) {
        throw createError.notFound('Red no encontrada');
      }

      // Verificar dependencias
      if (red.microredes.length > 0) {
        throw createError.conflict('No se puede eliminar la red porque tiene microredes asociadas');
      }

      await prisma.red.delete({
        where: { id }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error al eliminar red:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar red'
      };
    }
  }

  /**
   * Validaciones de negocio para redes
   */
  private static async validateRedData(
    data: CreateRedDto | UpdateRedDto,
    excludeId?: string
  ): Promise<void> {
    // Validar nombre único
    if (data.nombre) {
      const existingByNombre = await prisma.red.findUnique({
        where: { nombre: data.nombre }
      });

      if (existingByNombre && existingByNombre.id !== excludeId) {
        throw createError.conflict(`Ya existe una red con el nombre: ${data.nombre}`);
      }
    }

    // Validar código único si se proporciona
    if (data.codigo) {
      const existingByCodigo = await prisma.red.findUnique({
        where: { codigo: data.codigo }
      });

      if (existingByCodigo && existingByCodigo.id !== excludeId) {
        throw createError.conflict(`Ya existe una red con el código: ${data.codigo}`);
      }
    }
  }
}

export default RedService;
