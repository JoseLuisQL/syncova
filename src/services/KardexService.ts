import { Vacuna, Jeringa, Establecimiento } from '../types';
import { STORAGE_KEYS, SYSTEM_EVENTS } from '../constants';
import { getApiBaseUrl } from '../utils/apiConfig';

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
  data: T[];
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
  private static readonly BASE_URL = getApiBaseUrl();

  private static getAuthHeaders(contentType = 'application/json'): HeadersInit {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return {
      'Content-Type': contentType,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private static async handleFetchResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.AUTH_LOGOUT));
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

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
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleFetchResponse<ApiResponse<KardexResponse>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Error al obtener movimientos de kardex');
      }

      // Convertir fechas de string a Date
      const movimientosConFechas = result.data.movimientos.map((mov: any) => ({
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
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleFetchResponse<ApiResponse<KardexEstadisticas>>(response);
      
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
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleFetchResponse<ApiResponse<Vacuna[]>>(response);
      
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
      const response = await fetch(`${this.BASE_URL}/jeringas?estado=activo&limit=1000`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleFetchResponse<PaginatedResponse<Jeringa[]>>(response);

      if (!result.success) {
        throw new Error(result.message || 'Error al obtener jeringas');
      }

      // La respuesta puede ser paginada o directa
      const jeringas = (result.data as any).jeringas || result.data || [];
      return jeringas.map((jeringa: any) => ({
        ...jeringa,
        nombre: jeringa.tipo, // Mapear 'tipo' a 'nombre' para consistencia
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
      // Add noPagination=true to get all establishments without pagination
      const response = await fetch(`${this.BASE_URL}/establecimientos?noPagination=true`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleFetchResponse<PaginatedResponse<Establecimiento>>(response);

      if (!result.success) {
        throw new Error(result.message || 'Error al obtener establecimientos');
      }

      // result.data is already the array of establishments
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
   * Obtener todos los centros de acopio disponibles
   */
  static async getCentrosAcopio(): Promise<any[]> {
    try {
      // Usar el endpoint de establecimientos que no requiere autenticación especial
      const response = await fetch(`${this.BASE_URL}/establecimientos/centros-acopio`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const result: any = await this.handleFetchResponse(response);

      if (!result.success) {
        throw new Error(result.message || 'Error al obtener centros de acopio');
      }

      // Mapear los centros de acopio al formato esperado
      return result.data.map((centro: any) => ({
        id: centro.id,
        nombre: centro.nombre,
        codigo: centro.codigo || centro.codigoCentroAcopio,
        direccion: centro.direccion,
        responsable: centro.responsable,
        telefono: centro.telefono,
        estado: centro.estado,
        createdAt: new Date(centro.createdAt),
        updatedAt: new Date(centro.updatedAt)
      }));
    } catch (error) {
      console.error('Error al obtener centros de acopio:', error);
      throw error;
    }
  }

  /**
   * Obtener lotes de vacunas
   */
  static async getLotesVacunas(vacunaId?: string): Promise<any[]> {
    try {
      const url = vacunaId
        ? `${this.BASE_URL}/lotes-vacunas/vacuna/${vacunaId}`
        : `${this.BASE_URL}/lotes-vacunas?estado=disponible&limit=1000`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleFetchResponse<PaginatedResponse<any[]>>(response);

      if (!result.success) {
        throw new Error(result.message || 'Error al obtener lotes de vacunas');
      }

      // Manejar tanto respuesta paginada como directa
      const lotes = (result.data as any).lotes || result.data || [];
      return lotes.map((lote: any) => ({
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
        ? `${this.BASE_URL}/lotes-jeringas/jeringa/${jeringaId}`
        : `${this.BASE_URL}/lotes-jeringas?estado=disponible&limit=1000`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleFetchResponse<PaginatedResponse<any[]>>(response);

      if (!result.success) {
        throw new Error(result.message || 'Error al obtener lotes de jeringas');
      }

      // Manejar tanto respuesta paginada como directa
      const lotes = (result.data as any).lotes || result.data || [];
      return lotes.map((lote: any) => ({
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
        headers: this.getAuthHeaders(),
      });
      const result = await this.handleFetchResponse<ApiResponse<{vales: any[], total: number}>>(response);

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
        headers: this.getAuthHeaders(),
      });
      const valeDetailResult = await this.handleFetchResponse<ApiResponse<any>>(valeDetailResponse);

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
