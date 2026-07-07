import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Syringe } from '@phosphor-icons/react';
import { CreateJeringaDto, Jeringa, UpdateJeringaDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useInventorySearch } from '../../hooks/useInventorySearch';
import { useJeringas } from '../../hooks/useJeringas';
import {
  ActionButtons,
  EmptyState,
  ErrorAlert,
  StatusBadge,
  KeyValueGrid,
} from './components/SharedComponents';
import { DataTable, FilterBar, Pagination, TableCell, TableHeader, TableRow } from './components/FilterAndTable';
import {
  DeleteConfirmModal,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  SideSheet,
} from '../ui/ModalElements';
import { COMPONENT_STYLES, FILTER_OPTIONS } from './constants';

const TABLE_COLUMNS = [
  { key: 'jeringa', label: 'Jeringa' },
  { key: 'detalle', label: 'Capacidad y color' },
  { key: 'stock', label: 'Stock', align: 'center' as const },
  { key: 'lotes', label: 'Lotes', align: 'center' as const },
  { key: 'estado', label: 'Estado', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const TIPO_OPTIONS = [
  { value: 'Desechable', label: 'Desechable' },
  { value: 'Autoretraible', label: 'Autoretraible' },
  { value: 'De seguridad', label: 'De seguridad' },
  { value: 'Para insulina', label: 'Para insulina' },
  { value: 'Tuberculina', label: 'Tuberculina' },
];

const CAPACIDAD_OPTIONS = [
  { value: '0.5ml', label: '0.5 ml' },
  { value: '1ml', label: '1 ml' },
  { value: '2ml', label: '2 ml' },
  { value: '3ml', label: '3 ml' },
  { value: '5ml', label: '5 ml' },
  { value: '10ml', label: '10 ml' },
  { value: '20ml', label: '20 ml' },
];

const COLOR_OPTIONS = [
  { value: 'Transparente', label: 'Transparente' },
  { value: 'Azul', label: 'Azul' },
  { value: 'Verde', label: 'Verde' },
  { value: 'Rojo', label: 'Rojo' },
  { value: 'Amarillo', label: 'Amarillo' },
  { value: 'Naranja', label: 'Naranja' },
  { value: 'Morado', label: 'Morado' },
];

const GestionJeringas: React.FC = () => {
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingJeringa, setEditingJeringa] = useState<Jeringa | null>(null);
  const [selectedJeringa, setSelectedJeringa] = useState<Jeringa | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Jeringa | null>(null);

  const {
    jeringas,
    pagination,
    isLoading,
    error,
    createJeringa,
    updateJeringa,
    deleteJeringa,
    search,
    applyFilters,
    changePage,
    refresh,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
  } = useJeringas();

  const { toast } = useToastContext();
  const filterInitRef = useRef(true);
  const applyFiltersRef = useRef(applyFilters);

  const { searchValue, setSearchValue, clearSearch } = useInventorySearch({
    onSearch: search,
    onReset: () => search(''),
  });

  useEffect(() => {
    applyFiltersRef.current = applyFilters;
  }, [applyFilters]);

  useEffect(() => {
    if (!error) return;
    toast.error('Error al cargar jeringas', error);
  }, [error, toast]);

  useEffect(() => {
    if (filterInitRef.current) {
      filterInitRef.current = false;
      return;
    }

    void applyFiltersRef.current({
      estado: filterEstado === 'todos' ? undefined : (filterEstado as 'activo' | 'inactivo'),
    });
  }, [filterEstado]);



  const filters = useMemo(
    () => [
      {
        id: 'estado-jeringa',
        label: 'Estado',
        value: filterEstado,
        options: [...FILTER_OPTIONS.estado],
        onChange: setFilterEstado,
      },
    ],
    [filterEstado],
  );

  const handleCreate = useCallback(() => {
    setEditingJeringa(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((jeringa: Jeringa) => {
    setEditingJeringa(jeringa);
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(
    async (payload: CreateJeringaDto | UpdateJeringaDto) => {
      if (editingJeringa) {
        const success = await updateJeringa(editingJeringa.id, payload as UpdateJeringaDto);
        if (!success) {
          toast.error('No se pudo actualizar la jeringa', updateError || 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Jeringa actualizada', 'Los cambios se guardaron correctamente.');
      } else {
        const success = await createJeringa(payload as CreateJeringaDto);
        if (!success) {
          toast.error('No se pudo crear la jeringa', createError || 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Jeringa creada', 'La jeringa fue registrada correctamente.');
      }

      setShowModal(false);
      setEditingJeringa(null);
    },
    [createError, createJeringa, editingJeringa, toast, updateError, updateJeringa],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    const success = await deleteJeringa(deleteTarget.id);
    if (!success) {
      toast.error('No se pudo eliminar la jeringa', deleteError || 'Intente nuevamente.');
      return;
    }

    toast.success('Jeringa eliminada', `${deleteTarget.tipo} ${deleteTarget.capacidad} fue eliminada.`);
    setDeleteTarget(null);
    if (selectedJeringa?.id === deleteTarget.id) {
      setSelectedJeringa(null);
    }
  }, [deleteError, deleteJeringa, deleteTarget, selectedJeringa?.id, toast]);

  const handleClearFilters = useCallback(() => {
    clearSearch();
    setFilterEstado('todos');
  }, [clearSearch]);

  const desktopTable = (
    <DataTable
      isLoading={isLoading}
      loadingMessage="Cargando jeringas..."
      skeletonRows={5}
      skeletonColumns={TABLE_COLUMNS.length}
      loadingVariant="table"
    >
      <table className="min-w-full border-separate border-spacing-0">
        <TableHeader columns={TABLE_COLUMNS} />
        <tbody className="bg-white">
          {jeringas.length === 0 ? (
            <tr>
              <td colSpan={TABLE_COLUMNS.length + 1}>
                <EmptyState
                  icon={Syringe}
                  title="No se encontraron jeringas"
                  description="Ajuste los filtros o registre una nueva jeringa."
                  action={{ label: 'Nueva jeringa', onClick: handleCreate }}
                />
              </td>
            </tr>
          ) : (
            jeringas.map((jeringa) => {
              const stockInfo = getStockInfo(jeringa);
              return (
                <TableRow key={jeringa.id}>
                  <TableCell>
                    <button type="button" onClick={() => setSelectedJeringa(jeringa)} className="min-w-0 text-left">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{jeringa.tipo}</p>
                        <p className="text-xs text-muted">Uso operativo</p>
                      </div>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`h-3.5 w-3.5 rounded-full border border-zinc-300 ${getColorClass(jeringa.color)}`} />
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{jeringa.capacidad}</p>
                        <p className="text-xs text-zinc-500">{jeringa.color}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <span className={`text-lg font-semibold ${stockInfo.stockTotal > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {stockInfo.stockTotal.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-[0.78rem]">
                      <span className={COMPONENT_STYLES.badge.count}>
                        {stockInfo.lotesActivos} act.
                      </span>
                      <span className={COMPONENT_STYLES.badge.danger}>
                        {stockInfo.lotesAgotados} agot.
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={jeringa.estado} />
                  </TableCell>
                  <TableCell align="right">
                    <ActionButtons
                      onView={() => setSelectedJeringa(jeringa)}
                      onEdit={() => handleEdit(jeringa)}
                      onDelete={() => setDeleteTarget(jeringa)}
                      isLoading={isUpdating || isDeleting}
                    />
                  </TableCell>
                </TableRow>
              );
            })
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
      {error ? <ErrorAlert message={error} onRetry={refresh} /> : null}

      <section className={`${COMPONENT_STYLES.surface} p-4 sm:p-6`}>
        <div className="space-y-4">
          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Buscar por tipo, capacidad o color"
            filters={filters}
            onClear={handleClearFilters}
            actions={
              <button type="button" className={COMPONENT_STYLES.button.primary} onClick={handleCreate} disabled={isCreating}>
                <Plus className="h-4 w-4" weight="bold" />
                <span>Nueva jeringa</span>
              </button>
            }
          />

          <div className="hidden lg:block">{desktopTable}</div>

          <div className="space-y-3 lg:hidden">
            {isLoading ? (
              <DataTable isLoading={isLoading} loadingMessage="Cargando jeringas..." skeletonRows={4} loadingVariant="cards"><></></DataTable>
            ) : jeringas.length === 0 ? (
              <div className={COMPONENT_STYLES.panel}>
                <EmptyState
                  icon={Syringe}
                  title="No se encontraron jeringas"
                  description="Ajuste los filtros o registre una nueva jeringa."
                  action={{ label: 'Nueva jeringa', onClick: handleCreate }}
                />
              </div>
            ) : (
              jeringas.map((jeringa) => {
                const stockInfo = getStockInfo(jeringa);
                return (
                  <article key={jeringa.id} className={`${COMPONENT_STYLES.panel} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => setSelectedJeringa(jeringa)} className="min-w-0 text-left">
                        <p className="truncate text-base font-semibold text-zinc-950">{jeringa.tipo}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {jeringa.capacidad} · {jeringa.color}
                        </p>
                      </button>
                      <StatusBadge status={jeringa.estado} />
                    </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Stock</p>
                        <p className={`mt-2 text-lg font-semibold ${stockInfo.stockTotal > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {stockInfo.stockTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Lotes</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-900">{jeringa._count?.lotes || 0}</p>
                      </div>
                    </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    <p>{stockInfo.lotesActivos} disponibles</p>
                    <p>{stockInfo.lotesAgotados} agotados</p>
                      </div>
                      <ActionButtons
                        onView={() => setSelectedJeringa(jeringa)}
                        onEdit={() => handleEdit(jeringa)}
                        onDelete={() => setDeleteTarget(jeringa)}
                        isLoading={isUpdating || isDeleting}
                      />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      <SideSheet
        isOpen={Boolean(selectedJeringa)}
        onClose={() => setSelectedJeringa(null)}
        title={selectedJeringa?.tipo || 'Detalle de jeringa'}
        subtitle={selectedJeringa ? `${selectedJeringa.capacidad} · ${selectedJeringa.color}` : undefined}
        icon={Syringe}
      >
        {selectedJeringa ? (
          <div className="space-y-5">
            <KeyValueGrid
              columns={2}
              items={[
                { label: 'Capacidad', value: <span className="font-medium">{selectedJeringa.capacidad}</span> },
                { label: 'Color', value: <span className="font-medium">{selectedJeringa.color}</span> },
                { label: 'Estado', value: <StatusBadge status={selectedJeringa.estado} /> },
                { label: 'Creado', value: <span className="font-medium">{selectedJeringa.createdAt.toLocaleDateString()}</span> },
              ]}
            />

            <KeyValueGrid
              columns={1}
              items={[
                {
                  label: 'Inventario asociado',
                  value: (
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold text-zinc-900">{getStockInfo(selectedJeringa).stockTotal.toLocaleString()}</span>{' '}
                        unidades en stock total
                      </p>
                      <p>{getStockInfo(selectedJeringa).lotesActivos} lotes disponibles</p>
                      <p>{getStockInfo(selectedJeringa).lotesAgotados} lotes agotados</p>
                    </div>
                  ),
                },
              ]}
            />

            <div className="flex flex-wrap gap-2">
              <button type="button" className={COMPONENT_STYLES.button.secondary} onClick={() => handleEdit(selectedJeringa)}>
                Editar jeringa
              </button>
              <button type="button" className={COMPONENT_STYLES.button.ghost} onClick={() => setSelectedJeringa(null)}>
                Cerrar
              </button>
            </div>
          </div>
        ) : null}
      </SideSheet>

      {showModal ? (
        <JeringaModal
          jeringa={editingJeringa}
          onClose={() => {
            setShowModal(false);
            setEditingJeringa(null);
          }}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget ? `${deleteTarget.tipo} ${deleteTarget.capacidad}` : ''}
        itemType="jeringa"
        isLoading={isDeleting}
      />
    </div>
  );
};

interface JeringaModalProps {
  jeringa: Jeringa | null;
  onClose: () => void;
  onSubmit: (payload: CreateJeringaDto | UpdateJeringaDto) => Promise<void>;
  isLoading?: boolean;
}

const JeringaModal: React.FC<JeringaModalProps> = ({ jeringa, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    tipo: jeringa?.tipo || 'Desechable',
    capacidad: jeringa?.capacidad || '1ml',
    color: jeringa?.color || 'Transparente',
    estado: jeringa?.estado || 'activo',
  });

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    await onSubmit({
      tipo: formData.tipo,
      capacidad: formData.capacidad,
      color: formData.color,
      ...(jeringa ? { estado: formData.estado as 'activo' | 'inactivo' } : {}),
    });
  }, [formData, jeringa, onSubmit]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={jeringa ? 'Editar jeringa' : 'Nueva jeringa'}
      subtitle={jeringa ? 'Ajusta relaciones y atributos visibles del catálogo.' : 'Registra una nueva jeringa en el inventario maestro.'}
      icon={Syringe}
      size="md"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={jeringa ? 'Guardar cambios' : 'Crear jeringa'}
          isLoading={isLoading}
        />
      }
    >
      <div className="space-y-4">
        <FormSection title="Producto" description="El usuario debe identificarla en una sola mirada.">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput
              id="jeringa-tipo"
              label="Tipo"
              value={formData.tipo}
              onChange={(value) => handleFieldChange('tipo', value)}
              options={TIPO_OPTIONS}
              required
            />
            <SelectInput
              id="jeringa-capacidad"
              label="Capacidad"
              value={formData.capacidad}
              onChange={(value) => handleFieldChange('capacidad', value)}
              options={CAPACIDAD_OPTIONS}
              required
            />
            <SelectInput
              id="jeringa-color"
              label="Color"
              value={formData.color}
              onChange={(value) => handleFieldChange('color', value)}
              options={COLOR_OPTIONS}
              required
            />
            {jeringa ? (
              <SelectInput
                id="jeringa-estado"
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
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
            Se mostrará como <span className="font-medium text-zinc-900">{formData.tipo}</span> ·{' '}
            <span className="font-medium text-zinc-900">{formData.capacidad}</span> ·{' '}
            <span className="font-medium text-zinc-900">{formData.color}</span>.
          </div>
        </FormSection>
      </div>
    </Modal>
  );
};

const getStockInfo = (jeringa: Jeringa) => {
  const lotes = jeringa.lotes || [];
  return {
    stockTotal: lotes.reduce((total, lote) => total + lote.cantidadActual, 0),
    lotesActivos: lotes.filter((lote) => lote.estado === 'disponible').length,
    lotesAgotados: lotes.filter((lote) => lote.estado === 'agotado').length,
  };
};

const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    transparente: 'bg-white',
    azul: 'bg-blue-500',
    verde: 'bg-green-500',
    rojo: 'bg-red-500',
    amarillo: 'bg-yellow-400',
    naranja: 'bg-orange-500',
    morado: 'bg-purple-500',
  };

  return colorMap[color.toLowerCase()] || 'bg-zinc-400';
};

export default memo(GestionJeringas);
