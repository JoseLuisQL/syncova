import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { MovimientosCalculationService } from './MovimientosCalculationService';

/**
 * Interfaces for Ajuste de Entregas
 */
export interface EstablecimientoParaAjuste {
  id: string;
  movimientoId: string;
  establecimientoId: string;
  establecimientoNombre: string;
  establecimientoCodigo: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  centroAcopioCodigo: string;
  entregaActual: number;
  saldoAnterior: number;
  tieneValeGenerado: boolean;
  valeNumero: string | null;
}

export interface CentroAcopioAgrupado {
  centroAcopioId: string;
  centroAcopioNombre: string;
  centroAcopioCodigo: string;
  tieneValeGenerado: boolean;
  valeNumero: string | null;
  establecimientos: EstablecimientoParaAjuste[];
  totalEntregas: number;
}

export interface OpcionAjuste {
  id: string;
  nombre: string;
  descripcion: string;
  esRecomendada: boolean;
  resultadoDeficit: number;
  ajustes: AjusteIndividual[];
  totalAntes: number;
  totalDespues: number;
  reduccionTotal: number;
}

export interface AjusteIndividual {
  movimientoId: string;
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  entregaAntes: number;
  entregaDespues: number;
  diferencia: number;
  bloqueado: boolean;
}

export interface DatosAjusteEntregas {
  vacunaId: string;
  vacunaNombre: string;
  mes: number;
  anio: number;
  stockInicial: number;
  totalEntregas: number;
  deficit: number;
  centrosAcopio: CentroAcopioAgrupado[];
  establecimientosAjustables: number;
  establecimientosBloqueados: number;
  puedeAjustar: boolean;
  motivoNoPuedeAjustar: string | null;
}

export interface EjecutarAjusteDto {
  vacunaId: string;
  mes: number;
  anio: number;
  ajustes: Array<{
    movimientoId: string;
    entregaNueva: number;
  }>;
  usuarioId: string;
}

/**
 * Service for automatic delivery adjustments when deficit is detected
 */
export class AjusteEntregasService {
  
