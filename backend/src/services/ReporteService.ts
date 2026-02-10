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

export interface ReporteMovimientosFilters {
  centroAcopioId?: string;
  vacunaId?: string;
  establecimientoId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  mes?: number;
  anio?: number;
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

export interface MovimientosMensualesFilters extends ReporteMovimientosFilters {
  agruparPor?: 'mes' | 'vacuna' | 'establecimiento';
}

export interface ConsumoHistoricoFilters extends ReporteMovimientosFilters {
  periodoMeses?: number; // Número de meses hacia atrás
  incluirProyecciones?: boolean;
}

export interface EntregasPorEstablecimientoFilters extends ReporteMovimientosFilters {
  incluirDetalleVacunas?: boolean;
  ordenarPor?: 'establecimiento' | 'cantidad' | 'fecha';
}

export interface EficienciaDistribucionFilters extends ReporteMovimientosFilters {
  incluirIndicadores?: boolean;
  calcularTendencias?: boolean;
}

export interface MovimientosPorEESSFilters {
  fechaInicio: Date;
  fechaFin: Date;
  centroAcopioId?: string;
  incluirInactivos?: boolean;
}

export interface StockVacunasEESSFilters {
  fechaInicio: Date;
  fechaFin: Date;
  centroAcopioId?: string;
  vacunaIds: string[];
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

export interface LoteVencidoItem {
  loteId: string;
  numeroLote: string;
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  cantidadActual: number;
  fechaVencimiento: Date;
  diasVencido: number;
  nivelCriticidad: 'critico' | 'muy_critico' | 'extremo';
  valorPerdido: number;
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
 * Interfaces para resultados de reportes de movimientos
 */
export interface MovimientoMensualItem {
  centroAcopioId: string;
  centroAcopioNombre: string;
  establecimientoId: string;
  establecimientoNombre: string;
  vacunaId: string;
  vacunaNombre: string;
  mes: number;
  anio: number;
  saldoAnterior: number;
  transIngreso: number;
  salida: number;
  transSalida: number;
  entrega: number;
  saldoFinal: number;
  consumoTotal: number;
  eficienciaDistribucion: number;
  fechaUltimaActualizacion: Date;
}

export interface ConsumoHistoricoItem {
  centroAcopioId: string;
  centroAcopioNombre: string;
  vacunaId: string;
  vacunaNombre: string;
  establecimientoId: string;
  establecimientoNombre: string;
  periodoInicio: Date;
  periodoFin: Date;
  consumoPromedio: number;
  consumoTotal: number;
  tendencia: 'creciente' | 'decreciente' | 'estable';
  variabilidad: number;
  proyeccionProximoMes?: number | undefined;
  historialMensual: {
    mes: number;
    anio: number;
    consumo: number;
    fecha: Date;
  }[];
}

export interface EntregaPorEstablecimientoItem {
  centroAcopioId: string;
  centroAcopioNombre: string;
  establecimientoId: string;
  establecimientoNombre: string;
  totalEntregas: number;
  totalVacunas: number;
  fechaUltimaEntrega: Date;
  eficienciaEntrega: number;
  detalleVacunas: {
    vacunaId: string;
    vacunaNombre: string;
    cantidadEntregada: number;
    numeroEntregas: number;
    promedioEntrega: number;
  }[];
}

export interface EficienciaDistribucionItem {
  centroAcopioId: string;
  centroAcopioNombre: string;
  establecimientoId: string;
  establecimientoNombre: string;
  periodoAnalisis: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  indicadores: {
    tiempoPromedioEntrega: number; // días
    porcentajeCumplimiento: number;
    eficienciaStock: number;
    rotacionInventario: number;
  };
  tendencias: {
    mejoraMes: boolean;
    variacionPorcentual: number;
  };
  alertas: string[];
}

export interface MovimientosPorEESSItem {
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  microredId: string | null;
  microredNombre: string | null;
  redId: string | null;
  redNombre: string | null;
  vacunas: {
    [vacunaId: string]: {
      vacunaId: string;
      vacunaNombre: string;
      totalEntrega: number;
      totalSalidas: number;
      stock: number; // Stock del último mes del rango
    };
  };
}

export interface StockVacunasEESSItem {
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  microredId: string | null;
  microredNombre: string | null;
  redId: string | null;
  redNombre: string | null;
  vacunas: {
    [vacunaId: string]: {
      vacunaId: string;
      vacunaNombre: string;
      stock: number;
    };
  };
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
   * Generar reporte de lotes vencidos
   */
  static async generarLotesVencidos(
    filters: ReporteInventarioFilters = {}
  ): Promise<ServiceResult<LoteVencidoItem[]>> {
    try {
      console.log('🔄 Generando reporte de lotes vencidos:', filters);

      const fechaActual = new Date();

      // Construir condiciones WHERE
      const whereConditions: any = {
        fechaVencimiento: { lt: fechaActual },
        cantidadActual: { gt: 0 }
      };

      // Por defecto incluir solo lotes disponibles y vencidos (no agotados)
      if (!filters.incluirInactivos) {
        whereConditions.estado = { in: ['disponible', 'vencido'] };
      }

      if (filters.vacunaId && validateUUID(filters.vacunaId)) {
        whereConditions.vacunaId = filters.vacunaId;
      }

      // Obtener lotes vencidos
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
        orderBy: { fechaVencimiento: 'desc' }
      });

      // Procesar resultados
      const lotesVencidos: LoteVencidoItem[] = [];

