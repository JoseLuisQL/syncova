import { prisma } from '@/config/database';
import { ServiceResult, ICentroAcopio, CreateCentroAcopioDto, UpdateCentroAcopioDto, EstadoGeneral } from '@/types';
import { createError } from '@/middleware/errorHandler';

/**
 * Servicio para gestión de centros de acopio
 */
export class CentroAcopioService {
  /**
   * Obtener todos los centros de acopio con filtros opcionales
   */
  static async getAll(filters?: {
    microredId?: string;
    redId?: string;
    estado?: EstadoGeneral | 'todos';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ centrosAcopio: ICentroAcopio[]; total: number }>> {
    try {
      const {
        microredId,
        redId,
        estado,
        search,
        page = 1,
        limit = 50
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (microredId) {
        where.microredId = microredId;
      }

      if (redId) {
        where.microred = {
          redId: redId
        };
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

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener centros de acopio con relaciones
      const [centrosAcopio, total] = await Promise.all([
        prisma.centroAcopio.findMany({
          where,
          include: {
            microred: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                red: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true
                  }
                }
              }
            },
            establecimientos: {
              select: {
                id: true,
                nombre: true,
                tipo: true,
                codigo: true,
                estado: true
              }
            },
            _count: {
              select: {
                establecimientos: true
              }
            }
          },
          orderBy: [
            { microred: { red: { nombre: 'asc' } } },
            { microred: { nombre: 'asc' } },
            { nombre: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.centroAcopio.count({ where })
      ]);

      return {
        success: true,
        data: {
          centrosAcopio,
          total
        }
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
   * Obtener centro de acopio por ID
   */
  static async getById(id: string): Promise<ServiceResult<ICentroAcopio | null>> {
    try {
      const centroAcopio = await prisma.centroAcopio.findUnique({
        where: { id },
        include: {
          microred: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              red: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true
                }
              }
            }
          },
          establecimientos: {
            include: {
              _count: {
                select: {
                  usuarios: true,
                  planificaciones: true,
                  movimientos: true
                }
              }
            }
          },
          _count: {
            select: {
              establecimientos: true,
              valesEntrega: true
            }
          }
        }
      });

      return {
        success: true,
        data: centroAcopio
      };
    } catch (error) {
      console.error(`Error al obtener centro de acopio ${id}:`, error);
      return {
        success: false,
        error: 'Error al obtener centro de acopio'
      };
    }
  }

  /**
   * Obtener centros de acopio por microred
   */
  static async getByMicrored(microredId: string): Promise<ServiceResult<ICentroAcopio[]>> {
    try {
      const centrosAcopio = await prisma.centroAcopio.findMany({
        where: {
          microredId,
          estado: 'activo'
        },
        include: {
          _count: {
            select: {
              establecimientos: true
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
      console.error(`Error al obtener centros de acopio de la microred ${microredId}:`, error);
      return {
        success: false,
        error: 'Error al obtener centros de acopio de la microred'
      };
    }
  }

  /**
   * Obtener centros de acopio por red
   */
  static async getByRed(redId: string): Promise<ServiceResult<ICentroAcopio[]>> {
    try {
      const centrosAcopio = await prisma.centroAcopio.findMany({
        where: {
          microred: {
            redId: redId
          },
          estado: 'activo'
        },
        include: {
          microred: {
            select: {
              id: true,
              nombre: true
            }
          },
          _count: {
            select: {
              establecimientos: true
            }
          }
        },
        orderBy: [
          { microred: { nombre: 'asc' } },
          { nombre: 'asc' }
        ]
      });

      return {
        success: true,
        data: centrosAcopio
      };
    } catch (error) {
      console.error(`Error al obtener centros de acopio de la red ${redId}:`, error);
      return {
        success: false,
        error: 'Error al obtener centros de acopio de la red'
      };
    }
  }

  /**
   * Crear nuevo centro de acopio
   */
  static async create(data: CreateCentroAcopioDto): Promise<ServiceResult<ICentroAcopio>> {
    try {
      // Validaciones de negocio
      await this.validateCentroAcopioData(data);

      const centroAcopio = await prisma.centroAcopio.create({
        data: {
          nombre: data.nombre,
          codigo: data.codigo,
          microredId: data.microredId,
          direccion: data.direccion,
          responsable: data.responsable,
          telefono: data.telefono
        },
        include: {
          microred: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              red: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true
                }
              }
            }
          },
          _count: {
            select: {
              establecimientos: true
            }
          }
        }
      });

      return {
        success: true,
        data: centroAcopio
      };
    } catch (error) {
      console.error('Error al crear centro de acopio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear centro de acopio'
      };
    }
  }

  /**
   * Actualizar centro de acopio
   */
  static async update(id: string, data: UpdateCentroAcopioDto): Promise<ServiceResult<ICentroAcopio>> {
    try {
      // Verificar que el centro de acopio existe
      const existingCentroAcopio = await prisma.centroAcopio.findUnique({
        where: { id }
      });

      if (!existingCentroAcopio) {
        throw createError.notFound('Centro de acopio no encontrado');
      }

      // Validaciones de negocio para la actualización
      await this.validateCentroAcopioData(data, id);

      const centroAcopio = await prisma.centroAcopio.update({
        where: { id },
        data: {
          nombre: data.nombre,
          codigo: data.codigo,
          microredId: data.microredId,
          direccion: data.direccion,
          responsable: data.responsable,
          telefono: data.telefono,
          estado: data.estado
        },
        include: {
          microred: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
              red: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true
                }
              }
            }
          },
          _count: {
            select: {
              establecimientos: true
            }
          }
        }
      });

      return {
        success: true,
        data: centroAcopio
      };
    } catch (error) {
      console.error('Error al actualizar centro de acopio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar centro de acopio'
      };
    }
  }

  /**
   * Eliminar centro de acopio (soft delete)
   */
  static async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      // Verificar que el centro de acopio existe
      const centroAcopio = await prisma.centroAcopio.findUnique({
        where: { id },
        include: {
          establecimientos: true,
          valesEntrega: true
        }
      });

      if (!centroAcopio) {
        throw createError.notFound('Centro de acopio no encontrado');
      }

      // Verificar dependencias
      if (centroAcopio.establecimientos.length > 0) {
        throw createError.conflict('No se puede eliminar el centro de acopio porque tiene establecimientos asociados');
      }

      if (centroAcopio.valesEntrega.length > 0) {
        throw createError.conflict('No se puede eliminar el centro de acopio porque tiene vales de entrega registrados');
      }

      await prisma.centroAcopio.delete({
        where: { id }
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error al eliminar centro de acopio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar centro de acopio'
      };
    }
  }

  /**
   * Validaciones de negocio para centros de acopio
   */
  private static async validateCentroAcopioData(
    data: CreateCentroAcopioDto | UpdateCentroAcopioDto,
    excludeId?: string
  ): Promise<void> {
    // Validar que la microred existe si se proporciona
    if (data.microredId) {
      const microred = await prisma.microred.findUnique({
        where: { id: data.microredId }
      });

      if (!microred) {
        throw createError.badRequest('La microred especificada no existe');
      }

      if (microred.estado !== 'activo') {
        throw createError.badRequest('La microred debe estar activa');
      }
    }

    // Validar nombre único dentro de la microred
    if (data.nombre && data.microredId) {
      const existingByNombre = await prisma.centroAcopio.findFirst({
        where: {
          nombre: data.nombre,
          microredId: data.microredId
        }
      });

      if (existingByNombre && existingByNombre.id !== excludeId) {
        throw createError.conflict(`Ya existe un centro de acopio con el nombre "${data.nombre}" en esta microred`);
      }
    }

    // Validar código único si se proporciona
    if (data.codigo) {
      const existingByCodigo = await prisma.centroAcopio.findFirst({
        where: { codigo: data.codigo }
      });

      if (existingByCodigo && existingByCodigo.id !== excludeId) {
        throw createError.conflict(`Ya existe un centro de acopio con el código: ${data.codigo}`);
      }
    }
  }
}

export default CentroAcopioService;
