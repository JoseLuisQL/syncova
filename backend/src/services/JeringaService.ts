import { prisma } from '@/config/database';
import { IJeringa, CreateJeringaDto, UpdateJeringaDto, EstadoGeneral, ServiceResult } from '@/types';
import { createError } from '@/middleware/errorHandler';

/**
 * Servicio para gestión de jeringas
 */
export class JeringaService {
  /**
   * Obtener todas las jeringas con filtros opcionales
   */
  static async getAll(filters?: {
    estado?: EstadoGeneral | 'todos';
    search?: string;
    tipo?: string;
    capacidad?: string;
    color?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ jeringas: IJeringa[]; total: number }>> {
    try {
      const {
        estado,
        search,
        tipo,
        capacidad,
        color,
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
          { tipo: { contains: search, mode: 'insensitive' } },
          { capacidad: { contains: search, mode: 'insensitive' } },
          { color: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (tipo) {
        where.tipo = { contains: tipo, mode: 'insensitive' };
      }

      if (capacidad) {
        where.capacidad = { contains: capacidad, mode: 'insensitive' };
      }

      if (color) {
        where.color = { contains: color, mode: 'insensitive' };
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener jeringas con información de lotes
      const [jeringas, total] = await Promise.all([
        prisma.jeringa.findMany({
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
                lotes: true
              }
            }
          },
          orderBy: [
            { tipo: 'asc' },
            { capacidad: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.jeringa.count({ where })
      ]);

      return {
        success: true,
        data: {
          jeringas,
          total
        }
      };
    } catch (error) {
      console.error('Error al obtener jeringas:', error);
      return {
        success: false,
        error: 'Error al obtener jeringas',
        statusCode: (error as any)?.statusCode || 500
      };
    }
  }

  /**
   * Obtener jeringa por ID
   */
  static async getById(id: string): Promise<ServiceResult<IJeringa | null>> {
    try {
      const jeringa = await prisma.jeringa.findUnique({
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
              fechaIngreso: 'desc'
            }
          },
          _count: {
            select: {
              lotes: true
            }
          }
        }
      });

      return {
        success: true,
        data: jeringa
      };
    } catch (error) {
      console.error(`Error al obtener jeringa ${id}:`, error);
      return {
        success: false,
        error: 'Error al obtener jeringa',
        statusCode: (error as any)?.statusCode || 500
      };
    }
  }

  /**
   * Crear nueva jeringa
   */
  static async create(data: CreateJeringaDto): Promise<ServiceResult<IJeringa>> {
    try {
      // Validaciones de negocio
      await this.validateJeringaData(data);

      const jeringa = await prisma.jeringa.create({
        data: {
          tipo: data.tipo.trim(),
          capacidad: data.capacidad.trim(),
          color: data.color.trim()
        }
      });

      return {
        success: true,
        data: jeringa
      };
    } catch (error) {
      console.error('Error al crear jeringa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear jeringa',
        statusCode: (error as any)?.statusCode || 500
      };
    }
  }

  /**
   * Actualizar jeringa
   */
  static async update(id: string, data: UpdateJeringaDto): Promise<ServiceResult<IJeringa>> {
    try {
      // Verificar que la jeringa existe
      const jeringaExistente = await prisma.jeringa.findUnique({
        where: { id }
      });

      if (!jeringaExistente) {
        throw createError.notFound('Jeringa no encontrada');
      }

      // Validaciones de negocio para la actualización
      await this.validateJeringaData(data, id);

      const updateData: any = {};
      if (data.tipo !== undefined) updateData.tipo = data.tipo.trim();
      if (data.capacidad !== undefined) updateData.capacidad = data.capacidad.trim();
      if (data.color !== undefined) updateData.color = data.color.trim();
      if (data.estado !== undefined) updateData.estado = data.estado;

      const jeringa = await prisma.jeringa.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        data: jeringa
      };
    } catch (error) {
      console.error(`Error al actualizar jeringa ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar jeringa',
        statusCode: (error as any)?.statusCode || 500
      };
    }
  }

  /**
   * Eliminar jeringa
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Verificar que la jeringa existe
      const jeringaExistente = await prisma.jeringa.findUnique({
        where: { id },
        include: {
          lotes: true
        }
      });

      if (!jeringaExistente) {
        throw createError.notFound('Jeringa no encontrada');
      }

      // Verificar si tiene lotes asociados
      if (jeringaExistente.lotes.length > 0) {
        throw createError.badRequest(
          `No se puede eliminar la jeringa porque tiene ${jeringaExistente.lotes.length} lote(s) asociado(s). Elimine primero los lotes relacionados.`
        );
      }

      await prisma.jeringa.delete({
        where: { id }
      });

      return {
        success: true
      };
    } catch (error) {
      console.error(`Error al eliminar jeringa ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar jeringa',
        statusCode: (error as any)?.statusCode || 500
      };
    }
  }

  /**
   * Obtener jeringas activas (para selects y formularios)
   */
  static async getActivas(): Promise<ServiceResult<IJeringa[]>> {
    try {
      const jeringas = await prisma.jeringa.findMany({
        where: {
          estado: 'activo'
        },
        orderBy: [
          { tipo: 'asc' },
          { capacidad: 'asc' }
        ]
      });

      return {
        success: true,
        data: jeringas
      };
    } catch (error) {
      console.error('Error al obtener jeringas activas:', error);
      return {
        success: false,
        error: 'Error al obtener jeringas activas',
        statusCode: (error as any)?.statusCode || 500
      };
    }
  }

  /**
   * Obtener estadísticas de stock de jeringas
   */
  static async getStockStats(jeringaId?: string): Promise<ServiceResult<any>> {
    try {
      const where: any = {};
      
      if (jeringaId) {
        where.id = jeringaId;
      }

      const jeringas = await prisma.jeringa.findMany({
        where,
        include: {
          lotes: {
            where: {
              estado: 'disponible'
            }
          }
        }
      });

      const stats = jeringas.map(jeringa => {
        const stockTotal = jeringa.lotes.reduce((total, lote) => total + lote.cantidadActual, 0);
        const totalLotes = jeringa.lotes.length;
        const lotesDisponibles = jeringa.lotes.filter(l => l.estado === 'disponible').length;

        return {
          jeringaId: jeringa.id,
          jeringaNombre: `${jeringa.tipo} ${jeringa.capacidad}`,
          tipo: jeringa.tipo,
          capacidad: jeringa.capacidad,
          color: jeringa.color,
          stockTotal,
          totalLotes,
          lotesDisponibles
        };
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de stock:', error);
      return {
        success: false,
        error: 'Error al obtener estadísticas de stock',
        statusCode: (error as any)?.statusCode || 500
      };
    }
  }

  /**
   * Validar datos de jeringa
   */
  private static async validateJeringaData(data: CreateJeringaDto | UpdateJeringaDto, excludeId?: string): Promise<void> {
    const tipo = data.tipo?.trim();
    const capacidad = data.capacidad?.trim();
    const color = data.color?.trim();

    if (data.tipo !== undefined) {
      if (!tipo || tipo.length === 0) {
        throw createError.badRequest('El tipo de jeringa es requerido');
      }
      if (tipo.length > 100) {
        throw createError.badRequest('El tipo de jeringa no puede superar los 100 caracteres');
      }
    }

    if (data.capacidad !== undefined) {
      if (!capacidad || capacidad.length === 0) {
        throw createError.badRequest('La capacidad de la jeringa es requerida');
      }
      if (capacidad.length > 20) {
        throw createError.badRequest('La capacidad de la jeringa no puede superar los 20 caracteres');
      }
    }

    if (data.color !== undefined) {
      if (!color || color.length === 0) {
        throw createError.badRequest('El color de la jeringa es requerido');
      }
      if (color.length > 50) {
        throw createError.badRequest('El color de la jeringa no puede superar los 50 caracteres');
      }
    }

    // Verificar combinación única de tipo + capacidad + color
    if (tipo && capacidad && color) {
      const where: any = {
        tipo: { equals: tipo, mode: 'insensitive' },
        capacidad: { equals: capacidad, mode: 'insensitive' },
        color: { equals: color, mode: 'insensitive' }
      };

      if (excludeId) {
        where.id = { not: excludeId };
      }

      const jeringaExistente = await prisma.jeringa.findFirst({ where });

      if (jeringaExistente) {
        throw createError.badRequest('Ya existe una jeringa registrada con esta combinación de tipo, capacidad y color');
      }
    }
  }
}
