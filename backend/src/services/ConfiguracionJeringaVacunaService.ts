import { prisma } from '@/config/database';
import { 
  ServiceResult, 
  IConfiguracionJeringaVacunaDefecto,
  IConfiguracionJeringaVacunaCentro,
  CreateConfiguracionDefectoDto,
  UpdateConfiguracionDefectoDto,
  CreateConfiguracionCentroDto,
  UpdateConfiguracionCentroDto,
  ConfiguracionJeringaVacunaFilters,
  ConfiguracionCalculada,
  JeringasCalculadas
} from '@/types';
import { createError } from '@/utils/errors';

/**
 * Servicio para gestión de configuraciones jeringa-vacuna
 * Maneja tanto configuraciones por defecto como específicas por centro de acopio
 */
export class ConfiguracionJeringaVacunaService {
  
  // =====================================================
  // CONFIGURACIONES POR DEFECTO
  // =====================================================

  /**
   * Obtener todas las configuraciones por defecto
   */
  static async getAllDefecto(filters?: ConfiguracionJeringaVacunaFilters): Promise<ServiceResult<{ configuraciones: IConfiguracionJeringaVacunaDefecto[]; total: number }>> {
    try {
      const {
        vacunaId,
        jeringaId,
        activo,
        search,
        page = 1,
        limit = 100
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (vacunaId) {
        where.vacunaId = vacunaId;
      }

      if (jeringaId) {
        where.jeringaId = jeringaId;
      }

      if (activo !== undefined) {
        where.activo = activo;
      }

      if (search) {
        where.OR = [
          { vacuna: { nombre: { contains: search, mode: 'insensitive' } } },
          { jeringa: { tipo: { contains: search, mode: 'insensitive' } } }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener configuraciones con relaciones
      const [configuraciones, total] = await Promise.all([
        prisma.configuracionJeringaVacunaDefecto.findMany({
          where,
          include: {
            vacuna: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                presentacion: true,
                dosisPorFrasco: true
              }
            },
            jeringa: {
              select: {
                id: true,
                tipo: true,
                capacidad: true,
                color: true
              }
            }
          },
          orderBy: [
            { vacuna: { nombre: 'asc' } },
            { prioridad: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.configuracionJeringaVacunaDefecto.count({ where })
      ]);

      return {
        success: true,
        data: { configuraciones, total },
        message: 'Configuraciones por defecto obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener configuraciones por defecto:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Crear nueva configuración por defecto
   */
  static async createDefecto(data: CreateConfiguracionDefectoDto): Promise<ServiceResult<IConfiguracionJeringaVacunaDefecto>> {
    try {
      // Validaciones de negocio
      await this.validateConfiguracionDefectoData(data);

      // Verificar que no exista la misma configuración
      const existingConfig = await prisma.configuracionJeringaVacunaDefecto.findUnique({
        where: {
          uk_vacuna_jeringa_defecto: {
            vacunaId: data.vacunaId,
            jeringaId: data.jeringaId
          }
        }
      });

      if (existingConfig) {
        throw createError('Ya existe una configuración para esta combinación de vacuna y jeringa', 400);
      }

      const configuracion = await prisma.configuracionJeringaVacunaDefecto.create({
        data: {
          ...data,
          prioridad: data.prioridad || 1,
          activo: data.activo !== undefined ? data.activo : true
        },
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true,
              dosisPorFrasco: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      return {
        success: true,
        data: configuracion,
        message: 'Configuración por defecto creada exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al crear configuración por defecto:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar configuración por defecto
   */
  static async updateDefecto(id: string, data: UpdateConfiguracionDefectoDto): Promise<ServiceResult<IConfiguracionJeringaVacunaDefecto>> {
    try {
      // Verificar que la configuración existe
      const existingConfig = await prisma.configuracionJeringaVacunaDefecto.findUnique({
        where: { id }
      });

      if (!existingConfig) {
        throw createError('Configuración no encontrada', 404);
      }

      // Validar datos de actualización
      if (data.multiplicador !== undefined && data.multiplicador < 0) {
        throw createError('El multiplicador debe ser mayor o igual a 0', 400);
      }

      if (data.prioridad !== undefined && data.prioridad <= 0) {
        throw createError('La prioridad debe ser mayor a 0', 400);
      }

      const configuracion = await prisma.configuracionJeringaVacunaDefecto.update({
        where: { id },
        data,
        include: {
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true,
              dosisPorFrasco: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      return {
        success: true,
        data: configuracion,
        message: 'Configuración por defecto actualizada exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al actualizar configuración por defecto:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar configuración por defecto
   */
  static async deleteDefecto(id: string): Promise<ServiceResult<void>> {
    try {
      const existingConfig = await prisma.configuracionJeringaVacunaDefecto.findUnique({
        where: { id }
      });

      if (!existingConfig) {
        throw createError('Configuración no encontrada', 404);
      }

      await prisma.configuracionJeringaVacunaDefecto.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Configuración por defecto eliminada exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al eliminar configuración por defecto:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  // =====================================================
  // CONFIGURACIONES POR CENTRO DE ACOPIO
  // =====================================================

  /**
   * Obtener todas las configuraciones por centro de acopio
   */
  static async getAllCentro(filters?: ConfiguracionJeringaVacunaFilters): Promise<ServiceResult<{ configuraciones: IConfiguracionJeringaVacunaCentro[]; total: number }>> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        jeringaId,
        activo,
        search,
        page = 1,
        limit = 100
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (centroAcopioId) {
        where.centroAcopioId = centroAcopioId;
      }

      if (vacunaId) {
        where.vacunaId = vacunaId;
      }

      if (jeringaId) {
        where.jeringaId = jeringaId;
      }

      if (activo !== undefined) {
        where.activo = activo;
      }

      if (search) {
        where.OR = [
          { centroAcopio: { nombre: { contains: search, mode: 'insensitive' } } },
          { vacuna: { nombre: { contains: search, mode: 'insensitive' } } },
          { jeringa: { tipo: { contains: search, mode: 'insensitive' } } }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener configuraciones con relaciones
      const [configuraciones, total] = await Promise.all([
        prisma.configuracionJeringaVacunaCentro.findMany({
          where,
          include: {
            centroAcopio: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            },
            vacuna: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                presentacion: true,
                dosisPorFrasco: true
              }
            },
            jeringa: {
              select: {
                id: true,
                tipo: true,
                capacidad: true,
                color: true
              }
            }
          },
          orderBy: [
            { centroAcopio: { nombre: 'asc' } },
            { vacuna: { nombre: 'asc' } },
            { prioridad: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.configuracionJeringaVacunaCentro.count({ where })
      ]);

      return {
        success: true,
        data: { configuraciones, total },
        message: 'Configuraciones por centro obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener configuraciones por centro:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Crear nueva configuración por centro de acopio
   */
  static async createCentro(data: CreateConfiguracionCentroDto): Promise<ServiceResult<IConfiguracionJeringaVacunaCentro>> {
    try {
      // Validaciones de negocio
      await this.validateConfiguracionCentroData(data);

      // Verificar que no exista la misma configuración
      const existingConfig = await prisma.configuracionJeringaVacunaCentro.findUnique({
        where: {
          uk_centro_vacuna_jeringa: {
            centroAcopioId: data.centroAcopioId,
            vacunaId: data.vacunaId,
            jeringaId: data.jeringaId
          }
        }
      });

      if (existingConfig) {
        throw createError('Ya existe una configuración para esta combinación de centro, vacuna y jeringa', 400);
      }

      const configuracion = await prisma.configuracionJeringaVacunaCentro.create({
        data: {
          ...data,
          prioridad: data.prioridad || 1,
          activo: data.activo !== undefined ? data.activo : true
        },
        include: {
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true,
              dosisPorFrasco: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      return {
        success: true,
        data: configuracion,
        message: 'Configuración por centro creada exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al crear configuración por centro:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  // =====================================================
  // VALIDACIONES PRIVADAS
  // =====================================================

  /**
   * Validar datos de configuración por defecto
   */
  private static async validateConfiguracionDefectoData(data: CreateConfiguracionDefectoDto): Promise<void> {
    // Verificar que la vacuna existe y está activa
    const vacuna = await prisma.vacuna.findUnique({
      where: { id: data.vacunaId }
    });

    if (!vacuna) {
      throw createError('La vacuna especificada no existe', 400);
    }

    if (vacuna.estado === 'inactivo') {
      throw createError('No se puede crear configuración para una vacuna inactiva', 400);
    }

    // Verificar que la jeringa existe y está activa
    const jeringa = await prisma.jeringa.findUnique({
      where: { id: data.jeringaId }
    });

    if (!jeringa) {
      throw createError('La jeringa especificada no existe', 400);
    }

    if (jeringa.estado === 'inactivo') {
      throw createError('No se puede crear configuración para una jeringa inactiva', 400);
    }

    // Validar multiplicador
    if (data.multiplicador < 0) {
      throw createError('El multiplicador debe ser mayor o igual a 0', 400);
    }

    // Validar prioridad si se proporciona
    if (data.prioridad !== undefined && data.prioridad <= 0) {
      throw createError('La prioridad debe ser mayor a 0', 400);
    }
  }

  /**
   * Validar datos de configuración por centro
   */
  private static async validateConfiguracionCentroData(data: CreateConfiguracionCentroDto): Promise<void> {
    // Verificar que el centro de acopio existe y está activo
    const centroAcopio = await prisma.centroAcopio.findUnique({
      where: { id: data.centroAcopioId }
    });

    if (!centroAcopio) {
      throw createError('El centro de acopio especificado no existe', 400);
    }

    if (centroAcopio.estado === 'inactivo') {
      throw createError('No se puede crear configuración para un centro de acopio inactivo', 400);
    }

    // Reutilizar validaciones de configuración por defecto
    await this.validateConfiguracionDefectoData({
      vacunaId: data.vacunaId,
      jeringaId: data.jeringaId,
      multiplicador: data.multiplicador,
      prioridad: data.prioridad
    });
  }

  // =====================================================
  // MÉTODOS DE CÁLCULO Y CONFIGURACIÓN
  // =====================================================

  /**
   * Obtener configuración efectiva para una vacuna en un centro específico
   * Aplica la lógica de fallback: centro específico -> defecto -> sistema
   */
  static async getConfiguracionEfectiva(
    vacunaId: string,
    centroAcopioId?: string,
    usarFallbackSistema: boolean = true
  ): Promise<ServiceResult<ConfiguracionCalculada[]>> {
    try {
      let configuraciones: ConfiguracionCalculada[] = [];

      // 1. Intentar obtener configuración específica del centro
      if (centroAcopioId) {
        const configCentro = await prisma.configuracionJeringaVacunaCentro.findMany({
          where: {
            centroAcopioId,
            vacunaId,
            activo: true
          },
          orderBy: { prioridad: 'asc' }
        });

        configuraciones = configCentro.map(config => ({
          vacunaId: config.vacunaId,
          jeringaId: config.jeringaId,
          multiplicador: Number(config.multiplicador),
          prioridad: config.prioridad,
          origen: 'centro' as const,
          configuracionId: config.id
        }));
      }

      // 2. Si no hay configuración específica, usar configuración por defecto
      if (configuraciones.length === 0) {
        const configDefecto = await prisma.configuracionJeringaVacunaDefecto.findMany({
          where: {
            vacunaId,
            activo: true
          },
          orderBy: { prioridad: 'asc' }
        });

        configuraciones = configDefecto.map(config => ({
          vacunaId: config.vacunaId,
          jeringaId: config.jeringaId,
          multiplicador: Number(config.multiplicador),
          prioridad: config.prioridad,
          origen: 'defecto' as const,
          configuracionId: config.id
        }));
      }

      // 3. Si no hay ninguna configuración y se permite fallback, usar configuración del sistema (1:1)
      if (configuraciones.length === 0 && usarFallbackSistema) {
        // Obtener la primera jeringa activa como fallback
        const jeringaFallback = await prisma.jeringa.findFirst({
          where: { estado: 'activo' },
          orderBy: { createdAt: 'asc' }
        });

        if (jeringaFallback) {
          configuraciones = [{
            vacunaId,
            jeringaId: jeringaFallback.id,
            multiplicador: 1.0,
            prioridad: 1,
            origen: 'sistema' as const,
            configuracionId: 'sistema-fallback'
          }];
        }
      }

      return {
        success: true,
        data: configuraciones,
        message: 'Configuración efectiva obtenida exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener configuración efectiva:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Calcular jeringas necesarias para una cantidad de vacunas
   */
  static async calcularJeringasNecesarias(
    vacunaId: string,
    cantidadVacunas: number,
    centroAcopioId?: string,
    usarFallbackSistema: boolean = false
  ): Promise<ServiceResult<JeringasCalculadas[]>> {
    try {
      // Obtener configuración efectiva (sin fallback automático para stock management)
      const configResult = await this.getConfiguracionEfectiva(vacunaId, centroAcopioId, usarFallbackSistema);

      if (!configResult.success || !configResult.data) {
        throw createError('No se pudo obtener la configuración efectiva', 500);
      }

      // Obtener información de la vacuna para calcular dosis
      const vacuna = await prisma.vacuna.findUnique({
        where: { id: vacunaId },
        select: { dosisPorFrasco: true }
      });

      if (!vacuna) {
        throw createError('Vacuna no encontrada', 404);
      }

      const totalDosis = cantidadVacunas * vacuna.dosisPorFrasco;

      // Obtener información completa de las jeringas
      const jeringasIds = configResult.data.map(config => config.jeringaId);
      const jeringas = await prisma.jeringa.findMany({
        where: {
          id: { in: jeringasIds }
        },
        select: {
          id: true,
          tipo: true,
          capacidad: true,
          color: true
        }
      });

      // Crear un mapa para acceso rápido a los datos de jeringas
      const jeringasMap = new Map(jeringas.map(j => [j.id, j]));

      // Calcular jeringas necesarias según configuración con información completa
      // CORRECCIÓN: El multiplicador debe aplicarse a la cantidad de vacunas, no a las dosis totales
      // Esto evita el bug donde se deducían 10x más jeringas de las necesarias
      const jeringasCalculadas: JeringasCalculadas[] = configResult.data
        .filter(config => config.multiplicador > 0)
        .map(config => {
          const jeringaInfo = jeringasMap.get(config.jeringaId);
          const cantidadJeringas = Math.ceil(cantidadVacunas * config.multiplicador);

          return {
            jeringaId: config.jeringaId,
            jeringa: jeringaInfo ? {
              id: jeringaInfo.id,
              tipo: jeringaInfo.tipo,
              capacidad: jeringaInfo.capacidad,
              color: jeringaInfo.color
            } : undefined,
            cantidad: cantidadJeringas,
            multiplicador: config.multiplicador,
            prioridad: config.prioridad,
            origen: config.origen
          };
        });

      return {
        success: true,
        data: jeringasCalculadas,
        message: 'Jeringas calculadas exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al calcular jeringas necesarias:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar configuración por centro
   */
  static async updateCentro(id: string, data: UpdateConfiguracionCentroDto): Promise<ServiceResult<IConfiguracionJeringaVacunaCentro>> {
    try {
      // Verificar que la configuración existe
      const existingConfig = await prisma.configuracionJeringaVacunaCentro.findUnique({
        where: { id }
      });

      if (!existingConfig) {
        throw createError('Configuración no encontrada', 404);
      }

      // Validar datos de actualización
      if (data.multiplicador !== undefined && data.multiplicador < 0) {
        throw createError('El multiplicador debe ser mayor o igual a 0', 400);
      }

      if (data.prioridad !== undefined && data.prioridad <= 0) {
        throw createError('La prioridad debe ser mayor a 0', 400);
      }

      const configuracion = await prisma.configuracionJeringaVacunaCentro.update({
        where: { id },
        data,
        include: {
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          vacuna: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              presentacion: true,
              dosisPorFrasco: true
            }
          },
          jeringa: {
            select: {
              id: true,
              tipo: true,
              capacidad: true,
              color: true
            }
          }
        }
      });

      return {
        success: true,
        data: configuracion,
        message: 'Configuración por centro actualizada exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al actualizar configuración por centro:', error);
      throw createError('Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar configuración por centro
   */
  static async deleteCentro(id: string): Promise<ServiceResult<void>> {
    try {
      const existingConfig = await prisma.configuracionJeringaVacunaCentro.findUnique({
        where: { id }
      });

      if (!existingConfig) {
        throw createError('Configuración no encontrada', 404);
      }

      await prisma.configuracionJeringaVacunaCentro.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Configuración por centro eliminada exitosamente'
      };
    } catch (error) {
      if (error.statusCode) throw error;
      console.error('Error al eliminar configuración por centro:', error);
      throw createError('Error interno del servidor', 500);
    }
  }
}
