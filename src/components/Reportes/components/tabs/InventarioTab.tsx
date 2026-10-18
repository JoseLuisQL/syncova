import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Buildings,
  CaretDown,
  FileXls,
  MagnifyingGlass,
  SpinnerGap,
  X,
} from '@phosphor-icons/react';
import { Vacuna } from '../../../../types';
import {
  CentroAcopioOption,
  ConfiguracionExportacion,
  FiltrosKardexDetallado,
  FiltrosReporteBase,
  FiltrosStockCritico,
  FiltrosVencimientos,
  ItemLoteVencido,
  ItemStockActual,
  ItemStockCritico,
  ItemVencimiento,
} from '../../../../types/reportes';
import { useReportes } from '../../../../hooks/useReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import { COMPONENT_STYLES } from '../../constants';
import {
  ReportInlineStatus,
  ReportResultsTable,
  ReportSectionCard,
  ReportTableColumn,
} from '../ReportPrimitives';
import KardexDetalladoModal from '../../modals/KardexDetalladoModal';
import StockVacunasEESSModal, { StockVacunasEESSFiltros } from '../../modals/StockVacunasEESSModal';
import { formatCompactDate } from '../../utils';

interface InventarioTabProps {
  centrosAcopio: CentroAcopioOption[];
  vacunas: Vacuna[];
}

type PreviewReportId = 'stock_actual' | 'stock_critico' | 'vencimientos' | 'lotes_vencidos';
type PreviewRow = ItemStockActual | ItemStockCritico | ItemVencimiento | ItemLoteVencido;

const REPORT_VIEWS: Array<{ id: PreviewReportId; label: string; shortLabel: string }> = [
  { id: 'stock_actual', label: 'Stock actual', shortLabel: 'Stock' },
  { id: 'stock_critico', label: 'Stock crítico', shortLabel: 'Crítico' },
  { id: 'vencimientos', label: 'Por vencer', shortLabel: 'Por vencer' },
  { id: 'lotes_vencidos', label: 'Vencidos', shortLabel: 'Vencidos' },
];

