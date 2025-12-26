import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Building, Building2, GitBranch, Network, MapPin, Phone, User, Plus } from 'lucide-react';
import { CentroAcopio, CreateCentroAcopioDto, UpdateCentroAcopioDto } from '../../types';
import { useCentrosAcopio } from '../../hooks/useCentrosAcopio';
import { useRedes } from '../../hooks/useRedes';
import { useMicroredes } from '../../hooks/useMicroredes';
import { useToastContext } from '../../contexts/ToastContext';
import { validateCentroAcopio, sanitizeInput } from '../../utils/validation';
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

interface CentrosAcopioProps {
  selectedMicroredId?: string;
  selectedMicroredNombre?: string;
  onNavigateToEstablecimientos?: (centroAcopioId: string, centroAcopioNombre: string) => void;
}

const TABLE_COLUMNS = [
  { key: 'centro', label: 'Centro de Acopio' },
  { key: 'codigo', label: 'Codigo' },
  { key: 'microred', label: 'Microred' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'direccion', label: 'Direccion' },
  { key: 'establecimientos', label: 'Establec.' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
];

const CentrosAcopio: React.FC<CentrosAcopioProps> = ({
  selectedMicroredId,
  selectedMicroredNombre,
  onNavigateToEstablecimientos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterRedId, setFilterRedId] = useState('');
  const [filterMicroredId, setFilterMicroredId] = useState(selectedMicroredId || '');
  const [showModal, setShowModal] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroAcopio | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    nombre: string;
  }>({ isOpen: false, id: '', nombre: '' });

  const {
    centrosAcopio,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    filters,
    setFilters,
    createCentroAcopio,
    updateCentroAcopio,
    deleteCentroAcopio,
  } = useCentrosAcopio();

  const { redes } = useRedes();
  const { microredes } = useMicroredes();
  const { toast } = useToastContext();

  useEffect(() => {
    if (selectedMicroredId && selectedMicroredId !== filterMicroredId) {
      setFilterMicroredId(selectedMicroredId);
    }
  }, [selectedMicroredId]);

  // Clear microred filter when red changes
  useEffect(() => {
    if (filterRedId !== filters.redId) {
      setFilterMicroredId('');
    }
  }, [filterRedId]);

  // Debounced filter application
  React.useEffect(() => {
    if (!centrosAcopio.length && !searchTerm && filterEstado === 'todos' && !filterRedId && !filterMicroredId) return;

    const timeoutId = setTimeout(() => {
      const newFilters: Record<string, string> = {};
      if (filterEstado !== 'todos') newFilters.estado = filterEstado;
      if (filterRedId) newFilters.redId = filterRedId;
      if (filterMicroredId) newFilters.microredId = filterMicroredId;
      if (searchTerm.trim()) newFilters.search = searchTerm.trim();
      setFilters(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterEstado, filterRedId, filterMicroredId, searchTerm]);

  const microredesFiltradas = useMemo(() => {
    if (!filterRedId) return microredes;
    return microredes.filter(m => m.redId === filterRedId);
  }, [microredes, filterRedId]);

  const stats = useMemo(() => [
    { key: 'total', label: 'Total Centros', value: total, icon: Building, color: 'primary' as ColorScheme },
    { key: 'activos', label: 'Activos', value: centrosAcopio.filter(c => c.estado === 'activo').length, icon: Building, color: 'success' as ColorScheme },
    { key: 'conEstablecimientos', label: 'Con Establec.', value: centrosAcopio.filter(c => (c._count?.establecimientos || 0) > 0).length, icon: Building2, color: 'warning' as ColorScheme },
    { key: 'inactivos', label: 'Inactivos', value: centrosAcopio.filter(c => c.estado === 'inactivo').length, icon: Building, color: 'danger' as ColorScheme },
  ], [centrosAcopio, total]);

  const handleOpenModal = useCallback((centro?: CentroAcopio) => {
    setEditingCentro(centro || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingCentro(null);
  }, []);

  const handleDelete = useCallback((id: string, nombre: string) => {
    setDeleteConfirmation({ isOpen: true, id, nombre });
  }, []);

  const confirmDelete = useCallback(async () => {
    const success = await deleteCentroAcopio(deleteConfirmation.id);
    if (success) {
      toast.success('Centro eliminado', `"${deleteConfirmation.nombre}" ha sido eliminado.`);
    } else {
      toast.error('Error al eliminar', 'Verifique que no tenga establecimientos asociados.');
    }
    setDeleteConfirmation({ isOpen: false, id: '', nombre: '' });
  }, [deleteConfirmation, deleteCentroAcopio, toast]);

  const handleSubmit = useCallback(async (formData: CreateCentroAcopioDto | UpdateCentroAcopioDto) => {
    if (editingCentro) {
      const success = await updateCentroAcopio(editingCentro.id, formData as UpdateCentroAcopioDto);
      if (success) {
        toast.success('Centro actualizado', 'Los cambios se guardaron correctamente.');
        handleCloseModal();
      } else {
        toast.error('Error al actualizar', 'No se pudieron guardar los cambios.');
      }
    } else {
      const success = await createCentroAcopio(formData as CreateCentroAcopioDto);
      if (success) {
        toast.success('Centro creado', 'El nuevo centro se registro correctamente.');
        handleCloseModal();
      } else {
        toast.error('Error al crear', 'No se pudo crear el centro.');
      }
    }
  }, [editingCentro, updateCentroAcopio, createCentroAcopio, toast, handleCloseModal]);

  const changePage = useCallback((page: number) => {
    setFilters({ ...filters, page });
  }, [filters, setFilters]);

  const redesOptions = useMemo(() => [
    { value: '', label: 'Todas las redes' },
    ...redes.map(r => ({ value: r.id, label: r.nombre })),
  ], [redes]);

  const microredesOptions = useMemo(() => [
    { value: '', label: 'Todas las microredes' },
    ...microredesFiltradas.map(m => ({ value: m.id, label: m.nombre })),
  ], [microredesFiltradas]);

  const filterConfigs = useMemo(() => [
    { id: 'red', label: 'Red', value: filterRedId, options: redesOptions, onChange: setFilterRedId },
    { id: 'microred', label: 'Microred', value: filterMicroredId, options: microredesOptions, onChange: setFilterMicroredId, disabled: !filterRedId },
    { id: 'estado', label: 'Estado', value: filterEstado, options: ESTADO_OPTIONS, onChange: setFilterEstado },
  ], [filterRedId, filterMicroredId, filterEstado, redesOptions, microredesOptions]);

  return (
    <div className="p-5 sm:p-6">
      {error && <ErrorAlert message={error} />}

      <PageHeader
        title={selectedMicroredNombre ? `Centros de Acopio - ${selectedMicroredNombre}` : 'Centros de Acopio'}
        subtitle="Puntos estrategicos de distribucion"
        icon={Building}
        count={total}
        action={{
          label: 'Nuevo Centro',
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
          searchPlaceholder="Buscar por nombre, codigo o responsable..."
          filters={filterConfigs}
        />

        <DataTable isLoading={loading} loadingMessage="Cargando centros de acopio...">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader columns={TABLE_COLUMNS} />
            <tbody className="divide-y divide-gray-100">
              {centrosAcopio.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Building}
                      title="No se encontraron centros de acopio"
                      description="Intente ajustar los filtros o cree uno nuevo"
                    />
                  </td>
                </tr>
              ) : (
                centrosAcopio.map((centro) => (
                  <CentroRow
                    key={centro.id}
                    centro={centro}
                    onEdit={() => handleOpenModal(centro)}
                    onDelete={() => handleDelete(centro.id, centro.nombre)}
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
            onPageChange={changePage}
          />
        </DataTable>
      </div>

      {showModal && (
        <CentroModal
          centro={editingCentro}
          microredes={microredes}
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
        itemType="centro de acopio"
        isLoading={loading}
        warningMessage="Verifique que no tenga establecimientos asociados."
      />
    </div>
  );
};

// ============================================================================
// TABLE ROW COMPONENT
// ============================================================================

interface CentroRowProps {
  centro: CentroAcopio;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate?: (id: string, nombre: string) => void;
  isLoading?: boolean;
}

const CentroRow: React.FC<CentroRowProps> = memo(({
  centro,
  onEdit,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const establecimientosCount = centro._count?.establecimientos || 0;
  const canDelete = establecimientosCount === 0;

  return (
    <tr className={COMPONENT_STYLES.table.row}>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <Building className="h-5 w-5 text-amber-600" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{centro.nombre}</p>
          </div>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <span className="text-sm text-gray-900">{centro.codigo || '-'}</span>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-900">{centro.microred?.nombre || 'Sin microred'}</span>
          </div>
          {centro.microred?.red && (
            <div className="flex items-center gap-2 mt-0.5">
              <Network className="h-3 w-3 text-gray-300 flex-shrink-0" />
              <span className="text-xs text-gray-500">{centro.microred.red.nombre}</span>
            </div>
          )}
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-900">{centro.responsable || '-'}</span>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600 max-w-[150px] truncate">{centro.direccion || '-'}</span>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <CountBadge count={establecimientosCount} icon={Building2} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <StatusBadge status={centro.estado as 'activo' | 'inactivo'} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center justify-end gap-1">
          {onNavigate && establecimientosCount > 0 && (
            <button
              onClick={() => onNavigate(centro.id, centro.nombre)}
              className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`}
              title="Ver establecimientos"
            >
              <Building2 className="h-4 w-4" />
            </button>
          )}
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading}
            canDelete={canDelete}
            deleteTooltip="No se puede eliminar: tiene establecimientos asociados"
          />
        </div>
      </td>
    </tr>
  );
});

CentroRow.displayName = 'CentroRow';

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface CentroModalProps {
  centro: CentroAcopio | null;
  microredes: any[];
  onClose: () => void;
  onSubmit: (data: CreateCentroAcopioDto | UpdateCentroAcopioDto) => Promise<void>;
  isLoading?: boolean;
}

const CentroModal: React.FC<CentroModalProps> = ({
  centro,
  microredes,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: centro?.nombre || '',
    codigo: centro?.codigo || '',
    microredId: centro?.microredId || '',
    direccion: centro?.direccion || '',
    responsable: centro?.responsable || '',
    telefono: centro?.telefono || '',
    ...(centro && { estado: centro.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const sanitizedData = {
      nombre: sanitizeInput(formData.nombre),
      codigo: formData.codigo ? sanitizeInput(formData.codigo) : '',
      direccion: sanitizeInput(formData.direccion),
      responsable: sanitizeInput(formData.responsable),
      telefono: formData.telefono ? sanitizeInput(formData.telefono) : '',
      microredId: formData.microredId,
      ...(centro && { estado: formData.estado }),
    };

    const validation = validateCentroAcopio(sanitizedData);
    setErrors(validation.errors);

    if (validation.isValid) {
      setFormData(prev => ({
        ...prev,
        nombre: sanitizedData.nombre,
        codigo: sanitizedData.codigo,
        direccion: sanitizedData.direccion,
        responsable: sanitizedData.responsable,
        telefono: sanitizedData.telefono,
      }));
    }

    return validation.isValid;
  }, [formData, centro]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    if (!centro) delete (submitData as any).estado;
    await onSubmit(submitData);
  }, [formData, centro, validateForm, onSubmit]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const microredesOptions = useMemo(() => 
    microredes.map(m => ({ 
      value: m.id, 
      label: m.red ? `${m.nombre} (${m.red.nombre})` : m.nombre 
    })), 
  [microredes]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={centro ? 'Editar Centro de Acopio' : 'Nuevo Centro de Acopio'}
      subtitle={centro ? 'Actualizar informacion' : 'Registrar nuevo punto de distribucion'}
      icon={Building}
      size="xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          submitLabel={centro ? 'Actualizar' : 'Crear'}
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
          />
          <SelectInput
            id="microredId"
            label="Microred"
            value={formData.microredId}
            onChange={(v) => handleFieldChange('microredId', v)}
            options={microredesOptions}
            placeholder="Seleccionar microred..."
          />
          <TextInput
            id="responsable"
            label="Responsable"
            value={formData.responsable}
            onChange={(v) => handleFieldChange('responsable', v)}
            required
            error={errors.responsable}
          />
          <TextInput
            id="telefono"
            label="Telefono"
            value={formData.telefono}
            onChange={(v) => handleFieldChange('telefono', v)}
            type="tel"
            placeholder="Opcional"
          />
          {centro && (
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
          id="direccion"
          label="Direccion"
          value={formData.direccion}
          onChange={(v) => handleFieldChange('direccion', v)}
          placeholder="Direccion completa del centro de acopio"
          required
          error={errors.direccion}
        />

        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};

export default CentrosAcopio;
