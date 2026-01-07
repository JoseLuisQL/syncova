import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Syringe,
  Layers,
  Calendar,
  HelpCircle,
  RefreshCw,
  XCircle,
  Info,
} from 'lucide-react';
import { Vacuna } from '../../types';

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
    { num: 2, label: 'Configurar' },
    { num: 3, label: 'Archivo' },
    { num: 4, label: 'Resultado' },
  ];

  return (
    <div className="flex items-center justify-center mb-6">
      {steps.slice(0, totalSteps).map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                currentStep === step.num
                  ? 'bg-teal-600 text-white shadow-lg'
                  : currentStep > step.num
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {currentStep > step.num ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-xs mt-1 ${
                currentStep >= step.num ? 'text-teal-700 font-medium' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 mb-4 ${
                currentStep > step.num ? 'bg-teal-400' : 'bg-gray-200'
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
      className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 w-full ${
        selected
          ? 'border-teal-500 bg-teal-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-gray-50'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="h-5 w-5 text-teal-600" />
        </div>
      )}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
          selected ? 'bg-teal-100' : 'bg-gray-100'
        }`}
      >
        {isVacuna ? (
          <Syringe className={`h-7 w-7 ${selected ? 'text-teal-600' : 'text-gray-500'}`} />
        ) : (
          <Layers className={`h-7 w-7 ${selected ? 'text-teal-600' : 'text-gray-500'}`} />
        )}
      </div>
      <h4 className={`font-semibold text-base mb-1 ${selected ? 'text-teal-800' : 'text-gray-800'}`}>
        {isVacuna ? 'Vacuna Específica' : 'Importación Masiva'}
      </h4>
      <p className="text-sm text-gray-500 text-center">
        {isVacuna
          ? 'Importar programación para una sola vacuna'
          : 'Importar todas las vacunas desde un archivo'}
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
    green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`border rounded-lg p-4 text-center ${colorClasses[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
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
      alert('Por favor seleccione un archivo Excel válido (.xlsx o .xls)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no debe superar los 10MB');
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
      console.error('Error al importar:', error);
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-5 border-b border-gray-100"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Importar Programación</h2>
                <p className="text-white/90 text-sm">
                  {step < 4 ? 'Siga los pasos para importar desde Excel' : 'Importación completada'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step Indicator */}
          <StepIndicator currentStep={step} totalSteps={4} />

          {/* Step 1: Tipo de importación */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Seleccione el tipo de importación
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Elija cómo desea importar la programación de vacunas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-teal-800">
                    {tipoImportacion === 'vacuna' ? (
                      <>
                        <strong>Importación por vacuna:</strong> Ideal para actualizar la programación de una 
                        vacuna específica. El archivo debe contener una hoja con los establecimientos y 
                        sus metas mensuales.
                      </>
                    ) : (
                      <>
                        <strong>Importación masiva:</strong> Permite importar la programación de todas las 
                        vacunas en un solo archivo. Cada vacuna debe estar en una hoja separada con el 
                        nombre correspondiente.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuración */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Configure los parámetros
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {tipoImportacion === 'vacuna' 
                    ? 'Seleccione la vacuna y el año a importar'
                    : 'Seleccione el año para la importación masiva'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tipoImportacion === 'vacuna' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Syringe className="h-4 w-4 inline mr-1" />
                      Vacuna
                    </label>
                    <select
                      value={selectedVacuna}
                      onChange={(e) => setSelectedVacuna(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-800"
                    >
                      <option value="">Seleccione una vacuna</option>
                      {vacunas.map((vacuna) => (
                        <option key={vacuna.id} value={vacuna.id}>
                          {vacuna.nombre}
                        </option>
                      ))}
                    </select>
                    {tipoImportacion === 'vacuna' && !selectedVacuna && (
                      <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Debe seleccionar una vacuna para continuar
                      </p>
                    )}
                  </div>
                )}

                <div className={tipoImportacion === 'masivo' ? 'md:col-span-2 max-w-xs mx-auto' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Año
                  </label>
                  <select
                    value={selectedAnio}
                    onChange={(e) => setSelectedAnio(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-800"
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
              <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Download className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Descargar plantilla</h4>
                      <p className="text-sm text-gray-500">
                        {tipoImportacion === 'vacuna'
                          ? `Plantilla para ${vacunaSeleccionada?.nombre || 'la vacuna seleccionada'}`
                          : 'Plantilla con todas las vacunas activas'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDescargarPlantilla}
                    disabled={isDownloadingTemplate || (tipoImportacion === 'vacuna' && !selectedVacuna)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    {isDownloadingTemplate ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Descargando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Descargar Excel
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
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Suba el archivo Excel
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Arrastre el archivo o haga clic para seleccionarlo
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
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50'
                    : archivo
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
                }`}
              >
                {archivo ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FileSpreadsheet className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{archivo.name}</p>
                      <p className="text-sm text-gray-500">
                        {(archivo.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setArchivo(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className={`h-8 w-8 ${isDragging ? 'text-teal-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {isDragging ? 'Suelte el archivo aquí' : 'Arrastre su archivo Excel aquí'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        o haga clic para seleccionar
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Formatos aceptados: .xlsx, .xls (máximo 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Resumen de configuración */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen de importación:</h4>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Tipo:</span>
                    {tipoImportacion === 'vacuna' ? 'Vacuna específica' : 'Masivo'}
                  </span>
                  {tipoImportacion === 'vacuna' && vacunaSeleccionada && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Vacuna:</span>
                      {vacunaSeleccionada.nombre}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Año:</span>
                    {selectedAnio}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Resultado */}
          {step === 4 && resultadoImportacion && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  hasErrors ? 'bg-amber-100' : 'bg-emerald-100'
                }`}>
                  {hasErrors ? (
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {hasErrors ? 'Importación con advertencias' : 'Importación exitosa'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {totalSuccess} registro(s) procesado(s) correctamente
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    label="Con errores"
                    color="red"
                  />
                </div>
              )}

              {/* Errores */}
              {tipoImportacion === 'vacuna' && resultadoImportacion.errores && resultadoImportacion.errores.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Errores encontrados ({resultadoImportacion.errores.length})
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                    {resultadoImportacion.errores.map((error: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tipoImportacion === 'masivo' && resultadoImportacion.erroresPorVacuna && resultadoImportacion.erroresPorVacuna.length > 0 && (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {resultadoImportacion.erroresPorVacuna.map((vacunaError, index: number) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h5 className="font-medium text-red-800 mb-2">{vacunaError.vacuna}</h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {vacunaError.errores.map((error: string, errorIndex: number) => (
                          <li key={errorIndex} className="flex items-start gap-2">
                            <span className="text-red-400">•</span>
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div>
            {step > 1 && step < 4 && (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
            )}
            {step === 4 && (
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Nueva importación
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {step === 4 ? 'Cerrar' : 'Cancelar'}
            </button>

            {step < 4 && (
              <button
                onClick={handleNextStep}
                disabled={!canProceedToNextStep || isImportingExcel}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isImportingExcel ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : step === 3 ? (
                  <>
                    <Upload className="h-4 w-4" />
                    Importar
                  </>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
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
