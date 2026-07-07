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
        <button type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`
            flex h-10 items-center gap-2 rounded-[9px] border bg-white p-1 pr-2
            transition-colors duration-150
            hover:border-[#c7c9d5]
            focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70
            ${isMenuOpen ? 'border-[#c7c9d5] bg-[#f8f7fb]' : 'border-[#dedfea]'}
          `}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          {/* Avatar Neutro Superior */}
          <div className="w-8 h-8 rounded-full bg-[#ffd1de] flex items-center justify-center">
            <span className="text-[12px] font-semibold text-[#111318] tracking-widest leading-none">
              {getUserInitials()}
            </span>
          </div>
          
          {/* User Info */}
          <div className="hidden md:block text-left max-w-[140px] pl-1">
            <p className="text-[12px] font-semibold text-[#111318] truncate leading-none mb-1">
              {displayName}
            </p>
            <p className="text-[10px] font-semibold text-[#747986] truncate leading-none uppercase tracking-widest">
              {formatRole(user.rol)}
            </p>
          </div>
          
          {/* Chevron */}
          <CaretDown 
            className={`
              w-4 h-4 ml-1 text-[#7d828d] transition-transform duration-200
              ${isMenuOpen ? 'rotate-180 text-[#111318]' : ''}
            `} 
            weight="bold"
          />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div 
            className="
              absolute right-0 mt-2 w-72
              bg-white rounded-[18px] shadow-[0_28px_80px_-52px_rgba(12,15,24,0.72)]
              border border-white/90
              overflow-hidden
              z-50
              animate-in fade-in slide-in-from-top-2 duration-150
            "
            role="menu"
          >
            {/* User Header */}
            <div className="p-5 bg-white border-b border-[#e7e7ef]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ffd1de] flex items-center justify-center flex-shrink-0">
                  <span className="text-[15px] font-semibold tracking-wider text-[#111318]">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[14px] font-semibold text-[#111318] leading-tight truncate">
                    {displayName}
                  </p>
                  <p className="text-[12px] font-semibold text-[#747986] truncate mt-0.5">
                    {user.email || user.usuario}
                  </p>
                  <span className={`
                    inline-flex items-center px-2 py-0.5 mt-2.5
                    text-[10px] font-semibold uppercase tracking-widest rounded-[4px] border
                    ${getRoleBadgeStyle(user.rol)}
                  `}>
                    {formatRole(user.rol)}
                  </span>
                </div>
              </div>
              
              {/* Additional Context Info */}
              {(user.establecimiento || user.centroAcopio || user.ultimoAcceso) && (
                <div className="mt-4 pt-4 border-t border-[#e7e7ef] space-y-2.5">
                  {(user.centroAcopio || user.establecimiento) && (
                    <div className="flex items-center gap-2.5 text-[12px] text-[#606571] font-semibold">
                      <Buildings className="w-4 h-4 text-[#8b8f9b]" weight="duotone" />
                      <span className="truncate">{user.centroAcopio?.nombre || user.establecimiento?.nombre}</span>
                    </div>
                  )}
                  {user.ultimoAcceso && (
                    <div className="flex items-center gap-2.5 text-[12px] text-[#747986] font-semibold">
                      <Clock className="w-4 h-4 text-[#8b8f9b]" weight="duotone" />
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
            <div className="p-2 bg-white flex flex-col gap-1">
              <button type="button"
                onClick={() => {
                  setIsChangePasswordModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="
                  flex items-center gap-3 w-full px-3 py-2 rounded-[9px]
                  text-[12px] font-semibold text-[#606571]
                  hover:bg-[#f8f7fb] hover:text-[#111318]
                  transition-colors duration-150
                "
                role="menuitem"
              >
                <Key className="w-4 h-4 text-[#747986]" weight="duotone" />
                Cambiar contraseña
              </button>
              
              <div className="h-px bg-[#e7e7ef] my-1 mx-2" />
              
              <button type="button"
                onClick={handleLogout}
                className="
                  flex items-center gap-3 w-full px-3 py-2 rounded-[9px]
                  text-[12px] font-semibold text-rose-600
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
