/**
 * Exportaciones de componentes de autenticación
 */

export { default as LoginForm } from './LoginForm';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as UserMenu } from './UserMenu';
export { default as ChangePasswordModal } from './ChangePasswordModal';

// Re-exportar contexto y hooks relacionados
export { AuthProvider, useAuth } from '../../contexts/AuthContext';
export { default as useAuthGuard, useSivacPermissions, useRoutePermissions } from '../../hooks/useAuthGuard';

// Re-exportar servicio de autenticación
export { default as AuthService } from '../../services/authService';
