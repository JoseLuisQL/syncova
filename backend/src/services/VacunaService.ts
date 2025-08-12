import { prisma } from '@/config/database';
import { ServiceResult, IVacuna, CreateVacunaDto, UpdateVacunaDto, EstadoGeneral } from '@/types';
import { createError } from '@/middleware/errorHandler';

/**
 * Servicio para gestión de vacunas
 */
export class VacunaService {
  /**
   * Obtener todas las vacunas con filtros opcionales
   */
  static async getAll(filters?: {
    estado?: EstadoGeneral | 'todos';
    search?: string;
    tipo?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ vacunas: IVacuna[]; total: number }>> {
    try {
      const {
        estado,
        search,
        tipo,
        page = 1,
        limit = 1000 // Increased from 50 to handle larger datasets
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (estado && estado !== 'todos') {
        where.estado = estado;
      }

      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { tipo: { contains: search, mode: 'insensitive' } },
          { presentacion: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (tipo) {
        where.tipo = { contains: tipo, mode: 'insensitive' };
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener vacunas con información de lotes
      const [vacunas, total] = await Promise.all([
        prisma.vacuna.findMany({
          where,
          include: {
            lotes: {
              select: {
                id: true,
                numero: true,
                cantidadActual: true,
                estado: true,
                fechaVencimiento: true
              }
            },
            _count: {
              select: {
                lotes: true,
                planificaciones: true,
                movimientos: true
              }
            }
          },
          orderBy: [
            { nombre: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.vacuna.count({ where })
      ]);

      return {
        success: true,
        data: {
          vacunas,
          total
        }
      };
    } catch (error) {
      console.error('Error al obtener vacunas:', error);
      return {
        success: false,
        error: 'Error al obtener vacunas'
      };
    }
  }

  /**
   * Obtener vacuna por ID
   */
  static async getById(id: string): Promise<ServiceResult<IVacuna | null>> {
    try {
      const vacuna = await prisma.vacuna.findUnique({
        where: { id },
        include: {
          lotes: {
            select: {
              id: true,
              numero: true,
              cantidadInicial: true,
              cantidadActual: true,
              estado: true,
              fechaIngreso: true,
              fechaVencimiento: true
            },
            orderBy: {
              fechaVencimiento: 'asc'
            }
          },
          _count: {
            select: {
              lotes: true,
              planificaciones: true,
              movimientos: true
            }
          }
        }
      });

      return {
        success: true,
        data: vacuna
      };
    } catch (error) {
      console.error(`Error al obtener vacuna ${id}:`, error);
      return {
        success: false,
        error: 'Error al obtener vacuna'
      };
    }
  }

  /**
   * Crear nueva vacuna
   */
  static async create(data: CreateVacunaDto): Promise<ServiceResult<IVacuna>> {
    try {
      // Validaciones de negocio
      await this.validateVacunaData(data);

      const vacuna = await prisma.vacuna.create({
        data: {
          nombre: data.nombre,
          tipo: data.tipo,
          presentacion: data.presentacion,
          dosisPorFrasco: data.dosisPorFrasco,
          tiempoVidaUtil: data.tiempoVidaUtil,
          temperaturaAlmacenamiento: data.temperaturaAlmacenamiento
        }
      });

      return {
        success: true,
        data: vacuna
      };
    } catch (error) {
      console.error('Error al crear vacuna:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear vacuna'
      };
    }
  }

  /**
   * Actualizar vacuna
   */
  static async update(id: string, data: UpdateVacunaDto): Promise<ServiceResult<IVacuna>> {
    try {
      // Verificar que la vacuna existe
      const vacunaExistente = await prisma.vacuna.findUnique({
        where: { id }
      });

      if (!vacunaExistente) {
        throw createError.notFound('Vacuna no encontrada');
      }

      // Validaciones de negocio para la actualización
      await this.validateVacunaData(data, id);

      const vacuna = await prisma.vacuna.update({
        where: { id },
        data: {
          nombre: data.nombre,
          tipo: data.tipo,
          presentacion: data.presentacion,
          dosisPorFrasco: data.dosisPorFrasco,
          tiempoVidaUtil: data.tiempoVidaUtil,
          temperaturaAlmacenamiento: data.temperaturaAlmacenamiento,
          estado: data.estado
        }
      });

      return {
        success: true,
        data: vacuna
      };
    } catch (error) {
      console.error('Error al actualizar vacuna:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar vacuna'
      };
    }
  }

  /**
   * Eliminar vacuna (hard delete)
   */
  static async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      // Verificar que la vacuna existe
      const vacuna = await prisma.vacuna.findUnique({
        where: { id },
        include: {
          lotes: true,
          planificaciones: true,
          movimientos: true,
          valesDetalle: true
        }
      });

      if (!vacuna) {
        throw createError.notFound('Vacuna no encontrada');
      }

      // Verificar dependencias
      if (vacuna.lotes.length > 0) {
        throw createError.conflict('No se puede eliminar la vacuna porque tiene lotes asociados');
      }

      if (vacuna.planificaciones.length > 0) {
        throw createError.conflict('No se puede eliminar la vacuna porque tiene planificaciones asociadas');
      }

      if (vacuna.movimientos.length > 0) {
        throw createError.conflict('No se puede eliminar la vacuna porque tiene movimientos asociados');
      }

      if (vacuna.valesDetalle.length > 0) {
        throw createError.conflict('No se puede eliminar la vacuna porque tiene vales de entrega asociados');
      }

      // Eliminar la vacuna
      await prisma.vacuna.delete({
        where: { id }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error al eliminar vacuna:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar vacuna'
      };
    }
  }

  /**
   * Obtener estadísticas de stock por vacuna
   */
  static async getStockStats(vacunaId?: string): Promise<ServiceResult<any>> {
    try {
      const where = vacunaId ? { vacunaId } : {};

      const stats = await prisma.loteVacuna.groupBy({
        by: ['vacunaId'],
        where,
        _sum: {
          cantidadActual: true
        },
        _count: {
          id: true
        }
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de stock:', error);
      return {
        success: false,
        error: 'Error al obtener estadísticas de stock'
      };
    }
  }

  /**
   * Validaciones de negocio para vacunas
   */
  private static async validateVacunaData(data: CreateVacunaDto | UpdateVacunaDto, excludeId?: string): Promise<void> {
    // Validar nombre único (solo si se proporciona nombre)
    if (data.nombre) {
      const whereCondition: any = {
        nombre: {
          equals: data.nombre,
          mode: 'insensitive'
        }
      };

      if (excludeId) {
        whereCondition.id = { not: excludeId };
      }

      const vacunaExistente = await prisma.vacuna.findFirst({
        where: whereCondition
      });

      if (vacunaExistente) {
        throw createError.conflict('Ya existe una vacuna con este nombre');
      }
    }

    // Validar dosis por frasco
    if (data.dosisPorFrasco !== undefined && data.dosisPorFrasco <= 0) {
      throw createError.badRequest('Las dosis por frasco deben ser mayor a 0');
    }

    // Validar tiempo de vida útil
    if (data.tiempoVidaUtil !== undefined && data.tiempoVidaUtil <= 0) {
      throw createError.badRequest('El tiempo de vida útil debe ser mayor a 0 días');
    }
  }
}
