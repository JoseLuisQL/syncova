import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Syringe, Building2, Settings, Loader, RefreshCw } from 'lucide-react';
import { apiClient } from '../../config/api';

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
      // Cargar configuraciones por defecto
      const defectoResponse = await apiClient.get('/configuracion-jeringa-vacuna/defecto?limit=1000');
      const defectoData = defectoResponse.data.success ? defectoResponse.data : { data: [], pagination: { total: 0 } };

      // Cargar configuraciones por centro
      const centroResponse = await apiClient.get('/configuracion-jeringa-vacuna/centro?limit=1000');
      const centroData = centroResponse.data.success ? centroResponse.data : { data: [], pagination: { total: 0 } };

      // Procesar estadísticas
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
      loadEstadisticas();
    }
  }, [showStats]);

  const statsCards = [
    {
      title: 'Configuraciones por Defecto',
      value: estadisticas.totalConfiguracionesDefecto,
      icon: Settings,
      color: 'blue',
      description: 'Configuraciones globales activas'
    },
    {
      title: 'Configuraciones por Centro',
      value: estadisticas.totalConfiguracionesCentro,
      icon: Building2,
      color: 'green',
      description: 'Configuraciones específicas por centro'
    },
    {
      title: 'Vacunas Configuradas',
      value: estadisticas.vacunasConfiguradas,
      icon: Package,
      color: 'purple',
      description: 'Vacunas con al menos una configuración'
    },
    {
      title: 'Jeringas Utilizadas',
      value: estadisticas.jeringasUtilizadas,
      icon: Syringe,
      color: 'indigo',
      description: 'Tipos de jeringas en configuraciones'
    },
    {
      title: 'Centros con Configuración',
      value: estadisticas.centrosConConfiguracion,
      icon: Building2,
      color: 'yellow',
      description: 'Centros con configuraciones específicas'
    },
    {
      title: 'Multiplicador Promedio',
      value: estadisticas.multiplicadorPromedio,
      icon: TrendingUp,
      color: 'red',
      description: 'Promedio de todos los multiplicadores',
      isDecimal: true
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            Estadísticas de Configuración
          </button>
          
          {showStats && (
            <button
              onClick={loadEstadisticas}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          )}
        </div>
      </div>

      {showStats && (
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin h-8 w-8 text-blue-600 mr-2" />
              <span className="text-gray-600">Cargando estadísticas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statsCards.map((card, index) => {
                const Icon = card.icon;
                const colorClasses = getColorClasses(card.color);
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg border ${colorClasses}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {card.isDecimal ? card.value.toFixed(2) : card.value}
                          {card.isDecimal && <span className="text-sm font-normal">x</span>}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Información adicional */}
          {!isLoading && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Información del Sistema</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Las configuraciones por centro tienen prioridad sobre las configuraciones por defecto</p>
                <p>• El multiplicador determina cuántas jeringas se necesitan por dosis de vacuna</p>
                <p>• La prioridad determina el orden de selección cuando hay múltiples jeringas configuradas</p>
                <p>• Solo las configuraciones activas se utilizan en los cálculos automáticos</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EstadisticasConfiguracion;
