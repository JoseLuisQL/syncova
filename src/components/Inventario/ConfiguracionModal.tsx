import React, { useCallback, useMemo, useState } from 'react';
import { SlidersHorizontal } from '@phosphor-icons/react';
import { apiClient } from '../../config/api';
import {
  Modal,
  ModalFooter,
  MultiSelectInput,
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
    vacunaIds: [] as string[],
    jeringaIds: [] as string[],
    multiplicador: '1',
    prioridad: '1',
    activo: 'true',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editingConfig);

  // Sincronizar formData con editingConfig al abrir sin causar flash stale
  const [lastKey, setLastKey] = useState<string | null>(null);
  const currentKey = `${isOpen ? 'open' : 'closed'}:${
    editingConfig ? ('id' in editingConfig ? editingConfig.id : 'edit') : 'new'
  }`;
  if (currentKey !== lastKey) {
    setLastKey(currentKey);
    if (isOpen) {
      if (editingConfig) {
        setFormData({
          centroAcopioId: 'centroAcopioId' in editingConfig ? editingConfig.centroAcopioId : '',
          vacunaIds: [editingConfig.vacunaId],
          jeringaIds: [editingConfig.jeringaId],
          multiplicador: String(editingConfig.multiplicador),
          prioridad: String(editingConfig.prioridad),
          activo: String(editingConfig.activo),
        });
      } else {
        setFormData({
          centroAcopioId: '',
          vacunaIds: [],
          jeringaIds: [],
          multiplicador: '1',
          prioridad: '1',
          activo: 'true',
        });
      }
      setErrors({});
    }
  }

  const vacunaOptions = useMemo(
    () =>
      vacunas
        .slice()
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((vacuna) => ({
          value: vacuna.id,
          label: vacuna.presentacion ? `${vacuna.nombre} (${vacuna.presentacion})` : vacuna.nombre,
        })),
    [vacunas],
  );

  const jeringaOptions = useMemo(
    () =>
      jeringas
        .slice()
        .sort((a, b) => `${a.tipo} ${a.capacidad}`.localeCompare(`${b.tipo} ${b.capacidad}`))
        .map((jeringa) => ({
          value: jeringa.id,
          label: `${jeringa.tipo} ${jeringa.capacidad}${jeringa.color ? ` (${jeringa.color})` : ''}`,
        })),
    [jeringas],
  );

  const centroOptions = useMemo(
    () =>
      centrosAcopio.map((centro) => ({
        value: centro.id,
        label: centro.codigo ? `${centro.nombre} (${centro.codigo})` : centro.nombre,
      })),
    [centrosAcopio],
  );

  const combinationsCount = formData.vacunaIds.length * formData.jeringaIds.length;

  const handleChange = useCallback((field: string, value: string | string[]) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    const multiplicador = Number(formData.multiplicador);
    const prioridad = Number(formData.prioridad);

    if (tipo === 'centro' && !formData.centroAcopioId) {
      nextErrors.centroAcopioId = 'Seleccione un centro de acopio';
    }
    if (formData.vacunaIds.length === 0) {
      nextErrors.vacunaIds = isEditing ? 'Seleccione una vacuna' : 'Seleccione al menos una vacuna';
    }
    if (formData.jeringaIds.length === 0) {
      nextErrors.jeringaIds = isEditing ? 'Seleccione una jeringa' : 'Seleccione al menos una jeringa';
    }
    if (!Number.isFinite(multiplicador) || multiplicador < 0) {
      nextErrors.multiplicador = 'Debe ser mayor o igual a 0';
    }
    if (!Number.isFinite(prioridad) || prioridad <= 0) {
      nextErrors.prioridad = 'Debe ser mayor a 0';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData, isEditing, tipo]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const basePayload = {
        ...(tipo === 'centro' ? { centroAcopioId: formData.centroAcopioId } : {}),
        multiplicador: Number(formData.multiplicador),
        prioridad: Number(formData.prioridad),
        activo: formData.activo === 'true',
      };

      if (isEditing && editingConfig) {
        const endpoint = `/configuracion-jeringa-vacuna/${tipo}/${editingConfig.id}`;
        const payload = {
          ...basePayload,
          vacunaId: formData.vacunaIds[0],
          jeringaId: formData.jeringaIds[0],
        };

        const response = await apiClient.put(endpoint, payload);
        if (!response.data.success) {
          throw new Error(response.data.message || 'No se pudo guardar la configuración');
        }

        onNotification('success', 'Configuración actualizada correctamente');
        onSuccess();
        return;
      }

      const endpoint = `/configuracion-jeringa-vacuna/${tipo}`;
      const combinations = formData.vacunaIds.flatMap((vacunaId) =>
        formData.jeringaIds.map((jeringaId) => ({ vacunaId, jeringaId })),
      );

      const results = await Promise.allSettled(
        combinations.map((combo) => apiClient.post(endpoint, { ...basePayload, ...combo })),
      );

      const succeeded: typeof combinations = [];
      const duplicated: typeof combinations = [];
      const failed: Array<{ combo: (typeof combinations)[number]; message: string }> = [];

      results.forEach((result, index) => {
        const combo = combinations[index];
        if (result.status === 'fulfilled' && result.value.data?.success) {
          succeeded.push(combo);
          return;
        }

        const errorMessage =
          result.status === 'fulfilled'
            ? result.value.data?.message || 'Error desconocido'
            : result.reason?.response?.data?.message ||
              result.reason?.response?.data?.error ||
              result.reason?.message ||
              'Error desconocido';

        if (/ya existe/i.test(errorMessage)) {
          duplicated.push(combo);
        } else {
          failed.push({ combo, message: errorMessage });
        }
      });

      const total = combinations.length;
      const successCount = succeeded.length;
      const duplicatedCount = duplicated.length;
      const failedCount = failed.length;

      if (successCount === total) {
        onNotification(
          'success',
          total === 1
            ? 'Configuración creada correctamente'
            : `Se crearon ${successCount} configuraciones correctamente`,
        );
        onSuccess();
        return;
      }

      if (successCount > 0) {
        const parts: string[] = [`${successCount} creada${successCount === 1 ? '' : 's'}`];
        if (duplicatedCount > 0) parts.push(`${duplicatedCount} ya existía${duplicatedCount === 1 ? '' : 'n'}`);
        if (failedCount > 0) parts.push(`${failedCount} con error`);
        onNotification('info', parts.join(' · '));
        onSuccess();
        return;
      }

      if (duplicatedCount === total) {
        onNotification(
          'info',
          total === 1
            ? 'La configuración ya existe para esta combinación'
            : `Las ${total} combinaciones ya están configuradas`,
        );
        return;
      }

      const firstError = failed[0]?.message || 'No se pudo crear ninguna configuración';
      onNotification('error', firstError);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const message =
        err.response?.data?.message || err.response?.data?.error || err.message || 'No se pudo guardar la configuración';
      onNotification('error', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingConfig, formData, isEditing, onNotification, onSuccess, tipo, validate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar asignación' : 'Nueva asignación vacuna - jeringa'}
      subtitle={
        tipo === 'centro'
          ? 'Regla de insumos aplicable exclusivamente al centro de acopio seleccionado.'
          : 'Regla general por defecto aplicada a todos los centros del sistema.'
      }
      icon={SlidersHorizontal}
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitType="button"
          submitLabel={
            isEditing
              ? 'Guardar cambios'
              : combinationsCount > 1
              ? `Crear ${combinationsCount} asignaciones`
              : 'Crear asignación'
          }
          isLoading={isSubmitting}
        />
      }
    >
      <div className="space-y-4">
        {/* Ámbito si es por centro */}
        {tipo === 'centro' && (
          <div>
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
          </div>
        )}

        {/* Selección de Insumos */}
        {isEditing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              id="config-vacuna"
              label="Vacuna"
              value={formData.vacunaIds[0] || ''}
              onChange={(value) => handleChange('vacunaIds', value ? [value] : [])}
              options={vacunaOptions}
              placeholder="Seleccionar vacuna..."
              required
              error={errors.vacunaIds}
            />

            <SelectInput
              id="config-jeringa"
              label="Jeringa"
              value={formData.jeringaIds[0] || ''}
              onChange={(value) => handleChange('jeringaIds', value ? [value] : [])}
              options={jeringaOptions}
              placeholder="Seleccionar jeringa..."
              required
              error={errors.jeringaIds}
            />
          </div>
        ) : (
          <div className="space-y-3.5">
            <MultiSelectInput
              id="config-vacuna"
              label="Vacunas"
              values={formData.vacunaIds}
              onChange={(values) => handleChange('vacunaIds', values)}
              options={vacunaOptions}
              placeholder="Seleccionar una o más vacunas..."
              searchPlaceholder="Buscar vacuna..."
              itemLabel="vacuna"
              itemLabelPlural="vacunas"
              required
              error={errors.vacunaIds}
            />

            <MultiSelectInput
              id="config-jeringa"
              label="Jeringas"
              values={formData.jeringaIds}
              onChange={(values) => handleChange('jeringaIds', values)}
              options={jeringaOptions}
              placeholder="Seleccionar una o más jeringas..."
              searchPlaceholder="Buscar jeringa..."
              itemLabel="jeringa"
              itemLabelPlural="jeringas"
              required
              error={errors.jeringaIds}
            />

            {!isEditing && combinationsCount > 1 && (
              <p className="text-xs text-muted-2">
                Se generarán <span className="font-medium text-ink">{combinationsCount} reglas</span> ({formData.vacunaIds.length} vacunas × {formData.jeringaIds.length} jeringas). Las combinaciones existentes se omitirán automáticamente.
              </p>
            )}
          </div>
        )}

        {/* Parámetros Operativos */}
        <div className="border-t border-line-soft pt-4">
          <div className="grid gap-3.5 sm:grid-cols-3">
            <TextInput
              id="config-multiplicador"
              label="Jeringas por dosis"
              type="number"
              value={formData.multiplicador}
              onChange={(value) => handleChange('multiplicador', value)}
              error={errors.multiplicador}
              placeholder="1"
              min={0}
              required
              helpText="Ratio por cada dosis aplicada"
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
              helpText="1 = Primera opción sugerida"
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
              helpText="Disponibilidad en dispensación"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfiguracionModal;
