import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { TipoMovimientoKardex } from '@prisma/client';
import { validateUUID } from '@/utils/validation';

/**
 * Interfaces para filtros y DTOs del Kardex
 */
export interface KardexFilters {
  tipo?: 'vacuna' | 'jeringa';
  itemId?: string;
  loteId?: string;
  tipoMovimiento?: TipoMovimientoKardex;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateKardexDto {
  tipo: 'vacuna' | 'jeringa';
  itemId: string;
  loteId: string;
  tipoMovimiento: TipoMovimientoKardex;
  cantidad: number;
  saldoAnterior?: number;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  usuarioId: string;
  fechaMovimiento?: Date;
}

export interface UpdateKardexDto {
  cantidad?: number;
  saldoAnterior?: number;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  documento?: string;
  numeroDocumento?: string;
  observaciones?: string;
  fechaMovimiento?: Date;
}

export interface KardexConRelaciones {
  id: string;
  tipo: string;
  itemId: string;
  loteId: string;
  tipoMovimiento: TipoMovimientoKardex;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  usuarioId: string;
  fechaMovimiento: Date;
  createdAt: Date;
  // Relaciones
  establecimientoOrigen?: {
    id: string;
    nombre: string;
    tipo: string;
    codigo: string;
  };
  establecimientoDestino?: {
    id: string;
    nombre: string;
    tipo: string;
    codigo: string;
  };
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
  };
  // Información del item (vacuna o jeringa)
  item?: {
    id: string;
    nombre: string;
    tipo?: string;
    presentacion?: string;
    capacidad?: string;
  };
  // Información del lote
  lote?: {
    id: string;
    numero: string;
    fechaVencimiento?: Date;
    cantidadInicial: number;
    cantidadActual: number;
  };
}

export interface KardexEstadisticas {
  totalMovimientos: number;
  totalIngresos: number;
  totalSalidas: number;
  totalTransferencias: number;
  totalAjustes: number;
  saldoActualTotal: number;
  movimientosPorTipo: {
    tipo: string;
    cantidad: number;
  }[];
  movimientosPorMes: {
    mes: string;
    ingresos: number;
    salidas: number;
    transferencias: number;
    ajustes: number;
  }[];
}

/**
 * Servicio para gestión del Kardex
 * Módulo 12: KARDEX
 */
