import { prisma } from '@/config/database';
import { ServiceResult, IEstablecimiento, CreateEstablecimientoDto, UpdateEstablecimientoDto, TipoEstablecimiento, EstadoGeneral } from '@/types';
import { createError } from '@/middleware/errorHandler';

/**
 * Servicio para gestión de establecimientos
 */
export class EstablecimientoService {
  /**
   * Obtener todos los establecimientos con filtros opcionales
   */
  static async getAll(filters?: {
    tipo?: TipoEstablecimiento;
    estado?: EstadoGeneral | 'todos';
    search?: string;
    centroAcopioId?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ establecimientos: IEstablecimiento[]; total: number }>> {
    try {
      const {
        tipo,
        estado,
        search,
        centroAcopioId,
        page = 1,
        limit = 50
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (tipo) {
        // Filtrar solo tipos válidos (excluir centro_acopio que ya no existe)
        if (['centro_salud', 'puesto_salud', 'hospital'].includes(tipo)) {
          where.tipo = tipo;
        }
      }

      if (estado && estado !== 'todos') {
        where.estado = estado;
      }

      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
          { responsable: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (centroAcopioId) {
        where.centroAcopioId = centroAcopioId;
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener establecimientos con relaciones
      const [establecimientos, total] = await Promise.all([
        prisma.establecimiento.findMany({
          where,
          include: {
            centroAcopio: {
              select: {
                id: true,
                nombre: true,
                codigo: true
              }
            }
          },
          orderBy: [
            { tipo: 'asc' },
            { nombre: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.establecimiento.count({ where })
      ]);

      return {
        success: true,
        data: {
          establecimientos,
          total
        }
      };
    } catch (error) {
      console.error('Error al obtener establecimientos:', error);
      return {
        success: false,
        error: 'Error al obtener establecimientos'
      };
    }
  }

  /**
   * Obtener establecimiento por ID
   */
  static async getById(id: string): Promise<ServiceResult<IEstablecimiento | null>> {
    try {
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id },
        include: {
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          establecimientos: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              tipo: true,
              estado: true
            }
          }
        }
      });

      return {
        success: true,
        data: establecimiento
      };
    } catch (error) {
      console.error(`Error al obtener establecimiento ${id}:`, error);
      return {
        success: false,
        error: 'Error al obtener establecimiento'
      };
    }
  }

  /**
   * Obtener establecimiento por código
   */
  static async getByCodigo(codigo: string): Promise<ServiceResult<IEstablecimiento | null>> {
    try {
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { codigo },
        include: {
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          }
        }
      });

      return {
        success: true,
        data: establecimiento
      };
    } catch (error) {
      console.error(`Error al obtener establecimiento por código ${codigo}:`, error);
      return {
        success: false,
        error: 'Error al obtener establecimiento'
      };
    }
  }

  /**
   * Obtener centros de acopio (ahora desde la tabla centros_acopio)
   */
  static async getCentrosAcopio(): Promise<ServiceResult<any[]>> {
    try {
      const centrosAcopio = await prisma.centroAcopio.findMany({
        where: {
          estado: 'activo'
        },
        include: {
          microred: {
            select: {
              id: true,
              nombre: true,
              red: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          }
        },
        orderBy: { nombre: 'asc' }
      });

      return {
        success: true,
        data: centrosAcopio
      };
    } catch (error) {
      console.error('Error al obtener centros de acopio:', error);
      return {
        success: false,
        error: 'Error al obtener centros de acopio'
      };
    }
  }

  /**
   * Obtener establecimientos por centro de acopio
   */
  static async getBycentroAcopio(centroAcopioId: string): Promise<ServiceResult<IEstablecimiento[]>> {
    try {
      const establecimientos = await prisma.establecimiento.findMany({
        where: {
          centroAcopioId
        },
        orderBy: [
          { tipo: 'asc' },
          { nombre: 'asc' }
        ]
      });

      return {
        success: true,
        data: establecimientos
      };
    } catch (error) {
      console.error(`Error al obtener establecimientos del centro de acopio ${centroAcopioId}:`, error);
      return {
        success: false,
        error: 'Error al obtener establecimientos del centro de acopio'
      };
    }
  }

  /**
   * Crear nuevo establecimiento
   */
  static async create(data: CreateEstablecimientoDto): Promise<ServiceResult<IEstablecimiento>> {
    try {
      // Validaciones de negocio
      await this.validateEstablecimientoData(data);

      const establecimiento = await prisma.establecimiento.create({
        data: {
          nombre: data.nombre,
          tipo: data.tipo,
          codigo: data.codigo,
          centroAcopioId: data.centroAcopioId,
          direccion: data.direccion,
          responsable: data.responsable,
          telefono: data.telefono
        },
        include: {
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          }
        }
      });

      return {
        success: true,
        data: establecimiento
      };
    } catch (error) {
      console.error('Error al crear establecimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear establecimiento'
      };
    }
  }

