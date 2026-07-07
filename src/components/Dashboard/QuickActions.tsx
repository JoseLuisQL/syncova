import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  ChevronRight 
} from 'lucide-react';
import { QUICK_ACTIONS, DASHBOARD_COLORS } from './constants';

const ICONS = {
  '/vales': FileText,
  '/movimientos': TrendingUp,
  '/inventario': Package,
  '/alertas': AlertTriangle,
} as const;

const QuickActions: React.FC = memo(() => {
  const navigate = useNavigate();

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <nav 
      className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-2xl p-5 border border-teal-100"
      aria-label="Accesos rápidos"
    >
      <h2 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600">
          <ChevronRight className="h-4 w-4 text-white" aria-hidden="true" />
        </span>
        Accesos Rápidos
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = ICONS[action.path as keyof typeof ICONS];
          const colors = DASHBOARD_COLORS[action.colorScheme];
          
          return (
            <button type="button"
              key={action.path}
              onClick={() => handleNavigation(action.path)}
              className={`flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-100 
                hover:border-teal-200 hover:shadow-md transition-all duration-200 group text-left`}
              aria-label={`Ir a ${action.label}`}
            >
              <div className={`p-2 rounded-lg ${colors.bg} group-hover:scale-105 transition-transform`}>
                <Icon className={`h-5 w-5 ${colors.icon}`} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {action.label}
                </p>
                <p className="text-xs text-zinc-500 truncate hidden sm:block">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

QuickActions.displayName = 'QuickActions';

export default QuickActions;
