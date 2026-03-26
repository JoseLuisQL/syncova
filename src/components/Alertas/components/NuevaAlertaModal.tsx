import React, { memo, useCallback, useState } from 'react';
import { Bell } from '@phosphor-icons/react';
import {
  Modal,
  ModalFooter,
  SelectInput,
  TextArea,
  TextInput,
} from '../../ui/ModalElements';
import { NIVELES_ALERTA, TIPOS_ALERTA } from '../constants';

interface NuevaAlertaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrear: (data: {
    tipo: string;
    nivel: string;
    titulo: string;
    descripcion: string;
  }) => Promise<void>;
  isCreating?: boolean;
}

export const NuevaAlertaModal: React.FC<NuevaAlertaModalProps> = memo(({
  isOpen,
  onClose,
  onCrear,
  isCreating = false,
}) => {
  const [formData, setFormData] = useState({
    tipo: 'sistema',
    nivel: 'info',
    titulo: '',
    descripcion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) nextErrors.titulo = 'El título es requerido.';
    if (!formData.descripcion.trim()) nextErrors.descripcion = 'La descripción es requerida.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData.descripcion, formData.titulo]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    await onCrear(formData);
    setFormData({ tipo: 'sistema', nivel: 'info', titulo: '', descripcion: '' });
    setErrors({});
  }, [formData, onCrear, validate]);

  const handleClose = useCallback(() => {
    setFormData({ tipo: 'sistema', nivel: 'info', titulo: '', descripcion: '' });
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva alerta"
      subtitle="Registra una alerta manual cuando el equipo necesite seguimiento inmediato."
      icon={Bell}
      size="lg"
      footer={(
        <ModalFooter
          onCancel={handleClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel="Crear alerta"
          isLoading={isCreating}
          isSubmitDisabled={!formData.titulo.trim() || !formData.descripcion.trim()}
        />
      )}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            id="alerta-tipo"
            label="Tipo"
            value={formData.tipo}
            onChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
            options={TIPOS_ALERTA.map((tipo) => ({ value: tipo.id, label: tipo.label }))}
          />
          <SelectInput
            id="alerta-nivel"
            label="Nivel"
            value={formData.nivel}
            onChange={(value) => setFormData((prev) => ({ ...prev, nivel: value }))}
            options={NIVELES_ALERTA.map((nivel) => ({ value: nivel.id, label: nivel.label }))}
          />
        </div>

        <TextInput
          id="alerta-titulo"
          label="Título"
          value={formData.titulo}
          onChange={(value) => setFormData((prev) => ({ ...prev, titulo: value }))}
          placeholder="Ej: Temperatura fuera de rango"
          error={errors.titulo}
        />

        <TextArea
          id="alerta-descripcion"
          label="Descripción"
          value={formData.descripcion}
          onChange={(value) => setFormData((prev) => ({ ...prev, descripcion: value }))}
          placeholder="Describe el evento para que el equipo actúe sin ambigüedad"
          rows={4}
          error={errors.descripcion}
        />
      </div>
    </Modal>
  );
});

NuevaAlertaModal.displayName = 'NuevaAlertaModal';
 