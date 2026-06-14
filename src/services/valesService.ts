import { ApiResponse } from '../types';
import { apiClient, apiClientLongTimeout } from '../config/api';

/**
 * Interfaces para el módulo de Vales de Entrega
 */
export interface ValeEntrega {
  id: string;
  numero: string;
  centroAcopioId: string;
  mes: number;
  anio: number;
  fechaGeneracion: Date;
  estado: 'generado' | 'impreso' | 'entregado';
  totalVacunas: number;
  totalEstablecimientos: number;
  usuarioId: string;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
  };
  usuario: {
    id: string;
    nombres: string;
    apellidos: string;
  };
  detalles: ValeDetalle[];
}

export interface ValeDetalle {
  id: string;
  valeEntregaId: string;
  establecimientoId: string;
  vacunaId: string;
  cantidadProgramada: number;
  cantidadAdicional: number;
  cantidadTotal: number;
  numeroEntregaAdicional?: number;
  createdAt: Date;
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    presentacion: string;
    dosisPorFrasco: number;
  };
}

export interface GenerarValeDto {
  centroAcopioId: string;
  mes: number;
  anio: number;
  usuarioId: string;
  observaciones?: string;
  afectarStock?: boolean;
  tipoVale?: 'solo_base' | 'solo_adicionales';
  entregasAdicionalesSeleccionadas?: string[]; // IDs de entregas adicionales específicas (compatibilidad)
  gruposEntregasSeleccionados?: number[]; // Números de grupos de entregas adicionales
}

export interface ValesFilters {
  centroAcopioId?: string;
  mes?: number;
  anio?: number;
  estado?: 'generado' | 'impreso' | 'entregado';
  search?: string;
  page?: number;
  limit?: number;
}

export interface ModificacionVale {
  tipo: 'cantidad_programada_modificada' | 'entrega_adicional_modificada' | 'entrega_adicional_agregada' | 'establecimiento_agregado' | 'detalle_eliminado';
  establecimientoId: string;
  establecimientoNombre: string;
  vacunaId: string;
  vacunaNombre: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  diferencia: number;
  numeroEntregaAdicional?: number;
  fechaModificacion: Date;
}

export interface SincronizacionValeResponse {
  valeActualizado: ValeEntrega;
  modificaciones: ModificacionVale[];
  stocksAfectados: {
    vacunas: any[];
    jeringas: any[];
  };
}

export interface EntregaAdicionalInfo {
  id: string;
  numeroEntrega: number;
  cantidad: number;
  fechaEntrega: Date;
  motivo?: string;
  establecimientoId: string;
  establecimientoNombre: string;
  vacunaId: string;
  vacunaNombre: string;
}

export interface GrupoEntregaAdicional {
  numeroEntrega: number;
  totalVacunas: number;
  totalEstablecimientos: number;
  entregas: EntregaAdicionalInfo[];
}

export interface ValeTypeSelectionConfig {
  tipoVale: 'solo_base' | 'solo_adicionales';
  entregasAdicionalesSeleccionadas: string[]; // Mantener para compatibilidad
  gruposEntregasSeleccionados: number[]; // Nuevos grupos por número
}

export interface ResumenGeneracion {
  vale: ValeEntrega;
  stocksAfectadosVacunas: StockAfectacion[];
  stocksAfectadosJeringas: StockAfectacion[];
  errores: string[];
  resumen: {
    totalVacunas: number;
    totalEstablecimientos: number;
    totalDetalles: number;
  };
}

export interface StockAfectacion {
  loteId: string;
  cantidadAfectada: number;
  saldoAnterior: number;
  saldoNuevo: number;
}

export interface LoteVacunaImpacto {
  id: string;
  numero: string;
  cantidadActual: number;
  cantidadDespues: number;
  fechaVencimiento: Date;
}

export interface LoteJeringaImpacto {
  id: string;
  tipo: string;
  capacidad: string;
  numero: string;
  cantidadActual: number;
  cantidadDespues: number;
}

export interface ValeAfectadoImpacto {
  id: string;
  numero: string;
  fechaGeneracion: Date;
  cantidadAnterior: number;
  cantidadNueva: number;
}

export interface ImpactoModificacion {
  resumen: {
    establecimientoNombre: string;
    vacunaNombre: string;
    cantidadActual: number;
    cantidadNueva: number;
    diferencia: number;
  };
  impactoVacunas: {
    diferencia: number;
    accion: 'restaurar' | 'deducir';
    lotesAfectados: LoteVacunaImpacto[];
    stockTotalActual: number;
    stockTotalDespues: number;
  };
  impactoJeringas: {
    diferencia: number;
    accion: 'restaurar' | 'deducir';
    lotesAfectados: LoteJeringaImpacto[];
    stockTotalActual: number;
    stockTotalDespues: number;
  };
  kardex: {
    registrosNuevos: number;
    tipoMovimiento: 'ingreso' | 'salida';
  };
  valesAfectados: ValeAfectadoImpacto[];
  advertencias: string[];
}

