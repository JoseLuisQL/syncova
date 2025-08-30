import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, MapPin, Phone, User, AlertCircle, Loader2, Building, Activity, Users } from 'lucide-react';
import { Establecimiento, CreateEstablecimientoDto, UpdateEstablecimientoDto } from '../../types';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useToastContext } from '../../contexts/ToastContext';
import { logger } from '../../utils/debug';
import CascadingSelector from '../common/CascadingSelector';

interface EstablecimientosProps {
  selectedCentroAcopioId?: string;
  selectedCentroAcopioNombre?: string;
}

const Establecimientos: React.FC<EstablecimientosProps> = ({
  selectedCentroAcopioId,
  selectedCentroAcopioNombre
}) => {
  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingEstablecimiento, setEditingEstablecimiento] = useState<Establecimiento | null>(null);

  // Hook personalizado para gestión de establecimientos
  const {
    establecimientos,
    centrosAcopio,
    pagination,
    isLoading,
    error,
    createEstablecimiento,
    updateEstablecimiento,
    deleteEstablecimiento,
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
  } = useEstablecimientos();

  // Hook para toast notifications
  const { toast } = useToastContext();

  // Aplicar filtros cuando cambien los valores (con debounce para búsqueda)
  React.useEffect(() => {
    // Evitar ejecutar en la primera carga
    if (!establecimientos.length && !searchTerm && filterTipo === 'todos' && filterEstado === 'todos') {
      return;
    }

    const timeoutId = setTimeout(() => {
      const filters: any = {};

      if (filterTipo !== 'todos') {
        filters.tipo = filterTipo;
      }

      if (filterEstado !== 'todos') {
        filters.estado = filterEstado;
      }

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      logger.debug('Aplicando filtros después de debounce:', filters);
      applyFilters(filters);
    }, 1000); // Aumentado a 1 segundo para evitar demasiadas peticiones

    return () => clearTimeout(timeoutId);
  }, [filterTipo, filterEstado, searchTerm]); // Sin applyFilters en dependencias

  const handleEdit = (establecimiento: Establecimiento) => {
    setEditingEstablecimiento(establecimiento);
    setShowModal(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar el establecimiento "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      const success = await deleteEstablecimiento(id);
      if (!success && deleteError) {
        alert(`Error al eliminar: ${deleteError}`);
      }
    }
  };

  const handleSubmit = async (formData: CreateEstablecimientoDto | UpdateEstablecimientoDto) => {
    let success = false;

    if (editingEstablecimiento) {
      // Editar
      success = await updateEstablecimiento(editingEstablecimiento.id, formData as UpdateEstablecimientoDto);
      if (success) {
        toast.success(
          'Establecimiento actualizado',
          `El establecimiento "${formData.nombre || editingEstablecimiento.nombre}" ha sido actualizado exitosamente.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingEstablecimiento(null);
      } else if (updateError) {
        toast.error(
          'Error al actualizar establecimiento',
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
      success = await createEstablecimiento(formData as CreateEstablecimientoDto);
      if (success) {
        toast.success(
          'Establecimiento creado',
          `El establecimiento "${formData.nombre}" ha sido creado exitosamente en el sistema.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingEstablecimiento(null);
      } else if (createError) {
        toast.error(
          'Error al crear establecimiento',
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

  const handleRefresh = React.useCallback(() => {
    logger.info('Refrescando datos manualmente');

    // Limpiar filtros y recargar
    setSearchTerm('');
    setFilterTipo('todos');
    setFilterEstado('todos');

    // Recargar datos sin filtros
    applyFilters({});
  }, []);

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'centro_acopio': return 'Centro de Acopio';
      case 'centro_salud': return 'Centro de Salud';
      case 'puesto_salud': return 'Puesto de Salud';
      default: return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'centro_acopio': return 'bg-blue-100 text-blue-800';
      case 'centro_salud': return 'bg-green-100 text-green-800';
      case 'puesto_salud': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener estadísticas filtradas
  const getStats = () => {
    return {
      centrosAcopio: centrosAcopio.length,
      centrosSalud: establecimientos.filter(e => e.tipo === 'centro_salud').length,
      puestosSalud: establecimientos.filter(e => e.tipo === 'puesto_salud').length,
      hospitales: establecimientos.filter(e => e.tipo === 'hospital').length,
      total: pagination.total,
      activos: establecimientos.filter(e => e.estado === 'activo').length
    };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Header Premium */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Establecimientos de Salud</h2>
            <p className="text-gray-600">
              {selectedCentroAcopioNombre ? `Centro: ${selectedCentroAcopioNombre}` : 'Gestión integral de establecimientos'}
              {stats.total > 0 && (
                <span className="ml-2 text-sm font-medium text-emerald-600">
                  ({stats.total} establecimiento{stats.total !== 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={isCreating}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isCreating ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          Nuevo Establecimiento
        </button>
      </div>

      {/* Stats Cards Premium */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Centros de Salud</p>
              <p className="text-2xl font-bold text-blue-800">{stats.centrosSalud}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Puestos de Salud</p>
              <p className="text-2xl font-bold text-orange-800">{stats.puestosSalud}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Hospitales</p>
              <p className="text-2xl font-bold text-purple-800">{stats.hospitales}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">Activos</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.activos}</p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Premium */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar establecimientos</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="todos">Todos</option>
              <option value="centro_salud">Centro de Salud</option>
              <option value="puesto_salud">Puesto de Salud</option>
              <option value="hospital">Hospital</option>
            </select>
          </div>
          <div className="lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>



      {/* Table Premium */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-600">Cargando establecimientos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Establecimiento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {establecimientos.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No se encontraron establecimientos</p>
                    <p className="text-sm">Intente ajustar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                establecimientos.map((establecimiento) => {
                
                return (
                  <tr key={establecimiento.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className={`h-12 w-12 rounded-xl ${getTipoColor(establecimiento.tipo)} flex items-center justify-center`}>
                            <Building2 className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {establecimiento.nombre}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">{establecimiento.codigo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTipoColor(establecimiento.tipo)}`}>
                        {getTipoLabel(establecimiento.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{establecimiento.responsable}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {establecimiento.telefono && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {establecimiento.telefono}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="truncate max-w-xs">{establecimiento.direccion}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        establecimiento.estado === 'activo' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {establecimiento.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(establecimiento)}
                          disabled={isUpdating}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(establecimiento.id, establecimiento.nombre)}
                          disabled={isDeleting}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Eliminar establecimiento"
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
                );
                })
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Paginación Premium */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-semibold text-emerald-600">
                      {((pagination.page - 1) * pagination.limit) + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-semibold text-emerald-600">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold text-emerald-600">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => changePage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                            pageNum === pagination.page
                              ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
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
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <EstablecimientoModal
          establecimiento={editingEstablecimiento}
          onClose={() => {
            setShowModal(false);
            setEditingEstablecimiento(null);
          }}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

// Modal Component
interface EstablecimientoModalProps {
  establecimiento: Establecimiento | null;
  onClose: () => void;
  onSubmit: (data: CreateEstablecimientoDto | UpdateEstablecimientoDto) => Promise<void>;
  isLoading?: boolean;
}

const EstablecimientoModal: React.FC<EstablecimientoModalProps> = ({
  establecimiento,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: establecimiento?.nombre || '',
    tipo: establecimiento?.tipo || 'centro_salud',
    codigo: establecimiento?.codigo || '',
    centroAcopioId: establecimiento?.centroAcopioId || '',
    direccion: establecimiento?.direccion || '',
    responsable: establecimiento?.responsable || '',
    telefono: establecimiento?.telefono || '',
    // Campos para el selector en cascada
    redId: establecimiento?.centroAcopio?.microred?.redId || '',
    microredId: establecimiento?.centroAcopio?.microredId || '',
    // Solo incluir estado si estamos editando (no en creación)
    ...(establecimiento && { estado: establecimiento.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.responsable.trim()) {
      newErrors.responsable = 'El responsable es requerido';
    }

    // Validar centroAcopioId (requerido para todos los establecimientos)
    if (!formData.centroAcopioId || formData.centroAcopioId.trim() === '') {
      newErrors.centroAcopioId = 'Debe seleccionar un centro de acopio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = { ...formData };

    // Asegurar que centroAcopioId no esté vacío (requerido para todos los establecimientos)
    if (!submitData.centroAcopioId || submitData.centroAcopioId.trim() === '') {
      // Esto no debería pasar debido a la validación, pero por seguridad
      return;
    }

    // Para CREACIÓN, NO enviar el campo estado (el backend lo asigna automáticamente)
    if (!establecimiento) {
      delete submitData.estado;
    }

    logger.debug('Datos a enviar al backend:', submitData);
    await onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {establecimiento ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}
              </h2>
              <p className="text-sm text-gray-600">
                {establecimiento ? 'Actualizar información del establecimiento' : 'Crear un nuevo establecimiento de salud'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({...formData, nombre: e.target.value});
                    if (errors.nombre) setErrors({...errors, nombre: ''});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.nombre
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => {
                    setFormData({...formData, codigo: e.target.value});
                    if (errors.codigo) setErrors({...errors, codigo: ''});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.codigo
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => {
                    const newTipo = e.target.value as 'centro_salud' | 'puesto_salud' | 'hospital';
                    setFormData({
                      ...formData,
                      tipo: newTipo
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="centro_salud">Centro de Salud</option>
                  <option value="puesto_salud">Puesto de Salud</option>
                  <option value="hospital">Hospital</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación en la Estructura Jerárquica *
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <CascadingSelector
                    selectedRedId={formData.redId || ''}
                    selectedMicroredId={formData.microredId || ''}
                    selectedCentroAcopioId={formData.centroAcopioId}
                    onRedChange={(redId) => {
                      setFormData({
                        ...formData,
                        redId,
                        microredId: '',
                        centroAcopioId: ''
                      });
                    }}
                    onMicroredChange={(microredId) => {
                      setFormData({
                        ...formData,
                        microredId,
                        centroAcopioId: ''
                      });
                    }}
                    onCentroAcopioChange={(centroAcopioId) => {
                      setFormData({
                        ...formData,
                        centroAcopioId
                      });
                      if (errors.centroAcopioId) setErrors({...errors, centroAcopioId: ''});
                    }}
                    required={{ centroAcopio: true }}
                    errors={{ centroAcopio: errors.centroAcopioId }}
                  />
                </div>
              </div>

              {/* Campo de estado solo para edición */}
              {establecimiento && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                required
                value={formData.direccion}
                onChange={(e) => {
                  setFormData({...formData, direccion: e.target.value});
                  if (errors.direccion) setErrors({...errors, direccion: ''});
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.direccion
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsable *
                </label>
                <input
                  type="text"
                  required
                  value={formData.responsable}
                  onChange={(e) => {
                    setFormData({...formData, responsable: e.target.value});
                    if (errors.responsable) setErrors({...errors, responsable: ''});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.responsable
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.responsable && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsable}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opcional"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {establecimiento ? 'Actualizar Establecimiento' : 'Crear Establecimiento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Establecimientos;