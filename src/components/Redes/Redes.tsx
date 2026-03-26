import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GitBranch, TreeStructure, Plus, ArrowsClockwise } from '@phosphor-icons/react';
import { CreateRedDto, Red, UpdateRedDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useRedes } from '../../hooks/useRedes';
import { sanitizeInput, validateRed } from '../../utils/validation';
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

interface RedesProps {
  onNavigateToMicroredes?: (redId: string, redNombre: string) => void;
}

const TABLE_COLUMNS = [
  { key: 'red', label: 'Red' },
  { key: 'codigo', label: 'Código' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'microredes', label: 'Microredes', align: 'center' as const },
  { key: 'estado', label: 'Estado', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

const Redes: React.FC<RedesProps> = ({ onNavigateToMicroredes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingRed, setEditingRed] = useState<Red | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    redId: string;
    redNombre: string;
  }>({ isOpen: false, redId: '', redNombre: '' });
  const filterInitRef = useRef(false);

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
    deleteRed,
  } = useRedes();

  const { toast } = useToastContext();

  useEffect(() => {
    if (!filterInitRef.current) {
      filterInitRef.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextFilters: Record<string, string> = {};
      if (filterEstado !== 'todos') nextFilters.estado = filterEstado;
      if (searchTerm.trim()) nextFilters.search = searchTerm.trim();
      setFilters(nextFilters);
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [filterEstado, searchTerm, setFilters]);

  const stats = useMemo(
    () => [
      { ...STATS_CONFIG.redes[0], value: total, color: STATS_CONFIG.redes[0].color as ColorScheme },
      {
        ...STATS_CONFIG.redes[1],
        value: redes.filter((red) => red.estado === 'activo').length,
        color: STATS_CONFIG.redes[1].color as ColorScheme,
      },
      {
        ...STATS_CONFIG.redes[2],
        value: redes.filter((red) => (red._count?.microredes || 0) > 0).length,
        color: STATS_CONFIG.redes[2].color as ColorScheme,
      },
      {
        ...STATS_CONFIG.redes[3],
        value: redes.filter((red) => red.estado === 'inactivo').length,
        color: STATS_CONFIG.redes[3].color as ColorScheme,
      },
    ],
    [redes, total],
  );

  const filtersConfig = useMemo(
    () => [
      {
        id: 'estado-red',
        label: 'Estado',
        value: filterEstado,
        options: ESTADO_OPTIONS,
        onChange: setFilterEstado,
      },
    ],
    [filterEstado],
  );

  const handleOpenModal = useCallback((red?: Red) => {
    setEditingRed(red || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingRed(null);
  }, []);

  const handleSubmit = useCallback(
    async (formData: CreateRedDto | UpdateRedDto) => {
      if (editingRed) {
        const result = await updateRed(editingRed.id, formData as UpdateRedDto);
        if (!result) {
          toast.error('No se pudo actualizar la red', 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Red actualizada', 'Los cambios se guardaron correctamente.');
      } else {
        const result = await createRed(formData as CreateRedDto);
        if (!result) {
          toast.error('No se pudo crear la red', 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Red creada', 'La red se registró correctamente.');
      }

      handleCloseModal();
    },
    [createRed, editingRed, handleCloseModal, toast, updateRed],
  );

  const handleDelete = useCallback((red: Red) => {
    setDeleteConfirmation({ isOpen: true, redId: red.id, redNombre: red.nombre });
  }, []);

  const confirmDelete = useCallback(async () => {
    const success = await deleteRed(deleteConfirmation.redId);

    if (!success) {
      toast.error('No se pudo eliminar la red', 'Verifique que no tenga microredes asociadas.');
      return;
    }

    toast.success('Red eliminada', `"${deleteConfirmation.redNombre}" fue eliminada.`);
    setDeleteConfirmation({ isOpen: false, redId: '', redNombre: '' });
  }, [deleteConfirmation.redId, deleteConfirmation.redNombre, deleteRed, toast]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterEstado('todos');
    setFilters({});
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters({ ...filters, page });
  }, [filters, setFilters]);

  const desktopTable = (
    <DataTable
      isLoading={loading}
      loadingMessage="Cargando redes..."
      skeletonRows={5}
      skeletonColumns={TABLE_COLUMNS.length}
      loadingVariant="table"
    >
      <table className="min-w-full divide-y divide-zinc-200">
        <TableHeader columns={TABLE_COLUMNS} />
        <tbody className="divide-y divide-zinc-100">
          {redes.length === 0 ? (
            <tr>
              <td colSpan={TABLE_COLUMNS.length}>
                <EmptyState
                  icon={TreeStructure}
                  title="No se encontraron redes"
                  description="Ajuste los filtros o registre una nueva red."
                  action={{ label: 'Nueva red', onClick: () => handleOpenModal() }}
                />
              </td>
            </tr>
          ) : (
            redes.map((red) => (
              <RedDesktopRow
                key={red.id}
                red={red}
                onEdit={() => handleOpenModal(red)}
                onDelete={() => handleDelete(red)}
                onNavigate={onNavigateToMicroredes}
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
      {error ? <ErrorAlert message={error} onRetry={() => void fetchRedes()} /> : null}

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
                <button type="button" className={COMPONENT_STYLES.button.secondary} onClick={() => void fetchRedes()} disabled={loading}>
                  <ArrowsClockwise className="h-4 w-4" />
                  <span>Actualizar</span>
                </button>
                <button type="button" className={COMPONENT_STYLES.button.primary} onClick={() => handleOpenModal()} disabled={loading}>
                  <Plus className="h-4 w-4" />
                  <span>Nueva red</span>
                </button>
              </>
            }
          />

          <div className="hidden lg:block">{desktopTable}</div>

          <div className="space-y-3 lg:hidden">
            {loading ? (
              <DataTable isLoading loadingMessage="Cargando redes..." skeletonRows={4} loadingVariant="cards" />
            ) : redes.length === 0 ? (
              <div className={COMPONENT_STYLES.panel}>
                <EmptyState
                  icon={TreeStructure}
                  title="No se encontraron redes"
                  description="Ajuste los filtros o registre una nueva red."
                  action={{ label: 'Nueva red', onClick: () => handleOpenModal() }}
                />
              </div>
            ) : (
              redes.map((red) => (
                <RedMobileCard
                  key={red.id}
                  red={red}
                  onEdit={() => handleOpenModal(red)}
                  onDelete={() => handleDelete(red)}
                  onNavigate={onNavigateToMicroredes}
                  isLoading={loading}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {showModal ? (
        <RedModal
          red={editingRed}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, redId: '', redNombre: '' })}
        onConfirm={confirmDelete}
        itemName={deleteConfirmation.redNombre}
        itemType="red"
        isLoading={loading}
        warningMessage="Verifique que no tenga microredes asociadas."
      />
    </div>
  );
};

interface RedRowProps {
  red: Red;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate?: (redId: string, redNombre: string) => void;
  isLoading?: boolean;
}

const RedDesktopRow: React.FC<RedRowProps> = memo(({
  red,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const microredesCount = red._count?.microredes || 0;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
            <TreeStructure className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{red.nombre}</p>
            <p className="text-xs text-zinc-500">{red.codigo || 'Sin código registrado'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium text-zinc-900">{red.codigo || '-'}</span>
      </TableCell>
      <TableCell>
        <p className="max-w-sm text-sm text-zinc-600">{red.descripcion || 'Sin descripción registrada.'}</p>
      </TableCell>
      <TableCell align="center">
        <CountBadge count={microredesCount} icon={GitBranch} />
      </TableCell>
      <TableCell align="center">
        <StatusBadge status={red.estado} />
      </TableCell>
      <TableCell align="right">
        <div className="flex items-center justify-end gap-2">
          {onNavigate && microredesCount > 0 ? (
            <button
              type="button"
              onClick={() => onNavigate(red.id, red.nombre)}
              className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconNavigate}`}
              title="Ver microredes"
              aria-label={`Ver microredes de ${red.nombre}`}
            >
              <GitBranch className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            canDelete={microredesCount === 0}
            deleteTooltip="No se puede eliminar: tiene microredes asociadas."
          />
        </div>
      </TableCell>
    </TableRow>
  );
});

RedDesktopRow.displayName = 'RedDesktopRow';

const RedMobileCard: React.FC<RedRowProps> = memo(({
  red,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const microredesCount = red._count?.microredes || 0;

  return (
    <article className={`${COMPONENT_STYLES.panel} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-zinc-950">{red.nombre}</p>
          <p className="mt-1 text-sm text-zinc-500">{red.codigo || 'Sin código'}</p>
        </div>
        <StatusBadge status={red.estado} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Microredes</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">{microredesCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Código</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">{red.codigo || '-'}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-zinc-600">{red.descripcion || 'Sin descripción registrada.'}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        {onNavigate && microredesCount > 0 ? (
          <button
            type="button"
            className={COMPONENT_STYLES.button.secondary}
            onClick={() => onNavigate(red.id, red.nombre)}
          >
            <GitBranch className="h-4 w-4" />
            <span>Ver microredes</span>
          </button>
        ) : (
          <div />
        )}
        <ActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
          canDelete={microredesCount === 0}
          deleteTooltip="No se puede eliminar: tiene microredes asociadas."
        />
      </div>
    </article>
  );
});

RedMobileCard.displayName = 'RedMobileCard';

interface RedModalProps {
  red: Red | null;
  onClose: () => void;
  onSubmit: (data: CreateRedDto | UpdateRedDto) => Promise<void>;
  isLoading?: boolean;
}

const RedModal: React.FC<RedModalProps> = ({ red, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nombre: red?.nombre || '',
    codigo: red?.codigo || '',
    descripcion: red?.descripcion || '',
    estado: red?.estado || 'activo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      descripcion: formData.descripcion ? sanitizeInput(formData.descripcion) : '',
      ...(red ? { estado: formData.estado as 'activo' | 'inactivo' } : {}),
    };

    const validation = validateRed(sanitizedData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await onSubmit(sanitizedData);
  }, [formData, onSubmit, red]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={red ? 'Editar red' : 'Nueva red'}
      subtitle={red ? 'Ajusta la información base de la red sin perder contexto.' : 'Registra una nueva red dentro de la estructura territorial.'}
      icon={TreeStructure}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={red ? 'Guardar cambios' : 'Crear red'}
          isLoading={isLoading}
        />
      }
    >
      <div className="space-y-4">
        <FormSection title="Identificación" description="Datos visibles para reconocer rápidamente la red en listados y filtros.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="red-nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={(value) => handleFieldChange('nombre', value)}
              placeholder="Ej: José María Arguedas"
              required
              error={errors.nombre}
            />
            <TextInput
              id="red-codigo"
              label="Código"
              value={formData.codigo}
              onChange={(value) => handleFieldChange('codigo', value)}
              placeholder="Opcional"
              error={errors.codigo}
              helpText="Se usa para referencias breves dentro del sistema."
            />
            {red ? (
              <SelectInput
                id="red-estado"
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

          <TextArea
            id="red-descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={(value) => handleFieldChange('descripcion', value)}
            placeholder="Describe el ámbito o la finalidad de la red."
            error={errors.descripcion}
            rows={4}
          />
        </FormSection>
      </div>
    </Modal>
  );
};

export default memo(Redes);
 