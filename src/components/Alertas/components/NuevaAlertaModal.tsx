import React, { memo, useCallback, useState } from 'react';
import { Bell } from '@phosphor-icons/react';
import {
  Modal,
  ModalFooter,
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

const PLANTILLAS_RAPIDAS = [
  {
    label: 'Cadena de frío',
    tipo: 'sistema',
    nivel: 'error',
    titulo: 'Excursión térmica en cámara frigorífica',
    descripcion: 'Se registró temperatura fuera del rango +2°C a +8°C. Verificar data logger y contingencia de biológicos.',
  },
  {
    label: 'Stock crítico',
    tipo: 'stock_bajo',
    nivel: 'warning',
    titulo: 'Abastecimiento prioritario requerido',
    descripcion: 'El saldo disponible es insuficiente para cubrir la demanda programada de la próxima semana.',
  },
  {
    label: 'Diferencia física',
    tipo: 'discrepancia',
    nivel: 'warning',
    titulo: 'Diferencia en conteo físico de lote',
    descripcion: 'Se identificó discrepancia entre el saldo del Kardex y el conteo físico en almacén.',
  },
] as const;

export const NuevaAlertaModal: React.FC<NuevaAlertaModalProps> = memo(({
  isOpen,
  onClose,
  onCrear,
  isCreating = false,
}) => {
  const [formData, setFormData] = useState({
    tipo: 'sistema',
    nivel: 'warning',
    titulo: '',
    descripcion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    if (!formData.titulo.trim()) nextErrors.titulo = 'El título del incidente es requerido.';
    if (!formData.descripcion.trim()) nextErrors.descripcion = 'La descripción operativa es requerida.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData.descripcion, formData.titulo]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    await onCrear(formData);
    setFormData({ tipo: 'sistema', nivel: 'warning', titulo: '', descripcion: '' });
    setErrors({});
  }, [formData, onCrear, validate]);

  const handleClose = useCallback(() => {
    setFormData({ tipo: 'sistema', nivel: 'warning', titulo: '', descripcion: '' });
    setErrors({});
    onClose();
  }, [onClose]);

  const handleApplyTemplate = (tpl: typeof PLANTILLAS_RAPIDAS[number]) => {
    setFormData({
      tipo: tpl.tipo,
      nivel: tpl.nivel,
      titulo: tpl.titulo,
      descripcion: tpl.descripcion,
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar alerta operativa"
      subtitle="Emite un aviso manual para seguimiento de cadena de frío, stock o incidencias de almacén."
      icon={Bell}
      size="lg"
      footer={(
        <ModalFooter
          onCancel={handleClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel="Registrar alerta"
          isLoading={isCreating}
          isSubmitDisabled={!formData.titulo.trim() || !formData.descripcion.trim()}
        />
      )}
    >
      <div className="space-y-4">
        {/* Plantillas rápidas para registro ágil */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-2">Plantillas rápidas</p>
          <div className="flex flex-wrap gap-1.5">
            {PLANTILLAS_RAPIDAS.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="rounded-lg border border-line bg-surface-soft px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selección visual de Categoría y Severidad */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-2">Categoría</label>
            <div className="grid grid-cols-2 gap-1.5">
              {TIPOS_ALERTA.map((tipo) => {
                const Icon = tipo.icon;
                const isSelected = formData.tipo === tipo.id;
                return (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, tipo: tipo.id }))}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-brand bg-surface-tint text-ink font-semibold'
                        : 'border-line bg-surface text-muted-2 hover:text-ink'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${tipo.color}`} weight="fill" />
                    <span className="truncate">{tipo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-2">Nivel de severidad</label>
            <div className="grid grid-cols-2 gap-1.5">
              {NIVELES_ALERTA.map((nivel) => {
                const Icon = nivel.icon;
                const isSelected = formData.nivel === nivel.id;
                return (
                  <button
                    key={nivel.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, nivel: nivel.id }))}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-brand bg-surface-tint text-ink font-semibold'
                        : 'border-line bg-surface text-muted-2 hover:text-ink'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${nivel.color}`} weight="fill" />
                    <span className="truncate">{nivel.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <TextInput
          id="alerta-titulo"
          label="Título del incidente"
          value={formData.titulo}
          onChange={(value) => setFormData((prev) => ({ ...prev, titulo: value }))}
          placeholder="Ej: Lote de vacuna BCG próximo a vencer en Almacén Central"
          error={errors.titulo}
        />

        <TextArea
          id="alerta-descripcion"
          label="Descripción y acción recomendada"
          value={formData.descripcion}
          onChange={(value) => setFormData((prev) => ({ ...prev, descripcion: value }))}
          placeholder="Detalla el lote, biológico, establecimiento o acción requerida por el equipo..."
          rows={4}
          error={errors.descripcion}
        />
      </div>
    </Modal>
  );
});

NuevaAlertaModal.displayName = 'NuevaAlertaModal';