import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Save, AlertCircle, Package, Syringe } from 'lucide-react';
import { ProgramacionAnualCenaresService } from '../../services/programacionAnualCenaresService';
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

  // Save individual field value
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
    programacion: any
  ) => {
    let saldoQ1 = saldoAnterior + entregas.q1 - consumo.q1;
    let saldoQ2 = saldoQ1 + entregas.q2 - consumo.q2;
    let saldoQ3 = saldoQ2 + entregas.q3 - consumo.q3;
    let saldoQ4 = saldoQ3 + entregas.q4 - consumo.q4;

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
    return item?.programacion?.[trimestre as keyof typeof item.programacion] || 0;
  };

  // Check if field has pending changes
  const isPending = (itemIndex: number, trimestre: string): boolean => {
    const key = getFieldKey(itemIndex, trimestre);
    return pendingChanges[key] || false;
  };

  // Render quarter columns
  const renderQuarterColumns = (item: TableItem, itemIndex: number, quarter: string, color: string) => {
    const currentValue = getCurrentValue(itemIndex, quarter);
    const isPendingChange = isPending(itemIndex, quarter);
    const entregado = item.entregas[quarter as keyof typeof item.entregas];
    const diferencia = currentValue - entregado;
    const consumido = item.consumo[quarter as keyof typeof item.consumo];
    const saldo = item.saldos[quarter as keyof typeof item.saldos];

    return (
      <>
        {/* Programado (Editable) */}
        <td className="px-3 py-4 text-center border-r border-gray-100 relative">
          <div className="relative">
            <input
              type="number"
              min="0"
              value={currentValue}
              onChange={(e) => handleTempValueChange(itemIndex, quarter, parseInt(e.target.value) || 0)}
              onBlur={() => handleFieldBlur(itemIndex, quarter)}
              disabled={isUpdating}
              className={`w-24 px-3 py-2 text-center text-sm font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm ${
                isPendingChange
                  ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                  : 'border-gray-300 hover:border-blue-400 bg-white'
              }`}
              title={isPendingChange ? 'Cambios pendientes - Se guardará automáticamente' : ''}
            />
            {isPendingChange && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-sm"></div>
            )}
          </div>
        </td>

        {/* Entregado (CENARES) - Read Only */}
        <td className="px-3 py-4 text-sm text-center text-gray-800 border-r border-gray-100 font-semibold">
          <div className="bg-gray-50 rounded-lg px-2 py-1">
            {entregado.toLocaleString()}
          </div>
        </td>

        {/* Diferencia - Calculated */}
        <td className={`px-3 py-4 text-sm text-center font-bold border-r border-gray-100 ${
          diferencia >= 0 ? 'text-green-700' : 'text-red-700'
        }`}>
          <div className={`rounded-lg px-2 py-1 ${
            diferencia >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {diferencia.toLocaleString()}
          </div>
        </td>

        {/* Consumido - Read Only */}
        <td className="px-3 py-4 text-sm text-center text-gray-800 border-r border-gray-100 font-semibold">
          <div className="bg-gray-50 rounded-lg px-2 py-1">
            {consumido.toLocaleString()}
          </div>
        </td>

        {/* Saldo - Calculated */}
        <td className={`px-3 py-4 text-sm text-center font-bold border-r border-gray-200 ${
          saldo >= 0 ? 'text-blue-700' : 'text-red-700'
        }`}>
          <div className={`rounded-lg px-2 py-1 shadow-sm ${
            saldo >= 0 ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'
          }`}>
            {saldo.toLocaleString()}
          </div>
        </td>
      </>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xl">
        <div className="flex flex-col justify-center items-center py-16">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando Programación Anual</h3>
          <p className="text-gray-600">Obteniendo datos de programación y seguimiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xl">
        <div className="flex flex-col items-center py-16">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
          <button
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xl">
      {/* Header Premium */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Programación y Seguimiento Anual CENARES {anio}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Los valores de programación se guardan automáticamente al modificarlos
              </p>
            </div>
          </div>
          {isUpdating && (
            <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm font-medium">Guardando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider sticky left-0 bg-gradient-to-r from-slate-800 to-slate-900 z-10 border-r border-slate-700">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Descripción del Ítem
                </div>
              </th>
              <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider border-r border-slate-700">
                Saldo {anio - 1}
              </th>

              {/* Q1 Columns */}
              <th colSpan={5} className="px-3 py-3 text-center text-sm font-bold text-blue-100 uppercase tracking-wider border-r border-slate-600 bg-gradient-to-r from-blue-600 to-blue-700">
                1° Trimestre
              </th>
              
              {/* Q2 Columns */}
              <th colSpan={5} className="px-3 py-3 text-center text-sm font-bold text-green-100 uppercase tracking-wider border-r border-slate-600 bg-gradient-to-r from-green-600 to-green-700">
                2° Trimestre
              </th>

              {/* Q3 Columns */}
              <th colSpan={5} className="px-3 py-3 text-center text-sm font-bold text-orange-100 uppercase tracking-wider border-r border-slate-600 bg-gradient-to-r from-orange-600 to-orange-700">
                3° Trimestre
              </th>

              {/* Q4 Columns */}
              <th colSpan={5} className="px-3 py-3 text-center text-sm font-bold text-purple-100 uppercase tracking-wider border-r border-slate-600 bg-gradient-to-r from-purple-600 to-purple-700">
                4° Trimestre
              </th>

              {/* Annual Totals */}
              <th colSpan={3} className="px-3 py-3 text-center text-sm font-bold text-slate-100 uppercase tracking-wider bg-gradient-to-r from-slate-700 to-slate-800">
                Total Anual
              </th>
            </tr>

            {/* Sub-headers */}
            <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              <th className="px-6 py-3 sticky left-0 bg-gradient-to-r from-slate-700 to-slate-800 z-10 border-r border-slate-600"></th>
              <th className="px-4 py-3 border-r border-slate-600"></th>

              {/* Q1 Sub-headers */}
              {['Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo'].map((header, idx) => (
                <th key={`q1-${idx}`} className="px-3 py-3 text-xs font-semibold text-blue-100 border-r border-slate-600">
                  {header}
                </th>
              ))}

              {/* Q2 Sub-headers */}
              {['Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo'].map((header, idx) => (
                <th key={`q2-${idx}`} className="px-3 py-3 text-xs font-semibold text-green-100 border-r border-slate-600">
                  {header}
                </th>
              ))}

              {/* Q3 Sub-headers */}
              {['Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo'].map((header, idx) => (
                <th key={`q3-${idx}`} className="px-3 py-3 text-xs font-semibold text-orange-100 border-r border-slate-600">
                  {header}
                </th>
              ))}

              {/* Q4 Sub-headers */}
              {['Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo'].map((header, idx) => (
                <th key={`q4-${idx}`} className="px-3 py-3 text-xs font-semibold text-purple-100 border-r border-slate-600">
                  {header}
                </th>
              ))}

              {/* Annual Totals Sub-headers */}
              {['Total Prog.', 'Total Entr.', 'Dif. Total'].map((header, idx) => (
                <th key={`total-${idx}`} className="px-3 py-3 text-xs font-semibold text-slate-100 border-r border-slate-600">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-100">
            {items.map((item, itemIndex) => {
              const totalProgramado = item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4;
              const totalEntregado = item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4;
              const diferenciaTotal = totalProgramado - totalEntregado;

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-200 border-b border-gray-100">
                  {/* Item Description */}
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${
                        item.tipo === 'vacuna'
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-green-50 border-green-200 text-green-600'
                      }`}>
                        {item.tipo === 'vacuna' ? <Package className="h-4 w-4" /> : <Syringe className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {item.descripcion}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
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
                  <td className="px-4 py-4 text-sm text-center text-gray-800 border-r border-gray-100 font-bold bg-slate-50">
                    <div className="bg-white rounded-lg px-2 py-1 shadow-sm">
                      {item.saldoAnterior.toLocaleString()}
                    </div>
                  </td>
                  
                  {/* Q1 Columns */}
                  {renderQuarterColumns(item, itemIndex, 'q1', 'blue')}

                  {/* Q2 Columns */}
                  {renderQuarterColumns(item, itemIndex, 'q2', 'green')}

                  {/* Q3 Columns */}
                  {renderQuarterColumns(item, itemIndex, 'q3', 'orange')}

                  {/* Q4 Columns */}
                  {renderQuarterColumns(item, itemIndex, 'q4', 'purple')}
                  
                  {/* Annual Totals */}
                  <td className="px-4 py-4 text-sm text-center font-bold text-slate-900 border-r border-gray-100 bg-slate-50">
                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                      {totalProgramado.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-center font-bold text-slate-900 border-r border-gray-100 bg-slate-50">
                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                      {totalEntregado.toLocaleString()}
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-sm text-center font-bold border-r border-gray-100 bg-slate-50 ${
                    diferenciaTotal >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <div className={`rounded-lg px-3 py-2 shadow-sm ${
                      diferenciaTotal >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      {diferenciaTotal.toLocaleString()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer Premium */}
      <div className="px-6 py-6 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Package className="h-4 w-4 text-blue-600" />
              <span>Total de ítems: <span className="text-blue-600">{items.length}</span></span>
            </div>
            <div className="text-sm text-gray-600">
              (<span className="font-medium text-blue-600">{items.filter(i => i.tipo === 'vacuna').length}</span> vacunas,
              <span className="font-medium text-green-600 ml-1">{items.filter(i => i.tipo === 'jeringa').length}</span> jeringas)
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <Save className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Auto-guardado activado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionSeguimientoAnualTable;
