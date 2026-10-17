import React, { memo } from 'react';
import { List } from '@phosphor-icons/react';
import { useApp } from '../../contexts/AppContext';
import Breadcrumbs from '../common/Breadcrumbs';
import NotificationBell from './NotificationBell';
import ThemeToggle from '../common/ThemeToggle';

const Header: React.FC = memo(() => {
  const { toggleMobileMenu } = useApp();

  return (
    <header className="sticky top-0 z-30 px-2.5 pt-2.5 sm:px-4 sm:pt-4">
      <div className="flex h-14 sm:h-16 items-center justify-between rounded-2xl sm:rounded-3xl border border-line bg-surface/95 px-3.5 sm:px-5 shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[9px] border border-line-focus bg-surface text-muted-2 transition-colors hover:border-line-strong hover:bg-surface-soft hover:text-ink lg:hidden"
            aria-label="Abrir menú"
          >
            <List className="h-5 w-5" weight="bold" />
          </button>
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
