import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Calendar,
  Download,
  Eye,
  FileSpreadsheet,
  Package,
  ShieldAlert,
} from 'lucide-react';
import { Establecimiento, Vacuna } from '../../../../types';
import { useReportes } from '../../../../hooks/useReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import {
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
import { COMPONENT_STYLES } from '../../constants';
import { ReporteCard, ReportInlineStatus, ReportSectionCard, ReportTableColumn } from '..';
import KardexDetalladoModal from '../../modals/KardexDetalladoModal';
import StockVacunasEESSModal, { StockVacunasEESSFiltros } from '../../modals/StockVacunasEESSModal';
import VisualizarReporteModal from '../../modals/VisualizarReporteModal';
import { formatCompactDate, formatLastUpdated } from '../../utils';

interface InventarioTabProps {
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
}

type PreviewReportId = 'stock_actual' | 'stock_critico' | 'vencimientos' | 'lotes_vencidos';
type PreviewRow = ItemStockActual | ItemStockCritico | ItemVencimiento | ItemLoteVencido;

const InventarioTab: React.FC<InventarioTabProps> = ({ centrosAcopio, vacunas }) => {
  const {
    reportes,
    estadisticas,
    estado,
    generarStockActual,
    generarStockCritico,
    generarVencimientos,
    generarLotesVencidos,
    generarKardexDetallado,
    obtenerEstadisticas,
    exportarExcel,
    exportarKardexDetallado,
    exportarStockVacunasEESS,
  } = useReportes();
  const { toast } = useToastContext();

  const [filtrosReportes, setFiltrosReportes] = useState<{
    stockActual: FiltrosReporteBase;
    stockCritico: FiltrosStockCritico;
    vencimientos: FiltrosVencimientos;
    lotesVencidos: FiltrosReporteBase;
  }>({
    stockActual: {},
    stockCritico: { porcentajeMinimo: 20, cantidadMinima: 50 },
    vencimientos: { diasAnticipacion: 30 },
    lotesVencidos: {},
  });
  const [showKardexModal, setShowKardexModal] = useState(false);
  const [showStockVacunasEESSModal, setShowStockVacunasEESSModal] = useState(false);
  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [reporteVisualizando, setReporteVisualizando] = useState<PreviewReportId | null>(null);

  useEffect(() => {
    obtenerEstadisticas();
  }, [obtenerEstadisticas]);

  const handleGenerarReporte = useCallback(async (tipoReporte: PreviewReportId) => {
    try {
      setReporteActivo(tipoReporte);
      let resultado: unknown[] | null = null;

      switch (tipoReporte) {
        case 'stock_actual':
          resultado = await generarStockActual(filtrosReportes.stockActual);
          break;
        case 'stock_critico':
          resultado = await generarStockCritico(filtrosReportes.stockCritico);
          break;
        case 'vencimientos':
          resultado = await generarVencimientos(filtrosReportes.vencimientos);
          break;
        case 'lotes_vencidos':
          resultado = await generarLotesVencidos(filtrosReportes.lotesVencidos);
          break;
      }

      if (resultado && Array.isArray(resultado) && resultado.length > 0) {
        setReporteVisualizando(tipoReporte);
      } else {
        setReporteVisualizando(null);
        toast.warning('Sin datos disponibles', 'No hay registros para los filtros aplicados.', { duration: 3500 });
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setReporteActivo(null);
    }
  }, [
    filtrosReportes,
    generarLotesVencidos,
    generarStockActual,
    generarStockCritico,
    generarVencimientos,
    toast,
  ]);

  const handleExportarExcel = useCallback(async (tipoReporte: PreviewReportId) => {
    try {
      const config: ConfiguracionExportacion = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: 'Sistema SIVAC',
        observaciones: `Reporte generado el ${new Date().toLocaleDateString('es-PE')}`,
      };
      await exportarExcel(tipoReporte, config);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    }
  }, [exportarExcel]);

  const handleExportarKardex = useCallback(async (filtros: FiltrosKardexDetallado) => {
    try {
      const resultado = await generarKardexDetallado(filtros);

      if (resultado && Array.isArray(resultado) && resultado.length === 0) {
        toast.warning('Sin datos disponibles', 'No hay datos para el kardex detallado.', { duration: 4000 });
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
      toast.success('Exportación lista', `Kardex exportado del ${filtros.fechaInicio} al ${filtros.fechaFin}.`, { duration: 3000 });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error('Error de exportación', err?.response?.data?.error || err?.message || 'No se pudo exportar el kardex.', { duration: 5000 });
    }
  }, [exportarKardexDetallado, generarKardexDetallado, toast]);

  const handleExportarStockVacunasEESS = useCallback(async (filtros: StockVacunasEESSFiltros) => {
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
      toast.success('Exportación lista', 'El reporte de stock por EESS se descargó correctamente.', { duration: 3000 });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error('Error de exportación', err?.response?.data?.error || err?.message || 'No se pudo exportar el reporte.', { duration: 5000 });
      throw error;
    }
  }, [exportarStockVacunasEESS, toast]);

  const handleFiltroChange = useCallback((campo: string, valor: string | undefined) => {
    const normalized = campo === 'incluirInactivos' ? valor === 'true' : valor;

    setFiltrosReportes((prev) => ({
      ...prev,
      stockActual: { ...prev.stockActual, [campo]: normalized },
      stockCritico: { ...prev.stockCritico, [campo]: normalized },
      vencimientos: { ...prev.vencimientos, [campo]: normalized },
      lotesVencidos: { ...prev.lotesVencidos, [campo]: normalized },
    }));
  }, []);

  const previewConfig = useMemo(() => {
    switch (reporteVisualizando) {
      case 'stock_actual':
        return {
          title: 'Vista previa: stock actual',
          subtitle: 'Resumen por vacuna con stock total y lotes disponibles.',
          rows: reportes.stockActual,
          emptyTitle: 'Genera el stock actual para revisar resultados',
          emptyDescription: 'La tabla se llenará cuando ejecutes el análisis con los filtros comunes.',
          columns: [
            {
              key: 'vacuna',
              label: 'Vacuna',
              render: (row: PreviewRow) => {
                const typedRow = row as ItemStockActual;
                return (
                <div>
                  <p className="font-medium text-slate-900">{typedRow.vacunaNombre}</p>
                  <p className="text-xs text-slate-500">{typedRow.vacunaTipo} · {typedRow.presentacion}</p>
                </div>
                );
              },
            },
            {
              key: 'stockTotal',
              label: 'Stock total',
              align: 'right' as const,
              render: (row: PreviewRow) => <span className="font-semibold text-slate-900">{(row as ItemStockActual).stockTotal.toLocaleString()}</span>,
            },
            {
              key: 'lotes',
              label: 'Lotes',
              align: 'center' as const,
              render: (row: PreviewRow) => <span className={COMPONENT_STYLES.badge.count}>{(row as ItemStockActual).totalLotes}</span>,
            },
            {
              key: 'porVencer',
              label: 'Por vencer',
              align: 'center' as const,
              render: (row: PreviewRow) => {
                const typedRow = row as ItemStockActual;
                return <span className={typedRow.lotesPorVencer > 0 ? COMPONENT_STYLES.badge.warning : COMPONENT_STYLES.badge.neutral}>{typedRow.lotesPorVencer}</span>;
              },
            },
            {
              key: 'actualizacion',
              label: 'Actualización',
              render: (row: PreviewRow) => <span className="text-sm text-slate-600">{formatCompactDate((row as ItemStockActual).ultimaActualizacion)}</span>,
            },
          ] as ReportTableColumn<PreviewRow>[],
        };
      case 'stock_critico':
        return {
          title: 'Vista previa: stock crítico',
          subtitle: 'Priorización por criticidad y acción recomendada.',
          rows: reportes.stockCritico,
          emptyTitle: 'Genera el reporte de stock crítico',
          emptyDescription: 'Se mostrarán aquí las vacunas que requieren reposición o seguimiento.',
          columns: [
            {
              key: 'vacuna',
              label: 'Vacuna',
              render: (row: PreviewRow) => {
                const typedRow = row as ItemStockCritico;
                return (
                <div>
                  <p className="font-medium text-slate-900">{typedRow.vacunaNombre}</p>
                  <p className="text-xs text-slate-500">{typedRow.vacunaTipo}</p>
                </div>
                );
              },
            },
            {
              key: 'stockTotal',
              label: 'Actual',
              align: 'right' as const,
              render: (row: PreviewRow) => <span className="font-semibold text-slate-900">{(row as ItemStockCritico).stockTotal.toLocaleString()}</span>,
            },
            {
              key: 'stockMinimo',
              label: 'Mínimo',
              align: 'right' as const,
              render: (row: PreviewRow) => <span className="text-slate-700">{(row as ItemStockCritico).stockMinimo.toLocaleString()}</span>,
            },
            {
              key: 'criticidad',
              label: 'Nivel',
              align: 'center' as const,
              render: (row: PreviewRow) => {
                const typedRow = row as ItemStockCritico;
                return (
                <span className={typedRow.nivelCriticidad === 'agotado' || typedRow.nivelCriticidad === 'critico' ? COMPONENT_STYLES.badge.danger : COMPONENT_STYLES.badge.warning}>
                  {typedRow.nivelCriticidad}
                </span>
                );
              },
            },
            {
              key: 'accion',
              label: 'Acción recomendada',
              render: (row: PreviewRow) => <span className="text-sm text-slate-600">{(row as ItemStockCritico).recomendacionAccion}</span>,
            },
          ] as ReportTableColumn<PreviewRow>[],
        };
      case 'vencimientos':
        return {
          title: 'Vista previa: próximos vencimientos',
          subtitle: 'Lotes que requieren redistribución o uso prioritario.',
          rows: reportes.vencimientos,
          emptyTitle: 'Genera el reporte de vencimientos',
          emptyDescription: 'Se listarán aquí los lotes próximos a vencer según los filtros aplicados.',
          columns: [
            {
              key: 'lote',
              label: 'Lote',
              render: (row: PreviewRow) => {
                const typedRow = row as ItemVencimiento;
                return (
                <div>
                  <p className="font-medium text-slate-900">{typedRow.numeroLote}</p>
                  <p className="text-xs text-slate-500">{typedRow.vacunaNombre}</p>
                </div>
                );
              },
            },
            {
              key: 'cantidad',
              label: 'Cantidad',
              align: 'right' as const,
              render: (row: PreviewRow) => <span className="font-semibold text-slate-900">{(row as ItemVencimiento).cantidadActual.toLocaleString()}</span>,
            },
            {
              key: 'fecha',
              label: 'Vence',
              render: (row: PreviewRow) => <span className="text-sm text-slate-700">{formatCompactDate((row as ItemVencimiento).fechaVencimiento)}</span>,
            },
            {
              key: 'dias',
              label: 'Días',
              align: 'center' as const,
              render: (row: PreviewRow) => <span className="text-sm text-slate-700">{(row as ItemVencimiento).diasParaVencer}</span>,
            },
            {
              key: 'urgencia',
              label: 'Urgencia',
              align: 'center' as const,
              render: (row: PreviewRow) => {
                const typedRow = row as ItemVencimiento;
                return (
                <span className={typedRow.nivelUrgencia === 'inmediato' || typedRow.nivelUrgencia === 'urgente' ? COMPONENT_STYLES.badge.danger : COMPONENT_STYLES.badge.warning}>
                  {typedRow.nivelUrgencia}
                </span>
                );
              },
            },
          ] as ReportTableColumn<PreviewRow>[],
        };
      case 'lotes_vencidos':
        return {
          title: 'Vista previa: lotes vencidos',
          subtitle: 'Lotes fuera de vigencia para descarte o auditoría.',
          rows: reportes.lotesVencidos,
          emptyTitle: 'Genera el reporte de lotes vencidos',
          emptyDescription: 'El panel mostrará los lotes vencidos con criticidad y pérdida asociada.',
          columns: [
            {
              key: 'lote',
              label: 'Lote',
              render: (row: PreviewRow) => {
                const typedRow = row as ItemLoteVencido;
                return (
                <div>
                  <p className="font-medium text-slate-900">{typedRow.numeroLote}</p>
                  <p className="text-xs text-slate-500">{typedRow.vacunaNombre}</p>
                </div>
                );
              },
            },
            {
              key: 'cantidad',
              label: 'Cantidad',
              align: 'right' as const,
              render: (row: PreviewRow) => <span className="font-semibold text-slate-900">{(row as ItemLoteVencido).cantidadActual.toLocaleString()}</span>,
            },
            {
              key: 'fecha',
              label: 'Vencimiento',
              render: (row: PreviewRow) => <span className="text-sm text-slate-700">{formatCompactDate((row as ItemLoteVencido).fechaVencimiento)}</span>,
            },
            {
              key: 'dias',
              label: 'Días vencido',
              align: 'center' as const,
              render: (row: PreviewRow) => <span className="font-medium text-rose-700">{(row as ItemLoteVencido).diasVencido}</span>,
            },
            {
              key: 'criticidad',
              label: 'Criticidad',
              align: 'center' as const,
              render: (row: PreviewRow) => <span className={COMPONENT_STYLES.badge.danger}>{(row as ItemLoteVencido).nivelCriticidad}</span>,
            },
          ] as ReportTableColumn<PreviewRow>[],
        };
      default:
        return null;
    }
  }, [
    reporteVisualizando,
    reportes.lotesVencidos,
    reportes.stockActual,
    reportes.stockCritico,
    reportes.vencimientos,
  ]);

  const commonFacts = [
    filtrosReportes.stockActual.centroAcopioId ? 'Centro filtrado' : 'Todos los centros',
    filtrosReportes.stockActual.vacunaId ? 'Vacuna filtrada' : 'Todas las vacunas',
  ];

  return (
    <ReportSectionCard
      title="Inventario y stock"
      subtitle="Stock, criticidad y vencimientos en un flujo más directo."
      aside={<span className={COMPONENT_STYLES.badge.info}>{formatLastUpdated(estadisticas?.ultimaActualizacion)}</span>}
      showHeader={false}
    >
      <div className="space-y-6">
        <section className={COMPONENT_STYLES.filter.container}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">Filtros comunes</h3>
            </div>
            <span className={COMPONENT_STYLES.badge.neutral}>Contexto operativo</span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <label className={COMPONENT_STYLES.input.label}>Centro de acopio</label>
              <select
                value={filtrosReportes.stockActual.centroAcopioId || ''}
                onChange={(event) => handleFiltroChange('centroAcopioId', event.target.value || undefined)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                <option value="">Todos los centros</option>
                {centrosAcopio.map((centro) => (
                  <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={COMPONENT_STYLES.input.label}>Vacuna</label>
              <select
                value={filtrosReportes.stockActual.vacunaId || ''}
                onChange={(event) => handleFiltroChange('vacunaId', event.target.value || undefined)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                <option value="">Todas las vacunas</option>
                {vacunas.map((vacuna) => (
                  <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={COMPONENT_STYLES.input.label}>Estado de catálogo</label>
              <select
                value={filtrosReportes.stockActual.incluirInactivos ? 'true' : 'false'}
                onChange={(event) => handleFiltroChange('incluirInactivos', event.target.value)}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
              >
                <option value="false">Solo activos</option>
                <option value="true">Incluir inactivos</option>
              </select>
            </div>
          </div>
        </section>

        {estado.error ? (
          <ReportInlineStatus
            tone="danger"
            title="No se pudo generar el reporte"
            description={estado.error}
          />
        ) : null}

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">Análisis rápidos</h3>
            </div>
            <span className={COMPONENT_STYLES.badge.count}>
              {(['stock_actual', 'stock_critico', 'vencimientos', 'lotes_vencidos'] as PreviewReportId[]).filter((id) => {
                switch (id) {
                  case 'stock_actual':
                    return reportes.stockActual.length > 0;
                  case 'stock_critico':
                    return reportes.stockCritico.length > 0;
                  case 'vencimientos':
                    return reportes.vencimientos.length > 0;
                  case 'lotes_vencidos':
                    return reportes.lotesVencidos.length > 0;
                }
              }).length} listos
            </span>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ReporteCard
              title="Stock actual"
              description="Stock total, lotes vigentes y última actualización."
              icon={Package}
              tone="primary"
              statusLabel={reportes.stockActual.length > 0 ? `${reportes.stockActual.length} filas` : 'Pendiente'}
              facts={commonFacts}
              actions={[
                {
                  label: reporteActivo === 'stock_actual' ? 'Consultando' : 'Ver reporte',
                  icon: Eye,
                  onClick: () => handleGenerarReporte('stock_actual'),
                  variant: 'primary',
                  isLoading: estado.cargando && reporteActivo === 'stock_actual',
                },
                {
                  label: 'Excel',
                  icon: Download,
                  onClick: () => handleExportarExcel('stock_actual'),
                  disabled: reportes.stockActual.length === 0,
                },
              ]}
            />

            <ReporteCard
              title="Stock crítico"
              description="Vacunas con reposición urgente y prioridad operativa."
              icon={ShieldAlert}
              tone="danger"
              statusLabel={reportes.stockCritico.length > 0 ? `${reportes.stockCritico.length} alertas` : 'Pendiente'}
              facts={commonFacts}
              actions={[
                {
                  label: reporteActivo === 'stock_critico' ? 'Consultando' : 'Ver reporte',
                  icon: Eye,
                  onClick: () => handleGenerarReporte('stock_critico'),
                  variant: 'primary',
                  isLoading: estado.cargando && reporteActivo === 'stock_critico',
                },
                {
                  label: 'Excel',
                  icon: Download,
                  onClick: () => handleExportarExcel('stock_critico'),
                  disabled: reportes.stockCritico.length === 0,
                },
              ]}
            />

            <ReporteCard
              title="Por vencer"
              description="Lotes a redistribuir antes de afectar el abastecimiento."
              icon={Calendar}
              tone="warning"
              statusLabel={reportes.vencimientos.length > 0 ? `${reportes.vencimientos.length} lotes` : 'Pendiente'}
              facts={commonFacts}
              actions={[
                {
                  label: reporteActivo === 'vencimientos' ? 'Consultando' : 'Ver reporte',
                  icon: Eye,
                  onClick: () => handleGenerarReporte('vencimientos'),
                  variant: 'primary',
                  isLoading: estado.cargando && reporteActivo === 'vencimientos',
                },
                {
                  label: 'Excel',
                  icon: Download,
                  onClick: () => handleExportarExcel('vencimientos'),
                  disabled: reportes.vencimientos.length === 0,
                },
              ]}
            />

            <ReporteCard
              title="Vencidos"
              description="Lotes fuera de vigencia para descarte y control."
              icon={AlertTriangle}
              tone="danger"
              statusLabel={reportes.lotesVencidos.length > 0 ? `${reportes.lotesVencidos.length} lotes` : 'Pendiente'}
              facts={commonFacts}
              actions={[
                {
                  label: reporteActivo === 'lotes_vencidos' ? 'Consultando' : 'Ver reporte',
                  icon: Eye,
                  onClick: () => handleGenerarReporte('lotes_vencidos'),
                  variant: 'primary',
                  isLoading: estado.cargando && reporteActivo === 'lotes_vencidos',
                },
                {
                  label: 'Excel',
                  icon: Download,
                  onClick: () => handleExportarExcel('lotes_vencidos'),
                  disabled: reportes.lotesVencidos.length === 0,
                },
              ]}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">Exportaciones especializadas</h3>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ReporteCard
              title="Kardex"
              description="Filtro avanzado y exportación directa."
              icon={Archive}
              tone="success"
              statusLabel="Avanzado"
              facts={[
                'Vacuna o jeringa',
                'Trazabilidad',
              ]}
              actions={[
                {
                  label: 'Configurar',
                  icon: FileSpreadsheet,
                  onClick: () => setShowKardexModal(true),
                  variant: 'primary',
                },
              ]}
            />

            <ReporteCard
              title="Stock por EESS"
              description="Stock por establecimiento con selección de vacunas."
              icon={FileSpreadsheet}
              tone="secondary"
              statusLabel="Especializado"
              facts={[
                'Centro opcional',
                'Selección múltiple',
              ]}
              actions={[
                {
                  label: 'Configurar',
                  icon: FileSpreadsheet,
                  onClick: () => setShowStockVacunasEESSModal(true),
                  variant: 'primary',
                },
              ]}
            />
          </div>
        </section>

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

      {previewConfig ? (
        <VisualizarReporteModal
          isOpen={Boolean(reporteVisualizando)}
          title={previewConfig.title}
          subtitle={previewConfig.subtitle}
          rows={previewConfig.rows}
          columns={previewConfig.columns}
          isLoading={estado.cargando && Boolean(reporteActivo)}
          loadingMessage="Generando vista previa del reporte..."
          emptyTitle={previewConfig.emptyTitle}
          emptyDescription={previewConfig.emptyDescription}
          onClose={() => setReporteVisualizando(null)}
        />
      ) : null}
    </ReportSectionCard>
  );
};

export default React.memo(InventarioTab);
