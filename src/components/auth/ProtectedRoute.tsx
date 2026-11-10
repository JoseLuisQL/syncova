import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldWarning } from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import LoginForm, { AnimatedSivacEmblem } from './LoginForm';
import { usePrefersReducedMotion } from '../ui/reactbits/_shared/prefersReducedMotion';

/**
 * Props del componente de ruta protegida
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Componente de loading para verificación inicial de sesión
 */
const AuthLoading: React.FC = () => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-app p-6 font-sans text-ink">
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center"
      >
        <AnimatedSivacEmblem
          size={60}
          isAuthenticating
          reducedMotion={reducedMotion}
        />
        <p className="mt-4 font-mono text-xs tracking-[0.14em] text-ink">
          SIVAC
        </p>
      </motion.div>
    </div>
  );
};

/**
 * Componente de acceso denegado
 */
const AccessDenied: React.FC<{ userRole?: string; requiredRoles: string[] }> = ({
  userRole,
  requiredRoles,
}) => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-app p-6 font-sans text-ink">
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-status-danger-border bg-status-danger-bg text-status-danger-text">
          <ShieldWarning className="h-6 w-6" weight="duotone" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Acceso Denegado
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-2">
          No cuenta con los permisos necesarios para acceder a esta sección del sistema.
        </p>
        <div className="mt-5 divide-y divide-line rounded-md border border-line bg-surface-soft px-4 py-2.5 text-left text-xs">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-2">Tu rol actual</span>
            <span className="font-mono font-medium text-ink">
              {userRole || 'No definido'}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-2">Permiso requerido</span>
            <span className="font-mono font-medium text-ink">
              {requiredRoles.join(', ')}
            </span>
          </div>
        </div>
        <p className="mt-5 text-xs text-muted">
          Contacte al administrador de DISA Apurímac II si requiere habilitar este módulo.
        </p>
      </motion.div>
    </div>
  );
};

/**
 * Componente de ruta protegida
 * Maneja la autenticación y autorización de rutas
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
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
