import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';

/**
 * Interfaces para el Dashboard
 */
export interface DashboardStats {
  totalVacunas: number;
  totalEstablecimientos: number;
  totalUsuarios: number;
  alertasPendientes: number;
  stockCritico: number;
  vencimientoProximo: number;
  entregasMes: number;
  movimientosUltimoMes: number;
  ultimaActualizacion: Date;
}

export interface MovimientosMensuales {
  mes: string;
  entregas: number;
  recepciones: number;
  transferencias: number;
}

export interface StockPorVacuna {
  vacunaId: string;
  vacunaNombre: string;
  stockTotal: number;
  porcentaje: number;
  color: string;
}

export interface CentroAcopioStatus {
  id: string;
  nombre: string;
  establecimientos: number;
  stockTotal: number;
  alertas: number;
  estado: 'activo' | 'alerta' | 'critico';
}

export interface AlertaReciente {
  id: string;
  tipo: string;
  nivel: 'info' | 'warning' | 'error' | 'success';
  mensaje: string;
  fechaCreacion: Date;
  establecimiento?: string;
}

export interface ActividadReciente {
  id: string;
  tipo: 'vale_generado' | 'lote_recibido' | 'usuario_conectado' | 'movimiento_registrado';
  descripcion: string;
  fecha: Date;
  usuario?: string;
  establecimiento?: string;
}

export interface DashboardData {
  estadisticas: DashboardStats;
  movimientosMensuales: MovimientosMensuales[];
  stockPorVacuna: StockPorVacuna[];
  centrosAcopio: CentroAcopioStatus[];
  alertasRecientes: AlertaReciente[];
  actividadReciente: ActividadReciente[];
}

/**
 * Servicio para el Dashboard con datos en tiempo real
 */
export class DashboardService {
  /**
   * Obtener todas las estadísticas del dashboard
   */
  static async getDashboardData(scopeCentroAcopioId?: string): Promise<ServiceResult<DashboardData>> {
    try {
      console.log('🔄 Obteniendo datos completos del dashboard...');

      // Ejecutar todas las consultas en paralelo para mejor rendimiento
      const [
        estadisticas,
        movimientosMensuales,
        stockPorVacuna,
        centrosAcopio,
        alertasRecientes,
        actividadReciente
      ] = await Promise.all([
        this.getEstadisticasGenerales(scopeCentroAcopioId),
        this.getMovimientosMensuales(scopeCentroAcopioId),
        this.getStockPorVacuna(scopeCentroAcopioId),
        this.getCentrosAcopioStatus(1, 5, scopeCentroAcopioId), // Primera página, 5 elementos
        this.getAlertasRecientes(1, 3, scopeCentroAcopioId),    // Primera página, 3 elementos
        this.getActividadReciente(1, 5, scopeCentroAcopioId)    // Primera página, 5 elementos
      ]);

      const dashboardData: DashboardData = {
        estadisticas: estadisticas.success ? estadisticas.data! : this.getEstadisticasDefault(),
        movimientosMensuales: movimientosMensuales.success ? movimientosMensuales.data! : [],
        stockPorVacuna: stockPorVacuna.success ? stockPorVacuna.data! : [],
        centrosAcopio: centrosAcopio.success ? centrosAcopio.data!.data : [],
        alertasRecientes: alertasRecientes.success ? alertasRecientes.data!.data : [],
        actividadReciente: actividadReciente.success ? actividadReciente.data!.data : []
      };

      console.log('✅ Datos del dashboard obtenidos exitosamente');
      return {
        success: true,
        data: dashboardData
      };
    } catch (error) {
      console.error('❌ Error al obtener datos del dashboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener datos del dashboard'
      };
    }
  }

