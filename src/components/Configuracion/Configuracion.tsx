import React, { useCallback, useMemo } from 'react';
import { useToastContext } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useConfiguracion } from './hooks/useConfiguracion';
import { COMPONENT_STYLES, CONFIG_SECTIONS } from './constants';
import {
  ConfiguracionHeader,
  ConfiguracionSidebar,
  ConfiguracionGeneral,
  ConfiguracionSeguridad,
  ConfiguracionSistema,
  ConfiguracionNotificaciones,
  ConfiguracionRespaldos,
  ConfiguracionMantenimiento,
  ConfiguracionIntegraciones,
  ConfiguracionAvanzada,
} from './components';

const Configuracion: React.FC = () => {
  const { toast } = useToastContext();
  const { canAccessSection } = usePermissions();
  
  // Filtrar secciones según permisos
  const filteredSections = useMemo(() => {
    return CONFIG_SECTIONS.filter(section => canAccessSection('configuracion', section.id));
  }, [canAccessSection]);
  
  const {
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
  } = useConfiguracion();

  const handleSave = useCallback(async (section: string) => {
    const success = await saveSection(section);
    if (success) {
      toast.success(`Configuracion de ${section} guardada exitosamente`);
    } else {
      toast.error(`Error al guardar configuracion de ${section}`);
    }
  }, [saveSection, toast]);

  const handleReset = useCallback((section: string) => {
    resetSection(section);
    toast.info(`Configuracion de ${section} restablecida a valores por defecto`);
  }, [resetSection, toast]);

  const handleExport = useCallback(() => {
    exportConfig();
    toast.success('Configuracion exportada exitosamente');
  }, [exportConfig, toast]);

  const handleImport = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const success = await importConfig(file);
        if (success) {
          toast.success('Configuracion importada exitosamente');
        } else {
          toast.error('Error al importar la configuracion. Verifique el formato del archivo.');
        }
      }
    };
    input.click();
  }, [importConfig, toast]);

  const renderActiveSection = () => {
    const commonProps = {
      isSaving,
      hasChanges,
    };

    switch (activeSection) {
      case 'general':
        return (
          <ConfiguracionGeneral
            config={config.general}
            onUpdate={(field, value) => updateField('general', field, value)}
            onSave={() => handleSave('general')}
            onReset={() => handleReset('general')}
            {...commonProps}
          />
        );

      case 'seguridad':
        return (
          <ConfiguracionSeguridad
            config={config.seguridad}
            onUpdate={(field, value) => updateField('seguridad', field, value)}
            onSave={() => handleSave('seguridad')}
            onReset={() => handleReset('seguridad')}
            {...commonProps}
          />
        );

      case 'sistema':
        return (
          <ConfiguracionSistema
            config={config.sistema}
            onUpdate={(field, value) => updateField('sistema', field, value)}
            onSave={() => handleSave('sistema')}
            onReset={() => handleReset('sistema')}
            {...commonProps}
          />
        );

      case 'notificaciones':
        return (
          <ConfiguracionNotificaciones
            config={config.notificaciones}
            onUpdate={(field, value) => updateField('notificaciones', field, value)}
            onSave={() => handleSave('notificaciones')}
            onReset={() => handleReset('notificaciones')}
            {...commonProps}
          />
        );

      case 'respaldos':
        return (
          <ConfiguracionRespaldos
            config={config.respaldos}
            onUpdate={(field, value) => updateField('respaldos', field, value)}
            onSave={() => handleSave('respaldos')}
            onReset={() => handleReset('respaldos')}
            {...commonProps}
          />
        );

      case 'mantenimiento':
        return (
          <ConfiguracionMantenimiento
            config={config.mantenimiento}
            onUpdate={(field, value) => updateField('mantenimiento', field, value)}
            onSave={() => handleSave('mantenimiento')}
            onReset={() => handleReset('mantenimiento')}
            {...commonProps}
          />
        );

      case 'integraciones':
        return (
          <ConfiguracionIntegraciones
            config={config.integraciones}
            onUpdateNested={(subsection, field, value) =>
              updateNestedField('integraciones', subsection, field, value)
            }
            onSave={() => handleSave('integraciones')}
            onReset={() => handleReset('integraciones')}
            {...commonProps}
          />
        );

      case 'avanzado':
        return (
          <ConfiguracionAvanzada
            config={config.avanzado}
            onUpdate={(field, value) => updateField('avanzado', field, value)}
            onSave={() => handleSave('avanzado')}
            onReset={() => handleReset('avanzado')}
            {...commonProps}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header */}
      <ConfiguracionHeader
        onExport={handleExport}
        onImport={handleImport}
        hasChanges={hasChanges}
      />

      {/* Content */}
      <div className="flex">
        {/* Sidebar */}
        <ConfiguracionSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          sections={filteredSections}
        />

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Configuracion;
