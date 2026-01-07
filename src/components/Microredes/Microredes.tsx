import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { GitBranch, Network, Building, Plus } from 'lucide-react';
import { Microred, CreateMicroredDto, UpdateMicroredDto } from '../../types';
import { useMicroredes } from '../../hooks/useMicroredes';
import { useRedes } from '../../hooks/useRedes';
import { useToastContext } from '../../contexts/ToastContext';
import { validateMicrored, sanitizeInput } from '../../utils/validation';
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

interface MicroredesProps {
  selectedRedId?: string;
  selectedRedNombre?: string;
  onNavigateToCentrosAcopio?: (microredId: string, microredNombre: string) => void;
}

const TABLE_COLUMNS = [
  { key: 'microred', label: 'Microred' },
  { key: 'codigo', label: 'Codigo' },
  { key: 'red', label: 'Red' },
  { key: 'descripcion', label: 'Descripcion' },
  { key: 'centros', label: 'Centros de Acopio' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
];

const Microredes: React.FC<MicroredesProps> = ({
  selectedRedId,
  selectedRedNombre,
  onNavigateToCentrosAcopio,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterRedId, setFilterRedId] = useState(selectedRedId || '');
  const [showModal, setShowModal] = useState(false);
  const [editingMicrored, setEditingMicrored] = useState<Microred | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    nombre: string;
  }>({ isOpen: false, id: '', nombre: '' });

  const {
    microredes,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    createMicrored,
    updateMicrored,
    deleteMicrored,
  } = useMicroredes();

  const { redes } = useRedes();
  const { toast } = useToastContext();

  useEffect(() => {
    if (selectedRedId && selectedRedId !== filterRedId) {
      setFilterRedId(selectedRedId);
    }
  }, [selectedRedId]);

  // Debounced filter application
  React.useEffect(() => {
    if (!microredes.length && !searchTerm && filterEstado === 'todos' && !filterRedId) return;

    const timeoutId = setTimeout(() => {
      const newFilters: Record<string, string> = {};
      if (filterEstado !== 'todos') newFilters.estado = filterEstado;
      if (filterRedId) newFilters.redId = filterRedId;
      if (searchTerm.trim()) newFilters.search = searchTerm.trim();
      setFilters(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterEstado, filterRedId, searchTerm]);

  const stats = useMemo(() => [
    { key: 'total', label: 'Total Microredes', value: total, icon: GitBranch, color: 'primary' as ColorScheme },
    { key: 'activas', label: 'Activas', value: microredes.filter(m => m.estado === 'activo').length, icon: GitBranch, color: 'success' as ColorScheme },
    { key: 'conCentros', label: 'Con Centros', value: microredes.filter(m => (m._count?.centrosAcopio || 0) > 0).length, icon: Building, color: 'warning' as ColorScheme },
    { key: 'inactivas', label: 'Inactivas', value: microredes.filter(m => m.estado === 'inactivo').length, icon: GitBranch, color: 'danger' as ColorScheme },
  ], [microredes, total]);

  const handleOpenModal = useCallback((microred?: Microred) => {
    setEditingMicrored(microred || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingMicrored(null);
  }, []);

  const handleDelete = useCallback((id: string, nombre: string) => {
    setDeleteConfirmation({ isOpen: true, id, nombre });
  }, []);

  const confirmDelete = useCallback(async () => {
    const success = await deleteMicrored(deleteConfirmation.id);
    if (success) {
      toast.success('Microred eliminada', `"${deleteConfirmation.nombre}" ha sido eliminada.`);
    } else {
      toast.error('Error al eliminar', 'Verifique que no tenga centros de acopio asociados.');
    }
    setDeleteConfirmation({ isOpen: false, id: '', nombre: '' });
  }, [deleteConfirmation, deleteMicrored, toast]);

  const handleSubmit = useCallback(async (formData: CreateMicroredDto | UpdateMicroredDto) => {
    if (editingMicrored) {
      const success = await updateMicrored(editingMicrored.id, formData as UpdateMicroredDto);
      if (success) {
        toast.success('Microred actualizada', 'Los cambios se guardaron correctamente.');
        handleCloseModal();
      } else {
        toast.error('Error al actualizar', 'No se pudieron guardar los cambios.');
      }
    } else {
      const success = await createMicrored(formData as CreateMicroredDto);
      if (success) {
        toast.success('Microred creada', 'La nueva microred se registro correctamente.');
        handleCloseModal();
      } else {
        toast.error('Error al crear', 'No se pudo crear la microred.');
      }
    }
  }, [editingMicrored, updateMicrored, createMicrored, toast, handleCloseModal]);

  const changePage = useCallback((page: number) => {
    setFilters({ ...filters, page });
  }, [filters, setFilters]);

  const redesOptions = useMemo(() => [
    { value: '', label: 'Todas' },
    ...redes.map(r => ({ value: r.id, label: r.nombre })),
  ], [redes]);

  const filterConfigs = useMemo(() => [
    { id: 'red', label: 'Red', value: filterRedId, options: redesOptions, onChange: setFilterRedId },
    { id: 'estado', label: 'Estado', value: filterEstado, options: ESTADO_OPTIONS, onChange: setFilterEstado },
  ], [filterRedId, filterEstado, redesOptions]);

  return (
    <div className="p-5 sm:p-6">
      {error && <ErrorAlert message={error} />}

      <PageHeader
        title={selectedRedNombre ? `Microredes - Red: ${selectedRedNombre}` : 'Microredes'}
        subtitle="Gestion de agrupaciones territoriales"
        icon={GitBranch}
        count={total}
        action={{
          label: 'Nueva Microred',
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

        <DataTable isLoading={loading} loadingMessage="Cargando microredes...">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader columns={TABLE_COLUMNS} />
            <tbody className="divide-y divide-gray-100">
              {microredes.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={GitBranch}
                      title="No se encontraron microredes"
                      description="Intente ajustar los filtros o cree una nueva"
                    />
                  </td>
                </tr>
              ) : (
                microredes.map((microred) => (
                  <MicroredRow
                    key={microred.id}
                    microred={microred}
                    onEdit={() => handleOpenModal(microred)}
                    onDelete={() => handleDelete(microred.id, microred.nombre)}
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
            onPageChange={changePage}
          />
        </DataTable>
      </div>

      {showModal && (
        <MicroredModal
          microred={editingMicrored}
          redes={redes}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      )}

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

// ============================================================================
// TABLE ROW COMPONENT
// ============================================================================

interface MicroredRowProps {
  microred: Microred;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate?: (id: string, nombre: string) => void;
  isLoading?: boolean;
}

const MicroredRow: React.FC<MicroredRowProps> = memo(({
  microred,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const centrosCount = microred._count?.centrosAcopio || 0;
  const canDelete = centrosCount === 0;

  return (
    <tr className={COMPONENT_STYLES.table.row}>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 flex items-center justify-center flex-shrink-0">
            <GitBranch className="h-5 w-5 text-cyan-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{microred.nombre}</p>
          </div>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <span className="text-sm text-gray-900">{microred.codigo || '-'}</span>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-900">{microred.red?.nombre || 'Sin red'}</span>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {microred.descripcion || '-'}
        </p>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <CountBadge count={centrosCount} icon={Building} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <StatusBadge status={microred.estado as 'activo' | 'inactivo'} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center justify-end gap-1">
          {onNavigate && centrosCount > 0 && (
            <button
              onClick={() => onNavigate(microred.id, microred.nombre)}
              className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`}
              title="Ver centros de acopio"
            >
              <Building className="h-4 w-4" />
            </button>
          )}
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            canDelete={canDelete}
            deleteTooltip="No se puede eliminar: tiene centros de acopio asociados"
          />
        </div>
      </td>
    </tr>
  );
});

MicroredRow.displayName = 'MicroredRow';

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface MicroredModalProps {
  microred: Microred | null;
  redes: any[];
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
    ...(microred && { estado: microred.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      descripcion: formData.descripcion ? sanitizeInput(formData.descripcion) : '',
      redId: formData.redId,
      ...(microred && { estado: formData.estado }),
    };

    const validation = validateMicrored(sanitizedData);
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
  }, [formData, microred]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    if (!microred) delete (submitData as any).estado;
    await onSubmit(submitData);
  }, [formData, microred, validateForm, onSubmit]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const redesOptions = useMemo(() => redes.map(r => ({ value: r.id, label: r.nombre })), [redes]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={microred ? 'Editar Microred' : 'Nueva Microred'}
      subtitle={microred ? 'Actualizar informacion' : 'Registrar nueva microred'}
      icon={GitBranch}
      footer={
        <ModalFooter
          onCancel={onClose}
          submitLabel={microred ? 'Actualizar' : 'Crear'}
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
          <SelectInput
            id="redId"
            label="Red"
            value={formData.redId}
            onChange={(v) => handleFieldChange('redId', v)}
            options={redesOptions}
            placeholder="Seleccionar red..."
            required
            error={errors.redId}
          />
          {microred && (
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
          placeholder="Descripcion opcional de la microred"
          error={errors.descripcion}
        />

        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};

export default Microredes;