export class KardexService {
  /**
   * Obtener todos los movimientos de kardex con filtros opcionales
   */
  static async getAll(filters?: KardexFilters): Promise<ServiceResult<{ 
    movimientos: KardexConRelaciones[]; 
    total: number 
  }>> {
    try {
      const {
        tipo,
        itemId,
        loteId,
        tipoMovimiento,
        establecimientoOrigenId,
        establecimientoDestinoId,
        fechaInicio,
        fechaFin,
        search,
        page = 1,
        limit = 100
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (tipo) {
        where.tipo = tipo;
      }

      if (itemId) {
        where.itemId = itemId;
      }

      if (loteId) {
        where.loteId = loteId;
      }

      if (tipoMovimiento) {
        where.tipoMovimiento = tipoMovimiento;
      }

      if (establecimientoOrigenId) {
        where.establecimientoOrigenId = establecimientoOrigenId;
      }

      if (establecimientoDestinoId) {
        where.establecimientoDestinoId = establecimientoDestinoId;
      }

      // Filtro por rango de fechas
      if (fechaInicio || fechaFin) {
        where.fechaMovimiento = {};
        if (fechaInicio) {
          // Asegurar que la fecha de inicio incluya desde las 00:00:00 del día
          const fechaInicioAjustada = new Date(fechaInicio);
          fechaInicioAjustada.setHours(0, 0, 0, 0);
          where.fechaMovimiento.gte = fechaInicioAjustada;
        }
        if (fechaFin) {
          // Asegurar que la fecha de fin incluya hasta las 23:59:59.999 del día
          const fechaFinAjustada = new Date(fechaFin);
          fechaFinAjustada.setHours(23, 59, 59, 999);
          where.fechaMovimiento.lte = fechaFinAjustada;
        }
      }

      // Búsqueda por texto en documento, número de documento u observaciones
      if (search) {
        where.OR = [
          { documento: { contains: search, mode: 'insensitive' } },
          { numeroDocumento: { contains: search, mode: 'insensitive' } },
          { observaciones: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener total de registros
      const total = await prisma.kardex.count({ where });

      // Obtener movimientos con relaciones
      const movimientos = await prisma.kardex.findMany({
        where,
        include: {
          establecimientoOrigen: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          establecimientoDestino: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true
            }
          }
        },
        orderBy: [
          { fechaMovimiento: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      });

      // Enriquecer con información de items y lotes
      const movimientosEnriquecidos = await this.enrichMovimientosWithItemsAndLotes(movimientos);

      return {
        success: true,
        data: {
          movimientos: movimientosEnriquecidos,
          total
        }
      };
    } catch (error) {
      console.error('Error en KardexService.getAll:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener movimientos de kardex'
      };
    }
  }

  /**
   * Obtener movimiento de kardex por ID
   */
  static async getById(id: string): Promise<ServiceResult<KardexConRelaciones>> {
    try {
      if (!validateUUID(id)) {
        return {
          success: false,
          error: 'ID de movimiento inválido'
        };
      }

      const movimiento = await prisma.kardex.findUnique({
        where: { id },
        include: {
          establecimientoOrigen: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          establecimientoDestino: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true
            }
          }
        }
      });

      if (!movimiento) {
        return {
          success: false,
          error: 'Movimiento de kardex no encontrado'
        };
      }

      // Enriquecer con información de item y lote
      const movimientosEnriquecidos = await this.enrichMovimientosWithItemsAndLotes([movimiento]);
      const movimientoEnriquecido = movimientosEnriquecidos[0];

      if (!movimientoEnriquecido) {
        return {
          success: false,
          error: 'Error al enriquecer movimiento con datos relacionados'
        };
      }

      return {
        success: true,
        data: movimientoEnriquecido
      };
    } catch (error) {
      console.error('Error en KardexService.getById:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener movimiento de kardex'
      };
    }
  }

  /**
   * Crear nuevo movimiento de kardex
   */
  static async create(data: CreateKardexDto): Promise<ServiceResult<KardexConRelaciones>> {
    try {
      // Validaciones de negocio
      await this.validateKardexData(data);

      // Calcular saldo actual basado en el tipo de movimiento
      const saldoAnterior = data.saldoAnterior || await this.calcularSaldoAnterior(data.tipo, data.itemId, data.loteId);
      const saldoActual = this.calcularSaldoActual(saldoAnterior, data.cantidad, data.tipoMovimiento);

      const movimiento = await prisma.kardex.create({
        data: {
          tipo: data.tipo,
          itemId: data.itemId,
          loteId: data.loteId,
          tipoMovimiento: data.tipoMovimiento,
          cantidad: data.cantidad,
          saldoAnterior,
          saldoActual,
          establecimientoOrigenId: data.establecimientoOrigenId || null,
          establecimientoDestinoId: data.establecimientoDestinoId || null,
          documento: data.documento,
          numeroDocumento: data.numeroDocumento,
          observaciones: data.observaciones || null,
          usuarioId: data.usuarioId,
          fechaMovimiento: data.fechaMovimiento || new Date()
        },
        include: {
          establecimientoOrigen: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          establecimientoDestino: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true
            }
          }
        }
      });

      // Actualizar stock del lote correspondiente
      await this.actualizarStockLote(data.tipo, data.loteId, data.cantidad, data.tipoMovimiento);

      // Enriquecer con información de item y lote
      const movimientosEnriquecidos = await this.enrichMovimientosWithItemsAndLotes([movimiento]);
      const movimientoEnriquecido = movimientosEnriquecidos[0];

      if (!movimientoEnriquecido) {
        return {
          success: false,
          error: 'Error al enriquecer movimiento con datos relacionados'
        };
      }

      return {
        success: true,
        data: movimientoEnriquecido
      };
    } catch (error) {
      console.error('Error en KardexService.create:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear movimiento de kardex'
      };
    }
  }

