import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { IMovimientoVacuna, IEntregaAdicional } from '@/types';
import { ValeService } from '../ValeService';
import {
  CreateMovimientoDto,
  UpdateMovimientoDto,
  CreateEntregaAdicionalDto
} from './types';

/**
 * Service for Movimientos write operations
 * Handles all create, update, delete operations for movimientos
 */
export class MovimientosWriteService {
  
  /**
   * Validate if a string is a valid UUID
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Get a valid system user for automatic operations
   */
  static async getSystemUser(): Promise<string> {
    try {
      const adminUser = await prisma.usuario.findFirst({
        where: {
          rol: 'administrador',
          estado: 'activo'
        }
      });

      if (adminUser) {
        return adminUser.id;
      }

      const anyUser = await prisma.usuario.findFirst({
        where: { estado: 'activo' }
      });

      if (anyUser) {
        return anyUser.id;
      }

      throw new Error('No se encontró ningún usuario válido en el sistema');
    } catch (error) {
      console.error('Error al obtener usuario del sistema:', error);
      throw new Error('Error al obtener usuario del sistema');
    }
  }

  /**
   * Validate movimiento data
   */
  static async validateMovimientoData(data: CreateMovimientoDto): Promise<void> {
    if (!data.establecimientoId) {
      throw new Error('El establecimiento es requerido');
    }

    if (!data.vacunaId) {
      throw new Error('La vacuna es requerida');
    }

    if (!data.mes || data.mes < 1 || data.mes > 12) {
      throw new Error('El mes debe estar entre 1 y 12');
    }

    if (!data.anio || data.anio < 2020 || data.anio > 2050) {
      throw new Error('El año debe estar entre 2020 y 2050');
    }

    const establecimiento = await prisma.establecimiento.findUnique({
      where: { id: data.establecimientoId }
    });

    if (!establecimiento) {
      throw new Error('El establecimiento no existe');
    }

    const vacuna = await prisma.vacuna.findUnique({
      where: { id: data.vacunaId }
    });

    if (!vacuna) {
      throw new Error('La vacuna no existe');
    }
  }

