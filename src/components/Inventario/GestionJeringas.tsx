import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Syringe, Search, Filter, Eye, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Jeringa, CreateJeringaDto, UpdateJeringaDto } from '../../types';
import { useJeringas } from '../../hooks/useJeringas';
import { useToastContext } from '../../contexts/ToastContext';
import { logger } from '../../utils/debug';

const GestionJeringas: React.FC = () => {
  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterCapacidad, setFilterCapacidad] = useState<string>('');
  const [filterColor, setFilterColor] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingJeringa, setEditingJeringa] = useState<Jeringa | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Hook personalizado para gestión de jeringas
  const {
    jeringas,
    pagination,
    isLoading,
    error,
    createJeringa,
    updateJeringa,
    deleteJeringa,
    search,
    applyFilters,
    changePage,
    refresh,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError
  } = useJeringas();

  // Context para notificaciones
  const { toast } = useToastContext();

  // Efectos para manejar filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        search(searchTerm);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, search]);

  useEffect(() => {
    applyFilters({
      estado: filterEstado === 'todos' ? undefined : filterEstado as 'activo' | 'inactivo',
      tipo: filterTipo || undefined,
      capacidad: filterCapacidad || undefined,
      color: filterColor || undefined
    });
  }, [filterEstado, filterTipo, filterCapacidad, filterColor, applyFilters]);

  const handleCreate = () => {
    setEditingJeringa(null);
    setShowModal(true);
  };

  const handleEdit = (jeringa: Jeringa) => {
    setEditingJeringa(jeringa);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const jeringa = jeringas.find(j => j.id === id);
    const lotesRelacionados = jeringa?._count?.lotes || 0;
    
    if (lotesRelacionados > 0) {
      if (!window.confirm(`Esta jeringa tiene ${lotesRelacionados} lote(s) asociado(s). ¿Está seguro de eliminarla? Esto también eliminará todos los lotes relacionados.`)) {
        return;
      }
    } else {
      if (!window.confirm(`¿Está seguro de eliminar la jeringa "${jeringa?.tipo} ${jeringa?.capacidad}"?`)) {
        return;
      }
    }
    
    try {
      const success = await deleteJeringa(id);
      if (success) {
        toast.success('Jeringa eliminada exitosamente');
      } else {
        toast.error(deleteError || 'Error al eliminar jeringa');
      }
    } catch (error) {
      logger.error('Error al eliminar jeringa:', error);
      toast.error('Error al eliminar jeringa');
    }
  };

  const handleSubmit = async (formData: CreateJeringaDto | UpdateJeringaDto) => {
    try {
      let success = false;
      
      if (editingJeringa) {
        success = await updateJeringa(editingJeringa.id, formData as UpdateJeringaDto);
        if (success) {
          toast.success('Jeringa actualizada exitosamente');
        } else {
          toast.error(updateError || 'Error al actualizar jeringa');
        }
      } else {
        success = await createJeringa(formData as CreateJeringaDto);
        if (success) {
          toast.success('Jeringa creada exitosamente');
        } else {
          toast.error(createError || 'Error al crear jeringa');
        }
      }
      
      if (success) {
        setShowModal(false);
        setEditingJeringa(null);
      }
    } catch (error) {
      logger.error('Error en operación de jeringa:', error);
      toast.error('Error en la operación');
    }
  };

  const getStockInfo = (jeringa: Jeringa) => {
    const stockTotal = jeringa.lotes?.reduce((total, lote) => total + lote.cantidadActual, 0) || 0;
    const lotesActivos = jeringa.lotes?.filter(l => l.estado === 'disponible').length || 0;
    const lotesAgotados = jeringa.lotes?.filter(l => l.estado === 'agotado').length || 0;

    return { stockTotal, lotesActivos, lotesAgotados };
  };

  // Mostrar loading si está cargando
  if (isLoading && jeringas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando jeringas...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay error
  if (error && jeringas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-600 p-3 rounded-xl shadow-lg">
              <Syringe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catálogo de Jeringas</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              Nueva Jeringa
            </button>
          </div>
        </div>
      </div>

      {/* Filtros Premium */}
      <div className="bg-white mx-6 mt-6 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por tipo, capacidad o color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los tipos</option>
              <option value="Desechable">Desechable</option>
              <option value="Autoretraíble">Autoretraíble</option>
              <option value="De seguridad">De seguridad</option>
              <option value="Para insulina">Para insulina</option>
              <option value="Tuberculina">Tuberculina</option>
            </select>
            <select
              value={filterCapacidad}
              onChange={(e) => setFilterCapacidad(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todas las capacidades</option>
              <option value="0.5ml">0.5ml</option>
              <option value="1ml">1ml</option>
              <option value="2ml">2ml</option>
              <option value="3ml">3ml</option>
              <option value="5ml">5ml</option>
              <option value="10ml">10ml</option>
              <option value="20ml">20ml</option>
            </select>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los colores</option>
              <option value="Transparente">Transparente</option>
              <option value="Azul">Azul</option>
              <option value="Verde">Verde</option>
              <option value="Rojo">Rojo</option>
              <option value="Amarillo">Amarillo</option>
              <option value="Naranja">Naranja</option>
              <option value="Morado">Morado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mx-6 mt-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-gray-600 font-medium">Cargando jeringas...</span>
          </div>
        )}

        {/* Table Premium */}
        {!isLoading && !error && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Jeringa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Capacidad & Color
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stock Total
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lotes
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jeringas.map((jeringa, index) => {
                    const stockInfo = getStockInfo(jeringa);
                    const isExpanded = showDetails === jeringa.id;

                    return (
                      <React.Fragment key={jeringa.id}>
                        <tr className={`hover:bg-emerald-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                  <Syringe className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{jeringa.tipo}</div>
                                <div className="text-sm text-gray-500">Jeringa médica</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{jeringa.capacidad}</div>
                            <div className="flex items-center text-sm text-gray-500">
                              <div 
                                className={`w-3 h-3 rounded-full border border-gray-300 mr-2 ${
                                  jeringa.color.toLowerCase() === 'transparente' ? 'bg-white' :
                                  jeringa.color.toLowerCase() === 'azul' ? 'bg-blue-500' :
                                  jeringa.color.toLowerCase() === 'verde' ? 'bg-green-500' :
                                  jeringa.color.toLowerCase() === 'rojo' ? 'bg-red-500' :
                                  jeringa.color.toLowerCase() === 'amarillo' ? 'bg-yellow-500' :
                                  'bg-gray-300'
                                }`}
                              ></div>
                              {jeringa.color}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-lg font-bold ${
                              stockInfo.stockTotal > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stockInfo.stockTotal.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-green-600 font-semibold">{stockInfo.lotesActivos}</div>
                                <div className="text-gray-500">Activos</div>
                              </div>
                              <div className="text-center">
                                <div className="text-red-600 font-semibold">{stockInfo.lotesAgotados}</div>
                                <div className="text-gray-500">Agotados</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              jeringa.estado === 'activo' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {jeringa.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                onClick={() => setShowDetails(isExpanded ? null : jeringa.id)}
                                className="text-gray-400 hover:text-emerald-600 transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(jeringa)}
                                disabled={isUpdating}
                                className="text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                title="Editar"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Edit className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(jeringa.id)}
                                disabled={isDeleting}
                                className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Eliminar"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Detalles expandibles */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-emerald-50 border-l-4 border-emerald-500">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Información del Producto</h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-gray-600">Tipo completo:</span>
                                      <span className="ml-2 text-gray-900 font-medium">{jeringa.tipo}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Creado:</span>
                                      <span className="ml-2 text-gray-900 font-medium">{jeringa.createdAt.toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">ID:</span>
                                      <span className="ml-2 text-gray-500 font-mono text-xs">{jeringa.id}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Estadísticas</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Lotes totales:</span>
                                      <span className="text-gray-900 font-medium">{jeringa._count?.lotes || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {jeringas.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay jeringas registradas</h3>
          <p className="text-gray-600 mb-4">Comience agregando la primera jeringa al catálogo</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Nueva Jeringa
          </button>
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} jeringas
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || isLoading}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <JeringaModal
          jeringa={editingJeringa}
          onClose={() => {
            setShowModal(false);
            setEditingJeringa(null);
          }}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

// Modal Component
interface JeringaModalProps {
  jeringa: Jeringa | null;
  onClose: () => void;
  onSubmit: (data: CreateJeringaDto | UpdateJeringaDto) => void;
  isLoading?: boolean;
}

const JeringaModal: React.FC<JeringaModalProps> = ({ jeringa, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    tipo: jeringa?.tipo || 'Desechable',
    capacidad: jeringa?.capacidad || '1ml',
    color: jeringa?.color || 'Transparente',
    estado: jeringa?.estado || 'activo',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full m-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {jeringa ? 'Editar Jeringa' : 'Nueva Jeringa'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Jeringa *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Desechable">Desechable</option>
                <option value="Autoretraíble">Autoretraíble</option>
                <option value="De seguridad">De seguridad</option>
                <option value="Para insulina">Para insulina</option>
                <option value="Tuberculina">Tuberculina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad *
              </label>
              <select
                required
                value={formData.capacidad}
                onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="0.5ml">0.5ml</option>
                <option value="1ml">1ml</option>
                <option value="2ml">2ml</option>
                <option value="3ml">3ml</option>
                <option value="5ml">5ml</option>
                <option value="10ml">10ml</option>
                <option value="20ml">20ml</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color *
              </label>
              <select
                required
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Transparente">Transparente</option>
                <option value="Azul">Azul</option>
                <option value="Verde">Verde</option>
                <option value="Rojo">Rojo</option>
                <option value="Amarillo">Amarillo</option>
                <option value="Naranja">Naranja</option>
                <option value="Morado">Morado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value as 'activo' | 'inactivo'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {jeringa ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    {jeringa ? 'Actualizar' : 'Crear'} Jeringa
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GestionJeringas;
