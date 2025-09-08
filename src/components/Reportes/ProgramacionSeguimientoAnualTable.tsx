import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Save, AlertCircle } from 'lucide-react';
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
        <td className="px-2 py-3 text-center border-r border-gray-100 relative">
          <div className="relative">
            <input
              type="number"
              min="0"
              value={currentValue}
              onChange={(e) => handleTempValueChange(itemIndex, quarter, parseInt(e.target.value) || 0)}
              onBlur={() => handleFieldBlur(itemIndex, quarter)}
              disabled={isUpdating}
              className={`w-20 px-2 py-1 text-center text-sm border rounded focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
                isPendingChange
                  ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              title={isPendingChange ? 'Cambios pendientes - Se guardará automáticamente' : ''}
            />
            {isPendingChange && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </td>

        {/* Entregado (CENARES) - Read Only */}
        <td className="px-2 py-3 text-sm text-center text-gray-700 border-r border-gray-100">
          {entregado.toLocaleString()}
        </td>

        {/* Diferencia - Calculated */}
        <td className={`px-2 py-3 text-sm text-center font-medium border-r border-gray-100 ${
          diferencia >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {diferencia.toLocaleString()}
        </td>

        {/* Consumido - Read Only */}
        <td className="px-2 py-3 text-sm text-center text-gray-700 border-r border-gray-100">
          {consumido.toLocaleString()}
        </td>

        {/* Saldo - Calculated */}
        <td className={`px-2 py-3 text-sm text-center font-semibold border-r border-gray-200 ${
          saldo >= 0 ? 'text-blue-600' : 'text-red-600'
        }`}>
          {saldo.toLocaleString()}
        </td>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Cargando datos de programación...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Programación y Seguimiento Anual CENARES {anio}
          </h3>
          {isUpdating && (
            <div className="flex items-center text-amber-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Guardando...</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Los valores de programación se guardan automáticamente al modificarlos
        </p>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                Descripción del Ítem
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Saldo {anio - 1}
              </th>
              
              {/* Q1 Columns */}
              <th colSpan={5} className="px-3 py-2 text-center text-xs font-medium text-blue-600 uppercase tracking-wider border-r border-gray-300 bg-blue-50">
                1° Trimestre
              </th>
              
              {/* Q2 Columns */}
              <th colSpan={5} className="px-3 py-2 text-center text-xs font-medium text-green-600 uppercase tracking-wider border-r border-gray-300 bg-green-50">
                2° Trimestre
              </th>
              
              {/* Q3 Columns */}
              <th colSpan={5} className="px-3 py-2 text-center text-xs font-medium text-orange-600 uppercase tracking-wider border-r border-gray-300 bg-orange-50">
                3° Trimestre
              </th>
              
              {/* Q4 Columns */}
              <th colSpan={5} className="px-3 py-2 text-center text-xs font-medium text-purple-600 uppercase tracking-wider border-r border-gray-300 bg-purple-50">
                4° Trimestre
              </th>
              
              {/* Annual Totals */}
              <th colSpan={3} className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-100">
                Total Anual
              </th>
            </tr>
            
            {/* Sub-headers */}
            <tr className="bg-gray-50">
              <th className="px-4 py-2 sticky left-0 bg-gray-50 z-10 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              
              {/* Q1 Sub-headers */}
              {['Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo'].map((header, idx) => (
                <th key={`q1-${idx}`} className="px-2 py-2 text-xs font-medium text-gray-600 border-r border-gray-100">
                  {header}
                </th>
              ))}
              
              {/* Q2 Sub-headers */}
              {['Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo'].map((header, idx) => (
                <th key={`q2-${idx}`} className="px-2 py-2 text-xs font-medium text-gray-600 border-r border-gray-100">
                  {header}
                </th>
              ))}
              
              {/* Q3 Sub-headers */}
              {['Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo'].map((header, idx) => (
                <th key={`q3-${idx}`} className="px-2 py-2 text-xs font-medium text-gray-600 border-r border-gray-100">
                  {header}
                </th>
              ))}
              
              {/* Q4 Sub-headers */}
              {['Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo'].map((header, idx) => (
                <th key={`q4-${idx}`} className="px-2 py-2 text-xs font-medium text-gray-600 border-r border-gray-100">
                  {header}
                </th>
              ))}
              
              {/* Annual Totals Sub-headers */}
              {['Total Prog.', 'Total Entr.', 'Dif. Total'].map((header, idx) => (
                <th key={`total-${idx}`} className="px-2 py-2 text-xs font-medium text-gray-600 border-r border-gray-100">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, itemIndex) => {
              const totalProgramado = item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4;
              const totalEntregado = item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4;
              const diferenciaTotal = totalProgramado - totalEntregado;
              
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* Item Description */}
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        item.tipo === 'vacuna' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></span>
                      {item.descripcion}
                    </div>
                  </td>
                  
                  {/* Previous Year Balance */}
                  <td className="px-3 py-3 text-sm text-center text-gray-700 border-r border-gray-200 font-semibold">
                    {item.saldoAnterior.toLocaleString()}
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
                  <td className="px-3 py-3 text-sm text-center font-semibold text-gray-900 border-r border-gray-100">
                    {totalProgramado.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-sm text-center font-semibold text-gray-900 border-r border-gray-100">
                    {totalEntregado.toLocaleString()}
                  </td>
                  <td className={`px-3 py-3 text-sm text-center font-semibold border-r border-gray-100 ${
                    diferenciaTotal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {diferenciaTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Total de ítems: {items.length} ({items.filter(i => i.tipo === 'vacuna').length} vacunas, {items.filter(i => i.tipo === 'jeringa').length} jeringas)
          </div>
          <div className="flex items-center">
            <Save className="h-4 w-4 mr-1" />
            Auto-guardado activado
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionSeguimientoAnualTable;
