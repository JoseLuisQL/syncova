import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { createError } from '@/utils/errors';
import { EstadoVale, TipoMovimientoKardex, TipoVale } from '@prisma/client';
import { ConfiguracionJeringaVacunaService } from './ConfiguracionJeringaVacunaService';
import { StockValidationService, VaccineRequirement } from './StockValidationService';

/**
 * Interface para modificaciones de vale
 */
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
 * Interfaces para el módulo de Vales de Entrega
 */
export interface ValeEntregaConRelaciones {
  id: string;
  numero: string;
  centroAcopioId: string;
  mes: number;
  anio: number;
  fechaGeneracion: Date;
  estado: EstadoVale;
  totalVacunas: number;
  totalEstablecimientos: number;
  usuarioId: string;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
  };
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
  };
  detalles: ValeDetalleConRelaciones[];
}

export interface ValeDetalleConRelaciones {
  id: string;
  valeEntregaId: string;
  establecimientoId: string;
  vacunaId: string;
  cantidadProgramada: number;
  cantidadAdicional: number;
  numeroEntregaAdicional?: number;
  createdAt: Date;
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
}

export interface GenerarValeDto {
  centroAcopioId: string;
  mes: number;
  anio: number;
  usuarioId: string;
  observaciones?: string;
  afectarStock?: boolean; // Por defecto true
  tipoVale?: 'completo' | 'solo_base' | 'solo_adicionales';
  entregasAdicionalesSeleccionadas?: string[]; // IDs de entregas adicionales específicas (compatibilidad)
  gruposEntregasSeleccionados?: number[]; // Números de grupos de entregas adicionales
}

export interface ValesFilters {
  centroAcopioId?: string;
  mes?: number;
  anio?: number;
  estado?: EstadoVale;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StockAfectacion {
  loteId: string;
  cantidadAfectada: number;
  saldoAnterior: number;
  saldoNuevo: number;
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

/**
 * Servicio para gestión profesional de Vales de Entrega
 * Módulo 11: VALES DE ENTREGA
 */
export class ValeService {
  
  /**
   * Validar datos para generar vale
   */
  private static async validateGenerarValeData(data: GenerarValeDto): Promise<void> {
    // Validar centro de acopio (ahora desde la tabla centros_acopio)
    const centroAcopio = await prisma.centroAcopio.findFirst({
      where: {
        id: data.centroAcopioId,
        estado: 'activo'
      }
    });
    if (!centroAcopio) {
      throw createError('El centro de acopio especificado no existe o no está activo', 404);
    }

    // Validar usuario (solo si no es temporal)
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

    // Validar período
    if (data.mes < 1 || data.mes > 12) {
      throw createError('El mes debe estar entre 1 y 12', 400);
    }

    const currentYear = new Date().getFullYear();
    if (data.anio < 2020 || data.anio > currentYear + 5) {
      throw createError(`El año debe estar entre 2020 y ${currentYear + 5}`, 400);
    }

    // Validación inteligente basada en el contenido de los vales existentes
    const tipoVale = data.tipoVale || 'completo';

    // Obtener tipos ya generados
    const tiposGeneradosResult = await this.getTiposValesGenerados(data.centroAcopioId, data.mes, data.anio);
    const tiposGenerados = tiposGeneradosResult.success ? tiposGeneradosResult.data : [];

    // Validar según el tipo que se quiere generar
    if (tipoVale === 'solo_adicionales') {
      // Para entregas adicionales, verificar si los grupos específicos ya fueron generados
      if (data.gruposEntregasSeleccionados && data.gruposEntregasSeleccionados.length > 0) {
        const gruposGeneradosResult = await this.getGruposEntregasAdicionalesGenerados(data.centroAcopioId, data.mes, data.anio);
        const gruposGenerados = gruposGeneradosResult.success ? gruposGeneradosResult.data : [];

        const gruposYaGenerados = data.gruposEntregasSeleccionados.filter(grupo =>
          gruposGenerados.includes(grupo)
        );

        if (gruposYaGenerados.length > 0) {
          throw createError(`Ya existen vales para los grupos de entregas adicionales: ${gruposYaGenerados.join(', ')} para ${centroAcopio.nombre} en ${data.mes}/${data.anio}`, 409);
        }
      } else {
        // Lógica antigua para compatibilidad
        if (tiposGenerados.includes(tipoVale)) {
          throw createError(`Ya existe un vale de entregas adicionales para ${centroAcopio.nombre} en ${data.mes}/${data.anio}`, 409);
        }
      }
    } else {
      // Para otros tipos, mantener la validación original
      if (tiposGenerados.includes(tipoVale)) {
        const tipoTexto = {
          'completo': 'completo',
          'solo_base': 'de entregas base'
        }[tipoVale] || tipoVale;

        throw createError(`Ya existe un vale ${tipoTexto} para ${centroAcopio.nombre} en ${data.mes}/${data.anio}`, 409);
      }
    }

    // Si es vale completo y ya existen otros tipos, no permitir
    if (tipoVale === 'completo' && tiposGenerados.length > 0) {
      throw createError(`Ya existen vales específicos para ${centroAcopio.nombre} en ${data.mes}/${data.anio}. No se puede generar un vale completo.`, 409);
    }

    console.log(`✅ Validación pasada. Generando vale de tipo ${tipoVale} para ${centroAcopio.nombre} - ${data.mes}/${data.anio}`);
  }

  /**
   * Generar número de vale automático
   */
  private static async generarNumeroVale(centroAcopioId: string, _mes: number, anio: number): Promise<string> {
    const centroAcopio = await prisma.centroAcopio.findUnique({
      where: { id: centroAcopioId },
      select: { codigo: true }
    });

    if (!centroAcopio) {
      throw createError('Centro de acopio no encontrado', 404);
    }

    // Obtener todos los vales para este centro y año para encontrar el máximo número
    const valesExistentes = await prisma.valeEntrega.findMany({
      where: {
        centroAcopioId,
        anio
      },
      select: { numero: true }
    });

    let maxNumero = 0;
    const prefijo = `${centroAcopio.codigo}-${anio}-`;

    // Extraer el número más alto de todos los vales existentes
    for (const vale of valesExistentes) {
      if (vale.numero.startsWith(prefijo)) {
        const numeroStr = vale.numero.substring(prefijo.length);
        const numero = parseInt(numeroStr, 10);
        if (!isNaN(numero) && numero > maxNumero) {
          maxNumero = numero;
        }
      }
    }

    const siguienteNumero = maxNumero + 1;

    // Formato: CODIGO_CENTRO-AÑO-NUMERO_SECUENCIAL
    const numeroVale = `${prefijo}${siguienteNumero.toString().padStart(3, '0')}`;

    // Verificar que no exista (doble verificación)
    const valeExistente = await prisma.valeEntrega.findFirst({
      where: { numero: numeroVale }
    });

    if (valeExistente) {
      throw createError(`El número de vale ${numeroVale} ya existe`, 409);
    }

    return numeroVale;
  }

  /**
   * Obtener movimientos para sincronización de vale con filtrado específico
   * Esta versión mantiene solo las entregas adicionales que estaban en el vale original
   */
  private static async obtenerMovimientosParaValeConFiltroEspecifico(
    centroAcopioId: string,
    mes: number,
    anio: number,
    tipoVale: 'completo' | 'solo_base' | 'solo_adicionales' = 'completo',
    numerosEntregasAdicionalesOriginales: number[] = []
  ) {
    // Construir condiciones WHERE según el tipo de vale
    let whereConditions: any = {
      mes,
      anio,
      establecimiento: {
        OR: [
          { id: centroAcopioId }, // El mismo centro de acopio
          { centroAcopioId } // Establecimientos bajo este centro de acopio
        ]
      }
    };

    // Filtrar según el tipo de vale
    switch (tipoVale) {
      case 'solo_base':
        whereConditions.entrega = { gt: 0 }; // Solo entregas base
        break;
      case 'solo_adicionales':
        whereConditions.entregasAdicionales = { some: {} }; // Solo con entregas adicionales
        break;
      case 'completo':
      default:
        whereConditions.OR = [
          { entrega: { gt: 0 } }, // Tiene entrega programada
          { entregasAdicionales: { some: {} } } // Tiene entregas adicionales
        ];
        break;
    }

    const movimientos = await prisma.movimientoVacuna.findMany({
      where: whereConditions,
      include: {
        establecimiento: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipo: true
          }
        },
        vacuna: {
          select: {
            id: true,
            nombre: true,
            presentacion: true,
            dosisPorFrasco: true
          }
        },
        entregasAdicionales: {
          // FILTRO CLAVE: Solo incluir las entregas adicionales que estaban en el vale original
          where: numerosEntregasAdicionalesOriginales.length > 0
            ? { numeroEntrega: { in: numerosEntregasAdicionalesOriginales } }
            : undefined,
          orderBy: { numeroEntrega: 'asc' }
        }
      },
      orderBy: [
        { establecimiento: { nombre: 'asc' } },
        { vacuna: { nombre: 'asc' } }
      ]
    });

    return movimientos;
  }

