import React, { memo } from 'react';
import { List, MagnifyingGlass } from '@phosphor-icons/react';
import { useApp } from '../../contexts/AppContext';
import NotificationBell from './NotificationBell';
import Breadcrumbs from '../common/Breadcrumbs';

const Header: React.FC = memo(() => {
  const { toggleMobileMenu } = useApp();

  return (
    <header className="sticky top-4 z-30 mx-4 mb-4 mt-4 rounded-[24px] border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] transition-all duration-300">
      <div className="grid h-[64px] w-full grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#dedfea] bg-white text-[#606571] transition-colors duration-150 hover:border-[#c7c9d5] hover:text-[#111318] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 lg:hidden"
            aria-label="Abrir menú"
          >
            <List className="h-5 w-5" weight="bold" />
          </button>

          <div className="flex h-10 min-w-0 items-center rounded-[9px] border border-[#dedfea] bg-white px-3">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex h-10 flex-shrink-0 items-center gap-2">
          <label className="relative hidden min-w-[220px] lg:block">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8f9b]" />
            <input
              type="search"
              placeholder="Buscar"
              className="h-10 w-full rounded-[9px] border border-[#dedfea] bg-white pl-9 pr-14 text-[13px] font-medium text-[#111318] outline-none transition-colors placeholder:text-[#8b8f9b] focus:border-[#babdca]"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[6px] border border-[#e3e4ed] bg-[#f8f7fb] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#686d78]">⌘ K</span>
          </label>

          <NotificationBell />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
