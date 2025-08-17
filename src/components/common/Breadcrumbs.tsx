import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useCurrentRoute, useAppNavigation } from '../../hooks/useRouting';

/**
 * Componente de breadcrumbs para navegación
 */
const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useCurrentRoute();
  const { navigateToHome } = useAppNavigation();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {/* Home link */}
      <button
        onClick={navigateToHome}
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        Dashboard
      </button>

      {/* Breadcrumb items */}
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span
            className={`${
              crumb.isLast
                ? 'text-gray-900 font-medium'
                : 'text-gray-600 hover:text-blue-600 cursor-pointer'
            }`}
          >
            {crumb.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
