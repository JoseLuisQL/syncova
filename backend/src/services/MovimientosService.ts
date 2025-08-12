import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { IMovimientoVacuna, IEntregaAdicional } from '@/types';
import { ValeService } from './ValeService';

/**
 * Interfaces para filtros y DTOs
 */
export interface MovimientosFilters {
  establecimientoId?: string;
  vacunaId?: string;
  mes?: number;
  anio?: number;
  centroAcopioId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateMovimientoDto {
  establecimientoId: string;
  vacunaId: string;
  mes: number;
  anio: number;
  saldoAnterior?: number;
  transIngreso?: number;
  salida?: number;
  transSalida?: number;
  entrega?: number;
  observaciones?: string;
  fechaMovimiento?: Date;
  usuarioId: string;
}

export interface UpdateMovimientoDto {
  saldoAnterior?: number;
  transIngreso?: number;
  salida?: number;
  transSalida?: number;
  entrega?: number;
  observaciones?: string;
  fechaMovimiento?: Date;
}

export interface CreateEntregaAdicionalDto {
  movimientoVacunaId: string;
  numeroEntrega: number;
  cantidad: number;
  fechaEntrega?: Date;
  motivo?: string;
  usuarioId: string;
}

export interface MovimientoConRelaciones extends IMovimientoVacuna {
  establecimiento: {
    id: string;
    nombre: string;
    tipo: string;
    codigo: string;
    centroAcopioId?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
  };
  entregasAdicionales: IEntregaAdicional[];
}

/**
 * Servicio para gestión de movimientos de vacunas
 */
export class MovimientosService {
  /**
   * Obtener todos los movimientos con filtros opcionales
   */
  static async getAll(filters?: MovimientosFilters): Promise<ServiceResult<{ 
    movimientos: MovimientoConRelaciones[]; 
    total: number 
  }>> {
    try {
      const {
        establecimientoId,
        vacunaId,
        mes,
        anio,
        centroAcopioId,
        search,
        page = 1,
        limit = 50
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (establecimientoId) {
        where.establecimientoId = establecimientoId;
      }

      if (vacunaId) {
        where.vacunaId = vacunaId;
      }

      if (mes) {
        where.mes = mes;
      }

      if (anio) {
        where.anio = anio;
      }

      // Filtro por centro de acopio
      if (centroAcopioId && centroAcopioId !== 'todos') {
        where.establecimiento = {
          centroAcopioId: centroAcopioId
        };
      }

      // Búsqueda por texto
      if (search) {
        where.OR = [
          {
            establecimiento: {
              nombre: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            vacuna: {
              nombre: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            observaciones: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener movimientos con relaciones
      const [movimientos, total] = await Promise.all([
        prisma.movimientoVacuna.findMany({
          where,
          include: {
            establecimiento: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                codigo: true,
                centroAcopioId: true
              }
            },
            vacuna: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                presentacion: true,
                dosisPorFrasco: true
              }
            },
            usuario: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true
              }
            },
            entregasAdicionales: {
              orderBy: {
                numeroEntrega: 'asc'
              }
            }
          },
          orderBy: [
            { anio: 'desc' },
            { mes: 'desc' },
            { establecimiento: { nombre: 'asc' } }
          ],
          skip: offset,
          take: limit
        }),
        prisma.movimientoVacuna.count({ where })
      ]);

      return {
        success: true,
        data: {
          movimientos: movimientos as MovimientoConRelaciones[],
          total
        }
      };
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener movimientos'
      };
    }
  }