  /**
   * Actualizar movimiento de kardex
   */
  static async update(id: string, data: UpdateKardexDto): Promise<ServiceResult<KardexConRelaciones>> {
    try {
      if (!validateUUID(id)) {
        return {
          success: false,
          error: 'ID de movimiento inválido'
        };
      }

      // Verificar que el movimiento existe
      const existingMovimiento = await prisma.kardex.findUnique({
        where: { id }
      });

      if (!existingMovimiento) {
        return {
          success: false,
          error: 'Movimiento de kardex no encontrado'
        };
      }

      // Si se actualiza la cantidad, recalcular saldo actual
      let saldoActual = existingMovimiento.saldoActual;
      if (data.cantidad !== undefined) {
        const saldoAnterior = data.saldoAnterior || existingMovimiento.saldoAnterior;
        saldoActual = this.calcularSaldoActual(saldoAnterior, data.cantidad, existingMovimiento.tipoMovimiento);

        // Actualizar stock del lote si cambió la cantidad
        const diferenciaCantidad = data.cantidad - existingMovimiento.cantidad;
        if (diferenciaCantidad !== 0) {
          await this.actualizarStockLote(
            existingMovimiento.tipo,
            existingMovimiento.loteId,
            diferenciaCantidad,
            existingMovimiento.tipoMovimiento
          );
        }
      }

      const movimiento = await prisma.kardex.update({
        where: { id },
        data: {
          ...data,
          saldoActual
        },
        include: {
          establecimientoOrigen: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          establecimientoDestino: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true
            }
          }
        }
      });

      // Enriquecer con información de item y lote
      const movimientosEnriquecidos = await this.enrichMovimientosWithItemsAndLotes([movimiento]);
      const movimientoEnriquecido = movimientosEnriquecidos[0];

      if (!movimientoEnriquecido) {
        return {
          success: false,
          error: 'Error al enriquecer movimiento con datos relacionados'
        };
      }

