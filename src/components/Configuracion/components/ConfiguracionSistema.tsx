import React, { memo } from 'react';
import { Server, Clock, HardDrive, Info } from 'lucide-react';
import { FormSection, InputField, ToggleField } from './FormSection';

interface ConfiguracionSistemaProps {
  config: {
    versionSistema: string;
    entornoEjecucion: string;
    maxUsuariosConcurrentes: number;
    tiempoSesion: number;
    autoGuardado: boolean;
    cacheDatos: boolean;
  };
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionSistema: React.FC<ConfiguracionSistemaProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  return (
    <FormSection
      title="Configuracion del Sistema"
      subtitle="Parametros de funcionamiento y rendimiento"
      icon={Server}
      iconColor="bg-cyan-100 text-cyan-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      {/* Estado del Sistema */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center mb-3">
          <Info className="h-5 w-5 text-teal-600 mr-2" />
          <h4 className="font-medium text-gray-900">Estado del Sistema</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-sm text-gray-600">Version</div>
            <div className="font-semibold text-gray-900">{config.versionSistema}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-sm text-gray-600">Entorno</div>
            <div className="font-semibold text-gray-900 capitalize">{config.entornoEjecucion}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-sm text-gray-600">Usuarios Maximos</div>
            <div className="font-semibold text-gray-900">{config.maxUsuariosConcurrentes}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuraciones de Sesion */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-600" />
            Configuraciones de Sesion
          </h4>

          <InputField
            label="Tiempo de Sesion (minutos)"
            type="number"
            value={config.tiempoSesion}
            onChange={(value) => onUpdate('tiempoSesion', value)}
            min={1}
            max={1440}
            helpText="Tiempo maximo de inactividad antes de cerrar sesion"
          />

          <ToggleField
            label="Auto-guardado"
            description="Guardar cambios automaticamente"
            checked={config.autoGuardado}
            onChange={(value) => onUpdate('autoGuardado', value)}
          />
        </div>

        {/* Optimizacion de Datos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-cyan-600" />
            Optimizacion de Datos
          </h4>

          <ToggleField
            label="Cache de Datos"
            description="Acelerar consultas frecuentes"
            checked={config.cacheDatos}
            onChange={(value) => onUpdate('cacheDatos', value)}
          />
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionSistema.displayName = 'ConfiguracionSistema';

export default ConfiguracionSistema;
