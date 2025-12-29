import { prisma } from '@/config/database';
import { IUsuario, CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto, EstadoGeneral, RolUsuario, ServiceResult } from '@/types';
import { createError } from '@/middleware/errorHandler';
import { PasswordUtils } from '@/utils/password';
import { RoleService } from './RoleService';

/**
 * Servicio para gestión de usuarios
 */
export class UsuarioService {
  /**
   * Obtener todos los usuarios con filtros opcionales
   */
  static async getAll(filters?: {
    estado?: EstadoGeneral | 'todos';
    search?: string;
    rol?: RolUsuario | 'todos';
    establecimientoId?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResult<{ usuarios: IUsuario[]; total: number }>> {
    try {
      const {
        estado,
        search,
        rol,
        establecimientoId,
        page = 1,
        limit = 50
      } = filters || {};

      // Construir condiciones de filtro
      const where: any = {};

      if (estado && estado !== 'todos') {
        where.estado = estado;
      }

      if (rol && rol !== 'todos') {
        where.rol = rol;
      }

      if (establecimientoId) {
        where.establecimientoId = establecimientoId;
      }

      if (search) {
        where.OR = [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { usuario: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Calcular offset para paginación
      const offset = (page - 1) * limit;

      // Obtener usuarios con paginación
      const [usuarios, total] = await Promise.all([
        prisma.usuario.findMany({
          where,
          include: {
            establecimiento: {
              select: {
                id: true,
                nombre: true,
                tipo: true
              }
            }
          },
          orderBy: [
            { nombres: 'asc' },
            { apellidos: 'asc' }
          ],
          skip: offset,
          take: limit
        }),
        prisma.usuario.count({ where })
      ]);

      return {
        success: true,
        data: { usuarios, total }
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener usuarios'
      };
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getById(id: string): Promise<ServiceResult<IUsuario>> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id },
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        }
      });

      if (!usuario) {
        throw createError.notFound('Usuario no encontrado');
      }

      return {
        success: true,
        data: usuario
      };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener usuario'
      };
    }
  }