  /**
   * Obtener movimientos para generar vale
   */
  private static async obtenerMovimientosParaVale(
    centroAcopioId: string,
    mes: number,
    anio: number,
    tipoVale: 'completo' | 'solo_base' | 'solo_adicionales' = 'completo',
    entregasAdicionalesSeleccionadas?: string[],
    gruposEntregasSeleccionados?: number[]
  ) {
    // Construir condiciones WHERE según el tipo de vale
    let whereConditions: any = {
      mes,
      anio,
      establecimiento: {
        OR: [
          { id: centroAcopioId }, // El mismo centro de acopio
          { centroAcopioId } // Establecimientos bajo este centro de acopio
        ]
      }
    };

    // Filtrar según el tipo de vale
    switch (tipoVale) {
      case 'solo_base':
        whereConditions.entrega = { gt: 0 }; // Solo entregas base
        break;
      case 'solo_adicionales':
        whereConditions.entregasAdicionales = { some: {} }; // Solo con entregas adicionales
        break;
      case 'completo':
      default:
        whereConditions.OR = [
          { entrega: { gt: 0 } }, // Tiene entrega programada
          { entregasAdicionales: { some: {} } } // Tiene entregas adicionales
        ];
        break;
    }

    const movimientos = await prisma.movimientoVacuna.findMany({
      where: whereConditions,
      include: {
        establecimiento: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipo: true
          }
        },
        vacuna: {
          select: {
            id: true,
            nombre: true,
            presentacion: true,
            dosisPorFrasco: true
          }
        },
        entregasAdicionales: {
          where: tipoVale === 'solo_adicionales' ? (
            gruposEntregasSeleccionados && gruposEntregasSeleccionados.length > 0
              ? { numeroEntrega: { in: gruposEntregasSeleccionados } }
              : entregasAdicionalesSeleccionadas
                ? { id: { in: entregasAdicionalesSeleccionadas } }
                : undefined
          ) : undefined,
          orderBy: { numeroEntrega: 'asc' }
        }
      },
      orderBy: [
        { establecimiento: { nombre: 'asc' } },
        { vacuna: { nombre: 'asc' } }
      ]
    });

    // Si es solo entregas adicionales, filtrar solo los movimientos que tienen las entregas seleccionadas
    if (tipoVale === 'solo_adicionales') {
      if (gruposEntregasSeleccionados && gruposEntregasSeleccionados.length > 0) {
        // Filtrar por grupos seleccionados
        return movimientos.filter(mov =>
          mov.entregasAdicionales && mov.entregasAdicionales.some(ea =>
            gruposEntregasSeleccionados.includes(ea.numeroEntrega)
          )
        );
      } else if (entregasAdicionalesSeleccionadas) {
        // Mantener compatibilidad con selección individual
        return movimientos.filter(mov =>
          mov.entregasAdicionales && mov.entregasAdicionales.length > 0
        );
      }
    }

    return movimientos;
  }

  /**
   * Generar vista previa sin crear vale real
   */
  private static async generarVistaPrevia(centroAcopioId: string, mes: number, anio: number): Promise<ServiceResult<any>> {
    try {
      // Obtener movimientos
      const movimientos = await this.obtenerMovimientosParaVale(centroAcopioId, mes, anio);

      if (movimientos.length === 0) {
        throw createError('No hay movimientos con entregas para generar el vale', 400);
      }

      // Obtener información del centro de acopio
      const centroAcopio = await prisma.centroAcopio.findUnique({
        where: { id: centroAcopioId },
        select: { id: true, nombre: true, codigo: true }
      });

      if (!centroAcopio) {
        throw createError('Centro de acopio no encontrado', 404);
      }

      // Procesar movimientos para crear la estructura de vista previa
      const detalles: any[] = [];
      const vacunasPorEstablecimiento: any = {};
      let totalVacunas = 0;
      const establecimientosUnicos = new Set<string>();

      for (const movimiento of movimientos) {
        const cantidades = this.calcularCantidadTotal(movimiento);

        // Crear detalle
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

        // Consolidar por establecimiento y vacuna
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
   * Calcular cantidad total de vacunas (programada + adicionales)
   */
  private static calcularCantidadTotal(movimiento: any): { programada: number; adicional: number; total: number } {
    const tieneEntregasAdicionales = movimiento.entregasAdicionales && movimiento.entregasAdicionales.length > 0;
    
    let cantidadProgramada = 0;
    let cantidadAdicional = 0;

    if (tieneEntregasAdicionales) {
      // Si tiene entregas adicionales, usar entrega_base como programada
      cantidadProgramada = movimiento.entregaBase ?? movimiento.entrega;
      cantidadAdicional = movimiento.entregasAdicionales.reduce(
        (sum: number, entrega: any) => sum + entrega.cantidad,
        0
      );
    } else {
      // Sin entregas adicionales, toda la entrega es programada
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
   * Obtener lotes disponibles para afectar stock (FIFO)
   */
  private static async obtenerLotesDisponibles(vacunaId: string, cantidadRequerida: number) {
    const lotes = await prisma.loteVacuna.findMany({
      where: {
        vacunaId,
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      orderBy: [
        { fechaVencimiento: 'asc' }, // FIFO por vencimiento
        { fechaIngreso: 'asc' }
      ]
    });

    const lotesAfectar: Array<{ lote: any; cantidadAfectar: number }> = [];
    let cantidadRestante = cantidadRequerida;

    for (const lote of lotes) {
      if (cantidadRestante <= 0) break;

      const cantidadAfectar = Math.min(lote.cantidadActual, cantidadRestante);
      lotesAfectar.push({ lote, cantidadAfectar });
      cantidadRestante -= cantidadAfectar;
    }

    if (cantidadRestante > 0) {
      throw createError(
        `Stock insuficiente. Requerido: ${cantidadRequerida}, Disponible: ${cantidadRequerida - cantidadRestante}`,
        400
      );
    }

    return lotesAfectar;
  }

  /**
   * Afectar stock de lotes de vacunas
   */
  private static async afectarStockVacunas(
    tx: any,
    vacunaId: string,
    cantidadTotal: number,
    valeNumero: string,
    usuarioId: string
  ): Promise<StockAfectacion[]> {
    const lotesAfectar = await this.obtenerLotesDisponibles(vacunaId, cantidadTotal);
    const stocksAfectados: StockAfectacion[] = [];

    for (const { lote, cantidadAfectar } of lotesAfectar) {
      const saldoAnterior = lote.cantidadActual;
      const saldoNuevo = saldoAnterior - cantidadAfectar;

      // Actualizar lote
      await tx.loteVacuna.update({
        where: { id: lote.id },
        data: {
          cantidadActual: saldoNuevo,
          estado: saldoNuevo === 0 ? 'agotado' : 'disponible'
        }
      });

      // Registrar en kardex
      await tx.kardex.create({
        data: {
          tipo: 'vacuna',
          itemId: vacunaId,
          loteId: lote.id,
          tipoMovimiento: TipoMovimientoKardex.salida,
          cantidad: cantidadAfectar,
          saldoAnterior,
          saldoActual: saldoNuevo,
          documento: 'VALE_ENTREGA',
          numeroDocumento: valeNumero,
          observaciones: `Salida por vale de entrega ${valeNumero}`,
          usuarioId,
          fechaMovimiento: new Date()
        }
      });

      stocksAfectados.push({
        loteId: lote.id,
        cantidadAfectada: cantidadAfectar,
        saldoAnterior,
        saldoNuevo
      });
    }

    return stocksAfectados;
  }

  /**
   * Afectar stock de lotes de jeringas (calculado por configuración)
   * SIEMPRE procesa jeringas usando configuración específica o fallback garantizado
   */
  private static async afectarStockJeringas(
    tx: any,
    vacunaId: string,
    cantidadVacunas: number,
    valeNumero: string,
    usuarioId: string,
    centroAcopioId?: string
  ): Promise<StockAfectacion[]> {
    console.log(`🔍 [ValeService] Verificando configuración de jeringas para vacuna: ${vacunaId}`);

    // Obtener información de la vacuna para cálculos
    const vacuna = await tx.vacuna.findUnique({
      where: { id: vacunaId },
      select: { nombre: true, dosisPorFrasco: true }
    });

    if (!vacuna) {
      console.log(`❌ [ValeService] Vacuna no encontrada: ${vacunaId}`);
      return [];
    }

    const totalDosis = cantidadVacunas * vacuna.dosisPorFrasco;
    console.log(`📊 [ValeService] Vacuna: ${vacuna.nombre}, Cantidad: ${cantidadVacunas}, Dosis totales: ${totalDosis}`);

    // Intentar obtener configuración específica primero
    let configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
      vacunaId,
      cantidadVacunas,
      centroAcopioId,
      false // Sin fallback inicialmente
    );

    // Si no hay configuración específica, usar fallback del sistema
    if (!configResult.success || !configResult.data || configResult.data.length === 0) {
      console.log(`⚠️ [ValeService] No se encontró configuración específica para ${vacuna.nombre}. Usando fallback del sistema...`);

      configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
        vacunaId,
        cantidadVacunas,
        centroAcopioId,
        true // Con fallback del sistema
      );
    }

    // Si aún no hay configuración, usar fallback garantizado
    if (!configResult.success || !configResult.data || configResult.data.length === 0) {
      console.log(`⚠️ [ValeService] Fallback del sistema falló para ${vacuna.nombre}. Usando fallback garantizado...`);
      configResult = await this.obtenerConfiguracionJeringasGarantizada(tx, totalDosis, vacuna.nombre);
    }

    // Verificar si finalmente tenemos configuración válida
    if (!configResult.success || !configResult.data || configResult.data.length === 0) {
      console.log(`❌ [ValeService] CRÍTICO: No se pudo obtener ninguna configuración de jeringas para ${vacuna.nombre}. Esto no debería ocurrir.`);
      return [];
    }

    console.log(`✅ [ValeService] Configuración obtenida para ${vacuna.nombre}: ${configResult.data.length} tipos de jeringas`);
    const stocksAfectados: StockAfectacion[] = [];

    // Procesar cada tipo de jeringa según la configuración
    for (const jeringaConfig of configResult.data) {
      console.log(`🔄 [ValeService] Procesando jeringa: ${jeringaConfig.jeringaId}, cantidad: ${jeringaConfig.cantidad}, multiplicador: ${jeringaConfig.multiplicador || 1}`);

      try {
        const stocksJeringa = await this.afectarStockJeringaEspecifica(
          tx,
          jeringaConfig.jeringaId,
          jeringaConfig.cantidad,
          valeNumero,
          usuarioId,
          vacunaId,
          jeringaConfig.multiplicador || 1
        );
        stocksAfectados.push(...stocksJeringa);
      } catch (error) {
        console.error(`❌ [ValeService] Error afectando stock de jeringa ${jeringaConfig.jeringaId}:`, error);
        // Continuar con las demás jeringas en lugar de fallar completamente
      }
    }

    console.log(`✅ [ValeService] Stocks de jeringas afectados para ${vacuna.nombre}: ${stocksAfectados.length} lotes`);
    return stocksAfectados;
  }

  /**
   * Afectar stock de una jeringa específica
   */
  private static async afectarStockJeringaEspecifica(
    tx: any,
    jeringaId: string,
    cantidadNecesaria: number,
    valeNumero: string,
    usuarioId: string,
    vacunaId: string,
    multiplicador: number
  ): Promise<StockAfectacion[]> {

    // Obtener lotes de la jeringa específica disponibles (FIFO)
    const lotesJeringas = await tx.loteJeringa.findMany({
      where: {
        jeringaId: jeringaId,
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ]
    });

    const stocksAfectados: StockAfectacion[] = [];
    let jeringasRestantes = cantidadNecesaria;

    for (const lote of lotesJeringas) {
      if (jeringasRestantes <= 0) break;

      const cantidadAfectar = Math.min(lote.cantidadActual, jeringasRestantes);
      const saldoAnterior = lote.cantidadActual;
      const saldoNuevo = saldoAnterior - cantidadAfectar;

      // Actualizar lote de jeringas
      await tx.loteJeringa.update({
        where: { id: lote.id },
        data: {
          cantidadActual: saldoNuevo,
          estado: saldoNuevo === 0 ? 'agotado' : 'disponible'
        }
      });

      // Registrar en kardex
      await tx.kardex.create({
        data: {
          tipo: 'jeringa',
          itemId: lote.jeringaId,
          loteId: lote.id,
          tipoMovimiento: TipoMovimientoKardex.salida,
          cantidad: cantidadAfectar,
          saldoAnterior,
          saldoActual: saldoNuevo,
          documento: 'VALE_ENTREGA',
          numeroDocumento: valeNumero,
          observaciones: `Salida por vale de entrega ${valeNumero} - Vacuna: ${vacunaId} (Multiplicador: ${multiplicador})`,
          usuarioId,
          fechaMovimiento: new Date()
        }
      });

      stocksAfectados.push({
        loteId: lote.id,
        cantidadAfectada: cantidadAfectar,
        saldoAnterior,
        saldoNuevo
      });

      jeringasRestantes -= cantidadAfectar;
    }

    if (jeringasRestantes > 0) {
      // Obtener información de la jeringa para el mensaje de error
      const jeringa = await tx.jeringa.findUnique({
        where: { id: jeringaId },
        select: { tipo: true, capacidad: true }
      });

      const jeringaInfo = jeringa ? `${jeringa.tipo} ${jeringa.capacidad}` : 'jeringa específica';

      throw createError(
        `Stock insuficiente de ${jeringaInfo}. Requerido: ${cantidadNecesaria}, Disponible: ${cantidadNecesaria - jeringasRestantes}`,
        400
      );
    }

    return stocksAfectados;
  }

  /**
   * Obtener configuración de jeringas por defecto cuando no existe configuración específica
   * Usa un ratio 1:1 con las jeringas disponibles en stock
   */
  private static async obtenerConfiguracionJeringasPorDefecto(
    tx: any,
    cantidadVacunas: number
  ): Promise<{ success: boolean; data: any[] }> {
    try {
      console.log(`🔧 [ValeService] Generando configuración por defecto para ${cantidadVacunas} vacunas`);

      // Obtener jeringas disponibles en stock
      const jeringasDisponibles = await tx.jeringa.findMany({
        where: {
          estado: 'activo',
          lotes: {
            some: {
              estado: 'disponible',
              cantidadActual: { gt: 0 }
            }
          }
        },
        include: {
          lotes: {
            where: {
              estado: 'disponible',
              cantidadActual: { gt: 0 }
            },
            select: {
              cantidadActual: true
            }
          }
        },
        take: 3 // Limitar a 3 tipos de jeringas para evitar exceso
      });

      if (jeringasDisponibles.length === 0) {
        console.log(`⚠️ [ValeService] No hay jeringas disponibles en stock para configuración por defecto`);
        return { success: false, data: [] };
      }

      // Crear configuración por defecto con ratio 1:1
      const configuracionDefecto = jeringasDisponibles.map(jeringa => {
        const stockTotal = jeringa.lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
        const cantidadNecesaria = Math.min(cantidadVacunas, stockTotal); // No exceder el stock disponible

        console.log(`🔧 [ValeService] Configuración por defecto: ${jeringa.tipo} ${jeringa.capacidad} - ${cantidadNecesaria} unidades (stock: ${stockTotal})`);

        return {
          jeringaId: jeringa.id,
          cantidad: cantidadNecesaria,
          multiplicador: 1 // Ratio 1:1 por defecto
        };
      }).filter(config => config.cantidad > 0); // Solo incluir si hay cantidad disponible

      console.log(`✅ [ValeService] Configuración por defecto generada: ${configuracionDefecto.length} tipos de jeringas`);

      return {
        success: true,
        data: configuracionDefecto
      };
    } catch (error) {
      console.error(`❌ [ValeService] Error generando configuración por defecto:`, error);
      return { success: false, data: [] };
    }
  }

  /**
   * Obtener configuración de jeringas garantizada - NUNCA falla
   * Usa la primera jeringa disponible con ratio 1:1 si todo lo demás falla
   */
  private static async obtenerConfiguracionJeringasGarantizada(
    tx: any,
    totalDosis: number,
    vacunaNombre: string
  ): Promise<{ success: boolean; data: any[] }> {
    try {
      console.log(`🚨 [ValeService] Generando configuración GARANTIZADA para ${totalDosis} dosis de ${vacunaNombre}`);

      // Obtener la primera jeringa disponible con stock
      const jeringaDisponible = await tx.jeringa.findFirst({
        where: {
          estado: 'activo',
          lotes: {
            some: {
              estado: 'disponible',
              cantidadActual: { gt: 0 }
            }
          }
        },
        include: {
          lotes: {
            where: {
              estado: 'disponible',
              cantidadActual: { gt: 0 }
            },
            select: {
              cantidadActual: true
            }
          }
        }
      });

      if (!jeringaDisponible) {
        console.log(`❌ [ValeService] CRÍTICO: No hay ninguna jeringa disponible en el sistema`);
        return { success: false, data: [] };
      }

      const stockTotal = jeringaDisponible.lotes.reduce((sum, lote) => sum + lote.cantidadActual, 0);
      const cantidadNecesaria = Math.min(totalDosis, stockTotal);

      console.log(`🚨 [ValeService] Configuración garantizada: ${jeringaDisponible.tipo} ${jeringaDisponible.capacidad} - ${cantidadNecesaria} unidades (stock: ${stockTotal})`);

      const configuracionGarantizada = [{
        jeringaId: jeringaDisponible.id,
        cantidad: cantidadNecesaria,
        multiplicador: 1 // Ratio 1:1 garantizado
      }];

      return {
        success: true,
        data: configuracionGarantizada
      };
    } catch (error) {
      console.error('Error generando configuración garantizada:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Método legacy para compatibilidad con el comportamiento anterior
   */
  private static async afectarStockJeringasLegacy(
    tx: any,
    jeringasNecesarias: number,
    valeNumero: string,
    usuarioId: string,
    vacunaId: string
  ): Promise<StockAfectacion[]> {
    // Obtener lotes de jeringas disponibles (FIFO) - cualquier jeringa
    const lotesJeringas = await tx.loteJeringa.findMany({
      where: {
        estado: 'disponible',
        cantidadActual: { gt: 0 }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { fechaIngreso: 'asc' }
      ]
    });

    const stocksAfectados: StockAfectacion[] = [];
    let jeringasRestantes = jeringasNecesarias;

    for (const lote of lotesJeringas) {
      if (jeringasRestantes <= 0) break;

      const cantidadAfectar = Math.min(lote.cantidadActual, jeringasRestantes);
      const saldoAnterior = lote.cantidadActual;
      const saldoNuevo = saldoAnterior - cantidadAfectar;

      // Actualizar lote de jeringas
      await tx.loteJeringa.update({
        where: { id: lote.id },
        data: {
          cantidadActual: saldoNuevo,
          estado: saldoNuevo === 0 ? 'agotado' : 'disponible'
        }
      });

      // Registrar en kardex
      await tx.kardex.create({
        data: {
          tipo: 'jeringa',
          itemId: lote.jeringaId,
          loteId: lote.id,
          tipoMovimiento: TipoMovimientoKardex.salida,
          cantidad: cantidadAfectar,
          saldoAnterior,
          saldoActual: saldoNuevo,
          documento: 'VALE_ENTREGA',
          numeroDocumento: valeNumero,
          observaciones: `Salida por vale de entrega ${valeNumero} - Vacuna: ${vacunaId} (Legacy)`,
          usuarioId,
          fechaMovimiento: new Date()
        }
      });

      stocksAfectados.push({
        loteId: lote.id,
        cantidadAfectada: cantidadAfectar,
        saldoAnterior,
        saldoNuevo
      });

      jeringasRestantes -= cantidadAfectar;
    }

    if (jeringasRestantes > 0) {
      throw createError(
        `Stock insuficiente de jeringas. Requerido: ${jeringasNecesarias}, Disponible: ${jeringasNecesarias - jeringasRestantes}`,
        400
      );
    }

    return stocksAfectados;
  }

  /**
   * Generar vale de entrega completo
   */
  static async generarVale(data: GenerarValeDto): Promise<ServiceResult<ResumenGeneracion>> {
    try {
      // Validaciones de negocio
      await this.validateGenerarValeData(data);

      // Si es solo vista previa, retornar VistaPrevia en lugar de ResumenGeneracion
      if (data.afectarStock === false) {
        return await this.generarVistaPrevia(data.centroAcopioId, data.mes, data.anio);
      }

      // GENERACIÓN REAL: Crear vale y afectar stocks
      const result = await prisma.$transaction(async (tx) => {
        // PASO 1: Generar número de vale
        const numeroVale = await this.generarNumeroVale(data.centroAcopioId, data.mes, data.anio);

        // PASO 2: Obtener movimientos para el vale según el tipo especificado
        const tipoVale = data.tipoVale || 'completo';
        const movimientos = await this.obtenerMovimientosParaVale(
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

        // PASO 2.5: Validar stock disponible antes de proceder
        console.log(`🔍 [ValeService] Validando stock disponible para ${movimientos.length} movimientos...`);

        const vaccineRequirements: VaccineRequirement[] = movimientos.map(mov => ({
          vaccineId: mov.vacunaId,
          quantity: (mov.entrega || 0) + (mov.entregasAdicionales?.reduce((sum, ea) => sum + ea.cantidad, 0) || 0)
        }));

        const stockValidation = await StockValidationService.validateStockForVoucher(
          vaccineRequirements,
          data.centroAcopioId
        );

        if (!stockValidation.success) {
          const errorMessage = `Stock insuficiente para generar el vale:\n${stockValidation.errors.join('\n')}`;
          console.error(`❌ [ValeService] ${errorMessage}`);
          throw createError(errorMessage, 400);
        }

        if (stockValidation.warnings.length > 0) {
          console.warn(`⚠️ [ValeService] Advertencias de stock:`, stockValidation.warnings);
        }

        console.log(`✅ [ValeService] Validación de stock exitosa`);

        // PASO 3: Obtener usuario válido (si es temporal, usar el primero disponible)
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

        // PASO 4: Crear vale de entrega
        const vale = await tx.valeEntrega.create({
          data: {
            numero: numeroVale,
            centroAcopioId: data.centroAcopioId,
            mes: data.mes,
            anio: data.anio,
            estado: EstadoVale.generado,
            tipoVale: (data.tipoVale || 'completo') as any,
            usuarioId: usuarioIdFinal,
            observaciones: data.observaciones || null
          }
        });

        // PASO 5: Procesar detalles y afectar stocks
        const stocksAfectadosVacunas: StockAfectacion[] = [];
        const stocksAfectadosJeringas: StockAfectacion[] = [];
        const errores: string[] = [];
        let totalVacunas = 0;
        const establecimientosUnicos = new Set<string>();

        for (const movimiento of movimientos) {
          try {
            const cantidades = this.calcularCantidadTotal(movimiento);
            let cantidadTotalParaVale = 0;

            // Crear detalles según el tipo de vale
            if (tipoVale === 'solo_base' || tipoVale === 'completo') {
              // Incluir entrega base si tiene cantidad programada
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
              // Incluir entregas adicionales
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

            // Solo procesar si hay cantidad total para este vale
            if (cantidadTotalParaVale > 0) {

              // Afectar stocks si está habilitado
              if (data.afectarStock !== false) {
                try {
                  // Afectar stock de vacunas usando la cantidad específica para este vale
                  const stockVacunas = await this.afectarStockVacunas(
                    tx,
                    movimiento.vacunaId,
                    cantidadTotalParaVale,
                    numeroVale,
                    usuarioIdFinal
                  );
                  stocksAfectadosVacunas.push(...stockVacunas);

                  // Afectar stock de jeringas usando la cantidad específica para este vale
                  const stockJeringas = await this.afectarStockJeringas(
                    tx,
                    movimiento.vacunaId,
                    cantidadTotalParaVale,
                    numeroVale,
                    usuarioIdFinal,
                    data.centroAcopioId
                  );
                  stocksAfectadosJeringas.push(...stockJeringas);
                } catch (stockError) {
                  errores.push(`Error afectando stock para ${movimiento.establecimiento.nombre} - ${movimiento.vacuna.nombre}: ${stockError instanceof Error ? stockError.message : 'Error desconocido'}`);
                }
              }

              totalVacunas += cantidadTotalParaVale;
              establecimientosUnicos.add(movimiento.establecimientoId);
            }
          } catch (error) {
            errores.push(`Error procesando ${movimiento.establecimiento.nombre} - ${movimiento.vacuna.nombre}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }

        // PASO 6: Actualizar totales del vale
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
        maxWait: 30000, // 30 segundos máximo de espera
        timeout: 120000, // 120 segundos de timeout (2 minutos)
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
   * Obtener vales con filtros
   */
  static async getVales(filters: ValesFilters = {}): Promise<ServiceResult<{ vales: ValeEntregaConRelaciones[]; total: number }>> {
    try {
      const {
        centroAcopioId,
        mes,
        anio,
        estado,
        search,
        page = 1,
        limit = 50
      } = filters;

      const where: any = {};

      if (centroAcopioId) {
        where.centroAcopioId = centroAcopioId;
      }

      if (mes) {
        where.mes = mes;
      }

      if (anio) {
        where.anio = anio;
      }

      if (estado) {
        where.estado = estado;
      }

      if (search) {
        where.OR = [
          { numero: { contains: search, mode: 'insensitive' } },
          { centroAcopio: { nombre: { contains: search, mode: 'insensitive' } } },
          { observaciones: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [vales, total] = await Promise.all([
        prisma.valeEntrega.findMany({
          where,
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
              select: {
                id: true,
                valeEntregaId: true,
                establecimientoId: true,
                vacunaId: true,
                cantidadProgramada: true,
                cantidadAdicional: true,
                numeroEntregaAdicional: true,
                createdAt: true,
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
          },
          orderBy: [
            { anio: 'desc' },
            { mes: 'desc' },
            { fechaGeneracion: 'desc' }
          ],
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.valeEntrega.count({ where })
      ]);

      return {
        success: true,
        data: {
          vales: vales as ValeEntregaConRelaciones[],
          total
        }
      };
    } catch (error) {
      console.error('Error al obtener vales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener vales'
      };
    }
  }

  /**
   * Obtener vale por ID
   */
  static async getValeById(id: string): Promise<ServiceResult<ValeEntregaConRelaciones>> {
    try {
      const vale = await prisma.valeEntrega.findUnique({
        where: { id },
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
            select: {
              id: true,
              valeEntregaId: true,
              establecimientoId: true,
              vacunaId: true,
              cantidadProgramada: true,
              cantidadAdicional: true,
              numeroEntregaAdicional: true,
              createdAt: true,
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

      if (!vale) {
        return {
          success: false,
          error: 'Vale no encontrado'
        };
      }

      return {
        success: true,
        data: vale as ValeEntregaConRelaciones
      };
    } catch (error) {
      console.error('Error al obtener vale:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener vale'
      };
    }
  }

  /**
   * Diagnosticar estado de vale para reversión
   */
  static async diagnosticarEstadoVale(id: string): Promise<ServiceResult<any>> {
    try {
      const vale = await prisma.valeEntrega.findUnique({
        where: { id },
        select: { numero: true, estado: true }
      });

      if (!vale) {
        return { success: false, error: 'Vale no encontrado' };
      }

      // Verificar movimientos originales
      const movimientosOriginales = await prisma.kardex.findMany({
        where: {
          numeroDocumento: vale.numero,
          documento: 'VALE_ENTREGA',
          tipoMovimiento: TipoMovimientoKardex.salida
        }
      });

      // Verificar reversiones existentes
      const reversiones = await prisma.kardex.findMany({
        where: {
          numeroDocumento: `REVERSION-VALE-${vale.numero}`,
          documento: 'REVERSION'
        }
      });

      return {
        success: true,
        data: {
          vale: vale,
          movimientosOriginales: movimientosOriginales.length,
          reversiones: reversiones.length,
          puedeRevertir: movimientosOriginales.length > 0,
          yaRevertido: reversiones.length > 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al diagnosticar vale'
      };
    }
  }

  /**
   * Limpiar estado inconsistente de reversión (solo para casos especiales)
   */
  static async limpiarEstadoReversion(id: string): Promise<ServiceResult<{ message: string }>> {
    try {
      console.log(`🧹 [ValeService] Limpiando estado de reversión para vale: ${id}`);

      const valeExistente = await prisma.valeEntrega.findUnique({
        where: { id },
        select: { numero: true, estado: true }
      });

      if (!valeExistente) {
        return { success: false, error: 'Vale no encontrado' };
      }

      // Eliminar entradas de reversión huérfanas
      const result = await prisma.kardex.deleteMany({
        where: {
          numeroDocumento: `REVERSION-VALE-${valeExistente.numero}`,
          documento: 'REVERSION'
        }
      });

      console.log(`✅ [ValeService] Eliminadas ${result.count} entradas de reversión huérfanas`);

      return {
        success: true,
        data: {
          message: `Estado de reversión limpiado. Eliminadas ${result.count} entradas huérfanas. Ahora puede intentar revertir el vale nuevamente.`
        }
      };
    } catch (error) {
      console.error('❌ [ValeService] Error al limpiar estado de reversión:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al limpiar estado'
      };
    }
  }

  /**
   * Revertir vale y restaurar stocks afectados
   */
  static async revertirVale(id: string): Promise<ServiceResult<{ message: string }>> {
    try {
      console.log(`🔄 [ValeService] Iniciando reversión de vale: ${id}`);

      // Validar que el vale existe
      const valeExistente = await prisma.valeEntrega.findUnique({
        where: { id },
        include: {
          centroAcopio: {
            select: { nombre: true }
          },
          detalles: {
            include: {
              establecimiento: { select: { nombre: true } },
              vacuna: { select: { nombre: true } }
            }
          }
        }
      });

      if (!valeExistente) {
        console.log(`❌ [ValeService] Vale no encontrado: ${id}`);
        return {
          success: false,
          error: 'Vale no encontrado'
        };
      }

      console.log(`📋 [ValeService] Vale encontrado: ${valeExistente.numero} (Estado: ${valeExistente.estado})`);

      // Validar que el vale se puede revertir (solo si está en estado 'generado')
      if (valeExistente.estado !== EstadoVale.generado) {
        console.log(`❌ [ValeService] Estado inválido para reversión: ${valeExistente.estado}`);
        return {
          success: false,
          error: `No se puede revertir un vale en estado '${valeExistente.estado}'. Solo se pueden revertir vales en estado 'generado'.`
        };
      }

      // Ejecutar reversión en transacción
      await prisma.$transaction(async (tx) => {
        // PASO 1: Verificar movimientos de stock pendientes de revertir
        const movimientosPendientes = await tx.kardex.findMany({
          where: {
            numeroDocumento: valeExistente.numero,
            tipoMovimiento: TipoMovimientoKardex.salida,
            documento: 'VALE_ENTREGA'
          }
        });

        if (movimientosPendientes.length === 0) {
          console.log(`⚠️ [ValeService] No hay movimientos de stock pendientes para revertir en vale: ${valeExistente.numero}`);
          throw new Error(`El vale ${valeExistente.numero} no tiene movimientos de stock pendientes para revertir. Es posible que ya haya sido revertido.`);
        }

        console.log(`📋 [ValeService] Encontrados ${movimientosPendientes.length} movimientos de stock para revertir`);

        // PASO 2: Revertir stocks de vacunas afectados
        const stocksVacunasAfectados = await tx.kardex.findMany({
          where: {
            numeroDocumento: valeExistente.numero,
            tipoMovimiento: TipoMovimientoKardex.salida,
            tipo: 'vacuna',
            documento: 'VALE_ENTREGA' // Solo movimientos originales del vale, no reversiones
          },
          orderBy: { createdAt: 'asc' } // Procesar en orden cronológico
        });

        console.log(`📋 [ValeService] Encontrados ${stocksVacunasAfectados.length} movimientos de vacunas para revertir`);

        for (const kardex of stocksVacunasAfectados) {
          // Obtener el estado actual del lote antes de la reversión
          const loteActual = await tx.loteVacuna.findUnique({
            where: { id: kardex.loteId },
            select: { cantidadActual: true, estado: true }
          });

          if (!loteActual) {
            console.warn(`Lote de vacuna ${kardex.loteId} no encontrado para reversión`);
            continue;
          }

          const nuevaCantidad = loteActual.cantidadActual + kardex.cantidad;

          console.log(`🔄 [ValeService] Revirtiendo vacuna - Lote: ${kardex.loteId}, Cantidad: +${kardex.cantidad}, Nuevo saldo: ${nuevaCantidad}`);

          // Restaurar stock del lote de vacuna
          await tx.loteVacuna.update({
            where: { id: kardex.loteId },
            data: {
              cantidadActual: nuevaCantidad,
              estado: nuevaCantidad > 0 ? 'disponible' : 'agotado'
            }
          });

          // Crear entrada de reversión en kardex con cálculos correctos
          await tx.kardex.create({
            data: {
              tipo: 'vacuna',
              itemId: kardex.itemId,
              loteId: kardex.loteId,
              tipoMovimiento: TipoMovimientoKardex.ingreso,
              cantidad: kardex.cantidad,
              saldoAnterior: loteActual.cantidadActual,
              saldoActual: nuevaCantidad,
              documento: 'REVERSION',
              numeroDocumento: `REVERSION-VALE-${valeExistente.numero}`,
              observaciones: `Reversión de vale ${valeExistente.numero} - ${valeExistente.centroAcopio.nombre}`,
              usuarioId: valeExistente.usuarioId,
              fechaMovimiento: new Date()
            }
          });
        }

        // PASO 3: Revertir stocks de jeringas afectados
        const stocksJeringasAfectados = await tx.kardex.findMany({
          where: {
            numeroDocumento: valeExistente.numero,
            tipoMovimiento: TipoMovimientoKardex.salida,
            tipo: 'jeringa',
            documento: 'VALE_ENTREGA' // Solo movimientos originales del vale, no reversiones
          },
          orderBy: { createdAt: 'asc' } // Procesar en orden cronológico
        });

        console.log(`📋 [ValeService] Encontrados ${stocksJeringasAfectados.length} movimientos de jeringas para revertir`);

        for (const kardex of stocksJeringasAfectados) {
          // Obtener el estado actual del lote antes de la reversión
          const loteActual = await tx.loteJeringa.findUnique({
            where: { id: kardex.loteId },
            select: { cantidadActual: true, estado: true }
          });

          if (!loteActual) {
            console.warn(`Lote de jeringa ${kardex.loteId} no encontrado para reversión`);
            continue;
          }

          const nuevaCantidad = loteActual.cantidadActual + kardex.cantidad;

          console.log(`🔄 [ValeService] Revirtiendo jeringa - Lote: ${kardex.loteId}, Cantidad: +${kardex.cantidad}, Nuevo saldo: ${nuevaCantidad}`);

          // Restaurar stock del lote de jeringa
          await tx.loteJeringa.update({
            where: { id: kardex.loteId },
            data: {
              cantidadActual: nuevaCantidad,
              estado: nuevaCantidad > 0 ? 'disponible' : 'agotado'
            }
          });

          // Crear entrada de reversión en kardex con cálculos correctos
          await tx.kardex.create({
            data: {
              tipo: 'jeringa',
              itemId: kardex.itemId,
              loteId: kardex.loteId,
              tipoMovimiento: TipoMovimientoKardex.ingreso,
              cantidad: kardex.cantidad,
              saldoAnterior: loteActual.cantidadActual,
              saldoActual: nuevaCantidad,
              documento: 'REVERSION',
              numeroDocumento: `REVERSION-VALE-${valeExistente.numero}`,
              observaciones: `Reversión de vale ${valeExistente.numero} - ${valeExistente.centroAcopio.nombre}`,
              usuarioId: valeExistente.usuarioId,
              fechaMovimiento: new Date()
            }
          });
        }

        // PASO 4: Eliminar detalles del vale
        await tx.valeDetalle.deleteMany({
          where: { valeEntregaId: id }
        });

        // PASO 5: Eliminar el vale
        await tx.valeEntrega.delete({
          where: { id }
        });

        console.log(`✅ [ValeService] Reversión de stocks completada para vale: ${valeExistente.numero}`);
      }, {
        maxWait: 20000, // 20 segundos máximo de espera
        timeout: 60000, // 60 segundos de timeout
      });

      console.log(`✅ [ValeService] Reversión completada exitosamente: ${valeExistente.numero}`);
      return {
        success: true,
        data: {
          message: `Vale ${valeExistente.numero} revertido exitosamente. Stocks restaurados.`
        }
      };
    } catch (error) {
      console.error('❌ [ValeService] Error crítico al revertir vale:', error);
      console.error('❌ [ValeService] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al revertir vale'
      };
    }
  }

  /**
   * Cambiar estado de vale
   */
  static async cambiarEstado(id: string, nuevoEstado: EstadoVale, _usuarioId: string): Promise<ServiceResult<ValeEntregaConRelaciones>> {
    try {
      // Validar que el vale existe
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

      // Validar transición de estado
      const transicionesValidas: Record<EstadoVale, EstadoVale[]> = {
        [EstadoVale.generado]: [EstadoVale.impreso],
        [EstadoVale.impreso]: [EstadoVale.entregado],
        [EstadoVale.entregado]: [] // Estado final
      };

      if (!transicionesValidas[valeExistente.estado].includes(nuevoEstado)) {
        return {
          success: false,
          error: `No se puede cambiar de estado ${valeExistente.estado} a ${nuevoEstado}`
        };
      }

      // Actualizar estado
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
   * Determinar el tipo de un vale basándose en su contenido
   */
  private static determinarTipoVale(detalles: any[]): 'completo' | 'solo_base' | 'solo_adicionales' {
    const tieneEntregasBase = detalles.some(detalle => detalle.cantidadProgramada > 0);
    const tieneEntregasAdicionales = detalles.some(detalle => detalle.cantidadAdicional > 0);

    if (tieneEntregasBase && tieneEntregasAdicionales) {
      return 'completo';
    } else if (tieneEntregasBase && !tieneEntregasAdicionales) {
      return 'solo_base';
    } else if (!tieneEntregasBase && tieneEntregasAdicionales) {
      return 'solo_adicionales';
    } else {
      return 'completo'; // Por defecto
    }
  }

  /**
   * Sincronizar vale existente con datos actualizados de movimientos
   */
  static async sincronizarValeConMovimientos(valeId: string, usuarioId: string): Promise<ServiceResult<{
    valeActualizado: ValeEntregaConRelaciones;
    modificaciones: ModificacionVale[];
    stocksAfectados: {
      vacunas: StockAfectacion[];
      jeringas: StockAfectacion[];
    };
  }>> {
    try {
      console.log(`🔄 [ValeService] Iniciando sincronización de vale: ${valeId}`);

      // Verificar que el vale existe
      const valeExistente = await prisma.valeEntrega.findUnique({
        where: { id: valeId },
        include: {
          detalles: {
            include: {
              establecimiento: true,
              vacuna: true
            }
          }
        }
      });

      if (!valeExistente) {
        return {
          success: false,
          error: 'Vale de entrega no encontrado'
        };
      }

      // Solo permitir sincronización en vales generados
      if (valeExistente.estado !== 'generado') {
        return {
          success: false,
          error: 'Solo se pueden sincronizar vales en estado "generado"'
        };
      }

      const result = await prisma.$transaction(async (tx) => {
        // PASO 1: Determinar el tipo del vale basándose en su contenido actual
        const tipoVale = this.determinarTipoVale(valeExistente.detalles);
        console.log(`🔍 [ValeService] Vale ${valeExistente.numero} identificado como tipo: ${tipoVale}`);

        // PASO 2: Extraer los números de entregas adicionales que están en el vale original
        const entregasAdicionalesOriginales = new Set<number>();
        valeExistente.detalles.forEach(detalle => {
          if (detalle.numeroEntregaAdicional && detalle.cantidadAdicional > 0) {
            entregasAdicionalesOriginales.add(detalle.numeroEntregaAdicional);
          }
        });

        // PASO 3: Obtener movimientos actuales con filtrado específico para mantener la estructura original del vale
        const movimientosActuales = await this.obtenerMovimientosParaValeConFiltroEspecifico(
          valeExistente.centroAcopioId,
          valeExistente.mes,
          valeExistente.anio,
          tipoVale,
          Array.from(entregasAdicionalesOriginales)
        );

        console.log(`🔍 [ValeService] Entregas adicionales originales en vale: [${Array.from(entregasAdicionalesOriginales).join(', ')}]`);
        console.log(`🔍 [ValeService] Movimientos obtenidos para sincronización: ${movimientosActuales.length}`);

        // PASO 4: Comparar con detalles existentes y detectar modificaciones
        const modificaciones: ModificacionVale[] = [];
        const stocksAfectadosVacunas: StockAfectacion[] = [];
        const stocksAfectadosJeringas: StockAfectacion[] = [];

        // Crear mapa de detalles existentes
        const detallesExistentesMap = new Map();
        valeExistente.detalles.forEach(detalle => {
          const key = `${detalle.establecimientoId}-${detalle.vacunaId}-${detalle.numeroEntregaAdicional || 0}`;
          detallesExistentesMap.set(key, detalle);
        });

        // Procesar movimientos actuales según el tipo de vale
        for (const movimiento of movimientosActuales) {
          const cantidades = this.calcularCantidadTotal(movimiento);

          // Solo procesar entregas base si el vale las incluye
          if ((tipoVale === 'completo' || tipoVale === 'solo_base') && cantidades.programada > 0) {
            const keyBase = `${movimiento.establecimientoId}-${movimiento.vacunaId}-0`;
            const detalleExistente = detallesExistentesMap.get(keyBase);

            if (detalleExistente) {
              // Verificar si cambió la cantidad programada
              if (detalleExistente.cantidadProgramada !== cantidades.programada) {
                modificaciones.push({
                  tipo: 'cantidad_programada_modificada',
                  establecimientoId: movimiento.establecimientoId,
                  establecimientoNombre: movimiento.establecimiento.nombre,
                  vacunaId: movimiento.vacunaId,
                  vacunaNombre: movimiento.vacuna.nombre,
                  cantidadAnterior: detalleExistente.cantidadProgramada,
                  cantidadNueva: cantidades.programada,
                  diferencia: cantidades.programada - detalleExistente.cantidadProgramada,
                  fechaModificacion: new Date()
                });

                // Actualizar detalle existente
                await tx.valeDetalle.update({
                  where: { id: detalleExistente.id },
                    data: { cantidadProgramada: cantidades.programada }
                  });
                }
                detallesExistentesMap.delete(keyBase);
              } else {
                // Nuevo detalle base
                modificaciones.push({
                  tipo: 'establecimiento_agregado',
                  establecimientoId: movimiento.establecimientoId,
                  establecimientoNombre: movimiento.establecimiento.nombre,
                  vacunaId: movimiento.vacunaId,
                  vacunaNombre: movimiento.vacuna.nombre,
                  cantidadAnterior: 0,
                  cantidadNueva: cantidades.programada,
                  diferencia: cantidades.programada,
                  fechaModificacion: new Date()
                });

                await tx.valeDetalle.create({
                  data: {
                    valeEntregaId: valeId,
                    establecimientoId: movimiento.establecimientoId,
                    vacunaId: movimiento.vacunaId,
                    cantidadProgramada: cantidades.programada,
                    cantidadAdicional: 0
                  }
                });
              }
            }

          // Solo procesar entregas adicionales si el vale las incluye
          if ((tipoVale === 'completo' || tipoVale === 'solo_adicionales') && movimiento.entregasAdicionales) {
            console.log(`🔍 [ValeService] Procesando ${movimiento.entregasAdicionales.length} entregas adicionales para movimiento ${movimiento.id}`);

            for (const entregaAdicional of movimiento.entregasAdicionales) {
              const keyAdicional = `${movimiento.establecimientoId}-${movimiento.vacunaId}-${entregaAdicional.numeroEntrega}`;
              const detalleExistente = detallesExistentesMap.get(keyAdicional);

              console.log(`🔍 [ValeService] Procesando entrega adicional #${entregaAdicional.numeroEntrega} (cantidad: ${entregaAdicional.cantidad})`);
              console.log(`🔍 [ValeService] Detalle existente encontrado: ${detalleExistente ? 'SÍ' : 'NO'}`);

              if (detalleExistente) {
                // Verificar si cambió la cantidad adicional
                if (detalleExistente.cantidadAdicional !== entregaAdicional.cantidad) {
                  modificaciones.push({
                    tipo: 'entrega_adicional_modificada',
                    establecimientoId: movimiento.establecimientoId,
                    establecimientoNombre: movimiento.establecimiento.nombre,
                    vacunaId: movimiento.vacunaId,
                    vacunaNombre: movimiento.vacuna.nombre,
                    cantidadAnterior: detalleExistente.cantidadAdicional,
                    cantidadNueva: entregaAdicional.cantidad,
                    diferencia: entregaAdicional.cantidad - detalleExistente.cantidadAdicional,
                    numeroEntregaAdicional: entregaAdicional.numeroEntrega,
                    fechaModificacion: new Date()
                  });

                  console.log(`✅ [ValeService] Actualizando entrega adicional existente #${entregaAdicional.numeroEntrega}: ${detalleExistente.cantidadAdicional} → ${entregaAdicional.cantidad}`);

                  // Actualizar detalle existente
                  await tx.valeDetalle.update({
                    where: { id: detalleExistente.id },
                    data: { cantidadAdicional: entregaAdicional.cantidad }
                  });
                } else {
                  console.log(`ℹ️ [ValeService] Entrega adicional #${entregaAdicional.numeroEntrega} sin cambios (cantidad: ${entregaAdicional.cantidad})`);
                }
                detallesExistentesMap.delete(keyAdicional);
              } else {
                // IMPORTANTE: Esta lógica NO debería ejecutarse durante sincronización de vales existentes
                // porque el filtrado debería prevenir entregas adicionales no originales
                console.warn(`⚠️ [ValeService] ADVERTENCIA: Intento de crear nueva entrega adicional #${entregaAdicional.numeroEntrega} durante sincronización`);
                console.warn(`⚠️ [ValeService] Esto indica un problema en el filtrado de entregas adicionales originales`);

                // Por seguridad, NO crear nuevas entregas adicionales durante sincronización
                // Solo actualizar las que ya existían en el vale original
                console.log(`🚫 [ValeService] BLOQUEADO: No se creará nueva entrega adicional #${entregaAdicional.numeroEntrega} durante sincronización`);
              }
            }
          }
        }

        // PASO 3: Eliminar detalles que ya no existen en movimientos
        for (const detalleObsoleto of Array.from(detallesExistentesMap.values())) {
          modificaciones.push({
            tipo: 'detalle_eliminado',
            establecimientoId: detalleObsoleto.establecimientoId,
            establecimientoNombre: detalleObsoleto.establecimiento.nombre,
            vacunaId: detalleObsoleto.vacunaId,
            vacunaNombre: detalleObsoleto.vacuna.nombre,
            cantidadAnterior: detalleObsoleto.cantidadProgramada + detalleObsoleto.cantidadAdicional,
            cantidadNueva: 0,
            diferencia: -(detalleObsoleto.cantidadProgramada + detalleObsoleto.cantidadAdicional),
            numeroEntregaAdicional: detalleObsoleto.numeroEntregaAdicional,
            fechaModificacion: new Date()
          });

          await tx.valeDetalle.delete({
            where: { id: detalleObsoleto.id }
          });
        }

        // PASO 4: Recalcular totales del vale
        const detallesActualizadosCount = await tx.valeDetalle.aggregate({
          where: { valeEntregaId: valeId },
          _sum: { cantidadProgramada: true, cantidadAdicional: true },
          _count: { establecimientoId: true }
        });

        const totalVacunas = (detallesActualizadosCount._sum.cantidadProgramada || 0) +
                            (detallesActualizadosCount._sum.cantidadAdicional || 0);

        // Contar establecimientos únicos
        const establecimientosUnicos = await tx.valeDetalle.findMany({
          where: { valeEntregaId: valeId },
          select: { establecimientoId: true },
          distinct: ['establecimientoId']
        });

        await tx.valeEntrega.update({
          where: { id: valeId },
          data: {
            totalVacunas,
            totalEstablecimientos: establecimientosUnicos.length,
            updatedAt: new Date()
          }
        });

        // PASO 5: Ajustar stocks si hay diferencias
        if (modificaciones.length > 0) {
          for (const modificacion of modificaciones) {
            if (modificacion.diferencia !== 0) {
              try {
                // Ajustar stock de vacunas
                if (modificacion.diferencia > 0) {
                  // Aumentó la cantidad - reducir más stock
                  const stockVacunas = await this.afectarStockVacunas(
                    tx,
                    modificacion.vacunaId,
                    modificacion.diferencia,
                    valeExistente.numero,
                    usuarioId
                  );
                  stocksAfectadosVacunas.push(...stockVacunas);

                  // Afectar stock de jeringas
                  const stockJeringas = await this.afectarStockJeringas(
                    tx,
                    modificacion.vacunaId,
                    modificacion.diferencia,
                    valeExistente.numero,
                    usuarioId,
                    valeExistente.centroAcopioId
                  );
                  stocksAfectadosJeringas.push(...stockJeringas);
                } else {
                  // Disminuyó la cantidad - restaurar stock
                  await this.restaurarStockVacunas(
                    tx,
                    modificacion.vacunaId,
                    Math.abs(modificacion.diferencia),
                    valeExistente.numero,
                    usuarioId
                  );

                  await this.restaurarStockJeringas(
                    tx,
                    modificacion.vacunaId,
                    Math.abs(modificacion.diferencia),
                    valeExistente.numero,
                    usuarioId,
                    valeExistente.centroAcopioId
                  );
                }
              } catch (stockError) {
                console.error(`Error ajustando stock para ${modificacion.establecimientoNombre}:`, stockError);
              }
            }
          }
        }

        // PASO 6: Obtener vale actualizado
        const valeActualizado = await tx.valeEntrega.findUnique({
          where: { id: valeId },
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
          valeActualizado: valeActualizado as ValeEntregaConRelaciones,
          modificaciones,
          stocksAfectadosVacunas,
          stocksAfectadosJeringas
        };
      }, {
        maxWait: 30000, // 30 segundos máximo de espera
        timeout: 120000, // 120 segundos de timeout (2 minutos)
      });

      console.log(`✅ [ValeService] Vale sincronizado exitosamente. Modificaciones: ${result.modificaciones.length}`);

      return {
        success: true,
        data: {
          valeActualizado: result.valeActualizado,
          modificaciones: result.modificaciones,
          stocksAfectados: {
            vacunas: result.stocksAfectadosVacunas,
            jeringas: result.stocksAfectadosJeringas
          }
        }
      };
    } catch (error) {
      console.error('Error al sincronizar vale con movimientos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al sincronizar vale'
      };
    }
  }

  /**
   * Restaurar stock de vacunas (para cuando disminuye la cantidad en vale)
   */
  private static async restaurarStockVacunas(
    tx: any,
    vacunaId: string,
    cantidad: number,
    valeNumero: string,
    usuarioId: string
  ): Promise<void> {
    // Obtener lotes disponibles ordenados por fecha de vencimiento
    const lotes = await tx.loteVacuna.findMany({
      where: {
        vacunaId,
        estado: { in: ['disponible', 'agotado'] }
      },
      orderBy: { fechaVencimiento: 'asc' }
    });

    let cantidadRestaurar = cantidad;

    for (const lote of lotes) {
      if (cantidadRestaurar <= 0) break;

      // Buscar el último movimiento de salida de este lote para este vale
      const ultimoMovimiento = await tx.kardex.findFirst({
        where: {
          loteId: lote.id,
          tipoMovimiento: TipoMovimientoKardex.salida,
          numeroDocumento: valeNumero
        },
        orderBy: { createdAt: 'desc' }
      });

      if (ultimoMovimiento) {
        const cantidadARestaurar = Math.min(cantidadRestaurar, ultimoMovimiento.cantidad);
        const nuevoSaldo = lote.cantidadActual + cantidadARestaurar;

        // Actualizar lote
        await tx.loteVacuna.update({
          where: { id: lote.id },
          data: {
            cantidadActual: nuevoSaldo,
            estado: nuevoSaldo > 0 ? 'disponible' : 'agotado'
          }
        });

        // Registrar en kardex
        await tx.kardex.create({
          data: {
            tipo: 'vacuna',
            itemId: vacunaId,
            loteId: lote.id,
            tipoMovimiento: TipoMovimientoKardex.ingreso,
            cantidad: cantidadARestaurar,
            saldoAnterior: lote.cantidadActual,
            saldoActual: nuevoSaldo,
            documento: 'VALE_ENTREGA_AJUSTE',
            numeroDocumento: valeNumero,
            observaciones: `Restauración por ajuste de vale ${valeNumero}`,
            usuarioId,
            fechaMovimiento: new Date()
          }
        });

        cantidadRestaurar -= cantidadARestaurar;
      }
    }
  }

  /**
   * Restaurar stock de jeringas (para cuando disminuye la cantidad en vale)
   * Solo restaura si existe configuración de jeringas para la vacuna
   */
  private static async restaurarStockJeringas(
    tx: any,
    vacunaId: string,
    cantidadVacunas: number,
    valeNumero: string,
    usuarioId: string,
    centroAcopioId?: string
  ): Promise<void> {
    console.log(`🔍 [ValeService] Verificando configuración para restaurar jeringas - Vacuna: ${vacunaId}`);

    // Verificar si existe configuración de jeringas para esta vacuna
    const configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
      vacunaId,
      cantidadVacunas,
      centroAcopioId,
      false // NO usar fallback automático
    );

    if (!configResult.success || !configResult.data || configResult.data.length === 0) {
      console.log(`⚠️ [ValeService] No se encontró configuración de jeringas para vacuna ${vacunaId}. No se restaurarán stocks de jeringas.`);
      return; // NO restaurar jeringas si no hay configuración explícita
    }

    console.log(`✅ [ValeService] Configuración encontrada. Restaurando stocks de jeringas para ${configResult.data.length} tipos de jeringas`);

    // Restaurar stocks según la configuración específica
    for (const jeringaConfig of configResult.data) {
      const cantidadARestaurar = jeringaConfig.cantidad;

      console.log(`🔄 [ValeService] Restaurando jeringa: ${jeringaConfig.jeringaId}, cantidad: ${cantidadARestaurar}`);

      // Obtener lotes de esta jeringa específica
      const lotesJeringa = await tx.loteJeringa.findMany({
        where: {
          jeringaId: jeringaConfig.jeringaId,
          estado: { in: ['disponible', 'agotado'] }
        },
        orderBy: { fechaVencimiento: 'asc' }
      });

      let jeringasRestantes = cantidadARestaurar;

      for (const lote of lotesJeringa) {
        if (jeringasRestantes <= 0) break;

        // Buscar el último movimiento de salida de este lote para este vale
        const ultimoMovimiento = await tx.kardex.findFirst({
          where: {
            loteId: lote.id,
            tipoMovimiento: TipoMovimientoKardex.salida,
            numeroDocumento: valeNumero,
            tipo: 'jeringa'
          },
          orderBy: { createdAt: 'desc' }
        });

        if (ultimoMovimiento) {
          const cantidadARestaurarLote = Math.min(jeringasRestantes, ultimoMovimiento.cantidad);
          const nuevoSaldo = lote.cantidadActual + cantidadARestaurarLote;

          // Actualizar lote de jeringas
          await tx.loteJeringa.update({
            where: { id: lote.id },
            data: {
              cantidadActual: nuevoSaldo,
              estado: nuevoSaldo > 0 ? 'disponible' : 'agotado'
            }
          });

          // Registrar en kardex
          await tx.kardex.create({
            data: {
              tipo: 'jeringa',
              itemId: jeringaConfig.jeringaId,
              loteId: lote.id,
              tipoMovimiento: TipoMovimientoKardex.ingreso,
              cantidad: cantidadARestaurarLote,
              saldoAnterior: lote.cantidadActual,
              saldoActual: nuevoSaldo,
              documento: 'VALE_ENTREGA_AJUSTE',
              numeroDocumento: valeNumero,
              observaciones: `Restauración por ajuste de vale ${valeNumero} - Vacuna: ${vacunaId}`,
              usuarioId,
              fechaMovimiento: new Date()
            }
          });

          jeringasRestantes -= cantidadARestaurarLote;
          console.log(`✅ [ValeService] Restaurado lote ${lote.id}: +${cantidadARestaurarLote}, nuevo saldo: ${nuevoSaldo}`);
        }
      }

      if (jeringasRestantes > 0) {
        console.warn(`⚠️ [ValeService] No se pudo restaurar completamente la jeringa ${jeringaConfig.jeringaId}. Faltaron: ${jeringasRestantes}`);
      }
    }
  }

  /**
   * Obtener historial de modificaciones de un vale
   */
  static async obtenerHistorialModificaciones(_valeId: string): Promise<ServiceResult<ModificacionVale[]>> {
    try {
      // Por ahora retornamos un array vacío ya que las modificaciones se calculan en tiempo real
      // En el futuro se podría implementar una tabla de auditoría para persistir el historial
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('Error al obtener historial de modificaciones:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener historial'
      };
    }
  }

  /**
   * Alias para obtenerHistorialModificaciones (para compatibilidad con el controlador)
   */
  static async getModificaciones(valeId: string): Promise<ServiceResult<ModificacionVale[]>> {
    return this.obtenerHistorialModificaciones(valeId);
  }

  /**
   * Obtener tipos de vales ya generados para un período
   */
  static async getTiposValesGenerados(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<string[]>> {
    try {
      // Obtener todos los vales existentes para el período
      const valesExistentes = await prisma.valeEntrega.findMany({
        where: {
          centroAcopioId,
          mes,
          anio
        },
        include: {
          detalles: {
            include: {
              establecimiento: true,
              vacuna: true
            }
          }
        }
      });

      if (valesExistentes.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // Analizar cada vale para determinar su tipo basándose en su contenido
      const tiposGenerados: string[] = [];

      for (const vale of valesExistentes) {
        // Verificar si tiene entregas base (cantidadProgramada > 0)
        const tieneEntregasBase = vale.detalles.some(detalle => detalle.cantidadProgramada > 0);

        // Verificar si tiene entregas adicionales (cantidadAdicional > 0)
        const tieneEntregasAdicionales = vale.detalles.some(detalle => detalle.cantidadAdicional > 0);

        if (tieneEntregasBase && tieneEntregasAdicionales) {
          // Vale completo
          if (!tiposGenerados.includes('completo')) {
            tiposGenerados.push('completo');
          }
        } else if (tieneEntregasBase && !tieneEntregasAdicionales) {
          // Solo entregas base
          if (!tiposGenerados.includes('solo_base')) {
            tiposGenerados.push('solo_base');
          }
        } else if (!tieneEntregasBase && tieneEntregasAdicionales) {
          // Solo entregas adicionales
          if (!tiposGenerados.includes('solo_adicionales')) {
            tiposGenerados.push('solo_adicionales');
          }
        }
      }

      return {
        success: true,
        data: tiposGenerados
      };
    } catch (error) {
      console.error('Error obteniendo tipos de vales generados:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener tipos de vales generados'
      };
    }
  }

  /**
   * Obtener números de entregas adicionales ya generados en vales
   */
  static async getGruposEntregasAdicionalesGenerados(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<number[]>> {
    try {
      // Obtener todos los vales existentes para el período
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

      // Extraer números únicos de entregas adicionales ya generados
      const numerosGenerados = new Set<number>();

      for (const vale of valesExistentes) {
        for (const detalle of vale.detalles) {
          if (detalle.numeroEntregaAdicional) {
            numerosGenerados.add(detalle.numeroEntregaAdicional);
          }
        }
      }

      return {
        success: true,
        data: Array.from(numerosGenerados).sort((a, b) => a - b)
      };
    } catch (error) {
      console.error('Error obteniendo grupos de entregas adicionales generados:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener grupos generados'
      };
    }
  }

  /**
   * Obtener entregas adicionales disponibles para un centro de acopio y período
   */
  static async getEntregasAdicionalesDisponibles(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<any[]>> {
    try {
      // Obtener todas las entregas adicionales para el período y centro de acopio
      const entregasAdicionales = await prisma.entregaAdicional.findMany({
        where: {
          movimientoVacuna: {
            mes,
            anio,
            establecimiento: {
              OR: [
                { id: centroAcopioId }, // El mismo centro de acopio
                { centroAcopioId } // Establecimientos bajo este centro de acopio
              ]
            }
          },
          cantidad: { gt: 0 } // Solo entregas con cantidad mayor a 0
        },
        include: {
          movimientoVacuna: {
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
                  presentacion: true
                }
              }
            }
          }
        },
        orderBy: [
          { movimientoVacuna: { establecimiento: { nombre: 'asc' } } },
          { movimientoVacuna: { vacuna: { nombre: 'asc' } } },
          { numeroEntrega: 'asc' }
        ]
      });

      // Transformar los datos al formato esperado por el frontend
      const entregasFormateadas = entregasAdicionales.map(entrega => ({
        id: entrega.id,
        numeroEntrega: entrega.numeroEntrega,
        cantidad: entrega.cantidad,
        fechaEntrega: entrega.fechaEntrega,
        motivo: entrega.motivo,
        establecimientoId: entrega.movimientoVacuna.establecimientoId,
        establecimientoNombre: entrega.movimientoVacuna.establecimiento.nombre,
        vacunaId: entrega.movimientoVacuna.vacunaId,
        vacunaNombre: entrega.movimientoVacuna.vacuna.nombre
      }));

      return {
        success: true,
        data: entregasFormateadas
      };
    } catch (error) {
      console.error('Error obteniendo entregas adicionales disponibles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener entregas adicionales disponibles'
      };
    }
  }

  /**
   * SINCRONIZACIÓN AUTOMÁTICA EN TIEMPO REAL
   * Se ejecuta automáticamente cuando cambian los movimientos
   */
  static async sincronizarValesAutomaticamente(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    usuarioId: string = 'system-auto-sync'
  ): Promise<ServiceResult<{ valesSincronizados: number; errores: string[] }>> {
    try {
      console.log(`🔄 [ValeService] SINCRONIZACIÓN AUTOMÁTICA iniciada para establecimiento ${establecimientoId}, vacuna ${vacunaId}, ${mes}/${anio}`);

      // Buscar el centro de acopio del establecimiento
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id: establecimientoId },
        select: {
          id: true,
          centroAcopioId: true,
          tipo: true
        }
      });

      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado'
        };
      }

      // Determinar el centro de acopio a sincronizar
      let centroAcopioId: string;
      if (establecimiento.tipo === 'centro_acopio') {
        centroAcopioId = establecimiento.id;
      } else if (establecimiento.centroAcopioId) {
        centroAcopioId = establecimiento.centroAcopioId;
      } else {
        return {
          success: false,
          error: 'No se pudo determinar el centro de acopio'
        };
      }

      // Buscar vales existentes para este centro de acopio y período
      const valesExistentes = await prisma.valeEntrega.findMany({
        where: {
          centroAcopioId,
          mes,
          anio,
          estado: 'generado' // Solo sincronizar vales generados
        },
        select: { id: true, numero: true }
      });

      if (valesExistentes.length === 0) {
        console.log(`ℹ️ [ValeService] No hay vales generados para sincronizar en ${centroAcopioId}, ${mes}/${anio}`);
        return {
          success: true,
          data: { valesSincronizados: 0, errores: [] }
        };
      }

      let valesSincronizados = 0;
      const errores: string[] = [];

      // Sincronizar cada vale encontrado
      for (const vale of valesExistentes) {
        try {
          const resultado = await this.sincronizarValeConMovimientos(vale.id, usuarioId);
          if (resultado.success && resultado.data) {
            const numModificaciones = resultado.data.modificaciones.length;
            if (numModificaciones > 0) {
              valesSincronizados++;
              console.log(`✅ [ValeService] Vale ${vale.numero} sincronizado automáticamente (${numModificaciones} modificaciones)`);
            }
          } else {
            errores.push(`Error en vale ${vale.numero}: ${resultado.error}`);
          }
        } catch (error) {
          errores.push(`Error en vale ${vale.numero}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      console.log(`✅ [ValeService] SINCRONIZACIÓN AUTOMÁTICA completada. Vales sincronizados: ${valesSincronizados}`);

      return {
        success: true,
        data: { valesSincronizados, errores }
      };
    } catch (error) {
      console.error('Error en sincronización automática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en sincronización automática'
      };
    }
  }

  /**
   * TRIGGER AUTOMÁTICO: Se ejecuta cuando se actualiza un movimiento
   */
  static async onMovimientoActualizado(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    usuarioId: string = 'system-trigger'
  ): Promise<void> {
    try {
      console.log(`🔔 [ValeService] TRIGGER: Movimiento actualizado - iniciando sincronización automática`);

      // Ejecutar sincronización automática en segundo plano
      setImmediate(async () => {
        await this.sincronizarValesAutomaticamente(establecimientoId, vacunaId, mes, anio, usuarioId);
      });
    } catch (error) {
      console.error('Error en trigger de sincronización automática:', error);
    }
  }

  /**
   * TRIGGER AUTOMÁTICO: Se ejecuta cuando se crea/actualiza/elimina una entrega adicional
   */
  static async onEntregaAdicionalCambiada(
    movimientoVacunaId: string,
    usuarioId: string = 'system-trigger'
  ): Promise<void> {
    try {
      console.log(`🔔 [ValeService] TRIGGER: Entrega adicional cambiada - iniciando sincronización específica`);

      // Obtener información del movimiento con entregas adicionales
      const movimiento = await prisma.movimientoVacuna.findUnique({
        where: { id: movimientoVacunaId },
        include: {
          establecimiento: true,
          vacuna: true,
          entregasAdicionales: true
        }
      });

      if (movimiento) {
        // Ejecutar sincronización específica para entregas adicionales
        setImmediate(async () => {
          await this.sincronizarValesDeEntregasAdicionales(
            movimiento.establecimientoId,
            movimiento.vacunaId,
            movimiento.mes,
            movimiento.anio,
            usuarioId
          );
        });
      }
    } catch (error) {
      console.error('Error en trigger de entrega adicional:', error);
    }
  }

  /**
   * Sincronizar específicamente los vales que contienen entregas adicionales
   */
  static async sincronizarValesDeEntregasAdicionales(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    usuarioId: string
  ): Promise<ServiceResult<any>> {
    try {
      console.log(`🔄 [ValeService] Sincronizando vales de entregas adicionales para ${establecimientoId}, ${vacunaId}, ${mes}/${anio}`);

      // Obtener el establecimiento para determinar el centro de acopio
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id: establecimientoId },
        select: { id: true, tipo: true, centroAcopioId: true }
      });

      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado'
        };
      }

      // Determinar el centro de acopio
      let centroAcopioId: string;
      if (establecimiento.tipo === 'centro_acopio') {
        centroAcopioId = establecimiento.id;
      } else if (establecimiento.centroAcopioId) {
        centroAcopioId = establecimiento.centroAcopioId;
      } else {
        return {
          success: false,
          error: 'No se pudo determinar el centro de acopio'
        };
      }

      // Buscar vales que contengan entregas adicionales para este establecimiento y vacuna
      const valesConEntregasAdicionales = await prisma.valeEntrega.findMany({
        where: {
          centroAcopioId,
          mes,
          anio,
          estado: 'generado',
          detalles: {
            some: {
              establecimientoId,
              vacunaId,
              cantidadAdicional: { gt: 0 } // Solo vales que tienen entregas adicionales
            }
          }
        },
        select: { id: true, numero: true }
      });

      console.log(`📋 [ValeService] Encontrados ${valesConEntregasAdicionales.length} vales con entregas adicionales para sincronizar`);

      let valesSincronizados = 0;
      const errores: string[] = [];

      // Sincronizar solo los vales que contienen entregas adicionales
      for (const vale of valesConEntregasAdicionales) {
        try {
          console.log(`🔄 [ValeService] Sincronizando vale ${vale.numero} (${vale.id})`);
          const resultado = await this.sincronizarValeConMovimientos(vale.id, usuarioId);
          if (resultado.success) {
            valesSincronizados++;
            console.log(`✅ [ValeService] Vale ${vale.numero} sincronizado exitosamente`);
          } else {
            errores.push(`Error sincronizando vale ${vale.numero}: ${resultado.error}`);
            console.error(`❌ [ValeService] Error sincronizando vale ${vale.numero}:`, resultado.error);
          }
        } catch (error) {
          const errorMsg = `Error sincronizando vale ${vale.numero}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          errores.push(errorMsg);
          console.error(`❌ [ValeService] ${errorMsg}`, error);
        }
      }

      console.log(`🎯 [ValeService] Sincronización de entregas adicionales completada: ${valesSincronizados} vales sincronizados, ${errores.length} errores`);

      return {
        success: true,
        data: { valesSincronizados, errores }
      };
    } catch (error) {
      console.error('Error en sincronización de vales de entregas adicionales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en sincronización de entregas adicionales'
      };
    }
  }
}
