import React, { useState, useRef, useEffect } from 'react';
import { SpinnerGap, FloppyDisk, WarningCircle, Package, Syringe, FileXls, DownloadSimple, ArrowsLeftRight } from '@phosphor-icons/react';
import { ProgramacionAnualCenaresService } from '../../services/programacionAnualCenaresService';
import { ProgramacionSeguimientoAnualExportService } from '../../services/programacionSeguimientoAnualExportService';
import { toast } from 'react-hot-toast';

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

interface ProgramacionSeguimientoAnualTableProps {
  anio: number;
  onDataChange?: () => void;
}

const ProgramacionSeguimientoAnualTable: React.FC<ProgramacionSeguimientoAnualTableProps> = ({
  anio,
  onDataChange
}) => {
  const [items, setItems] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: number }>({});
  const [pendingChanges, setPendingChanges] = useState<{ [key: string]: boolean }>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const debounceTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Load data when component mounts or year changes
  useEffect(() => {
    loadData();
  }, [anio]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ProgramacionAnualCenaresService.getDatosTablaCompleta(anio);
      setItems(data.items || []);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      setError(error.message || 'Error al cargar datos');
      toast.error('Error al cargar datos de programación');
    } finally {
      setLoading(false);
    }
  };

  // Generate field key for tracking changes
  const getFieldKey = (itemIndex: number, trimestre: string) => {
    return `${itemIndex}-${trimestre}`;
  };

  // Handle temporary value changes (onChange)
  const handleTempValueChange = (itemIndex: number, trimestre: string, newValue: number) => {
    const key = getFieldKey(itemIndex, trimestre);

    // Update temporary value
    setTempValues(prev => ({
      ...prev,
      [key]: newValue
    }));

    // Mark as pending change
    setPendingChanges(prev => ({
      ...prev,
      [key]: true
    }));

    // Clear previous timeout if exists
    if (debounceTimeouts.current[key]) {
      clearTimeout(debounceTimeouts.current[key]);
    }

    // Set new timeout for auto-save after 2 seconds of inactivity
    debounceTimeouts.current[key] = setTimeout(() => {
      handleSaveFieldValue(itemIndex, trimestre, newValue);
    }, 2000);
  };

  // FloppyDisk individual field value
  const handleSaveFieldValue = async (itemIndex: number, trimestre: string, value: number) => {
    const key = getFieldKey(itemIndex, trimestre);
    const item = items[itemIndex];

    if (!item) return;

    try {
      setIsUpdating(true);

      // Clear timeout if exists
      if (debounceTimeouts.current[key]) {
        clearTimeout(debounceTimeouts.current[key]);
        delete debounceTimeouts.current[key];
      }

      // Update in backend
      await ProgramacionAnualCenaresService.updateProgramacionTrimestral(
        item.id,
        item.tipo,
        anio,
        trimestre as 'q1' | 'q2' | 'q3' | 'q4',
        value
      );

      // Update local state
      const updatedItems = [...items];
      updatedItems[itemIndex] = {
        ...item,
        programacion: {
          ...item.programacion,
          [trimestre]: value
        }
      };

      // Recalculate saldos for this item
      const saldos = calculateSaldosSecuenciales(
        item.saldoAnterior,
        item.entregas,
        item.consumo,
        updatedItems[itemIndex].programacion
      );
      updatedItems[itemIndex].saldos = saldos;

      setItems(updatedItems);

      // Clear temporary state
      setTempValues(prev => {
        const newTemp = { ...prev };
        delete newTemp[key];
        return newTemp;
      });

      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });

      // Notify parent component
      if (onDataChange) {
        onDataChange();
      }

    } catch (error: any) {
      console.error('Error al guardar campo:', error);
      toast.error('Error al guardar cambio');
      // Keep temporary value for user to retry
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle field blur
  const handleFieldBlur = (itemIndex: number, trimestre: string) => {
    const key = getFieldKey(itemIndex, trimestre);
    const tempValue = tempValues[key];

    if (tempValue !== undefined && pendingChanges[key]) {
      handleSaveFieldValue(itemIndex, trimestre, tempValue);
    }
  };

  // Calculate sequential saldos
  const calculateSaldosSecuenciales = (
    saldoAnterior: number,
    entregas: any,
    consumo: any,
    _programacion: any
  ) => {
    const saldoQ1 = saldoAnterior + entregas.q1 - consumo.q1;
    const saldoQ2 = saldoQ1 + entregas.q2 - consumo.q2;
    const saldoQ3 = saldoQ2 + entregas.q3 - consumo.q3;
    const saldoQ4 = saldoQ3 + entregas.q4 - consumo.q4;

    return {
      q1: saldoQ1,
      q2: saldoQ2,
      q3: saldoQ3,
      q4: saldoQ4
    };
  };

  // Get current value (temporary or actual)
  const getCurrentValue = (itemIndex: number, trimestre: string): number => {
    const key = getFieldKey(itemIndex, trimestre);
    const tempValue = tempValues[key];
    
    if (tempValue !== undefined) {
      return tempValue;
    }
    
    const item = items[itemIndex];
    return (item?.programacion?.[trimestre as 'q1'|'q2'|'q3'|'q4'] as number) || 0;
  };

  // Check if field has pending changes
  const isPending = (itemIndex: number, trimestre: string): boolean => {
    const key = getFieldKey(itemIndex, trimestre);
    return pendingChanges[key] || false;
  };

  // Handle export functionality
  const handleExportarExcel = async () => {
    try {
      setIsExporting(true);

      // Verificar que hay datos para exportar
      if (!items || items.length === 0) {
        toast.error('No hay datos disponibles para exportar');
        return;
      }

      // Crear configuración de exportación
      const config = ProgramacionSeguimientoAnualExportService.crearConfiguracionDesdeFiltros(
        anio,
        'Usuario del Sistema',
        `Reporte generado desde el módulo de Programación y Seguimiento Anual CENARES - Año ${anio}`
      );

      // Validar configuración
      const errores = ProgramacionSeguimientoAnualExportService.validarConfiguracion(config);
      if (errores.length > 0) {
        toast.error(`Error en la configuración: ${errores[0]}`);
        return;
      }

      // Exportar y descargar
      await ProgramacionSeguimientoAnualExportService.exportarYDescargar(config);

      toast.success('Exportación completada exitosamente');

    } catch (error: any) {
      console.error('Error al exportar:', error);
      toast.error(error.message || 'Error al exportar el reporte');
    } finally {
      setIsExporting(false);
    }
  };

  // Render quarter columns
  const renderQuarterColumns = (item: TableItem, itemIndex: number, quarter: string, _color: string) => {
    const currentValue = getCurrentValue(itemIndex, quarter);
    const isPendingChange = isPending(itemIndex, quarter);
    const entregado = item.entregas[quarter as keyof typeof item.entregas];
    const diferencia = currentValue - entregado;
    const consumido = item.consumo[quarter as keyof typeof item.consumo];
    const saldo = item.saldos[quarter as keyof typeof item.saldos];

    return (
      <React.Fragment>
        {/* Programado (Editable) */}
        <td className="px-3 py-3 text-right align-middle font-medium tabular-nums text-zinc-900 border-x border-zinc-200 bg-white">
          <div className="flex justify-end relative">
            <input
              type="number"
              min="0"
              value={currentValue}
              onChange={(e) => handleTempValueChange(itemIndex, quarter, parseInt(e.target.value) || 0)}
              onBlur={() => handleFieldBlur(itemIndex, quarter)}
              disabled={isUpdating}
              className={`w-20 px-2 py-1 text-right text-[0.85rem] tabular-nums tracking-tight border rounded-md focus:outline-none focus:ring-1 focus:border-transparent transition-all disabled:opacity-50 ${
                isPendingChange
                  ? 'border-amber-400 bg-amber-50 focus:ring-amber-500'
                  : 'border-zinc-300 hover:border-zinc-400 focus:ring-teal-500 bg-white'
              }`}
              title={isPendingChange ? 'Cambios pendientes - Se guardará automáticamente' : ''}
            />
            {isPendingChange && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-sm"></div>
            )}
          </div>
        </td>

        {/* Entregado (CENARES) - Read Only */}
        <td className="px-3 py-3 text-[0.85rem] text-right text-zinc-600 font-medium tabular-nums tracking-tight align-middle border-r border-zinc-100">
            {entregado.toLocaleString()}
        </td>

        {/* Diferencia - Calculated */}
        <td className={`px-3 py-3 text-[0.85rem] text-right tabular-nums tracking-tight font-semibold align-middle border-r border-zinc-200 ${
          diferencia >= 0 ? 'text-zinc-900' : 'text-rose-600'
        }`}>
            {diferencia > 0 ? `+${diferencia.toLocaleString()}` : diferencia.toLocaleString()}
        </td>

        {/* Consumido - Read Only */}
        <td className="px-3 py-3 text-[0.85rem] text-right text-zinc-600 font-medium tabular-nums tracking-tight align-middle border-r border-zinc-100">
            {consumido.toLocaleString()}
        </td>

        {/* Saldo - Calculated */}
        <td className={`px-3 py-3 text-[0.85rem] text-right tabular-nums tracking-tight font-bold align-middle border-r border-zinc-200 ${
          saldo >= 0 ? 'text-zinc-900' : 'text-rose-600'
        }`}>
            {saldo.toLocaleString()}
        </td>
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xl">
        <div className="flex flex-col justify-center items-center py-16">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <SpinnerGap weight="bold" className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Cargando Programación Anual</h3>
          <p className="text-zinc-600">Obteniendo datos de programación y seguimiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xl">
        <div className="flex flex-col items-center py-16">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <WarningCircle weight="duotone" className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">Error al cargar datos</h3>
          <p className="text-zinc-600 mb-6 text-center max-w-md">{error}</p>
          <button type="button"
            onClick={loadData}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Package className="h-4 w-4 mr-2" />
            Reintentar carga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#e7e7ef] bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]">
      {/* Header Minimal */}
      <div className="border-b border-[#eeeef3] bg-white px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center rounded-xl bg-teal-100 p-2">
              <Package className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900 leading-none">
                CENARES {anio}
              </h3>
              <p className="text-[0.8rem] text-zinc-500 mt-1">
                Matriz de programación y seguimiento trimestral con autoguardado.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Export Button */}
            <button type="button"
              onClick={handleExportarExcel}
              disabled={isExporting || loading || items.length === 0}
              className="flex items-center rounded-[10px] border border-[#e7e7ef] bg-white px-4 py-2 text-sm font-semibold text-[#15171d] shadow-sm transition-colors hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:ring-2 focus:ring-[#dedfea]/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <SpinnerGap weight="bold" className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <FileXls weight="duotone" className="mr-2 h-4 w-4 text-teal-600" />
                  Descargar MS Excel
                </>
              )}
            </button>

            {isUpdating && (
              <div className="flex items-center text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm">
                <SpinnerGap weight="bold" className="h-[14px] w-[14px] animate-spin mr-1.5" />
                <span className="text-[0.75rem] font-medium tracking-tight">Guardando datos...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 md:hidden">
        <ArrowsLeftRight className="h-3.5 w-3.5" weight="bold" />
        <span>Desliza horizontalmente para ver todas las columnas</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 md:border-0">
        <table className="w-full min-w-[1400px]">
          <thead className="bg-[#fbfafd]">
            <tr>
              <th className="sticky left-0 z-10 border-r border-[#e7e7ef] bg-[#fbfafd] px-4 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Descripción del Ítem
                </div>
              </th>
              <th className="border-r border-[#e7e7ef] bg-[#fbfafd] px-3 py-3 text-right text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]">
                Saldo {anio - 1}
              </th>
              {/* Q1 Columns */}
              <th colSpan={5} className="border-r border-[#e7e7ef] bg-[#fbfafd] px-3 py-2 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#606571]">
                1° Trimestre
              </th>
              {/* Q2 Columns */}
              <th colSpan={5} className="border-r border-[#e7e7ef] bg-[#fbfafd] px-3 py-2 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#606571]">
                2° Trimestre
              </th>
              {/* Q3 Columns */}
              <th colSpan={5} className="border-r border-[#e7e7ef] bg-[#fbfafd] px-3 py-2 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#606571]">
                3° Trimestre
              </th>
              {/* Q4 Columns */}
              <th colSpan={5} className="border-r border-[#e7e7ef] bg-[#fbfafd] px-3 py-2 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#606571]">
                4° Trimestre
              </th>
              {/* Annual Totals */}
              <th colSpan={3} className="bg-[#fbfafd] px-3 py-2 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#606571]">
                Total Anual
              </th>
            </tr>

            {/* Sub-headers */}
            <tr className="border-b border-[#eeeef3] bg-white text-[#8b8f9b]">
              <th className="px-4 py-2 sticky left-0 bg-white z-10 border-r border-zinc-200"></th>
              <th className="px-3 py-2 border-r border-zinc-200"></th>

              {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                <React.Fragment key={q}>
                  <th className="px-3 py-2 text-right text-[0.65rem] font-medium tracking-wider border-r border-zinc-200">Prog.</th>
                  <th className="px-3 py-2 text-right text-[0.65rem] font-medium tracking-wider border-r border-zinc-100">CENARES</th>
                  <th className="px-3 py-2 text-right text-[0.65rem] font-medium tracking-wider border-r border-zinc-200">Dif.</th>
                  <th className="px-3 py-2 text-right text-[0.65rem] font-medium tracking-wider border-r border-zinc-100">Cons.</th>
                  <th className="px-3 py-2 text-right text-[0.65rem] font-medium tracking-wider border-r border-zinc-200 text-zinc-700">Saldo</th>
                </React.Fragment>
              ))}
              
              <th className="px-3 py-2 text-right text-[0.65rem] font-medium tracking-wider border-r border-zinc-100">Prog.</th>
              <th className="px-3 py-2 text-right text-[0.65rem] font-medium tracking-wider border-r border-zinc-100">Entr.</th>
              <th className="px-3 py-2 text-right text-[0.65rem] font-medium tracking-wider text-zinc-700">Dif.</th>
            </tr>
          </thead>
          
          <tbody className="bg-white">
            {items.map((item, itemIndex) => {
              const totalProgramado = item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4;
              const totalEntregado = item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4;
              const diferenciaTotal = totalProgramado - totalEntregado;

              return (
                <tr key={item.id} className="border-b border-[#eeeef3] transition-colors duration-200 hover:bg-[#fbfafd]">
                  {/* Item Description */}
                  <td className="px-6 py-4 text-sm font-semibold text-zinc-900 sticky left-0 bg-white z-10 border-r border-zinc-100">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${
                        item.tipo === 'vacuna'
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-green-50 border-green-200 text-green-600'
                      }`}>
                        {item.tipo === 'vacuna' ? <Package className="h-4 w-4" /> : <Syringe weight="duotone" className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-zinc-900 truncate">
                          {item.descripcion}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.tipo === 'vacuna'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {item.tipo === 'vacuna' ? 'Vacuna' : 'Jeringa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Previous Year Balance */}
                  <td className="px-3 py-3 text-[0.85rem] font-semibold text-right text-zinc-600 border-r border-zinc-200 bg-zinc-50 align-middle tabular-nums">
                    {item.saldoAnterior.toLocaleString()}
                  </td>
                  
                  {/* Q1 Columns */}
                  {renderQuarterColumns(item, itemIndex, 'q1', 'zinc')}

                  {/* Q2 Columns */}
                  {renderQuarterColumns(item, itemIndex, 'q2', 'zinc')}

                  {/* Q3 Columns */}
                  {renderQuarterColumns(item, itemIndex, 'q3', 'zinc')}

                  {/* Q4 Columns */}
                  {renderQuarterColumns(item, itemIndex, 'q4', 'zinc')}
                  
                  {/* Annual Totals */}
                  <td className="px-3 py-3 text-[0.85rem] text-right text-zinc-800 font-semibold border-r border-zinc-100 bg-zinc-50 align-middle tabular-nums">
                    {totalProgramado.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-[0.85rem] text-right text-zinc-800 font-semibold border-r border-zinc-100 bg-zinc-50 align-middle tabular-nums">
                    {totalEntregado.toLocaleString()}
                  </td>
                  <td className={`px-3 py-3 text-[0.85rem] text-right font-bold bg-zinc-50 align-middle tracking-tight tabular-nums ${
                    diferenciaTotal >= 0 ? 'text-zinc-900 border-zinc-100' : 'text-rose-600 border-rose-200'
                  }`}>
                    {diferenciaTotal > 0 ? `+${diferenciaTotal.toLocaleString()}` : diferenciaTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer Minimal */}
      <div className="px-5 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[0.8rem] font-medium text-zinc-600">
            <Package className="h-4 w-4" />
            <span>Total de ítems: <span className="font-semibold text-zinc-900">{items.length}</span></span>
          </div>
          <div className="text-[0.8rem] text-zinc-500">
            (<span className="font-medium text-zinc-700">{items.filter(i => i.tipo === 'vacuna').length}</span> vacunas, <span className="font-medium text-zinc-700 ml-1">{items.filter(i => i.tipo === 'jeringa').length}</span> jeringas)
          </div>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border border-teal-200/70 bg-teal-50 px-2.5 py-1.5">
          <FloppyDisk className="h-3.5 w-3.5 text-teal-600" />
          <span className="text-[0.7rem] font-medium text-zinc-600 uppercase tracking-wider">Guardado Automático</span>
        </div>
      </div>

      {/* Export Section - Professional Design */}
      <div className="border-t border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="mr-4 rounded-lg bg-teal-100 p-3">
                <DownloadSimple className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Exportar Programación y Seguimiento Anual</h3>
                <p className="text-sm text-zinc-600">Generar reporte Excel profesional con todos los datos</p>
              </div>
            </div>

            {/* Export Button - Centered and Prominent */}
            <div className="flex justify-center">
              <button type="button"
                onClick={handleExportarExcel}
                disabled={isExporting || loading || items.length === 0}
                className="flex items-center justify-center rounded-lg bg-teal-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <SpinnerGap weight="bold" className="h-5 w-5 mr-3 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileXls weight="duotone" className="h-5 w-5 mr-3" />
                    Exportar Programación y Seguimiento Anual CENARES {anio}
                  </>
                )}
              </button>
            </div>

            {/* Information Section */}
            <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-start">
                <Package className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div className="text-sm text-teal-900">
                  <p className="font-medium mb-1">Información sobre la exportación:</p>
                  <ul className="list-inside list-disc space-y-1 text-teal-700">
                    <li>El reporte incluirá todos los datos de programación y seguimiento por trimestre</li>
                    <li>Se exportará en formato Excel con diseño profesional y corporativo</li>
                    <li>Incluye separación por vacunas y jeringas con colores diferenciados</li>
                    <li>La descarga comenzará automáticamente una vez completada la exportación</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionSeguimientoAnualTable;
