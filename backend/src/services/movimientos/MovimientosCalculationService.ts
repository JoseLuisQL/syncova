import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { StockInicialService } from '../StockInicialService';

/**
 * Service for Movimientos calculation and synchronization operations
 * Handles redistribution, sync with planificacion, and stock calculations
 */
export class MovimientosCalculationService {

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
   * Redistribute deliveries automatically when a delivery is modified
   */
  static async redistribuirEntregasAutomaticamente(
    tx: any,
    movimientoOriginal: any,
    nuevaEntrega: number,
    usuarioId: string
  ): Promise<ServiceResult<{ movimientosAfectados: number; redistribucion: string }>> {
    try {
      if (nuevaEntrega < 0) {
        throw new Error('La nueva entrega no puede ser negativa');
      }

      if (movimientoOriginal.anio > 2050) {
        throw new Error('No se puede redistribuir entregas para años posteriores a 2050');
      }

      const entregaAnterior = movimientoOriginal.entrega;
      const diferencia = nuevaEntrega - entregaAnterior;

      console.log(`🔄 [Redistribución] Establecimiento: ${movimientoOriginal.establecimientoId}, Mes: ${movimientoOriginal.mes}/${movimientoOriginal.anio}`);
      console.log(`🔄 [Redistribución] Entrega anterior: ${entregaAnterior}, Nueva entrega: ${nuevaEntrega}, Diferencia: ${diferencia}`);

      if (diferencia === 0) {
        return {
          success: true,
          data: { movimientosAfectados: 0, redistribucion: 'Sin cambios' }
        };
      }

      if (Math.abs(diferencia) > 10000) {
        throw new Error(`La diferencia de redistribución (${Math.abs(diferencia)}) excede el límite máximo permitido (10,000 unidades)`);
      }

      await this.sincronizarConPlanificacion(tx, {
        ...movimientoOriginal,
        entrega: nuevaEntrega
      }, diferencia);

      if (diferencia > 0) {
        return await this.redistribuirIncremento(tx, movimientoOriginal, diferencia, usuarioId);
      } else {
        return await this.redistribuirDisminucion(tx, movimientoOriginal, Math.abs(diferencia), usuarioId);
      }
    } catch (error) {
      console.error('Error en redistribución automática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en redistribución automática'
      };
    }
  }

  /**
   * Redistribute increment: deduct from following months sequentially
   */
  static async redistribuirIncremento(
    tx: any,
    movimientoOriginal: any,
    incremento: number,
    _usuarioId: string
  ): Promise<ServiceResult<{ movimientosAfectados: number; redistribucion: string }>> {
    try {
      let incrementoRestante = incremento;
      let movimientosAfectados = 0;
      const redistribucionDetalle: string[] = [];

      const movimientosSiguientes = await tx.movimientoVacuna.findMany({
        where: {
          establecimientoId: movimientoOriginal.establecimientoId,
          vacunaId: movimientoOriginal.vacunaId,
          anio: {
            gte: movimientoOriginal.anio
          },
          OR: [
            {
              anio: { gt: movimientoOriginal.anio }
            },
            {
              anio: movimientoOriginal.anio,
              mes: { gt: movimientoOriginal.mes }
            }
          ]
        },
        orderBy: [
          { anio: 'asc' },
          { mes: 'asc' }
        ]
      });

      console.log(`🔍 [Redistribución] Encontrados ${movimientosSiguientes.length} movimientos siguientes`);

      for (const movimiento of movimientosSiguientes) {
        if (incrementoRestante <= 0) break;

        const entregaDisponible = movimiento.entrega;
        const descontar = Math.min(entregaDisponible, incrementoRestante);

        if (descontar > 0) {
          const nuevaEntrega = entregaDisponible - descontar;

          await tx.movimientoVacuna.update({
            where: { id: movimiento.id },
            data: {
              entrega: nuevaEntrega,
              updatedAt: new Date()
            }
          });

          await this.sincronizarConPlanificacion(tx, movimiento, -descontar);

          incrementoRestante -= descontar;
          movimientosAfectados++;
          redistribucionDetalle.push(`${movimiento.mes}/${movimiento.anio}: ${entregaDisponible} → ${nuevaEntrega} (-${descontar})`);

          console.log(`✅ [Redistribución] Mes ${movimiento.mes}/${movimiento.anio}: ${entregaDisponible} → ${nuevaEntrega} (-${descontar})`);
        }
      }

      if (incrementoRestante > 0) {
        throw new Error(`SIN_PLANIFICACION_DISPONIBLE: No hay entregas programadas en los meses siguientes para redistribuir ${incrementoRestante} unidad(es). Para asignar una entrega, primero debes definir las cantidades en el módulo de Planificaciones.`);
      }

      return {
        success: true,
        data: {
          movimientosAfectados,
          redistribucion: `Incremento de ${incremento} redistribuido: ${redistribucionDetalle.join(', ')}`
        }
      };
    } catch (error) {
      console.error('Error en redistribución de incremento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en redistribución de incremento'
      };
    }
  }

