import { useState, useCallback, useEffect, useMemo } from 'react';
import { ConfiguracionService, ConfiguracionSistema } from '../../../services/configuracionService';
import { DEFAULT_CONFIG, CONFIG_KEYS } from '../constants';

export interface ConfiguracionState {
  general: {
    sistemaNombre: string;
    institucionNombre: string;
    institucionDireccion: string;
    institucionTelefono: string;
    institucionEmail: string;
    timezone: string;
    formatoFecha: string;
  };
  alertas: {
    diasAnticipacion: number;
    stockMinimo: number;
    diasRetencion: number;
  };
  sistema: {
    version: string;
    tiempoSesion: number;
  };
}

export interface UseConfiguracionReturn {
  config: ConfiguracionState;
  activeSection: string;
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  error: string | null;
  setActiveSection: (section: string) => void;
  updateField: (section: string, field: string, value: string | number | boolean) => void;
  saveSection: (section: string) => Promise<boolean>;
  resetSection: (section: string) => void;
  refreshConfig: () => Promise<void>;
}

const mapConfigToState = (dbConfigs: ConfiguracionSistema[]): ConfiguracionState => {
  const getValue = (key: string, defaultVal: string | number): string | number => {
    const config = dbConfigs.find(c => c.clave === key);
    if (!config) return defaultVal;
    
    if (typeof defaultVal === 'number') {
      const parsed = parseFloat(config.valor);
      return isNaN(parsed) ? defaultVal : parsed;
    }
    return config.valor;
  };

  return {
    general: {
      sistemaNombre: getValue(CONFIG_KEYS.SISTEMA_NOMBRE, DEFAULT_CONFIG.general.sistemaNombre) as string,
      institucionNombre: getValue(CONFIG_KEYS.INSTITUCION_NOMBRE, DEFAULT_CONFIG.general.institucionNombre) as string,
      institucionDireccion: getValue(CONFIG_KEYS.INSTITUCION_DIRECCION, DEFAULT_CONFIG.general.institucionDireccion) as string,
      institucionTelefono: getValue(CONFIG_KEYS.INSTITUCION_TELEFONO, DEFAULT_CONFIG.general.institucionTelefono) as string,
      institucionEmail: getValue(CONFIG_KEYS.INSTITUCION_EMAIL, DEFAULT_CONFIG.general.institucionEmail) as string,
      timezone: getValue(CONFIG_KEYS.TIMEZONE, DEFAULT_CONFIG.general.timezone) as string,
      formatoFecha: getValue(CONFIG_KEYS.FORMATO_FECHA, DEFAULT_CONFIG.general.formatoFecha) as string,
    },
    alertas: {
      diasAnticipacion: getValue(CONFIG_KEYS.ALERTAS_DIAS_ANTICIPACION, DEFAULT_CONFIG.alertas.diasAnticipacion) as number,
      stockMinimo: getValue(CONFIG_KEYS.ALERTAS_STOCK_MINIMO, DEFAULT_CONFIG.alertas.stockMinimo) as number,
      diasRetencion: getValue(CONFIG_KEYS.ALERTAS_DIAS_RETENCION, DEFAULT_CONFIG.alertas.diasRetencion) as number,
    },
    sistema: {
      version: getValue(CONFIG_KEYS.SISTEMA_VERSION, DEFAULT_CONFIG.sistema.version) as string,
      tiempoSesion: getValue(CONFIG_KEYS.TIEMPO_SESION, DEFAULT_CONFIG.sistema.tiempoSesion) as number,
    },
  };
};

