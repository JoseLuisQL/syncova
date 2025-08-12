import { apiClient, ApiResponse, handleApiError } from '../config/api';
import { 
  LoginDto, 
  RefreshTokenDto, 
  ChangePasswordDto, 
  AuthResponse, 
  AuthUser, 
  AuthTokens 
} from '../types';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de autenticación
 */
class AuthService {
  private static readonly BASE_PATH = '/auth';
  private static readonly TOKEN_KEY = 'sivac_auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'sivac_refresh_token';
  private static readonly USER_KEY = 'sivac_user';

  /**
   * Iniciar sesión
   */
  static async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      logger.debug('Iniciando sesión para usuario:', credentials.usuario);

      const response = await apiClient.post<AuthResponse>(
        `${this.BASE_PATH}/login`,
        credentials
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al iniciar sesión');
      }

      // Guardar tokens y usuario en localStorage
      this.setTokens({
        accessToken: response.data.data.token,
        refreshToken: response.data.data.refreshToken || '', // Manejar refreshToken si existe
        expiresIn: response.data.data.expiresIn
      });
      this.setUser(response.data.data.user);

      console.log('Usuario guardado:', response.data.data.user);

      logger.debug('Login exitoso para usuario:', credentials.usuario);
      return response.data;
    } catch (error: any) {
      logger.error('Error en login:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Refrescar token de acceso
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      logger.debug('Refrescando token de acceso');

      const response = await apiClient.post<ApiResponse<AuthTokens>>(
        `${this.BASE_PATH}/refresh`,
        { refreshToken }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al refrescar token');
      }

      // Actualizar tokens en localStorage
      this.setTokens(response.data.data);

      logger.debug('Token refrescado exitosamente');
      return response.data.data;
    } catch (error: any) {
      logger.error('Error al refrescar token:', error);
      // Si falla el refresh, limpiar todo y forzar re-login
      this.clearAuth();
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<void> {
    try {
      logger.debug('Cerrando sesión');

      // Intentar notificar al backend del logout
      try {
        await apiClient.post(`${this.BASE_PATH}/logout`);
      } catch (error) {
        // Si falla el logout en el backend, continuar con el logout local
        logger.warn('Error al notificar logout al backend:', error);
      }

      // Limpiar datos locales
      this.clearAuth();

      logger.debug('Sesión cerrada exitosamente');
    } catch (error: any) {
      logger.error('Error en logout:', error);
      // Asegurar que se limpien los datos locales incluso si hay error
      this.clearAuth();
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(data: ChangePasswordDto): Promise<void> {
    try {
      logger.debug('Cambiando contraseña');

      const response = await apiClient.post<ApiResponse>(
        `${this.BASE_PATH}/change-password`,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al cambiar contraseña');
      }

      logger.debug('Contraseña cambiada exitosamente');
    } catch (error: any) {
      logger.error('Error al cambiar contraseña:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  static async getProfile(): Promise<AuthUser> {
    try {
      logger.debug('Obteniendo perfil del usuario');

      const response = await apiClient.get<ApiResponse<AuthUser>>(
        `${this.BASE_PATH}/profile`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener perfil');
      }

      // Actualizar usuario en localStorage
      this.setUser(response.data.data);

      logger.debug('Perfil obtenido exitosamente');
      return response.data.data;
    } catch (error: any) {
      logger.error('Error al obtener perfil:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verificar estado de autenticación
   */
  static async verifyAuth(): Promise<{ authenticated: boolean; user?: AuthUser }> {
    try {
      logger.debug('Verificando estado de autenticación');

      const response = await apiClient.get<ApiResponse<{ authenticated: boolean; user: AuthUser }>>(
        `${this.BASE_PATH}/verify`
      );

      if (!response.data.success || !response.data.data) {
        return { authenticated: false };
      }

      // Actualizar usuario en localStorage si está autenticado
      if (response.data.data.authenticated && response.data.data.user) {
        this.setUser(response.data.data.user);
      }

      logger.debug('Verificación de autenticación exitosa');
      return response.data.data;
    } catch (error: any) {
      logger.error('Error al verificar autenticación:', error);
      return { authenticated: false };
    }
  }

  /**
   * Obtener token de acceso del localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener refresh token del localStorage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtener usuario del localStorage
   */
  static getUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      // Convertir fechas de string a Date
      if (user.createdAt) user.createdAt = new Date(user.createdAt);
      if (user.updatedAt) user.updatedAt = new Date(user.updatedAt);
      if (user.ultimoAcceso) user.ultimoAcceso = new Date(user.ultimoAcceso);
      return user;
    } catch (error) {
      logger.error('Error al parsear usuario del localStorage:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Guardar tokens en localStorage
   */
  private static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  }

  /**
   * Guardar usuario en localStorage
   */
  private static setUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  private static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Configurar token en headers de axios
   */
  static setupAuthHeader(): void {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }
}

export default AuthService;
