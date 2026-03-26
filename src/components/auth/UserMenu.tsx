import React, { useState, useRef, useEffect, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { CaretDown, Key, SignOut, Buildings, Clock } from '@phosphor-icons/react';
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

  const getRoleBadgeStyle = (rol: string): string => {
    const roles: Record<string, string> = {
      administrador: 'bg-rose-100 text-rose-800 border bg-rose-50/50 border-rose-200',
      coordinador: 'bg-emerald-100 text-emerald-800 border bg-emerald-50/50 border-emerald-200',
      responsable_acopio: 'bg-blue-100 text-blue-800 border bg-blue-50/50 border-blue-200',
      operador: 'bg-zinc-100 text-zinc-800 border bg-zinc-50/50 border-zinc-200',
    };
    return roles[rol] || roles.operador;
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
            flex items-center gap-2 p-1.5 pr-2 rounded-xl
            transition-all duration-200 border border-transparent
            hover:bg-zinc-50 hover:border-zinc-200
            focus:outline-none focus:ring-2 focus:ring-zinc-900/10
            ${isMenuOpen ? 'bg-zinc-50 border-zinc-200 shadow-sm' : ''}
          `}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          {/* Avatar Neutro Superior */}
          <div className="w-8 h-8 rounded-[10px] bg-zinc-900 border border-zinc-950 flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-white tracking-widest leading-none pl-[1px]">
              {getUserInitials()}
            </span>
          </div>
          
          {/* User Info */}
          <div className="hidden md:block text-left max-w-[140px] pl-1">
            <p className="text-[13px] font-bold text-zinc-900 truncate leading-none mb-1">
              {displayName}
            </p>
            <p className="text-[10px] font-semibold text-zinc-500 truncate leading-none uppercase tracking-wide">
              {formatRole(user.rol)}
            </p>
          </div>
          
          {/* Chevron */}
          <CaretDown 
            className={`
              w-4 h-4 ml-1 text-zinc-400 transition-transform duration-200
              ${isMenuOpen ? 'rotate-180 text-zinc-900' : ''}
            `} 
            weight="bold"
          />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div 
            className="
              absolute right-0 mt-3 w-72
              bg-white rounded-2xl shadow-[0_12px_40px_-15px_rgba(0,0,0,0.15)]
              border border-zinc-200
              overflow-hidden
              z-50
              animate-in fade-in slide-in-from-top-3 duration-200
            "
            role="menu"
          >
            {/* User Header */}
            <div className="p-5 bg-zinc-50/50 border-b border-zinc-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-base font-bold tracking-wider text-white">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[15px] font-bold text-zinc-900 leading-tight truncate">
                    {displayName}
                  </p>
                  <p className="text-[13px] font-medium text-zinc-500 truncate mt-0.5">
                    {user.email || user.usuario}
                  </p>
                  <span className={`
                    inline-flex items-center px-2 py-0.5 mt-2.5
                    text-[10px] font-bold uppercase tracking-wider rounded-md
                    ${getRoleBadgeStyle(user.rol)}
                  `}>
                    {formatRole(user.rol)}
                  </span>
                </div>
              </div>
              
              {/* Additional Context Info */}
              {(user.establecimiento || user.centroAcopio || user.ultimoAcceso) && (
                <div className="mt-4 pt-4 border-t border-zinc-200/60 space-y-2.5">
                  {(user.centroAcopio || user.establecimiento) && (
                    <div className="flex items-center gap-2.5 text-[13px] text-zinc-600 font-medium">
                      <Buildings className="w-4 h-4 text-zinc-400" weight="duotone" />
                      <span className="truncate">{user.centroAcopio?.nombre || user.establecimiento?.nombre}</span>
                    </div>
                  )}
                  {user.ultimoAcceso && (
                    <div className="flex items-center gap-2.5 text-[13px] text-zinc-500">
                      <Clock className="w-4 h-4 text-zinc-400" weight="duotone" />
                      <span>{new Date(user.ultimoAcceso).toLocaleDateString('es-PE', { 
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

            {/* Menu Actions */}
            <div className="p-2 bg-white">
              <button
                onClick={() => {
                  setIsChangePasswordModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="
                  flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                  text-[13px] font-semibold text-zinc-600
                  hover:bg-zinc-100 hover:text-zinc-900
                  transition-colors duration-150
                "
                role="menuitem"
              >
                <Key className="w-4 h-4 text-zinc-400" weight="duotone" />
                Cambiar contraseña
              </button>
              
              <div className="h-px bg-zinc-100 my-1 mx-2" />
              
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                  text-[13px] font-semibold text-rose-600
                  hover:bg-rose-50 hover:text-rose-700
                  transition-colors duration-150
                "
                role="menuitem"
              >
                <SignOut className="w-4 h-4" weight="bold" />
                Cerrar sesión
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
