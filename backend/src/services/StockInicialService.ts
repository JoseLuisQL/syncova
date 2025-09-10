import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { createError } from '@/utils/errors';

/**
 * Servicio profesional para gestión de stock inicial mensual
 * Captura y mantiene el historial de stock inicial por vacuna/mes/año
 */
export class StockInicialService {

  /**
   * Capturar stock inicial de una vacuna para un mes/año específico
   * Solo captura si no existe ya un registro para ese período
   */
  static async capturarStockInicial(
    vacunaId: string,
    mes: number,
    anio: number,
    observaciones?: string
  ): Promise<ServiceResult<any>> {
    try {
      console.log(`📊 [StockInicialService] Capturando stock inicial para vacuna ${vacunaId}, período ${mes}/${anio}`);

      // Verificar si ya existe un registro para este período
      const existeRegistro = await prisma.stockInicialMensual.findUnique({
        where: {
          uk_stock_inicial_vacuna_mes_anio: {
            vacunaId,
            mes,
            anio
          }
        }
      });

      if (existeRegistro) {
        console.log(`ℹ️  [StockInicialService] Ya existe registro de stock inicial para vacuna ${vacunaId} en ${mes}/${anio}: ${existeRegistro.stockInicial} unidades`);
        return {
          success: true,
          data: existeRegistro,
          message: 'Stock inicial ya fue capturado previamente'
        };
      }

      // Validar que la vacuna existe
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { id: true, nombre: true }
      });

      if (!vacuna) {
        throw createError('Vacuna no encontrada', 404);
      }

      // Obtener stock actual total de la vacuna (suma de todos los lotes disponibles)
      const stockTotalActual = await this.obtenerStockTotalVacuna(vacunaId);

      console.log(`📈 [StockInicialService] Stock total actual de ${vacuna.nombre}: ${stockTotalActual} unidades`);

