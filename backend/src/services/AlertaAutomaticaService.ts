import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { NivelAlerta, Prisma } from '@prisma/client';
import { AlertaRealtimeService } from '@/services/AlertaRealtimeService';

interface GeneracionResult {
  alertasGeneradas: number;
  alertasVencimiento: number;
  alertasStockBajo: number;
  detalles: string[];
}

/**
 * Servicio para generación automática de alertas del sistema
 * Detecta vacunas próximas a vencer y stock bajo
 * 
 * IMPORTANTE: Las alertas NO se regeneran si ya existe una alerta reciente
 * para el mismo lote/vacuna, incluso si fue marcada como leída.
 * Esto evita que las alertas "vuelvan" constantemente.
 */
export class AlertaAutomaticaService {
  
  // Período en días para considerar una alerta como "reciente"
  // Si existe una alerta creada en este período, no se crea otra
  private static readonly PERIODO_COOLDOWN_DIAS = 7;

  /**
   * Generar todas las alertas automáticas
   */
  static async generarAlertas(
    diasAnticipacionVencimiento: number = 30,
    stockMinimoUnidades: number = 100
  ): Promise<ServiceResult<GeneracionResult>> {
    try {
      const detalles: string[] = [];
      let alertasVencimiento = 0;
      let alertasStockBajo = 0;

      // Generar alertas de vencimiento
      const resultVencimiento = await this.generarAlertasVencimiento(diasAnticipacionVencimiento);
      if (resultVencimiento.success && resultVencimiento.data) {
        alertasVencimiento = resultVencimiento.data.cantidad;
        detalles.push(...resultVencimiento.data.detalles);
      }

      // Generar alertas de stock bajo (ahora usa cantidad absoluta, no porcentaje)
      const resultStock = await this.generarAlertasStockBajo(stockMinimoUnidades);
      if (resultStock.success && resultStock.data) {
        alertasStockBajo = resultStock.data.cantidad;
        detalles.push(...resultStock.data.detalles);
      }

      const totalGeneradas = alertasVencimiento + alertasStockBajo;

      if (totalGeneradas > 0) {
        AlertaRealtimeService.notifyAlertasChanged('automatic-generated', { count: totalGeneradas });
      }

      return {
        success: true,
        data: {
          alertasGeneradas: totalGeneradas,
          alertasVencimiento,
          alertasStockBajo,
          detalles
        }
      };
    } catch (error) {
      console.error('Error al generar alertas automáticas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar alertas automáticas'
      };
    }
  }

  /**
   * Verificar si existe una alerta reciente para un lote específico
   * Considera TODAS las alertas (leídas y no leídas) creadas en el período de cooldown
   */
  private static async existeAlertaRecienteLote(loteId: string): Promise<boolean> {
    const fechaCooldown = new Date();
    fechaCooldown.setDate(fechaCooldown.getDate() - this.PERIODO_COOLDOWN_DIAS);

    const alertaExistente = await prisma.alerta.findFirst({
      where: {
        tipo: 'vencimiento',
        fechaCreacion: {
          gte: fechaCooldown
        },
        parametros: {
          path: ['loteId'],
          equals: loteId
        }
      }
    });

    return alertaExistente !== null;
  }

  /**
   * Verificar si existe una alerta reciente para una vacuna específica (stock bajo)
   */
  private static async existeAlertaRecienteVacuna(vacunaId: string): Promise<boolean> {
    const fechaCooldown = new Date();
    fechaCooldown.setDate(fechaCooldown.getDate() - this.PERIODO_COOLDOWN_DIAS);

    const alertaExistente = await prisma.alerta.findFirst({
      where: {
        tipo: 'stock_bajo',
        fechaCreacion: {
          gte: fechaCooldown
        },
        parametros: {
          path: ['vacunaId'],
          equals: vacunaId
        }
      }
    });

    return alertaExistente !== null;
  }