      return {
        success: true,
        data: movimientoEnriquecido
      };
    } catch (error) {
      console.error('Error en KardexService.update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar movimiento de kardex'
      };
    }
  }

  /**
   * Eliminar movimiento de kardex
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      if (!validateUUID(id)) {
        return {
          success: false,
          error: 'ID de movimiento inválido'
        };
      }

      // Verificar que el movimiento existe
      const existingMovimiento = await prisma.kardex.findUnique({
        where: { id }
      });

      if (!existingMovimiento) {
        return {
          success: false,
          error: 'Movimiento de kardex no encontrado'
        };
      }

      // Revertir el stock del lote antes de eliminar
      await this.actualizarStockLote(
        existingMovimiento.tipo,
        existingMovimiento.loteId,
        -existingMovimiento.cantidad, // Cantidad negativa para revertir
        existingMovimiento.tipoMovimiento
      );

      await prisma.kardex.delete({
        where: { id }
      });

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error en KardexService.delete:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar movimiento de kardex'
      };
    }
  }

  /**
   * Obtener estadísticas del kardex
   */
  static async getEstadisticas(filters?: Omit<KardexFilters, 'page' | 'limit'>): Promise<ServiceResult<KardexEstadisticas>> {
    try {
      const where: any = {};

      // Aplicar filtros básicos
      if (filters?.tipo) where.tipo = filters.tipo;
      if (filters?.itemId) where.itemId = filters.itemId;
      if (filters?.loteId) where.loteId = filters.loteId;
      if (filters?.tipoMovimiento) where.tipoMovimiento = filters.tipoMovimiento;
      if (filters?.establecimientoOrigenId) where.establecimientoOrigenId = filters.establecimientoOrigenId;
      if (filters?.establecimientoDestinoId) where.establecimientoDestinoId = filters.establecimientoDestinoId;

      // Filtro por rango de fechas
      if (filters?.fechaInicio || filters?.fechaFin) {
        where.fechaMovimiento = {};
        if (filters.fechaInicio) {
          // Asegurar que la fecha de inicio incluya desde las 00:00:00 del día
          const fechaInicioAjustada = new Date(filters.fechaInicio);
          fechaInicioAjustada.setHours(0, 0, 0, 0);
          where.fechaMovimiento.gte = fechaInicioAjustada;
        }
        if (filters.fechaFin) {
          // Asegurar que la fecha de fin incluya hasta las 23:59:59.999 del día
          const fechaFinAjustada = new Date(filters.fechaFin);
          fechaFinAjustada.setHours(23, 59, 59, 999);
          where.fechaMovimiento.lte = fechaFinAjustada;
        }
      }

      // Obtener estadísticas básicas
      const [
        totalMovimientos,
        totalIngresos,
        totalSalidas,
        totalTransferencias,
        totalAjustes,
        movimientosPorTipo,
        movimientosPorMes
      ] = await Promise.all([
        // Total de movimientos
        prisma.kardex.count({ where }),

        // Total ingresos
        prisma.kardex.aggregate({
          where: { ...where, tipoMovimiento: 'ingreso' },
          _sum: { cantidad: true }
        }),

        // Total salidas
        prisma.kardex.aggregate({
          where: { ...where, tipoMovimiento: 'salida' },
          _sum: { cantidad: true }
        }),

        // Total transferencias
        prisma.kardex.aggregate({
          where: { ...where, tipoMovimiento: 'transferencia' },
          _sum: { cantidad: true }
        }),

        // Total ajustes
        prisma.kardex.aggregate({
          where: { ...where, tipoMovimiento: 'ajuste' },
          _sum: { cantidad: true }
        }),

        // Movimientos por tipo de item
        prisma.kardex.groupBy({
          by: ['tipo'],
          where,
          _count: { id: true }
        }),

        // Movimientos por mes - simplificado para evitar errores de sintaxis
        prisma.kardex.groupBy({
          by: ['fechaMovimiento'],
          where,
          _count: { id: true },
          _sum: { cantidad: true }
        })
      ]);

      // Calcular saldo actual total (último saldo de cada item/lote)
      const ultimosSaldos = await prisma.kardex.groupBy({
        by: ['tipo', 'itemId', 'loteId'],
        where,
        _max: { fechaMovimiento: true }
      });

      let saldoActualTotal = 0;
      for (const grupo of ultimosSaldos) {
        const ultimoMovimiento = await prisma.kardex.findFirst({
          where: {
            tipo: grupo.tipo,
            itemId: grupo.itemId,
            loteId: grupo.loteId,
            fechaMovimiento: grupo._max.fechaMovimiento!
          },
          select: { saldoActual: true }
        });
        if (ultimoMovimiento) {
          saldoActualTotal += ultimoMovimiento.saldoActual;
        }
      }

      const estadisticas: KardexEstadisticas = {
        totalMovimientos,
        totalIngresos: totalIngresos._sum.cantidad || 0,
        totalSalidas: totalSalidas._sum.cantidad || 0,
        totalTransferencias: totalTransferencias._sum.cantidad || 0,
        totalAjustes: totalAjustes._sum.cantidad || 0,
        saldoActualTotal,
        movimientosPorTipo: movimientosPorTipo.map(item => ({
          tipo: item.tipo,
          cantidad: item._count.id
        })),
        movimientosPorMes: (movimientosPorMes as any[]).map(item => ({
          mes: item.fechaMovimiento ? new Date(item.fechaMovimiento).toISOString().slice(0, 7) : 'N/A',
          ingresos: 0, // Simplificado por ahora
          salidas: 0,
          transferencias: 0,
          ajustes: 0
        })).slice(0, 12)
      };

      return {
        success: true,
        data: estadisticas
      };
    } catch (error) {
      console.error('Error en KardexService.getEstadisticas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas del kardex'
      };
    }
  }

  /**
   * Obtener trazabilidad de un lote específico
   */
  static async getTrazabilidadLote(loteId: string): Promise<ServiceResult<KardexConRelaciones[]>> {
    try {
      if (!validateUUID(loteId)) {
        return {
          success: false,
          error: 'ID de lote inválido'
        };
      }

      const movimientos = await prisma.kardex.findMany({
        where: { loteId },
        include: {
          establecimientoOrigen: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          establecimientoDestino: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              codigo: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true
            }
          }
        },
        orderBy: [
          { fechaMovimiento: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      // Enriquecer con información de items y lotes
      const movimientosEnriquecidos = await this.enrichMovimientosWithItemsAndLotes(movimientos);

      return {
        success: true,
        data: movimientosEnriquecidos
      };
    } catch (error) {
      console.error('Error en KardexService.getTrazabilidadLote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener trazabilidad del lote'
      };
    }
  }

  /**
   * Métodos auxiliares privados
   */

  /**
   * Enriquecer movimientos con información de items y lotes
   */
  private static async enrichMovimientosWithItemsAndLotes(movimientos: any[]): Promise<KardexConRelaciones[]> {
    const movimientosEnriquecidos: KardexConRelaciones[] = [];

    for (const movimiento of movimientos) {
      let item = null;
      let lote = null;

      // Obtener información del item según el tipo
      if (movimiento.tipo === 'vacuna') {
        const vacuna = await prisma.vacuna.findUnique({
          where: { id: movimiento.itemId },
          select: {
            id: true,
            nombre: true,
            tipo: true,
            presentacion: true
          }
        });
        if (vacuna) {
          item = {
            id: vacuna.id,
            nombre: vacuna.nombre,
            tipo: vacuna.tipo,
            presentacion: vacuna.presentacion
          };
        }

        // Obtener información del lote de vacuna
        const loteVacuna = await prisma.loteVacuna.findUnique({
          where: { id: movimiento.loteId },
          select: {
            id: true,
            numero: true,
            fechaVencimiento: true,
            cantidadInicial: true,
            cantidadActual: true
          }
        });
        if (loteVacuna) {
          lote = {
            id: loteVacuna.id,
            numero: loteVacuna.numero,
            fechaVencimiento: loteVacuna.fechaVencimiento,
            cantidadInicial: loteVacuna.cantidadInicial,
            cantidadActual: loteVacuna.cantidadActual
          };
        }
      } else if (movimiento.tipo === 'jeringa') {
        const jeringa = await prisma.jeringa.findUnique({
          where: { id: movimiento.itemId },
          select: {
            id: true,
            tipo: true,
            capacidad: true
          }
        });
        if (jeringa) {
          item = {
            id: jeringa.id,
            nombre: jeringa.tipo,
            capacidad: jeringa.capacidad
          };
        }

        // Obtener información del lote de jeringa
        const loteJeringa = await prisma.loteJeringa.findUnique({
          where: { id: movimiento.loteId },
          select: {
            id: true,
            numero: true,
            fechaVencimiento: true,
            cantidadInicial: true,
            cantidadActual: true
          }
        });
        if (loteJeringa) {
          lote = {
            id: loteJeringa.id,
            numero: loteJeringa.numero,
            fechaVencimiento: loteJeringa.fechaVencimiento,
            cantidadInicial: loteJeringa.cantidadInicial,
            cantidadActual: loteJeringa.cantidadActual
          };
        }
      }

      movimientosEnriquecidos.push({
        ...movimiento,
        item,
        lote
      });
    }

    return movimientosEnriquecidos;
  }

  /**
   * Validar datos del kardex
   */
  private static async validateKardexData(data: CreateKardexDto): Promise<void> {
    // Validar UUIDs
    if (!validateUUID(data.itemId)) {
      throw new Error('ID de item inválido');
    }

    if (!validateUUID(data.loteId)) {
      throw new Error('ID de lote inválido');
    }

    if (!validateUUID(data.usuarioId)) {
      throw new Error('ID de usuario inválido');
    }

    if (data.establecimientoOrigenId && !validateUUID(data.establecimientoOrigenId)) {
      throw new Error('ID de establecimiento origen inválido');
    }

    if (data.establecimientoDestinoId && !validateUUID(data.establecimientoDestinoId)) {
      throw new Error('ID de establecimiento destino inválido');
    }

    // Validar que el item existe según el tipo
    if (data.tipo === 'vacuna') {
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: data.itemId }
      });
      if (!vacuna) {
        throw new Error('Vacuna no encontrada');
      }

      const loteVacuna = await prisma.loteVacuna.findUnique({
        where: { id: data.loteId }
      });
      if (!loteVacuna) {
        throw new Error('Lote de vacuna no encontrado');
      }
      if (loteVacuna.vacunaId !== data.itemId) {
        throw new Error('El lote no corresponde a la vacuna especificada');
      }
    } else if (data.tipo === 'jeringa') {
      const jeringa = await prisma.jeringa.findUnique({
        where: { id: data.itemId }
      });
      if (!jeringa) {
        throw new Error('Jeringa no encontrada');
      }

      const loteJeringa = await prisma.loteJeringa.findUnique({
        where: { id: data.loteId }
      });
      if (!loteJeringa) {
        throw new Error('Lote de jeringa no encontrado');
      }
      if (loteJeringa.jeringaId !== data.itemId) {
        throw new Error('El lote no corresponde a la jeringa especificada');
      }
    }

    // Validar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId }
    });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Validar establecimientos si se proporcionan
    if (data.establecimientoOrigenId) {
      const establecimientoOrigen = await prisma.establecimiento.findUnique({
        where: { id: data.establecimientoOrigenId }
      });
      if (!establecimientoOrigen) {
        throw new Error('Establecimiento origen no encontrado');
      }
    }

    if (data.establecimientoDestinoId) {
      const establecimientoDestino = await prisma.establecimiento.findUnique({
        where: { id: data.establecimientoDestinoId }
      });
      if (!establecimientoDestino) {
        throw new Error('Establecimiento destino no encontrado');
      }
    }

    // Validaciones de negocio según tipo de movimiento
    if (data.tipoMovimiento === 'transferencia') {
      if (!data.establecimientoOrigenId || !data.establecimientoDestinoId) {
        throw new Error('Las transferencias requieren establecimiento origen y destino');
      }
      if (data.establecimientoOrigenId === data.establecimientoDestinoId) {
        throw new Error('El establecimiento origen y destino no pueden ser el mismo');
      }
    }

    if (data.tipoMovimiento === 'ingreso' && data.establecimientoOrigenId) {
      throw new Error('Los ingresos no deben tener establecimiento origen');
    }

    if (data.tipoMovimiento === 'salida' && data.establecimientoDestinoId) {
      throw new Error('Las salidas no deben tener establecimiento destino');
    }

    // Validar cantidad
    if (data.cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a cero');
    }
  }

  /**
   * Calcular saldo anterior basado en el último movimiento del item/lote
   */
  private static async calcularSaldoAnterior(tipo: string, itemId: string, loteId: string): Promise<number> {
    const ultimoMovimiento = await prisma.kardex.findFirst({
      where: {
        tipo,
        itemId,
        loteId
      },
      orderBy: [
        { fechaMovimiento: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        saldoActual: true
      }
    });

    return ultimoMovimiento?.saldoActual || 0;
  }

  /**
   * Calcular saldo actual basado en el tipo de movimiento
   */
  private static calcularSaldoActual(saldoAnterior: number, cantidad: number, tipoMovimiento: TipoMovimientoKardex): number {
    switch (tipoMovimiento) {
      case 'ingreso':
        return saldoAnterior + cantidad;
      case 'salida':
      case 'transferencia':
        return saldoAnterior - cantidad;
      case 'ajuste':
        // Para ajustes, la cantidad puede ser positiva o negativa
        return saldoAnterior + cantidad;
      default:
        return saldoAnterior;
    }
  }

  /**
   * Actualizar stock del lote correspondiente
   */
  private static async actualizarStockLote(tipo: string, loteId: string, cantidad: number, tipoMovimiento: TipoMovimientoKardex): Promise<void> {
    let incremento = 0;

    // Calcular incremento según tipo de movimiento
    switch (tipoMovimiento) {
      case 'ingreso':
        incremento = cantidad;
        break;
      case 'salida':
      case 'transferencia':
        incremento = -cantidad;
        break;
      case 'ajuste':
        incremento = cantidad; // Puede ser positivo o negativo
        break;
    }

    if (incremento === 0) return;

    // Actualizar el lote correspondiente
    if (tipo === 'vacuna') {
      await prisma.loteVacuna.update({
        where: { id: loteId },
        data: {
          cantidadActual: {
            increment: incremento
          }
        }
      });
    } else if (tipo === 'jeringa') {
      await prisma.loteJeringa.update({
        where: { id: loteId },
        data: {
          cantidadActual: {
            increment: incremento
          }
        }
      });
    }
  }

  /**
   * Generar movimiento de kardex automáticamente desde otros módulos
   */
  static async generarMovimientoAutomatico(data: {
    tipo: 'vacuna' | 'jeringa';
    itemId: string;
    loteId: string;
    tipoMovimiento: TipoMovimientoKardex;
    cantidad: number;
    establecimientoOrigenId?: string;
    establecimientoDestinoId?: string;
    documento: string;
    numeroDocumento: string;
    observaciones?: string;
    usuarioId: string;
    fechaMovimiento?: Date;
  }): Promise<ServiceResult<KardexConRelaciones>> {
    try {
      // Usar el método create estándar
      return await this.create({
        ...data,
        fechaMovimiento: data.fechaMovimiento || new Date()
      });
    } catch (error) {
      console.error('Error en KardexService.generarMovimientoAutomatico:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar movimiento automático'
      };
    }
  }

  /**
   * Obtener consultas predefinidas
   */
  static async getConsultasPredefinidas(): Promise<ServiceResult<any>> {
    try {
      const consultas = {
        stockCritico: await this.getStockCritico(),
        movimientosMesActual: await this.getMovimientosMesActual(),
        lotesProximosVencer: await this.getLotesProximosVencer(),
        discrepanciasInventario: await this.getDiscrepanciasInventario()
      };

      return {
        success: true,
        data: consultas
      };
    } catch (error) {
      console.error('Error en KardexService.getConsultasPredefinidas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener consultas predefinidas'
      };
    }
  }

  /**
   * Consultas predefinidas específicas
   */
  private static async getStockCritico(): Promise<any[]> {
    // Obtener items con stock por debajo del mínimo
    const stockCritico = await prisma.$queryRaw`
      SELECT
        k.tipo,
        k.item_id,
        k.lote_id,
        k.saldo_actual,
        CASE
          WHEN k.tipo = 'vacuna' THEN v.nombre
          WHEN k.tipo = 'jeringa' THEN j.tipo
        END as item_nombre,
        CASE
          WHEN k.tipo = 'vacuna' THEN lv.numero
          WHEN k.tipo = 'jeringa' THEN lj.numero
        END as lote_numero
      FROM (
        SELECT DISTINCT ON (tipo, item_id, lote_id)
          tipo, item_id, lote_id, saldo_actual
        FROM kardex
        ORDER BY tipo, item_id, lote_id, fecha_movimiento DESC
      ) k
      LEFT JOIN vacunas v ON k.tipo = 'vacuna' AND k.item_id = v.id
      LEFT JOIN jeringas j ON k.tipo = 'jeringa' AND k.item_id = j.id
      LEFT JOIN lotes_vacunas lv ON k.tipo = 'vacuna' AND k.lote_id = lv.id
      LEFT JOIN lotes_jeringas lj ON k.tipo = 'jeringa' AND k.lote_id = lj.id
      WHERE k.saldo_actual < 50
      ORDER BY k.saldo_actual ASC
    `;

    return stockCritico as any[];
  }

  private static async getMovimientosMesActual(): Promise<any[]> {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date();
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    const movimientos = await prisma.kardex.findMany({
      where: {
        fechaMovimiento: {
          gte: inicioMes,
          lte: finMes
        }
      },
      include: {
        usuario: {
          select: {
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: {
        fechaMovimiento: 'desc'
      },
      take: 100
    });

    return movimientos;
  }

  private static async getLotesProximosVencer(): Promise<any[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30); // Próximos 30 días

    const lotesVacunas = await prisma.loteVacuna.findMany({
      where: {
        fechaVencimiento: {
          lte: fechaLimite
        },
        cantidadActual: {
          gt: 0
        }
      },
      include: {
        vacuna: {
          select: {
            nombre: true
          }
        }
      }
    });

    const lotesJeringas = await prisma.loteJeringa.findMany({
      where: {
        fechaVencimiento: {
          lte: fechaLimite
        },
        cantidadActual: {
          gt: 0
        }
      },
      include: {
        jeringa: {
          select: {
            tipo: true
          }
        }
      }
    });

    return [
      ...lotesVacunas.map(lote => ({
        ...lote,
        tipo: 'vacuna',
        itemNombre: lote.vacuna.nombre
      })),
      ...lotesJeringas.map(lote => ({
        ...lote,
        tipo: 'jeringa',
        itemNombre: lote.jeringa.tipo
      }))
    ];
  }

  private static async getDiscrepanciasInventario(): Promise<any[]> {
    // Buscar ajustes recientes que indiquen discrepancias
    const ajustes = await prisma.kardex.findMany({
      where: {
        tipoMovimiento: 'ajuste',
        fechaMovimiento: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      },
      include: {
        usuario: {
          select: {
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: {
        fechaMovimiento: 'desc'
      }
    });

    return ajustes;
  }
}
