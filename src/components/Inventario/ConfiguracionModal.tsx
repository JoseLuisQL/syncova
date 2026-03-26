import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, SlidersHorizontal, Syringe, Warehouse } from '@phosphor-icons/react';
import { apiClient } from '../../config/api';
import {
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextInput,
} from '../ui/ModalElements';

interface Vacuna {
  id: string;
  nombre: string;
  tipo: string;
  presentacion: string;
  dosisPorFrasco: number;
}

interface Jeringa {
  id: string;
  tipo: string;
  capacidad: string;
  color: string;
}

interface CentroAcopio {
  id: string;
  nombre: string;
  codigo: string;
}

interface ConfiguracionDefecto {
  id: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad: number;
  activo: boolean;
  vacuna?: Vacuna;
  jeringa?: Jeringa;
}

interface ConfiguracionCentro {
  id: string;
  centroAcopioId: string;
  vacunaId: string;
  jeringaId: string;
  multiplicador: number;
  prioridad: number;
  activo: boolean;
  centroAcopio?: CentroAcopio;
  vacuna?: Vacuna;
  jeringa?: Jeringa;
}

interface ConfiguracionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipo: 'defecto' | 'centro';
  editingConfig?: ConfiguracionDefecto | ConfiguracionCentro | null;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  centrosAcopio: CentroAcopio[];
  onNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tipo,
  editingConfig,
  vacunas,
  jeringas,
  centrosAcopio,
  onNotification,
}) => {
  const [formData, setFormData] = useState({
    centroAcopioId: '',
    vacunaId: '',
    jeringaId: '',
    multiplicador: '1',
    prioridad: '1',
    activo: 'true',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingConfig) {
      setFormData({
        centroAcopioId: 'centroAcopioId' in editingConfig ? editingConfig.centroAcopioId : '',
        vacunaId: editingConfig.vacunaId,
        jeringaId: editingConfig.jeringaId,
        multiplicador: String(editingConfig.multiplicador),
        prioridad: String(editingConfig.prioridad),
        activo: String(editingConfig.activo),
      });
    } else {
      setFormData({
        centroAcopioId: '',
        vacunaId: '',
        jeringaId: '',
        multiplicador: '1',
        prioridad: '1',
        activo: 'true',
      });
    }

    setErrors({});
  }, [editingConfig, isOpen]);

  const vacunaOptions = useMemo(() => vacunas.map((vacuna) => ({ value: vacuna.id, label: vacuna.nombre })), [vacunas]);
  const jeringaOptions = useMemo(
    () => jeringas.map((jeringa) => ({ value: jeringa.id, label: `${jeringa.tipo} ${jeringa.capacidad} · ${jeringa.color}` })),
    [jeringas],
  );
  const centroOptions = useMemo(
    () => centrosAcopio.map((centro) => ({ value: centro.id, label: centro.codigo ? `${centro.nombre} (${centro.codigo})` : centro.nombre })),
    [centrosAcopio],
  );

  const selectedVacuna = vacunas.find((vacuna) => vacuna.id === formData.vacunaId);
  const selectedJeringa = jeringas.find((jeringa) => jeringa.id === formData.jeringaId);
  const selectedCentro = centrosAcopio.find((centro) => centro.id === formData.centroAcopioId);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    const multiplicador = Number(formData.multiplicador);
    const prioridad = Number(formData.prioridad);

    if (tipo === 'centro' && !formData.centroAcopioId) nextErrors.centroAcopioId = 'Seleccione un centro.';
    if (!formData.vacunaId) nextErrors.vacunaId = 'Seleccione una vacuna.';
    if (!formData.jeringaId) nextErrors.jeringaId = 'Seleccione una jeringa.';
    if (!Number.isFinite(multiplicador) || multiplicador < 0) nextErrors.multiplicador = 'Debe ser un número mayor o igual a 0.';
    if (!Number.isFinite(prioridad) || prioridad <= 0) nextErrors.prioridad = 'La prioridad debe ser mayor a 0.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData, tipo]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const endpoint = editingConfig
        ? `/configuracion-jeringa-vacuna/${tipo}/${editingConfig.id}`
        : `/configuracion-jeringa-vacuna/${tipo}`;

      const payload =
        tipo === 'centro'
          ? {
              centroAcopioId: formData.centroAcopioId,
              vacunaId: formData.vacunaId,
              jeringaId: formData.jeringaId,
              multiplicador: Number(formData.multiplicador),
              prioridad: Number(formData.prioridad),
              activo: formData.activo === 'true',
            }
          : {
              vacunaId: formData.vacunaId,
              jeringaId: formData.jeringaId,
              multiplicador: Number(formData.multiplicador),
              prioridad: Number(formData.prioridad),
              activo: formData.activo === 'true',
            };

      const response = editingConfig ? await apiClient.put(endpoint, payload) : await apiClient.post(endpoint, payload);

      if (!response.data.success) {
        throw new Error(response.data.message || 'No se pudo guardar la configuración');
      }

      onNotification('success', `Configuración ${editingConfig ? 'actualizada' : 'creada'} correctamente`);
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'No se pudo guardar la configuración';
      onNotification('error', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingConfig, formData, onNotification, onSuccess, tipo, validate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingConfig ? 'Editar configuración' : 'Nueva configuración'}
      subtitle={tipo === 'centro' ? 'Relación específica para un centro de acopio.' : 'Relación por defecto entre vacuna y jeringa.'}
      icon={SlidersHorizontal}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={editingConfig ? 'Guardar cambios' : 'Crear configuración'}
          isLoading={isSubmitting}
        />
      }
    >
      <div className="space-y-4">
        <div className="rounded-[18px] border border-zinc-200 bg-zinc-50/60 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-zinc-700">Vista previa</p>
          <p className="mt-2 text-sm leading-6 text-slate-800">
            {selectedVacuna ? (
              <>
                Para <span className="font-semibold text-slate-950">{selectedVacuna.nombre}</span>{' '}
                {selectedJeringa ? (
                  <>
                    se usará <span className="font-semibold text-slate-950">{selectedJeringa.tipo} {selectedJeringa.capacidad}</span>.
                  </>
                ) : (
                  <>debe elegir una jeringa.</>
                )}
              </>
            ) : (
              <>Seleccione una vacuna y una jeringa para construir la regla.</>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {tipo === 'centro'
              ? selectedCentro
                ? `Aplicará solo en ${selectedCentro.nombre}.`
                : 'Aplicará solo al centro seleccionado.'
              : 'Aplicará como regla general cuando no exista una regla específica por centro.'}
          </p>
        </div>

        <FormSection title="Relación" description="Defina de forma directa qué jeringa corresponde a la vacuna.">
          <div className="grid gap-4 md:grid-cols-2">
            {tipo === 'centro' ? (
              <SelectInput
                id="config-centro"
                label="Centro de acopio"
                value={formData.centroAcopioId}
                onChange={(value) => handleChange('centroAcopioId', value)}
                options={centroOptions}
                placeholder="Seleccionar centro..."
                required
                error={errors.centroAcopioId}
              />
            ) : null}

            <SelectInput
              id="config-vacuna"
              label="Vacuna"
              value={formData.vacunaId}
              onChange={(value) => handleChange('vacunaId', value)}
              options={vacunaOptions}
              placeholder="Seleccionar vacuna..."
              required
              error={errors.vacunaId}
            />

            <SelectInput
              id="config-jeringa"
              label="Jeringa"
              value={formData.jeringaId}
              onChange={(value) => handleChange('jeringaId', value)}
              options={jeringaOptions}
              placeholder="Seleccionar jeringa..."
              required
              error={errors.jeringaId}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {tipo === 'centro' ? (
              <ResumeCard icon={Warehouse} label="Centro" value={selectedCentro?.nombre || 'Pendiente'} />
            ) : null}
            <ResumeCard icon={Package} label="Vacuna" value={selectedVacuna?.nombre || 'Pendiente'} />
            <ResumeCard icon={Syringe} label="Jeringa" value={selectedJeringa ? `${selectedJeringa.tipo} ${selectedJeringa.capacidad}` : 'Pendiente'} />
          </div>
        </FormSection>

        <FormSection title="Regla de uso" description="Solo configure multiplicador, prioridad y estado.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              id="config-multiplicador"
              label="Multiplicador"
              type="number"
              value={formData.multiplicador}
              onChange={(value) => handleChange('multiplicador', value)}
              error={errors.multiplicador}
              placeholder="1"
              min={0}
              required
            />
            <TextInput
              id="config-prioridad"
              label="Prioridad"
              type="number"
              value={formData.prioridad}
              onChange={(value) => handleChange('prioridad', value)}
              error={errors.prioridad}
              placeholder="1"
              min={1}
              required
            />
            <SelectInput
              id="config-activo"
              label="Estado"
              value={formData.activo}
              onChange={(value) => handleChange('activo', value)}
              options={[
                { value: 'true', label: 'Activa' },
                { value: 'false', label: 'Inactiva' },
              ]}
            />
          </div>
        </FormSection>
      </div>
    </Modal>
  );
};

interface ResumeCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-center gap-2 text-slate-500">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-[0.08em]">{label}</span>
    </div>
    <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
  </div>
);

export default ConfiguracionModal;
