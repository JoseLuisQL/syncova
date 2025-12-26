import React, { useState, useCallback, useMemo, memo } from 'react';
import { Network, GitBranch, Plus } from 'lucide-react';
import { Red, CreateRedDto, UpdateRedDto } from '../../types';
import { useRedes } from '../../hooks/useRedes';
import { useToastContext } from '../../contexts/ToastContext';
import { validateRed, sanitizeInput } from '../../utils/validation';
import {
  PageHeader,
  StatsGrid,
  StatusBadge,
  CountBadge,
  EmptyState,
  ErrorAlert,
  ActionButtons,
} from '../Establecimientos/components/SharedComponents';
import { FilterBar, Pagination, DataTable, TableHeader } from '../Establecimientos/components/FilterAndTable';
import { Modal, ModalFooter, TextInput, TextArea, SelectInput, DeleteConfirmModal } from '../Establecimientos/components/ModalComponents';
import { COMPONENT_STYLES, ColorScheme } from '../Establecimientos/constants';

interface RedesProps {
  onNavigateToMicroredes?: (redId: string, redNombre: string) => void;
}

const TABLE_COLUMNS = [
  { key: 'red', label: 'Red' },
  { key: 'codigo', label: 'Codigo' },
  { key: 'descripcion', label: 'Descripcion' },
  { key: 'microredes', label: 'Microredes' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
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

  const {
    redes,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    createRed,
    updateRed,
    deleteRed,
  } = useRedes();

  const { toast } = useToastContext();

  // Debounced filter application
  React.useEffect(() => {
    if (!redes.length && !searchTerm && filterEstado === 'todos') return;

    const timeoutId = setTimeout(() => {
      const newFilters: Record<string, string> = {};
      if (filterEstado !== 'todos') newFilters.estado = filterEstado;
      if (searchTerm.trim()) newFilters.search = searchTerm.trim();
      setFilters(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterEstado, searchTerm]);

  const stats = useMemo(() => [
    { key: 'total', label: 'Total Redes', value: total, icon: Network, color: 'primary' as ColorScheme },
    { key: 'activas', label: 'Activas', value: redes.filter(r => r.estado === 'activo').length, icon: Network, color: 'success' as ColorScheme },
    { key: 'conMicroredes', label: 'Con Microredes', value: redes.filter(r => (r._count?.microredes || 0) > 0).length, icon: GitBranch, color: 'warning' as ColorScheme },
    { key: 'inactivas', label: 'Inactivas', value: redes.filter(r => r.estado === 'inactivo').length, icon: Network, color: 'danger' as ColorScheme },
  ], [redes, total]);

  const handleOpenModal = useCallback((red?: Red) => {
    setEditingRed(red || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingRed(null);
  }, []);

  const handleDelete = useCallback((id: string, nombre: string) => {
    setDeleteConfirmation({ isOpen: true, redId: id, redNombre: nombre });
  }, []);

  const confirmDelete = useCallback(async () => {
    const success = await deleteRed(deleteConfirmation.redId);
    if (success) {
      toast.success('Red eliminada', `"${deleteConfirmation.redNombre}" ha sido eliminada.`);
    } else {
      toast.error('Error al eliminar', 'Verifique que no tenga microredes asociadas.');
    }
    setDeleteConfirmation({ isOpen: false, redId: '', redNombre: '' });
  }, [deleteConfirmation, deleteRed, toast]);

  const handleSubmit = useCallback(async (formData: CreateRedDto | UpdateRedDto) => {
    if (editingRed) {
      const success = await updateRed(editingRed.id, formData as UpdateRedDto);
      if (success) {
        toast.success('Red actualizada', 'Los cambios se guardaron correctamente.');
        handleCloseModal();
      } else {
        toast.error('Error al actualizar', 'No se pudieron guardar los cambios.');
      }
    } else {
      const success = await createRed(formData as CreateRedDto);
      if (success) {
        toast.success('Red creada', 'La nueva red se registro correctamente.');
        handleCloseModal();
      } else {
        toast.error('Error al crear', 'No se pudo crear la red.');
      }
    }
  }, [editingRed, updateRed, createRed, toast, handleCloseModal]);

  const changePage = useCallback((page: number) => {
    setFilters({ ...filters, page });
  }, [filters, setFilters]);

  const filterConfigs = useMemo(() => [
    { id: 'estado', label: 'Estado', value: filterEstado, options: ESTADO_OPTIONS, onChange: setFilterEstado },
  ], [filterEstado]);

  return (
    <div className="p-5 sm:p-6">
      {error && <ErrorAlert message={error} />}

      <PageHeader
        title="Redes de Salud"
        subtitle="Gestion de redes organizacionales"
        icon={Network}
        count={total}
        action={{
          label: 'Nueva Red',
          onClick: () => handleOpenModal(),
          icon: Plus,
          isLoading: loading,
        }}
      />

      <StatsGrid stats={stats} />

      <div className="space-y-5">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre, codigo o descripcion..."
          filters={filterConfigs}
        />

        <DataTable isLoading={loading} loadingMessage="Cargando redes...">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader columns={TABLE_COLUMNS} />
            <tbody className="divide-y divide-gray-100">
              {redes.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Network}
                      title="No se encontraron redes"
                      description="Intente ajustar los filtros o cree una nueva"
                    />
                  </td>
                </tr>
              ) : (
                redes.map((red) => (
                  <RedRow
                    key={red.id}
                    red={red}
                    onEdit={() => handleOpenModal(red)}
                    onDelete={() => handleDelete(red.id, red.nombre)}
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
            onPageChange={changePage}
          />
        </DataTable>
      </div>

      {showModal && (
        <RedModal
          red={editingRed}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      )}

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

// ============================================================================
// TABLE ROW COMPONENT
// ============================================================================

interface RedRowProps {
  red: Red;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate?: (redId: string, redNombre: string) => void;
  isLoading?: boolean;
}

const RedRow: React.FC<RedRowProps> = memo(({
  red,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const microredesCount = red._count?.microredes || 0;
  const canDelete = microredesCount === 0;

  return (
    <tr className={COMPONENT_STYLES.table.row}>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 flex items-center justify-center flex-shrink-0">
            <Network className="h-5 w-5 text-teal-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{red.nombre}</p>
            <p className="text-xs text-gray-500 font-medium">{red.codigo || 'Sin codigo'}</p>
          </div>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <span className="text-sm text-gray-900">{red.codigo || '-'}</span>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {red.descripcion || 'Sin descripcion'}
        </p>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <CountBadge count={microredesCount} icon={GitBranch} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <StatusBadge status={red.estado as 'activo' | 'inactivo'} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center justify-end gap-1">
          {onNavigate && microredesCount > 0 && (
            <button
              onClick={() => onNavigate(red.id, red.nombre)}
              className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`}
              title="Ver microredes"
            >
              <GitBranch className="h-4 w-4" />
            </button>
          )}
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            canDelete={canDelete}
            deleteTooltip="No se puede eliminar: tiene microredes asociadas"
          />
        </div>
      </td>
    </tr>
  );
});

RedRow.displayName = 'RedRow';

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface RedModalProps {
  red: Red | null;
  onClose: () => void;
  onSubmit: (data: CreateRedDto | UpdateRedDto) => Promise<void>;
  isLoading?: boolean;
}

const RedModal: React.FC<RedModalProps> = ({
  red,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: red?.nombre || '',
    codigo: red?.codigo || '',
    descripcion: red?.descripcion || '',
    ...(red && { estado: red.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      descripcion: formData.descripcion ? sanitizeInput(formData.descripcion) : '',
      ...(red && { estado: formData.estado }),
    };

    const validation = validateRed(sanitizedData);
    setErrors(validation.errors);

    if (validation.isValid) {
      setFormData(prev => ({
        ...prev,
        nombre: sanitizedData.nombre,
        codigo: sanitizedData.codigo,
        descripcion: sanitizedData.descripcion,
      }));
    }

    return validation.isValid;
  }, [formData, red]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    if (!red) delete (submitData as any).estado;
    await onSubmit(submitData);
  }, [formData, red, validateForm, onSubmit]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={red ? 'Editar Red' : 'Nueva Red'}
      subtitle={red ? 'Actualizar informacion' : 'Registrar nueva red de salud'}
      icon={Network}
      footer={
        <ModalFooter
          onCancel={onClose}
          submitLabel={red ? 'Actualizar' : 'Crear'}
          isLoading={isLoading}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            id="nombre"
            label="Nombre"
            value={formData.nombre}
            onChange={(v) => handleFieldChange('nombre', v)}
            required
            error={errors.nombre}
          />
          <TextInput
            id="codigo"
            label="Codigo"
            value={formData.codigo}
            onChange={(v) => handleFieldChange('codigo', v)}
            placeholder="Opcional"
            error={errors.codigo}
          />
          {red && (
            <SelectInput
              id="estado"
              label="Estado"
              value={formData.estado || 'activo'}
              onChange={(v) => handleFieldChange('estado', v)}
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
              ]}
            />
          )}
        </div>

        <TextArea
          id="descripcion"
          label="Descripcion"
          value={formData.descripcion}
          onChange={(v) => handleFieldChange('descripcion', v)}
          placeholder="Descripcion opcional de la red"
          error={errors.descripcion}
        />

        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};

export default Redes;
