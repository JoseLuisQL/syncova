import React, { useState, useCallback } from 'react';
import {
  TrendingUp,
  Truck,
  Download,
} from 'lucide-react';
import { Establecimiento } from '../../../../types';
import { useReportes } from '../../../../hooks/useReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import { COMPONENT_STYLES } from '../../constants';
import { ReporteCard } from '..';
import MovimientosPorEESSModal, { MovimientosPorEESSFiltros } from '../../MovimientosPorEESSModal';

interface MovimientosTabProps {
  centrosAcopio: Establecimiento[];
  filtrosFechas: {
    fechaInicio: string;
    fechaFin: string;
    centroAcopio: string;
  };
  onFiltrosChange: (filtros: { fechaInicio: string; fechaFin: string; centroAcopio: string }) => void;
}

const MovimientosTab: React.FC<MovimientosTabProps> = ({
  centrosAcopio,
  filtrosFechas,
  onFiltrosChange,
}) => {
  const {
    reportes,
    estado,
    generarMovimientosMensuales,
    exportarMovimientosMensuales,
    exportarMovimientosPorEESS,
    limpiarError
  } = useReportes();

  const { toast } = useToastContext();
  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [showMovimientosPorEESSModal, setShowMovimientosPorEESSModal] = useState(false);

  const buildFiltros = useCallback(() => ({
    centroAcopioId: filtrosFechas.centroAcopio !== 'todos' ? filtrosFechas.centroAcopio : undefined,
    fechaInicio: filtrosFechas.fechaInicio,
    fechaFin: filtrosFechas.fechaFin,
    incluirInactivos: false
  }), [filtrosFechas]);

  const handleGenerarReporte = useCallback(async (tipoReporte: string) => {
    try {
      setReporteActivo(tipoReporte);
      const filtros = buildFiltros();
      let resultado: unknown[] | null = null;

      switch (tipoReporte) {
        case 'movimientos_mensuales':
          resultado = await generarMovimientosMensuales(filtros);
          break;
      }

      if (resultado && Array.isArray(resultado) && resultado.length === 0) {
        toast.warning('Sin datos disponibles', 'No hay datos en el rango seleccionado', { duration: 4000 });
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setReporteActivo(null);
    }
  }, [buildFiltros, generarMovimientosMensuales, toast]);

  const handleExportarReporte = useCallback(async (tipoReporte: string) => {
    try {
      const filtros = buildFiltros();
      const config = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy' as const,
        responsableReporte: 'Sistema SIVAC',
        observaciones: 'Reporte generado automaticamente'
      };

      switch (tipoReporte) {
        case 'movimientos_mensuales':
          await exportarMovimientosMensuales(filtros, config);
          break;
      }
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    }
  }, [buildFiltros, exportarMovimientosMensuales]);

  const handleExportarMovimientosPorEESS = useCallback(async (filtros: MovimientosPorEESSFiltros) => {
    try {
      const config = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy' as const,
        responsableReporte: 'Sistema SIVAC',
        observaciones: `Reporte generado para el periodo del ${filtros.fechaInicio} al ${filtros.fechaFin}`
      };

      await exportarMovimientosPorEESS(filtros, config);
      toast.success('Reporte de Movimientos por EESS exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar Movimientos por EESS:', error);
      toast.error('Error al exportar el reporte. Por favor, intentelo nuevamente.');
      throw error;
    }
  }, [exportarMovimientosPorEESS, toast]);

  const reportesMovimientos = [
    { id: 'movimientos_mensuales', nombre: 'Movimientos Mensuales', descripcion: 'Resumen mensual por EESS', icon: TrendingUp, color: 'emerald' as const, datos: reportes.movimientosMensuales },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Reportes de Movimientos</h2>

      {/* Filtros */}
      <div className={COMPONENT_STYLES.filter.container}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={COMPONENT_STYLES.input.label}>Fecha Inicio</label>
            <input
              type="date"
              value={filtrosFechas.fechaInicio}
              onChange={(e) => onFiltrosChange({ ...filtrosFechas, fechaInicio: e.target.value })}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
            />
          </div>
          <div>
            <label className={COMPONENT_STYLES.input.label}>Fecha Fin</label>
            <input
              type="date"
              value={filtrosFechas.fechaFin}
              onChange={(e) => onFiltrosChange({ ...filtrosFechas, fechaFin: e.target.value })}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
            />
          </div>
          <div>
            <label className={COMPONENT_STYLES.input.label}>Centro de Acopio</label>
            <select
              value={filtrosFechas.centroAcopio}
              onChange={(e) => onFiltrosChange({ ...filtrosFechas, centroAcopio: e.target.value })}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos</option>
              {centrosAcopio.map((centro) => (
                <option key={centro.id} value={centro.id}>{centro.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {estado.error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-rose-800">{estado.error}</p>
            <button onClick={limpiarError} className="text-rose-600 hover:text-rose-800">&times;</button>
          </div>
        </div>
      )}

      {/* Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportesMovimientos.map((reporte) => (
          <ReporteCard
            key={reporte.id}
            id={reporte.id}
            nombre={reporte.nombre}
            descripcion={reporte.descripcion}
            icon={reporte.icon}
            color={reporte.color}
            registros={reporte.datos?.length || 0}
            isLoading={estado.cargando && reporteActivo === reporte.id}
            hasData={(reporte.datos?.length || 0) > 0}
            onGenerar={() => handleGenerarReporte(reporte.id)}
            onExportar={() => handleExportarReporte(reporte.id)}
          />
        ))}

        {/* Movimientos por EESS - Card especial */}
        <div className={COMPONENT_STYLES.reportCard.container}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`${COMPONENT_STYLES.reportCard.iconWrapper} bg-teal-100`}>
              <Truck className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className={COMPONENT_STYLES.reportCard.title}>Movimientos por EESS</h3>
              <p className={COMPONENT_STYLES.reportCard.description}>Agrupado por establecimiento</p>
            </div>
          </div>
          <button
            onClick={() => setShowMovimientosPorEESSModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Configurar y Exportar</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showMovimientosPorEESSModal && (
        <MovimientosPorEESSModal
          onClose={() => setShowMovimientosPorEESSModal(false)}
          onExportar={handleExportarMovimientosPorEESS}
          centrosAcopio={centrosAcopio}
        />
      )}
    </div>
  );
};

export default React.memo(MovimientosTab);
