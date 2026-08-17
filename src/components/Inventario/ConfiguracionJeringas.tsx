import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  PencilSimple,
  Plus,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Trash,
} from '@phosphor-icons/react';
import { apiClient } from '../../config/api';
import { useToastContext } from '../../contexts/ToastContext';
import { COMPONENT_STYLES } from './constants';
import ConfiguracionModal from './ConfiguracionModal';
import { DeleteConfirmModal } from '../ui/ModalElements';
import {
  EmptyState,
  ErrorAlert,
  StatusBadge,
} from './components/SharedComponents';
import {
  DataTable,
  FilterBar,
  TableCell,
  TableHeader,
  TableRow,
} from './components/FilterAndTable';

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

const getNeedleColorHex = (colorName?: string): string => {
  if (!colorName) return '#94a3b8';
  const c = colorName.toLowerCase();
  if (c.includes('amarill')) return '#eab308';
  if (c.includes('azul')) return '#3b82f6';
  if (c.includes('naranj')) return '#f97316';
  if (c.includes('ver')) return '#22c55e';
  if (c.includes('negro') || c.includes('gris')) return '#334155';
  if (c.includes('marron') || c.includes('caf')) return '#854d0e';
  if (c.includes('rosad') || c.includes('rosa')) return '#ec4899';
  if (c.includes('morad') || c.includes('violet')) return '#a855f7';
  if (c.includes('transp') || c.includes('blanc')) return '#cbd5e1';
  return '#0d9488';
};

const buildEntityOptions = <T extends { id: string }>(
  items: Array<T | undefined>,
  getLabel: (item: T) => string,
) =>
  Array.from(
    new Map(
      items
        .filter((item): item is T => Boolean(item))
        .map((item) => [item.id, item]),
    ).values(),
  ).map((item) => ({ value: item.id, label: getLabel(item) }));

