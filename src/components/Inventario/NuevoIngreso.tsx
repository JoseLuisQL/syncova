import React, { useCallback, useMemo, useState } from 'react';
import { CaretRight, Package, Syringe, MagicWand, Icon } from '@phosphor-icons/react';
import { Jeringa, Vacuna } from '../../types';
import { COMPONENT_STYLES, FILTER_OPTIONS } from './constants';
import {
  FormSection,
  Modal,
  ModalFooter,
  SelectInput,
  TextArea,
  TextInput,
  DateInput,
} from '../ui/ModalElements';

export type NuevoIngresoPayload =
  | {
      numero: string;
      fechaIngreso: string;
      fechaVencimiento: string;
      formaIngreso: '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
      comprobanteClase: 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
      numeroComprobante: string;
      cantidadInicial: number;
      observaciones?: string;
      vacunaId: string;
    }
  | {
      numero: string;
      fechaIngreso: string;
      fechaVencimiento?: string;
      formaIngreso: '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE';
      comprobanteClase: 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS';
      numeroComprobante: string;
      cantidadInicial: number;
      observaciones?: string;
      jeringaId: string;
    };

export interface NuevoIngresoSubmitResult {
  success: boolean;
  error?: string;
}

interface NuevoIngresoProps {
  onClose: () => void;
  onSuccess: (
    tipo: 'vacuna' | 'jeringa',
    data: NuevoIngresoPayload
  ) => Promise<NuevoIngresoSubmitResult> | NuevoIngresoSubmitResult;
  vacunas: Vacuna[];
  jeringas: Jeringa[];
  tipoFijo?: 'vacuna' | 'jeringa';
  isLoadingVacunas?: boolean;
  isLoadingJeringas?: boolean;
}

