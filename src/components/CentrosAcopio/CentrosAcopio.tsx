import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building, Building2, GitBranch, MapPin, Network, Plus, RefreshCw, User } from 'lucide-react';
import { CentroAcopio, CreateCentroAcopioDto, Microred, UpdateCentroAcopioDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useCentrosAcopio } from '../../hooks/useCentrosAcopio';
import { useMicroredes } from '../../hooks/useMicroredes';
import { useRedes } from '../../hooks/useRedes';
import { sanitizeInput, validateCentroAcopio } from '../../utils/validation';
import { ColorScheme, COMPONENT_STYLES, STATS_CONFIG } from '../Establecimientos/constants';
import {
  ActionButtons,
  CountBadge,
  EmptyState,
  ErrorAlert,
  StatusBadge,
} from '../Establecimientos/components';
import {
  DataTable,
  FilterBar,
  Pagination,
  TableCell,
  TableHeader,
  TableRow,
} from '../Establecimientos/components';
import {
  DeleteConfirmModal,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextArea,
  TextInput,
} from '../Establecimientos/components';

interface CentrosAcopioProps {
  selectedRedId?: string;
  selectedRedNombre?: string;
  selectedMicroredId?: string;
  selectedMicroredNombre?: string;
  onNavigateToEstablecimientos?: (centroAcopioId: string, centroAcopioNombre: string) => void;
}

