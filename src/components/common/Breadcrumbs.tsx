import React, { memo } from 'react';
import { CaretRight, House } from '@phosphor-icons/react';
import { useCurrentRoute, useAppNavigation } from '../../hooks/useRouting';
import { BREADCRUMBS_STYLES } from '../Layout/constants';

const Breadcrumbs: React.FC = memo(() => {
  const { breadcrumbs } = useCurrentRoute();
  const { navigateToHome, navigate } = useAppNavigation();

  const items = breadcrumbs.length > 0
    ? breadcrumbs
    : [{ label: 'Dashboard', path: '/dashboard', isLast: true }];

  return (
    <nav className={BREADCRUMBS_STYLES.nav} aria-label="Breadcrumb">
      <button
        type="button"
        onClick={navigateToHome}
        className={BREADCRUMBS_STYLES.homeButton}
        aria-label="Ir al Dashboard"
      >
        <House className={BREADCRUMBS_STYLES.homeIcon} weight="duotone" />
      </button>

      {items.map((crumb, idx) => {
        const isIntermediate = idx < items.length - 1;
        return (
          <React.Fragment key={crumb.path}>
            <CaretRight
              className={`${BREADCRUMBS_STYLES.separator} ${isIntermediate ? 'hidden sm:block' : ''}`}
              weight="bold"
              aria-hidden="true"
            />
            {crumb.isLast ? (
              <span
                className={`${BREADCRUMBS_STYLES.itemLast} truncate`}
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => navigate(crumb.path)}
                className={`${BREADCRUMBS_STYLES.item} ${isIntermediate ? 'hidden sm:inline' : ''} truncate`}
              >
                {crumb.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