  /**
   * Redistribute decrease: transfer to next month
   */
  static async redistribuirDisminucion(
    tx: any,
    movimientoOriginal: any,
    disminucion: number,
    usuarioId: string
  ): Promise<ServiceResult<{ movimientosAfectados: number; redistribucion: string }>> {
    try {
      let mesSiguiente = movimientoOriginal.mes + 1;
      let anioSiguiente = movimientoOriginal.anio;

      if (mesSiguiente > 12) {
        mesSiguiente = 1;
        anioSiguiente++;
      }

      if (anioSiguiente > 2050) {
        throw new Error(`No se puede trasladar entregas al año ${anioSiguiente}. Límite máximo: 2050`);
      }

      console.log(`🔄 [Redistribución] Trasladando ${disminucion} unidades al mes ${mesSiguiente}/${anioSiguiente}`);

      let movimientoSiguiente = await tx.movimientoVacuna.findUnique({
        where: {
          uk_movimiento_establecimiento_vacuna_mes_anio: {
            establecimientoId: movimientoOriginal.establecimientoId,
            vacunaId: movimientoOriginal.vacunaId,
            mes: mesSiguiente,
            anio: anioSiguiente
          }
        }
      });

      if (movimientoSiguiente) {
        const nuevaEntrega = movimientoSiguiente.entrega + disminucion;

        await tx.movimientoVacuna.update({
          where: { id: movimientoSiguiente.id },
          data: {
            entrega: nuevaEntrega,
            updatedAt: new Date()
          }
        });

        await this.sincronizarConPlanificacion(tx, movimientoSiguiente, disminucion);

        console.log(`✅ [Redistribución] Mes ${mesSiguiente}/${anioSiguiente}: ${movimientoSiguiente.entrega} → ${nuevaEntrega} (+${disminucion})`);

        return {
          success: true,
          data: {
            movimientosAfectados: 1,
            redistribucion: `Disminución de ${disminucion} trasladada al mes ${mesSiguiente}/${anioSiguiente}: ${movimientoSiguiente.entrega} → ${nuevaEntrega}`
          }
        };
      } else {
        const nuevoMovimiento = await tx.movimientoVacuna.create({
          data: {
            establecimientoId: movimientoOriginal.establecimientoId,
            vacunaId: movimientoOriginal.vacunaId,
            mes: mesSiguiente,
            anio: anioSiguiente,
            saldoAnterior: 0,
            transIngreso: 0,
            salida: 0,
            transSalida: 0,
            entrega: disminucion,
            usuarioId: usuarioId,
            fechaMovimiento: new Date()
          }
        });

        await this.sincronizarConPlanificacion(tx, nuevoMovimiento, disminucion);

        console.log(`✅ [Redistribución] Creado nuevo movimiento para ${mesSiguiente}/${anioSiguiente} con entrega: ${disminucion}`);

        return {
          success: true,
          data: {
            movimientosAfectados: 1,
            redistribucion: `Disminución de ${disminucion} trasladada creando nuevo movimiento para ${mesSiguiente}/${anioSiguiente}`
          }
        };
      }
    } catch (error) {
      console.error('Error en redistribución de disminución:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en redistribución de disminución'
      };
    }
  }

