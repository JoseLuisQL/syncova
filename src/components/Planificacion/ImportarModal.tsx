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
    { num: 1, label: 'Tipo' },
    { num: 2, label: 'Filtros' },
    { num: 3, label: 'Archivo' },
    { num: 4, label: 'Resultado' },
  ];

  return (
    <div className="mb-6 flex items-center justify-center">
      {steps.slice(0, totalSteps).map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                currentStep === step.num
                  ? 'bg-[#7c3aed] text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] ring-2 ring-[#7c3aed]/25 ring-offset-2'
                  : currentStep > step.num
                  ? 'border border-[#e7e7ef] bg-[#fbfafd] text-[#15171d]'
                  : 'border border-[#e7e7ef] bg-white text-[#8b8f9b]'
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
                currentStep >= step.num ? 'text-[#15171d]' : 'text-[#8b8f9b]'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`mx-3 mb-5 h-[2px] w-12 ${
                currentStep > step.num ? 'bg-[#7c3aed]' : 'bg-[#e7e7ef]'
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
      className={`relative flex w-full flex-col items-center rounded-[14px] border p-6 transition-colors ${
        selected
          ? 'border-[#c8bbff] bg-[#fbfafd]'
          : 'border-[#e7e7ef] bg-white hover:border-[#d7d8e2] hover:bg-[#fbfafd]'
      }`}
    >
      {selected && (
        <div className="absolute right-3 top-3">
          <CheckCircle className="h-5 w-5 text-[#7c3aed]" weight="fill" />
        </div>
      )}
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] border ${
          selected ? 'border-[#e7e7ef] bg-white text-[#7c3aed]' : 'border-[#e7e7ef] bg-[#fbfafd] text-[#8b8f9b]'
        }`}
      >
        {isVacuna ? (
          <Syringe className="h-7 w-7" weight={selected ? 'duotone' : 'regular'} />
        ) : (
          <Stack className="h-7 w-7" weight={selected ? 'duotone' : 'regular'} />
        )}
      </div>
      <h4 className={`mb-1 text-sm font-semibold tracking-tight ${selected ? 'text-[#15171d]' : 'text-[#606571]'}`}>
        {isVacuna ? 'Por vacuna' : 'Importación masiva'}
      </h4>
      <p className="text-center text-[0.75rem] font-medium text-[#606571]">
        {isVacuna
          ? 'Carga la matriz anual de una vacuna específica.'
          : 'Carga matrices de varias vacunas desde un solo archivo.'}
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
    green: 'bg-white border-[#e7e7ef] text-[#15171d]',
    blue: 'bg-white border-[#e7e7ef] text-[#15171d]',
    purple: 'bg-[#fbfafd] border-[#c8bbff] text-[#15171d]',
    red: 'bg-rose-50 border-rose-200 text-rose-800',
  };

  return (
    <div className={`rounded-[14px] border p-4 text-center ${colorClasses[color]}`}>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs font-medium text-[#8b8f9b]">{label}</div>
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
      alert('El archivo no debe exceder 10MB');
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
      console.error('Error al descargar plantilla:', error);
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
      console.error('Error al importar archivo:', error);
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
      className={`${COMPONENT_STYLES.modal.overlay} flex items-end justify-center p-3 sm:items-center sm:p-6`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] ring-1 ring-zinc-200/50 sm:max-h-[90vh] sm:rounded-[14px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#eeeef3] bg-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e7e7ef] bg-white text-[#606571]">
                <UploadSimple className="h-5 w-5" weight="bold" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#15171d]">Importar planificación</h2>
                <p className="text-sm text-[#606571]">
                  {step < 4 ? 'Carga matrices anuales desde Excel' : 'Resultado de la importación'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-[9px] p-2 text-[#8b8f9b] transition-colors hover:bg-[#fbfafd] hover:text-[#15171d]"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" weight="bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <StepIndicator currentStep={step} totalSteps={4} />

          {/* Step 1: Tipo */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-6 text-center">
                <h3 className="text-base font-semibold text-[#15171d]">Tipo de importación</h3>
                <p className="mt-1 text-sm text-[#606571]">
                  Selecciona cómo deseas cargar la planificación.
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

              <div className="mt-6 rounded-[14px] border border-[#e7e7ef] bg-[#fbfafd] p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#606571]" weight="fill" />
                  <div className="text-sm font-medium leading-relaxed text-[#606571]">
                    {tipoImportacion === 'vacuna' ? (
                      <>
                        <strong className="text-[#15171d]">Importación por vacuna:</strong> actualiza la matriz anual únicamente para el biológico seleccionado.
                      </>
                    ) : (
                      <>
                        <strong className="text-[#15171d]">Importación masiva:</strong> procesa varias hojas del Excel y las asigna a sus vacunas correspondientes.
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
                <h3 className="text-base font-semibold text-[#15171d]">Filtros de plantilla</h3>
                <p className="mt-1 text-sm text-[#606571]">
                  Define la vacuna y el año de trabajo.
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
                      <option value="">Selecciona una vacuna</option>
                      {vacunas.map((vacuna) => (
                        <option key={vacuna.id} value={vacuna.id}>
                          {vacuna.nombre}
                        </option>
                      ))}
                    </select>
                    {tipoImportacion === 'vacuna' && !selectedVacuna && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
                        <Warning className="h-3 w-3" weight="bold" />
                        Vacuna requerida
                      </p>
                    )}
                  </div>
                )}

                <div className={tipoImportacion === 'masivo' ? 'col-span-1 md:col-span-2 mx-auto w-full max-w-xs' : ''}>
                  <label className={COMPONENT_STYLES.input.label}>
                    Año
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
              <div className="mt-6 rounded-[14px] border border-[#e7e7ef] bg-[#fbfafd] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e7e7ef] bg-white text-[#606571]">
                      <DownloadSimple className="h-5 w-5" weight="bold" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#15171d]">Plantilla Excel</h4>
                      <p className="text-sm text-[#606571]">
                        {tipoImportacion === 'vacuna'
                          ? 'Formato para una vacuna específica'
                          : 'Formato masivo para varias vacunas'}
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
                        Descargar plantilla
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
                <h3 className="text-base font-semibold text-[#15171d]">Subir archivo</h3>
                <p className="mt-1 text-sm text-[#606571]">
                  Selecciona el Excel con la matriz de planificación.
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
                className={`relative cursor-pointer rounded-[14px] border border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-[#c8bbff] bg-[#fbfafd]'
                    : archivo
                    ? 'border-[#e7e7ef] bg-[#fbfafd]'
                    : 'border-[#e7e7ef] hover:border-[#d7d8e2] hover:bg-[#fbfafd]'
                }`}
              >
                {archivo ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#e7e7ef] bg-white">
                      <FileXls className="h-7 w-7 text-[#15171d]" weight="duotone" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#15171d]">{archivo.name}</p>
                      <p className="text-xs font-medium text-[#8b8f9b]">
                        {(archivo.size / 1024).toFixed(1)} KB
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
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[14px] border border-[#e7e7ef] bg-white">
                      <UploadSimple className={`h-8 w-8 ${isDragging ? 'text-[#7c3aed]' : 'text-[#8b8f9b]'}`} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#15171d]">
                        {isDragging ? 'Suelta el archivo aquí' : 'Haz clic o arrastra el archivo'}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#8b8f9b]">
                        Solo archivos .xlsx o .xls
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[14px] border border-[#e7e7ef] bg-[#fbfafd] p-4">
                <h4 className="mb-2 text-xs font-medium text-[#8b8f9b]">Resumen</h4>
                <div className="flex flex-wrap gap-4 text-sm font-medium text-[#606571]">
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#15171d]">Tipo:</span>
                    {tipoImportacion === 'vacuna' ? 'Por vacuna' : 'Masivo'}
                  </span>
                  {tipoImportacion === 'vacuna' && vacunaSeleccionada && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#15171d]">Vacuna:</span>
                      {vacunaSeleccionada.nombre}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#15171d]">Año:</span>
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
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[14px] border bg-white ${
                  hasErrors ? 'border-amber-200 text-amber-500' : 'border-[#e7e7ef] text-[#7c3aed]'
                }`}>
                  {hasErrors ? (
                    <Warning className="h-8 w-8" weight="duotone" />
                  ) : (
                    <CheckCircle className="h-8 w-8" weight="duotone" />
                  )}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-[#15171d]">
                  {hasErrors ? 'Importación parcial' : 'Importación completada'}
                </h3>
                <p className="mt-1 text-sm text-[#606571]">
                  {totalSuccess} registros procesados
                </p>
              </div>

              {/* Estadísticas */}
              {tipoImportacion === 'vacuna' ? (
                <div className="grid grid-cols-3 gap-4">
                  <ResultCard
                    value={resultadoImportacion.creadas || 0}
                    label="Creadas"
                    color="green"
                  />
                  <ResultCard
                    value={resultadoImportacion.actualizadas || 0}
                    label="Actualizadas"
                    color="blue"
                  />
                  <ResultCard
                    value={resultadoImportacion.errores?.length || 0}
                    label="Errores"
                    color="red"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <ResultCard
                    value={resultadoImportacion.totalCreadas || 0}
                    label="Creadas"
                    color="green"
                  />
                  <ResultCard
                    value={resultadoImportacion.totalActualizadas || 0}
                    label="Actualizadas"
                    color="blue"
                  />
                  <ResultCard
                    value={resultadoImportacion.vacunasProcesadas || 0}
                    label="Vacunas"
                    color="purple"
                  />
                  <ResultCard
                    value={resultadoImportacion.erroresPorVacuna?.length || 0}
                    label="Errores"
                    color="red"
                  />
                </div>
              )}

              {/* Errores */}
              {tipoImportacion === 'vacuna' && resultadoImportacion.errores && resultadoImportacion.errores.length > 0 && (
                <div className="rounded-[14px] border border-rose-200 bg-rose-50 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight text-rose-900">
                    <Warning className="h-4 w-4" weight="bold" />
                    Errores encontrados ({resultadoImportacion.errores.length})
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
                    <div key={index} className="rounded-[14px] border border-amber-200 bg-amber-50 p-3">
                      <h5 className="mb-2 text-xs font-semibold text-amber-900">Vacuna: {vacunaError.vacuna}</h5>
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
        <div className="flex items-center justify-between border-t border-[#eeeef3] bg-white px-6 py-4">
          <div>
            {step > 1 && step < 4 && (
              <button
                onClick={handlePrevStep}
                className={COMPONENT_STYLES.button.ghost}
              >
                <CaretLeft className="h-4 w-4" weight="bold" />
                Regresar
              </button>
            )}
            {step === 4 && (
              <button
                onClick={resetForm}
                className={COMPONENT_STYLES.button.secondary}
              >
                <ArrowsClockwise className="h-4 w-4" weight="bold" />
                Nueva importación
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className={COMPONENT_STYLES.button.ghost}
            >
              {step === 4 ? 'Aceptar' : 'Cancelar'}
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
                    Importar
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
