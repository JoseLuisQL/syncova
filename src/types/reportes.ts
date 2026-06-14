/**
 * Tipos TypeScript para el módulo de Reportes
 * Define todas las interfaces y tipos necesarios para la gestión de reportes
 */

/**
 * Tipos base para filtros de reportes
 */
export interface FiltrosReporteBase {
  centroAcopioId?: string;
  vacunaId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  incluirInactivos?: boolean;
}

export interface FiltrosStockCritico extends FiltrosReporteBase {
  porcentajeMinimo?: number;
  cantidadMinima?: number;
}

export interface FiltrosVencimientos extends FiltrosReporteBase {
  diasAnticipacion?: number;
}

export interface FiltrosKardexDetallado {
  tipo?: 'vacuna' | 'jeringa';
  itemId?: string;
  loteId?: string;
  establecimientoId?: string;
  tipoMovimiento?: 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
  fechaInicio: string;
  fechaFin: string;
  incluirTrazabilidad?: boolean;
}

/**
 * Filtros para reportes de movimientos
 */
export interface FiltrosMovimientosMensuales extends FiltrosReporteBase {
  establecimientoId?: string;
  mes?: number;
  anio?: number;
  agruparPor?: 'mes' | 'vacuna' | 'establecimiento';
}

export interface FiltrosConsumoHistorico extends FiltrosReporteBase {
  establecimientoId?: string;
  periodoMeses?: number;
  incluirProyecciones?: boolean;
}

export interface FiltrosEntregasPorEstablecimiento extends FiltrosReporteBase {
  establecimientoId?: string;
  incluirDetalleVacunas?: boolean;
  ordenarPor?: 'establecimiento' | 'cantidad' | 'fecha';
}

export interface FiltrosEficienciaDistribucion extends FiltrosReporteBase {
  establecimientoId?: string;
  incluirIndicadores?: boolean;
  calcularTendencias?: boolean;
}

/**
 * Tipos para datos de reportes
 */
export interface LoteReporte {
  id: string;
  numero: string;
  cantidadActual: number;
  fechaVencimiento: Date;
  estado: string;
  diasParaVencer: number;
}

export interface EstablecimientoAfectado {
  id: string;
  nombre: string;
  cantidadAsignada: number;
}

export interface ItemStockActual {
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  presentacion: string;
  stockTotal: number;
  totalLotes: number;
  lotesDisponibles: number;
  lotesPorVencer: number;
  valorInventario?: number;
  ultimaActualizacion: Date;
  lotes: LoteReporte[];
}

export interface ItemStockCritico extends ItemStockActual {
  stockMinimo: number;
  porcentajeCritico: number;
  nivelCriticidad: 'bajo' | 'critico' | 'agotado';
  recomendacionAccion: string;
}

export interface ItemVencimiento {
  loteId: string;
  numeroLote: string;
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  cantidadActual: number;
  fechaVencimiento: Date;
  diasParaVencer: number;
  nivelUrgencia: 'inmediato' | 'urgente' | 'atencion' | 'normal';
  establecimientosAfectados: EstablecimientoAfectado[];
}

export interface ItemLoteVencido {
  loteId: string;
  numeroLote: string;
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  cantidadActual: number;
  fechaVencimiento: Date;
  diasVencido: number;
  nivelCriticidad: 'critico' | 'muy_critico' | 'extremo';
  valorPerdido: number;
  establecimientosAfectados: EstablecimientoAfectado[];
}

export interface ItemKardexDetallado {
  id: string;
  fecha: Date;
  tipo: 'vacuna' | 'jeringa';
  itemNombre: string;
  loteNumero: string;
  tipoMovimiento: string;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  establecimientoOrigen?: string;
  establecimientoDestino?: string;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  usuario: string;
}

/**
 * Tipos para reportes de movimientos
 */
export interface ItemMovimientoMensual {
  establecimientoId: string;
  establecimientoNombre: string;
  vacunaId: string;
  vacunaNombre: string;
  mes: number;
  anio: number;
  saldoAnterior: number;
  transIngreso: number;
  salida: number;
  transSalida: number;
  entrega: number;
  saldoFinal: number;
  consumoTotal: number;
  eficienciaDistribucion: number;
  fechaUltimaActualizacion: Date;
}

export interface ItemConsumoHistorico {
  vacunaId: string;
  vacunaNombre: string;
  establecimientoId: string;
  establecimientoNombre: string;
  periodoInicio: Date;
  periodoFin: Date;
  consumoPromedio: number;
  consumoTotal: number;
  tendencia: 'creciente' | 'decreciente' | 'estable';
  variabilidad: number;
  proyeccionProximoMes?: number;
  historialMensual: {
    mes: number;
    anio: number;
    consumo: number;
    fecha: Date;
  }[];
}