  /**
   * Get data for the adjustment modal
   */
  static async obtenerDatosParaAjuste(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<DatosAjusteEntregas>> {
    try {
      console.log(`🔍 [AjusteEntregasService] Obteniendo datos para ajuste - Vacuna: ${vacunaId}, Periodo: ${mes}/${anio}`);

      // Get vaccine info
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { id: true, nombre: true }
      });

      if (!vacuna) {
        return { success: false, error: 'Vacuna no encontrada' };
      }

      // Get stock info
      const stockResult = await MovimientosCalculationService.getStockDisponible(vacunaId, mes, anio);
      if (!stockResult.success || !stockResult.data) {
        return { success: false, error: 'No se pudo obtener información de stock' };
      }

      const { stockInicialHistorico, totalEntregas, stockDisponible } = stockResult.data;

      // If no deficit, return early
      if (stockDisponible >= 0) {
        return {
          success: true,
          data: {
            vacunaId: vacuna.id,
            vacunaNombre: vacuna.nombre,
            mes,
            anio,
            stockInicial: stockInicialHistorico || 0,
            totalEntregas,
            deficit: 0,
            centrosAcopio: [],
            establecimientosAjustables: 0,
            establecimientosBloqueados: 0,
            puedeAjustar: false,
            motivoNoPuedeAjustar: 'No hay déficit detectado'
          }
        };
      }

      // Get vales generated for this period (by centro de acopio)
      const valesGenerados = await prisma.valeEntrega.findMany({
        where: { mes, anio },
        select: { 
          centroAcopioId: true, 
          numero: true 
        }
      });

      const centrosConVale = new Map<string, string>();
      valesGenerados.forEach(vale => {
        centrosConVale.set(vale.centroAcopioId, vale.numero);
      });

      // Get all movements with deliveries > 0 for this vaccine/period
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: {
          vacunaId,
          mes,
          anio,
          entrega: { gt: 0 }
        },
        include: {
          establecimiento: {
            include: {
              centroAcopio: {
                select: { id: true, nombre: true, codigo: true }
              }
            }
          }
        },
        orderBy: [
          { establecimiento: { centroAcopio: { nombre: 'asc' } } },
          { establecimiento: { nombre: 'asc' } }
        ]
      });

      // Group by centro de acopio
      const centrosAgrupados = new Map<string, CentroAcopioAgrupado>();

      for (const mov of movimientos) {
        const centro = mov.establecimiento.centroAcopio;
        const tieneVale = centrosConVale.has(centro.id);
        const valeNumero = centrosConVale.get(centro.id) || null;

        if (!centrosAgrupados.has(centro.id)) {
          centrosAgrupados.set(centro.id, {
            centroAcopioId: centro.id,
            centroAcopioNombre: centro.nombre,
            centroAcopioCodigo: centro.codigo || '',
            tieneValeGenerado: tieneVale,
            valeNumero,
            establecimientos: [],
            totalEntregas: 0
          });
        }

        const grupo = centrosAgrupados.get(centro.id)!;
        grupo.establecimientos.push({
          id: mov.id,
          movimientoId: mov.id,
          establecimientoId: mov.establecimientoId,
          establecimientoNombre: mov.establecimiento.nombre,
          establecimientoCodigo: mov.establecimiento.codigo,
          centroAcopioId: centro.id,
          centroAcopioNombre: centro.nombre,
          centroAcopioCodigo: centro.codigo || '',
          entregaActual: mov.entrega,
          saldoAnterior: mov.saldoAnterior,
          tieneValeGenerado: tieneVale,
          valeNumero
        });
        grupo.totalEntregas += mov.entrega;
      }

      const centrosAcopio = Array.from(centrosAgrupados.values());
      
      // Count adjustable vs blocked
      let establecimientosAjustables = 0;
      let establecimientosBloqueados = 0;
      
      centrosAcopio.forEach(centro => {
        if (centro.tieneValeGenerado) {
          establecimientosBloqueados += centro.establecimientos.length;
        } else {
          establecimientosAjustables += centro.establecimientos.length;
        }
      });

      // Determine if adjustment is possible
      let puedeAjustar = true;
      let motivoNoPuedeAjustar: string | null = null;

      if (establecimientosAjustables === 0) {
        puedeAjustar = false;
        motivoNoPuedeAjustar = 'Todos los centros de acopio ya tienen vales generados';
      }

      console.log(`✅ [AjusteEntregasService] Datos obtenidos: ${centrosAcopio.length} centros, ${establecimientosAjustables} ajustables, ${establecimientosBloqueados} bloqueados`);

      return {
        success: true,
        data: {
          vacunaId: vacuna.id,
          vacunaNombre: vacuna.nombre,
          mes,
          anio,
          stockInicial: stockInicialHistorico || 0,
          totalEntregas,
          deficit: stockDisponible,
          centrosAcopio,
          establecimientosAjustables,
          establecimientosBloqueados,
          puedeAjustar,
          motivoNoPuedeAjustar
        }
      };
    } catch (error) {
      console.error('❌ [AjusteEntregasService] Error obteniendo datos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener datos para ajuste'
      };
    }
  }

  /**
   * Calculate adjustment options
   */
  static async calcularOpcionesAjuste(
    datos: DatosAjusteEntregas
  ): Promise<ServiceResult<OpcionAjuste[]>> {
    try {
      const deficit = Math.abs(datos.deficit);
      
      // Get only adjustable establishments (without generated vale)
      const establecimientosAjustables = datos.centrosAcopio
        .filter(c => !c.tieneValeGenerado)
        .flatMap(c => c.establecimientos);

      if (establecimientosAjustables.length === 0) {
        return {
          success: false,
          error: 'No hay establecimientos ajustables (todos tienen vale generado)'
        };
      }

      const totalEntregasAjustables = establecimientosAjustables.reduce(
        (sum, e) => sum + e.entregaActual, 0
      );

      // If adjustable deliveries cannot cover the deficit
      if (totalEntregasAjustables < deficit) {
        return {
          success: false,
          error: `El déficit (${deficit}) excede el total de entregas ajustables (${totalEntregasAjustables}). No es posible eliminarlo completamente.`
        };
      }

      const opciones: OpcionAjuste[] = [];

      // Option 1: Reduce proportionally
      opciones.push(this.calcularReduccionProporcional(
        establecimientosAjustables,
        deficit,
        datos
      ));

      // Option 2: Reduce from highest deliveries first
      opciones.push(this.calcularReduccionDesdeMayores(
        establecimientosAjustables,
        deficit,
        datos
      ));

      // Option 3: Reduce from lowest deliveries first
      opciones.push(this.calcularReduccionDesdeMenores(
        establecimientosAjustables,
        deficit,
        datos
      ));

      // Option 4: Reduce based on saldo anterior (intelligent)
      opciones.push(this.calcularReduccionPorSaldoAnterior(
        establecimientosAjustables,
        deficit,
        datos
      ));

      // Option 5: Reduce all to zero (only if stock inicial is 0 or deficit >= total)
      if (datos.stockInicial === 0 || deficit >= totalEntregasAjustables) {
        opciones.push(this.calcularReduccionACero(
          establecimientosAjustables,
          datos
        ));
      }

      // Determine best recommendation
      this.determinarRecomendacion(opciones, datos);

      return {
        success: true,
        data: opciones
      };
    } catch (error) {
      console.error('❌ [AjusteEntregasService] Error calculando opciones:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al calcular opciones de ajuste'
      };
    }
  }

  /**
   * Calculate proportional reduction
   */
  private static calcularReduccionProporcional(
    establecimientos: EstablecimientoParaAjuste[],
    deficit: number,
    datos: DatosAjusteEntregas
  ): OpcionAjuste {
    const totalActual = establecimientos.reduce((sum, e) => sum + e.entregaActual, 0);
    const nuevoTotal = totalActual - deficit;
    const factor = nuevoTotal / totalActual;
    const porcentajeReduccion = Math.round((1 - factor) * 100);

    const ajustes: AjusteIndividual[] = [];
    let acumuladoReduccion = 0;

    establecimientos.forEach((est, index) => {
      let entregaDespues = Math.floor(est.entregaActual * factor);
      
      // Last item adjustment to ensure exact deficit coverage
      if (index === establecimientos.length - 1) {
        const reduccionNecesaria = deficit - acumuladoReduccion;
        entregaDespues = est.entregaActual - reduccionNecesaria;
      }

      const diferencia = est.entregaActual - entregaDespues;
      acumuladoReduccion += diferencia;

      ajustes.push({
        movimientoId: est.movimientoId,
        establecimientoId: est.establecimientoId,
        establecimientoNombre: est.establecimientoNombre,
        centroAcopioId: est.centroAcopioId,
        entregaAntes: est.entregaActual,
        entregaDespues: Math.max(0, entregaDespues),
        diferencia: -diferencia,
        bloqueado: false
      });
    });

    // Add blocked establishments
    this.agregarEstablecimientosBloqueados(ajustes, datos);

    const totalDespues = ajustes.reduce((sum, a) => sum + a.entregaDespues, 0);

    return {
      id: 'proporcional',
      nombre: 'Reducción Proporcional',
      descripcion: `Reduce todas las entregas en ${porcentajeReduccion}% de forma equitativa`,
      esRecomendada: false,
      resultadoDeficit: datos.stockInicial - totalDespues,
      ajustes,
      totalAntes: datos.totalEntregas,
      totalDespues,
      reduccionTotal: datos.totalEntregas - totalDespues
    };
  }

  /**
   * Calculate reduction from highest deliveries first
   */
  private static calcularReduccionDesdeMayores(
    establecimientos: EstablecimientoParaAjuste[],
    deficit: number,
    datos: DatosAjusteEntregas
  ): OpcionAjuste {
    const sorted = [...establecimientos].sort((a, b) => b.entregaActual - a.entregaActual);
    let restante = deficit;

    const ajustesMap = new Map<string, AjusteIndividual>();

    for (const est of sorted) {
      const reduccion = Math.min(est.entregaActual, restante);
      restante -= reduccion;

      ajustesMap.set(est.movimientoId, {
        movimientoId: est.movimientoId,
        establecimientoId: est.establecimientoId,
        establecimientoNombre: est.establecimientoNombre,
        centroAcopioId: est.centroAcopioId,
        entregaAntes: est.entregaActual,
        entregaDespues: est.entregaActual - reduccion,
        diferencia: -reduccion,
        bloqueado: false
      });
    }

    const ajustes = Array.from(ajustesMap.values());
    this.agregarEstablecimientosBloqueados(ajustes, datos);

    const totalDespues = ajustes.reduce((sum, a) => sum + a.entregaDespues, 0);

    return {
      id: 'desde_mayores',
      nombre: 'Reducir desde Mayores',
      descripcion: 'Prioriza reducir de establecimientos con entregas más altas',
      esRecomendada: false,
      resultadoDeficit: datos.stockInicial - totalDespues,
      ajustes,
      totalAntes: datos.totalEntregas,
      totalDespues,
      reduccionTotal: datos.totalEntregas - totalDespues
    };
  }

  /**
   * Calculate reduction from lowest deliveries first
   */
  private static calcularReduccionDesdeMenores(
    establecimientos: EstablecimientoParaAjuste[],
    deficit: number,
    datos: DatosAjusteEntregas
  ): OpcionAjuste {
    const sorted = [...establecimientos].sort((a, b) => a.entregaActual - b.entregaActual);
    let restante = deficit;

    const ajustesMap = new Map<string, AjusteIndividual>();

    for (const est of sorted) {
      const reduccion = Math.min(est.entregaActual, restante);
      restante -= reduccion;

      ajustesMap.set(est.movimientoId, {
        movimientoId: est.movimientoId,
        establecimientoId: est.establecimientoId,
        establecimientoNombre: est.establecimientoNombre,
        centroAcopioId: est.centroAcopioId,
        entregaAntes: est.entregaActual,
        entregaDespues: est.entregaActual - reduccion,
        diferencia: -reduccion,
        bloqueado: false
      });
    }

    const ajustes = Array.from(ajustesMap.values());
    this.agregarEstablecimientosBloqueados(ajustes, datos);

    const totalDespues = ajustes.reduce((sum, a) => sum + a.entregaDespues, 0);

    return {
      id: 'desde_menores',
      nombre: 'Reducir desde Menores',
      descripcion: 'Prioriza reducir de establecimientos con entregas más bajas',
      esRecomendada: false,
      resultadoDeficit: datos.stockInicial - totalDespues,
      ajustes,
      totalAntes: datos.totalEntregas,
      totalDespues,
      reduccionTotal: datos.totalEntregas - totalDespues
    };
  }

  /**
   * Calculate intelligent reduction based on saldo anterior
   */
  private static calcularReduccionPorSaldoAnterior(
    establecimientos: EstablecimientoParaAjuste[],
    deficit: number,
    datos: DatosAjusteEntregas
  ): OpcionAjuste {
    // Sort by saldo anterior descending (highest saldo = can reduce more)
    const sorted = [...establecimientos].sort((a, b) => b.saldoAnterior - a.saldoAnterior);
    
    // Calculate max possible reduction per establishment based on saldo
    const maxSaldo = Math.max(...establecimientos.map(e => e.saldoAnterior), 1);
    
    let restante = deficit;
    const ajustesMap = new Map<string, AjusteIndividual>();

    // First pass: proportional reduction based on saldo anterior
    for (const est of sorted) {
      if (restante <= 0) break;

      // Higher saldo = can reduce more (up to 90%)
      // Lower saldo = reduce less (minimum 10%)
      const saldoFactor = est.saldoAnterior / maxSaldo;
      const maxReduccionPorcentaje = Math.max(0.1, Math.min(0.9, 0.2 + saldoFactor * 0.7));
      const maxReduccion = Math.floor(est.entregaActual * maxReduccionPorcentaje);
      
      const reduccion = Math.min(maxReduccion, restante, est.entregaActual);
      restante -= reduccion;

      ajustesMap.set(est.movimientoId, {
        movimientoId: est.movimientoId,
        establecimientoId: est.establecimientoId,
        establecimientoNombre: est.establecimientoNombre,
        centroAcopioId: est.centroAcopioId,
        entregaAntes: est.entregaActual,
        entregaDespues: est.entregaActual - reduccion,
        diferencia: -reduccion,
        bloqueado: false
      });
    }

    // Second pass: if still deficit, reduce more from those with highest saldo
    if (restante > 0) {
      for (const est of sorted) {
        if (restante <= 0) break;
        
        const ajusteExistente = ajustesMap.get(est.movimientoId);
        if (ajusteExistente && ajusteExistente.entregaDespues > 0) {
          const reduccionAdicional = Math.min(ajusteExistente.entregaDespues, restante);
          restante -= reduccionAdicional;
          ajusteExistente.entregaDespues -= reduccionAdicional;
          ajusteExistente.diferencia -= reduccionAdicional;
        }
      }
    }

    const ajustes = Array.from(ajustesMap.values());
    this.agregarEstablecimientosBloqueados(ajustes, datos);

    const totalDespues = ajustes.reduce((sum, a) => sum + a.entregaDespues, 0);

    return {
      id: 'por_saldo_anterior',
      nombre: 'Ajuste Inteligente por Saldo',
      descripcion: 'Reduce más de establecimientos con saldo alto (tienen stock disponible)',
      esRecomendada: false,
      resultadoDeficit: datos.stockInicial - totalDespues,
      ajustes,
      totalAntes: datos.totalEntregas,
      totalDespues,
      reduccionTotal: datos.totalEntregas - totalDespues
    };
  }

  /**
   * Calculate reduction to zero for all
   */
  private static calcularReduccionACero(
    establecimientos: EstablecimientoParaAjuste[],
    datos: DatosAjusteEntregas
  ): OpcionAjuste {
    const ajustes: AjusteIndividual[] = establecimientos.map(est => ({
      movimientoId: est.movimientoId,
      establecimientoId: est.establecimientoId,
      establecimientoNombre: est.establecimientoNombre,
      centroAcopioId: est.centroAcopioId,
      entregaAntes: est.entregaActual,
      entregaDespues: 0,
      diferencia: -est.entregaActual,
      bloqueado: false
    }));

    this.agregarEstablecimientosBloqueados(ajustes, datos);

    const totalDespues = ajustes.reduce((sum, a) => sum + a.entregaDespues, 0);

    return {
      id: 'reducir_a_cero',
      nombre: 'Reducir Todo a Cero',
      descripcion: 'Establece todas las entregas ajustables a 0 (para casos de stock inicial 0)',
      esRecomendada: false,
      resultadoDeficit: datos.stockInicial - totalDespues,
      ajustes,
      totalAntes: datos.totalEntregas,
      totalDespues,
      reduccionTotal: datos.totalEntregas - totalDespues
    };
  }

  /**
   * Add blocked establishments to adjustments list
   */
  private static agregarEstablecimientosBloqueados(
    ajustes: AjusteIndividual[],
    datos: DatosAjusteEntregas
  ): void {
    const centrosBloqueados = datos.centrosAcopio.filter(c => c.tieneValeGenerado);
    
    for (const centro of centrosBloqueados) {
      for (const est of centro.establecimientos) {
        ajustes.push({
          movimientoId: est.movimientoId,
          establecimientoId: est.establecimientoId,
          establecimientoNombre: est.establecimientoNombre,
          centroAcopioId: est.centroAcopioId,
          entregaAntes: est.entregaActual,
          entregaDespues: est.entregaActual,
          diferencia: 0,
          bloqueado: true
        });
      }
    }
  }

  /**
   * Determine which option to recommend
   */
  private static determinarRecomendacion(
    opciones: OpcionAjuste[],
    datos: DatosAjusteEntregas
  ): void {
    // Reset all recommendations
    opciones.forEach(o => o.esRecomendada = false);

    // If stock inicial is 0, recommend reducing to zero
    if (datos.stockInicial === 0) {
      const opcionCero = opciones.find(o => o.id === 'reducir_a_cero');
      if (opcionCero) {
        opcionCero.esRecomendada = true;
        return;
      }
    }

    // If establishments have varied saldo anterior, recommend intelligent adjustment
    const saldos = datos.centrosAcopio
      .filter(c => !c.tieneValeGenerado)
      .flatMap(c => c.establecimientos)
      .map(e => e.saldoAnterior);
    
    const maxSaldo = Math.max(...saldos, 0);
    const minSaldo = Math.min(...saldos, 0);
    const variacionSaldo = maxSaldo - minSaldo;

    if (variacionSaldo > 50) {
      const opcionSaldo = opciones.find(o => o.id === 'por_saldo_anterior');
      if (opcionSaldo) {
        opcionSaldo.esRecomendada = true;
        return;
      }
    }

    // Default: recommend proportional reduction
    const opcionProporcional = opciones.find(o => o.id === 'proporcional');
    if (opcionProporcional) {
      opcionProporcional.esRecomendada = true;
    }
  }

  /**
   * Execute the adjustment
   */
  static async ejecutarAjuste(
    dto: EjecutarAjusteDto
  ): Promise<ServiceResult<{ movimientosActualizados: number; mensaje: string }>> {
    try {
      console.log(`🔧 [AjusteEntregasService] Ejecutando ajuste para vacuna ${dto.vacunaId}, periodo ${dto.mes}/${dto.anio}`);

      // Validate that there's still a deficit
      const stockResult = await MovimientosCalculationService.getStockDisponible(
        dto.vacunaId, dto.mes, dto.anio
      );
      
      if (!stockResult.success || !stockResult.data || stockResult.data.stockDisponible >= 0) {
        return { success: false, error: 'Ya no existe déficit para ajustar' };
      }

      // Validate vales haven't been generated for affected centros
      const valesGenerados = await prisma.valeEntrega.findMany({
        where: { mes: dto.mes, anio: dto.anio },
        select: { centroAcopioId: true }
      });
      const centrosConVale = new Set(valesGenerados.map(v => v.centroAcopioId));

      // Get movements to update
      const movimientoIds = dto.ajustes.map(a => a.movimientoId);
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: { id: { in: movimientoIds } },
        include: {
          establecimiento: {
            select: { centroAcopioId: true, nombre: true }
          }
        }
      });

      // Validate no blocked movements
      for (const mov of movimientos) {
        if (centrosConVale.has(mov.establecimiento.centroAcopioId)) {
          return {
            success: false,
            error: `El establecimiento "${mov.establecimiento.nombre}" pertenece a un centro con vale generado y no puede ser ajustado`
          };
        }
      }

      // Execute in transaction
      const resultado = await prisma.$transaction(async (tx) => {
        let movimientosActualizados = 0;

        for (const ajuste of dto.ajustes) {
          const movimiento = movimientos.find(m => m.id === ajuste.movimientoId);
          if (!movimiento) continue;

          const diferencia = ajuste.entregaNueva - movimiento.entrega;

          // Update movimiento
          await tx.movimientoVacuna.update({
            where: { id: ajuste.movimientoId },
            data: {
              entrega: ajuste.entregaNueva,
              updatedAt: new Date()
            }
          });

          // Redistribuir al mes siguiente para mantener coherencia de planificación anual
          if (diferencia !== 0) {
            const redistribucionResult = await MovimientosCalculationService.redistribuirEntregasAutomaticamente(
              tx,
              movimiento,
              ajuste.entregaNueva,
              dto.usuarioId
            );

            if (!redistribucionResult.success) {
              throw new Error(redistribucionResult.error || 'Error en redistribución al mes siguiente');
            }
          }

          movimientosActualizados++;
        }

        return movimientosActualizados;
      }, {
        maxWait: 30000,
        timeout: 60000
      });

      console.log(`✅ [AjusteEntregasService] Ajuste ejecutado: ${resultado} movimientos actualizados`);

      return {
        success: true,
        data: {
          movimientosActualizados: resultado,
          mensaje: `Se actualizaron ${resultado} entregas exitosamente. El déficit ha sido corregido.`
        }
      };
    } catch (error) {
      console.error('❌ [AjusteEntregasService] Error ejecutando ajuste:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al ejecutar ajuste'
      };
    }
  }

  /**
   * Check if adjustment is available for a vaccine/period
   */
  static async verificarDisponibilidadAjuste(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{ disponible: boolean; motivo: string | null }>> {
    try {
      // Check for deficit
      const stockResult = await MovimientosCalculationService.getStockDisponible(vacunaId, mes, anio);
      
      if (!stockResult.success || !stockResult.data) {
        return {
          success: true,
          data: { disponible: false, motivo: 'No se pudo obtener información de stock' }
        };
      }

      if (stockResult.data.stockDisponible >= 0) {
        return {
          success: true,
          data: { disponible: false, motivo: 'No hay déficit' }
        };
      }

      // Check for available centros without vale
      const valesGenerados = await prisma.valeEntrega.findMany({
        where: { mes, anio },
        select: { centroAcopioId: true }
      });
      const centrosConVale = new Set(valesGenerados.map(v => v.centroAcopioId));

      const movimientosConEntrega = await prisma.movimientoVacuna.findMany({
        where: {
          vacunaId,
          mes,
          anio,
          entrega: { gt: 0 }
        },
        include: {
          establecimiento: {
            select: { centroAcopioId: true }
          }
        }
      });

      const tieneAjustables = movimientosConEntrega.some(
        m => !centrosConVale.has(m.establecimiento.centroAcopioId)
      );

      if (!tieneAjustables) {
        return {
          success: true,
          data: {
            disponible: false,
            motivo: 'Todos los centros de acopio ya tienen vales generados'
          }
        };
      }

      return {
        success: true,
        data: { disponible: true, motivo: null }
      };
    } catch (error) {
      console.error('❌ [AjusteEntregasService] Error verificando disponibilidad:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al verificar disponibilidad'
      };
    }
  }
}
