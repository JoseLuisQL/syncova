import React, { useCallback, useState } from 'react';
import { ArrowsLeftRight, DownloadSimple, Eye, FileXls } from '@phosphor-icons/react';
import { CentroAcopioOption } from '../../../../types/reportes';
import { useReportes } from '../../../../hooks/useReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import { ItemMovimientoMensual } from '../../../../types/reportes';
import { COMPONENT_STYLES } from '../../constants';
import ReporteCard from '../ReporteCard';
import { ReportInlineStatus, ReportSectionCard, ReportTableColumn } from '../ReportPrimitives';
import MovimientosPorEESSModal, { MovimientosPorEESSFiltros } from '../../MovimientosPorEESSModal';
import VisualizarReporteModal from '../../modals/VisualizarReporteModal';
import { formatCompactDate } from '../../utils';

interface MovimientosTabProps {
  centrosAcopio: CentroAcopioOption[];
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
  } = useReportes();
  const { toast } = useToastContext();

  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [showMovimientosPorEESSModal, setShowMovimientosPorEESSModal] = useState(false);
  const [showResultados, setShowResultados] = useState(false);

  const buildFiltros = useCallback(() => ({
    centroAcopioId: filtrosFechas.centroAcopio !== 'todos' ? filtrosFechas.centroAcopio : undefined,
    fechaInicio: filtrosFechas.fechaInicio,
    fechaFin: filtrosFechas.fechaFin,
    incluirInactivos: false,
  }), [filtrosFechas]);

  const handleGenerarReporte = useCallback(async () => {
    try {
      setReporteActivo('movimientos_mensuales');
      const resultado = await generarMovimientosMensuales(buildFiltros());

      if (resultado && Array.isArray(resultado) && resultado.length > 0) {
        setShowResultados(true);
      } else {
        setShowResultados(false);
        toast.warning('Sin datos disponibles', 'No hay movimientos para el rango seleccionado.', { duration: 3500 });
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setReporteActivo(null);
    }
  }, [buildFiltros, generarMovimientosMensuales, toast]);

  const handleExportarReporte = useCallback(async () => {
    try {
      const config = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy' as const,
        responsableReporte: 'Sistema SIVAC',
        observaciones: 'Reporte de movimientos generado desde el módulo de reportes',
      };

      await exportarMovimientosMensuales(buildFiltros(), config);
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
        observaciones: `Periodo del ${filtros.fechaInicio} al ${filtros.fechaFin}`,
      };

      await exportarMovimientosPorEESS(filtros, config);
      toast.success('Exportación lista', 'El reporte por EESS se descargó correctamente.', { duration: 3000 });
    } catch (error) {
      console.error('Error al exportar Movimientos por EESS:', error);
      toast.error('Error al exportar', 'No se pudo generar el archivo solicitado.', { duration: 4000 });
      throw error;
    }
  }, [exportarMovimientosPorEESS, toast]);

  const columns: ReportTableColumn<ItemMovimientoMensual>[] = [
    {
      key: 'establecimiento',
      label: 'Establecimiento',
      render: (row) => (
        <div>
          <p className="font-medium text-zinc-900">{row.establecimientoNombre}</p>
          <p className="text-xs text-zinc-500">{row.vacunaNombre}</p>
        </div>
      ),
    },
    {
      key: 'periodo',
      label: 'Periodo',
      render: (row) => <span className="text-sm text-zinc-600">{`${row.mes}/${row.anio}`}</span>,
      align: 'center',
    },
    {
      key: 'ingresos',
      label: 'Ingresos',
      render: (row) => <span className="text-sm text-zinc-700">{(row.transIngreso || 0).toLocaleString()}</span>,
      align: 'right',
    },
    {
      key: 'entregas',
      label: 'Entregas',
      render: (row) => <span className="text-sm text-zinc-700">{(row.entrega || 0).toLocaleString()}</span>,
      align: 'right',
    },
    {
      key: 'salidas',
      label: 'Salidas',
      render: (row) => <span className="text-sm text-zinc-700">{(row.salida || 0).toLocaleString()}</span>,
      align: 'right',
    },
    {
      key: 'saldoFinal',
      label: 'Saldo final',
      render: (row) => <span className="font-semibold text-zinc-900">{row.saldoFinal.toLocaleString()}</span>,
      align: 'right',
    },
  ];

  return (
    <ReportSectionCard
      title="Movimientos y distribución"
      subtitle="Resumen mensual y exportación por EESS en un flujo directo."
      aside={<span className={COMPONENT_STYLES.badge.info}>{`${formatCompactDate(filtrosFechas.fechaInicio)} a ${formatCompactDate(filtrosFechas.fechaFin)}`}</span>}
      showHeader={false}
    >
      <div className="space-y-6">
        <section className={COMPONENT_STYLES.filter.container}>
          <div className="hidden">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-zinc-700">Rango operativo</h3>
            </div>
            <span className={COMPONENT_STYLES.badge.neutral}>Filtros sincronizados</span>
          </div>

          <div className="grid gap-2 lg:grid-cols-3">
            <div>
              <label className={COMPONENT_STYLES.input.label}>Fecha inicio</label>
              <input
                type="date"
                value={filtrosFechas.fechaInicio}
                onChange={(event) => onFiltrosChange({ ...filtrosFechas, fechaInicio: event.target.value })}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
              />
            </div>
            <div>
              <label className={COMPONENT_STYLES.input.label}>Fecha fin</label>
              <input
                type="date"
                value={filtrosFechas.fechaFin}
                onChange={(event) => onFiltrosChange({ ...filtrosFechas, fechaFin: event.target.value })}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
              />
            </div>
            <div>
              <label className={COMPONENT_STYLES.input.label}>Centro de acopio</label>
              <select
                value={filtrosFechas.centroAcopio}
                onChange={(event) => onFiltrosChange({ ...filtrosFechas, centroAcopio: event.target.value })}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                <option value="todos">Todos</option>
                {centrosAcopio.map((centro) => (
                  <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {estado.error ? (
          <ReportInlineStatus
            tone="danger"
            title="No se pudo procesar el reporte de movimientos"
            description={estado.error}
          />
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <ReporteCard
            title="Movimientos mensuales"
            description="Ingresos, entregas, salidas y saldo final por EESS."
            icon={ArrowsLeftRight}
            tone="success"
            statusLabel={reportes.movimientosMensuales.length > 0 ? `${reportes.movimientosMensuales.length} filas` : 'Pendiente'}
            facts={['Rango superior', 'Vista inline']}
            actions={[
              {
                label: reporteActivo === 'movimientos_mensuales' ? 'Consultando' : 'Ver reporte',
                icon: Eye,
                onClick: handleGenerarReporte,
                variant: 'primary',
                isLoading: estado.cargando && reporteActivo === 'movimientos_mensuales',
              },
              {
                label: 'Excel',
                icon: DownloadSimple,
                  onClick: handleExportarReporte,
                  disabled: reportes.movimientosMensuales.length === 0,
              },
            ]}
          />

            <ReporteCard
              title="Movimientos por EESS"
            description="Excel por establecimientos con filtros de rango y centro."
            icon={FileXls}
            tone="secondary"
            statusLabel="Especializado"
            facts={['Exportación avanzada', 'Salida Excel']}
            actions={[
                {
                label: 'Configurar',
                  icon: FileXls,
                  onClick: () => setShowMovimientosPorEESSModal(true),
                  variant: 'primary',
              },
            ]}
          />
        </div>

      </div>

      {showMovimientosPorEESSModal ? (
        <MovimientosPorEESSModal
          onClose={() => setShowMovimientosPorEESSModal(false)}
          onExportar={handleExportarMovimientosPorEESS}
          centrosAcopio={centrosAcopio}
        />
      ) : null}

      <VisualizarReporteModal
        isOpen={showResultados}
        title="Vista previa: movimientos mensuales"
        subtitle="Resumen generado con el rango y centro seleccionados."
        rows={reportes.movimientosMensuales}
        columns={columns}
        isLoading={estado.cargando && Boolean(reporteActivo)}
        loadingMessage="Generando resumen de movimientos..."
        emptyTitle="Genera el reporte mensual para revisar resultados"
        emptyDescription="Cuando ejecutes el análisis, aquí verás ingresos, entregas, salidas y saldos finales."
        onClose={() => setShowResultados(false)}
      />
    </ReportSectionCard>
  );
};

export default React.memo(MovimientosTab);
