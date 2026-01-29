import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';

/**
 * Interface for establishment pending voucher info
 */
export interface EstablecimientoPendiente {
  id: string;
  nombre: string;
  codigo: string;
  tipoEntregaPendiente: 'base' | 'adicional' | 'ambos';
  cantidadEntregaBase: number;
  entregasAdicionalesPendientes: number;
  totalCantidadPendiente: number;
}

/**
 * Interface for grouped establishments by collection center
 */
export interface CentroAcopioConPendientes {
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
  };
  establecimientos: EstablecimientoPendiente[];
  totalPendientes: number;
}

/**
 * Interface for voucher progress response
 */
export interface ProgresoValesResponse {
  totalEstablecimientosConEntregas: number;
  establecimientosConValeCompleto: number;
  porcentajeProgreso: number;
  estado: 'sin_vales' | 'en_progreso' | 'completo';
  totalEntregas: number;
  establecimientosPendientes: CentroAcopioConPendientes[];
}

/**
 * Service for calculating voucher generation progress
 */
export class MovimientosProgresoService {
  /**
   * Get voucher generation progress for a specific vaccine and period
   */
  static async getProgresoVales(
    vacunaId: string,
    mes: number,
    anio: number,
    centroAcopioId?: string
  ): Promise<ServiceResult<ProgresoValesResponse>> {
    try {
      // Aplicar desplazamiento de +1 mes (igual que MovimientosQueryService)
      // El usuario selecciona un mes, pero los datos reales están en el mes siguiente
      let mesBusqueda = mes + 1;
      let anioBusqueda = anio;
      if (mesBusqueda > 12) {
        mesBusqueda = 1;
        anioBusqueda++;
      }

      console.log(`📅 [ProgresoVales] Usuario seleccionó ${mes}/${anio}, buscando en ${mesBusqueda}/${anioBusqueda}`);
      console.log(`🔍 [ProgresoVales] centroAcopioId: ${centroAcopioId || 'todos'}, vacunaId: ${vacunaId}`);

      // Build where clause for movements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereMovimientos: Record<string, unknown> = {
        vacunaId,
        mes: mesBusqueda,
        anio: anioBusqueda,
        OR: [
          { entrega: { gt: 0 } },
          { entregasAdicionales: { some: { cantidad: { gt: 0 } } } }
        ]
      };

      // If centroAcopioId is provided, filter by it
      if (centroAcopioId && centroAcopioId !== 'todos') {
        whereMovimientos.establecimiento = {
          centroAcopioId
        };
      }

      // Get all movements with deliveries for this vaccine/period
      const movimientos = await prisma.movimientoVacuna.findMany({
        where: whereMovimientos,
        include: {
          establecimiento: {
            include: {
              centroAcopio: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true
                }
              }
            }
          },
          entregasAdicionales: {
            where: { cantidad: { gt: 0 } },
            select: {
              id: true,
              numeroEntrega: true,
              cantidad: true
            }
          }
        }
      });

      if (movimientos.length === 0) {
        console.log(`⚠️ [ProgresoVales] No se encontraron movimientos con entregas`);
        return {
          success: true,
          data: {
            totalEstablecimientosConEntregas: 0,
            establecimientosConValeCompleto: 0,
            porcentajeProgreso: 0,
            estado: 'sin_vales',
            totalEntregas: 0,
            establecimientosPendientes: []
          }
        };
      }

      console.log(`📊 [ProgresoVales] Movimientos encontrados: ${movimientos.length}`);

      // Get all voucher details for this period and vaccine
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereValeDetalles: Record<string, unknown> = {
        vacunaId,
        valeEntrega: {
          mes: mesBusqueda,
          anio: anioBusqueda
        }
      };

      // If centroAcopioId is provided, filter vales by the parent vale's centroAcopioId
      if (centroAcopioId && centroAcopioId !== 'todos') {
        whereValeDetalles.valeEntrega = {
          mes: mesBusqueda,
          anio: anioBusqueda,
          centroAcopioId
        };
      }

      const valeDetalles = await prisma.valeDetalle.findMany({
        where: whereValeDetalles,
        select: {
          establecimientoId: true,
          cantidadProgramada: true,
          cantidadAdicional: true,
          numeroEntregaAdicional: true
        }
      });

      console.log(`📋 [ProgresoVales] ValeDetalles encontrados: ${valeDetalles.length}`);

      // Create maps for quick lookup
      const valesBaseByEstablecimiento = new Map<string, number>();
      const valesAdicionalesByEstablecimiento = new Map<string, Set<number>>();

      for (const detalle of valeDetalles) {
        // Base delivery vouchers
        if (detalle.cantidadProgramada > 0) {
          valesBaseByEstablecimiento.set(
            detalle.establecimientoId,
            (valesBaseByEstablecimiento.get(detalle.establecimientoId) || 0) + detalle.cantidadProgramada
          );
        }
        // Additional delivery vouchers - include those with cantidadAdicional > 0
        // Note: numeroEntregaAdicional can be null for "completo" type vales that include all deliveries
        if (detalle.cantidadAdicional > 0) {
          if (!valesAdicionalesByEstablecimiento.has(detalle.establecimientoId)) {
            valesAdicionalesByEstablecimiento.set(detalle.establecimientoId, new Set());
          }
          // If numeroEntregaAdicional is set, add it to the set
          // If null, it means all additional deliveries are covered (type "completo")
          if (detalle.numeroEntregaAdicional) {
            valesAdicionalesByEstablecimiento.get(detalle.establecimientoId)!.add(detalle.numeroEntregaAdicional);
          } else {
            // Mark with -1 to indicate "all additional deliveries covered"
            valesAdicionalesByEstablecimiento.get(detalle.establecimientoId)!.add(-1);
          }
        }
      }

      console.log(`📋 [ProgresoVales] Establecimientos con vale base: ${valesBaseByEstablecimiento.size}`);
      console.log(`📋 [ProgresoVales] Establecimientos con vale adicional: ${valesAdicionalesByEstablecimiento.size}`);

      // Analyze each movement to determine pending status
      const pendientesPorCentro = new Map<string, {
        centroAcopio: { id: string; nombre: string; codigo: string };
        establecimientos: EstablecimientoPendiente[];
      }>();

      let establecimientosConVale = 0;
      let totalEntregas = 0;

      for (const mov of movimientos) {
        const entregasAdicionales = mov.entregasAdicionales || [];
        const tieneEntregasAdicionales = entregasAdicionales.length > 0;

        // Determinar el valor real de la entrega base
        // Si hay entregas adicionales, entregaBase contiene el valor real (0 o null significa sin entrega base)
        // Si no hay entregas adicionales, entrega es la entrega base
        let valorEntregaBase: number;
        if (tieneEntregasAdicionales) {
          // Cuando hay adicionales, entregaBase guarda el valor original de la base
          // Si es null o 0, significa que no hay entrega base
          valorEntregaBase = mov.entregaBase ?? 0;
        } else {
          // Sin adicionales, entrega es la entrega base
          valorEntregaBase = mov.entrega;
        }

        const tieneEntregaBase = valorEntregaBase > 0;

        // Calcular total de entregas para estadisticas
        totalEntregas += valorEntregaBase;
        for (const ea of entregasAdicionales) {
          totalEntregas += ea.cantidad;
        }

        // Check if base delivery has voucher
        const tieneValeBase = valesBaseByEstablecimiento.has(mov.establecimientoId) &&
          valesBaseByEstablecimiento.get(mov.establecimientoId)! > 0;

        // Check which additional deliveries have vouchers
        const valesAdicionalesSet = valesAdicionalesByEstablecimiento.get(mov.establecimientoId) || new Set();
        
        // If -1 is in the set, it means all additional deliveries are covered by a "completo" type vale
        const todasAdicionalesCubiertas = valesAdicionalesSet.has(-1);
        
        const entregasAdicionalesSinVale = todasAdicionalesCubiertas 
          ? [] // All covered
          : entregasAdicionales.filter(ea => !valesAdicionalesSet.has(ea.numeroEntrega));

        // Determine pending status
        const faltaValeBase = tieneEntregaBase && !tieneValeBase;
        const faltaValesAdicionales = entregasAdicionalesSinVale.length > 0;

        // Debug log for pending establishments
        if (faltaValeBase || faltaValesAdicionales) {
          console.log(`   ❌ PENDIENTE: ${mov.establecimiento.nombre}`);
          console.log(`      - valorEntregaBase: ${valorEntregaBase} (entrega: ${mov.entrega}, entregaBase: ${mov.entregaBase})`);
          console.log(`      - tieneValeBase: ${tieneValeBase}, faltaValeBase: ${faltaValeBase}`);
          console.log(`      - entregas adicionales: ${entregasAdicionales.length}, sinVale: ${entregasAdicionalesSinVale.length}`);
        }

        if (!faltaValeBase && !faltaValesAdicionales) {
          // This establishment has all vouchers generated
          establecimientosConVale++;
          continue;
        }

        // Determine type of pending
        let tipoEntregaPendiente: 'base' | 'adicional' | 'ambos';
        if (faltaValeBase && faltaValesAdicionales) {
          tipoEntregaPendiente = 'ambos';
        } else if (faltaValeBase) {
          tipoEntregaPendiente = 'base';
        } else {
          tipoEntregaPendiente = 'adicional';
        }

        const centroAcopio = mov.establecimiento.centroAcopio;
        if (!centroAcopio) continue;

        // Add to pending list
        if (!pendientesPorCentro.has(centroAcopio.id)) {
          pendientesPorCentro.set(centroAcopio.id, {
            centroAcopio: {
              id: centroAcopio.id,
              nombre: centroAcopio.nombre,
              codigo: centroAcopio.codigo || ''
            },
            establecimientos: []
          });
        }

        const cantidadBasePendiente = faltaValeBase ? valorEntregaBase : 0;
        const cantidadAdicionalPendiente = entregasAdicionalesSinVale.reduce((sum, ea) => sum + ea.cantidad, 0);

        pendientesPorCentro.get(centroAcopio.id)!.establecimientos.push({
          id: mov.establecimiento.id,
          nombre: mov.establecimiento.nombre,
          codigo: mov.establecimiento.codigo || '',
          tipoEntregaPendiente,
          cantidadEntregaBase: cantidadBasePendiente,
          entregasAdicionalesPendientes: entregasAdicionalesSinVale.length,
          totalCantidadPendiente: cantidadBasePendiente + cantidadAdicionalPendiente
        });
      }

      // Convert map to array and sort
      const establecimientosPendientes: CentroAcopioConPendientes[] = Array.from(pendientesPorCentro.values())
        .map(grupo => ({
          ...grupo,
          totalPendientes: grupo.establecimientos.length,
          establecimientos: grupo.establecimientos.sort((a, b) => a.nombre.localeCompare(b.nombre))
        }))
        .sort((a, b) => a.centroAcopio.nombre.localeCompare(b.centroAcopio.nombre));

      // Calculate progress
      const totalEstablecimientosConEntregas = movimientos.length;
      const porcentajeProgreso = totalEstablecimientosConEntregas > 0
        ? Math.round((establecimientosConVale / totalEstablecimientosConEntregas) * 100)
        : 0;

      // Determine state
      let estado: 'sin_vales' | 'en_progreso' | 'completo';
      if (porcentajeProgreso === 0) {
        estado = 'sin_vales';
      } else if (porcentajeProgreso === 100) {
        estado = 'completo';
      } else {
        estado = 'en_progreso';
      }

      return {
        success: true,
        data: {
          totalEstablecimientosConEntregas,
          establecimientosConValeCompleto: establecimientosConVale,
          porcentajeProgreso,
          estado,
          totalEntregas,
          establecimientosPendientes
        }
      };
    } catch (error) {
      console.error('Error calculating voucher progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error calculating voucher progress'
      };
    }
  }
}
