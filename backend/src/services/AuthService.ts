import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { config } from '@/config/env';
import { PasswordUtils } from '@/utils/password';
import { createError } from '@/middleware/errorHandler';
import { 
  IUsuario, 
  ServiceResult, 
  RolUsuario, 
  EstadoGeneral,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto 
} from '@/types';

/**
 * Interface para el payload del JWT
 */
interface JwtPayload {
  id: string;
  usuario: string;
  rol: RolUsuario;
  establecimientoId?: string;
  centroAcopioId?: string;
  centroAcopioIds?: string[];
  roleId?: string;
  iat: number;
  exp: number;
}

/**
 * Interface para tokens de autenticación
 */
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Interface para respuesta de login
 */
interface LoginResponse {
  user: Omit<IUsuario, 'passwordHash'> & { permissions: string[] };
  tokens: AuthTokens;
}

/**
 * Servicio para gestión de autenticación
 */
export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = config.jwt.expiresIn || '24h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';
  private static readonly JWT_SECRET = config.jwt.secret;

  /**
   * Iniciar sesión con credenciales
   */
  static async login(credentials: LoginDto): Promise<ServiceResult<LoginResponse>> {
    try {
      // Validar credenciales
      this.validateLoginCredentials(credentials);

      const { usuario, password } = credentials;

      // Buscar usuario por nombre de usuario o email
      const user = await prisma.usuario.findFirst({
        where: {
          OR: [
            { usuario: usuario },
            { email: usuario }
          ]
        },
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          },
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          centrosAcopioAsignados: {
            select: {
              centroAcopioId: true,
              centroAcopio: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: {
                    select: {
                      codigo: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!user) {
        throw createError.unauthorized('Credenciales inválidas');
      }

      // Verificar que el usuario esté activo
      if (user.estado !== 'activo') {
        throw createError.unauthorized('Usuario inactivo. Contacte al administrador');
      }

      // Verificar contraseña
      const isPasswordValid = await PasswordUtils.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw createError.unauthorized('Credenciales inválidas');
      }

      // Generar tokens
      const tokens = await this.generateTokens(user);

      // Actualizar último acceso
      await prisma.usuario.update({
        where: { id: user.id },
        data: { ultimoAcceso: new Date() }
      });

      // Preparar respuesta sin el hash de contraseña
      const { passwordHash, role, ...userWithoutPassword } = user;

      // Extraer códigos de permisos del rol
      const permissions = role?.rolePermissions?.map(rp => rp.permission.codigo) || [];
      const centroAcopioIds = user.centrosAcopioAsignados?.map((item: { centroAcopioId: string }) => item.centroAcopioId) || [];

      return {
        success: true,
        data: {
          user: { ...userWithoutPassword, centroAcopioIds, permissions },
          tokens
        }
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión'
      };
    }
  }

  /**
   * Refrescar token de acceso
   */
  static async refreshToken(data: RefreshTokenDto): Promise<ServiceResult<AuthTokens>> {
    try {
      const { refreshToken } = data;

      if (!refreshToken) {
        throw createError.badRequest('Refresh token requerido');
      }

      // Verificar refresh token
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(refreshToken, this.JWT_SECRET) as JwtPayload;
      } catch (error) {
        throw createError.unauthorized('Refresh token inválido o expirado');
      }

      // Verificar que el usuario existe y está activo
      const user = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          usuario: true,
          rol: true,
          roleId: true,
          establecimientoId: true,
          centroAcopioId: true,
          estado: true
        }
      });

      if (!user) {
        throw createError.unauthorized('Usuario no encontrado');
      }

      if (user.estado !== 'activo') {
        throw createError.unauthorized('Usuario inactivo');
      }

      // Generar nuevos tokens
      const tokens = await this.generateTokens(user);

      return {
        success: true,
        data: tokens
      };
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al refrescar token'
      };
    }
  }

  /**
   * Cerrar sesión (invalidar tokens)
   */
  static async logout(userId: string): Promise<ServiceResult<void>> {
    try {
      if (!userId) {
        throw createError.badRequest('ID de usuario requerido');
      }

      // Verificar que el usuario existe
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!user) {
        throw createError.notFound('Usuario no encontrado');
      }

      // Actualizar último acceso para registrar el logout
      await prisma.usuario.update({
        where: { id: userId },
        data: { ultimoAcceso: new Date() }
      });

      // En una implementación más robusta, aquí se podría:
      // 1. Mantener una lista negra de tokens
      // 2. Usar Redis para invalidar tokens
      // 3. Implementar un sistema de revocación de tokens
      
      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error en logout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión'
      };
    }
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  static async changePassword(userId: string, data: ChangePasswordDto): Promise<ServiceResult<void>> {
    try {
      if (!userId) {
        throw createError.badRequest('ID de usuario requerido');
      }

      const { currentPassword, newPassword } = data;

      if (!currentPassword || !newPassword) {
        throw createError.badRequest('Contraseña actual y nueva contraseña son requeridas');
      }

      // Obtener usuario actual
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          passwordHash: true,
          estado: true
        }
      });

      if (!user) {
        throw createError.notFound('Usuario no encontrado');
      }

      if (user.estado !== 'activo') {
        throw createError.badRequest('Usuario inactivo');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw createError.badRequest('Contraseña actual incorrecta');
      }

      // Validar nueva contraseña
      const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw createError.badRequest(`Nueva contraseña inválida: ${passwordValidation.errors.join(', ')}`);
      }

      // Verificar que la nueva contraseña sea diferente a la actual
      const isSamePassword = await PasswordUtils.verifyPassword(newPassword, user.passwordHash);
      if (isSamePassword) {
        throw createError.badRequest('La nueva contraseña debe ser diferente a la actual');
      }

      // Encriptar nueva contraseña
      const newPasswordHash = await PasswordUtils.hashPassword(newPassword);

      // Actualizar contraseña
      await prisma.usuario.update({
        where: { id: userId },
        data: { 
          passwordHash: newPasswordHash,
          updatedAt: new Date()
        }
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
   * Verificar token de acceso
   */
  static async verifyToken(token: string): Promise<ServiceResult<JwtPayload>> {
    try {
      if (!token) {
        throw createError.badRequest('Token requerido');
      }

      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtPayload;

      // Verificar que el usuario existe y está activo
      const user = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          estado: true
        }
      });

      if (!user || user.estado !== 'activo') {
        throw createError.unauthorized('Token inválido o usuario inactivo');
      }

      return {
        success: true,
        data: decoded
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token inválido'
      };
    }
  }

  /**
   * Obtener información del usuario autenticado
   */
  static async getProfile(userId: string): Promise<ServiceResult<Omit<IUsuario, 'passwordHash'> & { permissions: string[] }>> {
    try {
      if (!userId) {
        throw createError.badRequest('ID de usuario requerido');
      }

      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: {
          establecimiento: {
            select: {
              id: true,
              nombre: true,
              tipo: true
            }
          },
          centroAcopio: {
            select: {
              id: true,
              nombre: true,
              codigo: true
            }
          },
          centrosAcopioAsignados: {
            select: {
              centroAcopioId: true,
              centroAcopio: {
                select: {
                  id: true,
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: {
                    select: {
                      codigo: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!user) {
        throw createError.notFound('Usuario no encontrado');
      }

      if (user.estado !== 'activo') {
        throw createError.badRequest('Usuario inactivo');
      }

      // Remover hash de contraseña y extraer permisos
      const { passwordHash, role, ...userWithoutPassword } = user;
      const permissions = role?.rolePermissions?.map(rp => rp.permission.codigo) || [];
      const centroAcopioIds = user.centrosAcopioAsignados?.map((item: { centroAcopioId: string }) => item.centroAcopioId) || [];

      return {
        success: true,
        data: { ...userWithoutPassword, centroAcopioIds, permissions }
      };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener perfil'
      };
    }
  }

  /**
   * Generar tokens de acceso y refresh
   */
  private static async generateTokens(user: any): Promise<AuthTokens> {
    const payload = {
      id: user.id,
      usuario: user.usuario,
      rol: user.rol,
      roleId: user.roleId,
      establecimientoId: user.establecimientoId,
      centroAcopioId: user.centroAcopioId,
      centroAcopioIds: user.centrosAcopioAsignados?.map((item: { centroAcopioId: string }) => item.centroAcopioId) || []
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN
    } as SignOptions);

    const refreshToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    } as SignOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN
    };
  }

  /**
   * Validar credenciales de login
   */
  private static validateLoginCredentials(credentials: LoginDto): void {
    const { usuario, password } = credentials;

    if (!usuario || !password) {
      throw createError.badRequest('Usuario y contraseña son requeridos');
    }

    if (typeof usuario !== 'string' || typeof password !== 'string') {
      throw createError.badRequest('Credenciales inválidas');
    }

    if (usuario.trim().length === 0 || password.trim().length === 0) {
      throw createError.badRequest('Usuario y contraseña no pueden estar vacíos');
    }
  }
}
