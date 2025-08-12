import { Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';
import { LoginDto, RefreshTokenDto, ChangePasswordDto, AuthenticatedRequest } from '@/types';
import { ResponseUtil } from '@/utils/response';
import { ValidationUtil } from '@/utils/validation';
import Joi from 'joi';

/**
 * Esquemas de validación para autenticación
 */
const loginSchema = Joi.object({
  usuario: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El usuario es requerido',
      'string.min': 'El usuario debe tener al menos 3 caracteres',
      'string.max': 'El usuario no puede exceder 100 caracteres',
      'any.required': 'El usuario es requerido'
    }),
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña es requerida',
      'any.required': 'La contraseña es requerida'
    })
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'El refresh token es requerido',
      'any.required': 'El refresh token es requerido'
    })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña actual es requerida',
      'any.required': 'La contraseña actual es requerida'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'La nueva contraseña es requerida',
      'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'La nueva contraseña es requerida'
    })
});

/**
 * Controlador para gestión de autenticación
 */
export class AuthController {
  /**
   * Iniciar sesión
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const { isValid, errors, value } = ValidationUtil.validate(req.body, loginSchema);
      
      if (!isValid) {
        ResponseUtil.validationError(res, 'Datos de login inválidos', errors);
        return;
      }

      const credentials: LoginDto = value;

      console.log('🔐 Intento de login para usuario:', credentials.usuario);

      // Procesar login
      const result = await AuthService.login(credentials);

      if (!result.success) {
        ResponseUtil.unauthorized(res, result.error || 'Credenciales inválidas');
        return;
      }

      console.log('✅ Login exitoso para usuario:', credentials.usuario);

      // Respuesta exitosa con tokens (incluyendo refreshToken)
      ResponseUtil.success(res, {
        user: result.data!.user,
        token: result.data!.tokens.accessToken,
        refreshToken: result.data!.tokens.refreshToken,
        expiresIn: result.data!.tokens.expiresIn
      }, 'Inicio de sesión exitoso');
    } catch (error) {
      console.error('❌ Error en login:', error);
      ResponseUtil.internalError(res, 'Error interno en el servidor');
    }
  }

  /**
   * Refrescar token de acceso
   * POST /api/auth/refresh
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const { isValid, errors, value } = ValidationUtil.validate(req.body, refreshTokenSchema);
      
      if (!isValid) {
        ResponseUtil.validationError(res, 'Refresh token inválido', errors);
        return;
      }

      const refreshData: RefreshTokenDto = value;

      console.log('🔄 Solicitud de refresh token');

      // Procesar refresh
      const result = await AuthService.refreshToken(refreshData);

      if (!result.success) {
        ResponseUtil.unauthorized(res, result.error || 'Refresh token inválido');
        return;
      }

      console.log('✅ Token refrescado exitosamente');

      // Respuesta exitosa con nuevos tokens
      ResponseUtil.success(res, {
        accessToken: result.data!.accessToken,
        refreshToken: result.data!.refreshToken,
        expiresIn: result.data!.expiresIn
      }, 'Token refrescado exitosamente');
    } catch (error) {
      console.error('❌ Error al refrescar token:', error);
      ResponseUtil.internalError(res, 'Error interno en el servidor');
    }
  }

  /**
   * Cerrar sesión
   * POST /api/auth/logout
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      console.log('🚪 Logout para usuario:', req.user.usuario);

      // Procesar logout
      const result = await AuthService.logout(req.user.id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al cerrar sesión', 400);
        return;
      }

      console.log('✅ Logout exitoso para usuario:', req.user.usuario);

      ResponseUtil.success(res, null, 'Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      ResponseUtil.internalError(res, 'Error interno en el servidor');
    }
  }

  /**
   * Cambiar contraseña
   * POST /api/auth/change-password
   */
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      // Validar datos de entrada
      const { isValid, errors, value } = ValidationUtil.validate(req.body, changePasswordSchema);
      
      if (!isValid) {
        ResponseUtil.validationError(res, 'Datos de cambio de contraseña inválidos', errors);
        return;
      }

      const changePasswordData: ChangePasswordDto = value;

      console.log('🔑 Cambio de contraseña para usuario:', req.user.usuario);

      // Procesar cambio de contraseña
      const result = await AuthService.changePassword(req.user.id, changePasswordData);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al cambiar contraseña', 400);
        return;
      }

      console.log('✅ Contraseña cambiada exitosamente para usuario:', req.user.usuario);

      ResponseUtil.success(res, null, 'Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      ResponseUtil.internalError(res, 'Error interno en el servidor');
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      console.log('👤 Solicitud de perfil para usuario:', req.user.usuario);

      // Obtener perfil
      const result = await AuthService.getProfile(req.user.id);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener perfil', 404);
        return;
      }

      ResponseUtil.success(res, result.data, 'Perfil obtenido exitosamente');
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
      ResponseUtil.internalError(res, 'Error interno en el servidor');
    }
  }

  /**
   * Verificar estado de autenticación
   * GET /api/auth/verify
   */
  static async verifyAuth(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      console.log('🔍 Verificando autenticación para usuario:', req.user.usuario);

      // Obtener información completa del usuario desde la base de datos
      const result = await AuthService.getProfile(req.user.id);

      if (!result.success || !result.data) {
        ResponseUtil.unauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Devolver información completa del usuario
      ResponseUtil.success(res, {
        authenticated: true,
        user: result.data
      }, 'Usuario autenticado');
    } catch (error) {
      console.error('❌ Error al verificar autenticación:', error);
      ResponseUtil.internalError(res, 'Error interno en el servidor');
    }
  }
}