  /**
   * Obtener estadísticas generales del sistema
   */
  static async getEstadisticasGenerales(scopeCentroAcopioId?: string): Promise<ServiceResult<DashboardStats>> {
    try {
      console.log('📊 Calculando estadísticas generales...');

      const fechaActual = new Date();
      const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
      const fechaLimiteVencimiento = new Date();
      fechaLimiteVencimiento.setDate(fechaLimiteVencimiento.getDate() + 30);

      // Ejecutar consultas en paralelo
      const [
        totalVacunas,
        totalEstablecimientos,
        totalUsuarios,
        alertasPendientes,
        stockCriticoData,
        vencimientoProximoData,
        entregasMesData,
        movimientosUltimoMes
      ] = await Promise.all([
        // Total de vacunas activas
        scopeCentroAcopioId
          ? prisma.movimientoVacuna.groupBy({
              by: ['vacunaId'],
              where: {
                establecimiento: {
                  centroAcopioId: scopeCentroAcopioId,
                },
              },
            }).then((rows) => rows.length)
          : prisma.vacuna.count({
              where: { estado: 'activo' }
            }),

        // Total de establecimientos activos
        prisma.establecimiento.count({
          where: {
            estado: 'activo',
            ...(scopeCentroAcopioId ? { centroAcopioId: scopeCentroAcopioId } : {}),
          }
        }),

        // Total de usuarios activos
        prisma.usuario.count({
          where: {
            estado: 'activo',
            ...(scopeCentroAcopioId ? { centroAcopioId: scopeCentroAcopioId } : {}),
          }
        }),

        // Alertas pendientes (no leídas)
        prisma.alerta.count({
          where: {
            leida: false,
            ...(scopeCentroAcopioId
              ? {
                  usuario: {
                    centroAcopioId: scopeCentroAcopioId,
                  },
                }
              : {}),
          }
        }),

        // Stock crítico (lotes con cantidad baja)
        scopeCentroAcopioId
          ? Promise.resolve([{ count: BigInt(0) }])
          : prisma.$queryRaw<Array<{ count: bigint }>>`
              SELECT COUNT(*) as count
              FROM lotes_vacunas lv
              JOIN vacunas v ON lv.vacuna_id = v.id
              WHERE lv.estado = 'disponible' 
                AND v.estado = 'activo'
                AND lv.cantidad_actual <= (lv.cantidad_inicial * 0.2)
            `,

        // Lotes próximos a vencer
        scopeCentroAcopioId
          ? Promise.resolve(0)
          : prisma.loteVacuna.count({
              where: {
                estado: 'disponible',
                fechaVencimiento: {
                  lte: fechaLimiteVencimiento,
                  gte: fechaActual
                }
              }
            }),

        // Entregas del mes actual
        prisma.movimientoVacuna.aggregate({
          where: {
            anio: fechaActual.getFullYear(),
            mes: fechaActual.getMonth() + 1,
            entrega: { gt: 0 },
            ...(scopeCentroAcopioId
              ? {
                  establecimiento: {
                    centroAcopioId: scopeCentroAcopioId,
                  },
                }
              : {}),
          },
          _sum: { entrega: true }
        }),

        // Movimientos del último mes
        prisma.kardex.count({
          where: {
            fechaMovimiento: {
              gte: inicioMes
            },
            ...(scopeCentroAcopioId
              ? {
                  OR: [
                    { establecimientoOrigen: { centroAcopioId: scopeCentroAcopioId } },
                    { establecimientoDestino: { centroAcopioId: scopeCentroAcopioId } },
                  ],
                }
              : {}),
          }
        })
      ]);

      const estadisticas: DashboardStats = {
        totalVacunas,
        totalEstablecimientos,
        totalUsuarios,
        alertasPendientes,
        stockCritico: Number(stockCriticoData[0]?.count || 0),
        vencimientoProximo: vencimientoProximoData,
        entregasMes: entregasMesData._sum.entrega || 0,
        movimientosUltimoMes,
        ultimaActualizacion: fechaActual
      };

      console.log('✅ Estadísticas generales calculadas:', estadisticas);
      return {
        success: true,
        data: estadisticas
      };
    } catch (error) {
      console.error('❌ Error al calcular estadísticas generales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al calcular estadísticas generales'
      };
    }
  }

