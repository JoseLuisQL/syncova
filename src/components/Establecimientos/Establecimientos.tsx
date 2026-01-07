import React, { useState, useCallback, useMemo, memo } from 'react';
import { Building2, Plus, MapPin, Phone, User } from 'lucide-react';
import { Establecimiento, CreateEstablecimientoDto, UpdateEstablecimientoDto } from '../../types';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { useToastContext } from '../../contexts/ToastContext';
import CascadingSelector from '../common/CascadingSelector';
import {
  PageHeader,
  StatsGrid,
  StatusBadge,
  TipoBadge,
  EmptyState,
  ErrorAlert,
  ActionButtons,
} from './components/SharedComponents';
import { FilterBar, Pagination, DataTable, TableHeader } from './components/FilterAndTable';
import { Modal, ModalFooter, TextInput, SelectInput } from './components/ModalComponents';
import { COMPONENT_STYLES, STATS_CONFIG, TIPO_ESTABLECIMIENTO_CONFIG, ColorScheme } from './constants';

interface EstablecimientosProps {
  selectedCentroAcopioId?: string;
  selectedCentroAcopioNombre?: string;
}

const TABLE_COLUMNS = [
  { key: 'establecimiento', label: 'Establecimiento' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'contacto', label: 'Contacto' },
  { key: 'estado', label: 'Estado' },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'centro_salud', label: 'Centro de Salud' },
  { value: 'puesto_salud', label: 'Puesto de Salud' },
  { value: 'hospital', label: 'Hospital' },
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
];

