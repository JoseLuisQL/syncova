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

      const movimiento = await prisma.movimientoVacuna.findUnique({
        where: { id: data.movimientoVacunaId },
        include: { entregasAdicionales: true }
      });

      if (!movimiento) {
        return {
          success: false,
          error: 'Movimiento de vacuna no encontrado'
        };
      }

      // Obtener siguiente número de entrega
      const numeroEntrega = await this.getNextNumeroEntrega(data.movimientoVacunaId);

      const { MovimientosCalculationService } = await import('./movimientos/MovimientosCalculationService');

      const entrega = await prisma.$transaction(async (tx) => {
        await MovimientosCalculationService.manejarEntregaBase(tx, data.movimientoVacunaId, movimiento);

        const nuevaEntrega = await tx.entregaAdicional.create({
          data: {
            movimientoVacunaId: data.movimientoVacunaId,
            numeroEntrega,
            cantidad: data.cantidad,
            fechaEntrega: data.fechaEntrega || new Date(),
            motivo: data.motivo,
            usuarioId: data.usuarioId
          }
        });

        const entregaTotal = await MovimientosCalculationService.calcularEntregaTotal(tx, data.movimientoVacunaId);

        await tx.movimientoVacuna.update({
          where: { id: data.movimientoVacunaId },
          data: {
            entrega: entregaTotal,
            updatedAt: new Date()
          }
        });

        return nuevaEntrega;
      });

      // Sincronizar saldo anterior del siguiente mes automáticamente
      await MovimientosCalculationService.sincronizarSaldoAnteriorSiguienteMes(
        movimiento.establecimientoId,
        movimiento.vacunaId,
        movimiento.mes,
        movimiento.anio
      );

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
        where: { id },
        include: {
          movimientoVacuna: {
            include: {
              entregasAdicionales: true
            }
          }
        }
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

      const { MovimientosCalculationService } = await import('./movimientos/MovimientosCalculationService');
      const movimiento = entregaExistente.movimientoVacuna;

      const entrega = await prisma.$transaction(async (tx) => {
        const entregaActualizada = await tx.entregaAdicional.update({
          where: { id },
          data: updateData
        });

        const entregaTotal = await MovimientosCalculationService.calcularEntregaTotal(tx, movimiento.id);

        await tx.movimientoVacuna.update({
          where: { id: movimiento.id },
          data: {
            entrega: entregaTotal,
            updatedAt: new Date()
          }
        });

        return entregaActualizada;
      });

      // Sincronizar saldo anterior del siguiente mes automáticamente
      await MovimientosCalculationService.sincronizarSaldoAnteriorSiguienteMes(
        movimiento.establecimientoId,
        movimiento.vacunaId,
        movimiento.mes,
        movimiento.anio
      );

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
        where: { id },
        include: {
          movimientoVacuna: {
            include: {
              entregasAdicionales: true
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

      const movimiento = entrega.movimientoVacuna;
      const { MovimientosCalculationService } = await import('./movimientos/MovimientosCalculationService');

      await prisma.$transaction(async (tx) => {
        await tx.entregaAdicional.delete({
          where: { id }
        });

        const entregaTotal = await MovimientosCalculationService.calcularEntregaTotal(tx, movimiento.id);

        await tx.movimientoVacuna.update({
          where: { id: movimiento.id },
          data: {
            entrega: entregaTotal,
            updatedAt: new Date()
          }
        });

        if (movimiento.entregasAdicionales.length === 1) {
          await tx.movimientoVacuna.update({
            where: { id: movimiento.id },
            data: {
              entregaBase: null,
              updatedAt: new Date()
            }
          });
        }
      });

      // Sincronizar saldo anterior del siguiente mes automáticamente
      await MovimientosCalculationService.sincronizarSaldoAnteriorSiguienteMes(
        movimiento.establecimientoId,
        movimiento.vacunaId,
        movimiento.mes,
        movimiento.anio
      );

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