  /**
   * Obtener movimientos mensuales para gráficos
   */
  static async getMovimientosMensuales(scopeCentroAcopioId?: string): Promise<ServiceResult<MovimientosMensuales[]>> {
    try {
      console.log('📈 Obteniendo movimientos mensuales...');

      const fechaActual = new Date();
      const anioActual = fechaActual.getFullYear();

      // Obtener movimientos agrupados por mes
      const [movimientosEntregas, movimientosKardex] = await Promise.all([
        // Entregas por mes desde movimientos
        prisma.movimientoVacuna.groupBy({
          by: ['mes'],
          where: {
            anio: anioActual,
            entrega: { gt: 0 },
            ...(scopeCentroAcopioId
              ? {
                  establecimiento: {
                    centroAcopioId: scopeCentroAcopioId,
                  },
                }
              : {}),
          },
          _sum: { entrega: true },
          orderBy: { mes: 'asc' }
        }),

        // Movimientos de kardex por mes
        scopeCentroAcopioId
          ? prisma.kardex.findMany({
              where: {
                fechaMovimiento: {
                  gte: new Date(anioActual, 0, 1),
                  lt: new Date(anioActual + 1, 0, 1),
                },
                OR: [
                  { establecimientoOrigen: { centroAcopioId: scopeCentroAcopioId } },
                  { establecimientoDestino: { centroAcopioId: scopeCentroAcopioId } },
                ],
              },
              select: {
                fechaMovimiento: true,
                tipoMovimiento: true,
                cantidad: true,
              },
            }).then((rows) => {
              const months = new Map<number, { mes: number; ingresos: bigint; salidas: bigint; transferencias: bigint }>();
              rows.forEach((row) => {
                const mes = row.fechaMovimiento.getMonth() + 1;
                const current = months.get(mes) || {
                  mes,
                  ingresos: BigInt(0),
                  salidas: BigInt(0),
                  transferencias: BigInt(0),
                };
                if (row.tipoMovimiento === 'ingreso') current.ingresos += BigInt(row.cantidad);
                if (row.tipoMovimiento === 'salida') current.salidas += BigInt(row.cantidad);
                if (row.tipoMovimiento === 'transferencia') current.transferencias += BigInt(row.cantidad);
                months.set(mes, current);
              });
              return Array.from(months.values()).sort((a, b) => a.mes - b.mes);
            })
          : prisma.$queryRaw<Array<{
              mes: number;
              ingresos: bigint;
              salidas: bigint;
              transferencias: bigint;
            }>>`
              SELECT
                EXTRACT(MONTH FROM fecha_movimiento) as mes,
                COALESCE(SUM(CASE WHEN tipo_movimiento = 'ingreso' THEN cantidad ELSE 0 END), 0) as ingresos,
                COALESCE(SUM(CASE WHEN tipo_movimiento = 'salida' THEN cantidad ELSE 0 END), 0) as salidas,
                COALESCE(SUM(CASE WHEN tipo_movimiento = 'transferencia' THEN cantidad ELSE 0 END), 0) as transferencias
              FROM kardex
              WHERE EXTRACT(YEAR FROM fecha_movimiento) = ${anioActual}
              GROUP BY EXTRACT(MONTH FROM fecha_movimiento)
              ORDER BY mes
            `
      ]);

      // Nombres de meses
      const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      // Crear array con todos los meses del año
      const movimientosMensuales: MovimientosMensuales[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        const entregasData = movimientosEntregas.find(m => m.mes === mes);
        const kardexData = movimientosKardex.find(m => Number(m.mes) === mes);

        movimientosMensuales.push({
          mes: nombresMeses[mes - 1] || `Mes ${mes}`,
          entregas: entregasData?._sum.entrega || 0,
          recepciones: Number(kardexData?.ingresos || 0),
          transferencias: Number(kardexData?.transferencias || 0)
        });
      }

      console.log('✅ Movimientos mensuales obtenidos:', movimientosMensuales.length);
      return {
        success: true,
        data: movimientosMensuales
      };
    } catch (error) {
      console.error('❌ Error al obtener movimientos mensuales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener movimientos mensuales'
      };
    }
  }

