import { AxiosError } from 'axios';
import { apiClient, apiClientLongTimeout, ApiResponse, buildQueryParams, handleApiError } from '../config/api';
import { IciDemidFilters, IciDemidImportPreview, IciDemidImportResult, IciDemidRegistro } from '../types';

export class IciDemidService {
  private static readonly BASE_PATH = '/ici-demid';

  static async getAniosDisponibles(): Promise<{ anios: number[] }> {
    try {
      const response = await apiClient.get<ApiResponse<{ anios: number[] }>>(`${this.BASE_PATH}/anios-disponibles`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener años disponibles');
      }
      return response.data.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  static async getAll(filters?: IciDemidFilters): Promise<{
    registros: IciDemidRegistro[];
    total: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const rawQuery = filters ? buildQueryParams(filters) : '';
      const query = rawQuery.startsWith('?') ? rawQuery.slice(1) : rawQuery;
      const response = await apiClient.get<ApiResponse<{
        registros: IciDemidRegistro[];
        total: number;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>>(`${this.BASE_PATH}${query ? `?${query}` : ''}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener registros ICI DEMID');
      }

      return {
        ...response.data.data,
        registros: response.data.data.registros.map((registro) => ({
          ...registro,
          createdAt: new Date(registro.createdAt),
          updatedAt: new Date(registro.updatedAt),
          fecExp: registro.fecExp ? new Date(registro.fecExp) : null,
        })),
      };
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  static async previewImport(file: File): Promise<IciDemidImportPreview> {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      const response = await apiClientLongTimeout.post<ApiResponse<IciDemidImportPreview>>(`${this.BASE_PATH}/preview-import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al previsualizar archivo');
      }

      return response.data.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  static async importar(file: File): Promise<IciDemidImportResult> {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      const response = await apiClientLongTimeout.post<ApiResponse<IciDemidImportResult>>(`${this.BASE_PATH}/importar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al importar archivo');
      }

      return response.data.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export default IciDemidService;
