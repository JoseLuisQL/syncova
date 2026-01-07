import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { ConfiguracionJeringaVacunaService } from '../ConfiguracionJeringaVacunaService';

/**
 * Interfaces for impact calculation
 */
export interface LoteVacunaImpacto {
  id: string;
  numero: string;
  cantidadActual: number;
  cantidadDespues: number;
  fechaVencimiento: Date;
}

export interface LoteJeringaImpacto {
  id: string;
  tipo: string;
  capacidad: string;
  numero: string;
  cantidadActual: number;
  cantidadDespues: number;
}

export interface ValeAfectadoImpacto {
  id: string;
  numero: string;
  fechaGeneracion: Date;
  cantidadAnterior: number;
  cantidadNueva: number;
}

export interface ImpactoModificacion {
  resumen: {
    establecimientoNombre: string;
    vacunaNombre: string;
    cantidadActual: number;
    cantidadNueva: number;
    diferencia: number;
  };
  impactoVacunas: {
    diferencia: number;
    accion: 'restaurar' | 'deducir';
    lotesAfectados: LoteVacunaImpacto[];
    stockTotalActual: number;
    stockTotalDespues: number;
  };
  impactoJeringas: {
    diferencia: number;
    accion: 'restaurar' | 'deducir';
    lotesAfectados: LoteJeringaImpacto[];
    stockTotalActual: number;
    stockTotalDespues: number;
  };
  kardex: {
    registrosNuevos: number;
    tipoMovimiento: 'ingreso' | 'salida';
  };
  valesAfectados: ValeAfectadoImpacto[];
  advertencias: string[];
}

/**
 * Service for calculating modification impact on stocks and vales
 */
export class ValeImpactService {

