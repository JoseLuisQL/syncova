import React, { memo } from 'react';
import { Warning, CircleNotch, Clock } from '@phosphor-icons/react';

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
      icon: <Warning className="h-5 w-5 text-rose-600" weight="duotone" />,
      text: 'text-rose-800',
    },
    loading: {
      container: 'bg-zinc-50 border border-zinc-200',
      icon: <CircleNotch className="h-5 w-5 text-zinc-900 animate-spin" weight="bold" />,
      text: 'text-zinc-800',
    },
    pending: {
      container: 'bg-amber-50 border border-amber-200',
      icon: <Clock className="h-5 w-5 text-amber-600" weight="duotone" />,
      text: 'text-amber-800',
    },
    success: {
      container: 'bg-[#f3f0ff] border border-[#dedfea]',
      icon: null,
      text: 'text-[#7c3aed]',
    },
  };

  const estilo = estilos[tipo];

  return (
    <div className={`rounded-xl p-4 ${estilo.container}`} role="alert">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {estilo.icon}
          <div>
            <span className={`font-medium tracking-tight ${estilo.text}`}>
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
          <button type="button"
            onClick={accion.onClick}
            className={`text-sm font-bold ${estilo.text} hover:underline transition-all`}
          >
            {accion.label}
          </button>
        )}
      </div>
    </div>
  );
});

AlertaEstado.displayName = 'AlertaEstado';
