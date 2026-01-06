import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import {
  MovimientosFilters,
  MovimientoConRelaciones,
  MOVIMIENTO_INCLUDE
} from './types';

/**
 * Service for Movimientos query operations
 * Handles all read operations for movimientos
 */
export class MovimientosQueryService {
  /**
   * Get all movimientos with optional filters
   */
  static async getAll(filters?: MovimientosFilters): Promise<ServiceResult<{ 
    movimientos: MovimientoConRelaciones[]; 
    total: number 
  }>> {
    try {
      const {
        establecimientoId,
        vacunaId,
        mes,
        anio,
        centroAcopioId,
        search,
        page = 1,
        limit = 1000
      } = filters || {};

      console.log('🔍 MovimientosQueryService.getAll - Filtros recibidos:', {
        establecimientoId,
        vacunaId,
        mes,
        anio,
        centroAcopioId,
        search,
        page,
        limit
      });

      const where: any = {};

      if (establecimientoId) {
        where.establecimientoId = establecimientoId;
      }

      if (vacunaId) {
        where.vacunaId = vacunaId;
      }

      if (mes) {
        where.mes = mes;
      }

      if (anio) {
        where.anio = anio;
      }

      if (centroAcopioId && centroAcopioId !== 'todos') {
        where.establecimiento = {
          centroAcopioId: centroAcopioId
        };
        console.log('🏥 Aplicando filtro por centro de acopio específico:', centroAcopioId);
      } else {
        console.log('🏥 Aplicando filtro para todos los centros (sin filtro adicional)');
      }

      if (search) {
        const searchConditions = [
          {
            establecimiento: {
              ...where.establecimiento,
              nombre: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            vacuna: {
              nombre: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            observaciones: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ];

        where.OR = searchConditions;
        console.log('🔍 Aplicando búsqueda por texto:', search);
      }

      console.log('📋 Condiciones de filtro construidas:', JSON.stringify(where, null, 2));

      const shouldPaginate = !mes || !anio || (search && search.length > 0);

      console.log(`🔍 Evaluando paginación:`);
      console.log(`   - mes: ${mes} (!mes = ${!mes})`);
      console.log(`   - anio: ${anio} (!anio = ${!anio})`);
      console.log(`   - search: ${search} (search && search.length > 0 = ${search && search.length > 0})`);
      console.log(`   - shouldPaginate: ${shouldPaginate}`);

      const queryOptions: any = {
        where,
        include: MOVIMIENTO_INCLUDE,
        orderBy: [
          { anio: 'desc' },
          { mes: 'desc' },
          { establecimiento: { nombre: 'asc' } }
        ]
      };

      if (shouldPaginate) {
        const offset = (page - 1) * limit;
        queryOptions.skip = offset;
        queryOptions.take = limit;
        console.log(`📄 Aplicando paginación: offset=${offset}, limit=${limit}`);
      } else {
        console.log(`📄 Cargando TODOS los movimientos sin paginación para mes=${mes}, año=${anio}`);
      }

      const [movimientos, total] = await Promise.all([
        prisma.movimientoVacuna.findMany(queryOptions),
        prisma.movimientoVacuna.count({ where })
      ]);

      console.log(`✅ MovimientosQueryService.getAll - Resultados: ${movimientos.length} movimientos de ${total} totales`);

      const establecimientosUnicos = [...new Set(movimientos.map(m => (m as any).establecimiento?.nombre || 'Sin nombre'))];
      console.log(`🏥 Establecimientos con movimientos: ${establecimientosUnicos.length}`, establecimientosUnicos);

      // Enriquecer movimientos con información de vales generados
      const movimientosEnriquecidos = await this.enriquecerConInfoVales(movimientos as any[], mes, anio, centroAcopioId);

      return {
        success: true,
        data: {
          movimientos: movimientosEnriquecidos as MovimientoConRelaciones[],
          total
        }
      };
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener movimientos'
      };
    }
  }

  /**
   * Get movimiento by ID
   */
  static async getById(id: string): Promise<ServiceResult<MovimientoConRelaciones>> {
    try {
      const movimiento = await prisma.movimientoVacuna.findUnique({
        where: { id },
        include: MOVIMIENTO_INCLUDE
      });

      if (!movimiento) {
        return {
          success: false,
          error: 'Movimiento no encontrado'
        };
      }

      return {
        success: true,
        data: movimiento as MovimientoConRelaciones
      };
    } catch (error) {
      console.error('Error al obtener movimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener movimiento'
      };
    }
  }

  /**
   * Get estadisticas
   */
  static async getEstadisticas(anio?: number): Promise<ServiceResult<any>> {
    try {
      const currentYear = anio || new Date().getFullYear();

      const movimientos = await prisma.movimientoVacuna.findMany({
        where: { anio: currentYear },
        include: {
          establecimiento: {
            select: { id: true, nombre: true }
          },
          vacuna: {
            select: { id: true, nombre: true }
          }
        }
      });

      const totalMovimientos = movimientos.length;
      const establecimientosUnicos = new Set(movimientos.map(m => m.establecimientoId)).size;
      const vacunasUnicas = new Set(movimientos.map(m => m.vacunaId)).size;

      const entregasTotales = movimientos.reduce((sum, m) => sum + m.entrega, 0);
      const salidasTotales = movimientos.reduce((sum, m) => sum + m.salida, 0);
      const ingresosTotales = movimientos.reduce((sum, m) => sum + m.transIngreso, 0);

      const porMes: { [key: number]: number } = {};
      for (let mes = 1; mes <= 12; mes++) {
        porMes[mes] = movimientos.filter(m => m.mes === mes).reduce((sum, m) => sum + m.entrega, 0);
      }

      return {
        success: true,
        data: {
          anio: currentYear,
          totalMovimientos,
          establecimientosUnicos,
          vacunasUnicas,
          entregasTotales,
          salidasTotales,
          ingresosTotales,
          entregas_por_mes: porMes
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
   * Get stock disponible
   */
  static async getStockDisponible(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<{
    saldoAnterior: number;
    ingresos: number;
    salidas: number;
    entregas: number;
    saldoFinal: number;
    stockDisponible: number;
  }>> {
    try {
      console.log(`📊 [MovimientosQueryService] Calculando stock disponible para:`);
      console.log(`   - Establecimiento: ${establecimientoId}`);
      console.log(`   - Vacuna: ${vacunaId}`);
      console.log(`   - Período: ${mes}/${anio}`);

      const movimiento = await prisma.movimientoVacuna.findFirst({
        where: {
          establecimientoId,
          vacunaId,
          mes,
          anio
        },
        include: {
          entregasAdicionales: true
        }
      });

      if (!movimiento) {
        console.log(`⚠️ [MovimientosQueryService] No se encontró movimiento para el período especificado`);

        const movimientoAnterior = await this.obtenerMovimientoMesAnterior(
          establecimientoId,
          vacunaId,
          mes,
          anio
        );

        if (movimientoAnterior) {
          const saldoFinalAnterior = this.calcularSaldoFinalMovimiento(movimientoAnterior);
          return {
            success: true,
            data: {
              saldoAnterior: saldoFinalAnterior,
              ingresos: 0,
              salidas: 0,
              entregas: 0,
              saldoFinal: saldoFinalAnterior,
              stockDisponible: saldoFinalAnterior
            }
          };
        }

        return {
          success: true,
          data: {
            saldoAnterior: 0,
            ingresos: 0,
            salidas: 0,
            entregas: 0,
            saldoFinal: 0,
            stockDisponible: 0
          }
        };
      }

      const entregasAdicionalesTotal = movimiento.entregasAdicionales?.reduce(
        (sum, ea) => sum + ea.cantidad,
        0
      ) || 0;

      const saldoAnterior = movimiento.saldoAnterior;
      const ingresos = movimiento.transIngreso;
      const salidas = movimiento.salida + movimiento.transSalida;
      const entregas = movimiento.entrega + entregasAdicionalesTotal;
      const saldoFinal = saldoAnterior + ingresos - salidas - entregas;
      const stockDisponible = saldoFinal;

      console.log(`📈 [MovimientosQueryService] Stock calculado:`);
      console.log(`   - Saldo anterior: ${saldoAnterior}`);
      console.log(`   - Ingresos: ${ingresos}`);
      console.log(`   - Salidas: ${salidas}`);
      console.log(`   - Entregas (base + adicionales): ${entregas}`);
      console.log(`   - Saldo final: ${saldoFinal}`);

      return {
        success: true,
        data: {
          saldoAnterior,
          ingresos,
          salidas,
          entregas,
          saldoFinal,
          stockDisponible
        }
      };
    } catch (error) {
      console.error('Error al obtener stock disponible:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener stock disponible'
      };
    }
  }

  /**
   * Get movimiento from previous month
   */
  private static async obtenerMovimientoMesAnterior(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ) {
    let mesAnterior = mes - 1;
    let anioAnterior = anio;

    if (mesAnterior < 1) {
      mesAnterior = 12;
      anioAnterior = anio - 1;
    }

    return prisma.movimientoVacuna.findFirst({
      where: {
        establecimientoId,
        vacunaId,
        mes: mesAnterior,
        anio: anioAnterior
      },
      include: {
        entregasAdicionales: true
      }
    });
  }

  /**
   * Calculate final balance for a movimiento
   */
  private static calcularSaldoFinalMovimiento(movimiento: any): number {
    const entregasAdicionalesTotal = movimiento.entregasAdicionales?.reduce(
      (sum: number, ea: any) => sum + ea.cantidad,
      0
    ) || 0;

    return movimiento.saldoAnterior +
           movimiento.transIngreso -
           movimiento.salida -
           movimiento.transSalida -
           movimiento.entrega -
           entregasAdicionalesTotal;
  }

  /**
   * Obtener años disponibles con movimientos registrados
   */
  static async getAniosDisponibles(): Promise<ServiceResult<number[]>> {
    try {
      const currentYear = new Date().getFullYear();
      
      // Obtener años únicos de movimientos existentes
      const aniosConMovimientos = await prisma.movimientoVacuna.findMany({
        select: {
          anio: true
        },
        distinct: ['anio'],
        orderBy: {
          anio: 'asc'
        }
      });

      const aniosSet = new Set<number>();
      
      // Agregar años con movimientos
      aniosConMovimientos.forEach(m => aniosSet.add(m.anio));
      
      // Siempre incluir año actual y siguiente
      aniosSet.add(currentYear);
      aniosSet.add(currentYear + 1);

      // Convertir a array y ordenar
      const anios = Array.from(aniosSet).sort((a, b) => a - b);

      return {
        success: true,
        data: anios
      };
    } catch (error) {
      console.error('Error al obtener años disponibles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener años disponibles'
      };
    }
  }

  /**
   * Enriquece los movimientos con información sobre vales generados
   * Verifica si la entrega base y/o las entregas adicionales ya tienen vale
   */
  private static async enriquecerConInfoVales(
    movimientos: any[],
    mes?: number,
    anio?: number,
    centroAcopioId?: string
  ): Promise<any[]> {
    if (!mes || !anio || movimientos.length === 0) {
      return movimientos;
    }

    try {
      // Obtener todos los vales del período (sin filtrar por centro si es "todos")
      const whereVales: any = { mes, anio };
      if (centroAcopioId && centroAcopioId !== 'todos') {
        whereVales.centroAcopioId = centroAcopioId;
      }

      console.log(`🔍 [enriquecerConInfoVales] Buscando vales para mes=${mes}, anio=${anio}, centroAcopioId=${centroAcopioId || 'todos'}`);

      const valesDelPeriodo = await prisma.valeEntrega.findMany({
        where: whereVales,
        select: {
          id: true,
          numero: true,
          tipoVale: true,
          centroAcopioId: true,
          detalles: {
            select: {
              establecimientoId: true,
              vacunaId: true,
              cantidadProgramada: true,
              cantidadAdicional: true,
              numeroEntregaAdicional: true
            }
          }
        }
      });

      console.log(`🔍 [enriquecerConInfoVales] Vales encontrados: ${valesDelPeriodo.length}`);

      if (valesDelPeriodo.length === 0) {
        return movimientos;
      }

      // Crear mapa de entregas base con vale: key = "establecimientoId-vacunaId"
      const entregasBaseConVale = new Map<string, string>();
      // Crear mapa de entregas adicionales con vale: key = "establecimientoId-vacunaId-numeroEntrega"
      const entregasAdicionalesConVale = new Map<string, string>();

      for (const vale of valesDelPeriodo) {
        for (const detalle of vale.detalles) {
          // Entrega base: tiene cantidadProgramada > 0 y NO tiene numeroEntregaAdicional
          if (detalle.cantidadProgramada > 0 && (detalle.numeroEntregaAdicional === null || detalle.numeroEntregaAdicional === 0)) {
            const key = `${detalle.establecimientoId}-${detalle.vacunaId}`;
            entregasBaseConVale.set(key, vale.numero);
          }
          // Entrega adicional: tiene cantidadAdicional > 0 y tiene numeroEntregaAdicional
          if (detalle.cantidadAdicional > 0 && detalle.numeroEntregaAdicional && detalle.numeroEntregaAdicional > 0) {
            const key = `${detalle.establecimientoId}-${detalle.vacunaId}-${detalle.numeroEntregaAdicional}`;
            entregasAdicionalesConVale.set(key, vale.numero);
          }
        }
      }

      console.log(`🔍 [enriquecerConInfoVales] Entregas base con vale: ${entregasBaseConVale.size}, Entregas adicionales con vale: ${entregasAdicionalesConVale.size}`);

      // Enriquecer cada movimiento
      return movimientos.map(mov => {
        const keyBase = `${mov.establecimientoId}-${mov.vacunaId}`;
        const valeNumeroBase = entregasBaseConVale.get(keyBase);
        
        const entregasAdicionalesEnriquecidas = mov.entregasAdicionales?.map((ea: any) => {
          const keyAdicional = `${mov.establecimientoId}-${mov.vacunaId}-${ea.numeroEntrega}`;
          const valeNumero = entregasAdicionalesConVale.get(keyAdicional);
          return {
            ...ea,
            tieneValeGenerado: !!valeNumero,
            valeNumero: valeNumero || null
          };
        }) || [];

        return {
          ...mov,
          entregaBaseTieneVale: !!valeNumeroBase,
          valeNumeroEntregaBase: valeNumeroBase || null,
          entregasAdicionales: entregasAdicionalesEnriquecidas
        };
      });
    } catch (error) {
      console.error('Error al enriquecer movimientos con info de vales:', error);
      return movimientos;
    }
  }
}
