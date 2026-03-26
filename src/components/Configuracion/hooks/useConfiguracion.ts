import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertasService } from '../../../services/alertasService';
import { ConfiguracionService, type ConfiguracionSistema } from '../../../services/configuracionService';
import {
  CONFIG_CATEGORIES,
  CONFIG_FIELDS,
  CONFIG_GROUPS,
  getEditableFieldsByGroup,
  getFieldsByGroup,
  getGroupById,
} from '../constants';
import type {
  ConfiguracionFieldDefinition,
  ConfiguracionFieldValue,
  ConfiguracionGroupId,
  ConfiguracionLogoState,
  ConfiguracionStats,
  ConfiguracionViewModel,
} from '../types';

interface SaveGroupResult {
  success: boolean;
  updatedCount: number;
}

export interface UseConfiguracionReturn {
  groups: typeof CONFIG_GROUPS;
  categories: typeof CONFIG_CATEGORIES;
  fieldDefinitions: typeof CONFIG_FIELDS;
  values: ConfiguracionViewModel['values'];
  recordsByKey: ConfiguracionViewModel['recordsByKey'];
  logo: ConfiguracionLogoState;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastLoadedAt: Date | null;
  savingGroups: Record<ConfiguracionGroupId, boolean>;
  updateField: (fieldId: string, value: ConfiguracionFieldValue) => void;
  resetGroup: (groupId: ConfiguracionGroupId) => void;
  saveGroup: (groupId: ConfiguracionGroupId) => Promise<SaveGroupResult>;
  refresh: () => Promise<void>;
  getGroupStats: (groupId: ConfiguracionGroupId) => ConfiguracionStats;
  getDirtyCount: (groupId?: ConfiguracionGroupId) => number;
  isFieldDirty: (fieldId: string) => boolean;
  hasPendingChanges: boolean;
  hasPendingChangesInGroup: (groupId: ConfiguracionGroupId) => boolean;
  uploadLogo: (file: File) => Promise<boolean>;
  deleteLogo: () => Promise<boolean>;
  runAlertGeneration: () => Promise<Awaited<ReturnType<typeof AlertasService.generarAutomaticas>>>;
  cleanupResolvedAlerts: (days: number) => Promise<Awaited<ReturnType<typeof AlertasService.limpiarAntiguas>>>;
}

const EMPTY_VALUES: Record<string, ConfiguracionFieldValue> = {};
const INITIAL_SAVING_STATE: Record<ConfiguracionGroupId, boolean> = {
  identidad: false,
  alertas: false,
  seguridad: false,
  operacion: false,
};

const parseFieldValue = (field: ConfiguracionFieldDefinition, record: ConfiguracionSistema | null): ConfiguracionFieldValue => {
  if (!record) {
    return field.defaultValue;
  }

  if (field.type === 'number') {
    const parsed = Number(record.valor);
    return Number.isNaN(parsed) ? field.defaultValue : parsed;
  }

  return record.valor;
};

const serializeFieldValue = (field: ConfiguracionFieldDefinition, value: ConfiguracionFieldValue): string => {
  if (field.type === 'number') {
    return String(Number(value));
  }

  return String(value).trim();
};

const resolveRecordForField = (
  field: ConfiguracionFieldDefinition,
  recordsByKey: Record<string, ConfiguracionSistema>,
): { record: ConfiguracionSistema | null; matchedKey: string | null } => {
  if (recordsByKey[field.key]) {
    return {
      record: recordsByKey[field.key],
      matchedKey: field.key,
    };
  }

  for (const legacyKey of field.legacyKeys || []) {
    if (recordsByKey[legacyKey]) {
      return {
        record: recordsByKey[legacyKey],
        matchedKey: legacyKey,
      };
    }
  }

  return {
    record: null,
    matchedKey: null,
  };
};

const buildViewModel = (records: ConfiguracionSistema[]): ConfiguracionViewModel => {
  const recordsByKey = records.reduce<Record<string, ConfiguracionSistema>>((accumulator, record) => {
    accumulator[record.clave] = record;
    return accumulator;
  }, {});

  const values = { ...EMPTY_VALUES };
  const originalValues = { ...EMPTY_VALUES };
  const resolvedKeysByField: Record<string, string | null> = {};

  CONFIG_FIELDS.forEach((field) => {
    const { record, matchedKey } = resolveRecordForField(field, recordsByKey);
    const value = parseFieldValue(field, record);
    values[field.id] = value;
    originalValues[field.id] = value;
    resolvedKeysByField[field.id] = matchedKey;
  });

  return {
    values,
    originalValues,
    recordsByKey,
    resolvedKeysByField,
  };
};

