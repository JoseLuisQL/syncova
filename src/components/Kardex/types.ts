/**
 * Tipo de movimiento Kardex usado por la UI del módulo (tabla y detalle).
 * Fuente única para evitar declaraciones duplicadas (TS2719).
 */
export interface KardexMovimientoUI {
  id: string;
  tipo: 'vacuna' | 'jeringa';
  itemId: string;
  loteId: string;
  tipoMovimiento: string;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  fechaMovimiento: string | Date;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  usuarioId?: string;
  item?: { nombre: string; tipo?: string };
  lote?: { numero: string; fechaVencimiento?: string | Date | null };
  usuario?: { nombres: string; apellidos: string; email?: string };
  establecimientoOrigen?: { nombre: string };
  establecimientoDestino?: { nombre: string };
}
