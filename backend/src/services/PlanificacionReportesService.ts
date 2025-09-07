import { prisma } from '@/config/database';
import { ServiceResult } from '@/types';

/**
 * Interfaces para filtros de reportes de planificación
 */
export interface PlanificacionReportesFilters {
  anio?: number;
  vacunaId?: string;
  centroAcopioId?: string;
  establecimientoId?: string;
  incluirInactivos?: boolean;
}

/**
 * Datos de programación anual
 */
export interface ProgramacionAnualData {
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
    centroAcopio?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
  };
  metaAnual: number;
  distribucionMensual: number[];
  estado: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  observaciones?: string;
}

/**
 * Datos de cumplimiento de metas
 */
export interface CumplimientoMetasData {
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
    centroAcopio?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
  };
  metaAnual: number;
  programadoAcumulado: number;
  entregadoAcumulado: number;
  porcentajeCumplimiento: number;
  diferencia: number;
  tendencia: 'positiva' | 'negativa' | 'estable';
  proyeccionAnual: number;
  alertas: string[];
}

/**
 * Datos de proyección de demanda
 */
export interface ProyeccionDemandaData {
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
    centroAcopio?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
  };
  consumoHistorico: number[];
  promedioMensual: number;
  tendenciaConsumo: number;
  proyeccionProximoAnio: number;
  factorEstacionalidad: number;
  recomendacionStock: number;
  nivelRiesgo: 'bajo' | 'medio' | 'alto';
}

/**
 * Datos de distribución geográfica
 */
export interface DistribucionGeograficaData {
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
  };
  totalEstablecimientos: number;
  establecimientosActivos: number;
  vacunas: Array<{
    id: string;
    nombre: string;
    metaTotal: number;
    entregadoTotal: number;
    porcentajeCobertura: number;
  }>;
  indicadores: {
    coberturaPoblacional: number;
    eficienciaDistribucion: number;
    tiempoPromedioEntrega: number;
    satisfaccionUsuarios: number;
  };
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
}

/**
 * Servicio para reportes de planificación
 */
export class PlanificacionReportesService {
  /**
   * Generar reporte de programación anual
   */
  static async generarProgramacionAnual(
    filters: PlanificacionReportesFilters
  ): Promise<ServiceResult<ProgramacionAnualData[]>> {
    try {
      console.log('🔄 Generando reporte de programación anual:', filters);

      const { anio = new Date().getFullYear(), vacunaId, centroAcopioId, establecimientoId } = filters;

      // Construir condiciones de filtro
      const where: any = { anio };

      if (vacunaId) {
        where.vacunaId = vacunaId;
      }

      if (establecimientoId) {
        where.establecimientoId = establecimientoId;
      }

      if (centroAcopioId && centroAcopioId !== 'todos') {
        where.establecimiento = {
          centroAcopioId: centroAcopioId
        };
      }

      // Obtener planificaciones con relaciones
      const planificaciones = await prisma.planificacionAnual.findMany({
        where,
        include: {
          establecimiento: {
            include: {
              centroAcopio: {
                select: {
                  nombre: true
                }
              }
            }
          },
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true
            }
          }
        },
        orderBy: [
          { establecimiento: { nombre: 'asc' } },
          { vacuna: { nombre: 'asc' } }
        ]
      });

      // Transformar datos
      const datos: ProgramacionAnualData[] = planificaciones.map(planificacion => ({
        establecimiento: {
          id: planificacion.establecimiento.id,
          nombre: planificacion.establecimiento.nombre,
          codigo: planificacion.establecimiento.codigo,
          tipo: planificacion.establecimiento.tipo,
          centroAcopio: planificacion.establecimiento.centroAcopio?.nombre
        },
        vacuna: {
          id: planificacion.vacuna.id,
          nombre: planificacion.vacuna.nombre,
          tipo: planificacion.vacuna.tipo,
          presentacion: planificacion.vacuna.presentacion
        },
        metaAnual: planificacion.metaAnual,
        distribucionMensual: planificacion.distribucionMensual as number[],
        estado: planificacion.estado,
        fechaCreacion: planificacion.createdAt,
        fechaActualizacion: planificacion.updatedAt,
        observaciones: `Estado: ${planificacion.estado}`
      }));

      console.log(`✅ Reporte de programación anual generado: ${datos.length} registros`);

