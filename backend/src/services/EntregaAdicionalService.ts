import { prisma } from '@/config/database';
import {
  ServiceResult,
  IEntregaAdicional,
  CreateEntregaAdicionalDto,
  UpdateEntregaAdicionalDto,
  EntregaAdicionalConRelaciones
} from '@/types';
import { HttpError } from '@/middleware/errorHandler';

/**
 * Función helper para crear errores consistentes
 */
const createError = (message: string, statusCode: number = 500): HttpError => {
  return new HttpError(message, statusCode);
};

/**
 * Servicio para gestión de entregas adicionales
 */
export class EntregaAdicionalService {
  /**
   * Validar datos de entrega adicional
   */
  private static async validateEntregaAdicionalData(data: CreateEntregaAdicionalDto | UpdateEntregaAdicionalDto, isUpdate = false): Promise<void> {
    if (!isUpdate) {
      const createData = data as CreateEntregaAdicionalDto;
      
      // Validar que el movimiento de vacuna existe
      const movimiento = await prisma.movimientoVacuna.findUnique({
        where: { id: createData.movimientoVacunaId }
      });
      if (!movimiento) {
        throw createError('El movimiento de vacuna especificado no existe', 404);
      }

      // Validar que el usuario existe
      const usuario = await prisma.usuario.findUnique({
        where: { id: createData.usuarioId }
      });
      if (!usuario) {
        throw createError('El usuario especificado no existe', 404);
      }
    }

    // Validar cantidad (permitir 0 para entregas adicionales vacías que se editarán después)
    if (data.cantidad !== undefined) {
      const cantidad = Number(data.cantidad);
      if (isNaN(cantidad) || cantidad < 0 || !Number.isInteger(cantidad)) {
        throw createError('La cantidad debe ser un número entero no negativo', 400);
      }
    }
  }

  /**
   * Obtener siguiente número de entrega para un movimiento
   */
  private static async getNextNumeroEntrega(movimientoVacunaId: string): Promise<number> {
    const ultimaEntrega = await prisma.entregaAdicional.findFirst({
      where: { movimientoVacunaId },
      orderBy: { numeroEntrega: 'desc' }
    });

    return ultimaEntrega ? ultimaEntrega.numeroEntrega + 1 : 1;
  }

  /**
   * Obtener todas las entregas adicionales de un movimiento
   */
  static async getByMovimientoId(movimientoVacunaId: string): Promise<ServiceResult<EntregaAdicionalConRelaciones[]>> {
    try {
      const entregas = await prisma.entregaAdicional.findMany({
        where: { movimientoVacunaId },
        include: {
          movimientoVacuna: {
            select: {
              id: true,
              establecimientoId: true,
              vacunaId: true,
              mes: true,
              anio: true,
              establecimiento: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              vacuna: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          }
        },
        orderBy: { numeroEntrega: 'asc' }
      });

      return {
        success: true,
        data: entregas as EntregaAdicionalConRelaciones[]
      };
    } catch (error) {
      console.error('Error al obtener entregas adicionales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener entregas adicionales'
      };
    }
  }

  /**
   * Obtener entrega adicional por ID
   */
  static async getById(id: string): Promise<ServiceResult<EntregaAdicionalConRelaciones>> {
    try {
      const entrega = await prisma.entregaAdicional.findUnique({
        where: { id },
        include: {
          movimientoVacuna: {
            select: {
              id: true,
              establecimientoId: true,
              vacunaId: true,
              mes: true,
              anio: true,
              establecimiento: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              vacuna: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      if (!entrega) {
        return {
          success: false,
          error: 'Entrega adicional no encontrada'
        };
      }

      return {
        success: true,
        data: entrega as EntregaAdicionalConRelaciones
      };
    } catch (error) {
      console.error('Error al obtener entrega adicional:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener entrega adicional'
      };
    }
  }

  /**
   * Crear nueva entrega adicional
   */
  static async create(data: CreateEntregaAdicionalDto): Promise<ServiceResult<IEntregaAdicional>> {
    try {
      // Validaciones de negocio
      await this.validateEntregaAdicionalData(data);

      // Obtener siguiente número de entrega
      const numeroEntrega = await this.getNextNumeroEntrega(data.movimientoVacunaId);

      const entrega = await prisma.entregaAdicional.create({
        data: {
          movimientoVacunaId: data.movimientoVacunaId,
          numeroEntrega,
          cantidad: data.cantidad,
          fechaEntrega: data.fechaEntrega || new Date(),
          motivo: data.motivo,
          usuarioId: data.usuarioId
        }
      });

      return {
        success: true,
        data: entrega
      };
    } catch (error) {
      console.error('Error al crear entrega adicional:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear entrega adicional'
      };
    }
  }

  /**
   * Actualizar entrega adicional existente
   */
  static async update(id: string, data: UpdateEntregaAdicionalDto): Promise<ServiceResult<IEntregaAdicional>> {
    try {
      // Verificar que la entrega existe
      const entregaExistente = await prisma.entregaAdicional.findUnique({
        where: { id }
      });

      if (!entregaExistente) {
        return {
          success: false,
          error: 'Entrega adicional no encontrada'
        };
      }

      // Validaciones de negocio
      await this.validateEntregaAdicionalData(data, true);

      const updateData: any = {};

      if (data.cantidad !== undefined) {
        updateData.cantidad = data.cantidad;
      }

      if (data.fechaEntrega !== undefined) {
        updateData.fechaEntrega = data.fechaEntrega;
      }

      if (data.motivo !== undefined) {
        updateData.motivo = data.motivo;
      }

      const entrega = await prisma.entregaAdicional.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        data: entrega
      };
    } catch (error) {
      console.error('Error al actualizar entrega adicional:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar entrega adicional'
      };
    }
  }

  /**
   * Eliminar entrega adicional
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Verificar que la entrega existe
      const entrega = await prisma.entregaAdicional.findUnique({
        where: { id }
      });

      if (!entrega) {
        return {
          success: false,
          error: 'Entrega adicional no encontrada'
        };
      }

      await prisma.entregaAdicional.delete({
        where: { id }
      });

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error al eliminar entrega adicional:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar entrega adicional'
      };
    }
  }

  /**
   * Obtener estadísticas de entregas adicionales por movimiento
   */
  static async getEstadisticasByMovimiento(movimientoVacunaId: string): Promise<ServiceResult<{
    totalEntregas: number;
    cantidadTotal: number;
    promedioEntrega: number;
    ultimaEntrega?: Date;
  }>> {
    try {
      const entregas = await prisma.entregaAdicional.findMany({
        where: { movimientoVacunaId },
        orderBy: { fechaEntrega: 'desc' }
      });

      const totalEntregas = entregas.length;
      const cantidadTotal = entregas.reduce((sum, e) => sum + e.cantidad, 0);
      const promedioEntrega = totalEntregas > 0 ? Math.round((cantidadTotal / totalEntregas) * 100) / 100 : 0;

      const data: {
        totalEntregas: number;
        cantidadTotal: number;
        promedioEntrega: number;
        ultimaEntrega?: Date;
      } = {
        totalEntregas,
        cantidadTotal,
        promedioEntrega
      };

      if (entregas.length > 0) {
        data.ultimaEntrega = entregas[0].fechaEntrega;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de entregas adicionales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
      };
    }
  }
}
