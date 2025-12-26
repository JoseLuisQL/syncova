import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Plus, Settings, Edit, Trash2, Search, Building2, X, CheckCircle, Package, Syringe, RefreshCw } from 'lucide-react';
import ConfiguracionModal from './ConfiguracionModal';
import { apiClient } from '../../config/api';
import { useToastContext } from '../../contexts/ToastContext';
import { LoadingSpinner, EmptyState } from './components/SharedComponents';
import { DeleteConfirmModal } from './components/ModalComponents';
import { COMPONENT_STYLES } from './constants';

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

const ConfiguracionJeringas: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'defecto' | 'centro'>('defecto');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfiguracionDefecto | ConfiguracionCentro | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConfiguracionDefecto | ConfiguracionCentro | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [configuracionesDefecto, setConfiguracionesDefecto] = useState<ConfiguracionDefecto[]>([]);
  const [isLoadingDefecto, setIsLoadingDefecto] = useState(false);
  const [totalDefecto, setTotalDefecto] = useState(0);

  const [configuracionesCentro, setConfiguracionesCentro] = useState<ConfiguracionCentro[]>([]);
  const [isLoadingCentro, setIsLoadingCentro] = useState(false);
  const [totalCentro, setTotalCentro] = useState(0);

  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [jeringas, setJeringas] = useState<Jeringa[]>([]);
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { toast } = useToastContext();

  const loadInitialData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [vacunasRes, jeringasRes, centrosRes] = await Promise.all([
        apiClient.get('/vacunas/activas').catch(() => ({ data: { success: false } })),
        apiClient.get('/jeringas?estado=activo').catch(() => ({ data: { success: false } })),
        apiClient.get('/centros-acopio').catch(() => ({ data: { success: false } })),
      ]);

      if (vacunasRes.data.success && Array.isArray(vacunasRes.data.data)) {
        setVacunas(vacunasRes.data.data);
      }

      if (jeringasRes.data.success && Array.isArray(jeringasRes.data.data)) {
        setJeringas(jeringasRes.data.data);
      }

      if (centrosRes.data.success) {
        const centrosArray = centrosRes.data.data?.centrosAcopio || centrosRes.data.data || [];
        setCentrosAcopio(centrosArray);
      }
    } catch {
      toast.error('Error al cargar datos iniciales');
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  const loadConfiguracionesDefecto = useCallback(async () => {
    setIsLoadingDefecto(true);
    try {
      const params = new URLSearchParams({
        limit: '100',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await apiClient.get(`/configuracion-jeringa-vacuna/defecto?${params}`);

      if (response.data.success) {
        setConfiguracionesDefecto(response.data.data || []);
        setTotalDefecto(response.data.pagination?.total || response.data.data?.length || 0);
      }
    } catch {
      toast.error('Error al cargar configuraciones');
    } finally {
      setIsLoadingDefecto(false);
    }
  }, [searchTerm, toast]);

  const loadConfiguracionesCentro = useCallback(async () => {
    setIsLoadingCentro(true);
    try {
      const params = new URLSearchParams({
        limit: '100',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await apiClient.get(`/configuracion-jeringa-vacuna/centro?${params}`);

      if (response.data.success) {
        setConfiguracionesCentro(response.data.data || []);
        setTotalCentro(response.data.pagination?.total || response.data.data?.length || 0);
      }
    } catch {
      toast.error('Error al cargar configuraciones');
    } finally {
      setIsLoadingCentro(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'defecto') {
        loadConfiguracionesDefecto();
      } else {
        loadConfiguracionesCentro();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchTerm]);

  const handleCreateConfig = useCallback(() => {
    setEditingConfig(null);
    setShowModal(true);
  }, []);

  const handleEditConfig = useCallback((config: ConfiguracionDefecto | ConfiguracionCentro) => {
    setEditingConfig(config);
    setShowModal(true);
  }, []);

  const handleDeleteConfig = useCallback((config: ConfiguracionDefecto | ConfiguracionCentro) => {
    setDeleteTarget(config);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const endpoint = activeTab === 'defecto'
        ? `/configuracion-jeringa-vacuna/defecto/${deleteTarget.id}`
        : `/configuracion-jeringa-vacuna/centro/${deleteTarget.id}`;

      const response = await apiClient.delete(endpoint);

      if (response.data.success) {
        toast.success('Configuración eliminada');
        setDeleteTarget(null);
        if (activeTab === 'defecto') {
          loadConfiguracionesDefecto();
        } else {
          loadConfiguracionesCentro();
        }
      }
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, activeTab, loadConfiguracionesDefecto, loadConfiguracionesCentro, toast]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingConfig(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setShowModal(false);
    setEditingConfig(null);
    if (activeTab === 'defecto') {
      loadConfiguracionesDefecto();
    } else {
      loadConfiguracionesCentro();
    }
  }, [activeTab, loadConfiguracionesDefecto, loadConfiguracionesCentro]);

  const handleToggleActive = useCallback(async (config: ConfiguracionDefecto | ConfiguracionCentro) => {
    try {
      const endpoint = activeTab === 'defecto'
        ? `/configuracion-jeringa-vacuna/defecto/${config.id}`
        : `/configuracion-jeringa-vacuna/centro/${config.id}`;

      const response = await apiClient.put(endpoint, { activo: !config.activo });

      if (response.data.success) {
        toast.success(`Configuración ${!config.activo ? 'activada' : 'desactivada'}`);
        if (activeTab === 'defecto') {
          loadConfiguracionesDefecto();
        } else {
          loadConfiguracionesCentro();
        }
      }
    } catch {
      toast.error('Error al actualizar');
    }
  }, [activeTab, loadConfiguracionesDefecto, loadConfiguracionesCentro, toast]);

  const handleRefresh = useCallback(() => {
    if (activeTab === 'defecto') {
      loadConfiguracionesDefecto();
    } else {
      loadConfiguracionesCentro();
    }
  }, [activeTab, loadConfiguracionesDefecto, loadConfiguracionesCentro]);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
  }, [toast]);

  const isLoading = activeTab === 'defecto' ? isLoadingDefecto : isLoadingCentro;
  const configuraciones = activeTab === 'defecto' ? configuracionesDefecto : configuracionesCentro;
  const total = activeTab === 'defecto' ? totalDefecto : totalCentro;

  // Estadísticas simples
  const stats = useMemo(() => {
    const activas = configuraciones.filter(c => c.activo).length;
    const inactivas = configuraciones.filter(c => !c.activo).length;
    return { total: configuraciones.length, activas, inactivas };
  }, [configuraciones]);

  return (
    <div className="p-5 sm:p-6">
      {/* Header minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Configuración de Jeringas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define qué jeringa usar para cada vacuna
          </p>
        </div>
        <button
          onClick={handleCreateConfig}
          className={COMPONENT_STYLES.button.primary}
        >
          <Plus className="h-4 w-4" />
          Nueva Configuración
        </button>
      </div>

      {/* Tabs simples */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab('defecto')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'defecto'
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="h-4 w-4" />
          Por Defecto
          <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
            activeTab === 'defecto' ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {totalDefecto}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('centro')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'centro'
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Por Centro
          <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
            activeTab === 'centro' ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {totalCentro}
          </span>
        </button>
      </div>

      {/* Stats compactos */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Activas</p>
          <p className="text-lg font-semibold text-emerald-600">{stats.activas}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500">Inactivas</p>
          <p className="text-lg font-semibold text-gray-400">{stats.inactivas}</p>
        </div>
      </div>

      {/* Barra de búsqueda simple */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por vacuna o jeringa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Contenido */}
      {isLoadingData || isLoading ? (
        <LoadingSpinner message="Cargando..." />
      ) : configuraciones.length === 0 ? (
        <EmptyState
          icon={Settings}
          title="Sin configuraciones"
          description={
            searchTerm
              ? 'No se encontraron resultados para la búsqueda'
              : activeTab === 'defecto'
                ? 'Cree configuraciones por defecto para asignar jeringas a vacunas'
                : 'Cree configuraciones específicas para cada centro de acopio'
          }
          action={!searchTerm ? { label: 'Crear Configuración', onClick: handleCreateConfig } : undefined}
        />
      ) : (
        <div className="space-y-2">
          {configuraciones.map((config) => (
            <ConfigCard
              key={config.id}
              config={config}
              activeTab={activeTab}
              onEdit={handleEditConfig}
              onDelete={handleDeleteConfig}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Modal */}
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

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.vacuna?.nombre || 'Configuración'}
        itemType="Configuración"
        isLoading={isDeleting}
      />
    </div>
  );
};

// ============================================================================
// CONFIG CARD COMPONENT - Diseño de tarjeta más limpio
// ============================================================================

interface ConfigCardProps {
  config: ConfiguracionDefecto | ConfiguracionCentro;
  activeTab: 'defecto' | 'centro';
  onEdit: (config: ConfiguracionDefecto | ConfiguracionCentro) => void;
  onDelete: (config: ConfiguracionDefecto | ConfiguracionCentro) => void;
  onToggleActive: (config: ConfiguracionDefecto | ConfiguracionCentro) => void;
}

const ConfigCard: React.FC<ConfigCardProps> = memo(({ config, activeTab, onEdit, onDelete, onToggleActive }) => (
  <div className={`bg-white rounded-lg border ${config.activo ? 'border-gray-200' : 'border-gray-100 opacity-60'} p-4 hover:shadow-sm transition-all`}>
    <div className="flex items-center justify-between gap-4">
      {/* Info principal */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Centro (solo si es por centro) */}
        {activeTab === 'centro' && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-purple-50 rounded-lg shrink-0">
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {(config as ConfiguracionCentro).centroAcopio?.nombre || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Centro</p>
            </div>
          </div>
        )}

        {/* Vacuna */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
            <Package className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {config.vacuna?.nombre || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">Vacuna</p>
          </div>
        </div>

        {/* Flecha de relación */}
        <div className="text-gray-300 shrink-0">→</div>

        {/* Jeringa */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-cyan-50 rounded-lg shrink-0">
            <Syringe className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {config.jeringa?.tipo} {config.jeringa?.capacidad}
            </p>
            <p className="text-xs text-gray-500">{config.jeringa?.color}</p>
          </div>
        </div>

        {/* Multiplicador */}
        <div className="shrink-0 hidden sm:block">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-700">
            {config.multiplicador}x
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleActive(config)}
          className={`p-1.5 rounded-md transition-colors ${
            config.activo
              ? 'text-emerald-600 hover:bg-emerald-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={config.activo ? 'Desactivar' : 'Activar'}
        >
          {config.activo ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onEdit(config)}
          className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(config)}
          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
));

ConfigCard.displayName = 'ConfigCard';

export default ConfiguracionJeringas;
