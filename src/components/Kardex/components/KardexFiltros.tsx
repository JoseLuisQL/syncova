import React, { memo } from 'react';
import {
  Filter,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Package,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react';
import { Vacuna, Jeringa } from '../../../types';

interface Lote {
  id: string;
  numero: string;
}

interface KardexFiltrosProps {
  selectedTipo: 'vacuna' | 'jeringa' | 'todos';
  selectedItem: string;
  selectedLote: string;
  fechaInicio: string;
  fechaFin: string;
  tipoMovimiento: string;
  searchTerm: string;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  lotes: Lote[];
  loadingFiltros: boolean;
  onTipoChange: (tipo: 'vacuna' | 'jeringa' | 'todos') => void;
  onItemChange: (itemId: string) => void;
  onLoteChange: (loteId: string) => void;
  onFechaInicioChange: (fecha: string) => void;
  onFechaFinChange: (fecha: string) => void;
  onTipoMovimientoChange: (tipo: string) => void;
  onSearchChange: (term: string) => void;
  onAplicarFiltros: () => void;
  onLimpiarFiltros: () => void;
}

const inputClass = `w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white
                    transition-all duration-150 
                    hover:border-gray-300
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10`;

const selectClass = `${inputClass} cursor-pointer appearance-none pr-8`;

const labelClass = 'text-xs font-semibold text-gray-600 mb-1 block';

export const KardexFiltros: React.FC<KardexFiltrosProps> = memo(({
  selectedTipo,
  selectedItem,
  selectedLote,
  fechaInicio,
  fechaFin,
  tipoMovimiento,
  searchTerm,
  vacunas,
  jeringas,
  lotes,
  loadingFiltros,
  onTipoChange,
  onItemChange,
  onLoteChange,
  onFechaInicioChange,
  onFechaFinChange,
  onTipoMovimientoChange,
  onSearchChange,
  onAplicarFiltros,
  onLimpiarFiltros,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header compacto */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
            <Filter className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Filtros</span>
          {loadingFiltros && <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-500" />}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
        >
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showAdvanced ? 'Menos' : 'Más'}
        </button>
      </div>

      {/* Filtros principales - Una sola fila */}
      <div className="px-4 py-3">
        <div className="flex flex-wrap items-end gap-3">
          {/* Tipo */}
          <div className="w-36">
            <label className={labelClass}>
              <Package className="h-3 w-3 inline mr-1" />Tipo
            </label>
            <div className="relative">
              <select
                value={selectedTipo}
                onChange={(e) => onTipoChange(e.target.value as 'vacuna' | 'jeringa' | 'todos')}
                className={selectClass}
              >
                <option value="todos">Todos</option>
                <option value="vacuna">Vacunas</option>
                <option value="jeringa">Jeringas</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Fecha Inicio */}
          <div className="w-36">
            <label className={labelClass}>
              <Calendar className="h-3 w-3 inline mr-1" />Desde
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => onFechaInicioChange(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Fecha Fin */}
          <div className="w-36">
            <label className={labelClass}>
              <Calendar className="h-3 w-3 inline mr-1" />Hasta
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => onFechaFinChange(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Búsqueda */}
          <div className="flex-1 min-w-48">
            <label className={labelClass}>
              <Search className="h-3 w-3 inline mr-1" />Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="N° documento, lote..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`${inputClass} pr-8`}
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
                >
                  <X className="h-3.5 w-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={onAplicarFiltros}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 
                         rounded-lg hover:from-teal-600 hover:to-cyan-600 shadow-sm transition-all"
            >
              <Search className="h-3.5 w-3.5 inline mr-1.5" />
              Buscar
            </button>
            <button
              onClick={onLimpiarFiltros}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 
                         rounded-lg hover:bg-gray-50 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Filtros Avanzados - Colapsable */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              {/* Producto específico */}
              <div className="w-48">
                <label className={labelClass}>
                  {selectedTipo === 'jeringa' ? 'Jeringa' : 'Vacuna'}
                </label>
                <div className="relative">
                  <select
                    value={selectedItem}
                    onChange={(e) => onItemChange(e.target.value)}
                    disabled={loadingFiltros || selectedTipo === 'todos'}
                    className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}
                  >
                    <option value="todos">Todos</option>
                    {selectedTipo === 'vacuna' && vacunas.map((vacuna) => (
                      <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
                    ))}
                    {selectedTipo === 'jeringa' && jeringas.map((jeringa) => (
                      <option key={jeringa.id} value={jeringa.id}>{jeringa.tipo}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Lote */}
              <div className="w-40">
                <label className={labelClass}>Lote</label>
                <div className="relative">
                  <select
                    value={selectedLote}
                    onChange={(e) => onLoteChange(e.target.value)}
                    disabled={loadingFiltros || selectedItem === 'todos'}
                    className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}
                  >
                    <option value="todos">Todos</option>
                    {lotes.map((lote) => (
                      <option key={lote.id} value={lote.id}>{lote.numero}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Tipo de Movimiento */}
              <div className="w-44">
                <label className={labelClass}>Tipo Movimiento</label>
                <div className="relative">
                  <select
                    value={tipoMovimiento}
                    onChange={(e) => onTipoMovimientoChange(e.target.value)}
                    className={selectClass}
                  >
                    <option value="todos">Todos</option>
                    <option value="ingreso">Ingresos</option>
                    <option value="salida">Salidas</option>
                    <option value="transferencia">Transferencias</option>
                    <option value="ajuste">Ajustes</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

KardexFiltros.displayName = 'KardexFiltros';
