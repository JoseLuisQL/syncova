import { apiClient } from '../config/api';
import { ApiResponse } from '../types/api';

/**
 * Interfaces for Ajuste de Entregas
 */
export interface EstablecimientoParaAjuste {
  id: string;
  movimientoId: string;
  establecimientoId: string;
  establecimientoNombre: string;
  establecimientoCodigo: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  centroAcopioCodigo: string;
  entregaActual: number;
  saldoAnterior: number;
  tieneValeGenerado: boolean;
  valeNumero: string | null;
}

export interface CentroAcopioAgrupado {
  centroAcopioId: string;
  centroAcopioNombre: string;
  centroAcopioCodigo: string;
  tieneValeGenerado: boolean;
  valeNumero: string | null;
  establecimientos: EstablecimientoParaAjuste[];
  totalEntregas: number;
}

export interface AjusteIndividual {
  movimientoId: string;
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  entregaAntes: number;
  entregaDespues: number;
  diferencia: number;
  bloqueado: boolean;
}

export interface OpcionAjuste {
  id: string;
  nombre: string;
  descripcion: string;
  esRecomendada: boolean;
  resultadoDeficit: number;
  ajustes: AjusteIndividual[];
  totalAntes: number;
  totalDespues: number;
  reduccionTotal: number;
}

export interface DatosAjusteEntregas {
  vacunaId: string;
  vacunaNombre: string;
  mes: number;
  anio: number;
  stockInicial: number;
  totalEntregas: number;
  deficit: number;
  centrosAcopio: CentroAcopioAgrupado[];
  establecimientosAjustables: number;
  establecimientosBloqueados: number;
  puedeAjustar: boolean;
  motivoNoPuedeAjustar: string | null;
}

export interface EjecutarAjusteDto {
  vacunaId: string;
  mes: number;
  anio: number;
  ajustes: Array<{
    movimientoId: string;
    entregaNueva: number;
  }>;
  usuarioId: string;
}

export interface VerificacionDisponibilidad {
  disponible: boolean;
  motivo: string | null;
}

export interface ResultadoEjecucion {
  movimientosActualizados: number;
  mensaje: string;
}

/**
 * Service for automatic delivery adjustments API calls
 */
export const AjusteEntregasService = {
  /**
   * Get data for the adjustment modal
   */
  async obtenerDatosParaAjuste(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ApiResponse<DatosAjusteEntregas>> {
    try {
      const response = await apiClient.get<ApiResponse<DatosAjusteEntregas>>(
        `/movimientos/ajuste-entregas/datos/${vacunaId}/${mes}/${anio}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo datos para ajuste:', error);
      throw error;
    }
  },

  /**
   * Check if adjustment is available
   */
  async verificarDisponibilidad(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ApiResponse<VerificacionDisponibilidad>> {
    try {
      const response = await apiClient.get<ApiResponse<VerificacionDisponibilidad>>(
        `/movimientos/ajuste-entregas/verificar/${vacunaId}/${mes}/${anio}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error verificando disponibilidad:', error);
      throw error;
    }
  },

  /**
   * Calculate adjustment options
   */
  async calcularOpcionesAjuste(
    datos: DatosAjusteEntregas
  ): Promise<ApiResponse<OpcionAjuste[]>> {
    try {
      const response = await apiClient.post<ApiResponse<OpcionAjuste[]>>(
        '/movimientos/ajuste-entregas/calcular-opciones',
        datos
      );
      return response.data;
    } catch (error: any) {
      console.error('Error calculando opciones de ajuste:', error);
      throw error;
    }
  },

  /**
   * Execute adjustment
   */
  async ejecutarAjuste(
    dto: EjecutarAjusteDto
  ): Promise<ApiResponse<ResultadoEjecucion>> {
    try {
      const response = await apiClient.post<ApiResponse<ResultadoEjecucion>>(
        '/movimientos/ajuste-entregas/ejecutar',
        dto
      );
      return response.data;
    } catch (error: any) {
      console.error('Error ejecutando ajuste:', error);
      throw error;
    }
  }
};
