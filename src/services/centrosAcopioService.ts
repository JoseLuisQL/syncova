import { CentroAcopio, CreateCentroAcopioDto, UpdateCentroAcopioDto, CentroAcopioFilters } from '../types';

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

class CentrosAcopioService {
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
   * Obtener todos los centros de acopio con filtros opcionales
   */
  async getCentrosAcopio(filters?: CentroAcopioFilters): Promise<ApiResponse<CentroAcopio[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.microredId) queryParams.append('microredId', filters.microredId);
      if (filters?.redId) queryParams.append('redId', filters.redId);
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/centros-acopio?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<CentroAcopio[]>(response);
    } catch (error) {
      console.error('Error fetching centros de acopio:', error);
      throw error;
    }
  }

  /**
   * Obtener centro de acopio por ID
   */
  async getCentroAcopioById(id: string): Promise<ApiResponse<CentroAcopio>> {
    try {
      const response = await fetch(`${API_BASE_URL}/centros-acopio/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<CentroAcopio>(response);
    } catch (error) {
      console.error('Error fetching centro de acopio by id:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo centro de acopio
   */
  async createCentroAcopio(data: CreateCentroAcopioDto): Promise<ApiResponse<CentroAcopio>> {
    try {
      const response = await fetch(`${API_BASE_URL}/centros-acopio`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse<CentroAcopio>(response);
    } catch (error) {
      console.error('Error creating centro de acopio:', error);
      throw error;
    }
  }

  /**
   * Actualizar centro de acopio
   */
  async updateCentroAcopio(id: string, data: UpdateCentroAcopioDto): Promise<ApiResponse<CentroAcopio>> {
    try {
      const response = await fetch(`${API_BASE_URL}/centros-acopio/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await this.handleResponse<CentroAcopio>(response);
    } catch (error) {
      console.error('Error updating centro de acopio:', error);
      throw error;
    }
  }

  /**
   * Eliminar centro de acopio
   */
  async deleteCentroAcopio(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${API_BASE_URL}/centros-acopio/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      return await this.handleResponse<boolean>(response);
    } catch (error) {
      console.error('Error deleting centro de acopio:', error);
      throw error;
    }
  }

  /**
   * Obtener centros de acopio activos para selectores
   */
  async getCentrosAcopioActivos(): Promise<CentroAcopio[]> {
    try {
      const response = await this.getCentrosAcopio({ estado: 'activo', limit: 1000 });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching centros de acopio activos:', error);
      return [];
    }
  }

  /**
   * Obtener centros de acopio por microred
   */
  async getCentrosAcopioByMicrored(microredId: string): Promise<CentroAcopio[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/centros-acopio/microred/${microredId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<CentroAcopio[]>(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching centros de acopio by microred:', error);
      return [];
    }
  }

  /**
   * Obtener centros de acopio por red
   */
  async getCentrosAcopioByRed(redId: string): Promise<CentroAcopio[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/centros-acopio/red/${redId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<CentroAcopio[]>(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching centros de acopio by red:', error);
      return [];
    }
  }

  /**
   * Buscar centros de acopio por nombre
   */
  async searchCentrosAcopio(search: string): Promise<CentroAcopio[]> {
    try {
      const response = await this.getCentrosAcopio({ search, estado: 'activo', limit: 50 });
      return response.data || [];
    } catch (error) {
      console.error('Error searching centros de acopio:', error);
      return [];
    }
  }

  /**
   * Validar si un centro de acopio puede ser eliminado
   */
  async canDeleteCentroAcopio(id: string): Promise<boolean> {
    try {
      const response = await this.getCentroAcopioById(id);
      const centro = response.data;
      
      // Un centro de acopio puede ser eliminado si no tiene establecimientos asociados
      return !centro?._count?.establecimientos || centro._count.establecimientos === 0;
    } catch (error) {
      console.error('Error checking if centro de acopio can be deleted:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de un centro de acopio
   */
  async getCentroAcopioStats(id: string): Promise<{
    establecimientos: number;
  }> {
    try {
      const response = await this.getCentroAcopioById(id);
      const centro = response.data;
      
      return {
        establecimientos: centro?._count?.establecimientos || 0,
      };
    } catch (error) {
      console.error('Error fetching centro de acopio stats:', error);
      return {
        establecimientos: 0,
      };
    }
  }

  /**
   * Exportar centros de acopio a CSV
   */
  async exportCentrosAcopioCSV(filters?: CentroAcopioFilters): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.microredId) queryParams.append('microredId', filters.microredId);
      if (filters?.redId) queryParams.append('redId', filters.redId);
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.search) queryParams.append('search', filters.search);
      queryParams.append('format', 'csv');

      const response = await fetch(`${API_BASE_URL}/centros-acopio/export?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting centros de acopio to CSV:', error);
      throw error;
    }
  }

  /**
   * Importar centros de acopio desde CSV
   */
  async importCentrosAcopioCSV(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/centros-acopio/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sivac_auth_token')}`,
        },
        body: formData,
      });

      return await this.handleResponse<{ imported: number; errors: string[] }>(response);
    } catch (error) {
      console.error('Error importing centros de acopio from CSV:', error);
      throw error;
    }
  }
}

// Crear instancia singleton del servicio
const centrosAcopioService = new CentrosAcopioService();

export default centrosAcopioService;
