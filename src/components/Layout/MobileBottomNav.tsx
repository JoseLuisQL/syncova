import React, { useMemo } from 'react';
import {
  SquaresFour,
  Package,
  ArrowsLeftRight,
  CalendarBlank,
  List,
  ChartBar,
} from '@phosphor-icons/react';
import { useApp } from '../../contexts/AppContext';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { usePermissions } from '../../hooks/usePermissions';

interface QuickNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const PRIMARY_ITEMS: QuickNavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: SquaresFour },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'movimientos', label: 'Movimientos', icon: ArrowsLeftRight },
  { id: 'planificacion', label: 'Planif.', icon: CalendarBlank },
  { id: 'reportes', label: 'Reportes', icon: ChartBar },
];

const MobileBottomNav: React.FC = () => {
  const { setMobileMenuOpen } = useApp();
  const { currentModule } = useCurrentRoute();
  const { navigateToModule } = useAppNavigation();
  const { canAccessModule } = usePermissions();

  const visibleItems = useMemo(
    () => PRIMARY_ITEMS.filter((item) => canAccessModule(item.id)).slice(0, 4),
    [canAccessModule]
  );

  return (
    <nav
      aria-label="Navegación rápida móvil"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md pb-safe lg:hidden shadow-[0_-4px_16px_rgba(15,23,42,0.06)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-center px-1 py-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateToModule(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 px-1 transition-colors ${
                isActive
                  ? 'text-brand font-semibold'
                  : 'text-muted-2 hover:text-ink'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`flex h-7 w-10 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-brand/12 text-brand' : 'text-current'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" weight={isActive ? 'fill' : 'regular'} />
              </div>
              <span className="max-w-full truncate text-[10px] leading-tight tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 px-1 text-muted-2 transition-colors hover:text-ink"
          aria-label="Abrir menú completo de módulos"
        >
          <div className="flex h-7 w-10 items-center justify-center rounded-full">
            <List className="h-[18px] w-[18px]" weight="bold" />
          </div>
          <span className="max-w-full truncate text-[10px] leading-tight tracking-tight">
            Módulos
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
