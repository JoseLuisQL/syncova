import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthUser, LoginDto, ChangePasswordDto } from '../types';
import AuthService from '../services/authService';
import { logger } from '../utils/debug';

/**
 * Estado del contexto de autenticación
 */
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Acciones del reducer de autenticación
 */
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: AuthUser };

/**
 * Estado inicial
 */
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Inicialmente true para verificar autenticación existente
  error: null,
};

/**
 * Reducer para manejar el estado de autenticación
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

/**
 * Contexto de autenticación
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props del proveedor de autenticación
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Verificar autenticación existente al cargar la aplicación
   */
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        console.log('🔍 Verificando autenticación existente...');
        const token = AuthService.getToken();
        const user = AuthService.getUser();

        console.log('Token encontrado:', !!token);
        console.log('Usuario encontrado:', user);

        if (token && user) {
          // Configurar header de autorización
          AuthService.setupAuthHeader();

          // Verificar que el token siga siendo válido y obtener datos actualizados
          const verification = await AuthService.verifyAuth();

          console.log('Verificación de token:', verification);

          if (verification.authenticated && verification.user) {
            // Usar los datos actualizados del servidor en lugar del localStorage
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: verification.user,
                token: token,
              },
            });
          } else {
            // Token inválido, limpiar datos
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          // No hay datos de autenticación
          console.log('❌ No hay datos de autenticación, mostrando login');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        logger.error('Error al verificar autenticación existente:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    checkExistingAuth();
  }, []);

  /**
   * Función de login
   */
  const login = async (credentials: LoginDto): Promise<void> => {
    try {
      console.log('🔐 Iniciando login en contexto...');
      dispatch({ type: 'AUTH_START' });

      const response = await AuthService.login(credentials);

      console.log('📥 Respuesta de login:', response);

      if (response.success && response.data) {
        console.log('✅ Login exitoso, usuario:', response.data.user);

        // Configurar header de autorización
        AuthService.setupAuthHeader();

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });

        logger.debug('Login exitoso en contexto');
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('❌ Error en login del contexto:', error);
      logger.error('Error en login del contexto:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Error al iniciar sesión',
      });
      throw error;
    }
  };

  /**
   * Función de logout
   */
  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
      logger.debug('Logout exitoso en contexto');
    } catch (error: any) {
      logger.error('Error en logout del contexto:', error);
      // Asegurar logout local incluso si falla el del servidor
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  /**
   * Función para refrescar token
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const currentRefreshToken = AuthService.getRefreshToken();
      
      if (!currentRefreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const tokens = await AuthService.refreshToken(currentRefreshToken);
      
      // Configurar nuevo header de autorización
      AuthService.setupAuthHeader();

      // Actualizar token en el estado (el usuario permanece igual)
      if (state.user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: state.user,
            token: tokens.accessToken,
          },
        });
      }

      logger.debug('Token refrescado exitosamente en contexto');
    } catch (error: any) {
      logger.error('Error al refrescar token en contexto:', error);
      // Si falla el refresh, hacer logout
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  };

  /**
   * Función para cambiar contraseña
   */
  const changePassword = async (data: ChangePasswordDto): Promise<void> => {
    try {
      await AuthService.changePassword(data);
      logger.debug('Contraseña cambiada exitosamente en contexto');
    } catch (error: any) {
      logger.error('Error al cambiar contraseña en contexto:', error);
      throw error;
    }
  };

  /**
   * Limpiar errores
   */
  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  /**
   * Valor del contexto
   */
  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    refreshToken,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;
