import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
import {
  X,
  UploadSimple,
  DownloadSimple,
  FileXls,
  CheckCircle,
  Warning,
  CircleNotch,
  CaretRight,
  CaretLeft,
  Syringe,
  Stack,
  ArrowsClockwise,
  XCircle,
  Info,
} from '@phosphor-icons/react';
import { Vacuna } from '../../types';
import { COMPONENT_STYLES } from './constants';

interface ImportarModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacunas: Vacuna[];
  onDescargarPlantillaVacuna: (vacunaId: string, anio: number) => Promise<boolean>;
  onDescargarPlantillaMasiva: (anio: number) => Promise<boolean>;
  onImportarVacuna: (vacunaId: string, anio: number, archivo: File) => Promise<{
    creadas: number;
    actualizadas: number;
    errores: string[];
  } | null>;
  onImportarMasivo: (anio: number, archivo: File) => Promise<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: { vacuna: string; errores: string[] }[];
    vacunasProcesadas: number;
  } | null>;
  isDownloadingTemplate: boolean;
  isImportingExcel: boolean;
}

type TipoImportacion = 'vacuna' | 'masivo';
type Step = 1 | 2 | 3 | 4;

const ANIOS_DISPONIBLES = [2024, 2025, 2026, 2027];

const StepIndicator = memo<{ currentStep: Step; totalSteps: number }>(({ currentStep, totalSteps }) => {
  const steps = [
    { num: 1, label: 'Estructura' },
    { num: 2, label: 'Entorno' },
    { num: 3, label: 'I/O Excel' },
    { num: 4, label: 'Reporte' },
  ];

  return (
    <div className="mb-6 flex items-center justify-center">
      {steps.slice(0, totalSteps).map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                currentStep === step.num
                  ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-600 ring-offset-2'
                  : currentStep > step.num
                  ? 'bg-zinc-200 text-zinc-900'
                  : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
              }`}
            >
              {currentStep > step.num ? (
                <CheckCircle className="h-4 w-4" weight="bold" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`mt-2 text-[0.65rem] font-bold uppercase tracking-wider ${
                currentStep >= step.num ? 'text-zinc-900' : 'text-zinc-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`mx-3 mb-5 h-[2px] w-12 ${
                currentStep > step.num ? 'bg-teal-600' : 'bg-zinc-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

StepIndicator.displayName = 'StepIndicator';

const ImportTypeCard = memo<{
  type: TipoImportacion;
  selected: boolean;
  onClick: () => void;
}>(({ type, selected, onClick }) => {
  const isVacuna = type === 'vacuna';

  return (
    <button
      onClick={onClick}
      className={`relative flex w-full flex-col items-center rounded-[16px] border-[2px] p-6 transition-all duration-200 ${
        selected
          ? 'border-teal-600 bg-teal-50 shadow-sm'
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'
      }`}
    >
      {selected && (
        <div className="absolute right-3 top-3">
          <CheckCircle className="h-5 w-5 text-teal-600" weight="fill" />
        </div>
      )}
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${
          selected ? 'bg-white border-zinc-300 shadow-sm' : 'bg-zinc-100 border-zinc-200 text-zinc-400'
        }`}
      >
        {isVacuna ? (
          <Syringe className={`h-7 w-7 ${selected ? 'text-zinc-900' : 'text-zinc-400'}`} weight={selected ? 'duotone' : 'regular'} />
        ) : (
          <Stack className={`h-7 w-7 ${selected ? 'text-zinc-900' : 'text-zinc-400'}`} weight={selected ? 'duotone' : 'regular'} />
        )}
      </div>
      <h4 className={`mb-1 text-sm font-black tracking-tight ${selected ? 'text-zinc-900' : 'text-zinc-600'}`}>
        {isVacuna ? 'Inyección Singular' : 'Inyección Masiva (Lote)'}
      </h4>
      <p className="text-center text-[0.75rem] font-semibold text-zinc-500">
        {isVacuna
          ? 'Importar red de distribución orientada a un solo biológico'
          : 'Sobreescribir múltiples matrices biológicas simultáneamente'}
      </p>
    </button>
  );
});

ImportTypeCard.displayName = 'ImportTypeCard';

const ResultCard = memo<{
  value: number;
  label: string;
  color: 'green' | 'blue' | 'purple' | 'red';
}>(({ value, label, color }) => {
  const colorClasses = {
    green: 'bg-zinc-50 border-zinc-200 text-zinc-900',
    blue: 'bg-white border-zinc-200 text-zinc-700',
    purple: 'bg-zinc-100 border-zinc-300 text-zinc-800',
    red: 'bg-rose-50 border-rose-200 text-rose-800',
  };

  return (
    <div className={`rounded-xl border p-4 text-center shadow-sm ${colorClasses[color]}`}>
      <div className="text-2xl font-black tabular-nums">{value}</div>
      <div className="mt-1 text-[0.65rem] font-bold uppercase tracking-widest opacity-80">{label}</div>
    </div>
  );
});

ResultCard.displayName = 'ResultCard';

const ImportarModal: React.FC<ImportarModalProps> = ({
  isOpen,
  onClose,
  vacunas,
  onDescargarPlantillaVacuna,
  onDescargarPlantillaMasiva,
  onImportarVacuna,
  onImportarMasivo,
  isDownloadingTemplate,
  isImportingExcel,
}) => {
  const [step, setStep] = useState<Step>(1);
  const [tipoImportacion, setTipoImportacion] = useState<TipoImportacion>('vacuna');
  const [selectedVacuna, setSelectedVacuna] = useState<string>('');
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear());
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resultadoImportacion, setResultadoImportacion] = useState<{
    creadas?: number;
    actualizadas?: number;
    errores?: string[];
    totalCreadas?: number;
    totalActualizadas?: number;
    vacunasProcesadas?: number;
    erroresPorVacuna?: { vacuna: string; errores: string[] }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vacunaSeleccionada = useMemo(() => 
    vacunas.find(v => v.id === selectedVacuna),
    [vacunas, selectedVacuna]
  );

  const resetForm = useCallback(() => {
    setStep(1);
    setTipoImportacion('vacuna');
    setSelectedVacuna('');
    setSelectedAnio(new Date().getFullYear());
    setArchivo(null);
    setResultadoImportacion(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Se requiere un archivo Data Matrix Excel válido (.xlsx o .xls)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('El payload no debe exceder 10MB');
      return;
    }
    
    setArchivo(file);
  }, []);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDescargarPlantilla = useCallback(async () => {
    try {
      if (tipoImportacion === 'vacuna') {
        if (!selectedVacuna) return;
        await onDescargarPlantillaVacuna(selectedVacuna, selectedAnio);
      } else {
        await onDescargarPlantillaMasiva(selectedAnio);
      }
    } catch (error) {
      console.error('Error IO Plantilla:', error);
    }
  }, [tipoImportacion, selectedVacuna, selectedAnio, onDescargarPlantillaVacuna, onDescargarPlantillaMasiva]);

  const handleImportar = useCallback(async () => {
    if (!archivo) return;

    try {
      let resultado = null;

      if (tipoImportacion === 'vacuna') {
        if (!selectedVacuna) return;
        resultado = await onImportarVacuna(selectedVacuna, selectedAnio, archivo);
      } else {
        resultado = await onImportarMasivo(selectedAnio, archivo);
      }

      if (resultado) {
        setResultadoImportacion(resultado);
        setStep(4);
      }
    } catch (error) {
      console.error('Error I/O Subida:', error);
    }
  }, [archivo, tipoImportacion, selectedVacuna, selectedAnio, onImportarVacuna, onImportarMasivo]);

  const canProceedToNextStep = useMemo(() => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return tipoImportacion === 'masivo' || !!selectedVacuna;
      case 3:
        return !!archivo;
      default:
        return false;
    }
  }, [step, tipoImportacion, selectedVacuna, archivo]);

  const handleNextStep = useCallback(() => {
    if (step < 3 && canProceedToNextStep) {
      setStep((s) => (s + 1) as Step);
    } else if (step === 3 && canProceedToNextStep) {
      handleImportar();
    }
  }, [step, canProceedToNextStep, handleImportar]);

  const handlePrevStep = useCallback(() => {
    if (step > 1) {
      setStep((s) => (s - 1) as Step);
    }
  }, [step]);

  const hasErrors = useMemo(() => {
    if (!resultadoImportacion) return false;
    if (tipoImportacion === 'vacuna') {
      return (resultadoImportacion.errores?.length || 0) > 0;
    }
    return (resultadoImportacion.erroresPorVacuna?.length || 0) > 0;
  }, [resultadoImportacion, tipoImportacion]);

  const totalSuccess = useMemo(() => {
    if (!resultadoImportacion) return 0;
    if (tipoImportacion === 'vacuna') {
      return (resultadoImportacion.creadas || 0) + (resultadoImportacion.actualizadas || 0);
    }
    return (resultadoImportacion.totalCreadas || 0) + (resultadoImportacion.totalActualizadas || 0);
  }, [resultadoImportacion, tipoImportacion]);

  if (!isOpen) return null;

  return (
    <div 
      className={COMPONENT_STYLES.modal.overlay}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl ring-1 ring-zinc-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Zinc Flat */}
        <div className="border-b border-zinc-200 bg-teal-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <UploadSimple className="h-5 w-5 text-white" weight="bold" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">Consola de Inyección IO</h2>
                <p className="text-[0.75rem] font-semibold text-zinc-400">
                  {step < 4 ? 'Parametriza el lote a inyectar' : 'Pipeline completado'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" weight="bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <StepIndicator currentStep={step} totalSteps={4} />

          {/* Step 1: Tipo */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-6 text-center">
                <h3 className="text-base font-black text-zinc-900">Estructura del Lote</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  Select the underlying data model for the batch
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ImportTypeCard
                  type="vacuna"
                  selected={tipoImportacion === 'vacuna'}
                  onClick={() => setTipoImportacion('vacuna')}
                />
                <ImportTypeCard
                  type="masivo"
                  selected={tipoImportacion === 'masivo'}
                  onClick={() => setTipoImportacion('masivo')}
                />
              </div>

              <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" weight="fill" />
                  <div className="text-sm font-medium text-zinc-700 leading-relaxed">
                    {tipoImportacion === 'vacuna' ? (
                      <>
                        <strong className="text-zinc-900">Restricción de Vector Simple:</strong> Actualiza y muta explícitamente solo el biológico objetivo y sus nodos adjuntos en una única matriz Excel bidimensional.
                      </>
                    ) : (
                      <>
                        <strong className="text-zinc-900">Restricción de Multi-vector:</strong> Analizador heurístico profundo. Lee múltiples hojas simultáneamente mapeándolas a sus objetos biológicos por indexación nominal (Nombre = Pestaña).
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuración (Entorno) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-6 text-center">
                <h3 className="text-base font-black text-zinc-900">Sandbox Target</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  Fijar variables de entorno para los templates
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {tipoImportacion === 'vacuna' && (
                  <div>
                    <label className={COMPONENT_STYLES.input.label}>
                      Biológico
                    </label>
                    <select
                      value={selectedVacuna}
                      onChange={(e) => setSelectedVacuna(e.target.value)}
                      className={COMPONENT_STYLES.select.base}
                    >
                      <option value="">-- Nodo Vacío --</option>
                      {vacunas.map((vacuna) => (
                        <option key={vacuna.id} value={vacuna.id}>
                          {vacuna.nombre}
                        </option>
                      ))}
                    </select>
                    {tipoImportacion === 'vacuna' && !selectedVacuna && (
                      <p className="mt-1.5 flex items-center gap-1 text-[0.7rem] font-bold text-rose-600 uppercase tracking-wide">
                        <Warning className="h-3 w-3" weight="bold" />
                        Target Requerido
                      </p>
                    )}
                  </div>
                )}

                <div className={tipoImportacion === 'masivo' ? 'col-span-1 md:col-span-2 mx-auto w-full max-w-xs' : ''}>
                  <label className={COMPONENT_STYLES.input.label}>
                    Fiscal Year
                  </label>
                  <select
                    value={selectedAnio}
                    onChange={(e) => setSelectedAnio(Number(e.target.value))}
                    className={COMPONENT_STYLES.select.base}
                  >
                    {ANIOS_DISPONIBLES.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descargar plantilla */}
              <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm">
                      <DownloadSimple className="h-5 w-5 text-zinc-900" weight="bold" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-zinc-900">Descriptor Template IO</h4>
                      <p className="text-[0.75rem] font-semibold text-zinc-500">
                        {tipoImportacion === 'vacuna'
                          ? `Schema para biológico específico`
                          : 'Schema de lote múltiple estandarizado'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDescargarPlantilla}
                    disabled={isDownloadingTemplate || (tipoImportacion === 'vacuna' && !selectedVacuna)}
                    className={COMPONENT_STYLES.button.primary}
                  >
                    {isDownloadingTemplate ? (
                      <>
                        <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <DownloadSimple className="h-4 w-4" weight="bold" />
                        Exportar Schema
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Subir archivo */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="mb-6 text-center">
                <h3 className="text-base font-black text-zinc-900">Extracción de Data</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  Inserte el payload generado por el Excel
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !archivo && fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragging
                    ? 'border-teal-600 bg-teal-50'
                    : archivo
                    ? 'border-zinc-300 bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                }`}
              >
                {archivo ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-300 bg-white shadow-sm">
                      <FileXls className="h-7 w-7 text-zinc-900" weight="duotone" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-zinc-900">{archivo.name}</p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        {(archivo.size / 1024).toFixed(1)} KB PAYLOAD
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setArchivo(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <XCircle className="h-5 w-5" weight="bold" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm">
                      <UploadSimple className={`h-8 w-8 ${isDragging ? 'text-zinc-900' : 'text-zinc-400'}`} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-800">
                        {isDragging ? 'Drop IO Stream' : 'Pulse o arrastre para inyectar stream'}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Solo Binary XML (.xlsx / .xls)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen de inyección */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <h4 className="mb-2 text-[0.7rem] font-bold uppercase tracking-widest text-zinc-500">Parámetros</h4>
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-zinc-700">
                  <span className="flex items-center gap-1.5">
                    <span className="font-black text-zinc-900">IO:</span>
                    {tipoImportacion === 'vacuna' ? 'Single-Vector' : 'Multi-Vector'}
                  </span>
                  {tipoImportacion === 'vacuna' && vacunaSeleccionada && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-black text-zinc-900">TGT:</span>
                      {vacunaSeleccionada.nombre}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span className="font-black text-zinc-900">YR:</span>
                    {selectedAnio}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Resultado */}
          {step === 4 && resultadoImportacion && (
            <div className="space-y-6">
              <div className="mb-6 text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-white shadow-sm ${
                  hasErrors ? 'border-amber-200 text-amber-500' : 'border-zinc-200 text-zinc-900'
                }`}>
                  {hasErrors ? (
                    <Warning className="h-8 w-8" weight="duotone" />
                  ) : (
                    <CheckCircle className="h-8 w-8" weight="duotone" />
                  )}
                </div>
                <h3 className="text-lg font-black tracking-tight text-zinc-900">
                  {hasErrors ? 'Resolución Parcial' : 'Resolución Limpia'}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {totalSuccess} Mutaciones Registradas
                </p>
              </div>

              {/* Estadísticas */}
              {tipoImportacion === 'vacuna' ? (
                <div className="grid grid-cols-3 gap-4">
                  <ResultCard
                    value={resultadoImportacion.creadas || 0}
                    label="INSERTs"
                    color="green"
                  />
                  <ResultCard
                    value={resultadoImportacion.actualizadas || 0}
                    label="UPDATEs"
                    color="blue"
                  />
                  <ResultCard
                    value={resultadoImportacion.errores?.length || 0}
                    label="ERRORs"
                    color="red"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <ResultCard
                    value={resultadoImportacion.totalCreadas || 0}
                    label="INSERTs"
                    color="green"
                  />
                  <ResultCard
                    value={resultadoImportacion.totalActualizadas || 0}
                    label="UPDATEs"
                    color="blue"
                  />
                  <ResultCard
                    value={resultadoImportacion.vacunasProcesadas || 0}
                    label="TBLs"
                    color="purple"
                  />
                  <ResultCard
                    value={resultadoImportacion.erroresPorVacuna?.length || 0}
                    label="ERRORs"
                    color="red"
                  />
                </div>
              )}

              {/* Errores */}
              {tipoImportacion === 'vacuna' && resultadoImportacion.errores && resultadoImportacion.errores.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-black tracking-tight text-rose-900">
                    <Warning className="h-4 w-4" weight="bold" />
                    Excepciones levantadas ({resultadoImportacion.errores.length})
                  </h4>
                  <ul className="max-h-32 space-y-1 overflow-y-auto text-[0.8rem] font-medium text-rose-800">
                    {resultadoImportacion.errores.map((error: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 border-b border-rose-200/50 pb-1">
                        <span className="text-rose-500">-&gt;</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tipoImportacion === 'masivo' && resultadoImportacion.erroresPorVacuna && resultadoImportacion.erroresPorVacuna.length > 0 && (
                <div className="max-h-48 space-y-3 overflow-y-auto pr-2">
                  {resultadoImportacion.erroresPorVacuna.map((vacunaError, index: number) => (
                    <div key={index} className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
                      <h5 className="mb-2 text-[0.7rem] font-bold uppercase tracking-widest text-amber-900">Matriz: {vacunaError.vacuna}</h5>
                      <ul className="space-y-1 text-[0.75rem] font-medium text-amber-800">
                        {vacunaError.errores.map((error: string, errorIndex: number) => (
                          <li key={errorIndex} className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">&gt;</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-6 py-4">
          <div>
            {step > 1 && step < 4 && (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
              >
                <CaretLeft className="h-4 w-4" weight="bold" />
                Regresar
              </button>
            )}
            {step === 4 && (
              <button
                onClick={resetForm}
                className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-100 shadow-sm"
              >
                <ArrowsClockwise className="h-4 w-4" weight="bold" />
                Nuevo Lote
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
            >
              {step === 4 ? 'Aceptar' : 'Abortar'}
            </button>

            {step < 4 && (
              <button
                onClick={handleNextStep}
                disabled={!canProceedToNextStep || isImportingExcel}
                className={COMPONENT_STYLES.button.primary}
              >
                {isImportingExcel ? (
                  <>
                    <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                    Procesando...
                  </>
                ) : step === 3 ? (
                  <>
                    <UploadSimple className="h-4 w-4" weight="bold" />
                    Inyectar
                  </>
                ) : (
                  <>
                    Siguiente
                    <CaretRight className="h-4 w-4" weight="bold" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ImportarModal);
