import React, { useState } from 'react';
import { FileXls } from '@phosphor-icons/react';
import { useToastContext } from '../../contexts/ToastContext';
import {
  DateInput,
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
} from '../ui/ModalElements';
import { getFechaPeruActual, getFechaPeruMesAnterior } from './utils';

interface Establecimiento {
  id: string;
  nombre: string;
}

interface MovimientosPorEESSModalProps {
  onClose: () => void;
  onExportar: (filtros: MovimientosPorEESSFiltros) => Promise<void>;
  centrosAcopio: Establecimiento[];
}

interface MovimientosPorEESSFiltros {
  centroAcopioId?: string;
  fechaInicio: string;
  fechaFin: string;
}

const MovimientosPorEESSModal: React.FC<MovimientosPorEESSModalProps> = ({
  onClose,
  onExportar,
  centrosAcopio,
}) => {
  const { toast } = useToastContext();
  const [filtros, setFiltros] = useState<MovimientosPorEESSFiltros>({
    fechaInicio: getFechaPeruMesAnterior(),
    fechaFin: getFechaPeruActual(),
  });
  const [exportando, setExportando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!filtros.fechaInicio) nuevosErrores.fechaInicio = 'La fecha de inicio es requerida.';
    if (!filtros.fechaFin) nuevosErrores.fechaFin = 'La fecha de fin es requerida.';

    if (filtros.fechaInicio && filtros.fechaFin) {
      const inicio = new Date(filtros.fechaInicio);
      const fin = new Date(filtros.fechaFin);
      const diffDays = Math.ceil(Math.abs(fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

      if (inicio > fin) {
        nuevosErrores.fechaFin = 'La fecha final debe ser posterior a la inicial.';
      } else if (diffDays > 730) {
        nuevosErrores.fechaFin = 'El rango no puede superar 2 años.';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleExportar = async () => {
    if (!validarFormulario()) {
      toast.error('Corrige los campos requeridos', 'Verifica el rango de fechas antes de exportar.', { duration: 3500 });
      return;
    }

    setExportando(true);
    try {
      await onExportar(filtros);
      onClose();
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast.error('No se pudo exportar el reporte', 'Inténtalo nuevamente con otro rango o centro.', { duration: 4000 });
    } finally {
      setExportando(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Movimientos por EESS"
      subtitle="Configura el periodo y el centro de acopio antes de generar el archivo Excel."
      icon={FileXls}
      size="lg"
      footer={(
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleExportar}
          submitType="button"
          submitLabel={exportando ? 'Generando Excel...' : 'Generar Excel'}
          isLoading={exportando}
        />
      )}
    >
      <div className="space-y-4">
        <FormSection
          title="Resumen del reporte"
          description="El archivo agrupa movimientos por establecimiento de salud y vacuna dentro del periodo seleccionado."
        >
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-900">
            Úsalo cuando necesites revisar distribución, entregas y saldos por EESS en una sola exportación.
          </div>
        </FormSection>

        <FormSection
          title="Periodo"
          description="El rango debe ser consistente con la revisión mensual o el corte operativo."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <DateInput
              id="movimientos-eess-start"
              label="Fecha inicio"
              value={filtros.fechaInicio}
              onChange={(value) => setFiltros((prev) => ({ ...prev, fechaInicio: value }))}
              error={errores.fechaInicio}
            />
            <DateInput
              id="movimientos-eess-end"
              label="Fecha fin"
              value={filtros.fechaFin}
              onChange={(value) => setFiltros((prev) => ({ ...prev, fechaFin: value }))}
              error={errores.fechaFin}
            />
          </div>
        </FormSection>

        <FormSection
          title="Cobertura"
          description="Si no seleccionas un centro, el reporte incluirá todos los establecimientos disponibles."
        >
          <SelectInput
            id="movimientos-eess-centro"
            label="Centro de acopio"
            value={filtros.centroAcopioId || ''}
            onChange={(value) => setFiltros((prev) => ({ ...prev, centroAcopioId: value || undefined }))}
            options={[
              { value: '', label: 'Todos los centros de acopio' },
              ...centrosAcopio.map((centro) => ({ value: centro.id, label: centro.nombre })),
            ]}
          />
        </FormSection>
      </div>
    </Modal>
  );
};

export default MovimientosPorEESSModal;
export type { MovimientosPorEESSFiltros };
