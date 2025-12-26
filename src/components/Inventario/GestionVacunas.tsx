import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Plus, Package, RefreshCw } from 'lucide-react';
import { Vacuna, CreateVacunaDto, UpdateVacunaDto } from '../../types';
import { useVacunas } from '../../hooks/useVacunas';
import { useToastContext } from '../../contexts/ToastContext';
import {
  PageHeader,
  StatsGrid,
  StatusBadge,
  EmptyState,
  ErrorAlert,
  ActionButtons,
} from './components/SharedComponents';
import { FilterBar, Pagination, DataTable, TableHeader } from './components/FilterAndTable';
import { Modal, ModalFooter, TextInput, SelectInput, DeleteConfirmModal } from './components/ModalComponents';
import { COMPONENT_STYLES, FILTER_OPTIONS } from './constants';

const TABLE_COLUMNS = [
  { key: 'vacuna', label: 'Vacuna' },
  { key: 'tipo', label: 'Tipo y Presentacion' },
  { key: 'stock', label: 'Stock Total', align: 'center' as const },
  { key: 'lotes', label: 'Lotes', align: 'center' as const },
  { key: 'estado', label: 'Estado', align: 'center' as const },
  { key: 'acciones', label: 'Acciones', align: 'right' as const },
];

const GestionVacunas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVacuna, setEditingVacuna] = useState<Vacuna | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
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
    deleteError
  } = useVacunas();

  const { toast } = useToastContext();

  // Cargar datos iniciales
  const hasLoadedRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [refresh]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (!searchTerm) return;
    const timeoutId = setTimeout(() => {
      search(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Efecto para filtros (solo cuando cambian, no en el primer render)
  const isFirstFilterRender = React.useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    applyFilters({
      estado: filterEstado === 'todos' ? undefined : filterEstado as 'activo' | 'inactivo',
      tipo: filterTipo || undefined
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado, filterTipo]);

  useEffect(() => {
    if (error) {
      toast.error('Error al cargar vacunas', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const stats = useMemo(() => {
    const total = vacunas.length;
    const activas = vacunas.filter(v => v.estado === 'activo').length;
    const conStock = vacunas.filter(v => {
      const stock = v.lotes?.reduce((t, l) => t + l.cantidadActual, 0) || 0;
      return stock > 0;
    }).length;
    const sinStock = vacunas.filter(v => {
      const stock = v.lotes?.reduce((t, l) => t + l.cantidadActual, 0) || 0;
      return stock === 0;
    }).length;

    return [
      { key: 'total', label: 'Total Vacunas', value: total, icon: Package, color: 'primary' as const },
      { key: 'activas', label: 'Activas', value: activas, icon: Package, color: 'success' as const },
      { key: 'conStock', label: 'Con Stock', value: conStock, icon: Package, color: 'secondary' as const },
      { key: 'sinStock', label: 'Sin Stock', value: sinStock, icon: Package, color: 'warning' as const },
    ];
  }, [vacunas]);

  const handleCreate = useCallback(() => {
    setEditingVacuna(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((vacuna: Vacuna) => {
    setEditingVacuna(vacuna);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingVacuna(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const vacuna = vacunas.find(v => v.id === id);
    if (vacuna) {
      setDeleteTarget(vacuna);
    }
  }, [vacunas]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    const success = await deleteVacuna(deleteTarget.id);
    if (success) {
      toast.success('Vacuna eliminada', `"${deleteTarget.nombre}" fue eliminada exitosamente.`);
      setDeleteTarget(null);
    } else if (deleteError) {
      toast.error('Error al eliminar', deleteError);
    }
  }, [deleteTarget, deleteVacuna, deleteError, toast]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleSubmit = useCallback(async (formData: CreateVacunaDto | UpdateVacunaDto) => {
    if (editingVacuna) {
      const success = await updateVacuna(editingVacuna.id, formData as UpdateVacunaDto);
      if (success) {
        toast.success('Vacuna actualizada', 'Los cambios se guardaron correctamente.');
        handleCloseModal();
      } else if (updateError) {
        toast.error('Error al actualizar', updateError);
      }
    } else {
      const success = await createVacuna(formData as CreateVacunaDto);
      if (success) {
        toast.success('Vacuna creada', 'La vacuna se registro correctamente.');
        handleCloseModal();
      } else if (createError) {
        toast.error('Error al crear', createError);
      }
    }
  }, [editingVacuna, updateVacuna, createVacuna, updateError, createError, toast, handleCloseModal]);

  const handleRefresh = useCallback(async () => {
    await refresh();
    if (!error) {
      toast.info('Datos actualizados', 'La lista de vacunas fue actualizada.');
    }
  }, [refresh, error, toast]);

  const getStockInfo = useCallback((vacuna: Vacuna) => {
    const lotes = vacuna.lotes || [];
    const stockTotal = lotes.reduce((t, l) => t + l.cantidadActual, 0);
    const lotesActivos = lotes.filter(l => l.estado === 'disponible').length;
    const lotesVencidos = lotes.filter(l => l.estado === 'vencido').length;
    const lotesPorVencer = lotes.filter(l => {
      const days = Math.ceil((l.fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 30 && days > 0;
    }).length;
    return { stockTotal, lotesActivos, lotesVencidos, lotesPorVencer };
  }, []);

  const filterConfigs = useMemo(() => [
    { id: 'estado', label: 'Estado', value: filterEstado, options: FILTER_OPTIONS.estado, onChange: setFilterEstado },
  ], [filterEstado]);

  return (
    <div className="p-5 sm:p-6">
      {error && <ErrorAlert message={error} onRetry={refresh} />}

      <PageHeader
        title="Catalogo de Vacunas"
        subtitle="Gestion del catalogo de vacunas del sistema"
        icon={Package}
        count={pagination.total}
        action={{
          label: 'Nueva Vacuna',
          onClick: handleCreate,
          icon: Plus,
          isLoading: isCreating,
        }}
        secondaryAction={{
          label: 'Actualizar',
          onClick: handleRefresh,
          icon: RefreshCw,
          isLoading: isLoading,
        }}
      />

      <StatsGrid stats={stats} isLoading={isLoading} />

      <div className="space-y-5">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre, tipo..."
          filters={filterConfigs}
        />

        <DataTable isLoading={isLoading} loadingMessage="Cargando vacunas...">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader columns={TABLE_COLUMNS} />
            <tbody className="divide-y divide-gray-100">
              {vacunas.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Package}
                      title="No se encontraron vacunas"
                      description="Intente ajustar los filtros o cree una nueva"
                      action={{
                        label: 'Nueva Vacuna',
                        onClick: handleCreate,
                      }}
                    />
                  </td>
                </tr>
              ) : (
                vacunas.map((vacuna) => (
                  <VacunaRow
                    key={vacuna.id}
                    vacuna={vacuna}
                    stockInfo={getStockInfo(vacuna)}
                    isExpanded={showDetails === vacuna.id}
                    onToggleDetails={() => setShowDetails(showDetails === vacuna.id ? null : vacuna.id)}
                    onEdit={() => handleEdit(vacuna)}
                    onDelete={() => handleDelete(vacuna.id)}
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
        <VacunaModal
          vacuna={editingVacuna}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.nombre || ''}
        itemType="Vacuna"
        isLoading={isDeleting}
      />
    </div>
  );
};

// ============================================================================
// VACUNA ROW COMPONENT
// ============================================================================

interface VacunaRowProps {
  vacuna: Vacuna;
  stockInfo: { stockTotal: number; lotesActivos: number; lotesVencidos: number; lotesPorVencer: number };
  isExpanded: boolean;
  onToggleDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const VacunaRow: React.FC<VacunaRowProps> = memo(({
  vacuna,
  stockInfo,
  isExpanded,
  onToggleDetails,
  onEdit,
  onDelete,
  isLoading = false,
}) => (
  <>
    <tr className={COMPONENT_STYLES.table.row}>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{vacuna.nombre}</p>
            <p className="text-xs text-gray-500">{vacuna.dosisPorFrasco} dosis/frasco</p>
          </div>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <p className="text-sm font-medium text-gray-900">{vacuna.tipo}</p>
        <p className="text-xs text-gray-500">{vacuna.presentacion}</p>
      </td>
      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
        <span className={`text-lg font-bold ${stockInfo.stockTotal > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {stockInfo.stockTotal.toLocaleString()}
        </span>
      </td>
      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-emerald-600 font-semibold">{stockInfo.lotesActivos}</div>
            <div className="text-gray-500">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-amber-600 font-semibold">{stockInfo.lotesPorVencer}</div>
            <div className="text-gray-500">Por vencer</div>
          </div>
          <div className="text-center">
            <div className="text-rose-600 font-semibold">{stockInfo.lotesVencidos}</div>
            <div className="text-gray-500">Vencidos</div>
          </div>
        </div>
      </td>
      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
        <StatusBadge status={vacuna.estado as 'activo' | 'inactivo'} />
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <ActionButtons
          onView={onToggleDetails}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      </td>
    </tr>
    {isExpanded && (
      <tr>
        <td colSpan={6} className="px-5 py-4 bg-teal-50/50 border-l-4 border-teal-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Informacion Tecnica</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Temperatura:</span> <span className="ml-2 text-gray-900 font-medium">{vacuna.temperaturaAlmacenamiento}</span></div>
                <div><span className="text-gray-600">Vida util:</span> <span className="ml-2 text-gray-900 font-medium">{Math.round(vacuna.tiempoVidaUtil / 365)} años</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Datos del Sistema</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Creado:</span> <span className="ml-2 text-gray-900 font-medium">{vacuna.createdAt.toLocaleDateString()}</span></div>
                <div><span className="text-gray-600">ID:</span> <span className="ml-2 text-gray-500 font-mono text-xs">{vacuna.id}</span></div>
              </div>
            </div>
            {vacuna._count && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Estadisticas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Lotes:</span> <span className="text-gray-900 font-medium">{vacuna._count.lotes}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Planificaciones:</span> <span className="text-gray-900 font-medium">{vacuna._count.planificaciones}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Movimientos:</span> <span className="text-gray-900 font-medium">{vacuna._count.movimientos}</span></div>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    )}
  </>
));

VacunaRow.displayName = 'VacunaRow';

// ============================================================================
// VACUNA MODAL COMPONENT
// ============================================================================

interface VacunaModalProps {
  vacuna: Vacuna | null;
  onClose: () => void;
  onSubmit: (data: CreateVacunaDto | UpdateVacunaDto) => Promise<void>;
  isLoading?: boolean;
}

const VacunaModal: React.FC<VacunaModalProps> = ({ vacuna, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nombre: vacuna?.nombre || '',
    tipo: vacuna?.tipo || '',
    presentacion: vacuna?.presentacion || 'Frasco multidosis',
    dosisPorFrasco: vacuna?.dosisPorFrasco || 1,
    tiempoVidaUtil: vacuna?.tiempoVidaUtil || 1095,
    temperaturaAlmacenamiento: vacuna?.temperaturaAlmacenamiento || '2°C a 8°C',
    ...(vacuna && { estado: vacuna.estado }),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.tipo.trim()) newErrors.tipo = 'El tipo es requerido';
    if (!formData.presentacion.trim()) newErrors.presentacion = 'La presentacion es requerida';
    if (!formData.dosisPorFrasco || formData.dosisPorFrasco < 1) newErrors.dosisPorFrasco = 'Las dosis deben ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submitData = { ...formData };
    if (!vacuna) delete (submitData as any).estado;
    await onSubmit(submitData);
  }, [formData, vacuna, validateForm, onSubmit]);

  const handleFieldChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={vacuna ? 'Editar Vacuna' : 'Nueva Vacuna'}
      subtitle={vacuna ? 'Actualizar informacion' : 'Registrar nueva vacuna'}
      icon={Package}
      footer={
        <ModalFooter
          onCancel={onClose}
          submitLabel={vacuna ? 'Actualizar' : 'Crear'}
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
            placeholder="Ej: BCG, Pentavalente"
            required
            error={errors.nombre}
          />
          <TextInput
            id="tipo"
            label="Tipo de Vacuna"
            value={formData.tipo}
            onChange={(v) => handleFieldChange('tipo', v)}
            placeholder="Ej: Antituberculosa"
            required
            error={errors.tipo}
          />
          <SelectInput
            id="presentacion"
            label="Presentacion"
            value={formData.presentacion}
            onChange={(v) => handleFieldChange('presentacion', v)}
            options={[
              { value: 'Frasco multidosis', label: 'Frasco multidosis' },
              { value: 'Frasco unidosis', label: 'Frasco unidosis' },
              { value: 'Ampolla', label: 'Ampolla' },
              { value: 'Jeringa prellenada', label: 'Jeringa prellenada' },
            ]}
            required
          />
          <TextInput
            id="dosisPorFrasco"
            label="Dosis por Frasco"
            type="number"
            value={String(formData.dosisPorFrasco)}
            onChange={(v) => handleFieldChange('dosisPorFrasco', parseInt(v) || 1)}
            required
            error={errors.dosisPorFrasco}
            min={1}
          />
          <SelectInput
            id="tiempoVidaUtil"
            label="Tiempo de Vida Util"
            value={String(formData.tiempoVidaUtil)}
            onChange={(v) => handleFieldChange('tiempoVidaUtil', parseInt(v))}
            options={[
              { value: '365', label: '1 año' },
              { value: '730', label: '2 años' },
              { value: '1095', label: '3 años' },
              { value: '1460', label: '4 años' },
              { value: '1825', label: '5 años' },
            ]}
            required
          />
          <SelectInput
            id="temperaturaAlmacenamiento"
            label="Temperatura"
            value={formData.temperaturaAlmacenamiento}
            onChange={(v) => handleFieldChange('temperaturaAlmacenamiento', v)}
            options={[
              { value: '2°C a 8°C', label: '2°C a 8°C (Refrigeracion)' },
              { value: '-15°C a -25°C', label: '-15°C a -25°C (Congelacion)' },
              { value: '15°C a 25°C', label: '15°C a 25°C (Ambiente)' },
            ]}
            required
          />
        </div>

        {vacuna && (
          <SelectInput
            id="estado"
            label="Estado"
            value={(formData as any).estado || 'activo'}
            onChange={(v) => handleFieldChange('estado', v)}
            options={[
              { value: 'activo', label: 'Activo' },
              { value: 'inactivo', label: 'Inactivo' },
            ]}
          />
        )}

        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};

export default GestionVacunas;
