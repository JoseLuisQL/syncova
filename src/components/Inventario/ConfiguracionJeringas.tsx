import React, { useState, useEffect } from 'react';
import { Plus, Settings, Edit, Trash2, Search, Filter, Link, Package, Syringe, Building2, X, AlertCircle, CheckCircle, Loader, HelpCircle } from 'lucide-react';
import ConfiguracionModal from './ConfiguracionModal';
import CalculadoraJeringas from './CalculadoraJeringas';
import EstadisticasConfiguracion from './EstadisticasConfiguracion';
import AyudaConfiguracion from './AyudaConfiguracion';
import { apiClient } from '../../config/api';

// Interfaces para tipado
interface Vacuna {
  id: string;
  nombre: string;
  tipo: string;
  presentacion: string;
  dosisPorFrasco: number;
}

interface Jeringa {
  id: string;
  tipo: string;
  capacidad: string;
  color: string;
}

interface CentroAcopio {
  id: string;
  nombre: string;
  codigo: string;
}

interface ConfiguracionDefecto {
  id: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  vacuna?: Vacuna;
  jeringa?: Jeringa;
}

interface ConfiguracionCentro {
  id: string;
  centroAcopioId: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  centroAcopio?: CentroAcopio;
  vacuna?: Vacuna;
  jeringa?: Jeringa;
}

/**
 * Componente principal para la configuración de jeringas por vacuna
 * Permite gestionar configuraciones por defecto y específicas por centro de acopio
 */
