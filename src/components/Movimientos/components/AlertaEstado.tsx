import React, { memo } from 'react';
import { AlertTriangle, Loader2, Clock } from 'lucide-react';

interface AlertaEstadoProps {
  tipo: 'error' | 'loading' | 'pending' | 'success';
  mensaje: string;
  submensaje?: string;
  accion?: {
    label: string;
    onClick: () => void;
  };
  count?: number;
}

export const AlertaEstado: React.FC<AlertaEstadoProps> = memo(({
  tipo,
  mensaje,
  submensaje,
  accion,
  count
}) => {
  const estilos = {
    error: {
      container: 'bg-rose-50 border border-rose-200',
      icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
      text: 'text-rose-800',
    },
    loading: {
      container: 'bg-teal-50 border border-teal-200',
      icon: <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />,
      text: 'text-teal-800',
    },
    pending: {
      container: 'bg-amber-50 border border-amber-200',
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      text: 'text-amber-800',
    },
    success: {
      container: 'bg-emerald-50 border border-emerald-200',
      icon: null,
      text: 'text-emerald-800',
    },
  };

  const estilo = estilos[tipo];

  return (
    <div className={`rounded-xl p-4 ${estilo.container}`} role="alert">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {estilo.icon}
          <div>
            <span className={`font-medium ${estilo.text}`}>
              {mensaje}
              {count !== undefined && count > 0 && (
                <span className="ml-1">({count})</span>
              )}
            </span>
            {submensaje && (
              <p className={`text-sm mt-0.5 ${estilo.text} opacity-80`}>
                {submensaje}
              </p>
            )}
          </div>
        </div>
        {accion && (
          <button
            onClick={accion.onClick}
            className={`text-sm font-medium ${estilo.text} hover:underline transition-all`}
          >
            {accion.label}
          </button>
        )}
      </div>
    </div>
  );
});

AlertaEstado.displayName = 'AlertaEstado';
