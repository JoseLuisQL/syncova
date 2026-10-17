import React from 'react';
import { CheckCircle, Database, MicrosoftExcelLogo, SpinnerGap, Sparkle } from '@phosphor-icons/react';
import { Modal } from '../ui/ModalElements';

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
    <Modal
      isOpen={isOpen}
      onClose={() => undefined}
      title={activeConfig.title}
      subtitle={activeConfig.description}
      icon={MicrosoftExcelLogo}
      size="lg"
    >
      <div className="space-y-4">
        {fileName ? (
          <div className="flex items-center justify-between rounded-lg border border-zinc-200/80 bg-zinc-50/70 px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Archivo: {fileName}
            </span>
            <SpinnerGap className="h-4 w-4 shrink-0 animate-spin text-brand" weight="bold" />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span>Avance estimado</span>
            <span className="tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">{activeConfig.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
              style={{ width: `${activeConfig.progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-2.5 md:grid-cols-3">
          {STEP_ORDER.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;

            return (
              <div
                key={step.key}
                className={`rounded-lg border px-3 py-3 transition-colors ${
                  isActive
                    ? 'border-brand/40 bg-zinc-50/80 dark:border-brand/50 dark:bg-zinc-900/60'
                    : 'border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : isActive
                          ? 'border-brand/30 bg-white text-brand dark:bg-zinc-900'
                          : 'border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" weight="bold" />
                    ) : (
                      <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} weight="bold" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">{step.label}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {isCompleted ? 'Completado' : isActive ? 'En proceso...' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default IciDemidImportProgressModal;
 