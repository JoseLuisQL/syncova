import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { IMovimientoVacuna, IEntregaAdicional } from '@/types';
import { ValeService } from './ValeService';
import * as ExcelJS from 'exceljs';

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
        limit = 1000 // CORRECCIÓN: Aumentar límite para cargar todos los movimientos
      } = filters || {};

      console.log('🔍 MovimientosService.getAll - Filtros recibidos:', {
        establecimientoId,
        vacunaId,
        mes,
        anio,
        centroAcopioId,
        search,
        page,
        limit
      });

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

      // CORRECCIÓN: Filtro por centro de acopio
      if (centroAcopioId && centroAcopioId !== 'todos') {
        // Filtrar por centro de acopio específico
        where.establecimiento = {
          centroAcopioId: centroAcopioId
        };
        console.log('🏥 Aplicando filtro por centro de acopio específico:', centroAcopioId);
      } else {
        // Para "todos los centros", no aplicar filtro adicional
        // Los establecimientos ya están filtrados por naturaleza (no incluyen centros de acopio)
        console.log('🏥 Aplicando filtro para todos los centros (sin filtro adicional)');
      }

      // CORRECCIÓN: Búsqueda por texto mejorada
      if (search) {
        // Combinar búsqueda con filtros de establecimiento existentes
        const searchConditions = [
          {
            establecimiento: {
              ...where.establecimiento,
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

        // Si ya hay filtros de establecimiento, combinarlos con la búsqueda
        where.OR = searchConditions;
        console.log('🔍 Aplicando búsqueda por texto:', search);
      }

      console.log('📋 Condiciones de filtro construidas:', JSON.stringify(where, null, 2));

      // CORRECCIÓN: Para el módulo de movimientos, cargar todos los datos sin paginación
      // cuando se consultan por mes/año específico
      const shouldPaginate = !mes || !anio || (search && search.length > 0);

      console.log(`🔍 Evaluando paginación:`);
      console.log(`   - mes: ${mes} (!mes = ${!mes})`);
      console.log(`   - anio: ${anio} (!anio = ${!anio})`);
      console.log(`   - search: ${search} (search && search.length > 0 = ${search && search.length > 0})`);
      console.log(`   - shouldPaginate: ${shouldPaginate}`);

      let queryOptions: any = {
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
        ]
      };

      // Solo aplicar paginación si es necesario
      if (shouldPaginate) {
        const offset = (page - 1) * limit;
        queryOptions.skip = offset;
        queryOptions.take = limit;
        console.log(`📄 Aplicando paginación: offset=${offset}, limit=${limit}`);
      } else {
        console.log(`📄 Cargando TODOS los movimientos sin paginación para mes=${mes}, año=${anio}`);
      }

      // Obtener movimientos con relaciones
      const [movimientos, total] = await Promise.all([
        prisma.movimientoVacuna.findMany(queryOptions),
        prisma.movimientoVacuna.count({ where })
      ]);

      console.log(`✅ MovimientosService.getAll - Resultados: ${movimientos.length} movimientos de ${total} totales`);

      // Log de establecimientos únicos encontrados
      const establecimientosUnicos = [...new Set(movimientos.map(m => (m as any).establecimiento?.nombre || 'Sin nombre'))];
      console.log(`🏥 Establecimientos con movimientos: ${establecimientosUnicos.length}`, establecimientosUnicos);

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

        // CORRECCIÓN: Crear movimiento para TODOS los meses, incluyendo cantidades 0
        // Esto permite que los usuarios puedan modificar las entregas desde el módulo de movimientos
        if (entregaMes !== null && entregaMes !== undefined) {
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
              // Actualizar entrega existente (incluso si es 0)
              await prisma.movimientoVacuna.update({
                where: { id: movimientoExistente.id },
                data: {
                  entrega: entregaMes,
                  updatedAt: new Date()
                }
              });
              actualizados++;
            } else {
              // Crear nuevo movimiento (incluso si la entrega es 0)
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

  /**
   * Generar plantilla Excel para importación por vacuna específica
   * Nota: El saldo anterior NO se incluye en la importación ya que se calcula automáticamente
   */
  static async generarPlantillaVacuna(vacunaId: string, anio: number): Promise<ServiceResult<ExcelJS.Workbook>> {
    try {
      // Validar parámetros
      if (!vacunaId) {
        return {
          success: false,
          error: 'ID de vacuna requerido'
        };
      }

      if (!anio || anio < 2020 || anio > 2050) {
        return {
          success: false,
          error: 'Año debe estar entre 2020 y 2050'
        };
      }

      // Obtener información de la vacuna
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          presentacion: true,
          dosisPorFrasco: true
        }
      });

      if (!vacuna) {
        return {
          success: false,
          error: 'Vacuna no encontrada'
        };
      }

      // Obtener todos los establecimientos activos
      const establecimientos = await prisma.establecimiento.findMany({
        where: { estado: 'activo' },
        include: {
          centroAcopio: {
            include: {
              microred: {
                include: {
                  red: true
                }
              }
            }
          }
        },
        orderBy: [
          { centroAcopio: { microred: { red: { nombre: 'asc' } } } },
          { centroAcopio: { microred: { nombre: 'asc' } } },
          { centroAcopio: { nombre: 'asc' } },
          { tipo: 'asc' },
          { nombre: 'asc' }
        ]
      });

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunas';
      workbook.created = new Date();

      // Crear hoja de trabajo
      const worksheet = workbook.addWorksheet(`${vacuna.nombre} - ${anio}`);

      // Configurar columnas
      worksheet.columns = [
        { header: 'Establecimiento ID', key: 'establecimientoId', width: 40 },
        { header: 'Establecimiento', key: 'establecimiento', width: 30 },
        { header: 'Tipo', key: 'tipo', width: 15 },
        { header: 'Centro Acopio', key: 'centroAcopio', width: 25 },
        { header: 'Mes', key: 'mes', width: 10 },
        { header: 'Año', key: 'anio', width: 10 },
        { header: 'Trans. Ingreso', key: 'transIngreso', width: 15 },
        { header: 'Salida', key: 'salida', width: 15 },
        { header: 'Trans. Salida', key: 'transSalida', width: 15 },
        { header: 'Observaciones', key: 'observaciones', width: 30 }
      ];

      // Estilo del encabezado
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Agregar filas de datos para cada establecimiento y mes
      let rowIndex = 2;
      for (const establecimiento of establecimientos) {
        for (let mes = 1; mes <= 12; mes++) {
          const row = worksheet.addRow({
            establecimientoId: establecimiento.id,
            establecimiento: establecimiento.nombre,
            tipo: establecimiento.tipo.replace('_', ' ').toUpperCase(),
            centroAcopio: establecimiento.centroAcopio?.nombre || '',
            mes: mes,
            anio: anio,
            transIngreso: 0,
            salida: 0,
            transSalida: 0,
            observaciones: ''
          });

          // Alternar colores de fila
          if (rowIndex % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F8F9FA' }
            };
          }

          rowIndex++;
        }
      }

      // Agregar bordes a todas las celdas
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      return {
        success: true,
        data: workbook
      };

    } catch (error) {
      console.error('Error al generar plantilla de vacuna:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar plantilla'
      };
    }
  }

  /**
   * Generar plantilla Excel masiva para todas las vacunas de un año
   * Nota: El saldo anterior NO se incluye en la importación ya que se calcula automáticamente
   */
  static async generarPlantillaMasiva(anio: number): Promise<ServiceResult<ExcelJS.Workbook>> {
    try {
      // Validar parámetros
      if (!anio || anio < 2020 || anio > 2050) {
        return {
          success: false,
          error: 'Año debe estar entre 2020 y 2050'
        };
      }

      // Obtener todas las vacunas activas
      const vacunas = await prisma.vacuna.findMany({
        where: { estado: 'activo' },
        orderBy: { nombre: 'asc' }
      });

      if (vacunas.length === 0) {
        return {
          success: false,
          error: 'No se encontraron vacunas activas'
        };
      }

      // Obtener todos los establecimientos activos
      const establecimientos = await prisma.establecimiento.findMany({
        where: { estado: 'activo' },
        include: {
          centroAcopio: {
            include: {
              microred: {
                include: {
                  red: true
                }
              }
            }
          }
        },
        orderBy: [
          { centroAcopio: { microred: { red: { nombre: 'asc' } } } },
          { centroAcopio: { microred: { nombre: 'asc' } } },
          { centroAcopio: { nombre: 'asc' } },
          { tipo: 'asc' },
          { nombre: 'asc' }
        ]
      });

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunas';
      workbook.created = new Date();

      // Crear una hoja por cada vacuna
      for (const vacuna of vacunas) {
        const worksheet = workbook.addWorksheet(vacuna.nombre.substring(0, 31)); // Excel limita a 31 caracteres

        // Configurar columnas
        worksheet.columns = [
          { header: 'Establecimiento ID', key: 'establecimientoId', width: 40 },
          { header: 'Establecimiento', key: 'establecimiento', width: 30 },
          { header: 'Tipo', key: 'tipo', width: 15 },
          { header: 'Centro Acopio', key: 'centroAcopio', width: 25 },
          { header: 'Mes', key: 'mes', width: 10 },
          { header: 'Año', key: 'anio', width: 10 },
          { header: 'Trans. Ingreso', key: 'transIngreso', width: 15 },
          { header: 'Salida', key: 'salida', width: 15 },
          { header: 'Trans. Salida', key: 'transSalida', width: 15 },
          { header: 'Observaciones', key: 'observaciones', width: 30 }
        ];

        // Estilo del encabezado
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '366092' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Agregar filas de datos para cada establecimiento y mes
        let rowIndex = 2;
        for (const establecimiento of establecimientos) {
          for (let mes = 1; mes <= 12; mes++) {
            const row = worksheet.addRow({
              establecimientoId: establecimiento.id,
              establecimiento: establecimiento.nombre,
              tipo: establecimiento.tipo.replace('_', ' ').toUpperCase(),
              centroAcopio: establecimiento.centroAcopio?.nombre || '',
              mes: mes,
              anio: anio,
              transIngreso: 0,
              salida: 0,
              transSalida: 0,
              observaciones: ''
            });

            // Alternar colores de fila
            if (rowIndex % 2 === 0) {
              row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F8F9FA' }
              };
            }

            rowIndex++;
          }
        }

        // Agregar bordes a todas las celdas
        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      }

      return {
        success: true,
        data: workbook
      };

    } catch (error) {
      console.error('Error al generar plantilla masiva:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar plantilla masiva'
      };
    }
  }

  /**
   * Validar y limpiar UUID de establecimiento
   */
  private static validarUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;

    // Limpiar espacios y caracteres extraños
    const cleanUuid = uuid.trim();

    // Verificar longitud exacta
    if (cleanUuid.length !== 36) return false;

    // Verificar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(cleanUuid);
  }

  /**
   * Importar movimientos desde archivo Excel por vacuna específica
   * Nota: El saldo anterior NO se importa ya que se calcula automáticamente por el sistema
   */
  static async importarDesdeExcelVacuna(
    vacunaId: string,
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{ creadas: number; actualizadas: number; errores: string[] }>> {
    try {
      // Validar parámetros
      if (!vacunaId) {
        return {
          success: false,
          error: 'ID de vacuna requerido'
        };
      }

      if (!anio || anio < 2020 || anio > 2050) {
        return {
          success: false,
          error: 'Año debe estar entre 2020 y 2050'
        };
      }

      // Verificar que la vacuna existe
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId }
      });

      if (!vacuna) {
        return {
          success: false,
          error: 'Vacuna no encontrada'
        };
      }

      // Leer archivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        return {
          success: false,
          error: 'No se encontraron hojas de trabajo en el archivo Excel'
        };
      }

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        return {
          success: false,
          error: 'No se pudo acceder a la hoja de trabajo'
        };
      }

      const errores: string[] = [];
      let creadas = 0;
      let actualizadas = 0;

      // Procesar filas en lotes para evitar timeouts
      const batchSize = 100; // Procesar de 100 en 100
      const totalRows = worksheet.rowCount;

      console.log(`Procesando ${totalRows - 1} filas en lotes de ${batchSize}`);

      for (let startRow = 2; startRow <= totalRows; startRow += batchSize) {
        const endRow = Math.min(startRow + batchSize - 1, totalRows);
        console.log(`Procesando lote: filas ${startRow} a ${endRow}`);

        // Procesar lote actual
        for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
          const row = worksheet.getRow(rowNumber);

          try {
          // Extraer datos de la fila
          const rawEstablecimientoId = row.getCell(1).value;
          const establecimientoId = rawEstablecimientoId?.toString().trim();
          const mes = parseInt(row.getCell(5).value?.toString() || '0');
          const anioExcel = parseInt(row.getCell(6).value?.toString() || '0');
          const transIngreso = parseInt(row.getCell(7).value?.toString() || '0');
          const salida = parseInt(row.getCell(8).value?.toString() || '0');
          const transSalida = parseInt(row.getCell(9).value?.toString() || '0');
          const observaciones = row.getCell(10).value?.toString() || '';

          // Log para debugging
          console.log(`Fila ${rowNumber} - Raw: "${rawEstablecimientoId}", EstablecimientoId: "${establecimientoId}", Mes: ${mes}, Año: ${anioExcel}`);

          // Saltar filas vacías o con datos inválidos
          if (!establecimientoId || establecimientoId === '' || establecimientoId === 'undefined' || establecimientoId === 'null') {
            console.log(`Saltando fila ${rowNumber}: establecimientoId vacío o inválido`);
            continue;
          }

          // Validaciones básicas
          if (!establecimientoId) {
            errores.push(`Fila ${rowNumber}: ID de establecimiento requerido`);
            continue;
          }

          // Validar formato UUID usando método dedicado
          if (!this.validarUUID(establecimientoId)) {
            errores.push(`Fila ${rowNumber}: ID de establecimiento "${establecimientoId}" no es un UUID válido. Debe tener formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (longitud: ${establecimientoId.length})`);
            console.log(`UUID inválido en fila ${rowNumber}: "${establecimientoId}" (tipo: ${typeof establecimientoId}, longitud: ${establecimientoId.length})`);
            continue;
          }

          if (mes < 1 || mes > 12) {
            errores.push(`Fila ${rowNumber}: Mes debe estar entre 1 y 12`);
            continue;
          }

          if (anioExcel !== anio) {
            errores.push(`Fila ${rowNumber}: Año debe ser ${anio}`);
            continue;
          }

          // Verificar que el establecimiento existe
          let establecimiento;
          try {
            establecimiento = await prisma.establecimiento.findUnique({
              where: { id: establecimientoId }
            });
          } catch (error) {
            errores.push(`Fila ${rowNumber}: Error al buscar establecimiento "${establecimientoId}": ${error instanceof Error ? error.message : 'Error desconocido'}`);
            continue;
          }

          if (!establecimiento) {
            errores.push(`Fila ${rowNumber}: Establecimiento con ID "${establecimientoId}" no encontrado en la base de datos`);
            continue;
          }

          // Buscar movimiento existente
          const movimientoExistente = await prisma.movimientoVacuna.findUnique({
            where: {
              uk_movimiento_establecimiento_vacuna_mes_anio: {
                establecimientoId,
                vacunaId,
                mes,
                anio
              }
            }
          });

          // Operaciones de base de datos con manejo de errores específico
          try {
            if (movimientoExistente) {
              // Actualizar movimiento existente
              await prisma.movimientoVacuna.update({
                where: { id: movimientoExistente.id },
                data: {
                  transIngreso,
                  salida,
                  transSalida,
                  observaciones: observaciones || null,
                  updatedAt: new Date()
                }
              });
              actualizadas++;
              console.log(`Fila ${rowNumber}: Movimiento actualizado exitosamente`);
            } else {
              // Crear nuevo movimiento
              console.log(`Fila ${rowNumber}: Creando movimiento con establecimientoId: "${establecimientoId}", vacunaId: "${vacunaId}"`);
              await prisma.movimientoVacuna.create({
                data: {
                  establecimientoId,
                  vacunaId,
                  mes,
                  anio,
                  transIngreso,
                  salida,
                  transSalida,
                  observaciones: observaciones || null,
                  usuarioId: 'system-import', // TODO: Obtener del contexto de usuario
                  fechaMovimiento: new Date()
                }
              });
              creadas++;
              console.log(`Fila ${rowNumber}: Movimiento creado exitosamente`);
            }
          } catch (dbError) {
            const errorMsg = `Fila ${rowNumber}: Error de base de datos - ${dbError instanceof Error ? dbError.message : 'Error desconocido'}`;
            console.error(errorMsg);
            console.error(`Datos problemáticos: establecimientoId="${establecimientoId}", vacunaId="${vacunaId}", mes=${mes}, anio=${anio}`);
            errores.push(errorMsg);
            continue;
          }

        } catch (error) {
          errores.push(`Fila ${rowNumber}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
      }

      return {
        success: true,
        data: {
          creadas,
          actualizadas,
          errores
        }
      };

    } catch (error) {
      console.error('Error al importar desde Excel por vacuna:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al importar desde Excel'
      };
    }
  }

  /**
   * Importar movimientos masivos desde archivo Excel (múltiples hojas)
   * Nota: El saldo anterior NO se importa ya que se calcula automáticamente por el sistema
   */
  static async importarDesdeExcelMasivo(
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: {
      vacuna: string;
      vacunaId: string;
      errores: string[];
      erroresDetallados: {
        fila: number;
        establecimientoId: string;
        establecimientoNombre: string;
        mes: number;
        error: string;
        tipoError: 'UUID_INVALIDO' | 'ESTABLECIMIENTO_NO_ENCONTRADO' | 'MES_INVALIDO' | 'ANIO_INVALIDO' | 'ERROR_BD' | 'DATOS_FALTANTES';
        datosOriginales: any;
      }[];
    }[];
    vacunasProcesadas: number;
    reporteErrores?: any;
  }>> {
    try {
      // Validar parámetros
      if (!anio || anio < 2020 || anio > 2050) {
        return {
          success: false,
          error: 'Año debe estar entre 2020 y 2050'
        };
      }

      // Leer archivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        return {
          success: false,
          error: 'No se encontraron hojas de trabajo en el archivo Excel'
        };
      }

      // Obtener todas las vacunas para mapear nombres a IDs
      const vacunas = await prisma.vacuna.findMany({
        where: { estado: 'activo' }
      });

      const vacunaMap = new Map(vacunas.map(v => [v.nombre, v.id]));

      let totalCreadas = 0;
      let totalActualizadas = 0;
      const erroresPorVacuna: {
        vacuna: string;
        vacunaId: string;
        errores: string[];
        erroresDetallados: {
          fila: number;
          establecimientoId: string;
          establecimientoNombre: string;
          mes: number;
          error: string;
          tipoError: 'UUID_INVALIDO' | 'ESTABLECIMIENTO_NO_ENCONTRADO' | 'MES_INVALIDO' | 'ANIO_INVALIDO' | 'ERROR_BD' | 'DATOS_FALTANTES';
          datosOriginales: any;
        }[];
      }[] = [];
      let vacunasProcesadas = 0;

      // Procesar cada hoja de trabajo (una por vacuna)
      for (const worksheet of workbook.worksheets) {
        const nombreVacuna = worksheet.name;
        const erroresVacuna: string[] = [];
        const erroresDetallados: {
          fila: number;
          establecimientoId: string;
          establecimientoNombre: string;
          mes: number;
          error: string;
          tipoError: 'UUID_INVALIDO' | 'ESTABLECIMIENTO_NO_ENCONTRADO' | 'MES_INVALIDO' | 'ANIO_INVALIDO' | 'ERROR_BD' | 'DATOS_FALTANTES';
          datosOriginales: any;
        }[] = [];

        try {
          // Buscar ID de vacuna por nombre
          const vacunaId = vacunaMap.get(nombreVacuna);
          if (!vacunaId) {
            erroresVacuna.push(`Vacuna "${nombreVacuna}" no encontrada en el sistema`);
            erroresPorVacuna.push({
              vacuna: nombreVacuna,
              vacunaId: '',
              errores: erroresVacuna,
              erroresDetallados: []
            });
            continue;
          }

          let creadasVacuna = 0;
          let actualizadasVacuna = 0;

          // Procesar filas en lotes para evitar timeouts
          const batchSize = 50; // Lotes más pequeños para importación masiva
          const totalRows = worksheet.rowCount;

          console.log(`Procesando vacuna ${nombreVacuna}: ${totalRows - 1} filas en lotes de ${batchSize}`);

          for (let startRow = 2; startRow <= totalRows; startRow += batchSize) {
            const endRow = Math.min(startRow + batchSize - 1, totalRows);

            // Procesar lote actual
            for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
              const row = worksheet.getRow(rowNumber);

              try {
              // Extraer datos de la fila
              const rawEstablecimientoId = row.getCell(1).value;
              const establecimientoId = rawEstablecimientoId?.toString().trim();
              const mes = parseInt(row.getCell(5).value?.toString() || '0');
              const anioExcel = parseInt(row.getCell(6).value?.toString() || '0');
              const transIngreso = parseInt(row.getCell(7).value?.toString() || '0');
              const salida = parseInt(row.getCell(8).value?.toString() || '0');
              const transSalida = parseInt(row.getCell(9).value?.toString() || '0');
              const observaciones = row.getCell(10).value?.toString() || '';

              // Log para debugging
              if (rowNumber <= 3) {
                console.log(`Vacuna ${nombreVacuna}, Fila ${rowNumber} - Raw: "${rawEstablecimientoId}", EstablecimientoId: "${establecimientoId}"`);
              }

              // Saltar filas vacías o con datos inválidos
              if (!establecimientoId || establecimientoId === '' || establecimientoId === 'undefined' || establecimientoId === 'null') {
                console.log(`Saltando fila ${rowNumber} en vacuna ${nombreVacuna}: establecimientoId vacío o inválido`);
                erroresDetallados.push({
                  fila: rowNumber,
                  establecimientoId: establecimientoId || 'VACIO',
                  establecimientoNombre: 'N/A',
                  mes: mes,
                  error: 'ID de establecimiento vacío o inválido',
                  tipoError: 'DATOS_FALTANTES',
                  datosOriginales: {
                    rawEstablecimientoId,
                    mes,
                    anioExcel,
                    transIngreso,
                    salida,
                    transSalida
                  }
                });
                continue;
              }

              // Validaciones básicas
              if (!establecimientoId) {
                const errorMsg = `Fila ${rowNumber}: ID de establecimiento requerido`;
                erroresVacuna.push(errorMsg);
                erroresDetallados.push({
                  fila: rowNumber,
                  establecimientoId: establecimientoId || 'VACIO',
                  establecimientoNombre: 'N/A',
                  mes: mes,
                  error: errorMsg,
                  tipoError: 'DATOS_FALTANTES',
                  datosOriginales: { rawEstablecimientoId, mes, anioExcel }
                });
                continue;
              }

              // Validar formato UUID usando método dedicado
              if (!this.validarUUID(establecimientoId)) {
                const errorMsg = `ID de establecimiento "${establecimientoId}" no es un UUID válido. Debe tener formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (longitud: ${establecimientoId.length})`;
                erroresVacuna.push(`Fila ${rowNumber}: ${errorMsg}`);
                erroresDetallados.push({
                  fila: rowNumber,
                  establecimientoId: establecimientoId,
                  establecimientoNombre: 'N/A',
                  mes: mes,
                  error: errorMsg,
                  tipoError: 'UUID_INVALIDO',
                  datosOriginales: { rawEstablecimientoId, establecimientoId, mes, anioExcel }
                });
                console.log(`UUID inválido en vacuna ${nombreVacuna}, fila ${rowNumber}: "${establecimientoId}" (tipo: ${typeof establecimientoId}, longitud: ${establecimientoId.length})`);
                continue;
              }

              if (mes < 1 || mes > 12) {
                const errorMsg = `Mes debe estar entre 1 y 12, encontrado: ${mes}`;
                erroresVacuna.push(`Fila ${rowNumber}: ${errorMsg}`);
                erroresDetallados.push({
                  fila: rowNumber,
                  establecimientoId: establecimientoId,
                  establecimientoNombre: 'N/A',
                  mes: mes,
                  error: errorMsg,
                  tipoError: 'MES_INVALIDO',
                  datosOriginales: { mes, anioExcel, transIngreso, salida, transSalida }
                });
                continue;
              }

              if (anioExcel !== anio) {
                const errorMsg = `Año debe ser ${anio}, encontrado: ${anioExcel}`;
                erroresVacuna.push(`Fila ${rowNumber}: ${errorMsg}`);
                erroresDetallados.push({
                  fila: rowNumber,
                  establecimientoId: establecimientoId,
                  establecimientoNombre: 'N/A',
                  mes: mes,
                  error: errorMsg,
                  tipoError: 'ANIO_INVALIDO',
                  datosOriginales: { mes, anioExcel, transIngreso, salida, transSalida }
                });
                continue;
              }

              // Verificar que el establecimiento existe
              let establecimiento;
              try {
                establecimiento = await prisma.establecimiento.findUnique({
                  where: { id: establecimientoId },
                  select: {
                    id: true,
                    nombre: true,
                    tipo: true
                  }
                });
              } catch (error) {
                const errorMsg = `Error al buscar establecimiento "${establecimientoId}": ${error instanceof Error ? error.message : 'Error desconocido'}`;
                erroresVacuna.push(`Fila ${rowNumber}: ${errorMsg}`);
                erroresDetallados.push({
                  fila: rowNumber,
                  establecimientoId: establecimientoId,
                  establecimientoNombre: 'N/A',
                  mes: mes,
                  error: errorMsg,
                  tipoError: 'ERROR_BD',
                  datosOriginales: { establecimientoId, mes, anioExcel }
                });
                continue;
              }

              if (!establecimiento) {
                const errorMsg = `Establecimiento con ID "${establecimientoId}" no encontrado en la base de datos`;
                erroresVacuna.push(`Fila ${rowNumber}: ${errorMsg}`);
                erroresDetallados.push({
                  fila: rowNumber,
                  establecimientoId: establecimientoId,
                  establecimientoNombre: 'NO ENCONTRADO',
                  mes: mes,
                  error: errorMsg,
                  tipoError: 'ESTABLECIMIENTO_NO_ENCONTRADO',
                  datosOriginales: { establecimientoId, mes, anioExcel, transIngreso, salida, transSalida }
                });
                continue;
              }

              // Buscar movimiento existente
              const movimientoExistente = await prisma.movimientoVacuna.findUnique({
                where: {
                  uk_movimiento_establecimiento_vacuna_mes_anio: {
                    establecimientoId,
                    vacunaId,
                    mes,
                    anio
                  }
                }
              });

              // Operaciones de base de datos con manejo de errores específico
              try {
                if (movimientoExistente) {
                  // Actualizar movimiento existente
                  await prisma.movimientoVacuna.update({
                    where: { id: movimientoExistente.id },
                    data: {
                      transIngreso,
                      salida,
                      transSalida,
                      observaciones: observaciones || null,
                      updatedAt: new Date()
                    }
                  });
                  actualizadasVacuna++;
                } else {
                  // Crear nuevo movimiento
                  console.log(`Vacuna ${nombreVacuna}, Fila ${rowNumber}: Creando movimiento con establecimientoId: "${establecimientoId}"`);
                  await prisma.movimientoVacuna.create({
                    data: {
                      establecimientoId,
                      vacunaId,
                      mes,
                      anio,
                      transIngreso,
                      salida,
                      transSalida,
                      observaciones: observaciones || null,
                      usuarioId: 'system-import', // TODO: Obtener del contexto de usuario
                      fechaMovimiento: new Date()
                    }
                  });
                  creadasVacuna++;
                }
              } catch (dbError) {
                const errorMsg = `Error de base de datos - ${dbError instanceof Error ? dbError.message : 'Error desconocido'}`;
                console.error(`Vacuna ${nombreVacuna}, Fila ${rowNumber}: ${errorMsg}`);
                console.error(`Datos problemáticos: establecimientoId="${establecimientoId}", vacunaId="${vacunaId}"`);
                erroresVacuna.push(`Fila ${rowNumber}: ${errorMsg}`);
                erroresDetallados.push({
                  fila: rowNumber,
                  establecimientoId: establecimientoId,
                  establecimientoNombre: establecimiento?.nombre || 'N/A',
                  mes: mes,
                  error: errorMsg,
                  tipoError: 'ERROR_BD',
                  datosOriginales: {
                    establecimientoId,
                    vacunaId,
                    mes,
                    anio,
                    transIngreso,
                    salida,
                    transSalida,
                    observaciones
                  }
                });
                continue;
              }

            } catch (error) {
              erroresVacuna.push(`Fila ${rowNumber}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }
          }

          totalCreadas += creadasVacuna;
          totalActualizadas += actualizadasVacuna;
          vacunasProcesadas++;

          // Solo agregar errores si los hay
          if (erroresVacuna.length > 0 || erroresDetallados.length > 0) {
            erroresPorVacuna.push({
              vacuna: nombreVacuna,
              vacunaId: vacunaId || '',
              errores: erroresVacuna,
              erroresDetallados: erroresDetallados
            });
          }

        } catch (error) {
          erroresVacuna.push(`Error general en vacuna: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          erroresPorVacuna.push({
            vacuna: nombreVacuna,
            vacunaId: '',
            errores: erroresVacuna,
            erroresDetallados: []
          });
        }
      }

      return {
        success: true,
        data: {
          totalCreadas,
          totalActualizadas,
          erroresPorVacuna,
          vacunasProcesadas
        }
      };

    } catch (error) {
      console.error('Error al importar masivamente desde Excel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al importar masivamente desde Excel'
      };
    }
  }

  /**
   * Validar plantilla Excel antes de importar
   */
  static async validarPlantillaExcel(
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{
    valida: boolean;
    errores: string[];
    advertencias: string[];
    estadisticas: {
      totalFilas: number;
      filasConDatos: number;
      establecimientosUnicos: number;
      vacunasEncontradas: number;
    };
  }>> {
    try {
      // Validar parámetros
      if (!anio || anio < 2020 || anio > 2050) {
        return {
          success: false,
          error: 'Año debe estar entre 2020 y 2050'
        };
      }

      // Leer archivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        return {
          success: false,
          error: 'No se encontraron hojas de trabajo en el archivo Excel'
        };
      }

      const errores: string[] = [];
      const advertencias: string[] = [];
      let totalFilas = 0;
      let filasConDatos = 0;
      const establecimientosUnicos = new Set<string>();
      const vacunasEncontradas = new Set<string>();

      // Validar cada hoja de trabajo
      for (const worksheet of workbook.worksheets) {
        const nombreVacuna = worksheet.name;
        vacunasEncontradas.add(nombreVacuna);

        // Validar estructura de columnas
        const headerRow = worksheet.getRow(1);
        const expectedHeaders = [
          'Establecimiento ID',
          'Establecimiento',
          'Tipo',
          'Centro Acopio',
          'Mes',
          'Año',
          'Trans. Ingreso',
          'Salida',
          'Trans. Salida',
          'Observaciones'
        ];

        for (let i = 0; i < expectedHeaders.length; i++) {
          const cellValue = headerRow.getCell(i + 1).value?.toString();
          if (cellValue !== expectedHeaders[i]) {
            errores.push(`Hoja "${nombreVacuna}": Columna ${i + 1} debe ser "${expectedHeaders[i]}", encontrado "${cellValue}"`);
          }
        }

        // Validar datos
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
          const row = worksheet.getRow(rowNumber);
          totalFilas++;

          const establecimientoId = row.getCell(1).value?.toString().trim();
          const mes = row.getCell(5).value?.toString();
          const anioExcel = row.getCell(6).value?.toString();

          if (establecimientoId) {
            filasConDatos++;
            establecimientosUnicos.add(establecimientoId);

            // Validar UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(establecimientoId)) {
              errores.push(`Hoja "${nombreVacuna}", Fila ${rowNumber}: ID de establecimiento inválido`);
            }

            // Validar mes
            const mesNum = parseInt(mes || '0');
            if (mesNum < 1 || mesNum > 12) {
              errores.push(`Hoja "${nombreVacuna}", Fila ${rowNumber}: Mes debe estar entre 1 y 12`);
            }

            // Validar año
            const anioNum = parseInt(anioExcel || '0');
            if (anioNum !== anio) {
              errores.push(`Hoja "${nombreVacuna}", Fila ${rowNumber}: Año debe ser ${anio}`);
            }
          }
        }
      }

      const valida = errores.length === 0;

      if (filasConDatos === 0) {
        advertencias.push('No se encontraron filas con datos para procesar');
      }

      return {
        success: true,
        data: {
          valida,
          errores,
          advertencias,
          estadisticas: {
            totalFilas,
            filasConDatos,
            establecimientosUnicos: establecimientosUnicos.size,
            vacunasEncontradas: vacunasEncontradas.size
          }
        }
      };

    } catch (error) {
      console.error('Error al validar plantilla Excel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al validar plantilla Excel'
      };
    }
  }

  /**
   * Debug plantilla Excel - mostrar primeras filas para identificar problemas
   */
  static async debugPlantillaExcel(buffer: Buffer): Promise<ServiceResult<any>> {
    try {
      // Leer archivo Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        return {
          success: false,
          error: 'No se encontraron hojas de trabajo en el archivo Excel'
        };
      }

      const debug: any = {
        totalHojas: workbook.worksheets.length,
        hojas: []
      };

      // Analizar cada hoja
      for (const worksheet of workbook.worksheets) {
        const hojaDebug: any = {
          nombre: worksheet.name,
          totalFilas: worksheet.rowCount,
          primeras5Filas: []
        };

        // Obtener las primeras 5 filas con datos
        for (let rowNumber = 1; rowNumber <= Math.min(6, worksheet.rowCount); rowNumber++) {
          const row = worksheet.getRow(rowNumber);
          const filaData: any = {
            numero: rowNumber,
            celdas: []
          };

          // Obtener las primeras 11 columnas
          for (let colNumber = 1; colNumber <= 11; colNumber++) {
            const cell = row.getCell(colNumber);
            filaData.celdas.push({
              columna: colNumber,
              valor: cell.value,
              tipo: typeof cell.value,
              texto: cell.value?.toString(),
              longitud: cell.value?.toString().length || 0
            });
          }

          hojaDebug.primeras5Filas.push(filaData);
        }

        debug.hojas.push(hojaDebug);
      }

      return {
        success: true,
        data: debug
      };

    } catch (error) {
      console.error('Error al hacer debug de plantilla Excel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al hacer debug de plantilla Excel'
      };
    }
  }

  /**
   * Generar reporte de errores en Excel
   */
  static async generarReporteErrores(
    erroresPorVacuna: {
      vacuna: string;
      vacunaId: string;
      errores: string[];
      erroresDetallados: {
        fila: number;
        establecimientoId: string;
        establecimientoNombre: string;
        mes: number;
        error: string;
        tipoError: string;
        datosOriginales: any;
      }[];
    }[]
  ): Promise<ServiceResult<ExcelJS.Workbook>> {
    try {
      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunas';
      workbook.created = new Date();

      // Crear hoja de resumen
      const resumenSheet = workbook.addWorksheet('Resumen de Errores');

      // Configurar columnas del resumen
      resumenSheet.columns = [
        { header: 'Vacuna', key: 'vacuna', width: 25 },
        { header: 'ID Vacuna', key: 'vacunaId', width: 40 },
        { header: 'Total Errores', key: 'totalErrores', width: 15 },
        { header: 'UUID Inválidos', key: 'uuidInvalidos', width: 15 },
        { header: 'Establecimientos No Encontrados', key: 'establecimientosNoEncontrados', width: 30 },
        { header: 'Errores de Mes', key: 'erroresMes', width: 15 },
        { header: 'Errores de Año', key: 'erroresAnio', width: 15 },
        { header: 'Errores de BD', key: 'erroresBD', width: 15 },
        { header: 'Datos Faltantes', key: 'datosFaltantes', width: 15 }
      ];

      // Estilo del encabezado
      const headerRow = resumenSheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D32F2F' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Agregar datos del resumen
      let rowIndex = 2;
      for (const vacunaError of erroresPorVacuna) {
        const conteoErrores = {
          UUID_INVALIDO: 0,
          ESTABLECIMIENTO_NO_ENCONTRADO: 0,
          MES_INVALIDO: 0,
          ANIO_INVALIDO: 0,
          ERROR_BD: 0,
          DATOS_FALTANTES: 0
        };

        // Contar tipos de errores
        vacunaError.erroresDetallados.forEach(error => {
          if (conteoErrores.hasOwnProperty(error.tipoError)) {
            conteoErrores[error.tipoError as keyof typeof conteoErrores]++;
          }
        });

        resumenSheet.addRow({
          vacuna: vacunaError.vacuna,
          vacunaId: vacunaError.vacunaId,
          totalErrores: vacunaError.erroresDetallados.length,
          uuidInvalidos: conteoErrores.UUID_INVALIDO,
          establecimientosNoEncontrados: conteoErrores.ESTABLECIMIENTO_NO_ENCONTRADO,
          erroresMes: conteoErrores.MES_INVALIDO,
          erroresAnio: conteoErrores.ANIO_INVALIDO,
          erroresBD: conteoErrores.ERROR_BD,
          datosFaltantes: conteoErrores.DATOS_FALTANTES
        });

        rowIndex++;
      }

      // Crear hoja detallada de errores
      const detalleSheet = workbook.addWorksheet('Errores Detallados');

      // Configurar columnas del detalle
      detalleSheet.columns = [
        { header: 'Vacuna', key: 'vacuna', width: 25 },
        { header: 'Fila Excel', key: 'fila', width: 10 },
        { header: 'Establecimiento ID', key: 'establecimientoId', width: 40 },
        { header: 'Establecimiento Nombre', key: 'establecimientoNombre', width: 30 },
        { header: 'Mes', key: 'mes', width: 10 },
        { header: 'Tipo Error', key: 'tipoError', width: 25 },
        { header: 'Descripción Error', key: 'error', width: 50 },
        { header: 'Trans. Ingreso', key: 'transIngreso', width: 15 },
        { header: 'Salida', key: 'salida', width: 15 },
        { header: 'Trans. Salida', key: 'transSalida', width: 15 }
      ];

      // Estilo del encabezado detalle
      const headerRowDetalle = detalleSheet.getRow(1);
      headerRowDetalle.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRowDetalle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5722' }
      };
      headerRowDetalle.alignment = { horizontal: 'center', vertical: 'middle' };

      // Agregar datos detallados
      for (const vacunaError of erroresPorVacuna) {
        for (const errorDetalle of vacunaError.erroresDetallados) {
          const row = detalleSheet.addRow({
            vacuna: vacunaError.vacuna,
            fila: errorDetalle.fila,
            establecimientoId: errorDetalle.establecimientoId,
            establecimientoNombre: errorDetalle.establecimientoNombre,
            mes: errorDetalle.mes,
            tipoError: errorDetalle.tipoError,
            error: errorDetalle.error,
            transIngreso: errorDetalle.datosOriginales?.transIngreso || '',
            salida: errorDetalle.datosOriginales?.salida || '',
            transSalida: errorDetalle.datosOriginales?.transSalida || ''
          });

          // Colorear filas según tipo de error
          const fillColor = this.getErrorColor(errorDetalle.tipoError);
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor }
          };
        }
      }

      // Agregar bordes a todas las celdas
      [resumenSheet, detalleSheet].forEach(sheet => {
        sheet.eachRow((row) => {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      });

      return {
        success: true,
        data: workbook
      };

    } catch (error) {
      console.error('Error al generar reporte de errores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de errores'
      };
    }
  }

  /**
   * Obtener color para tipo de error
   */
  private static getErrorColor(tipoError: string): string {
    const colores = {
      'UUID_INVALIDO': 'FFCDD2',
      'ESTABLECIMIENTO_NO_ENCONTRADO': 'FFE0B2',
      'MES_INVALIDO': 'F3E5F5',
      'ANIO_INVALIDO': 'E1F5FE',
      'ERROR_BD': 'FFEBEE',
      'DATOS_FALTANTES': 'F9FBE7'
    };
    return colores[tipoError as keyof typeof colores] || 'FFFFFF';
  }
}
