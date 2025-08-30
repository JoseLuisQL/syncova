import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Network, GitBranch, AlertCircle, Loader2, Activity, Users, Shield } from 'lucide-react';
import { Red, CreateRedDto, UpdateRedDto } from '../../types';
import { useRedes } from '../../hooks/useRedes';
import { useToastContext } from '../../contexts/ToastContext';
import { logger } from '../../utils/debug';
import { validateRed, sanitizeInput } from '../../utils/validation';
import { DeleteConfirmation } from '../common/ConfirmationDialog';

const Redes: React.FC<RedesProps> = ({ onNavigateToMicroredes }) => {
  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingRed, setEditingRed] = useState<Red | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    redId: string;
    redNombre: string;
  }>({
    isOpen: false,
    redId: '',
    redNombre: ''
  });

  // Hook personalizado para gestión de redes
  const {
    redes,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    fetchRedes,
    createRed,
    updateRed,
    deleteRed
  } = useRedes();

  // Hook para toast notifications
  const { toast } = useToastContext();

  // Obtener estadísticas
  const getStats = () => {
    return {
      total: total,
      activas: redes.filter(r => r.estado === 'activo').length,
      inactivas: redes.filter(r => r.estado === 'inactivo').length,
      conMicroredes: redes.filter(r => (r._count?.microredes || 0) > 0).length
    };
  };

  // Aplicar filtros cuando cambien los valores (con debounce para búsqueda)
  React.useEffect(() => {
    // Evitar ejecutar en la primera carga
    if (!redes.length && !searchTerm && filterEstado === 'todos') {
      return;
    }

    const timeoutId = setTimeout(() => {
      const newFilters: any = {};

      if (filterEstado !== 'todos') {
        newFilters.estado = filterEstado;
      }

      if (searchTerm.trim()) {
        newFilters.search = searchTerm.trim();
      }

      logger.debug('Aplicando filtros después de debounce:', newFilters);
      setFilters(newFilters);
    }, 1000); // Aumentado a 1 segundo para evitar demasiadas peticiones

    return () => clearTimeout(timeoutId);
  }, [filterEstado, searchTerm]); // Sin setFilters en dependencias

  const handleEdit = (red: Red) => {
    setEditingRed(red);
    setShowModal(true);
  };

  const handleDelete = (id: string, nombre: string) => {
    setDeleteConfirmation({
      isOpen: true,
      redId: id,
      redNombre: nombre
    });
  };

  const confirmDelete = async () => {
    const success = await deleteRed(deleteConfirmation.redId);
    if (success) {
      toast.success(
        'Red eliminada',
        `La red "${deleteConfirmation.redNombre}" ha sido eliminada exitosamente.`,
        { duration: 4000 }
      );
    } else {
      toast.error(
        'Error al eliminar red',
        'No se pudo eliminar la red. Verifique que no tenga microredes asociadas.',
        { duration: 6000 }
      );
    }
    setDeleteConfirmation({
      isOpen: false,
      redId: '',
      redNombre: ''
    });
  };

  const handleSubmit = async (formData: CreateRedDto | UpdateRedDto) => {
    let success = false;

    if (editingRed) {
      // Editar
      success = await updateRed(editingRed.id, formData as UpdateRedDto);
      if (success) {
        toast.success(
          'Red actualizada',
          `La red "${formData.nombre || editingRed.nombre}" ha sido actualizada exitosamente.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingRed(null);
      } else {
        toast.error(
          'Error al actualizar red',
          'No se pudo actualizar la red. Intente nuevamente.',
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
      success = await createRed(formData as CreateRedDto);
      if (success) {
        toast.success(
          'Red creada',
          `La red "${formData.nombre}" ha sido creada exitosamente en el sistema.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingRed(null);
      } else {
        toast.error(
          'Error al crear red',
          'No se pudo crear la red. Intente nuevamente.',
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
    setFilterEstado('todos');

    // Recargar datos sin filtros
    setFilters({});
  }, []);

  const changePage = (page: number) => {
    setFilters({ ...filters, page });
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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
            <Network className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Redes de Salud</h2>
            <p className="text-gray-600">
              Gestión integral de redes organizacionales
              {stats.total > 0 && (
                <span className="ml-2 text-sm font-medium text-blue-600">
                  ({stats.total} red{stats.total !== 1 ? 'es' : ''})
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          Nueva Red
        </button>
      </div>

      {/* Stats Cards Premium */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Redes</p>
              <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Network className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">Redes Activas</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.activas}</p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-600 text-sm font-medium">Con Microredes</p>
              <p className="text-2xl font-bold text-amber-800">{stats.conMicroredes}</p>
            </div>
            <div className="bg-amber-500 p-3 rounded-lg">
              <GitBranch className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Inactivas</p>
              <p className="text-2xl font-bold text-red-800">{stats.inactivas}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Premium */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar redes</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando redes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Red
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Microredes
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
              {redes.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Network className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No se encontraron redes</p>
                    <p className="text-sm">Intente ajustar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                redes.map((red) => (
                  <tr key={red.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
                            <Network className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {red.nombre}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">{red.codigo || 'Sin código'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{red.codigo || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-sm text-gray-600">
                        {red.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          <GitBranch className="h-3 w-3 mr-1" />
                          {red._count?.microredes || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        red.estado === 'activo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {red.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onNavigateToMicroredes && (red._count?.microredes || 0) > 0 && (
                          <button
                            onClick={() => onNavigateToMicroredes(red.id, red.nombre)}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                            title="Ver microredes"
                          >
                            <GitBranch className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(red)}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(red.id, red.nombre)}
                          disabled={loading || (red._count?.microredes || 0) > 0}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          title={
                            (red._count?.microredes || 0) > 0
                              ? 'No se puede eliminar: tiene microredes asociadas'
                              : 'Eliminar red'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
        {/* Paginación Premium */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-semibold text-blue-600">
                      {((currentPage - 1) * (filters.limit || 10)) + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-semibold text-blue-600">
                      {Math.min(currentPage * (filters.limit || 10), total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold text-blue-600">{total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => changePage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                            pageNum === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
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
        <RedModal
          red={editingRed}
          onClose={() => {
            setShowModal(false);
            setEditingRed(null);
          }}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      )}

      {/* Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, redId: '', redNombre: '' })}
        onConfirm={confirmDelete}
        itemName={deleteConfirmation.redNombre}
        itemType="red"
        isLoading={loading}
        additionalWarning="Verifique que no tenga microredes asociadas."
      />
    </div>
  );
};

// Interfaces
interface RedesProps {
  onNavigateToMicroredes?: (redId: string, redNombre: string) => void;
}

interface RedModalProps {
  red: Red | null;
  onClose: () => void;
  onSubmit: (data: CreateRedDto | UpdateRedDto) => Promise<void>;
  isLoading?: boolean;
}

const RedModal: React.FC<RedModalProps> = ({
  red,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: red?.nombre || '',
    codigo: red?.codigo || '',
    descripcion: red?.descripcion || '',
    // Solo incluir estado si estamos editando (no en creación)
    ...(red && { estado: red.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validar formulario usando la utilidad de validación
  const validateForm = () => {
    // Sanitizar datos antes de validar
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      descripcion: formData.descripcion ? sanitizeInput(formData.descripcion) : '',
      ...(red && { estado: formData.estado })
    };

    const validation = validateRed(sanitizedData);
    setErrors(validation.errors);

    // Actualizar formData con datos sanitizados si la validación es exitosa
    if (validation.isValid) {
      setFormData(prev => ({
        ...prev,
        nombre: sanitizedData.nombre,
        codigo: sanitizedData.codigo,
        descripcion: sanitizedData.descripcion
      }));
    }

    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = { ...formData };

    // Para CREACIÓN, NO enviar el campo estado (el backend lo asigna automáticamente)
    if (!red) {
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <Network className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {red ? 'Editar Red' : 'Nueva Red'}
              </h2>
              <p className="text-sm text-gray-600">
                {red ? 'Actualizar información de la red' : 'Crear una nueva red de salud'}
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
                  Código
                </label>
                <input
                  type="text"
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
                  placeholder="Opcional"
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                )}
              </div>

              {/* Campo de estado solo para edición */}
              {red && (
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
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => {
                  setFormData({...formData, descripcion: e.target.value});
                  if (errors.descripcion) setErrors({...errors, descripcion: ''});
                }}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.descripcion
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Descripción opcional de la red"
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
              )}
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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {red ? 'Actualizar Red' : 'Crear Red'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Redes;
