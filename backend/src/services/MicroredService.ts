import { prisma } from '@/config/database';
import { ServiceResult, IMicrored, CreateMicroredDto, UpdateMicroredDto, EstadoGeneral } from '@/types';
import { createError } from '@/middleware/errorHandler';

/**
 * Servicio para gestión de microredes
 */
export class MicroredService {
  /**
   * Obtener todas las microredes con filtros opcionales
   */
  static async getAll(filters?: {
    redId?: string;
    estado?: EstadoGeneral | 'todos';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ microredes: IMicrored[]; total: number }>> {
    try {
      const {
        redId,
        estado,
        search,
        page = 1,
        limit = 50
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (redId) {
        where.redId = redId;
      }

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

      // Obtener microredes con relaciones
      const [microredes, total] = await Promise.all([
        prisma.microred.findMany({
          where,
          include: {
            red: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            },
            centrosAcopio: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                estado: true
              }
            },
            _count: {
              select: {
                centrosAcopio: true
              }
            }
          },
          orderBy: [
            { red: { nombre: 'asc' } },
            { nombre: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.microred.count({ where })
      ]);

      return {
        success: true,
        data: {
          microredes,
          total
        }
      };
    } catch (error) {
      console.error('Error al obtener microredes:', error);
      return {
        success: false,
        error: 'Error al obtener microredes'
      };
    }
  }

  /**
   * Obtener microred por ID
   */
  static async getById(id: string): Promise<ServiceResult<IMicrored | null>> {
    try {
      const microred = await prisma.microred.findUnique({
        where: { id },
        include: {
          red: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          centrosAcopio: {
            include: {
              establecimientos: {
                select: {
                  id: true,
                  nombre: true,
                  tipo: true,
                  estado: true
                }
              },
              _count: {
                select: {
                  establecimientos: true
                }
              }
            }
          },
          _count: {
            select: {
              centrosAcopio: true
            }
          }
        }
      });

      return {
        success: true,
        data: microred
      };
    } catch (error) {
      console.error(`Error al obtener microred ${id}:`, error);
      return {
        success: false,
        error: 'Error al obtener microred'
      };
    }
  }

  /**
   * Obtener microredes por red
   */
  static async getByRed(redId: string): Promise<ServiceResult<IMicrored[]>> {
    try {
      const microredes = await prisma.microred.findMany({
        where: {
          redId,
          estado: 'activo'
        },
        include: {
          _count: {
            select: {
              centrosAcopio: true
            }
          }
        },
        orderBy: { nombre: 'asc' }
      });

      return {
        success: true,
        data: microredes
      };
    } catch (error) {
      console.error(`Error al obtener microredes de la red ${redId}:`, error);
      return {
        success: false,
        error: 'Error al obtener microredes de la red'
      };
    }
  }

  /**
   * Crear nueva microred
   */
  static async create(data: CreateMicroredDto): Promise<ServiceResult<IMicrored>> {
    try {
      // Validaciones de negocio
      await this.validateMicroredData(data);

      const microred = await prisma.microred.create({
        data: {
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion,
          redId: data.redId
        },
        include: {
          red: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          _count: {
            select: {
              centrosAcopio: true
            }
          }
        }
      });

      return {
        success: true,
        data: microred
      };
    } catch (error) {
      console.error('Error al crear microred:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear microred'
      };
    }
  }

  /**
   * Actualizar microred
   */
  static async update(id: string, data: UpdateMicroredDto): Promise<ServiceResult<IMicrored>> {
    try {
      // Verificar que la microred existe
      const existingMicrored = await prisma.microred.findUnique({
        where: { id }
      });

      if (!existingMicrored) {
        throw createError.notFound('Microred no encontrada');
      }

      // Validaciones de negocio para la actualización
      await this.validateMicroredData(data, id);

      const microred = await prisma.microred.update({
        where: { id },
        data: {
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion,
          redId: data.redId,
          estado: data.estado
        },
        include: {
          red: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          _count: {
            select: {
              centrosAcopio: true
            }
          }
        }
      });

      return {
        success: true,
        data: microred
      };
    } catch (error) {
      console.error('Error al actualizar microred:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar microred'
      };
    }
  }

  /**
   * Eliminar microred (soft delete)
   */
  static async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      // Verificar que la microred existe
      const microred = await prisma.microred.findUnique({
        where: { id },
        include: {
          centrosAcopio: true
        }
      });

      if (!microred) {
        throw createError.notFound('Microred no encontrada');
      }

      // Verificar dependencias
      if (microred.centrosAcopio.length > 0) {
        throw createError.conflict('No se puede eliminar la microred porque tiene centros de acopio asociados');
      }

      await prisma.microred.delete({
        where: { id }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error al eliminar microred:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar microred'
      };
    }
  }

  /**
   * Validaciones de negocio para microredes
   */
  private static async validateMicroredData(
    data: CreateMicroredDto | UpdateMicroredDto,
    excludeId?: string
  ): Promise<void> {
    // Validar que la red existe
    if (data.redId) {
      const red = await prisma.red.findUnique({
        where: { id: data.redId }
      });

      if (!red) {
        throw createError.badRequest('La red especificada no existe');
      }

      if (red.estado !== 'activo') {
        throw createError.badRequest('La red debe estar activa');
      }
    }

    // Validar nombre único dentro de la red
    if (data.nombre && data.redId) {
      const existingByNombre = await prisma.microred.findFirst({
        where: {
          nombre: data.nombre,
          redId: data.redId
        }
      });

      if (existingByNombre && existingByNombre.id !== excludeId) {
        throw createError.conflict(`Ya existe una microred con el nombre "${data.nombre}" en esta red`);
      }
    }

    // Validar código único si se proporciona
    if (data.codigo) {
      const existingByCodigo = await prisma.microred.findFirst({
        where: { codigo: data.codigo }
      });

      if (existingByCodigo && existingByCodigo.id !== excludeId) {
        throw createError.conflict(`Ya existe una microred con el código: ${data.codigo}`);
      }
    }
  }
}

export default MicroredService;