export interface ItemEntregaPorEstablecimiento {
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  totalEntregas: number;
  totalVacunas: number;
  fechaUltimaEntrega: Date;
  eficienciaEntrega: number;
  detalleVacunas: {
    vacunaId: string;
    vacunaNombre: string;
    cantidadEntregada: number;
    numeroEntregas: number;
    promedioEntrega: number;
  }[];
}

export interface ItemEficienciaDistribucion {
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  periodoAnalisis: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  indicadores: {
    tiempoPromedioEntrega: number;
    porcentajeCumplimiento: number;
    eficienciaStock: number;
    rotacionInventario: number;
  };
  tendencias: {
    mejoraMes: boolean;
    variacionPorcentual: number;
  };
  alertas: string[];
}

/**
 * Tipos para estadísticas y métricas
 */
export interface EstadisticasReportes {
  totalVacunas: number;
  totalStock: number;
  vacunasCriticas: number;
  lotesProximosVencer: number;
  lotesVencidos: number;
  movimientosUltimoMes: number;
  ultimaActualizacion: Date;
}

export interface MetricasReporte {
  totalRegistros: number;
  fechaGeneracion: Date;
  tiempoGeneracion: number;
  filtrosAplicados: string[];
}

/**
 * Tipos para configuración de exportación
 */
export interface ConfiguracionExportacion {
  incluirDetalles: boolean;
  incluirGraficos: boolean;
  incluirEstadisticas: boolean;
  formatoFecha: 'dd/mm/yyyy' | 'yyyy-mm-dd';
  responsableReporte: string;
  observaciones?: string;
}

export interface ResultadoExportacion {
  exito: boolean;
  nombreArchivo: string;
  tamaño: number;
  mensaje?: string;
  error?: string;
}

/**
 * Tipos para estado de la UI
 */
export interface EstadoReportes {
  cargando: boolean;
  error: string | null;
  ultimaActualizacion: Date | null;
  reporteActivo: TipoReporte | null;
}

export interface EstadoFiltros {
  stockActual: FiltrosReporteBase;
  stockCritico: FiltrosStockCritico;
  vencimientos: FiltrosVencimientos;
  lotesVencidos: FiltrosReporteBase;
  kardexDetallado: FiltrosKardexDetallado | null;
  movimientosMensuales: FiltrosMovimientosMensuales;
  consumoHistorico: FiltrosConsumoHistorico;
  entregasPorEstablecimiento: FiltrosEntregasPorEstablecimiento;
  eficienciaDistribucion: FiltrosEficienciaDistribucion;
}

/**
 * Tipos para componentes de UI
 */
export type TipoReporte =
  | 'stock-actual' | 'stock_actual'
  | 'stock-critico' | 'stock_critico'
  | 'vencimientos' | 'proximos_vencimientos'
  | 'lotes-vencidos' | 'lotes_vencidos'
  | 'kardex-detallado' | 'kardex_detallado'
  | 'movimientos-mensuales' | 'movimientos_mensuales'
  | 'consumo-historico' | 'consumo_historico'
  | 'entregas-por-establecimiento' | 'entregas_por_establecimiento'
  | 'eficiencia-distribucion' | 'eficiencia_distribucion';

export interface OpcionFiltro {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ConfiguracionTabla {
  columnas: ColumnaTabla[];
  paginacion: boolean;
  ordenamiento: boolean;
  filtros: boolean;
  exportacion: boolean;
}

export interface ColumnaTabla {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'date' | 'currency' | 'percentage';
}

/**
 * Tipos para alertas y notificaciones
 */
export interface AlertaReporte {
  id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensaje: string;
  timestamp: Date;
  leida: boolean;
  accion?: {
    texto: string;
    callback: () => void;
  };
}

/**
 * Tipos para validación
 */
export interface ErrorValidacion {
  campo: string;
  mensaje: string;
  tipo: 'requerido' | 'formato' | 'rango' | 'logico';
}

export interface ResultadoValidacion {
  valido: boolean;
  errores: ErrorValidacion[];
}

/**
 * Tipos para hooks personalizados
 */
export interface UseReportesReturn {
  // Estados
  reportes: {
    stockActual: ItemStockActual[];
    stockCritico: ItemStockCritico[];
    vencimientos: ItemVencimiento[];
    lotesVencidos: ItemLoteVencido[];
    kardexDetallado: ItemKardexDetallado[];
    movimientosMensuales: ItemMovimientoMensual[];
    consumoHistorico: ItemConsumoHistorico[];
    entregasPorEstablecimiento: ItemEntregaPorEstablecimiento[];
    eficienciaDistribucion: ItemEficienciaDistribucion[];
  };
  estadisticas: EstadisticasReportes | null;
  estado: EstadoReportes;
  filtros: EstadoFiltros;

