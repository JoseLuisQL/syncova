import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  WarningCircle,
  CheckCircle,
  FileXls,
  Info,
  SpinnerGap,
  Package,
  ArrowsClockwise,
  FloppyDisk,
  Syringe,
} from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import { ProgramacionAnualCenaresService } from '../../../../services/programacionAnualCenaresService';
import { ProgramacionSeguimientoAnualExportService } from '../../../../services/programacionSeguimientoAnualExportService';
import { COLORS, COMPONENT_STYLES } from '../../constants';
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
  centroAcopioId?: string;
  tipoItem?: string;
}

const TRIMESTRES = ['q1', 'q2', 'q3', 'q4'] as const;
const TRIMESTRE_LABELS = {
  q1: '1° Trim',
  q2: '2° Trim',
  q3: '3° Trim',
  q4: '4° Trim',
};

const CenaresTable: React.FC<CenaresTableProps> = memo(({ anio, tipoItem = 'todos' }) => {
  const [items, setItems] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, number>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmSync, setShowConfirmSync] = useState(false);
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

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

  const filteredItems = useMemo(
    () => items.filter((item) => tipoItem === 'todos' || item.tipo === tipoItem),
    [items, tipoItem],
  );

  const stats = useMemo(() => {
    const vacunas = filteredItems.filter((item) => item.tipo === 'vacuna').length;
    const jeringas = filteredItems.filter((item) => item.tipo === 'jeringa').length;
    const totalProgramado = filteredItems.reduce(
      (acc, item) => acc + item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4,
      0,
    );
    const totalEntregado = filteredItems.reduce(
      (acc, item) => acc + item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4,
      0,
    );

    return { vacunas, jeringas, totalProgramado, totalEntregado };
  }, [filteredItems]);

  const getFieldKey = (itemIndex: number, trimestre: string) => `${itemIndex}-${trimestre}`;

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

  const saveValue = useCallback(async (itemIndex: number, trimestre: string, value: number) => {
    const key = getFieldKey(itemIndex, trimestre);
    const item = filteredItems[itemIndex];
    if (!item) return;

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
      toast.error('Error al guardar');
    } finally {
      setIsUpdating(false);
    }
  }, [anio, filteredItems]);

  const handleValueChange = useCallback((itemIndex: number, trimestre: string, value: number) => {
    const key = getFieldKey(itemIndex, trimestre);
    setTempValues((prev) => ({ ...prev, [key]: value }));
    setPendingChanges((prev) => ({ ...prev, [key]: true }));

    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
    }

    debounceTimeouts.current[key] = setTimeout(() => {
      void saveValue(itemIndex, trimestre, value);
    }, 1500);
  }, [saveValue]);

  const handleBlur = useCallback((itemIndex: number, trimestre: string) => {
    const key = getFieldKey(itemIndex, trimestre);
    if (tempValues[key] !== undefined && pendingChanges[key]) {
      void saveValue(itemIndex, trimestre, tempValues[key]);
    }
  }, [pendingChanges, saveValue, tempValues]);

  const getCurrentValue = (itemIndex: number, trimestre: string) => {
    const key = getFieldKey(itemIndex, trimestre);
    if (tempValues[key] !== undefined) return tempValues[key];

    const item = filteredItems[itemIndex];
    return (item?.programacion?.[trimestre as 'q1'|'q2'|'q3'|'q4'] as number) || 0;
  };

  const isPending = (itemIndex: number, trimestre: string) => pendingChanges[getFieldKey(itemIndex, trimestre)] || false;

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
      toast.success(`Saldos sincronizados: ${resultado.saldosCalculados} items actualizados`);
      await loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al sincronizar saldos');
    } finally {
      setIsSyncing(false);
      setShowConfirmSync(false);
    }
  }, [anio, loadData]);

  if (loading) {
    return (
      <div className={COMPONENT_STYLES.card}>
        <div className="flex flex-col items-center justify-center py-16">
          <div className={`mb-4 rounded-full bg-gradient-to-br ${COLORS.primary.gradient} p-4`}>
            <SpinnerGap weight="bold" className="h-6 w-6 animate-spin text-white" />
          </div>
          <p className="font-medium text-zinc-900">Cargando programación {anio}...</p>
          <p className="mt-2 text-sm text-zinc-500">Preparando el tablero trimestral y los saldos.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={COMPONENT_STYLES.card}>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-rose-100 p-4">
            <WarningCircle weight="duotone" className="h-6 w-6 text-rose-600" />
          </div>
          <p className="mb-2 font-medium text-zinc-900">Error al cargar datos</p>
          <p className="mb-4 text-sm text-zinc-500">{error}</p>
          <button type="button" onClick={() => void loadData()} className={COMPONENT_STYLES.button.primary}>
            <ArrowsClockwise className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={COMPONENT_STYLES.card}>
      <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50/80 via-zinc-50/60 to-white px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl bg-gradient-to-br ${COLORS.primary.gradient} p-2.5 shadow-sm ${COLORS.primary.shadow}`}>
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-950">Programación CENARES {anio}</h3>
              <p className="text-xs text-zinc-500">{stats.vacunas} vacunas, {stats.jeringas} jeringas</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isUpdating ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <SpinnerGap weight="bold" className="h-3.5 w-3.5 animate-spin text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Guardando...</span>
              </div>
            ) : Object.keys(pendingChanges).length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Guardado</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setShowConfirmSync(true)}
              disabled={isSyncing}
              className={COMPONENT_STYLES.button.secondary}
            >
              {isSyncing ? <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" /> : <ArrowsClockwise className="h-4 w-4" />}
              <span className="hidden sm:inline">Sincronizar saldos</span>
              <span className="sm:hidden">Sincronizar</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || filteredItems.length === 0}
              className={COMPONENT_STYLES.button.primary}
            >
              {isExporting ? <SpinnerGap weight="bold" className="h-4 w-4 animate-spin" /> : <FileXls weight="duotone" className="h-4 w-4" />}
              <span className="hidden sm:inline">Exportar Excel</span>
              <span className="sm:hidden">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="max-h-[620px] overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[1600px] border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="border-y border-[#e7e7ef] bg-[#fbfafd] text-[#8b8f9b]">
                <th className="sticky left-0 z-30 min-w-[220px] border-r border-[#e7e7ef] bg-[#fbfafd] px-4 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em]">
                  Item
                </th>
                <th className="sticky left-[220px] z-30 min-w-[90px] border-r border-[#e7e7ef] bg-[#fbfafd] px-3 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em]">
                  Saldo {anio - 1}
                </th>
                {TRIMESTRES.map((quarter) => (
                  <th
                    key={quarter}
                    colSpan={5}
                    className="border-y border-r border-[#e7e7ef] bg-[#fbfafd] px-2 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#606571]"
                  >
                    {TRIMESTRE_LABELS[quarter]}
                  </th>
                ))}
                <th colSpan={3} className="border-y border-[#e7e7ef] bg-[#fbfafd] px-2 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#606571]">
                  Totales
                </th>
              </tr>

              <tr className="border-b border-[#eeeef3] bg-white font-medium text-[#8b8f9b]">
                <th className="sticky left-0 z-30 border-r border-[#e7e7ef] bg-white" />
                <th className="sticky left-[220px] z-30 border-r border-[#e7e7ef] bg-white" />
                {TRIMESTRES.map((quarter) => (
                  <React.Fragment key={`sub-${quarter}`}>
                    <th className="px-2 py-2 text-[0.65rem] tracking-wider whitespace-nowrap">Prog.</th>
                    <th className="px-2 py-2 text-[0.65rem] tracking-wider whitespace-nowrap">Entreg.</th>
                    <th className="px-2 py-2 text-[0.65rem] tracking-wider whitespace-nowrap">Dif.</th>
                    <th className="px-2 py-2 text-[0.65rem] tracking-wider whitespace-nowrap">Cons.</th>
                    <th className="border-r border-zinc-200 px-2 py-2 text-[0.65rem] tracking-wider whitespace-nowrap">Saldo</th>
                  </React.Fragment>
                ))}
                <th className="px-2 py-2 text-[0.65rem] tracking-wider whitespace-nowrap">Prog.</th>
                <th className="px-2 py-2 text-[0.65rem] tracking-wider whitespace-nowrap">Entreg.</th>
                <th className="px-2 py-2 text-[0.65rem] tracking-wider whitespace-nowrap">Dif.</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {filteredItems.map((item, index) => {
                const totalProg = item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4;
                const totalEntr = item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4;
                const totalDif = totalProg - totalEntr;

                return (
                  <tr key={item.id} className="group border-b border-[#eeeef3] transition-colors hover:bg-[#fbfafd]">
                    <td className="sticky left-0 z-10 border-r border-[#e7e7ef] bg-white px-4 py-3 shadow-sm transition-colors group-hover:bg-[#fbfafd]">
                      <div className="flex items-center gap-2">
                        <span className={`flex-shrink-0 rounded p-1.5 ${item.tipo === 'vacuna' ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-100 text-zinc-700'}`}>
                          {item.tipo === 'vacuna' ? <Package className="h-3.5 w-3.5" /> : <Syringe weight="duotone" className="h-3.5 w-3.5" />}
                        </span>
                        <span className="max-w-[160px] truncate text-sm font-medium text-zinc-900" title={item.descripcion}>
                          {item.descripcion}
                        </span>
                      </div>
                    </td>

                    <td className="sticky left-[220px] z-10 border-r border-[#e7e7ef] bg-[#fbfafd] px-3 py-3 text-center text-sm font-semibold text-[#15171d] shadow-sm transition-colors group-hover:bg-[#fbfafd]">
                      {item.saldoAnterior.toLocaleString()}
                    </td>

                    {TRIMESTRES.map((quarter) => {
                      const prog = getCurrentValue(index, quarter);
                      const entr = item.entregas[quarter];
                      const dif = prog - entr;
                      const cons = item.consumo[quarter];
                      const saldo = item.saldos[quarter];
                      const pending = isPending(index, quarter);

                      return (
                        <React.Fragment key={`${item.id}-${quarter}`}>
                          <td className="px-1 py-2 text-center">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                value={prog}
                                onChange={(event) => handleValueChange(index, quarter, parseInt(event.target.value, 10) || 0)}
                                onBlur={() => handleBlur(index, quarter)}
                                disabled={isUpdating}
                                className={`w-16 rounded-md border px-2 py-1.5 text-center text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100 ${
                                  pending ? 'border-amber-400 bg-amber-50' : 'border-zinc-200 hover:border-zinc-300'
                                }`}
                              />
                              {pending ? <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> : null}
                            </div>
                          </td>
                          <td className="px-1 py-2 text-center text-xs font-medium whitespace-nowrap text-zinc-700">{entr.toLocaleString()}</td>
                          <td className={`px-1 py-2 text-center text-xs font-semibold whitespace-nowrap ${dif >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            <span className={`rounded px-1.5 py-0.5 ${dif >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                              {dif >= 0 ? '+' : ''}{dif.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-1 py-2 text-center text-xs whitespace-nowrap text-zinc-600">{cons.toLocaleString()}</td>
                          <td className={`border-r border-zinc-200 px-1 py-2 text-center text-xs font-semibold whitespace-nowrap ${saldo >= 0 ? 'text-zinc-700' : 'text-rose-700'}`}>
                            {saldo.toLocaleString()}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    <td className="bg-zinc-50 px-2 py-2 text-center text-xs font-bold whitespace-nowrap text-zinc-900">{totalProg.toLocaleString()}</td>
                    <td className="bg-zinc-50 px-2 py-2 text-center text-xs font-bold whitespace-nowrap text-zinc-900">{totalEntr.toLocaleString()}</td>
                    <td className={`bg-zinc-50 px-2 py-2 text-center text-xs font-bold whitespace-nowrap ${totalDif >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      <span className={`rounded px-1.5 py-0.5 ${totalDif >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                        {totalDif >= 0 ? '+' : ''}{totalDif.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-200 via-zinc-200 to-zinc-200 opacity-50" />
      </div>

      <div className="border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Package className="h-4 w-4 text-zinc-600" />
              <strong className="text-zinc-900">{filteredItems.length}</strong> items
            </span>
            <span className="text-zinc-300">|</span>
            <span>Total programado: <strong className="text-zinc-700">{stats.totalProgramado.toLocaleString()}</strong></span>
            <span className="text-zinc-300">|</span>
            <span>Total entregado: <strong className="text-zinc-700">{stats.totalEntregado.toLocaleString()}</strong></span>
          </div>

          <div className="flex items-center gap-2 rounded-md bg-white border border-zinc-200 px-2 py-1 shadow-sm text-xs text-zinc-500 font-medium">
            <Info className="h-4 w-4 text-zinc-400" />
            <span>Auto-guardado activo</span>
            <FloppyDisk className="h-4 w-4 text-zinc-500" />
          </div>
        </div>
      </div>

      <ActionConfirmationDialog
        isOpen={showConfirmSync}
        title="Sincronizar saldos anteriores"
        description={`Se recalcularán los saldos del año ${anio - 1} para actualizar el saldo base de ${anio}. Usa esta acción cuando confirmes que el histórico ya está completo.`}
        onConfirm={confirmSyncSaldos}
        onClose={() => setShowConfirmSync(false)}
        confirmLabel="Sincronizar"
        isLoading={isSyncing}
      />
    </div>
  );
});

CenaresTable.displayName = 'CenaresTable';

export default CenaresTable;