export const useConfiguracion = (): UseConfiguracionReturn => {
  const [viewModel, setViewModel] = useState<ConfiguracionViewModel>({
    values: EMPTY_VALUES,
    originalValues: EMPTY_VALUES,
    recordsByKey: {},
    resolvedKeysByField: {},
  });
  const [logo, setLogo] = useState<ConfiguracionLogoState>({
    exists: false,
    url: null,
    isLoading: true,
    isUploading: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [savingGroups, setSavingGroups] = useState<Record<ConfiguracionGroupId, boolean>>(INITIAL_SAVING_STATE);

  const applyPayload = useCallback((records: ConfiguracionSistema[], logoData: { exists: boolean; url: string } | null) => {
    setViewModel(buildViewModel(records));
    setLogo({
      exists: Boolean(logoData?.exists),
      url: logoData?.exists ? `${ConfiguracionService.getLogoFileUrl()}?t=${Date.now()}` : null,
      isLoading: false,
      isUploading: false,
    });
    setLastLoadedAt(new Date());
  }, []);

  const loadConfiguracion = useCallback(
    async (isInitialLoad: boolean) => {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const [records, logoData] = await Promise.all([
          ConfiguracionService.getAll(),
          ConfiguracionService.getLogo().catch(() => null),
        ]);
        applyPayload(records, logoData);
      } catch (loadError) {
        console.error('Error al cargar configuracion:', loadError);
        setError('No se pudo cargar la configuracion del sistema.');
        setLogo((current) => ({
          ...current,
          isLoading: false,
        }));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [applyPayload],
  );

  useEffect(() => {
    void loadConfiguracion(true);
  }, [loadConfiguracion]);

  const isFieldDirty = useCallback(
    (fieldId: string) => viewModel.values[fieldId] !== viewModel.originalValues[fieldId],
    [viewModel.originalValues, viewModel.values],
  );

  const getDirtyCount = useCallback(
    (groupId?: ConfiguracionGroupId) => {
      const fields = groupId ? getFieldsByGroup(groupId) : CONFIG_FIELDS;
      return fields.reduce((count, field) => count + (isFieldDirty(field.id) ? 1 : 0), 0);
    },
    [isFieldDirty],
  );

  const hasPendingChanges = useMemo(() => getDirtyCount() > 0, [getDirtyCount]);

  const hasPendingChangesInGroup = useCallback(
    (groupId: ConfiguracionGroupId) => getDirtyCount(groupId) > 0,
    [getDirtyCount],
  );

  const updateField = useCallback((fieldId: string, value: ConfiguracionFieldValue) => {
    setViewModel((current) => ({
      ...current,
      values: {
        ...current.values,
        [fieldId]: value,
      },
    }));
  }, []);

  const resetGroup = useCallback((groupId: ConfiguracionGroupId) => {
    const fields = getFieldsByGroup(groupId);
    setViewModel((current) => {
      const nextValues = { ...current.values };
      fields.forEach((field) => {
        nextValues[field.id] = current.originalValues[field.id];
      });
      return {
        ...current,
        values: nextValues,
      };
    });
  }, []);

  const saveGroup = useCallback(
    async (groupId: ConfiguracionGroupId): Promise<SaveGroupResult> => {
      const changedFields = getEditableFieldsByGroup(groupId).filter((field) => isFieldDirty(field.id));

      if (changedFields.length === 0) {
        return { success: true, updatedCount: 0 };
      }

      setSavingGroups((current) => ({
        ...current,
        [groupId]: true,
      }));
      setError(null);

      const payload = changedFields.map((field) => ({
        field,
        valor: serializeFieldValue(field, viewModel.values[field.id]),
      }));

      try {
        try {
          await ConfiguracionService.bulkUpdate(payload.map((item) => ({ clave: item.field.key, valor: item.valor })));
        } catch {
          for (const item of payload) {
            if (viewModel.recordsByKey[item.field.key]) {
              await ConfiguracionService.updateByKey(item.field.key, item.valor);
              continue;
            }

            await ConfiguracionService.create({
              clave: item.field.key,
              valor: item.valor,
              tipoDato: item.field.createMeta?.tipoDato || 'string',
              categoria: item.field.createMeta?.categoria || getGroupById(groupId)?.id || 'general',
              esPublico: item.field.createMeta?.esPublico || false,
              descripcion: item.field.createMeta?.descripcion || item.field.description,
            });
          }
        }

        const refreshedRecords = await ConfiguracionService.getAll();
        setViewModel(buildViewModel(refreshedRecords));
        setLastLoadedAt(new Date());

        return {
          success: true,
          updatedCount: payload.length,
        };
      } catch (saveError) {
        console.error(`Error al guardar configuracion del grupo ${groupId}:`, saveError);
        setError('No se pudieron guardar los cambios de esta seccion.');
        return { success: false, updatedCount: 0 };
      } finally {
        setSavingGroups((current) => ({
          ...current,
          [groupId]: false,
        }));
      }
    },
    [isFieldDirty, viewModel.recordsByKey, viewModel.values],
  );

  const refresh = useCallback(async () => {
    await loadConfiguracion(false);
  }, [loadConfiguracion]);

  const getGroupStats = useCallback(
    (groupId: ConfiguracionGroupId): ConfiguracionStats => {
      const groupFields = getFieldsByGroup(groupId);
      return {
        categoriesVisible: CONFIG_CATEGORIES.filter((category) => category.groupId === groupId).length,
        editableCount: groupFields.filter((field) => field.editable).length,
        readonlyCount: groupFields.filter((field) => !field.editable).length,
        pendingCount: getDirtyCount(groupId),
      };
    },
    [getDirtyCount],
  );

  const uploadLogo = useCallback(async (file: File) => {
    setLogo((current) => ({
      ...current,
      isUploading: true,
    }));

    try {
      await ConfiguracionService.uploadLogo(file);
      setLogo({
        exists: true,
        url: `${ConfiguracionService.getLogoFileUrl()}?t=${Date.now()}`,
        isLoading: false,
        isUploading: false,
      });
      return true;
    } catch (uploadError) {
      console.error('Error al subir logo:', uploadError);
      setLogo((current) => ({
        ...current,
        isUploading: false,
      }));
      return false;
    }
  }, []);

  const deleteLogo = useCallback(async () => {
    setLogo((current) => ({
      ...current,
      isUploading: true,
    }));

    try {
      await ConfiguracionService.deleteLogo();
      setLogo({
        exists: false,
        url: null,
        isLoading: false,
        isUploading: false,
      });
      return true;
    } catch (deleteError) {
      console.error('Error al eliminar logo:', deleteError);
      setLogo((current) => ({
        ...current,
        isUploading: false,
      }));
      return false;
    }
  }, []);

  const runAlertGeneration = useCallback(() => {
    const diasAnticipacion = Number(viewModel.values.diasAlertaVencimiento ?? 30);
    const stockMinimo = Number(viewModel.values.stockMinimoDefault ?? 100);
    return AlertasService.generarAutomaticas(diasAnticipacion, stockMinimo);
  }, [viewModel.values.diasAlertaVencimiento, viewModel.values.stockMinimoDefault]);

  const cleanupResolvedAlerts = useCallback((days: number) => AlertasService.limpiarAntiguas(days), []);

  return {
    groups: CONFIG_GROUPS,
    categories: CONFIG_CATEGORIES,
    fieldDefinitions: CONFIG_FIELDS,
    values: viewModel.values,
    recordsByKey: viewModel.recordsByKey,
    logo,
    isLoading,
    isRefreshing,
    error,
    lastLoadedAt,
    savingGroups,
    updateField,
    resetGroup,
    saveGroup,
    refresh,
    getGroupStats,
    getDirtyCount,
    isFieldDirty,
    hasPendingChanges,
    hasPendingChangesInGroup,
    uploadLogo,
    deleteLogo,
    runAlertGeneration,
    cleanupResolvedAlerts,
  };
};

export default useConfiguracion;
 