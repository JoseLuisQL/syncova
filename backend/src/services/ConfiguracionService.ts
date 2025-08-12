import { prisma } from '@/config/database';
import { ServiceResult, ConfiguracionSistema } from '@/types';
import { createError } from '@/middleware/errorHandler';

/**
 * Servicio para gestión de configuraciones del sistema
 */
export class ConfiguracionService {
  /**
   * Obtener todas las configuraciones públicas
   */
  static async getPublicConfigurations(): Promise<ServiceResult<ConfiguracionSistema[]>> {
    try {
      const configuraciones = await prisma.configuracionSistema.findMany({
        where: {
          esPublico: true,
        },
        orderBy: [
          { categoria: 'asc' },
          { clave: 'asc' },
        ],
      });

      return {
        success: true,
        data: configuraciones,
      };
    } catch (error) {
      console.error('Error al obtener configuraciones públicas:', error);
      return {
        success: false,
        error: 'Error al obtener configuraciones públicas',
      };
    }
  }

  /**
   * Obtener todas las configuraciones (solo para administradores)
   */
  static async getAllConfigurations(): Promise<ServiceResult<ConfiguracionSistema[]>> {
    try {
      const configuraciones = await prisma.configuracionSistema.findMany({
        orderBy: [
          { categoria: 'asc' },
          { clave: 'asc' },
        ],
      });

      return {
        success: true,
        data: configuraciones,
      };
    } catch (error) {
      console.error('Error al obtener todas las configuraciones:', error);
      return {
        success: false,
        error: 'Error al obtener configuraciones',
      };
    }
  }

  /**
   * Obtener configuración por clave
   */
  static async getByKey(clave: string): Promise<ServiceResult<ConfiguracionSistema | null>> {
    try {
      const configuracion = await prisma.configuracionSistema.findUnique({
        where: { clave },
      });

      return {
        success: true,
        data: configuracion,
      };
    } catch (error) {
      console.error(`Error al obtener configuración ${clave}:`, error);
      return {
        success: false,
        error: 'Error al obtener configuración',
      };
    }
  }

  /**
   * Obtener configuraciones por categoría
   */
  static async getByCategory(categoria: string): Promise<ServiceResult<ConfiguracionSistema[]>> {
    try {
      const configuraciones = await prisma.configuracionSistema.findMany({
        where: { categoria },
        orderBy: { clave: 'asc' },
      });

      return {
        success: true,
        data: configuraciones,
      };
    } catch (error) {
      console.error(`Error al obtener configuraciones de categoría ${categoria}:`, error);
      return {
        success: false,
        error: 'Error al obtener configuraciones por categoría',
      };
    }
  }

  /**
   * Crear nueva configuración
   */
  static async create(data: {
    clave: string;
    valor: string;
    descripcion?: string;
    tipoDato?: string;
    categoria?: string;
    esPublico?: boolean;
  }): Promise<ServiceResult<ConfiguracionSistema>> {
    try {
      // Verificar que la clave no exista
      const existingConfig = await prisma.configuracionSistema.findUnique({
        where: { clave: data.clave },
      });

      if (existingConfig) {
        throw createError.conflict(`Ya existe una configuración con la clave: ${data.clave}`);
      }

      const configuracion = await prisma.configuracionSistema.create({
        data: {
          clave: data.clave,
          valor: data.valor,
          descripcion: data.descripcion,
          tipoDato: data.tipoDato || 'string',
          categoria: data.categoria || 'general',
          esPublico: data.esPublico || false,
        },
      });

      return {
        success: true,
        data: configuracion,
      };
    } catch (error) {
      console.error('Error al crear configuración:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear configuración',
      };
    }
  }

