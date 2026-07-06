import React, { memo } from 'react';
import { CaretRight, House } from '@phosphor-icons/react';
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
        <House className={BREADCRUMBS_STYLES.homeIcon} weight="duotone" />
      </button>

      {breadcrumbs.map((crumb, idx) => {
        // En móvil, ocultar breadcrumbs intermedios: mostrar solo el último
        // para evitar que el header se comprima. En sm+ se ven todos.
        const isIntermediate = idx < breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.path}>
            <CaretRight className={`${BREADCRUMBS_STYLES.separator} ${isIntermediate ? 'hidden sm:block' : ''}`} weight="bold" aria-hidden="true" />
            <span
              className={`${crumb.isLast ? BREADCRUMBS_STYLES.itemLast : BREADCRUMBS_STYLES.item} ${isIntermediate ? 'hidden sm:inline' : ''} truncate`}
              aria-current={crumb.isLast ? 'page' : undefined}
            >
              {crumb.label}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
