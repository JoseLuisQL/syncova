import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Package, SlidersHorizontal, Syringe, ToggleLeft, ToggleRight, Trash } from '@phosphor-icons/react';
import { apiClient } from '../../config/api';
import { useToastContext } from '../../contexts/ToastContext';
import { COMPONENT_STYLES } from './constants';
import ConfiguracionModal from './ConfiguracionModal';
import {
  DeleteConfirmModal,
} from '../ui/ModalElements';
import {
  EmptyState,
  ErrorAlert,
  LoadingSpinner,
  StatusBadge,
} from './components/SharedComponents';
import { FilterBar } from './components/FilterAndTable';

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

const buildEntityOptions = <T extends { id: string }>(
  items: Array<T | undefined>,
  getLabel: (item: T) => string,
) => Array.from(new Map(items.filter((item): item is T => Boolean(item)).map((item) => [item.id, item])).values())
  .map((item) => ({ value: item.id, label: getLabel(item) }));

const normalizeText = (value?: string) => value?.toLowerCase().trim() || '';
const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

const ConfiguracionJeringas: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'defecto' | 'centro'>('defecto');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVacunaId, setSelectedVacunaId] = useState('todos');
  const [selectedJeringaId, setSelectedJeringaId] = useState('todos');
  const [selectedCentroId, setSelectedCentroId] = useState('todos');
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
  const [loadError, setLoadError] = useState<string | null>(null);

  const { toast } = useToastContext();

  const loadInitialData = useCallback(async () => {
    setIsLoadingData(true);
    setLoadError(null);
    try {
      const [vacunasRes, jeringasRes, centrosRes] = await Promise.all([
        apiClient.get('/vacunas/activas'),
        apiClient.get('/jeringas?estado=activo'),
        apiClient.get('/centros-acopio'),
      ]);

      if (vacunasRes.data.success) {
        setVacunas(vacunasRes.data.data || []);
      }
      if (jeringasRes.data.success) {
        setJeringas(jeringasRes.data.data || []);
      }
      if (centrosRes.data.success) {
        const centros = centrosRes.data.data?.centrosAcopio || centrosRes.data.data || [];
        setCentrosAcopio(centros);
      }
    } catch {
      setLoadError('No se pudieron cargar los datos base de configuración.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const loadConfiguracionesDefecto = useCallback(async () => {
    setIsLoadingDefecto(true);
    try {
      const params = new URLSearchParams({ limit: '1000' });
      const response = await apiClient.get(`/configuracion-jeringa-vacuna/defecto?${params}`);
      if (!response.data.success) throw new Error(response.data.message || 'No se pudieron cargar las configuraciones por defecto.');

      setConfiguracionesDefecto(response.data.data || []);
      setTotalDefecto(response.data.pagination?.total || response.data.data?.length || 0);
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error, 'No se pudieron cargar las configuraciones por defecto.'));
    } finally {
      setIsLoadingDefecto(false);
    }
  }, []);

  const loadConfiguracionesCentro = useCallback(async () => {
    setIsLoadingCentro(true);
    try {
      const params = new URLSearchParams({ limit: '1000' });
      const response = await apiClient.get(`/configuracion-jeringa-vacuna/centro?${params}`);
      if (!response.data.success) throw new Error(response.data.message || 'No se pudieron cargar las configuraciones por centro.');

      setConfiguracionesCentro(response.data.data || []);
      setTotalCentro(response.data.pagination?.total || response.data.data?.length || 0);
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error, 'No se pudieron cargar las configuraciones por centro.'));
    } finally {
      setIsLoadingCentro(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
    void loadConfiguracionesDefecto();
    void loadConfiguracionesCentro();
  }, [loadConfiguracionesCentro, loadConfiguracionesDefecto, loadInitialData]);

  const configuraciones = activeTab === 'defecto' ? configuracionesDefecto : configuracionesCentro;
  const isLoading = isLoadingData || (activeTab === 'defecto' ? isLoadingDefecto : isLoadingCentro);

  const filterSource = activeTab === 'defecto' ? configuracionesDefecto : configuracionesCentro;

  const vacunaOptions = useMemo(() => {
    const options = buildEntityOptions(filterSource.map((config) => config.vacuna), (vacuna) =>
      vacuna.presentacion ? `${vacuna.nombre} · ${vacuna.presentacion}` : vacuna.nombre,
    );

    return options.length > 0
      ? [{ value: 'todos', label: 'Todas las vacunas' }, ...options]
      : [{ value: 'todos', label: 'Sin vacunas configuradas' }];
  }, [filterSource]);

  const jeringaOptions = useMemo(() => {
    const options = buildEntityOptions(filterSource.map((config) => config.jeringa), (jeringa) =>
      `${jeringa.tipo} ${jeringa.capacidad}${jeringa.color ? ` · ${jeringa.color}` : ''}`,
    );

    return options.length > 0
      ? [{ value: 'todos', label: 'Todas las jeringas' }, ...options]
      : [{ value: 'todos', label: 'Sin jeringas configuradas' }];
  }, [filterSource]);

  const centroOptions = useMemo(() => {
    if (activeTab !== 'centro') {
      return [{ value: 'todos', label: 'Todos los centros' }];
    }

    const options = buildEntityOptions(
      configuracionesCentro.map((config) => config.centroAcopio),
      (centro) => (centro.codigo ? `${centro.nombre} (${centro.codigo})` : centro.nombre),
    );

    return options.length > 0
      ? [{ value: 'todos', label: 'Todos los centros' }, ...options]
      : [{ value: 'todos', label: 'Sin centros configurados' }];
  }, [activeTab, configuracionesCentro]);

  useEffect(() => {
    if (selectedVacunaId !== 'todos' && !vacunaOptions.some((option) => option.value === selectedVacunaId)) {
      setSelectedVacunaId('todos');
    }

    if (selectedJeringaId !== 'todos' && !jeringaOptions.some((option) => option.value === selectedJeringaId)) {
      setSelectedJeringaId('todos');
    }

    if (activeTab === 'centro' && selectedCentroId !== 'todos' && !centroOptions.some((option) => option.value === selectedCentroId)) {
      setSelectedCentroId('todos');
    }
  }, [activeTab, centroOptions, jeringaOptions, selectedCentroId, selectedJeringaId, selectedVacunaId, vacunaOptions]);

  const filters = useMemo(() => {
    const baseFilters = [
      {
        id: 'config-filter-vacuna',
        label: 'Vacuna',
        value: selectedVacunaId,
        options: vacunaOptions,
        onChange: setSelectedVacunaId,
        disabled: vacunaOptions.length <= 1,
      },
      {
        id: 'config-filter-jeringa',
        label: 'Jeringa',
        value: selectedJeringaId,
        options: jeringaOptions,
        onChange: setSelectedJeringaId,
        disabled: jeringaOptions.length <= 1,
      },
    ];

    if (activeTab === 'centro') {
      baseFilters.push({
        id: 'config-filter-centro',
        label: 'Centro',
        value: selectedCentroId,
        options: centroOptions,
        onChange: setSelectedCentroId,
        disabled: centroOptions.length <= 1,
      });
    }

    return baseFilters;
  }, [activeTab, centroOptions, jeringaOptions, selectedCentroId, selectedJeringaId, selectedVacunaId, vacunaOptions]);

  const filteredConfiguraciones = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return configuraciones.filter((config) => {
      const searchableValues = [
        config.vacuna?.nombre,
        config.vacuna?.tipo,
        config.vacuna?.presentacion,
        config.jeringa?.tipo,
        config.jeringa?.capacidad,
        config.jeringa?.color,
        'centroAcopio' in config ? (config as ConfiguracionCentro).centroAcopio?.nombre : undefined,
        'centroAcopio' in config ? (config as ConfiguracionCentro).centroAcopio?.codigo : undefined,
      ]
        .map((value) => normalizeText(value))
        .filter(Boolean);

      const matchesSearch =
        !normalizedSearch || searchableValues.some((value) => value.includes(normalizedSearch));

      const matchesVacuna = selectedVacunaId === 'todos' || config.vacunaId === selectedVacunaId;
      const matchesJeringa = selectedJeringaId === 'todos' || config.jeringaId === selectedJeringaId;
      const matchesCentro =
        activeTab !== 'centro' ||
        selectedCentroId === 'todos' ||
        ('centroAcopioId' in config && config.centroAcopioId === selectedCentroId);

      return matchesSearch && matchesVacuna && matchesJeringa && matchesCentro;
    });
  }, [activeTab, configuraciones, searchTerm, selectedCentroId, selectedJeringaId, selectedVacunaId]);

  const hasActiveCriteria = useMemo(
    () =>
      Boolean(searchTerm.trim()) ||
      selectedVacunaId !== 'todos' ||
      selectedJeringaId !== 'todos' ||
      (activeTab === 'centro' && selectedCentroId !== 'todos'),
    [activeTab, searchTerm, selectedCentroId, selectedJeringaId, selectedVacunaId],
  );

  const handleRefresh = useCallback(() => {
    setLoadError(null);
    if (activeTab === 'defecto') {
      void loadConfiguracionesDefecto();
      return;
    }

    void loadConfiguracionesCentro();
  }, [activeTab, loadConfiguracionesCentro, loadConfiguracionesDefecto]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedVacunaId('todos');
    setSelectedJeringaId('todos');
    setSelectedCentroId('todos');
  }, []);

  const handleToggleActive = useCallback(
    async (config: ConfiguracionDefecto | ConfiguracionCentro) => {
      try {
        const endpoint = activeTab === 'defecto' ? `/configuracion-jeringa-vacuna/defecto/${config.id}` : `/configuracion-jeringa-vacuna/centro/${config.id}`;
        const response = await apiClient.put(endpoint, { activo: !config.activo });
        if (!response.data.success) throw new Error(response.data.message || 'No se pudo actualizar el estado.');

        toast.success('Estado actualizado', `La configuración fue ${config.activo ? 'desactivada' : 'activada'}.`);
        handleRefresh();
      } catch (error: unknown) {
        toast.error('No se pudo actualizar el estado', getErrorMessage(error, 'Intente nuevamente.'));
      }
    },
    [activeTab, handleRefresh, toast],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const endpoint = activeTab === 'defecto' ? `/configuracion-jeringa-vacuna/defecto/${deleteTarget.id}` : `/configuracion-jeringa-vacuna/centro/${deleteTarget.id}`;
      const response = await apiClient.delete(endpoint);
      if (!response.data.success) throw new Error(response.data.message || 'No se pudo eliminar la configuración.');

      toast.success('Configuración eliminada', 'La relación fue eliminada correctamente.');
      setDeleteTarget(null);
      handleRefresh();
    } catch (error: unknown) {
      toast.error('No se pudo eliminar la configuración', getErrorMessage(error, 'Intente nuevamente.'));
    } finally {
      setIsDeleting(false);
    }
  }, [activeTab, deleteTarget, handleRefresh, toast]);

  return (
    <div className="space-y-4">
      {loadError ? <ErrorAlert message={loadError} onRetry={handleRefresh} /> : null}

      <section className={`${COMPONENT_STYLES.surface} p-4 sm:p-6`}>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className={`${COMPONENT_STYLES.mutedPanel} inline-flex w-full flex-wrap gap-2 p-2 sm:w-fit`}>
              <TabButton label="Por defecto" count={totalDefecto} active={activeTab === 'defecto'} onClick={() => setActiveTab('defecto')} />
              <TabButton label="Por centro" count={totalCentro} active={activeTab === 'centro'} onClick={() => setActiveTab('centro')} />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className={COMPONENT_STYLES.button.primary}
                onClick={() => {
                  setEditingConfig(null);
                  setShowModal(true);
                }}
              >
                <SlidersHorizontal className="h-4 w-4" weight="bold" />
                <span>Nueva configuración</span>
              </button>
            </div>
          </div>

          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por vacuna, jeringa o centro"
            filters={filters}
            onClear={handleClearFilters}
            layout="inline"
            actions={
              <div className="min-w-[152px] sm:min-w-[168px]">
                <p className={COMPONENT_STYLES.input.label}>Resultados</p>
                <div className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 shadow-sm">
                  {filteredConfiguraciones.length} resultado{filteredConfiguraciones.length === 1 ? '' : 's'}
                </div>
              </div>
            }
          />

          {isLoading ? (
            <LoadingSpinner message="Cargando configuraciones..." />
          ) : filteredConfiguraciones.length === 0 ? (
            <div className={COMPONENT_STYLES.panel}>
              <EmptyState
                icon={SlidersHorizontal}
                title="Sin configuraciones"
                description={
                  hasActiveCriteria
                    ? 'No se encontraron resultados con los filtros actuales.'
                    : activeTab === 'defecto'
                    ? 'Cree la primera relación por defecto entre vacuna y jeringa.'
                    : 'Cree la primera relación por centro para una regla específica.'
                }
                action={
                  hasActiveCriteria
                    ? undefined
                    : { label: 'Nueva configuración', onClick: () => { setEditingConfig(null); setShowModal(true); } }
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConfiguraciones.map((config) => (
                <ConfigCard
                  key={config.id}
                  config={config}
                  activeTab={activeTab}
                  onEdit={(current) => {
                    setEditingConfig(current);
                    setShowModal(true);
                  }}
                  onDelete={(current) => setDeleteTarget(current)}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <ConfiguracionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingConfig(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          setEditingConfig(null);
          handleRefresh();
        }}
        tipo={activeTab}
        editingConfig={editingConfig}
        vacunas={vacunas}
        jeringas={jeringas}
        centrosAcopio={centrosAcopio}
        onNotification={(type, message) => {
          if (type === 'success') toast.success(message);
          else if (type === 'info') toast.info(message);
          else toast.error(message);
        }}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.vacuna?.nombre || 'Configuración'}
        itemType="configuración"
        isLoading={isDeleting}
      />
    </div>
  );
};

interface TabButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, count, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${COMPONENT_STYLES.nav.tab} ${active ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive} min-w-[150px] justify-between`}
  >
    <span>{label}</span>
    <span className={active ? COMPONENT_STYLES.badge.count : COMPONENT_STYLES.badge.inactive}>{count}</span>
  </button>
);

interface ConfigCardProps {
  config: ConfiguracionDefecto | ConfiguracionCentro;
  activeTab: 'defecto' | 'centro';
  onEdit: (config: ConfiguracionDefecto | ConfiguracionCentro) => void;
  onDelete: (config: ConfiguracionDefecto | ConfiguracionCentro) => void;
  onToggleActive: (config: ConfiguracionDefecto | ConfiguracionCentro) => void;
}

const ConfigCard: React.FC<ConfigCardProps> = memo(({ config, activeTab, onEdit, onDelete, onToggleActive }) => (
  <article className={`${COMPONENT_STYLES.panel} p-4`}>
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {activeTab === 'centro' ? (
          <span className={`${COMPONENT_STYLES.badge.count} max-w-full truncate`}>
            Centro: {(config as ConfiguracionCentro).centroAcopio?.nombre || 'Pendiente'}
          </span>
        ) : (
          <span className={COMPONENT_STYLES.badge.count}>Regla por defecto</span>
        )}
        <StatusBadge status={config.activo ? 'activo' : 'inactivo'} />
        <span className={COMPONENT_STYLES.badge.inactive}>Prioridad {config.prioridad}</span>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] xl:items-center">
        <RuleNode
          icon={Package}
          title="Si seleccionas esta vacuna"
          value={config.vacuna?.nombre || 'Sin vacuna'}
          meta={config.vacuna?.presentacion || 'Sin presentación'}
        />

        <div className="hidden items-center justify-center text-slate-300 xl:flex">
          <ArrowRight className="h-4 w-4" weight="bold" />
        </div>

        <RuleNode
          icon={Syringe}
          title="Se usará esta jeringa"
          value={config.jeringa ? `${config.jeringa.tipo} ${config.jeringa.capacidad}` : 'Sin jeringa'}
          meta={config.jeringa?.color || 'Sin color'}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className={COMPONENT_STYLES.badge.count}>{config.multiplicador} jeringas por dosis</span>
          {activeTab === 'centro' && (config as ConfiguracionCentro).centroAcopio?.codigo ? (
            <span className={COMPONENT_STYLES.badge.inactive}>Código {(config as ConfiguracionCentro).centroAcopio?.codigo}</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onToggleActive(config)} className={COMPONENT_STYLES.button.ghost}>
            {config.activo ? <ToggleRight className="h-5 w-5 text-emerald-600" weight="fill" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
            <span>{config.activo ? 'Desactivar' : 'Activar'}</span>
          </button>
          <button type="button" onClick={() => onEdit(config)} className={COMPONENT_STYLES.button.ghost}>
            Editar
          </button>
          <button type="button" onClick={() => onDelete(config)} className={`${COMPONENT_STYLES.button.ghost} text-rose-700 hover:text-rose-800`}>
            <Trash className="h-4 w-4" weight="bold" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  </article>
));

ConfigCard.displayName = 'ConfigCard';

interface RuleNodeProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  meta: string;
}

const RuleNode: React.FC<RuleNodeProps> = ({ icon: Icon, title, value, meta }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
    <div className="flex items-center gap-2 text-slate-500">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-[0.08em]">{title}</span>
    </div>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{meta}</p>
  </div>
);

export default memo(ConfiguracionJeringas);
