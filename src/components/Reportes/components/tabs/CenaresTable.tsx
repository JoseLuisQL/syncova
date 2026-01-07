import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { 
  Loader2, 
  Save, 
  AlertCircle, 
  Package, 
  Syringe, 
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ProgramacionAnualCenaresService } from '../../../../services/programacionAnualCenaresService';
import { ProgramacionSeguimientoAnualExportService } from '../../../../services/programacionSeguimientoAnualExportService';
import { toast } from 'react-hot-toast';
import { COMPONENT_STYLES, COLORS } from '../../constants';

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
  q4: '4° Trim'
};

const CenaresTable: React.FC<CenaresTableProps> = memo(({ 
  anio, 
  tipoItem = 'todos' 
}) => {
  const [items, setItems] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, number>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProgramacionAnualCenaresService.getDatosTablaCompleta(anio);
      setItems(data.items || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(errorMessage);
      toast.error('Error al cargar datos de programacion');
    } finally {
      setLoading(false);
    }
  }, [anio]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (tipoItem !== 'todos' && item.tipo !== tipoItem) return false;
      return true;
    });
  }, [items, tipoItem]);

  // Estadisticas
  const stats = useMemo(() => {
    const vacunas = filteredItems.filter(i => i.tipo === 'vacuna').length;
    const jeringas = filteredItems.filter(i => i.tipo === 'jeringa').length;
    const totalProgramado = filteredItems.reduce((acc, item) => 
      acc + item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4, 0
    );
    const totalEntregado = filteredItems.reduce((acc, item) => 
      acc + item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4, 0
    );
    return { vacunas, jeringas, totalProgramado, totalEntregado };
  }, [filteredItems]);

  // Manejar cambios de valor
  const getFieldKey = (itemIndex: number, trimestre: string) => `${itemIndex}-${trimestre}`;

  const handleValueChange = useCallback((itemIndex: number, trimestre: string, value: number) => {
    const key = getFieldKey(itemIndex, trimestre);
    setTempValues(prev => ({ ...prev, [key]: value }));
    setPendingChanges(prev => ({ ...prev, [key]: true }));

    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
    }

    debounceTimeouts.current[key] = setTimeout(() => {
      saveValue(itemIndex, trimestre, value);
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        value
      );

      // Actualizar estado local
      setItems(prev => {
        const updated = [...prev];
        const realIndex = prev.findIndex(i => i.id === item.id);
        if (realIndex >= 0) {
          updated[realIndex] = {
            ...updated[realIndex],
            programacion: { ...updated[realIndex].programacion, [trimestre]: value }
          };
          // Recalcular saldos
          const saldos = calculateSaldos(
            updated[realIndex].saldoAnterior,
            updated[realIndex].entregas,
            updated[realIndex].consumo
          );
          updated[realIndex].saldos = saldos;
        }
        return updated;
      });

      setTempValues(prev => { const n = { ...prev }; delete n[key]; return n; });
      setPendingChanges(prev => { const n = { ...prev }; delete n[key]; return n; });
      
    } catch {
      toast.error('Error al guardar');
    } finally {
      setIsUpdating(false);
    }
  }, [filteredItems, anio]);

  const handleBlur = useCallback((itemIndex: number, trimestre: string) => {
    const key = getFieldKey(itemIndex, trimestre);
    if (tempValues[key] !== undefined && pendingChanges[key]) {
      saveValue(itemIndex, trimestre, tempValues[key]);
    }
  }, [tempValues, pendingChanges, saveValue]);

  const calculateSaldos = (saldoAnterior: number, entregas: TableItem['entregas'], consumo: TableItem['consumo']) => {
    const q1 = saldoAnterior + entregas.q1 - consumo.q1;
    const q2 = q1 + entregas.q2 - consumo.q2;
    const q3 = q2 + entregas.q3 - consumo.q3;
    const q4 = q3 + entregas.q4 - consumo.q4;
    return { q1, q2, q3, q4 };
  };

  const getCurrentValue = (itemIndex: number, trimestre: string): number => {
    const key = getFieldKey(itemIndex, trimestre);
    if (tempValues[key] !== undefined) return tempValues[key];
    const item = filteredItems[itemIndex];
    return item?.programacion?.[trimestre as keyof typeof item.programacion] || 0;
  };

  const isPending = (itemIndex: number, trimestre: string): boolean => {
    return pendingChanges[getFieldKey(itemIndex, trimestre)] || false;
  };

  // Exportar
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
        `Programacion y Seguimiento Anual CENARES - ${anio}`
      );
      await ProgramacionSeguimientoAnualExportService.exportarYDescargar(config);
      toast.success('Exportacion completada');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al exportar';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [anio, filteredItems.length]);

  // Estado de carga
  if (loading) {
    return (
      <div className={COMPONENT_STYLES.card}>
        <div className="flex flex-col items-center justify-center py-16">
          <div className={`p-4 rounded-full bg-gradient-to-br ${COLORS.primary.gradient} mb-4`}>
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Cargando programacion {anio}...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={COMPONENT_STYLES.card}>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-rose-100 mb-4">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <p className="text-gray-900 font-medium mb-2">Error al cargar datos</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button onClick={loadData} className={COMPONENT_STYLES.button.primary}>
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={COMPONENT_STYLES.card}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-cyan-50/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${COLORS.primary.gradient}`}>
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Programacion CENARES {anio}
              </h3>
              <p className="text-xs text-gray-500">
                {stats.vacunas} vacunas, {stats.jeringas} jeringas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Indicador de guardado */}
            {isUpdating ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Guardando...</span>
              </div>
            ) : Object.keys(pendingChanges).length === 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Guardado</span>
              </div>
            )}

            {/* Boton exportar */}
            <button
              onClick={handleExport}
              disabled={isExporting || filteredItems.length === 0}
              className={COMPONENT_STYLES.button.primary}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla con scroll profesional */}
      <div className="relative">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="w-full min-w-[1600px] border-collapse">
            <thead className="sticky top-0 z-20">
              {/* Encabezado principal */}
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 z-30 bg-slate-700 min-w-[220px] border-r border-slate-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                  Item
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider sticky left-[220px] z-30 bg-slate-700 min-w-[90px] border-r border-slate-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                  Saldo {anio - 1}
                </th>
                {TRIMESTRES.map(q => (
                  <th 
                    key={q} 
                    colSpan={5} 
                    className={`px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider border-r border-slate-500 ${
                      q === 'q1' ? 'bg-teal-600' :
                      q === 'q2' ? 'bg-cyan-600' :
                      q === 'q3' ? 'bg-emerald-600' :
                      'bg-blue-600'
                    }`}
                  >
                    {TRIMESTRE_LABELS[q]}
                  </th>
                ))}
                <th colSpan={3} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-slate-600">
                  Totales
                </th>
              </tr>

              {/* Sub-encabezados */}
              <tr className="bg-slate-600 text-white text-[10px]">
                <th className="sticky left-0 z-30 bg-slate-600 border-r border-slate-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]"></th>
                <th className="sticky left-[220px] z-30 bg-slate-600 border-r border-slate-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]"></th>
                {TRIMESTRES.map(q => (
                  <React.Fragment key={`sub-${q}`}>
                    <th className="px-2 py-2 font-medium whitespace-nowrap">Prog.</th>
                    <th className="px-2 py-2 font-medium whitespace-nowrap">Entreg.</th>
                    <th className="px-2 py-2 font-medium whitespace-nowrap">Dif.</th>
                    <th className="px-2 py-2 font-medium whitespace-nowrap">Cons.</th>
                    <th className="px-2 py-2 font-medium whitespace-nowrap border-r border-slate-500">Saldo</th>
                  </React.Fragment>
                ))}
                <th className="px-2 py-2 font-medium whitespace-nowrap">Prog.</th>
                <th className="px-2 py-2 font-medium whitespace-nowrap">Entreg.</th>
                <th className="px-2 py-2 font-medium whitespace-nowrap">Dif.</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredItems.map((item, idx) => {
                const totalProg = item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4;
                const totalEntr = item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4;
                const totalDif = totalProg - totalEntr;

                return (
                  <tr key={item.id} className="hover:bg-teal-50/30 transition-colors group">
                    {/* Item - Sticky */}
                    <td className="px-4 py-3 sticky left-0 z-10 bg-white group-hover:bg-teal-50/30 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded flex-shrink-0 ${
                          item.tipo === 'vacuna' 
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {item.tipo === 'vacuna' ? <Package className="h-3.5 w-3.5" /> : <Syringe className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[160px]" title={item.descripcion}>
                          {item.descripcion}
                        </span>
                      </div>
                    </td>

                    {/* Saldo anterior - Sticky */}
                    <td className="px-3 py-3 text-center text-sm font-semibold text-gray-700 sticky left-[220px] z-10 bg-gray-50 group-hover:bg-teal-50/50 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                      {item.saldoAnterior.toLocaleString()}
                    </td>

                    {/* Trimestres */}
                    {TRIMESTRES.map(q => {
                      const prog = getCurrentValue(idx, q);
                      const entr = item.entregas[q];
                      const dif = prog - entr;
                      const cons = item.consumo[q];
                      const saldo = item.saldos[q];
                      const pending = isPending(idx, q);

                      return (
                        <React.Fragment key={`${item.id}-${q}`}>
                          {/* Programado (editable) */}
                          <td className="px-1 py-2 text-center">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                value={prog}
                                onChange={e => handleValueChange(idx, q, parseInt(e.target.value) || 0)}
                                onBlur={() => handleBlur(idx, q)}
                                disabled={isUpdating}
                                className={`w-16 px-2 py-1.5 text-center text-xs font-medium border rounded-md 
                                  focus:outline-none focus:ring-1 focus:ring-teal-500 
                                  disabled:bg-gray-100 disabled:cursor-not-allowed
                                  ${pending ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-teal-300'}
                                `}
                              />
                              {pending && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                              )}
                            </div>
                          </td>

                          {/* Entregado */}
                          <td className="px-1 py-2 text-center text-xs text-gray-700 font-medium whitespace-nowrap">
                            {entr.toLocaleString()}
                          </td>

                          {/* Diferencia */}
                          <td className={`px-1 py-2 text-center text-xs font-semibold whitespace-nowrap ${
                            dif >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            <span className={`px-1.5 py-0.5 rounded ${
                              dif >= 0 ? 'bg-emerald-50' : 'bg-rose-50'
                            }`}>
                              {dif >= 0 ? '+' : ''}{dif.toLocaleString()}
                            </span>
                          </td>

                          {/* Consumido */}
                          <td className="px-1 py-2 text-center text-xs text-gray-600 whitespace-nowrap">
                            {cons.toLocaleString()}
                          </td>

                          {/* Saldo */}
                          <td className={`px-1 py-2 text-center text-xs font-semibold border-r border-gray-200 whitespace-nowrap ${
                            saldo >= 0 ? 'text-teal-700' : 'text-rose-700'
                          }`}>
                            {saldo.toLocaleString()}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* Totales */}
                    <td className="px-2 py-2 text-center text-xs font-bold text-gray-900 bg-gray-50/80 whitespace-nowrap">
                      {totalProg.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-center text-xs font-bold text-gray-900 bg-gray-50/80 whitespace-nowrap">
                      {totalEntr.toLocaleString()}
                    </td>
                    <td className={`px-2 py-2 text-center text-xs font-bold bg-gray-50/80 whitespace-nowrap ${
                      totalDif >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      <span className={`px-1.5 py-0.5 rounded ${
                        totalDif >= 0 ? 'bg-emerald-50' : 'bg-rose-50'
                      }`}>
                        {totalDif >= 0 ? '+' : ''}{totalDif.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Indicador de scroll */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-200 via-cyan-200 to-teal-200 opacity-50"></div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-teal-50/30">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-teal-600" />
              <strong className="text-gray-900">{filteredItems.length}</strong> items
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Total programado: <strong className="text-teal-700">{stats.totalProgramado.toLocaleString()}</strong>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Total entregado: <strong className="text-cyan-700">{stats.totalEntregado.toLocaleString()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="h-3.5 w-3.5" />
            <span>Auto-guardado activo</span>
            <Save className="h-3.5 w-3.5 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
});

CenaresTable.displayName = 'CenaresTable';

export default CenaresTable;
