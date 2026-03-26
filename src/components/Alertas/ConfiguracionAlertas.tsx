import React, { memo, useCallback, useEffect, useState } from 'react';
import { ArrowsClockwise, GearSix, Trash, Lightning } from '@phosphor-icons/react';
import { AlertasService } from '../../services/alertasService';
import { useAlertasGlobal } from '../../contexts/AlertasContext';
import { useToastContext } from '../../contexts/ToastContext';
import { AlertActionDialog, AlertSectionCard } from './components';

interface ConfiguracionLocal {
  diasAnticipacion: number;
  stockMinimo: number;
  diasRetencion: number;
}

const defaultConfig: ConfiguracionLocal = {
  diasAnticipacion: 30,
  stockMinimo: 100,
  diasRetencion: 30,
};

const loadConfig = (): ConfiguracionLocal => {
  try {
    const saved = localStorage.getItem('alertas_umbrales_v3');
    if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return defaultConfig;
};

const saveConfig = (config: ConfiguracionLocal) => {
  localStorage.setItem('alertas_umbrales_v3', JSON.stringify(config));
};

const ConfiguracionAlertas: React.FC = memo(() => {
  const { toast } = useToastContext();
  const { count, refresh } = useAlertasGlobal();

  const [config, setConfig] = useState<ConfiguracionLocal>(loadConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [lastResult, setLastResult] = useState<{
    alertasGeneradas?: number;
    alertasVencimiento?: number;
    alertasStockBajo?: number;
  } | null>(null);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const handleUpdate = useCallback((field: keyof ConfiguracionLocal, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(defaultConfig);
    toast.success('Configuración restablecida', 'Los umbrales volvieron a sus valores por defecto.', { duration: 2500 });
    setShowResetConfirm(false);
  }, [toast]);

  const handleGenerarAlertas = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await AlertasService.generarAutomaticas(
        config.diasAnticipacion,
        config.stockMinimo,
      );
      setLastResult(result);
      if (result.alertasGeneradas > 0) {
        toast.success('Alertas generadas', `Se generaron ${result.alertasGeneradas} alertas.`, { duration: 3000 });
      } else {
        toast.success('Sin novedades', 'No se encontraron nuevas alertas para generar.', { duration: 2500 });
      }
      await refresh();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo generar', 'Hubo un problema al analizar el inventario.', { duration: 3500 });
    } finally {
      setIsGenerating(false);
    }
  }, [config.diasAnticipacion, config.stockMinimo, refresh, toast]);

  const handleLimpiarAntiguas = useCallback(async () => {
    setIsCleaning(true);
    try {
      const result = await AlertasService.limpiarAntiguas(config.diasRetencion);
      toast.success('Limpieza completada', `Se eliminaron ${result.eliminadas} alertas antiguas.`, { duration: 3000 });
      await refresh();
      setShowCleanConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo limpiar', 'Hubo un problema al eliminar alertas antiguas.', { duration: 3500 });
    } finally {
      setIsCleaning(false);
    }
  }, [config.diasRetencion, refresh, toast]);

  return (
    <AlertSectionCard>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Configuración de alertas</h2>
            <p className="mt-1 text-sm text-zinc-500">Umbrales, generación y limpieza del módulo.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {count > 0 ? <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">{count} sin leer</span> : null}
            <button type="button" onClick={() => setShowResetConfirm(true)} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50">
              <ArrowsClockwise className="h-4 w-4" weight="bold" />
              Restablecer
            </button>
          </div>
        </div>

        <section className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <GearSix className="h-4 w-4 text-zinc-900" weight="fill" />
            <h3 className="text-base font-semibold text-zinc-950">Umbrales activos</h3>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-zinc-200 bg-zinc-50/70 p-4">
              <label className="block text-sm font-medium text-zinc-700">Días de anticipación</label>
              <input
                type="number"
                min="7"
                max="90"
                value={config.diasAnticipacion}
                onChange={(event) => handleUpdate('diasAnticipacion', parseInt(event.target.value, 10) || defaultConfig.diasAnticipacion)}
                className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-800/18"
              />
              <p className="mt-2 text-xs text-zinc-500">Controla cuándo se dispara una alerta de vencimiento.</p>
            </div>

            <div className="rounded-[18px] border border-zinc-200 bg-zinc-50/70 p-4">
              <label className="block text-sm font-medium text-zinc-700">Stock mínimo</label>
              <input
                type="number"
                min="10"
                max="500"
                step="10"
                value={config.stockMinimo}
                onChange={(event) => handleUpdate('stockMinimo', parseInt(event.target.value, 10) || defaultConfig.stockMinimo)}
                className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-800/18"
              />
              <p className="mt-2 text-xs text-zinc-500">Se usa para generar alertas automáticas de stock bajo.</p>
            </div>

            <div className="rounded-[18px] border border-zinc-200 bg-zinc-50/70 p-4">
              <label className="block text-sm font-medium text-zinc-700">Retención de resueltas</label>
              <input
                type="number"
                min="7"
                max="365"
                value={config.diasRetencion}
                onChange={(event) => handleUpdate('diasRetencion', parseInt(event.target.value, 10) || defaultConfig.diasRetencion)}
                className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-800/18"
              />
              <p className="mt-2 text-xs text-zinc-500">Define cuántos días conservar alertas resueltas antes de limpiar.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Lightning className="h-4 w-4 text-zinc-900" weight="fill" />
              <h3 className="text-base font-semibold text-zinc-950">Generación manual</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Analiza inventario y genera alertas usando los umbrales actuales.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerarAlertas}
                disabled={isGenerating}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-zinc-900 hover:to-zinc-900 disabled:opacity-60"
              >
                <Lightning className="h-4 w-4" weight="fill" />
                {isGenerating ? 'Analizando...' : 'Generar alertas'}
              </button>
            </div>

            {lastResult ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[16px] border border-zinc-200 bg-zinc-100/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-900">Vencimiento</p>
                  <p className="mt-2 text-xl font-semibold text-teal-900">{lastResult.alertasVencimiento || 0}</p>
                </div>
                <div className="rounded-[16px] border border-rose-200 bg-rose-50/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-rose-700">Stock bajo</p>
                  <p className="mt-2 text-xl font-semibold text-rose-900">{lastResult.alertasStockBajo || 0}</p>
                </div>
                <div className="rounded-[16px] border border-cyan-200 bg-zinc-100/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-900">Total</p>
                  <p className="mt-2 text-xl font-semibold text-cyan-900">{lastResult.alertasGeneradas || 0}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-[22px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Trash className="h-4 w-4 text-zinc-600" weight="fill" />
              <h3 className="text-base font-semibold text-zinc-950">Limpieza y mantenimiento</h3>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Elimina alertas resueltas antiguas para mantener el módulo útil y legible.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowCleanConfirm(true)}
                disabled={isCleaning}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <Trash className="h-4 w-4" weight="bold" />
                {isCleaning ? 'Limpiando...' : 'Limpiar antiguas'}
              </button>
            </div>

            <div className="mt-5 rounded-[18px] border border-sky-200 bg-sky-50/80 p-4 text-sm leading-6 text-sky-900">
              Se eliminarán únicamente alertas ya leídas con más de {config.diasRetencion} días de antigüedad.
            </div>
          </section>
        </div>

      </div>

      <AlertActionDialog
        isOpen={showResetConfirm}
        title="Restablecer configuración"
        description="Se restaurarán los umbrales por defecto del módulo. Esta acción no afecta alertas ya creadas."
        onConfirm={handleReset}
        onClose={() => setShowResetConfirm(false)}
        confirmLabel="Restablecer"
      />

      <AlertActionDialog
        isOpen={showCleanConfirm}
        title="Limpiar alertas antiguas"
        description={`Se eliminarán alertas resueltas con más de ${config.diasRetencion} días de antigüedad.`}
        onConfirm={handleLimpiarAntiguas}
        onClose={() => setShowCleanConfirm(false)}
        confirmLabel="Limpiar"
        isLoading={isCleaning}
      />
    </AlertSectionCard>
  );
});

ConfiguracionAlertas.displayName = 'ConfiguracionAlertas';

export default ConfiguracionAlertas;
 