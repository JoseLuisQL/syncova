import { Kardex, Vacuna, Jeringa, Establecimiento } from '../types';

/**
 * Interfaces para el servicio de Kardex
 */
export interface KardexFilters {
  tipo?: 'vacuna' | 'jeringa';
  itemId?: string;
  loteId?: string;
  tipoMovimiento?: 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface KardexResponse {
  movimientos: KardexMovimiento[];
  total: number;
}

export interface KardexMovimiento {
  id: string;
  tipo: 'vacuna' | 'jeringa';
  itemId: string;
  loteId: string;
  tipoMovimiento: 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  establecimientoOrigenId?: string;
  establecimientoDestinoId?: string;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  usuarioId: string;
  fechaMovimiento: Date;
  createdAt: Date;
  // Relaciones incluidas
  item?: {
    id: string;
    nombre: string;
    tipo?: string;
    presentacion?: string;
    capacidad?: string;
  };
  lote?: {
    id: string;
    numero: string;
    fechaVencimiento?: Date;
    cantidadInicial: number;
    cantidadActual: number;
  };
  establecimientoOrigen?: {
    id: string;
    nombre: string;
    tipo: string;
    codigo: string;
  };
  establecimientoDestino?: {
    id: string;
    nombre: string;
    tipo: string;
    codigo: string;
  };
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
  };
}

export interface KardexEstadisticas {
  totalMovimientos: number;
  totalIngresos: number;
  totalSalidas: number;
  totalTransferencias: number;
  totalAjustes: number;
  saldoActualTotal: number;
  movimientosPorTipo: {
    tipo: string;
    cantidad: number;
  }[];
  movimientosPorMes: {
    mes: string;
    ingresos: number;
    salidas: number;
    transferencias: number;
    ajustes: number;
  }[];
}

export interface DeliveryDetail {
  establecimientoId: string;
  establecimientoNombre: string;
  establecimientoCodigo: string;
  vacunaId: string;
  vacunaNombre: string;
  cantidadEntregada: number;
  cantidadProgramada?: number;
  cantidadAdicional?: number;
  numeroEntregaAdicional?: number;
}