  /**
   * Obtener stock por vacuna para gráfico de torta
   */
  static async getStockPorVacuna(scopeCentroAcopioId?: string): Promise<ServiceResult<StockPorVacuna[]>> {
    try {
      console.log('🥧 Obteniendo stock por vacuna...');

      // Obtener stock actual por vacuna
      const stockData = scopeCentroAcopioId
        ? await prisma.movimientoVacuna.findMany({
            where: {
              establecimiento: {
                centroAcopioId: scopeCentroAcopioId,
              },
            },
            select: {
              saldoAnterior: true,
              transIngreso: true,
              salida: true,
              transSalida: true,
              entrega: true,
              vacuna: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          }).then((rows) => {
            const grouped = new Map<string, { vacuna_id: string; vacuna_nombre: string; stock_total: bigint }>();
            rows.forEach((row) => {
              const current = grouped.get(row.vacuna.id) || {
                vacuna_id: row.vacuna.id,
                vacuna_nombre: row.vacuna.nombre,
                stock_total: BigInt(0),
              };
              const stock = Math.max(row.saldoAnterior + row.transIngreso - row.salida - row.transSalida + row.entrega, 0);
              current.stock_total += BigInt(stock);
              grouped.set(row.vacuna.id, current);
            });
            return Array.from(grouped.values()).sort((a, b) => Number(b.stock_total - a.stock_total));
          })
        : await prisma.$queryRaw<Array<{
            vacuna_id: string;
            vacuna_nombre: string;
            stock_total: bigint;
          }>>`
            SELECT
              v.id as vacuna_id,
              v.nombre as vacuna_nombre,
              COALESCE(SUM(lv.cantidad_actual), 0) as stock_total
            FROM vacunas v
            LEFT JOIN lotes_vacunas lv ON v.id = lv.vacuna_id AND lv.estado = 'disponible'
            WHERE v.estado = 'activo'
            GROUP BY v.id, v.nombre
            ORDER BY stock_total DESC
          `;

      // Calcular total para porcentajes
      const totalStock = stockData.reduce((sum, item) => sum + Number(item.stock_total), 0);

      // Colores para el gráfico
      const colores = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ];

      const stockPorVacuna: StockPorVacuna[] = stockData.map((item, index) => ({
        vacunaId: item.vacuna_id,
        vacunaNombre: item.vacuna_nombre,
        stockTotal: Number(item.stock_total),
        porcentaje: totalStock > 0 ? (Number(item.stock_total) / totalStock) * 100 : 0,
        color: colores[index % colores.length] || '#6B7280'
      }));

      console.log('✅ Stock por vacuna obtenido:', stockPorVacuna.length);
      return {
        success: true,
        data: stockPorVacuna
      };
    } catch (error) {
      console.error('❌ Error al obtener stock por vacuna:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener stock por vacuna'
      };
    }
  }

