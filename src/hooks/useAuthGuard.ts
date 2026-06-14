import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './useToast';

/**
 * Opciones para el hook useAuthGuard
 */
interface UseAuthGuardOptions {
  requiredRoles?: string[];
  redirectOnUnauthorized?: boolean;
  showUnauthorizedMessage?: boolean;
}

/**
 * Resultado del hook useAuthGuard
 */
interface UseAuthGuardResult {
  isAuthorized: boolean;
  isLoading: boolean;
  user: any;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}

/**
 * Hook personalizado para manejar la autorización basada en roles
 */
export const useAuthGuard = (options: UseAuthGuardOptions = {}): UseAuthGuardResult => {
  const {
    requiredRoles = [],
    redirectOnUnauthorized = false,
    showUnauthorizedMessage = true,
  } = options;

  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    return user?.rol === role;
  };

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || roles.length === 0) return true;
    return roles.includes(user.rol);
  };

  /**
   * Verificar si el usuario tiene todos los roles especificados
   */
  const hasAllRoles = (roles: string[]): boolean => {
    if (!user || roles.length === 0) return true;
    return roles.every(role => user.rol === role);
  };

  /**
   * Verificar autorización
   */
  const isAuthorized = (): boolean => {
    if (!isAuthenticated || !user) return false;
    if (requiredRoles.length === 0) return true;
    return hasAnyRole(requiredRoles);
  };

  /**
   * Efecto para manejar la autorización
   */
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAuthorized()) {
      if (showUnauthorizedMessage) {
        toast.error('No tienes permisos para acceder a esta sección');
      }

      if (redirectOnUnauthorized) {
        // Aquí podrías implementar redirección
        console.warn('Usuario no autorizado para esta acción');
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles]);

  return {
    isAuthorized: isAuthorized(),
    isLoading,
    user,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
};

/**
 * Hook para verificar permisos específicos del sistema SIVAC
 */
export const useSivacPermissions = () => {
  const { user } = useAuth();

  const permissions = {
    // Permisos de administración
    canManageUsers: user?.rol === 'administrador',
    canManageEstablishments: user?.rol === 'administrador',
    canManageConfiguration: user?.rol === 'administrador',
    
    // Permisos de coordinación
    canManageVaccines: ['administrador', 'coordinador'].includes(user?.rol || ''),
    canManageSyringes: ['administrador', 'coordinador'].includes(user?.rol || ''),
    canManageLots: ['administrador', 'coordinador'].includes(user?.rol || ''),
    canManagePlanning: ['administrador', 'coordinador'].includes(user?.rol || ''),
    
    // Permisos de acopio
    canManageMovements: ['administrador', 'coordinador', 'responsable_acopio'].includes(user?.rol || ''),
    canManageDeliveries: ['administrador', 'coordinador', 'responsable_acopio'].includes(user?.rol || ''),
    canManageVouchers: ['administrador', 'coordinador', 'responsable_acopio'].includes(user?.rol || ''),
    
    // Permisos de operación
    canViewReports: ['administrador', 'coordinador', 'responsable_acopio', 'operador'].includes(user?.rol || ''),
    canViewKardex: ['administrador', 'coordinador', 'responsable_acopio', 'operador'].includes(user?.rol || ''),
    
    // Permisos específicos por establecimiento
    canManageOwnEstablishment: user?.establecimientoId ? true : false,
    isFromSameEstablishment: (establishmentId: string) => user?.establecimientoId === establishmentId,
  };

  return permissions;
};

/**
 * Hook para verificar si el usuario puede acceder a una ruta específica
 */
export const useRoutePermissions = (routePath: string) => {
  const { user } = useAuth();
  const permissions = useSivacPermissions();

  const getRoutePermissions = (path: string): boolean => {
    // Rutas públicas
    if (['/login', '/'].includes(path)) {
      return true;
    }

    // Rutas de administración
    if (path.startsWith('/admin')) {
      return permissions.canManageUsers;
    }

    // Rutas de configuración
    if (path.startsWith('/configuracion')) {
      return permissions.canManageConfiguration;
    }

    // Rutas de establecimientos
    if (path.startsWith('/establecimientos')) {
      return permissions.canManageEstablishments;
    }

    // Rutas de vacunas y jeringas
    if (path.startsWith('/vacunas') || path.startsWith('/jeringas')) {
      return permissions.canManageVaccines;
    }

    // Rutas de lotes
    if (path.startsWith('/lotes')) {
      return permissions.canManageLots;
    }

    // Rutas de planificación
    if (path.startsWith('/planificacion')) {
      return permissions.canManagePlanning;
    }

    // Rutas de movimientos
    if (path.startsWith('/movimientos')) {
      return permissions.canManageMovements;
    }

    // Rutas de entregas
    if (path.startsWith('/entregas')) {
      return permissions.canManageDeliveries;
    }

    // Rutas de vales
    if (path.startsWith('/vales')) {
      return permissions.canManageVouchers;
    }

    // Rutas de reportes
    if (path.startsWith('/reportes')) {
      return permissions.canViewReports;
    }

    // Rutas de kardex
    if (path.startsWith('/kardex')) {
      return permissions.canViewKardex;
    }

    // Por defecto, permitir acceso si está autenticado
    return !!user;
  };

  return {
    canAccess: getRoutePermissions(routePath),
    userRole: user?.rol,
    permissions,
  };
};

export default useAuthGuard;
