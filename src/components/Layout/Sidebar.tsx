import React, { memo, useEffect, useRef, useState, useMemo } from 'react';
import { Buildings, CaretDown, CaretLeft, CaretRight, Clock, Key, MagnifyingGlass, SignOut, X } from '@phosphor-icons/react';
import { useApp } from '../../contexts/AppContext';
import { useAlertasGlobal } from '../../contexts/AlertasContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { usePermissions } from '../../hooks/usePermissions';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { SivacLogo } from '../common/SivacLogo';
import { MENU_SECTIONS, MenuItem } from './constants';

const PRIMARY_IDS = ['dashboard', 'establecimientos', 'inventario', 'movimientos'];
const SECONDARY_IDS = ['planificacion', 'ici-demid', 'kardex', 'reportes', 'alertas'];
const UTILITY_IDS = ['usuarios', 'configuracion'];

const orderItems = (items: MenuItem[], ids: string[]) => {
  const byId = new Map(items.map(item => [item.id, item]));
  return ids.map(id => byId.get(id)).filter(Boolean) as MenuItem[];
};

const Sidebar: React.FC = memo(() => {
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const { count } = useAlertasGlobal();
  const { user, logout } = useAuth();
  const { toast } = useToastContext();
  const { navigateToModule } = useAppNavigation();
  const { currentModule } = useCurrentRoute();
  const { canAccessModule } = usePermissions();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    return MENU_SECTIONS
      .flatMap(section => section.items)
      .filter(item => canAccessModule(item.id));
  }, [canAccessModule]);

  const groups = useMemo(() => ({
    primary: orderItems(items, PRIMARY_IDS),
    secondary: orderItems(items, SECONDARY_IDS),
    utility: orderItems(items, UTILITY_IDS),
  }), [items]);

  const isCollapsed = sidebarCollapsed && !mobileMenuOpen;
  const displayName = user?.nombres && user?.apellidos
    ? `${user.nombres} ${user.apellidos}`
    : user?.usuario || 'Usuario';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'U';
  const roleLabel = user?.rol ? user.rol.replace('_', ' ') : 'Sistema';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCollapsed) {
      setIsUserMenuOpen(false);
    }
  }, [isCollapsed]);

  const handleNavigation = (moduleId: string) => {
    navigateToModule(moduleId);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      await logout();
      toast.success('Sesión cerrada exitosamente');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const renderNavItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = currentModule === item.id;
    const badge = item.id === 'alertas' && count > 0 ? (count > 9 ? '9+' : String(count)) : null;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavigation(item.id)}
        className={`
          group/sidebar-item relative flex h-10 w-full items-center rounded-[9px]
          text-[#15171d] transition-colors duration-150
          ${isCollapsed ? 'justify-center px-0' : 'px-3'}
          ${isActive ? 'bg-[#f7f6fb]' : 'hover:bg-[#fbfafd]'}
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center ${isCollapsed ? '' : 'mr-3'}`}>
          <Icon className="h-[18px] w-[18px]" weight={isActive ? 'duotone' : 'regular'} />
        </span>

        {!isCollapsed && (
          <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium tracking-[-0.015em]">
            {item.label}
          </span>
        )}

        {badge && (
          <span className={`${isCollapsed ? 'absolute right-1 top-1' : 'ml-auto'} flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff3d73] px-1.5 text-[10px] font-semibold text-white`}>
            {badge}
          </span>
        )}

        {isCollapsed && (
          <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-[8px] bg-[#111318] px-3 py-2 text-[12px] font-semibold text-white opacity-0 shadow-[0_18px_38px_-24px_rgba(0,0,0,0.9)] transition-opacity duration-150 group-hover/sidebar-item:opacity-100 lg:block">
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#111318]/25 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed bottom-4 left-4 top-4 z-50 flex flex-col overflow-visible
          rounded-[24px] border border-white/90 bg-white
          shadow-[0_28px_80px_-52px_rgba(12,15,24,0.72)]
          transition-all duration-300 ease-out
          ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-[254px]'}
          ${mobileMenuOpen ? 'w-[254px] translate-x-0' : 'w-[254px] -translate-x-[calc(100%+2rem)]'}
          lg:translate-x-0
        `}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className={`flex h-[72px] items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="group/logo-toggle relative flex h-10 w-10 items-center justify-center rounded-[10px] text-[#111318] transition-colors hover:bg-[#f7f6fb] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70"
              aria-label="Expandir menú"
              aria-expanded={false}
            >
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-150 group-hover/logo-toggle:scale-75 group-hover/logo-toggle:opacity-0">
                <SivacLogo size={34} />
              </span>
              <span className="absolute inset-0 flex scale-75 items-center justify-center opacity-0 transition-all duration-150 group-hover/logo-toggle:scale-100 group-hover/logo-toggle:opacity-100">
                <CaretRight className="h-5 w-5" weight="regular" />
              </span>
            </button>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <SivacLogo size={34} />
              <div className="min-w-0">
                <p className="text-[18px] font-semibold leading-none tracking-[-0.03em] text-[#111318]">
                  SIVAC
                </p>
                <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b8f9b]">
                  Sistema de Vacunas
                </p>
              </div>
            </div>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="hidden h-7 w-7 items-center justify-center text-[#a8adba] transition-colors hover:text-[#111318] lg:flex"
              aria-label="Colapsar menú"
            >
              <CaretLeft className="h-3.5 w-3.5" weight="regular" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-[8px] text-[#606571] transition-colors hover:bg-[#f7f6fb] hover:text-[#111318] lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" weight="bold" />
          </button>
        </div>

        <div className={`${isCollapsed ? 'px-3' : 'px-5'} pb-4`}>
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="flex h-10 w-full items-center justify-center rounded-[9px] border border-[#dedfea] text-[#676c77] transition-colors hover:border-[#c7c9d5] hover:bg-[#fbfafd]"
              aria-label="Buscar"
            >
              <MagnifyingGlass className="h-5 w-5" />
            </button>
          ) : (
            <label className="flex h-10 items-center gap-2 rounded-[9px] border border-[#dedfea] bg-white px-3 text-[#8b8f9b] transition-colors focus-within:border-[#babdca]">
              <MagnifyingGlass className="h-4 w-4 flex-shrink-0" />
              <input
                type="search"
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#111318] outline-none placeholder:text-[#8b8f9b]"
              />
              <span className="rounded-[6px] border border-[#e3e4ed] bg-[#f8f7fb] px-1.5 py-0.5 text-[10px] font-semibold text-[#686d78]">⌘</span>
              <span className="rounded-[6px] border border-[#e3e4ed] bg-[#f8f7fb] px-1.5 py-0.5 text-[10px] font-semibold text-[#686d78]">F</span>
            </label>
          )}
        </div>

        <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-3' : 'px-5'} pb-4`}>
          <div className="flex flex-col gap-5">
            {groups.primary.length > 0 && (
              <div className="flex flex-col gap-1">
                {groups.primary.map(renderNavItem)}
              </div>
            )}

            {groups.secondary.length > 0 && (
              <div className="border-t border-[#e7e7ef] pt-5">
                <div className="flex flex-col gap-1">
                  {groups.secondary.map(renderNavItem)}
                </div>
              </div>
            )}

          </div>
        </nav>

        <div className={`${isCollapsed ? 'px-3 pb-4' : 'px-5 pb-5'} space-y-3`}>
          {groups.utility.length > 0 && (
            <div className="border-t border-[#e7e7ef] pt-4">
              <div className="flex flex-col gap-1">
                {groups.utility.map(renderNavItem)}
              </div>
            </div>
          )}

          <div className="relative" ref={userMenuRef}>
            {isUserMenuOpen && !isCollapsed && (
              <div className="absolute bottom-[calc(100%+0.5rem)] left-0 z-[70] w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[18px] border border-white/90 bg-white shadow-[0_28px_80px_-52px_rgba(12,15,24,0.72)]">
                <div className="border-b border-[#e7e7ef] p-4">
                  <div className="flex items-start gap-3">
                    <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#ffd1de] text-[12px] font-semibold text-[#111318]">
                      {initials}
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ff3d73]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[13px] font-semibold leading-snug text-[#111318]">{displayName}</p>
                      <p className="break-all text-[11px] font-medium leading-snug text-[#747986]">{user?.email || user?.usuario}</p>
                      {(user?.centroAcopio || user?.establecimiento || user?.ultimoAcceso) && (
                        <div className="mt-3 space-y-1.5 border-t border-[#e7e7ef] pt-3">
                          {(user.centroAcopio || user.establecimiento) && (
                            <div className="flex items-start gap-2 text-[11px] font-medium text-[#606571]">
                              <Buildings className="h-3.5 w-3.5 text-[#8b8f9b]" weight="duotone" />
                              <span className="min-w-0 break-words">{user.centroAcopio?.nombre || user.establecimiento?.nombre}</span>
                            </div>
                          )}
                          {user.ultimoAcceso && (
                            <div className="flex items-center gap-2 text-[11px] font-medium text-[#747986]">
                              <Clock className="h-3.5 w-3.5 text-[#8b8f9b]" weight="duotone" />
                              <span>{new Date(user.ultimoAcceso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangePasswordModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2 text-left text-[12px] font-semibold text-[#606571] transition-colors hover:bg-[#f8f7fb] hover:text-[#111318]"
                  >
                    <Key className="h-4 w-4 text-[#747986]" weight="duotone" />
                    Cambiar contraseña
                  </button>

                  <div className="mx-2 my-1 h-px bg-[#e7e7ef]" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2 text-left text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                  >
                    <SignOut className="h-4 w-4" weight="bold" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (isCollapsed) {
                  setSidebarCollapsed(false);
                  return;
                }
                setIsUserMenuOpen(prev => !prev);
              }}
              className={`flex w-full items-center rounded-[9px] border bg-white p-2 text-left transition-colors hover:border-[#c7c9d5] ${isUserMenuOpen ? 'border-[#c7c9d5] bg-[#f8f7fb]' : 'border-[#dedfea]'} ${isCollapsed ? 'justify-center' : 'gap-3'}`}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
            >
              <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ffd1de] text-[12px] font-semibold text-[#111318]">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ff3d73]" />
              </span>
              {!isCollapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-[#111318]">{displayName}</span>
                    <span className="block truncate text-[10px] font-medium capitalize text-[#747986]">{roleLabel}</span>
                  </span>
                  <CaretDown className={`h-4 w-4 text-[#7d828d] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} weight="bold" />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
