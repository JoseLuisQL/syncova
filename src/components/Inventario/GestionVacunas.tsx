import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search, Filter, Eye, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Vacuna, CreateVacunaDto, UpdateVacunaDto } from '../../types';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import { logger } from '../../utils/debug';

const GestionVacunas: React.FC = () => {
  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingVacuna, setEditingVacuna] = useState<Vacuna | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Hook personalizado para gestión de vacunas
  const {
    vacunas,
    pagination,
    isLoading,
    error,
    createVacuna,
    updateVacuna,
    deleteVacuna,
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
  } = useVacunas();

  // Hook para toast notifications
  const { toast } = useToastContext();

  // Efectos para manejar filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        search(searchTerm);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    applyFilters({
      estado: filterEstado === 'todos' ? undefined : filterEstado as 'activo' | 'inactivo',
      tipo: filterTipo || undefined
    });
  }, [filterEstado, filterTipo]);

  // Mostrar toast cuando hay errores de carga
  useEffect(() => {
    if (error) {
      toast.error(
        'Error al cargar vacunas',
        'No se pudieron cargar las vacunas. Verifique su conexión e intente nuevamente.',
        {
          duration: 8000,
          action: {
            label: 'Reintentar',
            onClick: refresh
          }
        }
      );
    }
  }, [error]);

  const handleCreate = () => {
    setEditingVacuna(null);
    setShowModal(true);
  };

  const handleEdit = (vacuna: Vacuna) => {
    setEditingVacuna(vacuna);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const vacuna = vacunas.find(v => v.id === id);
    const lotesCount = vacuna?._count?.lotes || 0;
    const planificacionesCount = vacuna?._count?.planificaciones || 0;
    const movimientosCount = vacuna?._count?.movimientos || 0;

    let confirmMessage = `¿Está seguro de eliminar la vacuna "${vacuna?.nombre}"?`;

    if (lotesCount > 0 || planificacionesCount > 0 || movimientosCount > 0) {
      confirmMessage += `\n\nEsta vacuna tiene:`;
      if (lotesCount > 0) confirmMessage += `\n- ${lotesCount} lote(s) asociado(s)`;
      if (planificacionesCount > 0) confirmMessage += `\n- ${planificacionesCount} planificación(es) asociada(s)`;
      if (movimientosCount > 0) confirmMessage += `\n- ${movimientosCount} movimiento(s) asociado(s)`;
      confirmMessage += `\n\nEsta acción no se puede deshacer.`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const success = await deleteVacuna(id);
    if (success) {
      toast.success(
        'Vacuna eliminada',
        `La vacuna "${vacuna?.nombre}" ha sido eliminada exitosamente del sistema.`,
        { duration: 4000 }
      );
    } else if (deleteError) {
      toast.error(
        'Error al eliminar vacuna',
        deleteError,
        {
          duration: 6000,
          action: {
            label: 'Reintentar',
            onClick: () => handleDelete(id)
          }
        }
      );
    }
  };

  const handleSubmit = async (formData: CreateVacunaDto | UpdateVacunaDto) => {
    let success = false;

    if (editingVacuna) {
      // Editar
      success = await updateVacuna(editingVacuna.id, formData as UpdateVacunaDto);
      if (success) {
        toast.success(
          'Vacuna actualizada',
          `La vacuna "${formData.nombre || editingVacuna.nombre}" ha sido actualizada exitosamente.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingVacuna(null);
      } else if (updateError) {
        toast.error(
          'Error al actualizar vacuna',
          updateError,
          {
            duration: 6000,
            action: {
              label: 'Reintentar',
              onClick: () => handleSubmit(formData)
            }
          }
        );
      }
    } else {
      // Crear nuevo
      success = await createVacuna(formData as CreateVacunaDto);
      if (success) {
        toast.success(
          'Vacuna creada',
          `La vacuna "${formData.nombre}" ha sido creada exitosamente en el sistema.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingVacuna(null);
      } else if (createError) {
        toast.error(
          'Error al crear vacuna',
          createError,
          {
            duration: 6000,
            action: {
              label: 'Reintentar',
              onClick: () => handleSubmit(formData)
            }
          }
        );
      }
    }
  };

  const getStockInfo = (vacuna: Vacuna) => {
    const lotes = vacuna.lotes || [];
    const stockTotal = lotes.reduce((total, lote) => total + lote.cantidadActual, 0);
    const lotesActivos = lotes.filter(l => l.estado === 'disponible').length;
    const lotesVencidos = lotes.filter(l => l.estado === 'vencido').length;
    const lotesPorVencer = lotes.filter(l => {
      const days = Math.ceil((l.fechaVencimiento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days <= 30 && days > 0;
    }).length;

    return { stockTotal, lotesActivos, lotesVencidos, lotesPorVencer };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Catálogo de Vacunas</h3>
          <p className="text-gray-600">Gestione el catálogo completo de vacunas del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              await refresh();
              if (!error) {
                toast.info(
                  'Datos actualizados',
                  'La lista de vacunas ha sido actualizada exitosamente.',
                  { duration: 3000 }
                );
              }
            }}
            disabled={isLoading}
            className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Nueva Vacuna
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <input
              type="text"
              placeholder="Filtrar por tipo..."
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{pagination.total}</span> vacuna(s) encontrada(s)
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando vacunas...</span>
        </div>
      )}

      {/* Vacunas Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacunas.map((vacuna) => {
            const stockInfo = getStockInfo(vacuna);

            return (
              <div key={vacuna.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-lg font-semibold text-gray-900">{vacuna.nombre}</h4>
                      <p className="text-sm text-gray-600">{vacuna.tipo}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setShowDetails(showDetails === vacuna.id ? null : vacuna.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(vacuna)}
                      disabled={isUpdating}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                      title="Editar"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(vacuna.id)}
                      disabled={isDeleting}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Presentación:</span>
                  <span className="text-sm font-medium text-gray-900">{vacuna.presentacion}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dosis por frasco:</span>
                  <span className="text-sm font-medium text-gray-900">{vacuna.dosisPorFrasco}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock total:</span>
                  <span className={`text-sm font-bold ${
                    stockInfo.stockTotal > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stockInfo.stockTotal.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Activos</div>
                    <div className="text-sm font-medium text-green-600">{stockInfo.lotesActivos}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Por vencer</div>
                    <div className="text-sm font-medium text-yellow-600">{stockInfo.lotesPorVencer}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Vencidos</div>
                    <div className="text-sm font-medium text-red-600">{stockInfo.lotesVencidos}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    vacuna.estado === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vacuna.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                  
                  {stockInfo.lotesPorVencer > 0 && (
                    <div className="flex items-center text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-xs">Próximo a vencer</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles expandibles */}
              {showDetails === vacuna.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Temperatura:</span>
                    <span className="ml-2 text-gray-900">{vacuna.temperaturaAlmacenamiento}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Vida útil:</span>
                    <span className="ml-2 text-gray-900">{Math.round(vacuna.tiempoVidaUtil / 365)} años</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Creado:</span>
                    <span className="ml-2 text-gray-900">{vacuna.createdAt.toLocaleDateString()}</span>
                  </div>
                  {vacuna._count && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Lotes: {vacuna._count.lotes}</div>
                        <div>Planificaciones: {vacuna._count.planificaciones}</div>
                        <div>Movimientos: {vacuna._count.movimientos}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* Paginación */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">
                    {((pagination.page - 1) * pagination.limit) + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">{pagination.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + Math.max(1, pagination.page - 2);
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => changePage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && vacunas.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay vacunas registradas</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterEstado !== 'todos' || filterTipo
              ? 'No se encontraron vacunas con los filtros aplicados'
              : 'Comience agregando la primera vacuna al catálogo'
            }
          </p>
          {!searchTerm && filterEstado === 'todos' && !filterTipo && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Nueva Vacuna
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <VacunaModal
          vacuna={editingVacuna}
          onClose={() => {
            setShowModal(false);
            setEditingVacuna(null);
          }}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

// Modal Component
interface VacunaModalProps {
  vacuna: Vacuna | null;
  onClose: () => void;
  onSubmit: (data: CreateVacunaDto | UpdateVacunaDto) => void;
  isLoading?: boolean;
}

const VacunaModal: React.FC<VacunaModalProps> = ({
  vacuna,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    nombre: vacuna?.nombre || '',
    tipo: vacuna?.tipo || '',
    presentacion: vacuna?.presentacion || 'Frasco multidosis',
    dosisPorFrasco: vacuna?.dosisPorFrasco || 1,
    tiempoVidaUtil: vacuna?.tiempoVidaUtil || 1095,
    temperaturaAlmacenamiento: vacuna?.temperaturaAlmacenamiento || '2°C a 8°C',
    // Solo incluir estado si estamos editando (no en creación)
    ...(vacuna && { estado: vacuna.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo es requerido';
    }

    if (!formData.presentacion.trim()) {
      newErrors.presentacion = 'La presentación es requerida';
    }

    if (!formData.dosisPorFrasco || formData.dosisPorFrasco < 1) {
      newErrors.dosisPorFrasco = 'Las dosis por frasco deben ser mayor a 0';
    }

    if (!formData.tiempoVidaUtil || formData.tiempoVidaUtil < 1) {
      newErrors.tiempoVidaUtil = 'El tiempo de vida útil debe ser mayor a 0';
    }

    if (!formData.temperaturaAlmacenamiento.trim()) {
      newErrors.temperaturaAlmacenamiento = 'La temperatura de almacenamiento es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Limpiar datos antes de enviar
    const submitData = { ...formData };

    // Para CREACIÓN, NO enviar el campo estado (el backend lo asigna automáticamente)
    if (!vacuna) {
      delete (submitData as any).estado;
    }

    logger.debug('Datos a enviar al backend:', submitData);
    await onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {vacuna ? 'Editar Vacuna' : 'Nueva Vacuna'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Vacuna *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({...formData, nombre: e.target.value});
                    if (errors.nombre) {
                      setErrors({...errors, nombre: ''});
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: BCG, Pentavalente, etc."
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Vacuna *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => {
                    setFormData({...formData, tipo: e.target.value});
                    if (errors.tipo) {
                      setErrors({...errors, tipo: ''});
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tipo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Antituberculosa, Hepatitis B, etc."
                />
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presentación *
                </label>
                <select
                  required
                  value={formData.presentacion}
                  onChange={(e) => setFormData({...formData, presentacion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Frasco multidosis">Frasco multidosis</option>
                  <option value="Frasco unidosis">Frasco unidosis</option>
                  <option value="Ampolla">Ampolla</option>
                  <option value="Jeringa prellenada">Jeringa prellenada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosis por Frasco *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.dosisPorFrasco}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setFormData({...formData, dosisPorFrasco: value});
                    if (errors.dosisPorFrasco) {
                      setErrors({...errors, dosisPorFrasco: ''});
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dosisPorFrasco ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.dosisPorFrasco && (
                  <p className="mt-1 text-sm text-red-600">{errors.dosisPorFrasco}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Vida Útil (días) *
                </label>
                <select
                  required
                  value={formData.tiempoVidaUtil}
                  onChange={(e) => setFormData({...formData, tiempoVidaUtil: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={365}>1 año (365 días)</option>
                  <option value={730}>2 años (730 días)</option>
                  <option value={1095}>3 años (1095 días)</option>
                  <option value={1460}>4 años (1460 días)</option>
                  <option value={1825}>5 años (1825 días)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura de Almacenamiento *
                </label>
                <select
                  required
                  value={formData.temperaturaAlmacenamiento}
                  onChange={(e) => setFormData({...formData, temperaturaAlmacenamiento: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2°C a 8°C">2°C a 8°C (Refrigeración)</option>
                  <option value="-15°C a -25°C">-15°C a -25°C (Congelación)</option>
                  <option value="15°C a 25°C">15°C a 25°C (Temperatura ambiente)</option>
                </select>
              </div>
            </div>

            {/* Solo mostrar campo estado si estamos editando */}
            {vacuna && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={(formData as any).estado || 'activo'}
                  onChange={(e) => setFormData({...formData, estado: e.target.value as 'activo' | 'inactivo'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}
            
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
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {vacuna ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    {vacuna ? 'Actualizar' : 'Crear'} Vacuna
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

export default GestionVacunas;