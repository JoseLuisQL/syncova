import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { EstadoVale, TipoMovimientoKardex } from '@prisma/client';

/**
 * Interfaces for Vale queries
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

export interface ValesFilters {
  centroAcopioId?: string;
  mes?: number;
  anio?: number;
  estado?: EstadoVale;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MovimientoParaVale {
  id: string;
  establecimientoId: string;
  vacunaId: string;
  mes: number;
  anio: number;
  entrega: number;
  entregaBase: number | null;
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
  entregasAdicionales: Array<{
    id: string;
    numeroEntrega: number;
    cantidad: number;
    fechaEntrega: Date;
    motivo: string | null;
  }>;
}

/**
 * Service for Vale query operations
 * Handles all read operations for vales
 */
export class ValeQueryService {
  
  /**
   * Get vales with filters
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
   * Get vale by ID
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
   * Diagnose vale state for reversal
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

      const movimientosOriginales = await prisma.kardex.findMany({
        where: {
          numeroDocumento: vale.numero,
          documento: 'VALE_ENTREGA',
          tipoMovimiento: TipoMovimientoKardex.salida
        }
      });

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
   * Get types of vales generated for a period (as ServiceResult)
   */
  static async getTiposValesGenerados(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<string[]>> {
    try {
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
        return {
          success: true,
          data: []
        };
      }

      const tiposGeneradosSet = new Set<string>();

      for (const vale of valesExistentes) {
        if (vale.tipoVale) {
          tiposGeneradosSet.add(vale.tipoVale);
        } else {
          const tieneEntregasBase = vale.detalles.some(detalle => detalle.cantidadProgramada > 0);
          const tieneEntregasAdicionales = vale.detalles.some(detalle => detalle.cantidadAdicional > 0);

          if (tieneEntregasBase && tieneEntregasAdicionales) {
            tiposGeneradosSet.add('completo');
          } else if (tieneEntregasBase && !tieneEntregasAdicionales) {
            tiposGeneradosSet.add('solo_base');
          } else if (!tieneEntregasBase && tieneEntregasAdicionales) {
            tiposGeneradosSet.add('solo_adicionales');
          }
        }
      }

      return {
        success: true,
        data: Array.from(tiposGeneradosSet)
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
   * Get additional delivery groups generated (as ServiceResult)
   */
  static async getGruposEntregasAdicionalesGenerados(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<number[]>> {
    try {
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
   * Get available additional deliveries for a collection center and period
   */
  static async getEntregasAdicionalesDisponibles(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ServiceResult<any[]>> {
    try {
      const entregasAdicionales = await prisma.entregaAdicional.findMany({
        where: {
          movimientoVacuna: {
            mes,
            anio,
            establecimiento: {
              OR: [
                { id: centroAcopioId },
                { centroAcopioId }
              ]
            }
          },
          cantidad: { gt: 0 }
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
   * Get modification history for a vale
   */
  static async getModificaciones(_valeId: string): Promise<ServiceResult<any[]>> {
    try {
      // Currently returns empty array as modifications are calculated in real-time
      // In the future, an audit table could be implemented to persist history
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
   * Get movements for vale generation
   */
  static async obtenerMovimientosParaVale(
    centroAcopioId: string,
    mes: number,
    anio: number,
    tipoVale: 'completo' | 'solo_base' | 'solo_adicionales' = 'completo',
    entregasAdicionalesSeleccionadas?: string[],
    gruposEntregasSeleccionados?: number[]
  ): Promise<MovimientoParaVale[]> {
    const whereConditions: Record<string, unknown> = {
      mes,
      anio,
      establecimiento: {
        OR: [
          { id: centroAcopioId },
          { centroAcopioId }
        ]
      }
    };

    switch (tipoVale) {
      case 'solo_base':
        whereConditions['entrega'] = { gt: 0 };
        break;
      case 'solo_adicionales':
        whereConditions['entregasAdicionales'] = { some: {} };
        break;
      case 'completo':
      default:
        whereConditions['OR'] = [
          { entrega: { gt: 0 } },
          { entregasAdicionales: { some: {} } }
        ];
        break;
    }

    // Build entregasAdicionales include dynamically to avoid undefined where clause
    let entregasAdicionalesInclude: Record<string, unknown> = {
      orderBy: { numeroEntrega: 'asc' }
    };

    if (tipoVale === 'solo_adicionales') {
      if (gruposEntregasSeleccionados && gruposEntregasSeleccionados.length > 0) {
        entregasAdicionalesInclude = {
          where: { numeroEntrega: { in: gruposEntregasSeleccionados } },
          orderBy: { numeroEntrega: 'asc' }
        };
      } else if (entregasAdicionalesSeleccionadas) {
        entregasAdicionalesInclude = {
          where: { id: { in: entregasAdicionalesSeleccionadas } },
          orderBy: { numeroEntrega: 'asc' }
        };
      }
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
        entregasAdicionales: entregasAdicionalesInclude
      },
      orderBy: [
        { establecimiento: { nombre: 'asc' } },
        { vacuna: { nombre: 'asc' } }
      ]
    });

    if (tipoVale === 'solo_adicionales') {
      if (gruposEntregasSeleccionados && gruposEntregasSeleccionados.length > 0) {
        return movimientos.filter(mov =>
          mov.entregasAdicionales && mov.entregasAdicionales.some(ea =>
            gruposEntregasSeleccionados.includes(ea.numeroEntrega)
          )
        ) as MovimientoParaVale[];
      } else if (entregasAdicionalesSeleccionadas) {
        return movimientos.filter(mov =>
          mov.entregasAdicionales && mov.entregasAdicionales.length > 0
        ) as MovimientoParaVale[];
      }
    }

    return movimientos as MovimientoParaVale[];
  }
}
