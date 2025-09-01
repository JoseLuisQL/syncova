import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Calendar,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Printer,
  BarChart3,
  Activity,
  Plus,
  Archive,
  ArrowRightLeft,
  Settings,
  Loader2,
  X,
  Info,
  Hash,
  Building,
  Syringe,
  Shield,
  User
} from 'lucide-react';
import { Establecimiento, Vacuna, Jeringa } from '../../types';
import { KardexService, DeliveryBreakdown } from '../../services/KardexService';
import { useKardexData } from '../../hooks/useKardexData';

// Configuración de secciones organizadas jerárquicamente
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'operaciones' | 'analisis' | 'auditoria';
  description?: string;
}

const KARDEX_SECTIONS: SectionConfig[] = [
  // Sección Operaciones
  { 
    id: 'movimientos', 
    label: 'Movimientos', 
    icon: BookOpen, 
    path: '/kardex/movimientos', 
    category: 'operaciones',
    description: 'Registro de movimientos de inventario'
  },
  { 
    id: 'consultas', 
    label: 'Consultas Avanzadas', 
    icon: Search, 
    path: '/kardex/consultas', 
    category: 'operaciones',
    description: 'Búsquedas especializadas'
  },
  
  // Sección Análisis
  { 
    id: 'reportes', 
    label: 'Reportes', 
    icon: BarChart3, 
    path: '/kardex/reportes', 
    category: 'analisis',
    description: 'Reportes detallados'
  },
  
  // Sección Auditoría
  { 
    id: 'auditoria', 
    label: 'Auditoría', 
    icon: Activity, 
    path: '/kardex/auditoria', 
    category: 'auditoria',
    description: 'Trazabilidad y control'
  }
];

const CATEGORY_CONFIG = {
  operaciones: { label: 'Operaciones', icon: Archive, color: 'blue' },
  analisis: { label: 'Análisis', icon: TrendingUp, color: 'emerald' },
  auditoria: { label: 'Auditoría', icon: Shield, color: 'purple' }
};

