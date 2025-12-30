import { prisma } from '@/config/database';
import {
  ServiceResult,
  IPlanificacionAnual,
  CreatePlanificacionDto,
  UpdatePlanificacionDto,
  PlanificacionFilters,
  PlanificacionConRelaciones,
  EstadisticasPlanificacion,
  ImportarPlanificacionDto,
  DistribucionAutomaticaDto,
  EstadoPlanificacion
} from '@/types';
import { HttpError } from '@/middleware/errorHandler';
import { MovimientosService } from './MovimientosService';
import ExcelJS from 'exceljs';
import {
  ordenarEstablecimientos,
  getCentroAcopioPorNombre,
  getColoresCentroAcopioExcel
} from '@/utils/centroAcopioUtils';

/**
 * Función helper para crear errores consistentes
 */
const createError = (message: string, statusCode: number = 500): HttpError => {
  return new HttpError(message, statusCode);
};

/**
 * Servicio para gestión de planificación anual de vacunas
 */
export class PlanificacionService {
  /**
   * Obtener todas las planificaciones con filtros opcionales
   */
  static async getAll(filters?: PlanificacionFilters): Promise<ServiceResult<{ 
    planificaciones: PlanificacionConRelaciones[]; 
    total: number 
  }>> {
    try {
      const {
        establecimientoId,
        vacunaId,
        anio,
        estado,
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

      if (anio) {
        where.anio = anio;
      }

      if (estado && estado !== 'todos') {
        where.estado = estado;
      }

      // Filtro por centro de acopio
      if (centroAcopioId) {
        where.establecimiento = {
          centroAcopioId: centroAcopioId
        };
      }

      // Búsqueda por texto
      if (search) {
        where.OR = [
          {
            establecimiento: {
              nombre: { contains: search, mode: 'insensitive' }
            }
          },
          {
            vacuna: {
              nombre: { contains: search, mode: 'insensitive' }
            }
          }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener planificaciones con relaciones
      const [planificaciones, total] = await Promise.all([
        prisma.planificacionAnual.findMany({
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
            }
          },
          orderBy: [
            { anio: 'desc' },
            { establecimiento: { nombre: 'asc' } },
            { vacuna: { nombre: 'asc' } }
          ],
          skip: offset,
          take: limit
        }),
        prisma.planificacionAnual.count({ where })
      ]);

      // Agregar información del centro de acopio si es necesario
      const planificacionesConCentro = await Promise.all(
        planificaciones.map(async (planificacion) => {
          let centroAcopio = null;
          
          if (planificacion.establecimiento.centroAcopioId) {
            centroAcopio = await prisma.establecimiento.findUnique({
              where: { id: planificacion.establecimiento.centroAcopioId },
              select: { id: true, nombre: true }
            });
          }

          return {
            ...planificacion,
            centroAcopio
          } as PlanificacionConRelaciones;
        })
      );

      return {
        success: true,
        data: {
          planificaciones: planificacionesConCentro,
          total
        }
      };
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error('Error al obtener planificaciones:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Obtener planificación por ID
   */
  static async getById(id: string): Promise<ServiceResult<PlanificacionConRelaciones>> {
    try {
      const planificacion = await prisma.planificacionAnual.findUnique({
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
          }
        }
      });

      if (!planificacion) {
        return {
          success: false,
          error: 'Planificación no encontrada'
        };
      }

      // Obtener información del centro de acopio si existe
      let centroAcopio = null;
      if (planificacion.establecimiento.centroAcopioId) {
        centroAcopio = await prisma.establecimiento.findUnique({
          where: { id: planificacion.establecimiento.centroAcopioId },
          select: { id: true, nombre: true }
        });
      }

      return {
        success: true,
        data: {
          ...planificacion,
          centroAcopio
        } as PlanificacionConRelaciones
      };
    } catch (error) {
      console.error('Error al obtener planificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener planificación'
      };
    }
  }

  /**
   * Crear nueva planificación
   */
  static async create(data: CreatePlanificacionDto, usuarioId?: string): Promise<ServiceResult<IPlanificacionAnual>> {
    try {
      // Validaciones de negocio
      await this.validatePlanificacionData(data);

      const planificacion = await prisma.planificacionAnual.create({
        data: {
          establecimientoId: data.establecimientoId,
          vacunaId: data.vacunaId,
          anio: data.anio,
          metaAnual: data.metaAnual,
          distribucionMensual: data.distribucionMensual,
          estado: data.estado || 'borrador'
        }
      });

      // FUNCIONALIDAD CLAVE: Generar automáticamente movimientos de vacunas
      if (usuarioId) {
        try {
          const resultMovimientos = await MovimientosService.generarMovimientosDesdeplanificacion(
            planificacion.id,
            usuarioId
          );

          if (resultMovimientos.success) {
            console.log(`Movimientos generados automáticamente: ${resultMovimientos.data?.creados} creados, ${resultMovimientos.data?.actualizados} actualizados`);
          } else {
            console.warn('Error al generar movimientos automáticamente:', resultMovimientos.error);
          }
        } catch (error) {
          console.warn('Error al generar movimientos automáticamente:', error);
          // No interrumpir el flujo principal si falla la generación de movimientos
        }
      }

      return {
        success: true,
        data: planificacion
      };
    } catch (error) {
      console.error('Error al crear planificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear planificación'
      };
    }
  }

  /**
   * Actualizar planificación
   */
  static async update(id: string, data: UpdatePlanificacionDto, usuarioId?: string): Promise<ServiceResult<IPlanificacionAnual>> {
    try {
      // Verificar que la planificación existe
      const existingPlanificacion = await prisma.planificacionAnual.findUnique({
        where: { id }
      });

      if (!existingPlanificacion) {
        return {
          success: false,
          error: 'Planificación no encontrada'
        };
      }

      // Validar datos si se están actualizando
      if (data.distribucionMensual || data.metaAnual) {
        const validationData = {
          establecimientoId: existingPlanificacion.establecimientoId,
          vacunaId: existingPlanificacion.vacunaId,
          anio: existingPlanificacion.anio,
          metaAnual: data.metaAnual || existingPlanificacion.metaAnual,
          distribucionMensual: data.distribucionMensual || existingPlanificacion.distribucionMensual
        };

        await this.validatePlanificacionData(validationData, id);
      }

      // Actualizar en transacción para incluir sincronización con movimientos
      const result = await prisma.$transaction(async (tx) => {
        // Actualizar planificación
        const planificacion = await tx.planificacionAnual.update({
          where: { id },
          data: {
            ...(data.metaAnual && { metaAnual: data.metaAnual }),
            ...(data.distribucionMensual && { distribucionMensual: data.distribucionMensual }),
            ...(data.estado && { estado: data.estado }),
            updatedAt: new Date()
          }
        });

        return planificacion;
      });

      // SINCRONIZACIÓN BIDIRECCIONAL: Generar/actualizar movimientos automáticamente después de la transacción
      if (data.distribucionMensual && usuarioId) {
        try {
          const resultMovimientos = await MovimientosService.generarMovimientosDesdeplanificacion(
            result.id,
            usuarioId
          );

          if (resultMovimientos.success) {
            console.log(`Sincronización automática: ${resultMovimientos.data?.creados} movimientos creados, ${resultMovimientos.data?.actualizados} actualizados`);
          } else {
            console.warn('Error en sincronización automática:', resultMovimientos.error);
          }
        } catch (error) {
          console.warn('Error en sincronización automática:', error);
          // No interrumpir el flujo principal si falla la sincronización
        }
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error al actualizar planificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar planificación'
      };
    }
  }

  /**
   * Eliminar planificación
   */
  static async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: { id }
      });

