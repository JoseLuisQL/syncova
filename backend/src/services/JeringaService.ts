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
        error: 'Error al obtener jeringas'
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
        error: 'Error al obtener jeringa'
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
          tipo: data.tipo,
          capacidad: data.capacidad,
          color: data.color
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
        error: error instanceof Error ? error.message : 'Error al crear jeringa'
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

      const jeringa = await prisma.jeringa.update({
        where: { id },
        data: {
          tipo: data.tipo,
          capacidad: data.capacidad,
          color: data.color,
          estado: data.estado
        }
      });

      return {
        success: true,
        data: jeringa
      };
    } catch (error) {
      console.error(`Error al actualizar jeringa ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar jeringa'
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
        error: error instanceof Error ? error.message : 'Error al eliminar jeringa'
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
        error: 'Error al obtener jeringas activas'
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
        error: 'Error al obtener estadísticas de stock'
      };
    }
  }

  /**
   * Validar datos de jeringa
   */
  private static async validateJeringaData(data: CreateJeringaDto | UpdateJeringaDto, excludeId?: string): Promise<void> {
    // Validar tipos permitidos
    const tiposPermitidos = ['Desechable', 'Autoretraíble', 'De seguridad', 'Para insulina', 'Tuberculina'];
    if (data.tipo && !tiposPermitidos.includes(data.tipo)) {
      throw createError.badRequest(`Tipo de jeringa inválido. Tipos permitidos: ${tiposPermitidos.join(', ')}`);
    }

    // Validar capacidades permitidas
    const capacidadesPermitidas = ['0.5ml', '1ml', '2ml', '3ml', '5ml', '10ml', '20ml'];
    if (data.capacidad && !capacidadesPermitidas.includes(data.capacidad)) {
      throw createError.badRequest(`Capacidad inválida. Capacidades permitidas: ${capacidadesPermitidas.join(', ')}`);
    }

    // Validar colores permitidos
    const coloresPermitidos = ['Transparente', 'Azul', 'Verde', 'Rojo', 'Amarillo', 'Naranja', 'Morado'];
    if (data.color && !coloresPermitidos.includes(data.color)) {
      throw createError.badRequest(`Color inválido. Colores permitidos: ${coloresPermitidos.join(', ')}`);
    }

    // Verificar combinación única de tipo + capacidad + color
    if (data.tipo && data.capacidad && data.color) {
      const where: any = {
        tipo: data.tipo,
        capacidad: data.capacidad,
        color: data.color
      };

      if (excludeId) {
        where.id = { not: excludeId };
      }

      const jeringaExistente = await prisma.jeringa.findFirst({ where });

      if (jeringaExistente) {
        throw createError.badRequest('Ya existe una jeringa con esta combinación de tipo, capacidad y color');
      }
    }
  }
}
