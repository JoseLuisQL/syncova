import React, { memo } from 'react';
import { Shield, Key, Lock } from 'lucide-react';
import { FormSection, InputField, ToggleField } from './FormSection';

interface ConfiguracionSeguridadProps {
  config: {
    autenticacionDosFactor: boolean;
    longitudMinimaPassword: number;
    complejidadPassword: boolean;
    expiracionPassword: number;
    intentosMaximoLogin: number;
    encriptacionDatos: boolean;
    auditoriaSesiones: boolean;
  };
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionSeguridad: React.FC<ConfiguracionSeguridadProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  return (
    <FormSection
      title="Politicas de Seguridad"
      subtitle="Configuracion de acceso y autenticacion"
      icon={Shield}
      iconColor="bg-emerald-100 text-emerald-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Politicas de Contrasena */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-600" />
            Politicas de Contrasena
          </h4>

          <InputField
            label="Longitud Minima"
            type="number"
            value={config.longitudMinimaPassword}
            onChange={(value) => onUpdate('longitudMinimaPassword', value)}
            min={6}
            max={20}
            helpText="Caracteres minimos para contrasenas"
          />

          <InputField
            label="Expiracion (dias)"
            type="number"
            value={config.expiracionPassword}
            onChange={(value) => onUpdate('expiracionPassword', value)}
            min={30}
            max={365}
            helpText="Dias antes de requerir cambio de contrasena"
          />

          <ToggleField
            label="Complejidad Requerida"
            description="Mayusculas, numeros y simbolos"
            checked={config.complejidadPassword}
            onChange={(value) => onUpdate('complejidadPassword', value)}
          />
        </div>

        {/* Control de Acceso */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600" />
            Control de Acceso
          </h4>

          <InputField
            label="Intentos Maximos de Login"
            type="number"
            value={config.intentosMaximoLogin}
            onChange={(value) => onUpdate('intentosMaximoLogin', value)}
            min={3}
            max={10}
            helpText="Bloqueo temporal despues de fallar"
          />

          <ToggleField
            label="Autenticacion de Dos Factores"
            description="Verificacion adicional por SMS/Email"
            checked={config.autenticacionDosFactor}
            onChange={(value) => onUpdate('autenticacionDosFactor', value)}
          />

          <ToggleField
            label="Auditoria de Sesiones"
            description="Registrar actividad de usuarios"
            checked={config.auditoriaSesiones}
            onChange={(value) => onUpdate('auditoriaSesiones', value)}
          />

          <ToggleField
            label="Encriptacion de Datos"
            description="Cifrado de informacion sensible"
            checked={config.encriptacionDatos}
            onChange={(value) => onUpdate('encriptacionDatos', value)}
          />
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionSeguridad.displayName = 'ConfiguracionSeguridad';

export default ConfiguracionSeguridad;