const ConfiguracionJeringas: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'defecto' | 'centro'>('defecto');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfiguracionDefecto | ConfiguracionCentro | null>(null);

  // Estados para configuraciones por defecto
  const [configuracionesDefecto, setConfiguracionesDefecto] = useState<ConfiguracionDefecto[]>([]);
  const [isLoadingDefecto, setIsLoadingDefecto] = useState(false);
  const [totalDefecto, setTotalDefecto] = useState(0);

  // Estados para configuraciones por centro
  const [configuracionesCentro, setConfiguracionesCentro] = useState<ConfiguracionCentro[]>([]);
  const [isLoadingCentro, setIsLoadingCentro] = useState(false);
  const [totalCentro, setTotalCentro] = useState(0);

  // Estados para datos de formulario
  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [jeringas, setJeringas] = useState<Jeringa[]>([]);
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    vacunaId: '',
    jeringaId: '',
    centroAcopioId: '',
    activo: 'todos'
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados para notificaciones
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Estado para ayuda
  const [showHelp, setShowHelp] = useState(false);

  const tabs = [
    {
      id: 'defecto' as const,
      label: 'Configuración por Defecto',
      icon: Settings,
      description: 'Configuraciones globales que se aplican a todos los centros de acopio'
    },
    {
      id: 'centro' as const,
      label: 'Configuración por Centro',
      icon: Building2,
      description: 'Configuraciones específicas que sobrescriben las configuraciones por defecto'
    }
  ];

  // Función para mostrar notificaciones
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Función helper para hacer llamadas autenticadas
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('sivac_auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('🚀 Componente ConfiguracionJeringas montado, cargando datos...');
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'defecto') {
      loadConfiguracionesDefecto();
    } else {
      loadConfiguracionesCentro();
    }
  }, [activeTab, currentPage, filtros, searchTerm]);

  // Cargar datos iniciales (vacunas, jeringas, centros)
  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      console.log('🔄 Cargando datos iniciales...');

      // Cargar vacunas usando apiClient
      try {
        console.log('📦 Fetching vacunas from /vacunas/activas');
        const vacunasRes = await apiClient.get('/vacunas/activas');
        console.log('📦 Respuesta vacunas:', vacunasRes.status, vacunasRes.data);

        if (vacunasRes.data.success && Array.isArray(vacunasRes.data.data)) {
          setVacunas(vacunasRes.data.data);
          console.log('✅ Vacunas cargadas exitosamente:', vacunasRes.data.data.length);
        } else {
          console.error('❌ Estructura de datos de vacunas inesperada:', vacunasRes.data);
        }
      } catch (error) {
        console.error('❌ Error en fetch vacunas:', error);
      }

      // Cargar jeringas usando apiClient
      try {
        console.log('💉 Fetching jeringas from /jeringas?estado=activo');
        const jeringasRes = await apiClient.get('/jeringas?estado=activo');
        console.log('💉 Respuesta jeringas:', jeringasRes.status, jeringasRes.data);

        if (jeringasRes.data.success && Array.isArray(jeringasRes.data.data)) {
          setJeringas(jeringasRes.data.data);
          console.log('✅ Jeringas cargadas exitosamente:', jeringasRes.data.data.length);
        } else {
          console.error('❌ Estructura de datos de jeringas inesperada:', jeringasRes.data);
        }
      } catch (error) {
        console.error('❌ Error en fetch jeringas:', error);
      }

      // Cargar centros de acopio usando apiClient con autenticación
      try {
        console.log('🏥 Fetching centros from /centros-acopio');
        const centrosRes = await apiClient.get('/centros-acopio');
        console.log('🏥 Respuesta centros:', centrosRes.status, centrosRes.data);

        if (centrosRes.data.success) {
          // Intentar diferentes estructuras de respuesta
          const centrosArray = centrosRes.data.data?.centrosAcopio || centrosRes.data.data || [];
          setCentrosAcopio(centrosArray);
          console.log('✅ Centros cargados exitosamente:', centrosArray.length);
        } else {
          console.error('❌ Estructura de datos de centros inesperada:', centrosRes.data);
        }
      } catch (error: any) {
        console.error('❌ Error al cargar centros de acopio:', error);
        if (error.response?.status === 401) {
          console.log('⚠️ Centros de acopio requieren autenticación - usuario no autenticado');
          showNotification('info', 'Inicie sesión para cargar centros de acopio');
        } else {
          showNotification('error', 'Error al cargar centros de acopio');
        }
      }

    } catch (error) {
      console.error('❌ Error al cargar datos iniciales:', error);
      showNotification('error', 'Error al cargar datos iniciales');
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadConfiguracionesDefecto = async () => {
    setIsLoadingDefecto(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filtros.vacunaId && { vacunaId: filtros.vacunaId }),
        ...(filtros.jeringaId && { jeringaId: filtros.jeringaId }),
        ...(filtros.activo !== 'todos' && { activo: filtros.activo }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await apiClient.get(`/configuracion-jeringa-vacuna/defecto?${params}`);

      if (response.data.success) {
        setConfiguracionesDefecto(response.data.data || []);
        setTotalDefecto(response.data.pagination?.total || 0);
      } else {
        throw new Error('Error al cargar configuraciones');
      }
    } catch (error) {
      console.error('Error al cargar configuraciones por defecto:', error);
      showNotification('error', 'Error al cargar configuraciones por defecto');
    } finally {
      setIsLoadingDefecto(false);
    }
  };

  const loadConfiguracionesCentro = async () => {
    setIsLoadingCentro(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filtros.centroAcopioId && { centroAcopioId: filtros.centroAcopioId }),
        ...(filtros.vacunaId && { vacunaId: filtros.vacunaId }),
        ...(filtros.jeringaId && { jeringaId: filtros.jeringaId }),
        ...(filtros.activo !== 'todos' && { activo: filtros.activo }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await apiClient.get(`/configuracion-jeringa-vacuna/centro?${params}`);

      if (response.data.success) {
        setConfiguracionesCentro(response.data.data || []);
        setTotalCentro(response.data.pagination?.total || 0);
      } else {
        throw new Error('Error al cargar configuraciones');
      }
    } catch (error) {
      console.error('Error al cargar configuraciones por centro:', error);
      showNotification('error', 'Error al cargar configuraciones por centro');
    } finally {
      setIsLoadingCentro(false);
    }
  };

  const handleCreateConfig = () => {
    console.log('🆕 Abriendo modal para nueva configuración');
    console.log('📦 Vacunas disponibles:', vacunas.length);
    console.log('💉 Jeringas disponibles:', jeringas.length);
    console.log('🏥 Centros disponibles:', centrosAcopio.length);

    setEditingConfig(null);
    setShowModal(true);
  };

  const handleEditConfig = (config: ConfiguracionDefecto | ConfiguracionCentro) => {
    setEditingConfig(config);
    setShowModal(true);
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta configuración?')) {
      return;
    }

    try {
      const endpoint = activeTab === 'defecto'
        ? `/configuracion-jeringa-vacuna/defecto/${id}`
        : `/configuracion-jeringa-vacuna/centro/${id}`;

      const response = await apiClient.delete(endpoint);

      if (response.data.success) {
        showNotification('success', 'Configuración eliminada exitosamente');
        if (activeTab === 'defecto') {
          loadConfiguracionesDefecto();
        } else {
          loadConfiguracionesCentro();
        }
      } else {
        throw new Error('Error al eliminar configuración');
      }
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      showNotification('error', 'Error al eliminar configuración');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingConfig(null);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingConfig(null);
    if (activeTab === 'defecto') {
      loadConfiguracionesDefecto();
    } else {
      loadConfiguracionesCentro();
    }
  };

  const handleToggleActive = async (config: ConfiguracionDefecto | ConfiguracionCentro) => {
    try {
      const endpoint = activeTab === 'defecto'
        ? `/configuracion-jeringa-vacuna/defecto/${config.id}`
        : `/configuracion-jeringa-vacuna/centro/${config.id}`;

      const response = await apiClient.put(endpoint, {
        activo: !config.activo
      });

      if (response.data.success) {
        showNotification('success', `Configuración ${!config.activo ? 'activada' : 'desactivada'} exitosamente`);
        if (activeTab === 'defecto') {
          loadConfiguracionesDefecto();
        } else {
          loadConfiguracionesCentro();
        }
      } else {
        throw new Error('Error al actualizar configuración');
      }
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      showNotification('error', 'Error al actualizar configuración');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearFilters = () => {
    setFiltros({
      vacunaId: '',
      jeringaId: '',
      centroAcopioId: '',
      activo: 'todos'
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const renderTabContent = () => {
    const isLoading = activeTab === 'defecto' ? isLoadingDefecto : isLoadingCentro;
    const configuraciones = activeTab === 'defecto' ? configuracionesDefecto : configuracionesCentro;
    const total = activeTab === 'defecto' ? totalDefecto : totalCentro;
    const totalPages = Math.ceil(total / itemsPerPage);

    return (
      <div className="space-y-6">
        {/* Barra de herramientas */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar configuraciones..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            <button
              onClick={handleCreateConfig}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva Configuración
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vacuna
                </label>
                <select
                  value={filtros.vacunaId}
                  onChange={(e) => handleFilterChange('vacunaId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las vacunas</option>
                  {vacunas.map(vacuna => (
                    <option key={vacuna.id} value={vacuna.id}>
                      {vacuna.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jeringa
                </label>
                <select
                  value={filtros.jeringaId}
                  onChange={(e) => handleFilterChange('jeringaId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las jeringas</option>
                  {jeringas.map(jeringa => (
                    <option key={jeringa.id} value={jeringa.id}>
                      {jeringa.tipo} {jeringa.capacidad}
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === 'centro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Centro de Acopio
                  </label>
                  <select
                    value={filtros.centroAcopioId}
                    onChange={(e) => handleFilterChange('centroAcopioId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los centros</option>
                    {centrosAcopio.map(centro => (
                      <option key={centro.id} value={centro.id}>
                        {centro.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filtros.activo}
                  onChange={(e) => handleFilterChange('activo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin h-8 w-8 text-blue-600 mr-2" />
            <span className="text-gray-600">Cargando configuraciones...</span>
          </div>
        ) : configuraciones.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Link className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay configuraciones
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'defecto'
                ? 'Comience creando configuraciones por defecto para las vacunas.'
                : 'No hay configuraciones específicas por centro de acopio.'
              }
            </p>
            <button
              onClick={handleCreateConfig}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear Primera Configuración
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {activeTab === 'centro' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Centro de Acopio
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vacuna
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jeringa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Multiplicador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
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
                    {configuraciones.map((config) => (
                      <tr key={config.id} className="hover:bg-gray-50">
                        {activeTab === 'centro' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {(config as ConfiguracionCentro).centroAcopio?.nombre || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(config as ConfiguracionCentro).centroAcopio?.codigo || ''}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-green-500 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {config.vacuna?.nombre || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {config.vacuna?.tipo || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Syringe className="h-4 w-4 text-blue-500 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {config.jeringa?.tipo || 'N/A'} {config.jeringa?.capacidad || ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                {config.jeringa?.color || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {config.multiplicador}x
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.prioridad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(config)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              config.activo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {config.activo ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditConfig(config)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfig(config.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div className="flex justify-between flex-1 sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                      {' '}a{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, total)}
                      </span>
                      {' '}de{' '}
                      <span className="font-medium">{total}</span>
                      {' '}resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>

                      {/* Números de página */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' :
          notification.type === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
            {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 mr-2" />}
            {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />}
            <span className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' :
              notification.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {notification.message}
            </span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Link className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configuración Jeringa-Vacuna
              </h1>
              <p className="text-gray-600">
                Configure los multiplicadores para el cálculo automático de jeringas por vacuna
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            title="Ver ayuda y documentación"
          >
            <HelpCircle className="h-4 w-4" />
            Ayuda
          </button>
        </div>

        {/* Loading indicator para datos iniciales */}
        {isLoadingData && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Loader className="animate-spin h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">Cargando datos del sistema...</span>
            </div>
          </div>
        )}

        {/* Debug info */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <strong>Vacunas:</strong> {vacunas.length} cargadas
              {vacunas.length > 0 && (
                <div className="mt-1 text-gray-600">
                  Ejemplo: {vacunas[0]?.nombre}
                </div>
              )}
            </div>
            <div>
              <strong>Jeringas:</strong> {jeringas.length} cargadas
              {jeringas.length > 0 && (
                <div className="mt-1 text-gray-600">
                  Ejemplo: {jeringas[0]?.tipo}
                </div>
              )}
            </div>
            <div>
              <strong>Centros:</strong> {centrosAcopio.length} cargados
              {centrosAcopio.length > 0 && (
                <div className="mt-1 text-gray-600">
                  Ejemplo: {centrosAcopio[0]?.nombre}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-4 w-4 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab description */}
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Estadísticas de configuración */}
      <EstadisticasConfiguracion
        onNotification={showNotification}
      />

      {/* Calculadora de jeringas */}
      <CalculadoraJeringas
        vacunas={vacunas}
        centrosAcopio={centrosAcopio}
        onNotification={showNotification}
      />

      {/* Tab content */}
      {renderTabContent()}

      {/* Modal para crear/editar configuración */}
      <ConfiguracionModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        tipo={activeTab}
        editingConfig={editingConfig}
        vacunas={vacunas}
        jeringas={jeringas}
        centrosAcopio={centrosAcopio}
        onNotification={showNotification}
      />

      {/* Modal de ayuda */}
      <AyudaConfiguracion
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
};

export default ConfiguracionJeringas;
