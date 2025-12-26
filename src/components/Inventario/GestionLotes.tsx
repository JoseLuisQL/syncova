import React, { useState, useCallback, useMemo, memo } from 'react';
import { Package, Syringe, RefreshCw, Download } from 'lucide-react';
import { Lote, LoteJeringa, LoteVacunaStats, LoteJeringaStats, Vacuna, Jeringa } from '../../types';
import {
  StatsGrid,
  StatusBadge,
  EmptyState,
  ActionButtons,
  StockProgress,
  ExpiryBadge,
} from './components/SharedComponents';
import { FilterBar, Pagination, DataTable, TableHeader } from './components/FilterAndTable';
import { Modal, ModalFooter, TextInput, SelectInput, DateInput, TextArea, DeleteConfirmModal } from './components/ModalComponents';
import { COMPONENT_STYLES, FILTER_OPTIONS } from './constants';

interface GestionLotesProps {
  lotes: (Lote | LoteJeringa)[];
  onUpdate: (lote: Lote | LoteJeringa) => void;
  onDelete: (id: string) => void;
  tipo: 'vacuna' | 'jeringa';
  isLoading?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  stats?: LoteVacunaStats | LoteJeringaStats | null;
  isLoadingStats?: boolean;
  vacunas?: Vacuna[];
  jeringas?: Jeringa[];
  onApplyFilters?: (filters: Record<string, string>) => void;
  isLoadingVacunas?: boolean;
  isLoadingJeringas?: boolean;
}

