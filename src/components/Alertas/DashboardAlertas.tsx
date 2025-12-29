import React, { memo, useMemo } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alerta } from '../../types';
import { TIPOS_ALERTA, NIVELES_ALERTA } from './constants';
import { AlertasStats } from './components';

interface DashboardAlertasProps {
  alertas: Alerta[];
  estadisticas: {
    total: number;
    noLeidas: number;
    criticas: number;
    advertencias: number;
    informativas: number;
    exitosas: number;
    hoy: number;
    porNivel: { error: number; warning: number; info: number; success: number };
  };
  isLoading?: boolean;
  error?: string | null;
}

const formatearFecha = (fecha: Date | string): string => {
  if (!fecha) return 'Fecha no disponible';
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(fechaObj.getTime())) return 'Fecha invalida';

  const ahora = new Date();
  const diferencia = ahora.getTime() - fechaObj.getTime();
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;

  return fechaObj.toLocaleDateString();
};

const DashboardAlertas: React.FC<DashboardAlertasProps> = memo(({
  alertas,
  estadisticas,
  isLoading = false,
  error,
}) => {
  const alertasRecientes = useMemo(() => alertas.slice(0, 5), [alertas]);

  const distribucionNivel = useMemo(() => {
    return NIVELES_ALERTA.map(nivel => {
      const cantidad = estadisticas.porNivel[nivel.id as keyof typeof estadisticas.porNivel] || 0;
      const porcentaje = estadisticas.total > 0 ? (cantidad / estadisticas.total * 100) : 0;
      return { ...nivel, cantidad, porcentaje };
    });
  }, [estadisticas]);

  const distribucionTipo = useMemo(() => {
    return TIPOS_ALERTA.map(tipo => {
      const cantidad = alertas.filter(a => a.tipo === tipo.id).length;
      return { ...tipo, cantidad };
    });
  }, [alertas]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <p className="text-rose-800 text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AlertasStats
        stats={{
          total: estadisticas.total,
          noLeidas: estadisticas.noLeidas,
          criticas: estadisticas.criticas,
          hoy: estadisticas.hoy,
        }}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Distribucion por Nivel</h3>
          <div className="space-y-3">
            {distribucionNivel.map((nivel) => {
              const Icon = nivel.icon;
              return (
                <div key={nivel.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 ${nivel.bgColor} rounded-lg`}>
                      <Icon className={`h-4 w-4 ${nivel.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{nivel.label}</p>
                      <p className="text-xs text-gray-500">{nivel.cantidad} alertas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{nivel.porcentaje.toFixed(0)}%</p>
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${nivel.bgColor.replace('bg-', 'bg-').replace('-100', '-500')}`}
                        style={{ width: `${Math.max(nivel.porcentaje, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Por Tipo de Alerta</h3>
          <div className="space-y-2">
            {distribucionTipo.map((tipo) => {
              const Icon = tipo.icon;
              return (
                <div key={tipo.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${tipo.color}`} />
                    <span className="text-sm font-medium text-gray-900">{tipo.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-0.5 rounded">
                    {tipo.cantidad}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Alertas Recientes</h3>
          {alertasRecientes.length > 0 && (
            <span className="text-xs text-gray-500">Ultimas 5</span>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          </div>
        ) : alertasRecientes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay alertas recientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertasRecientes.map((alerta) => {
              const nivelInfo = NIVELES_ALERTA.find(n => n.id === alerta.nivel);
              const tipoInfo = TIPOS_ALERTA.find(t => t.id === alerta.tipo);
              const IconoNivel = nivelInfo?.icon || NIVELES_ALERTA[2].icon;
              const IconoTipo = tipoInfo?.icon || TIPOS_ALERTA[3].icon;

              return (
                <div
                  key={alerta.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    !alerta.leida ? 'bg-teal-50/50 border-teal-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <IconoNivel className={`h-4 w-4 mt-0.5 ${nivelInfo?.color || 'text-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${!alerta.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                        {alerta.titulo}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatearFecha(alerta.fechaCreacion)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{alerta.descripcion}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <IconoTipo className={`h-3 w-3 ${tipoInfo?.color || 'text-gray-500'}`} />
                      <span className="text-xs text-gray-500 capitalize">{alerta.tipo.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {!alerta.leida && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

DashboardAlertas.displayName = 'DashboardAlertas';

export default DashboardAlertas;