const TABLE_COLUMNS = [
  { key: 'centro', label: 'Centro de Acopio' },
  { key: 'codigo', label: 'Código' },
  { key: 'microred', label: 'Cobertura territorial' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'establecimientos', label: 'Establecimientos', align: 'center' as const },
  { key: 'estado', label: 'Estado', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

const CentrosAcopio: React.FC<CentrosAcopioProps> = ({
  selectedRedId = '',
  selectedMicroredId = '',
  onNavigateToEstablecimientos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterRedId, setFilterRedId] = useState(selectedRedId);
  const [filterMicroredId, setFilterMicroredId] = useState(selectedMicroredId);
  const [showModal, setShowModal] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroAcopio | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    nombre: string;
  }>({ isOpen: false, id: '', nombre: '' });
  const filterInitRef = useRef(false);

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
    deleteCentroAcopio,
  } = useCentrosAcopio();

  const { redes } = useRedes();
  const { microredes } = useMicroredes();
  const { toast } = useToastContext();

  useEffect(() => {
    setFilterRedId(selectedRedId || '');
  }, [selectedRedId]);

  useEffect(() => {
    setFilterMicroredId(selectedMicroredId || '');
  }, [selectedMicroredId]);

  const microredesFiltradas = useMemo(() => {
    if (!filterRedId) return microredes;
    return microredes.filter((microred) => microred.redId === filterRedId);
  }, [filterRedId, microredes]);

  useEffect(() => {
    if (filterMicroredId && !microredesFiltradas.some((microred) => microred.id === filterMicroredId)) {
      setFilterMicroredId(selectedMicroredId || '');
    }
  }, [filterMicroredId, microredesFiltradas, selectedMicroredId]);

  useEffect(() => {
    const isFirstRun = !filterInitRef.current;
    filterInitRef.current = true;

    if (isFirstRun && !searchTerm && filterEstado === 'todos' && !filterRedId && !filterMicroredId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextFilters: Record<string, string> = {};
      if (filterRedId) nextFilters.redId = filterRedId;
      if (filterMicroredId) nextFilters.microredId = filterMicroredId;
      if (filterEstado !== 'todos') nextFilters.estado = filterEstado;
      if (searchTerm.trim()) nextFilters.search = searchTerm.trim();
      setFilters(nextFilters);
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [filterEstado, filterMicroredId, filterRedId, searchTerm, setFilters]);

  const stats = useMemo(
    () => [
      { ...STATS_CONFIG.centrosAcopio[0], value: total, color: STATS_CONFIG.centrosAcopio[0].color as ColorScheme },
      {
        ...STATS_CONFIG.centrosAcopio[1],
        value: centrosAcopio.filter((centro) => centro.estado === 'activo').length,
        color: STATS_CONFIG.centrosAcopio[1].color as ColorScheme,
      },
      {
        ...STATS_CONFIG.centrosAcopio[2],
        value: centrosAcopio.filter((centro) => (centro._count?.establecimientos || 0) > 0).length,
        color: STATS_CONFIG.centrosAcopio[2].color as ColorScheme,
      },
      {
        ...STATS_CONFIG.centrosAcopio[3],
        value: centrosAcopio.filter((centro) => centro.estado === 'inactivo').length,
        color: STATS_CONFIG.centrosAcopio[3].color as ColorScheme,
      },
    ],
    [centrosAcopio, total],
  );

  const redesOptions = useMemo(
    () => [{ value: '', label: 'Todas las redes' }, ...redes.map((red) => ({ value: red.id, label: red.nombre }))],
    [redes],
  );

  const microredesOptions = useMemo(
    () => [
      { value: '', label: 'Todas las microredes' },
      ...microredesFiltradas.map((microred) => ({ value: microred.id, label: microred.nombre })),
    ],
    [microredesFiltradas],
  );

  const filtersConfig = useMemo(
    () => [
      {
        id: 'centro-red',
        label: 'Red',
        value: filterRedId,
        options: redesOptions,
        onChange: (value: string) => {
          setFilterRedId(value);
          if (!value) {
            setFilterMicroredId(selectedMicroredId || '');
            return;
          }

          if (selectedMicroredId) {
            const selectedMicrored = microredes.find((microred) => microred.id === selectedMicroredId);
            setFilterMicroredId(selectedMicrored?.redId === value ? selectedMicroredId : '');
            return;
          }

          setFilterMicroredId('');
        },
      },
      {
        id: 'centro-microred',
        label: 'Microred',
        value: filterMicroredId,
        options: microredesOptions,
        onChange: setFilterMicroredId,
        disabled: !filterRedId && microredesOptions.length <= 1,
      },
      {
        id: 'centro-estado',
        label: 'Estado',
        value: filterEstado,
        options: ESTADO_OPTIONS,
        onChange: setFilterEstado,
      },
    ],
    [filterEstado, filterMicroredId, filterRedId, microredes, microredesOptions, redesOptions, selectedMicroredId],
  );

  const handleOpenModal = useCallback((centro?: CentroAcopio) => {
    setEditingCentro(centro || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingCentro(null);
  }, []);

  const handleSubmit = useCallback(
    async (formData: CreateCentroAcopioDto | UpdateCentroAcopioDto) => {
      if (editingCentro) {
        const success = await updateCentroAcopio(editingCentro.id, formData as UpdateCentroAcopioDto);
        if (!success) {
          toast.error('No se pudo actualizar el centro de acopio', 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Centro actualizado', 'Los cambios se guardaron correctamente.');
      } else {
        const success = await createCentroAcopio(formData as CreateCentroAcopioDto);
        if (!success) {
          toast.error('No se pudo crear el centro de acopio', 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Centro de acopio creado', 'El nuevo centro se registró correctamente.');
      }

      handleCloseModal();
    },
    [createCentroAcopio, editingCentro, handleCloseModal, toast, updateCentroAcopio],
  );

  const handleDelete = useCallback((centro: CentroAcopio) => {
    setDeleteConfirmation({ isOpen: true, id: centro.id, nombre: centro.nombre });
  }, []);

  const confirmDelete = useCallback(async () => {
    const success = await deleteCentroAcopio(deleteConfirmation.id);

    if (!success) {
      toast.error('No se pudo eliminar el centro de acopio', 'Verifique que no tenga establecimientos asociados.');
      return;
    }

    toast.success('Centro de acopio eliminado', `"${deleteConfirmation.nombre}" fue eliminado.`);
    setDeleteConfirmation({ isOpen: false, id: '', nombre: '' });
  }, [deleteCentroAcopio, deleteConfirmation.id, deleteConfirmation.nombre, toast]);

  const handleClearFilters = useCallback(() => {
    const baseFilters: Record<string, string> = {};
    if (selectedRedId) baseFilters.redId = selectedRedId;
    if (selectedMicroredId) baseFilters.microredId = selectedMicroredId;

    setSearchTerm('');
    setFilterEstado('todos');
    setFilterRedId(selectedRedId || '');
    setFilterMicroredId(selectedMicroredId || '');
    setFilters(baseFilters);
  }, [selectedMicroredId, selectedRedId, setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters({ ...filters, page });
  }, [filters, setFilters]);

  const desktopTable = (
    <DataTable
      isLoading={loading}
      loadingMessage="Cargando centros de acopio..."
      skeletonRows={5}
      skeletonColumns={TABLE_COLUMNS.length}
      loadingVariant="table"
    >
      <table className="min-w-full divide-y divide-slate-200">
        <TableHeader columns={TABLE_COLUMNS} />
        <tbody className="divide-y divide-slate-100">
          {centrosAcopio.length === 0 ? (
            <tr>
              <td colSpan={TABLE_COLUMNS.length}>
                <EmptyState
                  icon={Building2}
                  title="No se encontraron centros de acopio"
                  description="Ajuste los filtros o registre un nuevo centro."
                  action={{ label: 'Nuevo centro', onClick: () => handleOpenModal() }}
                />
              </td>
            </tr>
          ) : (
            centrosAcopio.map((centro) => (
              <CentroDesktopRow
                key={centro.id}
                centro={centro}
                onEdit={() => handleOpenModal(centro)}
                onDelete={() => handleDelete(centro)}
                onNavigate={onNavigateToEstablecimientos}
                isLoading={loading}
              />
            ))
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={filters.limit || 10}
        onPageChange={handlePageChange}
      />
    </DataTable>
  );

  return (
    <div className="space-y-4">
      {error ? <ErrorAlert message={error} onRetry={() => void fetchCentrosAcopio()} /> : null}

      <section className={`${COMPONENT_STYLES.surface} p-4 sm:p-6`}>
        <div className="space-y-4">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre, código o responsable"
            filters={filtersConfig}
            onClear={handleClearFilters}
            actions={
              <>
                <button
                  type="button"
                  className={COMPONENT_STYLES.button.secondary}
                  onClick={() => void fetchCentrosAcopio()}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Actualizar</span>
                </button>
                <button
                  type="button"
                  className={COMPONENT_STYLES.button.primary}
                  onClick={() => handleOpenModal()}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo centro</span>
                </button>
              </>
            }
          />

          <div className="hidden lg:block">{desktopTable}</div>

          <div className="space-y-3 lg:hidden">
            {loading ? (
              <DataTable isLoading loadingMessage="Cargando centros de acopio..." skeletonRows={4} loadingVariant="cards" />
            ) : centrosAcopio.length === 0 ? (
              <div className={COMPONENT_STYLES.panel}>
                <EmptyState
                  icon={Building2}
                  title="No se encontraron centros de acopio"
                  description="Ajuste los filtros o registre un nuevo centro."
                  action={{ label: 'Nuevo centro', onClick: () => handleOpenModal() }}
                />
              </div>
            ) : (
              centrosAcopio.map((centro) => (
                <CentroMobileCard
                  key={centro.id}
                  centro={centro}
                  onEdit={() => handleOpenModal(centro)}
                  onDelete={() => handleDelete(centro)}
                  onNavigate={onNavigateToEstablecimientos}
                  isLoading={loading}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {showModal ? (
        <CentroModal
          centro={editingCentro}
          microredes={microredes}
          defaultMicroredId={selectedMicroredId}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, id: '', nombre: '' })}
        onConfirm={confirmDelete}
        itemName={deleteConfirmation.nombre}
        itemType="centro de acopio"
        isLoading={loading}
        warningMessage="Verifique que no tenga establecimientos asociados."
      />
    </div>
  );
};

interface CentroRowProps {
  centro: CentroAcopio;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate?: (id: string, nombre: string) => void;
  isLoading?: boolean;
}

const CentroDesktopRow: React.FC<CentroRowProps> = memo(({
  centro,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const establecimientosCount = centro._count?.establecimientos || 0;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Building className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{centro.nombre}</p>
            <p className="text-xs text-slate-500">{centro.codigo || 'Sin código registrado'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium text-slate-900">{centro.codigo || '-'}</span>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <GitBranch className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span>{centro.microred?.nombre || 'Sin microred asignada'}</span>
          </div>
          {centro.microred?.red ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Network className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
              <span>{centro.microred.red.nombre}</span>
            </div>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span>{centro.responsable || 'Sin responsable'}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span className="max-w-[220px] truncate">{centro.direccion || 'Sin dirección registrada'}</span>
        </div>
      </TableCell>
      <TableCell align="center">
        <CountBadge count={establecimientosCount} icon={Building2} />
      </TableCell>
      <TableCell align="center">
        <StatusBadge status={centro.estado} />
      </TableCell>
      <TableCell align="right">
        <div className="flex items-center justify-end gap-2">
          {onNavigate && establecimientosCount > 0 ? (
            <button
              type="button"
              onClick={() => onNavigate(centro.id, centro.nombre)}
              className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconNavigate}`}
              title="Ver establecimientos"
              aria-label={`Ver establecimientos de ${centro.nombre}`}
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            canDelete={establecimientosCount === 0}
            deleteTooltip="No se puede eliminar: tiene establecimientos asociados."
          />
        </div>
      </TableCell>
    </TableRow>
  );
});

CentroDesktopRow.displayName = 'CentroDesktopRow';

const CentroMobileCard: React.FC<CentroRowProps> = memo(({
  centro,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const establecimientosCount = centro._count?.establecimientos || 0;

  return (
    <article className={`${COMPONENT_STYLES.panel} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-950">{centro.nombre}</p>
          <p className="mt-1 text-sm text-slate-500">{centro.microred?.nombre || 'Sin microred asignada'}</p>
        </div>
        <StatusBadge status={centro.estado} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Establecimientos</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{establecimientosCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Responsable</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{centro.responsable || '-'}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600">{centro.direccion || 'Sin dirección registrada.'}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        {onNavigate && establecimientosCount > 0 ? (
          <button
            type="button"
            className={COMPONENT_STYLES.button.secondary}
            onClick={() => onNavigate(centro.id, centro.nombre)}
          >
            <Building2 className="h-4 w-4" />
            <span>Ver establecimientos</span>
          </button>
        ) : (
          <div />
        )}
        <ActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
          canDelete={establecimientosCount === 0}
          deleteTooltip="No se puede eliminar: tiene establecimientos asociados."
        />
      </div>
    </article>
  );
});

CentroMobileCard.displayName = 'CentroMobileCard';

interface CentroModalProps {
  centro: CentroAcopio | null;
  microredes: Microred[];
  defaultMicroredId?: string;
  onClose: () => void;
  onSubmit: (data: CreateCentroAcopioDto | UpdateCentroAcopioDto) => Promise<void>;
  isLoading?: boolean;
}

const CentroModal: React.FC<CentroModalProps> = ({
  centro,
  microredes,
  defaultMicroredId = '',
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: centro?.nombre || '',
    codigo: centro?.codigo || '',
    microredId: centro?.microredId || defaultMicroredId,
    direccion: centro?.direccion || '',
    responsable: centro?.responsable || '',
    telefono: centro?.telefono || '',
    estado: centro?.estado || 'activo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const microredesOptions = useMemo(
    () =>
      microredes.map((microred) => ({
        value: microred.id,
        label: microred.red ? `${microred.nombre} (${microred.red.nombre})` : microred.nombre,
      })),
    [microredes],
  );

  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      direccion: sanitizeInput(formData.direccion),
      responsable: sanitizeInput(formData.responsable),
      telefono: formData.telefono ? sanitizeInput(formData.telefono) : '',
      microredId: formData.microredId,
      ...(centro ? { estado: formData.estado as 'activo' | 'inactivo' } : {}),
    };

    const validation = validateCentroAcopio(sanitizedData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit(sanitizedData);
  }, [centro, formData, onSubmit]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={centro ? 'Editar centro de acopio' : 'Nuevo centro de acopio'}
      subtitle={
        centro
          ? 'Mantén actualizado el punto logístico sin perder la relación territorial.'
          : 'Registra un nuevo centro logístico dentro de la microred correspondiente.'
      }
      icon={Building2}
      size="xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={centro ? 'Guardar cambios' : 'Crear centro'}
          isLoading={isLoading}
        />
      }
    >
      <div className="space-y-4">
        <FormSection title="Identificación" description="Datos básicos para reconocer el centro en los listados.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="centro-nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={(value) => handleFieldChange('nombre', value)}
              placeholder="Ej: Centro de Acopio Chicmo"
              required
              error={errors.nombre}
            />
            <TextInput
              id="centro-codigo"
              label="Código"
              value={formData.codigo}
              onChange={(value) => handleFieldChange('codigo', value)}
              placeholder="Opcional"
              error={errors.codigo}
            />
          </div>
        </FormSection>

        <FormSection title="Asignación territorial" description="Define la microred que tendrá a cargo el centro de acopio.">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput
              id="centro-microred"
              label="Microred"
              value={formData.microredId}
              onChange={(value) => handleFieldChange('microredId', value)}
              options={microredesOptions}
              placeholder="Seleccionar microred..."
              error={errors.microredId}
              helpText="Incluye el nombre de la red entre paréntesis para evitar confusiones."
            />
            {centro ? (
              <SelectInput
                id="centro-estado"
                label="Estado"
                value={formData.estado}
                onChange={(value) => handleFieldChange('estado', value)}
                options={[
                  { value: 'activo', label: 'Activo' },
                  { value: 'inactivo', label: 'Inactivo' },
                ]}
              />
            ) : null}
          </div>
        </FormSection>

        <FormSection title="Contacto y ubicación" description="Información que permite operar el centro con claridad.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="centro-responsable"
              label="Responsable"
              value={formData.responsable}
              onChange={(value) => handleFieldChange('responsable', value)}
              placeholder="Nombre del responsable"
              required
              error={errors.responsable}
            />
            <TextInput
              id="centro-telefono"
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(value) => handleFieldChange('telefono', value)}
              placeholder="Opcional"
            />
          </div>

          <TextArea
            id="centro-direccion"
            label="Dirección"
            value={formData.direccion}
            onChange={(value) => handleFieldChange('direccion', value)}
            placeholder="Dirección completa del centro de acopio."
            required
            error={errors.direccion}
            rows={4}
          />
        </FormSection>
      </div>
    </Modal>
  );
};

export default memo(CentrosAcopio);
