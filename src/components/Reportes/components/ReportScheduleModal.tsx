import React, { useMemo, useState } from 'react';
import { Clock } from '@phosphor-icons/react';
import {
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextArea,
  TextInput,
} from '../../ui/ModalElements';
import { ReporteProgramado } from '../constants';

interface ReportScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reporte: Omit<ReporteProgramado, 'id'>, existingId?: string) => void;
  reporte?: ReporteProgramado | null;
}

const REPORT_TYPE_OPTIONS = [
  { value: 'inventario', label: 'Inventario' },
  { value: 'movimientos', label: 'Movimientos' },
  { value: 'planificacion', label: 'Planificación' },
];

const FREQUENCY_OPTIONS = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
];

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
];

const nextExecutionFromFrequency = (frecuencia: string) => {
  const next = new Date();
  const offset = frecuencia === 'semanal' ? 7 : frecuencia === 'trimestral' ? 90 : 30;
  next.setDate(next.getDate() + offset);
  return next;
};

const ReportScheduleModal: React.FC<ReportScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  reporte,
}) => {
  const [formData, setFormData] = useState(() => ({
    nombre: reporte?.nombre || '',
    tipo: reporte?.tipo || 'inventario',
    frecuencia: reporte?.frecuencia || 'mensual',
    destinatarios: reporte?.destinatarios.join(', ') || '',
    formato: reporte?.formato || 'pdf',
    estado: reporte?.estado || 'activo',
  }));

  React.useEffect(() => {
    setFormData({
      nombre: reporte?.nombre || '',
      tipo: reporte?.tipo || 'inventario',
      frecuencia: reporte?.frecuencia || 'mensual',
      destinatarios: reporte?.destinatarios.join(', ') || '',
      formato: reporte?.formato || 'pdf',
      estado: reporte?.estado || 'activo',
    });
  }, [reporte, isOpen]);

  const nextExecutionLabel = useMemo(
    () => nextExecutionFromFrequency(formData.frecuencia).toLocaleDateString('es-PE'),
    [formData.frecuencia],
  );
  const isInvalid = !formData.nombre.trim() || !formData.destinatarios.trim();

  const handleSubmit = () => {
    onSubmit(
      {
        ...formData,
        proximaEjecucion: reporte?.proximaEjecucion || nextExecutionFromFrequency(formData.frecuencia),
        destinatarios: formData.destinatarios
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      },
      reporte?.id,
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reporte ? 'Editar reporte programado' : 'Programar reporte'}
      subtitle="Configura el tipo de salida, frecuencia y destinatarios del módulo."
      icon={Clock}
      size="lg"
      footer={(
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={reporte ? 'Guardar cambios' : 'Programar reporte'}
          isSubmitDisabled={isInvalid}
        />
      )}
    >
      <div className="space-y-4">
        <FormSection
          title="Identificación"
          description="Nombra el reporte para reconocerlo rápidamente en la configuración."
        >
          <TextInput
            id="schedule-name"
            label="Nombre del reporte"
            value={formData.nombre}
            onChange={(value) => setFormData((prev) => ({ ...prev, nombre: value }))}
            placeholder="Ej: Resumen mensual de stock"
            required
          />
        </FormSection>

        <FormSection
          title="Programación"
          description={`La próxima ejecución estimada será ${nextExecutionLabel}.`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              id="schedule-type"
              label="Tipo de reporte"
              value={formData.tipo}
              onChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
              options={REPORT_TYPE_OPTIONS}
            />
            <SelectInput
              id="schedule-frequency"
              label="Frecuencia"
              value={formData.frecuencia}
              onChange={(value) => setFormData((prev) => ({ ...prev, frecuencia: value }))}
              options={FREQUENCY_OPTIONS}
            />
          </div>
        </FormSection>

        <FormSection
          title="Entrega"
          description="Usa correos separados por comas para múltiples destinatarios."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              id="schedule-format"
              label="Formato"
              value={formData.formato}
              onChange={(value) => setFormData((prev) => ({ ...prev, formato: value }))}
              options={FORMAT_OPTIONS}
            />
            <SelectInput
              id="schedule-status"
              label="Estado"
              value={formData.estado}
              onChange={(value) => setFormData((prev) => ({ ...prev, estado: value }))}
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
              ]}
            />
          </div>
          <TextArea
            id="schedule-recipients"
            label="Destinatarios"
            value={formData.destinatarios}
            onChange={(value) => setFormData((prev) => ({ ...prev, destinatarios: value }))}
            placeholder="coordinacion@salud.gob.pe, admin@salud.gob.pe"
            rows={3}
            required
          />
        </FormSection>
      </div>
    </Modal>
  );
};

export default ReportScheduleModal;