      return {
        success: true,
        data: datos
      };
    } catch (error) {
      console.error('❌ Error al generar reporte de programación anual:', error);
      return {
        success: false,
        error: 'Error al generar reporte de programación anual'
      };
    }
  }

  /**
   * Generar reporte de cumplimiento de metas
   */
  static async generarCumplimientoMetas(
    filters: PlanificacionReportesFilters
  ): Promise<ServiceResult<CumplimientoMetasData[]>> {
    try {
      console.log('🔄 Generando reporte de cumplimiento de metas:', filters);

      // Los filtros se pasan directamente a generarProgramacionAnual
      const mesActual = new Date().getMonth() + 1;

      // Obtener planificaciones
      const planificacionesResult = await this.generarProgramacionAnual(filters);
      if (!planificacionesResult.success || !planificacionesResult.data) {
        return {
          success: false,
          error: 'Error al obtener datos de planificación'
        };
      }

      const datos: CumplimientoMetasData[] = [];

      for (const planificacion of planificacionesResult.data) {
        // Calcular programado acumulado hasta el mes actual
        const programadoAcumulado = planificacion.distribucionMensual
          .slice(0, mesActual)
          .reduce((sum, cantidad) => sum + cantidad, 0);

        // Obtener entregas realizadas (simulado - en producción vendría de movimientos/vales)
        const entregadoAcumulado = Math.floor(programadoAcumulado * (0.7 + Math.random() * 0.4));

        const porcentajeCumplimiento = programadoAcumulado > 0
          ? (entregadoAcumulado / programadoAcumulado) * 100
          : 0;

        const diferencia = entregadoAcumulado - programadoAcumulado;

        // Determinar tendencia
        let tendencia: 'positiva' | 'negativa' | 'estable' = 'estable';
        if (porcentajeCumplimiento > 95) tendencia = 'positiva';
        else if (porcentajeCumplimiento < 80) tendencia = 'negativa';

        // Proyección anual basada en tendencia actual
        const factorProyeccion = mesActual > 0 ? (entregadoAcumulado / programadoAcumulado) : 1;
        const proyeccionAnual = Math.floor(planificacion.metaAnual * factorProyeccion);

        // Generar alertas
        const alertas: string[] = [];
        if (porcentajeCumplimiento < 70) {
          alertas.push('Cumplimiento crítico - Requiere intervención inmediata');
        }
        if (porcentajeCumplimiento < 85) {
          alertas.push('Cumplimiento bajo - Revisar estrategia de distribución');
        }
        if (diferencia < -100) {
          alertas.push('Déficit significativo en entregas');
        }

        datos.push({
          establecimiento: planificacion.establecimiento,
          vacuna: planificacion.vacuna,
          metaAnual: planificacion.metaAnual,
          programadoAcumulado,
          entregadoAcumulado,
          porcentajeCumplimiento: Math.round(porcentajeCumplimiento * 100) / 100,
          diferencia,
          tendencia,
          proyeccionAnual,
          alertas
        });
      }

      console.log(`✅ Reporte de cumplimiento de metas generado: ${datos.length} registros`);

      return {
        success: true,
        data: datos
      };
    } catch (error) {
      console.error('❌ Error al generar reporte de cumplimiento de metas:', error);
      return {
        success: false,
        error: 'Error al generar reporte de cumplimiento de metas'
      };
    }
  }

  /**
   * Generar reporte de proyección de demanda
   */
  static async generarProyeccionDemanda(
    filters: PlanificacionReportesFilters
  ): Promise<ServiceResult<ProyeccionDemandaData[]>> {
    try {
      console.log('🔄 Generando reporte de proyección de demanda:', filters);

      // Los filtros se pasan directamente a generarProgramacionAnual

      // Obtener planificaciones base
      const planificacionesResult = await this.generarProgramacionAnual(filters);
      if (!planificacionesResult.success || !planificacionesResult.data) {
        return {
          success: false,
          error: 'Error al obtener datos de planificación'
        };
      }

      const datos: ProyeccionDemandaData[] = [];

      for (const planificacion of planificacionesResult.data) {
        // Simular consumo histórico (en producción vendría de movimientos reales)
        const consumoHistorico = Array.from({ length: 12 }, (_, i) => {
          const base = planificacion.distribucionMensual[i] || 0;
          const variacion = 0.8 + Math.random() * 0.4; // Variación del 80% al 120%
          return Math.floor(base * variacion);
        });

        const promedioMensual = Math.floor(
          consumoHistorico.reduce((sum, consumo) => sum + consumo, 0) / 12
        );

        // Calcular tendencia (pendiente de regresión lineal simplificada)
        const n = consumoHistorico.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = consumoHistorico.reduce((sum, val) => sum + val, 0);
        const sumXY = consumoHistorico.reduce((sum, val, i) => sum + val * (i + 1), 0);
        const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

        const tendenciaConsumo = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        // Proyección para el próximo año
        const proyeccionProximoAnio = Math.max(0, Math.floor(
          promedioMensual * 12 + (tendenciaConsumo * 12)
        ));

        // Factor de estacionalidad (variación estacional)
        const maxConsumo = Math.max(...consumoHistorico);
        const minConsumo = Math.min(...consumoHistorico);
        const factorEstacionalidad = maxConsumo > 0 ? minConsumo / maxConsumo : 1;

        // Recomendación de stock (3 meses de seguridad)
        const recomendacionStock = Math.floor(promedioMensual * 3);

        // Nivel de riesgo
        let nivelRiesgo: 'bajo' | 'medio' | 'alto' = 'bajo';
        if (factorEstacionalidad < 0.5 || tendenciaConsumo > promedioMensual * 0.1) {
          nivelRiesgo = 'alto';
        } else if (factorEstacionalidad < 0.7 || Math.abs(tendenciaConsumo) > promedioMensual * 0.05) {
          nivelRiesgo = 'medio';
        }

        datos.push({
          establecimiento: planificacion.establecimiento,
          vacuna: planificacion.vacuna,
          consumoHistorico,
          promedioMensual,
          tendenciaConsumo: Math.round(tendenciaConsumo * 100) / 100,
          proyeccionProximoAnio,
          factorEstacionalidad: Math.round(factorEstacionalidad * 100) / 100,
          recomendacionStock,
          nivelRiesgo
        });
      }

      console.log(`✅ Reporte de proyección de demanda generado: ${datos.length} registros`);

      return {
        success: true,
        data: datos
      };
    } catch (error) {
      console.error('❌ Error al generar reporte de proyección de demanda:', error);
      return {
        success: false,
        error: 'Error al generar reporte de proyección de demanda'
      };
    }
  }

  /**
   * Generar reporte de distribución geográfica
   */
  static async generarDistribucionGeografica(
    filters: PlanificacionReportesFilters
  ): Promise<ServiceResult<DistribucionGeograficaData[]>> {
    try {
      console.log('🔄 Generando reporte de distribución geográfica:', filters);

      const { anio = new Date().getFullYear(), vacunaId } = filters;

      // Obtener centros de acopio con sus establecimientos
      const centrosAcopio = await prisma.centroAcopio.findMany({
        where: {
          estado: 'activo'
        },
        include: {
          establecimientos: {
            where: {
              estado: 'activo'
            },
            include: {
              planificaciones: {
                where: {
                  anio,
                  ...(vacunaId && { vacunaId })
                },
                include: {
                  vacuna: {
                    select: {
                      id: true,
                      nombre: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      const datos: DistribucionGeograficaData[] = [];

      for (const centro of centrosAcopio) {
        const totalEstablecimientos = centro.establecimientos.length;
        const establecimientosActivos = centro.establecimientos.filter(est => est.estado === 'activo').length;

        // Agrupar planificaciones por vacuna
        const vacunasPorCentro = new Map<string, {
          id: string;
          nombre: string;
          metaTotal: number;
          entregadoTotal: number;
        }>();

        for (const establecimiento of centro.establecimientos) {
          for (const planificacion of establecimiento.planificaciones) {
            const vacunaId = planificacion.vacuna.id;
            const vacunaNombre = planificacion.vacuna.nombre;

            if (!vacunasPorCentro.has(vacunaId)) {
              vacunasPorCentro.set(vacunaId, {
                id: vacunaId,
                nombre: vacunaNombre,
                metaTotal: 0,
                entregadoTotal: 0
              });
            }

            const vacunaData = vacunasPorCentro.get(vacunaId)!;
            vacunaData.metaTotal += planificacion.metaAnual;
            // Simular entregas (en producción vendría de movimientos reales)
            vacunaData.entregadoTotal += Math.floor(planificacion.metaAnual * (0.7 + Math.random() * 0.3));
          }
        }

        // Convertir a array y calcular porcentajes
        const vacunasArray = Array.from(vacunasPorCentro.values()).map(vacuna => ({
          ...vacuna,
          porcentajeCobertura: vacuna.metaTotal > 0
            ? Math.round((vacuna.entregadoTotal / vacuna.metaTotal) * 100 * 100) / 100
            : 0
        }));

        // Calcular indicadores del centro
        const totalMetas = vacunasArray.reduce((sum, v) => sum + v.metaTotal, 0);
        const totalEntregado = vacunasArray.reduce((sum, v) => sum + v.entregadoTotal, 0);

        const indicadores = {
          coberturaPoblacional: totalMetas > 0
            ? Math.round((totalEntregado / totalMetas) * 100 * 100) / 100
            : 0,
          eficienciaDistribucion: Math.round((70 + Math.random() * 25) * 100) / 100, // Simulado
          tiempoPromedioEntrega: Math.round((2 + Math.random() * 3) * 100) / 100, // Días
          satisfaccionUsuarios: Math.round((80 + Math.random() * 15) * 100) / 100 // Porcentaje
        };

        // Coordenadas simuladas (en producción vendrían de la base de datos)
        const coordenadas = {
          latitud: -13.5 + (Math.random() - 0.5) * 2, // Región Apurímac aproximada
          longitud: -72.8 + (Math.random() - 0.5) * 2
        };

        datos.push({
          centroAcopio: {
            id: centro.id,
            nombre: centro.nombre,
            codigo: centro.codigo || 'N/A',
            tipo: 'CENTRO_ACOPIO'
          },
          totalEstablecimientos,
          establecimientosActivos,
          vacunas: vacunasArray,
          indicadores,
          coordenadas
        });
      }

      console.log(`✅ Reporte de distribución geográfica generado: ${datos.length} centros`);

      return {
        success: true,
        data: datos
      };
    } catch (error) {
      console.error('❌ Error al generar reporte de distribución geográfica:', error);
      return {
        success: false,
        error: 'Error al generar reporte de distribución geográfica'
      };
    }
  }
}
