import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Building, Network, GitBranch, MapPin, Phone, User, MoreVertical, AlertCircle, Loader2, Wifi, WifiOff, Settings, Bug } from 'lucide-react';
import { CentroAcopio, CreateCentroAcopioDto, UpdateCentroAcopioDto } from '../../types';
import { useCentrosAcopio } from '../../hooks/useCentrosAcopio';
import { useRedes } from '../../hooks/useRedes';
import { useMicroredes } from '../../hooks/useMicroredes';
import { useToastContext } from '../../contexts/ToastContext';
import { checkBackendConnection, logger } from '../../utils/debug';
import { validateCentroAcopio, sanitizeInput } from '../../utils/validation';

interface CentrosAcopioProps {
  selectedMicroredId?: string;
  selectedMicroredNombre?: string;
  onNavigateToEstablecimientos?: (centroAcopioId: string, centroAcopioNombre: string) => void;
}

const CentrosAcopio: React.FC<CentrosAcopioProps> = ({
  selectedMicroredId,
  selectedMicroredNombre,
  onNavigateToEstablecimientos
}) => {
  // Estados locales para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterRedId, setFilterRedId] = useState<string>('');
  const [filterMicroredId, setFilterMicroredId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroAcopio | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // Hook personalizado para gestión de centros de acopio
  const {
    centrosAcopio,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    fetchCentrosAcopio,
    createCentroAcopio,
    updateCentroAcopio,
    deleteCentroAcopio
  } = useCentrosAcopio();

  // Hook para obtener redes para el filtro
  const { redes } = useRedes();

  // Hook para obtener microredes para el filtro (filtradas por red seleccionada)
  const { microredes } = useMicroredes();

  // Hook para toast notifications
  const { toast } = useToastContext();

  // Establecer filtro inicial si se proporciona una microred seleccionada
  useEffect(() => {
    if (selectedMicroredId && selectedMicroredId !== filterMicroredId) {
      setFilterMicroredId(selectedMicroredId);
    }
  }, [selectedMicroredId]);

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
    if (!centrosAcopio.length && !searchTerm && filterEstado === 'todos' && !filterRedId && !filterMicroredId) {
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

      if (filterMicroredId) {
        newFilters.microredId = filterMicroredId;
      }

      if (searchTerm.trim()) {
        newFilters.search = searchTerm.trim();
      }

      logger.debug('Aplicando filtros después de debounce:', newFilters);
      setFilters(newFilters);
    }, 1000); // Aumentado a 1 segundo para evitar demasiadas peticiones

    return () => clearTimeout(timeoutId);
  }, [filterEstado, filterRedId, filterMicroredId, searchTerm]); // Sin setFilters en dependencias

  // Limpiar microred cuando cambie la red
  React.useEffect(() => {
    if (filterRedId !== filters.redId) {
      setFilterMicroredId('');
    }
  }, [filterRedId]);

  const handleEdit = (centro: CentroAcopio) => {
    setEditingCentro(centro);
    setShowModal(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar el centro de acopio "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      const success = await deleteCentroAcopio(id);
      if (success) {
        toast.success(
          'Centro de acopio eliminado',
          `El centro de acopio "${nombre}" ha sido eliminado exitosamente.`,
          { duration: 4000 }
        );
      } else {
        toast.error(
          'Error al eliminar centro de acopio',
          'No se pudo eliminar el centro de acopio. Verifique que no tenga establecimientos asociados.',
          { duration: 6000 }
        );
      }
    }
  };

  const handleSubmit = async (formData: CreateCentroAcopioDto | UpdateCentroAcopioDto) => {
    let success = false;

    if (editingCentro) {
      // Editar
      success = await updateCentroAcopio(editingCentro.id, formData as UpdateCentroAcopioDto);
      if (success) {
        toast.success(
          'Centro de acopio actualizado',
          `El centro de acopio "${formData.nombre || editingCentro.nombre}" ha sido actualizado exitosamente.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingCentro(null);
      } else {
        toast.error(
          'Error al actualizar centro de acopio',
          'No se pudo actualizar el centro de acopio. Intente nuevamente.',
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
      success = await createCentroAcopio(formData as CreateCentroAcopioDto);
      if (success) {
        toast.success(
          'Centro de acopio creado',
          `El centro de acopio "${formData.nombre}" ha sido creado exitosamente en el sistema.`,
          { duration: 4000 }
        );
        setShowModal(false);
        setEditingCentro(null);
      } else {
        toast.error(
          'Error al crear centro de acopio',
          'No se pudo crear el centro de acopio. Intente nuevamente.',
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
    setFilterMicroredId('');

    // Recargar datos sin filtros
    setFilters({});
  }, []);

  const changePage = (page: number) => {
    setFilters({ ...filters, page });
  };

  // Filtrar microredes por red seleccionada
  const microredesFiltradas = React.useMemo(() => {
    if (!filterRedId) return microredes;
    return microredes.filter(m => m.redId === filterRedId);
  }, [microredes, filterRedId]);

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
            Gestión de Centros de Acopio
            {selectedMicroredNombre && (
              <span className="text-base font-normal text-gray-600 ml-2">
                - Microred: {selectedMicroredNombre}
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            Administre los centros de acopio del sistema
            {total > 0 && (
              <span className="ml-2 text-sm">
                ({total} centro{total !== 1 ? 's' : ''})
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
            Nuevo Centro de Acopio
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
                placeholder="Buscar por nombre, código, responsable o dirección..."
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
              value={filterMicroredId}
              onChange={(e) => setFilterMicroredId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!filterRedId}
            >
              <option value="">Todas las microredes</option>
              {microredesFiltradas.map((microred) => (
                <option key={microred.id} value={microred.id}>
                  {microred.nombre}
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Centros</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Centros Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {centrosAcopio.filter(c => c.estado === 'activo').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Centros Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">
                {centrosAcopio.filter(c => c.estado === 'inactivo').length}
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
            <span className="ml-2 text-gray-600">Cargando centros de acopio...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centro de Acopio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Microred
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Establecimientos
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
              {centrosAcopio.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No se encontraron centros de acopio</p>
                    <p className="text-sm">Intente ajustar los filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                centrosAcopio.map((centro) => (
                  <tr key={centro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Building className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {centro.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{centro.codigo || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <GitBranch className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{centro.microred?.nombre || 'Sin microred'}</div>
                          {centro.microred?.red && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <Network className="h-3 w-3 mr-1" />
                              {centro.microred.red.nombre}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{centro.responsable || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        {centro.direccion || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {centro._count?.establecimientos || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        centro.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {centro.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(centro)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(centro.id, centro.nombre)}
                          disabled={loading || (centro._count?.establecimientos || 0) > 0}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded disabled:opacity-50"
                          title={
                            (centro._count?.establecimientos || 0) > 0
                              ? 'No se puede eliminar: tiene establecimientos asociados'
                              : 'Eliminar centro de acopio'
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
        <CentroAcopioModal
          centro={editingCentro}
          onClose={() => {
            setShowModal(false);
            setEditingCentro(null);
          }}
          onSubmit={handleSubmit}
          isLoading={loading}
          redes={redes}
          microredes={microredes}
        />
      )}
    </div>
  );
};

// Modal Component
interface CentroAcopioModalProps {
  centro: CentroAcopio | null;
  onClose: () => void;
  onSubmit: (data: CreateCentroAcopioDto | UpdateCentroAcopioDto) => Promise<void>;
  isLoading?: boolean;
  redes: any[];
  microredes: any[];
}

const CentroAcopioModal: React.FC<CentroAcopioModalProps> = ({
  centro,
  onClose,
  onSubmit,
  isLoading = false,
  redes,
  microredes,
}) => {
  const [formData, setFormData] = useState({
    nombre: centro?.nombre || '',
    codigo: centro?.codigo || '',
    microredId: centro?.microredId || '',
    direccion: centro?.direccion || '',
    responsable: centro?.responsable || '',
    telefono: centro?.telefono || '',
    // Solo incluir estado si estamos editando (no en creación)
    ...(centro && { estado: centro.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtrar microredes por red seleccionada
  const microredesFiltradas = React.useMemo(() => {
    if (!formData.microredId) return microredes;
    const microredSeleccionada = microredes.find(m => m.id === formData.microredId);
    if (!microredSeleccionada) return microredes;
    return microredes.filter(m => m.redId === microredSeleccionada.redId);
  }, [microredes, formData.microredId]);

  // Validar formulario usando la utilidad de validación
  const validateForm = () => {
    // Sanitizar datos antes de validar
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      direccion: sanitizeInput(formData.direccion),
      responsable: sanitizeInput(formData.responsable),
      telefono: formData.telefono ? sanitizeInput(formData.telefono) : '',
      microredId: formData.microredId,
      ...(centro && { estado: formData.estado })
    };

    const validation = validateCentroAcopio(sanitizedData);
    setErrors(validation.errors);

    // Actualizar formData con datos sanitizados si la validación es exitosa
    if (validation.isValid) {
      setFormData(prev => ({
        ...prev,
        nombre: sanitizedData.nombre,
        codigo: sanitizedData.codigo,
        direccion: sanitizedData.direccion,
        responsable: sanitizedData.responsable,
        telefono: sanitizedData.telefono
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
    if (!centro) {
      delete submitData.estado;
    }

    logger.debug('Datos a enviar al backend:', submitData);
    await onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {centro ? 'Editar Centro de Acopio' : 'Nuevo Centro de Acopio'}
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
                  Microred
                </label>
                <select
                  value={formData.microredId}
                  onChange={(e) => setFormData({...formData, microredId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar microred...</option>
                  {microredes.map((microred) => (
                    <option key={microred.id} value={microred.id}>
                      {microred.nombre} {microred.red && `(${microred.red.nombre})`}
                    </option>
                  ))}
                </select>
              </div>

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

              {/* Campo de estado solo para edición */}
              {centro && (
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
              <textarea
                required
                value={formData.direccion}
                onChange={(e) => {
                  setFormData({...formData, direccion: e.target.value});
                  if (errors.direccion) setErrors({...errors, direccion: ''});
                }}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.direccion
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Dirección completa del centro de acopio"
              />
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
              )}
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
                {centro ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CentrosAcopio;
