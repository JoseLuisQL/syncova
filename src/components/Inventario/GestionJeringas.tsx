import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  CalendarBlank,
  Drop,
  Package,
  PencilSimple,
  Plus,
  Syringe,
} from '@phosphor-icons/react';
import { CreateJeringaDto, Jeringa, UpdateJeringaDto } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useInventorySearch } from '../../hooks/useInventorySearch';
import { useJeringas } from '../../hooks/useJeringas';
import {
  ActionButtons,
  EmptyState,
  ErrorAlert,
  StatusBadge,
} from './components/SharedComponents';
import { DataTable, FilterBar, Pagination, TableCell, TableHeader, TableRow } from './components/FilterAndTable';
import {
  DeleteConfirmModal,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextInput,
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
        const result = await updateJeringa(editingJeringa.id, payload as UpdateJeringaDto);
        if (!result.success) {
          toast.error('No se pudo actualizar la jeringa', result.error || 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Jeringa actualizada', 'Los cambios se guardaron correctamente.');
      } else {
        const result = await createJeringa(payload as CreateJeringaDto);
        if (!result.success) {
          toast.error('No se pudo crear la jeringa', result.error || 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Jeringa creada', 'La jeringa fue registrada correctamente.');
      }

      setShowModal(false);
      setEditingJeringa(null);
    },
    [createJeringa, editingJeringa, toast, updateJeringa],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    const result = await deleteJeringa(deleteTarget.id);
    if (!result.success) {
      toast.error('No se pudo eliminar la jeringa', result.error || 'Intente nuevamente.');
      return;
    }

    toast.success('Jeringa eliminada', `${deleteTarget.tipo} ${deleteTarget.capacidad} fue eliminada.`);
    setDeleteTarget(null);
    if (selectedJeringa?.id === deleteTarget.id) {
      setSelectedJeringa(null);
    }
  }, [deleteJeringa, deleteTarget, selectedJeringa?.id, toast]);

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

      <JeringaDetailModal
        jeringa={selectedJeringa}
        onClose={() => setSelectedJeringa(null)}
        onEdit={(j) => {
          setSelectedJeringa(null);
          handleEdit(j);
        }}
      />

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

interface JeringaDetailModalProps {
  jeringa: Jeringa | null;
  onClose: () => void;
  onEdit: (jeringa: Jeringa) => void;
}

const JeringaDetailModal: React.FC<JeringaDetailModalProps> = memo(({ jeringa, onClose, onEdit }) => {
  if (!jeringa) return null;

  const stockInfo = getStockInfo(jeringa);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Detalle de jeringa"
      subtitle="Especificaciones técnicas y existencias en inventario"
      icon={Syringe}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className={COMPONENT_STYLES.button.ghost}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(jeringa);
            }}
            className={COMPONENT_STYLES.button.primary}
          >
            <PencilSimple className="h-4 w-4" weight="bold" />
            <span>Editar jeringa</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Identidad del Insumo */}
        <div className="rounded-xl border border-line bg-surface-soft/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-2">
                Insumo / Jeringa descartable
              </span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-ink">
                {jeringa.tipo}
              </h3>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-xs">
                  <Drop className="h-3.5 w-3.5 text-teal-600" weight="duotone" />
                  <span>Capacidad: {jeringa.capacidad}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-xs">
                  <span className={`h-2.5 w-2.5 rounded-full border border-zinc-300 ${getColorClass(jeringa.color)}`} />
                  <span>Color: {jeringa.color}</span>
                </span>
              </div>
            </div>
            <div className="self-start sm:self-auto shrink-0">
              <StatusBadge status={jeringa.estado} />
            </div>
          </div>
        </div>

        {/* Métricas Clínicas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-muted">
              <p className="text-[0.7rem] font-bold uppercase tracking-wider">Stock Total</p>
              <Package className="h-4 w-4 text-muted-2" weight="duotone" />
            </div>
            <p className={`mt-1.5 text-2xl font-bold tracking-tight ${stockInfo.stockTotal > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {stockInfo.stockTotal.toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs text-muted-2">
              {stockInfo.stockTotal > 0 ? 'Unidades en existencia' : 'Sin stock disponible'}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-muted">
              <p className="text-[0.7rem] font-bold uppercase tracking-wider">Lotes Registrados</p>
              <Archive className="h-4 w-4 text-muted-2" weight="duotone" />
            </div>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-ink">
              {jeringa._count?.lotes || jeringa.lotes?.length || 0}
            </p>
            <p className="mt-0.5 text-xs text-muted-2">
              {stockInfo.lotesActivos} disponibles · {stockInfo.lotesAgotados} agotados
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-muted">
              <p className="text-[0.7rem] font-bold uppercase tracking-wider">Fecha de Creación</p>
              <CalendarBlank className="h-4 w-4 text-muted-2" weight="duotone" />
            </div>
            <p className="mt-1.5 text-base font-bold tracking-tight text-ink">
              {formatDate(jeringa.createdAt)}
            </p>
            <p className="mt-0.5 text-xs text-muted-2">
              Catálogo SIVAC
            </p>
          </div>
        </div>

        {/* Lotes Asociados */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-2">
              Lotes Asociados ({jeringa.lotes?.length || 0})
            </h4>
          </div>

          {jeringa.lotes && jeringa.lotes.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-xs">
              <div className="max-h-56 overflow-y-auto">
                <table className="min-w-full divide-y divide-line text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-surface-soft text-[0.68rem] font-semibold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-3.5 py-2.5">N° Lote</th>
                      <th className="px-3.5 py-2.5 text-right">Cantidad actual</th>
                      <th className="px-3.5 py-2.5">Vencimiento</th>
                      <th className="px-3.5 py-2.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft bg-white text-ink">
                    {jeringa.lotes.map((lote) => (
                      <tr key={lote.id} className="transition-colors hover:bg-surface-soft/50">
                        <td className="px-3.5 py-2.5 font-mono font-medium text-ink">
                          {lote.numero}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-semibold text-zinc-900">
                          {lote.cantidadActual.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-muted-2">
                          {formatDate(lote.fechaVencimiento)}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider ${
                              lote.estado === 'disponible'
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border border-zinc-200 bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {lote.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-surface-soft/40 p-4 text-center">
              <p className="text-xs text-muted">No se registran lotes físicos asociados actualmente a este insumo.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
});

JeringaDetailModal.displayName = 'JeringaDetailModal';

interface JeringaModalProps {
  jeringa: Jeringa | null;
  onClose: () => void;
  onSubmit: (payload: CreateJeringaDto | UpdateJeringaDto) => Promise<void>;
  isLoading?: boolean;
}

const JeringaModal: React.FC<JeringaModalProps> = ({ jeringa, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    tipo: jeringa?.tipo || '',
    capacidad: jeringa?.capacidad || '',
    color: jeringa?.color || '',
    estado: jeringa?.estado || 'activo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const nextErrors: Record<string, string> = {};

    const tipo = formData.tipo.trim();
    const capacidad = formData.capacidad.trim();
    const color = formData.color.trim();

    if (!tipo) {
      nextErrors.tipo = 'Ingrese el tipo de jeringa.';
    }
    if (!capacidad) {
      nextErrors.capacidad = 'Ingrese la capacidad (ej: 0.5 ml, 1 ml).';
    }
    if (!color) {
      nextErrors.color = 'Ingrese el color identificador.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit({
      tipo,
      capacidad,
      color,
      ...(jeringa ? { estado: formData.estado as 'activo' | 'inactivo' } : {}),
    });
  }, [formData, jeringa, onSubmit]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={jeringa ? 'Editar jeringa' : 'Nueva jeringa'}
      subtitle={
        jeringa
          ? 'Actualiza los atributos del insumo en el inventario.'
          : 'Registra un nuevo tipo o medida de jeringa en el inventario.'
      }
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
        <FormSection
          title="Identificación del Insumo"
          description="Ingresa los datos para identificar y registrar la jeringa."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <TextInput
                id="jeringa-tipo"
                label="Tipo de jeringa"
                value={formData.tipo}
                onChange={(value) => handleFieldChange('tipo', value)}
                placeholder="Ej: Auto-destructible (AD), Desechable, De seguridad..."
                required
                error={errors.tipo}
                maxLength={100}
              />
            </div>

            <TextInput
              id="jeringa-capacidad"
              label="Capacidad"
              value={formData.capacidad}
              onChange={(value) => handleFieldChange('capacidad', value)}
              placeholder="Ej: 0.5 ml, 1 ml, 0.3 ml, 5 ml"
              required
              error={errors.capacidad}
              maxLength={20}
            />

            <TextInput
              id="jeringa-color"
              label="Color"
              value={formData.color}
              onChange={(value) => handleFieldChange('color', value)}
              placeholder="Ej: Transparente, Azul, Verde, Naranja"
              required
              error={errors.color}
              maxLength={50}
            />

            {jeringa ? (
              <div className="md:col-span-2">
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
              </div>
            ) : null}
          </div>
        </FormSection>
      </div>
    </Modal>
  );
};

const formatDate = (dateValue?: Date | string | null) => {
  if (!dateValue) return 'No registrada';
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return 'No registrada';
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStockInfo = (jeringa: Jeringa) => {
  const lotes = jeringa.lotes || [];
  return {
    stockTotal: lotes.reduce((total, lote) => total + lote.cantidadActual, 0),
    lotesActivos: lotes.filter((lote) => lote.estado === 'disponible').length,
    lotesAgotados: lotes.filter((lote) => lote.estado === 'agotado').length,
  };
};

const getColorClass = (color?: string) => {
  if (!color) return 'bg-zinc-300';
  const colorMap: Record<string, string> = {
    transparente: 'bg-white',
    azul: 'bg-blue-500',
    verde: 'bg-green-500',
    rojo: 'bg-red-500',
    amarillo: 'bg-yellow-400',
    naranja: 'bg-orange-500',
    morado: 'bg-purple-500',
    gris: 'bg-zinc-400',
    blanco: 'bg-white',
    negro: 'bg-zinc-900',
    rosa: 'bg-pink-400',
    rosado: 'bg-pink-400',
    celeste: 'bg-sky-400',
  };

  return colorMap[color.toLowerCase().trim()] || 'bg-zinc-400';
};

export default memo(GestionJeringas);