  /**
   * Obtener usuarios activos
   */
  static async getActivos(): Promise<ServiceResult<IUsuario[]>> {
    try {
      const usuarios = await prisma.usuario.findMany({
        where: { estado: 'activo' },
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        },
        orderBy: [
          { nombres: 'asc' },
          { apellidos: 'asc' }
        ]
      });

      return {
        success: true,
        data: usuarios
      };
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener usuarios activos'
      };
    }
  }

  /**
   * Obtener usuarios por rol
   */
  static async getByRol(rol: RolUsuario): Promise<ServiceResult<IUsuario[]>> {
    try {
      const usuarios = await prisma.usuario.findMany({
        where: { 
          rol,
          estado: 'activo'
        },
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        },
        orderBy: [
          { nombres: 'asc' },
          { apellidos: 'asc' }
        ]
      });

      return {
        success: true,
        data: usuarios
      };
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener usuarios por rol'
      };
    }
  }

  /**
   * Crear nuevo usuario
   */
  static async create(data: CreateUsuarioDto): Promise<ServiceResult<IUsuario>> {
    try {
      // Validaciones de negocio
      await this.validateUsuarioData(data);

      // Validar fortaleza de contraseña
      const passwordValidation = PasswordUtils.validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        throw createError.badRequest(`Contraseña inválida: ${passwordValidation.errors.join(', ')}`);
      }

      // Obtener el rol por código
      const roleResult = await RoleService.getByCodigo(data.rol);
      if (!roleResult.success || !roleResult.data) {
        throw createError.badRequest('Rol no encontrado');
      }

      // Mapear código de rol a enum RolUsuario para compatibilidad
      // Solo mapear si el código existe en el enum, sino usar 'operador' como valor por defecto
      let rolEnum: RolUsuario;

      switch (data.rol) {
        case 'administrador':
          rolEnum = 'administrador' as RolUsuario;
          break;
        case 'coordinador':
          rolEnum = 'coordinador' as RolUsuario;
          break;
        case 'responsable_acopio':
          rolEnum = 'responsable_acopio' as RolUsuario;
          break;
        case 'operador':
          rolEnum = 'operador' as RolUsuario;
          break;
        default:
          // Para roles personalizados que no están en el enum, usar 'operador' como valor por defecto
          rolEnum = 'operador' as RolUsuario;
          break;
      }

      // Encriptar contraseña
      const passwordHash = await PasswordUtils.hashPassword(data.password);

      const usuario = await prisma.usuario.create({
        data: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          email: data.email,
          usuario: data.usuario,
          passwordHash,
          rol: rolEnum, // Valor del enum para compatibilidad
          roleId: roleResult.data.id, // Nueva relación con tabla roles
          establecimientoId: data.establecimientoId
        },
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        }
      });

      return {
        success: true,
        data: usuario
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear usuario'
      };
    }
  }

  /**
   * Actualizar usuario
   */
  static async update(id: string, data: UpdateUsuarioDto): Promise<ServiceResult<IUsuario>> {
    try {
      // Verificar que el usuario existe
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { id }
      });

      if (!usuarioExistente) {
        throw createError.notFound('Usuario no encontrado');
      }

      // Validaciones de negocio para la actualización
      await this.validateUsuarioData(data, id);

      // Preparar datos de actualización
      const updateData: any = {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        usuario: data.usuario,
        establecimientoId: data.establecimientoId,
        estado: data.estado
      };

      // Si se está cambiando el rol, actualizar tanto rol como roleId
      if (data.rol) {
        updateData.rol = data.rol;
        
        // Buscar el role en la tabla roles y actualizar roleId
        const role = await prisma.role.findUnique({
          where: { codigo: data.rol }
        });
        
        if (role) {
          updateData.roleId = role.id;
        }
      }

      const usuario = await prisma.usuario.update({
        where: { id },
        data: updateData,
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        }
      });

      return {
        success: true,
        data: usuario
      };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar usuario'
      };
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { id }
      });

      if (!usuarioExistente) {
        throw createError.notFound('Usuario no encontrado');
      }

      // Verificar si el usuario tiene dependencias activas
      const [movimientos, entregas, vales] = await Promise.all([
        prisma.movimientoVacuna.count({ where: { usuarioId: id } }),
        prisma.entregaAdicional.count({ where: { usuarioId: id } }),
        prisma.valeEntrega.count({ where: { usuarioId: id } })
      ]);

      if (movimientos > 0 || entregas > 0 || vales > 0) {
        // Si tiene dependencias, solo desactivar
        await prisma.usuario.update({
          where: { id },
          data: { estado: 'inactivo' }
        });
      } else {
        // Si no tiene dependencias, eliminar físicamente
        await prisma.usuario.delete({
          where: { id }
        });
      }

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar usuario'
      };
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(id: string, data: ChangePasswordDto): Promise<ServiceResult<void>> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id }
      });

      if (!usuario) {
        throw createError.notFound('Usuario no encontrado');
      }

      // Si se proporciona contraseña actual, verificarla
      if (data.currentPassword) {
        const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
          data.currentPassword,
          usuario.passwordHash
        );

        if (!isCurrentPasswordValid) {
          throw createError.badRequest('Contraseña actual incorrecta');
        }
      }

      // Validar nueva contraseña
      const passwordValidation = PasswordUtils.validatePasswordStrength(data.newPassword);
      if (!passwordValidation.isValid) {
        throw createError.badRequest(`Nueva contraseña inválida: ${passwordValidation.errors.join(', ')}`);
      }

      // Encriptar nueva contraseña
      const newPasswordHash = await PasswordUtils.hashPassword(data.newPassword);

      await prisma.usuario.update({
        where: { id },
        data: { passwordHash: newPasswordHash }
      });

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar contraseña'
      };
    }
  }

  /**
   * Cambiar estado del usuario
   */
  static async changeEstado(id: string, estado: EstadoGeneral): Promise<ServiceResult<IUsuario>> {
    try {
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { id }
      });

      if (!usuarioExistente) {
        throw createError.notFound('Usuario no encontrado');
      }

      const usuario = await prisma.usuario.update({
        where: { id },
        data: { estado },
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          }
        }
      });

      return {
        success: true,
        data: usuario
      };
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar estado del usuario'
      };
    }
  }

  /**
   * Actualizar último acceso
   */
  static async updateUltimoAcceso(id: string): Promise<ServiceResult<void>> {
    try {
      await prisma.usuario.update({
        where: { id },
        data: { ultimoAcceso: new Date() }
      });

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error al actualizar último acceso:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar último acceso'
      };
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getStats(): Promise<ServiceResult<{
    total: number;
    activos: number;
    inactivos: number;
    porRol: Record<RolUsuario, number>;
    conectadosHoy: number;
  }>> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const [total, activos, inactivos, porRol, conectadosHoy] = await Promise.all([
        prisma.usuario.count(),
        prisma.usuario.count({ where: { estado: 'activo' } }),
        prisma.usuario.count({ where: { estado: 'inactivo' } }),
        prisma.usuario.groupBy({
          by: ['rol'],
          _count: { rol: true }
        }),
        prisma.usuario.count({
          where: {
            ultimoAcceso: {
              gte: hoy
            }
          }
        })
      ]);

      const rolStats = porRol.reduce((acc, item) => {
        acc[item.rol] = item._count.rol;
        return acc;
      }, {} as Record<RolUsuario, number>);

      // Asegurar que todos los roles estén presentes
      const rolesCompletos: Record<RolUsuario, number> = {
        administrador: rolStats.administrador || 0,
        coordinador: rolStats.coordinador || 0,
        responsable_acopio: rolStats.responsable_acopio || 0,
        operador: rolStats.operador || 0
      };

      return {
        success: true,
        data: {
          total,
          activos,
          inactivos,
          porRol: rolesCompletos,
          conectadosHoy
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas de usuarios'
      };
    }
  }

  /**
   * Validar datos de usuario
   */
  private static async validateUsuarioData(data: CreateUsuarioDto | UpdateUsuarioDto, excludeId?: string): Promise<void> {
    // Validar email único
    if (data.email) {
      const where: any = { email: data.email };
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const usuarioConEmail = await prisma.usuario.findFirst({ where });
      if (usuarioConEmail) {
        throw createError.badRequest('Ya existe un usuario con este email');
      }
    }

    // Validar usuario único
    if (data.usuario) {
      const where: any = { usuario: data.usuario };
      if (excludeId) {
        where.id = { not: excludeId };
      }

      const usuarioConNombre = await prisma.usuario.findFirst({ where });
      if (usuarioConNombre) {
        throw createError.badRequest('Ya existe un usuario con este nombre de usuario');
      }
    }

    // Validar que responsable_acopio tenga establecimiento
    if (data.rol === 'responsable_acopio' && !data.establecimientoId) {
      throw createError.badRequest('Los usuarios con rol "responsable_acopio" deben tener un establecimiento asignado');
    }

    // Validar que el establecimiento existe si se proporciona
    if (data.establecimientoId) {
      const establecimiento = await prisma.establecimiento.findUnique({
        where: { id: data.establecimientoId }
      });

      if (!establecimiento) {
        throw createError.badRequest('El establecimiento especificado no existe');
      }

      // Validar que el establecimiento esté activo
      if (establecimiento.estado !== 'activo') {
        throw createError.badRequest('No se puede asignar un establecimiento inactivo');
      }
    }

    // Validar formato de email
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw createError.badRequest('Formato de email inválido');
      }
    }

    // Validar formato de usuario (solo letras, números y guiones bajos)
    if (data.usuario) {
      const usuarioRegex = /^[a-zA-Z0-9_]+$/;
      if (!usuarioRegex.test(data.usuario)) {
        throw createError.badRequest('El nombre de usuario solo puede contener letras, números y guiones bajos');
      }

      if (data.usuario.length < 3 || data.usuario.length > 20) {
        throw createError.badRequest('El nombre de usuario debe tener entre 3 y 20 caracteres');
      }
    }
  }
}
