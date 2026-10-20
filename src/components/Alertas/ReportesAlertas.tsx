import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  FileXls,
  CircleNotch,
  Bell,
  Clock,
  WarningOctagon,
  CheckCircle,
  Eye,
  CaretDown,
} from '@phosphor-icons/react';
import ExcelJS from 'exceljs';
import { Alerta } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { AlertMetricItem, AlertMetricsGrid, AlertSectionCard } from './components';
import {
  COMPONENT_STYLES,
  NIVELES_ALERTA,
  TIPOS_ALERTA,
  formatExactAlertDate,
} from './constants';

interface ReportesAlertasProps {
  alertas: Alerta[];
  isLoading?: boolean;
  onInspect?: (alerta: Alerta) => void;
}

const PERIODOS = [
  { id: '1', label: '24 horas' },
  { id: '7', label: '7 días' },
  { id: '30', label: '30 días' },
  { id: '90', label: '90 días' },
  { id: '365', label: '1 año' },
  { id: 'all', label: 'Todo' },
] as const;

const ReportesAlertas: React.FC<ReportesAlertasProps> = memo(({
  alertas,
  isLoading = false,
  onInspect,
}) => {
  const { toast } = useToastContext();
  const [filtroFecha, setFiltroFecha] = useState('30');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [isExporting, setIsExporting] = useState(false);

  const alertasFiltradas = useMemo(() => {
    const fechaLimite = new Date();
    if (filtroFecha !== 'all') {
      const diasAtras = parseInt(filtroFecha, 10);
      fechaLimite.setDate(fechaLimite.getDate() - diasAtras);
    }

    return alertas.filter((alerta) => {
      const fechaAlerta = new Date(alerta.fechaCreacion);
      const cumpleFecha = filtroFecha === 'all' || fechaAlerta >= fechaLimite;
      const cumpleTipo = filtroTipo === 'todos' || alerta.tipo === filtroTipo;
      const cumpleNivel = filtroNivel === 'todos' || alerta.nivel === filtroNivel;
      return cumpleFecha && cumpleTipo && cumpleNivel;
    });
  }, [alertas, filtroFecha, filtroNivel, filtroTipo]);

  const metricas = useMemo(() => {
    const total = alertasFiltradas.length;
    const pendientes = alertasFiltradas.filter((a) => !a.leida).length;
    const criticas = alertasFiltradas.filter((a) => a.nivel === 'error').length;
    const atendidas = total - pendientes;
    const tasaResolucion = total > 0 ? Math.round((atendidas / total) * 100) : 100;
    const diasDivisor = filtroFecha === 'all' ? 30 : Math.max(1, parseInt(filtroFecha, 10));
    const promedioDiario = (total / diasDivisor).toFixed(1);

    return { total, pendientes, criticas, atendidas, tasaResolucion, promedioDiario };
  }, [alertasFiltradas, filtroFecha]);

  const kpiItems = useMemo<AlertMetricItem[]>(
    () => [
      {
        id: 'total_periodo',
        label: 'Alertas en el período',
        value: metricas.total,
        icon: Bell,
        tone: 'primary',
        description: `Promedio de ${metricas.promedioDiario} alertas/día`,
      },
      {
        id: 'pendientes_periodo',
        label: 'Pendientes en período',
        value: metricas.pendientes,
        icon: Clock,
        tone: metricas.pendientes > 0 ? 'warning' : 'neutral',
        description: `${metricas.atendidas} atendida${metricas.atendidas === 1 ? '' : 's'}`,
      },
      {
        id: 'criticas_periodo',
        label: 'Incidentes críticos',
        value: metricas.criticas,
        icon: WarningOctagon,
        tone: metricas.criticas > 0 ? 'danger' : 'neutral',
        description: 'Severidad alta en el rango elegido',
      },
      {
        id: 'tasa_resolucion',
        label: 'Tasa de resolución',
        value: `${metricas.tasaResolucion}%`,
        icon: CheckCircle,
        tone: metricas.tasaResolucion >= 80 ? 'success' : 'secondary',
        description: 'Porcentaje de alertas ya atendidas',
      },
    ],
    [metricas],
  );

  const distribucionTipo = useMemo(
    () =>
      TIPOS_ALERTA.map((tipo) => {
        const cantidad = alertasFiltradas.filter((alerta) => alerta.tipo === tipo.id).length;
        const porcentaje = alertasFiltradas.length > 0 ? Math.round((cantidad / alertasFiltradas.length) * 100) : 0;
        return { ...tipo, cantidad, porcentaje };
      }),
    [alertasFiltradas],
  );

  const distribucionNivel = useMemo(
    () =>
      NIVELES_ALERTA.map((nivel) => {
        const cantidad = alertasFiltradas.filter((alerta) => alerta.nivel === nivel.id).length;
        const porcentaje = alertasFiltradas.length > 0 ? Math.round((cantidad / alertasFiltradas.length) * 100) : 0;
        return { ...nivel, cantidad, porcentaje };
      }),
    [alertasFiltradas],
  );

  const handleExportExcel = useCallback(async () => {
    if (alertasFiltradas.length === 0) {
      toast.warning('Sin datos para exportar', 'No hay alertas en el período seleccionado.', { duration: 2500 });
      return;
    }

    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC';
      workbook.created = new Date();

      const wsAlertas = workbook.addWorksheet('Reporte de Alertas', {
        properties: { tabColor: { argb: '7C3AED' } },
      });

      wsAlertas.columns = [
        { header: 'Fecha y Hora', key: 'fecha', width: 20 },
        { header: 'Categoría', key: 'tipo', width: 18 },
        { header: 'Severidad', key: 'nivel', width: 16 },
        { header: 'Título del Incidente', key: 'titulo', width: 42 },
        { header: 'Descripción Operativa', key: 'descripcion', width: 65 },
        { header: 'Estado', key: 'estado', width: 14 },
      ];

      wsAlertas.getRow(1).eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E1B4B' } };
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      alertasFiltradas.forEach((alerta, index) => {
        const tipoLabel = TIPOS_ALERTA.find((tipo) => tipo.id === alerta.tipo)?.label || alerta.tipo;
        const nivelLabel = NIVELES_ALERTA.find((nivel) => nivel.id === alerta.nivel)?.label || alerta.nivel;
        const row = wsAlertas.addRow({
          fecha: new Date(alerta.fechaCreacion).toLocaleString('es-PE'),
          tipo: tipoLabel,
          nivel: nivelLabel,
          titulo: alerta.titulo,
          descripcion: alerta.descripcion,
          estado: alerta.leida ? 'Atendida' : 'Pendiente',
        });

        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_alertas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Reporte exportado', 'El archivo Excel se descargó correctamente.', { duration: 2500 });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('No se pudo exportar', 'Hubo un problema al generar el archivo Excel.', { duration: 3500 });
    } finally {
      setIsExporting(false);
    }
  }, [alertasFiltradas, toast]);

  return (
    <AlertSectionCard>
      <div className="space-y-5">
        {/* Barra simétrica de controles de período, filtros y exportación */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-center rounded-xl border border-line bg-surface p-3 sm:p-3.5">
          <div className="sm:col-span-2 lg:col-span-6 grid grid-cols-6 gap-1 rounded-lg border border-line bg-surface-soft p-1 h-9 items-center">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFiltroFecha(p.id)}
                className={`inline-flex h-full items-center justify-center rounded-md px-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filtroFecha === p.id
                    ? 'bg-surface text-ink font-semibold shadow-2xs'
                    : 'text-muted-2 hover:text-ink'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="relative lg:col-span-2">
            <select
              value={filtroTipo}
              onChange={(event) => setFiltroTipo(event.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-xs sm:text-sm font-medium text-ink transition-colors hover:border-line-strong focus:border-brand focus:outline-none"
              aria-label="Filtrar reporte por categoría"
            >
              <option value="todos">Categoría: Todas</option>
              {TIPOS_ALERTA.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.label}
                </option>
              ))}
            </select>
            <CaretDown
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
              weight="bold"
            />
          </div>

          <div className="relative lg:col-span-2">
            <select
              value={filtroNivel}
              onChange={(event) => setFiltroNivel(event.target.value)}
              className="h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-xs sm:text-sm font-medium text-ink transition-colors hover:border-line-strong focus:border-brand focus:outline-none"
              aria-label="Filtrar reporte por severidad"
            >
              <option value="todos">Severidad: Todas</option>
              {NIVELES_ALERTA.map((nivel) => (
                <option key={nivel.id} value={nivel.id}>
                  {nivel.label}
                </option>
              ))}
            </select>
            <CaretDown
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
              weight="bold"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting || alertasFiltradas.length === 0}
              className={`${COMPONENT_STYLES.button.primary} w-full h-9`}
            >
              {isExporting ? (
                <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
              ) : (
                <FileXls className="h-4 w-4" weight="fill" />
              )}
              <span>Exportar ({alertasFiltradas.length})</span>
            </button>
          </div>
        </div>

        {/* KPIs del período */}
        <AlertMetricsGrid items={kpiItems} />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <CircleNotch className="h-6 w-6 animate-spin text-brand" weight="bold" />
          </div>
        ) : (
          <>
            {/* Desglose analítico en 2 columnas */}
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Incidencia por categoría</h3>
                    <p className="mt-0.5 text-xs text-muted-2">Volumen y proporción según tipo de alerta</p>
                  </div>
                  <span className="font-mono text-xs text-muted-2 tabular-nums">
                    {alertasFiltradas.length} reg.
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {distribucionTipo.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <div key={tipo.id}>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${tipo.color}`} weight="fill" />
                            <span className="font-medium text-ink">{tipo.pluralLabel}</span>
                          </div>
                          <div className="flex items-center gap-2.5 font-mono tabular-nums">
                            <span className="font-semibold text-ink">{tipo.cantidad}</span>
                            <span className="w-9 text-right text-muted-2">{tipo.porcentaje}%</span>
                          </div>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft border border-line-soft">
                          <div
                            className={`h-full rounded-full ${tipo.barColor}`}
                            style={{ width: `${Math.max(tipo.cantidad > 0 ? 4 : 0, tipo.porcentaje)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Incidencia por severidad</h3>
                    <p className="mt-0.5 text-xs text-muted-2">Clasificación por nivel de criticidad</p>
                  </div>
                  <span className="font-mono text-xs text-muted-2 tabular-nums">
                    {alertasFiltradas.length} reg.
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {distribucionNivel.map((nivel) => {
                    const Icon = nivel.icon;
                    return (
                      <div key={nivel.id}>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${nivel.color}`} weight="fill" />
                            <span className="font-medium text-ink">{nivel.pluralLabel}</span>
                          </div>
                          <div className="flex items-center gap-2.5 font-mono tabular-nums">
                            <span className="font-semibold text-ink">{nivel.cantidad}</span>
                            <span className="w-9 text-right text-muted-2">{nivel.porcentaje}%</span>
                          </div>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft border border-line-soft">
                          <div
                            className={`h-full rounded-full ${nivel.barColor}`}
                            style={{ width: `${Math.max(nivel.cantidad > 0 ? 4 : 0, nivel.porcentaje)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Vista previa de registros a exportar */}
            <section className="rounded-xl border border-line bg-surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Vista previa de registros del período</h3>
                  <p className="mt-0.5 text-xs text-muted-2">
                    Muestra las últimas alertas incluidas en el corte actual para exportación
                  </p>
                </div>
                <span className="font-mono text-xs text-muted-2 tabular-nums">
                  {Math.min(15, alertasFiltradas.length)} de {alertasFiltradas.length}
                </span>
              </div>

              {alertasFiltradas.length === 0 ? (
                <div className="px-4 py-10 text-center text-xs sm:text-sm text-muted-2">
                  No existen registros en el período seleccionado con los filtros actuales.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse">
                    <thead className={COMPONENT_STYLES.table.header}>
                      <tr>
                        <th className={COMPONENT_STYLES.table.headerCell}>Fecha</th>
                        <th className={COMPONENT_STYLES.table.headerCell}>Severidad</th>
                        <th className={COMPONENT_STYLES.table.headerCell}>Categoría</th>
                        <th className={COMPONENT_STYLES.table.headerCell}>Incidente</th>
                        <th className={COMPONENT_STYLES.table.headerCell}>Estado</th>
                        {onInspect ? <th className={`${COMPONENT_STYLES.table.headerCell} text-right`}>Detalle</th> : null}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft bg-surface">
                      {alertasFiltradas.slice(0, 15).map((alerta) => {
                        const tipoInfo = TIPOS_ALERTA.find((t) => t.id === alerta.tipo) || TIPOS_ALERTA[3];
                        const nivelInfo = NIVELES_ALERTA.find((n) => n.id === alerta.nivel) || NIVELES_ALERTA[2];
                        return (
                          <tr key={alerta.id} className={COMPONENT_STYLES.table.row}>
                            <td className="px-4 py-2.5 font-mono text-xs text-muted-2 tabular-nums whitespace-nowrap">
                              {formatExactAlertDate(alerta.fechaCreacion)}
                            </td>
                            <td className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap ${nivelInfo.color}`}>
                              {nivelInfo.label}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-ink whitespace-nowrap">
                              {tipoInfo.label}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-ink max-w-md truncate">
                              <span className="font-medium">{alerta.titulo}</span>
                              <span className="text-muted-2"> — {alerta.descripcion}</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                              <span className={alerta.leida ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-semibold'}>
                                {alerta.leida ? 'Atendida' : 'Pendiente'}
                              </span>
                            </td>
                            {onInspect ? (
                              <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onInspect(alerta)}
                                  className={COMPONENT_STYLES.button.icon}
                                  aria-label="Ver detalle"
                                >
                                  <Eye className="h-4 w-4" weight="bold" />
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AlertSectionCard>
  );
});

ReportesAlertas.displayName = 'ReportesAlertas';

export default ReportesAlertas;