const mapSectionToDbKeys = (section: string, data: Record<string, unknown>): Array<{ clave: string; valor: string; fieldKey: string }> => {
  const mappings: Record<string, Record<string, string>> = {
    general: {
      sistemaNombre: CONFIG_KEYS.SISTEMA_NOMBRE,
      institucionNombre: CONFIG_KEYS.INSTITUCION_NOMBRE,
      institucionDireccion: CONFIG_KEYS.INSTITUCION_DIRECCION,
      institucionTelefono: CONFIG_KEYS.INSTITUCION_TELEFONO,
      institucionEmail: CONFIG_KEYS.INSTITUCION_EMAIL,
      timezone: CONFIG_KEYS.TIMEZONE,
      formatoFecha: CONFIG_KEYS.FORMATO_FECHA,
    },
    alertas: {
      diasAnticipacion: CONFIG_KEYS.ALERTAS_DIAS_ANTICIPACION,
      stockMinimo: CONFIG_KEYS.ALERTAS_STOCK_MINIMO,
      diasRetencion: CONFIG_KEYS.ALERTAS_DIAS_RETENCION,
    },
    sistema: {
      version: CONFIG_KEYS.SISTEMA_VERSION,
      tiempoSesion: CONFIG_KEYS.TIEMPO_SESION,
    },
  };

  const sectionMappings = mappings[section];
  if (!sectionMappings) return [];

  return Object.entries(data)
    .filter(([key]) => sectionMappings[key])
    .map(([key, value]) => ({
      clave: sectionMappings[key],
      valor: String(value),
      fieldKey: key,
    }));
};

export const useConfiguracion = (): UseConfiguracionReturn => {
  const [config, setConfig] = useState<ConfiguracionState>(DEFAULT_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<ConfiguracionState>(DEFAULT_CONFIG);
  const [activeSection, setActiveSection] = useState<string>('general');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modifiedSections, setModifiedSections] = useState<Set<string>>(new Set());

  const hasChanges = useMemo(() => modifiedSections.size > 0, [modifiedSections]);

  const refreshConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const configs = await ConfiguracionService.getAll();
      const mappedConfig = mapConfigToState(configs);
      setConfig(mappedConfig);
      setOriginalConfig(mappedConfig);
      setModifiedSections(new Set());
    } catch (err) {
      console.error('Error loading configuration:', err);
      setError('Error al cargar la configuracion');
      // Use defaults from localStorage as fallback
      const saved = localStorage.getItem('sivac-config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig({ ...DEFAULT_CONFIG, ...parsed });
        } catch {
          setConfig(DEFAULT_CONFIG);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const updateField = useCallback((section: string, field: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value,
      },
    }));
    setModifiedSections(prev => new Set([...prev, section]));
  }, []);

  const saveSection = useCallback(async (section: string): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    
    try {
      const sectionData = config[section as keyof ConfiguracionState];
      const configsToUpdate = mapSectionToDbKeys(section, sectionData as Record<string, unknown>);
      
      if (configsToUpdate.length === 0) {
        setIsSaving(false);
        return true;
      }

      // Try bulk update first
      let bulkFailed = false;
      try {
        await ConfiguracionService.bulkUpdate(configsToUpdate.map(c => ({ clave: c.clave, valor: c.valor })));
      } catch {
        bulkFailed = true;
      }

      // If bulk update fails, try individual updates
      if (bulkFailed) {
        for (const cfg of configsToUpdate) {
          try {
            await ConfiguracionService.updateByKey(cfg.clave, cfg.valor);
          } catch {
            // If update fails (config doesn't exist), try to create it
            const fieldValue = (sectionData as Record<string, unknown>)[cfg.fieldKey];
            const tipoDato = typeof fieldValue === 'number' ? 'number' : 'string';
            try {
              await ConfiguracionService.create({
                clave: cfg.clave,
                valor: cfg.valor,
                tipoDato,
                categoria: section,
                esPublico: section === 'general',
              });
            } catch (createError) {
              console.warn(`Could not create config ${cfg.clave}:`, createError);
            }
          }
        }
      }

      // Update original config and localStorage
      setOriginalConfig(prev => ({
        ...prev,
        [section]: sectionData,
      }));
      localStorage.setItem('sivac-config', JSON.stringify(config));
      
      setModifiedSections(prev => {
        const next = new Set(prev);
        next.delete(section);
        return next;
      });
      
      return true;
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError('Error al guardar la configuracion');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  const resetSection = useCallback((section: string) => {
    setConfig(prev => ({
      ...prev,
      [section]: originalConfig[section as keyof ConfiguracionState],
    }));
    setModifiedSections(prev => {
      const next = new Set(prev);
      next.delete(section);
      return next;
    });
  }, [originalConfig]);

  return {
    config,
    activeSection,
    isLoading,
    isSaving,
    hasChanges,
    error,
    setActiveSection,
    updateField,
    saveSection,
    resetSection,
    refreshConfig,
  };
};

export default useConfiguracion;
