import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Buildings, GitBranch, TreeStructure, Plus, ArrowsClockwise } from '@phosphor-icons/react';
import { CreateMicroredDto, Microred, Red, UpdateMicroredDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useMicroredes } from '../../hooks/useMicroredes';
import { useRedes } from '../../hooks/useRedes';
import { sanitizeInput, validateMicrored } from '../../utils/validation';
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

interface MicroredesProps {
  selectedRedId?: string;
  selectedRedNombre?: string;
  onNavigateToCentrosAcopio?: (microredId: string, microredNombre: string) => void;
}

const TABLE_COLUMNS = [
  { key: 'microred', label: 'Microred' },
  { key: 'codigo', label: 'Código' },
  { key: 'red', label: 'Red' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'centros', label: 'Centros de Acopio', align: 'center' as const },
  { key: 'estado', label: 'Estado', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

const Microredes: React.FC<MicroredesProps> = ({
  selectedRedId = '',
  onNavigateToCentrosAcopio,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterRedId, setFilterRedId] = useState(selectedRedId);
  const [showModal, setShowModal] = useState(false);
  const [editingMicrored, setEditingMicrored] = useState<Microred | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    nombre: string;
  }>({ isOpen: false, id: '', nombre: '' });
  const filterInitRef = useRef(false);

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
    deleteMicrored,
  } = useMicroredes();

  const { redes } = useRedes();
  const { toast } = useToastContext();

  useEffect(() => {
    setFilterRedId(selectedRedId || '');
  }, [selectedRedId]);

  useEffect(() => {
    const isFirstRun = !filterInitRef.current;
    filterInitRef.current = true;

    if (isFirstRun && !searchTerm && filterEstado === 'todos' && !filterRedId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextFilters: Record<string, string> = {};
      if (filterRedId) nextFilters.redId = filterRedId;
      if (filterEstado !== 'todos') nextFilters.estado = filterEstado;
      if (searchTerm.trim()) nextFilters.search = searchTerm.trim();
      setFilters(nextFilters);
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [filterEstado, filterRedId, searchTerm, setFilters]);

  const stats = useMemo(
    () => [
      { ...STATS_CONFIG.microredes[0], value: total, color: STATS_CONFIG.microredes[0].color as ColorScheme },
      {
        ...STATS_CONFIG.microredes[1],
        value: microredes.filter((microred) => microred.estado === 'activo').length,
        color: STATS_CONFIG.microredes[1].color as ColorScheme,
      },
      {
        ...STATS_CONFIG.microredes[2],
        value: microredes.filter((microred) => (microred._count?.centrosAcopio || 0) > 0).length,
        color: STATS_CONFIG.microredes[2].color as ColorScheme,
      },
      {
        ...STATS_CONFIG.microredes[3],
        value: microredes.filter((microred) => microred.estado === 'inactivo').length,
        color: STATS_CONFIG.microredes[3].color as ColorScheme,
      },
    ],
    [microredes, total],
  );

  const redesOptions = useMemo(
    () => [{ value: '', label: 'Todas las redes' }, ...redes.map((red) => ({ value: red.id, label: red.nombre }))],
    [redes],
  );

  const filtersConfig = useMemo(
    () => [
      {
        id: 'microred-red',
        label: 'Red',
        value: filterRedId,
        options: redesOptions,
        onChange: setFilterRedId,
      },
      {
        id: 'microred-estado',
        label: 'Estado',
        value: filterEstado,
        options: ESTADO_OPTIONS,
        onChange: setFilterEstado,
      },
    ],
    [filterEstado, filterRedId, redesOptions],
  );

  const handleOpenModal = useCallback((microred?: Microred) => {
    setEditingMicrored(microred || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingMicrored(null);
  }, []);

  const handleSubmit = useCallback(
    async (formData: CreateMicroredDto | UpdateMicroredDto) => {
      if (editingMicrored) {
        const success = await updateMicrored(editingMicrored.id, formData as UpdateMicroredDto);
        if (!success) {
          toast.error('No se pudo actualizar la microred', 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Microred actualizada', 'Los cambios se guardaron correctamente.');
      } else {
        const success = await createMicrored(formData as CreateMicroredDto);
        if (!success) {
          toast.error('No se pudo crear la microred', 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Microred creada', 'La microred se registró correctamente.');
      }

      handleCloseModal();
    },
    [createMicrored, editingMicrored, handleCloseModal, toast, updateMicrored],
  );

  const handleDelete = useCallback((microred: Microred) => {
    setDeleteConfirmation({ isOpen: true, id: microred.id, nombre: microred.nombre });
  }, []);

  const confirmDelete = useCallback(async () => {
    const success = await deleteMicrored(deleteConfirmation.id);

    if (!success) {
      toast.error('No se pudo eliminar la microred', 'Verifique que no tenga centros de acopio asociados.');
      return;
    }

    toast.success('Microred eliminada', `"${deleteConfirmation.nombre}" fue eliminada.`);
    setDeleteConfirmation({ isOpen: false, id: '', nombre: '' });
  }, [deleteConfirmation.id, deleteConfirmation.nombre, deleteMicrored, toast]);

  const handleClearFilters = useCallback(() => {
    const baseFilters = selectedRedId ? { redId: selectedRedId } : {};
    setSearchTerm('');
    setFilterEstado('todos');
    setFilterRedId(selectedRedId || '');
    setFilters(baseFilters);
  }, [selectedRedId, setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters({ ...filters, page });
  }, [filters, setFilters]);

  const desktopTable = (
    <DataTable
      isLoading={loading}
      loadingMessage="Cargando microredes..."
      skeletonRows={5}
      skeletonColumns={TABLE_COLUMNS.length}
      loadingVariant="table"
    >
      <table className="min-w-full divide-y divide-zinc-200">
        <TableHeader columns={TABLE_COLUMNS} />
        <tbody className="divide-y divide-zinc-100">
          {microredes.length === 0 ? (
            <tr>
              <td colSpan={TABLE_COLUMNS.length}>
                <EmptyState
                  icon={GitBranch}
                  title="No se encontraron microredes"
                  description="Ajuste los filtros o registre una nueva microred."
                  action={{ label: 'Nueva microred', onClick: () => handleOpenModal() }}
                />
              </td>
            </tr>
          ) : (
            microredes.map((microred) => (
              <MicroredDesktopRow
                key={microred.id}
                microred={microred}
                onEdit={() => handleOpenModal(microred)}
                onDelete={() => handleDelete(microred)}
                onNavigate={onNavigateToCentrosAcopio}
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
      {error ? <ErrorAlert message={error} onRetry={() => void fetchMicroredes()} /> : null}

      <section className={`${COMPONENT_STYLES.surface} p-4 sm:p-6`}>
        <div className="space-y-4">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre, código o descripción"
            filters={filtersConfig}
            onClear={handleClearFilters}
            actions={
              <>
                <button type="button" className={COMPONENT_STYLES.button.secondary} onClick={() => void fetchMicroredes()} disabled={loading}>
                  <ArrowsClockwise className="h-4 w-4" />
                  <span>Actualizar</span>
                </button>
                <button type="button" className={COMPONENT_STYLES.button.primary} onClick={() => handleOpenModal()} disabled={loading}>
                  <Plus className="h-4 w-4" />
                  <span>Nueva microred</span>
                </button>
              </>
            }
          />

          <div className="hidden lg:block">{desktopTable}</div>

          <div className="space-y-3 lg:hidden">
            {loading ? (
              <DataTable isLoading loadingMessage="Cargando microredes..." skeletonRows={4} loadingVariant="cards" />
            ) : microredes.length === 0 ? (
              <div className={COMPONENT_STYLES.panel}>
                <EmptyState
                  icon={GitBranch}
                  title="No se encontraron microredes"
                  description="Ajuste los filtros o registre una nueva microred."
                  action={{ label: 'Nueva microred', onClick: () => handleOpenModal() }}
                />
              </div>
            ) : (
              microredes.map((microred) => (
                <MicroredMobileCard
                  key={microred.id}
                  microred={microred}
                  onEdit={() => handleOpenModal(microred)}
                  onDelete={() => handleDelete(microred)}
                  onNavigate={onNavigateToCentrosAcopio}
                  isLoading={loading}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {showModal ? (
        <MicroredModal
          microred={editingMicrored}
          redes={redes}
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
        itemType="microred"
        isLoading={loading}
        warningMessage="Verifique que no tenga centros de acopio asociados."
      />
    </div>
  );
};

interface MicroredRowProps {
  microred: Microred;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate?: (id: string, nombre: string) => void;
  isLoading?: boolean;
}

const MicroredDesktopRow: React.FC<MicroredRowProps> = memo(({
  microred,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const centrosCount = microred._count?.centrosAcopio || 0;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
            <GitBranch className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{microred.nombre}</p>
            <p className="text-xs text-zinc-500">{microred.codigo || 'Sin código registrado'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium text-zinc-900">{microred.codigo || '-'}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-zinc-700">
          <TreeStructure className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <span>{microred.red?.nombre || 'Sin red asociada'}</span>
        </div>
      </TableCell>
      <TableCell>
        <p className="max-w-sm text-sm text-zinc-600">{microred.descripcion || 'Sin descripción registrada.'}</p>
      </TableCell>
      <TableCell align="center">
        <CountBadge count={centrosCount} icon={Buildings} />
      </TableCell>
      <TableCell align="center">
        <StatusBadge status={microred.estado} />
      </TableCell>
      <TableCell align="right">
        <div className="flex items-center justify-end gap-2">
          {onNavigate && centrosCount > 0 ? (
            <button
              type="button"
              onClick={() => onNavigate(microred.id, microred.nombre)}
              className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconNavigate}`}
              title="Ver centros de acopio"
              aria-label={`Ver centros de acopio de ${microred.nombre}`}
            >
              <Buildings className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            canDelete={centrosCount === 0}
            deleteTooltip="No se puede eliminar: tiene centros de acopio asociados."
          />
        </div>
      </TableCell>
    </TableRow>
  );
});

MicroredDesktopRow.displayName = 'MicroredDesktopRow';

const MicroredMobileCard: React.FC<MicroredRowProps> = memo(({
  microred,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const centrosCount = microred._count?.centrosAcopio || 0;

  return (
    <article className={`${COMPONENT_STYLES.panel} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-zinc-950">{microred.nombre}</p>
          <p className="mt-1 text-sm text-zinc-500">{microred.red?.nombre || 'Sin red asociada'}</p>
        </div>
        <StatusBadge status={microred.estado} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Centros</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">{centrosCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Código</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">{microred.codigo || '-'}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-zinc-600">{microred.descripcion || 'Sin descripción registrada.'}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        {onNavigate && centrosCount > 0 ? (
          <button
            type="button"
            className={COMPONENT_STYLES.button.secondary}
            onClick={() => onNavigate(microred.id, microred.nombre)}
          >
            <Buildings className="h-4 w-4" />
            <span>Ver centros</span>
          </button>
        ) : (
          <div />
        )}
        <ActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
          canDelete={centrosCount === 0}
          deleteTooltip="No se puede eliminar: tiene centros de acopio asociados."
        />
      </div>
    </article>
  );
});

MicroredMobileCard.displayName = 'MicroredMobileCard';

interface MicroredModalProps {
  microred: Microred | null;
  redes: Red[];
  onClose: () => void;
  onSubmit: (data: CreateMicroredDto | UpdateMicroredDto) => Promise<void>;
  isLoading?: boolean;
}

const MicroredModal: React.FC<MicroredModalProps> = ({
  microred,
  redes,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: microred?.nombre || '',
    codigo: microred?.codigo || '',
    descripcion: microred?.descripcion || '',
    redId: microred?.redId || '',
    estado: microred?.estado || 'activo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const redesOptions = useMemo(
    () => redes.map((red) => ({ value: red.id, label: red.nombre })),
    [redes],
  );

  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      descripcion: formData.descripcion ? sanitizeInput(formData.descripcion) : '',
      redId: formData.redId,
      ...(microred ? { estado: formData.estado as 'activo' | 'inactivo' } : {}),
    };

    const validation = validateMicrored(sanitizedData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit(sanitizedData);
  }, [formData, microred, onSubmit]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={microred ? 'Editar microred' : 'Nueva microred'}
      subtitle={
        microred
          ? 'Ajusta la dependencia territorial sin perder la relación con la red.'
          : 'Registra una microred y define la red a la que pertenece.'
      }
      icon={GitBranch}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={microred ? 'Guardar cambios' : 'Crear microred'}
          isLoading={isLoading}
        />
      }
    >
      <div className="space-y-4">
        <FormSection title="Identificación" description="Datos visibles para búsqueda rápida y referencia operativa.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="microred-nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={(value) => handleFieldChange('nombre', value)}
              placeholder="Ej: Chicmo"
              required
              error={errors.nombre}
            />
            <TextInput
              id="microred-codigo"
              label="Código"
              value={formData.codigo}
              onChange={(value) => handleFieldChange('codigo', value)}
              placeholder="Opcional"
              error={errors.codigo}
            />
          </div>

          <TextArea
            id="microred-descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={(value) => handleFieldChange('descripcion', value)}
            placeholder="Describe el ámbito territorial de la microred."
            error={errors.descripcion}
            rows={4}
          />
        </FormSection>

        <FormSection title="Dependencia territorial" description="Relaciona la microred con su red de salud principal.">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput
              id="microred-red"
              label="Red"
              value={formData.redId}
              onChange={(value) => handleFieldChange('redId', value)}
              options={redesOptions}
              placeholder="Seleccionar red..."
              required
              error={errors.redId}
            />
            {microred ? (
              <SelectInput
                id="microred-estado"
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
      </div>
    </Modal>
  );
};

export default memo(Microredes);
 