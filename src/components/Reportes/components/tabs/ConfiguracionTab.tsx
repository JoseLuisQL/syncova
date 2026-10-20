import React, { useMemo, useState } from 'react';
import {
  Bell,
  CaretDown,
  Clock,
  PencilSimple,
  Gear,
  EnvelopeSimple,
  ShieldCheck,
  Trash,
} from '@phosphor-icons/react';
import { useToastContext } from '../../../../contexts/ToastContext';
import { COMPONENT_STYLES, ReporteProgramado } from '../../constants';
import ActionConfirmationDialog from '../ActionConfirmationDialog';
import { ReportMetricsGrid, ReportResultsTable, ReportSectionCard, ReportTableColumn } from '../ReportPrimitives';
import { formatCompactDate, formatDateTime } from '../../utils';

interface ConfiguracionTabProps {
  reportesProgramados: ReporteProgramado[];
  onOpenCreate: () => void;
  onOpenEdit: (reporte: ReporteProgramado) => void;
  onDelete: (id: string) => void;
  onToggleEstado: (id: string) => void;
}

const ConfiguracionTab: React.FC<ConfiguracionTabProps> = ({
  reportesProgramados,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onToggleEstado,
}) => {
  const { toast } = useToastContext();
  const [activeSubTab, setActiveSubTab] = useState<'programados' | 'configuracion'>('programados');
  const [reporteAEliminar, setReporteAEliminar] = useState<ReporteProgramado | null>(null);
  const [configuracion, setConfiguracion] = useState({
    formatoFechaDefault: 'dd/mm/yyyy',
    idiomaDefault: 'es',
    tiempoRetencion: '12',
    compressionPDF: 'media',
    incluirFirmaDigital: true,
    marcaAgua: false,
    encriptacionReportes: false,
    notificacionesEmail: true,
    backupAutomatico: true,
  });

  const toggleBooleanSetting = (
    key:
      | 'incluirFirmaDigital'
      | 'marcaAgua'
      | 'encriptacionReportes'
      | 'notificacionesEmail'
      | 'backupAutomatico',
  ) => {
    setConfiguracion((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const proximoProgramado = useMemo(() => {
    const activos = reportesProgramados.filter((reporte) => reporte.estado === 'activo');
    return activos.sort((a, b) => a.proximaEjecucion.getTime() - b.proximaEjecucion.getTime())[0] || null;
  }, [reportesProgramados]);

  const formatosConfigurados = useMemo(
    () => new Set(reportesProgramados.map((reporte) => reporte.formato)).size,
    [reportesProgramados],
  );

  const destinatariosConfigurados = useMemo(
    () => reportesProgramados.reduce((acc, reporte) => acc + reporte.destinatarios.length, 0),
    [reportesProgramados],
  );

  const metrics = useMemo(
    () => [
      {
        id: 'total',
        label: 'Programados',
        value: reportesProgramados.length,
        icon: Clock,
        tone: 'primary' as const,
        description: 'Flujos disponibles en el módulo.',
      },
      {
        id: 'activos',
        label: 'Activos',
        value: reportesProgramados.filter((reporte) => reporte.estado === 'activo').length,
        icon: ShieldCheck,
        tone: 'success' as const,
        description: 'Programaciones listas para ejecutarse.',
      },
      {
        id: 'proximo',
        label: 'Próxima ejecución',
        value: proximoProgramado ? formatCompactDate(proximoProgramado.proximaEjecucion) : 'Sin agenda',
        icon: Bell,
        tone: 'warning' as const,
        description: proximoProgramado ? proximoProgramado.nombre : 'No hay reportes activos programados.',
      },
      {
        id: 'destinatarios',
        label: 'Destinatarios',
        value: destinatariosConfigurados,
        icon: EnvelopeSimple,
        tone: 'secondary' as const,
        description: `${formatosConfigurados} formato(s) configurado(s)`,
      },
    ],
    [destinatariosConfigurados, formatosConfigurados, proximoProgramado, reportesProgramados],
  );

  const columns: ReportTableColumn<ReporteProgramado>[] = [
    {
      key: 'reporte',
      label: 'Reporte',
      render: (row) => (
        <div>
          <p className="font-semibold text-ink">{row.nombre}</p>
          <p className="text-xs text-muted-2">
            {row.tipo} · {row.formato.toUpperCase()}
          </p>
        </div>
      ),
    },
    {
      key: 'frecuencia',
      label: 'Frecuencia',
      align: 'center',
      render: (row) => <span className={COMPONENT_STYLES.badge.info}>{row.frecuencia}</span>,
    },
    {
      key: 'proxima',
      label: 'Próxima ejecución',
      render: (row) => <span className="font-mono text-xs text-ink tabular-nums">{formatDateTime(row.proximaEjecucion)}</span>,
    },
    {
      key: 'destinatarios',
      label: 'Destinatarios',
      render: (row) => <span className="text-xs text-muted-2">{row.destinatarios.length} contacto(s)</span>,
      align: 'center',
    },
    {
      key: 'estado',
      label: 'Estado',
      align: 'center',
      render: (row) => (
        <button
          type="button"
          onClick={() => onToggleEstado(row.id)}
          className={row.estado === 'activo' ? COMPONENT_STYLES.badge.active : COMPONENT_STYLES.badge.warning}
        >
          {row.estado}
        </button>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onOpenEdit(row)}
            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconEdit}`}
            aria-label={`Editar ${row.nombre}`}
          >
            <PencilSimple className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setReporteAEliminar(row)}
            className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
            aria-label={`Eliminar ${row.nombre}`}
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleGuardarConfiguracion = () => {
    toast.success('Preferencias actualizadas', 'La configuración del módulo quedó guardada.', { duration: 3000 });
  };

  const handleConfirmDelete = () => {
    if (!reporteAEliminar) return;
    onDelete(reporteAEliminar.id);
    setReporteAEliminar(null);
  };

  return (
    <>
      <ReportSectionCard>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className={COMPONENT_STYLES.segmented.container}>
              <button
                type="button"
                onClick={() => setActiveSubTab('programados')}
                className={`${COMPONENT_STYLES.segmented.item} ${
                  activeSubTab === 'programados'
                    ? COMPONENT_STYLES.segmented.itemActive
                    : COMPONENT_STYLES.segmented.itemInactive
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Reportes programados</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('configuracion')}
                className={`${COMPONENT_STYLES.segmented.item} ${
                  activeSubTab === 'configuracion'
                    ? COMPONENT_STYLES.segmented.itemActive
                    : COMPONENT_STYLES.segmented.itemInactive
                }`}
              >
                <Gear className="h-4 w-4" />
                <span>Preferencias de salida</span>
              </button>
            </div>

            <button type="button" onClick={onOpenCreate} className={COMPONENT_STYLES.button.primary}>
              <Clock className="h-4 w-4" weight="bold" />
              <span>Nuevo programado</span>
            </button>
          </div>

          {activeSubTab === 'programados' ? (
            <div className="space-y-4">
              <ReportMetricsGrid items={metrics} />

              <ReportResultsTable
                title="Programados activos y en revisión"
                rows={reportesProgramados}
                columns={columns}
                emptyTitle="Aún no hay reportes programados"
                emptyDescription="Crea el primer flujo automatizado desde el botón superior para organizar exportaciones recurrentes."
              />
            </div>
          ) : (
            <div className="space-y-4">
              <section className="grid gap-4 xl:grid-cols-2">
                <article className={COMPONENT_STYLES.panel}>
                  <div className="border-b border-line-soft px-5 py-3.5">
                    <h3 className="text-sm font-semibold text-ink">Salida predeterminada</h3>
                    <p className="mt-0.5 text-xs text-muted-2">
                      Controla el formato visual y la retención de archivos exportados.
                    </p>
                  </div>
                  <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                    <div>
                      <label className={COMPONENT_STYLES.input.label}>Formato de fecha</label>
                      <div className="relative">
                        <select
                          value={configuracion.formatoFechaDefault}
                          onChange={(event) =>
                            setConfiguracion((prev) => ({ ...prev, formatoFechaDefault: event.target.value }))
                          }
                          className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                        >
                          <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                          <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                          <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                        </select>
                        <CaretDown
                          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                          weight="bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={COMPONENT_STYLES.input.label}>Idioma</label>
                      <div className="relative">
                        <select
                          value={configuracion.idiomaDefault}
                          onChange={(event) =>
                            setConfiguracion((prev) => ({ ...prev, idiomaDefault: event.target.value }))
                          }
                          className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                        >
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="qu">Quechua</option>
                        </select>
                        <CaretDown
                          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                          weight="bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={COMPONENT_STYLES.input.label}>Retención</label>
                      <div className="relative">
                        <select
                          value={configuracion.tiempoRetencion}
                          onChange={(event) =>
                            setConfiguracion((prev) => ({ ...prev, tiempoRetencion: event.target.value }))
                          }
                          className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                        >
                          <option value="6">6 meses</option>
                          <option value="12">12 meses</option>
                          <option value="24">24 meses</option>
                        </select>
                        <CaretDown
                          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                          weight="bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={COMPONENT_STYLES.input.label}>Compresión PDF</label>
                      <div className="relative">
                        <select
                          value={configuracion.compressionPDF}
                          onChange={(event) =>
                            setConfiguracion((prev) => ({ ...prev, compressionPDF: event.target.value }))
                          }
                          className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                        >
                          <option value="baja">Baja</option>
                          <option value="media">Media</option>
                          <option value="alta">Alta</option>
                        </select>
                        <CaretDown
                          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                          weight="bold"
                        />
                      </div>
                    </div>
                  </div>
                </article>

                <article className={COMPONENT_STYLES.panel}>
                  <div className="border-b border-line-soft px-5 py-3.5">
                    <h3 className="text-sm font-semibold text-ink">Seguridad y notificaciones</h3>
                    <p className="mt-0.5 text-xs text-muted-2">
                      Preferencias locales del módulo para salida y seguimiento.
                    </p>
                  </div>
                  <div className="space-y-2.5 px-5 py-4">
                    {(
                      [
                        ['incluirFirmaDigital', 'Firma digital', 'Incluir firma en exportaciones PDF'],
                        ['marcaAgua', 'Marca de agua', 'Agregar sello institucional en archivos sensibles'],
                        ['encriptacionReportes', 'Encriptación', 'Aplicar protección adicional en reportes críticos'],
                        ['notificacionesEmail', 'Notificaciones email', 'Avisar cuando una ejecución termine'],
                        ['backupAutomatico', 'Backup automático', 'Guardar respaldo local del archivo exportado'],
                      ] as const
                    ).map(([key, label, description]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-soft/50 px-3.5 py-2.5"
                      >
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-ink">{label}</p>
                          <p className="mt-0.5 text-xs text-muted-2">{description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleBooleanSetting(key)}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                            configuracion[key] ? 'bg-brand' : 'bg-line-strong'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              configuracion[key] ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <div className="flex justify-end">
                <button type="button" onClick={handleGuardarConfiguracion} className={COMPONENT_STYLES.button.primary}>
                  Guardar preferencias
                </button>
              </div>
            </div>
          )}
        </div>
      </ReportSectionCard>

      <ActionConfirmationDialog
        isOpen={Boolean(reporteAEliminar)}
        title="Eliminar reporte programado"
        description={
          reporteAEliminar
            ? `Se eliminará "${reporteAEliminar.nombre}" de la agenda del módulo. Esta acción no modifica archivos ya exportados.`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onClose={() => setReporteAEliminar(null)}
        confirmLabel="Eliminar"
      />
    </>
  );
};

export default React.memo(ConfiguracionTab);