const NuevoIngreso: React.FC<NuevoIngresoProps> = ({
  onClose,
  onSuccess,
  vacunas,
  jeringas,
  tipoFijo,
  isLoadingVacunas = false,
  isLoadingJeringas = false,
}) => {
  const [step, setStep] = useState(tipoFijo ? 2 : 1);
  const [tipo, setTipo] = useState<'vacuna' | 'jeringa' | null>(tipoFijo || null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    numero: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    formaIngreso: '1° TRIMESTRE' as '1° TRIMESTRE' | '2° TRIMESTRE' | '3° TRIMESTRE' | '4° TRIMESTRE',
    comprobanteClase: 'PECOSA' as 'PECOSA' | 'GUIA' | 'TRASLADO' | 'OTROS',
    numeroComprobante: '',
    cantidadInicial: '',
    observaciones: '',
    vacunaId: '',
    jeringaId: '',
  });

  const activeItems = useMemo(() => {
    if (tipo === 'vacuna') {
      return vacunas.filter((vacuna) => vacuna.estado === 'activo');
    }
    if (tipo === 'jeringa') {
      return jeringas.filter((jeringa) => jeringa.estado === 'activo');
    }
    return [];
  }, [jeringas, tipo, vacunas]);

  const hasActiveOptions = activeItems.length > 0;
  const isLoading = tipo === 'vacuna' ? isLoadingVacunas : isLoadingJeringas;

  const validateForm = useCallback(() => {
    const nextErrors: Record<string, string> = {};
    const cantidad = Number(formData.cantidadInicial);

    if (!tipo) nextErrors.tipo = 'Debe seleccionar un tipo de ingreso';
    if (tipo === 'vacuna' && !formData.vacunaId) nextErrors.vacunaId = 'Debe seleccionar una vacuna';
    if (tipo === 'jeringa' && !formData.jeringaId) nextErrors.jeringaId = 'Debe seleccionar una jeringa';
    if (!formData.numero.trim()) nextErrors.numero = 'El numero de lote es obligatorio';
    if (!formData.numeroComprobante.trim()) nextErrors.numeroComprobante = 'El numero de comprobante es obligatorio';
    if (!Number.isFinite(cantidad) || cantidad <= 0) nextErrors.cantidadInicial = 'La cantidad debe ser mayor a 0';
    if (tipo === 'vacuna' && !formData.fechaVencimiento) {
      nextErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria para vacunas';
    }
    if (formData.fechaVencimiento) {
      const fecha = new Date(formData.fechaVencimiento);
      if (fecha.getTime() <= Date.now() && tipo === 'vacuna') {
        nextErrors.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a hoy';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData, tipo]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setServerError(null);
  }, []);

  const generateLoteNumber = useCallback(() => {
    const prefix =
      tipo === 'vacuna'
        ? (vacunas.find((vacuna) => vacuna.id === formData.vacunaId)?.nombre || 'VAC').slice(0, 3).toUpperCase()
        : 'JER';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    handleFieldChange('numero', `${prefix}-${year}-${random}`);
  }, [formData.vacunaId, handleFieldChange, tipo, vacunas]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !tipo) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const basePayload = {
        numero: formData.numero.trim(),
        fechaIngreso: formData.fechaIngreso,
        formaIngreso: formData.formaIngreso,
        comprobanteClase: formData.comprobanteClase,
        numeroComprobante: formData.numeroComprobante.trim(),
        cantidadInicial: Number(formData.cantidadInicial),
        observaciones: formData.observaciones.trim() || undefined,
      };

      const payload: NuevoIngresoPayload =
        tipo === 'vacuna'
          ? {
              ...basePayload,
              fechaVencimiento: formData.fechaVencimiento,
              vacunaId: formData.vacunaId,
            }
          : {
              ...basePayload,
              fechaVencimiento: formData.fechaVencimiento || undefined,
              jeringaId: formData.jeringaId,
            };

      const result = await onSuccess(tipo, payload);

      if (result.success) {
        onClose();
        return;
      }

      setServerError(result.error || 'No se pudo registrar el lote');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'No se pudo registrar el lote');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onClose, onSuccess, tipo, validateForm]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Nuevo Ingreso de Inventario"
      subtitle={tipoFijo ? `Registro directo de lote de ${tipoFijo}.` : 'Registre un nuevo lote con la menor cantidad de pasos posible.'}
      icon={tipo === 'jeringa' ? Syringe : Package}
      footer={
        step === 2 ? (
          <ModalFooter
            onCancel={onClose}
            onSubmit={handleSubmit}
            submitType="button"
            submitLabel={isSubmitting ? 'Registrando...' : 'Registrar Ingreso'}
            isLoading={isSubmitting}
            isSubmitDisabled={!hasActiveOptions || isLoading}
          />
        ) : undefined
      }
    >
      <div className="space-y-4">
        {!tipoFijo && step === 1 ? (
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-950">Que desea ingresar?</h3>
              <p className="mt-1 text-sm text-zinc-500">Seleccione el tipo de producto.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <TipoCard
                title="Vacunas"
                description="Registrar nuevo lote de vacunas"
                selected={tipo === 'vacuna'}
                icon={Package}
                onClick={() => setTipo('vacuna')}
              />
              <TipoCard
                title="Jeringas"
                description="Registrar nuevo lote de jeringas"
                selected={tipo === 'jeringa'}
                icon={Syringe}
                onClick={() => setTipo('jeringa')}
              />
            </div>

            {errors.tipo ? <p className={COMPONENT_STYLES.input.errorText}>{errors.tipo}</p> : null}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!tipo) {
                    setErrors({ tipo: 'Debe seleccionar un tipo de ingreso' });
                    return;
                  }
                  setStep(2);
                }}
                className={COMPONENT_STYLES.button.primary}
              >
                <span>Siguiente</span>
                <CaretRight className="h-4 w-4" weight="bold" />
              </button>
            </div>
          </section>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-semibold text-zinc-950">
                Datos del {tipo === 'vacuna' ? 'Lote de Vacuna' : 'Lote de Jeringa'}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">Complete solo la información necesaria para registrar el lote.</p>
            </div>

            {serverError ? (
              <div className="rounded-[22px] border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-800">
                {serverError}
              </div>
            ) : null}

            <FormSection title="Producto" description="Seleccione el insumo al que pertenece el lote.">
              <div className="grid gap-4 md:grid-cols-2">
                {tipo === 'vacuna' ? (
                  <SelectInput
                    id="nuevo-ingreso-vacuna"
                    label="Vacuna"
                    value={formData.vacunaId}
                    onChange={(value) => handleFieldChange('vacunaId', value)}
                    options={activeItems.map((item) => ({
                      value: item.id,
                      label: `${getVacunaLabel(item as Vacuna)}`,
                    }))}
                    placeholder={
                      isLoading
                        ? 'Cargando vacunas...'
                        : hasActiveOptions
                        ? 'Seleccionar vacuna'
                        : 'No hay vacunas activas disponibles'
                    }
                    required
                    error={errors.vacunaId}
                    disabled={!hasActiveOptions || isLoading}
                  />
                ) : (
                  <SelectInput
                    id="nuevo-ingreso-jeringa"
                    label="Jeringa"
                    value={formData.jeringaId}
                    onChange={(value) => handleFieldChange('jeringaId', value)}
                    options={activeItems.map((item) => ({
                      value: item.id,
                      label: `${getJeringaLabel(item as Jeringa)}`,
                    }))}
                    placeholder={
                      isLoading
                        ? 'Cargando jeringas...'
                        : hasActiveOptions
                        ? 'Seleccionar jeringa'
                        : 'No hay jeringas activas disponibles'
                    }
                    required
                    error={errors.jeringaId}
                    disabled={!hasActiveOptions || isLoading}
                  />
                )}
              </div>
            </FormSection>

            <FormSection title="Identificación" description="Datos mínimos para trazabilidad del lote.">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <TextInput
                    id="nuevo-ingreso-numero"
                    label="Numero de Lote"
                    value={formData.numero}
                    onChange={(value) => handleFieldChange('numero', value)}
                    placeholder="Ej: BCG-2024-001"
                    required
                    error={errors.numero}
                  />
                  <button type="button" onClick={generateLoteNumber} className={`${COMPONENT_STYLES.button.ghost} mt-2`}>
                    <MagicWand className="h-4 w-4" weight="bold" />
                    <span>Auto</span>
                  </button>
                </div>
                <TextInput
                  id="nuevo-ingreso-comprobante"
                  label="Numero de Comprobante"
                  value={formData.numeroComprobante}
                  onChange={(value) => handleFieldChange('numeroComprobante', value)}
                  placeholder="Ej: P-001-2024"
                  required
                  error={errors.numeroComprobante}
                />
              </div>
            </FormSection>

            <FormSection title="Fechas y stock" description="Información operativa para ingreso y control de vencimiento.">
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  id="nuevo-ingreso-cantidad"
                  label="Cantidad Inicial"
                  type="number"
                  value={formData.cantidadInicial}
                  onChange={(value) => handleFieldChange('cantidadInicial', value)}
                  placeholder="0"
                  required
                  error={errors.cantidadInicial}
                  min={1}
                />
                <DateInput
                  id="nuevo-ingreso-fecha"
                  label="Fecha de Ingreso"
                  value={formData.fechaIngreso}
                  onChange={(value) => handleFieldChange('fechaIngreso', value)}
                />
                <DateInput
                  id="nuevo-ingreso-vencimiento"
                  label={tipo === 'vacuna' ? 'Fecha de Vencimiento' : 'Fecha de Vencimiento'}
                  value={formData.fechaVencimiento}
                  onChange={(value) => handleFieldChange('fechaVencimiento', value)}
                  required={tipo === 'vacuna'}
                  error={errors.fechaVencimiento}
                />
                <SelectInput
                  id="nuevo-ingreso-forma"
                  label="Forma de Ingreso"
                  value={formData.formaIngreso}
                  onChange={(value) => handleFieldChange('formaIngreso', value)}
                  options={[...FILTER_OPTIONS.formaIngreso]}
                />
                <SelectInput
                  id="nuevo-ingreso-comprobante-clase"
                  label="Tipo de Comprobante"
                  value={formData.comprobanteClase}
                  onChange={(value) => handleFieldChange('comprobanteClase', value)}
                  options={[...FILTER_OPTIONS.comprobanteClase]}
                />
              </div>
            </FormSection>

            <FormSection title="Observaciones" description="Solo agregue notas si ayudan a entender el ingreso.">
              <TextArea
                id="nuevo-ingreso-observaciones"
                label="Observaciones"
                value={formData.observaciones}
                onChange={(value) => handleFieldChange('observaciones', value)}
                rows={3}
                placeholder="Observaciones adicionales (opcional)"
              />
            </FormSection>
          </>
        )}
      </div>
    </Modal>
  );
};

interface TipoCardProps {
  title: string;
  description: string;
  selected: boolean;
  icon: Icon;
  onClick: () => void;
}

const TipoCard: React.FC<TipoCardProps> = ({ title, description, selected, icon: Icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-[24px] border p-5 text-left transition ${
      selected ? 'border-zinc-900 bg-zinc-50 shadow-sm ring-1 ring-zinc-900' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
    }`}
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
      <Icon className="h-6 w-6" weight="duotone" />
    </div>
    <h4 className="text-lg font-semibold text-zinc-950">{title}</h4>
    <p className="mt-1 text-sm text-zinc-500">{description}</p>
  </button>
);

const getVacunaLabel = (vacuna: Vacuna) => `${vacuna.nombre || 'Sin nombre'} - ${vacuna.presentacion || 'Sin presentación'}`;
const getJeringaLabel = (jeringa: Jeringa) => `${jeringa.tipo} ${jeringa.capacidad} - ${jeringa.color}`;

export default NuevoIngreso;