const InventarioTab: React.FC<InventarioTabProps> = ({ centrosAcopio, vacunas }) => {
  const {
    reportes,
    estado,
    generarStockActual,
    generarStockCritico,
    generarVencimientos,
    generarLotesVencidos,
    generarKardexDetallado,
    exportarExcel,
    exportarKardexDetallado,
    exportarStockVacunasEESS,
  } = useReportes();
  const { toast } = useToastContext();

  const [activeReport, setActiveReport] = useState<PreviewReportId>('stock_actual');
  const [centroAcopioId, setCentroAcopioId] = useState<string>('');
  const [vacunaId, setVacunaId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showKardexModal, setShowKardexModal] = useState(false);
  const [showStockVacunasEESSModal, setShowStockVacunasEESSModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const baseFilters = useMemo<FiltrosReporteBase>(
    () => ({
      centroAcopioId: centroAcopioId || undefined,
      vacunaId: vacunaId || undefined,
      incluirInactivos: false,
    }),
    [centroAcopioId, vacunaId],
  );

  const loadActiveReport = useCallback(
    async (tipoReporte: PreviewReportId, filters: FiltrosReporteBase) => {
      switch (tipoReporte) {
        case 'stock_actual':
          return generarStockActual(filters);
        case 'stock_critico':
          return generarStockCritico({
            ...filters,
            porcentajeMinimo: 20,
            cantidadMinima: 50,
          } as FiltrosStockCritico);
        case 'vencimientos':
          return generarVencimientos({
            ...filters,
            diasAnticipacion: 30,
          } as FiltrosVencimientos);
        case 'lotes_vencidos':
          return generarLotesVencidos(filters);
      }
    },
    [generarLotesVencidos, generarStockActual, generarStockCritico, generarVencimientos],
  );

  useEffect(() => {
    void loadActiveReport(activeReport, baseFilters);
  }, [activeReport, baseFilters, loadActiveReport]);

  const handleExportarExcel = useCallback(async () => {
    try {
      setIsExporting(true);
      const config: ConfiguracionExportacion = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: 'Sistema SIVAC',
        observaciones: `Reporte generado el ${new Date().toLocaleDateString('es-PE')}`,
      };
      await exportarExcel(activeReport, config);
      toast.success('Excel descargado', 'El archivo se generó correctamente.', { duration: 2500 });
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    } finally {
      setIsExporting(false);
    }
  }, [activeReport, exportarExcel, toast]);

  const handleExportarKardex = useCallback(
    async (filtros: FiltrosKardexDetallado) => {
      try {
        const resultado = await generarKardexDetallado(filtros);

        if (resultado && Array.isArray(resultado) && resultado.length === 0) {
          toast.warning('Sin datos disponibles', 'No hay movimientos para el kardex detallado.', {
            duration: 3500,
          });
          return;
        }

        const config: ConfiguracionExportacion = {
          incluirDetalles: true,
          incluirGraficos: false,
          incluirEstadisticas: true,
          formatoFecha: 'dd/mm/yyyy',
          responsableReporte: 'Sistema SIVAC',
          observaciones: `Kardex detallado generado el ${new Date().toLocaleDateString('es-PE')}`,
        };

        await exportarKardexDetallado(filtros, config);
        setShowKardexModal(false);
        toast.success('Exportación lista', `Kardex exportado del ${filtros.fechaInicio} al ${filtros.fechaFin}.`, {
          duration: 3000,
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } }; message?: string };
        toast.error(
          'Error de exportación',
          err?.response?.data?.error || err?.message || 'No se pudo exportar el kardex.',
          { duration: 4000 },
        );
      }
    },
    [exportarKardexDetallado, generarKardexDetallado, toast],
  );

  const handleExportarStockVacunasEESS = useCallback(
    async (filtros: StockVacunasEESSFiltros) => {
      try {
        const config: ConfiguracionExportacion = {
          incluirDetalles: true,
          incluirGraficos: false,
          incluirEstadisticas: true,
          formatoFecha: 'dd/mm/yyyy',
          responsableReporte: 'Sistema SIVAC',
          observaciones: 'Stock de vacunas por establecimiento',
        };

        await exportarStockVacunasEESS(filtros, config);
        setShowStockVacunasEESSModal(false);
        toast.success('Exportación lista', 'El reporte de stock por EESS se descargó correctamente.', {
          duration: 3000,
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } }; message?: string };
        toast.error(
          'Error de exportación',
          err?.response?.data?.error || err?.message || 'No se pudo exportar el reporte.',
          { duration: 4000 },
        );
        throw error;
      }
    },
    [exportarStockVacunasEESS, toast],
  );

  const hasActiveFilters = Boolean(centroAcopioId || vacunaId || searchQuery.trim());

  const handleClearFilters = useCallback(() => {
    setCentroAcopioId('');
    setVacunaId('');
    setSearchQuery('');
  }, []);

  const activeConfig = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    switch (activeReport) {
      case 'stock_actual': {
        const rows = reportes.stockActual.filter(
          (r) =>
            !q ||
            r.vacunaNombre.toLowerCase().includes(q) ||
            r.vacunaTipo.toLowerCase().includes(q) ||
            r.presentacion.toLowerCase().includes(q),
        );
        const totalDosis = rows.reduce((sum, r) => sum + (r.stockTotal || 0), 0);
        return {
          title: 'Stock actual de biológicos',
          summaryText: `${totalDosis.toLocaleString('es-PE')} dosis disponibles`,
          rows: rows as PreviewRow[],
          emptyTitle: 'Sin registros de stock actual',
          emptyDescription: 'Ajusta el centro de acopio, vacuna o término de búsqueda.',
          columns: [
            {
              key: 'vacuna',
              label: 'Biológico / Presentación',
              render: (row: PreviewRow) => {
                const typedRow = row as ItemStockActual;
                return (
                  <div>
                    <p className="font-semibold text-ink">{typedRow.vacunaNombre}</p>
                    <p className="text-xs text-muted-2">
                      {typedRow.vacunaTipo} · {typedRow.presentacion}
                    </p>
                  </div>
                );
              },
            },
            {
              key: 'stockTotal',
              label: 'Stock disponible',
              align: 'right' as const,
              render: (row: PreviewRow) => (
                <span className="font-mono font-semibold text-ink tabular-nums">
                  {(row as ItemStockActual).stockTotal.toLocaleString('es-PE')}
                </span>
              ),
            },
            {
              key: 'lotes',
              label: 'Lotes activos',
              align: 'center' as const,
              render: (row: PreviewRow) => (
                <span className={COMPONENT_STYLES.badge.count}>
                  {(row as ItemStockActual).totalLotes}
                </span>
              ),
            },
            {
              key: 'porVencer',
              label: 'Por vencer (90d)',
              align: 'center' as const,
              render: (row: PreviewRow) => {
                const typedRow = row as ItemStockActual;
                return (
                  <span
                    className={`font-mono tabular-nums ${
                      typedRow.lotesPorVencer > 0 ? COMPONENT_STYLES.badge.warning : COMPONENT_STYLES.badge.neutral
                    }`}
                  >
                    {typedRow.lotesPorVencer}
                  </span>
                );
              },
            },
            {
              key: 'actualizacion',
              label: 'Actualización',
              align: 'right' as const,
              render: (row: PreviewRow) => (
                <span className="font-mono text-xs text-muted-2 tabular-nums">
                  {formatCompactDate((row as ItemStockActual).ultimaActualizacion)}
                </span>
              ),
            },
          ] as ReportTableColumn<PreviewRow>[],
        };
      }
      case 'stock_critico': {
        const rows = reportes.stockCritico.filter(
          (r) =>
            !q ||
            r.vacunaNombre.toLowerCase().includes(q) ||
            r.recomendacionAccion.toLowerCase().includes(q),
        );
        return {
          title: 'Biológicos con stock crítico',
          summaryText: 'Bajo umbral mínimo de seguridad',
          rows: rows as PreviewRow[],
          emptyTitle: 'Sin vacunas en nivel crítico',
          emptyDescription: 'Todos los biológicos cumplen con el umbral mínimo configurado.',
          columns: [
            {
              key: 'vacuna',
              label: 'Biológico',
              render: (row: PreviewRow) => {
                const typedRow = row as ItemStockCritico;
                return (
                  <div>
                    <p className="font-semibold text-ink">{typedRow.vacunaNombre}</p>
                    <p className="text-xs text-muted-2">{typedRow.vacunaTipo}</p>
                  </div>
                );
              },
            },
            {
              key: 'stockTotal',
              label: 'Saldo actual',
              align: 'right' as const,
              render: (row: PreviewRow) => (
                <span className="font-mono font-semibold text-ink tabular-nums">
                  {(row as ItemStockCritico).stockTotal.toLocaleString('es-PE')}
                </span>
              ),
            },
            {
              key: 'stockMinimo',
              label: 'Umbral mínimo',
              align: 'right' as const,
              render: (row: PreviewRow) => (
                <span className="font-mono text-muted-2 tabular-nums">
                  {(row as ItemStockCritico).stockMinimo.toLocaleString('es-PE')}
                </span>
              ),
            },
            {
              key: 'criticidad',
              label: 'Estado',
              align: 'center' as const,
              render: (row: PreviewRow) => {
                const typedRow = row as ItemStockCritico;
                return (
                  <span
                    className={
                      typedRow.nivelCriticidad === 'agotado' || typedRow.nivelCriticidad === 'critico'
                        ? COMPONENT_STYLES.badge.danger
                        : COMPONENT_STYLES.badge.warning
                    }
                  >
                    {typedRow.nivelCriticidad === 'critico'
                      ? 'Crítico'
                      : typedRow.nivelCriticidad === 'agotado'
                        ? 'Agotado'
                        : 'Bajo'}
                  </span>
                );
              },
            },
            {
              key: 'accion',
              label: 'Acción recomendada',
              render: (row: PreviewRow) => (
                <span className="text-xs text-muted-2">{(row as ItemStockCritico).recomendacionAccion}</span>
              ),
            },
          ] as ReportTableColumn<PreviewRow>[],
        };
      }
      case 'vencimientos': {
        const rows = reportes.vencimientos.filter(
          (r) =>
            !q ||
            r.numeroLote.toLowerCase().includes(q) ||
            r.vacunaNombre.toLowerCase().includes(q),
        );
        const totalPorVencer = rows.reduce((sum, r) => sum + (r.cantidadActual || 0), 0);
        return {
          title: 'Lotes próximos a vencer (Control FEFO)',
          summaryText: `${totalPorVencer.toLocaleString('es-PE')} dosis en seguimiento`,
          rows: rows as PreviewRow[],
          emptyTitle: 'Sin lotes próximos a vencer',
          emptyDescription: 'No se encontraron lotes dentro del horizonte de alerta.',
          columns: [
            {
              key: 'lote',
              label: 'N° Lote / Biológico',
              render: (row: PreviewRow) => {
                const typedRow = row as ItemVencimiento;
                return (
                  <div>
                    <p className="font-mono font-semibold text-ink">{typedRow.numeroLote}</p>
                    <p className="text-xs text-muted-2">{typedRow.vacunaNombre}</p>
                  </div>
                );
              },
            },
            {
              key: 'cantidad',
              label: 'Saldo actual',
              align: 'right' as const,
              render: (row: PreviewRow) => (
                <span className="font-mono font-semibold text-ink tabular-nums">
                  {(row as ItemVencimiento).cantidadActual.toLocaleString('es-PE')}
                </span>
              ),
            },
            {
              key: 'fecha',
              label: 'Vencimiento',
              render: (row: PreviewRow) => (
                <span className="font-mono text-xs text-ink tabular-nums">
                  {formatCompactDate((row as ItemVencimiento).fechaVencimiento)}
                </span>
              ),
            },
            {
              key: 'dias',
              label: 'Vigencia restante',
              align: 'center' as const,
              render: (row: PreviewRow) => (
                <span className="font-mono text-xs font-semibold text-ink tabular-nums">
                  {(row as ItemVencimiento).diasParaVencer} días
                </span>
              ),
            },
            {
              key: 'urgencia',
              label: 'Prioridad',
              align: 'center' as const,
              render: (row: PreviewRow) => {
                const typedRow = row as ItemVencimiento;
                return (
                  <span
                    className={
                      typedRow.nivelUrgencia === 'inmediato' || typedRow.nivelUrgencia === 'urgente'
                        ? COMPONENT_STYLES.badge.danger
                        : COMPONENT_STYLES.badge.warning
                    }
                  >
                    {typedRow.nivelUrgencia === 'inmediato'
                      ? 'Inmediata'
                      : typedRow.nivelUrgencia === 'urgente'
                        ? 'Urgente'
                        : 'Atención'}
                  </span>
                );
              },
            },
          ] as ReportTableColumn<PreviewRow>[],
        };
      }
      case 'lotes_vencidos': {
        const rows = reportes.lotesVencidos.filter(
          (r) =>
            !q ||
            r.numeroLote.toLowerCase().includes(q) ||
            r.vacunaNombre.toLowerCase().includes(q),
        );
        return {
          title: 'Lotes fuera de vigencia',
          summaryText: 'Control para baja sanitaria y auditoría',
          rows: rows as PreviewRow[],
          emptyTitle: 'Sin lotes vencidos registrados',
          emptyDescription: 'No existen lotes fuera de vigencia con saldo activo.',
          columns: [
            {
              key: 'lote',
              label: 'N° Lote / Biológico',
              render: (row: PreviewRow) => {
                const typedRow = row as ItemLoteVencido;
                return (
                  <div>
                    <p className="font-mono font-semibold text-ink">{typedRow.numeroLote}</p>
                    <p className="text-xs text-muted-2">{typedRow.vacunaNombre}</p>
                  </div>
                );
              },
            },
            {
              key: 'cantidad',
              label: 'Cantidad',
              align: 'right' as const,
              render: (row: PreviewRow) => (
                <span className="font-mono font-semibold text-ink tabular-nums">
                  {(row as ItemLoteVencido).cantidadActual.toLocaleString('es-PE')}
                </span>
              ),
            },
            {
              key: 'fecha',
              label: 'Vencimiento',
              render: (row: PreviewRow) => (
                <span className="font-mono text-xs text-muted-2 tabular-nums">
                  {formatCompactDate((row as ItemLoteVencido).fechaVencimiento)}
                </span>
              ),
            },
            {
              key: 'dias',
              label: 'Tiempo vencido',
              align: 'center' as const,
              render: (row: PreviewRow) => (
                <span className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                  {(row as ItemLoteVencido).diasVencido} días
                </span>
              ),
            },
            {
              key: 'criticidad',
              label: 'Estado',
              align: 'center' as const,
              render: () => <span className={COMPONENT_STYLES.badge.danger}>Baja pendiente</span>,
            },
          ] as ReportTableColumn<PreviewRow>[],
        };
      }
    }
  }, [
    activeReport,
    reportes.lotesVencidos,
    reportes.stockActual,
    reportes.stockCritico,
    reportes.vencimientos,
    searchQuery,
  ]);

  return (
    <ReportSectionCard>
      <div className="space-y-3.5">
        {/* Barra simétrica de 12 columnas: Selector de vista + Filtros + Exportación */}
        <section className={COMPONENT_STYLES.filter.container} aria-label="Controles de inventario">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
            {/* Selector de reporte (5 cols) */}
            <div className="sm:col-span-2 lg:col-span-5 grid grid-cols-4 gap-1 rounded-lg border border-line bg-surface-soft p-1 h-9 items-center">
              {REPORT_VIEWS.map((view) => {
                const isSelected = activeReport === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveReport(view.id)}
                    className={`inline-flex h-7 w-full items-center justify-center rounded-md px-2 text-xs font-medium transition-colors focus-visible:outline-none truncate ${
                      isSelected
                        ? 'bg-surface text-ink font-semibold shadow-2xs'
                        : 'text-muted-2 hover:text-ink'
                    }`}
                  >
                    <span className="hidden sm:inline truncate">{view.label}</span>
                    <span className="sm:hidden truncate">{view.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Centro de acopio (2 cols) */}
            <div className="relative lg:col-span-2">
              <select
                value={centroAcopioId}
                onChange={(event) => setCentroAcopioId(event.target.value)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                aria-label="Filtrar por centro de acopio"
              >
                <option value="">Centro: Todos</option>
                {centrosAcopio.map((centro) => (
                  <option key={centro.id} value={centro.id}>
                    {centro.nombre}
                  </option>
                ))}
              </select>
              <CaretDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                weight="bold"
              />
            </div>

            {/* Vacuna / Biológico (2 cols) */}
            <div className="relative lg:col-span-2">
              <select
                value={vacunaId}
                onChange={(event) => setVacunaId(event.target.value)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                aria-label="Filtrar por biológico"
              >
                <option value="">Vacuna: Todas</option>
                {vacunas.map((vacuna) => (
                  <option key={vacuna.id} value={vacuna.id}>
                    {vacuna.nombre}
                  </option>
                ))}
              </select>
              <CaretDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                weight="bold"
              />
            </div>

            {/* Búsqueda rápida + Limpiar + Exportar (3 cols) */}
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <MagnifyingGlass className={COMPONENT_STYLES.filter.searchIcon} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar vacuna o lote..."
                  className={COMPONENT_STYLES.filter.searchInput}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-soft text-muted-2 transition-colors hover:border-line-strong hover:bg-surface hover:text-ink"
                  title="Restablecer filtros"
                  aria-label="Restablecer filtros"
                >
                  <X className="h-4 w-4" weight="bold" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleExportarExcel}
                disabled={isExporting || activeConfig.rows.length === 0}
                className={COMPONENT_STYLES.button.primary}
                title="Exportar vista actual a Excel"
              >
                {isExporting ? (
                  <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" />
                ) : (
                  <FileXls className="h-4 w-4" weight="bold" />
                )}
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </section>

        {/* Barra minimalista de matrices especializadas (Kardex y Stock por EESS) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-line bg-surface-soft/50 px-3.5 py-2.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
            <span className="font-semibold text-ink">Matrices especializadas en Excel</span>
            <span className="hidden sm:inline text-muted" aria-hidden="true">·</span>
            <span className="text-muted-2">
              Exportaciones parametrizadas de trazabilidad completa y cobertura por establecimiento
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowKardexModal(true)}
              className={`${COMPONENT_STYLES.button.secondary} h-8 px-3 text-xs`}
            >
              <Archive className="h-3.5 w-3.5 text-brand" weight="bold" />
              <span>Kardex detallado</span>
            </button>

            <button
              type="button"
              onClick={() => setShowStockVacunasEESSModal(true)}
              className={`${COMPONENT_STYLES.button.secondary} h-8 px-3 text-xs`}
            >
              <Buildings className="h-3.5 w-3.5 text-brand" weight="bold" />
              <span>Stock por EESS</span>
            </button>
          </div>
        </div>

        {estado.error ? (
          <ReportInlineStatus
            tone="danger"
            title="No se pudo generar el reporte"
            description={estado.error}
          />
        ) : null}

        {/* Tabla principal de resultados (siempre visible y reactiva) */}
        <ReportResultsTable
          title={activeConfig.title}
          summaryText={activeConfig.summaryText}
          rows={activeConfig.rows}
          columns={activeConfig.columns}
          isLoading={estado.cargando && activeConfig.rows.length === 0}
          loadingMessage="Consultando registros de inventario..."
          emptyTitle={activeConfig.emptyTitle}
          emptyDescription={activeConfig.emptyDescription}
        />
      </div>

      {showKardexModal ? (
        <KardexDetalladoModal
          onClose={() => setShowKardexModal(false)}
          onExportar={handleExportarKardex}
          vacunas={vacunas}
          centrosAcopio={centrosAcopio}
        />
      ) : null}

      {showStockVacunasEESSModal ? (
        <StockVacunasEESSModal
          onClose={() => setShowStockVacunasEESSModal(false)}
          onExportar={handleExportarStockVacunasEESS}
          vacunas={vacunas}
          centrosAcopio={centrosAcopio}
        />
      ) : null}
    </ReportSectionCard>
  );
};

export default React.memo(InventarioTab);