      for (const lote of lotes) {
        const diasVencido = Math.ceil(
          (fechaActual.getTime() - lote.fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determinar nivel de criticidad
        let nivelCriticidad: 'critico' | 'muy_critico' | 'extremo';
        if (diasVencido <= 30) {
          nivelCriticidad = 'critico';
        } else if (diasVencido <= 90) {
          nivelCriticidad = 'muy_critico';
        } else {
          nivelCriticidad = 'extremo';
        }

        // Calcular valor perdido (sin precio unitario disponible, usar 0)
        const valorPerdido = 0; // TODO: Implementar cuando se agregue precio unitario al modelo

        // Obtener establecimientos que podrían estar afectados
        const establecimientosAfectados = await this.obtenerEstablecimientosAfectados(lote.id);

        lotesVencidos.push({
          loteId: lote.id,
          numeroLote: lote.numero,
          vacunaId: lote.vacuna.id,
          vacunaNombre: lote.vacuna.nombre,
          vacunaTipo: lote.vacuna.tipo,
          cantidadActual: lote.cantidadActual,
          fechaVencimiento: lote.fechaVencimiento,
          diasVencido,
          nivelCriticidad,
          valorPerdido,
          establecimientosAfectados
        });
      }

      console.log(`✅ Reporte de lotes vencidos generado: ${lotesVencidos.length} lotes`);

      return {
        success: true,
        data: lotesVencidos
      };
    } catch (error) {
      console.error('❌ Error al generar reporte de lotes vencidos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al generar reporte de lotes vencidos'
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
        // Sin movimientos históricos, usar la cantidad mínima establecida
        return cantidadMinima;
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
    lotesVencidos: number;
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
        lotesVencidosResult,
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

        // Lotes vencidos
        this.generarLotesVencidos({}),

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
      const lotesVencidos = lotesVencidosResult.success ? lotesVencidosResult.data!.length : 0;

      const estadisticas = {
        totalVacunas,
        totalStock,
        vacunasCriticas,
        lotesProximosVencer,
        lotesVencidos,
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

  // =====================================================
  // MÉTODOS PARA REPORTES DE MOVIMIENTOS
  // =====================================================

  /**
   * Generar reporte de movimientos mensuales
   */
  static async generarMovimientosMensuales(
    filters: MovimientosMensualesFilters = {}
  ): Promise<ServiceResult<MovimientoMensualItem[]>> {
    try {
      console.log('🔄 Generando reporte de movimientos mensuales:', filters);

      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        mes,
        anio,
        incluirInactivos = false,
        agruparPor = 'mes'
      } = filters;

      // Construir condiciones WHERE
      const whereConditions: any = {};

      if (centroAcopioId) {
        whereConditions.establecimiento = {
          centroAcopioId
        };
      }

      if (vacunaId) {
        whereConditions.vacunaId = vacunaId;
      }

      if (establecimientoId) {
        whereConditions.establecimientoId = establecimientoId;
      }

      if (mes) {
        whereConditions.mes = mes;
      }

      if (anio) {
        whereConditions.anio = anio;
      } else {
        // Por defecto, año actual
        whereConditions.anio = new Date().getFullYear();
      }

      if (fechaInicio && fechaFin) {
        // Asegurar que las fechas sean objetos Date válidos
        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = new Date(fechaFin);

        // Ajustar las fechas para incluir todo el día
        fechaInicioDate.setHours(0, 0, 0, 0);
        fechaFinDate.setHours(23, 59, 59, 999);

        whereConditions.fechaMovimiento = {
          gte: fechaInicioDate,
          lte: fechaFinDate
        };
      }

      if (!incluirInactivos) {
        whereConditions.vacuna = {
          estado: 'activo'
        };
        whereConditions.establecimiento = {
          ...whereConditions.establecimiento,
          estado: 'activo'
        };
      }

      // Obtener movimientos con relaciones
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: whereConditions,
        include: {
          establecimiento: {
            include: {
              centroAcopio: true
            }
          },
          vacuna: true,
          entregasAdicionales: true
        },
        orderBy: [
          { anio: 'desc' },
          { mes: 'desc' },
          { establecimiento: { nombre: 'asc' } },
          { vacuna: { nombre: 'asc' } }
        ]
      });

      // Procesar datos para el reporte
      const reporteData: MovimientoMensualItem[] = movimientos.map(mov => {
        const saldoFinal = mov.saldoAnterior + mov.transIngreso - mov.salida - mov.transSalida;
        const consumoTotal = mov.salida + mov.transSalida;
        const eficienciaDistribucion = mov.entrega > 0 ? (consumoTotal / mov.entrega) * 100 : 0;

        return {
          centroAcopioId: mov.establecimiento.centroAcopio?.id || '',
          centroAcopioNombre: mov.establecimiento.centroAcopio?.nombre || 'Sin Centro',
          establecimientoId: mov.establecimientoId,
          establecimientoNombre: mov.establecimiento.nombre,
          vacunaId: mov.vacunaId,
          vacunaNombre: mov.vacuna.nombre,
          mes: mov.mes,
          anio: mov.anio,
          saldoAnterior: mov.saldoAnterior,
          transIngreso: mov.transIngreso,
          salida: mov.salida,
          transSalida: mov.transSalida,
          entrega: mov.entrega,
          saldoFinal,
          consumoTotal,
          eficienciaDistribucion: Math.round(eficienciaDistribucion * 100) / 100,
          fechaUltimaActualizacion: mov.updatedAt
        };
      });

      console.log(`✅ Reporte de movimientos mensuales generado: ${reporteData.length} registros`);

      return {
        success: true,
        data: reporteData
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de movimientos mensuales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de movimientos mensuales'
      };
    }
  }

  /**
   * Generar reporte de consumo histórico
   */
  static async generarConsumoHistorico(
    filters: ConsumoHistoricoFilters = {}
  ): Promise<ServiceResult<ConsumoHistoricoItem[]>> {
    try {
      console.log('🔄 Generando reporte de consumo histórico:', filters);

      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        periodoMeses = 12,
        incluirInactivos = false,
        incluirProyecciones = true
      } = filters;

      // Calcular fechas del período si no se proporcionan
      const fechaFinCalculada = fechaFin ? new Date(fechaFin) : new Date();
      const fechaInicioCalculada = fechaInicio ? new Date(fechaInicio) : new Date(fechaFinCalculada.getFullYear(), fechaFinCalculada.getMonth() - periodoMeses, 1);

      // Ajustar las fechas para incluir todo el día
      fechaInicioCalculada.setHours(0, 0, 0, 0);
      fechaFinCalculada.setHours(23, 59, 59, 999);

      // Construir condiciones WHERE
      const whereConditions: any = {
        fechaMovimiento: {
          gte: fechaInicioCalculada,
          lte: fechaFinCalculada
        }
      };

      if (centroAcopioId) {
        whereConditions.establecimiento = {
          centroAcopioId
        };
      }

      if (vacunaId) {
        whereConditions.vacunaId = vacunaId;
      }

      if (establecimientoId) {
        whereConditions.establecimientoId = establecimientoId;
      }

      if (!incluirInactivos) {
        whereConditions.vacuna = {
          estado: 'activo'
        };
        whereConditions.establecimiento = {
          ...whereConditions.establecimiento,
          estado: 'activo'
        };
      }

      // Obtener movimientos históricos
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: whereConditions,
        include: {
          establecimiento: {
            include: {
              centroAcopio: true
            }
          },
          vacuna: true
        },
        orderBy: [
          { anio: 'asc' },
          { mes: 'asc' }
        ]
      });

