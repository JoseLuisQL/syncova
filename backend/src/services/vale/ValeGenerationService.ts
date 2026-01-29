import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { createError } from '@/utils/errors';
import { EstadoVale, TipoMovimientoKardex } from '@prisma/client';
import { ValeValidationService } from './ValeValidationService';
import { ValeQueryService, ValeEntregaConRelaciones, MovimientoParaVale } from './ValeQueryService';
import { ValeStockService, StockAfectacion } from './ValeStockService';
import { StockValidationService, VaccineRequirement } from '../StockValidationService';
import { StockInicialService } from '../StockInicialService';
import { AlmacenCentralService } from '../AlmacenCentralService';
import { ConfiguracionJeringaVacunaService } from '../ConfiguracionJeringaVacunaService';

/**
 * Interfaces for Vale generation
 */
export interface GenerarValeDto {
  centroAcopioId: string;
  mes: number;
  anio: number;
  usuarioId: string;
  observaciones?: string;
  afectarStock?: boolean;
  tipoVale?: 'completo' | 'solo_base' | 'solo_adicionales';
  entregasAdicionalesSeleccionadas?: string[];
  gruposEntregasSeleccionados?: number[];
}

export interface ResumenGeneracion {
  valeId: string;
  numero: string;
  totalVacunas: number;
  totalEstablecimientos: number;
  stocksAfectados: {
    vacunas: StockAfectacion[];
    jeringas: StockAfectacion[];
  };
  errores: string[];
}

export interface ModificacionVale {
  tipo: 'cantidad_programada_modificada' | 'entrega_adicional_modificada' | 'entrega_adicional_agregada' | 'establecimiento_agregado' | 'detalle_eliminado';
  establecimientoId: string;
  establecimientoNombre: string;
  vacunaId: string;
  vacunaNombre: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  diferencia: number;
  numeroEntregaAdicional?: number;
  fechaModificacion: Date;
}

/**
 * Service for Vale generation and lifecycle operations
 * Handles vale creation, reversal, state changes, and synchronization
 */
export class ValeGenerationService {
  
  /**
   * Generate automatic vale number
   */
  private static async generarNumeroVale(centroAcopioId: string, _mes: number, anio: number): Promise<string> {
    const centroAcopio = await prisma.centroAcopio.findUnique({
      where: { id: centroAcopioId },
      select: { codigo: true }
    });

    if (!centroAcopio) {
      throw createError('Centro de acopio no encontrado', 404);
    }

    const valesExistentes = await prisma.valeEntrega.findMany({
      where: {
        centroAcopioId,
        anio
      },
      select: { numero: true }
    });

    const numerosKardex = await prisma.kardex.findMany({
      where: {
        numeroDocumento: {
          startsWith: `${centroAcopio.codigo}-${anio}-`
        },
        documento: 'VALE_ENTREGA'
      },
      select: { numeroDocumento: true },
      distinct: ['numeroDocumento']
    });

    let maxNumero = 0;
    const prefijo = `${centroAcopio.codigo}-${anio}-`;

    for (const vale of valesExistentes) {
      if (vale.numero.startsWith(prefijo)) {
        const numeroStr = vale.numero.substring(prefijo.length);
        const numero = parseInt(numeroStr, 10);
        if (!isNaN(numero) && numero > maxNumero) {
          maxNumero = numero;
        }
      }
    }

    for (const kardex of numerosKardex) {
      if (kardex.numeroDocumento.startsWith(prefijo)) {
        const numeroStr = kardex.numeroDocumento.substring(prefijo.length);
        const numero = parseInt(numeroStr, 10);
        if (!isNaN(numero) && numero > maxNumero) {
          maxNumero = numero;
        }
      }
    }

    const siguienteNumero = maxNumero + 1;
    const numeroVale = `${prefijo}${siguienteNumero.toString().padStart(3, '0')}`;

    const valeExistente = await prisma.valeEntrega.findFirst({
      where: { numero: numeroVale }
    });

    if (valeExistente) {
      throw createError(`El número de vale ${numeroVale} ya existe en vales activos`, 409);
    }

    const kardexExistente = await prisma.kardex.findFirst({
      where: {
        numeroDocumento: numeroVale,
        documento: 'VALE_ENTREGA'
      }
    });

    if (kardexExistente) {
      throw createError(`El número de vale ${numeroVale} ya fue usado anteriormente`, 409);
    }

    return numeroVale;
  }