export interface VistaPrevia {
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
  };
  mes: number;
  anio: number;
  detalles: ValeDetalle[];
  consolidado: {
    totalVacunas: number;
    totalEstablecimientos: number;
    vacunasPorEstablecimiento: {
      [establecimientoId: string]: {
        establecimiento: {
          id: string;
          nombre: string;
          codigo: string;
        };
        vacunas: {
          [vacunaId: string]: {
            vacuna: {
              id: string;
              nombre: string;
              presentacion: string;
              dosisPorFrasco: number;
            };
            cantidadTotal: number;
            jeringasNecesarias: number;
          };
        };
      };
    };
  };
}

/**
 * Servicio para gestión de Vales de Entrega
 * Módulo 11: VALES DE ENTREGA
 */
export class ValesService {
  private static readonly BASE_URL = '/vales';

  /**
   * Obtener vales con filtros
   */
  static async getVales(filters: ValesFilters = {}): Promise<ApiResponse<{ vales: ValeEntrega[]; total: number }>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.centroAcopioId) params.append('centroAcopioId', filters.centroAcopioId);
      if (filters.mes) params.append('mes', filters.mes.toString());
      if (filters.anio) params.append('anio', filters.anio.toString());
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get(`${this.BASE_URL}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener vales:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener vales'
      };
    }
  }

  /**
   * Obtener vale por ID
   */
  static async getValeById(id: string): Promise<ApiResponse<ValeEntrega>> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener vale:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener vale'
      };
    }
  }

  /**
   * Generar vale de entrega
   */
  static async generarVale(data: GenerarValeDto): Promise<ApiResponse<ResumenGeneracion>> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/generar`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error al generar vale:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al generar vale'
      };
    }
  }

  /**
   * Obtener vista previa de vale
   */
  static async getVistaPrevia(centroAcopioId: string, mes: number, anio: number): Promise<ApiResponse<VistaPrevia>> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/vista-previa`, {
        centroAcopioId,
        mes,
        anio
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener vista previa:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener vista previa'
      };
    }
  }

  /**
   * Eliminar vale
   */
  static async deleteVale(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar vale:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar vale'
      };
    }
  }

  /**
   * Revertir vale a estado pendiente
   */
  static async revertirVale(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // Usar cliente con timeout largo para operaciones que pueden tomar más tiempo
      const response = await apiClientLongTimeout.post(`${this.BASE_URL}/${id}/revertir`);
      return response.data;
    } catch (error: any) {
      console.error('Error al revertir vale:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al revertir vale'
      };
    }
  }

  /**
   * Cambiar estado de vale
   */
  static async cambiarEstado(id: string, estado: 'generado' | 'impreso' | 'entregado'): Promise<ApiResponse<ValeEntrega>> {
    try {
      const response = await apiClient.patch(`${this.BASE_URL}/${id}/estado`, { estado });
      return response.data;
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar estado'
      };
    }
  }

  /**
   * Sincronizar vale con movimientos actualizados
   */
  static async sincronizarVale(id: string, usuarioId: string = 'temp-user-id'): Promise<ApiResponse<SincronizacionValeResponse>> {
    try {
      console.log(`🔄 [ValesService] Iniciando sincronización de vale: ${id}`);

      // Usar cliente con timeout largo para operaciones que pueden tomar más tiempo
      const response = await apiClientLongTimeout.post(`${this.BASE_URL}/${id}/sincronizar`, {
        usuarioId
      });

      console.log(`✅ [ValesService] Vale sincronizado exitosamente`);
      return response.data;
    } catch (error: any) {
      console.error('Error al sincronizar vale:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al sincronizar vale'
      };
    }
  }

  /**
   * Obtener historial de modificaciones de un vale
   */
  static async getModificaciones(id: string): Promise<ApiResponse<ModificacionVale[]>> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/${id}/modificaciones`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener modificaciones:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener modificaciones'
      };
    }
  }

  /**
   * Obtener tipos de vales ya generados para un período
   */
  static async getTiposValesGenerados(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/tipos-generados`, {
        params: { centroAcopioId, mes, anio }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener tipos de vales generados:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener tipos de vales generados'
      };
    }
  }

  /**
   * Obtener grupos de entregas adicionales ya generados en vales
   */
  static async getGruposEntregasAdicionalesGenerados(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ApiResponse<number[]>> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/grupos-entregas-generados`, {
        params: { centroAcopioId, mes, anio }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener grupos de entregas adicionales generados:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener grupos de entregas adicionales generados'
      };
    }
  }

  /**
   * Obtener entregas adicionales disponibles para un centro de acopio y período
   */
  static async getEntregasAdicionalesDisponibles(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ApiResponse<EntregaAdicionalInfo[]>> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/entregas-adicionales-disponibles`, {
        params: { centroAcopioId, mes, anio }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener entregas adicionales disponibles:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener entregas adicionales disponibles'
      };
    }
  }

  /**
   * Verificar si un vale necesita sincronización
   * (Compara las fechas de actualización del vale vs movimientos relacionados)
   */
  static async verificarNecesidadSincronizacion(_valeId: string): Promise<boolean> {
    try {
      // Por ahora retornamos false, pero en el futuro se podría implementar
      // una verificación más sofisticada comparando timestamps
      return false;
    } catch (error) {
      console.error('Error al verificar necesidad de sincronización:', error);
      return false;
    }
  }

  /**
   * Verificar si existen vales generados para un establecimiento específico
   * en un período determinado (para mostrar modal de confirmación)
   */
  static async verificarValesExistentes(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ApiResponse<{ existenVales: boolean; valesEncontrados: ValeEntrega[] }>> {
    try {
      console.log(`🔍 [ValesService] Verificando vales existentes para establecimiento ${establecimientoId}, vacuna ${vacunaId}, ${mes}/${anio}`);

      const response = await apiClient.get(`${this.BASE_URL}/verificar-existencia`, {
        params: { establecimientoId, vacunaId, mes, anio }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al verificar vales existentes:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al verificar vales existentes'
      };
    }
  }

  /**
   * Verificar existencia de vales para múltiples establecimientos×meses en UNA sola request.
   * Reemplaza N×12 llamadas individuales. Devuelve un Set de claves "establecimientoId-mes".
   */
  static async verificarValesExistentesBatch(
    vacunaId: string,
    anio: number,
    items: Array<{ establecimientoId: string; mes: number }>
  ): Promise<Set<string>> {
    try {
      if (items.length === 0) return new Set();

      const response = await apiClient.post<ApiResponse<{ claves: string[] }>>(
        `${this.BASE_URL}/verificar-existencia-batch`,
        { vacunaId, anio, items }
      );

      if (response.data.success && response.data.data) {
        return new Set(response.data.data.claves);
      }
      return new Set();
    } catch (error: any) {
      console.error('Error en verificarValesExistentesBatch:', error);
      return new Set();
    }
  }

  /**
   * SINCRONIZACIÓN AUTOMÁTICA EN TIEMPO REAL
   * Verifica y sincroniza vales automáticamente cuando detecta cambios
   * TEMPORALMENTE DESHABILITADA PARA EVITAR ERRORES
   */
  static async verificarYSincronizarAutomaticamente(
    establecimientoId: string,
    _vacunaId: string,
    mes: number,
    anio: number
  ): Promise<ApiResponse<{ valesSincronizados: number; modificaciones: number }>> {
    try {
      console.log(`🔄 [ValesService] Verificación automática (simulada) para ${establecimientoId}, ${mes}/${anio}`);

      // Retornar respuesta simulada por ahora
      return {
        success: true,
        data: {
          valesSincronizados: 0,
          modificaciones: 0
        }
      };
    } catch (error: any) {
      console.error('Error en verificación automática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en verificación automática'
      };
    }
  }

  /**
   * Sincronizar automáticamente todos los vales de un centro de acopio y período
   */
  static async sincronizarValesAutomaticamente(
    centroAcopioId: string,
    mes: number,
    anio: number
  ): Promise<ApiResponse<{ valesSincronizados: number; errores: string[] }>> {
    try {
      console.log(`🔄 [ValesService] Iniciando sincronización automática para centro ${centroAcopioId}, ${mes}/${anio}`);

      // Obtener vales del período
      const valesResponse = await this.getVales({
        centroAcopioId,
        mes,
        anio,
        estado: 'generado', // Solo sincronizar vales generados
        limit: 100
      });

      if (!valesResponse.success || !valesResponse.data) {
        return {
          success: false,
          error: 'Error al obtener vales para sincronización'
        };
      }

      const vales = valesResponse.data.vales;
      let valesSincronizados = 0;
      const errores: string[] = [];

      // Sincronizar cada vale
      for (const vale of vales) {
        try {
          const syncResponse = await this.sincronizarVale(vale.id);
          if (syncResponse.success) {
            valesSincronizados++;
            console.log(`✅ Vale ${vale.numero} sincronizado`);
          } else {
            errores.push(`Error en vale ${vale.numero}: ${syncResponse.error}`);
          }
        } catch (error) {
          errores.push(`Error en vale ${vale.numero}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      console.log(`✅ [ValesService] Sincronización automática completada. Vales sincronizados: ${valesSincronizados}`);

      return {
        success: true,
        data: {
          valesSincronizados,
          errores
        }
      };
    } catch (error: any) {
      console.error('Error en sincronización automática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en sincronización automática'
      };
    }
  }

  /**
   * Calcular el impacto de modificar una entrega sobre stocks y vales
   * Para mostrar información detallada en el modal de confirmación
   */
  static async calcularImpactoModificacion(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number,
    cantidadActual: number,
    cantidadNueva: number
  ): Promise<ApiResponse<ImpactoModificacion>> {
    try {
      console.log(`🔍 [ValesService] Calculando impacto de modificación para establecimiento ${establecimientoId}`);

      const response = await apiClient.get(`${this.BASE_URL}/calcular-impacto-modificacion`, {
        params: { establecimientoId, vacunaId, mes, anio, cantidadActual, cantidadNueva }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al calcular impacto de modificación:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al calcular impacto de modificación'
      };
    }
  }
}
