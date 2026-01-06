import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';
import { ValeEntregaConRelaciones, MovimientoParaVale } from './ValeQueryService';
import { ValeStockService, StockAfectacion } from './ValeStockService';
import { ModificacionVale } from './ValeGenerationService';

/**
 * Service for Vale synchronization operations
 * Handles automatic synchronization between vales and movements
 */
export class ValeSyncService {
  
  /**
   * Calculate total vaccine quantity
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
   * Determine vale type based on content
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
      return 'completo';
    }
  }

  /**
   * Get movements with specific filter for synchronization
   */
  private static async obtenerMovimientosParaValeConFiltroEspecifico(
    centroAcopioId: string,
    mes: number,
    anio: number,
    tipoVale: 'completo' | 'solo_base' | 'solo_adicionales' = 'completo',
    numerosEntregasAdicionalesOriginales: number[] = []
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

    if (numerosEntregasAdicionalesOriginales.length > 0) {
      entregasAdicionalesInclude = {
        where: { numeroEntrega: { in: numerosEntregasAdicionalesOriginales } },
        orderBy: { numeroEntrega: 'asc' }
      };
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

    return movimientos as MovimientoParaVale[];
  }

  /**
   * Synchronize existing vale with updated movement data
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
      console.log(`🔄 [ValeSyncService] Iniciando sincronización de vale: ${valeId}`);

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

      if (valeExistente.estado !== 'generado') {
        return {
          success: false,
          error: 'Solo se pueden sincronizar vales en estado "generado"'
        };
      }

      const result = await prisma.$transaction(async (tx) => {
        const tipoVale = ValeSyncService.determinarTipoVale(valeExistente.detalles);
        console.log(`🔍 [ValeSyncService] Vale ${valeExistente.numero} identificado como tipo: ${tipoVale}`);

        const entregasAdicionalesOriginales = new Set<number>();
        valeExistente.detalles.forEach(detalle => {
          if (detalle.numeroEntregaAdicional && detalle.cantidadAdicional > 0) {
            entregasAdicionalesOriginales.add(detalle.numeroEntregaAdicional);
          }
        });

        const movimientosActuales = await ValeSyncService.obtenerMovimientosParaValeConFiltroEspecifico(
          valeExistente.centroAcopioId,
          valeExistente.mes,
          valeExistente.anio,
          tipoVale,
          Array.from(entregasAdicionalesOriginales)
        );

        console.log(`🔍 [ValeSyncService] Entregas adicionales originales en vale: [${Array.from(entregasAdicionalesOriginales).join(', ')}]`);
        console.log(`🔍 [ValeSyncService] Movimientos obtenidos para sincronización: ${movimientosActuales.length}`);

        const modificaciones: ModificacionVale[] = [];
        const stocksAfectadosVacunas: StockAfectacion[] = [];
        const stocksAfectadosJeringas: StockAfectacion[] = [];

        const detallesExistentesMap = new Map();
        valeExistente.detalles.forEach(detalle => {
          const key = `${detalle.establecimientoId}-${detalle.vacunaId}-${detalle.numeroEntregaAdicional || 0}`;
          detallesExistentesMap.set(key, detalle);
        });

        for (const movimiento of movimientosActuales) {
          const cantidades = ValeSyncService.calcularCantidadTotal(movimiento);

          if ((tipoVale === 'completo' || tipoVale === 'solo_base') && cantidades.programada > 0) {
            const keyBase = `${movimiento.establecimientoId}-${movimiento.vacunaId}-0`;
            const detalleExistente = detallesExistentesMap.get(keyBase);

            if (detalleExistente) {
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

                await tx.valeDetalle.update({
                  where: { id: detalleExistente.id },
                  data: { cantidadProgramada: cantidades.programada }
                });
              }
              detallesExistentesMap.delete(keyBase);
            } else {
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

          if ((tipoVale === 'completo' || tipoVale === 'solo_adicionales') && movimiento.entregasAdicionales) {
            console.log(`🔍 [ValeSyncService] Procesando ${movimiento.entregasAdicionales.length} entregas adicionales para movimiento ${movimiento.id}`);

            for (const entregaAdicional of movimiento.entregasAdicionales) {
              const keyAdicional = `${movimiento.establecimientoId}-${movimiento.vacunaId}-${entregaAdicional.numeroEntrega}`;
              const detalleExistente = detallesExistentesMap.get(keyAdicional);

              if (detalleExistente) {
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

                  await tx.valeDetalle.update({
                    where: { id: detalleExistente.id },
                    data: { cantidadAdicional: entregaAdicional.cantidad }
                  });
                }
                detallesExistentesMap.delete(keyAdicional);
              } else {
                console.warn(`⚠️ [ValeSyncService] ADVERTENCIA: Intento de crear nueva entrega adicional #${entregaAdicional.numeroEntrega} durante sincronización`);
                console.log(`🚫 [ValeSyncService] BLOQUEADO: No se creará nueva entrega adicional durante sincronización`);
              }
            }
          }
        }

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

        const detallesActualizadosCount = await tx.valeDetalle.aggregate({
          where: { valeEntregaId: valeId },
          _sum: { cantidadProgramada: true, cantidadAdicional: true },
          _count: { establecimientoId: true }
        });

        const totalVacunas = (detallesActualizadosCount._sum.cantidadProgramada || 0) +
                            (detallesActualizadosCount._sum.cantidadAdicional || 0);

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

        if (modificaciones.length > 0) {
          for (const modificacion of modificaciones) {
            if (modificacion.diferencia !== 0) {
              try {
                if (modificacion.diferencia > 0) {
                  const stockVacunas = await ValeStockService.afectarStockVacunas(
                    tx,
                    modificacion.vacunaId,
                    modificacion.diferencia,
                    valeExistente.numero,
                    usuarioId,
                    modificacion.establecimientoId
                  );
                  stocksAfectadosVacunas.push(...stockVacunas);

                  const stockJeringas = await ValeStockService.afectarStockJeringas(
                    tx,
                    modificacion.vacunaId,
                    modificacion.diferencia,
                    valeExistente.numero,
                    usuarioId,
                    valeExistente.centroAcopioId,
                    modificacion.establecimientoId
                  );
                  stocksAfectadosJeringas.push(...stockJeringas);
                } else {
                  await ValeStockService.restaurarStockVacunas(
                    tx,
                    modificacion.vacunaId,
                    Math.abs(modificacion.diferencia),
                    valeExistente.numero,
                    usuarioId
                  );

                  await ValeStockService.restaurarStockJeringas(
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
        maxWait: 30000,
        timeout: 120000,
      });

      console.log(`✅ [ValeSyncService] Vale sincronizado exitosamente. Modificaciones: ${result.modificaciones.length}`);

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
   * Automatic real-time synchronization
   */
  static async sincronizarValesAutomaticamente(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    usuarioId: string = 'system-auto-sync'
  ): Promise<ServiceResult<{ valesSincronizados: number; errores: string[] }>> {
    try {
      console.log(`🔄 [ValeSyncService] SINCRONIZACIÓN AUTOMÁTICA iniciada para establecimiento ${establecimientoId}, vacuna ${vacunaId}, ${mes}/${anio}`);

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

      let centroAcopioId: string;
      if (establecimiento.centroAcopioId) {
        centroAcopioId = establecimiento.centroAcopioId;
      } else {
        return {
          success: false,
          error: 'No se pudo determinar el centro de acopio'
        };
      }

      const valesExistentes = await prisma.valeEntrega.findMany({
        where: {
          centroAcopioId,
          mes,
          anio,
          estado: 'generado'
        },
        select: { id: true, numero: true }
      });

      if (valesExistentes.length === 0) {
        console.log(`ℹ️ [ValeSyncService] No hay vales generados para sincronizar en ${centroAcopioId}, ${mes}/${anio}`);
        return {
          success: true,
          data: { valesSincronizados: 0, errores: [] }
        };
      }

      let valesSincronizados = 0;
      const errores: string[] = [];

      for (const vale of valesExistentes) {
        try {
          const resultado = await ValeSyncService.sincronizarValeConMovimientos(vale.id, usuarioId);
          if (resultado.success && resultado.data) {
            const numModificaciones = resultado.data.modificaciones.length;
            if (numModificaciones > 0) {
              valesSincronizados++;
              console.log(`✅ [ValeSyncService] Vale ${vale.numero} sincronizado automáticamente (${numModificaciones} modificaciones)`);
            }
          } else {
            errores.push(`Error en vale ${vale.numero}: ${resultado.error}`);
          }
        } catch (error) {
          errores.push(`Error en vale ${vale.numero}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      console.log(`✅ [ValeSyncService] SINCRONIZACIÓN AUTOMÁTICA completada. Vales sincronizados: ${valesSincronizados}`);

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
   * AUTOMATIC TRIGGER: Executes when a movement is updated
   */
  static async onMovimientoActualizado(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    usuarioId: string = 'system-trigger'
  ): Promise<void> {
    try {
      console.log(`🔔 [ValeSyncService] TRIGGER: Movimiento actualizado - iniciando sincronización automática`);

      setImmediate(async () => {
        await ValeSyncService.sincronizarValesAutomaticamente(establecimientoId, vacunaId, mes, anio, usuarioId);
      });
    } catch (error) {
      console.error('Error en trigger de sincronización automática:', error);
    }
  }

  /**
   * AUTOMATIC TRIGGER: Executes when an additional delivery is created/updated/deleted
   */
  static async onEntregaAdicionalCambiada(
    movimientoVacunaId: string,
    usuarioId: string = 'system-trigger'
  ): Promise<void> {
    try {
      console.log(`🔔 [ValeSyncService] TRIGGER: Entrega adicional cambiada - iniciando sincronización específica`);

      const movimiento = await prisma.movimientoVacuna.findUnique({
        where: { id: movimientoVacunaId },
        include: {
          establecimiento: true,
          vacuna: true,
          entregasAdicionales: true
        }
      });

      if (movimiento) {
        setImmediate(async () => {
          await ValeSyncService.sincronizarValesDeEntregasAdicionales(
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
   * Synchronize specifically vales that contain additional deliveries
   */
  static async sincronizarValesDeEntregasAdicionales(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    usuarioId: string
  ): Promise<ServiceResult<any>> {
    try {
      console.log(`🔄 [ValeSyncService] Sincronizando vales de entregas adicionales para ${establecimientoId}, ${vacunaId}, ${mes}/${anio}`);

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

      let centroAcopioId: string;
      if (establecimiento.centroAcopioId) {
        centroAcopioId = establecimiento.centroAcopioId;
      } else {
        return {
          success: false,
          error: 'No se pudo determinar el centro de acopio'
        };
      }

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
              cantidadAdicional: { gt: 0 }
            }
          }
        },
        select: { id: true, numero: true }
      });

      console.log(`📋 [ValeSyncService] Encontrados ${valesConEntregasAdicionales.length} vales con entregas adicionales para sincronizar`);

      let valesSincronizados = 0;
      const errores: string[] = [];

      for (const vale of valesConEntregasAdicionales) {
        try {
          console.log(`🔄 [ValeSyncService] Sincronizando vale ${vale.numero} (${vale.id})`);
          const resultado = await ValeSyncService.sincronizarValeConMovimientos(vale.id, usuarioId);
          if (resultado.success) {
            valesSincronizados++;
            console.log(`✅ [ValeSyncService] Vale ${vale.numero} sincronizado exitosamente`);
          } else {
            errores.push(`Error sincronizando vale ${vale.numero}: ${resultado.error}`);
            console.error(`❌ [ValeSyncService] Error sincronizando vale ${vale.numero}:`, resultado.error);
          }
        } catch (error) {
          const errorMsg = `Error sincronizando vale ${vale.numero}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          errores.push(errorMsg);
          console.error(`❌ [ValeSyncService] ${errorMsg}`, error);
        }
      }

      console.log(`🎯 [ValeSyncService] Sincronización de entregas adicionales completada: ${valesSincronizados} vales sincronizados, ${errores.length} errores`);

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
