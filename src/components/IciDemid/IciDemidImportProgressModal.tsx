import React from 'react';
import { CheckCircle, Database, MicrosoftExcelLogo, SpinnerGap, Sparkle } from '@phosphor-icons/react';

interface IciDemidImportProgressModalProps {
  isOpen: boolean;
  currentStep: 'preview' | 'import' | 'refresh';
  fileName?: string;
}

const STEP_CONFIG = {
  preview: {
    title: 'Analizando estructura del Excel',
    description: 'Validando encabezados, meses detectados y consistencia del archivo antes de importar.',
    progress: 32,
  },
  import: {
    title: 'Importando registros a la base de datos',
    description: 'Procesando establecimientos, vacunas y distribuciones mensuales para guardar los datos.',
    progress: 74,
  },
  refresh: {
    title: 'Actualizando la vista final',
    description: 'Recargando los registros importados para reflejar el resultado más reciente.',
    progress: 100,
  },
} as const;

const STEP_ORDER: Array<{ key: IciDemidImportProgressModalProps['currentStep']; label: string; icon: typeof MicrosoftExcelLogo }> = [
  { key: 'preview', label: 'Validación inicial', icon: MicrosoftExcelLogo },
  { key: 'import', label: 'Carga en base de datos', icon: Database },
  { key: 'refresh', label: 'Sincronización visual', icon: Sparkle },
];

const IciDemidImportProgressModal: React.FC<IciDemidImportProgressModalProps> = ({ isOpen, currentStep, fileName }) => {
  if (!isOpen) return null;

  const activeConfig = STEP_CONFIG[currentStep];
  const activeIndex = STEP_ORDER.findIndex((step) => step.key === currentStep);

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[14px] border border-[#e7e7ef] bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)]">
        <div className="border-b border-[#eeeef3] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[#e7e7ef] bg-white text-[#7c3aed]">
                <MicrosoftExcelLogo className="h-5 w-5" weight="bold" />
              </div>
              <div>
                <p className="mb-1 inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-[#fbfafd] px-2.5 py-1 text-xs font-medium text-[#606571]">
                  <Sparkle className="h-3.5 w-3.5 text-[#7c3aed]" weight="bold" />
                  Proceso de importación
                </p>
                <h2 className="text-lg font-semibold tracking-tight text-[#15171d]">{activeConfig.title}</h2>
                <p className="mt-1 max-w-xl text-sm text-[#606571]">{activeConfig.description}</p>
                {fileName ? (
                  <p className="mt-2 max-w-xl truncate text-xs font-medium text-[#8b8f9b]">
                    Archivo: {fileName}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd]">
              <SpinnerGap className="h-5 w-5 animate-spin text-[#7c3aed]" weight="bold" />
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#606571]">
              <span>Avance estimado</span>
              <span>{activeConfig.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eeeef3]">
              <div
                className="h-full rounded-full bg-[#7c3aed] transition-all duration-700 ease-out"
                style={{ width: `${activeConfig.progress}%` }}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {STEP_ORDER.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < activeIndex;
              const isActive = index === activeIndex;

              return (
                <div
                  key={step.key}
                  className={`rounded-[14px] border px-4 py-4 transition-colors ${
                    isActive
                      ? 'border-[#c8bbff] bg-[#fbfafd]'
                      : 'border-[#e7e7ef] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[10px] border ${
                        isCompleted
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          : isActive
                            ? 'border-[#c8bbff] bg-white text-[#7c3aed]'
                            : 'border-[#e7e7ef] bg-[#fbfafd] text-[#8b8f9b]'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-5 w-5" weight="bold" /> : <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} weight="bold" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#15171d]">{step.label}</p>
                      <p className="text-xs text-[#606571]">
                        {isCompleted ? 'Completado' : isActive ? 'En proceso...' : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IciDemidImportProgressModal;
 