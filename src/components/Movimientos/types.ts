/**
 * Tipos compartidos del módulo de Movimientos.
 * Fuente única para evitar declaraciones duplicadas entre el contenedor
 * y sus subcomponentes (causa de errores TS2719).
 */

/** Opción ligera de centro de acopio para selectores/filtros. */
export interface CentroAcopioFilterOption {
  id: string;
  nombre: string;
  codigo?: string;
}

/** Información de stock mostrada en la cabecera y panel de stock. */
export interface StockInfo {
  stockInicialHistorico: number | null;
  stockInicialOriginal?: number | null;
  ingresosLotesDelMes?: number;
  fechaCapturaStockInicial: Date | null;
  stockActual: number;
  totalEntregas: number;
  stockDisponible: number;
  estado: 'bueno' | 'medio' | 'critico';
  tieneHistorialInicial: boolean;
  lotes: Array<{
    id: string;
    numero: string;
    cantidadActual: number;
    fechaVencimiento: Date;
    estado: string;
  }>;
}
