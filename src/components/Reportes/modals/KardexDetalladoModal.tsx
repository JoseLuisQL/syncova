import React, { useCallback, useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import { Vacuna, Establecimiento } from '../../../types';
import { FiltrosKardexDetallado } from '../../../types/reportes';
import { KardexService } from '../../../services/KardexService';
import {
  DateInput,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextInput,
} from '../../Inventario/components/ModalComponents';
import { getFechaPeruActual, getFechaPeruMesAnterior } from '../utils';

interface KardexDetalladoModalProps {
  onClose: () => void;
  onExportar: (filtros: FiltrosKardexDetallado) => Promise<void> | void;
  vacunas: Vacuna[];
  centrosAcopio: Establecimiento[];
}

const KardexDetalladoModal: React.FC<KardexDetalladoModalProps> = ({
  onClose,
  onExportar,
  vacunas,
  centrosAcopio,
}) => {
  const [filtros, setFiltros] = useState<FiltrosKardexDetallado>({
    fechaInicio: getFechaPeruMesAnterior(),
    fechaFin: getFechaPeruActual(),
  });
  const [jeringas, setJeringas] = useState<Array<{ id: string; nombre: string }>>([]);
  const [lotes, setLotes] = useState<Array<{ id: string; numero: string }>>([]);
  const [loadingJeringas, setLoadingJeringas] = useState(false);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    const cargarJeringas = async () => {
      setLoadingJeringas(true);
      try {
        const jeringasData = await KardexService.getJeringas();
        setJeringas(jeringasData);
      } catch (error) {
        console.error('Error al cargar jeringas:', error);
        setJeringas([]);
      } finally {
        setLoadingJeringas(false);
      }
    };

    void cargarJeringas();
  }, []);

  useEffect(() => {
    const cargarLotes = async () => {
      if (!filtros.tipo || !filtros.itemId) {
        setLotes([]);
        return;
      }

      setLoadingLotes(true);
      try {
        let lotesData: Array<{ id: string; numero: string }> = [];

        if (filtros.tipo === 'vacuna') {
          lotesData = await KardexService.getLotesVacunas(filtros.itemId);
        } else if (filtros.tipo === 'jeringa') {
          lotesData = await KardexService.getLotesJeringas(filtros.itemId);
        }

        setLotes(lotesData);
      } catch (error) {
        console.error('Error al cargar lotes:', error);
        setLotes([]);
      } finally {
        setLoadingLotes(false);
      }
    };

    void cargarLotes();
  }, [filtros.itemId, filtros.tipo]);

  const handleExportar = useCallback(async () => {
    setExportando(true);
    try {
      await onExportar({
        ...filtros,
        ...(searchTerm ? { search: searchTerm } : {}),
      } as FiltrosKardexDetallado);
    } finally {
      setExportando(false);
    }
  }, [filtros, onExportar, searchTerm]);

  const itemsDisponibles = filtros.tipo === 'vacuna' ? vacunas : jeringas;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Kardex detallado"
      subtitle="Configura filtros avanzados para exportar movimientos con trazabilidad completa."
      icon={Archive}
      size="xl"
      footer={(
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleExportar}
          submitType="button"
          submitLabel={exportando ? 'Exportando...' : 'Exportar Excel'}
          isLoading={exportando}
        />
      )}
    >
      <div className="space-y-4">
        <FormSection
          title="Periodo"
          description="Define el rango principal para cortar los movimientos del kardex."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <DateInput
              id="kardex-start"
              label="Fecha inicio"
              value={filtros.fechaInicio}
              onChange={(value) => setFiltros((prev) => ({ ...prev, fechaInicio: value }))}
              required
            />
            <DateInput
              id="kardex-end"
              label="Fecha fin"
              value={filtros.fechaFin}
              onChange={(value) => setFiltros((prev) => ({ ...prev, fechaFin: value }))}
              required
            />
          </div>
        </FormSection>

        <FormSection
          title="Producto"
          description="Acota el kardex por tipo, item y lote cuando necesites una revisión fina."
        >
          <div className="grid gap-4 xl:grid-cols-3">
            <SelectInput
              id="kardex-type"
              label="Tipo"
              value={filtros.tipo || ''}
              onChange={(value) => setFiltros((prev) => ({
                ...prev,
                tipo: (value || undefined) as 'vacuna' | 'jeringa' | undefined,
                itemId: undefined,
                loteId: undefined,
              }))}
              options={[
                { value: '', label: 'Todos' },
                { value: 'vacuna', label: 'Vacunas' },
                { value: 'jeringa', label: 'Jeringas' },
              ]}
            />
            <SelectInput
              id="kardex-item"
              label={filtros.tipo === 'jeringa' ? 'Jeringa' : 'Vacuna / item'}
              value={filtros.itemId || ''}
              onChange={(value) => setFiltros((prev) => ({ ...prev, itemId: value || undefined, loteId: undefined }))}
              options={[
                { value: '', label: loadingJeringas && filtros.tipo === 'jeringa' ? 'Cargando jeringas...' : 'Todos' },
                ...itemsDisponibles.map((item) => ({ value: item.id, label: item.nombre })),
              ]}
              disabled={!filtros.tipo || (filtros.tipo === 'jeringa' && loadingJeringas)}
            />
            <SelectInput
              id="kardex-lote"
              label="Lote"
              value={filtros.loteId || ''}
              onChange={(value) => setFiltros((prev) => ({ ...prev, loteId: value || undefined }))}
              options={[
                { value: '', label: loadingLotes ? 'Cargando lotes...' : 'Todos' },
                ...lotes.map((lote) => ({ value: lote.id, label: lote.numero })),
              ]}
              disabled={!filtros.itemId || loadingLotes}
            />
          </div>
        </FormSection>

        <FormSection
          title="Movimiento"
          description="Aplica filtros adicionales para exportaciones de auditoría."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <SelectInput
              id="kardex-movement"
              label="Tipo de movimiento"
              value={filtros.tipoMovimiento || ''}
              onChange={(value) => setFiltros((prev) => ({
                ...prev,
                tipoMovimiento: (value || undefined) as 'ingreso' | 'salida' | 'transferencia' | 'ajuste' | undefined,
              }))}
              options={[
                { value: '', label: 'Todos' },
                { value: 'ingreso', label: 'Ingreso' },
                { value: 'salida', label: 'Salida' },
                { value: 'transferencia', label: 'Transferencia' },
                { value: 'ajuste', label: 'Ajuste' },
              ]}
            />
            <SelectInput
              id="kardex-establecimiento"
              label="Centro / establecimiento"
              value={filtros.establecimientoId || ''}
              onChange={(value) => setFiltros((prev) => ({ ...prev, establecimientoId: value || undefined }))}
              options={[
                { value: '', label: 'Todos' },
                ...centrosAcopio.map((centro) => ({ value: centro.id, label: centro.nombre })),
              ]}
            />
          </div>

          <TextInput
            id="kardex-search"
            label="Búsqueda libre"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Documento, número, observaciones..."
          />

          <label className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              type="checkbox"
              checked={filtros.incluirTrazabilidad || false}
              onChange={(event) => setFiltros((prev) => ({ ...prev, incluirTrazabilidad: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-slate-700">Incluir información de trazabilidad completa</span>
          </label>
        </FormSection>
      </div>
    </Modal>
  );
};

export default React.memo(KardexDetalladoModal);
