import React, { memo } from 'react';
import { List } from '@phosphor-icons/react';
import { useApp } from '../../contexts/AppContext';
import NotificationBell from './NotificationBell';
import Breadcrumbs from '../common/Breadcrumbs';

const Header: React.FC = memo(() => {
  const { toggleMobileMenu } = useApp();

  return (
    <header className="sticky top-3 z-30 mx-3 mb-3 mt-3 rounded-3xl border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] transition-all duration-300 sm:top-4 sm:mx-4 sm:mb-4 sm:mt-4 sm:rounded-4xl">
      <div className="grid h-[64px] w-full grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-line-focus bg-white text-muted-2 transition-colors duration-150 hover:border-[#c7c9d5] hover:text-ink-soft focus:outline-none focus:ring-2 focus:ring-line-focus/70 lg:hidden"
            aria-label="Abrir menú"
          >
            <List className="h-5 w-5" weight="bold" />
          </button>

          <div className="flex h-10 min-w-0 items-center rounded-[9px] border border-line-focus bg-white px-3">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex h-10 flex-shrink-0 items-center gap-2">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