      // Agrupar por vacuna y establecimiento
      const agrupados = new Map<string, any>();

      movimientos.forEach(mov => {
        const key = `${mov.vacunaId}-${mov.establecimientoId}`;

        if (!agrupados.has(key)) {
          agrupados.set(key, {
            centroAcopioId: mov.establecimiento.centroAcopio?.id || '',
            centroAcopioNombre: mov.establecimiento.centroAcopio?.nombre || 'Sin Centro',
            vacunaId: mov.vacunaId,
            vacunaNombre: mov.vacuna.nombre,
            establecimientoId: mov.establecimientoId,
            establecimientoNombre: mov.establecimiento.nombre,
            movimientos: []
          });
        }

        const consumo = mov.salida + mov.transSalida;
        agrupados.get(key).movimientos.push({
          mes: mov.mes,
          anio: mov.anio,
          consumo,
          fecha: new Date(mov.anio, mov.mes - 1, 1)
        });
      });

      // Procesar datos para el reporte
      const reporteData: ConsumoHistoricoItem[] = Array.from(agrupados.values()).map(grupo => {
        const { movimientos: historial } = grupo;

        // Calcular estadísticas
        const consumoTotal = historial.reduce((sum: number, mov: any) => sum + mov.consumo, 0);
        const consumoPromedio = historial.length > 0 ? consumoTotal / historial.length : 0;

        // Calcular tendencia (regresión lineal simple)
        const tendencia = this.calcularTendencia(historial);

        // Calcular variabilidad (desviación estándar)
        const variabilidad = this.calcularVariabilidad(historial, consumoPromedio);

        // Proyección para el próximo mes
        const proyeccionProximoMes = incluirProyecciones ?
          this.calcularProyeccion(historial, consumoPromedio) : undefined;

        return {
          centroAcopioId: grupo.centroAcopioId || '',
          centroAcopioNombre: grupo.centroAcopioNombre || 'Sin Centro',
          vacunaId: grupo.vacunaId,
          vacunaNombre: grupo.vacunaNombre,
          establecimientoId: grupo.establecimientoId,
          establecimientoNombre: grupo.establecimientoNombre,
          periodoInicio: fechaInicioCalculada,
          periodoFin: fechaFinCalculada,
          consumoPromedio: Math.round(consumoPromedio * 100) / 100,
          consumoTotal,
          tendencia,
          variabilidad: Math.round(variabilidad * 100) / 100,
          proyeccionProximoMes,
          historialMensual: historial.sort((a: any, b: any) => a.fecha.getTime() - b.fecha.getTime())
        };
      });

      console.log(`✅ Reporte de consumo histórico generado: ${reporteData.length} registros`);

      return {
        success: true,
        data: reporteData
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de consumo histórico:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de consumo histórico'
      };
    }
  }

  /**
   * Generar reporte de entregas por establecimiento
   */
  static async generarEntregasPorEstablecimiento(
    filters: EntregasPorEstablecimientoFilters = {}
  ): Promise<ServiceResult<EntregaPorEstablecimientoItem[]>> {
    try {
      console.log('🔄 Generando reporte de entregas por establecimiento:', filters);

      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        incluirInactivos = false,
        incluirDetalleVacunas = true,
        ordenarPor = 'establecimiento'
      } = filters;

      // Calcular fechas del período si no se proporcionan
      const fechaFinCalculada = fechaFin ? new Date(fechaFin) : new Date();
      const fechaInicioCalculada = fechaInicio ? new Date(fechaInicio) : new Date(fechaFinCalculada.getFullYear(), 0, 1); // Inicio del año

      // Ajustar las fechas para incluir todo el día
      fechaInicioCalculada.setHours(0, 0, 0, 0);
      fechaFinCalculada.setHours(23, 59, 59, 999);

      // Construir condiciones WHERE
      const whereConditions: any = {
        fechaMovimiento: {
          gte: fechaInicioCalculada,
          lte: fechaFinCalculada
        }
      };

      if (centroAcopioId) {
        whereConditions.establecimiento = {
          centroAcopioId
        };
      }

      if (vacunaId) {
        whereConditions.vacunaId = vacunaId;
      }

      if (establecimientoId) {
        whereConditions.establecimientoId = establecimientoId;
      }

      if (!incluirInactivos) {
        whereConditions.vacuna = {
          estado: 'activo'
        };
        whereConditions.establecimiento = {
          ...whereConditions.establecimiento,
          estado: 'activo'
        };
      }

      // Obtener movimientos con entregas
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: {
          ...whereConditions,
          entrega: {
            gt: 0
          }
        },
        include: {
          establecimiento: {
            include: {
              centroAcopio: true
            }
          },
          vacuna: true,
          entregasAdicionales: true
        },
        orderBy: [
          { establecimiento: { nombre: 'asc' } },
          { vacuna: { nombre: 'asc' } }
        ]
      });

      // Agrupar por establecimiento
      const agrupados = new Map<string, any>();

