import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  Package,
  Syringe,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Filter,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Plus,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Lote, LoteJeringa, LoteVacunaStats, LoteJeringaStats, Vacuna, Jeringa } from '../../types';

interface GestionLotesProps {
  lotes: (Lote | LoteJeringa)[];
  onUpdate: (lote: Lote | LoteJeringa) => void;
  onDelete: (id: string) => void;
  tipo: 'vacuna' | 'jeringa';
  isLoading?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  stats?: LoteVacunaStats | LoteJeringaStats | null;
  isLoadingStats?: boolean;
  // New props for enhanced filtering
  vacunas?: Vacuna[];
  jeringas?: Jeringa[];
  onApplyFilters?: (filters: any) => void;
  isLoadingVacunas?: boolean;
  isLoadingJeringas?: boolean;
}

const GestionLotes: React.FC<GestionLotesProps> = ({
  lotes,
  onUpdate,
  onDelete,
  tipo,
  isLoading = false,
  isUpdating = false,
  isDeleting = false,
  stats: externalStats,
  isLoadingStats = false,
  vacunas = [],
  jeringas = [],
  onApplyFilters,
  isLoadingVacunas = false,
  isLoadingJeringas = false
}) => {
  // Existing filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterVencimiento, setFilterVencimiento] = useState<string>('todos');

  // New filter states for enhanced filtering
  const [filterVacunaId, setFilterVacunaId] = useState<string>('todos');
  const [filterJeringaId, setFilterJeringaId] = useState<string>('todos');

  // UI states
  const [showModal, setShowModal] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | LoteJeringa | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Filtrar lotes (solo para visualización local, los filtros principales se aplican en el backend)
  const filteredLotes = lotes.filter(lote => {
    const matchesSearch = lote.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lote.numeroComprobante.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = filterEstado === 'todos' || lote.estado === filterEstado;

    let matchesVencimiento = true;
    if (filterVencimiento !== 'todos' && 'fechaVencimiento' in lote && lote.fechaVencimiento) {
      const days = Math.ceil((lote.fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      switch (filterVencimiento) {
        case 'vencido':
          matchesVencimiento = days <= 0;
          break;
        case 'por_vencer':
          matchesVencimiento = days > 0 && days <= 30;
          break;
        case 'vigente':
          matchesVencimiento = days > 30;
          break;
      }
    }

    // Enhanced filtering for vaccine/syringe types (local filtering for immediate UI feedback)
    let matchesVacuna = true;
    let matchesJeringa = true;

    if (tipo === 'vacuna' && filterVacunaId !== 'todos') {
      matchesVacuna = 'vacunaId' in lote && lote.vacunaId === filterVacunaId;
    }

    if (tipo === 'jeringa' && filterJeringaId !== 'todos') {
      matchesJeringa = 'jeringaId' in lote && lote.jeringaId === filterJeringaId;
    }

    return matchesSearch && matchesEstado && matchesVencimiento && matchesVacuna && matchesJeringa;
  });

  // Usar estadísticas del backend o calcular localmente como fallback
  const statsToShow = externalStats || {
    total: lotes.length,
    disponibles: lotes.filter(l => l.estado === 'disponible').length,
    agotados: lotes.filter(l => l.estado === 'agotado').length,
    vencidos: tipo === 'vacuna' ? lotes.filter(l => 'fechaVencimiento' in l && l.estado === 'vencido').length : 0,
    porVencer: tipo === 'vacuna' ? lotes.filter(l => {
      if ('fechaVencimiento' in l && l.fechaVencimiento) {
        const days = Math.ceil((l.fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days <= 30 && days > 0;
      }
      return false;
    }).length : 0,
    stockTotal: lotes.reduce((sum, l) => sum + l.cantidadActual, 0),
    stockBajo: 0 // Para jeringas
  };

  const handleEdit = (lote: Lote | LoteJeringa) => {
    setEditingLote(lote);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    const lote = lotes.find(l => l.id === id);
    if (window.confirm(`¿Está seguro de eliminar el lote "${lote?.numero}"?`)) {
      onDelete(id);
    }
  };

  const handleSubmit = (formData: Partial<Lote | LoteJeringa>) => {
    if (editingLote) {
      onUpdate({ ...editingLote, ...formData } as Lote | LoteJeringa);
    }
    setShowModal(false);
    setEditingLote(null);
  };

  // Enhanced filtering functions
  const handleApplyFilters = () => {
    if (onApplyFilters) {
      const filters: any = {};

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      if (filterEstado !== 'todos') {
        filters.estado = filterEstado;
      }

      if (filterVencimiento !== 'todos') {
        filters.vencimiento = filterVencimiento;
      }

      if (tipo === 'vacuna' && filterVacunaId !== 'todos') {
        filters.vacunaId = filterVacunaId;
      }

      if (tipo === 'jeringa' && filterJeringaId !== 'todos') {
        filters.jeringaId = filterJeringaId;
      }

      console.log('🔍 Aplicando filtros:', filters);
      onApplyFilters(filters);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterEstado('todos');
    setFilterVencimiento('todos');
    setFilterVacunaId('todos');
    setFilterJeringaId('todos');

    if (onApplyFilters) {
      console.log('🧹 Limpiando filtros');
      onApplyFilters({});
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'bg-green-100 text-green-800 border-green-200';
      case 'vencido': return 'bg-red-100 text-red-800 border-red-200';
      case 'agotado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'disponible': return CheckCircle;
      case 'vencido': return AlertTriangle;
      case 'agotado': return Clock;
      default: return Clock;
    }
  };

  const getDaysToExpire = (fechaVencimiento?: Date) => {
    if (!fechaVencimiento) return null;
    const today = new Date();
    const diffTime = fechaVencimiento.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getVencimientoColor = (days: number | null) => {
    if (days === null) return 'text-gray-500';
    if (days <= 0) return 'text-red-600';
    if (days <= 30) return 'text-yellow-600';
    if (days <= 90) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProductName = (lote: Lote | LoteJeringa) => {
    if ('vacunaId' in lote) {
      // Usar información del backend si está disponible
      if (lote.vacuna) {
        return `${lote.vacuna.nombre} - ${lote.vacuna.presentacion}`;
      }
      return 'Vacuna no encontrada';
    } else {
      // Usar información del backend si está disponible
      if (lote.jeringa) {
        return `${lote.jeringa.tipo} ${lote.jeringa.capacidad} - ${lote.jeringa.color}`;
      }
      return 'Jeringa no encontrada';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              {tipo === 'vacuna' ? (
                <Package className="h-6 w-6 text-blue-600 mr-3" />
              ) : (
                <Syringe className="h-6 w-6 text-purple-600 mr-3" />
              )}
              Gestión de Lotes - {tipo === 'vacuna' ? 'Vacunas' : 'Jeringas'}
            </h3>
            <p className="text-gray-600 mt-1">
              Control detallado de todos los lotes de {tipo === 'vacuna' ? 'vacunas' : 'jeringas'} en el sistema
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {viewMode === 'cards' ? 'Vista Tabla' : 'Vista Tarjetas'}
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Estadísticas en tarjetas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Lotes</p>
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-blue-900">{statsToShow.total}</p>
                )}
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Disponibles</p>
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-green-900">{statsToShow.disponibles}</p>
                )}
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {tipo === 'vacuna' && 'porVencer' in statsToShow && (
            <>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Por Vencer</p>
                    {isLoadingStats ? (
                      <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold text-yellow-900">{statsToShow.porVencer}</p>
                    )}
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Vencidos</p>
                    {isLoadingStats ? (
                      <Loader2 className="h-6 w-6 text-red-600 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold text-red-900">{statsToShow.vencidos || 0}</p>
                    )}
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </>
          )}

          {tipo === 'jeringa' && 'stockBajo' in statsToShow && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Stock Bajo</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-6 w-6 text-orange-600 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold text-orange-900">{statsToShow.stockBajo}</p>
                  )}
                </div>
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agotados</p>
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{statsToShow.agotados}</p>
                )}
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Stock Total</p>
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-purple-900">{statsToShow.stockTotal.toLocaleString()}</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          🔍 Filtros de Búsqueda
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de lote o comprobante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">🔍 Todos los estados</option>
              <option value="disponible">✅ Disponible</option>
              <option value="agotado">⏰ Agotado</option>
              {tipo === 'vacuna' && <option value="vencido">❌ Vencido</option>}
            </select>
          </div>

          {/* Filtro de vencimiento para vacunas */}
          {tipo === 'vacuna' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vencimiento</label>
              <select
                value={filterVencimiento}
                onChange={(e) => setFilterVencimiento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">🔍 Todos los vencimientos</option>
                <option value="vigente">✅ Vigente (&gt;30 días)</option>
                <option value="por_vencer">⚠️ Por vencer (≤30 días)</option>
                <option value="vencido">❌ Vencido</option>
              </select>
            </div>
          )}

          {/* Filtro por tipo de vacuna */}
          {tipo === 'vacuna' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vacuna</label>
              <select
                value={filterVacunaId}
                onChange={(e) => setFilterVacunaId(e.target.value)}
                disabled={isLoadingVacunas}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="todos">
                  {isLoadingVacunas ? '⏳ Cargando...' : '🔍 Todas las vacunas'}
                </option>
                {vacunas.map((vacuna) => (
                  <option key={vacuna.id} value={vacuna.id}>
                    💉 {vacuna.nombre} - {vacuna.presentacion}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtros para jeringas */}
          {tipo === 'jeringa' && (
            <>
              {/* Filtro por tipo de jeringa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Jeringa</label>
                <select
                  value={filterJeringaId}
                  onChange={(e) => setFilterJeringaId(e.target.value)}
                  disabled={isLoadingJeringas}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="todos">
                    {isLoadingJeringas ? '⏳ Cargando...' : '🔍 Todas las jeringas'}
                  </option>
                  {jeringas.map((jeringa) => (
                    <option key={jeringa.id} value={jeringa.id}>
                      🩹 {jeringa.tipo} - {jeringa.capacidad} ({jeringa.color})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por vacuna asociada (para jeringas) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vacuna Asociada</label>
                <select
                  value={filterVacunaId}
                  onChange={(e) => setFilterVacunaId(e.target.value)}
                  disabled={isLoadingVacunas}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="todos">
                    {isLoadingVacunas ? '⏳ Cargando...' : '🔍 Todas las vacunas'}
                  </option>
                  {vacunas.map((vacuna) => (
                    <option key={vacuna.id} value={vacuna.id}>
                      💉 {vacuna.nombre} - {vacuna.presentacion}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Botones de acción para filtros */}
        <div className="flex items-center justify-center space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleApplyFilters}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </button>
          <button
            onClick={handleClearFilters}
            className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      {isLoading && lotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando lotes...
          </h3>
          <p className="text-gray-600">
            Por favor espere mientras se cargan los datos
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <LotesCardView
          lotes={filteredLotes}
          tipo={tipo}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          getProductName={getProductName}
          getEstadoColor={getEstadoColor}
          getEstadoIcon={getEstadoIcon}
          getDaysToExpire={getDaysToExpire}
          getVencimientoColor={getVencimientoColor}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      ) : (
        <LotesTableView
          lotes={filteredLotes}
          tipo={tipo}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getProductName={getProductName}
          getEstadoColor={getEstadoColor}
          getEstadoIcon={getEstadoIcon}
          getDaysToExpire={getDaysToExpire}
          getVencimientoColor={getVencimientoColor}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      )}

      {filteredLotes.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          {tipo === 'vacuna' ? (
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          ) : (
            <Syringe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron lotes
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterEstado !== 'todos' || filterVencimiento !== 'todos'
              ? 'No hay lotes que coincidan con los filtros aplicados'
              : `No hay lotes de ${tipo === 'vacuna' ? 'vacunas' : 'jeringas'} registrados`
            }
          </p>
          {(!searchTerm && filterEstado === 'todos' && filterVencimiento === 'todos') && (
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5 inline mr-2" />
              Registrar Primer Lote
            </button>
          )}
        </div>
      )}

      {/* Modal de edición */}
      {showModal && editingLote && (
        <LoteModal
          lote={editingLote}
          tipo={tipo}
          onClose={() => {
            setShowModal(false);
            setEditingLote(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

// Vista de tarjetas
interface LotesCardViewProps {
  lotes: (Lote | LoteJeringa)[];
  tipo: 'vacuna' | 'jeringa';
  onEdit: (lote: Lote | LoteJeringa) => void;
  onDelete: (id: string) => void;
  showDetails: string | null;
  setShowDetails: (id: string | null) => void;
  getProductName: (lote: Lote | LoteJeringa) => string;
  getEstadoColor: (estado: string) => string;
  getEstadoIcon: (estado: string) => React.ComponentType<any>;
  getDaysToExpire: (fecha?: Date) => number | null;
  getVencimientoColor: (days: number | null) => string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const LotesCardView: React.FC<LotesCardViewProps> = ({
  lotes,
  tipo,
  onEdit,
  onDelete,
  showDetails,
  setShowDetails,
  getProductName,
  getEstadoColor,
  getEstadoIcon,
  getDaysToExpire,
  getVencimientoColor,
  isUpdating = false,
  isDeleting = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lotes.map((lote) => {
        const EstadoIcon = getEstadoIcon(lote.estado);
        const daysToExpire = 'fechaVencimiento' in lote ? getDaysToExpire(lote.fechaVencimiento) : null;
        const productName = getProductName(lote);
        
        return (
          <div key={lote.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  tipo === 'vacuna' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {tipo === 'vacuna' ? (
                    <Package className={`h-6 w-6 ${tipo === 'vacuna' ? 'text-blue-600' : 'text-purple-600'}`} />
                  ) : (
                    <Syringe className={`h-6 w-6 ${tipo === 'vacuna' ? 'text-blue-600' : 'text-purple-600'}`} />
                  )}
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold text-gray-900">{lote.numero}</h4>
                  <p className="text-sm text-gray-600">{productName}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setShowDetails(showDetails === lote.id ? null : lote.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onEdit(lote)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(lote.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Información principal */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock actual:</span>
                <span className="text-lg font-bold text-gray-900">{lote.cantidadActual.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock inicial:</span>
                <span className="text-sm text-gray-900">{lote.cantidadInicial.toLocaleString()}</span>
              </div>

              {tipo === 'vacuna' && 'fechaVencimiento' in lote && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vencimiento:</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">{lote.fechaVencimiento.toLocaleDateString()}</div>
                    {daysToExpire !== null && (
                      <div className={`text-xs font-medium ${getVencimientoColor(daysToExpire)}`}>
                        {daysToExpire > 0 ? `${daysToExpire} días` : 'Vencido'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ingreso:</span>
                <span className="text-sm text-gray-900">{lote.fechaIngreso.toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Comprobante:</span>
                <span className="text-sm text-gray-900">{lote.comprobanteClase}: {lote.numeroComprobante}</span>
              </div>
            </div>

            {/* Estado y progreso */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <EstadoIcon className="h-4 w-4 mr-2" />
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(lote.estado)}`}>
                    {lote.estado.charAt(0).toUpperCase() + lote.estado.slice(1)}
                  </span>
                </div>
                
                {/* Indicador de nivel de stock */}
                <div className="text-right">
                  <div className="text-xs text-gray-500">Nivel de stock</div>
                  <div className={`text-sm font-medium ${
                    lote.cantidadActual === 0 ? 'text-red-600' :
                    lote.cantidadActual < lote.cantidadInicial * 0.2 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {Math.round((lote.cantidadActual / lote.cantidadInicial) * 100)}%
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    lote.cantidadActual === 0 ? 'bg-red-500' :
                    lote.cantidadActual < lote.cantidadInicial * 0.2 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.max((lote.cantidadActual / lote.cantidadInicial) * 100, 2)}%` }}
                ></div>
              </div>
            </div>

            {/* Detalles expandibles */}
            {showDetails === lote.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Forma de ingreso:</span>
                  <span className="ml-2 text-gray-900">{lote.formaIngreso}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Creado:</span>
                  <span className="ml-2 text-gray-900">{lote.createdAt.toLocaleDateString()}</span>
                </div>
                {lote.observaciones && (
                  <div className="text-sm">
                    <span className="text-gray-600">Observaciones:</span>
                    <p className="mt-1 text-gray-900 text-xs bg-gray-50 p-2 rounded">{lote.observaciones}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Vista de tabla
interface LotesTableViewProps {
  lotes: (Lote | LoteJeringa)[];
  tipo: 'vacuna' | 'jeringa';
  onEdit: (lote: Lote | LoteJeringa) => void;
  onDelete: (id: string) => void;
  getProductName: (lote: Lote | LoteJeringa) => string;
  getEstadoColor: (estado: string) => string;
  getEstadoIcon: (estado: string) => React.ComponentType<any>;
  getDaysToExpire: (fecha?: Date) => number | null;
  getVencimientoColor: (days: number | null) => string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const LotesTableView: React.FC<LotesTableViewProps> = ({
  lotes,
  tipo,
  onEdit,
  onDelete,
  getProductName,
  getEstadoColor,
  getEstadoIcon,
  getDaysToExpire,
  getVencimientoColor,
  isUpdating = false,
  isDeleting = false,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lote
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              {tipo === 'vacuna' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comprobante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lotes.map((lote) => {
              const EstadoIcon = getEstadoIcon(lote.estado);
              const daysToExpire = 'fechaVencimiento' in lote ? getDaysToExpire(lote.fechaVencimiento) : null;
              const productName = getProductName(lote);
              
              return (
                <tr key={lote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                        tipo === 'vacuna' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {tipo === 'vacuna' ? (
                          <Package className={`h-5 w-5 ${tipo === 'vacuna' ? 'text-blue-600' : 'text-purple-600'}`} />
                        ) : (
                          <Syringe className={`h-5 w-5 ${tipo === 'vacuna' ? 'text-blue-600' : 'text-purple-600'}`} />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lote.numero}</div>
                        <div className="text-sm text-gray-500">{lote.fechaIngreso.toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lote.cantidadActual.toLocaleString()} / {lote.cantidadInicial.toLocaleString()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${
                          lote.cantidadActual === 0 ? 'bg-red-500' :
                          lote.cantidadActual < lote.cantidadInicial * 0.2 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.max((lote.cantidadActual / lote.cantidadInicial) * 100, 2)}%` }}
                      ></div>
                    </div>
                  </td>
                  {tipo === 'vacuna' && 'fechaVencimiento' in lote && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lote.fechaVencimiento.toLocaleDateString()}</div>
                      {daysToExpire !== null && (
                        <div className={`text-xs font-medium ${getVencimientoColor(daysToExpire)}`}>
                          {daysToExpire > 0 ? `${daysToExpire} días` : 'Vencido'}
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lote.comprobanteClase}</div>
                    <div className="text-sm text-gray-500">{lote.numeroComprobante}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <EstadoIcon className="h-4 w-4 mr-2" />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(lote.estado)}`}>
                        {lote.estado.charAt(0).toUpperCase() + lote.estado.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(lote)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(lote.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Modal de edición
interface LoteModalProps {
  lote: Lote | LoteJeringa;
  tipo: 'vacuna' | 'jeringa';
  onClose: () => void;
  onSubmit: (data: Partial<Lote | LoteJeringa>) => void;
}

/**
 * Mapear valores de la base de datos a valores del frontend para FormaIngreso
 * La base de datos almacena valores como 'PRIMER_TRIMESTRE' pero el frontend usa '1° TRIMESTRE'
 */
const mapFormaIngresoToFrontend = (formaIngreso: string): string => {
  const mapping: { [key: string]: string } = {
    'PRIMER_TRIMESTRE': '1° TRIMESTRE',
    'SEGUNDO_TRIMESTRE': '2° TRIMESTRE',
    'TERCER_TRIMESTRE': '3° TRIMESTRE',
    'CUARTO_TRIMESTRE': '4° TRIMESTRE'
  };
  return mapping[formaIngreso] || formaIngreso;
};

const LoteModal: React.FC<LoteModalProps> = ({ lote, tipo, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    numero: lote.numero,
    fechaIngreso: lote.fechaIngreso.toISOString().split('T')[0],
    fechaVencimiento: 'fechaVencimiento' in lote ? lote.fechaVencimiento?.toISOString().split('T')[0] || '' : '',
    formaIngreso: mapFormaIngresoToFrontend(lote.formaIngreso),
    comprobanteClase: lote.comprobanteClase,
    numeroComprobante: lote.numeroComprobante,
    cantidadInicial: lote.cantidadInicial,
    cantidadActual: lote.cantidadActual,
    estado: lote.estado,
    observaciones: lote.observaciones || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: any = {
      ...formData,
      fechaIngreso: new Date(formData.fechaIngreso),
    };

    // Manejar fechaVencimiento según el tipo
    if (tipo === 'vacuna') {
      // Para vacunas, fechaVencimiento es obligatorio
      if (formData.fechaVencimiento) {
        updatedData.fechaVencimiento = new Date(formData.fechaVencimiento);
      }
    } else if (tipo === 'jeringa') {
      // Para jeringas, fechaVencimiento es opcional
      if (formData.fechaVencimiento && formData.fechaVencimiento.trim() !== '') {
        updatedData.fechaVencimiento = new Date(formData.fechaVencimiento);
      } else {
        updatedData.fechaVencimiento = undefined;
      }
    }

    onSubmit(updatedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Editar Lote - {tipo === 'vacuna' ? 'Vacuna' : 'Jeringa'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Lote *
                </label>
                <input
                  type="text"
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  required
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="disponible">Disponible</option>
                  <option value="agotado">Agotado</option>
                  {tipo === 'vacuna' && <option value="vencido">Vencido</option>}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fechaIngreso}
                  onChange={(e) => setFormData({...formData, fechaIngreso: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {tipo === 'vacuna' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaVencimiento}
                    onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Ingreso *
                </label>
                <select
                  required
                  value={formData.formaIngreso}
                  onChange={(e) => setFormData({...formData, formaIngreso: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1° TRIMESTRE">1° TRIMESTRE</option>
                  <option value="2° TRIMESTRE">2° TRIMESTRE</option>
                  <option value="3° TRIMESTRE">3° TRIMESTRE</option>
                  <option value="4° TRIMESTRE">4° TRIMESTRE</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Comprobante *
                </label>
                <select
                  required
                  value={formData.comprobanteClase}
                  onChange={(e) => setFormData({...formData, comprobanteClase: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PECOSA">PECOSA</option>
                  <option value="GUIA">GUÍA</option>
                  <option value="TRASLADO">TRASLADO</option>
                  <option value="OTROS">OTROS</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Comprobante *
                </label>
                <input
                  type="text"
                  required
                  value={formData.numeroComprobante}
                  onChange={(e) => setFormData({...formData, numeroComprobante: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Inicial *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.cantidadInicial}
                  onChange={(e) => setFormData({...formData, cantidadInicial: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Actual *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={formData.cantidadInicial}
                  value={formData.cantidadActual}
                  onChange={(e) => setFormData({...formData, cantidadActual: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observaciones adicionales (opcional)"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualizar Lote
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GestionLotes;