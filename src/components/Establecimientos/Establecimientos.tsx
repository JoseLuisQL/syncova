import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Building2, MapPin, Phone, User, MoreVertical, AlertCircle, Loader2, Wifi, WifiOff, Settings, Bug } from 'lucide-react';
import { Establecimiento, CreateEstablecimientoDto, UpdateEstablecimientoDto } from '../../types';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useToastContext } from '../../contexts/ToastContext';
import { checkBackendConnection, logger } from '../../utils/debug';
import TestConnection from '../TestConnection';
import DebugPanel from '../DebugPanel';

const Establecimientos: React.FC = () => {
  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingEstablecimiento, setEditingEstablecimiento] = useState<Establecimiento | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [showTestConnection, setShowTestConnection] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

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
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Establecimientos</h2>
          <p className="text-gray-600 mt-1">
            Administre centros de acopio y establecimientos de salud
            {pagination.total > 0 && (
              <span className="ml-2 text-sm">
                ({pagination.total} establecimiento{pagination.total !== 1 ? 's' : ''})
              </span>
            )}
          </p>
          {/* Botones de desarrollo */}
          {import.meta.env.VITE_ENVIRONMENT === 'development' && (
            <div className="mt-2 space-x-2">
              <button
                onClick={() => setShowTestConnection(true)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Probar conexión
              </button>
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                {showDebugPanel ? 'Ocultar' : 'Mostrar'} debug
              </button>
            </div>
          )}
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
            disabled={isLoading || backendConnected === false}
            className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowModal(true)}
            disabled={isCreating || backendConnected === false}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Nuevo Establecimiento
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
                placeholder="Buscar por nombre, código o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="centro_acopio">Centro de Acopio</option>
              <option value="centro_salud">Centro de Salud</option>
              <option value="puesto_salud">Puesto de Salud</option>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Centros de Acopio</p>
              <p className="text-2xl font-bold text-gray-900">{centrosAcopio.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Centros de Salud</p>
              <p className="text-2xl font-bold text-gray-900">
                {establecimientos.filter(e => e.tipo === 'centro_salud').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Puestos de Salud</p>
              <p className="text-2xl font-bold text-gray-900">
                {establecimientos.filter(e => e.tipo === 'puesto_salud').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building2 className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando establecimientos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Establecimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centro de Acopio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
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
              {establecimientos.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No se encontraron establecimientos</p>
                    <p className="text-sm">Intente ajustar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                establecimientos.map((establecimiento) => {
                  // Usar la relación centroAcopio del backend si está disponible
                  const centroAcopio = establecimiento.centroAcopio ||
                    (establecimiento.centroAcopioId
                      ? centrosAcopio.find(c => c.id === establecimiento.centroAcopioId)
                      : null);
                
                return (
                  <tr key={establecimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {establecimiento.nombre}
                          </div>
                          <div className="text-sm text-gray-500">{establecimiento.codigo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(establecimiento.tipo)}`}>
                        {getTipoLabel(establecimiento.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {centroAcopio ? centroAcopio.nombre : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{establecimiento.responsable}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {establecimiento.telefono}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="truncate max-w-xs">{establecimiento.direccion}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        establecimiento.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {establecimiento.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(establecimiento)}
                          disabled={isUpdating}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded disabled:opacity-50"
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
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
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

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
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
                      const pageNum = i + 1;
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
      </div>

      {/* Modal */}
      {showModal && (
        <EstablecimientoModal
          establecimiento={editingEstablecimiento}
          centrosAcopio={centrosAcopio}
          onClose={() => {
            setShowModal(false);
            setEditingEstablecimiento(null);
          }}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      )}

      {/* Test Connection Modal */}
      {showTestConnection && (
        <TestConnection onClose={() => setShowTestConnection(false)} />
      )}

      {/* Debug Panel */}
      <DebugPanel
        isVisible={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </div>
  );
};

// Modal Component
interface EstablecimientoModalProps {
  establecimiento: Establecimiento | null;
  centrosAcopio: Establecimiento[];
  onClose: () => void;
  onSubmit: (data: CreateEstablecimientoDto | UpdateEstablecimientoDto) => Promise<void>;
  isLoading?: boolean;
}

const EstablecimientoModal: React.FC<EstablecimientoModalProps> = ({
  establecimiento,
  centrosAcopio,
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

    // Validar centroAcopioId solo para centros y puestos de salud
    if (formData.tipo !== 'centro_acopio') {
      if (!formData.centroAcopioId || formData.centroAcopioId.trim() === '') {
        newErrors.centroAcopioId = 'Debe seleccionar un centro de acopio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Limpiar centroAcopioId si es centro de acopio
    const submitData = { ...formData };

    // Para centros de acopio, NO enviar centroAcopioId
    if (submitData.tipo === 'centro_acopio') {
      delete submitData.centroAcopioId;
    } else {
      // Para centros y puestos de salud, asegurar que centroAcopioId no esté vacío
      if (!submitData.centroAcopioId || submitData.centroAcopioId.trim() === '') {
        delete submitData.centroAcopioId;
      }
    }

    // Para CREACIÓN, NO enviar el campo estado (el backend lo asigna automáticamente)
    if (!establecimiento) {
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
            {establecimiento ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}
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
                    const newTipo = e.target.value as any;
                    setFormData({
                      ...formData,
                      tipo: newTipo,
                      centroAcopioId: newTipo === 'centro_acopio' ? '' : formData.centroAcopioId
                    });
                    if (errors.centroAcopioId) setErrors({...errors, centroAcopioId: ''});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="centro_acopio">Centro de Acopio</option>
                  <option value="centro_salud">Centro de Salud</option>
                  <option value="puesto_salud">Puesto de Salud</option>
                </select>
              </div>
              
              {formData.tipo !== 'centro_acopio' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Centro de Acopio *
                  </label>
                  <select
                    required
                    value={formData.centroAcopioId}
                    onChange={(e) => {
                      setFormData({...formData, centroAcopioId: e.target.value});
                      if (errors.centroAcopioId) setErrors({...errors, centroAcopioId: ''});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.centroAcopioId
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Seleccionar centro de acopio</option>
                    {centrosAcopio.map((centro) => (
                      <option key={centro.id} value={centro.id}>
                        {centro.nombre} ({centro.codigo})
                      </option>
                    ))}
                  </select>
                  {errors.centroAcopioId && (
                    <p className="mt-1 text-sm text-red-600">{errors.centroAcopioId}</p>
                  )}
                </div>
              )}

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
                {establecimiento ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Establecimientos;