import { useState, useCallback, useMemo } from 'react';
import { DEFAULT_CONFIG, ConfiguracionState } from '../constants';

export interface UseConfiguracionReturn {
  config: ConfiguracionState;
  activeSection: string;
  isSaving: boolean;
  hasChanges: boolean;
  setActiveSection: (section: string) => void;
  updateField: (section: string, field: string, value: any) => void;
  updateNestedField: (section: string, subsection: string, field: string, value: any) => void;
  saveSection: (section: string) => Promise<boolean>;
  resetSection: (section: string) => void;
  exportConfig: () => void;
  importConfig: (file: File) => Promise<boolean>;
}

export const useConfiguracion = (): UseConfiguracionReturn => {
  const [config, setConfig] = useState<ConfiguracionState>(() => {
    const saved = localStorage.getItem('sivac-config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });


  const [activeSection, setActiveSection] = useState<string>('general');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [modifiedSections, setModifiedSections] = useState<Set<string>>(new Set());

  const hasChanges = useMemo(() => modifiedSections.size > 0, [modifiedSections]);

  const updateField = useCallback((section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value,
      },
    }));
    setModifiedSections(prev => new Set([...prev, section]));
  }, []);

  const updateNestedField = useCallback((section: string, subsection: string, field: string, value: any) => {
    setConfig(prev => {
      const sectionData = prev[section as keyof typeof prev] as Record<string, any>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [subsection]: {
            ...sectionData[subsection],
            [field]: value,
          },
        },
      };
    });
    setModifiedSections(prev => new Set([...prev, section]));
  }, []);

  const saveSection = useCallback(async (section: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('sivac-config', JSON.stringify(config));
      setModifiedSections(prev => {
        const next = new Set(prev);
        next.delete(section);
        return next;
      });
      return true;
    } catch (error) {
      console.error('Error saving configuration:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  const resetSection = useCallback((section: string) => {
    const defaultSection = DEFAULT_CONFIG[section as keyof typeof DEFAULT_CONFIG];
    if (defaultSection) {
      setConfig(prev => ({
        ...prev,
        [section]: defaultSection,
      }));
      setModifiedSections(prev => {
        const next = new Set(prev);
        next.delete(section);
        return next;
      });
    }
  }, []);

  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `sivac-config-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [config]);

  const importConfig = useCallback(async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setConfig({ ...DEFAULT_CONFIG, ...imported });
          localStorage.setItem('sivac-config', JSON.stringify({ ...DEFAULT_CONFIG, ...imported }));
          resolve(true);
        } catch (error) {
          console.error('Error importing configuration:', error);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, []);

  return {
    config,
    activeSection,
    isSaving,
    hasChanges,
    setActiveSection,
    updateField,
    updateNestedField,
    saveSection,
    resetSection,
    exportConfig,
    importConfig,
  };
};

export default useConfiguracion;