  /**
   * Obtener estado de centros de acopio con paginación
   */
  static async getCentrosAcopioStatus(page: number = 1, limit: number = 5, scopeCentroAcopioId?: string): Promise<ServiceResult<{
    data: CentroAcopioStatus[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    try {
      console.log(`🏢 Obteniendo estado de centros de acopio (página ${page}, límite ${limit})...`);

      const offset = (page - 1) * limit;

      // Obtener total de centros
      const totalResult = scopeCentroAcopioId
        ? [{ count: BigInt(1) }]
        : await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) as count
            FROM centros_acopio ca
            WHERE ca.estado = 'activo'
          `;
      const total = Number(totalResult[0]?.count || 0);

      const centrosData = scopeCentroAcopioId
        ? await prisma.$queryRaw<Array<{
            id: string;
            nombre: string;
            establecimientos: bigint;
            stock_total: bigint;
            alertas: bigint;
          }>>`
            SELECT
              ca.id,
              ca.nombre,
              COUNT(DISTINCT e.id) as establecimientos,
              COALESCE(SUM(lv.cantidad_actual), 0) as stock_total,
              0 as alertas
            FROM centros_acopio ca
            LEFT JOIN establecimientos e ON ca.id = e.centro_acopio_id AND e.estado = 'activo'
            LEFT JOIN kardex k ON k.establecimiento_destino_id = e.id
            LEFT JOIN lotes_vacunas lv ON lv.id = k.lote_id AND lv.estado = 'disponible'
            WHERE ca.estado = 'activo' AND ca.id = ${scopeCentroAcopioId}
            GROUP BY ca.id, ca.nombre
            ORDER BY ca.nombre
            LIMIT ${limit} OFFSET ${offset}
          `
        : await prisma.$queryRaw<Array<{
            id: string;
            nombre: string;
            establecimientos: bigint;
            stock_total: bigint;
            alertas: bigint;
          }>>`
            SELECT
              ca.id,
              ca.nombre,
              COUNT(DISTINCT e.id) as establecimientos,
              COALESCE(SUM(lv.cantidad_actual), 0) as stock_total,
              0 as alertas
            FROM centros_acopio ca
            LEFT JOIN establecimientos e ON ca.id = e.centro_acopio_id AND e.estado = 'activo'
            LEFT JOIN kardex k ON k.establecimiento_destino_id = e.id
            LEFT JOIN lotes_vacunas lv ON lv.id = k.lote_id AND lv.estado = 'disponible'
            WHERE ca.estado = 'activo'
            GROUP BY ca.id, ca.nombre
            ORDER BY ca.nombre
            LIMIT ${limit} OFFSET ${offset}
          `;

      const centrosAcopio: CentroAcopioStatus[] = centrosData.map(centro => {
        const stockTotal = Number(centro.stock_total);
        const alertas = Number(centro.alertas);

        let estado: 'activo' | 'alerta' | 'critico' = 'activo';
        if (alertas > 5) estado = 'critico';
        else if (alertas > 0 || stockTotal < 1000) estado = 'alerta';

        return {
          id: centro.id,
          nombre: centro.nombre,
          establecimientos: Number(centro.establecimientos),
          stockTotal,
          alertas,
          estado
        };
      });

      const totalPages = Math.ceil(total / limit);

      console.log('✅ Estado de centros de acopio obtenido:', centrosAcopio.length);
      return {
        success: true,
        data: {
          data: centrosAcopio,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      };
    } catch (error) {
      console.error('❌ Error al obtener estado de centros de acopio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estado de centros de acopio'
      };
    }
  }

  /**
   * Obtener alertas recientes con paginación
   */
  static async getAlertasRecientes(page: number = 1, limit: number = 3, scopeCentroAcopioId?: string): Promise<ServiceResult<{
    data: AlertaReciente[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    try {
      console.log(`🚨 Obteniendo alertas recientes (página ${page}, límite ${limit})...`);

      const skip = (page - 1) * limit;
      const whereClause = {
        fechaCreacion: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        },
        ...(scopeCentroAcopioId
          ? {
              usuario: {
                centroAcopioId: scopeCentroAcopioId,
              },
            }
          : {}),
      };

      // Obtener total de alertas
      const total = await prisma.alerta.count({
        where: whereClause
      });

      const alertas = await prisma.alerta.findMany({
        where: whereClause,
        include: {
          usuario: {
            select: { nombres: true, apellidos: true }
          }
        },
        orderBy: { fechaCreacion: 'desc' },
        skip,
        take: limit
      });

      const alertasRecientes: AlertaReciente[] = alertas.map(alerta => {
        const result: AlertaReciente = {
          id: alerta.id,
          tipo: alerta.tipo,
          nivel: alerta.nivel,
          mensaje: alerta.descripcion,
          fechaCreacion: alerta.fechaCreacion
        };

        if (alerta.usuario) {
          result.establecimiento = `${alerta.usuario.nombres} ${alerta.usuario.apellidos}`;
        }

        return result;
      });

      const totalPages = Math.ceil(total / limit);

      console.log('✅ Alertas recientes obtenidas:', alertasRecientes.length);
      return {
        success: true,
        data: {
          data: alertasRecientes,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      };
    } catch (error) {
      console.error('❌ Error al obtener alertas recientes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener alertas recientes'
      };
    }
  }

  /**
   * Obtener actividad reciente del sistema con paginación
   */
  static async getActividadReciente(page: number = 1, limit: number = 5, scopeCentroAcopioId?: string): Promise<ServiceResult<{
    data: ActividadReciente[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    try {
      console.log(`📋 Obteniendo actividad reciente (página ${page}, límite ${limit})...`);

      const fechaLimite = new Date(Date.now() - 24 * 60 * 60 * 1000); // Últimas 24 horas
      const skip = (page - 1) * limit;

      // Obtener diferentes tipos de actividad en paralelo
      const [valesGenerados, lotesRecibidos, movimientosRegistrados] = await Promise.all([
        // Vales generados recientemente
        prisma.valeEntrega.findMany({
          where: {
            fechaGeneracion: { gte: fechaLimite },
            ...(scopeCentroAcopioId ? { centroAcopioId: scopeCentroAcopioId } : {}),
          },
          include: {
            usuario: { select: { nombres: true, apellidos: true } },
            centroAcopio: { select: { nombre: true } }
          },
          orderBy: { fechaGeneracion: 'desc' },
          skip,
          take: Math.ceil(limit / 3) // Dividir entre los 3 tipos de actividad
        }),

        // Lotes recibidos recientemente
        scopeCentroAcopioId
          ? Promise.resolve([])
          : prisma.loteVacuna.findMany({
              where: {
                createdAt: { gte: fechaLimite }
              },
              include: {
                vacuna: { select: { nombre: true } }
              },
              orderBy: { createdAt: 'desc' },
              skip,
              take: Math.ceil(limit / 3)
            }),

        // Movimientos registrados recientemente
        prisma.kardex.findMany({
          where: {
            fechaMovimiento: { gte: fechaLimite },
            ...(scopeCentroAcopioId
              ? {
                  OR: [
                    { establecimientoOrigen: { centroAcopioId: scopeCentroAcopioId } },
                    { establecimientoDestino: { centroAcopioId: scopeCentroAcopioId } },
                  ],
                }
              : {}),
          },
          include: {
            establecimientoOrigen: { select: { nombre: true } },
            establecimientoDestino: { select: { nombre: true } }
          },
          orderBy: { fechaMovimiento: 'desc' },
          skip,
          take: Math.ceil(limit / 3)
        })
      ]);

      // Obtener totales para paginación
      const [totalVales, totalLotes, totalMovimientos] = await Promise.all([
        prisma.valeEntrega.count({
          where: {
            fechaGeneracion: { gte: fechaLimite },
            ...(scopeCentroAcopioId ? { centroAcopioId: scopeCentroAcopioId } : {}),
          }
        }),
        scopeCentroAcopioId
          ? Promise.resolve(0)
          : prisma.loteVacuna.count({
              where: { createdAt: { gte: fechaLimite } }
            }),
        prisma.kardex.count({
          where: {
            fechaMovimiento: { gte: fechaLimite },
            ...(scopeCentroAcopioId
              ? {
                  OR: [
                    { establecimientoOrigen: { centroAcopioId: scopeCentroAcopioId } },
                    { establecimientoDestino: { centroAcopioId: scopeCentroAcopioId } },
                  ],
                }
              : {}),
          }
        })
      ]);

      const actividades: ActividadReciente[] = [];

      // Procesar vales generados
      valesGenerados.forEach(vale => {
        const actividad: ActividadReciente = {
          id: `vale-${vale.id}`,
          tipo: 'vale_generado',
          descripcion: `Vale ${vale.numero} generado`,
          fecha: vale.fechaGeneracion
        };

        if (vale.usuario) {
          actividad.usuario = `${vale.usuario.nombres} ${vale.usuario.apellidos}`;
        }

        if (vale.centroAcopio) {
          actividad.establecimiento = vale.centroAcopio.nombre;
        }

        actividades.push(actividad);
      });

      // Procesar lotes recibidos
      lotesRecibidos.forEach(lote => {
        actividades.push({
          id: `lote-${lote.id}`,
          tipo: 'lote_recibido',
          descripcion: `Lote recibido - ${lote.vacuna?.nombre || 'Vacuna'} (${lote.cantidadInicial} unidades)`,
          fecha: lote.createdAt
        });
      });

      // Procesar movimientos registrados
      movimientosRegistrados.forEach(movimiento => {
        const actividad: ActividadReciente = {
          id: `movimiento-${movimiento.id}`,
          tipo: 'movimiento_registrado',
          descripcion: `${movimiento.tipoMovimiento} - ${movimiento.tipo} (${movimiento.cantidad} unidades)`,
          fecha: movimiento.fechaMovimiento
        };

        if (movimiento.establecimientoOrigen) {
          actividad.establecimiento = movimiento.establecimientoOrigen.nombre;
        } else if (movimiento.establecimientoDestino) {
          actividad.establecimiento = movimiento.establecimientoDestino.nombre;
        }

        actividades.push(actividad);
      });

      // Ordenar por fecha descendente y tomar solo los solicitados
      const actividadReciente = actividades
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
        .slice(0, limit);

      const total = totalVales + totalLotes + totalMovimientos;
      const totalPages = Math.ceil(total / limit);

      console.log('✅ Actividad reciente obtenida:', actividadReciente.length);
      return {
        success: true,
        data: {
          data: actividadReciente,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      };
    } catch (error) {
      console.error('❌ Error al obtener actividad reciente:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener actividad reciente'
      };
    }
  }

  /**
   * Estadísticas por defecto en caso de error
   */
  private static getEstadisticasDefault(): DashboardStats {
    return {
      totalVacunas: 0,
      totalEstablecimientos: 0,
      totalUsuarios: 0,
      alertasPendientes: 0,
      stockCritico: 0,
      vencimientoProximo: 0,
      entregasMes: 0,
      movimientosUltimoMes: 0,
      ultimaActualizacion: new Date()
    };
  }
}
