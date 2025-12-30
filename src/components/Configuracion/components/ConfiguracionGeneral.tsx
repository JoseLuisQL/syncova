import React, { memo } from 'react';
import { Building2, Monitor } from 'lucide-react';
import { FormSection, InputField, SelectField } from './FormSection';

interface ConfiguracionGeneralProps {
  config: {
    sistemaNombre: string;
    institucionNombre: string;
    institucionDireccion: string;
    institucionTelefono: string;
    institucionEmail: string;
    timezone: string;
    formatoFecha: string;
  };
  onUpdate: (field: string, value: string) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionGeneral: React.FC<ConfiguracionGeneralProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  return (
    <FormSection
      title="Informacion General"
      subtitle="Configuracion basica de la institucion y sistema"
      icon={Building2}
      iconColor="bg-teal-100 text-teal-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistema */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-teal-600" />
            Informacion del Sistema
          </h4>

          <InputField
            label="Nombre del Sistema"
            value={config.sistemaNombre || ''}
            onChange={(value) => onUpdate('sistemaNombre', value)}
          />

          <SelectField
            label="Zona Horaria"
            value={config.timezone || 'America/Lima'}
            onChange={(value) => onUpdate('timezone', value)}
            options={[
              { value: 'America/Lima', label: 'Lima (UTC-5)' },
              { value: 'America/Bogota', label: 'Bogota (UTC-5)' },
              { value: 'America/Mexico_City', label: 'Mexico (UTC-6)' },
            ]}
          />

          <SelectField
            label="Formato de Fecha"
            value={config.formatoFecha || 'DD/MM/YYYY'}
            onChange={(value) => onUpdate('formatoFecha', value)}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
          />
        </div>

        {/* Institucion */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cyan-600" />
            Informacion de la Institucion
          </h4>

          <InputField
            label="Nombre de la Institucion"
            value={config.institucionNombre || ''}
            onChange={(value) => onUpdate('institucionNombre', value)}
          />

          <InputField
            label="Direccion"
            value={config.institucionDireccion || ''}
            onChange={(value) => onUpdate('institucionDireccion', value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Telefono"
              value={config.institucionTelefono || ''}
              onChange={(value) => onUpdate('institucionTelefono', value)}
            />
            <InputField
              label="Email"
              type="email"
              value={config.institucionEmail || ''}
              onChange={(value) => onUpdate('institucionEmail', value)}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionGeneral.displayName = 'ConfiguracionGeneral';

export default ConfiguracionGeneral;
