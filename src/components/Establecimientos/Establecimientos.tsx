import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Buildings, MapPin, Phone, Plus, User } from '@phosphor-icons/react';
import CascadingSelector from '../common/CascadingSelector';
import { useToastContext } from '../../contexts/ToastContext';
import { useEstablecimientos } from '../../hooks/useEstablecimientos';
import { CreateEstablecimientoDto, Establecimiento, EstablecimientoFilters, UpdateEstablecimientoDto, CentroAcopio } from '../../types';
import {
  ActionButtons,
  EmptyState,
  ErrorAlert,
  StatusBadge,
  TipoBadge,
} from './components';
import { DataTable, FilterBar, Pagination, TableCell, TableHeader, TableRow } from './components';
import {
  DeleteConfirmModal,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextInput,
} from './components';
import { COMPONENT_STYLES, TIPO_ESTABLECIMIENTO_CONFIG } from './constants';
import { sanitizeInput } from '../../utils/validation';

interface EstablecimientosProps {
  selectedRedId?: string;
  selectedRedNombre?: string;
  selectedMicroredId?: string;
  selectedMicroredNombre?: string;
  selectedCentroAcopioId?: string;
  selectedCentroAcopioNombre?: string;
}

const TABLE_COLUMNS = [
  { key: 'establecimiento', label: 'Establecimiento' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'responsable', label: 'Responsable' },
  { key: 'contacto', label: 'Contacto' },
  { key: 'estado', label: 'Estado', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos los tipos' },
  { value: 'centro_salud', label: 'Centro de Salud' },
  { value: 'puesto_salud', label: 'Puesto de Salud' },
  { value: 'hospital', label: 'Hospital' },
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

const Establecimientos: React.FC<EstablecimientosProps> = ({
  selectedRedId = '',
  selectedMicroredId = '',
  selectedCentroAcopioId = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingEstablecimiento, setEditingEstablecimiento] = useState<Establecimiento | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    nombre: string;
  }>({ isOpen: false, id: '', nombre: '' });
  const filterInitRef = useRef(false);

  const {
    establecimientos,
    centrosAcopio,
    pagination,
    isLoading,
    error,
    createEstablecimiento,
    updateEstablecimiento,
    deleteEstablecimiento,
    applyFilters,
    changePage,
    refresh,
    isCreating,
    isUpdating,
    isDeleting,
  } = useEstablecimientos();

  const { toast } = useToastContext();
  const errorMessage = typeof error === 'string' ? error : error ? 'Ocurrió un error al cargar los establecimientos.' : null;

  const contextFilters = useMemo<EstablecimientoFilters>(() => {
    if (selectedCentroAcopioId) return { centroAcopioId: selectedCentroAcopioId };
    if (selectedMicroredId) return { microredId: selectedMicroredId };
    if (selectedRedId) return { redId: selectedRedId };
    return {};
  }, [selectedCentroAcopioId, selectedMicroredId, selectedRedId]);

  useEffect(() => {
    const isFirstRun = !filterInitRef.current;
    filterInitRef.current = true;

    if (isFirstRun && !searchTerm && filterTipo === 'todos' && filterEstado === 'todos' && Object.keys(contextFilters).length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextFilters: EstablecimientoFilters = { ...contextFilters };
      if (filterTipo !== 'todos') nextFilters.tipo = filterTipo as EstablecimientoFilters['tipo'];
      if (filterEstado !== 'todos') nextFilters.estado = filterEstado as EstablecimientoFilters['estado'];
      if (searchTerm.trim()) nextFilters.search = searchTerm.trim();
      void applyFilters(nextFilters);
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [applyFilters, contextFilters, filterEstado, filterTipo, searchTerm]);

  const filtersConfig = useMemo(
    () => [
      {
        id: 'establecimientos-tipo',
        label: 'Tipo',
        value: filterTipo,
        options: TIPO_OPTIONS,
        onChange: setFilterTipo,
      },
      {
        id: 'establecimientos-estado',
        label: 'Estado',
        value: filterEstado,
        options: ESTADO_OPTIONS,
        onChange: setFilterEstado,
      },
    ],
    [filterEstado, filterTipo],
  );

  const handleOpenModal = useCallback((establecimiento?: Establecimiento) => {
    setEditingEstablecimiento(establecimiento || null);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingEstablecimiento(null);
  }, []);

  const handleSubmit = useCallback(
    async (formData: CreateEstablecimientoDto | UpdateEstablecimientoDto) => {
      if (editingEstablecimiento) {
        const success = await updateEstablecimiento(editingEstablecimiento.id, formData as UpdateEstablecimientoDto);
        if (!success) {
          toast.error('No se pudo actualizar el establecimiento', 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Establecimiento actualizado', 'Los cambios se guardaron correctamente.');
      } else {
        const success = await createEstablecimiento(formData as CreateEstablecimientoDto);
        if (!success) {
          toast.error('No se pudo crear el establecimiento', 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Establecimiento creado', 'El establecimiento se registró correctamente.');
      }

      handleCloseModal();
    },
    [createEstablecimiento, editingEstablecimiento, handleCloseModal, toast, updateEstablecimiento],
  );

  const handleDelete = useCallback((establecimiento: Establecimiento) => {
    setDeleteConfirmation({
      isOpen: true,
      id: establecimiento.id,
      nombre: establecimiento.nombre,
    });
  }, []);

  const confirmDelete = useCallback(async () => {
    const success = await deleteEstablecimiento(deleteConfirmation.id);

    if (!success) {
      toast.error('No se pudo eliminar el establecimiento', 'Intente nuevamente o verifique sus dependencias.');
      return;
    }

    toast.success('Establecimiento eliminado', `"${deleteConfirmation.nombre}" fue eliminado.`);
    setDeleteConfirmation({ isOpen: false, id: '', nombre: '' });
  }, [deleteConfirmation.id, deleteConfirmation.nombre, deleteEstablecimiento, toast]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterTipo('todos');
    setFilterEstado('todos');
    void applyFilters(contextFilters);
  }, [applyFilters, contextFilters]);

  const desktopTable = (
    <DataTable
      isLoading={isLoading}
      loadingMessage="Cargando establecimientos..."
      skeletonRows={5}
      skeletonColumns={TABLE_COLUMNS.length}
      loadingVariant="table"
    >
      <table className="min-w-full border-separate border-spacing-0">
        <TableHeader columns={TABLE_COLUMNS} />
        <tbody className="bg-white">
          {establecimientos.length === 0 ? (
            <tr>
              <td colSpan={TABLE_COLUMNS.length + 1}>
                <EmptyState
                  icon={Buildings}
                  title="No se encontraron establecimientos"
                  description="Ajuste los filtros o registre un nuevo establecimiento."
                  action={{ label: 'Nuevo establecimiento', onClick: () => handleOpenModal() }}
                />
              </td>
            </tr>
          ) : (
            establecimientos.map((establecimiento) => (
              <EstablecimientoDesktopRow
                key={establecimiento.id}
                establecimiento={establecimiento}
                onEdit={() => handleOpenModal(establecimiento)}
                onDelete={() => handleDelete(establecimiento)}
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
  );

  return (
    <div className="space-y-4">
      {errorMessage ? <ErrorAlert message={errorMessage} onRetry={refresh} /> : null}

      <section className={`${COMPONENT_STYLES.surface} p-4 sm:p-6`}>
        <div className="space-y-4">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre, código o responsable"
            filters={filtersConfig}
            onClear={handleClearFilters}
            actions={
              <button type="button" className={COMPONENT_STYLES.button.primary} onClick={() => handleOpenModal()} disabled={isCreating}>
                <Plus className="h-4 w-4" />
                <span>Nuevo establecimiento</span>
              </button>
            }
          />

          <div className="hidden lg:block">{desktopTable}</div>

          <div className="space-y-3 lg:hidden">
            {isLoading ? (
              <DataTable isLoading loadingMessage="Cargando establecimientos..." skeletonRows={4} loadingVariant="cards" />
            ) : establecimientos.length === 0 ? (
              <div className={COMPONENT_STYLES.panel}>
                <EmptyState
                  icon={Buildings}
                  title="No se encontraron establecimientos"
                  description="Ajuste los filtros o registre un nuevo establecimiento."
                  action={{ label: 'Nuevo establecimiento', onClick: () => handleOpenModal() }}
                />
              </div>
            ) : (
              establecimientos.map((establecimiento) => (
                <EstablecimientoMobileCard
                  key={establecimiento.id}
                  establecimiento={establecimiento}
                  onEdit={() => handleOpenModal(establecimiento)}
                  onDelete={() => handleDelete(establecimiento)}
                  isLoading={isUpdating || isDeleting}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {showModal ? (
        <EstablecimientoModal
          establecimiento={editingEstablecimiento}
          centrosAcopio={centrosAcopio}
          defaultRedId={selectedRedId}
          defaultMicroredId={selectedMicroredId}
          defaultCentroAcopioId={selectedCentroAcopioId}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, id: '', nombre: '' })}
        onConfirm={confirmDelete}
        itemName={deleteConfirmation.nombre}
        itemType="establecimiento"
        isLoading={isDeleting}
      />
    </div>
  );
};

interface EstablecimientoRowProps {
  establecimiento: Establecimiento;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const EstablecimientoDesktopRow: React.FC<EstablecimientoRowProps> = memo(({
  establecimiento,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const tipoConfig =
    TIPO_ESTABLECIMIENTO_CONFIG[establecimiento.tipo as keyof typeof TIPO_ESTABLECIMIENTO_CONFIG];

  return (
    <TableRow>
      <TableCell>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{establecimiento.nombre}</p>
          <p className="text-xs text-muted">{establecimiento.codigo}</p>
        </div>
      </TableCell>
      <TableCell>
        <TipoBadge config={tipoConfig} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-zinc-700">
          <User className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <span>{establecimiento.responsable}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1 text-sm text-zinc-600">
          {establecimiento.telefono ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <span>{establecimiento.telefono}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            <span className="max-w-[220px] truncate">{establecimiento.direccion}</span>
          </div>
        </div>
      </TableCell>
      <TableCell align="center">
        <StatusBadge status={establecimiento.estado} />
      </TableCell>
      <TableCell align="right">
        <ActionButtons onEdit={onEdit} onDelete={onDelete} isLoading={isLoading} />
      </TableCell>
    </TableRow>
  );
});

EstablecimientoDesktopRow.displayName = 'EstablecimientoDesktopRow';

const EstablecimientoMobileCard: React.FC<EstablecimientoRowProps> = memo(({
  establecimiento,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const tipoConfig =
    TIPO_ESTABLECIMIENTO_CONFIG[establecimiento.tipo as keyof typeof TIPO_ESTABLECIMIENTO_CONFIG];

  return (
    <article className={`${COMPONENT_STYLES.panel} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-zinc-950">{establecimiento.nombre}</p>
          <p className="mt-1 text-sm text-zinc-500">{establecimiento.codigo}</p>
        </div>
        <StatusBadge status={establecimiento.estado} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <TipoBadge config={tipoConfig} />
      </div>

      <div className="mt-3 space-y-2 text-sm text-zinc-600">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <span>{establecimiento.responsable}</span>
        </div>
        {establecimiento.telefono ? (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            <span>{establecimiento.telefono}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <span>{establecimiento.direccion}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <ActionButtons onEdit={onEdit} onDelete={onDelete} isLoading={isLoading} />
      </div>
    </article>
  );
});

EstablecimientoMobileCard.displayName = 'EstablecimientoMobileCard';

interface EstablecimientoModalProps {
  establecimiento: Establecimiento | null;
  centrosAcopio: CentroAcopio[];
  defaultRedId?: string;
  defaultMicroredId?: string;
  defaultCentroAcopioId?: string;
  onClose: () => void;
  onSubmit: (data: CreateEstablecimientoDto | UpdateEstablecimientoDto) => Promise<void>;
  isLoading?: boolean;
}

const EstablecimientoModal: React.FC<EstablecimientoModalProps> = ({
  establecimiento,
  centrosAcopio,
  defaultRedId = '',
  defaultMicroredId = '',
  defaultCentroAcopioId = '',
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const centroAcopioActual = useMemo(() => {
    if (!establecimiento?.centroAcopioId) return null;
    return centrosAcopio.find(c => c.id === establecimiento.centroAcopioId);
  }, [centrosAcopio, establecimiento?.centroAcopioId]);

  const [formData, setFormData] = useState({
    nombre: establecimiento?.nombre || '',
    tipo: establecimiento?.tipo || 'centro_salud',
    codigo: establecimiento?.codigo || '',
    centroAcopioId: establecimiento?.centroAcopioId || defaultCentroAcopioId,
    direccion: establecimiento?.direccion || '',
    responsable: establecimiento?.responsable || '',
    telefono: establecimiento?.telefono || '',
    redId: (centroAcopioActual?.microred as any)?.red?.id || defaultRedId,
    microredId: centroAcopioActual?.microredId || defaultMicroredId,
    estado: establecimiento?.estado || 'activo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) nextErrors.nombre = 'Ingrese el nombre del establecimiento.';
    if (!formData.codigo.trim()) nextErrors.codigo = 'Ingrese el código del establecimiento.';
    if (!formData.centroAcopioId) nextErrors.centroAcopioId = 'Seleccione un centro de acopio.';
    if (!formData.direccion.trim()) nextErrors.direccion = 'Ingrese la dirección del establecimiento.';
    if (!formData.responsable.trim()) nextErrors.responsable = 'Ingrese el responsable del establecimiento.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: CreateEstablecimientoDto | UpdateEstablecimientoDto = {
      nombre: sanitizeInput(formData.nombre),
      tipo: formData.tipo as CreateEstablecimientoDto['tipo'],
      codigo: sanitizeInput(formData.codigo),
      centroAcopioId: formData.centroAcopioId,
      direccion: sanitizeInput(formData.direccion),
      responsable: sanitizeInput(formData.responsable),
      telefono: formData.telefono ? sanitizeInput(formData.telefono) : '',
      ...(establecimiento ? { estado: formData.estado as 'activo' | 'inactivo' } : {}),
    };

    await onSubmit(payload);
  }, [establecimiento, formData, onSubmit]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={establecimiento ? 'Editar establecimiento' : 'Nuevo establecimiento'}
      subtitle={
        establecimiento
          ? 'Ajusta el punto de atención sin romper su ubicación territorial.'
          : 'Registra un nuevo establecimiento y asígnalo a su centro de acopio.'
      }
      icon={Buildings}
      size="xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={establecimiento ? 'Guardar cambios' : 'Crear establecimiento'}
          isLoading={isLoading}
        />
      }
    >
      <div className="space-y-4">
        <FormSection title="Identificación" description="Datos clave para reconocer el establecimiento dentro del sistema.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="establecimiento-nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={(value) => handleFieldChange('nombre', value)}
              placeholder="Ej: C.S. Andahuaylas"
              required
              error={errors.nombre}
            />
            <TextInput
              id="establecimiento-codigo"
              label="Código"
              value={formData.codigo}
              onChange={(value) => handleFieldChange('codigo', value)}
              placeholder="Ej: 6804"
              required
              error={errors.codigo}
            />
            <SelectInput
              id="establecimiento-tipo"
              label="Tipo"
              value={formData.tipo}
              onChange={(value) => handleFieldChange('tipo', value)}
              options={[
                { value: 'centro_salud', label: 'Centro de Salud' },
                { value: 'puesto_salud', label: 'Puesto de Salud' },
                { value: 'hospital', label: 'Hospital' },
              ]}
              required
            />
            {establecimiento ? (
              <SelectInput
                id="establecimiento-estado"
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

        <FormSection title="Ubicación jerárquica" description="Selecciona la red, microred y centro de acopio que agrupan al establecimiento.">
          <CascadingSelector
            selectedRedId={formData.redId}
            selectedMicroredId={formData.microredId}
            selectedCentroAcopioId={formData.centroAcopioId}
            onRedChange={(redId) =>
              setFormData((current) => ({ ...current, redId, microredId: '', centroAcopioId: '' }))
            }
            onMicroredChange={(microredId) =>
              setFormData((current) => ({ ...current, microredId, centroAcopioId: '' }))
            }
            onCentroAcopioChange={(centroAcopioId) => handleFieldChange('centroAcopioId', centroAcopioId)}
            required={{ centroAcopio: true }}
            errors={{ centroAcopio: errors.centroAcopioId }}
          />
        </FormSection>

        <FormSection title="Contacto y ubicación" description="Datos operativos usados por los equipos al consultar el establecimiento.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="establecimiento-responsable"
              label="Responsable"
              value={formData.responsable}
              onChange={(value) => handleFieldChange('responsable', value)}
              placeholder="Nombre del responsable"
              required
              error={errors.responsable}
            />
            <TextInput
              id="establecimiento-telefono"
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(value) => handleFieldChange('telefono', value)}
              placeholder="Opcional"
            />
          </div>

          <TextInput
            id="establecimiento-direccion"
            label="Dirección"
            value={formData.direccion}
            onChange={(value) => handleFieldChange('direccion', value)}
            placeholder="Dirección completa del establecimiento"
            required
            error={errors.direccion}
          />
        </FormSection>
      </div>
    </Modal>
  );
};

export default memo(Establecimientos);
 