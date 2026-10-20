import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  ArrowsClockwise,
  Trash,
  Lightning,
  Clock,
  ShieldWarning,
  Archive,
  CheckCircle,
} from '@phosphor-icons/react';
import { AlertasService } from '../../services/alertasService';
import { useAlertasGlobal } from '../../contexts/AlertasContext';
import { useToastContext } from '../../contexts/ToastContext';
import { AlertActionDialog, AlertSectionCard } from './components';
import {
  COMPONENT_STYLES,
  ConfiguracionUmbralesAlerta,
  DEFAULT_ALERTAS_CONFIG,
  loadAlertasConfig,
  saveAlertasConfig,
} from './constants';

interface ConfiguracionAlertasProps {
  totalLeidas?: number;
  onRefreshModule?: () => Promise<void> | void;
}

const ConfiguracionAlertas: React.FC<ConfiguracionAlertasProps> = memo(({
  totalLeidas = 0,
  onRefreshModule,
}) => {
  const { toast } = useToastContext();
  const { refresh } = useAlertasGlobal();

  const [config, setConfig] = useState<ConfiguracionUmbralesAlerta>(loadAlertasConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [lastResult, setLastResult] = useState<{
    alertasGeneradas?: number;
    alertasVencimiento?: number;
    alertasStockBajo?: number;
    detalles?: string[];
  } | null>(null);

  useEffect(() => {
    saveAlertasConfig(config);
  }, [config]);

  const handleUpdate = useCallback((field: keyof ConfiguracionUmbralesAlerta, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_ALERTAS_CONFIG);
    toast.success('Parámetros restablecidos', 'Los umbrales volvieron a sus valores recomendados.', { duration: 2500 });
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
        toast.success('Diagnóstico completado', `Se generaron ${result.alertasGeneradas} nuevas alertas.`, { duration: 3000 });
      } else {
        toast.success('Inventario verificado', 'No se detectaron nuevos incidentes fuera de umbral.', { duration: 2500 });
      }
      await Promise.all([refresh(), Promise.resolve(onRefreshModule?.())]);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo ejecutar el análisis', 'Hubo un problema al verificar el inventario.', { duration: 3500 });
    } finally {
      setIsGenerating(false);
    }
  }, [config.diasAnticipacion, config.stockMinimo, onRefreshModule, refresh, toast]);

  const handleLimpiarAntiguas = useCallback(async () => {
    setIsCleaning(true);
    try {
      const result = await AlertasService.limpiarAntiguas(config.diasRetencion);
      toast.success('Depuración completada', `Se eliminaron ${result.eliminadas} alertas atendidas antiguas.`, { duration: 3000 });
      await Promise.all([refresh(), Promise.resolve(onRefreshModule?.())]);
      setShowCleanConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo depurar', 'Hubo un problema al eliminar alertas antiguas.', { duration: 3500 });
    } finally {
      setIsCleaning(false);
    }
  }, [config.diasRetencion, onRefreshModule, refresh, toast]);

  return (
    <AlertSectionCard>
      <div className="space-y-5">
        {/* Sección 1: Reglas y umbrales de detección */}
        <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line-soft pb-3.5">
            <div>
              <h2 className="text-base font-semibold text-ink">Umbrales de detección automática</h2>
              <p className="mt-0.5 text-xs text-muted-2">
                Los cambios se guardan automáticamente y se aplican al analizar lotes y saldos de inventario.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className={COMPONENT_STYLES.button.secondary}
            >
              <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
              <span>Restablecer valores</span>
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {/* Umbral 1: Vencimientos */}
            <div className="rounded-xl border border-line bg-surface-soft/50 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" weight="fill" />
                    <span>Anticipación de vencimiento</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {config.diasAnticipacion} días
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-2">
                  Emite alerta cuando un lote de vacuna o jeringa vence dentro de este plazo.
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                <input
                  type="number"
                  min="7"
                  max="180"
                  value={config.diasAnticipacion}
                  onChange={(e) =>
                    handleUpdate('diasAnticipacion', Math.max(1, parseInt(e.target.value, 10) || DEFAULT_ALERTAS_CONFIG.diasAnticipacion))
                  }
                  className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} font-mono tabular-nums`}
                  aria-label="Días de anticipación de vencimiento"
                />
                <div className="flex items-center gap-1.5">
                  {[15, 30, 60, 90].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleUpdate('diasAnticipacion', val)}
                      className={`flex-1 rounded-md border py-1 font-mono text-xs tabular-nums transition-colors ${
                        config.diasAnticipacion === val
                          ? 'border-brand bg-surface-tint text-brand font-semibold'
                          : 'border-line bg-surface text-muted-2 hover:text-ink'
                      }`}
                    >
                      {val}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Umbral 2: Stock mínimo */}
            <div className="rounded-xl border border-line bg-surface-soft/50 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <ShieldWarning className="h-4 w-4 text-rose-600 dark:text-rose-400" weight="fill" />
                    <span>Umbral de stock mínimo</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {config.stockMinimo} dosis/ud.
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-2">
                  Dispara alerta de abastecimiento cuando el saldo disponible cae por debajo de este valor.
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                <input
                  type="number"
                  min="10"
                  max="2000"
                  step="10"
                  value={config.stockMinimo}
                  onChange={(e) =>
                    handleUpdate('stockMinimo', Math.max(1, parseInt(e.target.value, 10) || DEFAULT_ALERTAS_CONFIG.stockMinimo))
                  }
                  className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} font-mono tabular-nums`}
                  aria-label="Umbral de stock mínimo"
                />
                <div className="flex items-center gap-1.5">
                  {[50, 100, 250, 500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleUpdate('stockMinimo', val)}
                      className={`flex-1 rounded-md border py-1 font-mono text-xs tabular-nums transition-colors ${
                        config.stockMinimo === val
                          ? 'border-brand bg-surface-tint text-brand font-semibold'
                          : 'border-line bg-surface text-muted-2 hover:text-ink'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Umbral 3: Retención de historial */}
            <div className="rounded-xl border border-line bg-surface-soft/50 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <Archive className="h-4 w-4 text-blue-600 dark:text-blue-400" weight="fill" />
                    <span>Retención de atendidas</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {config.diasRetencion} días
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-muted-2">
                  Tiempo de conservación de alertas ya resueltas antes de habilitar su depuración.
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={config.diasRetencion}
                  onChange={(e) =>
                    handleUpdate('diasRetencion', Math.max(1, parseInt(e.target.value, 10) || DEFAULT_ALERTAS_CONFIG.diasRetencion))
                  }
                  className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal} font-mono tabular-nums`}
                  aria-label="Días de retención de alertas atendidas"
                />
                <div className="flex items-center gap-1.5">
                  {[15, 30, 60, 180].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleUpdate('diasRetencion', val)}
                      className={`flex-1 rounded-md border py-1 font-mono text-xs tabular-nums transition-colors ${
                        config.diasRetencion === val
                          ? 'border-brand bg-surface-tint text-brand font-semibold'
                          : 'border-line bg-surface text-muted-2 hover:text-ink'
                      }`}
                    >
                      {val}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 2: Diagnóstico de Inventario y Mantenimiento */}
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-line bg-surface p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Lightning className="h-4 w-4 text-brand" weight="fill" />
                <h3 className="text-sm font-semibold text-ink">Diagnóstico automático de inventario</h3>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-2 leading-relaxed">
                Inspecciona todos los lotes activos de vacunas y jeringas comparándolos con los umbrales de{' '}
                <span className="font-mono font-medium text-ink tabular-nums">{config.diasAnticipacion} días</span> y{' '}
                <span className="font-mono font-medium text-ink tabular-nums">{config.stockMinimo} unidades</span>.
              </p>

              {lastResult ? (
                <div className="mt-4 rounded-xl border border-line bg-surface-soft p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" weight="fill" />
                      Resultado de la última ejecución
                    </span>
                    <span className="font-mono font-semibold text-ink tabular-nums">
                      {lastResult.alertasGeneradas || 0} nuevas
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-2 font-mono tabular-nums">
                    <span>Por vencimiento: {lastResult.alertasVencimiento || 0}</span>
                    <span aria-hidden="true">·</span>
                    <span>Por stock bajo: {lastResult.alertasStockBajo || 0}</span>
                  </div>
                  {lastResult.detalles && lastResult.detalles.length > 0 ? (
                    <ul className="mt-2 max-h-28 overflow-y-auto space-y-1 border-t border-line-soft pt-2 text-xs text-muted-2">
                      {lastResult.detalles.slice(0, 8).map((det, idx) => (
                        <li key={idx} className="truncate">• {det}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-5 pt-3 border-t border-line-soft flex items-center justify-between gap-3">
              <span className="text-xs text-muted-2">Evita duplicar alertas ya activas</span>
              <button
                type="button"
                onClick={handleGenerarAlertas}
                disabled={isGenerating}
                className={COMPONENT_STYLES.button.primary}
              >
                <Lightning className="h-4 w-4" weight="fill" />
                <span>{isGenerating ? 'Analizando inventario...' : 'Ejecutar análisis ahora'}</span>
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Trash className="h-4 w-4 text-muted-2" weight="bold" />
                <h3 className="text-sm font-semibold text-ink">Depuración de historial resuelto</h3>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-2 leading-relaxed">
                Elimina únicamente las alertas que ya fueron marcadas como atendidas y tienen una antigüedad mayor a{' '}
                <span className="font-mono font-medium text-ink tabular-nums">{config.diasRetencion} días</span>. Las alertas pendientes nunca se eliminan en este proceso.
              </p>

              <div className="mt-4 rounded-xl border border-line bg-surface-soft p-3.5 flex items-center justify-between text-xs">
                <span className="text-muted-2">Alertas atendidas en bandeja actual</span>
                <span className="font-mono font-semibold text-ink tabular-nums">{totalLeidas} registro(s)</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-line-soft flex items-center justify-between gap-3">
              <span className="text-xs text-muted-2">Operación segura sobre histórico</span>
              <button
                type="button"
                onClick={() => setShowCleanConfirm(true)}
                disabled={isCleaning}
                className={COMPONENT_STYLES.button.secondary}
              >
                <Trash className="h-4 w-4" weight="bold" />
                <span>{isCleaning ? 'Depurando...' : 'Depurar alertas antiguas'}</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      <AlertActionDialog
        isOpen={showResetConfirm}
        title="Restablecer umbrales por defecto"
        description="Se restaurarán los parámetros recomendados (30 días de anticipación, 100 unidades de stock mínimo y 30 días de retención). Esta acción no modifica las alertas existentes."
        onConfirm={handleReset}
        onClose={() => setShowResetConfirm(false)}
        confirmLabel="Restablecer"
      />

      <AlertActionDialog
        isOpen={showCleanConfirm}
        title="Depurar alertas atendidas antiguas"
        description={`Se eliminarán del historial las alertas ya atendidas con más de ${config.diasRetencion} días de antigüedad.`}
        onConfirm={handleLimpiarAntiguas}
        onClose={() => setShowCleanConfirm(false)}
        confirmLabel="Depurar historial"
        isLoading={isCleaning}
      />
    </AlertSectionCard>
  );
});

ConfiguracionAlertas.displayName = 'ConfiguracionAlertas';

export default ConfiguracionAlertas;