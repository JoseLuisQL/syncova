import React, { memo } from 'react';
import { RefreshCw, HardDrive, Activity } from 'lucide-react';
import { FormSection, SelectField, ToggleField } from './FormSection';

interface ConfiguracionMantenimientoProps {
  config: {
    limpiezaAutomatica: boolean;
    optimizacionBD: string;
    limpiezaLogs: boolean;
    monitoreoCPU: boolean;
  };
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionMantenimiento: React.FC<ConfiguracionMantenimientoProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  return (
    <FormSection
      title="Mantenimiento del Sistema"
      subtitle="Tareas automaticas de optimizacion y limpieza"
      icon={RefreshCw}
      iconColor="bg-cyan-100 text-cyan-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas de Limpieza */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-cyan-600" />
            Limpieza Automatica
          </h4>

          <ToggleField
            label="Limpieza Automatica"
            description="Limpiar archivos temporales"
            checked={config.limpiezaAutomatica}
            onChange={(value) => onUpdate('limpiezaAutomatica', value)}
          />

          <ToggleField
            label="Limpieza de Logs"
            description="Eliminar logs antiguos"
            checked={config.limpiezaLogs}
            onChange={(value) => onUpdate('limpiezaLogs', value)}
          />
        </div>

        {/* Optimizacion */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-600" />
            Optimizacion
          </h4>

          <SelectField
            label="Optimizacion de BD"
            value={config.optimizacionBD}
            onChange={(value) => onUpdate('optimizacionBD', value)}
            options={[
              { value: 'diaria', label: 'Diaria' },
              { value: 'semanal', label: 'Semanal' },
              { value: 'mensual', label: 'Mensual' },
              { value: 'manual', label: 'Manual' },
            ]}
          />

          <ToggleField
            label="Monitoreo de CPU"
            description="Alertas de rendimiento"
            checked={config.monitoreoCPU}
            onChange={(value) => onUpdate('monitoreoCPU', value)}
          />
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionMantenimiento.displayName = 'ConfiguracionMantenimiento';

export default ConfiguracionMantenimiento;
