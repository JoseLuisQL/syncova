import React, { useState, useEffect } from 'react';
import { ChartBar, TrendUp, Package, Syringe, Buildings, Gear, CircleNotch, ArrowsClockwise, Info } from '@phosphor-icons/react';
import { apiClient } from '../../config/api';
import { COMPONENT_STYLES } from './constants';

interface EstadisticasData {
  totalConfiguracionesDefecto: number;
  totalConfiguracionesCentro: number;
  vacunasConfiguradas: number;
  jeringasUtilizadas: number;
  centrosConConfiguracion: number;
  multiplicadorPromedio: number;
}

interface EstadisticasConfiguracionProps {
  onNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

const EstadisticasConfiguracion: React.FC<EstadisticasConfiguracionProps> = ({
  onNotification
}) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData>({
    totalConfiguracionesDefecto: 0,
    totalConfiguracionesCentro: 0,
    vacunasConfiguradas: 0,
    jeringasUtilizadas: 0,
    centrosConConfiguracion: 0,
    multiplicadorPromedio: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const loadEstadisticas = async () => {
    setIsLoading(true);
    try {
      const defectoResponse = await apiClient.get('/configuracion-jeringa-vacuna/defecto?limit=1000');
      const defectoData = defectoResponse.data.success ? defectoResponse.data : { data: [], pagination: { total: 0 } };

      const centroResponse = await apiClient.get('/configuracion-jeringa-vacuna/centro?limit=1000');
      const centroData = centroResponse.data.success ? centroResponse.data : { data: [], pagination: { total: 0 } };

      const configuracionesDefecto = defectoData.data || [];
      const configuracionesCentro = centroData.data || [];
      
      const vacunasUnicas = new Set([
        ...configuracionesDefecto.map((c: any) => c.vacunaId),
        ...configuracionesCentro.map((c: any) => c.vacunaId)
      ]);

      const jeringasUnicas = new Set([
        ...configuracionesDefecto.map((c: any) => c.jeringaId),
        ...configuracionesCentro.map((c: any) => c.jeringaId)
      ]);

      const centrosUnicos = new Set(configuracionesCentro.map((c: any) => c.centroAcopioId));

      const todosMultiplicadores = [
        ...configuracionesDefecto.map((c: any) => c.multiplicador),
        ...configuracionesCentro.map((c: any) => c.multiplicador)
      ];

      const multiplicadorPromedio = todosMultiplicadores.length > 0 
        ? todosMultiplicadores.reduce((sum, mult) => sum + mult, 0) / todosMultiplicadores.length
        : 0;

      setEstadisticas({
        totalConfiguracionesDefecto: defectoData.pagination?.total || 0,
        totalConfiguracionesCentro: centroData.pagination?.total || 0,
        vacunasConfiguradas: vacunasUnicas.size,
        jeringasUtilizadas: jeringasUnicas.size,
        centrosConConfiguracion: centrosUnicos.size,
        multiplicadorPromedio: Math.round(multiplicadorPromedio * 100) / 100
      });

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      onNotification('error', 'Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showStats) {
      void loadEstadisticas();
    }
  }, [showStats]);

  const statsCards = [
    {
      title: 'Configuraciones por Defecto',
      value: estadisticas.totalConfiguracionesDefecto,
      icon: Gear,
      description: 'Configuraciones globales activas'
    },
    {
      title: 'Configuraciones por Centro',
      value: estadisticas.totalConfiguracionesCentro,
      icon: Buildings,
      description: 'Configuraciones específicas por centro'
    },
    {
      title: 'Vacunas Configuradas',
      value: estadisticas.vacunasConfiguradas,
      icon: Package,
      description: 'Vacunas con al menos una configuración'
    },
    {
      title: 'Jeringas Utilizadas',
      value: estadisticas.jeringasUtilizadas,
      icon: Syringe,
      description: 'Tipos de jeringas en configuraciones'
    },
    {
      title: 'Centros con Configuración',
      value: estadisticas.centrosConConfiguracion,
      icon: Buildings,
      description: 'Centros con configuraciones específicas'
    },
    {
      title: 'Multiplicador Promedio',
      value: estadisticas.multiplicadorPromedio,
      icon: TrendUp,
      description: 'Promedio de todos los multiplicadores',
      isDecimal: true
    }
  ];

  return (
    <div className={COMPONENT_STYLES.panel}>
      <div className="p-4 border-b border-zinc-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-lg font-semibold text-zinc-900 transition-colors hover:text-zinc-600"
          >
            <ChartBar className="h-5 w-5" weight="duotone" />
            Estadísticas de Configuración
          </button>
          
          {showStats && (
            <button type="button"
              onClick={loadEstadisticas}
              disabled={isLoading}
              className={COMPONENT_STYLES.button.secondary}
            >
              <ArrowsClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} weight="bold" />
              <span>Actualizar</span>
            </button>
          )}
        </div>
      </div>

      {showStats && (
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <CircleNotch className="h-8 w-8 animate-spin text-zinc-900 mb-4" weight="bold" />
              <span>Calculando métricas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statsCards.map((card, index) => {
                const Icon = card.icon;
                
                return (
                  <div key={index} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 hover:border-zinc-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm">
                        <Icon className="h-5 w-5" weight="duotone" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-zinc-900">
                          {card.isDecimal ? card.value.toFixed(2) : card.value}
                          {card.isDecimal && <span className="text-sm font-normal text-zinc-500 ml-1">x</span>}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                        {card.title}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && (
            <div className="mt-6 p-4 bg-zinc-900 border border-zinc-900 rounded-2xl text-white">
              <h4 className="font-semibold text-zinc-100 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-zinc-400" weight="fill" />
                Información del Sistema
              </h4>
              <div className="text-sm text-zinc-400 space-y-2">
                <p>• Las configuraciones por centro tienen prioridad sobre las configuraciones por defecto.</p>
                <p>• El multiplicador determina cuántas jeringas se necesitan por dosis de vacuna.</p>
                <p>• La prioridad determina el orden de selección cuando hay múltiples jeringas configuradas.</p>
                <p>• Solo las configuraciones activas se utilizan en los cálculos automáticos del Cockpit.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EstadisticasConfiguracion;