export interface DeliveryBreakdown {
  valeId: string;
  numeroVale: string;
  fechaGeneracion: Date;
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
  };
  totalEstablecimientos: number;
  totalVacunas: number;
  detalles: DeliveryDetail[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

/**
 * Servicio para gestión del Kardex
 * Maneja todas las operaciones relacionadas con movimientos de kardex
 */
export class KardexService {
  private static readonly BASE_URL = 'http://localhost:3001/api';

  /**
   * Obtener todos los movimientos de kardex con filtros
   */
  static async getMovimientos(filters?: KardexFilters): Promise<KardexResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${this.BASE_URL}/kardex${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: PaginatedResponse<KardexResponse> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener movimientos de kardex');
      }

      // Convertir fechas de string a Date
      const movimientosConFechas = result.data.movimientos.map(mov => ({
        ...mov,
        fechaMovimiento: new Date(mov.fechaMovimiento),
        createdAt: new Date(mov.createdAt),
        lote: mov.lote ? {
          ...mov.lote,
          fechaVencimiento: mov.lote.fechaVencimiento ? new Date(mov.lote.fechaVencimiento) : undefined
        } : undefined
      }));

      return {
        movimientos: movimientosConFechas,
        total: result.data.total
      };
    } catch (error) {
      console.error('Error al obtener movimientos de kardex:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del kardex
   */
  static async getEstadisticas(filters?: Omit<KardexFilters, 'page' | 'limit'>): Promise<KardexEstadisticas> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${this.BASE_URL}/kardex/estadisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: ApiResponse<KardexEstadisticas> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener estadísticas del kardex');
      }

      return result.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del kardex:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las vacunas disponibles
   */
  static async getVacunas(): Promise<Vacuna[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/vacunas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: ApiResponse<Vacuna[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener vacunas');
      }

      return result.data.map(vacuna => ({
        ...vacuna,
        createdAt: new Date(vacuna.createdAt),
        updatedAt: new Date(vacuna.updatedAt)
      }));
    } catch (error) {
      console.error('Error al obtener vacunas:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las jeringas disponibles
   */
  static async getJeringas(): Promise<Jeringa[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/jeringas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: ApiResponse<Jeringa[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener jeringas');
      }

      return result.data.map(jeringa => ({
        ...jeringa,
        createdAt: new Date(jeringa.createdAt),
        updatedAt: new Date(jeringa.updatedAt)
      }));
    } catch (error) {
      console.error('Error al obtener jeringas:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los establecimientos disponibles
   */
  static async getEstablecimientos(): Promise<Establecimiento[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/establecimientos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: PaginatedResponse<Establecimiento[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener establecimientos');
      }

      return result.data.map(establecimiento => ({
        ...establecimiento,
        createdAt: new Date(establecimiento.createdAt),
        updatedAt: new Date(establecimiento.updatedAt)
      }));
    } catch (error) {
      console.error('Error al obtener establecimientos:', error);
      throw error;
    }
  }

  /**
   * Obtener lotes de vacunas
   */
  static async getLotesVacunas(vacunaId?: string): Promise<any[]> {
    try {
      const url = vacunaId
        ? `${this.BASE_URL}/lotes-vacunas?vacunaId=${vacunaId}`
        : `${this.BASE_URL}/lotes-vacunas`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: PaginatedResponse<any[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error al obtener lotes de vacunas');
      }

      return result.data.map(lote => ({
        ...lote,
        fechaIngreso: new Date(lote.fechaIngreso),
        fechaVencimiento: new Date(lote.fechaVencimiento),
        createdAt: new Date(lote.createdAt),
        updatedAt: new Date(lote.updatedAt)
      }));
    } catch (error) {
      console.error('Error al obtener lotes de vacunas:', error);
      throw error;
    }
  }

  /**
   * Obtener lotes de jeringas
   */
  static async getLotesJeringas(jeringaId?: string): Promise<any[]> {
    try {
      const url = jeringaId
        ? `${this.BASE_URL}/lotes-jeringas?jeringaId=${jeringaId}`
        : `${this.BASE_URL}/lotes-jeringas`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: PaginatedResponse<any[]> = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error al obtener lotes de jeringas');
      }

      return result.data.map(lote => ({
        ...lote,
        fechaIngreso: new Date(lote.fechaIngreso),
        fechaVencimiento: lote.fechaVencimiento ? new Date(lote.fechaVencimiento) : null,
        createdAt: new Date(lote.createdAt),
        updatedAt: new Date(lote.updatedAt)
      }));
    } catch (error) {
      console.error('Error al obtener lotes de jeringas:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de entrega para movimientos de salida
   */
  static async getDeliveryBreakdown(numeroDocumento: string): Promise<DeliveryBreakdown | null> {
    try {
      // Buscar el vale por número de documento en la lista de vales
      const response = await fetch(`${this.BASE_URL}/vales?limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: ApiResponse<{vales: any[], total: number}> = await response.json();

      if (!result.success) {
        return null;
      }

      // Buscar el vale con el número de documento específico
      const vale = result.data.vales.find(v => v.numero === numeroDocumento);

      if (!vale) {
        return null; // Vale no encontrado
      }

      // Obtener detalles completos del vale
      const valeDetailResponse = await fetch(`${this.BASE_URL}/vales/${vale.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!valeDetailResponse.ok) {
        throw new Error(`Error HTTP: ${valeDetailResponse.status}`);
      }

      const valeDetailResult: ApiResponse<any> = await valeDetailResponse.json();

      if (!valeDetailResult.success) {
        return null;
      }

      const valeCompleto = valeDetailResult.data;

      // Transformar los datos al formato esperado
      const deliveryBreakdown: DeliveryBreakdown = {
        valeId: valeCompleto.id,
        numeroVale: valeCompleto.numero,
        fechaGeneracion: new Date(valeCompleto.fechaGeneracion),
        centroAcopio: {
          id: valeCompleto.centroAcopio.id,
          nombre: valeCompleto.centroAcopio.nombre,
          codigo: valeCompleto.centroAcopio.codigo
        },
        totalEstablecimientos: valeCompleto.totalEstablecimientos,
        totalVacunas: valeCompleto.totalVacunas,
        detalles: valeCompleto.detalles.map((detalle: any) => ({
          establecimientoId: detalle.establecimiento.id,
          establecimientoNombre: detalle.establecimiento.nombre,
          establecimientoCodigo: detalle.establecimiento.codigo,
          vacunaId: detalle.vacuna.id,
          vacunaNombre: detalle.vacuna.nombre,
          cantidadEntregada: detalle.cantidadTotal || (detalle.cantidadProgramada + (detalle.cantidadAdicional || 0)),
          cantidadProgramada: detalle.cantidadProgramada || 0,
          cantidadAdicional: detalle.cantidadAdicional || 0,
          numeroEntregaAdicional: detalle.numeroEntregaAdicional
        }))
      };

      return deliveryBreakdown;
    } catch (error) {
      console.error('Error al obtener detalles de entrega:', error);
      return null;
    }
  }
}