      if (!planificacion) {
        return {
          success: false,
          error: 'Planificación no encontrada'
        };
      }

      // Verificar que se puede eliminar (solo borradores)
      if (planificacion.estado !== 'borrador') {
        return {
          success: false,
          error: 'Solo se pueden eliminar planificaciones en estado borrador'
        };
      }

      await prisma.planificacionAnual.delete({
        where: { id }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error al eliminar planificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar planificación'
      };
    }
  }

  /**
   * Validar datos de planificación
   */
  private static async validatePlanificacionData(data: CreatePlanificacionDto, excludeId?: string): Promise<void> {
    // Validar que el establecimiento existe
    const establecimiento = await prisma.establecimiento.findUnique({
      where: { id: data.establecimientoId }
    });

    if (!establecimiento) {
      throw new Error('Establecimiento no encontrado');
    }

    // Validar que la vacuna existe
    const vacuna = await prisma.vacuna.findUnique({
      where: { id: data.vacunaId }
    });

    if (!vacuna) {
      throw new Error('Vacuna no encontrada');
    }

    // Validar año
    const currentYear = new Date().getFullYear();
    if (data.anio < currentYear - 1 || data.anio > currentYear + 5) {
      throw new Error('El año debe estar entre ' + (currentYear - 1) + ' y ' + (currentYear + 5));
    }

    // Validar distribución mensual
    if (!Array.isArray(data.distribucionMensual) || data.distribucionMensual.length !== 12) {
      throw new Error('La distribución mensual debe ser un array de 12 elementos');
    }

    // Validar que todos los valores sean números positivos
    if (data.distribucionMensual.some(val => typeof val !== 'number' || val < 0)) {
      throw new Error('Todos los valores de distribución mensual deben ser números positivos');
    }

    // Validar que la suma de la distribución mensual coincida con la meta anual
    const sumaDistribucion = data.distribucionMensual.reduce((sum, val) => sum + val, 0);
    if (sumaDistribucion !== data.metaAnual) {
      throw new Error(
        `La suma de la distribución mensual (${sumaDistribucion}) debe coincidir con la meta anual (${data.metaAnual})`
      );
    }

    // Validar meta anual positiva
    if (data.metaAnual <= 0) {
      throw new Error('La meta anual debe ser mayor a 0');
    }

    // Verificar unicidad (establecimiento + vacuna + año)
    const whereClause: any = {
      establecimientoId: data.establecimientoId,
      vacunaId: data.vacunaId,
      anio: data.anio
    };

    // Si se proporciona excludeId, excluir esa planificación de la búsqueda
    if (excludeId) {
      whereClause.NOT = { id: excludeId };
    }

    const existingPlanificacion = await prisma.planificacionAnual.findFirst({
      where: whereClause
    });

    if (existingPlanificacion) {
      throw new Error('Ya existe una planificación para este establecimiento, vacuna y año');
    }
  }

  /**
   * Obtener planificaciones por vacuna y año
   */
  static async getByVacunaAndYear(vacunaId: string, anio: number, centroAcopioId?: string): Promise<ServiceResult<PlanificacionConRelaciones[]>> {
    try {
      const where: any = {
        vacunaId,
        anio
      };

      // Filtrar por centro de acopio si se especifica
      if (centroAcopioId && centroAcopioId !== 'todos') {
        where.establecimiento = {
          centroAcopioId: centroAcopioId
        };
      }

      const planificaciones = await prisma.planificacionAnual.findMany({
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
          }
        },
        orderBy: {
          establecimiento: { nombre: 'asc' }
        }
      });

      // Agregar información del centro de acopio
      const planificacionesConCentro = await Promise.all(
        planificaciones.map(async (planificacion) => {
          let centroAcopio = null;

          if (planificacion.establecimiento.centroAcopioId) {
            centroAcopio = await prisma.establecimiento.findUnique({
              where: { id: planificacion.establecimiento.centroAcopioId },
              select: { id: true, nombre: true }
            });
          }

          return {
            ...planificacion,
            centroAcopio
          } as PlanificacionConRelaciones;
        })
      );

      return {
        success: true,
        data: planificacionesConCentro
      };
    } catch (error) {
      console.error('Error al obtener planificaciones por vacuna y año:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener planificaciones'
      };
    }
  }

  /**
   * Obtener estadísticas de planificación
   */
  static async getEstadisticas(anio?: number): Promise<ServiceResult<EstadisticasPlanificacion>> {
    try {
      const currentYear = anio || new Date().getFullYear();

      const where = { anio: currentYear };

      // Obtener estadísticas básicas
      const [
        totalPlanificaciones,
        planificacionesPorEstado,
        planificaciones
      ] = await Promise.all([
        prisma.planificacionAnual.count({ where }),
        prisma.planificacionAnual.groupBy({
          by: ['estado'],
          where,
          _count: true
        }),
        prisma.planificacionAnual.findMany({
          where,
          include: {
            establecimiento: {
              select: { id: true, nombre: true }
            },
            vacuna: {
              select: { id: true, nombre: true }
            }
          }
        })
      ]);

      // Procesar estadísticas por estado
      const estadoStats = {
        borrador: 0,
        aprobado: 0,
        ejecutado: 0
      };

      planificacionesPorEstado.forEach(stat => {
        estadoStats[stat.estado] = stat._count;
      });

      // Calcular meta total anual
      const metaTotalAnual = planificaciones.reduce((sum, p) => sum + p.metaAnual, 0);

      // Calcular distribución por mes
      const distribucionPorMes = Array(12).fill(0);
      planificaciones.forEach(p => {
        p.distribucionMensual.forEach((cantidad, index) => {
          distribucionPorMes[index] += cantidad;
        });
      });

      // Vacunas más programadas
      const vacunasMap = new Map();
      planificaciones.forEach(p => {
        const key = p.vacunaId;
        if (!vacunasMap.has(key)) {
          vacunasMap.set(key, {
            vacunaId: p.vacunaId,
            vacunaNombre: p.vacuna.nombre,
            totalProgramado: 0,
            establecimientos: new Set()
          });
        }
        const vacunaData = vacunasMap.get(key);
        vacunaData.totalProgramado += p.metaAnual;
        vacunaData.establecimientos.add(p.establecimientoId);
      });

      const vacunasMasProgramadas = Array.from(vacunasMap.values())
        .map(v => ({
          ...v,
          establecimientos: v.establecimientos.size
        }))
        .sort((a, b) => b.totalProgramado - a.totalProgramado)
        .slice(0, 10);

      // Establecimientos más programados
      const establecimientosMap = new Map();
      planificaciones.forEach(p => {
        const key = p.establecimientoId;
        if (!establecimientosMap.has(key)) {
          establecimientosMap.set(key, {
            establecimientoId: p.establecimientoId,
            establecimientoNombre: p.establecimiento.nombre,
            totalProgramado: 0,
            vacunas: new Set()
          });
        }
        const estData = establecimientosMap.get(key);
        estData.totalProgramado += p.metaAnual;
        estData.vacunas.add(p.vacunaId);
      });

      const establecimientosMasProgramados = Array.from(establecimientosMap.values())
        .map(e => ({
          ...e,
          vacunas: e.vacunas.size
        }))
        .sort((a, b) => b.totalProgramado - a.totalProgramado)
        .slice(0, 10);

      return {
        success: true,
        data: {
          totalPlanificaciones,
          totalMetaAnual: metaTotalAnual,
          planificacionesPorEstado: estadoStats,
          planificacionesPorVacuna: vacunasMasProgramadas,
          planificacionesPorEstablecimiento: establecimientosMasProgramados
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de planificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
      };
    }
  }

  /**
   * Importar planificaciones desde datos estructurados
   */
  static async importarPlanificaciones(data: ImportarPlanificacionDto, usuarioId?: string): Promise<ServiceResult<{
    creadas: number;
    actualizadas: number;
    errores: string[]
  }>> {
    try {
      let creadas = 0;
      let actualizadas = 0;
      const errores: string[] = [];

      // Validar que la vacuna existe
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: data.vacunaId }
      });

      if (!vacuna) {
        return {
          success: false,
          error: 'Vacuna no encontrada'
        };
      }

      // Procesar cada registro
      for (const registro of data.registros) {
        try {
          // Validar establecimiento
          const establecimiento = await prisma.establecimiento.findUnique({
            where: { id: registro.establecimientoId }
          });

          if (!establecimiento) {
            errores.push(`Establecimiento ${registro.establecimientoId} no encontrado`);
            continue;
          }

          // Validar datos del registro

          // Validar distribución mensual
          if (!Array.isArray(registro.distribucionMensual) || registro.distribucionMensual.length !== 12) {
            errores.push(`Establecimiento ${establecimiento.nombre}: distribución mensual inválida`);
            continue;
          }

          const sumaDistribucion = registro.distribucionMensual.reduce((sum: number, val: number) => sum + val, 0);
          if (sumaDistribucion !== registro.metaAnual) {
            errores.push(`Establecimiento ${establecimiento.nombre}: suma distribución (${sumaDistribucion}) no coincide con meta (${registro.metaAnual})`);
            continue;
          }

          // Verificar si ya existe
          const existingPlanificacion = await prisma.planificacionAnual.findFirst({
            where: {
              establecimientoId: registro.establecimientoId,
              vacunaId: data.vacunaId,
              anio: data.anio
            }
          });

          if (existingPlanificacion) {
            // Actualizar existente
            await prisma.planificacionAnual.update({
              where: { id: existingPlanificacion.id },
              data: {
                metaAnual: registro.metaAnual,
                distribucionMensual: registro.distribucionMensual,
                updatedAt: new Date()
              }
            });
            actualizadas++;
          } else {
            // Crear nueva
            const nuevaPlanificacion = await prisma.planificacionAnual.create({
              data: {
                establecimientoId: registro.establecimientoId,
                vacunaId: data.vacunaId,
                anio: data.anio,
                metaAnual: registro.metaAnual,
                distribucionMensual: registro.distribucionMensual,
                estado: 'borrador'
              }
            });
            creadas++;

            // FUNCIONALIDAD CLAVE: Generar automáticamente movimientos de vacunas
            if (usuarioId) {
              try {
                const resultMovimientos = await MovimientosService.generarMovimientosDesdeplanificacion(
                  nuevaPlanificacion.id,
                  usuarioId
                );

                if (!resultMovimientos.success) {
                  console.warn(`Error al generar movimientos para planificación ${nuevaPlanificacion.id}:`, resultMovimientos.error);
                }
              } catch (error) {
                console.warn(`Error al generar movimientos para planificación ${nuevaPlanificacion.id}:`, error);
              }
            }
          }
        } catch (error) {
          errores.push(`Error procesando establecimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
      console.error('Error al importar planificaciones:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al importar planificaciones'
      };
    }
  }

  /**
   * Generar distribución automática
   */
  static async generarDistribucionAutomatica(data: DistribucionAutomaticaDto): Promise<ServiceResult<{
    distribuciones: {
      establecimientoId: string;
      establecimientoNombre: string;
      metaAnual: number;
      distribucionMensual: number[];
    }[];
  }>> {
    try {
      // Validar vacuna
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: data.vacunaId }
      });

      if (!vacuna) {
        return {
          success: false,
          error: 'Vacuna no encontrada'
        };
      }

      // Obtener establecimientos
      let establecimientos;
      if (data.establecimientosIds && data.establecimientosIds.length > 0) {
        establecimientos = await prisma.establecimiento.findMany({
          where: {
            id: { in: data.establecimientosIds },
            estado: 'activo'
          },
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        });
      } else {
        establecimientos = await prisma.establecimiento.findMany({
          where: {
            estado: 'activo'
          },
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        });
      }

      if (establecimientos.length === 0) {
        return {
          success: false,
          error: 'No se encontraron establecimientos válidos'
        };
      }

      const distribuciones = [];

      for (const establecimiento of establecimientos) {
        let metaAnual = 0;
        let distribucionMensual: number[] = [];

        // Obtener meta anual base según el tipo de establecimiento
        const metaBase = this.calcularMetaBase(establecimiento.tipo);

        switch (data.criterio) {
          case 'uniforme':
            metaAnual = metaBase;
            distribucionMensual = this.distribucionUniforme(metaAnual);
            break;

          case 'estacional':
            metaAnual = metaBase;
            distribucionMensual = this.distribucionEstacional(metaAnual, data.factorEstacionalidad || 1.2);
            break;

          case 'poblacional':
            metaAnual = await this.calcularMetaPoblacional(establecimiento.id, metaBase);
            distribucionMensual = this.distribucionUniforme(metaAnual);
            break;

          case 'historico':
            const metaHistorica = await this.calcularMetaHistorica(establecimiento.id, data.vacunaId, data.anio);
            metaAnual = metaHistorica || metaBase;
            distribucionMensual = this.distribucionUniforme(metaAnual);
            break;

          default:
            metaAnual = metaBase;
            distribucionMensual = this.distribucionUniforme(metaAnual);
        }

        // Aplicar reserva de seguridad
        if (data.reservaSeguridad && data.reservaSeguridad > 0) {
          const factor = 1 + (data.reservaSeguridad / 100);
          metaAnual = Math.round(metaAnual * factor);
          distribucionMensual = distribucionMensual.map(val => Math.round(val * factor));
        }

        // Ajustar para que la suma coincida con la meta
        const suma = distribucionMensual.reduce((sum, val) => sum + val, 0);
        if (suma !== metaAnual) {
          const diferencia = metaAnual - suma;
          if (distribucionMensual[0] !== undefined) {
            distribucionMensual[0] += diferencia; // Ajustar en enero
          }
        }

        distribuciones.push({
          establecimientoId: establecimiento.id,
          establecimientoNombre: establecimiento.nombre,
          metaAnual,
          distribucionMensual
        });
      }

      return {
        success: true,
        data: { distribuciones }
      };
    } catch (error) {
      console.error('Error al generar distribución automática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar distribución automática'
      };
    }
  }

  /**
   * Aprobar planificación
   */
  static async aprobar(id: string): Promise<ServiceResult<IPlanificacionAnual>> {
    try {
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: { id }
      });

      if (!planificacion) {
        return {
          success: false,
          error: 'Planificación no encontrada'
        };
      }

      if (planificacion.estado !== 'borrador') {
        return {
          success: false,
          error: 'Solo se pueden aprobar planificaciones en estado borrador'
        };
      }

      const planificacionAprobada = await prisma.planificacionAnual.update({
        where: { id },
        data: {
          estado: 'aprobado',
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        data: planificacionAprobada
      };
    } catch (error) {
      console.error('Error al aprobar planificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al aprobar planificación'
      };
    }
  }

  /**
   * Métodos auxiliares para distribución automática
   */
  private static calcularMetaBase(tipoEstablecimiento: string): number {
    switch (tipoEstablecimiento) {
      case 'centro_salud':
        return 500; // Meta base para centros de salud
      case 'puesto_salud':
        return 100; // Meta base para puestos de salud
      default:
        return 200; // Meta base por defecto
    }
  }

  private static distribucionUniforme(metaAnual: number): number[] {
    const mensual = Math.floor(metaAnual / 12);
    const resto = metaAnual % 12;

    const distribucion = Array(12).fill(mensual);

    // Distribuir el resto en los primeros meses
    for (let i = 0; i < resto; i++) {
      distribucion[i]++;
    }

    return distribucion;
  }

  private static distribucionEstacional(metaAnual: number, factor: number): number[] {
    // Meses de campaña: Marzo-Mayo (2,3,4) y Septiembre-Noviembre (8,9,10)
    const mesesCampana = [2, 3, 4, 8, 9, 10];
    const mesesNormales = [0, 1, 5, 6, 7, 11];

    // Calcular distribución base
    const totalFactorizado = (mesesCampana.length * factor) + mesesNormales.length;
    const unidadBase = metaAnual / totalFactorizado;

    const distribucion = Array(12).fill(0);

    // Asignar a meses de campaña
    mesesCampana.forEach(mes => {
      distribucion[mes] = Math.round(unidadBase * factor);
    });

    // Asignar a meses normales
    mesesNormales.forEach(mes => {
      distribucion[mes] = Math.round(unidadBase);
    });

    // Ajustar para que la suma coincida
    const suma = distribucion.reduce((sum, val) => sum + val, 0);
    const diferencia = metaAnual - suma;
    if (diferencia !== 0) {
      distribucion[2] += diferencia; // Ajustar en marzo
    }

    return distribucion;
  }

  private static async calcularMetaPoblacional(_establecimientoId: string, metaBase: number): Promise<number> {
    // Aquí se podría implementar lógica más compleja basada en datos poblacionales
    // Por ahora, retornamos la meta base con una variación aleatoria
    const factor = 0.8 + (Math.random() * 0.4); // Factor entre 0.8 y 1.2
    return Math.round(metaBase * factor);
  }

  private static async calcularMetaHistorica(establecimientoId: string, vacunaId: string, anio: number): Promise<number | null> {
    try {
      // Buscar planificación del año anterior
      const planificacionAnterior = await prisma.planificacionAnual.findFirst({
        where: {
          establecimientoId,
          vacunaId,
          anio: anio - 1
        }
      });

      if (planificacionAnterior) {
        // Aplicar un factor de crecimiento del 5%
        return Math.round(planificacionAnterior.metaAnual * 1.05);
      }

      // Si no hay datos históricos, buscar movimientos del año anterior
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: {
          establecimientoId,
          vacunaId,
          anio: anio - 1
        }
      });

      if (movimientos.length > 0) {
        const totalConsumo = movimientos.reduce((sum, mov) => sum + mov.salida, 0);
        return Math.round(totalConsumo * 1.1); // 10% más que el consumo anterior
      }

      return null;
    } catch (error) {
      console.error('Error al calcular meta histórica:', error);
      return null;
    }
  }

  /**
   * Generar plantilla Excel para importación por vacuna específica
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

      // Obtener todos los establecimientos (todos los tipos disponibles)
      const establecimientosRaw = await prisma.establecimiento.findMany({
        include: {
          centroAcopio: {
            select: {
              nombre: true
            }
          }
        }
      });

      // Aplicar ordenamiento profesional por centro de acopio
      const establecimientos = ordenarEstablecimientos(establecimientosRaw);

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunas';
      workbook.lastModifiedBy = 'SIVAC';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Crear hoja de trabajo
      const worksheet = workbook.addWorksheet(`${vacuna.nombre} ${anio}`, {
        pageSetup: {
          paperSize: 9, // A4
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0
        }
      });

      // Configurar columnas
      worksheet.columns = [
        { header: 'Código', key: 'codigo', width: 12 },
        { header: 'Establecimiento', key: 'establecimiento', width: 40 },
        { header: 'Centro de Acopio', key: 'centroAcopio', width: 25 },
        { header: 'Enero', key: 'enero', width: 10 },
        { header: 'Febrero', key: 'febrero', width: 10 },
        { header: 'Marzo', key: 'marzo', width: 10 },
        { header: 'Abril', key: 'abril', width: 10 },
        { header: 'Mayo', key: 'mayo', width: 10 },
        { header: 'Junio', key: 'junio', width: 10 },
        { header: 'Julio', key: 'julio', width: 10 },
        { header: 'Agosto', key: 'agosto', width: 10 },
        { header: 'Septiembre', key: 'septiembre', width: 12 },
        { header: 'Octubre', key: 'octubre', width: 10 },
        { header: 'Noviembre', key: 'noviembre', width: 12 },
        { header: 'Diciembre', key: 'diciembre', width: 12 },
        { header: 'TOTAL', key: 'total', width: 12 }
      ];

      // Estilo del encabezado principal
      worksheet.mergeCells('A1:P1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `PROGRAMACIÓN ANUAL ${vacuna.nombre.toUpperCase()} - AÑO ${anio}`;
      titleCell.font = {
        name: 'Arial',
        size: 16,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E86AB' }
      };

      // Información de la vacuna
      worksheet.mergeCells('A2:P2');
      const infoCell = worksheet.getCell('A2');
      infoCell.value = `Presentación: ${vacuna.presentacion} | Dosis por frasco: ${vacuna.dosisPorFrasco} | Tipo: ${vacuna.tipo}`;
      infoCell.font = {
        name: 'Arial',
        size: 11,
        italic: true
      };
      infoCell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      infoCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F4F8' }
      };

      // Fila vacía
      worksheet.addRow([]);

      // Encabezados de columnas
      const headerRow = worksheet.getRow(4);

      // Establecer valores de encabezados explícitamente
      headerRow.values = [
        'Código',
        'Establecimiento',
        'Centro de Acopio',
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
        'TOTAL'
      ];

      headerRow.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      headerRow.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B4F72' }
      };

      // Agregar datos de establecimientos con colores por centro de acopio
      establecimientos.forEach((establecimiento, index) => {
        const rowNumber = 5 + index; // Fila 5 es la primera fila de datos

        // Obtener colores del centro de acopio
        const centroAcopio = getCentroAcopioPorNombre(establecimiento.nombre);
        const colores = getColoresCentroAcopioExcel(centroAcopio);

        const row = worksheet.addRow({
          codigo: establecimiento.codigo,
          establecimiento: establecimiento.nombre,
          centroAcopio: establecimiento.centroAcopio?.nombre || (centroAcopio !== 'DEFAULT' ? centroAcopio : 'Regional'),
          enero: 0,
          febrero: 0,
          marzo: 0,
          abril: 0,
          mayo: 0,
          junio: 0,
          julio: 0,
          agosto: 0,
          septiembre: 0,
          octubre: 0,
          noviembre: 0,
          diciembre: 0,
          total: { formula: `SUM(D${rowNumber}:O${rowNumber})` }
        });

        // Aplicar colores profesionales por centro de acopio
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colores.bg }
        };

        // Aplicar color de texto
        row.font = {
          color: { argb: colores.text }
        };

        // Formato para números
        for (let col = 4; col <= 16; col++) {
          const cell = row.getCell(col);
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Estilo especial para la columna total
        const totalCell = row.getCell(16);
        totalCell.font = { bold: true };
        totalCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEAA7' }
        };
      });

      // Fila de totales
      const totalRowNumber = worksheet.rowCount + 1;
      const totalRow = worksheet.addRow({
        codigo: '',
        establecimiento: 'TOTAL GENERAL',
        centroAcopio: '',
        enero: { formula: `SUM(D5:D${totalRowNumber - 1})` },
        febrero: { formula: `SUM(E5:E${totalRowNumber - 1})` },
        marzo: { formula: `SUM(F5:F${totalRowNumber - 1})` },
        abril: { formula: `SUM(G5:G${totalRowNumber - 1})` },
        mayo: { formula: `SUM(H5:H${totalRowNumber - 1})` },
        junio: { formula: `SUM(I5:I${totalRowNumber - 1})` },
        julio: { formula: `SUM(J5:J${totalRowNumber - 1})` },
        agosto: { formula: `SUM(K5:K${totalRowNumber - 1})` },
        septiembre: { formula: `SUM(L5:L${totalRowNumber - 1})` },
        octubre: { formula: `SUM(M5:M${totalRowNumber - 1})` },
        noviembre: { formula: `SUM(N5:N${totalRowNumber - 1})` },
        diciembre: { formula: `SUM(O5:O${totalRowNumber - 1})` },
        total: { formula: `SUM(P5:P${totalRowNumber - 1})` }
      });

      totalRow.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF28A745' }
      };

      // Formato para números en fila total
      for (let col = 4; col <= 16; col++) {
        const cell = totalRow.getCell(col);
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Bordes para toda la tabla
      const tableRange = `A4:P${worksheet.rowCount}`;
      worksheet.getCell(tableRange).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Aplicar bordes a todas las celdas de la tabla
      for (let row = 4; row <= worksheet.rowCount; row++) {
        for (let col = 1; col <= 16; col++) {
          const cell = worksheet.getCell(row, col);
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        }
      }

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
      console.log('Buscando vacunas activas...');

      // Primero verificar todas las vacunas
      const todasVacunas = await prisma.vacuna.findMany({
        select: {
          id: true,
          nombre: true,
          estado: true
        }
      });
      console.log('Todas las vacunas en BD:', todasVacunas);

      const vacunas = await prisma.vacuna.findMany({
        where: { estado: 'activo' },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          presentacion: true,
          dosisPorFrasco: true
        },
        orderBy: { nombre: 'asc' }
      });

      console.log(`Encontradas ${vacunas.length} vacunas activas`);

      if (vacunas.length === 0) {
        return {
          success: false,
          error: 'No se encontraron vacunas activas'
        };
      }

      // Obtener todos los establecimientos (todos los tipos disponibles)
      const establecimientosRaw = await prisma.establecimiento.findMany({
        include: {
          centroAcopio: {
            select: {
              nombre: true
            }
          }
        }
      });

      // Aplicar ordenamiento profesional por centro de acopio
      const establecimientos = ordenarEstablecimientos(establecimientosRaw);

      console.log(`Establecimientos ordenados profesionalmente: ${establecimientos.length}`);

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunas';
      workbook.lastModifiedBy = 'SIVAC';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Crear un mapa para evitar nombres de hojas duplicados
      const nombresHojasUsados = new Set<string>();

      // Función para generar nombre único de hoja
      const generarNombreHojaUnico = (nombreOriginal: string): string => {
        let nombreHoja = nombreOriginal;
        let contador = 1;

        // Excel tiene límite de 31 caracteres para nombres de hojas
        if (nombreHoja.length > 31) {
          nombreHoja = nombreHoja.substring(0, 31);
        }

        // Verificar si el nombre ya existe (case insensitive)
        while (nombresHojasUsados.has(nombreHoja.toLowerCase())) {
          const sufijo = ` (${contador})`;
          const longitudBase = 31 - sufijo.length;
          nombreHoja = nombreOriginal.substring(0, longitudBase) + sufijo;
          contador++;
        }

        nombresHojasUsados.add(nombreHoja.toLowerCase());
        return nombreHoja;
      };

      // Crear una hoja por cada vacuna
      for (const vacuna of vacunas) {
        const nombreHoja = generarNombreHojaUnico(vacuna.nombre);
        const worksheet = workbook.addWorksheet(nombreHoja, {
          pageSetup: {
            paperSize: 9, // A4
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0
          }
        });

        // Configurar columnas
        worksheet.columns = [
          { header: 'Código', key: 'codigo', width: 12 },
          { header: 'Establecimiento', key: 'establecimiento', width: 40 },
          { header: 'Centro de Acopio', key: 'centroAcopio', width: 25 },
          { header: 'Enero', key: 'enero', width: 10 },
          { header: 'Febrero', key: 'febrero', width: 10 },
          { header: 'Marzo', key: 'marzo', width: 10 },
          { header: 'Abril', key: 'abril', width: 10 },
          { header: 'Mayo', key: 'mayo', width: 10 },
          { header: 'Junio', key: 'junio', width: 10 },
          { header: 'Julio', key: 'julio', width: 10 },
          { header: 'Agosto', key: 'agosto', width: 10 },
          { header: 'Septiembre', key: 'septiembre', width: 12 },
          { header: 'Octubre', key: 'octubre', width: 10 },
          { header: 'Noviembre', key: 'noviembre', width: 12 },
          { header: 'Diciembre', key: 'diciembre', width: 12 },
          { header: 'TOTAL', key: 'total', width: 12 }
        ];

        // Estilo del encabezado principal
        worksheet.mergeCells('A1:P1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `PROGRAMACIÓN ANUAL ${vacuna.nombre.toUpperCase()} - AÑO ${anio}`;
        titleCell.font = {
          name: 'Arial',
          size: 16,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        titleCell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        titleCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2E86AB' }
        };

        // Información de la vacuna
        worksheet.mergeCells('A2:P2');
        const infoCell = worksheet.getCell('A2');
        infoCell.value = `Presentación: ${vacuna.presentacion} | Dosis por frasco: ${vacuna.dosisPorFrasco} | Tipo: ${vacuna.tipo}`;
        infoCell.font = {
          name: 'Arial',
          size: 11,
          italic: true
        };
        infoCell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        infoCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8F4F8' }
        };

        // Fila vacía
        worksheet.addRow([]);

        // Encabezados de columnas
        const headerRow = worksheet.getRow(4);

        // Establecer valores de encabezados explícitamente
        headerRow.values = [
          'Código',
          'Establecimiento',
          'Centro de Acopio',
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
          'TOTAL'
        ];

        headerRow.font = {
          name: 'Arial',
          size: 11,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        headerRow.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1B4F72' }
        };

        // Agregar datos de establecimientos con colores por centro de acopio
        establecimientos.forEach((establecimiento, index) => {
          const rowNumber = 5 + index;

          // Obtener colores del centro de acopio
          const centroAcopio = getCentroAcopioPorNombre(establecimiento.nombre);
          const colores = getColoresCentroAcopioExcel(centroAcopio);

          const row = worksheet.addRow({
            codigo: establecimiento.codigo,
            establecimiento: establecimiento.nombre,
            centroAcopio: (establecimiento as any).centroAcopio?.nombre || (centroAcopio !== 'DEFAULT' ? centroAcopio : 'Regional'),
            enero: 0,
            febrero: 0,
            marzo: 0,
            abril: 0,
            mayo: 0,
            junio: 0,
            julio: 0,
            agosto: 0,
            septiembre: 0,
            octubre: 0,
            noviembre: 0,
            diciembre: 0,
            total: { formula: `SUM(D${rowNumber}:O${rowNumber})` }
          });

          // Aplicar colores profesionales por centro de acopio
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colores.bg }
          };

          // Aplicar color de texto
          row.font = {
            color: { argb: colores.text }
          };

          // Formato para números
          for (let col = 4; col <= 16; col++) {
            const cell = row.getCell(col);
            cell.numFmt = '#,##0';
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }

          // Estilo especial para la columna total
          const totalCell = row.getCell(16);
          totalCell.font = { bold: true };
          totalCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEAA7' }
          };
        });

        // Fila de totales
        const totalRowNumber = worksheet.rowCount + 1;
        const totalRow = worksheet.addRow({
          codigo: '',
          establecimiento: 'TOTAL GENERAL',
          centroAcopio: '',
          enero: { formula: `SUM(D5:D${totalRowNumber - 1})` },
          febrero: { formula: `SUM(E5:E${totalRowNumber - 1})` },
          marzo: { formula: `SUM(F5:F${totalRowNumber - 1})` },
          abril: { formula: `SUM(G5:G${totalRowNumber - 1})` },
          mayo: { formula: `SUM(H5:H${totalRowNumber - 1})` },
          junio: { formula: `SUM(I5:I${totalRowNumber - 1})` },
          julio: { formula: `SUM(J5:J${totalRowNumber - 1})` },
          agosto: { formula: `SUM(K5:K${totalRowNumber - 1})` },
          septiembre: { formula: `SUM(L5:L${totalRowNumber - 1})` },
          octubre: { formula: `SUM(M5:M${totalRowNumber - 1})` },
          noviembre: { formula: `SUM(N5:N${totalRowNumber - 1})` },
          diciembre: { formula: `SUM(O5:O${totalRowNumber - 1})` },
          total: { formula: `SUM(P5:P${totalRowNumber - 1})` }
        });

        totalRow.font = {
          name: 'Arial',
          size: 11,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        totalRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF28A745' }
        };

        // Formato para números en fila total
        for (let col = 4; col <= 16; col++) {
          const cell = totalRow.getCell(col);
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Aplicar bordes a todas las celdas de la tabla
        for (let row = 4; row <= worksheet.rowCount; row++) {
          for (let col = 1; col <= 16; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
          }
        }
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
   * Importar planificaciones desde archivo Excel por vacuna específica
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

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        return {
          success: false,
          error: 'No se encontró hoja de trabajo en el archivo Excel'
        };
      }

      const registros: {
        establecimientoId: string;
        metaAnual: number;
        distribucionMensual: number[];
      }[] = [];

      const errores: string[] = [];
      let filasProcesadas = 0;

      // Procesar filas de manera asíncrona (empezar desde la fila 5, que es donde están los datos)
      const totalRows = worksheet.rowCount;

      for (let rowNumber = 5; rowNumber <= totalRows; rowNumber++) {
        try {
          const row = worksheet.getRow(rowNumber);
          const codigo = row.getCell(1).value?.toString().trim();
          const establecimientoNombre = row.getCell(2).value?.toString().trim();

          // Saltar fila de totales o filas vacías
          if (!codigo || codigo === '' || establecimientoNombre === 'TOTAL GENERAL') {
            continue;
          }

          // Buscar establecimiento por código
          const establecimiento = await prisma.establecimiento.findFirst({
            where: { codigo: codigo }
          });

          if (!establecimiento) {
            errores.push(`Fila ${rowNumber}: Establecimiento con código '${codigo}' no encontrado`);
            continue;
          }

          // Leer distribución mensual (columnas 4-15)
          const distribucionMensual: number[] = [];
          for (let col = 4; col <= 15; col++) {
            const valor = row.getCell(col).value;
            const numero = typeof valor === 'number' ? valor : parseInt(valor?.toString() || '0', 10);

            if (isNaN(numero) || numero < 0) {
              errores.push(`Fila ${rowNumber}, Columna ${col}: Valor inválido '${valor}'. Debe ser un número positivo`);
              continue;
            }

            distribucionMensual.push(numero);
          }

          // Calcular meta anual
          const metaAnual = distribucionMensual.reduce((sum, val) => sum + val, 0);

          // Procesar todos los registros, incluyendo aquellos con meta anual = 0
          // Esto permite que los valores 0 del archivo de importación reemplacen valores existentes
          registros.push({
            establecimientoId: establecimiento.id,
            metaAnual,
            distribucionMensual
          });

          filasProcesadas++;

        } catch (error) {
          errores.push(`Fila ${rowNumber}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      if (registros.length === 0 && errores.length === 0) {
        return {
          success: false,
          error: 'No se encontraron datos válidos para importar'
        };
      }

      // Importar usando el método existente
      const importResult = await this.importarPlanificaciones({
        vacunaId,
        anio,
        registros
      });

      if (!importResult.success) {
        return importResult;
      }

      return {
        success: true,
        data: {
          creadas: importResult.data?.creadas || 0,
          actualizadas: importResult.data?.actualizadas || 0,
          errores: [...errores, ...(importResult.data?.errores || [])]
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
   * Importar planificaciones masivas desde archivo Excel (múltiples hojas)
   */
  static async importarDesdeExcelMasivo(
    anio: number,
    buffer: Buffer
  ): Promise<ServiceResult<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: { vacuna: string; errores: string[] }[];
    vacunasProcesadas: number;
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

      let totalCreadas = 0;
      let totalActualizadas = 0;
      const erroresPorVacuna: { vacuna: string; errores: string[] }[] = [];
      let vacunasProcesadas = 0;

      // Obtener todas las vacunas para mapear por nombre
      const vacunas = await prisma.vacuna.findMany({
        where: { estado: 'activo' },
        select: { id: true, nombre: true }
      });

      const vacunaMap = new Map(vacunas.map(v => [v.nombre.toLowerCase(), v.id]));

      // Función para buscar vacuna por nombre de hoja (maneja nombres modificados)
      const buscarVacunaPorNombreHoja = (nombreHoja: string): string | undefined => {
        const nombreHojaLower = nombreHoja.toLowerCase();

        // Buscar coincidencia exacta primero
        let vacunaId = vacunaMap.get(nombreHojaLower);
        if (vacunaId) return vacunaId;

        // Si no encuentra coincidencia exacta, buscar por nombre base (sin sufijos como " (2)")
        const nombreBase = nombreHoja.replace(/\s*\(\d+\)\s*$/, '').toLowerCase();
        vacunaId = vacunaMap.get(nombreBase);
        if (vacunaId) return vacunaId;

        // Buscar por coincidencia exacta del nombre base con los nombres de vacunas
        // Esto maneja casos donde el nombre de la hoja es "DT Adulto (1)" y debe mapear a "DT Adulto"
        for (const [nombreVacuna, id] of vacunaMap.entries()) {
          if (nombreBase === nombreVacuna) {
            return id;
          }
        }

        return undefined;
      };

      // Procesar cada hoja de trabajo
      for (const worksheet of workbook.worksheets) {
        try {
          // Buscar vacuna por nombre de hoja (con lógica mejorada)
          const vacunaId = buscarVacunaPorNombreHoja(worksheet.name);

          if (!vacunaId) {
            erroresPorVacuna.push({
              vacuna: worksheet.name,
              errores: [`No se encontró vacuna con nombre '${worksheet.name}'`]
            });
            continue;
          }

          const registros: {
            establecimientoId: string;
            metaAnual: number;
            distribucionMensual: number[];
          }[] = [];

          const erroresHoja: string[] = [];

          // Procesar filas de la hoja
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber < 5) return; // Saltar encabezados

            try {
              const codigo = row.getCell(1).value?.toString().trim();
              const establecimientoNombre = row.getCell(2).value?.toString().trim();

              // Saltar fila de totales
              if (!codigo || codigo === '' || establecimientoNombre === 'TOTAL GENERAL') {
                return;
              }

              // Buscar establecimiento por código (necesitamos hacer esto de forma síncrona)
              // Por ahora, asumimos que el código es válido y lo validaremos en la importación

              // Leer distribución mensual (columnas 4-15)
              const distribucionMensual: number[] = [];
              for (let col = 4; col <= 15; col++) {
                const valor = row.getCell(col).value;
                const numero = typeof valor === 'number' ? valor : parseInt(valor?.toString() || '0', 10);

                if (isNaN(numero) || numero < 0) {
                  erroresHoja.push(`Fila ${rowNumber}, Columna ${col}: Valor inválido '${valor}'. Debe ser un número positivo`);
                  return;
                }

                distribucionMensual.push(numero);
              }

              // Calcular meta anual
              const metaAnual = distribucionMensual.reduce((sum, val) => sum + val, 0);

              // Procesar todos los registros, incluyendo aquellos con meta anual = 0
              // Esto permite que los valores 0 del archivo de importación reemplacen valores existentes
              // Necesitamos obtener el ID del establecimiento
              // Por simplicidad, usaremos el código como identificador temporal
              registros.push({
                establecimientoId: codigo, // Temporal, se resolverá en importar
                metaAnual,
                distribucionMensual
              });

            } catch (error) {
              erroresHoja.push(`Fila ${rowNumber}: Error al procesar - ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          });

          // Resolver IDs de establecimientos
          const registrosConIds: {
            establecimientoId: string;
            metaAnual: number;
            distribucionMensual: number[];
          }[] = [];

          for (const registro of registros) {
            try {
              const establecimiento = await prisma.establecimiento.findFirst({
                where: { codigo: registro.establecimientoId }
              });

              if (establecimiento) {
                registrosConIds.push({
                  establecimientoId: establecimiento.id,
                  metaAnual: registro.metaAnual,
                  distribucionMensual: registro.distribucionMensual
                });
              } else {
                erroresHoja.push(`Establecimiento con código '${registro.establecimientoId}' no encontrado`);
              }
            } catch (error) {
              erroresHoja.push(`Error al buscar establecimiento '${registro.establecimientoId}': ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }

          // Importar registros de esta vacuna
          if (registrosConIds.length > 0) {
            const importResult = await this.importarPlanificaciones({
              vacunaId,
              anio,
              registros: registrosConIds
            });

            if (importResult.success && importResult.data) {
              totalCreadas += importResult.data.creadas;
              totalActualizadas += importResult.data.actualizadas;

              if (importResult.data.errores.length > 0) {
                erroresHoja.push(...importResult.data.errores);
              }
            } else {
              erroresHoja.push(`Error al importar: ${importResult.error}`);
            }
          }

          // Agregar errores de esta hoja si los hay
          if (erroresHoja.length > 0) {
            erroresPorVacuna.push({
              vacuna: worksheet.name,
              errores: erroresHoja
            });
          }

          vacunasProcesadas++;

        } catch (error) {
          erroresPorVacuna.push({
            vacuna: worksheet.name,
            errores: [`Error al procesar hoja: ${error instanceof Error ? error.message : 'Error desconocido'}`]
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
   * FUNCIONALIDAD CLAVE: Sincronizar con movimientos de vacunas
   * Esta función actualiza automáticamente los movimientos cuando cambia la planificación
   */
  private static async sincronizarConMovimientos(
    tx: any,
    planificacionAnterior: any,
    nuevaDistribucion: number[]
  ): Promise<void> {
    try {
      // Comparar distribución anterior con nueva para detectar cambios
      const distribucionAnterior = planificacionAnterior.distribucionMensual;

      for (let mes = 1; mes <= 12; mes++) {
        const mesIndex = mes - 1; // Array es 0-indexed
        const entregaAnterior = distribucionAnterior[mesIndex] || 0;
        const entregaNueva = nuevaDistribucion[mesIndex] || 0;
        const diferencia = entregaNueva - entregaAnterior;

        // Solo actualizar si hay diferencia
        if (diferencia !== 0) {
          // Buscar movimiento existente para este mes
          const movimientoExistente = await tx.movimientoVacuna.findUnique({
            where: {
              uk_movimiento_establecimiento_vacuna_mes_anio: {
                establecimientoId: planificacionAnterior.establecimientoId,
                vacunaId: planificacionAnterior.vacunaId,
                mes: mes,
                anio: planificacionAnterior.anio
              }
            }
          });

          if (movimientoExistente) {
            // Actualizar movimiento existente
            const nuevaEntrega = Math.max(0, movimientoExistente.entrega + diferencia);

            await tx.movimientoVacuna.update({
              where: { id: movimientoExistente.id },
              data: {
                entrega: nuevaEntrega,
                updatedAt: new Date()
              }
            });

            console.log(`Sincronización: Movimiento ${movimientoExistente.id} actualizado. Entrega: ${movimientoExistente.entrega} → ${nuevaEntrega}`);
          } else if (entregaNueva !== null && entregaNueva !== undefined) {
            // CORRECCIÓN: Crear nuevo movimiento para TODAS las entregas, incluyendo 0
            // Esto permite que los usuarios puedan modificar las entregas desde el módulo de movimientos
            // Nota: Necesitamos un usuarioId para crear el movimiento
            // Por ahora, registramos que se necesita crear el movimiento
            console.log(`Sincronización: Se necesita crear movimiento para ${planificacionAnterior.establecimientoId}, vacuna ${planificacionAnterior.vacunaId}, mes ${mes}/${planificacionAnterior.anio} con entrega ${entregaNueva}`);
          }
        }
      }
    } catch (error) {
      console.error('Error al sincronizar con movimientos:', error);
      // No lanzamos el error para no interrumpir la actualización de planificación
      // pero lo registramos para debugging
    }
  }

  /**
   * Sincronización manual con movimientos
   * Útil para corregir inconsistencias entre planificación y movimientos
   */
  static async sincronizarConMovimientosManual(planificacionId: string, usuarioId: string): Promise<ServiceResult<{
    movimientosActualizados: number;
    movimientosCreados: number;
    errores: string[];
  }>> {
    try {
      // Buscar la planificación
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: { id: planificacionId }
      });

      if (!planificacion) {
        return {
          success: false,
          error: 'Planificación no encontrada'
        };
      }

      let movimientosActualizados = 0;
      let movimientosCreados = 0;
      const errores: string[] = [];

      // Procesar cada mes de la distribución
      for (let mes = 1; mes <= 12; mes++) {
        const mesIndex = mes - 1;
        const entregaPlanificada = planificacion.distribucionMensual[mesIndex] || 0;

        try {
          // Buscar movimiento existente
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
            // Actualizar movimiento existente si hay diferencia
            if (movimientoExistente.entrega !== entregaPlanificada) {
              await prisma.movimientoVacuna.update({
                where: { id: movimientoExistente.id },
                data: {
                  entrega: entregaPlanificada,
                  updatedAt: new Date()
                }
              });
              movimientosActualizados++;
            }
          } else if (entregaPlanificada !== null && entregaPlanificada !== undefined) {
            // CORRECCIÓN: Crear nuevo movimiento para TODAS las entregas, incluyendo 0
            // Esto permite que los usuarios puedan modificar las entregas desde el módulo de movimientos
            try {
              await prisma.movimientoVacuna.create({
                data: {
                  establecimientoId: planificacion.establecimientoId,
                  vacunaId: planificacion.vacunaId,
                  mes: mes,
                  anio: planificacion.anio,
                  entrega: entregaPlanificada,
                  usuarioId: usuarioId,
                  fechaMovimiento: new Date()
                }
              });
              movimientosCreados++;
            } catch (createError) {
              errores.push(`Error al crear movimiento para mes ${mes}/${planificacion.anio}: ${createError instanceof Error ? createError.message : 'Error desconocido'}`);
            }
          }
        } catch (error) {
          errores.push(`Error procesando mes ${mes}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      return {
        success: true,
        data: {
          movimientosActualizados,
          movimientosCreados,
          errores
        }
      };
    } catch (error) {
      console.error('Error en sincronización manual:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en sincronización manual'
      };
    }
  }

  /**
   * Verificar disponibilidad de entregas en próximos meses
   * y permitir registrar en mes actual si no hay disponibilidad
   */
  static async verificarDisponibilidadEntregas(
    establecimientoId: string,
    vacunaId: string,
    mesActual: number,
    anio: number
  ): Promise<ServiceResult<{
    tieneDisponibilidad: boolean;
    mesActual: number;
    disponibilidadRestante: number;
    mesesConDisponibilidad: number[];
    planificacionId?: string;
    mensaje: string;
  }>> {
    try {
      // Buscar la planificación existente
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: {
          uk_planificacion_establecimiento_vacuna_anio: {
            establecimientoId,
            vacunaId,
            anio
          }
        },
        select: {
          id: true,
          distribucionMensual: true,
          metaAnual: true
        }
      });

      if (!planificacion) {
        return {
          success: false,
          error: 'No existe planificación para este establecimiento y vacuna en el año especificado'
        };
      }

      // Verificar disponibilidad en los meses siguientes al mes actual
      const distribucion = planificacion.distribucionMensual as number[];
      const mesesConDisponibilidad: number[] = [];
      let disponibilidadRestante = 0;

      // Revisar desde el mes actual hasta diciembre
      for (let mes = mesActual; mes <= 12; mes++) {
        const cantidadMes = distribucion[mes - 1] || 0;
        if (cantidadMes > 0) {
          mesesConDisponibilidad.push(mes);
          disponibilidadRestante += cantidadMes;
        }
      }

      const tieneDisponibilidad = disponibilidadRestante > 0;
      const mensaje = tieneDisponibilidad
        ? `Hay ${disponibilidadRestante} unidades disponibles en ${mesesConDisponibilidad.length} mes(es) restante(s)`
        : 'Ya no hay entregas disponibles o programadas para este año. Todas las entregas ya fueron asignadas.';

      return {
        success: true,
        data: {
          tieneDisponibilidad,
          mesActual,
          disponibilidadRestante,
          mesesConDisponibilidad,
          planificacionId: planificacion.id,
          mensaje
        }
      };
    } catch (error) {
      console.error('Error al verificar disponibilidad de entregas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar disponibilidad'
      };
    }
  }

  /**
   * Registrar entrega en mes actual cuando no hay disponibilidad futura
   * Actualiza la planificación mensual asignando la cantidad al mes actual
   */
  static async registrarEntregaMesActual(
    establecimientoId: string,
    vacunaId: string,
    mesActual: number,
    anio: number,
    cantidad: number,
    usuarioId?: string
  ): Promise<ServiceResult<{
    planificacionActualizada: boolean;
    cantidadRegistrada: number;
    distribucionMensualNueva: number[];
    mensaje: string;
  }>> {
    try {
      // Validaciones
      if (cantidad <= 0) {
        return {
          success: false,
          error: 'La cantidad debe ser mayor a 0'
        };
      }

      if (mesActual < 1 || mesActual > 12) {
        return {
          success: false,
          error: 'El mes debe estar entre 1 y 12'
        };
      }

      // Buscar la planificación existente
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: {
          uk_planificacion_establecimiento_vacuna_anio: {
            establecimientoId,
            vacunaId,
            anio
          }
        }
      });

      if (!planificacion) {
        return {
          success: false,
          error: 'No existe planificación para este establecimiento'
        };
      }

      // Actualizar la distribución mensual agregando la cantidad al mes actual
      const distribucionActual = planificacion.distribucionMensual as number[];
      const nuevaDistribucion = [...distribucionActual];
      nuevaDistribucion[mesActual - 1] = (nuevaDistribucion[mesActual - 1] || 0) + cantidad;

      // Calcular nueva meta anual
      const nuevaMetaAnual = nuevaDistribucion.reduce((sum, val) => sum + val, 0);

      // Actualizar la planificación
      await prisma.planificacionAnual.update({
        where: { id: planificacion.id },
        data: {
          distribucionMensual: nuevaDistribucion,
          metaAnual: nuevaMetaAnual,
          updatedAt: new Date()
        }
      });

      // Sincronizar automáticamente con movimientos si se proporciona usuarioId
      if (usuarioId) {
        try {
          await this.sincronizarUnMesConMovimientos(
            planificacion.id,
            mesActual,
            anio,
            usuarioId
          );
        } catch (syncError) {
          console.warn('Error al sincronizar con movimientos:', syncError);
          // No interrumpir el flujo si falla la sincronización
        }
      }

      return {
        success: true,
        data: {
          planificacionActualizada: true,
          cantidadRegistrada: cantidad,
          distribucionMensualNueva: nuevaDistribucion,
          mensaje: `Se registraron ${cantidad} unidades en el mes actual y se actualizó la planificación automáticamente`
        }
      };
    } catch (error) {
      console.error('Error al registrar entrega en mes actual:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al registrar entrega'
      };
    }
  }

  /**
   * Sincronizar un mes específico con movimientos
   * Método auxiliar para sincronización parcial
   */
  private static async sincronizarUnMesConMovimientos(
    planificacionId: string,
    mes: number,
    anio: number,
    usuarioId: string
  ): Promise<void> {
    const planificacion = await prisma.planificacionAnual.findUnique({
      where: { id: planificacionId }
    });

    if (!planificacion) {
      throw new Error('Planificación no encontrada');
    }

    const distribucion = planificacion.distribucionMensual as number[];
    const entregaProgramada = distribucion[mes - 1] || 0;

    // Buscar movimiento existente
    const movimientoExistente = await prisma.movimientoVacuna.findUnique({
      where: {
        uk_movimiento_establecimiento_vacuna_mes_anio: {
          establecimientoId: planificacion.establecimientoId,
          vacunaId: planificacion.vacunaId,
          mes,
          anio
        }
      }
    });

    if (movimientoExistente) {
      // Actualizar movimiento existente
      await prisma.movimientoVacuna.update({
        where: { id: movimientoExistente.id },
        data: {
          entrega: entregaProgramada,
          usuarioId: usuarioId || movimientoExistente.usuarioId
        }
      });
    } else if (entregaProgramada > 0) {
      // Crear nuevo movimiento
      await prisma.movimientoVacuna.create({
        data: {
          establecimientoId: planificacion.establecimientoId,
          vacunaId: planificacion.vacunaId,
          mes,
          anio,
          saldoAnterior: 0,
          transIngreso: 0,
          salida: 0,
          transSalida: 0,
          entrega: entregaProgramada,
          fechaMovimiento: new Date(),
          usuarioId: usuarioId
        }
      });
    }
  }

  /**
   * Verificar si existe planificación para un establecimiento específico
   */
  static async verificarExistenciaPlanificacion(
    establecimientoId: string,
    vacunaId: string,
    anio: number
  ): Promise<ServiceResult<{ existe: boolean; planificacionId?: string; metaAnual: number }>> {
    try {
      const planificacion = await prisma.planificacionAnual.findUnique({
        where: {
          uk_planificacion_establecimiento_vacuna_anio: {
            establecimientoId,
            vacunaId,
            anio
          }
        },
        select: {
          id: true,
          metaAnual: true,
          distribucionMensual: true
        }
      });

      return {
        success: true,
        data: {
          existe: !!planificacion,
          planificacionId: planificacion?.id,
          metaAnual: planificacion?.metaAnual || 0
        }
      };
    } catch (error) {
      console.error('Error al verificar existencia de planificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar planificación'
      };
    }
  }
}