const Establecimientos: React.FC<EstablecimientosProps> = ({
  selectedCentroAcopioId,
  selectedCentroAcopioNombre,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingEstablecimiento, setEditingEstablecimiento] = useState<Establecimiento | null>(null);

  const {
    establecimientos,
    pagination,
    isLoading,
    error,
    createEstablecimiento,
    updateEstablecimiento,
    deleteEstablecimiento,
    applyFilters,
    changePage,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEstablecimientos();

  const { toast } = useToastContext();

  // Debounced filter application
  React.useEffect(() => {
    if (!establecimientos.length && !searchTerm && filterTipo === 'todos' && filterEstado === 'todos') {
      return;
    }

    const timeoutId = setTimeout(() => {
      const filters: Record<string, string> = {};
      if (filterTipo !== 'todos') filters.tipo = filterTipo;
      if (filterEstado !== 'todos') filters.estado = filterEstado;
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      applyFilters(filters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterTipo, filterEstado, searchTerm]);

  const stats = useMemo(() => [
    { key: 'centrosSalud', label: 'Centros de Salud', value: establecimientos.filter(e => e.tipo === 'centro_salud').length, icon: STATS_CONFIG.establecimientos[0].icon, color: 'primary' as ColorScheme },
    { key: 'puestosSalud', label: 'Puestos de Salud', value: establecimientos.filter(e => e.tipo === 'puesto_salud').length, icon: STATS_CONFIG.establecimientos[1].icon, color: 'secondary' as ColorScheme },
    { key: 'hospitales', label: 'Hospitales', value: establecimientos.filter(e => e.tipo === 'hospital').length, icon: STATS_CONFIG.establecimientos[2].icon, color: 'warning' as ColorScheme },
    { key: 'activos', label: 'Activos', value: establecimientos.filter(e => e.estado === 'activo').length, icon: STATS_CONFIG.establecimientos[3].icon, color: 'success' as ColorScheme },
  ], [establecimientos]);

  const handleOpenModal = useCallback((establecimiento?: Establecimiento) => {
    setEditingEstablecimiento(establecimiento || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingEstablecimiento(null);
  }, []);

  const handleDelete = useCallback(async (id: string, nombre: string) => {
    if (window.confirm(`¿Esta seguro de eliminar el establecimiento "${nombre}"?\n\nEsta accion no se puede deshacer.`)) {
      const success = await deleteEstablecimiento(id);
      if (success) {
        toast.success('Establecimiento eliminado', `"${nombre}" ha sido eliminado exitosamente.`);
      } else {
        toast.error('Error al eliminar', 'No se pudo eliminar el establecimiento.');
      }
    }
  }, [deleteEstablecimiento, toast]);

  const handleSubmit = useCallback(async (formData: CreateEstablecimientoDto | UpdateEstablecimientoDto) => {
    if (editingEstablecimiento) {
      const success = await updateEstablecimiento(editingEstablecimiento.id, formData as UpdateEstablecimientoDto);
      if (success) {
        toast.success('Establecimiento actualizado', 'Los cambios se guardaron correctamente.');
        handleCloseModal();
      } else {
        toast.error('Error al actualizar', 'No se pudieron guardar los cambios.');
      }
    } else {
      const success = await createEstablecimiento(formData as CreateEstablecimientoDto);
      if (success) {
        toast.success('Establecimiento creado', 'El nuevo establecimiento se registro correctamente.');
        handleCloseModal();
      } else {
        toast.error('Error al crear', 'No se pudo crear el establecimiento.');
      }
    }
  }, [editingEstablecimiento, updateEstablecimiento, createEstablecimiento, toast, handleCloseModal]);

  const filterConfigs = useMemo(() => [
    { id: 'tipo', label: 'Tipo', value: filterTipo, options: TIPO_OPTIONS, onChange: setFilterTipo },
    { id: 'estado', label: 'Estado', value: filterEstado, options: ESTADO_OPTIONS, onChange: setFilterEstado },
  ], [filterTipo, filterEstado]);

  return (
    <div className="p-5 sm:p-6">
      {error && <ErrorAlert message={error} />}

      <PageHeader
        title="Establecimientos de Salud"
        subtitle={selectedCentroAcopioNombre ? `Centro: ${selectedCentroAcopioNombre}` : 'Gestion de centros de atencion'}
        icon={Building2}
        count={pagination.total}
        action={{
          label: 'Nuevo Establecimiento',
          onClick: () => handleOpenModal(),
          icon: Plus,
          isLoading: isCreating,
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

        <DataTable isLoading={isLoading} loadingMessage="Cargando establecimientos...">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader columns={TABLE_COLUMNS} />
            <tbody className="divide-y divide-gray-100">
              {establecimientos.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Building2}
                      title="No se encontraron establecimientos"
                      description="Intente ajustar los filtros o cree uno nuevo"
                    />
                  </td>
                </tr>
              ) : (
                establecimientos.map((establecimiento) => (
                  <EstablecimientoRow
                    key={establecimiento.id}
                    establecimiento={establecimiento}
                    onEdit={() => handleOpenModal(establecimiento)}
                    onDelete={() => handleDelete(establecimiento.id, establecimiento.nombre)}
                    isLoading={isUpdating || isDeleting}
                  />
                ))
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={changePage}
          />
        </DataTable>
      </div>

      {showModal && (
        <EstablecimientoModal
          establecimiento={editingEstablecimiento}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

// ============================================================================
// TABLE ROW COMPONENT
// ============================================================================

interface EstablecimientoRowProps {
  establecimiento: Establecimiento;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const EstablecimientoRow: React.FC<EstablecimientoRowProps> = memo(({
  establecimiento,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const tipoConfig = TIPO_ESTABLECIMIENTO_CONFIG[establecimiento.tipo as keyof typeof TIPO_ESTABLECIMIENTO_CONFIG] || {
    label: establecimiento.tipo,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  };

  return (
    <tr className={COMPONENT_STYLES.table.row}>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${tipoConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Building2 className={`h-5 w-5 ${tipoConfig.textColor}`} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {establecimiento.nombre}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              {establecimiento.codigo}
            </p>
          </div>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <TipoBadge tipo={establecimiento.tipo} config={tipoConfig} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm text-gray-900">{establecimiento.responsable}</span>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="space-y-1">
          {establecimiento.telefono && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
              <span>{establecimiento.telefono}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[180px]">{establecimiento.direccion}</span>
          </div>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <StatusBadge status={establecimiento.estado as 'activo' | 'inactivo'} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <ActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      </td>
    </tr>
  );
});

EstablecimientoRow.displayName = 'EstablecimientoRow';

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface EstablecimientoModalProps {
  establecimiento: Establecimiento | null;
  onClose: () => void;
  onSubmit: (data: CreateEstablecimientoDto | UpdateEstablecimientoDto) => Promise<void>;
  isLoading?: boolean;
}

const EstablecimientoModal: React.FC<EstablecimientoModalProps> = ({
  establecimiento,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nombre: establecimiento?.nombre || '',
    tipo: establecimiento?.tipo || 'centro_salud',
    codigo: establecimiento?.codigo || '',
    centroAcopioId: establecimiento?.centroAcopioId || '',
    direccion: establecimiento?.direccion || '',
    responsable: establecimiento?.responsable || '',
    telefono: establecimiento?.telefono || '',
    redId: establecimiento?.centroAcopio?.microred?.redId || '',
    microredId: establecimiento?.centroAcopio?.microredId || '',
    ...(establecimiento && { estado: establecimiento.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.codigo.trim()) newErrors.codigo = 'El codigo es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La direccion es requerida';
    if (!formData.responsable.trim()) newErrors.responsable = 'El responsable es requerido';
    if (!formData.centroAcopioId) newErrors.centroAcopioId = 'Seleccione un centro de acopio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = { ...formData };
    if (!establecimiento) {
      delete (submitData as any).estado;
    }
    await onSubmit(submitData);
  }, [formData, establecimiento, validateForm, onSubmit]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={establecimiento ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}
      subtitle={establecimiento ? 'Actualizar informacion' : 'Registrar nuevo centro de atencion'}
      icon={Building2}
      footer={
        <ModalFooter
          onCancel={onClose}
          submitLabel={establecimiento ? 'Actualizar' : 'Crear'}
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
            required
            error={errors.codigo}
          />
          <SelectInput
            id="tipo"
            label="Tipo"
            value={formData.tipo}
            onChange={(v) => handleFieldChange('tipo', v)}
            options={[
              { value: 'centro_salud', label: 'Centro de Salud' },
              { value: 'puesto_salud', label: 'Puesto de Salud' },
              { value: 'hospital', label: 'Hospital' },
            ]}
            required
          />
          {establecimiento && (
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

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Ubicacion en la Estructura Jerarquica
          </p>
          <CascadingSelector
            selectedRedId={formData.redId || ''}
            selectedMicroredId={formData.microredId || ''}
            selectedCentroAcopioId={formData.centroAcopioId}
            onRedChange={(redId) => setFormData(prev => ({ ...prev, redId, microredId: '', centroAcopioId: '' }))}
            onMicroredChange={(microredId) => setFormData(prev => ({ ...prev, microredId, centroAcopioId: '' }))}
            onCentroAcopioChange={(centroAcopioId) => {
              handleFieldChange('centroAcopioId', centroAcopioId);
            }}
            required={{ centroAcopio: true }}
            errors={{ centroAcopio: errors.centroAcopioId }}
          />
        </div>

        <TextInput
          id="direccion"
          label="Direccion"
          value={formData.direccion}
          onChange={(v) => handleFieldChange('direccion', v)}
          required
          error={errors.direccion}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {/* Hidden submit button for form submission */}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};

export default Establecimientos;
