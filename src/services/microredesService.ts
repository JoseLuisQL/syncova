import { Microred, CreateMicroredDto, UpdateMicroredDto, MicroredFilters } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class MicroredesService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('sivac_auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('sivac_auth_token');
        localStorage.removeItem('sivac_refresh_token');
        localStorage.removeItem('sivac_user');
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Obtener todas las microredes con filtros opcionales
   */
  async getMicroredes(filters?: MicroredFilters): Promise<ApiResponse<Microred[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.redId) queryParams.append('redId', filters.redId);
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/microredes?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<Microred[]>(response);
    } catch (error) {
      console.error('Error fetching microredes:', error);
      throw error;
    }
  }

  /**
   * Obtener microred por ID
   */
  async getMicroredById(id: string): Promise<ApiResponse<Microred>> {
    try {
      const response = await fetch(`${API_BASE_URL}/microredes/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<Microred>(response);
    } catch (error) {
      console.error('Error fetching microred by id:', error);
      throw error;
    }
  }

  /**
   * Crear nueva microred
   */
  async createMicrored(data: CreateMicroredDto): Promise<ApiResponse<Microred>> {
    try {
      const response = await fetch(`${API_BASE_URL}/microredes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse<Microred>(response);
    } catch (error) {
      console.error('Error creating microred:', error);
      throw error;
    }
  }

  /**
   * Actualizar microred
   */
  async updateMicrored(id: string, data: UpdateMicroredDto): Promise<ApiResponse<Microred>> {
    try {
      const response = await fetch(`${API_BASE_URL}/microredes/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse<Microred>(response);
    } catch (error) {
      console.error('Error updating microred:', error);
      throw error;
    }
  }

  /**
   * Eliminar microred
   */
  async deleteMicrored(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL}/microredes/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<boolean>(response);
    } catch (error) {
      console.error('Error deleting microred:', error);
      throw error;
    }
  }

  /**
   * Obtener microredes activas para selectores
   */
  async getMicroredesActivas(): Promise<Microred[]> {
    try {
      const response = await this.getMicroredes({ estado: 'activo', limit: 1000 });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching microredes activas:', error);
      return [];
    }
  }

  /**
   * Obtener microredes por red
   */
  async getMicroredesByRed(redId: string): Promise<Microred[]> {
    try {
      const response = await this.getMicroredes({ redId, estado: 'activo', limit: 1000 });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching microredes by red:', error);
      return [];
    }
  }

  /**
   * Buscar microredes por nombre
   */
  async searchMicroredes(search: string): Promise<Microred[]> {
    try {
      const response = await this.getMicroredes({ search, estado: 'activo', limit: 50 });
      return response.data || [];
    } catch (error) {
      console.error('Error searching microredes:', error);
      return [];
    }
  }

  /**
   * Validar si una microred puede ser eliminada
   */
  async canDeleteMicrored(id: string): Promise<boolean> {
    try {
      const response = await this.getMicroredById(id);
      const microred = response.data;
      
      // Una microred puede ser eliminada si no tiene centros de acopio asociados
      return !microred?._count?.centrosAcopio || microred._count.centrosAcopio === 0;
    } catch (error) {
      console.error('Error checking if microred can be deleted:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de una microred
   */
  async getMicroredStats(id: string): Promise<{
    centrosAcopio: number;
    establecimientos: number;
  }> {
    try {
      const response = await this.getMicroredById(id);
      const microred = response.data;
      
      return {
        centrosAcopio: microred?._count?.centrosAcopio || 0,
        establecimientos: microred?._count?.establecimientos || 0,
      };
    } catch (error) {
      console.error('Error fetching microred stats:', error);
      return {
        centrosAcopio: 0,
        establecimientos: 0,
      };
    }
  }

  /**
   * Exportar microredes a CSV
   */
  async exportMicroredesCSV(filters?: MicroredFilters): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.redId) queryParams.append('redId', filters.redId);
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.search) queryParams.append('search', filters.search);
      queryParams.append('format', 'csv');

      const response = await fetch(`${API_BASE_URL}/microredes/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting microredes to CSV:', error);
      throw error;
    }
  }

  /**
   * Importar microredes desde CSV
   */
  async importMicroredesCSV(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/microredes/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sivac_auth_token')}`,
        },
        body: formData,
      });

      return await this.handleResponse<{ imported: number; errors: string[] }>(response);
    } catch (error) {
      console.error('Error importing microredes from CSV:', error);
      throw error;
    }
  }
}

// Crear instancia singleton del servicio
const microredesService = new MicroredesService();

export default microredesService;