  /**
   * Calculate total vaccine quantity (scheduled + additional)
   */
  private static calcularCantidadTotal(movimiento: MovimientoParaVale): { programada: number; adicional: number; total: number } {
    const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
    
    let cantidadProgramada = 0;
    let cantidadAdicional = 0;

    if (tieneEntregasAdicionales) {
      cantidadProgramada = movimiento.entregaBase ?? movimiento.entrega;
      cantidadAdicional = movimiento.entregasAdicionales.reduce(
        (sum: number, entrega) => sum + entrega.cantidad,
        0
      );
    } else {
      cantidadProgramada = movimiento.entrega;
      cantidadAdicional = 0;
    }

    return {
      programada: cantidadProgramada,
      adicional: cantidadAdicional,
      total: cantidadProgramada + cantidadAdicional
    };
  }

  /**
   * Generate preview without creating real vale
   */
  private static async generarVistaPrevia(centroAcopioId: string, mes: number, anio: number): Promise<ServiceResult<any>> {
    try {
      const movimientos = await ValeQueryService.obtenerMovimientosParaVale(centroAcopioId, mes, anio);

      if (movimientos.length === 0) {
        throw createError('No hay movimientos con entregas para generar el vale', 400);
      }

      const centroAcopio = await prisma.centroAcopio.findUnique({
        where: { id: centroAcopioId },
        select: { id: true, nombre: true, codigo: true }
      });

      if (!centroAcopio) {
        throw createError('Centro de acopio no encontrado', 404);
      }

      const detalles: any[] = [];
      const vacunasPorEstablecimiento: any = {};
      let totalVacunas = 0;
      const establecimientosUnicos = new Set<string>();

      for (const movimiento of movimientos) {
        const cantidades = this.calcularCantidadTotal(movimiento);

        detalles.push({
          id: `preview-${movimiento.id}`,
          valeEntregaId: 'preview-vale',
          establecimientoId: movimiento.establecimientoId,
          vacunaId: movimiento.vacunaId,
          cantidadProgramada: cantidades.programada,
          cantidadAdicional: cantidades.adicional,
          cantidadTotal: cantidades.total,
          numeroEntregaAdicional: null,
          createdAt: new Date(),
          establecimiento: movimiento.establecimiento,
          vacuna: movimiento.vacuna
        });

        if (!vacunasPorEstablecimiento[movimiento.establecimientoId]) {
          vacunasPorEstablecimiento[movimiento.establecimientoId] = {
            establecimiento: movimiento.establecimiento,
            vacunas: {}
          };
        }

        if (!vacunasPorEstablecimiento[movimiento.establecimientoId].vacunas[movimiento.vacunaId]) {
          vacunasPorEstablecimiento[movimiento.establecimientoId].vacunas[movimiento.vacunaId] = {
            vacuna: movimiento.vacuna,
            cantidadTotal: 0,
            jeringasNecesarias: 0
          };
        }

        vacunasPorEstablecimiento[movimiento.establecimientoId].vacunas[movimiento.vacunaId].cantidadTotal += cantidades.total;
        vacunasPorEstablecimiento[movimiento.establecimientoId].vacunas[movimiento.vacunaId].jeringasNecesarias += cantidades.total * movimiento.vacuna.dosisPorFrasco;

        totalVacunas += cantidades.total;
        establecimientosUnicos.add(movimiento.establecimientoId);
      }

      const vistaPrevia = {
        centroAcopio,
        mes,
        anio,
        detalles,
        consolidado: {
          totalVacunas,
          totalEstablecimientos: establecimientosUnicos.size,
          vacunasPorEstablecimiento
        }
      };

      return {
        success: true,
        data: vistaPrevia
      };

    } catch (error) {
      console.error('Error generando vista previa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar vista previa'
      };
    }
  }

