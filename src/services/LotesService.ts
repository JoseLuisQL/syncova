/**
 * Servicio para gestión de lotes
 * Maneja operaciones relacionadas con lotes de vacunas y jeringas
 */

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

export class LotesService {
  private static readonly BASE_URL = 'http://localhost:3001/api';

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
}