  // Acciones
  generarStockActual: (filtros?: FiltrosReporteBase) => Promise<ItemStockActual[] | null>;
  generarStockCritico: (filtros?: FiltrosStockCritico) => Promise<ItemStockCritico[] | null>;
  generarVencimientos: (filtros?: FiltrosVencimientos) => Promise<ItemVencimiento[] | null>;
  generarLotesVencidos: (filtros?: FiltrosReporteBase) => Promise<ItemLoteVencido[] | null>;
  generarKardexDetallado: (filtros: FiltrosKardexDetallado) => Promise<ItemKardexDetallado[] | null>;
  generarMovimientosMensuales: (filtros?: FiltrosMovimientosMensuales) => Promise<ItemMovimientoMensual[] | null>;
  generarConsumoHistorico: (filtros?: FiltrosConsumoHistorico) => Promise<ItemConsumoHistorico[] | null>;
  generarEntregasPorEstablecimiento: (filtros?: FiltrosEntregasPorEstablecimiento) => Promise<ItemEntregaPorEstablecimiento[] | null>;
  generarEficienciaDistribucion: (filtros?: FiltrosEficienciaDistribucion) => Promise<ItemEficienciaDistribucion[] | null>;
  obtenerEstadisticas: () => Promise<void>;
  exportarExcel: (tipo: TipoReporte, config: ConfiguracionExportacion) => Promise<void>;
  exportarKardexDetallado: (filtros: FiltrosKardexDetallado, config: ConfiguracionExportacion) => Promise<void>;
  exportarMovimientosMensuales: (filtros: FiltrosMovimientosMensuales, config: ConfiguracionExportacion) => Promise<void>;
  exportarConsumoHistorico: (filtros: FiltrosConsumoHistorico, config: ConfiguracionExportacion) => Promise<void>;
  exportarEntregasPorEstablecimiento: (filtros: FiltrosEntregasPorEstablecimiento, config: ConfiguracionExportacion) => Promise<void>;
  exportarEficienciaDistribucion: (filtros: FiltrosEficienciaDistribucion, config: ConfiguracionExportacion) => Promise<void>;
  exportarMovimientosPorEESS: (filtros: { fechaInicio: string; fechaFin: string; centroAcopioId?: string }, config: ConfiguracionExportacion) => Promise<void>;
  exportarStockVacunasEESS: (filtros: { fechaInicio: string; fechaFin: string; centroAcopioId?: string; vacunaIds: string[] }, config: ConfiguracionExportacion) => Promise<void>;
  limpiarReportes: () => void;
  actualizarFiltros: (tipo: TipoReporte, filtros: any) => void;

  // Utilidades adicionales
  limpiarError: () => void;
  obtenerDatosReporteActivo: () => unknown[];
  tieneDatos: (tipo: TipoReporte) => boolean;
}

/**
 * Tipos para contexto de reportes
 */
export interface ContextoReportes {
  reportes: UseReportesReturn;
  configuracion: {
    itemsPorPagina: number;
    formatoFecha: string;
    responsablePorDefecto: string;
  };
  permisos: {
    verReportes: boolean;
    exportarReportes: boolean;
    configurarReportes: boolean;
  };
}

/**
 * Constantes y enums
 */
export const TIPOS_REPORTE = {
  STOCK_ACTUAL: 'stock-actual',
  STOCK_CRITICO: 'stock-critico',
  VENCIMIENTOS: 'vencimientos',
  KARDEX_DETALLADO: 'kardex-detallado'
} as const;

export const NIVELES_CRITICIDAD = {
  BAJO: 'bajo',
  CRITICO: 'critico',
  AGOTADO: 'agotado'
} as const;

export const NIVELES_URGENCIA = {
  INMEDIATO: 'inmediato',
  URGENTE: 'urgente',
  ATENCION: 'atencion',
  NORMAL: 'normal'
} as const;

export const TIPOS_MOVIMIENTO = {
  INGRESO: 'ingreso',
  SALIDA: 'salida',
  TRANSFERENCIA: 'transferencia',
  AJUSTE: 'ajuste'
} as const;
