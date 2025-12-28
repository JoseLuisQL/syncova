import React from 'react';
import { Download, Eye, Loader2 } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface ReporteCardProps {
  id: string;
  nombre: string;
  descripcion: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'teal' | 'cyan' | 'emerald' | 'amber' | 'rose';
  registros?: number;
  isLoading?: boolean;
  hasData?: boolean;
  onGenerar: () => void;
  onExportar?: () => void;
  onVerDatos?: () => void;
}

const COLOR_CLASSES = {
  teal: {
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-600',
    button: 'bg-teal-600 hover:bg-teal-700',
  },
  cyan: {
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-600',
    button: 'bg-cyan-600 hover:bg-cyan-700',
  },
  emerald: {
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700',
  },
  amber: {
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700',
  },
  rose: {
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-600',
    button: 'bg-rose-600 hover:bg-rose-700',
  },
};

const ReporteCard: React.FC<ReporteCardProps> = ({
  nombre,
  descripcion,
  icon: Icon,
  color,
  registros,
  isLoading = false,
  hasData = false,
  onGenerar,
  onExportar,
  onVerDatos,
}) => {
  const colors = COLOR_CLASSES[color] || COLOR_CLASSES.teal;

  return (
    <div className={COMPONENT_STYLES.reportCard.container}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`${COMPONENT_STYLES.reportCard.iconWrapper} ${colors.iconBg}`}>
          <Icon className={`h-5 w-5 ${colors.iconText}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={COMPONENT_STYLES.reportCard.title}>{nombre}</h3>
            {hasData && registros !== undefined && registros > 0 && (
              <span className={COMPONENT_STYLES.reportCard.badge}>
                {registros} registros
              </span>
            )}
          </div>
          <p className={COMPONENT_STYLES.reportCard.description}>{descripcion}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onGenerar}
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${colors.button}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generando...</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Generar</span>
            </>
          )}
        </button>

        {hasData && onVerDatos && (
          <button
            onClick={onVerDatos}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}

        {hasData && onExportar && (
          <button
            onClick={onExportar}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(ReporteCard);
