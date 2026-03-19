import { IMovimientoVacuna, IEntregaAdicional } from '@/types';

/**
 * Shared interfaces and types for Movimientos module
 */

export interface MovimientosFilters {
  establecimientoId?: string;
  vacunaId?: string;
  mes?: number;
  anio?: number;
  centroAcopioId?: string;
  centroAcopioIds?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateMovimientoDto {
  establecimientoId: string;
  vacunaId: string;
  mes: number;
  anio: number;
  saldoAnterior?: number;
  transIngreso?: number;
  salida?: number;
  transSalida?: number;
  entrega?: number;
  observaciones?: string;
  fechaMovimiento?: Date;
  usuarioId: string;
}

export interface UpdateMovimientoDto {
  saldoAnterior?: number;
  transIngreso?: number;
  salida?: number;
  transSalida?: number;
  entrega?: number;
  entregaBase?: number;
  observaciones?: string;
  fechaMovimiento?: Date;
  usuarioId?: string;
}

export interface CreateEntregaAdicionalDto {
  movimientoVacunaId: string;
  numeroEntrega: number;
  cantidad: number;
  fechaEntrega?: Date;
  motivo?: string;
  usuarioId: string;
}

export interface EntregaAdicionalConVale extends IEntregaAdicional {
  tieneValeGenerado?: boolean;
  valeNumero?: string;
}

export interface MovimientoConRelaciones extends IMovimientoVacuna {
  establecimiento: {
    id: string;
    nombre: string;
    tipo: string;
    codigo: string;
    centroAcopioId?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
  };
  entregasAdicionales: EntregaAdicionalConVale[];
  entregaBaseTieneVale?: boolean;
  valeNumeroEntregaBase?: string;
}

/**
 * Standard include options for movimiento queries
 */
export const MOVIMIENTO_INCLUDE = {
  establecimiento: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      codigo: true,
      centroAcopioId: true
    }
  },
  vacuna: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      presentacion: true,
      dosisPorFrasco: true
    }
  },
  usuario: {
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      email: true
    }
  },
  entregasAdicionales: {
    orderBy: {
      numeroEntrega: 'asc' as const
    }
  }
};
