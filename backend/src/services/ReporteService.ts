import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { validateUUID } from '@/utils/validation';

/**
 * Interfaces para filtros de reportes
 */
export interface ReporteInventarioFilters {
  centroAcopioId?: string;
  vacunaId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  incluirInactivos?: boolean;
}

export interface StockCriticoFilters extends ReporteInventarioFilters {
  porcentajeMinimo?: number; // Por defecto 20%
  cantidadMinima?: number;   // Cantidad mínima absoluta
}

export interface VencimientosFilters extends ReporteInventarioFilters {
  diasAnticipacion?: number; // Por defecto 30 días
}

export interface KardexDetalladoFilters {
  tipo?: 'vacuna' | 'jeringa';
  itemId?: string;
  loteId?: string;
  establecimientoId?: string;
  tipoMovimiento?: 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
  fechaInicio: Date;
  fechaFin: Date;
  incluirTrazabilidad?: boolean;
}

/**
 * Interfaces para resultados de reportes
 */
export interface StockActualItem {
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  presentacion: string;
  stockTotal: number;
  totalLotes: number;
  lotesDisponibles: number;
  lotesPorVencer: number;
  valorInventario?: number;
  ultimaActualizacion: Date;
  lotes: {
    id: string;
    numero: string;
    cantidadActual: number;
    fechaVencimiento: Date;
    estado: string;
    diasParaVencer: number;
  }[];
}

export interface StockCriticoItem extends StockActualItem {
  stockMinimo: number;
  porcentajeCritico: number;
  nivelCriticidad: 'bajo' | 'critico' | 'agotado';
  recomendacionAccion: string;
}

export interface VencimientoItem {
  loteId: string;
  numeroLote: string;
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  cantidadActual: number;
  fechaVencimiento: Date;
  diasParaVencer: number;
  nivelUrgencia: 'inmediato' | 'urgente' | 'atencion' | 'normal';
  establecimientosAfectados: {
    id: string;
    nombre: string;
    cantidadAsignada: number;
  }[];
}

export interface KardexDetalladoItem {
  id: string;
  fecha: Date;
  tipo: 'vacuna' | 'jeringa';
  itemNombre: string;
  loteNumero: string;
  tipoMovimiento: string;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  establecimientoOrigen?: string | undefined;
  establecimientoDestino?: string | undefined;
  documento: string;
  numeroDocumento: string;
  observaciones?: string | undefined;
  usuario: string;
}

/**
 * Servicio principal para generación de reportes de inventario
 * Implementa la lógica de negocio para todos los reportes de stock y movimientos
 */
