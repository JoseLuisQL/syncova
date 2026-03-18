import { prisma } from '@/config/database';
import { ServiceResult, IAlerta } from '@/types';
import { Prisma, TipoAlerta, NivelAlerta } from '@prisma/client';
import { createError } from '@/middleware/errorHandler';
import { AlertaRealtimeService } from '@/services/AlertaRealtimeService';

export interface CreateAlertaDto {
  tipo: TipoAlerta;
  titulo: string;
  descripcion: string;
  nivel: NivelAlerta;
  fechaVencimiento?: Date;
  usuarioId?: string;
  parametros?: Record<string, unknown>;
}

export interface UpdateAlertaDto {
  tipo?: TipoAlerta;
  titulo?: string;
  descripcion?: string;
  nivel?: NivelAlerta;
  fechaVencimiento?: Date;
  leida?: boolean;
  usuarioId?: string;
  parametros?: Record<string, unknown>;
}

export interface AlertaFilters {
  tipo?: TipoAlerta | 'todos';
  nivel?: NivelAlerta | 'todos';
  leida?: boolean | 'todos';
  usuarioId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AlertaStats {
  total: number;
  porTipo: Record<TipoAlerta, number>;
  porNivel: Record<NivelAlerta, number>;
  noLeidas: number;
  vencidas: number;
  proximasVencer: number;
}

/**
 * Servicio para gestión de alertas del sistema
 */
export class AlertaService {
  /**
   * Obtener todas las alertas con filtros opcionales
   */
  static async getAll(filters?: AlertaFilters): Promise<ServiceResult<{ alertas: IAlerta[]; total: number }>> {
    try {
      const {
        tipo,
        nivel,
        leida,
        usuarioId,
        fechaDesde,
        fechaHasta,
        search,
        page = 1,
        limit = 50
      } = filters || {};

      // Construir condiciones de filtro
      const where: Prisma.AlertaWhereInput = {};

      if (tipo && tipo !== 'todos') {
        where.tipo = tipo;
      }

      if (nivel && nivel !== 'todos') {
        where.nivel = nivel;
      }

      if (typeof leida === 'boolean') {
        where.leida = leida;
      }

      if (usuarioId) {
        where.usuarioId = usuarioId;
      }

      if (fechaDesde || fechaHasta) {
        where.fechaCreacion = {};
        if (fechaDesde) {
          where.fechaCreacion.gte = fechaDesde;
        }
        if (fechaHasta) {
          where.fechaCreacion.lte = fechaHasta;
        }
      }

      if (search) {
        where.OR = [
          { titulo: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener alertas con información relacionada
      const [alertas, total] = await Promise.all([
        prisma.alerta.findMany({
          where,
          include: {
            usuario: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                usuario: true
              }
            }
          },
          orderBy: [
            { fechaCreacion: 'desc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.alerta.count({ where })
      ]);

      return {
        success: true,
        data: { alertas, total }
      };
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener alertas'
      };
    }
  }

  /**
   * Obtener alerta por ID
   */
  static async getById(id: string): Promise<ServiceResult<IAlerta>> {
    try {
      const alerta = await prisma.alerta.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              usuario: true
            }
          }
        }
      });

      if (!alerta) {
        throw createError.notFound('Alerta no encontrada');
      }

      return {
        success: true,
        data: alerta
      };
    } catch (error) {
      console.error('Error al obtener alerta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener alerta'
      };
    }
  }

  /**
   * Crear nueva alerta
   */
  static async create(data: CreateAlertaDto): Promise<ServiceResult<IAlerta>> {
    try {
      // Validaciones de negocio
      await this.validateAlertaData(data);

      const alerta = await prisma.alerta.create({
        data: {
          tipo: data.tipo,
          titulo: data.titulo,
          descripcion: data.descripcion,
          nivel: data.nivel,
          fechaVencimiento: data.fechaVencimiento,
          usuarioId: data.usuarioId,
          parametros: data.parametros as Prisma.InputJsonValue | undefined
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              usuario: true
            }
          }
        }
      });