  /**
   * Calculate the complete impact of modifying a delivery
   */
  static async calcularImpactoModificacion(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    cantidadActual: number,
    cantidadNueva: number
  ): Promise<ServiceResult<ImpactoModificacion>> {
    try {
      console.log(`🔍 [ValeImpactService] Calculando impacto para establecimiento ${establecimientoId}, vacuna ${vacunaId}, ${mes}/${anio}`);
      console.log(`📊 [ValeImpactService] Cantidad actual: ${cantidadActual}, Cantidad nueva: ${cantidadNueva}`);

      const diferencia = cantidadNueva - cantidadActual;
      const esRestauracion = diferencia < 0;
      const cantidadAbsoluta = Math.abs(diferencia);

      // Get establecimiento info
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id: establecimientoId },
        select: { 
          id: true, 
          nombre: true, 
          centroAcopioId: true 
        }
      });

      if (!establecimiento) {
        return { success: false, error: 'Establecimiento no encontrado' };
      }

      // Get vacuna info
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { 
          id: true, 
          nombre: true, 
          dosisPorFrasco: true 
        }
      });

      if (!vacuna) {
        return { success: false, error: 'Vacuna no encontrada' };
      }

      // Determine centro de acopio
      const centroAcopioId = establecimiento.centroAcopioId;

      // Calculate vaccine stock impact
      const impactoVacunas = await this.calcularImpactoVacunas(
        vacunaId, 
        cantidadAbsoluta, 
        esRestauracion
      );

      // Calculate syringe stock impact
      const impactoJeringas = await this.calcularImpactoJeringas(
        vacunaId,
        cantidadAbsoluta,
        esRestauracion,
        centroAcopioId
      );

      // Get affected vales
      const valesAfectados = await this.obtenerValesAfectados(
        establecimientoId,
        vacunaId,
        mes,
        anio,
        cantidadActual,
        cantidadNueva
      );

      // Calculate kardex entries
      const kardexRegistros = impactoVacunas.lotesAfectados.length + impactoJeringas.lotesAfectados.length;

      // Build warnings
      const advertencias: string[] = [];
      
      if (esRestauracion && impactoVacunas.lotesAfectados.length === 0) {
        advertencias.push('No se encontraron lotes de vacunas para restaurar. Los lotes pueden haber sido modificados.');
      }
      
      if (!esRestauracion && impactoVacunas.stockTotalActual < cantidadAbsoluta) {
        advertencias.push(`Stock insuficiente de vacunas. Disponible: ${impactoVacunas.stockTotalActual}, Requerido: ${cantidadAbsoluta}`);
      }

      if (valesAfectados.length === 0) {
        advertencias.push('No se encontraron vales generados para este período. La modificación no afectará vales existentes.');
      }

      const resultado: ImpactoModificacion = {
        resumen: {
          establecimientoNombre: establecimiento.nombre,
          vacunaNombre: vacuna.nombre,
          cantidadActual,
          cantidadNueva,
          diferencia
        },
        impactoVacunas: {
          diferencia: esRestauracion ? cantidadAbsoluta : -cantidadAbsoluta,
          accion: esRestauracion ? 'restaurar' : 'deducir',
          lotesAfectados: impactoVacunas.lotesAfectados,
          stockTotalActual: impactoVacunas.stockTotalActual,
          stockTotalDespues: impactoVacunas.stockTotalDespues
        },
        impactoJeringas: {
          diferencia: esRestauracion ? impactoJeringas.cantidadTotal : -impactoJeringas.cantidadTotal,
          accion: esRestauracion ? 'restaurar' : 'deducir',
          lotesAfectados: impactoJeringas.lotesAfectados,
          stockTotalActual: impactoJeringas.stockTotalActual,
          stockTotalDespues: impactoJeringas.stockTotalDespues
        },
        kardex: {
          registrosNuevos: kardexRegistros,
          tipoMovimiento: esRestauracion ? 'ingreso' : 'salida'
        },
        valesAfectados,
        advertencias
      };

      console.log(`✅ [ValeImpactService] Impacto calculado: ${valesAfectados.length} vales, ${impactoVacunas.lotesAfectados.length} lotes vacunas, ${impactoJeringas.lotesAfectados.length} lotes jeringas`);

      return {
        success: true,
        data: resultado
      };
    } catch (error) {
      console.error('Error calculando impacto de modificación:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al calcular impacto'
      };
    }
  }

  /**
   * Calculate impact on vaccine stocks
   */
  private static async calcularImpactoVacunas(
    vacunaId: string,
    cantidad: number,
    esRestauracion: boolean
  ): Promise<{
    lotesAfectados: LoteVacunaImpacto[];
    stockTotalActual: number;
    stockTotalDespues: number;
  }> {
    // Get available lots (FIFO order)
    const lotes = await prisma.loteVacuna.findMany({
      where: {
        vacunaId,
        estado: { in: ['disponible', 'agotado'] },
        ...(esRestauracion ? {} : { cantidadActual: { gt: 0 } })
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ],
      select: {
        id: true,
        numero: true,
        cantidadActual: true,
        fechaVencimiento: true
      }
    });

    // Calculate total current stock
    const stockTotalActual = lotes.reduce((sum, l) => sum + l.cantidadActual, 0);

    const lotesAfectados: LoteVacunaImpacto[] = [];
    let cantidadRestante = cantidad;

    for (const lote of lotes) {
      if (cantidadRestante <= 0) break;

      if (esRestauracion) {
        // For restoration, we add to the first available lots
        const cantidadARestaurar = Math.min(cantidadRestante, cantidad);
        lotesAfectados.push({
          id: lote.id,
          numero: lote.numero,
          cantidadActual: lote.cantidadActual,
          cantidadDespues: lote.cantidadActual + cantidadARestaurar,
          fechaVencimiento: lote.fechaVencimiento
        });
        cantidadRestante -= cantidadARestaurar;
      } else {
        // For deduction, use FIFO
        const cantidadADeducir = Math.min(lote.cantidadActual, cantidadRestante);
        if (cantidadADeducir > 0) {
          lotesAfectados.push({
            id: lote.id,
            numero: lote.numero,
            cantidadActual: lote.cantidadActual,
            cantidadDespues: lote.cantidadActual - cantidadADeducir,
            fechaVencimiento: lote.fechaVencimiento
          });
          cantidadRestante -= cantidadADeducir;
        }
      }
    }

    const stockTotalDespues = esRestauracion 
      ? stockTotalActual + cantidad 
      : stockTotalActual - cantidad;

    return {
      lotesAfectados,
      stockTotalActual,
      stockTotalDespues: Math.max(0, stockTotalDespues)
    };
  }

  /**
   * Calculate impact on syringe stocks
   */
  private static async calcularImpactoJeringas(
    vacunaId: string,
    cantidadVacunas: number,
    esRestauracion: boolean,
    centroAcopioId?: string | null
  ): Promise<{
    lotesAfectados: LoteJeringaImpacto[];
    stockTotalActual: number;
    stockTotalDespues: number;
    cantidadTotal: number;
  }> {
    // Get syringe configuration for this vaccine
    const configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
      vacunaId,
      cantidadVacunas,
      centroAcopioId || undefined,
      false
    );

    if (!configResult.success || !configResult.data || configResult.data.length === 0) {
      return {
        lotesAfectados: [],
        stockTotalActual: 0,
        stockTotalDespues: 0,
        cantidadTotal: 0
      };
    }

    const lotesAfectados: LoteJeringaImpacto[] = [];
    let stockTotalActual = 0;
    let stockTotalDespues = 0;
    let cantidadTotal = 0;

    for (const jeringaConfig of configResult.data) {
      const cantidadNecesaria = jeringaConfig.cantidad;
      cantidadTotal += cantidadNecesaria;

      // Get jeringa info
      const jeringa = await prisma.jeringa.findUnique({
        where: { id: jeringaConfig.jeringaId },
        select: { tipo: true, capacidad: true }
      });

      // Get available lots
      const lotes = await prisma.loteJeringa.findMany({
        where: {
          jeringaId: jeringaConfig.jeringaId,
          estado: { in: ['disponible', 'agotado'] },
          ...(esRestauracion ? {} : { cantidadActual: { gt: 0 } })
        },
        orderBy: [
          { fechaVencimiento: 'asc' },
          { fechaIngreso: 'asc' }
        ],
        select: {
          id: true,
          numero: true,
          cantidadActual: true
        }
      });

      const stockJeringaActual = lotes.reduce((sum, l) => sum + l.cantidadActual, 0);
      stockTotalActual += stockJeringaActual;

      let cantidadRestante = cantidadNecesaria;

      for (const lote of lotes) {
        if (cantidadRestante <= 0) break;

        if (esRestauracion) {
          const cantidadARestaurar = Math.min(cantidadRestante, cantidadNecesaria);
          lotesAfectados.push({
            id: lote.id,
            tipo: jeringa?.tipo || 'Jeringa',
            capacidad: jeringa?.capacidad || '',
            numero: lote.numero,
            cantidadActual: lote.cantidadActual,
            cantidadDespues: lote.cantidadActual + cantidadARestaurar
          });
          cantidadRestante -= cantidadARestaurar;
        } else {
          const cantidadADeducir = Math.min(lote.cantidadActual, cantidadRestante);
          if (cantidadADeducir > 0) {
            lotesAfectados.push({
              id: lote.id,
              tipo: jeringa?.tipo || 'Jeringa',
              capacidad: jeringa?.capacidad || '',
              numero: lote.numero,
              cantidadActual: lote.cantidadActual,
              cantidadDespues: lote.cantidadActual - cantidadADeducir
            });
            cantidadRestante -= cantidadADeducir;
          }
        }
      }

      stockTotalDespues += esRestauracion 
        ? stockJeringaActual + cantidadNecesaria 
        : Math.max(0, stockJeringaActual - cantidadNecesaria);
    }

    return {
      lotesAfectados,
      stockTotalActual,
      stockTotalDespues,
      cantidadTotal
    };
  }

  /**
   * Get affected vales for the modification
   */
  private static async obtenerValesAfectados(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    cantidadActual: number,
    cantidadNueva: number
  ): Promise<ValeAfectadoImpacto[]> {
    // Get establecimiento to determine centro de acopio
    const establecimiento = await prisma.establecimiento.findUnique({
      where: { id: establecimientoId },
      select: { centroAcopioId: true }
    });

    if (!establecimiento?.centroAcopioId) {
      return [];
    }

    // Find vales that contain this establecimiento and vacuna
    const vales = await prisma.valeEntrega.findMany({
      where: {
        centroAcopioId: establecimiento.centroAcopioId,
        mes,
        anio,
        estado: 'generado',
        detalles: {
          some: {
            establecimientoId,
            vacunaId
          }
        }
      },
      include: {
        detalles: {
          where: {
            establecimientoId,
            vacunaId
          },
          select: {
            cantidadProgramada: true,
            cantidadAdicional: true
          }
        }
      },
      orderBy: { fechaGeneracion: 'desc' }
    });

    return vales.map(vale => {
      const detalle = vale.detalles[0];
      const cantidadEnVale = detalle 
        ? detalle.cantidadProgramada + detalle.cantidadAdicional 
        : cantidadActual;

      return {
        id: vale.id,
        numero: vale.numero,
        fechaGeneracion: vale.fechaGeneracion,
        cantidadAnterior: cantidadEnVale,
        cantidadNueva: cantidadNueva
      };
    });
  }
}