      movimientos.forEach(mov => {
        const key = mov.establecimientoId;

        if (!agrupados.has(key)) {
          agrupados.set(key, {
            establecimientoId: mov.establecimientoId,
            establecimientoNombre: mov.establecimiento.nombre,
            centroAcopioId: mov.establecimiento.centroAcopioId,
            centroAcopioNombre: mov.establecimiento.centroAcopio?.nombre || 'Sin centro',
            entregas: [],
            vacunas: new Map()
          });
        }

        const grupo = agrupados.get(key);
        const entregaTotal = mov.entrega + (mov.entregasAdicionales?.reduce((sum, ea) => sum + ea.cantidad, 0) || 0);

        grupo.entregas.push({
          fecha: mov.fechaMovimiento,
          cantidad: entregaTotal,
          vacunaId: mov.vacunaId
        });

        // Agrupar por vacuna si se requiere detalle
        if (incluirDetalleVacunas) {
          const vacunaKey = mov.vacunaId;
          if (!grupo.vacunas.has(vacunaKey)) {
            grupo.vacunas.set(vacunaKey, {
              vacunaId: mov.vacunaId,
              vacunaNombre: mov.vacuna.nombre,
              cantidadEntregada: 0,
              numeroEntregas: 0
            });
          }

          const vacunaData = grupo.vacunas.get(vacunaKey);
          vacunaData.cantidadEntregada += entregaTotal;
          vacunaData.numeroEntregas += 1;
        }
      });

      // Procesar datos para el reporte
      const reporteData: EntregaPorEstablecimientoItem[] = Array.from(agrupados.values()).map(grupo => {
        const totalEntregas = grupo.entregas.length;
        const totalVacunas = grupo.entregas.reduce((sum: number, e: any) => sum + e.cantidad, 0);
        const fechaUltimaEntrega = grupo.entregas.length > 0 ?
          new Date(Math.max(...grupo.entregas.map((e: any) => e.fecha.getTime()))) :
          new Date();

        // Calcular eficiencia de entrega (entregas realizadas vs programadas)
        // Por simplicidad, asumimos 100% si hay entregas
        const eficienciaEntrega = totalEntregas > 0 ? 95 : 0; // Placeholder

        const detalleVacunas = incluirDetalleVacunas ?
          Array.from(grupo.vacunas.values()).map((v: any) => ({
            ...v,
            promedioEntrega: v.numeroEntregas > 0 ? Math.round((v.cantidadEntregada / v.numeroEntregas) * 100) / 100 : 0
          })) : [];

        return {
          centroAcopioId: grupo.centroAcopioId,
          centroAcopioNombre: grupo.centroAcopioNombre,
          establecimientoId: grupo.establecimientoId,
          establecimientoNombre: grupo.establecimientoNombre,
          totalEntregas,
          totalVacunas,
          fechaUltimaEntrega,
          eficienciaEntrega,
          detalleVacunas
        };
      });

      // Ordenar según criterio
      reporteData.sort((a, b) => {
        switch (ordenarPor) {
          case 'cantidad':
            return b.totalVacunas - a.totalVacunas;
          case 'fecha':
            return b.fechaUltimaEntrega.getTime() - a.fechaUltimaEntrega.getTime();
          default:
            return a.establecimientoNombre.localeCompare(b.establecimientoNombre);
        }
      });

      console.log(`✅ Reporte de entregas por establecimiento generado: ${reporteData.length} registros`);

