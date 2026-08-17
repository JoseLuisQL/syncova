import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  Package,
  PencilSimple,
  Plus,
  ThermometerCold,
} from '@phosphor-icons/react';
import { CreateVacunaDto, UpdateVacunaDto, Vacuna } from '../../types';
import { useToastContext } from '../../contexts/ToastContext';
import { useVacunas } from '../../hooks/useVacunas';
import { useInventorySearch } from '../../hooks/useInventorySearch';
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
  { key: 'vacuna', label: 'Vacuna' },
  { key: 'detalle', label: 'Detalle' },
  { key: 'stock', label: 'Stock', align: 'center' as const },
  { key: 'lotes', label: 'Lotes', align: 'center' as const },
  { key: 'estado', label: 'Estado', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const PRESENTACION_OPTIONS = [
  { value: 'Frasco multidosis', label: 'Frasco multidosis' },
  { value: 'Frasco unidosis', label: 'Frasco unidosis' },
  { value: 'Ampolla', label: 'Ampolla' },
  { value: 'Jeringa prellenada', label: 'Jeringa prellenada' },
];

const VIDA_UTIL_OPTIONS = [
  { value: '365', label: '1 año' },
  { value: '730', label: '2 años' },
  { value: '1095', label: '3 años' },
  { value: '1460', label: '4 años' },
  { value: '1825', label: '5 años' },
];

const TEMPERATURA_OPTIONS = [
  { value: '2°C a 8°C', label: '2°C a 8°C (Refrigeración)' },
  { value: '-15°C a -25°C', label: '-15°C a -25°C (Congelación)' },
  { value: '15°C a 25°C', label: '15°C a 25°C (Ambiente)' },
];

const GestionVacunas: React.FC = () => {
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingVacuna, setEditingVacuna] = useState<Vacuna | null>(null);
  const [selectedVacuna, setSelectedVacuna] = useState<Vacuna | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vacuna | null>(null);

  const {
    vacunas,
    pagination,
    isLoading,
    error,
    createVacuna,
    updateVacuna,
    deleteVacuna,
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
  } = useVacunas();

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
    toast.error('Error al cargar vacunas', error);
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
        id: 'estado-vacuna',
        label: 'Estado',
        value: filterEstado,
        options: [...FILTER_OPTIONS.estado],
        onChange: setFilterEstado,
      },
    ],
    [filterEstado],
  );

  const handleCreate = useCallback(() => {
    setEditingVacuna(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((vacuna: Vacuna) => {
    setEditingVacuna(vacuna);
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(
    async (payload: CreateVacunaDto | UpdateVacunaDto) => {
      if (editingVacuna) {
        const success = await updateVacuna(editingVacuna.id, payload as UpdateVacunaDto);
        if (!success) {
          toast.error('No se pudo actualizar la vacuna', updateError || 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Vacuna actualizada', 'Los cambios se guardaron correctamente.');
      } else {
        const success = await createVacuna(payload as CreateVacunaDto);
        if (!success) {
          toast.error('No se pudo crear la vacuna', createError || 'Revise los datos e intente nuevamente.');
          return;
        }

        toast.success('Vacuna creada', 'La vacuna fue registrada correctamente.');
      }

      setShowModal(false);
      setEditingVacuna(null);
    },
    [createError, createVacuna, editingVacuna, toast, updateError, updateVacuna],
  );

  const handleDelete = useCallback(
    async () => {
      if (!deleteTarget) return;

      const success = await deleteVacuna(deleteTarget.id);
      if (!success) {
        toast.error('No se pudo eliminar la vacuna', deleteError || 'Intente nuevamente.');
        return;
      }

      toast.success('Vacuna eliminada', `"${deleteTarget.nombre}" fue eliminada.`);
      setDeleteTarget(null);
      if (selectedVacuna?.id === deleteTarget.id) {
        setSelectedVacuna(null);
      }
    },
    [deleteError, deleteTarget, deleteVacuna, selectedVacuna?.id, toast],
  );

  const handleClearFilters = useCallback(() => {
    clearSearch();
    setFilterEstado('todos');
  }, [clearSearch]);

  const desktopTable = (
    <DataTable
      isLoading={isLoading}
      loadingMessage="Cargando vacunas..."
      skeletonRows={5}
      skeletonColumns={TABLE_COLUMNS.length}
      loadingVariant="table"
    >
      <table className="min-w-full border-separate border-spacing-0">
        <TableHeader columns={TABLE_COLUMNS} />
        <tbody className="bg-white">
          {vacunas.length === 0 ? (
            <tr>
              <td colSpan={TABLE_COLUMNS.length + 1}>
                <EmptyState
                  icon={Package}
                  title="No se encontraron vacunas"
                  description="Ajuste los filtros o registre una nueva vacuna."
                  action={{ label: 'Nueva vacuna', onClick: handleCreate }}
                />
              </td>
            </tr>
          ) : (
            vacunas.map((vacuna) => {
              const stockInfo = getStockInfo(vacuna);
              return (
                <TableRow key={vacuna.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setSelectedVacuna(vacuna)}
                      className="min-w-0 text-left"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{vacuna.nombre}</p>
                        <p className="text-xs text-muted">{vacuna.dosisPorFrasco} dosis por frasco</p>
                      </div>
                    </button>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-zinc-900">{vacuna.tipo}</p>
                    <p className="text-xs text-zinc-500">{vacuna.presentacion}</p>
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
                      <span className={COMPONENT_STYLES.badge.warning}>
                        {stockInfo.lotesPorVencer} pv
                      </span>
                      <span className={COMPONENT_STYLES.badge.danger}>
                        {stockInfo.lotesVencidos} venc.
                      </span>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={vacuna.estado} />
                  </TableCell>
                  <TableCell align="right">
                    <ActionButtons
                      onView={() => setSelectedVacuna(vacuna)}
                      onEdit={() => handleEdit(vacuna)}
                      onDelete={() => setDeleteTarget(vacuna)}
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
            searchPlaceholder="Buscar por nombre, tipo o presentación"
            filters={filters}
            onClear={handleClearFilters}
            actions={
              <button type="button" className={COMPONENT_STYLES.button.primary} onClick={handleCreate} disabled={isCreating}>
                <Plus className="h-4 w-4" weight="bold" />
                <span>Nueva vacuna</span>
              </button>
            }
          />

          <div className="hidden lg:block">{desktopTable}</div>

          <div className="space-y-3 lg:hidden">
            {isLoading ? (
              <DataTable isLoading={isLoading} loadingMessage="Cargando vacunas..." skeletonRows={4} loadingVariant="cards"><></></DataTable>
            ) : vacunas.length === 0 ? (
              <div className={COMPONENT_STYLES.panel}>
                <EmptyState
                  icon={Package}
                  title="No se encontraron vacunas"
                  description="Ajuste los filtros o registre una nueva vacuna."
                  action={{ label: 'Nueva vacuna', onClick: handleCreate }}
                />
              </div>
            ) : (
              vacunas.map((vacuna) => {
                const stockInfo = getStockInfo(vacuna);
                return (
                  <article key={vacuna.id} className={`${COMPONENT_STYLES.panel} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => setSelectedVacuna(vacuna)} className="min-w-0 text-left">
                        <p className="truncate text-base font-semibold text-zinc-950">{vacuna.nombre}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {vacuna.tipo} · {vacuna.presentacion}
                        </p>
                      </button>
                      <StatusBadge status={vacuna.estado} />
                    </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Stock</p>
                        <p className={`mt-2 text-lg font-semibold ${stockInfo.stockTotal > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {stockInfo.stockTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3">
                        <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">Lotes activos</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-900">{stockInfo.lotesActivos}</p>
                      </div>
                    </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    <p>{stockInfo.lotesPorVencer} por vencer</p>
                    <p>{stockInfo.lotesVencidos} vencidos</p>
                  </div>
                      <ActionButtons
                        onView={() => setSelectedVacuna(vacuna)}
                        onEdit={() => handleEdit(vacuna)}
                        onDelete={() => setDeleteTarget(vacuna)}
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

      <VacunaDetailModal
        vacuna={selectedVacuna}
        onClose={() => setSelectedVacuna(null)}
        onEdit={(v) => {
          setSelectedVacuna(null);
          handleEdit(v);
        }}
      />

      {showModal ? (
        <VacunaModal
          vacuna={editingVacuna}
          onClose={() => {
            setShowModal(false);
            setEditingVacuna(null);
          }}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.nombre || ''}
        itemType="vacuna"
        isLoading={isDeleting}
      />
    </div>
  );
};

interface VacunaDetailModalProps {
  vacuna: Vacuna | null;
  onClose: () => void;
  onEdit: (vacuna: Vacuna) => void;
}

const VacunaDetailModal: React.FC<VacunaDetailModalProps> = memo(({ vacuna, onClose, onEdit }) => {
  if (!vacuna) return null;

  const stockInfo = getStockInfo(vacuna);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Detalle de vacuna"
      subtitle="Especificaciones técnicas y estado de inventario"
      icon={Package}
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
              onEdit(vacuna);
            }}
            className={COMPONENT_STYLES.button.primary}
          >
            <PencilSimple className="h-4 w-4" weight="bold" />
            <span>Editar vacuna</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Identidad del Biológico */}
        <div className="rounded-xl border border-line bg-surface-soft/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-2">
                Biológico / Catálogo oficial
              </span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-ink">
                {vacuna.nombre}
              </h3>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-xs">
                  Tipo: {vacuna.tipo}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-xs">
                  Presentación: {vacuna.presentacion}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-xs">
                  {vacuna.dosisPorFrasco} dosis/frasco
                </span>
              </div>
            </div>
            <div className="self-start sm:self-auto shrink-0">
              <StatusBadge status={vacuna.estado} />
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
              {stockInfo.stockTotal > 0 ? 'Dosis en existencia' : 'Sin stock disponible'}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-muted">
              <p className="text-[0.7rem] font-bold uppercase tracking-wider">Lotes Registrados</p>
              <Archive className="h-4 w-4 text-muted-2" weight="duotone" />
            </div>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-ink">
              {vacuna._count?.lotes || vacuna.lotes?.length || 0}
            </p>
            <p className="mt-0.5 text-xs text-muted-2">
              {stockInfo.lotesActivos} disponibles · {stockInfo.lotesVencidos} vencidos
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-muted">
              <p className="text-[0.7rem] font-bold uppercase tracking-wider">Conservación</p>
              <ThermometerCold className="h-4 w-4 text-muted-2" weight="duotone" />
            </div>
            <p className="mt-1.5 text-base font-bold tracking-tight text-ink">
              {vacuna.temperaturaAlmacenamiento}
            </p>
            <p className="mt-0.5 text-xs text-muted-2">
              Vida útil: {Math.round(vacuna.tiempoVidaUtil / 365)} años
            </p>
          </div>
        </div>

        {/* Lotes Asociados */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-2">
              Lotes Asociados ({vacuna.lotes?.length || 0})
            </h4>
          </div>

          {vacuna.lotes && vacuna.lotes.length > 0 ? (
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
                    {vacuna.lotes.map((lote) => (
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
              <p className="text-xs text-muted">No se registran lotes físicos asociados actualmente a este biológico.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
});

VacunaDetailModal.displayName = 'VacunaDetailModal';

interface VacunaModalProps {
  vacuna: Vacuna | null;
  onClose: () => void;
  onSubmit: (payload: CreateVacunaDto | UpdateVacunaDto) => Promise<void>;
  isLoading?: boolean;
}

const VacunaModal: React.FC<VacunaModalProps> = ({ vacuna, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nombre: vacuna?.nombre || '',
    tipo: vacuna?.tipo || '',
    presentacion: vacuna?.presentacion || 'Frasco multidosis',
    dosisPorFrasco: String(vacuna?.dosisPorFrasco || 1),
    tiempoVidaUtil: String(vacuna?.tiempoVidaUtil || 1095),
    temperaturaAlmacenamiento: vacuna?.temperaturaAlmacenamiento || '2°C a 8°C',
    estado: vacuna?.estado || 'activo',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) nextErrors.nombre = 'Ingrese un nombre breve para reconocer la vacuna.';
    if (!formData.tipo.trim()) nextErrors.tipo = 'Ingrese el tipo o denominación técnica.';

    const dosis = Number(formData.dosisPorFrasco);
    if (!Number.isFinite(dosis) || dosis <= 0) nextErrors.dosisPorFrasco = 'Las dosis por frasco deben ser mayores a 0.';

    const vidaUtil = Number(formData.tiempoVidaUtil);
    if (!Number.isFinite(vidaUtil) || vidaUtil <= 0) nextErrors.tiempoVidaUtil = 'Seleccione un tiempo de vida útil válido.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: CreateVacunaDto | UpdateVacunaDto = {
      nombre: formData.nombre.trim(),
      tipo: formData.tipo.trim(),
      presentacion: formData.presentacion,
      dosisPorFrasco: dosis,
      tiempoVidaUtil: vidaUtil,
      temperaturaAlmacenamiento: formData.temperaturaAlmacenamiento,
      ...(vacuna ? { estado: formData.estado as 'activo' | 'inactivo' } : {}),
    };

    await onSubmit(payload);
  }, [formData, onSubmit, vacuna]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={vacuna ? 'Editar vacuna' : 'Nueva vacuna'}
      subtitle={vacuna ? 'Corrige datos sin perder el contexto del inventario.' : 'Registra una nueva vacuna en el catálogo.'}
      icon={Package}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={vacuna ? 'Guardar cambios' : 'Crear vacuna'}
          isLoading={isLoading}
        />
      }
    >
      <div className="space-y-4">
        <FormSection title="Identificación" description="Datos que el usuario usa para reconocer rápidamente la vacuna.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="vacuna-nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={(value) => handleFieldChange('nombre', value)}
              placeholder="Ej: BCG"
              required
              error={errors.nombre}
            />
            <TextInput
              id="vacuna-tipo"
              label="Tipo"
              value={formData.tipo}
              onChange={(value) => handleFieldChange('tipo', value)}
              placeholder="Ej: Antituberculosa"
              required
              error={errors.tipo}
            />
            <SelectInput
              id="vacuna-presentacion"
              label="Presentación"
              value={formData.presentacion}
              onChange={(value) => handleFieldChange('presentacion', value)}
              options={PRESENTACION_OPTIONS}
              required
            />
            <TextInput
              id="vacuna-dosis"
              label="Dosis por frasco"
              type="number"
              value={formData.dosisPorFrasco}
              onChange={(value) => handleFieldChange('dosisPorFrasco', value)}
              required
              error={errors.dosisPorFrasco}
              min={1}
            />
          </div>
        </FormSection>

        <FormSection title="Conservación" description="Parámetros operativos usados al almacenar y distribuir la vacuna.">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectInput
              id="vacuna-vida-util"
              label="Tiempo de vida útil"
              value={formData.tiempoVidaUtil}
              onChange={(value) => handleFieldChange('tiempoVidaUtil', value)}
              options={VIDA_UTIL_OPTIONS}
              required
              error={errors.tiempoVidaUtil}
            />
            <SelectInput
              id="vacuna-temperatura"
              label="Temperatura"
              value={formData.temperaturaAlmacenamiento}
              onChange={(value) => handleFieldChange('temperaturaAlmacenamiento', value)}
              options={TEMPERATURA_OPTIONS}
              required
            />
            {vacuna ? (
              <SelectInput
                id="vacuna-estado"
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
            <div className="flex items-center gap-2 text-zinc-900">
              <ThermometerCold className="h-4 w-4 text-zinc-600" weight="duotone" />
              <span className="font-medium">{formData.temperaturaAlmacenamiento}</span>
            </div>
            <p className="mt-2">Vida útil configurada: {Math.round(Number(formData.tiempoVidaUtil) / 365)} años.</p>
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

const getStockInfo = (vacuna: Vacuna) => {
  const lotes = vacuna.lotes || [];
  const stockTotal = lotes.reduce((total, lote) => total + lote.cantidadActual, 0);
  const lotesActivos = lotes.filter((lote) => lote.estado === 'disponible').length;
  const lotesVencidos = lotes.filter((lote) => lote.estado === 'vencido').length;
  const lotesPorVencer = lotes.filter((lote) => {
    const days = Math.ceil((lote.fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 30;
  }).length;

  return { stockTotal, lotesActivos, lotesVencidos, lotesPorVencer };
};

export default memo(GestionVacunas);
