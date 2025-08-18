import { apiClient, ApiResponse } from '../config/api';

export interface JeringaCalculada {
  jeringaId: string;
  cantidad: number;
  multiplicador: number;
  prioridad: number;
  origen: 'centro' | 'defecto' | 'sistema';
  jeringa?: {
    id: string;
    tipo: string;
    capacidad: string;
    color: string;
  };
}

export interface ConfiguracionJeringaResponse {
  success: boolean;
  data: JeringaCalculada[];
  message: string;
}

/**
 * Servicio para manejar configuraciones de jeringas
 */
export class ConfiguracionJeringasService {
  
  /**
   * Calcular jeringas necesarias para una vacuna específica
   */
  static async calcularJeringasNecesarias(
    vacunaId: string,
    cantidadVacunas: number,
    centroAcopioId?: string,
    usarFallback: boolean = false
  ): Promise<ApiResponse<JeringaCalculada[]>> {
    try {
      console.log(`🔍 [ConfiguracionJeringasService] Calculando jeringas para vacuna: ${vacunaId}, cantidad: ${cantidadVacunas}, fallback: ${usarFallback}`);

      const params = new URLSearchParams({
        vacunaId,
        cantidadVacunas: cantidadVacunas.toString(),
        usarFallback: usarFallback.toString()
      });

      if (centroAcopioId) {
        params.append('centroAcopioId', centroAcopioId);
      }
      
      const response = await apiClient.get(`/configuracion-jeringa-vacuna/calcular?${params}`);

      if (response.data.success) {
        console.log(`✅ [ConfiguracionJeringasService] Configuración obtenida:`, response.data.data);

        // Enriquecer con información de jeringas si no está presente
        const jeringasEnriquecidas = await this.enriquecerConInfoJeringas(response.data.data);

        return {
          success: true,
          data: jeringasEnriquecidas,
          message: response.data.message
        };
      } else {
        console.log(`⚠️ [ConfiguracionJeringasService] No se encontró configuración para vacuna: ${vacunaId}`);
        // Para el modal, si no hay configuración específica, devolver array vacío
        // El modal mostrará un mensaje apropiado
        return {
          success: true,
          data: [],
          message: 'No se encontró configuración de jeringas para esta vacuna'
        };
      }
    } catch (error: any) {
      console.error('❌ [ConfiguracionJeringasService] Error al calcular jeringas:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.error || 'Error al obtener configuración de jeringas'
      };
    }
  }
  
  /**
   * Enriquecer datos de jeringas con información completa
   */
  private static async enriquecerConInfoJeringas(jeringas: JeringaCalculada[]): Promise<JeringaCalculada[]> {
    try {
      // Obtener IDs únicos de jeringas
      const jeringaIds = [...new Set(jeringas.map(j => j.jeringaId))];
      
      if (jeringaIds.length === 0) {
        return jeringas;
      }
      
      // Obtener información completa de jeringas
      const jeringasResponse = await apiClient.get('/jeringas?estado=activo');
      
      if (jeringasResponse.data.success) {
        const jeringasCompletas = jeringasResponse.data.data;
        
        // Mapear información completa
        return jeringas.map(jeringa => {
          const jeringaCompleta = jeringasCompletas.find((j: any) => j.id === jeringa.jeringaId);
          
          return {
            ...jeringa,
            jeringa: jeringaCompleta ? {
              id: jeringaCompleta.id,
              tipo: jeringaCompleta.tipo,
              capacidad: jeringaCompleta.capacidad,
              color: jeringaCompleta.color
            } : undefined
          };
        });
      }
      
      return jeringas;
    } catch (error) {
      console.error('❌ Error al enriquecer información de jeringas:', error);
      return jeringas; // Devolver datos originales en caso de error
    }
  }
  
  /**
   * Verificar si existe configuración para una vacuna
   */
  static async tieneConfiguracion(
    vacunaId: string,
    centroAcopioId?: string
  ): Promise<boolean> {
    try {
      const result = await this.calcularJeringasNecesarias(vacunaId, 1, centroAcopioId, false);
      return result.success && result.data.length > 0;
    } catch (error) {
      console.error('❌ Error al verificar configuración:', error);
      return false;
    }
  }
  
  /**
   * Obtener configuración consolidada para múltiples vacunas
   */
  static async obtenerConfiguracionConsolidada(
    vacunas: { vacunaId: string; cantidad: number }[],
    centroAcopioId?: string
  ): Promise<ApiResponse<{ [vacunaId: string]: JeringaCalculada[] }>> {
    try {
      const configuraciones: { [vacunaId: string]: JeringaCalculada[] } = {};
      
      for (const vacuna of vacunas) {
        const config = await this.calcularJeringasNecesarias(
          vacuna.vacunaId,
          vacuna.cantidad,
          centroAcopioId,
          false // NO usar fallback para el modal - solo configuraciones reales
        );

        if (config.success) {
          configuraciones[vacuna.vacunaId] = config.data;
        }
      }
      
      return {
        success: true,
        data: configuraciones,
        message: 'Configuraciones obtenidas exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        data: {},
        error: error.message || 'Error al obtener configuraciones consolidadas'
      };
    }
  }
}

export default ConfiguracionJeringasService;
