import React, { memo } from 'react';
import UserMenu from '../auth/UserMenu';
import Breadcrumbs from '../common/Breadcrumbs';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = memo(({ title }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left section - Title and Breadcrumbs */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-800 truncate">
              {title}
            </h1>
          </div>
          <div className="hidden sm:block">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <NotificationBell />

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
