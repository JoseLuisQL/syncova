import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Warning, Buildings, Calculator, MicrosoftExcelLogo, SpinnerGap, Package, ArrowsClockwise, ShieldCheck, UploadSimple, CalendarBlank, Syringe } from '@phosphor-icons/react';
import { DataTable, EmptyState } from '../Establecimientos/components';
import { COMPONENT_STYLES as ESTABLECIMIENTOS_STYLES } from '../Establecimientos/constants';
import { MESES_CORTOS } from '../Planificacion/constants';
import { ordenarEstablecimientos, getEstiloEstablecimiento } from '../../utils/centroAcopioUtils';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { IciDemidImportPreview, IciDemidRegistro } from '../../types';
import IciDemidService from '../../services/iciDemidService';
import IciDemidErroresModal from './IciDemidErroresModal';
import IciDemidImportProgressModal from './IciDemidImportProgressModal';

const SELECT_CLASS =
  'h-9 w-full appearance-none rounded-[9px] border border-line bg-white px-3 py-1.5 pr-8 text-sm font-medium text-ink shadow-sm transition hover:border-line-strong focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/70 disabled:cursor-not-allowed disabled:opacity-60';

const FILTER_LABEL_CLASS = 'mb-1 block text-[0.84rem] font-medium text-zinc-700';

