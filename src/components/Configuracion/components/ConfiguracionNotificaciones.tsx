import React, { memo } from 'react';
import { Bell, Mail, AlertTriangle } from 'lucide-react';
import { FormSection, SelectField, ToggleField } from './FormSection';

interface ConfiguracionNotificacionesProps {
  config: {
    emailHabilitado: boolean;
    alertasStock: boolean;
    alertasVencimiento: boolean;
    notificacionesUsuarios: boolean;
    frecuenciaAlertas: string;
  };
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionNotificaciones: React.FC<ConfiguracionNotificacionesProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  return (
    <FormSection
      title="Configuracion de Notificaciones"
      subtitle="Alertas y comunicaciones del sistema"
      icon={Bell}
      iconColor="bg-amber-100 text-amber-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuraciones de Email */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Mail className="h-4 w-4 text-amber-600" />
            Notificaciones por Email
          </h4>

          <ToggleField
            label="Email Habilitado"
            description="Enviar notificaciones por correo"
            checked={config.emailHabilitado}
            onChange={(value) => onUpdate('emailHabilitado', value)}
          />

          <SelectField
            label="Frecuencia de Alertas"
            value={config.frecuenciaAlertas}
            onChange={(value) => onUpdate('frecuenciaAlertas', value)}
            options={[
              { value: 'inmediata', label: 'Inmediata' },
              { value: 'diaria', label: 'Diaria' },
              { value: 'semanal', label: 'Semanal' },
            ]}
          />
        </div>

        {/* Tipos de Alertas */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Tipos de Alertas
          </h4>

          <ToggleField
            label="Alertas de Stock"
            description="Niveles bajos de inventario"
            checked={config.alertasStock}
            onChange={(value) => onUpdate('alertasStock', value)}
          />

          <ToggleField
            label="Alertas de Vencimiento"
            description="Vacunas proximas a vencer"
            checked={config.alertasVencimiento}
            onChange={(value) => onUpdate('alertasVencimiento', value)}
          />

          <ToggleField
            label="Notificaciones de Usuarios"
            description="Actividad de usuarios del sistema"
            checked={config.notificacionesUsuarios}
            onChange={(value) => onUpdate('notificacionesUsuarios', value)}
          />
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionNotificaciones.displayName = 'ConfiguracionNotificaciones';

export default ConfiguracionNotificaciones;
