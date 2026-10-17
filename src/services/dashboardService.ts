import { apiClient, ApiResponse, PaginatedResponse } from '../config/api';
import { logger } from '../utils/debug';

export interface PlanificacionResumen {
  anio: number;
  registrosActivos: number;
  dosisProgramadas: number;
  dosisEjecutadas: number;
  dosisPendientes: number;
  porcentajeAvance: number;
}

/**
 * Interfaces para el Dashboard
 */
export interface DashboardStats {
  totalVacunas: number;
  totalJeringas: number;
  totalEstablecimientos: number;
  totalUsuarios: number;
  lotesActivos: number;
  lotesProximosVencer: number;
  stockCritico: number;
  stockTotalVacunas: number;
  entregasMes: number;
  dosisAplicadasMes: number;
  alertasPendientes: number;
  movimientosUltimoMes: number;
  centrosAcopio: number;
  coberturaRegional: number;
  planificacionResumen?: PlanificacionResumen;
  ultimaActualizacion?: string;
}

export interface MovimientosMensuales {
  mes: string;
  mesNumero: number;
  entregas: number;
  recepciones: number;
  transferencias: number;
  saldo: number;
}

export interface StockPorVacuna {
  vacunaId: string;
  vacunaNombre: string;
  presentacion?: string;
  stockTotal: number;
  stockMinimo: number;
  lotesActivos: number;
  proximosVencer: number;
  estado: 'critico' | 'bajo' | 'normal';
  porcentaje?: number;
  color?: string;
}

export interface CentroAcopioStatus {
  id: string;
  codigo?: string;
  nombre: string;
  responsable: string;
  establecimientos: number;
  stockTotal: number;
  alertas: number;
  estado: 'activo' | 'inactivo' | 'alerta' | 'critico';
  ultimaActividad?: Date;
}

export interface EstablecimientoDashboardItem {
  id: string;
  nombre: string;
  codigo: string;
  tipo: 'hospital' | 'centro_salud' | 'puesto_salud';
  estado: 'activo' | 'inactivo';
  responsable: string;
}

export interface AlertaReciente {
  id: string;
  tipo: 'vencimiento_proximo' | 'stock_bajo' | 'stock_critico' | 'sistema' | 'vencimiento';
  nivel: 'bajo' | 'medio' | 'alto' | 'critico';
  mensaje: string;
  descripcion?: string;
  establecimiento?: string;
  vacuna?: string;
  fechaCreacion: Date;
  leida: boolean;
}

export interface ActividadReciente {
  id: string;
  tipo: 'movimiento_registrado' | 'vale_generado' | 'lote_recibido' | 'alerta_creada' | 'usuario_conectado';
  descripcion: string;
  usuario: string;
  establecimiento?: string;
  fecha: Date;
  detalles?: Record<string, unknown>;
}

export interface DashboardData {
  estadisticas: DashboardStats;
  movimientosMensuales: MovimientosMensuales[];
  stockPorVacuna: StockPorVacuna[];
  centrosAcopio: CentroAcopioStatus[];
  alertasRecientes: AlertaReciente[];
  actividadReciente: ActividadReciente[];
}

interface BackendDashboardStats {
  totalVacunas: number;
  totalJeringas?: number;
  totalEstablecimientos: number;
  totalUsuarios: number;
  centrosAcopio?: number;
  lotesActivos?: number;
  stockTotalVacunas?: number;
  alertasPendientes: number;
  stockCritico: number;
  vencimientoProximo: number;
  entregasMes: number;
  dosisAplicadasMes?: number;
  movimientosUltimoMes: number;
  coberturaRegional?: number;
  planificacionResumen?: PlanificacionResumen;
  ultimaActualizacion: string | Date;
}

interface BackendMovimientosMensuales {
  mes: string;
  mesNumero?: number;
  entregas: number;
  recepciones: number;
  transferencias?: number;
  saldo?: number;
}