  /**
   * Create new movimiento
   */
  static async create(data: CreateMovimientoDto): Promise<ServiceResult<IMovimientoVacuna>> {
    try {
      await this.validateMovimientoData(data);

      const movimiento = await prisma.movimientoVacuna.create({
        data: {
          establecimientoId: data.establecimientoId,
          vacunaId: data.vacunaId,
          mes: data.mes,
          anio: data.anio,
          saldoAnterior: data.saldoAnterior || 0,
          transIngreso: data.transIngreso || 0,
          salida: data.salida || 0,
          transSalida: data.transSalida || 0,
          entrega: data.entrega || 0,
          observaciones: data.observaciones || null,
          fechaMovimiento: data.fechaMovimiento || new Date(),
          usuarioId: data.usuarioId
        }
      });

      return {
        success: true,
        data: movimiento
      };
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear movimiento'
      };
    }
  }

  /**
   * Update existing movimiento with automatic redistribution
   */
  static async update(id: string, data: UpdateMovimientoDto): Promise<ServiceResult<IMovimientoVacuna>> {
    try {
      const existingMovimiento = await prisma.movimientoVacuna.findUnique({
        where: { id },
        include: {
          entregasAdicionales: true
        }
      });

      if (!existingMovimiento) {
        return {
          success: false,
          error: 'Movimiento no encontrado'
        };
      }

      if (data.usuarioId && !this.isValidUUID(data.usuarioId)) {
        data.usuarioId = await this.getSystemUser();
      } else if (!data.usuarioId) {
        data.usuarioId = await this.getSystemUser();
      }

      if (data.entrega !== undefined &&
          data.entrega !== existingMovimiento.entrega &&
          existingMovimiento.entregasAdicionales &&
          existingMovimiento.entregasAdicionales.length > 0) {
        return {
          success: false,
          error: 'No se puede modificar entrega principal con entregas adicionales activas'
        };
      }

      const { MovimientosCalculationService } = await import('./MovimientosCalculationService');

      const result = await prisma.$transaction(async (tx) => {
        let redistribucionEjecutada = false;

        if (data.entrega !== undefined && data.entrega !== existingMovimiento.entrega) {
          const redistribucionResult = await MovimientosCalculationService.redistribuirEntregasAutomaticamente(
            tx,
            existingMovimiento,
            data.entrega,
            data.usuarioId!
          );

          if (!redistribucionResult.success) {
            throw new Error(redistribucionResult.error);
          }

          redistribucionEjecutada = true;
        }

        if (data.entregaBase !== undefined && existingMovimiento.entregasAdicionales.length > 0) {
          await tx.movimientoVacuna.update({
            where: { id },
            data: {
              entregaBase: data.entregaBase,
              updatedAt: new Date()
            }
          });

          const entregaTotal = await MovimientosCalculationService.calcularEntregaTotal(tx, id);
          data.entrega = entregaTotal;
        }

        const movimiento = await tx.movimientoVacuna.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        });

        if (data.entrega !== undefined &&
            data.entrega !== existingMovimiento.entrega &&
            !redistribucionEjecutada) {
          const diferenciaCantidad = data.entrega - existingMovimiento.entrega;
          await MovimientosCalculationService.sincronizarConPlanificacion(tx, movimiento, diferenciaCantidad);
        }

        return movimiento;
      });

      if ((data.entrega !== undefined && data.entrega !== existingMovimiento.entrega) ||
          (data.entregaBase !== undefined && data.entregaBase !== existingMovimiento.entregaBase)) {
        console.log(`🔔 [MovimientosWriteService] TRIGGER: Entrega/EntregaBase modificada - sincronizando vales automáticamente`);
        ValeService.onMovimientoActualizado(
          existingMovimiento.establecimientoId,
          existingMovimiento.vacunaId,
          existingMovimiento.mes,
          existingMovimiento.anio,
          data.usuarioId || 'system-auto-sync'
        );
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error al actualizar movimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar movimiento'
      };
    }
  }

  /**
   * Delete movimiento
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const existingMovimiento = await prisma.movimientoVacuna.findUnique({
        where: { id },
        include: {
          entregasAdicionales: true
        }
      });

      if (!existingMovimiento) {
        return {
          success: false,
          error: 'Movimiento no encontrado'
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.entregaAdicional.deleteMany({
          where: { movimientoVacunaId: id }
        });

        await tx.movimientoVacuna.delete({
          where: { id }
        });
      });

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar movimiento'
      };
    }
  }

  /**
   * Create entrega adicional with automatic redistribution
   */
  static async createEntregaAdicional(data: CreateEntregaAdicionalDto): Promise<ServiceResult<IEntregaAdicional>> {
    try {
      if (data.cantidad < 0) {
        return {
          success: false,
          error: 'La cantidad de entrega adicional no puede ser negativa'
        };
      }

      if (data.cantidad > 100000) {
        return {
          success: false,
          error: 'La cantidad de entrega adicional excede el límite máximo permitido (100,000 unidades)'
        };
      }

      if (data.numeroEntrega < 1 || data.numeroEntrega > 99) {
        return {
          success: false,
          error: 'El número de entrega debe estar entre 1 y 99'
        };
      }

      const movimiento = await prisma.movimientoVacuna.findUnique({
        where: { id: data.movimientoVacunaId },
        include: {
          entregasAdicionales: true
        }
      });

      if (!movimiento) {
        return {
          success: false,
          error: 'Movimiento de vacuna no encontrado'
        };
      }

      const planificacionExistente = await prisma.planificacionAnual.findUnique({
        where: {
          uk_planificacion_establecimiento_vacuna_anio: {
            establecimientoId: movimiento.establecimientoId,
            vacunaId: movimiento.vacunaId,
            anio: movimiento.anio
          }
        }
      });

      if (!planificacionExistente) {
        return {
          success: false,
          error: `Este establecimiento no tiene planificación programada para ${movimiento.anio}. Debe crear una planificación primero desde el módulo de Planificación antes de asignar entregas.`
        };
      }

      const entregaExistente = movimiento.entregasAdicionales.find(
        e => e.numeroEntrega === data.numeroEntrega
      );

      if (entregaExistente) {
        return {
          success: false,
          error: `Ya existe una entrega adicional con el número ${data.numeroEntrega}`
        };
      }

      const { MovimientosCalculationService } = await import('./MovimientosCalculationService');

      const result = await prisma.$transaction(async (tx) => {
        if (data.cantidad > 0) {
          const usuarioId = data.usuarioId || await this.getSystemUser();
          const nuevaEntregaTotal = movimiento.entrega + data.cantidad;

          const redistribucionResult = await MovimientosCalculationService.redistribuirEntregasAutomaticamente(
            tx,
            movimiento,
            nuevaEntregaTotal,
            usuarioId
          );

          if (!redistribucionResult.success) {
            throw new Error(redistribucionResult.error);
          }
        }

        await MovimientosCalculationService.manejarEntregaBase(tx, data.movimientoVacunaId, movimiento);

        const entregaAdicional = await tx.entregaAdicional.create({
          data: {
            movimientoVacunaId: data.movimientoVacunaId,
            numeroEntrega: data.numeroEntrega,
            cantidad: data.cantidad,
            fechaEntrega: data.fechaEntrega || new Date(),
            motivo: data.motivo || null,
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

        return entregaAdicional;
      });

      console.log(`🔔 [MovimientosWriteService] TRIGGER: Entrega adicional creada - sincronizando vales automáticamente`);
      ValeService.onEntregaAdicionalCambiada(data.movimientoVacunaId, data.usuarioId);

      return {
        success: true,
        data: result
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
   * Update entrega adicional
   */
  static async updateEntregaAdicional(
    id: string,
    cantidad: number,
    motivo?: string,
    usuarioId?: string,
    skipRedistribucion: boolean = false
  ): Promise<ServiceResult<IEntregaAdicional>> {
    try {
      if (cantidad < 0) {
        return {
          success: false,
          error: 'La cantidad de entrega adicional no puede ser negativa'
        };
      }

      if (cantidad > 100000) {
        return {
          success: false,
          error: 'La cantidad de entrega adicional excede el límite máximo permitido'
        };
      }

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

      const movimiento = entregaExistente.movimientoVacuna;
      const diferenciaCantidad = cantidad - entregaExistente.cantidad;

      const { MovimientosCalculationService } = await import('./MovimientosCalculationService');

      const result = await prisma.$transaction(async (tx) => {
        if (diferenciaCantidad !== 0 && !skipRedistribucion) {
          const usuarioIdFinal = usuarioId || await this.getSystemUser();
          const nuevaEntregaTotal = movimiento.entrega + diferenciaCantidad;

          const redistribucionResult = await MovimientosCalculationService.redistribuirEntregasAutomaticamente(
            tx,
            movimiento,
            nuevaEntregaTotal,
            usuarioIdFinal
          );

          if (!redistribucionResult.success) {
            throw new Error(redistribucionResult.error);
          }
        }

        const entregaActualizada = await tx.entregaAdicional.update({
          where: { id },
          data: {
            cantidad,
            motivo: motivo !== undefined ? motivo : entregaExistente.motivo
          }
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

      console.log(`🔔 [MovimientosWriteService] TRIGGER: Entrega adicional actualizada - sincronizando vales automáticamente`);
      ValeService.onEntregaAdicionalCambiada(movimiento.id, usuarioId || 'system-auto-sync');

      return {
        success: true,
        data: result
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
   * Delete entrega adicional
   */
  static async deleteEntregaAdicional(id: string): Promise<ServiceResult<void>> {
    try {
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

      const movimiento = entregaExistente.movimientoVacuna;

      const { MovimientosCalculationService } = await import('./MovimientosCalculationService');

      await prisma.$transaction(async (tx) => {
        if (entregaExistente.cantidad > 0) {
          const usuarioId = await this.getSystemUser();
          const nuevaEntregaTotal = movimiento.entrega - entregaExistente.cantidad;

          const redistribucionResult = await MovimientosCalculationService.redistribuirEntregasAutomaticamente(
            tx,
            movimiento,
            nuevaEntregaTotal,
            usuarioId
          );

          if (!redistribucionResult.success) {
            throw new Error(redistribucionResult.error);
          }
        }

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

      console.log(`🔔 [MovimientosWriteService] TRIGGER: Entrega adicional eliminada - sincronizando vales automáticamente`);
      ValeService.onEntregaAdicionalCambiada(movimiento.id, 'system-auto-sync');

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
   * Generate movimientos from planificacion
   */
  static async generarMovimientosDesdeplanificacion(
    planificacionId: string,
    usuarioId: string
  ): Promise<ServiceResult<{ creados: number; actualizados: number; errores: string[] }>> {
    try {
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: { id: planificacionId },
        include: {
          establecimiento: true,
          vacuna: true
        }
      });

      if (!planificacion) {
        return {
          success: false,
          error: 'Planificación no encontrada'
        };
      }

      let creados = 0;
      let actualizados = 0;
      const errores: string[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        const entregaMes = planificacion.distribucionMensual[mes - 1];

        if (entregaMes !== null && entregaMes !== undefined) {
          try {
            const movimientoExistente = await prisma.movimientoVacuna.findUnique({
              where: {
                uk_movimiento_establecimiento_vacuna_mes_anio: {
                  establecimientoId: planificacion.establecimientoId,
                  vacunaId: planificacion.vacunaId,
                  mes: mes,
                  anio: planificacion.anio
                }
              }
            });

            if (movimientoExistente) {
              await prisma.movimientoVacuna.update({
                where: { id: movimientoExistente.id },
                data: {
                  entrega: entregaMes,
                  updatedAt: new Date()
                }
              });
              actualizados++;
            } else {
              await prisma.movimientoVacuna.create({
                data: {
                  establecimientoId: planificacion.establecimientoId,
                  vacunaId: planificacion.vacunaId,
                  mes: mes,
                  anio: planificacion.anio,
                  entrega: entregaMes,
                  usuarioId: usuarioId,
                  fechaMovimiento: new Date()
                }
              });
              creados++;
            }
          } catch (error) {
            errores.push(`Error procesando mes ${mes}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }
      }

      return {
        success: true,
        data: {
          creados,
          actualizados,
          errores
        }
      };
    } catch (error) {
      console.error('Error al generar movimientos desde planificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar movimientos desde planificación'
      };
    }
  }
}