  /**
   * Generate vale de entrega completo
   */
  static async generarVale(data: GenerarValeDto): Promise<ServiceResult<ResumenGeneracion>> {
    try {
      // Business validations
      await ValeValidationService.validateGenerarValeData(data);

      // If preview only, return preview
      if (data.afectarStock === false) {
        return await this.generarVistaPrevia(data.centroAcopioId, data.mes, data.anio);
      }

      // REAL GENERATION: Create vale and affect stocks
      const result = await prisma.$transaction(async (tx) => {
        // STEP 1: Generate vale number
        const numeroVale = await ValeGenerationService.generarNumeroVale(data.centroAcopioId, data.mes, data.anio);

        // STEP 2: Get movements for vale according to specified type
        const tipoVale = data.tipoVale || 'completo';
        const movimientos = await ValeQueryService.obtenerMovimientosParaVale(
          data.centroAcopioId,
          data.mes,
          data.anio,
          tipoVale,
          data.entregasAdicionalesSeleccionadas,
          data.gruposEntregasSeleccionados
        );

        if (movimientos.length === 0) {
          throw createError('No hay movimientos con entregas para generar el vale', 400);
        }

        // STEP 2.5: Validate available stock before proceeding
        console.log(`🔍 [ValeGenerationService] Validando stock disponible para ${movimientos.length} movimientos (tipo: ${tipoVale})...`);

        // Calculate requirements ACCORDING TO VALE TYPE
        const vaccineRequirements: VaccineRequirement[] = movimientos.map(mov => {
          let quantity = 0;
          
          switch (tipoVale) {
            case 'solo_base':
              quantity = mov.entrega || 0;
              break;
            case 'solo_adicionales':
              quantity = mov.entregasAdicionales?.reduce((sum: number, ea: any) => sum + ea.cantidad, 0) || 0;
              break;
            case 'completo':
            default:
              quantity = (mov.entrega || 0) + (mov.entregasAdicionales?.reduce((sum: number, ea: any) => sum + ea.cantidad, 0) || 0);
              break;
          }
          
          return {
            vaccineId: mov.vacunaId,
            quantity
          };
        }).filter(req => req.quantity > 0);

        const stockValidation = await StockValidationService.validateStockForVoucher(
          vaccineRequirements,
          data.centroAcopioId
        );

        if (!stockValidation.success) {
          const errorMessage = `Stock insuficiente para generar el vale:\n${stockValidation.errors.join('\n')}`;
          console.error(`❌ [ValeGenerationService] ${errorMessage}`);
          throw createError(errorMessage, 400);
        }

        if (stockValidation.warnings.length > 0) {
          console.warn(`⚠️ [ValeGenerationService] Advertencias de stock:`, stockValidation.warnings);
        }

        console.log(`✅ [ValeGenerationService] Validación de stock exitosa`);

        // STEP 2.6: CAPTURE INITIAL STOCK OF ALL VACCINES
        console.log(`📊 [ValeGenerationService] Capturando stock inicial de todas las vacunas activas...`);
        
        const todasLasVacunas = await tx.vacuna.findMany({
          where: { estado: 'activo' },
          select: { id: true, nombre: true }
        });
        
        console.log(`🔍 [ValeGenerationService] Encontradas ${todasLasVacunas.length} vacunas activas para evaluar stock inicial`);
        
        const resultadosStockInicial = await StockInicialService.capturarStockInicialBatch(
          todasLasVacunas.map(vacuna => ({ vacunaId: vacuna.id })),
          data.mes,
          data.anio,
          `Stock inicial capturado automáticamente para todas las vacunas antes de generar vale ${numeroVale}`
        );
        
        if (resultadosStockInicial.success) {
          const capturas = resultadosStockInicial.data?.filter(r => r.resultado.success && r.resultado.data) || [];
          const errores = resultadosStockInicial.data?.filter(r => !r.resultado.success) || [];
          
          if (capturas.length > 0) {
            console.log(`✅ [ValeGenerationService] Stock inicial capturado para ${capturas.length} de ${todasLasVacunas.length} vacunas`);
          }
          
          if (errores.length > 0) {
            console.warn(`⚠️ [ValeGenerationService] ${errores.length} vacunas con errores en captura de stock inicial`);
          }
        } else {
          console.warn(`⚠️ [ValeGenerationService] Error en captura batch de stock inicial: ${resultadosStockInicial.error}`);
        }

        // STEP 3: Get valid user
        let usuarioIdFinal = data.usuarioId;
        if (data.usuarioId === 'temp-user-id') {
          const primerUsuario = await tx.usuario.findFirst({
            where: { estado: 'activo' },
            select: { id: true }
          });
          if (primerUsuario) {
            usuarioIdFinal = primerUsuario.id;
          } else {
            throw createError('No hay usuarios activos disponibles', 400);
          }
        }

        // STEP 4: Create vale
        let gruposEntregasAdicionales: string | null = null;
        if (tipoVale === 'solo_adicionales' && data.gruposEntregasSeleccionados && data.gruposEntregasSeleccionados.length > 0) {
          const gruposOrdenados = [...data.gruposEntregasSeleccionados].sort((a, b) => a - b);
          gruposEntregasAdicionales = gruposOrdenados.join(',');
        }

        const vale = await tx.valeEntrega.create({
          data: {
            numero: numeroVale,
            centroAcopioId: data.centroAcopioId,
            mes: data.mes,
            anio: data.anio,
            estado: EstadoVale.generado,
            tipoVale: (data.tipoVale || 'completo') as any,
            gruposEntregasAdicionales,
            usuarioId: usuarioIdFinal,
            observaciones: data.observaciones || null
          }
        });

        // STEP 5: Process details and affect stocks consolidated
        const stocksAfectadosVacunas: StockAfectacion[] = [];
        const stocksAfectadosJeringas: StockAfectacion[] = [];
        const errores: string[] = [];
        let totalVacunas = 0;
        const establecimientosUnicos = new Set<string>();

        // STEP 5.1: Create vale details
        for (const movimiento of movimientos) {
          try {
            const cantidades = ValeGenerationService.calcularCantidadTotal(movimiento);
            let cantidadTotalParaVale = 0;

            if (tipoVale === 'solo_base' || tipoVale === 'completo') {
              if (cantidades.programada > 0) {
                await tx.valeDetalle.create({
                  data: {
                    valeEntregaId: vale.id,
                    establecimientoId: movimiento.establecimientoId,
                    vacunaId: movimiento.vacunaId,
                    cantidadProgramada: cantidades.programada,
                    cantidadAdicional: 0
                  }
                });
                cantidadTotalParaVale += cantidades.programada;
              }
            }

            if (tipoVale === 'solo_adicionales' || tipoVale === 'completo') {
              if (movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0) {
                for (const entregaAdicional of movimiento.entregasAdicionales) {
                  await tx.valeDetalle.create({
                    data: {
                      valeEntregaId: vale.id,
                      establecimientoId: movimiento.establecimientoId,
                      vacunaId: movimiento.vacunaId,
                      cantidadProgramada: 0,
                      cantidadAdicional: entregaAdicional.cantidad,
                      numeroEntregaAdicional: entregaAdicional.numeroEntrega
                    }
                  });
                  cantidadTotalParaVale += entregaAdicional.cantidad;
                }
              }
            }

            if (cantidadTotalParaVale > 0) {
              totalVacunas += cantidadTotalParaVale;
              establecimientosUnicos.add(movimiento.establecimientoId);
            }
          } catch (error) {
            errores.push(`Error procesando detalles para ${movimiento.establecimiento?.nombre || 'establecimiento'} - ${movimiento.vacuna?.nombre || 'vacuna'}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }

        // STEP 5.2: Consolidate by vaccine and affect stocks
        if (data.afectarStock !== false) {
          console.log(`🔄 [ValeGenerationService] Iniciando procesamiento consolidado de stocks para ${movimientos.length} movimientos...`);

          const consolidadoPorVacuna = new Map<string, {
            vacunaId: string;
            cantidadTotal: number;
            establecimientos: Array<{
              establecimientoId: string;
              cantidad: number;
              nombre: string;
            }>;
          }>();

          for (const movimiento of movimientos) {
            const cantidades = ValeGenerationService.calcularCantidadTotal(movimiento);
            let cantidadTotalParaVale = 0;

            if (tipoVale === 'solo_base' || tipoVale === 'completo') {
              cantidadTotalParaVale += cantidades.programada;
            }
            if (tipoVale === 'solo_adicionales' || tipoVale === 'completo') {
              cantidadTotalParaVale += cantidades.adicional;
            }

            if (cantidadTotalParaVale > 0) {
              if (!consolidadoPorVacuna.has(movimiento.vacunaId)) {
                consolidadoPorVacuna.set(movimiento.vacunaId, {
                  vacunaId: movimiento.vacunaId,
                  cantidadTotal: 0,
                  establecimientos: []
                });
              }

              const consolidado = consolidadoPorVacuna.get(movimiento.vacunaId)!;
              consolidado.cantidadTotal += cantidadTotalParaVale;
              consolidado.establecimientos.push({
                establecimientoId: movimiento.establecimientoId,
                cantidad: cantidadTotalParaVale,
                nombre: movimiento.establecimiento?.nombre || `Establecimiento ${movimiento.establecimientoId}`
              });
            }
          }

          for (const [vacunaId, consolidado] of consolidadoPorVacuna) {
            try {
              console.log(`🔄 [ValeGenerationService] Procesando vacuna ${vacunaId}: ${consolidado.cantidadTotal} unidades en ${consolidado.establecimientos.length} establecimientos`);

              const stockVacunas = await ValeStockService.afectarStockVacunasConsolidado(
                tx,
                vacunaId,
                consolidado.establecimientos,
                numeroVale,
                usuarioIdFinal
              );
              stocksAfectadosVacunas.push(...stockVacunas);

              const stockJeringas = await ValeStockService.afectarStockJeringasConsolidado(
                tx,
                vacunaId,
                consolidado.establecimientos,
                numeroVale,
                usuarioIdFinal,
                data.centroAcopioId
              );
              stocksAfectadosJeringas.push(...stockJeringas);

              console.log(`✅ [ValeGenerationService] Vacuna ${vacunaId} procesada exitosamente: ${consolidado.cantidadTotal} unidades deducidas`);
            } catch (stockError) {
              const errorMsg = `Error afectando stock consolidado para vacuna ${vacunaId}: ${stockError instanceof Error ? stockError.message : 'Error desconocido'}`;
              console.error(`❌ [ValeGenerationService] ${errorMsg}`);
              errores.push(errorMsg);
            }
          }

          console.log(`✅ [ValeGenerationService] Procesamiento consolidado completado: ${consolidadoPorVacuna.size} tipos de vacuna procesados`);
        }

        // STEP 6: Update vale totals
        await tx.valeEntrega.update({
          where: { id: vale.id },
          data: {
            totalVacunas,
            totalEstablecimientos: establecimientosUnicos.size
          }
        });

        return {
          valeId: vale.id,
          numero: numeroVale,
          totalVacunas,
          totalEstablecimientos: establecimientosUnicos.size,
          stocksAfectados: {
            vacunas: stocksAfectadosVacunas,
            jeringas: stocksAfectadosJeringas
          },
          errores
        };
      }, {
        maxWait: 30000,
        timeout: 120000,
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error al generar vale:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar vale'
      };
    }
  }

  /**
   * Revert vale and restore affected stocks
   * FIX: Usa los DETALLES DEL VALE como fuente de verdad y límite máximo
   * para las cantidades a restaurar, no el Kardex
   */
  static async revertirVale(id: string): Promise<ServiceResult<{ message: string }>> {
    try {
      console.log(`🔄 [ValeGenerationService] Iniciando reversión de vale: ${id}`);

      const valeExistente = await prisma.valeEntrega.findUnique({
        where: { id },
        include: {
          centroAcopio: {
            select: { nombre: true, id: true }
          },
          detalles: {
            include: {
              establecimiento: { select: { id: true, nombre: true } },
              vacuna: { select: { id: true, nombre: true } }
            }
          }
        }
      });

      if (!valeExistente) {
        console.log(`❌ [ValeGenerationService] Vale no encontrado: ${id}`);
        return {
          success: false,
          error: 'Vale no encontrado'
        };
      }

      console.log(`📋 [ValeGenerationService] Vale encontrado: ${valeExistente.numero} (Estado: ${valeExistente.estado})`);
      console.log(`📋 [ValeGenerationService] Fecha generación: ${valeExistente.fechaGeneracion.toISOString()}`);
      console.log(`📋 [ValeGenerationService] Detalles del vale: ${valeExistente.detalles.length} registros`);

      if (valeExistente.estado !== EstadoVale.generado) {
        console.log(`❌ [ValeGenerationService] Estado inválido para reversión: ${valeExistente.estado}`);
        return {
          success: false,
          error: `No se puede revertir un vale en estado '${valeExistente.estado}'. Solo se pueden revertir vales en estado 'generado'.`
        };
      }

      const validacionIntegridad = await ValeValidationService.validarIntegridadVale(valeExistente.numero, valeExistente.fechaGeneracion);
      if (!validacionIntegridad.success) {
        console.log(`❌ [ValeGenerationService] Fallo en validación de integridad: ${validacionIntegridad.error}`);
        return {
          success: false,
          error: `Error de integridad: ${validacionIntegridad.error}`
        };
      }

      // PASO 1: Calcular cantidades EXACTAS desde los detalles del vale (FUENTE DE VERDAD ABSOLUTA)
      const cantidadesEsperadasPorVacuna = new Map<string, {
        vacunaId: string;
        vacunaNombre: string;
        cantidadTotal: number;
      }>();

      let totalVacunasEsperadas = 0;
      for (const detalle of valeExistente.detalles) {
        const cantidadDetalle = (detalle.cantidadProgramada || 0) + (detalle.cantidadAdicional || 0);
        
        if (cantidadDetalle > 0) {
          totalVacunasEsperadas += cantidadDetalle;
          
          if (!cantidadesEsperadasPorVacuna.has(detalle.vacunaId)) {
            cantidadesEsperadasPorVacuna.set(detalle.vacunaId, {
              vacunaId: detalle.vacunaId,
              vacunaNombre: detalle.vacuna?.nombre || 'Vacuna desconocida',
              cantidadTotal: 0
            });
          }
          
          const consolidado = cantidadesEsperadasPorVacuna.get(detalle.vacunaId)!;
          consolidado.cantidadTotal += cantidadDetalle;
        }
      }

      console.log(`📊 [ValeGenerationService] Cantidades a RESTAURAR desde detalles del vale (total: ${totalVacunasEsperadas}):`);
      for (const [_vacunaId, data] of cantidadesEsperadasPorVacuna) {
        console.log(`   - ${data.vacunaNombre}: ${data.cantidadTotal} unidades`);
      }

      if (totalVacunasEsperadas === 0) {
        console.log(`⚠️ [ValeGenerationService] El vale no tiene cantidades para restaurar`);
        // Aún así eliminar el vale
      }

      await prisma.$transaction(async (tx) => {
        // Verificar que no existan reversiones previas para ESTE vale específico
        // Usamos el ID del vale en las observaciones para mayor precisión
        const reversionesExistentes = await tx.kardex.findMany({
          where: {
            numeroDocumento: `REVERSION-VALE-${valeExistente.numero}`,
            documento: 'REVERSION',
            fechaMovimiento: {
              gte: valeExistente.fechaGeneracion
            }
          }
        });

        if (reversionesExistentes.length > 0) {
          console.log(`⚠️ [ValeGenerationService] El vale ${valeExistente.numero} ya tiene reversiones registradas`);
          throw new Error(`El vale ${valeExistente.numero} ya ha sido revertido previamente. No se puede revertir nuevamente.`);
        }

        const almacenCentralResult = await AlmacenCentralService.obtenerIdAlmacenCentral();
        const almacenCentralId = almacenCentralResult.success && almacenCentralResult.data ? almacenCentralResult.data : null;

        // PASO 2: Para cada vacuna en los detalles del vale, restaurar la cantidad EXACTA
        const stockTotalVacunas: { [vacunaId: string]: number } = {};
        let totalRestaurado = 0;

        for (const [vacunaId, datosVacuna] of cantidadesEsperadasPorVacuna) {
          const cantidadARestaurar = datosVacuna.cantidadTotal;
          
          if (cantidadARestaurar <= 0) continue;

          console.log(`🔄 [ValeGenerationService] Procesando vacuna ${datosVacuna.vacunaNombre}: restaurar ${cantidadARestaurar} unidades`);

          // Obtener stock total actual
          if (!(vacunaId in stockTotalVacunas)) {
            stockTotalVacunas[vacunaId] = await ValeStockService.obtenerStockTotalVacuna(tx, vacunaId);
            console.log(`📊 [ValeGenerationService] Stock total actual de ${datosVacuna.vacunaNombre}: ${stockTotalVacunas[vacunaId]} unidades`);
          }

          // Buscar lotes disponibles para esta vacuna (ordenados por fecha de vencimiento DESC para restaurar a los más nuevos primero)
          const lotesDisponibles = await tx.loteVacuna.findMany({
            where: {
              vacunaId: vacunaId
            },
            orderBy: [
              { fechaVencimiento: 'desc' },
              { fechaIngreso: 'desc' }
            ]
          });

          if (lotesDisponibles.length === 0) {
            console.warn(`⚠️ [ValeGenerationService] No se encontraron lotes para vacuna ${datosVacuna.vacunaNombre}`);
            continue;
          }

          // Restaurar al primer lote disponible (el más reciente)
          const loteDestino = lotesDisponibles[0];
          const nuevaCantidadLote = loteDestino.cantidadActual + cantidadARestaurar;
          const saldoAnteriorMovimiento = stockTotalVacunas[vacunaId];
          const saldoNuevoMovimiento = stockTotalVacunas[vacunaId] + cantidadARestaurar;

          console.log(`🔄 [ValeGenerationService] Restaurando a lote ${loteDestino.numero}: +${cantidadARestaurar} unidades (${loteDestino.cantidadActual} → ${nuevaCantidadLote})`);

          // Actualizar el lote
          await tx.loteVacuna.update({
            where: { id: loteDestino.id },
            data: {
              cantidadActual: nuevaCantidadLote,
              estado: nuevaCantidadLote > 0 ? 'disponible' : 'agotado'
            }
          });

          // Crear movimiento de reversión en Kardex
          await tx.kardex.create({
            data: {
              tipo: 'vacuna',
              itemId: vacunaId,
              loteId: loteDestino.id,
              tipoMovimiento: TipoMovimientoKardex.ingreso,
              cantidad: cantidadARestaurar,
              saldoAnterior: saldoAnteriorMovimiento,
              saldoActual: saldoNuevoMovimiento,
              establecimientoOrigenId: null,
              establecimientoDestinoId: almacenCentralId,
              documento: 'REVERSION',
              numeroDocumento: `REVERSION-VALE-${valeExistente.numero}`,
              observaciones: `Reversión de vale ${valeExistente.numero} (ID: ${valeExistente.id}) - ${valeExistente.centroAcopio.nombre} - ${datosVacuna.vacunaNombre}`,
              usuarioId: valeExistente.usuarioId,
              fechaMovimiento: new Date()
            }
          });

          stockTotalVacunas[vacunaId] = saldoNuevoMovimiento;
          totalRestaurado += cantidadARestaurar;
        }

        console.log(`✅ [ValeGenerationService] Restauradas ${totalRestaurado} unidades de vacunas`);

        // PASO 3: Procesar reversión de jeringas basándose en los detalles del vale
        // Calcular jeringas necesarias por vacuna
        let totalJeringasRestauradas = 0;
        const stockTotalJeringas: { [jeringaId: string]: number } = {};

        for (const [vacunaId, datosVacuna] of cantidadesEsperadasPorVacuna) {
          const cantidadVacunas = datosVacuna.cantidadTotal;
          if (cantidadVacunas <= 0) continue;

          // Obtener configuración de jeringas para esta vacuna
          const vacuna = await tx.vacuna.findUnique({
            where: { id: vacunaId },
            select: { dosisPorFrasco: true }
          });

          if (!vacuna) continue;

          // Buscar configuración de jeringas (simplificado - restaurar según dosis por frasco)
          const configResult = await ConfiguracionJeringaVacunaService.getConfiguracionEfectiva(vacunaId, valeExistente.centroAcopioId, false);
          
          if (!configResult.success || !configResult.data || configResult.data.length === 0) {
            console.log(`ℹ️ [ValeGenerationService] No hay configuración de jeringas para ${datosVacuna.vacunaNombre}`);
            continue;
          }

          for (const jeringaConfig of configResult.data) {
            const cantidadJeringas = cantidadVacunas * (jeringaConfig.multiplicador || 1);

            if (cantidadJeringas <= 0) continue;

            // Obtener stock total de jeringa
            if (!(jeringaConfig.jeringaId in stockTotalJeringas)) {
              stockTotalJeringas[jeringaConfig.jeringaId] = await ValeStockService.obtenerStockTotalJeringa(tx, jeringaConfig.jeringaId);
            }

            // Buscar lote de jeringa para restaurar
            const lotesJeringa = await tx.loteJeringa.findMany({
              where: { jeringaId: jeringaConfig.jeringaId },
              orderBy: [{ fechaVencimiento: 'desc' }, { fechaIngreso: 'desc' }]
            });

            if (lotesJeringa.length === 0) {
              console.warn(`⚠️ [ValeGenerationService] No se encontraron lotes de jeringa ${jeringaConfig.jeringaId}`);
              continue;
            }

            const loteJeringa = lotesJeringa[0];
            const nuevaCantidadLote = loteJeringa.cantidadActual + cantidadJeringas;
            const saldoAnterior = stockTotalJeringas[jeringaConfig.jeringaId];
            const saldoNuevo = saldoAnterior + cantidadJeringas;

            console.log(`🔄 [ValeGenerationService] Restaurando jeringa: +${cantidadJeringas} unidades al lote ${loteJeringa.numero}`);

            await tx.loteJeringa.update({
              where: { id: loteJeringa.id },
              data: {
                cantidadActual: nuevaCantidadLote,
                estado: nuevaCantidadLote > 0 ? 'disponible' : 'agotado'
              }
            });

            await tx.kardex.create({
              data: {
                tipo: 'jeringa',
                itemId: jeringaConfig.jeringaId,
                loteId: loteJeringa.id,
                tipoMovimiento: TipoMovimientoKardex.ingreso,
                cantidad: cantidadJeringas,
                saldoAnterior: saldoAnterior,
                saldoActual: saldoNuevo,
                establecimientoOrigenId: null,
                establecimientoDestinoId: almacenCentralId,
                documento: 'REVERSION',
                numeroDocumento: `REVERSION-VALE-${valeExistente.numero}`,
                observaciones: `Reversión de vale ${valeExistente.numero} (ID: ${valeExistente.id}) - Jeringas para ${datosVacuna.vacunaNombre}`,
                usuarioId: valeExistente.usuarioId,
                fechaMovimiento: new Date()
              }
            });

            stockTotalJeringas[jeringaConfig.jeringaId] = saldoNuevo;
            totalJeringasRestauradas += cantidadJeringas;
          }
        }

        console.log(`✅ [ValeGenerationService] Restauradas ${totalJeringasRestauradas} unidades de jeringas`);

        // PASO 4: Eliminar detalles del vale y el vale
        await tx.valeDetalle.deleteMany({
          where: { valeEntregaId: id }
        });

        await tx.valeEntrega.delete({
          where: { id }
        });

        console.log(`✅ [ValeGenerationService] Vale ${valeExistente.numero} eliminado correctamente`);
        console.log(`📊 [ValeGenerationService] Resumen: ${totalRestaurado} vacunas, ${totalJeringasRestauradas} jeringas restauradas`);
      }, {
        maxWait: 20000,
        timeout: 60000,
      });

      console.log(`✅ [ValeGenerationService] Reversión completada exitosamente: ${valeExistente.numero}`);
      return {
        success: true,
        data: {
          message: `Vale ${valeExistente.numero} revertido exitosamente. Stocks restaurados.`
        }
      };
    } catch (error) {
      console.error('❌ [ValeGenerationService] Error crítico al revertir vale:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al revertir vale'
      };
    }
  }

  /**
   * Change vale state
   */
  static async cambiarEstado(id: string, nuevoEstado: EstadoVale, _usuarioId: string): Promise<ServiceResult<ValeEntregaConRelaciones>> {
    try {
      const valeExistente = await prisma.valeEntrega.findUnique({
        where: { id },
        select: { estado: true }
      });

      if (!valeExistente) {
        return {
          success: false,
          error: 'Vale no encontrado'
        };
      }

      const transicionesValidas: Record<EstadoVale, EstadoVale[]> = {
        [EstadoVale.generado]: [EstadoVale.impreso],
        [EstadoVale.impreso]: [EstadoVale.entregado],
        [EstadoVale.entregado]: []
      };

      if (!transicionesValidas[valeExistente.estado].includes(nuevoEstado)) {
        return {
          success: false,
          error: `No se puede cambiar de estado ${valeExistente.estado} a ${nuevoEstado}`
        };
      }

      const valeActualizado = await prisma.valeEntrega.update({
        where: { id },
        data: {
          estado: nuevoEstado,
          updatedAt: new Date()
        },
        include: {
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          detalles: {
            include: {
              establecimiento: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true
                }
              },
              vacuna: {
                select: {
                  id: true,
                  nombre: true,
                  presentacion: true,
                  dosisPorFrasco: true
                }
              }
            },
            orderBy: [
              { establecimiento: { nombre: 'asc' } },
              { vacuna: { nombre: 'asc' } },
              { numeroEntregaAdicional: 'asc' }
            ]
          }
        }
      });

      return {
        success: true,
        data: valeActualizado as ValeEntregaConRelaciones
      };
    } catch (error) {
      console.error('Error al cambiar estado del vale:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar estado del vale'
      };
    }
  }

  /**
   * Clean inconsistent reversal state
   */
  static async limpiarEstadoReversion(id: string): Promise<ServiceResult<{ message: string }>> {
    try {
      console.log(`🧹 [ValeGenerationService] Limpiando estado de reversión para vale: ${id}`);

      const valeExistente = await prisma.valeEntrega.findUnique({
        where: { id },
        select: { numero: true, estado: true }
      });

      if (!valeExistente) {
        return { success: false, error: 'Vale no encontrado' };
      }

      const result = await prisma.kardex.deleteMany({
        where: {
          numeroDocumento: `REVERSION-VALE-${valeExistente.numero}`,
          documento: 'REVERSION'
        }
      });

      console.log(`✅ [ValeGenerationService] Eliminadas ${result.count} entradas de reversión huérfanas`);

      return {
        success: true,
        data: {
          message: `Estado de reversión limpiado. Eliminadas ${result.count} entradas huérfanas.`
        }
      };
    } catch (error) {
      console.error('❌ [ValeGenerationService] Error al limpiar estado de reversión:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al limpiar estado'
      };
    }
  }
}