interface BackendStockPorVacuna {
  vacunaId: string;
  vacunaNombre: string;
  presentacion?: string;
  stockTotal: number;
  stockMinimo?: number;
  lotesActivos?: number;
  proximosVencer?: number;
  estado?: 'critico' | 'bajo' | 'normal';
  porcentaje?: number;
  color?: string;
}

interface BackendCentroAcopioStatus {
  id: string;
  codigo?: string;
  nombre: string;
  responsable?: string;
  establecimientos: number;
  stockTotal: number;
  alertas?: number;
  estado: 'activo' | 'alerta' | 'critico';
}

interface BackendAlertaReciente {
  id: string;
  tipo: string;
  nivel: 'info' | 'warning' | 'error' | 'success' | 'bajo' | 'medio' | 'alto' | 'critico';
  mensaje: string;
  descripcion?: string;
  fechaCreacion: string | Date;
  establecimiento?: string;
}

interface BackendActividadReciente {
  id: string;
  tipo: 'vale_generado' | 'lote_recibido' | 'usuario_conectado' | 'movimiento_registrado';
  descripcion: string;
  fecha: string | Date;
  usuario?: string;
  establecimiento?: string;
}

interface BackendDashboardData {
  estadisticas: BackendDashboardStats;
  movimientosMensuales: BackendMovimientosMensuales[];
  stockPorVacuna: BackendStockPorVacuna[];
  centrosAcopio: BackendCentroAcopioStatus[];
  alertasRecientes: BackendAlertaReciente[];
  actividadReciente: BackendActividadReciente[];
}

const mapAlertLevel = (nivel: BackendAlertaReciente['nivel']): AlertaReciente['nivel'] => {
  switch (nivel) {
    case 'error':
    case 'critico':
      return 'critico';
    case 'warning':
    case 'alto':
      return 'alto';
    case 'info':
    case 'medio':
      return 'medio';
    case 'success':
    case 'bajo':
    default:
      return 'bajo';
  }
};

const mapAlertType = (tipo: string): AlertaReciente['tipo'] => {
  if (tipo === 'vencimiento' || tipo === 'vencimiento_proximo') return 'vencimiento_proximo';
  if (tipo === 'stock_bajo') return 'stock_bajo';
  if (tipo === 'stock_critico') return 'stock_critico';
  return 'sistema';
};

const mapStockPorVacuna = (items: BackendStockPorVacuna[]): StockPorVacuna[] => {
  return items.map((item) => {
    const stockMinimo =
      typeof item.stockMinimo === 'number' && item.stockMinimo > 0
        ? item.stockMinimo
        : Math.max(200, Math.round(item.stockTotal * 0.25));
    const proximosVencer = typeof item.proximosVencer === 'number' ? item.proximosVencer : 0;
    const lotesActivos = typeof item.lotesActivos === 'number' ? item.lotesActivos : 1;
    const estado: StockPorVacuna['estado'] =
      item.estado ||
      (item.stockTotal <= stockMinimo * 0.5
        ? 'critico'
        : item.stockTotal <= stockMinimo
        ? 'bajo'
        : 'normal');

    return {
      vacunaId: item.vacunaId,
      vacunaNombre: item.vacunaNombre,
      presentacion: item.presentacion,
      stockTotal: item.stockTotal,
      stockMinimo,
      lotesActivos,
      proximosVencer,
      estado,
      porcentaje: item.porcentaje,
      color: item.color,
    };
  });
};