const GestionLotes: React.FC<GestionLotesProps> = ({
  lotes,
  onUpdate,
  onDelete,
  tipo,
  isLoading = false,
  isUpdating = false,
  isDeleting = false,
  stats: externalStats,
  isLoadingStats = false,
  vacunas = [],
  jeringas = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterVencimiento, setFilterVencimiento] = useState('todos');
  const [filterProducto, setFilterProducto] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | LoteJeringa | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lote | LoteJeringa | null>(null);

  const filteredLotes = useMemo(() => {
    return lotes.filter(lote => {
      const matchesSearch = lote.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lote.numeroComprobante.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEstado = filterEstado === 'todos' || lote.estado === filterEstado;

      // Filtro por producto (vacuna o jeringa)
      let matchesProducto = true;
      if (filterProducto !== 'todos') {
        if (tipo === 'vacuna' && 'vacunaId' in lote) {
          matchesProducto = lote.vacunaId === filterProducto;
        } else if (tipo === 'jeringa' && 'jeringaId' in lote) {
          matchesProducto = lote.jeringaId === filterProducto;
        }
      }

      let matchesVencimiento = true;
      if (filterVencimiento !== 'todos' && 'fechaVencimiento' in lote && lote.fechaVencimiento) {
        const days = Math.ceil((lote.fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        switch (filterVencimiento) {
          case 'vencido': matchesVencimiento = days <= 0; break;
          case 'por_vencer': matchesVencimiento = days > 0 && days <= 30; break;
          case 'vigente': matchesVencimiento = days > 30; break;
        }
      }

      return matchesSearch && matchesEstado && matchesProducto && matchesVencimiento;
    });
  }, [lotes, searchTerm, filterEstado, filterProducto, filterVencimiento, tipo]);

  const statsData = useMemo(() => {
    const data = externalStats || {
      total: lotes.length,
      disponibles: lotes.filter(l => l.estado === 'disponible').length,
      agotados: lotes.filter(l => l.estado === 'agotado').length,
      vencidos: tipo === 'vacuna' ? lotes.filter(l => l.estado === 'vencido').length : 0,
      porVencer: tipo === 'vacuna' ? lotes.filter(l => {
        if ('fechaVencimiento' in l && l.fechaVencimiento) {
          const days = Math.ceil((l.fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return days <= 30 && days > 0;
        }
        return false;
      }).length : 0,
      stockTotal: lotes.reduce((sum, l) => sum + l.cantidadActual, 0),
    };

    const Icon = tipo === 'vacuna' ? Package : Syringe;

    if (tipo === 'vacuna') {
      return [
        { key: 'total', label: 'Total Lotes', value: data.total, icon: Icon, color: 'primary' as const },
        { key: 'disponibles', label: 'Disponibles', value: data.disponibles, icon: Icon, color: 'success' as const },
        { key: 'porVencer', label: 'Por Vencer', value: (data as LoteVacunaStats).porVencer || 0, icon: Icon, color: 'warning' as const },
        { key: 'vencidos', label: 'Vencidos', value: (data as LoteVacunaStats).vencidos || 0, icon: Icon, color: 'danger' as const },
      ];
    }

    return [
      { key: 'total', label: 'Total Lotes', value: data.total, icon: Icon, color: 'primary' as const },
      { key: 'disponibles', label: 'Disponibles', value: data.disponibles, icon: Icon, color: 'success' as const },
      { key: 'agotados', label: 'Agotados', value: data.agotados, icon: Icon, color: 'neutral' as const },
      { key: 'stockTotal', label: 'Stock Total', value: data.stockTotal, icon: Icon, color: 'secondary' as const },
    ];
  }, [externalStats, lotes, tipo]);

  const handleEdit = useCallback((lote: Lote | LoteJeringa) => {
    setEditingLote(lote);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const lote = lotes.find(l => l.id === id);
    if (lote) {
      setDeleteTarget(lote);
    }
  }, [lotes]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete]);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleSubmit = useCallback((formData: Partial<Lote | LoteJeringa>) => {
    if (editingLote) {
      onUpdate({ ...editingLote, ...formData } as Lote | LoteJeringa);
    }
    setShowModal(false);
    setEditingLote(null);
  }, [editingLote, onUpdate]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingLote(null);
  }, []);

  const getDaysToExpire = useCallback((fechaVencimiento?: Date) => {
    if (!fechaVencimiento) return null;
    return Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, []);

  const getProductName = useCallback((lote: Lote | LoteJeringa) => {
    if ('vacunaId' in lote && lote.vacuna) {
      return `${lote.vacuna.nombre} - ${lote.vacuna.presentacion}`;
    }
    if ('jeringaId' in lote && lote.jeringa) {
      return `${lote.jeringa.tipo} ${lote.jeringa.capacidad} - ${lote.jeringa.color}`;
    }
    return 'Producto no encontrado';
  }, []);

  const filterConfigs = useMemo(() => {
    const configs: Array<{
      id: string;
      label: string;
      value: string;
      options: Array<{ value: string; label: string }>;
      onChange: (value: string) => void;
    }> = [
      { id: 'estado', label: 'Estado', value: filterEstado, options: FILTER_OPTIONS.estadoLote, onChange: setFilterEstado },
    ];

    // Agregar filtro por producto (vacuna o jeringa)
    if (tipo === 'vacuna' && vacunas.length > 0) {
      const vacunaOptions = [
        { value: 'todos', label: 'Todas las vacunas' },
        ...vacunas.map(v => ({ value: v.id, label: v.nombre }))
      ];
      configs.push({
        id: 'vacuna',
        label: 'Vacuna',
        value: filterProducto,
        options: vacunaOptions,
        onChange: setFilterProducto,
      });
    } else if (tipo === 'jeringa' && jeringas.length > 0) {
      const jeringaOptions = [
        { value: 'todos', label: 'Todas las jeringas' },
        ...jeringas.map(j => ({ value: j.id, label: `${j.tipo} ${j.capacidad}` }))
      ];
      configs.push({
        id: 'jeringa',
        label: 'Jeringa',
        value: filterProducto,
        options: jeringaOptions,
        onChange: setFilterProducto,
      });
    }

    if (tipo === 'vacuna') {
      configs.push({
        id: 'vencimiento',
        label: 'Vencimiento',
        value: filterVencimiento,
        options: FILTER_OPTIONS.vencimiento,
        onChange: setFilterVencimiento,
      });
    }

    return configs;
  }, [filterEstado, filterProducto, filterVencimiento, tipo, vacunas, jeringas]);

  const tableColumns = useMemo(() => {
    const cols = [
      { key: 'lote', label: 'Lote' },
      { key: 'producto', label: 'Producto' },
      { key: 'stock', label: 'Stock', align: 'center' as const },
    ];

    if (tipo === 'vacuna') {
      cols.push({ key: 'vencimiento', label: 'Vencimiento', align: 'center' as const });
    }

    cols.push(
      { key: 'comprobante', label: 'Comprobante' },
      { key: 'estado', label: 'Estado', align: 'center' as const },
      { key: 'acciones', label: 'Acciones', align: 'right' as const }
    );

    return cols;
  }, [tipo]);

  const Icon = tipo === 'vacuna' ? Package : Syringe;

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsData} isLoading={isLoadingStats} />

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por numero de lote o comprobante..."
            filters={filterConfigs}
          />
        </div>
        <div className="flex gap-2 ml-4">
          <button className={COMPONENT_STYLES.button.secondary}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button className={COMPONENT_STYLES.button.secondary}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {isLoading && lotes.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
          <span className="ml-3 text-gray-600">Cargando lotes...</span>
        </div>
      ) : (
        <DataTable isLoading={isLoading} loadingMessage="Cargando lotes...">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader columns={tableColumns} />
            <tbody className="divide-y divide-gray-100">
              {filteredLotes.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length}>
                    <EmptyState
                      icon={Icon}
                      title="No se encontraron lotes"
                      description={searchTerm || filterEstado !== 'todos' || filterVencimiento !== 'todos'
                        ? 'No hay lotes que coincidan con los filtros'
                        : `No hay lotes de ${tipo === 'vacuna' ? 'vacunas' : 'jeringas'} registrados`
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredLotes.map((lote) => (
                  <LoteRow
                    key={lote.id}
                    lote={lote}
                    tipo={tipo}
                    productName={getProductName(lote)}
                    daysToExpire={'fechaVencimiento' in lote ? getDaysToExpire(lote.fechaVencimiento) : null}
                    onEdit={() => handleEdit(lote)}
                    onDelete={() => handleDelete(lote.id)}
                    isLoading={isUpdating || isDeleting}
                  />
                ))
              )}
            </tbody>
          </table>
        </DataTable>
      )}

      {showModal && editingLote && (
        <LoteModal
          lote={editingLote}
          tipo={tipo}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.numero || ''}
        itemType="Lote"
        isLoading={isDeleting}
      />
    </div>
  );
};

