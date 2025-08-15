import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, GitBranch, Network, Building, MapPin, Phone, User, MoreVertical, AlertCircle, Loader2, Wifi, WifiOff, Settings, Bug } from 'lucide-react';
import { Microred, CreateMicroredDto, UpdateMicroredDto } from '../../types';
import { useMicroredes } from '../../hooks/useMicroredes';
import { useRedes } from '../../hooks/useRedes';
import { useToastContext } from '../../contexts/ToastContext';
import { checkBackendConnection, logger } from '../../utils/debug';
import { validateMicrored, sanitizeInput } from '../../utils/validation';

interface MicroredesProps {
  selectedRedId?: string;
  selectedRedNombre?: string;
  onNavigateToCentrosAcopio?: (microredId: string, microredNombre: string) => void;
}

const Microredes: React.FC<MicroredesProps> = ({
  selectedRedId,
  selectedRedNombre,
  onNavigateToCentrosAcopio
}) => {
  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterRedId, setFilterRedId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingMicrored, setEditingMicrored] = useState<Microred | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // Hook personalizado para gestión de microredes
  const {
    microredes,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    fetchMicroredes,
    createMicrored,
    updateMicrored,
    deleteMicrored
  } = useMicroredes();

  // Hook para obtener redes para el filtro
  const { redes } = useRedes();

  // Hook para toast notifications
  const { toast } = useToastContext();

  // Establecer filtro inicial si se proporciona una red seleccionada
  useEffect(() => {
    if (selectedRedId && selectedRedId !== filterRedId) {
      setFilterRedId(selectedRedId);
    }
  }, [selectedRedId]);

  // Verificar conexión con backend
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const connected = await checkBackendConnection();
        setBackendConnected(connected);
        logger.info(`Estado de conexión con backend: ${connected ? 'Conectado' : 'Desconectado'}`);
      } catch (error) {
        setBackendConnected(false);
        logger.error('Error al verificar conexión con backend', error);
      }
    };

    verifyConnection();

    // Verificar conexión cada 30 segundos
    const interval = setInterval(verifyConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  // Aplicar filtros cuando cambien los valores (con debounce para búsqueda)
  React.useEffect(() => {
    // Evitar ejecutar en la primera carga
    if (!microredes.length && !searchTerm && filterEstado === 'todos' && !filterRedId) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const newFilters: any = {};

      if (filterEstado !== 'todos') {
        newFilters.estado = filterEstado;
      }

      if (filterRedId) {
        newFilters.redId = filterRedId;
      }

      if (searchTerm.trim()) {
        newFilters.search = searchTerm.trim();
      }

      logger.debug('Aplicando filtros después de debounce:', newFilters);
      setFilters(newFilters);
    }, 1000); // Aumentado a 1 segundo para evitar demasiadas peticiones

    return () => clearTimeout(timeoutId);
  }, [filterEstado, filterRedId, searchTerm]); // Sin setFilters en dependencias

  const handleEdit = (microred: Microred) => {
    setEditingMicrored(microred);
    setShowModal(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar la microred "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      const success = await deleteMicrored(id);
      if (success) {
        toast.success(
          'Microred eliminada',
          `La microred "${nombre}" ha sido eliminada exitosamente.`,
          { duration: 4000 }
        );
      } else {
        toast.error(
          'Error al eliminar microred',
          'No se pudo eliminar la microred. Verifique que no tenga centros de acopio asociados.',
          { duration: 6000 }
        );
      }
    }
  };

  const handleSubmit = async (formData: CreateMicroredDto | UpdateMicroredDto) => {
    let success = false;

    if (editingMicrored) {
      // Editar
      success = await updateMicrored(editingMicrored.id, formData as UpdateMicroredDto);
      if (success) {
        toast.success(
          'Microred actualizada',
          `La microred "${formData.nombre || editingMicrored.nombre}" ha sido actualizada exitosamente.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingMicrored(null);
      } else {
        toast.error(
          'Error al actualizar microred',
          'No se pudo actualizar la microred. Intente nuevamente.',
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
      success = await createMicrored(formData as CreateMicroredDto);
      if (success) {
        toast.success(
          'Microred creada',
          `La microred "${formData.nombre}" ha sido creada exitosamente en el sistema.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingMicrored(null);
      } else {
        toast.error(
          'Error al crear microred',
          'No se pudo crear la microred. Intente nuevamente.',
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
    setFilterRedId('');

    // Recargar datos sin filtros
    setFilters({});
  }, []);

  const changePage = (page: number) => {
    setFilters({ ...filters, page });
  };

  // Si no hay conexión con el backend, mostrar mensaje de error
  if (backendConnected === false) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <WifiOff className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Sin conexión con el servidor
          </h3>
          <p className="text-red-600 mb-4">
            No se puede conectar con el backend. Verifique que el servidor esté funcionando en el puerto 3001.
          </p>
          <div className="space-y-2 text-sm text-red-500">
            <p>• Verifique que el backend esté iniciado: <code>npm run dev</code></p>
            <p>• URL del backend: <code>http://localhost:3001</code></p>
            <p>• Verifique la configuración de CORS</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Gestión de Microredes
            {selectedRedNombre && (
              <span className="text-base font-normal text-gray-600 ml-2">
                - Red: {selectedRedNombre}
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            Administre las microredes del sistema
            {total > 0 && (
              <span className="ml-2 text-sm">
                ({total} microred{total !== 1 ? 'es' : ''})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Indicador de conexión */}
          <div className="flex items-center px-2 py-1 rounded-lg text-xs">
            {backendConnected === null ? (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400 mr-1" />
            ) : backendConnected ? (
              <Wifi className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`${
              backendConnected === null ? 'text-gray-500' :
              backendConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {backendConnected === null ? 'Verificando...' :
               backendConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading || backendConnected === false}
            className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowModal(true)}
            disabled={loading || backendConnected === false}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Microred
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterRedId}
              onChange={(e) => setFilterRedId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las redes</option>
              {redes.map((red) => (
                <option key={red.id} value={red.id}>
                  {red.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GitBranch className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Microredes</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <GitBranch className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Microredes Activas</p>
              <p className="text-2xl font-bold text-gray-900">
                {microredes.filter(m => m.estado === 'activo').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <GitBranch className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Microredes Inactivas</p>
              <p className="text-2xl font-bold text-gray-900">
                {microredes.filter(m => m.estado === 'inactivo').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando microredes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Microred
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Red
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centros de Acopio
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
              {microredes.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <GitBranch className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No se encontraron microredes</p>
                    <p className="text-sm">Intente ajustar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                microredes.map((microred) => (
                  <tr key={microred.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <GitBranch className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {microred.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{microred.codigo || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Network className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{microred.red?.nombre || 'Sin red'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {microred.descripcion || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {microred._count?.centrosAcopio || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        microred.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {microred.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {onNavigateToCentrosAcopio && (microred._count?.centrosAcopio || 0) > 0 && (
                          <button
                            onClick={() => onNavigateToCentrosAcopio(microred.id, microred.nombre)}
                            disabled={loading}
                            className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded disabled:opacity-50"
                            title="Ver centros de acopio"
                          >
                            <Building className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(microred)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(microred.id, microred.nombre)}
                          disabled={loading || (microred._count?.centrosAcopio || 0) > 0}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                          title={
                            (microred._count?.centrosAcopio || 0) > 0
                              ? 'No se puede eliminar: tiene centros de acopio asociados'
                              : 'Eliminar microred'
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
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
                      {((currentPage - 1) * (filters.limit || 10)) + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * (filters.limit || 10), total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => changePage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
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
      </div>

      {/* Modal */}
      {showModal && (
        <MicroredModal
          microred={editingMicrored}
          onClose={() => {
            setShowModal(false);
            setEditingMicrored(null);
          }}
          onSubmit={handleSubmit}
          isLoading={loading}
          redes={redes}
        />
      )}
    </div>
  );
};

// Modal Component
interface MicroredModalProps {
  microred: Microred | null;
  onClose: () => void;
  onSubmit: (data: CreateMicroredDto | UpdateMicroredDto) => Promise<void>;
  isLoading?: boolean;
  redes: any[];
}

const MicroredModal: React.FC<MicroredModalProps> = ({
  microred,
  onClose,
  onSubmit,
  isLoading = false,
  redes,
}) => {
  const [formData, setFormData] = useState({
    nombre: microred?.nombre || '',
    codigo: microred?.codigo || '',
    descripcion: microred?.descripcion || '',
    redId: microred?.redId || '',
    // Solo incluir estado si estamos editando (no en creación)
    ...(microred && { estado: microred.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validar formulario usando la utilidad de validación
  const validateForm = () => {
    // Sanitizar datos antes de validar
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      descripcion: formData.descripcion ? sanitizeInput(formData.descripcion) : '',
      redId: formData.redId,
      ...(microred && { estado: formData.estado })
    };

    const validation = validateMicrored(sanitizedData);
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
    if (!microred) {
      delete submitData.estado;
    }

    logger.debug('Datos a enviar al backend:', submitData);
    await onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {microred ? 'Editar Microred' : 'Nueva Microred'}
          </h2>

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
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Red *
                </label>
                <select
                  required
                  value={formData.redId}
                  onChange={(e) => {
                    setFormData({...formData, redId: e.target.value});
                    if (errors.redId) setErrors({...errors, redId: ''});
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.redId
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Seleccionar red...</option>
                  {redes.map((red) => (
                    <option key={red.id} value={red.id}>
                      {red.nombre}
                    </option>
                  ))}
                </select>
                {errors.redId && (
                  <p className="mt-1 text-sm text-red-600">{errors.redId}</p>
                )}
              </div>

              {/* Campo de estado solo para edición */}
              {microred && (
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
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción opcional de la microred"
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
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {microred ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Microredes;
