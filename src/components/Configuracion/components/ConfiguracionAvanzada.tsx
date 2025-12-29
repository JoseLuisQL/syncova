import React, { memo } from 'react';
import { Zap, FileText, Database, AlertTriangle } from 'lucide-react';
import { FormSection, InputField, SelectField, ToggleField } from './FormSection';
import { COMPONENT_STYLES } from '../constants';

interface ConfiguracionAvanzadaProps {
  config: {
    modoDebug: boolean;
    nivelLog: string;
    compresionDatos: boolean;
    conexionesBDMaximas: number;
  };
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionAvanzada: React.FC<ConfiguracionAvanzadaProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  return (
    <FormSection
      title="Configuracion Avanzada"
      subtitle="Configuraciones tecnicas especializadas"
      icon={Zap}
      iconColor="bg-amber-100 text-amber-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuraciones de Debug */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600" />
            Debug y Logs
          </h4>

          <ToggleField
            label="Modo Debug"
            description="Informacion detallada de errores"
            checked={config.modoDebug}
            onChange={(value) => onUpdate('modoDebug', value)}
          />

          <SelectField
            label="Nivel de Log"
            value={config.nivelLog}
            onChange={(value) => onUpdate('nivelLog', value)}
            options={[
              { value: 'error', label: 'Error' },
              { value: 'warn', label: 'Warning' },
              { value: 'info', label: 'Info' },
              { value: 'debug', label: 'Debug' },
            ]}
          />
        </div>

        {/* Configuraciones de Base de Datos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-600" />
            Base de Datos
          </h4>

          <InputField
            label="Conexiones Maximas"
            type="number"
            value={config.conexionesBDMaximas}
            onChange={(value) => onUpdate('conexionesBDMaximas', value)}
            min={5}
            max={100}
            helpText="Pool de conexiones a la base de datos"
          />

          <ToggleField
            label="Compresion de Datos"
            description="Reducir uso de ancho de banda"
            checked={config.compresionDatos}
            onChange={(value) => onUpdate('compresionDatos', value)}
          />
        </div>
      </div>

      {/* Advertencia */}
      <div className={`${COMPONENT_STYLES.alert.warning} mt-6`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-medium text-amber-800">Configuraciones Avanzadas</h5>
            <p className="text-sm text-amber-700 mt-1">
              Estas configuraciones afectan el funcionamiento tecnico del sistema.
              Modifique solo si comprende completamente las implicaciones.
            </p>
          </div>
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionAvanzada.displayName = 'ConfiguracionAvanzada';

export default ConfiguracionAvanzada;
