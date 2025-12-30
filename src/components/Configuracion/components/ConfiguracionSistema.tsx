import React, { memo } from 'react';
import { Server, Info, Clock, Shield, Database } from 'lucide-react';
import { FormSection } from './FormSection';

interface ConfiguracionSistemaProps {
  config: {
    version: string;
    tiempoSesion: number;
  };
  onUpdate: (field: string, value: string | number | boolean) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionSistema: React.FC<ConfiguracionSistemaProps> = memo(({
  config,
}) => {
  return (
    <FormSection
      title="Informacion del Sistema"
      subtitle="Datos tecnicos y estado actual"
      icon={Server}
      iconColor="bg-cyan-100 text-cyan-600"
      showFooter={false}
    >
      {/* Estado del Sistema */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-teal-600" />
            <h4 className="font-semibold text-gray-900">Estado del Sistema</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-teal-600" />
                <span className="text-sm text-gray-600">Version</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{config.version}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-cyan-600" />
                <span className="text-sm text-gray-600">Tiempo de Sesion</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{config.tiempoSesion} min</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-gray-600">Base de Datos</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">Conectada</div>
            </div>
          </div>
        </div>

        {/* Información técnica */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Informacion Tecnica</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Framework Frontend</span>
              <span className="font-medium text-gray-900">React 18 + TypeScript</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Framework Backend</span>
              <span className="font-medium text-gray-900">Express + Prisma</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Base de Datos</span>
              <span className="font-medium text-gray-900">PostgreSQL</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Autenticacion</span>
              <span className="font-medium text-gray-900">JWT + bcrypt</span>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-800 mb-1">Informacion de solo lectura</h5>
              <p className="text-sm text-blue-700">
                Esta seccion muestra informacion del sistema. Los parametros tecnicos son gestionados por el administrador del servidor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionSistema.displayName = 'ConfiguracionSistema';

export default ConfiguracionSistema;