      // Crear el registro de stock inicial
      const stockInicialRegistro = await prisma.stockInicialMensual.create({
        data: {
          vacunaId,
          mes,
          anio,
          stockInicial: stockTotalActual,
          observaciones: observaciones || `Stock inicial capturado automáticamente para ${vacuna.nombre} en ${mes}/${anio}`
        },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              presentacion: true
            }
          }
        }
      });

      console.log(`✅ [StockInicialService] Stock inicial capturado exitosamente: ${stockTotalActual} unidades de ${vacuna.nombre} para ${mes}/${anio}`);

      return {
        success: true,
        data: stockInicialRegistro,
        message: `Stock inicial capturado: ${stockTotalActual} unidades`
      };

    } catch (error) {
      console.error('❌ [StockInicialService] Error capturando stock inicial:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al capturar stock inicial'
      };
    }
  }

  /**
   * Obtener stock inicial de una vacuna para un mes/año específico
   */
  static async obtenerStockInicial(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{ stockInicial: number; fechaCaptura: Date } | null>> {
    try {
      const registro = await prisma.stockInicialMensual.findUnique({
        where: {
          uk_stock_inicial_vacuna_mes_anio: {
            vacunaId,
            mes,
            anio
          }
        },
        select: {
          stockInicial: true,
          fechaCaptura: true
        }
      });

      return {
        success: true,
        data: registro ? {
          stockInicial: registro.stockInicial,
          fechaCaptura: registro.fechaCaptura
        } : null
      };

    } catch (error) {
      console.error('❌ [StockInicialService] Error obteniendo stock inicial:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener stock inicial'
      };
    }
  }

  /**
   * Verificar si ya existe un vale generado para una vacuna en un mes/año específico
   * Esto determina si debemos capturar el stock inicial o no
   */
  static async existeValeParaVacunaEnPeriodo(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<boolean>> {
    try {
      // Buscar vales que incluyan esta vacuna en el período especificado
      const valeExistente = await prisma.valeEntrega.findFirst({
        where: {
          mes,
          anio,
          estado: 'generado', // Solo vales válidos
          detalles: {
            some: {
              vacunaId
            }
          }
        },
        select: { id: true }
      });

      const existeVale = !!valeExistente;
      
      if (existeVale) {
        console.log(`📋 [StockInicialService] Ya existe vale con vacuna ${vacunaId} para el período ${mes}/${anio}`);
      }

      return {
        success: true,
        data: existeVale
      };

    } catch (error) {
      console.error('❌ [StockInicialService] Error verificando vales existentes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar vales existentes'
      };
    }
  }

  /**
   * Capturar stock inicial de forma inteligente
   * Solo captura si no existe vale previo para esa vacuna en ese mes/año
   */
  static async capturarStockInicialInteligente(
    vacunaId: string,
    mes: number,
    anio: number,
    observaciones?: string
  ): Promise<ServiceResult<any>> {
    try {
      console.log(`🧠 [StockInicialService] Evaluando captura inteligente de stock inicial para vacuna ${vacunaId}, período ${mes}/${anio}`);

      // Verificar si ya existe un vale para esta vacuna en este período
      const resultadoVale = await this.existeValeParaVacunaEnPeriodo(vacunaId, mes, anio);
      
      if (!resultadoVale.success) {
        return {
          success: false,
          error: resultadoVale.error
        };
      }

      // Si ya existe vale, no capturamos stock inicial
      if (resultadoVale.data) {
        console.log(`ℹ️  [StockInicialService] Ya existe vale para vacuna ${vacunaId} en ${mes}/${anio}, omitiendo captura de stock inicial`);
        return {
          success: true,
          data: null,
          message: 'Stock inicial no capturado: ya existe vale para esta vacuna en el período'
        };
      }

      // Si no existe vale, proceder con la captura
      console.log(`✨ [StockInicialService] No existe vale previo, procediendo a capturar stock inicial para vacuna ${vacunaId} en ${mes}/${anio}`);
      
      return await this.capturarStockInicial(
        vacunaId,
        mes,
        anio,
        observaciones || `Stock inicial capturado antes del primer vale del mes ${mes}/${anio}`
      );

    } catch (error) {
      console.error('❌ [StockInicialService] Error en captura inteligente:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en captura inteligente de stock inicial'
      };
    }
  }

  /**
   * Obtener stock total actual de una vacuna (suma de todos los lotes disponibles)
   * Método privado auxiliar
   */
  private static async obtenerStockTotalVacuna(vacunaId: string): Promise<number> {
    const result = await prisma.loteVacuna.aggregate({
      where: {
        vacunaId,
        estado: 'disponible',
        cantidadActual: {
          gt: 0
        }
      },
      _sum: {
        cantidadActual: true
      }
    });

    return result._sum.cantidadActual || 0;
  }

  /**
   * Obtener historial de stocks iniciales para una vacuna
   */
  static async obtenerHistorialStockInicial(
    vacunaId: string,
    limite?: number
  ): Promise<ServiceResult<any[]>> {
    try {
      const registros = await prisma.stockInicialMensual.findMany({
        where: { vacunaId },
        include: {
          vacuna: {
            select: {
              nombre: true,
              presentacion: true
            }
          }
        },
        orderBy: [
          { anio: 'desc' },
          { mes: 'desc' }
        ],
        take: limite
      });

      return {
        success: true,
        data: registros
      };

    } catch (error) {
      console.error('❌ [StockInicialService] Error obteniendo historial:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener historial de stock inicial'
      };
    }
  }

  /**
   * Capturar stock inicial para múltiples vacunas de forma batch optimizada
   * Útil para cuando se generan vales que incluyen múltiples vacunas
   */
  static async capturarStockInicialBatch(
    vacunas: Array<{ vacunaId: string }>,
    mes: number,
    anio: number,
    observaciones?: string
  ): Promise<ServiceResult<any[]>> {
    try {
      console.log(`🔄 [StockInicialService] Capturando stock inicial para ${vacunas.length} vacunas en lote para ${mes}/${anio}`);

      // OPTIMIZACIÓN 1: Verificar en batch qué vacunas ya tienen registros
      const vacunaIds = vacunas.map(v => v.vacunaId);
      const registrosExistentes = await prisma.stockInicialMensual.findMany({
        where: {
          vacunaId: { in: vacunaIds },
          mes,
          anio
        },
        select: { vacunaId: true, stockInicial: true }
      });

      const vacunasConRegistro = new Set(registrosExistentes.map(r => r.vacunaId));
      const vacunasSinRegistro = vacunas.filter(v => !vacunasConRegistro.has(v.vacunaId));

      console.log(`📊 [StockInicialService] ${registrosExistentes.length} vacunas ya tienen registro, ${vacunasSinRegistro.length} necesitan captura`);

      // OPTIMIZACIÓN 2: Verificar en batch qué vacunas tienen vales previos
      let vacunasPorCapturar = vacunasSinRegistro;
      
      if (vacunasSinRegistro.length > 0) {
        const valesExistentes = await prisma.valeEntrega.findMany({
          where: {
            mes,
            anio,
            estado: 'generado',
            detalles: {
              some: {
                vacunaId: { in: vacunasSinRegistro.map(v => v.vacunaId) }
              }
            }
          },
          include: {
            detalles: {
              select: { vacunaId: true }
            }
          }
        });

        const vacunasConVale = new Set();
        valesExistentes.forEach(vale => {
          vale.detalles.forEach(detalle => {
            vacunasConVale.add(detalle.vacunaId);
          });
        });

        vacunasPorCapturar = vacunasSinRegistro.filter(v => !vacunasConVale.has(v.vacunaId));
        
        console.log(`📋 [StockInicialService] ${vacunasConVale.size} vacunas tienen vales previos, ${vacunasPorCapturar.length} necesitan captura real`);
      }

      // OPTIMIZACIÓN 3: Obtener stock de todas las vacunas necesarias en una sola consulta
      let stocksVacunas = new Map();
      if (vacunasPorCapturar.length > 0) {
        const vacunaIdsCapturar = vacunasPorCapturar.map(v => v.vacunaId);
        const stocksResult = await prisma.loteVacuna.groupBy({
          by: ['vacunaId'],
          where: {
            vacunaId: { in: vacunaIdsCapturar },
            estado: 'disponible',
            cantidadActual: { gt: 0 }
          },
          _sum: { cantidadActual: true }
        });

        stocksVacunas = new Map(
          stocksResult.map(result => [
            result.vacunaId,
            result._sum.cantidadActual || 0
          ])
        );
      }

      // OPTIMIZACIÓN 4: Crear todos los registros en una sola transacción
      const registrosParaCrear = vacunasPorCapturar
        .filter(v => stocksVacunas.has(v.vacunaId))
        .map(v => ({
          vacunaId: v.vacunaId,
          mes,
          anio,
          stockInicial: stocksVacunas.get(v.vacunaId)!,
          observaciones: observaciones || `Stock inicial capturado automáticamente en batch para ${mes}/${anio}`
        }));

      let registrosCreados = [];
      if (registrosParaCrear.length > 0) {
        console.log(`📝 [StockInicialService] Creando ${registrosParaCrear.length} registros en batch...`);
        
        // Usar createMany para inserción batch optimizada
        await prisma.stockInicialMensual.createMany({
          data: registrosParaCrear,
          skipDuplicates: true // Por si acaso hay duplicados
        });

        registrosCreados = registrosParaCrear;
      }

      // Construir resultados
      const resultados = vacunas.map(({ vacunaId }) => {
        const registroExistente = registrosExistentes.find(r => r.vacunaId === vacunaId);
        const registroCreado = registrosCreados.find(r => r.vacunaId === vacunaId);

        if (registroExistente) {
          return {
            vacunaId,
            resultado: {
              success: true,
              data: { stockInicial: registroExistente.stockInicial },
              message: 'Stock inicial ya fue capturado previamente'
            }
          };
        } else if (registroCreado) {
          return {
            vacunaId,
            resultado: {
              success: true,
              data: { stockInicial: registroCreado.stockInicial },
              message: `Stock inicial capturado: ${registroCreado.stockInicial} unidades`
            }
          };
        } else {
          return {
            vacunaId,
            resultado: {
              success: true,
              data: null,
              message: 'Stock inicial no capturado: ya existe vale para esta vacuna en el período'
            }
          };
        }
      });

      const exitosos = resultados.filter(r => r.resultado.success).length;
      const conRegistros = resultados.filter(r => r.resultado.data).length;
      
      console.log(`✅ [StockInicialService] Batch optimizado completado: ${exitosos} exitosos, ${conRegistros} con registros nuevos/existentes`);

      return {
        success: true,
        data: resultados,
        message: `Batch optimizado procesado: ${exitosos} exitosos, ${conRegistros} con registros`
      };

    } catch (error) {
      console.error('❌ [StockInicialService] Error en batch optimizado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en procesamiento batch optimizado de stock inicial'
      };
    }
  }
}