const Kardex: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('movimientos');

  // Usar el hook personalizado para manejar los datos del kardex
  const {
    movimientos,
    estadisticas,
    total,
    vacunas,
    jeringas,
    establecimientos,
    lotes,
    currentPage,
    itemsPerPage,
    totalPages,
    loading,
    loadingEstadisticas,
    loadingFiltros,
    error,
    errorEstadisticas,
    errorFiltros,
    filtros,
    cargarLotes,
    actualizarFiltros,
    cambiarPagina,
    cambiarItemsPorPagina,
    irAPrimeraPagina,
    irAUltimaPagina,
    refrescarTodo,
    limpiarErrores
  } = useKardexData();

  // Estados locales para los filtros del UI
  const [selectedTipo, setSelectedTipo] = useState<'vacuna' | 'jeringa' | 'todos'>('todos');
  const [selectedItem, setSelectedItem] = useState<string>('todos');
  const [selectedLote, setSelectedLote] = useState<string>('todos');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [tipoMovimiento, setTipoMovimiento] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Inicializar fechas solo una vez cuando los filtros estén disponibles
  useEffect(() => {
    if (filtros.fechaInicio && !fechaInicio) {
      setFechaInicio(filtros.fechaInicio);
    }
    if (filtros.fechaFin && !fechaFin) {
      setFechaFin(filtros.fechaFin);
    }
  }, [filtros.fechaInicio, filtros.fechaFin]); // Solo cuando cambien los filtros iniciales

  // Función para aplicar filtros (sin useCallback para evitar dependencias)
  const aplicarFiltros = () => {
    const nuevosFiltros = {
      tipo: selectedTipo !== 'todos' ? (selectedTipo as 'vacuna' | 'jeringa') : undefined,
      itemId: selectedItem !== 'todos' ? selectedItem : undefined,
      loteId: selectedLote !== 'todos' ? selectedLote : undefined,
      tipoMovimiento: tipoMovimiento !== 'todos' ? tipoMovimiento as any : undefined,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      search: searchTerm || undefined,
      page: 1, // Resetear a la primera página al aplicar filtros
      limit: 100 // Aumentado a 100 elementos por página para mostrar más datos
    };

    console.log('🎯 Aplicando filtros desde UI:', {
      selectedTipo,
      selectedItem,
      selectedLote,
      tipoMovimiento,
      fechaInicio,
      fechaFin,
      searchTerm,
      nuevosFiltros
    });

    actualizarFiltros(nuevosFiltros);
  };

  // Cargar lotes cuando cambie el tipo o item seleccionado
  useEffect(() => {
    if (selectedItem !== 'todos' && selectedTipo !== 'todos') {
      cargarLotes(selectedTipo as 'vacuna' | 'jeringa', selectedItem);
    }
  }, [selectedTipo, selectedItem, cargarLotes]);

  // Removed automatic filter execution - filters now only execute when "Apply Filters" button is clicked


  // Funciones helper para obtener nombres de los datos relacionados
  const getItemNombre = (tipo: string, itemId: string) => {
    if (tipo === 'vacuna') {
      const vacuna = vacunas.find((v: Vacuna) => v.id === itemId);
      return vacuna?.nombre || 'Vacuna no encontrada';
    } else {
      const jeringa = jeringas.find((j: Jeringa) => j.id === itemId);
      return jeringa?.tipo || 'Jeringa no encontrada';
    }
  };

  const getLoteNumero = (movimiento: any) => {
    return movimiento.lote?.numero || 'Lote no encontrado';
  };

  const getEstablecimientoNombre = (establecimientoId: string | undefined) => {
    if (!establecimientoId) return '-';
    const establecimiento = establecimientos.find((e: Establecimiento) => e.id === establecimientoId);
    return establecimiento?.nombre || 'Establecimiento no encontrado';
  };

  const getTipoMovimientoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ingreso': return ArrowUpCircle;
      case 'salida': return ArrowDownCircle;
      case 'transferencia': return ArrowRightLeft;
      case 'ajuste': return Settings;
      default: return Activity;
    }
  };

  const getTipoMovimientoColor = (tipo: string) => {
    switch (tipo) {
      case 'ingreso': return 'text-green-600 bg-green-100';
      case 'salida': return 'text-red-600 bg-red-100';
      case 'transferencia': return 'text-blue-600 bg-blue-100';
      case 'ajuste': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Función para refrescar datos
  const handleRefresh = () => {
    refrescarTodo();
  };

  // Función para limpiar filtros (solo resetea UI, no ejecuta automáticamente)
  const handleLimpiarFiltros = () => {
    console.log('🧹 Limpiando filtros UI');
    setSelectedTipo('todos');
    setSelectedItem('todos');
    setSelectedLote('todos');
    setTipoMovimiento('todos');
    setSearchTerm('');
    setFechaInicio('');
    setFechaFin('');
    // No llamamos limpiarFiltros() aquí - el usuario debe hacer clic en "Aplicar Filtros"
  };

  // Mostrar loading inicial si están cargando los datos básicos
  if (loadingFiltros && vacunas.length === 0 && jeringas.length === 0 && establecimientos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando Sistema de Kardex</h3>
          <p className="text-gray-600">Obteniendo datos del servidor...</p>
        </div>
      </div>
    );
  }

  // Agrupar secciones por categoría
  const sectionsByCategory = KARDEX_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mostrar errores si existen */}
      {(error || errorEstadisticas || errorFiltros) && (
        <div className="mx-6 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
                <div className="mt-1 text-sm text-red-700">
                  {error && <p>• Movimientos: {error}</p>}
                  {errorEstadisticas && <p>• Estadísticas: {errorEstadisticas}</p>}
                  {errorFiltros && <p>• Filtros: {errorFiltros}</p>}
                </div>
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={limpiarErrores}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={refrescarTodo}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Kardex</h1>
                <p className="text-gray-600">Control detallado de movimientos y trazabilidad</p>
                {/* Indicador de estado de conexión */}
                <div className="flex items-center space-x-2 mt-1">
                  {loading || loadingEstadisticas || loadingFiltros ? (
                    <div className="flex items-center text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <span className="text-xs">Sincronizando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span className="text-xs">Conectado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading || loadingEstadisticas || loadingFiltros}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                title="Actualizar datos del servidor"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(loading || loadingEstadisticas || loadingFiltros) ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                title="Exportar datos a Excel"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                title="Imprimir reporte"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(sectionsByCategory).map(([categoryKey, sections]) => {
              const category = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
              const CategoryIcon = category.icon;
              
              return (
                <div key={categoryKey} className="relative group">
                  {/* Category Header */}
                  <div className={`flex items-center justify-center py-4 border-b-4 border-${category.color}-500 bg-${category.color}-50`}>
                    <CategoryIcon className={`h-5 w-5 text-${category.color}-600 mr-2`} />
                    <span className={`font-semibold text-${category.color}-800`}>{category.label}</span>
                  </div>
                  
                  {/* Section Buttons */}
                  <div className="bg-white">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            isActive ? `bg-${category.color}-50 border-l-4 border-l-${category.color}-500` : ''
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${isActive ? `text-${category.color}-600` : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${isActive ? `text-${category.color}-800` : 'text-gray-900'}`}>
                              {section.label}
                            </div>
                            {section.description && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {section.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area Premium */}
      <div className="max-w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {activeSection === 'movimientos' && (
            <MovimientosKardexTab
              selectedTipo={selectedTipo}
              setSelectedTipo={setSelectedTipo}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              selectedLote={selectedLote}
              setSelectedLote={setSelectedLote}
              fechaInicio={fechaInicio}
              setFechaInicio={setFechaInicio}
              fechaFin={fechaFin}
              setFechaFin={setFechaFin}
              tipoMovimiento={tipoMovimiento}
              setTipoMovimiento={setTipoMovimiento}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              movimientos={movimientos}
              estadisticas={estadisticas}
              total={total}
              vacunas={vacunas}
              jeringas={jeringas}
              lotes={lotes}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              loading={loading}
              loadingEstadisticas={loadingEstadisticas}
              loadingFiltros={loadingFiltros}
              getItemNombre={getItemNombre}
              getLoteNumero={getLoteNumero}
              getEstablecimientoNombre={getEstablecimientoNombre}
              getTipoMovimientoIcon={getTipoMovimientoIcon}
              getTipoMovimientoColor={getTipoMovimientoColor}
              onLimpiarFiltros={handleLimpiarFiltros}
              onAplicarFiltros={aplicarFiltros}
              onCambiarPagina={cambiarPagina}
              onCambiarItemsPorPagina={cambiarItemsPorPagina}
              onIrAPrimeraPagina={irAPrimeraPagina}
              onIrAUltimaPagina={irAUltimaPagina}
            />
          )}

          {activeSection === 'consultas' && (
            <ConsultasAvanzadasTab />
          )}

          {activeSection === 'reportes' && (
            <ReportesDetalladosTab />
          )}

          {activeSection === 'auditoria' && (
            <AuditoriaTab />
          )}
        </div>
      </div>
    </div>
  );
};

// Movement Details Modal Component
interface MovementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: any;
  getItemNombre: (tipo: string, itemId: string) => string;
  getLoteNumero: (movimiento: any) => string;
  getEstablecimientoNombre: (establecimientoId: string | undefined) => string;
  getTipoMovimientoIcon: (tipo: string) => any;
  getTipoMovimientoColor: (tipo: string) => string;
}

const MovementDetailsModal: React.FC<MovementDetailsModalProps> = ({
  isOpen,
  onClose,
  movement,
  getItemNombre,
  getLoteNumero,
  getEstablecimientoNombre,
  getTipoMovimientoIcon,
  getTipoMovimientoColor
}) => {
  // State for delivery breakdown
  const [deliveryBreakdown, setDeliveryBreakdown] = useState<DeliveryBreakdown | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // Load delivery breakdown for outbound movements
  useEffect(() => {
    const loadDeliveryBreakdown = async () => {
      if (!movement || movement.tipoMovimiento !== 'salida' || !movement.numeroDocumento) {
        setDeliveryBreakdown(null);
        return;
      }

      setLoadingDelivery(true);
      setDeliveryError(null);

      try {
        console.log('🔍 Cargando detalles de entrega para documento:', movement.numeroDocumento);
        const breakdown = await KardexService.getDeliveryBreakdown(movement.numeroDocumento);
        console.log('📦 Detalles de entrega obtenidos:', breakdown);
        setDeliveryBreakdown(breakdown);
      } catch (error) {
        console.error('❌ Error loading delivery breakdown:', error);
        setDeliveryError('Error al cargar detalles de entrega');
      } finally {
        setLoadingDelivery(false);
      }
    };

    if (isOpen && movement) {
      loadDeliveryBreakdown();
    }
  }, [isOpen, movement]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movement) return null;

  const TipoIcon = getTipoMovimientoIcon(movement.tipoMovimiento);
  const colorClass = getTipoMovimientoColor(movement.tipoMovimiento);
  const itemNombre = getItemNombre(movement.tipo, movement.itemId);
  const loteNumero = getLoteNumero(movement);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const movementDate = formatDate(movement.fechaMovimiento);
  const createdDate = formatDate(movement.createdAt);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 text-')} backdrop-blur-sm`}>
                  <TipoIcon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Detalles del Movimiento</h2>
                  <p className="text-slate-300 text-sm font-medium">
                    {movement.tipoMovimiento.charAt(0).toUpperCase() + movement.tipoMovimiento.slice(1)} • {movement.numeroDocumento}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-white transition-all duration-200 p-2.5 rounded-xl hover:bg-white hover:bg-opacity-10 group"
              >
                <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="max-h-[calc(95vh-140px)] overflow-y-auto">
            <div className="p-6 space-y-6">
            {/* Main Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Movement Type Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2.5 rounded-lg ${colorClass.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 text-')}`}>
                      <TipoIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-slate-600">Tipo de Movimiento</h3>
                      <p className="text-lg font-bold text-slate-900 capitalize">{movement.tipoMovimiento}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {movement.documento} • {movement.numeroDocumento}
                </div>
              </div>

              {/* Quantity Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-emerald-500 bg-opacity-20 text-emerald-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-slate-600">Cantidad</h3>
                      <p className="text-lg font-bold text-slate-900">{movement.cantidad.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  Saldo: {movement.saldoAnterior.toLocaleString()} → {movement.saldoActual.toLocaleString()}
                </div>
              </div>

              {/* Date Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 rounded-lg bg-purple-500 bg-opacity-20 text-purple-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-slate-600">Fecha</h3>
                      <p className="text-lg font-bold text-slate-900">{movementDate.date}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  {movementDate.time}
                </div>
              </div>
            </div>

            {/* Item Details Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl ${movement.tipo === 'vacuna' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                  {movement.tipo === 'vacuna' ? (
                    <Shield className="h-6 w-6" />
                  ) : (
                    <Syringe className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-slate-900">Detalles del Ítem</h3>
                  <p className="text-sm text-slate-500">Información del producto y lote</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo de Producto</label>
                    <p className="text-lg font-semibold text-slate-900 capitalize mt-1">{movement.tipo}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre del Producto</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{itemNombre}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Número de Lote</label>
                    <p className="text-lg font-mono font-semibold text-slate-900 mt-1">{loteNumero}</p>
                  </div>
                  {movement.lote?.fechaVencimiento && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha de Vencimiento</label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        {new Date(movement.lote.fechaVencimiento).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Quantity Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Hash className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Información de Cantidades</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Cantidad Movida:</span>
                    <span className="text-sm font-bold text-gray-900">{movement.cantidad.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Saldo Anterior:</span>
                    <span className="text-sm text-gray-900">{movement.saldoAnterior.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Saldo Actual:</span>
                    <span className="text-sm font-bold text-gray-900">{movement.saldoActual.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Diferencia:</span>
                      <span className={`text-sm font-bold ${
                        movement.saldoActual - movement.saldoAnterior > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {movement.saldoActual - movement.saldoAnterior > 0 ? '+' : ''}
                        {(movement.saldoActual - movement.saldoAnterior).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              {(movement.establecimientoOrigenId || movement.establecimientoDestinoId ||
                movement.tipoMovimiento === 'salida') && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Building className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Ubicaciones</h3>
                  </div>
                  <div className="space-y-3">
                    {/* Collection Center for Outbound Movements */}
                    {movement.tipoMovimiento === 'salida' && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Centro de Acopio:</span>
                        <div className="text-right">
                          {deliveryBreakdown?.centroAcopio ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">
                                {deliveryBreakdown.centroAcopio.nombre}
                              </div>
                              <div className="text-xs text-gray-500">
                                Código: {deliveryBreakdown.centroAcopio.codigo}
                              </div>
                            </>
                          ) : loadingDelivery ? (
                            <div className="flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">Cargando...</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No disponible</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Standard Origin/Destination Establishments */}
                    {movement.establecimientoOrigenId && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Establecimiento Origen:</span>
                        <span className="text-sm text-gray-900">
                          {getEstablecimientoNombre(movement.establecimientoOrigenId)}
                        </span>
                      </div>
                    )}
                    {movement.establecimientoDestinoId && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Establecimiento Destino:</span>
                        <span className="text-sm text-gray-900">
                          {getEstablecimientoNombre(movement.establecimientoDestinoId)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audit Trail */}
              <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
                <div className="flex items-center mb-3">
                  <User className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Información de Auditoría</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Usuario:</span>
                      <span className="text-sm text-gray-900">
                        {movement.usuario ? `${movement.usuario.nombres} ${movement.usuario.apellidos}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900">{movement.usuario?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Fecha de Registro:</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">{createdDate.date}</div>
                        <div className="text-xs text-gray-500">{createdDate.time}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observations */}
                {movement.observaciones && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 text-gray-600 mr-2 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-600">Observaciones:</span>
                        <p className="text-sm text-gray-900 mt-1 leading-relaxed">{movement.observaciones}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Breakdown Section - Only for outbound movements */}
              {movement.tipoMovimiento === 'salida' && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 lg:col-span-2 border border-orange-200">
                  <div className="flex items-center mb-4">
                    <Building className="h-5 w-5 text-orange-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Detalles de Entrega</h3>
                    {loadingDelivery && (
                      <Loader2 className="h-4 w-4 animate-spin text-orange-600 ml-2" />
                    )}
                  </div>

                  {loadingDelivery ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-600 mr-2" />
                      <span className="text-sm text-gray-600">Cargando detalles de entrega...</span>
                    </div>
                  ) : deliveryError ? (
                    <div className="flex items-center justify-center py-8">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-sm text-red-600">{deliveryError}</span>
                    </div>
                  ) : deliveryBreakdown ? (
                    <div className="space-y-4">
                      {/* Vale Information */}
                      <div className="bg-white rounded-lg p-4 border border-orange-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vale de Entrega</span>
                            <p className="text-sm font-mono text-gray-900 mt-1">{deliveryBreakdown.numeroVale}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Centro de Acopio</span>
                            <p className="text-sm text-gray-900 mt-1">{deliveryBreakdown.centroAcopio.nombre}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Generación</span>
                            <p className="text-sm text-gray-900 mt-1">
                              {deliveryBreakdown.fechaGeneracion.toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-orange-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-orange-600 mr-2" />
                              <span className="text-xs font-medium text-gray-600">Total Establecimientos</span>
                            </div>
                            <p className="text-lg font-bold text-orange-600 mt-1">
                              {deliveryBreakdown.totalEstablecimientos}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-xs font-medium text-gray-600">Total Vacunas</span>
                            </div>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              {deliveryBreakdown.totalVacunas.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Details Table */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                          <div className="flex items-center">
                            <Building className="h-5 w-5 text-slate-600 mr-3" />
                            <h4 className="text-lg font-bold text-slate-900">Distribución por Establecimiento</h4>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">Detalle de cantidades entregadas por establecimiento</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Establecimiento
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Producto
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Cantidad Entregada
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  Estado
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                              {deliveryBreakdown.detalles.map((detalle, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors duration-150">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                          <Building className="h-5 w-5 text-blue-600" />
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-bold text-slate-900">{detalle.establecimientoNombre}</div>
                                        <div className="text-xs text-slate-500 font-mono">{detalle.establecimientoCodigo}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-8 w-8">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                          <Shield className="h-4 w-4 text-emerald-600" />
                                        </div>
                                      </div>
                                      <div className="ml-3">
                                        <div className="text-sm font-medium text-slate-900">{detalle.vacunaNombre}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="text-lg font-bold text-slate-900">
                                      {detalle.cantidadEntregada.toLocaleString()}
                                    </div>
                                    {detalle.cantidadAdicional && detalle.cantidadAdicional > 0 && (
                                      <div className="text-xs text-orange-600 font-medium">
                                        +{detalle.cantidadAdicional.toLocaleString()} adicional
                                      </div>
                                    )}
                                    {detalle.cantidadProgramada && detalle.cantidadProgramada > 0 && (
                                      <div className="text-xs text-slate-500">
                                        Base: {detalle.cantidadProgramada.toLocaleString()}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    {detalle.numeroEntregaAdicional ? (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                                        <Plus className="h-3 w-3 mr-1" />
                                        Adicional #{detalle.numeroEntregaAdicional}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Programada
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Info className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        No se encontraron detalles de entrega para este movimiento
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-500 font-mono">
                ID: {movement.id}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  loading?: boolean;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  total,
  onPageChange,
  onItemsPerPageChange,
  onFirstPage,
  onLastPage,
  loading = false
}) => {
  // Calculate the range of items being displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  // Generate page numbers to display (current page ± 2)
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const itemsPerPageOptions = [25, 50, 100, 200, 500];

  if (total === 0) return null;

  return (
    <div className="bg-white px-6 py-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        {/* Items per page selector and info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={loading}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">por página</span>
          </div>

          <div className="text-sm text-gray-700">
            Mostrando {startItem.toLocaleString()}-{endItem.toLocaleString()} de {total.toLocaleString()} resultados
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          {/* First page button */}
          <button
            onClick={onFirstPage}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Primera página"
          >
            ««
          </button>

          {/* Previous page button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Página anterior"
          >
            «
          </button>

          {/* Page number buttons */}
          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className={`px-3 py-1 text-sm border rounded ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50'
              } disabled:cursor-not-allowed`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next page button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Página siguiente"
          >
            »
          </button>

          {/* Last page button */}
          <button
            onClick={onLastPage}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Última página"
          >
            »»
          </button>
        </div>
      </div>
    </div>
  );
};

// Tab de Movimientos de Kardex
interface MovimientosKardexTabProps {
  selectedTipo: string;
  setSelectedTipo: (tipo: any) => void;
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  selectedLote: string;
  setSelectedLote: (lote: string) => void;
  fechaInicio: string;
  setFechaInicio: (fecha: string) => void;
  fechaFin: string;
  setFechaFin: (fecha: string) => void;
  tipoMovimiento: string;
  setTipoMovimiento: (tipo: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  // Datos del backend
  movimientos: any[];
  estadisticas: any;
  total: number;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  lotes: any[];
  // Datos de paginación
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  // Estados de carga
  loading: boolean;
  loadingEstadisticas: boolean;
  loadingFiltros: boolean;
  // Funciones helper
  getItemNombre: (tipo: string, itemId: string) => string;
  getLoteNumero: (movimiento: any) => string;
  getEstablecimientoNombre: (establecimientoId: string | undefined) => string;
  getTipoMovimientoIcon: (tipo: string) => any;
  getTipoMovimientoColor: (tipo: string) => string;
  onLimpiarFiltros: () => void;
  onAplicarFiltros: () => void;
  // Funciones de paginación
  onCambiarPagina: (page: number) => void;
  onCambiarItemsPorPagina: (itemsPerPage: number) => void;
  onIrAPrimeraPagina: () => void;
  onIrAUltimaPagina: () => void;
}

const MovimientosKardexTab: React.FC<MovimientosKardexTabProps> = ({
  selectedTipo,
  setSelectedTipo,
  selectedItem,
  setSelectedItem,
  selectedLote,
  setSelectedLote,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  tipoMovimiento,
  setTipoMovimiento,
  searchTerm,
  setSearchTerm,
  movimientos,
  estadisticas,
  total,
  vacunas,
  jeringas,
  lotes,
  currentPage,
  itemsPerPage,
  totalPages,
  loading,
  loadingEstadisticas,
  loadingFiltros,
  getItemNombre,
  getLoteNumero,
  getEstablecimientoNombre,
  getTipoMovimientoIcon,
  getTipoMovimientoColor,
  onLimpiarFiltros,
  onAplicarFiltros,
  onCambiarPagina,
  onCambiarItemsPorPagina,
  onIrAPrimeraPagina,
  onIrAUltimaPagina,
}) => {
  // Modal state for movement details
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open modal with movement details
  const handleViewDetails = (movement: any) => {
    setSelectedMovement(movement);
    setIsModalOpen(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovement(null);
  };

  // Usar estadísticas del backend si están disponibles, sino calcular localmente
  const totalIngresos = estadisticas?.totalIngresos || 0;
  const totalSalidas = estadisticas?.totalSalidas || 0;
  const totalTransferencias = estadisticas?.totalTransferencias || 0;
  const saldoActual = estadisticas?.saldoActualTotal || 0;

  return (
    <div className="space-y-6">
      {/* Filtros Premium */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="bg-blue-600 p-2 rounded-lg mr-3">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tipo de Item</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              <option value="todos">Todos los tipos</option>
              <option value="vacuna">Vacunas</option>
              <option value="jeringa">Jeringas</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {selectedTipo === 'vacuna' ? 'Vacuna' : 'Jeringa'}
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 disabled:bg-gray-50"
              disabled={loadingFiltros}
            >
              <option value="todos">Todos los items</option>
              {selectedTipo === 'vacuna'
                ? (vacunas && vacunas.length > 0 ? vacunas.map((vacuna: Vacuna) => (
                    <option key={vacuna.id} value={vacuna.id}>
                      {vacuna.nombre}
                    </option>
                  )) : null)
                : (jeringas && jeringas.length > 0 ? jeringas.map((jeringa: Jeringa) => (
                    <option key={jeringa.id} value={jeringa.id}>
                      {jeringa.tipo} - {jeringa.capacidad}
                    </option>
                  )) : null)
              }
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Lote</label>
            <select
              value={selectedLote}
              onChange={(e) => setSelectedLote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 disabled:bg-gray-50"
              disabled={loadingFiltros}
            >
              <option value="todos">Todos los lotes</option>
              {lotes && lotes.length > 0 && lotes.map((lote: any) => (
                <option key={lote.id} value={lote.id}>
                  {lote.numero}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tipo de Movimiento</label>
            <select
              value={tipoMovimiento}
              onChange={(e) => setTipoMovimiento(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              <option value="todos">Todos los movimientos</option>
              <option value="ingreso">Ingresos</option>
              <option value="salida">Salidas</option>
              <option value="transferencia">Transferencias</option>
              <option value="ajuste">Ajustes</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Fecha Inicio</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Fecha Fin</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Búsqueda General</label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por documento, observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción premium */}
        <div className="flex items-center justify-center space-x-4 pt-6 border-t border-blue-200">
          <button
            onClick={onAplicarFiltros}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Search className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </button>
          <button
            onClick={onLimpiarFiltros}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Estadísticas Premium */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                  {loadingEstadisticas ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <ArrowUpCircle className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-green-700 mb-1">Total Ingresos</p>
              <p className="text-3xl font-bold text-green-600">
                {loadingEstadisticas ? '...' : totalIngresos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                  {loadingEstadisticas ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <ArrowDownCircle className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-red-700 mb-1">Total Salidas</p>
              <p className="text-3xl font-bold text-red-600">
                {loadingEstadisticas ? '...' : totalSalidas.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  {loadingEstadisticas ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <ArrowRightLeft className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-blue-700 mb-1">Transferencias</p>
              <p className="text-3xl font-bold text-blue-600">
                {loadingEstadisticas ? '...' : totalTransferencias.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  {loadingEstadisticas ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Package className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-purple-700 mb-1">Saldo Total</p>
              <p className="text-3xl font-bold text-purple-600">
                {loadingEstadisticas ? '...' : saldoActual.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos Premium */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Movimientos de Kardex</h3>
                <p className="text-sm text-gray-600">
                  {total.toLocaleString()} registros encontrados
                  {(selectedTipo !== 'todos' || selectedItem !== 'todos' || selectedLote !== 'todos' ||
                    tipoMovimiento !== 'todos' || searchTerm || fechaInicio || fechaFin) && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Filter className="h-3 w-3 mr-1" />
                      Filtrado
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {loading && (
                <div className="flex items-center text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Cargando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Movimiento
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Item / Lote
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                      <span className="text-gray-600">Cargando movimientos...</span>
                    </div>
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No se encontraron movimientos con los filtros aplicados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                movimientos && movimientos.length > 0 ? movimientos.map((movimiento: any) => {
                  const TipoIcon = getTipoMovimientoIcon(movimiento.tipoMovimiento);
                  const colorClass = getTipoMovimientoColor(movimiento.tipoMovimiento);

                  return (
                    <tr key={movimiento.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {new Date(movimiento.fechaMovimiento).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(movimiento.fechaMovimiento).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          <TipoIcon className="h-3 w-3 mr-1" />
                          {movimiento.tipoMovimiento.charAt(0).toUpperCase() + movimiento.tipoMovimiento.slice(1)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {movimiento.item?.nombre || getItemNombre(movimiento.tipo, movimiento.itemId)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getLoteNumero(movimiento)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{movimiento.documento}</div>
                          <div className="text-xs text-gray-500 font-mono">{movimiento.numeroDocumento}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-bold ${
                            movimiento.cantidad > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movimiento.cantidad > 0 ? '+' : ''}{movimiento.cantidad.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm">
                          <div className="text-gray-500 text-xs">Anterior:</div>
                          <div className="font-medium text-gray-900">{movimiento.saldoAnterior.toLocaleString()}</div>
                          <div className="text-blue-600 text-xs">Actual:</div>
                          <div className="font-bold text-blue-600">{movimiento.saldoActual.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetails(movimiento)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors duration-150"
                          title="Ver detalles completos"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Detalles
                        </button>
                      </td>
                    </tr>
                  );
                }) : null
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          total={total}
          onPageChange={onCambiarPagina}
          onItemsPerPageChange={onCambiarItemsPorPagina}
          onFirstPage={onIrAPrimeraPagina}
          onLastPage={onIrAUltimaPagina}
          loading={loading}
        />

        {/* Movement Details Modal */}
        <MovementDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          movement={selectedMovement}
          getItemNombre={getItemNombre}
          getLoteNumero={getLoteNumero}
          getEstablecimientoNombre={getEstablecimientoNombre}
          getTipoMovimientoIcon={getTipoMovimientoIcon}
          getTipoMovimientoColor={getTipoMovimientoColor}
        />
      </div>
    </div>
  );
};

// Tab de Consultas Avanzadas
const ConsultasAvanzadasTab: React.FC = () => {
  const consultasPredefindas = [
    {
      id: 'stock-critico',
      nombre: 'Stock Crítico por Vacuna',
      descripcion: 'Vacunas con stock por debajo del mínimo establecido',
      icono: '⚠️',
      color: 'bg-red-50 border-red-200 text-red-800'
    },
    {
      id: 'movimientos-mes',
      nombre: 'Movimientos del Mes Actual',
      descripcion: 'Todos los movimientos registrados en el mes en curso',
      icono: '📅',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'lotes-vencimiento',
      nombre: 'Lotes Próximos a Vencer',
      descripcion: 'Lotes que vencen en los próximos 30 días',
      icono: '⏰',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      id: 'transferencias-pendientes',
      nombre: 'Transferencias Pendientes',
      descripcion: 'Transferencias iniciadas pero no confirmadas',
      icono: '🔄',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      id: 'consumo-establecimiento',
      nombre: 'Consumo por Establecimiento',
      descripcion: 'Análisis de consumo histórico por establecimiento',
      icono: '📊',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      id: 'discrepancias',
      nombre: 'Discrepancias de Inventario',
      descripcion: 'Diferencias entre stock teórico y físico',
      icono: '🔍',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 Consultas Predefinidas</h3>
        <p className="text-gray-600 mb-6">
          Acceda rápidamente a consultas frecuentes y análisis especializados del inventario
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consultasPredefindas.map((consulta) => (
            <div key={consulta.id} className={`border-2 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${consulta.color}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{consulta.nombre}</h4>
                <span className="text-2xl">{consulta.icono}</span>
              </div>
              <p className="text-sm mb-4 opacity-80">{consulta.descripcion}</p>
              <button className="w-full px-4 py-2 bg-white bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-colors text-sm font-medium">
                Ejecutar Consulta
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Constructor de Consultas Personalizadas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🛠️ Constructor de Consultas Personalizadas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campo</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Tipo de Item</option>
              <option>Fecha de Movimiento</option>
              <option>Tipo de Movimiento</option>
              <option>Establecimiento</option>
              <option>Cantidad</option>
              <option>Saldo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operador</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Igual a</option>
              <option>Mayor que</option>
              <option>Menor que</option>
              <option>Entre</option>
              <option>Contiene</option>
              <option>No contiene</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input
              type="text"
              placeholder="Ingrese el valor"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Agregar Condición
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Ejecutar Consulta
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Guardar Consulta
          </button>
        </div>
      </div>

      {/* Resultados de Consulta */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Resultados de Consulta</h3>
        <div className="text-center py-12 text-gray-500">
          <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Ejecute una consulta para ver los resultados aquí</p>
        </div>
      </div>
    </div>
  );
};

// Tab de Reportes Detallados
const ReportesDetalladosTab: React.FC = () => {
  const tiposReporte = [
    {
      id: 'kardex-completo',
      nombre: 'Kardex Completo',
      descripcion: 'Reporte completo de todos los movimientos por período',
      icono: '📊',
      formato: ['PDF', 'Excel', 'CSV']
    },
    {
      id: 'resumen-movimientos',
      nombre: 'Resumen de Movimientos',
      descripcion: 'Resumen ejecutivo de ingresos, salidas y transferencias',
      icono: '📈',
      formato: ['PDF', 'Excel']
    },
    {
      id: 'analisis-consumo',
      nombre: 'Análisis de Consumo',
      descripcion: 'Análisis detallado del consumo por establecimiento y vacuna',
      icono: '📉',
      formato: ['PDF', 'Excel']
    },
    {
      id: 'trazabilidad-lote',
      nombre: 'Trazabilidad de Lote',
      descripcion: 'Seguimiento completo de un lote específico',
      icono: '🔍',
      formato: ['PDF']
    },
    {
      id: 'auditoria-inventario',
      nombre: 'Auditoría de Inventario',
      descripcion: 'Reporte de auditoría con discrepancias y ajustes',
      icono: '🔒',
      formato: ['PDF', 'Excel']
    },
    {
      id: 'proyeccion-stock',
      nombre: 'Proyección de Stock',
      descripcion: 'Proyección de stock basada en consumo histórico',
      icono: '🔮',
      formato: ['PDF', 'Excel']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Configuración de Reporte */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ Configuración de Reporte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Último mes</option>
              <option>Últimos 3 meses</option>
              <option>Último semestre</option>
              <option>Último año</option>
              <option>Personalizado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Establecimiento</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos</option>
              <option>Centro de Acopio San Jerónimo</option>
              <option>Centro de Acopio Andahuaylas</option>
              <option>Centro de Acopio Chincheros</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Item</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos</option>
              <option>Solo Vacunas</option>
              <option>Solo Jeringas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Detalle</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Resumen</option>
              <option>Detallado</option>
              <option>Completo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tipos de Reporte */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Tipos de Reporte Disponibles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiposReporte.map((reporte) => (
            <div key={reporte.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{reporte.icono}</span>
                  <h4 className="font-medium text-gray-900">{reporte.nombre}</h4>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{reporte.descripcion}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {reporte.formato.map((formato) => (
                    <span key={formato} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {formato}
                    </span>
                  ))}
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Generar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reportes Programados */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">⏰ Reportes Programados</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Reporte Mensual de Kardex</h4>
              <p className="text-sm text-gray-600">Se genera automáticamente el primer día de cada mes</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Activo</span>
              <button className="text-blue-600 hover:text-blue-800">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Análisis Semanal de Stock</h4>
              <p className="text-sm text-gray-600">Se genera todos los lunes a las 8:00 AM</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Activo</span>
              <button className="text-blue-600 hover:text-blue-800">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Programar Nuevo Reporte
        </button>
      </div>
    </div>
  );
};

// Tab de Auditoría
const AuditoriaTab: React.FC = () => {
  const eventosAuditoria = [
    {
      id: '1',
      fecha: new Date('2024-12-15T10:30:00'),
      usuario: 'María Rodríguez',
      accion: 'Modificación de Stock',
      detalle: 'Ajuste de inventario BCG - Lote BCG-2024-001',
      tipo: 'modificacion',
      impacto: 'medio'
    },
    {
      id: '2',
      fecha: new Date('2024-12-14T16:45:00'),
      usuario: 'Carlos Mendoza',
      accion: 'Transferencia Autorizada',
      detalle: 'Transferencia de 100 unidades HVB a C.S. San Jerónimo',
      tipo: 'transferencia',
      impacto: 'alto'
    },
    {
      id: '3',
      fecha: new Date('2024-12-14T09:15:00'),
      usuario: 'Ana García',
      accion: 'Consulta de Kardex',
      detalle: 'Consulta de movimientos de Pentavalente - Noviembre 2024',
      tipo: 'consulta',
      impacto: 'bajo'
    },
    {
      id: '4',
      fecha: new Date('2024-12-13T14:20:00'),
      usuario: 'Sistema',
      accion: 'Alerta Automática',
      detalle: 'Stock crítico detectado en Neumococo - Lote NEUMO-2024-001',
      tipo: 'alerta',
      impacto: 'alto'
    },
    {
      id: '5',
      fecha: new Date('2024-12-13T11:30:00'),
      usuario: 'José Huamán',
      accion: 'Ingreso de Lote',
      detalle: 'Registro de nuevo lote APO-2024-002 - 500 unidades',
      tipo: 'ingreso',
      impacto: 'medio'
    }
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'modificacion': return 'bg-yellow-100 text-yellow-800';
      case 'transferencia': return 'bg-blue-100 text-blue-800';
      case 'consulta': return 'bg-gray-100 text-gray-800';
      case 'alerta': return 'bg-red-100 text-red-800';
      case 'ingreso': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'alto': return 'text-red-600';
      case 'medio': return 'text-yellow-600';
      case 'bajo': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas de Auditoría */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Eventos Hoy</p>
              <p className="text-2xl font-bold text-blue-600">24</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
              <p className="text-2xl font-bold text-yellow-600">3</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-purple-600">2.3m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Auditoría */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos los eventos</option>
              <option>Modificaciones</option>
              <option>Transferencias</option>
              <option>Consultas</option>
              <option>Alertas</option>
              <option>Ingresos</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos los usuarios</option>
              <option>María Rodríguez</option>
              <option>Carlos Mendoza</option>
              <option>Ana García</option>
              <option>José Huamán</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Impacto</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos los niveles</option>
              <option>Alto impacto</option>
              <option>Medio impacto</option>
              <option>Bajo impacto</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Últimas 24 horas</option>
              <option>Última semana</option>
              <option>Último mes</option>
              <option>Personalizado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log de Auditoría */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">🔒 Log de Auditoría</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalle
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impacto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventosAuditoria.map((evento) => (
                <tr key={evento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {evento.fecha.toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {evento.fecha.toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-gray-600">
                          {evento.usuario.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      {evento.usuario}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {evento.accion}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={evento.detalle}>
                      {evento.detalle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(evento.tipo)}`}>
                      {evento.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-medium ${getImpactoColor(evento.impacto)}`}>
                      {evento.impacto.charAt(0).toUpperCase() + evento.impacto.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuración de Auditoría */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ Configuración de Auditoría</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Eventos a Auditar</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Modificaciones de inventario</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Transferencias entre establecimientos</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Consultas de kardex</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Alertas del sistema</span>
              </label>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Retención de Logs</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de retención
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>6 meses</option>
                  <option>1 año</option>
                  <option>2 años</option>
                  <option>5 años</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Backup automático de logs</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Guardar Configuración
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Exportar Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Kardex;