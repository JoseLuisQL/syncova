import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Plus, Syringe, RefreshCw } from 'lucide-react';
import { Jeringa, CreateJeringaDto, UpdateJeringaDto } from '../../types';
import { useJeringas } from '../../hooks/useJeringas';
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
import { Modal, ModalFooter, SelectInput, DeleteConfirmModal } from './components/ModalComponents';
import { COMPONENT_STYLES, FILTER_OPTIONS } from './constants';

const TABLE_COLUMNS = [
  { key: 'jeringa', label: 'Jeringa' },
  { key: 'capacidad', label: 'Capacidad y Color' },
  { key: 'stock', label: 'Stock Total', align: 'center' as const },
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
  { value: '0.5ml', label: '0.5ml' },
  { value: '1ml', label: '1ml' },
  { value: '2ml', label: '2ml' },
  { value: '3ml', label: '3ml' },
  { value: '5ml', label: '5ml' },
  { value: '10ml', label: '10ml' },
  { value: '20ml', label: '20ml' },
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingJeringa, setEditingJeringa] = useState<Jeringa | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
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
    deleteError
  } = useJeringas();

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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado]);

  const stats = useMemo(() => {
    const total = jeringas.length;
    const activas = jeringas.filter(j => j.estado === 'activo').length;
    const conStock = jeringas.filter(j => {
      const stock = j.lotes?.reduce((t, l) => t + l.cantidadActual, 0) || 0;
      return stock > 0;
    }).length;
    const sinStock = jeringas.filter(j => {
      const stock = j.lotes?.reduce((t, l) => t + l.cantidadActual, 0) || 0;
      return stock === 0;
    }).length;

    return [
      { key: 'total', label: 'Total Jeringas', value: total, icon: Syringe, color: 'primary' as const },
      { key: 'activas', label: 'Activas', value: activas, icon: Syringe, color: 'success' as const },
      { key: 'conStock', label: 'Con Stock', value: conStock, icon: Syringe, color: 'secondary' as const },
      { key: 'sinStock', label: 'Sin Stock', value: sinStock, icon: Syringe, color: 'warning' as const },
    ];
  }, [jeringas]);

  const handleCreate = useCallback(() => {
    setEditingJeringa(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((jeringa: Jeringa) => {
    setEditingJeringa(jeringa);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingJeringa(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const jeringa = jeringas.find(j => j.id === id);
    if (jeringa) {
      setDeleteTarget(jeringa);
    }
  }, [jeringas]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const success = await deleteJeringa(deleteTarget.id);
    if (success) {
      toast.success('Jeringa eliminada exitosamente');
      setDeleteTarget(null);
    } else if (deleteError) {
      toast.error('Error al eliminar', deleteError);
    }
  }, [deleteTarget, deleteJeringa, deleteError, toast]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleSubmit = useCallback(async (formData: CreateJeringaDto | UpdateJeringaDto) => {
    if (editingJeringa) {
      const success = await updateJeringa(editingJeringa.id, formData as UpdateJeringaDto);
      if (success) {
        toast.success('Jeringa actualizada exitosamente');
        handleCloseModal();
      } else if (updateError) {
        toast.error('Error al actualizar', updateError);
      }
    } else {
      const success = await createJeringa(formData as CreateJeringaDto);
      if (success) {
        toast.success('Jeringa creada exitosamente');
        handleCloseModal();
      } else if (createError) {
        toast.error('Error al crear', createError);
      }
    }
  }, [editingJeringa, updateJeringa, createJeringa, updateError, createError, toast, handleCloseModal]);

  const handleRefresh = useCallback(async () => {
    await refresh();
    if (!error) {
      toast.info('Datos actualizados', 'La lista de jeringas fue actualizada.');
    }
  }, [refresh, error, toast]);

  const getStockInfo = useCallback((jeringa: Jeringa) => {
    const stockTotal = jeringa.lotes?.reduce((t, l) => t + l.cantidadActual, 0) || 0;
    const lotesActivos = jeringa.lotes?.filter(l => l.estado === 'disponible').length || 0;
    const lotesAgotados = jeringa.lotes?.filter(l => l.estado === 'agotado').length || 0;
    return { stockTotal, lotesActivos, lotesAgotados };
  }, []);

  const getColorClass = useCallback((color: string) => {
    const colorMap: Record<string, string> = {
      'transparente': 'bg-white border-2',
      'azul': 'bg-blue-500',
      'verde': 'bg-green-500',
      'rojo': 'bg-red-500',
      'amarillo': 'bg-yellow-500',
      'naranja': 'bg-orange-500',
      'morado': 'bg-purple-500',
    };
    return colorMap[color.toLowerCase()] || 'bg-gray-300';
  }, []);

  const filterConfigs = useMemo(() => [
    { id: 'estado', label: 'Estado', value: filterEstado, options: FILTER_OPTIONS.estado, onChange: setFilterEstado },
  ], [filterEstado]);

  if (isLoading && jeringas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        <span className="ml-3 text-gray-600">Cargando jeringas...</span>
      </div>
    );
  }

  if (error && jeringas.length === 0) {
    return (
      <div className="p-6">
        <ErrorAlert message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6">
      {error && <ErrorAlert message={error} onRetry={refresh} />}

      <PageHeader
        title="Catalogo de Jeringas"
        subtitle="Gestion del catalogo de jeringas del sistema"
        icon={Syringe}
        count={pagination.total}
        action={{
          label: 'Nueva Jeringa',
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
          searchPlaceholder="Buscar por tipo, capacidad o color..."
          filters={filterConfigs}
        />

        <DataTable isLoading={isLoading} loadingMessage="Cargando jeringas...">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader columns={TABLE_COLUMNS} />
            <tbody className="divide-y divide-gray-100">
              {jeringas.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Syringe}
                      title="No se encontraron jeringas"
                      description="Intente ajustar los filtros o cree una nueva"
                      action={{
                        label: 'Nueva Jeringa',
                        onClick: handleCreate,
                      }}
                    />
                  </td>
                </tr>
              ) : (
                jeringas.map((jeringa) => (
                  <JeringaRow
                    key={jeringa.id}
                    jeringa={jeringa}
                    stockInfo={getStockInfo(jeringa)}
                    colorClass={getColorClass(jeringa.color)}
                    isExpanded={showDetails === jeringa.id}
                    onToggleDetails={() => setShowDetails(showDetails === jeringa.id ? null : jeringa.id)}
                    onEdit={() => handleEdit(jeringa)}
                    onDelete={() => handleDelete(jeringa.id)}
                    isLoading={isUpdating || isDeleting}
                  />
                ))
              )}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={changePage}
            />
          )}
        </DataTable>
      </div>

      {showModal && (
        <JeringaModal
          jeringa={editingJeringa}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget ? `${deleteTarget.tipo} ${deleteTarget.capacidad}` : ''}
        itemType="Jeringa"
        isLoading={isDeleting}
      />
    </div>
  );
};

// ============================================================================
// JERINGA ROW COMPONENT
// ============================================================================

interface JeringaRowProps {
  jeringa: Jeringa;
  stockInfo: { stockTotal: number; lotesActivos: number; lotesAgotados: number };
  colorClass: string;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const JeringaRow: React.FC<JeringaRowProps> = memo(({
  jeringa,
  stockInfo,
  colorClass,
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
            <Syringe className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{jeringa.tipo}</p>
            <p className="text-xs text-gray-500">Jeringa medica</p>
          </div>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <p className="text-sm font-medium text-gray-900">{jeringa.capacidad}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-3 h-3 rounded-full border border-gray-300 ${colorClass}`} />
          <span className="text-xs text-gray-500">{jeringa.color}</span>
        </div>
      </td>
      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
        <span className={`text-lg font-bold ${stockInfo.stockTotal > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {stockInfo.stockTotal.toLocaleString()}
        </span>
      </td>
      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="text-emerald-600 font-semibold">{stockInfo.lotesActivos}</div>
            <div className="text-gray-500">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-rose-600 font-semibold">{stockInfo.lotesAgotados}</div>
            <div className="text-gray-500">Agotados</div>
          </div>
        </div>
      </td>
      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
        <StatusBadge status={jeringa.estado as 'activo' | 'inactivo'} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Informacion del Producto</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Tipo completo:</span> <span className="ml-2 text-gray-900 font-medium">{jeringa.tipo}</span></div>
                <div><span className="text-gray-600">Creado:</span> <span className="ml-2 text-gray-900 font-medium">{jeringa.createdAt.toLocaleDateString()}</span></div>
                <div><span className="text-gray-600">ID:</span> <span className="ml-2 text-gray-500 font-mono text-xs">{jeringa.id}</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Estadisticas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Lotes totales:</span> <span className="text-gray-900 font-medium">{jeringa._count?.lotes || 0}</span></div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    )}
  </>
));

JeringaRow.displayName = 'JeringaRow';

// ============================================================================
// JERINGA MODAL COMPONENT
// ============================================================================

interface JeringaModalProps {
  jeringa: Jeringa | null;
  onClose: () => void;
  onSubmit: (data: CreateJeringaDto | UpdateJeringaDto) => void;
  isLoading?: boolean;
}

const JeringaModal: React.FC<JeringaModalProps> = ({ jeringa, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    tipo: jeringa?.tipo || 'Desechable',
    capacidad: jeringa?.capacidad || '1ml',
    color: jeringa?.color || 'Transparente',
    estado: jeringa?.estado || 'activo',
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={jeringa ? 'Editar Jeringa' : 'Nueva Jeringa'}
      subtitle={jeringa ? 'Actualizar informacion' : 'Registrar nueva jeringa'}
      icon={Syringe}
      size="md"
      footer={
        <ModalFooter
          onCancel={onClose}
          submitLabel={jeringa ? 'Actualizar' : 'Crear'}
          isLoading={isLoading}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <SelectInput
          id="tipo"
          label="Tipo de Jeringa"
          value={formData.tipo}
          onChange={(v) => handleFieldChange('tipo', v)}
          options={TIPO_OPTIONS}
          required
        />

        <SelectInput
          id="capacidad"
          label="Capacidad"
          value={formData.capacidad}
          onChange={(v) => handleFieldChange('capacidad', v)}
          options={CAPACIDAD_OPTIONS}
          required
        />

        <SelectInput
          id="color"
          label="Color"
          value={formData.color}
          onChange={(v) => handleFieldChange('color', v)}
          options={COLOR_OPTIONS}
          required
        />

        <SelectInput
          id="estado"
          label="Estado"
          value={formData.estado}
          onChange={(v) => handleFieldChange('estado', v)}
          options={[
            { value: 'activo', label: 'Activo' },
            { value: 'inactivo', label: 'Inactivo' },
          ]}
        />

        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};

export default GestionJeringas;
