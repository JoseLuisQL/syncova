import React, { useState, useRef, useEffect, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { ChevronDown, Key, LogOut, Building, Clock } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const UserMenu: React.FC = memo(() => {
  const { user, logout } = useAuth();
  const { toast } = useToastContext();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const getUserInitials = (): string => {
    if (!user) return 'U';
    const firstName = user.nombres || '';
    const lastName = user.apellidos || '';
    if (!firstName && !lastName) return user.usuario?.charAt(0).toUpperCase() || 'U';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (rol: string): string => {
    const colors: Record<string, string> = {
      administrador: 'bg-rose-50 text-rose-700 ring-rose-600/20',
      coordinador: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      responsable_acopio: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      operador: 'bg-gray-50 text-gray-700 ring-gray-600/20',
    };
    return colors[rol] || colors.operador;
  };

  const formatRole = (rol: string): string => {
    const roles: Record<string, string> = {
      administrador: 'Administrador',
      coordinador: 'Coordinador',
      responsable_acopio: 'Resp. Acopio',
      operador: 'Operador',
    };
    return roles[rol] || rol;
  };

  if (!user) return null;

  const displayName = user.nombres && user.apellidos
    ? `${user.nombres} ${user.apellidos}`
    : user.usuario || 'Usuario';

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* User Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`
            flex items-center gap-2 p-1.5 pr-2 rounded-lg
            transition-all duration-200
            hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-teal-500/20
            ${isMenuOpen ? 'bg-gray-50' : ''}
          `}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <span className="text-xs font-semibold text-white">
              {getUserInitials()}
            </span>
          </div>
          
          {/* User Info */}
          <div className="hidden md:block text-left max-w-[140px]">
            <p className="text-sm font-medium text-gray-700 truncate leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-gray-400 truncate leading-tight">
              {formatRole(user.rol)}
            </p>
          </div>
          
          {/* Chevron */}
          <ChevronDown 
            className={`
              w-4 h-4 text-gray-400 transition-transform duration-200
              ${isMenuOpen ? 'rotate-180' : ''}
            `} 
          />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div 
            className="
              absolute right-0 mt-2 w-72
              bg-white rounded-xl shadow-lg
              border border-gray-100
              overflow-hidden
              z-50
              animate-in fade-in slide-in-from-top-2 duration-200
            "
            role="menu"
          >
            {/* User Header */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-base font-semibold text-white">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email || user.usuario}
                  </p>
                  <span className={`
                    inline-flex items-center px-2 py-0.5 mt-1.5
                    text-[10px] font-medium rounded-md ring-1 ring-inset
                    ${getRoleBadgeColor(user.rol)}
                  `}>
                    {formatRole(user.rol)}
                  </span>
                </div>
              </div>
              
              {/* Additional Info */}
              {(user.establecimiento || user.centroAcopio || user.ultimoAcceso) && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  {user.centroAcopio && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">Centro de acopio: {user.centroAcopio.nombre}</span>
                    </div>
                  )}
                  {user.establecimiento && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{user.establecimiento.nombre}</span>
                    </div>
                  )}
                  {user.ultimoAcceso && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Último acceso: {new Date(user.ultimoAcceso).toLocaleDateString('es-PE', { 
                        day: '2-digit', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-1.5">
              <button
                onClick={() => {
                  setIsChangePasswordModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="
                  flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                  text-sm text-gray-600
                  hover:bg-gray-50 hover:text-gray-900
                  transition-colors duration-150
                "
                role="menuitem"
              >
                <Key className="w-4 h-4 text-gray-400" />
                Cambiar Contraseña
              </button>
              
              <div className="h-px bg-gray-100 my-1" />
              
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                  text-sm text-rose-600
                  hover:bg-rose-50
                  transition-colors duration-150
                "
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
});

UserMenu.displayName = 'UserMenu';

export default UserMenu;
