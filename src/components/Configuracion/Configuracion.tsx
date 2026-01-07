import React, { useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useConfiguracion } from './hooks/useConfiguracion';
import { COMPONENT_STYLES, CONFIG_SECTIONS } from './constants';
import {
  ConfiguracionHeader,
  ConfiguracionSidebar,
  ConfiguracionGeneral,
  ConfiguracionSistema,
  ConfiguracionAlertas,
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
    isLoading,
    isSaving,
    hasChanges,
    error,
    setActiveSection,
    updateField,
    saveSection,
    resetSection,
    refreshConfig,
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
    toast.info(`Configuracion de ${section} restablecida`);
  }, [resetSection, toast]);

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

      case 'alertas':
        return (
          <ConfiguracionAlertas
            config={config.alertas}
            onUpdate={(field, value) => updateField('alertas', field, value)}
            onSave={() => handleSave('alertas')}
            onReset={() => handleReset('alertas')}
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

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <main className={COMPONENT_STYLES.pageBackground}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-gray-600">Cargando configuracion...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={COMPONENT_STYLES.pageBackground}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md text-center">
            <p className="text-rose-600 mb-4">{error}</p>
            <button
              onClick={refreshConfig}
              className={COMPONENT_STYLES.button.primary}
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      {/* Header */}
      <ConfiguracionHeader
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
