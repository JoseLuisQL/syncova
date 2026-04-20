import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Warning, Buildings, Calculator, MicrosoftExcelLogo, SpinnerGap, Package, ArrowsClockwise, ShieldCheck, UploadSimple } from '@phosphor-icons/react';
import { DataTable } from '../Establecimientos/components/FilterAndTable';
import { COMPONENT_STYLES, MESES_CORTOS } from '../Planificacion/constants';
import { ordenarEstablecimientos, getEstiloEstablecimiento } from '../../utils/centroAcopioUtils';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useVacunas } from '../../hooks/useVacunas';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { IciDemidImportPreview, IciDemidRegistro } from '../../types';
import { MODULE_LAYOUT } from '../../styles/layout';
import IciDemidService from '../../services/iciDemidService';
import IciDemidErroresModal from './IciDemidErroresModal';
import IciDemidImportProgressModal from './IciDemidImportProgressModal';

const TotalPill: React.FC<{
  value: number | string;
  tone?: 'neutral' | 'amber';
}> = ({ value, tone = 'neutral' }) => {
  const className = tone === 'amber'
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : 'border-zinc-200 bg-zinc-50 text-zinc-700';

  return (
    <span className={`inline-flex min-w-[4.6rem] justify-center rounded-xl border px-2.5 py-2 text-sm font-semibold tabular-nums ${className}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
  );
};

const MobileIciDemidCard: React.FC<{ registro: IciDemidRegistro; mesesDelAnio: number[] }> = ({ registro, mesesDelAnio }) => {
  const estilo = getEstiloEstablecimiento(registro.establecimiento);

  return (
    <div className={`rounded-xl border border-zinc-200 p-3 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md ${estilo.colores.bg}`}>
      <div className="flex items-start gap-3">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-500 ring-2 ring-white/80" />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${estilo.colores.text}`}>{registro.establecimiento.nombre}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[0.68rem] text-zinc-500">
            {registro.establecimiento.codigo ? <span>{registro.establecimiento.codigo}</span> : null}
            {registro.establecimiento.codigo ? <span className="text-zinc-300">•</span> : null}
            <span>{registro.vacuna.nombre}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/70 bg-white/80 p-2.5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wide text-zinc-500">Total distribuido</p>
          <p className="mt-1 text-sm font-semibold text-zinc-800 tabular-nums">{registro.totalDistribu.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/70 bg-white/80 p-2.5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wide text-zinc-500">Situación</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-700">{registro.situacion || '-'}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {mesesDelAnio.map((month) => (
          <div key={`${registro.id}-${month}`} className="rounded-xl border border-white/70 bg-white/80 p-2 text-center">
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-zinc-500">{MESES_CORTOS[month - 1]}</p>
            <p className="mt-1 text-sm font-semibold text-zinc-800 tabular-nums">
              {(registro.distribucionMensual[month - 1] || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <TotalPill value={registro.disponibilidad || '-'} tone="neutral" />
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
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-white p-4 md:h-[calc(100vh-5rem)] md:p-6">
      <div className={`${MODULE_LAYOUT.fullWidth} flex h-full flex-col gap-4 overflow-hidden`}>
        <section className="bg-transparent">
          <div className="border-b border-zinc-100 px-4 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label>
                  <span className={COMPONENT_STYLES.input.label}>Año</span>
                  <select value={selectedAnio} onChange={(e) => setSelectedAnio(Number(e.target.value))} className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan}`}>
                    {aniosDisponibles.map((anio) => (
                      <option key={anio} value={anio}>{anio}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={COMPONENT_STYLES.input.label}>Centro de acopio</span>
                  <select value={selectedCentroAcopio} onChange={(e) => setSelectedCentroAcopio(e.target.value)} className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}>
                    <option value="todos">Todos</option>
                    {centrosAcopio
                      .filter((centro) => !isReadOnlyMode || lockedCentroAcopioIds.includes(centro.id))
                      .map((centro) => (
                        <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                      ))}
                  </select>
                </label>
                <label>
                  <span className={COMPONENT_STYLES.input.label}>Establecimiento</span>
                  <select value={selectedEstablecimiento} onChange={(e) => setSelectedEstablecimiento(e.target.value)} className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.teal}`}>
                    <option value="todos">Todos</option>
                    {establecimientosFiltrados.map((establecimiento) => (
                      <option key={establecimiento.id} value={establecimiento.id}>{establecimiento.nombre}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={COMPONENT_STYLES.input.label}>Vacuna</span>
                  <select value={selectedVacuna} onChange={(e) => setSelectedVacuna(e.target.value)} className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.cyan}`}>
                    <option value="todos">Todas</option>
                    {vacunasActivas.map((vacuna) => (
                      <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => loadData(true)} className={COMPONENT_STYLES.button.secondary} disabled={isLoading || isRefreshing}>
                  {isRefreshing ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" />}
                  Actualizar
                </button>
                {!isReadOnlyMode ? (
                  <button type="button" onClick={handleImportClick} className={COMPONENT_STYLES.button.primary} disabled={isImporting}>
                    {isImporting ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <UploadSimple className="h-4 w-4" />}
                    Importar Excel
                  </button>
                ) : null}
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFile} />
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-600 p-1 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 rounded-[18px] bg-white/10 px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18">
                    <MicrosoftExcelLogo className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-teal-100/80">ICI DEMID</p>
                    <p className="text-sm font-semibold">{selectedAnio}</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 text-xs font-semibold">
                  Registros: {registrosFiltrados.length.toLocaleString()}
                </span>
                <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 text-xs font-semibold">
                  Stock fin total: {totalStockFin.toLocaleString()}
                </span>
                <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 text-xs font-semibold">
                  Meses detectados: {mesesDelAnio.map((month) => MESES_CORTOS[month - 1]).join(', ') || 'Sin datos'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
          <DataTable isLoading={isLoading} loadingMessage="Cargando registros ICI DEMID..." skeletonRows={8} skeletonColumns={16} loadingVariant="table">
            <div className="hidden min-h-0 flex-1 overflow-auto md:block">
              <table className="w-max min-w-full table-auto divide-y divide-zinc-200">
                <thead className="sticky top-0 z-20 bg-white">
                  <tr className="border-b border-zinc-200 bg-zinc-50/95">
                    <th className={`${COMPONENT_STYLES.table.headerCell} sticky left-0 z-30 w-[280px] min-w-[280px] bg-zinc-50/95 text-left shadow-[8px_0_14px_-12px_rgba(15,23,42,0.16)]`}>
                      <div className="flex items-center gap-2">
                        <Buildings className="h-4 w-4 text-zinc-500" />
                        Establecimiento
                      </div>
                    </th>
                    <th className={`${COMPONENT_STYLES.table.headerCell} w-[220px] min-w-[220px] text-left`}>Vacuna</th>
                    {mesesDelAnio.map((month) => (
                      <th key={month} className={`${COMPONENT_STYLES.table.headerCell} w-[94px] min-w-[94px] text-center`}>{MESES_CORTOS[month - 1]}</th>
                    ))}
                    <th className={`${COMPONENT_STYLES.table.headerCell} w-[110px] min-w-[110px] text-center`}>
                      <div className="flex items-center justify-center gap-2">
                        <Package className="h-4 w-4 text-zinc-500" />
                        Stock fin
                      </div>
                    </th>
                    <th className={`${COMPONENT_STYLES.table.headerCell} w-[128px] min-w-[128px] text-center`}>
                      <div className="flex items-center justify-center gap-2">
                        <Calculator className="h-4 w-4 text-zinc-500" />
                        Total
                      </div>
                    </th>
                    <th className={`${COMPONENT_STYLES.table.headerCell} w-[140px] min-w-[140px] text-center`}>Situación</th>
                    <th className={`${COMPONENT_STYLES.table.headerCell} w-[140px] min-w-[140px] text-center`}>
                      <div className="flex items-center justify-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-zinc-500" />
                        Disponibilidad
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {registrosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={mesesDelAnio.length + 6} className="px-6 py-16 text-center">
                        <div className="mx-auto flex max-w-md flex-col items-center">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-300">
                            <Warning className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-semibold text-zinc-700">No hay datos ICI DEMID para los filtros seleccionados</p>
                          <p className="mt-1 text-sm text-zinc-500">Ajusta los filtros para visualizar la importación en una vista optimizada.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    registrosFiltrados.map((registro) => {
                      const estilo = getEstiloEstablecimiento(registro.establecimiento);
                      return (
                        <tr key={registro.id} className={`transition-colors ${estilo.colores.bg} hover:bg-zinc-50/50`}>
                          <td className={`sticky left-0 z-10 border-r border-white/60 px-4 py-3 shadow-[8px_0_14px_-12px_rgba(15,23,42,0.12)] ${estilo.colores.bg}`}>
                            <div className="flex items-start gap-3">
                              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-zinc-500 ring-2 ring-white/80" />
                              <div className="min-w-0">
                                <p className={`truncate text-sm font-semibold ${estilo.colores.text}`}>{registro.establecimiento.nombre}</p>
                                <p className="mt-1 text-xs text-zinc-500">{registro.establecimiento.codigo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-zinc-700">{registro.vacuna.nombre}</td>
                          {mesesDelAnio.map((month) => (
                            <td key={`${registro.id}-${month}`} className="px-3 py-3 text-center text-sm font-semibold text-zinc-700 tabular-nums">
                              {(registro.distribucionMensual[month - 1] || 0).toLocaleString()}
                            </td>
                          ))}
                          <td className="px-3 py-3 text-center text-sm font-semibold text-cyan-800">{registro.stockFin.toLocaleString()}</td>
                          <td className="px-3 py-3 text-center text-sm font-semibold text-zinc-800">{registro.totalDistribu.toLocaleString()}</td>
                          <td className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-zinc-600">{registro.situacion || '-'}</td>
                          <td className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-zinc-600">{registro.disponibilidad || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-2.5 md:hidden">
              {registrosFiltrados.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center py-10">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-300">
                    <Warning className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-800">No hay registros ICI DEMID</p>
                  <p className="mt-1 text-xs text-zinc-500">Ajusta los filtros para ver la tabla autoajustada.</p>
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
 