      AlertaRealtimeService.notifyAlertasChanged('created', {
        id: alerta.id,
        tipo: alerta.tipo,
        nivel: alerta.nivel,
      });

      return {
        success: true,
        data: alerta
      };

      
    } catch (error) {
      console.error('Error al crear alerta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear alerta'
      };
    }
  }

  /**
   * Actualizar alerta
   */
  static async update(id: string, data: UpdateAlertaDto): Promise<ServiceResult<IAlerta>> {
    try {
      // Verificar que la alerta existe
      const alertaExistente = await prisma.alerta.findUnique({
        where: { id }
      });

      if (!alertaExistente) {
        throw createError.notFound('Alerta no encontrada');
      }

      // Validaciones de negocio para la actualización
      await this.validateAlertaData(data);
      

      const alerta = await prisma.alerta.update({
        where: { id },
        data: {
          tipo: data.tipo,
          titulo: data.titulo,
          descripcion: data.descripcion,
          nivel: data.nivel,
          fechaVencimiento: data.fechaVencimiento,
          leida: data.leida,
          usuarioId: data.usuarioId,
          parametros: data.parametros as Prisma.InputJsonValue | undefined
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              usuario: true
            }
          }
        }
      });

      AlertaRealtimeService.notifyAlertasChanged('updated', {
        id: alerta.id,
        tipo: alerta.tipo,
        nivel: alerta.nivel,
        leida: alerta.leida,
      });

      return {
        success: true,
        data: alerta
      };
    } catch (error) {
      console.error('Error al actualizar alerta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar alerta'
      };
    }
  }

  /**
   * Eliminar alerta
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Verificar que la alerta existe
      const alertaExistente = await prisma.alerta.findUnique({
        where: { id }
      });

      if (!alertaExistente) {
        throw createError.notFound('Alerta no encontrada');
      }

      await prisma.alerta.delete({
        where: { id }
      });

      AlertaRealtimeService.notifyAlertasChanged('deleted', { id });

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error al eliminar alerta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar alerta'
      };
    }
  }

  /**
   * Marcar alerta como leída
   */
  static async markAsRead(id: string): Promise<ServiceResult<IAlerta>> {
    try {
      const alerta = await prisma.alerta.update({
        where: { id },
        data: { leida: true },
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              usuario: true
            }
          }
        }
      });

      AlertaRealtimeService.notifyAlertasChanged('read-single', { id: alerta.id });

      return {
        success: true,
        data: alerta
      };
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al marcar alerta como leída'
      };
    }
  }

  /**
   * Marcar múltiples alertas como leídas
   */
  static async markMultipleAsRead(ids: string[]): Promise<ServiceResult<{ count: number }>> {
    try {
      const result = await prisma.alerta.updateMany({
        where: {
          id: { in: ids }
        },
        data: { leida: true }
      });

      if (result.count > 0) {
        AlertaRealtimeService.notifyAlertasChanged('read-multiple', { ids, count: result.count });
      }

      return {
        success: true,
        data: { count: result.count }
      };
    } catch (error) {
      console.error('Error al marcar alertas como leídas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al marcar alertas como leídas'
      };
    }
  }

  /**
   * Obtener estadísticas de alertas
   */
  static async getStats(): Promise<ServiceResult<AlertaStats>> {
    try {
      const now = new Date();
      const proximoVencimiento = new Date();
      proximoVencimiento.setDate(now.getDate() + 7); // Próximas a vencer en 7 días

      const [
        total,
        porTipo,
        porNivel,
        noLeidas,
        vencidas,
        proximasVencer
      ] = await Promise.all([
        // Total de alertas
        prisma.alerta.count(),

        // Alertas por tipo
        prisma.alerta.groupBy({
          by: ['tipo'],
          _count: { tipo: true }
        }),

        // Alertas por nivel
        prisma.alerta.groupBy({
          by: ['nivel'],
          _count: { nivel: true }
        }),

        // Alertas no leídas
        prisma.alerta.count({
          where: { leida: false }
        }),

        // Alertas vencidas
        prisma.alerta.count({
          where: {
            fechaVencimiento: {
              lt: now
            }
          }
        }),

        // Alertas próximas a vencer
        prisma.alerta.count({
          where: {
            fechaVencimiento: {
              gte: now,
              lte: proximoVencimiento
            }
          }
        })
      ]);

      // Procesar estadísticas por tipo
      const tipoStats: Record<TipoAlerta, number> = {
        vencimiento: 0,
        stock_bajo: 0,
        discrepancia: 0,
        sistema: 0
      };

      porTipo.forEach(item => {
        tipoStats[item.tipo] = item._count.tipo;
      });

      // Procesar estadísticas por nivel
      const nivelStats: Record<NivelAlerta, number> = {
        info: 0,
        warning: 0,
        error: 0,
        success: 0
      };

      porNivel.forEach(item => {
        nivelStats[item.nivel] = item._count.nivel;
      });

      return {
        success: true,
        data: {
          total,
          porTipo: tipoStats,
          porNivel: nivelStats,
          noLeidas,
          vencidas,
          proximasVencer
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de alertas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas de alertas'
      };
    }
  }

  /**
   * Obtener alertas no leídas para un usuario específico
   * Incluye alertas asignadas al usuario Y alertas globales (sin usuario)
   */
  static async getUnreadByUser(usuarioId: string): Promise<ServiceResult<IAlerta[]>> {
    try {
      const alertas = await prisma.alerta.findMany({
        where: {
          leida: false,
          OR: [
            { usuarioId: usuarioId },
            { usuarioId: null }
          ]
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              usuario: true
            }
          }
        },
        orderBy: [
          { nivel: 'asc' },
          { fechaCreacion: 'desc' }
        ],
        take: 50
      });

      return {
        success: true,
        data: alertas
      };
    } catch (error) {
      console.error('Error al obtener alertas no leídas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener alertas no leídas'
      };
    }
  }

  /**
   * Limpiar alertas antiguas (más de X días)
   */
  static async cleanupOldAlerts(daysOld: number = 30): Promise<ServiceResult<{ count: number }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.alerta.deleteMany({
        where: {
          fechaCreacion: {
            lt: cutoffDate
          },
          leida: true // Solo eliminar alertas ya leídas
        }
      });

      if (result.count > 0) {
        AlertaRealtimeService.notifyAlertasChanged('cleanup-old', { count: result.count });
      }

      return {
        success: true,
        data: { count: result.count }
      };
    } catch (error) {
      console.error('Error al limpiar alertas antiguas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al limpiar alertas antiguas'
      };
    }
  }

  /**
   * Validaciones de negocio para alertas
   */
  private static async validateAlertaData(data: CreateAlertaDto | UpdateAlertaDto): Promise<void> {
    // Validar título requerido
    if (data.titulo && data.titulo.trim().length === 0) {
      throw createError.badRequest('El título es requerido');
    }

    // Validar descripción requerida
    if (data.descripcion && data.descripcion.trim().length === 0) {
      throw createError.badRequest('La descripción es requerida');
    }

    // Validar longitud del título
    if (data.titulo && data.titulo.length > 255) {
      throw createError.badRequest('El título no puede exceder 255 caracteres');
    }

    // Validar fecha de vencimiento
    if (data.fechaVencimiento && data.fechaVencimiento < new Date()) {
      throw createError.badRequest('La fecha de vencimiento no puede ser en el pasado');
    }

    // Validar que el usuario existe si se proporciona
    if (data.usuarioId) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: data.usuarioId }
      });

      if (!usuario) {
        throw createError.badRequest('El usuario especificado no existe');
      }
    }
  }
}
