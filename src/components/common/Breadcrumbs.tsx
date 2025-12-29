import React, { memo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useCurrentRoute, useAppNavigation } from '../../hooks/useRouting';
import { BREADCRUMBS_STYLES } from '../Layout/constants';

const Breadcrumbs: React.FC = memo(() => {
  const { breadcrumbs } = useCurrentRoute();
  const { navigateToHome } = useAppNavigation();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={BREADCRUMBS_STYLES.nav} aria-label="Breadcrumb">
      <button
        onClick={navigateToHome}
        className={BREADCRUMBS_STYLES.homeButton}
        aria-label="Ir al Dashboard"
      >
        <Home className={BREADCRUMBS_STYLES.homeIcon} />
      </button>

      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.path}>
          <ChevronRight className={BREADCRUMBS_STYLES.separator} aria-hidden="true" />
          <span
            className={crumb.isLast ? BREADCRUMBS_STYLES.itemLast : BREADCRUMBS_STYLES.item}
            aria-current={crumb.isLast ? 'page' : undefined}
          >
            {crumb.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
