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

// Cache de jeringas activas — se carga 1 vez y se reutiliza
let _jeringasCache: any[] | null = null;
let _jeringasCacheTimestamp = 0;
const JERINGAS_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Servicio para manejar configuraciones de jeringas
 */
export class ConfiguracionJeringasService {

  /**
   * Obtener jeringas activas (con cache para evitar requests duplicados)
   */
  private static async getJeringasActivas(): Promise<any[]> {
    const now = Date.now();
    if (_jeringasCache && (now - _jeringasCacheTimestamp) < JERINGAS_CACHE_TTL) {
      return _jeringasCache;
    }

    try {
      const response = await apiClient.get('/jeringas?estado=activo');
      if (response.data.success) {
        _jeringasCache = response.data.data;
        _jeringasCacheTimestamp = now;
        return _jeringasCache!;
      }
    } catch (error) {
      console.error('❌ Error al obtener jeringas activas:', error);
    }
    return _jeringasCache || [];
  }

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

        // Enriquecer con información de jeringas (usa cache interna)
        const jeringasEnriquecidas = await this.enriquecerConInfoJeringas(response.data.data);

        return {
          success: true,
          data: jeringasEnriquecidas,
          message: response.data.message
        };
      } else {
        console.log(`⚠️ [ConfiguracionJeringasService] No se encontró configuración para vacuna: ${vacunaId}`);
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
   * Enriquecer datos de jeringas con información completa (usa cache)
   */
  private static async enriquecerConInfoJeringas(jeringas: JeringaCalculada[]): Promise<JeringaCalculada[]> {
    try {
      const jeringaIds = [...new Set(jeringas.map(j => j.jeringaId))];
      
      if (jeringaIds.length === 0) {
        return jeringas;
      }
      
      // Usa cache interna — solo 1 request en toda la sesión
      const jeringasCompletas = await this.getJeringasActivas();
      
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
   * Obtener configuración consolidada para múltiples vacunas.
   * Ejecuta en PARALELO (no secuencial) para máxima velocidad,
   * y usa cache de jeringas para evitar N requests de enriquecimiento.
   */
  static async obtenerConfiguracionConsolidada(
    vacunas: { vacunaId: string; cantidad: number }[],
    centroAcopioId?: string
  ): Promise<ApiResponse<{ [vacunaId: string]: JeringaCalculada[] }>> {
    try {
      // Pre-cargar cache de jeringas UNA sola vez antes de entrar al loop
      await this.getJeringasActivas();

      // Ejecutar TODAS las solicitudes en paralelo en vez de secuencial
      const results = await Promise.allSettled(
        vacunas.map(async (vacuna) => {
          const config = await this.calcularJeringasNecesarias(
            vacuna.vacunaId,
            vacuna.cantidad,
            centroAcopioId,
            false
          );
          return { vacunaId: vacuna.vacunaId, config };
        })
      );

      const configuraciones: { [vacunaId: string]: JeringaCalculada[] } = {};
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.config.success) {
          configuraciones[result.value.vacunaId] = result.value.config.data;
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