export class ReporteService {
  /**
   * Generar reporte de stock actual
   */
  static async generarStockActual(
    filters: ReporteInventarioFilters = {}
  ): Promise<ServiceResult<StockActualItem[]>> {
    try {
      console.log('🔄 Generando reporte de stock actual:', filters);

      // Implementación usando solo Prisma ORM para mayor compatibilidad
      const vacunaWhereConditions: any = {
        estado: 'activo'
      };

      if (filters.vacunaId && validateUUID(filters.vacunaId)) {
        vacunaWhereConditions.id = filters.vacunaId;
      }

      // Obtener todas las vacunas activas
      const vacunas = await prisma.vacuna.findMany({
        where: vacunaWhereConditions,
        orderBy: { nombre: 'asc' }
      });

      // Procesar cada vacuna para obtener su información de stock
      const stockData = [];

      for (const vacuna of vacunas) {
        try {
          // Obtener lotes de esta vacuna
          const lotes = await prisma.loteVacuna.findMany({
            where: {
              vacunaId: vacuna.id,
              estado: 'disponible',
              cantidadActual: { gt: 0 }
            }
          });

          // Calcular estadísticas
          const stockTotal = lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
          const fechaLimite = new Date();
          fechaLimite.setDate(fechaLimite.getDate() + 30);

          const lotesPorVencer = lotes.filter(lote =>
            lote.fechaVencimiento <= fechaLimite
          ).length;

          const ultimaActualizacion = lotes.length > 0
            ? new Date(Math.max(...lotes.map(lote => lote.updatedAt.getTime())))
            : new Date();

          stockData.push({
            vacuna_id: vacuna.id,
            vacuna_nombre: vacuna.nombre,
            vacuna_tipo: vacuna.tipo,
            presentacion: vacuna.presentacion,
            stock_total: stockTotal,
            total_lotes: lotes.length,
            lotes_disponibles: lotes.length,
            lotes_por_vencer: lotesPorVencer,
            ultima_actualizacion: ultimaActualizacion
          });
        } catch (error) {
          console.error(`Error procesando vacuna ${vacuna.id}:`, error);
          // Continuar con la siguiente vacuna
        }
      }

      // Procesar resultados y obtener detalles de lotes
      const resultados: StockActualItem[] = [];

      for (const item of stockData) {
        // Obtener lotes detallados para cada vacuna
        const lotes = await prisma.loteVacuna.findMany({
          where: {
            vacunaId: item.vacuna_id,
            estado: 'disponible',
            cantidadActual: { gt: 0 }
          },
          select: {
            id: true,
            numero: true,
            cantidadActual: true,
            fechaVencimiento: true,
            estado: true
          },
          orderBy: { fechaVencimiento: 'asc' }
        });

        // Calcular días para vencer para cada lote
        const lotesConDias = lotes.map(lote => ({
          ...lote,
          diasParaVencer: Math.ceil(
            (lote.fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        }));

        resultados.push({
          vacunaId: item.vacuna_id,
          vacunaNombre: item.vacuna_nombre,
          vacunaTipo: item.vacuna_tipo,
          presentacion: item.presentacion,
          stockTotal: item.stock_total,
          totalLotes: item.total_lotes,
          lotesDisponibles: item.lotes_disponibles,
          lotesPorVencer: item.lotes_por_vencer,
          ultimaActualizacion: item.ultima_actualizacion || new Date(),
          lotes: lotesConDias
        });
      }

      console.log(`✅ Reporte de stock actual generado: ${resultados.length} vacunas`);

      return {
        success: true,
        data: resultados
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de stock actual:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de stock actual'
      };
    }
  }

  /**
   * Generar reporte de stock crítico
   */
  static async generarStockCritico(
    filters: StockCriticoFilters = {}
  ): Promise<ServiceResult<StockCriticoItem[]>> {
    try {
      console.log('🔄 Generando reporte de stock crítico:', filters);

      const porcentajeMinimo = filters.porcentajeMinimo || 20;
      const cantidadMinima = filters.cantidadMinima || 50;

      // Primero obtener el stock actual
      const stockActualResult = await this.generarStockActual(filters);
      if (!stockActualResult.success) {
        return stockActualResult as ServiceResult<StockCriticoItem[]>;
      }

      const stockActual = stockActualResult.data!;

      // Calcular stock crítico basado en criterios
      const stockCritico: StockCriticoItem[] = [];

      for (const item of stockActual) {
        // Calcular stock mínimo recomendado (basado en consumo histórico)
        const stockMinimo = await this.calcularStockMinimo(item.vacunaId, cantidadMinima);

        // Determinar nivel de criticidad
        const porcentajeCritico = stockMinimo > 0 ? (item.stockTotal / stockMinimo) * 100 : 100;

        let nivelCriticidad: 'bajo' | 'critico' | 'agotado';
        let recomendacionAccion: string;

        if (item.stockTotal === 0) {
          nivelCriticidad = 'agotado';
          recomendacionAccion = 'URGENTE: Solicitar reposición inmediata';
        } else if (porcentajeCritico <= porcentajeMinimo) {
          nivelCriticidad = 'critico';
          recomendacionAccion = 'Programar reposición en los próximos 7 días';
        } else if (porcentajeCritico <= 50) {
          nivelCriticidad = 'bajo';
          recomendacionAccion = 'Monitorear y planificar reposición';
        } else {
          continue; // No incluir en reporte si no es crítico
        }

        stockCritico.push({
          ...item,
          stockMinimo,
          porcentajeCritico: Math.round(porcentajeCritico),
          nivelCriticidad,
          recomendacionAccion
        });
      }

      // Ordenar por nivel de criticidad (agotado > crítico > bajo)
      stockCritico.sort((a, b) => {
        const orden = { agotado: 0, critico: 1, bajo: 2 };
        return orden[a.nivelCriticidad] - orden[b.nivelCriticidad];
      });

      console.log(`✅ Reporte de stock crítico generado: ${stockCritico.length} vacunas críticas`);

      return {
        success: true,
        data: stockCritico
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de stock crítico:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de stock crítico'
      };
    }
  }

  /**
   * Generar reporte de próximos vencimientos
   */
  static async generarProximosVencimientos(
    filters: VencimientosFilters = {}
  ): Promise<ServiceResult<VencimientoItem[]>> {
    try {
      console.log('🔄 Generando reporte de próximos vencimientos:', filters);

      const diasAnticipacion = filters.diasAnticipacion || 30;
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);

      // Construir condiciones WHERE
      const whereConditions: any = {
        estado: 'disponible',
        cantidadActual: { gt: 0 },
        fechaVencimiento: { lte: fechaLimite }
      };

      if (filters.vacunaId && validateUUID(filters.vacunaId)) {
        whereConditions.vacunaId = filters.vacunaId;
      }

      // Obtener lotes próximos a vencer
      const lotes = await prisma.loteVacuna.findMany({
        where: whereConditions,
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        },
        orderBy: { fechaVencimiento: 'asc' }
      });

      // Procesar resultados
      const vencimientos: VencimientoItem[] = [];

      for (const lote of lotes) {
        const diasParaVencer = Math.ceil(
          (lote.fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determinar nivel de urgencia
        let nivelUrgencia: 'inmediato' | 'urgente' | 'atencion' | 'normal';
        if (diasParaVencer <= 0) {
          nivelUrgencia = 'inmediato';
        } else if (diasParaVencer <= 7) {
          nivelUrgencia = 'urgente';
        } else if (diasParaVencer <= 15) {
          nivelUrgencia = 'atencion';
        } else {
          nivelUrgencia = 'normal';
        }

        // Obtener establecimientos que podrían estar afectados
        const establecimientosAfectados = await this.obtenerEstablecimientosAfectados(lote.id);

        vencimientos.push({
          loteId: lote.id,
          numeroLote: lote.numero,
          vacunaId: lote.vacuna.id,
          vacunaNombre: lote.vacuna.nombre,
          vacunaTipo: lote.vacuna.tipo,
          cantidadActual: lote.cantidadActual,
          fechaVencimiento: lote.fechaVencimiento,
          diasParaVencer,
          nivelUrgencia,
          establecimientosAfectados
        });
      }

      console.log(`✅ Reporte de próximos vencimientos generado: ${vencimientos.length} lotes`);

      return {
        success: true,
        data: vencimientos
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de próximos vencimientos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de próximos vencimientos'
      };
    }
  }

  /**
   * Generar reporte de kardex detallado
   */
  static async generarKardexDetallado(
    filters: KardexDetalladoFilters
  ): Promise<ServiceResult<KardexDetalladoItem[]>> {
    try {
      console.log('🔄 Generando reporte de kardex detallado:', filters);

      // Validar fechas requeridas
      if (!filters.fechaInicio || !filters.fechaFin) {
        return {
          success: false,
          error: 'Las fechas de inicio y fin son requeridas'
        };
      }

      // Construir condiciones WHERE
      const whereConditions: any = {
        fechaMovimiento: {
          gte: filters.fechaInicio,
          lte: filters.fechaFin
        }
      };

      if (filters.tipo) {
        whereConditions.tipo = filters.tipo;
      }

      if (filters.itemId && validateUUID(filters.itemId)) {
        whereConditions.itemId = filters.itemId;
      }

      if (filters.loteId && validateUUID(filters.loteId)) {
        whereConditions.loteId = filters.loteId;
      }

      if (filters.tipoMovimiento) {
        whereConditions.tipoMovimiento = filters.tipoMovimiento;
      }

      // Obtener movimientos de kardex
      const movimientos = await prisma.kardex.findMany({
        where: whereConditions,
        include: {
          usuario: {
            select: {
              nombres: true,
              apellidos: true
            }
          },
          establecimientoOrigen: {
            select: {
              nombre: true
            }
          },
          establecimientoDestino: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: { fechaMovimiento: 'desc' }
      });

      // Procesar resultados con información adicional
      const kardexDetallado: KardexDetalladoItem[] = [];

      for (const movimiento of movimientos) {
        // Obtener información del item (vacuna o jeringa)
        let itemNombre = 'Item no encontrado';
        let loteNumero = 'Lote no encontrado';

        if (movimiento.tipo === 'vacuna') {
          const loteVacuna = await prisma.loteVacuna.findUnique({
            where: { id: movimiento.loteId },
            include: {
              vacuna: {
                select: { nombre: true }
              }
            }
          });
          if (loteVacuna) {
            itemNombre = loteVacuna.vacuna.nombre;
            loteNumero = loteVacuna.numero;
          }
        } else if (movimiento.tipo === 'jeringa') {
          const loteJeringa = await prisma.loteJeringa.findUnique({
            where: { id: movimiento.loteId },
            include: {
              jeringa: {
                select: { tipo: true }
              }
            }
          });
          if (loteJeringa) {
            itemNombre = loteJeringa.jeringa.tipo;
            loteNumero = loteJeringa.numero;
          }
        }

        kardexDetallado.push({
          id: movimiento.id,
          fecha: movimiento.fechaMovimiento,
          tipo: movimiento.tipo as 'vacuna' | 'jeringa',
          itemNombre,
          loteNumero,
          tipoMovimiento: movimiento.tipoMovimiento,
          cantidad: movimiento.cantidad,
          saldoAnterior: movimiento.saldoAnterior,
          saldoActual: movimiento.saldoActual,
          establecimientoOrigen: movimiento.establecimientoOrigen?.nombre,
          establecimientoDestino: movimiento.establecimientoDestino?.nombre,
          documento: movimiento.documento,
          numeroDocumento: movimiento.numeroDocumento,
          observaciones: movimiento.observaciones || undefined,
          usuario: `${movimiento.usuario.nombres} ${movimiento.usuario.apellidos}`
        });
      }

      console.log(`✅ Reporte de kardex detallado generado: ${kardexDetallado.length} movimientos`);

      return {
        success: true,
        data: kardexDetallado
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de kardex detallado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de kardex detallado'
      };
    }
  }

  /**
   * Métodos auxiliares privados
   */

  /**
   * Calcular stock mínimo recomendado basado en consumo histórico
   */
  private static async calcularStockMinimo(vacunaId: string, cantidadMinima: number): Promise<number> {
    try {
      // Obtener consumo promedio de los últimos 3 meses
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 3);

      // Usar el modelo MovimientoVacuna que tiene los campos correctos
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: {
          vacunaId: vacunaId,
          fechaMovimiento: {
            gte: fechaInicio
          },
          OR: [
            { salida: { gt: 0 } },
            { transSalida: { gt: 0 } }
          ]
        },
        select: {
          salida: true,
          transSalida: true
        }
      });

      // Calcular promedio manualmente
      const totalMovimientos = movimientos.length;
      if (totalMovimientos === 0) {
        return 0; // Sin movimientos, stock mínimo es 0
      }

      const sumaConsumo = movimientos.reduce((sum, mov) =>
        sum + (mov.salida || 0) + (mov.transSalida || 0), 0
      );

      const promedioConsumo = sumaConsumo / totalMovimientos;

      // Stock mínimo = consumo promedio mensual * 2 (para 2 meses de reserva)
      const stockCalculado = Math.ceil(promedioConsumo * 2);

      // Usar el mayor entre el calculado y la cantidad mínima establecida
      return Math.max(stockCalculado, cantidadMinima);

    } catch (error) {
      console.error('Error al calcular stock mínimo:', error);
      return cantidadMinima; // Valor por defecto
    }
  }

