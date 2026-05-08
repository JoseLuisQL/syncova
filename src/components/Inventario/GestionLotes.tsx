import React, { memo, useCallback, useMemo, useState } from 'react';
import { Archive, Syringe } from '@phosphor-icons/react';
import { Jeringa, Lote, LoteJeringa, LoteJeringaStats, LoteVacunaStats, Vacuna } from '../../types';
import {
  ActionButtons,
  EmptyState,
  ExpiryBadge,
  StatusBadge,
  StockProgress,
} from './components/SharedComponents';
import { DataTable, FilterBar, TableHeader } from './components/FilterAndTable';
import {
  DateInput,
  DeleteConfirmModal,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextArea,
  TextInput,
} from '../ui/ModalElements';
import { COMPONENT_STYLES, FILTER_OPTIONS } from './constants';

interface GestionLotesProps {
  lotes: (Lote | LoteJeringa)[];
  onUpdate: (lote: Lote | LoteJeringa) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  tipo: 'vacuna' | 'jeringa';
  toolbarActions?: React.ReactNode;
  isLoading?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  stats?: LoteVacunaStats | LoteJeringaStats | null;
  isLoadingStats?: boolean;
  vacunas?: Vacuna[];
  jeringas?: Jeringa[];
}

const GestionLotes: React.FC<GestionLotesProps> = ({
  lotes,
  onUpdate,
  onDelete,
  tipo,
  toolbarActions,
  isLoading = false,
  isUpdating = false,
  isDeleting = false,
  stats: _externalStats,
  isLoadingStats: _isLoadingStats = false,
  vacunas = [],
  jeringas = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterVencimiento, setFilterVencimiento] = useState('todos');
  const [filterProducto, setFilterProducto] = useState('todos');
  const [editingLote, setEditingLote] = useState<Lote | LoteJeringa | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lote | LoteJeringa | null>(null);

  const filteredLotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return lotes.filter((lote) => {
      const matchesSearch =
        !normalizedSearch ||
        lote.numero.toLowerCase().includes(normalizedSearch) ||
        lote.numeroComprobante.toLowerCase().includes(normalizedSearch) ||
        getProductName(lote).toLowerCase().includes(normalizedSearch);

      const matchesEstado = filterEstado === 'todos' || lote.estado === filterEstado;

      let matchesProducto = true;
      if (filterProducto !== 'todos') {
        matchesProducto =
          tipo === 'vacuna' && 'vacunaId' in lote ? lote.vacunaId === filterProducto : 'jeringaId' in lote && lote.jeringaId === filterProducto;
      }

      let matchesVencimiento = true;
      if (tipo === 'vacuna' && filterVencimiento !== 'todos' && 'fechaVencimiento' in lote && lote.fechaVencimiento) {
        const days = Math.ceil((lote.fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        matchesVencimiento =
          filterVencimiento === 'vencido'
            ? days <= 0
            : filterVencimiento === 'por_vencer'
            ? days > 0 && days <= 30
            : days > 30;
      }

      return matchesSearch && matchesEstado && matchesProducto && matchesVencimiento;
    });
  }, [filterEstado, filterProducto, filterVencimiento, lotes, searchTerm, tipo]);



  const filters = useMemo(() => {
    const filterList = [
      {
        id: `${tipo}-estado`,
        label: 'Estado',
        value: filterEstado,
        options: [...FILTER_OPTIONS.estadoLote],
        onChange: setFilterEstado,
      },
      {
        id: `${tipo}-producto`,
        label: tipo === 'vacuna' ? 'Vacuna' : 'Jeringa',
        value: filterProducto,
        options:
          tipo === 'vacuna'
            ? [{ value: 'todos', label: 'Todas las vacunas' }, ...vacunas.map((item) => ({ value: item.id, label: item.nombre }))]
            : [{ value: 'todos', label: 'Todas las jeringas' }, ...jeringas.map((item) => ({ value: item.id, label: `${item.tipo} ${item.capacidad}` }))],
        onChange: setFilterProducto,
      },
    ];

    if (tipo === 'vacuna') {
      filterList.push({
        id: `${tipo}-vencimiento`,
        label: 'Vencimiento',
        value: filterVencimiento,
        options: [...FILTER_OPTIONS.vencimiento],
        onChange: setFilterVencimiento,
      });
    }

    return filterList;
  }, [filterEstado, filterProducto, filterVencimiento, jeringas, tipo, vacunas]);

  const columns = useMemo(() => {
    const baseColumns = [
      { key: 'lote', label: 'Lote' },
      { key: 'producto', label: 'Producto' },
      { key: 'stock', label: 'Stock', align: 'center' as const },
    ];

    if (tipo === 'vacuna') {
      baseColumns.push({ key: 'vencimiento', label: 'Vencimiento', align: 'center' as const });
    }

    return [
      ...baseColumns,
      { key: 'comprobante', label: 'Comprobante' },
      { key: 'estado', label: 'Estado', align: 'center' as const },
      { key: 'acciones', label: 'Acciones', align: 'right' as const },
    ];
  }, [tipo]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterEstado('todos');
    setFilterProducto('todos');
    setFilterVencimiento('todos');
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await onDelete(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, onDelete]);

  return (
    <div className="space-y-4">
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por lote, comprobante o producto"
        filters={filters}
        onClear={handleClearFilters}
        actions={toolbarActions}
      />

      <div className="hidden lg:block">
        <DataTable
          isLoading={isLoading}
          loadingMessage={`Cargando lotes de ${tipo === 'vacuna' ? 'vacunas' : 'jeringas'}...`}
          skeletonRows={5}
          skeletonColumns={columns.length}
          loadingVariant="table"
        >
          <table className="min-w-full">
            <TableHeader columns={columns} />
            <tbody className="bg-white">
              {filteredLotes.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      icon={tipo === 'vacuna' ? Archive : Syringe}
                      title="No se encontraron lotes"
                      description={
                        searchTerm || filterEstado !== 'todos' || filterProducto !== 'todos' || filterVencimiento !== 'todos'
                          ? 'Pruebe limpiando filtros o revise el criterio de búsqueda.'
                          : `Todavía no hay lotes de ${tipo === 'vacuna' ? 'vacunas' : 'jeringas'} registrados.`
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredLotes.map((lote) => {
                  const daysToExpire = getDaysToExpire('fechaVencimiento' in lote ? lote.fechaVencimiento : undefined);
                  return (
                    <tr key={lote.id} className={COMPONENT_STYLES.table.row}>
                      <td className={COMPONENT_STYLES.table.cell}>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-900">{lote.numero}</p>
                          <p className="text-xs text-slate-500">Ingreso {lote.fechaIngreso.toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className={COMPONENT_STYLES.table.cell}>
                        <p className="text-sm font-medium text-slate-900">{getProductName(lote)}</p>
                        <p className="text-xs text-slate-500">{formatFormaIngreso(lote.formaIngreso)}</p>
                      </td>
                      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                        <StockProgress current={lote.cantidadActual} initial={lote.cantidadInicial} />
                      </td>
                      {tipo === 'vacuna' ? (
                        <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                          {'fechaVencimiento' in lote && lote.fechaVencimiento ? (
                            <div className="space-y-1.5">
                              <p className="text-sm font-medium text-slate-900">{lote.fechaVencimiento.toLocaleDateString()}</p>
                              <ExpiryBadge daysToExpire={daysToExpire} />
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">Sin fecha</span>
                          )}
                        </td>
                      ) : null}
                      <td className={COMPONENT_STYLES.table.cell}>
                        <p className="text-sm font-medium text-slate-900">{lote.comprobanteClase}</p>
                        <p className="text-xs text-slate-500">{lote.numeroComprobante}</p>
                      </td>
                      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
                        <StatusBadge status={lote.estado} />
                      </td>
                      <td className={COMPONENT_STYLES.table.cell}>
                        <ActionButtons
                          onEdit={() => setEditingLote(lote)}
                          onDelete={() => setDeleteTarget(lote)}
                          isLoading={isUpdating || isDeleting}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </DataTable>
      </div>

      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          <DataTable
            isLoading={isLoading}
            loadingMessage={`Cargando lotes de ${tipo === 'vacuna' ? 'vacunas' : 'jeringas'}...`}
            skeletonRows={4}
            loadingVariant="cards"
          ><></></DataTable>
        ) : filteredLotes.length === 0 ? (
          <div className={COMPONENT_STYLES.panel}>
            <EmptyState
              icon={tipo === 'vacuna' ? Archive : Syringe}
              title="No se encontraron lotes"
              description="Pruebe limpiando filtros o registre un nuevo lote."
            />
          </div>
        ) : (
          filteredLotes.map((lote) => {
            const daysToExpire = getDaysToExpire('fechaVencimiento' in lote ? lote.fechaVencimiento : undefined);
            return (
              <article key={lote.id} className={`${COMPONENT_STYLES.panel} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-950">{lote.numero}</p>
                    <p className="mt-1 text-sm text-slate-500">{getProductName(lote)}</p>
                  </div>
                  <StatusBadge status={lote.estado} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5 text-sm">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Ingreso</p>
                    <p className="mt-2 font-medium text-slate-900">{lote.fechaIngreso.toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Comprobante</p>
                    <p className="mt-2 font-medium text-slate-900">{lote.numeroComprobante}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <StockProgress current={lote.cantidadActual} initial={lote.cantidadInicial} showPercentage={false} />
                </div>
                {tipo === 'vacuna' ? (
                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Vencimiento</p>
                      <p className="mt-2 font-medium text-slate-900">
                        {'fechaVencimiento' in lote && lote.fechaVencimiento ? lote.fechaVencimiento.toLocaleDateString() : 'Sin fecha'}
                      </p>
                    </div>
                    <ExpiryBadge daysToExpire={daysToExpire} />
                  </div>
                ) : null}
                <div className="mt-3 flex items-center justify-end">
                  <ActionButtons
                    onEdit={() => setEditingLote(lote)}
                    onDelete={() => setDeleteTarget(lote)}
                    isLoading={isUpdating || isDeleting}
                  />
                </div>
              </article>
            );
          })
        )}
      </div>

      {editingLote ? (
        <LoteModal
          lote={editingLote}
          tipo={tipo}
          onClose={() => setEditingLote(null)}
          onSubmit={async (payload) => {
            await onUpdate({ ...editingLote, ...payload } as Lote | LoteJeringa);
            setEditingLote(null);
          }}
          isLoading={isUpdating}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.numero || ''}
        itemType="lote"
        isLoading={isDeleting}
      />
    </div>
  );
};

interface LoteModalProps {
  lote: Lote | LoteJeringa;
  tipo: 'vacuna' | 'jeringa';
  onClose: () => void;
  onSubmit: (payload: Partial<Lote | LoteJeringa>) => Promise<void> | void;
  isLoading?: boolean;
}

const mapFormaIngresoToFrontend = (formaIngreso: string): string => {
  const mapping: Record<string, string> = {
    PRIMER_TRIMESTRE: '1° TRIMESTRE',
    SEGUNDO_TRIMESTRE: '2° TRIMESTRE',
    TERCER_TRIMESTRE: '3° TRIMESTRE',
    CUARTO_TRIMESTRE: '4° TRIMESTRE',
  };

  return mapping[formaIngreso] || formaIngreso;
};

const LoteModal: React.FC<LoteModalProps> = ({ lote, tipo, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    numero: lote.numero,
    fechaIngreso: lote.fechaIngreso.toISOString().split('T')[0],
    fechaVencimiento: 'fechaVencimiento' in lote && lote.fechaVencimiento ? lote.fechaVencimiento.toISOString().split('T')[0] : '',
    formaIngreso: mapFormaIngresoToFrontend(lote.formaIngreso),
    comprobanteClase: lote.comprobanteClase,
    numeroComprobante: lote.numeroComprobante,
    cantidadInicial: String(lote.cantidadInicial),
    cantidadActual: String(lote.cantidadActual),
    estado: lote.estado,
    observaciones: lote.observaciones || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewStatus = useMemo(() => {
    const cantidadActual = Number(formData.cantidadActual);
    const fecha = formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined;
    return determinePreviewStatus(tipo, cantidadActual, fecha);
  }, [formData.cantidadActual, formData.fechaVencimiento, tipo]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const nextErrors: Record<string, string> = {};
    const cantidadInicial = Number(formData.cantidadInicial);
    const cantidadActual = Number(formData.cantidadActual);

    if (!formData.numero.trim()) nextErrors.numero = 'Ingrese un número de lote.';
    if (!formData.numeroComprobante.trim()) nextErrors.numeroComprobante = 'Ingrese un número de comprobante.';
    if (!Number.isFinite(cantidadInicial) || cantidadInicial <= 0) nextErrors.cantidadInicial = 'La cantidad inicial debe ser mayor a 0.';
    if (!Number.isFinite(cantidadActual) || cantidadActual < 0) nextErrors.cantidadActual = 'La cantidad actual no puede ser negativa.';
    if (tipo === 'vacuna' && !formData.fechaVencimiento) nextErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria para vacunas.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit({
      numero: formData.numero.trim(),
      fechaIngreso: new Date(formData.fechaIngreso),
      fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined,
      formaIngreso: formData.formaIngreso as Lote['formaIngreso'],
      comprobanteClase: formData.comprobanteClase as Lote['comprobanteClase'],
      numeroComprobante: formData.numeroComprobante.trim(),
      cantidadInicial,
      cantidadActual,
      estado: previewStatus,
      observaciones: formData.observaciones.trim() || undefined,
    });
  }, [formData, onSubmit, previewStatus, tipo]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Editar lote de ${tipo === 'vacuna' ? 'vacuna' : 'jeringa'}`}
      subtitle="Ajusta identificación, fechas, documento y stock antes de guardar."
      icon={tipo === 'vacuna' ? Archive : Syringe}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel="Guardar cambios"
          isLoading={isLoading}
        />
      }
    >
      <div className="space-y-4">
        <FormSection title="Identificación" description="Datos visibles en la lista principal del inventario.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="lote-numero"
              label="Número de lote"
              value={formData.numero}
              onChange={(value) => handleFieldChange('numero', value)}
              required
              error={errors.numero}
            />
            <SelectInput
              id="lote-estado-previo"
              label="Estado calculado"
              value={previewStatus}
              onChange={() => undefined}
              options={[
                { value: 'disponible', label: 'Disponible' },
                { value: 'agotado', label: 'Agotado' },
                ...(tipo === 'vacuna' ? [{ value: 'vencido', label: 'Vencido' }] : []),
              ]}
              disabled
            />
          </div>
        </FormSection>

        <FormSection title="Fechas y documento" description="Información operativa para trazabilidad del lote.">
          <div className="grid gap-4 md:grid-cols-2">
            <DateInput
              id="lote-fecha-ingreso"
              label="Fecha de ingreso"
              value={formData.fechaIngreso}
              onChange={(value) => handleFieldChange('fechaIngreso', value)}
              required
            />
            {tipo === 'vacuna' ? (
              <DateInput
                id="lote-fecha-vencimiento"
                label="Fecha de vencimiento"
                value={formData.fechaVencimiento}
                onChange={(value) => handleFieldChange('fechaVencimiento', value)}
                required
                error={errors.fechaVencimiento}
              />
            ) : (
              <DateInput
                id="lote-fecha-vencimiento"
                label="Fecha de vencimiento"
                value={formData.fechaVencimiento}
                onChange={(value) => handleFieldChange('fechaVencimiento', value)}
              />
            )}
            <SelectInput
              id="lote-forma-ingreso"
              label="Forma de ingreso"
              value={formData.formaIngreso}
              onChange={(value) => handleFieldChange('formaIngreso', value)}
              options={FILTER_OPTIONS.formaIngreso}
              required
            />
            <SelectInput
              id="lote-comprobante-clase"
              label="Tipo de comprobante"
              value={formData.comprobanteClase}
              onChange={(value) => handleFieldChange('comprobanteClase', value)}
              options={FILTER_OPTIONS.comprobanteClase}
              required
            />
            <TextInput
              id="lote-comprobante-numero"
              label="Número de comprobante"
              value={formData.numeroComprobante}
              onChange={(value) => handleFieldChange('numeroComprobante', value)}
              required
              error={errors.numeroComprobante}
            />
          </div>
        </FormSection>

        <FormSection title="Stock" description="Asegura coherencia entre el stock físico y el stock registrado.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="lote-cantidad-inicial"
              label="Cantidad inicial"
              type="number"
              value={formData.cantidadInicial}
              onChange={(value) => handleFieldChange('cantidadInicial', value)}
              required
              error={errors.cantidadInicial}
              min={1}
            />
            <TextInput
              id="lote-cantidad-actual"
              label="Cantidad actual"
              type="number"
              value={formData.cantidadActual}
              onChange={(value) => handleFieldChange('cantidadActual', value)}
              required
              error={errors.cantidadActual}
              min={0}
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Estado calculado para guardar: <span className="font-semibold text-slate-900">{previewStatus}</span>.
          </div>
        </FormSection>

        <FormSection title="Observaciones" description="Solo registra información útil para soporte o auditoría.">
          <TextArea
            id="lote-observaciones"
            label="Observaciones"
            value={formData.observaciones}
            onChange={(value) => handleFieldChange('observaciones', value)}
            rows={3}
            placeholder="Detalle opcional"
          />
        </FormSection>
      </div>
    </Modal>
  );
};

const formatFormaIngreso = (value: string) => value.replace('°', '° ').replace(/\s+/g, ' ').trim();

const getProductName = (lote: Lote | LoteJeringa) => {
  if ('vacuna' in lote && lote.vacuna) {
    return `${lote.vacuna.nombre} · ${lote.vacuna.presentacion}`;
  }
  if ('jeringa' in lote && lote.jeringa) {
    return `${lote.jeringa.tipo} ${lote.jeringa.capacidad} · ${lote.jeringa.color}`;
  }
  return 'Producto sin referencia';
};

const getDaysToExpire = (fechaVencimiento?: Date) => {
  if (!fechaVencimiento) return null;
  return Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const determinePreviewStatus = (
  tipo: 'vacuna' | 'jeringa',
  cantidadActual: number,
  fechaVencimiento?: Date,
): 'disponible' | 'agotado' | 'vencido' => {
  if (cantidadActual <= 0) return 'agotado';
  if (tipo === 'vacuna' && fechaVencimiento && fechaVencimiento.getTime() < Date.now()) return 'vencido';
  return 'disponible';
};

export default memo(GestionLotes);