const normalizeText = (value?: string) => value?.toLowerCase().trim() || '';
const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

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
      if (!response.data.success) {
        throw new Error(response.data.message || 'No se pudieron cargar las configuraciones por defecto.');
      }

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
      if (!response.data.success) {
        throw new Error(response.data.message || 'No se pudieron cargar las configuraciones por centro.');
      }

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
      vacuna.presentacion ? `${vacuna.nombre} (${vacuna.presentacion})` : vacuna.nombre,
    );

    return options.length > 0
      ? [{ value: 'todos', label: 'Todas las vacunas' }, ...options]
      : [{ value: 'todos', label: 'Sin vacunas configuradas' }];
  }, [filterSource]);

  const jeringaOptions = useMemo(() => {
    const options = buildEntityOptions(filterSource.map((config) => config.jeringa), (jeringa) =>
      `${jeringa.tipo} ${jeringa.capacidad}${jeringa.color ? ` (${jeringa.color})` : ''}`,
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

    if (
      activeTab === 'centro' &&
      selectedCentroId !== 'todos' &&
      !centroOptions.some((option) => option.value === selectedCentroId)
    ) {
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
        const endpoint =
          activeTab === 'defecto'
            ? `/configuracion-jeringa-vacuna/defecto/${config.id}`
            : `/configuracion-jeringa-vacuna/centro/${config.id}`;
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
      const endpoint =
        activeTab === 'defecto'
          ? `/configuracion-jeringa-vacuna/defecto/${deleteTarget.id}`
          : `/configuracion-jeringa-vacuna/centro/${deleteTarget.id}`;
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

  const tableColumns: Array<{ key: string; label: string; align?: 'left' | 'center' | 'right' }> = useMemo(() => {
    const cols: Array<{ key: string; label: string; align?: 'left' | 'center' | 'right' }> = [
      { key: 'vacuna', label: 'Vacuna' },
      { key: 'jeringa', label: 'Jeringa Asignada' },
      { key: 'multiplicador', label: 'Ratio' },
    ];
    if (activeTab === 'centro') {
      cols.push({ key: 'centro', label: 'Centro de Acopio' });
    }
    cols.push(
      { key: 'prioridad', label: 'Prioridad' },
      { key: 'estado', label: 'Estado', align: 'center' },
      { key: 'acciones', label: 'Acciones', align: 'right' },
    );
    return cols;
  }, [activeTab]);

  return (
    <div className="space-y-4">
      {loadError ? <ErrorAlert message={loadError} onRetry={handleRefresh} /> : null}

      <section className={`${COMPONENT_STYLES.surface} p-4 sm:p-6`}>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className={`${COMPONENT_STYLES.mutedPanel} inline-flex w-full flex-wrap gap-2 p-1.5 sm:w-fit`}>
              <TabButton
                label="Reglas por defecto"
                count={totalDefecto}
                active={activeTab === 'defecto'}
                onClick={() => setActiveTab('defecto')}
              />
              <TabButton
                label="Reglas por centro"
                count={totalCentro}
                active={activeTab === 'centro'}
                onClick={() => setActiveTab('centro')}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className={COMPONENT_STYLES.button.primary}
                onClick={() => {
                  setEditingConfig(null);
                  setShowModal(true);
                }}
              >
                <Plus className="h-4 w-4" weight="bold" />
                <span>Nueva regla</span>
              </button>
            </div>
          </div>

          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar vacuna, jeringa o centro..."
            filters={filters}
            onClear={handleClearFilters}
          />

          {isLoading ? (
            <DataTable isLoading loadingMessage="Cargando configuraciones..." />
          ) : filteredConfiguraciones.length === 0 ? (
            <div className={COMPONENT_STYLES.panel}>
              <EmptyState
                icon={SlidersHorizontal}
                title="Sin asignaciones registradas"
                description={
                  hasActiveCriteria
                    ? 'No se encontraron resultados con los filtros seleccionados.'
                    : activeTab === 'defecto'
                    ? 'Cree la primera regla por defecto entre vacuna y jeringa.'
                    : 'Cree la primera regla específica para un centro de acopio.'
                }
                action={
                  hasActiveCriteria
                    ? undefined
                    : {
                        label: 'Nueva regla',
                        onClick: () => {
                          setEditingConfig(null);
                          setShowModal(true);
                        },
                      }
                }
              />
            </div>
          ) : (
            <>
              {/* Vista Tabla Desktop */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-line bg-white shadow-2xs">
                <DataTable>
                  <table className="min-w-full border-separate border-spacing-0">
                    <TableHeader columns={tableColumns} />
                    <tbody className="bg-white">
                      {filteredConfiguraciones.map((config) => (
                        <TableRow key={config.id}>
                          {/* Vacuna */}
                          <TableCell>
                            <div>
                              <p className="font-semibold text-ink text-sm">
                                {config.vacuna?.nombre || 'Sin vacuna'}
                              </p>
                              {config.vacuna?.presentacion ? (
                                <p className="text-xs text-muted-2 mt-0.5">
                                  {config.vacuna.presentacion}
                                </p>
                              ) : null}
                            </div>
                          </TableCell>

                          {/* Jeringa */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-2.5 w-2.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                                style={{ backgroundColor: getNeedleColorHex(config.jeringa?.color) }}
                                title={`Color: ${config.jeringa?.color || 'N/A'}`}
                              />
                              <div>
                                <p className="font-medium text-ink text-sm">
                                  {config.jeringa
                                    ? `${config.jeringa.tipo} ${config.jeringa.capacidad}`
                                    : 'Sin jeringa'}
                                </p>
                                {config.jeringa?.color ? (
                                  <p className="text-xs text-muted-2 mt-0.5">{config.jeringa.color}</p>
                                ) : null}
                              </div>
                            </div>
                          </TableCell>

                          {/* Ratio */}
                          <TableCell>
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-mono text-sm font-semibold text-ink">
                                {config.multiplicador}
                              </span>
                              <span className="text-xs text-muted-2">
                                jeringa{config.multiplicador === 1 ? '' : 's'} / dosis
                              </span>
                            </div>
                          </TableCell>

                          {/* Centro (si aplica) */}
                          {activeTab === 'centro' && (
                            <TableCell>
                              <div>
                                <p className="font-medium text-ink text-sm">
                                  {(config as ConfiguracionCentro).centroAcopio?.nombre || 'Sin centro'}
                                </p>
                                {(config as ConfiguracionCentro).centroAcopio?.codigo ? (
                                  <p className="font-mono text-xs text-muted-3 mt-0.5">
                                    Cód: {(config as ConfiguracionCentro).centroAcopio?.codigo}
                                  </p>
                                ) : null}
                              </div>
                            </TableCell>
                          )}

                          {/* Prioridad */}
                          <TableCell>
                            <span className="inline-flex items-center rounded-md border border-line bg-surface-soft px-2 py-0.5 text-xs font-medium text-ink">
                              Prioridad {config.prioridad}
                            </span>
                          </TableCell>

                          {/* Estado */}
                          <TableCell align="center">
                            <StatusBadge status={config.activo ? 'activo' : 'inactivo'} />
                          </TableCell>

                          {/* Acciones */}
                          <TableCell align="right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(config)}
                                className="inline-flex h-8 items-center gap-1 rounded-[7px] border border-line bg-white px-2 text-xs font-medium text-muted-2 transition hover:border-line-strong hover:bg-surface-soft hover:text-ink"
                                title={config.activo ? 'Desactivar regla' : 'Activar regla'}
                              >
                                {config.activo ? (
                                  <ToggleRight className="h-4 w-4 text-emerald-600" weight="fill" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-zinc-400" />
                                )}
                                <span>{config.activo ? 'Activa' : 'Inactiva'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingConfig(config);
                                  setShowModal(true);
                                }}
                                className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconEdit}`}
                                aria-label="Editar regla"
                                title="Editar"
                              >
                                <PencilSimple className="h-4 w-4" weight="bold" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(config)}
                                className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
                                aria-label="Eliminar regla"
                                title="Eliminar"
                              >
                                <Trash className="h-4 w-4" weight="bold" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </table>
                </DataTable>
              </div>

              {/* Vista Cards Móvil */}
              <div className="space-y-3 md:hidden">
                {filteredConfiguraciones.map((config) => (
                  <article key={config.id} className={`${COMPONENT_STYLES.panel} p-3.5 space-y-3`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-ink text-sm">
                          {config.vacuna?.nombre || 'Sin vacuna'}
                        </p>
                        {config.vacuna?.presentacion ? (
                          <p className="text-xs text-muted-2">{config.vacuna.presentacion}</p>
                        ) : null}
                      </div>
                      <StatusBadge status={config.activo ? 'activo' : 'inactivo'} />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-ink bg-surface-soft rounded-lg p-2.5 border border-line-soft">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: getNeedleColorHex(config.jeringa?.color) }}
                      />
                      <span className="font-medium truncate">
                        {config.jeringa
                          ? `${config.jeringa.tipo} ${config.jeringa.capacidad}`
                          : 'Sin jeringa'}
                      </span>
                      <span className="text-muted-3">·</span>
                      <span className="text-muted-2 shrink-0">
                        {config.multiplicador} / dosis
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded border border-line bg-white px-1.5 py-0.5 font-medium text-ink">
                          Prioridad {config.prioridad}
                        </span>
                        {activeTab === 'centro' && (
                          <span className="text-muted-2 truncate max-w-[130px]">
                            {(config as ConfiguracionCentro).centroAcopio?.nombre}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(config)}
                          className="inline-flex h-7 items-center gap-1 rounded border border-line bg-white px-2 text-[11px] font-medium text-muted-2 hover:bg-surface-soft hover:text-ink"
                        >
                          {config.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingConfig(config);
                            setShowModal(true);
                          }}
                          className={`${COMPONENT_STYLES.button.icon} h-7 w-7 ${COMPONENT_STYLES.button.iconEdit}`}
                          aria-label="Editar"
                        >
                          <PencilSimple className="h-3.5 w-3.5" weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(config)}
                          className={`${COMPONENT_STYLES.button.icon} h-7 w-7 ${COMPONENT_STYLES.button.iconDelete}`}
                          aria-label="Eliminar"
                        >
                          <Trash className="h-3.5 w-3.5" weight="bold" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
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
    className={`${COMPONENT_STYLES.nav.tab} ${
      active ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
    } min-w-[130px] justify-between sm:min-w-[160px]`}
  >
    <span>{label}</span>
    <span className={active ? COMPONENT_STYLES.badge.count : COMPONENT_STYLES.badge.inactive}>
      {count}
    </span>
  </button>
);

export default memo(ConfiguracionJeringas);
