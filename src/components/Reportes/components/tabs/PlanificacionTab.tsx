import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CaretDown,
  FileXls,
  MagnifyingGlass,
  SpinnerGap,
  X,
} from '@phosphor-icons/react';
import { Vacuna } from '../../../../types';
import { CentroAcopioOption } from '../../../../types/reportes';
import { usePlanificacionReportes } from '../../../../hooks/usePlanificacionReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import { ProgramacionAnualData } from '../../../../services/planificacionReportesService';
import { COMPONENT_STYLES } from '../../constants';
import {
  ReportInlineStatus,
  ReportResultsTable,
  ReportSectionCard,
  ReportTableColumn,
} from '../ReportPrimitives';
import { formatCompactDate } from '../../utils';

interface PlanificacionTabProps {
  centrosAcopio: CentroAcopioOption[];
  vacunas: Vacuna[];
}

const PlanificacionTab: React.FC<PlanificacionTabProps> = ({ centrosAcopio, vacunas }) => {
  const {
    reportes,
    estado,
    generarProgramacionAnual,
    exportarProgramacionAnual,
  } = usePlanificacionReportes();
  const { toast } = useToastContext();

  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(() => new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtrosLocales, setFiltrosLocales] = useState({
    vacuna: 'todas',
    centroAcopio: 'todos',
  });

  useEffect(() => {
    void generarProgramacionAnual({
      anio: anioSeleccionado,
      vacunaId: filtrosLocales.vacuna !== 'todas' ? filtrosLocales.vacuna : undefined,
      centroAcopioId: filtrosLocales.centroAcopio !== 'todos' ? filtrosLocales.centroAcopio : undefined,
      incluirInactivos: false,
    });
  }, [
    anioSeleccionado,
    filtrosLocales.centroAcopio,
    filtrosLocales.vacuna,
    generarProgramacionAnual,
  ]);

  const handleExportarReporte = useCallback(async () => {
    try {
      setIsExporting(true);
      await exportarProgramacionAnual({
        anio: anioSeleccionado,
        vacunaId: filtrosLocales.vacuna !== 'todas' ? filtrosLocales.vacuna : undefined,
        centroAcopioId: filtrosLocales.centroAcopio !== 'todos' ? filtrosLocales.centroAcopio : undefined,
        responsableReporte: 'Usuario del Sistema',
        observaciones: `Reporte generado para el año ${anioSeleccionado}`,
      });

      toast.success('Exportación lista', 'El archivo Excel se descargó correctamente.', { duration: 2500 });
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast.error('Error al exportar', 'Ocurrió un error al preparar el archivo.', { duration: 4000 });
    } finally {
      setIsExporting(false);
    }
  }, [anioSeleccionado, exportarProgramacionAnual, filtrosLocales.centroAcopio, filtrosLocales.vacuna, toast]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportes.programacionAnual;
    return reportes.programacionAnual.filter(
      (row) =>
        row.establecimiento.nombre.toLowerCase().includes(q) ||
        row.establecimiento.codigo.toLowerCase().includes(q) ||
        row.vacuna.nombre.toLowerCase().includes(q),
    );
  }, [reportes.programacionAnual, searchQuery]);

  const totalDosisProgramadas = useMemo(
    () => filteredRows.reduce((sum, r) => sum + (r.metaAnual || 0), 0),
    [filteredRows],
  );

  const columns: ReportTableColumn<ProgramacionAnualData>[] = useMemo(
    () => [
      {
        key: 'establecimiento',
        label: 'Establecimiento de Salud',
        render: (row) => (
          <div>
            <p className="font-semibold text-ink">{row.establecimiento.nombre}</p>
            <p className="font-mono text-xs text-muted-2">
              {row.establecimiento.codigo} · {row.establecimiento.tipo.replace('_', ' ')}
            </p>
          </div>
        ),
      },
      {
        key: 'vacuna',
        label: 'Biológico / Presentación',
        render: (row) => (
          <div>
            <p className="font-medium text-ink">{row.vacuna.nombre}</p>
            <p className="text-xs text-muted-2">{row.vacuna.presentacion}</p>
          </div>
        ),
      },
      {
        key: 'promedioMensual',
        label: 'Promedio mensual',
        align: 'right',
        render: (row) => (
          <span className="font-mono text-xs text-muted-2 tabular-nums">
            {Math.round((row.metaAnual || 0) / 12).toLocaleString('es-PE')}
          </span>
        ),
      },
      {
        key: 'meta',
        label: 'Meta anual (dosis)',
        align: 'right',
        render: (row) => (
          <span className="font-mono font-semibold text-ink tabular-nums">
            {row.metaAnual.toLocaleString('es-PE')}
          </span>
        ),
      },
      {
        key: 'estado',
        label: 'Estado',
        align: 'center',
        render: (row) => (
          <span className={row.estado === 'activo' ? COMPONENT_STYLES.badge.active : COMPONENT_STYLES.badge.warning}>
            {row.estado === 'activo' ? 'Activo' : row.estado}
          </span>
        ),
      },
      {
        key: 'actualizacion',
        label: 'Actualización',
        align: 'right',
        render: (row) => (
          <span className="font-mono text-xs text-muted-2 tabular-nums">
            {formatCompactDate(row.fechaActualizacion)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <ReportSectionCard>
      <div className="space-y-3.5">
        {/* Barra simétrica de 12 columnas: Año + Centro + Vacuna + Buscador + Exportar */}
        <section className={COMPONENT_STYLES.filter.container} aria-label="Filtros de planificación anual">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
            <div className="relative lg:col-span-2">
              <select
                value={anioSeleccionado}
                onChange={(event) => setAnioSeleccionado(parseInt(event.target.value, 10))}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal} font-mono tabular-nums`}
                aria-label="Año fiscal"
              >
                {[2024, 2025, 2026, 2027].map((anio) => (
                  <option key={anio} value={anio}>
                    Año {anio}
                  </option>
                ))}
              </select>
              <CaretDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                weight="bold"
              />
            </div>

            <div className="relative lg:col-span-3">
              <select
                value={filtrosLocales.centroAcopio}
                onChange={(event) => setFiltrosLocales((prev) => ({ ...prev, centroAcopio: event.target.value }))}
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

            <div className="relative lg:col-span-3">
              <select
                value={filtrosLocales.vacuna}
                onChange={(event) => setFiltrosLocales((prev) => ({ ...prev, vacuna: event.target.value }))}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
                aria-label="Biológico o vacuna"
              >
                <option value="todas">Vacuna: Todas</option>
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

            <div className="relative lg:col-span-2">
              <MagnifyingGlass className={COMPONENT_STYLES.filter.searchIcon} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar EESS o código..."
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

            <div className="sm:col-span-2 lg:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={handleExportarReporte}
                disabled={isExporting || filteredRows.length === 0}
                className={`${COMPONENT_STYLES.button.primary} w-full`}
              >
                {isExporting ? (
                  <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" />
                ) : (
                  <FileXls className="h-4 w-4" weight="bold" />
                )}
                <span>Exportar Excel</span>
              </button>
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

        <ReportResultsTable
          title={`Programación anual ${anioSeleccionado}`}
          summaryText={`${totalDosisProgramadas.toLocaleString('es-PE')} dosis programadas`}
          rows={filteredRows}
          columns={columns}
          isLoading={estado.cargando && reportes.programacionAnual.length === 0}
          loadingMessage="Consultando programación anual..."
          emptyTitle="No se encontraron metas para los filtros aplicados"
          emptyDescription="Prueba seleccionando otro año fiscal, centro de acopio o vacuna."
        />
      </div>
    </ReportSectionCard>
  );
};

export default React.memo(PlanificacionTab);
