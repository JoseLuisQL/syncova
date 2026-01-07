import React, { memo } from 'react';
import { Settings } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface ConfiguracionHeaderProps {
  hasChanges?: boolean;
}

export const ConfiguracionHeader: React.FC<ConfiguracionHeaderProps> = memo(({
  hasChanges = false,
}) => {
  return (
    <header className={COMPONENT_STYLES.header.container}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl blur-lg opacity-40"></div>
              <div className={COMPONENT_STYLES.header.iconWrapper}>
                <Settings className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className={COMPONENT_STYLES.header.title}>
                Configuracion del Sistema
              </h1>
              <p className={COMPONENT_STYLES.header.subtitle}>
                Administracion de parametros SIVAC
              </p>
            </div>
          </div>

          {/* Right: Status indicator */}
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                Cambios sin guardar
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

ConfiguracionHeader.displayName = 'ConfiguracionHeader';

export default ConfiguracionHeader;
