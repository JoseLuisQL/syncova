import { prisma } from '@/config/database';
import { ILoteJeringa, CreateLoteJeringaDto, UpdateLoteJeringaDto, EstadoLote, ServiceResult } from '@/types';
import { HttpError } from '@/middleware/errorHandler';
import { createError } from '@/utils/errors';
import { TipoMovimientoKardex } from '@prisma/client';
import { AlmacenCentralService } from './AlmacenCentralService';
import { KardexService } from './KardexService';

/**
 * Servicio para gestión de lotes de jeringas
 */
export class LoteJeringaService {
  /**
   * Obtener todos los lotes de jeringas con filtros opcionales
   */
  static async getAll(filters?: {
    estado?: EstadoLote | 'todos';
    search?: string;
    jeringaId?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ lotes: ILoteJeringa[]; total: number }>> {
    try {
      const {
        estado,
        search,
        jeringaId,
        page = 1,
        limit = 1000 // Increased from 50 to handle larger datasets
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (estado && estado !== 'todos') {
        where.estado = estado;
      }

      if (jeringaId) {
        where.jeringaId = jeringaId;
      }

      if (search) {
        where.OR = [
          {
            numero: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            numeroComprobante: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Ejecutar consultas en paralelo
      const [lotes, total] = await Promise.all([
        prisma.loteJeringa.findMany({
          where,
          include: {
            jeringa: {
              select: {
                id: true,
                tipo: true,
                capacidad: true,
                color: true
              }
            }
          },
          orderBy: [
            { fechaIngreso: 'desc' },
            { createdAt: 'desc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.loteJeringa.count({ where })
      ]);

      return {
        success: true,
        data: { lotes, total },
        message: 'Lotes de jeringas obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener lotes de jeringas:', error);
      throw new HttpError('Error interno del servidor', 500);
    }
  }

  /**
   * Obtener lote de jeringa por ID
   */
  static async getById(id: string): Promise<ServiceResult<ILoteJeringa>> {
    try {
      const lote = await prisma.loteJeringa.findUnique({
        where: { id },
        include: {
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      if (!lote) {
        throw new HttpError('Lote de jeringa no encontrado', 404);
      }

      return {
        success: true,
        data: lote,
        message: 'Lote de jeringa obtenido exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al obtener lote de jeringa:', error);
      throw new HttpError('Error interno del servidor', 500);
    }
  }

  /**
   * Crear nuevo lote de jeringa
   */
  static async create(data: CreateLoteJeringaDto): Promise<ServiceResult<ILoteJeringa>> {
    try {
      // Validaciones de negocio
      await this.validateLoteData(data);

      // Verificar que la jeringa existe
      const jeringa = await prisma.jeringa.findUnique({
        where: { id: data.jeringaId }
      });

      if (!jeringa) {
        throw new HttpError('La jeringa especificada no existe', 400);
      }

      if (jeringa.estado === 'inactivo') {
        throw new HttpError('No se puede crear un lote para una jeringa inactiva', 400);
      }

      // Verificar que el número de lote sea único
      const existingLote = await prisma.loteJeringa.findUnique({
        where: { numero: data.numero }
      });

      if (existingLote) {
        throw new HttpError('Ya existe un lote con este número', 400);
      }

      // Determinar estado automáticamente basado en la cantidad inicial (no actual)
      // ya que la cantidad actual se establecerá a través del Kardex
      const estado = this.determinarEstado(data.fechaVencimiento, data.cantidadInicial);

      // Crear el lote con cantidadActual = 0 inicialmente
      // El Kardex se encargará de establecer la cantidad correcta
      const lote = await prisma.loteJeringa.create({
        data: {
          ...data,
          cantidadActual: 0, // Inicializar en 0, el Kardex la actualizará
          estado
        },
        include: {
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      // Registrar automáticamente el ingreso en Kardex
      console.log(`📝 [LoteJeringaService] Registrando ingreso en Kardex para lote ${lote.numero}`);

      const almacenCentralResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
      if (almacenCentralResult.success) {
        // Obtener un usuario administrador del sistema para el registro automático
        const usuarioSistema = await prisma.usuario.findFirst({
          where: {
            rol: 'administrador',
            estado: 'activo'
          }
        });

        if (!usuarioSistema) {
          console.warn(`⚠️ [LoteJeringaService] No se encontró usuario administrador para registro automático`);
        } else {
          try {
            const kardexResult = await KardexService.generarMovimientoAutomatico({
              tipo: 'jeringa',
              itemId: data.jeringaId,
              loteId: lote.id,
              tipoMovimiento: TipoMovimientoKardex.ingreso,
              cantidad: data.cantidadInicial,
              establecimientoDestinoId: almacenCentralResult.data, // ALMACÉN (CHANKA) como destino
              documento: data.comprobanteClase || 'INGRESO',
              numeroDocumento: data.numeroComprobante || lote.numero,
              observaciones: `Ingreso de lote ${lote.numero} - ${data.comprobanteClase || 'INGRESO'}: ${data.numeroComprobante || 'N/A'}`,
              usuarioId: usuarioSistema.id,
              fechaMovimiento: new Date() // Usar fecha y hora actual para el movimiento
            });

            if (!kardexResult.success) {
              console.warn(`⚠️ [LoteJeringaService] No se pudo registrar en Kardex: ${kardexResult.error}`);
            } else {
              console.log(`✅ [LoteJeringaService] Movimiento registrado en Kardex exitosamente`);

              // Actualizar el estado del lote después del registro exitoso en Kardex
              // ya que ahora tiene la cantidad correcta
              const estadoFinal = this.determinarEstado(data.fechaVencimiento, data.cantidadInicial);
              await prisma.loteJeringa.update({
                where: { id: lote.id },
                data: { estado: estadoFinal }
              });
            }
          } catch (kardexError) {
            console.error(`❌ [LoteJeringaService] Error al registrar en Kardex:`, kardexError);
          }
        }
      } else {
        console.warn(`⚠️ [LoteJeringaService] No se pudo obtener almacén central: ${almacenCentralResult.error}`);
      }

      return {
        success: true,
        data: lote,
        message: 'Lote de jeringa creado exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al crear lote de jeringa:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar lote de jeringa
   */
  static async update(id: string, data: UpdateLoteJeringaDto): Promise<ServiceResult<ILoteJeringa>> {
    try {
      // Verificar que el lote existe
      const existingLote = await prisma.loteJeringa.findUnique({
        where: { id }
      });

      if (!existingLote) {
        throw createError('Lote de jeringa no encontrado', 404);
      }

      // Validaciones de negocio
      await this.validateUpdateData(data, existingLote);

      // Si se actualiza el número, verificar unicidad
      if (data.numero && data.numero !== existingLote.numero) {
        const duplicateNumber = await prisma.loteJeringa.findUnique({
          where: { numero: data.numero }
        });

        if (duplicateNumber) {
          throw createError('Ya existe un lote con este número', 400);
        }
      }

      // Determinar estado automáticamente si se actualiza cantidad o vencimiento
      let estado = data.estado;
      if (data.cantidadActual !== undefined || data.fechaVencimiento !== undefined) {
        const cantidadActual = data.cantidadActual ?? existingLote.cantidadActual;
        const fechaVencimiento = data.fechaVencimiento ?? existingLote.fechaVencimiento;
        estado = this.determinarEstado(fechaVencimiento, cantidadActual);
      }

      const lote = await prisma.loteJeringa.update({
        where: { id },
        data: {
          ...data,
          estado
        },
        include: {
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      return {
        success: true,
        data: lote,
        message: 'Lote de jeringa actualizado exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al actualizar lote de jeringa:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar lote de jeringa
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const existingLote = await prisma.loteJeringa.findUnique({
        where: { id }
      });

      if (!existingLote) {
        throw createError('Lote de jeringa no encontrado', 404);
      }

      await prisma.loteJeringa.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Lote de jeringa eliminado exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al eliminar lote de jeringa:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de lotes de jeringas
   */
  static async getStats(): Promise<ServiceResult<{
    total: number;
    disponibles: number;
    agotados: number;
    stockTotal: number;
    porJeringa: Array<{
      jeringaId: string;
      jeringa: { tipo: string; capacidad: string; color: string };
      totalLotes: number;
      stockTotal: number;
    }>;
  }>> {
    try {
      const [total, disponibles, agotados, stockData, porJeringa] = await Promise.all([
        prisma.loteJeringa.count(),
        prisma.loteJeringa.count({ where: { estado: 'disponible' } }),
        prisma.loteJeringa.count({ where: { estado: 'agotado' } }),
        prisma.loteJeringa.aggregate({
          _sum: { cantidadActual: true }
        }),
        prisma.loteJeringa.groupBy({
          by: ['jeringaId'],
          _count: { id: true },
          _sum: { cantidadActual: true }
        })
      ]);

      // Obtener información de jeringas para los grupos
      const jeringaIds = porJeringa.map(item => item.jeringaId);
      const jeringas = await prisma.jeringa.findMany({
        where: { id: { in: jeringaIds } },
        select: { id: true, tipo: true, capacidad: true, color: true }
      });

      const porJeringaWithDetails = porJeringa.map(item => {
        const jeringa = jeringas.find(j => j.id === item.jeringaId);
        return {
          jeringaId: item.jeringaId,
          jeringa: jeringa || { tipo: 'Desconocido', capacidad: '', color: '' },
          totalLotes: item._count.id,
          stockTotal: item._sum.cantidadActual || 0
        };
      });

      return {
        success: true,
        data: {
          total,
          disponibles,
          agotados,
          stockTotal: stockData._sum.cantidadActual || 0,
          porJeringa: porJeringaWithDetails
        },
        message: 'Estadísticas de lotes de jeringas obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de lotes de jeringas:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Obtener lotes por jeringa
   */
  static async getByJeringa(jeringaId: string): Promise<ServiceResult<ILoteJeringa[]>> {
    try {
      const lotes = await prisma.loteJeringa.findMany({
        where: { jeringaId },
        include: {
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        },
        orderBy: [
          { fechaIngreso: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      return {
        success: true,
        data: lotes,
        message: 'Lotes de jeringa obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener lotes por jeringa:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Obtener lotes con stock bajo
   */
  static async getStockBajo(porcentaje: number = 20): Promise<ServiceResult<ILoteJeringa[]>> {
    try {
      const lotes = await prisma.loteJeringa.findMany({
        where: {
          estado: 'disponible',
          cantidadActual: { gt: 0 }
        },
        include: {
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        },
        orderBy: { cantidadActual: 'asc' }
      });

      // Filtrar lotes con stock bajo
      const lotesStockBajo = lotes.filter(lote => {
        const porcentajeActual = (lote.cantidadActual / lote.cantidadInicial) * 100;
        return porcentajeActual <= porcentaje;
      });

      return {
        success: true,
        data: lotesStockBajo,
        message: 'Lotes con stock bajo obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener lotes con stock bajo:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  // =====================================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN Y UTILIDADES
  // =====================================================

  /**
   * Validar datos de lote de jeringa
   */
  private static async validateLoteData(data: CreateLoteJeringaDto): Promise<void> {
    // Validar número de lote
    if (!data.numero || data.numero.trim().length === 0) {
      throw new HttpError('El número de lote es requerido', 400);
    }

    if (data.numero.length > 100) {
      throw new HttpError('El número de lote no puede exceder 100 caracteres', 400);
    }

    // Validar fechas
    if (!data.fechaIngreso) {
      throw new HttpError('La fecha de ingreso es requerida', 400);
    }

    const fechaIngreso = new Date(data.fechaIngreso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fechaIngreso > today) {
      throw new HttpError('La fecha de ingreso no puede ser futura', 400);
    }

    // Validar fecha de vencimiento si se proporciona
    if (data.fechaVencimiento) {
      const fechaVencimiento = new Date(data.fechaVencimiento);
      if (fechaVencimiento <= fechaIngreso) {
        throw new HttpError('La fecha de vencimiento debe ser posterior a la fecha de ingreso', 400);
      }
    }

    // Validar cantidades
    if (!data.cantidadInicial || data.cantidadInicial <= 0) {
      throw new HttpError('La cantidad inicial debe ser mayor a 0', 400);
    }

    if (!data.cantidadActual || data.cantidadActual < 0) {
      throw new HttpError('La cantidad actual no puede ser negativa', 400);
    }

    if (data.cantidadActual > data.cantidadInicial) {
      throw new HttpError('La cantidad actual no puede ser mayor a la cantidad inicial', 400);
    }

    // Validar número de comprobante
    if (!data.numeroComprobante || data.numeroComprobante.trim().length === 0) {
      throw new HttpError('El número de comprobante es requerido', 400);
    }

    if (data.numeroComprobante.length > 100) {
      throw new HttpError('El número de comprobante no puede exceder 100 caracteres', 400);
    }
  }

  /**
   * Validar datos de actualización
   */
  private static async validateUpdateData(data: UpdateLoteJeringaDto, existingLote: any): Promise<void> {
    // Validar número de lote si se actualiza
    if (data.numero !== undefined) {
      if (!data.numero || data.numero.trim().length === 0) {
        throw createError('El número de lote no puede estar vacío', 400);
      }

      if (data.numero.length > 100) {
        throw createError('El número de lote no puede exceder 100 caracteres', 400);
      }
    }

    // Validar fechas si se actualizan
    if (data.fechaIngreso !== undefined) {
      const fechaIngreso = new Date(data.fechaIngreso);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fechaIngreso > today) {
        throw createError('La fecha de ingreso no puede ser futura', 400);
      }

      // Validar con fecha de vencimiento existente o nueva
      const fechaVencimiento = data.fechaVencimiento ?? existingLote.fechaVencimiento;
      if (fechaVencimiento && fechaVencimiento <= fechaIngreso) {
        throw createError('La fecha de vencimiento debe ser posterior a la fecha de ingreso', 400);
      }
    }

    if (data.fechaVencimiento !== undefined && data.fechaVencimiento !== null) {
      const fechaVencimiento = new Date(data.fechaVencimiento);
      const fechaIngreso = data.fechaIngreso ?? existingLote.fechaIngreso;

      if (fechaVencimiento <= fechaIngreso) {
        throw createError('La fecha de vencimiento debe ser posterior a la fecha de ingreso', 400);
      }
    }

    // Validar cantidades si se actualizan
    if (data.cantidadInicial !== undefined) {
      if (data.cantidadInicial <= 0) {
        throw createError('La cantidad inicial debe ser mayor a 0', 400);
      }

      const cantidadActual = data.cantidadActual ?? existingLote.cantidadActual;
      if (cantidadActual > data.cantidadInicial) {
        throw createError('La cantidad actual no puede ser mayor a la cantidad inicial', 400);
      }
    }

    if (data.cantidadActual !== undefined) {
      if (data.cantidadActual < 0) {
        throw createError('La cantidad actual no puede ser negativa', 400);
      }

      const cantidadInicial = data.cantidadInicial ?? existingLote.cantidadInicial;
      if (data.cantidadActual > cantidadInicial) {
        throw createError('La cantidad actual no puede ser mayor a la cantidad inicial', 400);
      }
    }

    // Validar número de comprobante si se actualiza
    if (data.numeroComprobante !== undefined) {
      if (!data.numeroComprobante || data.numeroComprobante.trim().length === 0) {
        throw createError('El número de comprobante no puede estar vacío', 400);
      }

      if (data.numeroComprobante.length > 100) {
        throw createError('El número de comprobante no puede exceder 100 caracteres', 400);
      }
    }
  }

  /**
   * Determinar estado automáticamente
   */
  private static determinarEstado(fechaVencimiento?: Date, cantidadActual?: number): EstadoLote {
    // Si no hay stock, está agotado
    if (cantidadActual === 0) {
      return 'agotado';
    }

    // Si tiene fecha de vencimiento y ya venció, está vencido
    if (fechaVencimiento) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const vencimiento = new Date(fechaVencimiento);
      vencimiento.setHours(0, 0, 0, 0);

      if (vencimiento < today) {
        return 'vencido';
      }
    }

    // En cualquier otro caso, está disponible
    return 'disponible';
  }
}
