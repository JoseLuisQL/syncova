import { apiClient, ApiResponse } from '../config/api';

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
  private static readonly BASE_URL = '/dashboard';

  /**
   * Obtener todos los datos del dashboard
   */
  static async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('🔄 Obteniendo datos completos del dashboard...');

      const response = await apiClient.get<ApiResponse<DashboardData>>(
        `${this.BASE_URL}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener datos del dashboard');
      }

      // Convertir fechas de string a Date
      const data = response.data.data;
      data.estadisticas.ultimaActualizacion = new Date(data.estadisticas.ultimaActualizacion);
      
      data.alertasRecientes = data.alertasRecientes.map(alerta => ({
        ...alerta,
        fechaCreacion: new Date(alerta.fechaCreacion)
      }));

      data.actividadReciente = data.actividadReciente.map(actividad => ({
        ...actividad,
        fecha: new Date(actividad.fecha)
      }));

      console.log('✅ Datos del dashboard obtenidos exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al obtener datos del dashboard:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener solo las estadísticas generales
   */
  static async getEstadisticas(): Promise<DashboardStats> {
    try {
      console.log('📊 Obteniendo estadísticas generales...');

      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        `${this.BASE_URL}/estadisticas`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener estadísticas');
      }

      const data = response.data.data;
      data.ultimaActualizacion = new Date(data.ultimaActualizacion);

      console.log('✅ Estadísticas obtenidas exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener movimientos mensuales para gráficos
   */
  static async getMovimientosMensuales(): Promise<MovimientosMensuales[]> {
    try {
      console.log('📈 Obteniendo movimientos mensuales...');

      const response = await apiClient.get<ApiResponse<MovimientosMensuales[]>>(
        `${this.BASE_URL}/movimientos-mensuales`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener movimientos mensuales');
      }

      console.log('✅ Movimientos mensuales obtenidos exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al obtener movimientos mensuales:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener stock por vacuna para gráfico de torta
   */
  static async getStockPorVacuna(): Promise<StockPorVacuna[]> {
    try {
      console.log('🥧 Obteniendo stock por vacuna...');

      const response = await apiClient.get<ApiResponse<StockPorVacuna[]>>(
        `${this.BASE_URL}/stock-por-vacuna`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener stock por vacuna');
      }

      console.log('✅ Stock por vacuna obtenido exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al obtener stock por vacuna:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estado de centros de acopio
   */
  static async getCentrosAcopioStatus(): Promise<CentroAcopioStatus[]> {
    try {
      console.log('🏢 Obteniendo estado de centros de acopio...');

      const response = await apiClient.get<ApiResponse<CentroAcopioStatus[]>>(
        `${this.BASE_URL}/centros-acopio-status`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener estado de centros de acopio');
      }

      console.log('✅ Estado de centros de acopio obtenido exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al obtener estado de centros de acopio:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener alertas recientes
   */
  static async getAlertasRecientes(): Promise<AlertaReciente[]> {
    try {
      console.log('🚨 Obteniendo alertas recientes...');

      const response = await apiClient.get<ApiResponse<AlertaReciente[]>>(
        `${this.BASE_URL}/alertas-recientes`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener alertas recientes');
      }

      const data = response.data.data.map(alerta => ({
        ...alerta,
        fechaCreacion: new Date(alerta.fechaCreacion)
      }));

      console.log('✅ Alertas recientes obtenidas exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al obtener alertas recientes:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener actividad reciente del sistema
   */
  static async getActividadReciente(): Promise<ActividadReciente[]> {
    try {
      console.log('📋 Obteniendo actividad reciente...');

      const response = await apiClient.get<ApiResponse<ActividadReciente[]>>(
        `${this.BASE_URL}/actividad-reciente`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener actividad reciente');
      }

      const data = response.data.data.map(actividad => ({
        ...actividad,
        fecha: new Date(actividad.fecha)
      }));

      console.log('✅ Actividad reciente obtenida exitosamente');
      return data;
    } catch (error) {
      console.error('❌ Error al obtener actividad reciente:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejo de errores
   */
  private static handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Error desconocido en el servicio de dashboard');
  }
}