  /**
   * Obtener establecimientos que podrían estar afectados por vencimiento de lote
   */
  private static async obtenerEstablecimientosAfectados(loteId: string): Promise<{
    id: string;
    nombre: string;
    cantidadAsignada: number;
  }[]> {
    try {
      // Por ahora retornamos un array vacío ya que necesitamos revisar el modelo de datos
      // TODO: Implementar cuando se confirme la estructura de la relación lote-establecimiento
      console.log('Obteniendo establecimientos afectados para lote:', loteId);

      // Buscar establecimientos que podrían tener este lote asignado
      // Esto requiere revisar el modelo de datos para encontrar la relación correcta
      const establecimientosAfectados: {
        id: string;
        nombre: string;
        cantidadAsignada: number;
      }[] = [];

      return establecimientosAfectados;

    } catch (error) {
      console.error('Error al obtener establecimientos afectados:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas generales de reportes
   */
  static async obtenerEstadisticasGenerales(): Promise<ServiceResult<{
    totalVacunas: number;
    totalStock: number;
    vacunasCriticas: number;
    lotesProximosVencer: number;
    movimientosUltimoMes: number;
    ultimaActualizacion: Date;
  }>> {
    try {
      console.log('🔄 Obteniendo estadísticas generales de reportes');

      // Obtener estadísticas en paralelo
      const [
        totalVacunas,
        stockData,
        stockCriticoResult,
        vencimientosResult,
        movimientosUltimoMes
      ] = await Promise.all([
        // Total de vacunas activas
        prisma.vacuna.count({ where: { estado: 'activo' } }),

        // Stock total
        prisma.$queryRawUnsafe<any[]>(
          `SELECT COALESCE(SUM(lv.cantidad_actual), 0) as total_stock
           FROM lotes_vacunas lv
           JOIN vacunas v ON lv.vacuna_id = v.id
           WHERE lv.estado = 'disponible' AND v.estado = 'activo'`
        ),

        // Vacunas críticas
        this.generarStockCritico({ porcentajeMinimo: 20 }),

        // Lotes próximos a vencer
        this.generarProximosVencimientos({ diasAnticipacion: 30 }),

        // Movimientos del último mes
        prisma.kardex.count({
          where: {
            fechaMovimiento: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        })
      ]);

      const totalStock = parseInt(stockData[0]?.total_stock || '0');
      const vacunasCriticas = stockCriticoResult.success ? stockCriticoResult.data!.length : 0;
      const lotesProximosVencer = vencimientosResult.success ? vencimientosResult.data!.length : 0;

      const estadisticas = {
        totalVacunas,
        totalStock,
        vacunasCriticas,
        lotesProximosVencer,
        movimientosUltimoMes,
        ultimaActualizacion: new Date()
      };

      console.log('✅ Estadísticas generales obtenidas:', estadisticas);

      return {
        success: true,
        data: estadisticas
      };

    } catch (error) {
      console.error('❌ Error al obtener estadísticas generales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas generales'
      };
    }
  }
}