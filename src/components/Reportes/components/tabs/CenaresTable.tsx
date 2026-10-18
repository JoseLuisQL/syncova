import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  WarningCircle,
  CheckCircle,
  FileXls,
  SpinnerGap,
  Package,
  ArrowsClockwise,
  Syringe,
  ArrowsLeftRight,
  CaretDown,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import { ProgramacionAnualCenaresService } from '../../../../services/programacionAnualCenaresService';
import { ProgramacionSeguimientoAnualExportService } from '../../../../services/programacionSeguimientoAnualExportService';
import { COMPONENT_STYLES } from '../../constants';
import ActionConfirmationDialog from '../ActionConfirmationDialog';

interface TableItem {
  id: string;
  tipo: 'vacuna' | 'jeringa';
  descripcion: string;
  saldoAnterior: number;
  programacion: {
    id: string | null;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  entregas: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  consumo: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  saldos: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
}

interface CenaresTableProps {
  anio: number;
  onAnioChange?: (anio: number) => void;
  centroAcopioId?: string;
  tipoItem?: string;
  onTipoItemChange?: (tipo: string) => void;
}

const TRIMESTRES = ['q1', 'q2', 'q3', 'q4'] as const;
const TRIMESTRE_LABELS = {
  q1: '1° Trimestre',
  q2: '2° Trimestre',
  q3: '3° Trimestre',
  q4: '4° Trimestre',
};

const CENARES_PAGE_SIZES = [10, 15, 25, 50] as const;

const CenaresTable: React.FC<CenaresTableProps> = memo(
  ({ anio, onAnioChange, tipoItem = 'todos', onTipoItemChange }) => {
    const [items, setItems] = useState<TableItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(15);
    const [tempValues, setTempValues] = useState<Record<string, number>>({});
    const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showConfirmSync, setShowConfirmSync] = useState(false);
    const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    const currentYear = new Date().getFullYear();
    const yearOptions = useMemo(
      () => Array.from({ length: 5 }, (_, index) => currentYear - 2 + index),
      [currentYear],
    );

    const loadData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProgramacionAnualCenaresService.getDatosTablaCompleta(anio);
        setItems(data.items || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        toast.error('Error al cargar datos de programación');
      } finally {
        setLoading(false);
      }
    }, [anio]);

    useEffect(() => {
      void loadData();
    }, [loadData]);

    const filteredItems = useMemo(() => {
      const q = searchQuery.trim().toLowerCase();
      return items.filter((item) => {
        if (tipoItem !== 'todos' && item.tipo !== tipoItem) return false;
        if (q && !item.descripcion.toLowerCase().includes(q)) return false;
        return true;
      });
    }, [items, searchQuery, tipoItem]);

    useEffect(() => {
      setCurrentPage(1);
    }, [anio, tipoItem, searchQuery, pageSize]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredItems.length);

    const paginatedItems = useMemo(
      () => filteredItems.slice(startIndex, endIndex),
      [filteredItems, startIndex, endIndex],
    );

    const stats = useMemo(() => {
      const vacunas = filteredItems.filter((item) => item.tipo === 'vacuna').length;
      const jeringas = filteredItems.filter((item) => item.tipo === 'jeringa').length;
      const totalProgramado = filteredItems.reduce(
        (acc, item) =>
          acc + item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4,
        0,
      );
      const totalEntregado = filteredItems.reduce(
        (acc, item) => acc + item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4,
        0,
      );

      return { vacunas, jeringas, totalProgramado, totalEntregado };
    }, [filteredItems]);

    const getFieldKey = (itemId: string, trimestre: string) => `${itemId}-${trimestre}`;

    const calculateSaldos = (
      saldoAnterior: number,
      entregas: TableItem['entregas'],
      consumo: TableItem['consumo'],
    ) => {
      const q1 = saldoAnterior + entregas.q1 - consumo.q1;
      const q2 = q1 + entregas.q2 - consumo.q2;
      const q3 = q2 + entregas.q3 - consumo.q3;
      const q4 = q3 + entregas.q4 - consumo.q4;

      return { q1, q2, q3, q4 };
    };

    const saveValue = useCallback(
      async (item: TableItem, trimestre: string, value: number) => {
        const key = getFieldKey(item.id, trimestre);

        try {
          setIsUpdating(true);

          if (debounceTimeouts.current[key]) {
            clearTimeout(debounceTimeouts.current[key]);
            delete debounceTimeouts.current[key];
          }

          await ProgramacionAnualCenaresService.updateProgramacionTrimestral(
            item.id,
            item.tipo,
            anio,
            trimestre as 'q1' | 'q2' | 'q3' | 'q4',
            value,
          );

          setItems((prev) => {
            const updated = [...prev];
            const realIndex = prev.findIndex((entry) => entry.id === item.id);

            if (realIndex >= 0) {
              updated[realIndex] = {
                ...updated[realIndex],
                programacion: { ...updated[realIndex].programacion, [trimestre]: value },
              };
              updated[realIndex].saldos = calculateSaldos(
                updated[realIndex].saldoAnterior,
                updated[realIndex].entregas,
                updated[realIndex].consumo,
              );
            }

            return updated;
          });

          setTempValues((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
          setPendingChanges((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        } catch {
          toast.error('Error al guardar cambio');
        } finally {
          setIsUpdating(false);
        }
      },
      [anio],
    );

    const handleValueChange = useCallback(
      (item: TableItem, trimestre: string, value: number) => {
        const key = getFieldKey(item.id, trimestre);
        setTempValues((prev) => ({ ...prev, [key]: value }));
        setPendingChanges((prev) => ({ ...prev, [key]: true }));

        if (debounceTimeouts.current[key]) {
          clearTimeout(debounceTimeouts.current[key]);
        }

        debounceTimeouts.current[key] = setTimeout(() => {
          void saveValue(item, trimestre, value);
        }, 1200);
      },
      [saveValue],
    );

    const handleBlur = useCallback(
      (item: TableItem, trimestre: string) => {
        const key = getFieldKey(item.id, trimestre);
        if (tempValues[key] !== undefined && pendingChanges[key]) {
          void saveValue(item, trimestre, tempValues[key]);
        }
      },
      [pendingChanges, saveValue, tempValues],
    );

    const getCurrentValue = (item: TableItem, trimestre: string) => {
      const key = getFieldKey(item.id, trimestre);
      if (tempValues[key] !== undefined) return tempValues[key];
      return (item?.programacion?.[trimestre as 'q1' | 'q2' | 'q3' | 'q4'] as number) || 0;
    };

    const isPending = (item: TableItem, trimestre: string) =>
      pendingChanges[getFieldKey(item.id, trimestre)] || false;

    const handleExport = useCallback(async () => {
      if (filteredItems.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      try {
        setIsExporting(true);
        const config = ProgramacionSeguimientoAnualExportService.crearConfiguracionDesdeFiltros(
          anio,
          'Usuario del Sistema',
          `Programación y seguimiento anual CENARES - ${anio}`,
        );
        await ProgramacionSeguimientoAnualExportService.exportarYDescargar(config);
        toast.success('Exportación completada');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error al exportar');
      } finally {
        setIsExporting(false);
      }
    }, [anio, filteredItems.length]);

    const confirmSyncSaldos = useCallback(async () => {
      try {
        setIsSyncing(true);
        const resultado = await ProgramacionAnualCenaresService.sincronizarSaldos(anio);
        toast.success(`Saldos sincronizados: ${resultado.saldosCalculados} ítems actualizados`);
        await loadData();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error al sincronizar saldos');
      } finally {
        setIsSyncing(false);
        setShowConfirmSync(false);
      }
    }, [anio, loadData]);

    return (
      <div className="space-y-3.5">
        {/* Barra simétrica unificada de 12 columnas */}
        <section className={COMPONENT_STYLES.filter.container} aria-label="Controles de seguimiento CENARES">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
            {/* Año fiscal (2 cols) */}
            <div className="relative lg:col-span-2">
              <select
                value={anio}
                onChange={(e) => onAnioChange?.(parseInt(e.target.value, 10))}
                className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal} font-mono tabular-nums`}
                aria-label="Año fiscal"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Año {y}
                  </option>
                ))}
              </select>
              <CaretDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2"
                weight="bold"
              />
            </div>

            {/* Selector de tipo de ítem (3 cols) */}
            <div className="lg:col-span-3 grid grid-cols-3 gap-1 rounded-lg border border-line bg-surface-soft p-1 h-9 items-center">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'vacuna', label: 'Vacunas' },
                { id: 'jeringa', label: 'Jeringas' },
              ].map((opt) => {
                const active = tipoItem === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onTipoItemChange?.(opt.id)}
                    className={`inline-flex h-7 w-full items-center justify-center rounded-md px-2 text-xs font-medium transition-colors focus-visible:outline-none ${
                      active
                        ? 'bg-surface text-ink font-semibold shadow-2xs'
                        : 'text-muted-2 hover:text-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Buscador rápido (3 cols) */}
            <div className="relative lg:col-span-3">
              <MagnifyingGlass className={COMPONENT_STYLES.filter.searchIcon} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar vacuna o jeringa..."
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

            {/* Estado de autoguardado + Acciones (4 cols) */}
            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-end gap-2">
              {isUpdating ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mr-1">
                  <SpinnerGap weight="bold" className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando...</span>
                </span>
              ) : (
                <span className="hidden xl:inline-flex items-center gap-1 text-xs text-muted-2 mr-1">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" weight="fill" />
                  <span>Auto-guardado</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowConfirmSync(true)}
                disabled={isSyncing || loading}
                className={COMPONENT_STYLES.button.secondary}
                title="Recalcular saldos del año anterior"
              >
                {isSyncing ? (
                  <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowsClockwise className="h-4 w-4" weight="bold" />
                )}
                <span>Sincronizar</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting || filteredItems.length === 0 || loading}
                className={COMPONENT_STYLES.button.primary}
              >
                {isExporting ? (
                  <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" />
                ) : (
                  <FileXls weight="bold" className="h-4 w-4" />
                )}
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </section>

        {/* Contenedor de matriz trimestral */}
        <section className={COMPONENT_STYLES.results.shell}>
          <header className={COMPONENT_STYLES.results.header}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <h3 className="text-sm font-semibold text-ink">Matriz trimestral CENARES {anio}</h3>
                <span className="font-mono text-xs text-muted-2 tabular-nums">
                  {stats.vacunas} vacunas · {stats.jeringas} jeringas ·{' '}
                  {stats.totalProgramado.toLocaleString('es-PE')} programado ·{' '}
                  {stats.totalEntregado.toLocaleString('es-PE')} entregado
                </span>
              </div>
              <span className="text-xs text-muted-2">
                Edita las celdas de <strong className="font-medium text-ink">Prog.</strong> para actualizar metas trimestrales
              </span>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <SpinnerGap weight="bold" className="h-6 w-6 animate-spin text-brand" />
              <p className="mt-3 text-sm font-semibold text-ink">Cargando programación {anio}...</p>
              <p className="mt-0.5 text-xs text-muted-2">Preparando matriz trimestral Q1–Q4 y saldos.</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-4">
              <WarningCircle weight="duotone" className="h-7 w-7 text-rose-600 dark:text-rose-400" />
              <p className="mt-2 text-sm font-semibold text-ink">No se pudo cargar la matriz CENARES</p>
              <p className="mt-1 text-xs text-muted-2">{error}</p>
              <button
                type="button"
                onClick={() => void loadData()}
                className={`${COMPONENT_STYLES.button.secondary} mt-4`}
              >
                <ArrowsClockwise className="h-4 w-4" weight="bold" />
                <span>Reintentar</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="px-3 py-2 flex items-center gap-1.5 text-xs font-medium text-muted bg-surface-soft/50 border-b border-line-soft md:hidden">
                <ArrowsLeftRight className="h-3.5 w-3.5 text-brand" weight="bold" />
                <span>Desliza horizontalmente para revisar los 4 trimestres</span>
              </div>

              <div className="max-h-[600px] overflow-x-auto overflow-y-auto touch-pan-x-smooth">
                <table className="w-full min-w-[1320px] sm:min-w-[1520px] border-collapse">
                  <thead className="sticky top-0 z-20">
                    <tr className="border-b border-line bg-surface-soft text-muted-2">
                      <th className="sticky left-0 z-30 w-[160px] min-w-[160px] sm:w-[230px] sm:min-w-[230px] border-r border-line bg-surface-soft px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                        Biológico / Jeringa
                      </th>
                      <th className="sm:sticky sm:left-[230px] z-20 sm:z-30 min-w-[82px] border-r border-line bg-surface-soft px-2.5 py-2.5 text-right text-xs font-semibold">
                        Saldo {anio - 1}
                      </th>
                      {TRIMESTRES.map((quarter) => (
                        <th
                          key={quarter}
                          colSpan={5}
                          className="border-r border-line bg-surface-soft px-2 py-2.5 text-center text-xs font-semibold text-ink"
                        >
                          {TRIMESTRE_LABELS[quarter]}
                        </th>
                      ))}
                      <th colSpan={3} className="bg-surface-soft px-2 py-2.5 text-center text-xs font-semibold text-ink">
                         Consolidado Anual
                      </th>
                    </tr>

                    <tr className="border-b border-line bg-surface-soft text-[11px] font-semibold text-muted-2">
                      <th className="sticky left-0 z-30 border-r border-line bg-surface-soft" />
                      <th className="sm:sticky sm:left-[230px] z-20 sm:z-30 border-r border-line bg-surface-soft" />
                      {TRIMESTRES.map((quarter) => (
                        <React.Fragment key={`sub-${quarter}`}>
                          <th className="px-2 py-1.5 text-center whitespace-nowrap">Prog.</th>
                          <th className="px-2 py-1.5 text-right whitespace-nowrap">Entreg.</th>
                          <th className="px-2 py-1.5 text-right whitespace-nowrap">Dif.</th>
                          <th className="px-2 py-1.5 text-right whitespace-nowrap">Cons.</th>
                          <th className="border-r border-line px-2 py-1.5 text-right whitespace-nowrap">Saldo</th>
                        </React.Fragment>
                      ))}
                      <th className="px-2 py-1.5 text-right whitespace-nowrap">Prog.</th>
                      <th className="px-2 py-1.5 text-right whitespace-nowrap">Entreg.</th>
                      <th className="px-2 py-1.5 text-right whitespace-nowrap">Dif.</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line-soft bg-surface">
                    {paginatedItems.map((item) => {
                      const q1Prog = getCurrentValue(item, 'q1');
                      const q2Prog = getCurrentValue(item, 'q2');
                      const q3Prog = getCurrentValue(item, 'q3');
                      const q4Prog = getCurrentValue(item, 'q4');
                      const totalProg = q1Prog + q2Prog + q3Prog + q4Prog;
                      const totalEntr =
                        item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4;
                      const totalDif = totalProg - totalEntr;

                      return (
                        <tr
                          key={item.id}
                          className="group transition-colors hover:bg-surface-soft/70"
                        >
                          <td className="sticky left-0 z-10 w-[160px] min-w-[160px] sm:w-[230px] sm:min-w-[230px] border-r border-line bg-surface px-3 sm:px-4 py-2 transition-colors group-hover:bg-surface-soft">
                            <div className="flex items-center gap-2 min-w-0">
                              {item.tipo === 'vacuna' ? (
                                <Package className="h-3.5 w-3.5 shrink-0 text-brand" weight="bold" />
                              ) : (
                                <Syringe className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" weight="bold" />
                              )}
                              <span
                                className="truncate text-xs sm:text-[13px] font-medium text-ink"
                                title={item.descripcion}
                              >
                                {item.descripcion}
                              </span>
                            </div>
                          </td>

                          <td className="sm:sticky sm:left-[230px] z-10 border-r border-line bg-surface-soft/60 px-2.5 py-2 text-right font-mono text-xs font-semibold text-ink tabular-nums">
                            {item.saldoAnterior.toLocaleString('es-PE')}
                          </td>

                          {TRIMESTRES.map((quarter) => {
                            const prog = getCurrentValue(item, quarter);
                            const entr = item.entregas[quarter];
                            const dif = prog - entr;
                            const cons = item.consumo[quarter];
                            const saldo = item.saldos[quarter];
                            const pending = isPending(item, quarter);

                            return (
                              <React.Fragment key={`${item.id}-${quarter}`}>
                                <td className="px-1.5 py-1.5 text-center">
                                  <div className="relative inline-block">
                                    <input
                                      type="number"
                                      min="0"
                                      value={prog}
                                      onChange={(event) =>
                                        handleValueChange(
                                          item,
                                          quarter,
                                          parseInt(event.target.value, 10) || 0,
                                        )
                                      }
                                      onBlur={() => handleBlur(item, quarter)}
                                      disabled={isUpdating}
                                      className={`h-7 w-16 rounded-md border px-1.5 text-right font-mono text-xs font-medium tabular-nums focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-surface-soft ${
                                        pending
                                          ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 text-ink'
                                          : 'border-line bg-surface text-ink hover:border-line-strong'
                                      }`}
                                    />
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono text-xs text-muted-2 tabular-nums whitespace-nowrap">
                                  {entr.toLocaleString('es-PE')}
                                </td>
                                <td
                                  className={`px-2 py-1.5 text-right font-mono text-xs font-semibold tabular-nums whitespace-nowrap ${
                                    dif >= 0
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {dif >= 0 ? '+' : ''}
                                  {dif.toLocaleString('es-PE')}
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono text-xs text-muted-2 tabular-nums whitespace-nowrap">
                                  {cons.toLocaleString('es-PE')}
                                </td>
                                <td
                                  className={`border-r border-line px-2 py-1.5 text-right font-mono text-xs font-semibold tabular-nums whitespace-nowrap ${
                                    saldo >= 0 ? 'text-ink' : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {saldo.toLocaleString('es-PE')}
                                </td>
                              </React.Fragment>
                            );
                          })}

                          <td className="bg-surface-soft/50 px-2.5 py-1.5 text-right font-mono text-xs font-semibold text-ink tabular-nums whitespace-nowrap">
                            {totalProg.toLocaleString('es-PE')}
                          </td>
                          <td className="bg-surface-soft/50 px-2.5 py-1.5 text-right font-mono text-xs font-semibold text-ink tabular-nums whitespace-nowrap">
                            {totalEntr.toLocaleString('es-PE')}
                          </td>
                          <td
                            className={`bg-surface-soft/50 px-2.5 py-1.5 text-right font-mono text-xs font-semibold tabular-nums whitespace-nowrap ${
                              totalDif >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {totalDif >= 0 ? '+' : ''}
                            {totalDif.toLocaleString('es-PE')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredItems.length > 0 && (
                <div className={COMPONENT_STYLES.pagination.container}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={COMPONENT_STYLES.pagination.info}>
                        Mostrando {startIndex + 1}–{endIndex} de {filteredItems.length.toLocaleString('es-PE')}
                      </span>

                      <div className="relative inline-flex items-center">
                        <select
                          value={pageSize}
                          onChange={(e) => setPageSize(Number(e.target.value))}
                          className="h-8 appearance-none rounded-lg border border-line bg-surface pl-2.5 pr-7 font-mono text-xs font-medium text-ink transition-colors hover:border-line-strong focus:border-brand focus:outline-none tabular-nums"
                          aria-label="Ítems por página"
                        >
                          {CENARES_PAGE_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size} / pág.
                            </option>
                          ))}
                        </select>
                        <CaretDown
                          className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-2"
                          weight="bold"
                        />
                      </div>
                    </div>

                    {totalPages > 1 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={safePage === 1}
                          className={`${COMPONENT_STYLES.pagination.button} inline-flex items-center gap-1`}
                          aria-label="Página anterior"
                        >
                          <CaretLeft className="h-3.5 w-3.5" weight="bold" />
                          <span className="hidden sm:inline">Anterior</span>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`${COMPONENT_STYLES.pagination.button} font-mono tabular-nums ${
                              safePage === page
                                ? COMPONENT_STYLES.pagination.buttonActive
                                : COMPONENT_STYLES.pagination.buttonInactive
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={safePage === totalPages}
                          className={`${COMPONENT_STYLES.pagination.button} inline-flex items-center gap-1`}
                          aria-label="Página siguiente"
                        >
                          <span className="hidden sm:inline">Siguiente</span>
                          <CaretRight className="h-3.5 w-3.5" weight="bold" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <ActionConfirmationDialog
          isOpen={showConfirmSync}
          title="Sincronizar saldos anteriores"
          description={`Se recalcularán los saldos del año ${anio - 1} para actualizar el saldo base de ${anio}. Usa esta acción cuando confirmes que el histórico anual está cerrado.`}
          onConfirm={confirmSyncSaldos}
          onClose={() => setShowConfirmSync(false)}
          confirmLabel="Sincronizar"
          isLoading={isSyncing}
        />
      </div>
    );
  },
);

CenaresTable.displayName = 'CenaresTable';

export default CenaresTable;
