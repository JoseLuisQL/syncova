import React, { memo } from 'react';
import { Database, Calendar, HardDrive, CheckCircle } from 'lucide-react';
import { FormSection, InputField, SelectField, ToggleField } from './FormSection';

interface ConfiguracionRespaldosProps {
  config: {
    automatico: boolean;
    frecuencia: string;
    hora: string;
    retencionDias: number;
    ubicacionRespaldo: string;
  };
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionRespaldos: React.FC<ConfiguracionRespaldosProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  return (
    <FormSection
      title="Respaldos y Recuperacion"
      subtitle="Configuracion de copias de seguridad automaticas"
      icon={Database}
      iconColor="bg-emerald-100 text-emerald-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programacion de Respaldos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Programacion de Respaldos
          </h4>

          <ToggleField
            label="Respaldo Automatico"
            description="Programar respaldos regulares"
            checked={config.automatico}
            onChange={(value) => onUpdate('automatico', value)}
          />

          <SelectField
            label="Frecuencia"
            value={config.frecuencia}
            onChange={(value) => onUpdate('frecuencia', value)}
            options={[
              { value: 'diaria', label: 'Diaria' },
              { value: 'semanal', label: 'Semanal' },
              { value: 'mensual', label: 'Mensual' },
            ]}
            disabled={!config.automatico}
          />

          <InputField
            label="Hora de Ejecucion"
            type="time"
            value={config.hora}
            onChange={(value) => onUpdate('hora', value)}
            disabled={!config.automatico}
          />
        </div>

        {/* Retencion y Almacenamiento */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-emerald-600" />
            Retencion y Almacenamiento
          </h4>

          <InputField
            label="Retencion (dias)"
            type="number"
            value={config.retencionDias}
            onChange={(value) => onUpdate('retencionDias', value)}
            min={7}
            max={365}
            helpText="Los respaldos se eliminan automaticamente despues de este periodo"
          />

          <InputField
            label="Ubicacion de Respaldo"
            value={config.ubicacionRespaldo}
            onChange={(value) => onUpdate('ubicacionRespaldo', value)}
            placeholder="/var/backups"
          />

          {/* Estado del ultimo respaldo */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Estado del Ultimo Respaldo</h5>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-600">Completado exitosamente</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ultimo respaldo: {new Date().toLocaleDateString()} a las 02:00
            </p>
          </div>
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionRespaldos.displayName = 'ConfiguracionRespaldos';

export default ConfiguracionRespaldos;
