import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import LoginForm from './LoginForm';

/**
 * Props del componente de ruta protegida
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Componente de loading para autenticación
 */
const AuthLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Verificando autenticación...</p>
    </div>
  </div>
);

/**
 * Componente de acceso denegado
 */
const AccessDenied: React.FC<{ userRole?: string; requiredRoles: string[] }> = ({ 
  userRole, 
  requiredRoles 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Acceso Denegado
      </h2>
      <p className="text-gray-600 mb-4">
        No tienes permisos para acceder a esta sección del sistema.
      </p>
      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Tu rol:</span> {userRole || 'No definido'}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Roles requeridos:</span> {requiredRoles.join(', ')}
        </p>
      </div>
      <p className="text-sm text-gray-500">
        Contacta al administrador del sistema si crees que esto es un error.
      </p>
    </div>
  </div>
);

/**
 * Componente de ruta protegida
 * Maneja la autenticación y autorización de rutas
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { canAccessModule } = usePermissions();
  const location = useLocation();
  const currentModule = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <AuthLoading />;
  }

  // Si no está autenticado, mostrar formulario de login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Si está autenticado pero se requieren roles específicos
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.rol);
    
    if (!hasRequiredRole) {
      return (
        <AccessDenied 
          userRole={user.rol} 
          requiredRoles={requiredRoles} 
        />
      );
    }
  }

  if (user && !canAccessModule(currentModule)) {
    return (
      <AccessDenied
        userRole={user.rol}
        requiredRoles={['Acceso al módulo autorizado']}
      />
    );
  }

  // Usuario autenticado y autorizado, mostrar contenido
  return <>{children}</>;
};

export default ProtectedRoute;