      return {
        success: true,
        data: reporteData
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de entregas por establecimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de entregas por establecimiento'
      };
    }
  }

  /**
   * Generar reporte de eficiencia de distribución
   */
  static async generarEficienciaDistribucion(
    filters: EficienciaDistribucionFilters = {}
  ): Promise<ServiceResult<EficienciaDistribucionItem[]>> {
    try {
      console.log('🔄 Generando reporte de eficiencia de distribución:', filters);

      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        incluirInactivos = false,
        incluirIndicadores = true,
        calcularTendencias = true
      } = filters;

      // Calcular fechas del período si no se proporcionan
      const fechaFinCalculada = fechaFin ? new Date(fechaFin) : new Date();
      const fechaInicioCalculada = fechaInicio ? new Date(fechaInicio) : new Date(fechaFinCalculada.getFullYear(), fechaFinCalculada.getMonth() - 3, 1); // Últimos 3 meses

      // Ajustar las fechas para incluir todo el día
      fechaInicioCalculada.setHours(0, 0, 0, 0);
      fechaFinCalculada.setHours(23, 59, 59, 999);

      // Construir condiciones WHERE
      const whereConditions: any = {
        fechaMovimiento: {
          gte: fechaInicioCalculada,
          lte: fechaFinCalculada
        }
      };

      if (centroAcopioId) {
        whereConditions.establecimiento = {
          centroAcopioId
        };
      }

      if (vacunaId) {
        whereConditions.vacunaId = vacunaId;
      }

      if (establecimientoId) {
        whereConditions.establecimientoId = establecimientoId;
      }

      if (!incluirInactivos) {
        whereConditions.vacuna = {
          estado: 'activo'
        };
        whereConditions.establecimiento = {
          ...whereConditions.establecimiento,
          estado: 'activo'
        };
      }

      // Obtener movimientos para análisis
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: whereConditions,
        include: {
          establecimiento: {
            include: {
              centroAcopio: true
            }
          },
          vacuna: true,
          entregasAdicionales: true
        },
        orderBy: [
          { establecimiento: { nombre: 'asc' } },
          { anio: 'asc' },
          { mes: 'asc' }
        ]
      });

      // Agrupar por establecimiento
      const agrupados = new Map<string, any>();

      movimientos.forEach(mov => {
        const key = mov.establecimientoId;

        if (!agrupados.has(key)) {
          agrupados.set(key, {
            establecimientoId: mov.establecimientoId,
            establecimientoNombre: mov.establecimiento.nombre,
            centroAcopioId: mov.establecimiento.centroAcopioId,
            centroAcopioNombre: mov.establecimiento.centroAcopio?.nombre || 'Sin centro',
            movimientos: []
          });
        }

        agrupados.get(key).movimientos.push(mov);
      });

      // Procesar datos para el reporte
      const reporteData: EficienciaDistribucionItem[] = Array.from(agrupados.values()).map(grupo => {
        const { movimientos: movs } = grupo;

        // Calcular indicadores de eficiencia
        const indicadores = incluirIndicadores ? this.calcularIndicadoresEficiencia(movs) : {
          tiempoPromedioEntrega: 0,
          porcentajeCumplimiento: 0,
          eficienciaStock: 0,
          rotacionInventario: 0
        };

        // Calcular tendencias
        const tendencias = calcularTendencias ? this.calcularTendenciasEficiencia(movs) : {
          mejoraMes: false,
          variacionPorcentual: 0
        };

        // Generar alertas
        const alertas = this.generarAlertasEficiencia(indicadores, tendencias);

        return {
          centroAcopioId: grupo.centroAcopioId,
          centroAcopioNombre: grupo.centroAcopioNombre,
          establecimientoId: grupo.establecimientoId,
          establecimientoNombre: grupo.establecimientoNombre,
          periodoAnalisis: {
            fechaInicio: fechaInicioCalculada,
            fechaFin: fechaFinCalculada
          },
          indicadores,
          tendencias,
          alertas
        };
      });

      console.log(`✅ Reporte de eficiencia de distribución generado: ${reporteData.length} registros`);

      return {
        success: true,
        data: reporteData
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de eficiencia de distribución:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de eficiencia de distribución'
      };
    }
  }

  // =====================================================
  // MÉTODOS AUXILIARES PARA CÁLCULOS
  // =====================================================

  /**
   * Calcular tendencia de consumo (regresión lineal simple)
   */
  private static calcularTendencia(historial: any[]): 'creciente' | 'decreciente' | 'estable' {
    if (historial.length < 2) return 'estable';

    const n = historial.length;
    const sumX = historial.reduce((sum, _, index) => sum + index, 0);
    const sumY = historial.reduce((sum, mov) => sum + mov.consumo, 0);
    const sumXY = historial.reduce((sum, mov, index) => sum + (index * mov.consumo), 0);
    const sumX2 = historial.reduce((sum, _, index) => sum + (index * index), 0);

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    if (pendiente > 0.1) return 'creciente';
    if (pendiente < -0.1) return 'decreciente';
    return 'estable';
  }

  /**
   * Calcular variabilidad (desviación estándar)
   */
  private static calcularVariabilidad(historial: any[], promedio: number): number {
    if (historial.length < 2) return 0;

    const varianza = historial.reduce((sum, mov) => {
      const diff = mov.consumo - promedio;
      return sum + (diff * diff);
    }, 0) / historial.length;

    return Math.sqrt(varianza);
  }

  /**
   * Calcular proyección para el próximo mes
   */
  private static calcularProyeccion(historial: any[], promedio: number): number {
    if (historial.length < 3) return Math.round(promedio);

    // Usar promedio móvil de los últimos 3 meses
    const ultimos3 = historial.slice(-3);
    const promedioReciente = ultimos3.reduce((sum, mov) => sum + mov.consumo, 0) / 3;

    return Math.round(promedioReciente);
  }

  /**
   * Calcular indicadores de eficiencia
   */
  private static calcularIndicadoresEficiencia(movimientos: any[]): {
    tiempoPromedioEntrega: number;
    porcentajeCumplimiento: number;
    eficienciaStock: number;
    rotacionInventario: number;
  } {
    if (movimientos.length === 0) {
      return {
        tiempoPromedioEntrega: 0,
        porcentajeCumplimiento: 0,
        eficienciaStock: 0,
        rotacionInventario: 0
      };
    }

    // Tiempo promedio de entrega (días entre movimientos)
    const tiempoPromedioEntrega = 30; // Placeholder - requiere lógica más compleja

    // Porcentaje de cumplimiento (entregas realizadas vs programadas)
    const entregasRealizadas = movimientos.filter(mov => mov.entrega > 0).length;
    const porcentajeCumplimiento = (entregasRealizadas / movimientos.length) * 100;

    // Eficiencia de stock (stock utilizado vs stock disponible)
    const stockUtilizado = movimientos.reduce((sum, mov) => sum + mov.salida + mov.transSalida, 0);
    const stockDisponible = movimientos.reduce((sum, mov) => sum + mov.saldoAnterior + mov.transIngreso, 0);
    const eficienciaStock = stockDisponible > 0 ? (stockUtilizado / stockDisponible) * 100 : 0;

    // Rotación de inventario
    const rotacionInventario = stockUtilizado > 0 ? stockDisponible / stockUtilizado : 0;

    return {
      tiempoPromedioEntrega: Math.round(tiempoPromedioEntrega * 100) / 100,
      porcentajeCumplimiento: Math.round(porcentajeCumplimiento * 100) / 100,
      eficienciaStock: Math.round(eficienciaStock * 100) / 100,
      rotacionInventario: Math.round(rotacionInventario * 100) / 100
    };
  }

  /**
   * Calcular tendencias de eficiencia
   */
  private static calcularTendenciasEficiencia(movimientos: any[]): {
    mejoraMes: boolean;
    variacionPorcentual: number;
  } {
    if (movimientos.length < 2) {
      return {
        mejoraMes: false,
        variacionPorcentual: 0
      };
    }

    // Comparar último mes con mes anterior
    const movimientosOrdenados = movimientos.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.mes - b.mes;
    });

    const ultimoMes = movimientosOrdenados[movimientosOrdenados.length - 1];
    const mesAnterior = movimientosOrdenados[movimientosOrdenados.length - 2];

    const eficienciaUltimo = ultimoMes.entrega > 0 ? ((ultimoMes.salida + ultimoMes.transSalida) / ultimoMes.entrega) * 100 : 0;
    const eficienciaAnterior = mesAnterior.entrega > 0 ? ((mesAnterior.salida + mesAnterior.transSalida) / mesAnterior.entrega) * 100 : 0;

    const variacionPorcentual = eficienciaAnterior > 0 ?
      ((eficienciaUltimo - eficienciaAnterior) / eficienciaAnterior) * 100 : 0;

    return {
      mejoraMes: variacionPorcentual > 0,
      variacionPorcentual: Math.round(variacionPorcentual * 100) / 100
    };
  }

  /**
   * Generar alertas de eficiencia
   */
  private static generarAlertasEficiencia(
    indicadores: any,
    tendencias: any
  ): string[] {
    const alertas: string[] = [];

    if (indicadores.porcentajeCumplimiento < 80) {
      alertas.push('Bajo porcentaje de cumplimiento en entregas');
    }

    if (indicadores.eficienciaStock < 60) {
      alertas.push('Baja eficiencia en el uso del stock');
    }

    if (indicadores.rotacionInventario > 6) {
      alertas.push('Alta rotación de inventario - posible desabastecimiento');
    }

    if (indicadores.rotacionInventario < 2) {
      alertas.push('Baja rotación de inventario - posible sobrestock');
    }

    if (tendencias.variacionPorcentual < -20) {
      alertas.push('Tendencia decreciente significativa en eficiencia');
    }

    return alertas;
  }

  /**
   * Generar reporte de movimientos por EESS
   *
   * Modelo de datos de MovimientoVacuna:
   * - El campo `salida` en mes=N registra el consumo real del mes N-1
   *   (en febrero se registran las salidas de enero)
   * - El campo `entrega` en mes=N corresponde a la entrega del propio mes N
   * - El stock en el modulo principal se calcula como:
   *   stock = saldoAnterior + transIngreso - salida - transSalida + entrega
   *
   * Por lo tanto, para un rango de fechas del usuario (ej: Ene-Feb 2026):
   * - Salidas: se consultan los meses desplazados +1 (Feb-Mar) para obtener
   *   las salidas reales de Ene-Feb
   * - Entregas: se consultan los meses originales (Ene-Feb)
   * - Stock: se usa el ultimo mes desplazado, con la misma formula del modulo principal
   */
  static async generarMovimientosPorEESS(
    filters: MovimientosPorEESSFilters
  ): Promise<ServiceResult<MovimientosPorEESSItem[]>> {
    try {
      console.log('Generando reporte de movimientos por EESS:', filters);

      const {
        fechaInicio,
        fechaFin,
        centroAcopioId,
        incluirInactivos = false
      } = filters;

      if (!fechaInicio || !fechaFin) {
        return {
          success: false,
          error: 'Las fechas de inicio y fin son requeridas'
        };
      }

      // Parsear fechas
      let fechaInicioObj: Date;
      let fechaFinObj: Date;

      if (fechaInicio instanceof Date) {
        fechaInicioObj = new Date(fechaInicio);
        fechaInicioObj.setUTCHours(0, 0, 0, 0);
      } else {
        fechaInicioObj = new Date(fechaInicio + 'T00:00:00.000Z');
      }

      if (fechaFin instanceof Date) {
        fechaFinObj = new Date(fechaFin);
        fechaFinObj.setUTCHours(23, 59, 59, 999);
      } else {
        fechaFinObj = new Date(fechaFin + 'T23:59:59.999Z');
      }

      // Meses originales del usuario
      const mesInicioUsuario = fechaInicioObj.getUTCMonth() + 1;
      const anioInicioUsuario = fechaInicioObj.getUTCFullYear();
      const mesFinUsuario = fechaFinObj.getUTCMonth() + 1;
      const anioFinUsuario = fechaFinObj.getUTCFullYear();

      // Desplazar +1 mes para salidas y stock
      const desplazarMes = (mes: number, anio: number) => {
        let m = mes + 1, a = anio;
        if (m > 12) { m = 1; a++; }
        return { mes: m, anio: a };
      };

      const inicioDesp = desplazarMes(mesInicioUsuario, anioInicioUsuario);
      const finDesp = desplazarMes(mesFinUsuario, anioFinUsuario);

      console.log(`Usuario: ${mesInicioUsuario}/${anioInicioUsuario} - ${mesFinUsuario}/${anioFinUsuario}`);
      console.log(`Desplazado (salidas/stock): ${inicioDesp.mes}/${inicioDesp.anio} - ${finDesp.mes}/${finDesp.anio}`);

      // Filtros comunes de establecimiento/vacuna
      const filtrosRelacion: any = {};
      if (centroAcopioId && centroAcopioId !== 'todos') {
        filtrosRelacion.establecimiento = { centroAcopioId };
      }
      if (!incluirInactivos) {
        filtrosRelacion.vacuna = { estado: 'activo' };
        filtrosRelacion.establecimiento = {
          ...filtrosRelacion.establecimiento,
          estado: 'activo'
        };
      }

      // --- Helper para construir OR de meses ---
      const buildMesesOR = (mI: number, aI: number, mF: number, aF: number) => {
        const or: any[] = [];
        for (let a = aI; a <= aF; a++) {
          const desde = a === aI ? mI : 1;
          const hasta = a === aF ? mF : 12;
          for (let m = desde; m <= hasta; m++) {
            or.push({ mes: m, anio: a });
          }
        }
        return or;
      };

      // 1) Consulta DESPLAZADA (+1 mes): para obtener las salidas reales
      const movimientosDesplazados = await prisma.movimientoVacuna.findMany({
        where: {
          OR: buildMesesOR(inicioDesp.mes, inicioDesp.anio, finDesp.mes, finDesp.anio),
          ...filtrosRelacion
        },
        include: {
          establecimiento: {
            include: {
              centroAcopio: {
                include: {
                  microred: { include: { red: true } }
                }
              }
            }
          },
          vacuna: true
        },
        orderBy: [
          { establecimiento: { nombre: 'asc' } },
          { vacuna: { nombre: 'asc' } },
          { anio: 'asc' },
          { mes: 'asc' }
        ]
      });

      // 2) Consulta ORIGINAL (sin desplazar): para entregas y stock
      const movimientosOriginales = await prisma.movimientoVacuna.findMany({
        where: {
          OR: buildMesesOR(mesInicioUsuario, anioInicioUsuario, mesFinUsuario, anioFinUsuario),
          ...filtrosRelacion
        },
        select: {
          establecimientoId: true,
          vacunaId: true,
          mes: true,
          anio: true,
          entrega: true,
          saldoAnterior: true,
          transIngreso: true,
          salida: true,
          transSalida: true
        }
      });

      // Mapa de entregas acumuladas (meses originales)
      const entregasMap = new Map<string, number>();
      // Mapa de datos base del ultimo mes por establecimiento/vacuna (para stock)
      const baseStockMap = new Map<string, { mes: number; anio: number; saldoAnterior: number; transIngreso: number; salida: number; transSalida: number }>();

      for (const mov of movimientosOriginales) {
        const key = `${mov.establecimientoId}-${mov.vacunaId}`;
        entregasMap.set(key, (entregasMap.get(key) || 0) + mov.entrega);
        // Guardar datos base del ultimo mes para calcular stock despues
        const prev = baseStockMap.get(key);
        if (!prev || mov.anio > prev.anio || (mov.anio === prev.anio && mov.mes >= prev.mes)) {
          baseStockMap.set(key, {
            mes: mov.mes, anio: mov.anio,
            saldoAnterior: mov.saldoAnterior, transIngreso: mov.transIngreso,
            salida: mov.salida, transSalida: mov.transSalida
          });
        }
      }

      // 3) Consulta de entregas con vale generado para el ultimo mes de cada establecimiento/vacuna
      // Recopilar todos los meses unicos que necesitamos consultar
      const mesesParaVales = new Map<string, { mes: number; anio: number }>();
      for (const [key, base] of baseStockMap) {
        const mesAnioKey = `${base.mes}-${base.anio}`;
        if (!mesesParaVales.has(mesAnioKey)) {
          mesesParaVales.set(mesAnioKey, { mes: base.mes, anio: base.anio });
        }
      }

      // Consultar vales generados para todos los meses relevantes
      const valeConditions: any[] = [];
      for (const { mes, anio } of mesesParaVales.values()) {
        valeConditions.push({ mes, anio });
      }

      const valeDetalles = valeConditions.length > 0 ? await prisma.valeDetalle.findMany({
        where: {
          valeEntrega: {
            OR: valeConditions,
            estado: { in: ['generado', 'impreso', 'entregado'] }
          },
          ...(centroAcopioId && centroAcopioId !== 'todos' ? {
            establecimiento: { centroAcopioId }
          } : {})
        },
        select: {
          establecimientoId: true,
          vacunaId: true,
          cantidadProgramada: true,
          cantidadAdicional: true,
          valeEntrega: {
            select: { mes: true, anio: true }
          }
        }
      }) : [];

      // Mapa de entregas con vale: key = estId-vacId-mes-anio
      const entregasConValeMap = new Map<string, number>();
      for (const detalle of valeDetalles) {
        const key = `${detalle.establecimientoId}-${detalle.vacunaId}-${detalle.valeEntrega.mes}-${detalle.valeEntrega.anio}`;
        const cantidad = (detalle.cantidadProgramada || 0) + (detalle.cantidadAdicional || 0);
        entregasConValeMap.set(key, (entregasConValeMap.get(key) || 0) + cantidad);
      }

      // Calcular stock final por establecimiento/vacuna
      // Stock = saldoAnterior + transIngreso + (entregas con vale generado) - salida - transSalida
      const stockMap = new Map<string, number>();
      for (const [key, base] of baseStockMap) {
        const valeKey = `${key}-${base.mes}-${base.anio}`;
        const entregaConVale = entregasConValeMap.get(valeKey) || 0;
        const stock = base.saldoAnterior + base.transIngreso + entregaConVale - base.salida - base.transSalida;
        stockMap.set(key, stock);
      }

      // Agrupar datos desplazados por establecimiento/vacuna
      const establecimientosMap = new Map<string, any>();

      for (const mov of movimientosDesplazados) {
        const estId = mov.establecimientoId;

        if (!establecimientosMap.has(estId)) {
          const ca = mov.establecimiento.centroAcopio;
          const mr = ca?.microred;
          const red = mr?.red;
          establecimientosMap.set(estId, {
            establecimientoId: estId,
            establecimientoNombre: mov.establecimiento.nombre,
            centroAcopioId: ca?.id || '',
            centroAcopioNombre: ca?.nombre || 'Sin Centro',
            microredId: mr?.id || null,
            microredNombre: mr?.nombre || null,
            redId: red?.id || null,
            redNombre: red?.nombre || null,
            vacunas: new Map<string, any>()
          });
        }

        const est = establecimientosMap.get(estId)!;
        const vacId = mov.vacunaId;

        if (!est.vacunas.has(vacId)) {
          est.vacunas.set(vacId, {
            vacunaId: mov.vacunaId,
            vacunaNombre: mov.vacuna.nombre,
            totalSalidas: 0
          });
        }

        const vd = est.vacunas.get(vacId)!;

        // Acumular salidas de los meses desplazados
        vd.totalSalidas += (mov.salida + mov.transSalida);
      }

      // Construir resultado final
      const reporteData: MovimientosPorEESSItem[] = [];

      for (const [estId, est] of establecimientosMap) {
        const vacunasProcessed: { [vacunaId: string]: any } = {};

        for (const [vacId, vd] of est.vacunas) {
          const key = `${estId}-${vacId}`;
          vacunasProcessed[vacId] = {
            vacunaId: vd.vacunaId,
            vacunaNombre: vd.vacunaNombre,
            totalEntrega: entregasMap.get(key) || 0,
            totalSalidas: vd.totalSalidas,
            stock: stockMap.get(key) || 0
          };
        }

        reporteData.push({
          establecimientoId: est.establecimientoId,
          establecimientoNombre: est.establecimientoNombre,
          centroAcopioId: est.centroAcopioId,
          centroAcopioNombre: est.centroAcopioNombre,
          microredId: est.microredId,
          microredNombre: est.microredNombre,
          redId: est.redId,
          redNombre: est.redNombre,
          vacunas: vacunasProcessed
        });
      }

      console.log(`✅ Reporte de movimientos por EESS generado: ${reporteData.length} establecimientos`);

      return {
        success: true,
        data: reporteData
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de movimientos por EESS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de movimientos por EESS'
      };
    }
  }

  /**
   * Generar reporte de stock de vacunas por EESS
   */
  static async generarStockVacunasEESS(
    filters: StockVacunasEESSFilters
  ): Promise<ServiceResult<StockVacunasEESSItem[]>> {
    try {
      console.log('🔄 Generando reporte de stock de vacunas por EESS:', filters);

      // Validar vacunas
      for (const vacunaId of filters.vacunaIds) {
        if (!validateUUID(vacunaId)) {
          return {
            success: false,
            error: `ID de vacuna inválido: ${vacunaId}`
          };
        }
      }

      // Obtener establecimientos con sus centros de acopio y microred
      const whereEstablecimiento: any = {
        estado: 'activo'
      };

      if (filters.centroAcopioId && validateUUID(filters.centroAcopioId)) {
        whereEstablecimiento.centroAcopioId = filters.centroAcopioId;
      }

      const establecimientos = await prisma.establecimiento.findMany({
        where: whereEstablecimiento,
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
          { centroAcopio: { nombre: 'asc' } },
          { nombre: 'asc' }
        ]
      });

      // Obtener vacunas seleccionadas
      const vacunas = await prisma.vacuna.findMany({
        where: {
          id: { in: filters.vacunaIds },
          estado: 'activo'
        },
        orderBy: { nombre: 'asc' }
      });

      const vacunaMap = new Map(vacunas.map(v => [v.id, v.nombre]));

      // Calcular el mes y año del rango de fechas (usar el último mes del rango)
      const fechaFin = new Date(filters.fechaFin);
      const mesFin = fechaFin.getMonth() + 1;
      const anioFin = fechaFin.getFullYear();

      // Obtener movimientos del último mes para calcular stock base
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: {
          vacunaId: { in: filters.vacunaIds },
          mes: mesFin,
          anio: anioFin,
          establecimiento: {
            estado: 'activo',
            ...(filters.centroAcopioId && { centroAcopioId: filters.centroAcopioId })
          }
        },
        select: {
          establecimientoId: true,
          vacunaId: true,
          saldoAnterior: true,
          transIngreso: true,
          salida: true,
          transSalida: true
        }
      });

      // Obtener entregas con vales generados (solo estas cuentan como stock real)
      const valeDetalles = await prisma.valeDetalle.findMany({
        where: {
          vacunaId: { in: filters.vacunaIds },
          establecimiento: {
            estado: 'activo',
            ...(filters.centroAcopioId && { centroAcopioId: filters.centroAcopioId })
          },
          valeEntrega: {
            mes: mesFin,
            anio: anioFin,
            estado: { in: ['generado', 'impreso', 'entregado'] }
          }
        },
        select: {
          establecimientoId: true,
          vacunaId: true,
          cantidadProgramada: true,
          cantidadAdicional: true
        }
      });

      // Crear mapa de entregas con vale por establecimiento y vacuna
      const entregasConValeMap = new Map<string, Map<string, number>>();
      for (const detalle of valeDetalles) {
        if (!entregasConValeMap.has(detalle.establecimientoId)) {
          entregasConValeMap.set(detalle.establecimientoId, new Map());
        }
        const cantidad = (detalle.cantidadProgramada || 0) + (detalle.cantidadAdicional || 0);
        const actual = entregasConValeMap.get(detalle.establecimientoId)!.get(detalle.vacunaId) || 0;
        entregasConValeMap.get(detalle.establecimientoId)!.set(detalle.vacunaId, actual + cantidad);
      }

      // Crear mapa de stock por establecimiento y vacuna
      // Stock = saldoAnterior + transIngreso + (entregas con vale) - salida - transSalida
      const stockMap = new Map<string, Map<string, number>>();
      for (const mov of movimientos) {
        if (!stockMap.has(mov.establecimientoId)) {
          stockMap.set(mov.establecimientoId, new Map());
        }
        // Obtener entregas con vale en lugar de usar mov.entrega directamente
        const entregaConVale = entregasConValeMap.get(mov.establecimientoId)?.get(mov.vacunaId) || 0;
        const stock = (mov.saldoAnterior || 0) + (mov.transIngreso || 0) + entregaConVale - (mov.salida || 0) - (mov.transSalida || 0);
        stockMap.get(mov.establecimientoId)!.set(mov.vacunaId, stock);
      }

      // Construir resultado - usar solo vacunas activas encontradas en BD
      const reporteData: StockVacunasEESSItem[] = [];

      for (const establecimiento of establecimientos) {
        const vacunasData: StockVacunasEESSItem['vacunas'] = {};

        // Iterar solo sobre las vacunas activas encontradas, no sobre filters.vacunaIds
        for (const vacuna of vacunas) {
          const stock = stockMap.get(establecimiento.id)?.get(vacuna.id) || 0;

          vacunasData[vacuna.id] = {
            vacunaId: vacuna.id,
            vacunaNombre: vacuna.nombre,
            stock
          };
        }

        reporteData.push({
          establecimientoId: establecimiento.id,
          establecimientoNombre: establecimiento.nombre,
          centroAcopioId: establecimiento.centroAcopioId || '',
          centroAcopioNombre: establecimiento.centroAcopio?.nombre || 'Sin Centro de Acopio',
          microredId: establecimiento.centroAcopio?.microredId || null,
          microredNombre: establecimiento.centroAcopio?.microred?.nombre || null,
          redId: establecimiento.centroAcopio?.microred?.redId || null,
          redNombre: establecimiento.centroAcopio?.microred?.red?.nombre || null,
          vacunas: vacunasData
        });
      }

      console.log(`✅ Reporte de stock de vacunas por EESS generado: ${reporteData.length} establecimientos`);

      return {
        success: true,
        data: reporteData
      };

    } catch (error) {
      console.error('❌ Error al generar reporte de stock de vacunas por EESS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar reporte de stock de vacunas por EESS'
      };
    }
  }
}