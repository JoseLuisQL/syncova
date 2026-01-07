import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { createError } from '@/utils/errors';
import { TipoMovimientoKardex } from '@prisma/client';

/**
 * Service for Vale validation operations
 * Handles validation of vale data before generation/modification
 */
export class ValeValidationService {
  
  /**
   * Validate data for generating a vale
   */
  static async validateGenerarValeData(data: {
    centroAcopioId: string;
    mes: number;
    anio: number;
    usuarioId: string;
    tipoVale?: 'completo' | 'solo_base' | 'solo_adicionales';
    gruposEntregasSeleccionados?: number[];
  }): Promise<void> {
    // Validate centro de acopio
    const centroAcopio = await prisma.centroAcopio.findFirst({
      where: {
        id: data.centroAcopioId,
        estado: 'activo'
      }
    });
    if (!centroAcopio) {
      throw createError('El centro de acopio especificado no existe o no está activo', 404);
    }

    // Validate usuario (only if not temporary)
    if (data.usuarioId !== 'temp-user-id') {
      const usuario = await prisma.usuario.findFirst({
        where: {
          id: data.usuarioId,
          estado: 'activo'
        }
      });
      if (!usuario) {
        throw createError('El usuario especificado no existe o no está activo', 404);
      }
    }

    // Validate period
    if (data.mes < 1 || data.mes > 12) {
      throw createError('El mes debe estar entre 1 y 12', 400);
    }

    const currentYear = new Date().getFullYear();
    if (data.anio < 2020 || data.anio > currentYear + 5) {
      throw createError(`El año debe estar entre 2020 y ${currentYear + 5}`, 400);
    }

    // Smart validation based on existing vales content
    const tipoVale = data.tipoVale || 'completo';
    const tiposGenerados = await ValeValidationService.getTiposValesGenerados(data.centroAcopioId, data.mes, data.anio);

    // Validate based on type to generate
    if (tipoVale === 'solo_adicionales') {
      if (data.gruposEntregasSeleccionados && data.gruposEntregasSeleccionados.length > 0) {
        const gruposGenerados = await ValeValidationService.getGruposEntregasAdicionalesGenerados(data.centroAcopioId, data.mes, data.anio);

        const gruposYaGenerados = data.gruposEntregasSeleccionados.filter(grupo =>
          gruposGenerados.includes(grupo)
        );

        if (gruposYaGenerados.length > 0) {
          throw createError(`Ya existen vales para los grupos de entregas adicionales: ${gruposYaGenerados.join(', ')} para ${centroAcopio.nombre} en ${data.mes}/${data.anio}`, 409);
        }
      } else {
        if (tiposGenerados.includes(tipoVale)) {
          throw createError(`Ya existe un vale de entregas adicionales para ${centroAcopio.nombre} en ${data.mes}/${data.anio}`, 409);
        }
      }
    } else {
      if (tiposGenerados.includes(tipoVale)) {
        const tipoTexto = {
          'completo': 'completo',
          'solo_base': 'de entregas base'
        }[tipoVale] || tipoVale;

        throw createError(`Ya existe un vale ${tipoTexto} para ${centroAcopio.nombre} en ${data.mes}/${data.anio}`, 409);
      }
    }

    // If complete vale and other types exist, don't allow
    if (tipoVale === 'completo' && tiposGenerados.length > 0) {
      throw createError(`Ya existen vales específicos para ${centroAcopio.nombre} en ${data.mes}/${data.anio}. No se puede generar un vale completo.`, 409);
    }

    console.log(`✅ Validación pasada. Generando vale de tipo ${tipoVale} para ${centroAcopio.nombre} - ${data.mes}/${data.anio}`);
  }

  /**
   * Validate vale integrity before reversal
   */
  static async validarIntegridadVale(numeroVale: string, fechaGeneracion: Date): Promise<ServiceResult<boolean>> {
    try {
      // Check that no previous reversals exist
      const reversionesExistentes = await prisma.kardex.findMany({
        where: {
          numeroDocumento: `REVERSION-VALE-${numeroVale}`,
          documento: 'REVERSION'
        }
      });

      if (reversionesExistentes.length > 0) {
        return {
          success: false,
          error: `El vale ${numeroVale} ya tiene reversiones registradas`
        };
      }

      // Check that exit movements exist for this vale
      const movimientosSalida = await prisma.kardex.findMany({
        where: {
          numeroDocumento: numeroVale,
          tipoMovimiento: TipoMovimientoKardex.salida,
          documento: 'VALE_ENTREGA',
          createdAt: {
            gte: fechaGeneracion
          }
        }
      });

      if (movimientosSalida.length === 0) {
        return {
          success: false,
          error: `No se encontraron movimientos de salida válidos para el vale ${numeroVale}`
        };
      }

      return { success: true, data: true };
    } catch (error) {
      console.error(`Error validando integridad del vale ${numeroVale}:`, error);
      return {
        success: false,
        error: 'Error interno validando integridad del vale'
      };
    }
  }