const TotalPill: React.FC<{
  value: number | string;
  tone?: 'neutral' | 'amber' | 'purple';
}> = ({ value, tone = 'neutral' }) => {
  const className =
    tone === 'purple'
      ? 'border-brand-100 bg-surface-soft text-brand'
      : tone === 'amber'
        ? 'border-line bg-white text-amber-700'
        : 'border-line bg-white text-ink';

  return (
    <span className={`inline-flex min-w-[4.6rem] justify-center rounded-md border px-2.5 py-1.5 text-sm font-semibold tabular-nums ${className}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
  );
};

const MobileIciDemidCard: React.FC<{ registro: IciDemidRegistro; mesesDelAnio: number[] }> = ({ registro, mesesDelAnio }) => {
  const estilo = getEstiloEstablecimiento(registro.establecimiento);

  return (
    <div className={`rounded-xl border p-3 transition-colors hover:brightness-[0.98] ${estilo.colores.bg} ${estilo.colores.border}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white ${estilo.colores.border}`}>
          <span className={`h-3 w-3 rounded-full ${estilo.colores.accent}`} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{registro.establecimiento.nombre}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.68rem] text-muted-2">
            {registro.establecimiento.codigo ? <span>{registro.establecimiento.codigo}</span> : null}
            {registro.establecimiento.codigo ? <span className="text-[#c4c7d0]">•</span> : null}
            <span className={`rounded-md border bg-white px-2 py-0.5 font-medium ${estilo.colores.border} ${estilo.colores.text}`}>
              {registro.vacuna.nombre}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-line bg-white/90 p-2.5">
          <p className="text-xs font-medium text-muted">Total distribuido</p>
          <p className="mt-1 text-sm font-semibold text-ink tabular-nums">{registro.totalDistribu.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-line bg-white/90 p-2.5">
          <p className="text-xs font-medium text-muted">Situación</p>
          <p className="mt-1 text-xs font-semibold text-ink">{registro.situacion || '-'}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {mesesDelAnio.map((month) => (
          <div key={`${registro.id}-${month}`} className="rounded-lg border border-line bg-white/90 p-2 text-center">
            <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-muted">{MESES_CORTOS[month - 1]}</p>
            <p className="mt-1 text-sm font-semibold text-ink tabular-nums">
              {(registro.distribucionMensual[month - 1] || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <TotalPill value={registro.disponibilidad || '-'} tone="purple" />
        {registro.situacion ? <TotalPill value={registro.situacion} tone="amber" /> : null}
      </div>
    </div>
  );
};

const IciDemid: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isReadOnlyMode = user?.rol === 'responsable_acopio';
  const lockedCentroAcopioIds = user?.centroAcopioIds?.length
    ? user.centroAcopioIds
    : user?.centroAcopioId
      ? [user.centroAcopioId]
      : [];

  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [selectedCentroAcopio, setSelectedCentroAcopio] = useState<string>('todos');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<string>('todos');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('todos');
  const [registros, setRegistros] = useState<IciDemidRegistro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [erroresImportacion, setErroresImportacion] = useState<IciDemidImportPreview | null>(null);
  const [showErroresModal, setShowErroresModal] = useState(false);
  const [importStep, setImportStep] = useState<'preview' | 'import' | 'refresh'>('preview');
  const [importFileName, setImportFileName] = useState<string>('');

  const { establecimientos, centrosAcopio, loadEstablecimientos, loadCentrosAcopio } = useEstablecimientos({ limit: 1000 });
  const { vacunasActivas, loadVacunasActivas } = useVacunas(undefined, { autoLoad: false });

  const establecimientosFiltrados = useMemo(() => {
    let data = establecimientos.filter((item) => item.tipo !== 'hospital' || item.nombre !== 'ALMACÉN (CHANKA)');
    if (selectedCentroAcopio !== 'todos') {
      data = data.filter((item) => item.centroAcopioId === selectedCentroAcopio);
    }
    return ordenarEstablecimientos(data);
  }, [establecimientos, selectedCentroAcopio]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((item) => {
      if (selectedEstablecimiento !== 'todos' && item.establecimientoId !== selectedEstablecimiento) return false;
      if (selectedVacuna !== 'todos' && item.vacunaId !== selectedVacuna) return false;
      return true;
    });
  }, [registros, selectedEstablecimiento, selectedVacuna]);

  const mesesDelAnio = useMemo(() => {
    const months = new Set<number>();
    registros.forEach((item) => item.mesesDisponibles.forEach((month) => {
      if (month >= 1 && month <= 12) {
        months.add(month);
      }
    }));
    return Array.from(months.values()).sort((a, b) => a - b);
  }, [registros]);

  const totalStockFin = useMemo(() => registrosFiltrados.reduce((acc, item) => acc + item.stockFin, 0), [registrosFiltrados]);

  const loadData = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const aniosResponse = await IciDemidService.getAniosDisponibles();
      const anios = aniosResponse.anios;
      setAniosDisponibles(anios);
      const targetAnio = anios.includes(selectedAnio) ? selectedAnio : (anios[0] ?? selectedAnio);
      if (targetAnio !== selectedAnio) {
        setSelectedAnio(targetAnio);
      }

      const response = await IciDemidService.getAll({
        anio: targetAnio,
        centroAcopioId: selectedCentroAcopio === 'todos' ? undefined : selectedCentroAcopio,
        limit: 500,
      });
      setRegistros(response.registros);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'No se pudo cargar ICI DEMID');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadEstablecimientos({ limit: 1000, noPagination: true });
    loadCentrosAcopio();
    loadVacunasActivas({ force: true });
  }, []);

  useEffect(() => {
    if (isReadOnlyMode) {
      setSelectedCentroAcopio('todos');
    }
  }, [isReadOnlyMode]);

  useEffect(() => {
    void loadData();
  }, [selectedAnio, selectedCentroAcopio]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      setIsImporting(true);
      setImportStep('preview');
      setImportFileName(file.name);
      const preview = await IciDemidService.previewImport(file);
      if (preview.establecimientosNoMapeados.length > 0) {
        setErroresImportacion(preview);
        setShowErroresModal(true);
        toast.error('Se encontraron establecimientos no mapeados en el archivo');
        return;
      }

      setImportStep('import');
      const result = await IciDemidService.importar(file);
      if ((result.vacunasNoMapeadas?.length || 0) > 0 || (result.omitidos || 0) > 0) {
        setErroresImportacion(result);
        setShowErroresModal(true);
      }
      toast.success(`Importación completada: ${result.creados} creados, ${result.actualizados} actualizados, ${result.omitidos} omitidos`);
      if (result.aniosDetectados.includes(selectedAnio)) {
        setImportStep('refresh');
        await loadData(true);
      } else if (result.aniosDetectados.length > 0) {
        setImportStep('refresh');
        setSelectedAnio(result.aniosDetectados[0]);
      }
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'No se pudo importar el archivo');
    } finally {
      setIsImporting(false);
      setImportFileName('');
      setImportStep('preview');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-transparent md:h-[calc(100vh-5rem)]">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-line bg-white">
        <section className="shrink-0 border-b border-line-soft bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                <label>
                  <span className={FILTER_LABEL_CLASS}>Año</span>
                  <div className="relative">
                    <CalendarBlank className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" weight="bold" />
                    <select value={selectedAnio} onChange={(e) => setSelectedAnio(Number(e.target.value))} className={`${SELECT_CLASS} pl-9`}>
                    {aniosDisponibles.map((anio) => (
                      <option key={anio} value={anio}>{anio}</option>
                    ))}
                    </select>
                  </div>
                </label>
                <label>
                  <span className={FILTER_LABEL_CLASS}>Centro de acopio</span>
                  <div className="relative">
                    <Buildings className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" weight="bold" />
                    <select value={selectedCentroAcopio} onChange={(e) => setSelectedCentroAcopio(e.target.value)} className={`${SELECT_CLASS} pl-9`}>
                    <option value="todos">Todos</option>
                    {centrosAcopio
                      .filter((centro) => !isReadOnlyMode || lockedCentroAcopioIds.includes(centro.id))
                      .map((centro) => (
                        <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                      ))}
                    </select>
                  </div>
                </label>
                <label>
                  <span className={FILTER_LABEL_CLASS}>Establecimiento</span>
                  <div className="relative">
                    <Buildings className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" weight="bold" />
                    <select value={selectedEstablecimiento} onChange={(e) => setSelectedEstablecimiento(e.target.value)} className={`${SELECT_CLASS} pl-9`}>
                    <option value="todos">Todos</option>
                    {establecimientosFiltrados.map((establecimiento) => (
                      <option key={establecimiento.id} value={establecimiento.id}>{establecimiento.nombre}</option>
                    ))}
                    </select>
                  </div>
                </label>
                <label>
                  <span className={FILTER_LABEL_CLASS}>Vacuna</span>
                  <div className="relative">
                    <Syringe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" weight="bold" />
                    <select value={selectedVacuna} onChange={(e) => setSelectedVacuna(e.target.value)} className={`${SELECT_CLASS} pl-9`}>
                    <option value="todos">Todas</option>
                    {vacunasActivas.map((vacuna) => (
                      <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
                    ))}
                    </select>
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => loadData(true)} className={ESTABLECIMIENTOS_STYLES.button.secondary} disabled={isLoading || isRefreshing}>
                  {isRefreshing ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" />}
                  Actualizar
                </button>
                {!isReadOnlyMode ? (
                  <button type="button" onClick={handleImportClick} className={ESTABLECIMIENTOS_STYLES.button.primary} disabled={isImporting}>
                    {isImporting ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <UploadSimple className="h-4 w-4" />}
                    Importar Excel
                  </button>
                ) : null}
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
              </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
            <span className="inline-flex min-h-9 items-center gap-2 rounded-[9px] border border-brand-100 bg-surface-soft px-3 py-1.5 text-sm text-ink">
              <MicrosoftExcelLogo className="h-4 w-4 text-brand" weight="bold" />
              <span className="text-xs font-medium text-muted">ICI DEMID</span>
              <strong className="font-semibold">{selectedAnio}</strong>
            </span>
            <span className={ESTABLECIMIENTOS_STYLES.badge.neutral}>
              Registros: {registrosFiltrados.length.toLocaleString()}
            </span>
            <span className={ESTABLECIMIENTOS_STYLES.badge.neutral}>
              Stock fin total: {totalStockFin.toLocaleString()}
            </span>
            <span className={ESTABLECIMIENTOS_STYLES.badge.neutral}>
              Meses: {mesesDelAnio.map((month) => MESES_CORTOS[month - 1]).join(', ') || 'Sin datos'}
            </span>
          </div>
        </section>

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <DataTable isLoading={isLoading} loadingMessage="Cargando registros ICI DEMID..." skeletonRows={8} skeletonColumns={16} loadingVariant="table">
            <div className="hidden min-h-0 flex-1 overflow-auto md:block">
              <table className="w-max min-w-full border-separate border-spacing-0 table-auto">
                <thead className="sticky top-0 z-20 bg-surface-soft">
                  <tr className={ESTABLECIMIENTOS_STYLES.table.header}>
                    <th className={`${ESTABLECIMIENTOS_STYLES.table.headerCell} sticky left-0 z-30 w-[280px] min-w-[280px] border-b border-r border-line bg-surface-soft text-left shadow-[8px_0_14px_-12px_rgba(15,23,42,0.16)]`}>
                      <div className="flex items-center gap-2">
                        <Buildings className="h-4 w-4 text-zinc-500" />
                        Establecimiento
                      </div>
                    </th>
                    <th className={`${ESTABLECIMIENTOS_STYLES.table.headerCell} w-[220px] min-w-[220px] border-b border-r border-line-soft text-left`}>Vacuna</th>
                    {mesesDelAnio.map((month) => (
                      <th key={month} className={`${ESTABLECIMIENTOS_STYLES.table.headerCell} w-[94px] min-w-[94px] border-b border-r border-line-soft text-center`}>{MESES_CORTOS[month - 1]}</th>
                    ))}
                    <th className={`${ESTABLECIMIENTOS_STYLES.table.headerCell} w-[110px] min-w-[110px] border-b border-r border-line-soft text-center`}>
                      <div className="flex items-center justify-center gap-2">
                        <Package className="h-4 w-4 text-zinc-500" />
                        Stock fin
                      </div>
                    </th>
                    <th className={`${ESTABLECIMIENTOS_STYLES.table.headerCell} w-[128px] min-w-[128px] border-b border-r border-line-soft text-center`}>
                      <div className="flex items-center justify-center gap-2">
                        <Calculator className="h-4 w-4 text-zinc-500" />
                        Total
                      </div>
                    </th>
                    <th className={`${ESTABLECIMIENTOS_STYLES.table.headerCell} w-[140px] min-w-[140px] border-b border-r border-line-soft text-center`}>Situación</th>
                    <th className={`${ESTABLECIMIENTOS_STYLES.table.headerCell} w-[140px] min-w-[140px] border-b border-line-soft text-center`}>
                      <div className="flex items-center justify-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-zinc-500" />
                        Disponibilidad
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {registrosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={mesesDelAnio.length + 6} className="px-6 py-16 text-center">
                        <EmptyState
                          icon={Warning}
                          title="Sin registros ICI DEMID"
                          description="Ajusta los filtros para visualizar la importación."
                        />
                      </td>
                    </tr>
                  ) : (
                    registrosFiltrados.map((registro) => {
                      const estilo = getEstiloEstablecimiento(registro.establecimiento);
                      return (
                        <tr key={registro.id} className={`transition-[filter] hover:brightness-[0.98] ${estilo.colores.bg}`}>
                          <td className={`sticky left-0 z-10 border-b border-r px-4 py-3 shadow-[8px_0_14px_-12px_rgba(15,23,42,0.12)] ${estilo.colores.border} ${estilo.colores.bg}`}>
                            <div className="flex items-start gap-3">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-white ${estilo.colores.border}`}>
                                <span className={`h-3 w-3 rounded-full ${estilo.colores.accent}`} aria-hidden="true" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-ink">{registro.establecimiento.nombre}</p>
                                <p className="mt-1 text-xs text-muted-2">{registro.establecimiento.codigo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="border-b border-r border-line-soft px-4 py-3 text-sm font-medium text-ink">{registro.vacuna.nombre}</td>
                          {mesesDelAnio.map((month) => (
                            <td key={`${registro.id}-${month}`} className="border-b border-r border-line-soft px-3 py-3 text-center text-sm font-semibold text-ink tabular-nums">
                              {(registro.distribucionMensual[month - 1] || 0).toLocaleString()}
                            </td>
                          ))}
                          <td className="border-b border-r border-line-soft px-3 py-3 text-center text-sm font-semibold text-brand">{registro.stockFin.toLocaleString()}</td>
                          <td className="border-b border-r border-line-soft px-3 py-3 text-center text-sm font-semibold text-ink">{registro.totalDistribu.toLocaleString()}</td>
                          <td className="border-b border-r border-line-soft px-3 py-3 text-center text-xs font-semibold text-muted-2">{registro.situacion || '-'}</td>
                          <td className="border-b border-line-soft px-3 py-3 text-center text-xs font-semibold text-muted-2">{registro.disponibilidad || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-white p-2.5 md:hidden">
              {registrosFiltrados.length === 0 && !isLoading ? (
                <div className="rounded-xl border border-line bg-white">
                  <EmptyState
                    icon={Warning}
                    title="Sin registros ICI DEMID"
                    description="Ajusta los filtros para ver la tabla."
                  />
                </div>
              ) : (
                <div className="mt-2.5 space-y-2">
                  {registrosFiltrados.map((registro) => (
                    <MobileIciDemidCard
                      key={`mobile-${registro.id}`}
                      registro={registro}
                      mesesDelAnio={mesesDelAnio}
                    />
                  ))}
                </div>
              )}
            </div>
          </DataTable>
        </section>
      </div>
      <IciDemidErroresModal
        isOpen={showErroresModal}
        onClose={() => setShowErroresModal(false)}
        errores={erroresImportacion}
      />
      <IciDemidImportProgressModal
        isOpen={isImporting}
        currentStep={importStep}
        fileName={importFileName}
      />
    </div>
  );
};

export default IciDemid;
 