  /**
   * Generar alertas para lotes de vacunas próximos a vencer
   */
  static async generarAlertasVencimiento(
    diasAnticipacion: number = 30
  ): Promise<ServiceResult<{ cantidad: number; detalles: string[] }>> {
    try {
      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(hoy.getDate() + diasAnticipacion);

      // Buscar lotes próximos a vencer con stock disponible
      const lotesProximosVencer = await prisma.loteVacuna.findMany({
        where: {
          fechaVencimiento: {
            gte: hoy,
            lte: fechaLimite
          },
          cantidadActual: {
            gt: 0
          },
          estado: 'disponible'
        },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              presentacion: true
            }
          }
        },
        orderBy: {
          fechaVencimiento: 'asc'
        }
      });

      const detalles: string[] = [];
      let cantidad = 0;

      for (const lote of lotesProximosVencer) {
        // Verificar si ya existe una alerta RECIENTE para este lote (leída o no)
        const existeReciente = await this.existeAlertaRecienteLote(lote.id);

        if (!existeReciente) {
          const diasRestantes = Math.ceil(
            (lote.fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
          );

          const nivel: NivelAlerta = diasRestantes <= 7 ? 'error' : diasRestantes <= 15 ? 'warning' : 'info';

          await prisma.alerta.create({
            data: {
              tipo: 'vencimiento',
              titulo: `Lote ${lote.numero} proximo a vencer`,
              descripcion: `El lote ${lote.numero} de ${lote.vacuna.nombre} (${lote.vacuna.presentacion}) vence en ${diasRestantes} dias. Stock actual: ${lote.cantidadActual} unidades.`,
              nivel,
              fechaVencimiento: lote.fechaVencimiento,
              parametros: {
                loteId: lote.id,
                loteNumero: lote.numero,
                vacunaId: lote.vacuna.id,
                vacunaNombre: lote.vacuna.nombre,
                diasRestantes,
                cantidadActual: lote.cantidadActual
              }
            }
          });

          cantidad++;
          detalles.push(`Alerta creada: Lote ${lote.numero} - ${lote.vacuna.nombre} vence en ${diasRestantes} dias`);
        }
      }

      return {
        success: true,
        data: { cantidad, detalles }
      };
    } catch (error) {
      console.error('Error al generar alertas de vencimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar alertas de vencimiento'
      };
    }
  }

  /**
   * Generar alertas para vacunas con stock bajo
   * Usa cantidad absoluta de unidades, no porcentaje
   */
  static async generarAlertasStockBajo(
    stockMinimo: number = 100
  ): Promise<ServiceResult<{ cantidad: number; detalles: string[] }>> {
    try {
      // Obtener todas las vacunas activas con sus lotes
      const vacunas = await prisma.vacuna.findMany({
        where: {
          estado: 'activo'
        },
        include: {
          lotes: {
            where: {
              estado: 'disponible',
              cantidadActual: {
                gt: 0
              },
              fechaVencimiento: {
                gt: new Date() // Solo lotes no vencidos
              }
            }
          }
        }
      });

      const detalles: string[] = [];
      let cantidad = 0;

      for (const vacuna of vacunas) {
        // Calcular stock total actual
        const stockTotal = vacuna.lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);

        // Si el stock está por debajo del umbral
        if (stockTotal <= stockMinimo && stockTotal > 0) {
          // Verificar si ya existe una alerta RECIENTE para esta vacuna
          const existeReciente = await this.existeAlertaRecienteVacuna(vacuna.id);

          if (!existeReciente) {
            const nivel: NivelAlerta = stockTotal <= stockMinimo / 2 ? 'error' : 'warning';

            await prisma.alerta.create({
              data: {
                tipo: 'stock_bajo',
                titulo: `Stock bajo de ${vacuna.nombre}`,
                descripcion: `El stock de ${vacuna.nombre} (${vacuna.presentacion}) es de solo ${stockTotal} unidades. Umbral configurado: ${stockMinimo} unidades.`,
                nivel,
                parametros: {
                  vacunaId: vacuna.id,
                  vacunaNombre: vacuna.nombre,
                  stockActual: stockTotal,
                  stockMinimo,
                  presentacion: vacuna.presentacion
                }
              }
            });

            cantidad++;
            detalles.push(`Alerta creada: ${vacuna.nombre} - Stock: ${stockTotal} unidades`);
          }
        }
      }

      return {
        success: true,
        data: { cantidad, detalles }
      };
    } catch (error) {
      console.error('Error al generar alertas de stock bajo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar alertas de stock bajo'
      };
    }
  }

  /**
   * Generar alerta de sistema (uso general)
   */
  static async generarAlertaSistema(
    titulo: string,
    descripcion: string,
    nivel: NivelAlerta = 'info',
    usuarioId?: string,
    parametros?: Record<string, unknown>
  ): Promise<ServiceResult<{ id: string }>> {
    try {
      const alerta = await prisma.alerta.create({
        data: {
          tipo: 'sistema',
          titulo,
          descripcion,
          nivel,
          usuarioId,
          parametros: parametros as Prisma.InputJsonValue
        }
      });

      AlertaRealtimeService.notifyAlertasChanged('system-created', { id: alerta.id, nivel: alerta.nivel });

      return {
        success: true,
        data: { id: alerta.id }
      };
    } catch (error) {
      console.error('Error al generar alerta de sistema:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar alerta de sistema'
      };
    }
  }

  /**
   * Limpiar alertas antiguas leídas
   */
  static async limpiarAlertasAntiguas(diasAntiguedad: number = 30): Promise<ServiceResult<{ eliminadas: number }>> {
    try {
      const fechaCorte = new Date();
      fechaCorte.setDate(fechaCorte.getDate() - diasAntiguedad);

      const result = await prisma.alerta.deleteMany({
        where: {
          leida: true,
          fechaCreacion: {
            lt: fechaCorte
          }
        }
      });

      if (result.count > 0) {
        AlertaRealtimeService.notifyAlertasChanged('cleanup-resolved', { count: result.count });
      }

      return {
        success: true,
        data: { eliminadas: result.count }
      };
    } catch (error) {
      console.error('Error al limpiar alertas antiguas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al limpiar alertas antiguas'
      };
    }
  }
}
