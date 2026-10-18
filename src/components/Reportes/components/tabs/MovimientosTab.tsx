import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Buildings,
  CaretDown,
  FileXls,
  MagnifyingGlass,
  SpinnerGap,
  X,
} from '@phosphor-icons/react';
import { CentroAcopioOption, ItemMovimientoMensual } from '../../../../types/reportes';
import { useReportes } from '../../../../hooks/useReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import { COMPONENT_STYLES } from '../../constants';
import {
  ReportInlineStatus,
  ReportResultsTable,
  ReportSectionCard,
  ReportTableColumn,
} from '../ReportPrimitives';
import MovimientosPorEESSModal, { MovimientosPorEESSFiltros } from '../../MovimientosPorEESSModal';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isExportingMensual, setIsExportingMensual] = useState(false);
  const [showMovimientosPorEESSModal, setShowMovimientosPorEESSModal] = useState(false);

  const buildFiltros = useCallback(
    () => ({
      centroAcopioId: filtrosFechas.centroAcopio !== 'todos' ? filtrosFechas.centroAcopio : undefined,
      fechaInicio: filtrosFechas.fechaInicio,
      fechaFin: filtrosFechas.fechaFin,
      incluirInactivos: false,
    }),
    [filtrosFechas],
  );

  useEffect(() => {
    void generarMovimientosMensuales(buildFiltros());
  }, [buildFiltros, generarMovimientosMensuales]);

  const handleExportarReporte = useCallback(async () => {
    try {
      setIsExportingMensual(true);
      const config = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy' as const,
        responsableReporte: 'Sistema SIVAC',
        observaciones: 'Reporte de movimientos generado desde el módulo de reportes',
      };

      await exportarMovimientosMensuales(buildFiltros(), config);
      toast.success('Excel descargado', 'El reporte mensual se exportó correctamente.', { duration: 2500 });
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    } finally {
      setIsExportingMensual(false);
    }
  }, [buildFiltros, exportarMovimientosMensuales, toast]);

  const handleExportarMovimientosPorEESS = useCallback(
    async (filtros: MovimientosPorEESSFiltros) => {
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
    },
    [exportarMovimientosPorEESS, toast],
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportes.movimientosMensuales;
    return reportes.movimientosMensuales.filter(
      (row) =>
        row.establecimientoNombre.toLowerCase().includes(q) ||
        row.vacunaNombre.toLowerCase().includes(q) ||
        `${row.mes}/${row.anio}`.includes(q),
    );
  }, [reportes.movimientosMensuales, searchQuery]);

  const totals = useMemo(() => {
    const entregas = filteredRows.reduce((sum, r) => sum + (r.entrega || 0), 0);
    const salidas = filteredRows.reduce((sum, r) => sum + (r.salida || 0), 0);
    return { entregas, salidas };
  }, [filteredRows]);

  const columns: ReportTableColumn<ItemMovimientoMensual>[] = useMemo(
    () => [
      {
        key: 'establecimiento',
        label: 'Establecimiento / Biológico',
        render: (row) => (
          <div>
            <p className="font-semibold text-ink">{row.establecimientoNombre}</p>
            <p className="text-xs text-muted-2">{row.vacunaNombre}</p>
          </div>
        ),
      },
      {
        key: 'periodo',
        label: 'Período',
        align: 'center',
        render: (row) => (
          <span className="font-mono text-xs text-muted-2 tabular-nums">
            {`${String(row.mes).padStart(2, '0')}/${row.anio}`}
          </span>
        ),
      },
      {
        key: 'saldoAnterior',
        label: 'Saldo ant.',
        align: 'right',
        render: (row) => (
          <span className="font-mono text-xs text-muted-2 tabular-nums">
            {(row.saldoAnterior || 0).toLocaleString('es-PE')}
          </span>
        ),
      },
      {
        key: 'ingresos',
        label: 'Ingresos',
        align: 'right',
        render: (row) => (
          <span className="font-mono text-xs text-ink tabular-nums">
            {(row.transIngreso || 0).toLocaleString('es-PE')}
          </span>
        ),
      },
      {
        key: 'entregas',
        label: 'Entregas',
        align: 'right',
        render: (row) => (
          <span className="font-mono text-xs text-ink tabular-nums">
            {(row.entrega || 0).toLocaleString('es-PE')}
          </span>
        ),
      },
      {
        key: 'salidas',
        label: 'Salidas',
        align: 'right',
        render: (row) => (
          <span className="font-mono text-xs text-ink tabular-nums">
            {(row.salida || 0).toLocaleString('es-PE')}
          </span>
        ),
      },
      {
        key: 'saldoFinal',
        label: 'Saldo final',
        align: 'right',
        render: (row) => (
          <span className="font-mono text-xs font-semibold text-ink tabular-nums">
            {row.saldoFinal.toLocaleString('es-PE')}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <ReportSectionCard>
      <div className="space-y-3.5">
        {/* Barra simétrica de 12 columnas: Fechas + Centro + Buscador + Acciones */}
        <section className={COMPONENT_STYLES.filter.container} aria-label="Filtros de movimientos">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-2">
              <input
                type="date"
                value={filtrosFechas.fechaInicio}
                onChange={(event) => onFiltrosChange({ ...filtrosFechas, fechaInicio: event.target.value })}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} font-mono tabular-nums`}
                aria-label="Fecha de inicio"
                title="Fecha de inicio"
              />
            </div>

            <div className="lg:col-span-2">
              <input
                type="date"
                value={filtrosFechas.fechaFin}
                onChange={(event) => onFiltrosChange({ ...filtrosFechas, fechaFin: event.target.value })}
                className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} font-mono tabular-nums`}
                aria-label="Fecha de fin"
                title="Fecha de fin"
              />
            </div>

            <div className="relative lg:col-span-3">
              <select
                value={filtrosFechas.centroAcopio}
                onChange={(event) => onFiltrosChange({ ...filtrosFechas, centroAcopio: event.target.value })}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                aria-label="Centro de acopio"
              >
                <option value="todos">Centro: Todos</option>
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

            <div className="relative lg:col-span-2">
              <MagnifyingGlass className={COMPONENT_STYLES.filter.searchIcon} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar EESS o vacuna..."
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

            <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMovimientosPorEESSModal(true)}
                className={`${COMPONENT_STYLES.button.secondary} flex-1 lg:flex-initial`}
                title="Configurar matriz de movimientos por establecimiento"
              >
                <Buildings className="h-4 w-4 text-brand" weight="bold" />
                <span>Matriz EESS</span>
              </button>

              <button
                type="button"
                onClick={handleExportarReporte}
                disabled={isExportingMensual || filteredRows.length === 0}
                className={`${COMPONENT_STYLES.button.primary} flex-1 lg:flex-initial`}
              >
                {isExportingMensual ? (
                  <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" />
                ) : (
                  <FileXls className="h-4 w-4" weight="bold" />
                )}
                <span>Exportar</span>
              </button>
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

        <ReportResultsTable
          title="Consolidado de movimientos mensuales"
          summaryText={`${totals.entregas.toLocaleString('es-PE')} entregas · ${totals.salidas.toLocaleString('es-PE')} salidas`}
          rows={filteredRows}
          columns={columns}
          defaultPageSize={15}
          isLoading={estado.cargando && reportes.movimientosMensuales.length === 0}
          loadingMessage="Consultando movimientos del período..."
          emptyTitle="Sin movimientos registrados en este rango"
          emptyDescription="Ajusta las fechas de inicio y fin, el centro de acopio o el término de búsqueda."
          headerActions={
            estado.cargando && reportes.movimientosMensuales.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-2">
                <SpinnerGap className="h-3.5 w-3.5 animate-spin text-brand" weight="bold" />
                <span>Actualizando...</span>
              </span>
            ) : null
          }
        />
      </div>

      {showMovimientosPorEESSModal ? (
        <MovimientosPorEESSModal
          onClose={() => setShowMovimientosPorEESSModal(false)}
          onExportar={handleExportarMovimientosPorEESS}
          centrosAcopio={centrosAcopio}
        />
      ) : null}
    </ReportSectionCard>
  );
};

export default React.memo(MovimientosTab);
