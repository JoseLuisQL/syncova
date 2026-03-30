import React, { memo, useMemo, useRef, useState } from 'react';
import { BellRinging, Database, Image, SpinnerGap, ShieldCheck, Trash, UploadSimple } from '@phosphor-icons/react';
import { useAlertasGlobal } from '../../../contexts/AlertasContext';
import { useToastContext } from '../../../contexts/ToastContext';
import { ConfiguracionService, type BackupExportFormat } from '../../../services/configuracionService';
import { Modal } from '../../Establecimientos/components';
import { getCategoryById, getEditableFieldsByGroup, getFieldsByCategory } from '../constants';
import type {
  ConfiguracionCategoryDefinition,
  ConfiguracionFieldDefinition,
  ConfiguracionFieldSource,
  ConfiguracionFieldValue,
  ConfiguracionGroupDefinition,
  ConfiguracionLogoState,
  ConfiguracionStats,
} from '../types';

interface ConfiguracionGroupViewProps {
  group: ConfiguracionGroupDefinition;
  values: Record<string, ConfiguracionFieldValue>;
  logo: ConfiguracionLogoState;
  stats: ConfiguracionStats;
  dirtyCount: number;
  isSaving: boolean;
  lastLoadedAt: Date | null;
  onUpdateField: (fieldId: string, value: ConfiguracionFieldValue) => void;
  onSaveGroup: () => Promise<void>;
  onResetGroup: () => void;
  onUploadLogo: (file: File) => Promise<boolean>;
  onDeleteLogo: () => Promise<boolean>;
  onRunAlertGeneration: () => Promise<{
    alertasGeneradas: number;
    alertasVencimiento: number;
    alertasStockBajo: number;
    detalles: string[];
  }>;
  onCleanupResolvedAlerts: (days: number) => Promise<{ eliminadas: number }>;
}

const subtleBadgeClassName = 'inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-600';
const inputClassName =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200';
const secondaryButtonClassName =
  'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60';
const primaryButtonClassName =
  'inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60';

const formatFieldValue = (field: ConfiguracionFieldDefinition, value: ConfiguracionFieldValue): string => {
  if (field.formatValue) {
    return field.formatValue(value);
  }

  if (field.type === 'number') {
    return Number(value).toLocaleString();
  }

  return String(value);
};

const formatSourceLabel = (source: ConfiguracionFieldSource) => {
  if (source === 'env') return '.env';
  if (source === 'derived') return 'Sistema';
  return 'BD';
};

const FieldControl: React.FC<{
  field: ConfiguracionFieldDefinition;
  value: ConfiguracionFieldValue;
  onUpdateField: (fieldId: string, value: ConfiguracionFieldValue) => void;
}> = ({ field, value, onUpdateField }) => {
  const displayValue = field.type === 'number' ? String(value) : String(value ?? '');

  return (
    <div className="space-y-1.5">
      <label htmlFor={field.id} className="block text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
        {field.label}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          id={field.id}
          rows={field.rows || 3}
          value={displayValue}
          onChange={(event) => onUpdateField(field.id, event.target.value)}
          className={`${inputClassName} resize-none`}
          placeholder={field.placeholder}
        />
      ) : field.type === 'select' ? (
        <select
          id={field.id}
          value={displayValue}
          onChange={(event) => onUpdateField(field.id, event.target.value)}
          className={inputClassName}
        >
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.id}
          type={field.type}
          value={displayValue}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(event) =>
            field.type === 'number'
              ? onUpdateField(field.id, event.target.value === '' ? field.defaultValue : Number(event.target.value))
              : onUpdateField(field.id, event.target.value)
          }
          className={inputClassName}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
};

const ReadonlyRows: React.FC<{
  fields: ConfiguracionFieldDefinition[];
  values: Record<string, ConfiguracionFieldValue>;
}> = ({ fields, values }) => (
  <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
    {fields.map((field, index) => (
      <div
        key={field.id}
        className={`grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start ${index > 0 ? 'border-t border-zinc-100' : ''}`}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900">{field.label}</p>
        </div>
        <div className="min-w-0 text-left sm:text-right">
          <p className="text-sm font-medium text-zinc-900">{formatFieldValue(field, values[field.id] ?? field.defaultValue)}</p>
        </div>
      </div>
    ))}
  </div>
);

const SectionShell: React.FC<{
  category: ConfiguracionCategoryDefinition;
  children: React.ReactNode;
}> = ({ category, children }) => {
  const Icon = category.icon;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-zinc-950">{category.label}</h2>
          </div>
        </div>
        {category.source !== 'database' ? <span className={subtleBadgeClassName}>{formatSourceLabel(category.source)}</span> : null}
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
};