  /**
   * Sync with annual planning - updates planificacion when deliveries change
   */
  static async sincronizarConPlanificacion(
    tx: any,
    movimiento: any,
    diferenciaCantidad: number
  ): Promise<void> {
    try {
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
        const nuevaDistribucion = [...planificacion.distribucionMensual];
        const mesIndex = movimiento.mes - 1;

        if (mesIndex >= 0 && mesIndex < 12) {
          nuevaDistribucion[mesIndex] = Math.max(0, nuevaDistribucion[mesIndex] + diferenciaCantidad);

          const nuevaMetaAnual = nuevaDistribucion.reduce((sum: number, val: number) => sum + val, 0);

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
    }
  }

  /**
   * Handle base delivery - preserve original value when adding additional deliveries
   */
  static async manejarEntregaBase(
    tx: any,
    movimientoId: string,
    movimiento: any
  ): Promise<void> {
    if (movimiento.entregaBase === null || movimiento.entregaBase === undefined) {
      await tx.movimientoVacuna.update({
        where: { id: movimientoId },
        data: {
          entregaBase: movimiento.entrega,
          updatedAt: new Date()
        }
      });
    }
  }

  /**
   * Calculate total delivery (base + additional)
   */
  static async calcularEntregaTotal(
    tx: any,
    movimientoId: string
  ): Promise<number> {
    const movimientoCompleto = await tx.movimientoVacuna.findUnique({
      where: { id: movimientoId },
      include: {
        entregasAdicionales: true
      }
    });

    if (!movimientoCompleto) return 0;

    const totalAdicionales = movimientoCompleto.entregasAdicionales.reduce(
      (sum: number, entrega: any) => sum + entrega.cantidad,
      0
    );

    const entregaBase = movimientoCompleto.entregaBase ?? movimientoCompleto.entrega;

    return entregaBase + totalAdicionales;
  }

  /**
   * Get statistics for movimientos
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
        prisma.movimientoVacuna.count({
          where: { anio: currentYear }
        }),
        prisma.movimientoVacuna.aggregate({
          where: { anio: currentYear },
          _sum: { entrega: true }
        }),
        prisma.movimientoVacuna.groupBy({
          by: ['mes'],
          where: { anio: currentYear },
          _count: { id: true },
          _sum: { entrega: true },
          orderBy: { mes: 'asc' }
        }),
        prisma.movimientoVacuna.groupBy({
          by: ['vacunaId'],
          where: { anio: currentYear },
          _sum: { entrega: true },
          _count: { id: true }
        }),
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
   * Get available stock by vaccine with automatic initial stock adjustment
   */
  static async getStockDisponible(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{
    stockInicialHistorico: number | null;
    stockInicialOriginal: number | null;
    ingresosLotesDelMes: number;
    fechaCapturaStockInicial: Date | null;
    stockActual: number;
    totalEntregas: number;
    stockDisponible: number;
    estado: 'bueno' | 'medio' | 'critico';
    tieneHistorialInicial: boolean;
    lotes: Array<{
      id: string;
      numero: string;
      cantidadActual: number;
      fechaVencimiento: Date;
      estado: string;
    }>;
  }>> {
    try {
      // DESPLAZAMIENTO DE FECHAS: Buscar mes+1 para consistencia con MovimientosQueryService.getAll
      let mesBusqueda = mes;
      let anioBusqueda = anio;

      if (mes && anio) {
        mesBusqueda = mes + 1;
        anioBusqueda = anio;
        if (mesBusqueda > 12) {
          mesBusqueda = 1;
          anioBusqueda = anio + 1;
        }
        console.log(`📅 [getStockDisponible] Usuario seleccionó ${mes}/${anio}, buscando datos de ${mesBusqueda}/${anioBusqueda}`);
      }

      console.log(`📊 [MovimientosCalculationService] Obteniendo stock disponible para vacuna ${vacunaId}, período ${mesBusqueda}/${anioBusqueda}`);

      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { id: true, nombre: true }
      });

      if (!vacuna) {
        throw new Error('Vacuna no encontrada');
      }

      const stockInicialResult = await StockInicialService.obtenerStockInicial(vacunaId, mesBusqueda, anioBusqueda);
      let stockInicialHistorico: number | null = null;
      let stockInicialOriginal: number | null = null;
      let fechaCapturaStockInicial: Date | null = null;
      let tieneHistorialInicial = false;

      if (stockInicialResult.success && stockInicialResult.data) {
        stockInicialHistorico = stockInicialResult.data.stockInicial;
        stockInicialOriginal = stockInicialResult.data.stockInicial;
        fechaCapturaStockInicial = stockInicialResult.data.fechaCaptura;
        tieneHistorialInicial = true;
        console.log(`📈 [MovimientosCalculationService] Stock inicial histórico encontrado: ${stockInicialHistorico} unidades`);
      }

      let ingresosLotesDelMes = 0;

      if (tieneHistorialInicial) {
        const fechaInicioMes = new Date(anioBusqueda, mesBusqueda - 1, 1);
        const fechaFinMes = new Date(anioBusqueda, mesBusqueda, 0);

        const lotesIngresadosEnMes = await prisma.loteVacuna.aggregate({
          where: {
            vacunaId,
            fechaIngreso: {
              gte: fechaInicioMes,
              lte: fechaFinMes
            }
          },
          _sum: {
            cantidadInicial: true
          }
        });

        ingresosLotesDelMes = lotesIngresadosEnMes._sum.cantidadInicial || 0;

        if (ingresosLotesDelMes > 0) {
          stockInicialHistorico = stockInicialOriginal! + ingresosLotesDelMes;
        }
      }

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

      const stockActual = lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);

      const totalEntregas = await prisma.movimientoVacuna.aggregate({
        where: {
          vacunaId,
          mes: mesBusqueda,
          anio: anioBusqueda
        },
        _sum: {
          entrega: true
        }
      });

      const totalEntregasCalculado = totalEntregas._sum.entrega || 0;

      const baseCalculo = tieneHistorialInicial ? stockInicialHistorico! : stockActual;
      const stockDisponible = baseCalculo - totalEntregasCalculado;

      let estado: 'bueno' | 'medio' | 'critico';

      if (stockDisponible < 0) {
        estado = 'critico';
      } else if (stockDisponible <= baseCalculo * 0.2) {
        estado = 'critico';
      } else if (stockDisponible <= baseCalculo * 0.5) {
        estado = 'medio';
      } else {
        estado = 'bueno';
      }

      return {
        success: true,
        data: {
          stockInicialHistorico,
          stockInicialOriginal,
          ingresosLotesDelMes,
          fechaCapturaStockInicial,
          stockActual,
          totalEntregas: totalEntregasCalculado,
          stockDisponible,
          estado,
          tieneHistorialInicial,
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
      console.error('❌ [MovimientosCalculationService] Error obteniendo stock disponible:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener stock disponible'
      };
    }
  }

  /**
   * Sync saldo anterior for next month
   */
  static async sincronizarSaldoAnteriorSiguienteMes(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{ actualizado: boolean; stockCalculado: number }>> {
    try {
      const movimientoActual = await prisma.movimientoVacuna.findUnique({
        where: {
          uk_movimiento_establecimiento_vacuna_mes_anio: {
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

      const stockCalculado = movimientoActual.saldoAnterior +
                            movimientoActual.transIngreso -
                            movimientoActual.salida -
                            movimientoActual.transSalida +
                            movimientoActual.entrega;

      let siguienteMes = mes + 1;
      let siguienteAnio = anio;

      if (mes === 12) {
        siguienteMes = 1;
        siguienteAnio = anio + 1;
      }

      const movimientoSiguiente = await prisma.movimientoVacuna.findUnique({
        where: {
          uk_movimiento_establecimiento_vacuna_mes_anio: {
            establecimientoId,
            vacunaId,
            mes: siguienteMes,
            anio: siguienteAnio
          }
        }
      });

      let actualizado = false;

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
   * Update initial stock for next month automatically
   * IMPORTANTE: Esta función considera el desplazamiento de +1 mes que ya se aplica en getStockDisponible
   * - El frontend envía el mes del FILTRO (ej: Noviembre = 11)
   * - getStockDisponible ya aplica +1 mes internamente (busca datos de Diciembre = 12)
   * - Por lo tanto, el mes REAL que se está visualizando es mes+1
   * - El "siguiente mes" para actualizar stock inicial es mes+2 desde el filtro original
   */
  static async actualizarStockInicialSiguienteMes(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{
    mesActual: { mes: number; anio: number; stockInicial: number; entregas: number; disponible: number };
    mesSiguiente: { mes: number; anio: number; stockInicialRegistrado: number };
    mensaje: string;
  }>> {
    try {
      // Calcular el mes REAL que se está visualizando (con desplazamiento +1)
      let mesRealVisualizado = mes + 1;
      let anioRealVisualizado = anio;
      if (mesRealVisualizado > 12) {
        mesRealVisualizado = 1;
        anioRealVisualizado++;
      }

      console.log(`🔄 [MovimientosCalculationService] Actualizando stock inicial siguiente mes`);
      console.log(`   📅 Filtro seleccionado: ${mes}/${anio}`);
      console.log(`   📅 Mes REAL visualizado (con desplazamiento): ${mesRealVisualizado}/${anioRealVisualizado}`);

      if (!vacunaId) {
        return { success: false, error: 'ID de vacuna requerido' };
      }

      if (mes < 1 || mes > 12) {
        return { success: false, error: 'El mes debe estar entre 1 y 12' };
      }

      if (anio < 2020 || anio > 2050) {
        return { success: false, error: 'El año debe estar entre 2020 y 2050' };
      }

      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { id: true, nombre: true }
      });

      if (!vacuna) {
        return { success: false, error: 'Vacuna no encontrada' };
      }

      // getStockDisponible YA aplica el desplazamiento internamente
      const stockDisponibleResult = await this.getStockDisponible(vacunaId, mes, anio);

      if (!stockDisponibleResult.success || !stockDisponibleResult.data) {
        return { success: false, error: stockDisponibleResult.error || 'No se pudo obtener el stock disponible' };
      }

      const {
        stockInicialHistorico,
        totalEntregas,
        stockDisponible
      } = stockDisponibleResult.data;

      if (stockInicialHistorico === null) {
        const mesesNombres = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return {
          success: false,
          error: `No existe stock inicial histórico registrado para ${vacuna.nombre} en ${mesesNombres[mesRealVisualizado - 1]} ${anioRealVisualizado}. Debe capturar el stock inicial primero.`
        };
      }

      // El siguiente mes es +1 desde el mes REAL visualizado (que ya tiene +1 del desplazamiento)
      // Es decir, es +2 desde el mes del filtro original
      let mesSiguiente = mesRealVisualizado + 1;
      let anioSiguiente = anioRealVisualizado;

      if (mesSiguiente > 12) {
        mesSiguiente = 1;
        anioSiguiente++;
      }

      console.log(`   📅 Mes SIGUIENTE a registrar: ${mesSiguiente}/${anioSiguiente}`);

      if (anioSiguiente > 2050) {
        return { success: false, error: `No se puede registrar stock inicial para el año ${anioSiguiente}. Límite máximo: 2050` };
      }

      const registroExistente = await prisma.stockInicialMensual.findUnique({
        where: {
          uk_stock_inicial_vacuna_mes_anio: {
            vacunaId,
            mes: mesSiguiente,
            anio: anioSiguiente
          }
        }
      });

      let operacion: 'creado' | 'actualizado';

      if (registroExistente) {
        await prisma.stockInicialMensual.update({
          where: { id: registroExistente.id },
          data: {
            stockInicial: stockDisponible,
            observaciones: `Stock inicial actualizado automáticamente desde disponible de ${mesRealVisualizado}/${anioRealVisualizado}`,
            fechaCaptura: new Date()
          }
        });
        operacion = 'actualizado';
      } else {
        await prisma.stockInicialMensual.create({
          data: {
            vacunaId,
            mes: mesSiguiente,
            anio: anioSiguiente,
            stockInicial: stockDisponible,
            observaciones: `Stock inicial capturado automáticamente desde disponible de ${mesRealVisualizado}/${anioRealVisualizado}`
          }
        });
        operacion = 'creado';
      }

      const mesesNombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      const mesRealNombre = mesesNombres[mesRealVisualizado - 1];
      const mesSiguienteNombre = mesesNombres[mesSiguiente - 1];

      const mensaje = `Stock inicial del mes ${mesSiguienteNombre} ${anioSiguiente} ${operacion} exitosamente con ${stockDisponible.toLocaleString()} unidades (disponible de ${mesRealNombre} ${anioRealVisualizado})`;

      console.log(`   ✅ ${mensaje}`);

      return {
        success: true,
        data: {
          mesActual: {
            mes: mesRealVisualizado,
            anio: anioRealVisualizado,
            stockInicial: stockInicialHistorico,
            entregas: totalEntregas,
            disponible: stockDisponible
          },
          mesSiguiente: {
            mes: mesSiguiente,
            anio: anioSiguiente,
            stockInicialRegistrado: stockDisponible
          },
          mensaje
        }
      };
    } catch (error) {
      console.error('❌ [MovimientosCalculationService] Error actualizando stock inicial siguiente mes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar stock inicial del siguiente mes'
      };
    }
  }
}
