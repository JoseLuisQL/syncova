import { apiClient, ApiResponse } from '../config/api';

// Tipos
export const TIPOS_PERMISO = {
  MOVIMIENTOS_EDICION: 'movimientos_edicion',
  PLANIFICACION_EDICION: 'planificacion_edicion',
  EXPORTAR_EXCEL: 'exportar_excel',
} as const;

export type TipoPermisoOperativo = typeof TIPOS_PERMISO[keyof typeof TIPOS_PERMISO];

export interface PermisoInfo {
  habilitado: boolean;
  programado: boolean;
  fechaActivacion: string | null;
  fechaDesactivacion: string | null;
  esGlobal: boolean;
}

export interface UsuarioConPermisos {
  id: string;
  nombres: string;
  apellidos: string;
  usuario: string;
  email: string;
  estado: string;
  centroAcopio: { id: string; nombre: string } | null;
  centrosAcopioAsignados: Array<{ centroAcopio: { id: string; nombre: string } }>;
  permisos: {
    movimientos_edicion: PermisoInfo;
    planificacion_edicion: PermisoInfo;
    exportar_excel: PermisoInfo;
  };
}

export interface PermisosGlobales {
  movimientos_edicion: PermisoInfo;
  planificacion_edicion: PermisoInfo;
  exportar_excel: PermisoInfo;
}

export interface ResponsablesConPermisosResponse {
  usuarios: UsuarioConPermisos[];
  globales: PermisosGlobales;
}

export interface TogglePermisoDto {
  tipo: TipoPermisoOperativo;
  mes: number;
  anio: number;
  habilitado: boolean;
  usuarioId?: string | null;
  programado?: boolean;
  fechaActivacion?: string | null;
  fechaDesactivacion?: string | null;
}

export interface MisPermisos {
  movimientos_edicion: boolean;
  planificacion_edicion: boolean;
  exportar_excel: boolean;
}

export class PermisoOperativoService {
  private static readonly BASE_PATH = '/permisos-operativos';

  /**
   * Obtener responsables de acopio con sus permisos del período
   */
  static async getResponsablesConPermisos(mes: number, anio: number): Promise<ResponsablesConPermisosResponse> {
    const response = await apiClient.get<ApiResponse<ResponsablesConPermisosResponse>>(
      `${this.BASE_PATH}?mes=${mes}&anio=${anio}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al obtener responsables con permisos');
    }

    return response.data.data;
  }

  /**
   * Activar/desactivar un permiso operativo
   */
  static async togglePermiso(dto: TogglePermisoDto): Promise<void> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `${this.BASE_PATH}/toggle`,
      dto,
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al cambiar permiso');
    }
  }

  /**
   * Obtener mis permisos activos (para el usuario autenticado)
   */
  static async getMisPermisos(mes: number, anio: number): Promise<MisPermisos> {
    const response = await apiClient.get<ApiResponse<MisPermisos>>(
      `${this.BASE_PATH}/mis-permisos?mes=${mes}&anio=${anio}`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al obtener mis permisos');
    }

    return response.data.data;
  }

  /**
   * Procesar permisos programados (admin manual trigger)
   */
  static async procesarProgramados(): Promise<{ activados: number; desactivados: number }> {
    const response = await apiClient.post<ApiResponse<{ activados: number; desactivados: number }>>(
      `${this.BASE_PATH}/procesar-programados`,
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al procesar permisos');
    }

    return response.data.data;
  }
}
