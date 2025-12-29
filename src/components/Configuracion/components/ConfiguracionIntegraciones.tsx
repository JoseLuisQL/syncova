import React, { memo, useState } from 'react';
import { Link, Database, Server, Eye, EyeOff } from 'lucide-react';
import { FormSection, InputField, ToggleField } from './FormSection';

interface ConfiguracionIntegracionesProps {
  config: {
    apiHisMinsa: {
      habilitado: boolean;
      url: string;
      apiKey: string;
    };
    siga: {
      habilitado: boolean;
      servidor: string;
      puerto: number;
    };
  };
  onUpdateNested: (subsection: string, field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionIntegraciones: React.FC<ConfiguracionIntegracionesProps> = memo(({
  config,
  onUpdateNested,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <FormSection
      title="APIs y Servicios Externos"
      subtitle="Configuracion de integraciones con sistemas externos"
      icon={Link}
      iconColor="bg-teal-100 text-teal-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API HIS MINSA */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Database className="h-4 w-4 text-teal-600" />
            API HIS MINSA
          </h4>

          <ToggleField
            label="Integracion Habilitada"
            description="Conectar con sistema HIS MINSA"
            checked={config.apiHisMinsa.habilitado}
            onChange={(value) => onUpdateNested('apiHisMinsa', 'habilitado', value)}
          />

          {config.apiHisMinsa.habilitado && (
            <>
              <InputField
                label="URL del Servicio"
                value={config.apiHisMinsa.url}
                onChange={(value) => onUpdateNested('apiHisMinsa', 'url', value)}
                placeholder="https://api.hisminsa.gob.pe"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiHisMinsa.apiKey}
                    onChange={(e) => onUpdateNested('apiHisMinsa', 'apiKey', e.target.value)}
                    placeholder="Ingrese su API Key"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm
                               focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                               transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sistema SIGA */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Server className="h-4 w-4 text-teal-600" />
            Sistema SIGA
          </h4>

          <ToggleField
            label="Integracion Habilitada"
            description="Conectar con sistema administrativo"
            checked={config.siga.habilitado}
            onChange={(value) => onUpdateNested('siga', 'habilitado', value)}
          />

          {config.siga.habilitado && (
            <>
              <InputField
                label="Servidor"
                value={config.siga.servidor}
                onChange={(value) => onUpdateNested('siga', 'servidor', value)}
                placeholder="servidor.siga.gob.pe"
              />

              <InputField
                label="Puerto"
                type="number"
                value={config.siga.puerto}
                onChange={(value) => onUpdateNested('siga', 'puerto', value)}
                min={1}
                max={65535}
              />
            </>
          )}
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionIntegraciones.displayName = 'ConfiguracionIntegraciones';

export default ConfiguracionIntegraciones;