const MinimalActionRow: React.FC<{
  title: string;
  description?: string;
  buttonLabel: string;
  onAction: () => void;
  isLoading: boolean;
  footer?: React.ReactNode;
}> = ({ title, description, buttonLabel, onAction, isLoading, footer }) => (
  <div className="rounded-lg border border-zinc-200 bg-white p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      <button type="button" className={secondaryButtonClassName} onClick={onAction} disabled={isLoading}>
        {isLoading ? <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        <span>{buttonLabel}</span>
      </button>
    </div>
    {footer ? <div className="mt-3">{footer}</div> : null}
  </div>
);

const ConfiguracionGroupView: React.FC<ConfiguracionGroupViewProps> = ({
  group,
  values,
  logo,
  stats,
  dirtyCount,
  isSaving,
  lastLoadedAt,
  onUpdateField,
  onSaveGroup,
  onResetGroup,
  onUploadLogo,
  onDeleteLogo,
  onRunAlertGeneration,
  onCleanupResolvedAlerts,
}) => {
  const { toast } = useToastContext();
  const { count, refresh: refreshAlertsCount } = useAlertasGlobal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingAlerts, setIsGeneratingAlerts] = useState(false);
  const [isCleaningAlerts, setIsCleaningAlerts] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupExportFormat, setBackupExportFormat] = useState<BackupExportFormat>('backup');
  const [lastGenerationResult, setLastGenerationResult] = useState<{
    alertasGeneradas: number;
    alertasVencimiento: number;
    alertasStockBajo: number;
  } | null>(null);

  const editableFields = useMemo(() => getEditableFieldsByGroup(group.id), [group.id]);
  const hasEditableFields = editableFields.length > 0;
  const syncLabel = useMemo(() => {
    if (!lastLoadedAt) return 'Aun no sincronizado';
    return `Ultima carga ${lastLoadedAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  }, [lastLoadedAt]);

  const renderEditableCategory = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    if (!category) return null;

    const fields = getFieldsByCategory(categoryId).filter((field) => field.editable);
    if (fields.length === 0) return null;

    return (
      <SectionShell key={category.id} category={category}>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <FieldControl key={field.id} field={field} value={values[field.id] ?? field.defaultValue} onUpdateField={onUpdateField} />
          ))}
        </div>
      </SectionShell>
    );
  };

  const renderReadonlyCategory = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    if (!category) return null;

    const fields = getFieldsByCategory(categoryId);
    if (fields.length === 0) return null;

    return (
      <SectionShell key={category.id} category={category}>
        <ReadonlyRows fields={fields} values={values} />
      </SectionShell>
    );
  };

  const handleSelectLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
      toast.error('Formato no permitido', 'Solo se admiten imagenes PNG o JPG.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Archivo demasiado grande', 'El logo no puede superar los 2 MB.');
      return;
    }

    const success = await onUploadLogo(file);
    if (success) {
      toast.success('Logo actualizado', 'La vista previa institucional quedo sincronizada.');
    } else {
      toast.error('No se pudo actualizar el logo', 'Verifica el archivo e intenta nuevamente.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    const success = await onDeleteLogo();
    if (success) {
      toast.success('Logo eliminado', 'La institucion quedo sin imagen registrada.');
    } else {
      toast.error('No se pudo eliminar el logo', 'Intenta nuevamente desde esta misma vista.');
    }
  };

  const handleGenerateAlerts = async () => {
    setIsGeneratingAlerts(true);
    try {
      const result = await onRunAlertGeneration();
      setLastGenerationResult({
        alertasGeneradas: result.alertasGeneradas,
        alertasVencimiento: result.alertasVencimiento,
        alertasStockBajo: result.alertasStockBajo,
      });
      await refreshAlertsCount();
      toast.success(
        result.alertasGeneradas > 0 ? 'Alertas generadas' : 'Sin nuevas alertas',
        result.alertasGeneradas > 0
          ? `Se generaron ${result.alertasGeneradas} alertas con los umbrales actuales.`
          : 'No se detectaron nuevos casos con los umbrales vigentes.',
      );
    } catch (error) {
      console.error('Error al generar alertas:', error);
      toast.error('No se pudieron generar alertas', 'Revisa los umbrales y vuelve a intentarlo.');
    } finally {
      setIsGeneratingAlerts(false);
    }
  };

  const handleConfirmCleanup = async () => {
    setIsCleaningAlerts(true);
    try {
      const result = await onCleanupResolvedAlerts(cleanupDays);
      await refreshAlertsCount();
      toast.success('Limpieza completada', `Se retiraron ${result.eliminadas} alertas leidas antiguas.`);
      setCleanupDialogOpen(false);
    } catch (error) {
      console.error('Error al limpiar alertas:', error);
      toast.error('No se pudo limpiar alertas', 'La operacion no termino correctamente.');
    } finally {
      setIsCleaningAlerts(false);
    }
  };

  const handleExportDatabaseBackup = async () => {
    setIsExportingBackup(true);
    try {
      const { blob, filename } = await ConfiguracionService.exportDatabaseBackup(backupExportFormat);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        'Respaldo exportado',
        `La copia de seguridad en formato ${backupExportFormat.toUpperCase()} se descargo correctamente.`
      );
    } catch (error) {
      console.error('Error al exportar respaldo manual:', error);
      toast.error('No se pudo exportar el respaldo', 'Verifica la configuracion del servidor e intenta nuevamente.');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const renderIdentityGroup = () => (
    <div className="space-y-3">
      {renderEditableCategory('general')}

      <section className="rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <Image className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-zinc-950">Logo institucional</h2>
        </div>

        <div className="grid gap-4 px-4 py-4 md:grid-cols-[140px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
            <div className="flex aspect-square items-center justify-center bg-white">
              {logo.isLoading ? (
                <SpinnerGap className="h-6 w-6 animate-spin text-zinc-400" aria-hidden="true" />
              ) : logo.exists && logo.url ? (
                <img src={logo.url} alt="Logo institucional" className="h-full w-full object-contain p-3" />
              ) : (
                <div className="text-center text-zinc-400">
                  <Image className="mx-auto h-6 w-6" aria-hidden="true" />
                  <p className="mt-2 text-xs">Sin logo</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleSelectLogo}
              />
              <button type="button" className={secondaryButtonClassName} disabled={logo.isUploading} onClick={() => fileInputRef.current?.click()}>
                {logo.isUploading ? <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UploadSimple className="h-4 w-4" aria-hidden="true" />}
                <span>{logo.exists ? 'Reemplazar' : 'Subir logo'}</span>
              </button>
              <button type="button" className={secondaryButtonClassName} disabled={!logo.exists || logo.isUploading} onClick={handleDeleteLogo}>
                <Trash className="h-4 w-4" aria-hidden="true" />
                <span>Eliminar</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1">PNG o JPG</span>
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1">Max 2 MB</span>
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1">200x200 px</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAlertsGroup = () => (
    <div className="space-y-3">
      {renderEditableCategory('alertas')}
      {renderReadonlyCategory('notificaciones')}

      <section className="rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BellRinging className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-zinc-950">Acciones operativas</h2>
            </div>
          </div>
          {count > 0 ? <span className={subtleBadgeClassName}>{count} sin leer</span> : null}
        </div>

        <div className="space-y-3 px-4 py-4">
          <MinimalActionRow
            title="Generar alertas"
            description="Usa los umbrales actuales."
            buttonLabel={isGeneratingAlerts ? 'Analizando...' : 'Ejecutar'}
            onAction={handleGenerateAlerts}
            isLoading={isGeneratingAlerts}
            footer={
              lastGenerationResult ? (
                <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1">Total {lastGenerationResult.alertasGeneradas}</span>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1">Vencimiento {lastGenerationResult.alertasVencimiento}</span>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1">Stock bajo {lastGenerationResult.alertasStockBajo}</span>
                </div>
              ) : null
            }
          />

          <MinimalActionRow
            title="Limpiar alertas leidas"
            description="Depura el historial resuelto."
            buttonLabel={isCleaningAlerts ? 'Limpiando...' : 'Limpiar'}
            onAction={() => setCleanupDialogOpen(true)}
            isLoading={isCleaningAlerts}
            footer={
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="cleanup-days" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
                  Dias
                </label>
                <input
                  id="cleanup-days"
                  type="number"
                  min={7}
                  max={365}
                  value={cleanupDays}
                  onChange={(event) => setCleanupDays(Number(event.target.value) || 30)}
                  className={`${inputClassName} max-w-[120px]`}
                />
              </div>
            }
          />
        </div>
      </section>
    </div>
  );

  const renderOperationDiagnostics = () => (
    <section className="rounded-2xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-zinc-950">Diagnostico</h2>
        </div>
        <span className={subtleBadgeClassName}>Sistema</span>
      </div>

      <div className="px-4 py-4">
        <ReadonlyRows
          fields={[
            { id: 'sistemaVersion', key: 'sistema_version', groupId: group.id, categoryId: 'sistema', label: 'Version', type: 'text', editable: false, source: 'derived', status: 'stored', defaultValue: '1.0.0' },
            { id: 'logoCargado', key: 'logo_cargado', groupId: group.id, categoryId: 'sistema', label: 'Logo cargado', type: 'text', editable: false, source: 'derived', status: 'stored', defaultValue: logo.exists ? 'Si' : 'No', formatValue: () => (logo.exists ? 'Si' : 'No') },
            { id: 'editableCount', key: 'editable_count', groupId: group.id, categoryId: 'sistema', label: 'Campos editables', type: 'number', editable: false, source: 'derived', status: 'stored', defaultValue: stats.editableCount, formatValue: () => String(stats.editableCount) },
            { id: 'syncLabel', key: 'sync_label', groupId: group.id, categoryId: 'sistema', label: 'Sincronizacion', type: 'text', editable: false, source: 'derived', status: 'stored', defaultValue: syncLabel, formatValue: () => syncLabel },
          ]}
          values={values}
        />
      </div>
    </section>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 border-b border-zinc-200 pb-3 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-zinc-900">{group.contextLabel}</span>
        <span>{syncLabel}</span>
      </div>

      {group.id === 'identidad' ? renderIdentityGroup() : null}
      {group.id === 'alertas' ? renderAlertsGroup() : null}
      {group.id === 'seguridad' ? renderReadonlyCategory('seguridad') : null}
      {group.id === 'seguridad' ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">Lectura operativa segura</h2>
            </div>
          </div>
        </section>
      ) : null}
      {group.id === 'operacion' ? renderReadonlyCategory('backup') : null}
      {group.id === 'operacion' ? (
        <MinimalActionRow
          title="Exportar respaldo manual"
          description="Genera y descarga una copia completa de la base de datos actual en .backup o .sql."
          buttonLabel={isExportingBackup ? 'Exportando...' : 'Exportar respaldo'}
          onAction={handleExportDatabaseBackup}
          isLoading={isExportingBackup}
          footer={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="backup-export-format" className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
                Formato
              </label>
              <select
                id="backup-export-format"
                value={backupExportFormat}
                onChange={(event) => setBackupExportFormat(event.target.value as BackupExportFormat)}
                className={`${inputClassName} max-w-[160px]`}
                disabled={isExportingBackup}
              >
                <option value="backup">.backup</option>
                <option value="sql">.sql</option>
              </select>
            </div>
          }
        />
      ) : null}
      {group.id === 'operacion' ? renderReadonlyCategory('reportes') : null}
      {group.id === 'operacion' ? renderReadonlyCategory('api') : null}
      {group.id === 'operacion' ? renderOperationDiagnostics() : null}

      {hasEditableFields ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {dirtyCount > 0 ? (
              <p className="text-sm text-zinc-500">
                {dirtyCount} cambio{dirtyCount === 1 ? '' : 's'} pendiente{dirtyCount === 1 ? '' : 's'}
              </p>
            ) : (
              <span />
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className={secondaryButtonClassName} onClick={onResetGroup} disabled={dirtyCount === 0 || isSaving}>
                Restablecer
              </button>
              <button type="button" className={primaryButtonClassName} onClick={() => void onSaveGroup()} disabled={isSaving || dirtyCount === 0}>
                {isSaving ? <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <Modal
        isOpen={cleanupDialogOpen}
        onClose={() => {
          if (!isCleaningAlerts) {
            setCleanupDialogOpen(false);
          }
        }}
        title="Limpiar alertas leidas"
        subtitle="Confirma la depuracion para mantener una bandeja mas clara."
        icon={Trash}
        size="md"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={secondaryButtonClassName} disabled={isCleaningAlerts} onClick={() => setCleanupDialogOpen(false)}>
              Cancelar
            </button>
            <button type="button" className={primaryButtonClassName} disabled={isCleaningAlerts} onClick={() => void handleConfirmCleanup()}>
              {isCleaningAlerts ? <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              <span>{isCleaningAlerts ? 'Limpiando...' : 'Confirmar'}</span>
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-zinc-600">
          <p>
            Se eliminaran alertas leidas con mas de <span className="font-medium text-zinc-950">{cleanupDays} dias</span> de antiguedad.
          </p>
          <p>La depuracion no afecta alertas activas ni no leidas.</p>
        </div>
      </Modal>
    </div>
  );
};

export default memo(ConfiguracionGroupView);
 