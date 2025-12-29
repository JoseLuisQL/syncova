import React, { memo, useMemo } from 'react';
import { Download, FileText, Loader2, BarChart3, TrendingUp, Target } from 'lucide-react';
import { Alerta } from '../../types';
import { COMPONENT_STYLES, TIPOS_ALERTA } from './constants';

interface ReportesAlertasProps {
  alertas: Alerta[];
  isLoading?: boolean;
}

const ReportesAlertas: React.FC<ReportesAlertasProps> = memo(({
  alertas,
  isLoading = false,
}) => {
  const [filtroFecha, setFiltroFecha] = React.useState('7');
  const [filtroTipo, setFiltroTipo] = React.useState('todos');

  const alertasFiltradas = useMemo(() => {
    const diasAtras = parseInt(filtroFecha);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAtras);

    return alertas.filter(alerta => {
      const fechaAlerta = new Date(alerta.fechaCreacion);
      const cumpleFecha = fechaAlerta >= fechaLimite;
      const cumpleTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
      return cumpleFecha && cumpleTipo;
    });
  }, [alertas, filtroFecha, filtroTipo]);

  const estadisticasHistorial = useMemo(() => {
    const totalPeriodo = alertasFiltradas.length;
    const promedioDiario = Math.round(totalPeriodo / parseInt(filtroFecha)) || 0;

    const tipoMasFrecuente = TIPOS_ALERTA.reduce((max, tipo) => {
      const cantidad = alertasFiltradas.filter(a => a.tipo === tipo.id).length;
      return cantidad > max.cantidad ? { tipo: tipo.label, cantidad } : max;
    }, { tipo: 'N/A', cantidad: 0 });

    return { totalPeriodo, promedioDiario, tipoMasFrecuente };
  }, [alertasFiltradas, filtroFecha]);

  const distribucionTipo = useMemo(() => {
    return TIPOS_ALERTA.map(tipo => {
      const cantidad = alertasFiltradas.filter(a => a.tipo === tipo.id).length;
      const porcentaje = alertasFiltradas.length > 0 ? (cantidad / alertasFiltradas.length * 100) : 0;
      return { ...tipo, cantidad, porcentaje };
    });
  }, [alertasFiltradas]);

  const handleExportExcel = () => {
    alert('Funcionalidad de exportacion a Excel disponible cuando se conecte al backend');
  };

  const handleExportPDF = () => {
    alert('Funcionalidad de exportacion a PDF disponible cuando se conecte al backend');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reportes y Analisis</h2>
          <p className="text-sm text-gray-600">Estadisticas y tendencias de alertas</p>
        </div>
      </div>

      <div className="bg-gray-50/80 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={COMPONENT_STYLES.input.label}>Periodo</label>
            <select
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
            >
              <option value="1">Ultimo dia</option>
              <option value="7">Ultimos 7 dias</option>
              <option value="30">Ultimos 30 dias</option>
              <option value="90">Ultimos 3 meses</option>
              <option value="365">Ultimo ano</option>
            </select>
          </div>
          <div>
            <label className={COMPONENT_STYLES.input.label}>Tipo de Alerta</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
            >
              <option value="todos">Todos los tipos</option>
              {TIPOS_ALERTA.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border border-teal-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700">Total en Periodo</p>
                  <p className="text-2xl font-bold text-teal-900">{estadisticasHistorial.totalPeriodo}</p>
                </div>
                <div className="p-2.5 bg-teal-600 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Promedio Diario</p>
                  <p className="text-2xl font-bold text-emerald-900">{estadisticasHistorial.promedioDiario}</p>
                </div>
                <div className="p-2.5 bg-emerald-600 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5 border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-700">Tipo Mas Frecuente</p>
                  <p className="text-lg font-bold text-cyan-900">{estadisticasHistorial.tipoMasFrecuente.tipo}</p>
                  <p className="text-xs text-cyan-600">{estadisticasHistorial.tipoMasFrecuente.cantidad} alertas</p>
                </div>
                <div className="p-2.5 bg-cyan-600 rounded-xl">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Distribucion por Tipo</h3>
            <div className="space-y-3">
              {distribucionTipo.map((tipo) => {
                const Icon = tipo.icon;
                return (
                  <div key={tipo.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${tipo.color}`} />
                      <span className="text-sm font-medium text-gray-900">{tipo.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{tipo.cantidad}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${tipo.bgColor.replace('-100', '-500')}`}
                          style={{ width: `${Math.max(tipo.porcentaje, 2)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {tipo.porcentaje.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Exportar Reporte</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Exportar PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

ReportesAlertas.displayName = 'ReportesAlertas';

export default ReportesAlertas;