const mapDashboardStats = (
  stats: BackendDashboardStats,
  stockPorVacuna?: BackendStockPorVacuna[],
  centrosAcopio?: BackendCentroAcopioStatus[]
): DashboardStats => {
  const computedStockTotal =
    typeof stats.stockTotalVacunas === 'number'
      ? stats.stockTotalVacunas
      : (stockPorVacuna || []).reduce((acc, item) => acc + (item.stockTotal || 0), 0);

  const computedLotesActivos =
    typeof stats.lotesActivos === 'number'
      ? stats.lotesActivos
      : (stockPorVacuna || []).reduce((acc, item) => acc + (item.lotesActivos || 1), 0);

  const computedCentros =
    typeof stats.centrosAcopio === 'number'
      ? stats.centrosAcopio
      : (centrosAcopio || []).length;

  return {
    totalVacunas: stats.totalVacunas,
    totalJeringas: stats.totalJeringas ?? 0,
    totalEstablecimientos: stats.totalEstablecimientos,
    totalUsuarios: stats.totalUsuarios,
    lotesActivos: computedLotesActivos,
    lotesProximosVencer: stats.vencimientoProximo,
    stockCritico: stats.stockCritico,
    stockTotalVacunas: computedStockTotal,
    entregasMes: stats.entregasMes,
    dosisAplicadasMes: stats.dosisAplicadasMes ?? 0,
    alertasPendientes: stats.alertasPendientes,
    movimientosUltimoMes: stats.movimientosUltimoMes,
    centrosAcopio: computedCentros,
    coberturaRegional: stats.coberturaRegional ?? 0,
    planificacionResumen: stats.planificacionResumen,
    ultimaActualizacion: stats.ultimaActualizacion
      ? new Date(stats.ultimaActualizacion).toISOString()
      : new Date().toISOString(),
  };
};

const mapDashboardData = (data: BackendDashboardData): DashboardData => ({
  estadisticas: mapDashboardStats(data.estadisticas, data.stockPorVacuna, data.centrosAcopio),
  movimientosMensuales: data.movimientosMensuales.map((mov, index) => ({
    mes: mov.mes,
    mesNumero: mov.mesNumero ?? index + 1,
    entregas: mov.entregas,
    recepciones: mov.recepciones,
    transferencias: mov.transferencias ?? 0,
    saldo:
      typeof mov.saldo === 'number'
        ? mov.saldo
        : Math.max(0, mov.recepciones - mov.entregas),
  })),
  stockPorVacuna: mapStockPorVacuna(data.stockPorVacuna),
  centrosAcopio: data.centrosAcopio.map((centro) => ({
    id: centro.id,
    codigo: centro.codigo,
    nombre: centro.nombre,
    responsable: centro.responsable || 'Responsable asignado',
    establecimientos: centro.establecimientos,
    stockTotal: centro.stockTotal,
    alertas: centro.alertas ?? 0,
    estado: centro.estado,
  })),
  alertasRecientes: data.alertasRecientes.map((alerta) => ({
    id: alerta.id,
    tipo: mapAlertType(alerta.tipo),
    nivel: mapAlertLevel(alerta.nivel),
    mensaje: alerta.mensaje,
    descripcion: alerta.descripcion,
    establecimiento: alerta.establecimiento,
    fechaCreacion: new Date(alerta.fechaCreacion),
    leida: false,
  })),
  actividadReciente: data.actividadReciente.map((act) => ({
    id: act.id,
    tipo: act.tipo,
    descripcion: act.descripcion,
    usuario: act.usuario || 'Sistema',
    establecimiento: act.establecimiento,
    fecha: new Date(act.fecha),
  })),
});