  /**
   * Get types of vales already generated for a period
   */
  static async getTiposValesGenerados(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<string[]> {
    const valesExistentes = await prisma.valeEntrega.findMany({
      where: {
        centroAcopioId,
        mes,
        anio
      },
      select: {
        id: true,
        tipoVale: true,
        detalles: {
          select: {
            cantidadProgramada: true,
            cantidadAdicional: true
          }
        }
      }
    });

    if (valesExistentes.length === 0) {
      return [];
    }

    const tiposGenerados: string[] = [];

    for (const vale of valesExistentes) {
      if (vale.tipoVale) {
        if (!tiposGenerados.includes(vale.tipoVale)) {
          tiposGenerados.push(vale.tipoVale);
        }
      } else {
        // Fallback: analyze content for compatibility with old vales
        const tieneEntregasBase = vale.detalles.some(detalle => detalle.cantidadProgramada > 0);
        const tieneEntregasAdicionales = vale.detalles.some(detalle => detalle.cantidadAdicional > 0);

        if (tieneEntregasBase && tieneEntregasAdicionales) {
          if (!tiposGenerados.includes('completo')) {
            tiposGenerados.push('completo');
          }
        } else if (tieneEntregasBase && !tieneEntregasAdicionales) {
          if (!tiposGenerados.includes('solo_base')) {
            tiposGenerados.push('solo_base');
          }
        } else if (!tieneEntregasBase && tieneEntregasAdicionales) {
          if (!tiposGenerados.includes('solo_adicionales')) {
            tiposGenerados.push('solo_adicionales');
          }
        }
      }
    }

    return tiposGenerados;
  }

  /**
   * Get numbers of additional deliveries already generated in vales
   */
  static async getGruposEntregasAdicionalesGenerados(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<number[]> {
    const valesExistentes = await prisma.valeEntrega.findMany({
      where: {
        centroAcopioId,
        mes,
        anio
      },
      include: {
        detalles: {
          where: {
            cantidadAdicional: { gt: 0 },
            numeroEntregaAdicional: { not: null }
          },
          select: {
            numeroEntregaAdicional: true
          }
        }
      }
    });

    const numerosGenerados = new Set<number>();

    for (const vale of valesExistentes) {
      for (const detalle of vale.detalles) {
        if (detalle.numeroEntregaAdicional) {
          numerosGenerados.add(detalle.numeroEntregaAdicional);
        }
      }
    }

    return Array.from(numerosGenerados).sort((a, b) => a - b);
  }

  /**
   * Verify if generated vales exist for a specific establishment
   */
  static async verificarValesExistentesParaEstablecimiento(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{ existenVales: boolean; valesCount: number; valesEncontrados: Array<{ id: string; numero: string; fechaGeneracion: Date }> }>> {
    try {
      console.log(`🔍 [ValeValidationService] Verificando vales existentes para establecimiento ${establecimientoId}, vacuna ${vacunaId}, ${mes}/${anio}`);

      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id: establecimientoId },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          centroAcopioId: true
        }
      });

      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado'
        };
      }

      let centroAcopioId: string;
      if (establecimiento.centroAcopioId) {
        centroAcopioId = establecimiento.centroAcopioId;
      } else {
        return {
          success: false,
          error: 'No se pudo determinar el centro de acopio'
        };
      }

      const vales = await prisma.valeEntrega.findMany({
        where: {
          centroAcopioId,
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
        select: {
          id: true,
          numero: true,
          fechaGeneracion: true
        }
      });

      const existenVales = vales.length > 0;

      console.log(`📋 [ValeValidationService] ${existenVales ? 'Encontrados' : 'No se encontraron'} ${vales.length} vales para el establecimiento ${establecimiento.nombre}`);

      return {
        success: true,
        data: {
          existenVales,
          valesCount: vales.length,
          valesEncontrados: vales.map(v => ({
            id: v.id,
            numero: v.numero,
            fechaGeneracion: v.fechaGeneracion
          }))
        }
      };
    } catch (error) {
      console.error('Error verificando vales existentes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error verificando vales existentes'
      };
    }
  }
}
