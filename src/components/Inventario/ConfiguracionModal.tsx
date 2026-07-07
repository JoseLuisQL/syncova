import React, { useCallback, useMemo, useState } from 'react';
import { Package, SlidersHorizontal, Stack, Syringe, Warehouse } from '@phosphor-icons/react';
import { apiClient } from '../../config/api';
import {
  FormSection,
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

  // Sincronizar formData con editingConfig al abrir (ajuste durante el render,
  // sin useEffect — evita el flash de estado stale que marca react-doctor).
  const [lastKey, setLastKey] = useState<string | null>(null);
  const currentKey = `${isOpen ? 'open' : 'closed'}:${editingConfig ? ('id' in editingConfig ? editingConfig.id : 'edit') : 'new'}`;
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
          label: vacuna.presentacion ? `${vacuna.nombre} · ${vacuna.presentacion}` : vacuna.nombre,
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
          label: `${jeringa.tipo} ${jeringa.capacidad}${jeringa.color ? ` · ${jeringa.color}` : ''}`,
        })),
    [jeringas],
  );
  const centroOptions = useMemo(
    () => centrosAcopio.map((centro) => ({ value: centro.id, label: centro.codigo ? `${centro.nombre} (${centro.codigo})` : centro.nombre })),
    [centrosAcopio],
  );

  const selectedVacunas = useMemo(() => {
    const idSet = new Set(formData.vacunaIds);
    return vacunas.filter((vacuna) => idSet.has(vacuna.id));
  }, [formData.vacunaIds, vacunas]);
  const selectedJeringas = useMemo(() => {
    const idSet = new Set(formData.jeringaIds);
    return jeringas.filter((jeringa) => idSet.has(jeringa.id));
  }, [formData.jeringaIds, jeringas]);
  const selectedCentro = centrosAcopio.find((centro) => centro.id === formData.centroAcopioId);

  const combinationsCount = formData.vacunaIds.length * formData.jeringaIds.length;

  const handleChange = useCallback((field: string, value: string | string[]) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    const multiplicador = Number(formData.multiplicador);
    const prioridad = Number(formData.prioridad);

    if (tipo === 'centro' && !formData.centroAcopioId) nextErrors.centroAcopioId = 'Seleccione un centro.';
    if (formData.vacunaIds.length === 0) nextErrors.vacunaIds = isEditing ? 'Seleccione una vacuna.' : 'Seleccione al menos una vacuna.';
    if (formData.jeringaIds.length === 0) nextErrors.jeringaIds = isEditing ? 'Seleccione una jeringa.' : 'Seleccione al menos una jeringa.';
    if (!Number.isFinite(multiplicador) || multiplicador < 0) nextErrors.multiplicador = 'Debe ser un número mayor o igual a 0.';
    if (!Number.isFinite(prioridad) || prioridad <= 0) nextErrors.prioridad = 'La prioridad debe ser mayor a 0.';

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

        const errorMessage = result.status === 'fulfilled'
          ? result.value.data?.message || 'Error desconocido'
          : (result.reason?.response?.data?.message
            || result.reason?.response?.data?.error
            || result.reason?.message
            || 'Error desconocido');

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
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'No se pudo guardar la configuración';
      onNotification('error', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingConfig, formData, isEditing, onNotification, onSuccess, tipo, validate]);

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
          submitLabel={
            isEditing
              ? 'Guardar cambios'
              : combinationsCount > 1
              ? `Crear ${combinationsCount} configuraciones`
              : 'Crear configuración'
          }
          isLoading={isSubmitting}
        />
      }
    >
      <div className="space-y-4">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50/60 p-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-zinc-700">Vista previa</p>
          <p className="mt-2 text-sm leading-6 text-zinc-800">
            {isEditing ? (
              selectedVacunas[0] ? (
                <>
                  Para <span className="font-semibold text-zinc-950">{selectedVacunas[0].nombre}</span>{' '}
                  {selectedJeringas[0] ? (
                    <>
                      se usará{' '}
                      <span className="font-semibold text-zinc-950">
                        {selectedJeringas[0].tipo} {selectedJeringas[0].capacidad}
                      </span>
                      .
                    </>
                  ) : (
                    <>debe elegir una jeringa.</>
                  )}
                </>
              ) : (
                <>Seleccione una vacuna y una jeringa para construir la regla.</>
              )
            ) : combinationsCount === 0 ? (
              <>Seleccione al menos una vacuna y una jeringa para construir las reglas.</>
            ) : combinationsCount === 1 ? (
              <>
                Para <span className="font-semibold text-zinc-950">{selectedVacunas[0].nombre}</span> se usará{' '}
                <span className="font-semibold text-zinc-950">
                  {selectedJeringas[0].tipo} {selectedJeringas[0].capacidad}
                </span>
                .
              </>
            ) : (
              <>
                Se crearán{' '}
                <span className="font-semibold text-zinc-950">{combinationsCount} configuraciones</span> ·{' '}
                <span className="text-zinc-700">
                  {formData.vacunaIds.length} vacuna{formData.vacunaIds.length === 1 ? '' : 's'} × {formData.jeringaIds.length}{' '}
                  jeringa{formData.jeringaIds.length === 1 ? '' : 's'}
                </span>
                .
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            {tipo === 'centro'
              ? selectedCentro
                ? `Aplicará solo en ${selectedCentro.nombre}.`
                : 'Aplicará solo al centro seleccionado.'
              : 'Aplicará como regla general cuando no exista una regla específica por centro.'}
          </p>
          {!isEditing && combinationsCount > 1 ? (
            <p className="mt-2 text-xs leading-4 text-amber-700">
              Si alguna combinación ya existe, se omitirá automáticamente y el resto se creará.
            </p>
          ) : null}
        </div>

        <FormSection title="Relación" description="Defina de forma directa qué jeringa corresponde a la vacuna.">
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

          {isEditing ? (
            <div className="grid gap-4 md:grid-cols-2">
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
            <div className="space-y-4">
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
                helpText="Puede seleccionar varias vacunas; se aplicará la misma regla a todas."
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
                helpText="Cada vacuna seleccionada se relacionará con cada jeringa elegida."
              />
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            {tipo === 'centro' ? (
              <ResumeCard icon={Warehouse} label="Centro" value={selectedCentro?.nombre || 'Pendiente'} />
            ) : null}
            <ResumeCard
              icon={Package}
              label={isEditing || selectedVacunas.length <= 1 ? 'Vacuna' : 'Vacunas'}
              value={
                selectedVacunas.length === 0
                  ? 'Pendiente'
                  : selectedVacunas.length === 1
                  ? selectedVacunas[0].nombre
                  : `${selectedVacunas.length} seleccionadas`
              }
            />
            <ResumeCard
              icon={isEditing || selectedJeringas.length <= 1 ? Syringe : Stack}
              label={isEditing || selectedJeringas.length <= 1 ? 'Jeringa' : 'Jeringas'}
              value={
                selectedJeringas.length === 0
                  ? 'Pendiente'
                  : selectedJeringas.length === 1
                  ? `${selectedJeringas[0].tipo} ${selectedJeringas[0].capacidad}`
                  : `${selectedJeringas.length} seleccionadas`
              }
            />
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
  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
    <div className="flex items-center gap-2 text-zinc-500">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-[0.08em]">{label}</span>
    </div>
    <p className="mt-2 text-sm font-medium text-zinc-900">{value}</p>
  </div>
);

export default ConfiguracionModal;