export class DashboardService {
  static async getDashboardData(): Promise<DashboardData> {
    try {
      logger.debug('📊 DashboardService.getDashboardData - Solicitando datos del dashboard');
      const response = await apiClient.get<ApiResponse<BackendDashboardData>>('/dashboard');
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener datos del dashboard');
      }
      return mapDashboardData(response.data.data);
    } catch (error) {
      logger.error('❌ DashboardService.getDashboardData - Error:', error);
      throw error;
    }
  }

  static async getEstadisticas(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<ApiResponse<BackendDashboardStats>>('/dashboard/estadisticas');
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener estadísticas');
      }
      return mapDashboardStats(response.data.data);
    } catch (error) {
      logger.error('❌ DashboardService.getEstadisticas - Error:', error);
      throw error;
    }
  }

  static async getMovimientosMensuales(): Promise<MovimientosMensuales[]> {
    try {
      const response = await apiClient.get<ApiResponse<BackendMovimientosMensuales[]>>('/dashboard/movimientos-mensuales');
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener movimientos mensuales');
      }
      return response.data.data.map((mov, index) => ({
        mes: mov.mes,
        mesNumero: mov.mesNumero ?? index + 1,
        entregas: mov.entregas,
        recepciones: mov.recepciones,
        transferencias: mov.transferencias ?? 0,
        saldo: typeof mov.saldo === 'number' ? mov.saldo : Math.max(0, mov.recepciones - mov.entregas),
      }));
    } catch (error) {
      logger.error('❌ DashboardService.getMovimientosMensuales - Error:', error);
      throw error;
    }
  }

  static async getStockPorVacuna(): Promise<StockPorVacuna[]> {
    try {
      const response = await apiClient.get<ApiResponse<BackendStockPorVacuna[]>>('/dashboard/stock-vacunas');
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener stock por vacuna');
      }
      return mapStockPorVacuna(response.data.data);
    } catch (error) {
      logger.error('❌ DashboardService.getStockPorVacuna - Error:', error);
      throw error;
    }
  }

  static async getCentrosAcopioStatus(page: number = 1, limit: number = 5) {
    try {
      const response = await apiClient.get<PaginatedResponse<BackendCentroAcopioStatus>>(`/dashboard/centros-acopio?page=${page}&limit=${limit}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener centros de acopio');
      }
      const mapped: CentroAcopioStatus[] = (response.data.data || []).map((centro) => ({
        id: centro.id,
        codigo: centro.codigo,
        nombre: centro.nombre,
        responsable: centro.responsable || 'Responsable asignado',
        establecimientos: centro.establecimientos,
        stockTotal: centro.stockTotal,
        alertas: centro.alertas ?? 0,
        estado: centro.estado,
      }));
      return {
        data: mapped,
        pagination: response.data.pagination,
      };
    } catch (error) {
      logger.error('❌ DashboardService.getCentrosAcopioStatus - Error:', error);
      throw error;
    }
  }

  static async getEstablecimientosDashboard(page: number = 1, limit: number = 5) {
    try {
      const response = await apiClient.get<PaginatedResponse<EstablecimientoDashboardItem>>(`/dashboard/establecimientos?page=${page}&limit=${limit}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener establecimientos');
      }
      return {
        data: response.data.data || [],
        pagination: response.data.pagination,
      };
    } catch (error) {
      logger.error('❌ DashboardService.getEstablecimientosDashboard - Error:', error);
      throw error;
    }
  }

  static async getAlertasRecientes(page: number = 1, limit: number = 4) {
    try {
      const response = await apiClient.get<PaginatedResponse<BackendAlertaReciente>>(`/dashboard/alertas?page=${page}&limit=${limit}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener alertas');
      }
      const mapped: AlertaReciente[] = (response.data.data || []).map((alerta) => ({
        id: alerta.id,
        tipo: mapAlertType(alerta.tipo),
        nivel: mapAlertLevel(alerta.nivel),
        mensaje: alerta.mensaje,
        descripcion: alerta.descripcion,
        establecimiento: alerta.establecimiento,
        fechaCreacion: new Date(alerta.fechaCreacion),
        leida: false,
      }));
      return {
        data: mapped,
        pagination: response.data.pagination,
      };
    } catch (error) {
      logger.error('❌ DashboardService.getAlertasRecientes - Error:', error);
      throw error;
    }
  }

  static async getActividadReciente(page: number = 1, limit: number = 5) {
    try {
      const response = await apiClient.get<PaginatedResponse<BackendActividadReciente>>(`/dashboard/actividad?page=${page}&limit=${limit}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener actividad reciente');
      }
      const mapped: ActividadReciente[] = (response.data.data || []).map((act) => ({
        id: act.id,
        tipo: act.tipo,
        descripcion: act.descripcion,
        usuario: act.usuario || 'Sistema',
        establecimiento: act.establecimiento,
        fecha: new Date(act.fecha),
      }));
      return {
        data: mapped,
        pagination: response.data.pagination,
      };
    } catch (error) {
      logger.error('❌ DashboardService.getActividadReciente - Error:', error);
      throw error;
    }
  }
}
