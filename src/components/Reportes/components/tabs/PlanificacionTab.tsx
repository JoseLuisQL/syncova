import React, { useCallback, useEffect, useState } from 'react';
import { DownloadSimple, Eye, Target } from '@phosphor-icons/react';
import { Establecimiento, Vacuna } from '../../../../types';
import { usePlanificacionReportes } from '../../../../hooks/usePlanificacionReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import { ProgramacionAnualData } from '../../../../services/planificacionReportesService';
import { COMPONENT_STYLES } from '../../constants';
import ReporteCard from '../ReporteCard';
import { ReportInlineStatus, ReportSectionCard, ReportTableColumn } from '../ReportPrimitives';
import VisualizarReporteModal from '../../modals/VisualizarReporteModal';
import { formatCompactDate } from '../../utils';

interface PlanificacionTabProps {
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
}

const PlanificacionTab: React.FC<PlanificacionTabProps> = ({ centrosAcopio, vacunas }) => {
  const {
    reportes,
    estado,
    filtros: filtrosPlanificacion,
    generarProgramacionAnual,
    exportarProgramacionAnual,
    actualizarFiltros,
  } = usePlanificacionReportes();
  const { toast } = useToastContext();

  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [showResultados, setShowResultados] = useState(false);
  const [filtrosLocales, setFiltrosLocales] = useState({
    vacuna: 'todas',
    centroAcopio: 'todos',
  });

  useEffect(() => {
    actualizarFiltros({
      anio: filtrosPlanificacion.anio || new Date().getFullYear(),
      vacunaId: filtrosLocales.vacuna !== 'todas' ? filtrosLocales.vacuna : undefined,
      centroAcopioId: filtrosLocales.centroAcopio !== 'todos' ? filtrosLocales.centroAcopio : undefined,
    });
  }, [actualizarFiltros, filtrosLocales.centroAcopio, filtrosLocales.vacuna, filtrosPlanificacion.anio]);

  const handleGenerarReporte = useCallback(async () => {
    try {
      setReporteActivo('programacion_anual');
      const filtros = {
        anio: filtrosPlanificacion.anio || new Date().getFullYear(),
        vacunaId: filtrosLocales.vacuna !== 'todas' ? filtrosLocales.vacuna : undefined,
        centroAcopioId: filtrosLocales.centroAcopio !== 'todos' ? filtrosLocales.centroAcopio : undefined,
        incluirInactivos: false,
      };

      const resultado = await generarProgramacionAnual(filtros);

      if (resultado && resultado.length > 0) {
        setShowResultados(true);
        toast.success('Reporte generado', `Se prepararon ${resultado.length} registros.`, { duration: 3000 });
      } else {
        setShowResultados(false);
        toast.warning('Sin datos disponibles', 'No hay datos para los filtros seleccionados.', { duration: 3500 });
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.error('Error al generar reporte', 'Ocurrió un error. Inténtalo nuevamente.', { duration: 5000 });
    } finally {
      setReporteActivo(null);
    }
  }, [filtrosLocales.centroAcopio, filtrosLocales.vacuna, filtrosPlanificacion.anio, generarProgramacionAnual, toast]);

  const handleExportarReporte = useCallback(async () => {
    try {
      await exportarProgramacionAnual({
        anio: filtrosPlanificacion.anio || new Date().getFullYear(),
        vacunaId: filtrosLocales.vacuna !== 'todas' ? filtrosLocales.vacuna : undefined,
        centroAcopioId: filtrosLocales.centroAcopio !== 'todos' ? filtrosLocales.centroAcopio : undefined,
        responsableReporte: 'Usuario del Sistema',
        observaciones: `Reporte generado para el año ${filtrosPlanificacion.anio || new Date().getFullYear()}`,
      });

      toast.success('Exportación lista', 'El archivo Excel se descargó correctamente.', { duration: 3000 });
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast.error('Error al exportar', 'Ocurrió un error al preparar el archivo.', { duration: 5000 });
    }
  }, [exportarProgramacionAnual, filtrosLocales.centroAcopio, filtrosLocales.vacuna, filtrosPlanificacion.anio, toast]);

  const columns: ReportTableColumn<ProgramacionAnualData>[] = [
    {
      key: 'establecimiento',
      label: 'Establecimiento',
      render: (row) => (
        <div>
          <p className="font-medium text-zinc-900">{row.establecimiento.nombre}</p>
          <p className="text-xs text-zinc-500">{row.establecimiento.codigo} · {row.establecimiento.tipo}</p>
        </div>
      ),
    },
    {
      key: 'vacuna',
      label: 'Vacuna',
      render: (row) => (
        <div>
          <p className="font-medium text-zinc-900">{row.vacuna.nombre}</p>
          <p className="text-xs text-zinc-500">{row.vacuna.presentacion}</p>
        </div>
      ),
    },
    {
      key: 'meta',
      label: 'Meta anual',
      align: 'right',
      render: (row) => <span className="font-semibold text-zinc-900">{row.metaAnual.toLocaleString()}</span>,
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (row) => <span className={row.estado === 'activo' ? COMPONENT_STYLES.badge.active : COMPONENT_STYLES.badge.warning}>{row.estado}</span>,
    },
    {
      key: 'actualizacion',
      label: 'Actualización',
      render: (row) => <span className="text-sm text-zinc-600">{formatCompactDate(row.fechaActualizacion)}</span>,
    },
  ];

  return (
    <ReportSectionCard
      title="Planificación"
      subtitle="Programación anual con filtros, vista previa y Excel."
      aside={<span className={COMPONENT_STYLES.badge.info}>Año {filtrosPlanificacion.anio || new Date().getFullYear()}</span>}
      showHeader={false}
    >
      <div className="space-y-6">
        <section className={COMPONENT_STYLES.filter.container}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-zinc-700">Contexto de planificación</h3>
            </div>
            <span className={COMPONENT_STYLES.badge.neutral}>Filtro operativo</span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <label className={COMPONENT_STYLES.input.label}>Año</label>
              <select
                value={filtrosPlanificacion.anio || new Date().getFullYear()}
                onChange={(event) => actualizarFiltros({ anio: parseInt(event.target.value, 10) })}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                {[2024, 2025, 2026, 2027].map((anio) => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={COMPONENT_STYLES.input.label}>Vacuna</label>
              <select
                value={filtrosLocales.vacuna}
                onChange={(event) => setFiltrosLocales((prev) => ({ ...prev, vacuna: event.target.value }))}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                <option value="todas">Todas</option>
                {vacunas.map((vacuna) => (
                  <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={COMPONENT_STYLES.input.label}>Centro de acopio</label>
              <select
                value={filtrosLocales.centroAcopio}
                onChange={(event) => setFiltrosLocales((prev) => ({ ...prev, centroAcopio: event.target.value }))}
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
            title="No se pudo generar la programación"
            description={estado.error}
          />
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <ReporteCard
            title="Programación anual"
            description="Metas por establecimiento y vacuna con vista previa y Excel."
            icon={Target}
            tone="primary"
            statusLabel={reportes.programacionAnual.length > 0 ? `${reportes.programacionAnual.length} filas` : 'Pendiente'}
            facts={['Mismo contexto', 'Vista inline']}
            actions={[
              {
                label: reporteActivo === 'programacion_anual' ? 'Consultando' : 'Ver reporte',
                icon: Eye,
                onClick: handleGenerarReporte,
                variant: 'primary',
                isLoading: estado.cargando && reporteActivo === 'programacion_anual',
              },
              {
                label: 'Excel',
                icon: DownloadSimple,
                onClick: handleExportarReporte,
                disabled: reportes.programacionAnual.length === 0,
              },
            ]}
          />

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-zinc-800">Flujo</h3>
            <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-900">
              <p>1. Ajusta filtros.</p>
              <p>2. Genera.</p>
              <p>3. Revisa y exporta.</p>
            </div>
          </div>
        </div>

      </div>

      <VisualizarReporteModal
        isOpen={showResultados}
        title="Vista previa: programación anual"
        subtitle="Listado generado con el contexto de planificación actual."
        rows={reportes.programacionAnual}
        columns={columns}
        isLoading={estado.cargando && Boolean(reporteActivo)}
        loadingMessage="Generando programación anual..."
        emptyTitle="Genera la programación anual para revisar resultados"
        emptyDescription="La vista previa mostrará establecimiento, vacuna, meta anual y fecha de actualización."
        onClose={() => setShowResultados(false)}
      />
    </ReportSectionCard>
  );
};

export default React.memo(PlanificacionTab);