// ============================================================================
// LOTE ROW COMPONENT
// ============================================================================

interface LoteRowProps {
  lote: Lote | LoteJeringa;
  tipo: 'vacuna' | 'jeringa';
  productName: string;
  daysToExpire: number | null;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const LoteRow: React.FC<LoteRowProps> = memo(({
  lote,
  tipo,
  productName,
  daysToExpire,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const Icon = tipo === 'vacuna' ? Package : Syringe;

  return (
    <tr className={COMPONENT_STYLES.table.row}>
      <td className={COMPONENT_STYLES.table.cell}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{lote.numero}</p>
            <p className="text-xs text-gray-500">Ingreso: {lote.fechaIngreso.toLocaleDateString()}</p>
          </div>
        </div>
      </td>
      <td className={COMPONENT_STYLES.table.cell}>
        <p className="text-sm font-medium text-gray-900">{productName}</p>
        <p className="text-xs text-gray-500">{lote.formaIngreso}</p>
      </td>
      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
        <StockProgress
          current={lote.cantidadActual}
          initial={lote.cantidadInicial}
        />
      </td>
      {tipo === 'vacuna' && 'fechaVencimiento' in lote && (
        <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
          <p className="text-sm font-medium text-gray-900">{lote.fechaVencimiento?.toLocaleDateString()}</p>
          <ExpiryBadge daysToExpire={daysToExpire} />
        </td>
      )}
      <td className={COMPONENT_STYLES.table.cell}>
        <p className="text-sm font-medium text-gray-900">{lote.comprobanteClase}</p>
        <p className="text-xs text-gray-500">{lote.numeroComprobante}</p>
      </td>
      <td className={`${COMPONENT_STYLES.table.cell} text-center`}>
        <StatusBadge status={lote.estado as 'disponible' | 'agotado' | 'vencido'} />
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

LoteRow.displayName = 'LoteRow';

// ============================================================================
// LOTE MODAL COMPONENT
// ============================================================================

interface LoteModalProps {
  lote: Lote | LoteJeringa;
  tipo: 'vacuna' | 'jeringa';
  onClose: () => void;
  onSubmit: (data: Partial<Lote | LoteJeringa>) => void;
}

const mapFormaIngresoToFrontend = (formaIngreso: string): string => {
  const mapping: Record<string, string> = {
    'PRIMER_TRIMESTRE': '1° TRIMESTRE',
    'SEGUNDO_TRIMESTRE': '2° TRIMESTRE',
    'TERCER_TRIMESTRE': '3° TRIMESTRE',
    'CUARTO_TRIMESTRE': '4° TRIMESTRE'
  };
  return mapping[formaIngreso] || formaIngreso;
};

const LoteModal: React.FC<LoteModalProps> = ({ lote, tipo, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    numero: lote.numero,
    fechaIngreso: lote.fechaIngreso.toISOString().split('T')[0],
    fechaVencimiento: 'fechaVencimiento' in lote && lote.fechaVencimiento
      ? lote.fechaVencimiento.toISOString().split('T')[0]
      : '',
    formaIngreso: mapFormaIngresoToFrontend(lote.formaIngreso),
    comprobanteClase: lote.comprobanteClase,
    numeroComprobante: lote.numeroComprobante,
    cantidadInicial: lote.cantidadInicial,
    cantidadActual: lote.cantidadActual,
    estado: lote.estado,
    observaciones: lote.observaciones || '',
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: Partial<Lote | LoteJeringa> = {
      ...formData,
      fechaIngreso: new Date(formData.fechaIngreso),
      fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined,
    } as Partial<Lote | LoteJeringa>;
    onSubmit(updatedData);
  }, [formData, onSubmit]);

  const handleFieldChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const Icon = tipo === 'vacuna' ? Package : Syringe;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Editar Lote - ${tipo === 'vacuna' ? 'Vacuna' : 'Jeringa'}`}
      subtitle="Actualizar informacion del lote"
      icon={Icon}
      footer={
        <ModalFooter
          onCancel={onClose}
          submitLabel="Actualizar Lote"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            id="numero"
            label="Numero de Lote"
            value={formData.numero}
            onChange={(v) => handleFieldChange('numero', v)}
            required
          />
          <SelectInput
            id="estado"
            label="Estado"
            value={formData.estado}
            onChange={(v) => handleFieldChange('estado', v)}
            options={[
              { value: 'disponible', label: 'Disponible' },
              { value: 'agotado', label: 'Agotado' },
              ...(tipo === 'vacuna' ? [{ value: 'vencido', label: 'Vencido' }] : []),
            ]}
            required
          />
          <DateInput
            id="fechaIngreso"
            label="Fecha de Ingreso"
            value={formData.fechaIngreso}
            onChange={(v) => handleFieldChange('fechaIngreso', v)}
            required
          />
          {tipo === 'vacuna' && (
            <DateInput
              id="fechaVencimiento"
              label="Fecha de Vencimiento"
              value={formData.fechaVencimiento}
              onChange={(v) => handleFieldChange('fechaVencimiento', v)}
            />
          )}
          <SelectInput
            id="formaIngreso"
            label="Forma de Ingreso"
            value={formData.formaIngreso}
            onChange={(v) => handleFieldChange('formaIngreso', v)}
            options={FILTER_OPTIONS.formaIngreso}
            required
          />
          <SelectInput
            id="comprobanteClase"
            label="Tipo de Comprobante"
            value={formData.comprobanteClase}
            onChange={(v) => handleFieldChange('comprobanteClase', v)}
            options={FILTER_OPTIONS.comprobanteClase}
            required
          />
          <TextInput
            id="numeroComprobante"
            label="Numero de Comprobante"
            value={formData.numeroComprobante}
            onChange={(v) => handleFieldChange('numeroComprobante', v)}
            required
          />
          <TextInput
            id="cantidadInicial"
            label="Cantidad Inicial"
            type="number"
            value={String(formData.cantidadInicial)}
            onChange={(v) => handleFieldChange('cantidadInicial', parseInt(v) || 0)}
            required
            min={0}
          />
          <TextInput
            id="cantidadActual"
            label="Cantidad Actual"
            type="number"
            value={String(formData.cantidadActual)}
            onChange={(v) => handleFieldChange('cantidadActual', parseInt(v) || 0)}
            required
            min={0}
            max={formData.cantidadInicial}
          />
        </div>

        <TextArea
          id="observaciones"
          label="Observaciones"
          value={formData.observaciones}
          onChange={(v) => handleFieldChange('observaciones', v)}
          placeholder="Observaciones adicionales (opcional)"
        />

        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};

export default GestionLotes;
