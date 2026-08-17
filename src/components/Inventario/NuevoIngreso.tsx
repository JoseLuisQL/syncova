import React, { useCallback, useMemo, useState } from 'react';
import {
  CaretRight,
  Package,
  Syringe,
  MagicWand,
  Icon,
  FileText,
  Barcode,
  ChatText,
  Warning,
  Thermometer,
  HourglassHigh,
} from '@phosphor-icons/react';
import { Jeringa, Vacuna } from '../../types';
import { COMPONENT_STYLES, FILTER_OPTIONS } from './constants';
import {
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

const getNeedleColorHex = (colorName?: string): string => {
  if (!colorName) return '#94a3b8';
  const c = colorName.toLowerCase();
  if (c.includes('amarill')) return '#eab308';
  if (c.includes('azul')) return '#3b82f6';
  if (c.includes('naranj')) return '#f97316';
  if (c.includes('ver')) return '#22c55e';
  if (c.includes('negro') || c.includes('gris')) return '#334155';
  if (c.includes('marron') || c.includes('caf')) return '#854d0e';
  if (c.includes('rosad') || c.includes('rosa')) return '#ec4899';
  if (c.includes('morad') || c.includes('violet')) return '#a855f7';
  if (c.includes('transp') || c.includes('blanc')) return '#cbd5e1';
  return '#0d9488';
};

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

  const selectedVacuna = useMemo(() => {
    if (tipo === 'vacuna' && formData.vacunaId) {
      return vacunas.find((v) => v.id === formData.vacunaId) || null;
    }
    return null;
  }, [formData.vacunaId, tipo, vacunas]);

  const selectedJeringa = useMemo(() => {
    if (tipo === 'jeringa' && formData.jeringaId) {
      return jeringas.find((j) => j.id === formData.jeringaId) || null;
    }
    return null;
  }, [formData.jeringaId, jeringas, tipo]);

  const vencimientoStatus = useMemo(() => {
    if (!formData.fechaVencimiento) return null;
    const vencDate = new Date(formData.fechaVencimiento);
    if (Number.isNaN(vencDate.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = vencDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { status: 'vencido', text: 'Fecha vencida o igual a hoy', color: 'text-rose-600' };
    }
    if (diffDays <= 30) {
      return { status: 'por_vencer', text: `Vence en ${diffDays} días (por vencer)`, color: 'text-amber-600' };
    }
    const diffMonths = Math.floor(diffDays / 30.4);
    return {
      status: 'vigente',
      text: diffMonths > 0 ? `Vigente (~${diffMonths} meses de vida útil)` : `Vigente (${diffDays} días)`,
      color: 'text-emerald-700',
    };
  }, [formData.fechaVencimiento]);

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
        ? (vacunas.find((vacuna) => vacuna.id === formData.vacunaId)?.nombre || 'VAC')
            .replace(/[^a-zA-Z0-9]/g, '')
            .slice(0, 3)
            .toUpperCase()
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
      subtitle={
        tipoFijo
          ? `Registro directo de lote de ${tipoFijo}.`
          : 'Registre un nuevo lote en el almacén con trazabilidad completa.'
      }
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
      <div className="space-y-6">
        {!tipoFijo && step === 1 ? (
          <section className="space-y-4">
            <div className="border-b border-line-soft pb-3">
              <h3 className="text-base font-semibold text-ink">¿Qué desea ingresar?</h3>
              <p className="mt-0.5 text-xs text-muted-2">
                Seleccione la categoría del insumo para configurar el formulario de ingreso.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TipoCard
                title="Vacunas"
                description="Lotes de biológicos con control de dosis y cadena de frío."
                selected={tipo === 'vacuna'}
                icon={Package}
                onClick={() => setTipo('vacuna')}
              />
              <TipoCard
                title="Jeringas"
                description="Lotes de insumos y dispositivos de aplicación médica."
                selected={tipo === 'jeringa'}
                icon={Syringe}
                onClick={() => setTipo('jeringa')}
              />
            </div>

            {errors.tipo ? <p className={COMPONENT_STYLES.input.errorText}>{errors.tipo}</p> : null}

            <div className="flex justify-end pt-2">
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
            {/* Header context */}
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-ink">
                  Datos del {tipo === 'vacuna' ? 'Lote de Vacuna' : 'Lote de Jeringa'}
                </h3>
                <p className="mt-0.5 text-xs text-muted-2">
                  Complete los datos del insumo, comprobante de origen y lote físico para el almacén.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                {tipo === 'vacuna' ? 'Biológico' : 'Dispositivo Médico'}
              </span>
            </div>

            {serverError ? (
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/90 p-3.5 text-sm text-rose-800">
                <Warning className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" weight="fill" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900">Error al registrar ingreso</p>
                  <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">{serverError}</p>
                </div>
              </div>
            ) : null}

            {/* SECCIÓN 1: INSUMO / PRODUCTO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-line-soft pb-1.5">
                <Package className="h-4 w-4 text-teal-700" weight="duotone" />
                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  1. Insumo / Producto
                </h4>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {tipo === 'vacuna' ? (
                  <div className="md:col-span-2">
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
                  </div>
                ) : (
                  <div className="md:col-span-2">
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
                  </div>
                )}
              </div>

              {/* Insumo Selected Preview */}
              {selectedVacuna && (
                <div className="rounded-lg border border-teal-200/70 bg-teal-50/40 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-100/90 text-teal-800 shadow-sm">
                      <Package className="h-5 w-5" weight="duotone" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 text-sm">
                          {selectedVacuna.nombre || 'Biológico'}
                        </span>
                        <span className="rounded bg-teal-100/70 px-1.5 py-0.5 text-[11px] font-medium text-teal-800">
                          {selectedVacuna.tipo || 'Vacuna'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                        <span>
                          <strong className="text-zinc-700">Presentación:</strong>{' '}
                          {selectedVacuna.presentacion || 'Estándar'}
                        </span>
                        <span>
                          <strong className="text-zinc-700">Dosis por frasco:</strong>{' '}
                          {selectedVacuna.dosisPorFrasco}
                        </span>
                        {selectedVacuna.temperaturaAlmacenamiento && (
                          <span className="inline-flex items-center gap-1">
                            <Thermometer className="h-3.5 w-3.5 text-teal-700" weight="bold" />
                            <strong className="text-zinc-700">T° Almacén:</strong>{' '}
                            {selectedVacuna.temperaturaAlmacenamiento}
                          </span>
                        )}
                        {selectedVacuna.tiempoVidaUtil ? (
                          <span className="inline-flex items-center gap-1">
                            <HourglassHigh className="h-3.5 w-3.5 text-teal-700" weight="bold" />
                            <strong className="text-zinc-700">Vida útil:</strong>{' '}
                            {selectedVacuna.tiempoVidaUtil} días
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedJeringa && (
                <div className="rounded-lg border border-teal-200/70 bg-teal-50/40 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-100/90 text-teal-800 shadow-sm">
                      <Syringe className="h-5 w-5" weight="duotone" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 text-sm">
                          {selectedJeringa.tipo} {selectedJeringa.capacidad}
                        </span>
                        <span className="rounded bg-teal-100/70 px-1.5 py-0.5 text-[11px] font-medium text-teal-800">
                          Dispositivo médico
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                        <span>
                          <strong className="text-zinc-700">Capacidad:</strong> {selectedJeringa.capacidad}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <strong className="text-zinc-700">Color cono:</strong>
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: getNeedleColorHex(selectedJeringa.color) }}
                          />
                          <span>{selectedJeringa.color}</span>
                        </span>
                        <span>
                          <strong className="text-zinc-700">Tipo:</strong> {selectedJeringa.tipo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: DOCUMENTO Y ORIGEN */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-line-soft pb-1.5">
                <FileText className="h-4 w-4 text-teal-700" weight="duotone" />
                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  2. Documento y Origen
                </h4>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectInput
                  id="nuevo-ingreso-comprobante-clase"
                  label="Tipo de Comprobante"
                  value={formData.comprobanteClase}
                  onChange={(value) => handleFieldChange('comprobanteClase', value)}
                  options={[...FILTER_OPTIONS.comprobanteClase]}
                />
                <TextInput
                  id="nuevo-ingreso-comprobante"
                  label="Numero de Comprobante"
                  value={formData.numeroComprobante}
                  onChange={(value) => handleFieldChange('numeroComprobante', value)}
                  placeholder="Ej: P-001-2024"
                  required
                  error={errors.numeroComprobante}
                />
                <SelectInput
                  id="nuevo-ingreso-forma"
                  label="Forma de Ingreso"
                  value={formData.formaIngreso}
                  onChange={(value) => handleFieldChange('formaIngreso', value)}
                  options={[...FILTER_OPTIONS.formaIngreso]}
                />
                <DateInput
                  id="nuevo-ingreso-fecha"
                  label="Fecha de Ingreso"
                  value={formData.fechaIngreso}
                  onChange={(value) => handleFieldChange('fechaIngreso', value)}
                />
              </div>
            </div>

            {/* SECCIÓN 3: IDENTIFICACIÓN DEL LOTE Y STOCK */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-line-soft pb-1.5">
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-teal-700" weight="duotone" />
                  <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                    3. Identificación del Lote y Stock
                  </h4>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="nuevo-ingreso-numero" className={COMPONENT_STYLES.input.label}>
                      Numero de Lote<span className="ml-1 text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateLoteNumber}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 transition mb-1"
                      title="Generar número sugerido de lote"
                    >
                      <MagicWand className="h-3.5 w-3.5" weight="bold" />
                      <span>Auto</span>
                    </button>
                  </div>
                  <input
                    id="nuevo-ingreso-numero"
                    type="text"
                    value={formData.numero}
                    onChange={(e) => handleFieldChange('numero', e.target.value)}
                    placeholder="Ej: BCG-2024-001"
                    required
                    className={`font-mono text-sm tracking-wide ${COMPONENT_STYLES.input.base} ${
                      errors.numero ? COMPONENT_STYLES.input.error : COMPONENT_STYLES.input.normal
                    }`}
                    aria-invalid={Boolean(errors.numero)}
                  />
                  {errors.numero ? (
                    <p className={COMPONENT_STYLES.input.errorText}>{errors.numero}</p>
                  ) : null}
                </div>

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
                  helpText={
                    tipo === 'vacuna'
                      ? 'Total de dosis biológicas a ingresar'
                      : 'Total de unidades médicas a ingresar'
                  }
                />

                <div className="md:col-span-2">
                  <DateInput
                    id="nuevo-ingreso-vencimiento"
                    label="Fecha de Vencimiento"
                    value={formData.fechaVencimiento}
                    onChange={(value) => handleFieldChange('fechaVencimiento', value)}
                    required={tipo === 'vacuna'}
                    error={errors.fechaVencimiento}
                    helpText={
                      vencimientoStatus
                        ? vencimientoStatus.text
                        : tipo === 'vacuna'
                        ? 'Fecha límite de caducidad informada por el fabricante'
                        : 'Opcional para dispositivos médicos'
                    }
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: OBSERVACIONES */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-line-soft pb-1.5">
                <ChatText className="h-4 w-4 text-teal-700" weight="duotone" />
                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                  4. Observaciones
                </h4>
              </div>

              <TextArea
                id="nuevo-ingreso-observaciones"
                label="Observaciones"
                value={formData.observaciones}
                onChange={(value) => handleFieldChange('observaciones', value)}
                rows={2}
                placeholder="Observaciones adicionales sobre la recepción, transporte o empaque (opcional)"
              />
            </div>
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
    className={`group relative flex flex-col rounded-xl border p-4 text-left transition ${
      selected
        ? 'border-teal-600 bg-teal-50/40 shadow-sm ring-1 ring-teal-600'
        : 'border-line bg-white hover:border-line-strong hover:bg-surface-soft'
    }`}
  >
    <div className="flex items-center justify-between w-full mb-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
          selected
            ? 'bg-teal-600 text-white shadow-sm'
            : 'bg-surface-soft text-ink group-hover:bg-teal-50 group-hover:text-teal-700'
        }`}
      >
        <Icon className="h-5 w-5" weight={selected ? 'fill' : 'duotone'} />
      </div>
      <span
        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
          selected ? 'border-teal-600 bg-teal-600' : 'border-line bg-white'
        }`}
      >
        {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
      </span>
    </div>
    <h4 className="text-sm font-semibold text-ink">{title}</h4>
    <p className="mt-1 text-xs text-muted-2 leading-relaxed">{description}</p>
  </button>
);

const getVacunaLabel = (vacuna: Vacuna) =>
  `${vacuna.nombre || 'Sin nombre'} - ${vacuna.presentacion || 'Sin presentación'}`;
const getJeringaLabel = (jeringa: Jeringa) =>
  `${jeringa.tipo} ${jeringa.capacidad} - ${jeringa.color}`;

export default NuevoIngreso;
