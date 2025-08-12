import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import ChangePasswordModal from './ChangePasswordModal';

/**
 * Componente de menú de usuario
 */
const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToastContext();

  // Debug: mostrar información del usuario
  console.log('👤 UserMenu - Usuario actual:', user);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Cerrar menú al hacer clic fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Manejar logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
    } catch (error: any) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  /**
   * Obtener iniciales del usuario
   */
  const getUserInitials = (): string => {
    if (!user) return 'U';

    // Manejar diferentes estructuras de nombres
    const firstName = user.nombres || user.nombre || '';
    const lastName = user.apellidos || user.apellido || '';

    if (!firstName && !lastName) {
      // Usar la primera letra del usuario como fallback
      return user.usuario?.charAt(0).toUpperCase() || 'U';
    }

    const firstInitial = firstName.charAt(0).toUpperCase() || '';
    const lastInitial = lastName.charAt(0).toUpperCase() || '';

    return firstInitial + lastInitial || 'U';
  };

  /**
   * Obtener color del rol
   */
  const getRoleColor = (rol: string): string => {
    switch (rol) {
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'coordinador':
        return 'bg-blue-100 text-blue-800';
      case 'responsable_acopio':
        return 'bg-green-100 text-green-800';
      case 'operador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Formatear nombre del rol
   */
  const formatRole = (rol: string): string => {
    switch (rol) {
      case 'administrador':
        return 'Administrador';
      case 'coordinador':
        return 'Coordinador';
      case 'responsable_acopio':
        return 'Responsable de Acopio';
      case 'operador':
        return 'Operador';
      default:
        return rol;
    }
  };

  // Si no hay usuario, no renderizar nada
  if (!user) {
    console.log('⚠️ UserMenu: No hay usuario, no renderizando');
    return null;
  }

  // Verificar que el usuario tenga los campos necesarios
  const nombres = user.nombres || user.nombre || '';
  const apellidos = user.apellidos || user.apellido || '';

  // Si no hay nombres, usar el usuario como fallback
  const displayName = nombres && apellidos
    ? `${nombres} ${apellidos}`
    : user.usuario || 'Usuario';

  if (!nombres && !apellidos) {
    console.warn('⚠️ UserMenu: Usuario sin campos de nombre, usando usuario como fallback:', user);
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Botón del usuario */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg p-2 transition-colors"
        >
          {/* Avatar */}
          <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {getUserInitials()}
            </span>
          </div>
          
          {/* Información del usuario */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              {formatRole(user.rol)}
            </p>
          </div>
          
          {/* Icono de dropdown */}
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Menú desplegable */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            {/* Información del usuario */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email || user.usuario}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.rol)}`}>
                    {formatRole(user.rol)}
                  </span>
                </div>
              </div>
              
              {/* Información adicional */}
              {user.establecimiento && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Establecimiento:</p>
                  <p className="text-sm text-gray-900 truncate">
                    {user.establecimiento.nombre}
                  </p>
                </div>
              )}
              
              {user.ultimoAcceso && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Último acceso: {new Date(user.ultimoAcceso).toLocaleString('es-ES')}
                  </p>
                </div>
              )}
            </div>

            {/* Opciones del menú */}
            <div className="py-1">
              <button
                onClick={() => {
                  setIsChangePasswordModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="mr-3 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l6.879-6.879A6 6 0 0121 9z"
                  />
                </svg>
                Cambiar Contraseña
              </button>
              
              <div className="border-t border-gray-100"></div>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              >
                <svg
                  className="mr-3 h-4 w-4 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de cambio de contraseña */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
};

export default UserMenu;
