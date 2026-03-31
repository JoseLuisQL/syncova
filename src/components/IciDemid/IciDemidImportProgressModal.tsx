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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-teal-600" />
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-700 px-6 py-8 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-zinc-800/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-100">
                  <Sparkle className="h-3.5 w-3.5" />
                  Proceso de importación
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">{activeConfig.title}</h2>
                <p className="mt-2 max-w-xl text-sm text-zinc-200">{activeConfig.description}</p>
                {fileName ? (
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-zinc-100/90">
                    Archivo: {fileName}
                  </p>
                ) : null}
              </div>

              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <div className="absolute inset-0 rounded-2xl border border-zinc-300/30 animate-ping" />
                <SpinnerGap className="relative h-8 w-8 animate-spin text-zinc-200" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-zinc-100/80">
                <span>Avance estimado</span>
                <span>{activeConfig.progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-200 to-white transition-all duration-700 ease-out"
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
                    className={`rounded-2xl border px-4 py-4 transition-all duration-300 ${
                      isActive
                        ? 'border-zinc-300/40 bg-zinc-800/14'
                        : 'border-white/10 bg-white/8'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isCompleted ? 'bg-zinc-800/20 text-zinc-200' : isActive ? 'bg-zinc-800/20 text-zinc-100' : 'bg-white/10 text-zinc-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{step.label}</p>
                        <p className="text-xs text-zinc-200/75">
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
    </div>
  );
};

export default IciDemidImportProgressModal;
 