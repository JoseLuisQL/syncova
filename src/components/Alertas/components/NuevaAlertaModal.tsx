import React, { memo, useState, useCallback } from 'react';
import { X, Bell, Loader2 } from 'lucide-react';
import { COMPONENT_STYLES, TIPOS_ALERTA, NIVELES_ALERTA } from '../constants';

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El titulo es requerido';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripcion es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onCrear(formData);
    setFormData({ tipo: 'sistema', nivel: 'info', titulo: '', descripcion: '' });
    setErrors({});
  }, [formData, validate, onCrear]);

  const handleClose = useCallback(() => {
    setFormData({ tipo: 'sistema', nivel: 'info', titulo: '', descripcion: '' });
    setErrors({});
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className={COMPONENT_STYLES.modal.overlay}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`${COMPONENT_STYLES.modal.container} max-w-lg`}>
        <div className={COMPONENT_STYLES.modal.header}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                Nueva Alerta
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={COMPONENT_STYLES.modal.body}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tipo" className={COMPONENT_STYLES.input.label}>
                    Tipo <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
                  >
                    {TIPOS_ALERTA.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="nivel" className={COMPONENT_STYLES.input.label}>
                    Nivel <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="nivel"
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
                  >
                    {NIVELES_ALERTA.map((nivel) => (
                      <option key={nivel.id} value={nivel.id}>{nivel.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="titulo" className={COMPONENT_STYLES.input.label}>
                  Titulo <span className="text-rose-500">*</span>
                </label>
                <input
                  id="titulo"
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Titulo de la alerta"
                  className={`${COMPONENT_STYLES.input.base} ${
                    errors.titulo ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                  }`}
                />
                {errors.titulo && (
                  <p className={COMPONENT_STYLES.input.errorText}>{errors.titulo}</p>
                )}
              </div>

              <div>
                <label htmlFor="descripcion" className={COMPONENT_STYLES.input.label}>
                  Descripcion <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="descripcion"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripcion detallada de la alerta"
                  className={`${COMPONENT_STYLES.input.base} ${
                    errors.descripcion ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                  } resize-none`}
                />
                {errors.descripcion && (
                  <p className={COMPONENT_STYLES.input.errorText}>{errors.descripcion}</p>
                )}
              </div>
            </div>
          </div>

          <div className={COMPONENT_STYLES.modal.footer}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className={COMPONENT_STYLES.button.secondary}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className={COMPONENT_STYLES.button.primary}
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Crear Alerta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

NuevaAlertaModal.displayName = 'NuevaAlertaModal';
