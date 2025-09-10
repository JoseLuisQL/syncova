import { Red, CreateRedDto, UpdateRedDto, RedFilters } from '@/types';
import { getApiBaseUrl } from '../utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();

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

class RedesService {
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
   * Obtener todas las redes con filtros opcionales
   */
  async getRedes(filters?: RedFilters): Promise<ApiResponse<Red[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/redes?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<Red[]>(response);
    } catch (error) {
      console.error('Error fetching redes:', error);
      throw error;
    }
  }

  /**
   * Obtener red por ID
   */
  async getRedById(id: string): Promise<ApiResponse<Red>> {
    try {
      const response = await fetch(`${API_BASE_URL}/redes/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<Red>(response);
    } catch (error) {
      console.error('Error fetching red by id:', error);
      throw error;
    }
  }

  /**
   * Crear nueva red
   */
  async createRed(data: CreateRedDto): Promise<ApiResponse<Red>> {
    try {
      const response = await fetch(`${API_BASE_URL}/redes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse<Red>(response);
    } catch (error) {
      console.error('Error creating red:', error);
      throw error;
    }
  }

  /**
   * Actualizar red
   */
  async updateRed(id: string, data: UpdateRedDto): Promise<ApiResponse<Red>> {
    try {
      const response = await fetch(`${API_BASE_URL}/redes/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse<Red>(response);
    } catch (error) {
      console.error('Error updating red:', error);
      throw error;
    }
  }

  /**
   * Eliminar red
   */
  async deleteRed(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL}/redes/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<boolean>(response);
    } catch (error) {
      console.error('Error deleting red:', error);
      throw error;
    }
  }

  /**
   * Obtener redes activas para selectores
   */
  async getRedesActivas(): Promise<Red[]> {
    try {
      const response = await this.getRedes({ estado: 'activo', limit: 1000 });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching redes activas:', error);
      return [];
    }
  }

  /**
   * Buscar redes por nombre
   */
  async searchRedes(search: string): Promise<Red[]> {
    try {
      const response = await this.getRedes({ search, estado: 'activo', limit: 50 });
      return response.data || [];
    } catch (error) {
      console.error('Error searching redes:', error);
      return [];
    }
  }

  /**
   * Validar si una red puede ser eliminada
   */
  async canDeleteRed(id: string): Promise<boolean> {
    try {
      const response = await this.getRedById(id);
      const red = response.data;
      
      // Una red puede ser eliminada si no tiene microredes asociadas
      return !red?._count?.microredes || red._count.microredes === 0;
    } catch (error) {
      console.error('Error checking if red can be deleted:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de una red
   */
  async getRedStats(id: string): Promise<{
    microredes: number;
    centrosAcopio: number;
    establecimientos: number;
  }> {
    try {
      const response = await this.getRedById(id);
      const red = response.data;
      
      return {
        microredes: red?._count?.microredes || 0,
        centrosAcopio: red?._count?.centrosAcopio || 0,
        establecimientos: red?._count?.establecimientos || 0,
      };
    } catch (error) {
      console.error('Error fetching red stats:', error);
      return {
        microredes: 0,
        centrosAcopio: 0,
        establecimientos: 0,
      };
    }
  }

  /**
   * Exportar redes a CSV
   */
  async exportRedesCSV(filters?: RedFilters): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.search) queryParams.append('search', filters.search);
      queryParams.append('format', 'csv');

      const response = await fetch(`${API_BASE_URL}/redes/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting redes to CSV:', error);
      throw error;
    }
  }

  /**
   * Importar redes desde CSV
   */
  async importRedesCSV(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/redes/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sivac_auth_token')}`,
        },
        body: formData,
      });

      return await this.handleResponse<{ imported: number; errors: string[] }>(response);
    } catch (error) {
      console.error('Error importing redes from CSV:', error);
      throw error;
    }
  }
}

// Crear instancia singleton del servicio
const redesService = new RedesService();

export default redesService;
