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
  tipo: 'stock_bajo' | 'vencimiento_proximo' | 'sistema' | 'entrega' | string;
  nivel: 'critico' | 'alto' | 'medio' | 'bajo';
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