  /**
   * Actualizar configuración
   */
  static async update(
    id: string,
    data: {
      valor?: string;
      descripcion?: string;
      tipoDato?: string;
      categoria?: string;
      esPublico?: boolean;
    }
  ): Promise<ServiceResult<ConfiguracionSistema>> {
    try {
      // Verificar que la configuración existe
      const existingConfig = await prisma.configuracionSistema.findUnique({
        where: { id },
      });

      if (!existingConfig) {
        throw createError.notFound('Configuración no encontrada');
      }

      const configuracion = await prisma.configuracionSistema.update({
        where: { id },
        data: {
          valor: data.valor,
          descripcion: data.descripcion,
          tipoDato: data.tipoDato,
          categoria: data.categoria,
          esPublico: data.esPublico,
        },
      });

      return {
        success: true,
        data: configuracion,
      };
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar configuración',
      };
    }
  }

  /**
   * Actualizar valor de configuración por clave
   */
  static async updateByKey(clave: string, valor: string): Promise<ServiceResult<ConfiguracionSistema>> {
    try {
      const configuracion = await prisma.configuracionSistema.update({
        where: { clave },
        data: { valor },
      });

      return {
        success: true,
        data: configuracion,
      };
    } catch (error) {
      console.error(`Error al actualizar configuración ${clave}:`, error);
      return {
        success: false,
        error: 'Error al actualizar configuración',
      };
    }
  }

  /**
   * Eliminar configuración
   */
  static async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      await prisma.configuracionSistema.delete({
        where: { id },
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      return {
        success: false,
        error: 'Error al eliminar configuración',
      };
    }
  }

  /**
   * Obtener valor de configuración por clave (helper)
   */
  static async getValue(clave: string, defaultValue?: string): Promise<string | null> {
    try {
      const result = await this.getByKey(clave);
      
      if (result.success && result.data) {
        return result.data.valor;
      }
      
      return defaultValue || null;
    } catch (error) {
      console.error(`Error al obtener valor de configuración ${clave}:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Obtener valor de configuración como número
   */
  static async getNumberValue(clave: string, defaultValue?: number): Promise<number | null> {
    try {
      const valor = await this.getValue(clave);
      
      if (valor !== null) {
        const numero = parseFloat(valor);
        return isNaN(numero) ? defaultValue || null : numero;
      }
      
      return defaultValue || null;
    } catch (error) {
      console.error(`Error al obtener valor numérico de configuración ${clave}:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Obtener valor de configuración como booleano
   */
  static async getBooleanValue(clave: string, defaultValue?: boolean): Promise<boolean | null> {
    try {
      const valor = await this.getValue(clave);
      
      if (valor !== null) {
        return valor.toLowerCase() === 'true' || valor === '1';
      }
      
      return defaultValue || null;
    } catch (error) {
      console.error(`Error al obtener valor booleano de configuración ${clave}:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Obtener configuraciones iniciales del sistema
   */
  static async getSystemInfo(): Promise<ServiceResult<any>> {
    try {
      const configuraciones = await this.getPublicConfigurations();
      
      if (!configuraciones.success || !configuraciones.data) {
        return {
          success: false,
          error: 'Error al obtener información del sistema',
        };
      }

      // Convertir array a objeto para fácil acceso
      const configObj: Record<string, any> = {};
      configuraciones.data.forEach(config => {
        let valor: any = config.valor;
        
        // Convertir según el tipo de dato
        switch (config.tipoDato) {
          case 'number':
            valor = parseFloat(config.valor);
            break;
          case 'boolean':
            valor = config.valor.toLowerCase() === 'true' || config.valor === '1';
            break;
          case 'json':
            try {
              valor = JSON.parse(config.valor);
            } catch {
              valor = config.valor;
            }
            break;
          default:
            valor = config.valor;
        }
        
        configObj[config.clave] = valor;
      });

      return {
        success: true,
        data: {
          configuraciones: configObj,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error al obtener información del sistema:', error);
      return {
        success: false,
        error: 'Error al obtener información del sistema',
      };
    }
  }
}

export default ConfiguracionService;