  /**
   * Actualizar establecimiento
   */
  static async update(id: string, data: UpdateEstablecimientoDto): Promise<ServiceResult<IEstablecimiento>> {
    try {
      // Verificar que el establecimiento existe
      const existingEstablecimiento = await prisma.establecimiento.findUnique({
        where: { id }
      });

      if (!existingEstablecimiento) {
        throw createError.notFound('Establecimiento no encontrado');
      }

      // Validaciones de negocio para la actualización
      await this.validateEstablecimientoData(data, id);

      const establecimiento = await prisma.establecimiento.update({
        where: { id },
        data: {
          nombre: data.nombre,
          tipo: data.tipo,
          codigo: data.codigo,
          centroAcopioId: data.centroAcopioId,
          direccion: data.direccion,
          responsable: data.responsable,
          telefono: data.telefono,
          estado: data.estado
        },
        include: {
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          }
        }
      });

      return {
        success: true,
        data: establecimiento
      };
    } catch (error) {
      console.error('Error al actualizar establecimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar establecimiento'
      };
    }
  }

  /**
   * Eliminar establecimiento (hard delete)
   */
  static async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      // Verificar que el establecimiento existe
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id },
        include: {
          establecimientos: true,
          usuarios: true,
          planificaciones: true,
          movimientos: true
        }
      });

      if (!establecimiento) {
        throw createError.notFound('Establecimiento no encontrado');
      }

      // Verificar dependencias
      if (establecimiento.establecimientos.length > 0) {
        throw createError.conflict('No se puede eliminar el establecimiento porque tiene establecimientos dependientes');
      }

      if (establecimiento.usuarios.length > 0) {
        throw createError.conflict('No se puede eliminar el establecimiento porque tiene usuarios asignados');
      }

      if (establecimiento.planificaciones.length > 0) {
        throw createError.conflict('No se puede eliminar el establecimiento porque tiene planificaciones asociadas');
      }

      if (establecimiento.movimientos.length > 0) {
        throw createError.conflict('No se puede eliminar el establecimiento porque tiene movimientos registrados');
      }

      await prisma.establecimiento.delete({
        where: { id }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error al eliminar establecimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar establecimiento'
      };
    }
  }

  /**
   * Validaciones de negocio para establecimientos
   */
  private static async validateEstablecimientoData(
    data: CreateEstablecimientoDto | UpdateEstablecimientoDto,
    excludeId?: string
  ): Promise<void> {
    // Validar código único
    if (data.codigo) {
      const existingByCodigo = await prisma.establecimiento.findUnique({
        where: { codigo: data.codigo }
      });

      if (existingByCodigo && existingByCodigo.id !== excludeId) {
        throw createError.conflict(`Ya existe un establecimiento con el código: ${data.codigo}`);
      }
    }

    // Validar centro de acopio (ahora es requerido para todos los establecimientos)
    if (data.centroAcopioId) {
      const centroAcopio = await prisma.centroAcopio.findUnique({
        where: { id: data.centroAcopioId }
      });

      if (!centroAcopio) {
        throw createError.badRequest('El centro de acopio especificado no existe');
      }

      if (centroAcopio.estado !== 'activo') {
        throw createError.badRequest('El centro de acopio debe estar activo');
      }
    } else {
      // centroAcopioId es requerido para todos los establecimientos
      throw createError.badRequest('Todos los establecimientos deben tener un centro de acopio asignado');
    }
  }
}

export default EstablecimientoService;
