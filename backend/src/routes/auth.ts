import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { authenticate } from '@/middleware/auth';
import rateLimit from 'express-rate-limit';

/**
 * Rate limiting para endpoints de autenticación
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP en 15 minutos
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Solo aplicar rate limiting a login
  skip: (req) => req.path !== '/login'
});

const refreshRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 refresh por IP en 5 minutos
  message: {
    success: false,
    message: 'Demasiados intentos de refresh. Intente nuevamente en 5 minutos.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordChangeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 cambios de contraseña por IP en 1 hora
  message: {
    success: false,
    message: 'Demasiados cambios de contraseña. Intente nuevamente en 1 hora.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rutas para autenticación
 */
const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión con credenciales
 * @access Public
 * @body {LoginDto} credentials - Credenciales de usuario (usuario/email y contraseña)
 * @returns {AuthResponse} Información del usuario y tokens de acceso
 * @rateLimit 5 intentos por IP cada 15 minutos
 */
router.post('/login', authRateLimit, AuthController.login);

/**
 * @route POST /api/auth/refresh
 * @desc Refrescar token de acceso usando refresh token
 * @access Public
 * @body {RefreshTokenDto} refreshData - Refresh token válido
 * @returns {AuthTokens} Nuevos tokens de acceso y refresh
 * @rateLimit 10 intentos por IP cada 5 minutos
 */
router.post('/refresh', refreshRateLimit, AuthController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión del usuario autenticado
 * @access Private (requiere autenticación)
 * @headers {string} Authorization - Bearer token
 * @returns {ApiResponse} Confirmación de logout exitoso
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route POST /api/auth/change-password
 * @desc Cambiar contraseña del usuario autenticado
 * @access Private (requiere autenticación)
 * @headers {string} Authorization - Bearer token
 * @body {ChangePasswordDto} passwordData - Contraseña actual y nueva contraseña
 * @returns {ApiResponse} Confirmación de cambio exitoso
 * @rateLimit 3 intentos por IP cada 1 hora
 */
router.post('/change-password', passwordChangeRateLimit, authenticate, AuthController.changePassword);

/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private (requiere autenticación)
 * @headers {string} Authorization - Bearer token
 * @returns {ApiResponse<IUsuario>} Información completa del usuario (sin contraseña)
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route GET /api/auth/verify
 * @desc Verificar estado de autenticación del token
 * @access Private (requiere autenticación)
 * @headers {string} Authorization - Bearer token
 * @returns {ApiResponse} Estado de autenticación y datos básicos del usuario
 */
router.get('/verify', authenticate, AuthController.verifyAuth);

/**
 * @route GET /api/auth/health
 * @desc Verificar estado del servicio de autenticación
 * @access Public
 * @returns {ApiResponse} Estado del servicio
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servicio de autenticación funcionando correctamente',
    data: {
      service: 'auth',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      endpoints: {
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        changePassword: 'POST /api/auth/change-password',
        profile: 'GET /api/auth/profile',
        verify: 'GET /api/auth/verify'
      },
      rateLimits: {
        login: '5 intentos por 15 minutos',
        refresh: '10 intentos por 5 minutos',
        changePassword: '3 intentos por 1 hora'
      }
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
