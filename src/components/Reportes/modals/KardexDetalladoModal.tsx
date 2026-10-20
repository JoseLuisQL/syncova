import React, { useCallback, useEffect, useState } from 'react';
import { Archive } from '@phosphor-icons/react';
import { Vacuna } from '../../../types';
import { CentroAcopioOption, FiltrosKardexDetallado } from '../../../types/reportes';
import { KardexService } from '../../../services/KardexService';
import {
  DateInput,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextInput,
} from '../../ui/ModalElements';
import { getFechaPeruActual, getFechaPeruMesAnterior } from '../utils';

interface KardexDetalladoModalProps {
  onClose: () => void;
  onExportar: (filtros: FiltrosKardexDetallado) => Promise<void> | void;
  vacunas: Vacuna[];
  centrosAcopio: CentroAcopioOption[];
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
        setJeringas(jeringasData.map((j) => ({ id: j.id, nombre: `${j.tipo} ${j.capacidad}`.trim() })));
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
      subtitle="Configura los filtros para exportar movimientos con trazabilidad completa en Excel."
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
          title="Periodo y alcance"
          description="Rango de fechas, tipo de movimiento y establecimiento de salud."
        >
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
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
            <SelectInput
              id="kardex-movement"
              label="Tipo de movimiento"
              value={filtros.tipoMovimiento || ''}
              onChange={(value) =>
                setFiltros((prev) => ({
                  ...prev,
                  tipoMovimiento: (value || undefined) as
                    | 'ingreso'
                    | 'salida'
                    | 'transferencia'
                    | 'ajuste'
                    | undefined,
                }))
              }
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
              label="Centro de acopio"
              value={filtros.establecimientoId || ''}
              onChange={(value) => setFiltros((prev) => ({ ...prev, establecimientoId: value || undefined }))}
              options={[
                { value: '', label: 'Todos' },
                ...centrosAcopio.map((centro) => ({ value: centro.id, label: centro.nombre })),
              ]}
            />
          </div>
        </FormSection>

        <FormSection
          title="Producto y lote"
          description="Acota por tipo de insumo, biológico específico o lote cuando requieras auditoría fina."
        >
          <div className="grid gap-3.5 sm:grid-cols-3">
            <SelectInput
              id="kardex-type"
              label="Tipo de ítem"
              value={filtros.tipo || ''}
              onChange={(value) =>
                setFiltros((prev) => ({
                  ...prev,
                  tipo: (value || undefined) as 'vacuna' | 'jeringa' | undefined,
                  itemId: undefined,
                  loteId: undefined,
                }))
              }
              options={[
                { value: '', label: 'Todos' },
                { value: 'vacuna', label: 'Vacunas' },
                { value: 'jeringa', label: 'Jeringas' },
              ]}
            />
            <SelectInput
              id="kardex-item"
              label={filtros.tipo === 'jeringa' ? 'Jeringa' : 'Vacuna / ítem'}
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

          <div className="grid gap-3.5 sm:grid-cols-2 items-end pt-1">
            <TextInput
              id="kardex-search"
              label="Búsqueda por documento o referencia"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Ej. PECOSA, VALE, observaciones..."
            />

            <label className="flex h-10 cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-soft px-3.5 text-xs sm:text-sm text-ink">
              <input
                type="checkbox"
                checked={filtros.incluirTrazabilidad || false}
                onChange={(event) => setFiltros((prev) => ({ ...prev, incluirTrazabilidad: event.target.checked }))}
                className="h-4 w-4 rounded border-line accent-violet-600 focus:ring-brand/25"
              />
              <span>Incluir trazabilidad de lotes y documentos</span>
            </label>
          </div>
        </FormSection>
      </div>
    </Modal>
  );
};

export default React.memo(KardexDetalladoModal);