  /**
   * Obtener movimiento por ID
   */
  static async getById(id: string): Promise<ServiceResult<MovimientoConRelaciones>> {
    try {
      const movimiento = await prisma.movimientoVacuna.findUnique({
        where: { id },
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true,
              centroAcopioId: true
            }
          },
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true,
              dosisPorFrasco: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true
            }
          },
          entregasAdicionales: {
            orderBy: {
              numeroEntrega: 'asc'
            }
          }
        }
      });

      if (!movimiento) {
        return {
          success: false,
          error: 'Movimiento no encontrado'
        };
      }

      return {
        success: true,
        data: movimiento as MovimientoConRelaciones
      };
    } catch (error) {
      console.error('Error al obtener movimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener movimiento'
      };
    }
  }

  /**
   * Crear nuevo movimiento
   */
  static async create(data: CreateMovimientoDto): Promise<ServiceResult<IMovimientoVacuna>> {
    try {
      // Validaciones de negocio
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
          observaciones: data.observaciones,
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
   * Actualizar movimiento existente
   */
  static async update(id: string, data: UpdateMovimientoDto): Promise<ServiceResult<IMovimientoVacuna>> {
    try {
      // Verificar que el movimiento existe
      const existingMovimiento = await prisma.movimientoVacuna.findUnique({
        where: { id }
      });

      if (!existingMovimiento) {
        return {
          success: false,
          error: 'Movimiento no encontrado'
        };
      }

      // Actualizar en transacción para incluir sincronización con planificación
      const result = await prisma.$transaction(async (tx) => {
        // Actualizar el movimiento
        // El trigger de base de datos se encargará automáticamente de actualizar
        // el saldo anterior del siguiente mes si es necesario
        const movimiento = await tx.movimientoVacuna.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        });

        // SINCRONIZACIÓN BIDIRECCIONAL: Actualizar planificación si cambió la entrega
        if (data.entrega !== undefined && data.entrega !== existingMovimiento.entrega) {
          const diferenciaCantidad = data.entrega - existingMovimiento.entrega;
          await this.sincronizarConPlanificacion(tx, movimiento, diferenciaCantidad);
        }

        return movimiento;
      });

      // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales en tiempo real
      if (data.entrega !== undefined && data.entrega !== existingMovimiento.entrega) {
        console.log(`🔔 [MovimientosService] TRIGGER: Entrega modificada - sincronizando vales automáticamente`);
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
   * Eliminar movimiento
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Verificar que el movimiento existe
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

      // Eliminar en transacción para mantener integridad
      await prisma.$transaction(async (tx) => {
        // Eliminar entregas adicionales primero
        await tx.entregaAdicional.deleteMany({
          where: { movimientoVacunaId: id }
        });

        // Eliminar movimiento
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
   * FUNCIONALIDAD CLAVE: Generar movimientos automáticamente desde planificación anual
   */
  static async generarMovimientosDesdeplanificacion(
    planificacionId: string,
    usuarioId: string
  ): Promise<ServiceResult<{ creados: number; actualizados: number; errores: string[] }>> {
    try {
      // Obtener la planificación con sus datos
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

      // Procesar cada mes del array distribucion_mensual
      for (let mes = 1; mes <= 12; mes++) {
        const entregaMes = planificacion.distribucionMensual[mes - 1]; // Array es 0-indexed

        // Solo crear movimiento si hay entrega para ese mes
        if (entregaMes && entregaMes > 0) {
          try {
            // Verificar si ya existe un movimiento para este mes
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
              // Actualizar entrega existente
              await prisma.movimientoVacuna.update({
                where: { id: movimientoExistente.id },
                data: {
                  entrega: entregaMes,
                  updatedAt: new Date()
                }
              });
              actualizados++;
            } else {
              // Crear nuevo movimiento
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

  /**
   * FUNCIONALIDAD AVANZADA: Manejar entrega base vs entregas adicionales
   * Cuando se crea la primera entrega adicional, se preserva el valor base
   */
  private static async manejarEntregaBase(
    tx: any,
    movimientoId: string,
    movimiento: any
  ): Promise<void> {
    // Si no tiene entrega_base definida y va a tener entregas adicionales,
    // preservar el valor actual de entrega como entrega_base
    if (movimiento.entregaBase === null || movimiento.entregaBase === undefined) {
      await tx.movimientoVacuna.update({
        where: { id: movimientoId },
        data: {
          entregaBase: movimiento.entrega, // Preservar valor original
          updatedAt: new Date()
        }
      });
    }
  }

  /**
   * FUNCIONALIDAD AVANZADA: Calcular entrega total (base + adicionales)
   */
  private static async calcularEntregaTotal(
    tx: any,
    movimientoId: string
  ): Promise<number> {
    // Obtener movimiento con entregas adicionales
    const movimientoCompleto = await tx.movimientoVacuna.findUnique({
      where: { id: movimientoId },
      include: {
        entregasAdicionales: true
      }
    });

    if (!movimientoCompleto) return 0;

    // Calcular total de entregas adicionales
    const totalAdicionales = movimientoCompleto.entregasAdicionales.reduce(
      (sum: number, entrega: any) => sum + entrega.cantidad,
      0
    );

    // Si tiene entrega_base definida, usar esa como base
    const entregaBase = movimientoCompleto.entregaBase ?? movimientoCompleto.entrega;

    return entregaBase + totalAdicionales;
  }

  /**
   * FUNCIONALIDAD CLAVE: Crear entrega adicional
   */
  static async createEntregaAdicional(data: CreateEntregaAdicionalDto): Promise<ServiceResult<IEntregaAdicional>> {
    try {
      // Verificar que el movimiento existe
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

      // Verificar que el número de entrega no existe
      const entregaExistente = movimiento.entregasAdicionales.find(
        e => e.numeroEntrega === data.numeroEntrega
      );

      if (entregaExistente) {
        return {
          success: false,
          error: `Ya existe una entrega adicional con el número ${data.numeroEntrega}`
        };
      }

      // Crear la entrega adicional en transacción
      const result = await prisma.$transaction(async (tx) => {
        // PASO 1: Manejar entrega base (preservar valor original)
        await this.manejarEntregaBase(tx, data.movimientoVacunaId, movimiento);

        // PASO 2: Crear entrega adicional
        const entregaAdicional = await tx.entregaAdicional.create({
          data: {
            movimientoVacunaId: data.movimientoVacunaId,
            numeroEntrega: data.numeroEntrega,
            cantidad: data.cantidad,
            fechaEntrega: data.fechaEntrega || new Date(),
            motivo: data.motivo,
            usuarioId: data.usuarioId
          }
        });

        // PASO 3: Calcular y actualizar entrega total (base + adicionales)
        const entregaTotal = await this.calcularEntregaTotal(tx, data.movimientoVacunaId);

        await tx.movimientoVacuna.update({
          where: { id: data.movimientoVacunaId },
          data: {
            entrega: entregaTotal,
            updatedAt: new Date()
          }
        });

        // PASO 4: SINCRONIZACIÓN AUTOMÁTICA: Actualizar planificación anual
        // Solo sincronizar la diferencia de la entrega adicional
        await this.sincronizarConPlanificacion(tx, movimiento, data.cantidad);

        return entregaAdicional;
      });

      // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales en tiempo real
      console.log(`🔔 [MovimientosService] TRIGGER: Entrega adicional creada - sincronizando vales automáticamente`);
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
   * Actualizar entrega adicional
   */
  static async updateEntregaAdicional(
    id: string,
    cantidad: number,
    motivo?: string
  ): Promise<ServiceResult<IEntregaAdicional>> {
    try {
      // Obtener entrega adicional existente
      const entregaExistente = await prisma.entregaAdicional.findUnique({
        where: { id },
        include: {
          movimientoVacuna: true
        }
      });

      if (!entregaExistente) {
        return {
          success: false,
          error: 'Entrega adicional no encontrada'
        };
      }

      const diferenciaCantidad = cantidad - entregaExistente.cantidad;

      // Actualizar en transacción
      const result = await prisma.$transaction(async (tx) => {
        // PASO 1: Actualizar entrega adicional
        const entregaActualizada = await tx.entregaAdicional.update({
          where: { id },
          data: {
            cantidad,
            motivo
          }
        });

        // PASO 2: Recalcular entrega total (base + adicionales)
        const entregaTotal = await this.calcularEntregaTotal(tx, entregaExistente.movimientoVacunaId);

        await tx.movimientoVacuna.update({
          where: { id: entregaExistente.movimientoVacunaId },
          data: {
            entrega: entregaTotal,
            updatedAt: new Date()
          }
        });

        // PASO 3: SINCRONIZACIÓN AUTOMÁTICA: Actualizar planificación anual
        // Solo sincronizar la diferencia
        if (diferenciaCantidad !== 0) {
          await this.sincronizarConPlanificacion(tx, entregaExistente.movimientoVacuna, diferenciaCantidad);
        }

        return entregaActualizada;
      });

      // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales en tiempo real (solo si cambió la cantidad)
      if (diferenciaCantidad !== 0) {
        console.log(`🔔 [MovimientosService] TRIGGER: Entrega adicional modificada - sincronizando vales automáticamente`);
        ValeService.onEntregaAdicionalCambiada(entregaExistente.movimientoVacunaId, 'system-auto-sync');
      }

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
   * Eliminar entrega adicional
   */
  static async deleteEntregaAdicional(id: string): Promise<ServiceResult<void>> {
    try {
      // Obtener entrega adicional existente
      const entregaExistente = await prisma.entregaAdicional.findUnique({
        where: { id },
        include: {
          movimientoVacuna: true
        }
      });

      if (!entregaExistente) {
        return {
          success: false,
          error: 'Entrega adicional no encontrada'
        };
      }

      // Eliminar en transacción
      await prisma.$transaction(async (tx) => {
        // PASO 1: Eliminar entrega adicional
        await tx.entregaAdicional.delete({
          where: { id }
        });

        // PASO 2: Recalcular entrega total después de eliminar
        const entregaTotal = await this.calcularEntregaTotal(tx, entregaExistente.movimientoVacunaId);

        // PASO 3: Verificar si quedan entregas adicionales
        const entregasRestantes = await tx.entregaAdicional.count({
          where: { movimientoVacunaId: entregaExistente.movimientoVacunaId }
        });

        // PASO 4: Actualizar movimiento
        const updateData: any = {
          entrega: entregaTotal,
          updatedAt: new Date()
        };

        // Si no quedan entregas adicionales, limpiar entrega_base
        if (entregasRestantes === 0) {
          updateData.entregaBase = null;
        }

        await tx.movimientoVacuna.update({
          where: { id: entregaExistente.movimientoVacunaId },
          data: updateData
        });

        // PASO 5: SINCRONIZACIÓN AUTOMÁTICA: Actualizar planificación anual
        await this.sincronizarConPlanificacion(tx, entregaExistente.movimientoVacuna, -entregaExistente.cantidad);
      });

      // 🚀 TRIGGER AUTOMÁTICO: Sincronizar vales en tiempo real
      console.log(`🔔 [MovimientosService] TRIGGER: Entrega adicional eliminada - sincronizando vales automáticamente`);
      ValeService.onEntregaAdicionalCambiada(entregaExistente.movimientoVacunaId, 'system-auto-sync');

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
   * FUNCIONALIDAD CLAVE: Sincronizar con planificación anual
   * Esta función actualiza automáticamente la planificación anual cuando cambian las entregas
   */
  private static async sincronizarConPlanificacion(
    tx: any,
    movimiento: any,
    diferenciaCantidad: number
  ): Promise<void> {
    try {
      // Buscar la planificación anual correspondiente
      const planificacion = await tx.planificacionAnual.findUnique({
        where: {
          uk_planificacion_establecimiento_vacuna_anio: {
            establecimientoId: movimiento.establecimientoId,
            vacunaId: movimiento.vacunaId,
            anio: movimiento.anio
          }
        }
      });

      if (planificacion) {
        // Actualizar el mes correspondiente en distribucion_mensual
        const nuevaDistribucion = [...planificacion.distribucionMensual];
        const mesIndex = movimiento.mes - 1; // Array es 0-indexed

        if (mesIndex >= 0 && mesIndex < 12) {
          nuevaDistribucion[mesIndex] = Math.max(0, nuevaDistribucion[mesIndex] + diferenciaCantidad);

          // Recalcular meta anual
          const nuevaMetaAnual = nuevaDistribucion.reduce((sum, val) => sum + val, 0);

          // Actualizar planificación
          await tx.planificacionAnual.update({
            where: { id: planificacion.id },
            data: {
              distribucionMensual: nuevaDistribucion,
              metaAnual: nuevaMetaAnual,
              updatedAt: new Date()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error al sincronizar con planificación:', error);
      // No lanzar error para no interrumpir la transacción principal
    }
  }

  /**
   * Obtener estadísticas de movimientos
   */
  static async getEstadisticas(anio?: number): Promise<ServiceResult<any>> {
    try {
      const currentYear = anio || new Date().getFullYear();

      const [
        totalMovimientos,
        totalEntregas,
        movimientosPorMes,
        entregasPorVacuna,
        movimientosPorEstablecimiento
      ] = await Promise.all([
        // Total de movimientos del año
        prisma.movimientoVacuna.count({
          where: { anio: currentYear }
        }),

        // Total de entregas del año
        prisma.movimientoVacuna.aggregate({
          where: { anio: currentYear },
          _sum: { entrega: true }
        }),

        // Movimientos por mes
        prisma.movimientoVacuna.groupBy({
          by: ['mes'],
          where: { anio: currentYear },
          _count: { id: true },
          _sum: { entrega: true },
          orderBy: { mes: 'asc' }
        }),

        // Entregas por vacuna
        prisma.movimientoVacuna.groupBy({
          by: ['vacunaId'],
          where: { anio: currentYear },
          _sum: { entrega: true },
          _count: { id: true }
        }),

        // Movimientos por establecimiento
        prisma.movimientoVacuna.groupBy({
          by: ['establecimientoId'],
          where: { anio: currentYear },
          _sum: { entrega: true },
          _count: { id: true }
        })
      ]);

      return {
        success: true,
        data: {
          resumen: {
            totalMovimientos,
            totalEntregas: totalEntregas._sum.entrega || 0,
            anio: currentYear
          },
          movimientosPorMes: movimientosPorMes.map(m => ({
            mes: m.mes,
            cantidad: m._count.id,
            entregas: m._sum.entrega || 0
          })),
          entregasPorVacuna: entregasPorVacuna.map(e => ({
            vacunaId: e.vacunaId,
            entregas: e._sum.entrega || 0,
            movimientos: e._count.id
          })),
          movimientosPorEstablecimiento: movimientosPorEstablecimiento.map(e => ({
            establecimientoId: e.establecimientoId,
            entregas: e._sum.entrega || 0,
            movimientos: e._count.id
          }))
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
      };
    }
  }

  /**
   * Validaciones de negocio para movimientos
   */
  private static async validateMovimientoData(data: CreateMovimientoDto): Promise<void> {
    // Validar establecimiento
    const establecimiento = await prisma.establecimiento.findUnique({
      where: { id: data.establecimientoId }
    });

    if (!establecimiento) {
      throw new Error('Establecimiento no encontrado');
    }

    // Validar vacuna
    const vacuna = await prisma.vacuna.findUnique({
      where: { id: data.vacunaId }
    });

    if (!vacuna) {
      throw new Error('Vacuna no encontrada');
    }

    // Validar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Validar mes
    if (data.mes < 1 || data.mes > 12) {
      throw new Error('El mes debe estar entre 1 y 12');
    }

    // Validar año
    if (data.anio < 2020 || data.anio > 2050) {
      throw new Error('El año debe estar entre 2020 y 2050');
    }

    // Validar que no exista duplicado
    const existingMovimiento = await prisma.movimientoVacuna.findUnique({
      where: {
        uk_movimiento_establecimiento_vacuna_mes_anio: {
          establecimientoId: data.establecimientoId,
          vacunaId: data.vacunaId,
          mes: data.mes,
          anio: data.anio
        }
      }
    });

    if (existingMovimiento) {
      throw new Error(`Ya existe un movimiento para ${establecimiento.nombre} - ${vacuna.nombre} en ${data.mes}/${data.anio}`);
    }

    // Validar valores numéricos no negativos
    const campos = ['saldoAnterior', 'transIngreso', 'salida', 'transSalida', 'entrega'];
    for (const campo of campos) {
      const valor = (data as any)[campo];
      if (valor !== undefined && valor < 0) {
        throw new Error(`El campo ${campo} no puede ser negativo`);
      }
    }
  }

  /**
   * Obtener stock disponible por vacuna
   */
  static async getStockDisponible(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{
    stockInicial: number;
    totalEntregas: number;
    stockDisponible: number;
    porcentajeUtilizado: number;
    estado: 'bueno' | 'medio' | 'critico';
    lotes: Array<{
      id: string;
      numero: string;
      cantidadActual: number;
      fechaVencimiento: Date;
      estado: string;
    }>;
  }>> {
    try {
      // Validar que la vacuna existe
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId }
      });

      if (!vacuna) {
        throw new Error('Vacuna no encontrada');
      }

      // Obtener lotes disponibles para la vacuna
      const lotes = await prisma.loteVacuna.findMany({
        where: {
          vacunaId,
          estado: 'disponible',
          cantidadActual: {
            gt: 0
          }
        },
        orderBy: {
          fechaVencimiento: 'asc'
        }
      });

      // Calcular stock inicial (suma de todos los lotes)
      const stockInicial = lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);

      // Obtener total de entregas hasta el mes/año especificado
      const totalEntregas = await prisma.movimientoVacuna.aggregate({
        where: {
          vacunaId,
          OR: [
            { anio: { lt: anio } },
            { anio, mes: { lte: mes } }
          ]
        },
        _sum: {
          entrega: true
        }
      });

      // Obtener entregas adicionales
      const entregasAdicionales = await prisma.entregaAdicional.aggregate({
        where: {
          movimientoVacuna: {
            vacunaId,
            OR: [
              { anio: { lt: anio } },
              { anio, mes: { lte: mes } }
            ]
          }
        },
        _sum: {
          cantidad: true
        }
      });

      const totalEntregasCalculado = (totalEntregas._sum.entrega || 0) + (entregasAdicionales._sum.cantidad || 0);
      const stockDisponible = Math.max(0, stockInicial - totalEntregasCalculado);
      const porcentajeUtilizado = stockInicial > 0 ? (totalEntregasCalculado / stockInicial) * 100 : 0;

      // Determinar estado del stock
      let estado: 'bueno' | 'medio' | 'critico';
      if (porcentajeUtilizado <= 50) {
        estado = 'bueno';
      } else if (porcentajeUtilizado <= 80) {
        estado = 'medio';
      } else {
        estado = 'critico';
      }

      return {
        success: true,
        data: {
          stockInicial,
          totalEntregas: totalEntregasCalculado,
          stockDisponible,
          porcentajeUtilizado: Math.round(porcentajeUtilizado * 100) / 100,
          estado,
          lotes: lotes.map(lote => ({
            id: lote.id,
            numero: lote.numero,
            cantidadActual: lote.cantidadActual,
            fechaVencimiento: lote.fechaVencimiento,
            estado: lote.estado
          }))
        }
      };
    } catch (error) {
      console.error('Error al obtener stock disponible:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener stock disponible'
      };
    }
  }

  /**
   * Sincronizar saldo anterior del siguiente mes
   * Esta función se ejecuta automáticamente por el trigger de base de datos,
   * pero también puede ser llamada manualmente si es necesario
   */
  static async sincronizarSaldoAnteriorSiguienteMes(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{ actualizado: boolean; stockCalculado: number }>> {
    try {
      // Obtener el movimiento actual
      const movimientoActual = await prisma.movimientoVacuna.findUnique({
        where: {
          establecimientoId_vacunaId_mes_anio: {
            establecimientoId,
            vacunaId,
            mes,
            anio
          }
        }
      });

      if (!movimientoActual) {
        return {
          success: false,
          error: 'Movimiento actual no encontrado'
        };
      }

      // Calcular el stock actual
      const stockCalculado = movimientoActual.saldoAnterior +
                            movimientoActual.transIngreso -
                            movimientoActual.salida -
                            movimientoActual.transSalida +
                            movimientoActual.entrega;

      // Calcular el siguiente mes y año
      let siguienteMes = mes + 1;
      let siguienteAnio = anio;

      if (mes === 12) {
        siguienteMes = 1;
        siguienteAnio = anio + 1;
      }

      // Buscar el movimiento del siguiente mes
      const movimientoSiguiente = await prisma.movimientoVacuna.findUnique({
        where: {
          establecimientoId_vacunaId_mes_anio: {
            establecimientoId,
            vacunaId,
            mes: siguienteMes,
            anio: siguienteAnio
          }
        }
      });

      let actualizado = false;

      // Si existe el movimiento del siguiente mes, actualizar su saldo anterior
      if (movimientoSiguiente) {
        await prisma.movimientoVacuna.update({
          where: { id: movimientoSiguiente.id },
          data: {
            saldoAnterior: stockCalculado,
            updatedAt: new Date()
          }
        });
        actualizado = true;
      }

      return {
        success: true,
        data: {
          actualizado,
          stockCalculado
        }
      };
    } catch (error) {
      console.error('Error al sincronizar saldo anterior:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al sincronizar saldo anterior'
      };
    }
  }
}
