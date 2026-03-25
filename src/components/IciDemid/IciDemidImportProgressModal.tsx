import React from 'react';
import { CheckCircle2, Database, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';

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

const STEP_ORDER: Array<{ key: IciDemidImportProgressModalProps['currentStep']; label: string; icon: typeof FileSpreadsheet }> = [
  { key: 'preview', label: 'Validación inicial', icon: FileSpreadsheet },
  { key: 'import', label: 'Carga en base de datos', icon: Database },
  { key: 'refresh', label: 'Sincronización visual', icon: Sparkles },
];

const IciDemidImportProgressModal: React.FC<IciDemidImportProgressModalProps> = ({ isOpen, currentStep, fileName }) => {
  if (!isOpen) return null;

  const activeConfig = STEP_CONFIG[currentStep];
  const activeIndex = STEP_ORDER.findIndex((step) => step.key === currentStep);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500" />
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-900 px-6 py-8 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Proceso de importación
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">{activeConfig.title}</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-200">{activeConfig.description}</p>
                {fileName ? (
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-cyan-100/90">
                    Archivo: {fileName}
                  </p>
                ) : null}
              </div>

              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <div className="absolute inset-0 rounded-2xl border border-cyan-300/30 animate-ping" />
                <Loader2 className="relative h-8 w-8 animate-spin text-cyan-200" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/80">
                <span>Avance estimado</span>
                <span>{activeConfig.progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 transition-all duration-700 ease-out"
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
                        ? 'border-cyan-300/40 bg-white/14 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]'
                        : 'border-white/10 bg-white/8'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isCompleted ? 'bg-emerald-400/20 text-emerald-200' : isActive ? 'bg-cyan-400/20 text-cyan-100' : 'bg-white/10 text-slate-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{step.label}</p>
                        <p className="text-xs text-slate-200/75">
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
