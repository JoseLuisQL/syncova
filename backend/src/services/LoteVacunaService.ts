import { prisma } from '@/config/database';
import { ILoteVacuna, CreateLoteVacunaDto, UpdateLoteVacunaDto, EstadoLote, FormaIngreso, ComprobanteClase, ServiceResult } from '@/types';
import { HttpError } from '@/middleware/errorHandler';
import { createError } from '@/utils/errors';
import { getDefaultLimit, getSafeLimit } from '@/config/pagination';
import { TipoMovimientoKardex } from '@prisma/client';
import { AlmacenCentralService } from './AlmacenCentralService';
import { KardexService } from './KardexService';

/**
 * Servicio para gestión de lotes de vacunas
 */
export class LoteVacunaService {
  /**
   * Obtener todos los lotes de vacunas con filtros opcionales
   */
  static async getAll(filters?: {
    estado?: EstadoLote | 'todos';
    search?: string;
    vacunaId?: string;
    vencimiento?: 'todos' | 'vigente' | 'por_vencer' | 'vencido';
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ lotes: ILoteVacuna[]; total: number }>> {
    try {
      const {
        estado,
        search,
        vacunaId,
        vencimiento,
        page = 1,
        limit = getDefaultLimit('LOTES_VACUNAS') // Use configurable default limit
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (estado && estado !== 'todos') {
        where.estado = estado;
      }

      if (vacunaId) {
        where.vacunaId = vacunaId;
      }

      if (search) {
        where.OR = [
          { numero: { contains: search, mode: 'insensitive' } },
          { numeroComprobante: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Filtro por vencimiento
      if (vencimiento && vencimiento !== 'todos') {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        switch (vencimiento) {
          case 'vencido':
            where.fechaVencimiento = { lt: today };
            break;
          case 'por_vencer':
            where.fechaVencimiento = { 
              gte: today,
              lte: thirtyDaysFromNow 
            };
            break;
          case 'vigente':
            where.fechaVencimiento = { gt: thirtyDaysFromNow };
            break;
        }
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Ejecutar consultas en paralelo
      const [lotes, total] = await Promise.all([
        prisma.loteVacuna.findMany({
          where,
          include: {
            vacuna: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                presentacion: true
              }
            }
          },
          orderBy: [
            { fechaVencimiento: 'asc' },
            { createdAt: 'desc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.loteVacuna.count({ where })
      ]);

      return {
        success: true,
        data: { lotes, total },
        message: 'Lotes de vacunas obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener lotes de vacunas:', error);
      throw new HttpError('Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de lotes de vacunas
   */
  static async getStats(): Promise<ServiceResult<{
    total: number;
    disponibles: number;
    agotados: number;
    vencidos: number;
    porVencer: number;
    stockTotal: number;
  }>> {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const [
        total,
        disponibles,
        agotados,
        vencidos,
        porVencer,
        stockTotal
      ] = await Promise.all([
        prisma.loteVacuna.count(),
        prisma.loteVacuna.count({ where: { estado: 'disponible' } }),
        prisma.loteVacuna.count({ where: { estado: 'agotado' } }),
        prisma.loteVacuna.count({ where: { estado: 'vencido' } }),
        prisma.loteVacuna.count({
          where: {
            fechaVencimiento: {
              gte: today,
              lte: thirtyDaysFromNow
            },
            estado: { not: 'vencido' }
          }
        }),
        prisma.loteVacuna.aggregate({
          _sum: {
            cantidadActual: true
          }
        })
      ]);

      return {
        success: true,
        data: {
          total,
          disponibles,
          agotados,
          vencidos,
          porVencer,
          stockTotal: stockTotal._sum.cantidadActual || 0
        },
        message: 'Estadísticas obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de lotes:', error);
      throw new HttpError('Error interno del servidor', 500);
    }
  }

  /**
   * Obtener lote de vacuna por ID
   */
  static async getById(id: string): Promise<ServiceResult<ILoteVacuna>> {
    try {
      const lote = await prisma.loteVacuna.findUnique({
        where: { id },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          }
        }
      });

      if (!lote) {
        throw new HttpError('Lote de vacuna no encontrado', 404);
      }

      return {
        success: true,
        data: lote,
        message: 'Lote de vacuna obtenido exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al obtener lote de vacuna:', error);
      throw new HttpError('Error interno del servidor', 500);
    }
  }

  /**
   * Crear nuevo lote de vacuna
   */
  static async create(data: CreateLoteVacunaDto): Promise<ServiceResult<ILoteVacuna>> {
    try {
      // Validaciones de negocio
      await this.validateLoteData(data);

      // Verificar que la vacuna existe
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: data.vacunaId }
      });

      if (!vacuna) {
        throw new HttpError('La vacuna especificada no existe', 400);
      }

      if (vacuna.estado === 'inactivo') {
        throw new HttpError('No se puede crear un lote para una vacuna inactiva', 400);
      }

      // Verificar que el número de lote sea único
      const existingLote = await prisma.loteVacuna.findUnique({
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
      const lote = await prisma.loteVacuna.create({
        data: {
          ...data,
          cantidadActual: 0, // Inicializar en 0, el Kardex la actualizará
          estado
        },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          }
        }
      });

      // Registrar automáticamente el ingreso en Kardex
      console.log(`📝 [LoteVacunaService] Registrando ingreso en Kardex para lote ${lote.numero}`);

      const almacenCentralResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
      if (almacenCentralResult.success) {
        console.log(`📦 [LoteVacunaService] Almacén central obtenido: ${almacenCentralResult.data}`);

        // Verificar que el establecimiento existe antes de continuar
        const establecimientoVerificacion = await prisma.establecimiento.findUnique({
          where: { id: almacenCentralResult.data },
          select: { id: true, nombre: true, codigo: true, estado: true }
        });

        if (!establecimientoVerificacion) {
          console.error(`❌ [LoteVacunaService] CRÍTICO: Establecimiento ${almacenCentralResult.data} no existe en BD`);
          console.warn(`⚠️ [LoteVacunaService] No se pudo registrar en Kardex: Establecimiento destino no encontrado`);
        } else {
          console.log(`✅ [LoteVacunaService] Establecimiento verificado: ${establecimientoVerificacion.nombre} (${establecimientoVerificacion.codigo})`);

          // Obtener un usuario administrador del sistema para el registro automático
          const usuarioSistema = await prisma.usuario.findFirst({
            where: {
              rol: 'administrador',
              estado: 'activo'
            }
          });

          if (!usuarioSistema) {
            console.warn(`⚠️ [LoteVacunaService] No se encontró usuario administrador para registro automático`);
          } else {
            console.log(`👤 [LoteVacunaService] Usuario administrador encontrado: ${usuarioSistema.nombres} ${usuarioSistema.apellidos} (${usuarioSistema.id})`);

            try {
              const kardexData = {
                tipo: 'vacuna' as const,
                itemId: data.vacunaId,
                loteId: lote.id,
                tipoMovimiento: TipoMovimientoKardex.ingreso,
                cantidad: data.cantidadInicial,
                establecimientoDestinoId: almacenCentralResult.data, // ALMACÉN (CHANKA) como destino
                documento: data.comprobanteClase || 'INGRESO',
                numeroDocumento: data.numeroComprobante || lote.numero,
                observaciones: `Ingreso de lote ${lote.numero} - ${data.comprobanteClase || 'INGRESO'}: ${data.numeroComprobante || 'N/A'}`,
                usuarioId: usuarioSistema.id,
                fechaMovimiento: new Date() // Usar fecha y hora actual para el movimiento
              };

              console.log(`📝 [LoteVacunaService] Datos para Kardex:`, JSON.stringify(kardexData, null, 2));

              const kardexResult = await KardexService.generarMovimientoAutomatico(kardexData);

              if (!kardexResult.success) {
                console.warn(`⚠️ [LoteVacunaService] No se pudo registrar en Kardex: ${kardexResult.error}`);
              } else {
                console.log(`✅ [LoteVacunaService] Movimiento registrado en Kardex exitosamente`);

                // Actualizar el estado del lote después del registro exitoso en Kardex
                // ya que ahora tiene la cantidad correcta
                const estadoFinal = this.determinarEstado(data.fechaVencimiento, data.cantidadInicial);
                await prisma.loteVacuna.update({
                  where: { id: lote.id },
                  data: { estado: estadoFinal }
                });
              }
            } catch (kardexError) {
              console.error(`❌ [LoteVacunaService] Error al registrar en Kardex:`, kardexError);
            }
          }
        }
      } else {
        console.warn(`⚠️ [LoteVacunaService] No se pudo obtener almacén central: ${almacenCentralResult.error}`);
      }

      return {
        success: true,
        data: lote,
        message: 'Lote de vacuna creado exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al crear lote de vacuna:', error);
      throw new HttpError('Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar lote de vacuna
   */
  static async update(id: string, data: UpdateLoteVacunaDto): Promise<ServiceResult<ILoteVacuna>> {
    try {
      // Verificar que el lote existe
      const existingLote = await prisma.loteVacuna.findUnique({
        where: { id }
      });

      if (!existingLote) {
        throw new HttpError('Lote de vacuna no encontrado', 404);
      }

      // Guardar cantidad anterior para detectar cambios
      const cantidadAnterior = existingLote.cantidadActual;

      // Validaciones de negocio
      await this.validateUpdateData(data, existingLote);

      // Si se actualiza el número, verificar unicidad
      if (data.numero && data.numero !== existingLote.numero) {
        const duplicateNumber = await prisma.loteVacuna.findUnique({
          where: { numero: data.numero }
        });

        if (duplicateNumber) {
          throw new HttpError('Ya existe un lote con este número', 400);
        }
      }

      // Determinar estado si se actualizan campos relevantes
      let estado = data.estado;
      if (data.fechaVencimiento !== undefined || data.cantidadActual !== undefined) {
        const fechaVencimiento = data.fechaVencimiento || existingLote.fechaVencimiento;
        const cantidadActual = data.cantidadActual !== undefined ? data.cantidadActual : existingLote.cantidadActual;
        estado = this.determinarEstado(fechaVencimiento, cantidadActual);
      }

      // Extraer usuarioId antes de actualizar (no es un campo del modelo)
      const { usuarioId, ...updateDataForPrisma } = data;

      const lote = await prisma.loteVacuna.update({
        where: { id },
        data: {
          ...updateDataForPrisma,
          estado
        },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          }
        }
      });

      // Registrar ajuste en Kardex si cambió la cantidad actual
      if (data.cantidadActual !== undefined && data.cantidadActual !== cantidadAnterior) {
        const diferencia = data.cantidadActual - cantidadAnterior;
        
        console.log(`📊 [LoteVacunaService] Detectado cambio de cantidad: ${cantidadAnterior} -> ${data.cantidadActual} (diferencia: ${diferencia})`);
        
        // Obtener el almacén central para el registro
        const almacenCentralResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
        
        if (almacenCentralResult.success && usuarioId) {
          try {
            const observacionAjuste = diferencia > 0 
              ? `Ajuste manual: Incremento de ${cantidadAnterior} a ${data.cantidadActual} (+${diferencia})`
              : `Ajuste manual: Decremento de ${cantidadAnterior} a ${data.cantidadActual} (${diferencia})`;

            const kardexData = {
              tipo: 'vacuna' as const,
              itemId: existingLote.vacunaId,
              loteId: id,
              tipoMovimiento: TipoMovimientoKardex.ajuste,
              cantidad: Math.abs(diferencia),
              establecimientoDestinoId: almacenCentralResult.data,
              documento: 'CORRECCION_STOCK',
              numeroDocumento: existingLote.numero,
              observaciones: observacionAjuste,
              usuarioId: usuarioId,
              fechaMovimiento: new Date()
            };

            console.log(`📝 [LoteVacunaService] Registrando ajuste en Kardex:`, JSON.stringify(kardexData, null, 2));

            const kardexResult = await KardexService.generarMovimientoAutomatico(kardexData);

            if (!kardexResult.success) {
              console.warn(`⚠️ [LoteVacunaService] No se pudo registrar ajuste en Kardex: ${kardexResult.error}`);
            } else {
              console.log(`✅ [LoteVacunaService] Ajuste registrado en Kardex exitosamente`);
            }
          } catch (kardexError) {
            console.error(`❌ [LoteVacunaService] Error al registrar ajuste en Kardex:`, kardexError);
          }
        } else {
          if (!almacenCentralResult.success) {
            console.warn(`⚠️ [LoteVacunaService] No se pudo obtener almacén central para registro en Kardex`);
          }
          if (!usuarioId) {
            console.warn(`⚠️ [LoteVacunaService] No se proporcionó usuarioId para registro en Kardex`);
          }
        }
      }

      return {
        success: true,
        data: lote,
        message: 'Lote de vacuna actualizado exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al actualizar lote de vacuna:', error);
      throw new HttpError('Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar lote de vacuna
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Verificar que el lote existe
      const existingLote = await prisma.loteVacuna.findUnique({
        where: { id }
      });

      if (!existingLote) {
        throw new HttpError('Lote de vacuna no encontrado', 404);
      }

      // TODO: Verificar dependencias (kardex, movimientos, etc.)
      // Por ahora permitimos eliminación directa

      await prisma.loteVacuna.delete({
        where: { id }
      });

      return {
        success: true,
        data: undefined,
        message: 'Lote de vacuna eliminado exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al eliminar lote de vacuna:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Validar datos del lote de vacuna
   */
  private static async validateLoteData(data: CreateLoteVacunaDto): Promise<void> {
    // Validar fechas
    if (data.fechaVencimiento <= data.fechaIngreso) {
      throw new HttpError('La fecha de vencimiento debe ser posterior a la fecha de ingreso', 400);
    }

    // Validar cantidades
    if (data.cantidadInicial <= 0) {
      throw new HttpError('La cantidad inicial debe ser mayor a 0', 400);
    }

    if (data.cantidadActual < 0) {
      throw new HttpError('La cantidad actual no puede ser negativa', 400);
    }

    if (data.cantidadActual > data.cantidadInicial) {
      throw new HttpError('La cantidad actual no puede ser mayor a la cantidad inicial', 400);
    }

    // Validar número de lote
    if (!data.numero || data.numero.trim().length === 0) {
      throw new HttpError('El número de lote es requerido', 400);
    }

    if (data.numero.length > 100) {
      throw new HttpError('El número de lote no puede exceder 100 caracteres', 400);
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
   * Validar datos de actualización del lote
   */
  private static async validateUpdateData(data: UpdateLoteVacunaDto, existingLote: any): Promise<void> {
    // Validar fechas si se proporcionan
    if (data.fechaVencimiento && data.fechaIngreso) {
      if (data.fechaVencimiento <= data.fechaIngreso) {
        throw createError('La fecha de vencimiento debe ser posterior a la fecha de ingreso', 400);
      }
    } else if (data.fechaVencimiento && !data.fechaIngreso) {
      if (data.fechaVencimiento <= existingLote.fechaIngreso) {
        throw createError('La fecha de vencimiento debe ser posterior a la fecha de ingreso', 400);
      }
    } else if (data.fechaIngreso && !data.fechaVencimiento) {
      if (existingLote.fechaVencimiento <= data.fechaIngreso) {
        throw createError('La fecha de vencimiento debe ser posterior a la fecha de ingreso', 400);
      }
    }

    // Validar cantidades
    if (data.cantidadInicial !== undefined && data.cantidadInicial <= 0) {
      throw createError('La cantidad inicial debe ser mayor a 0', 400);
    }

    if (data.cantidadActual !== undefined && data.cantidadActual < 0) {
      throw createError('La cantidad actual no puede ser negativa', 400);
    }

    // Validar relación entre cantidades
    const cantidadInicial = data.cantidadInicial !== undefined ? data.cantidadInicial : existingLote.cantidadInicial;
    const cantidadActual = data.cantidadActual !== undefined ? data.cantidadActual : existingLote.cantidadActual;

    if (cantidadActual > cantidadInicial) {
      throw createError('La cantidad actual no puede ser mayor a la cantidad inicial', 400);
    }

    // Validar longitud de campos de texto
    if (data.numero && data.numero.length > 100) {
      throw createError('El número de lote no puede exceder 100 caracteres', 400);
    }

    if (data.numeroComprobante && data.numeroComprobante.length > 100) {
      throw createError('El número de comprobante no puede exceder 100 caracteres', 400);
    }
  }

  /**
   * Determinar estado automáticamente basado en fecha de vencimiento y cantidad
   */
  private static determinarEstado(fechaVencimiento: Date, cantidadActual: number): EstadoLote {
    const today = new Date();

    // Si está vencido
    if (fechaVencimiento < today) {
      return 'vencido';
    }

    // Si no tiene stock
    if (cantidadActual === 0) {
      return 'agotado';
    }

    // Si tiene stock y no está vencido
    return 'disponible';
  }

  /**
   * Obtener lotes por vacuna
   */
  static async getByVacuna(vacunaId: string): Promise<ServiceResult<ILoteVacuna[]>> {
    try {
      const lotes = await prisma.loteVacuna.findMany({
        where: { vacunaId },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          }
        },
        orderBy: [
          { fechaVencimiento: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      return {
        success: true,
        data: lotes,
        message: 'Lotes de vacuna obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener lotes por vacuna:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Obtener lotes próximos a vencer
   */
  static async getProximosAVencer(dias: number = 30): Promise<ServiceResult<ILoteVacuna[]>> {
    try {
      const today = new Date();
      const limitDate = new Date();
      limitDate.setDate(today.getDate() + dias);

      const lotes = await prisma.loteVacuna.findMany({
        where: {
          fechaVencimiento: {
            gte: today,
            lte: limitDate
          },
          estado: { not: 'vencido' },
          cantidadActual: { gt: 0 }
        },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          }
        },
        orderBy: { fechaVencimiento: 'asc' }
      });

      return {
        success: true,
        data: lotes,
        message: 'Lotes próximos a vencer obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener lotes próximos a vencer:', error);
      throw new HttpError('Error interno del servidor', 500);
    }
  }
}
