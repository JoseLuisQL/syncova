import React, { memo } from 'react';
import { Settings, Download, Upload, Loader2 } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface ConfiguracionHeaderProps {
  onExport: () => void;
  onImport: () => void;
  isExporting?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionHeader: React.FC<ConfiguracionHeaderProps> = memo(({
  onExport,
  onImport,
  isExporting = false,
  hasChanges = false,
}) => {
  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImport();
      }
    };
    input.click();
  };

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
                Administracion centralizada de configuraciones SIVAC
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                Cambios sin guardar
              </span>
            )}
            
            <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={handleImportClick}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600
                           hover:bg-teal-50 hover:text-teal-700 border-r border-gray-200
                           transition-all"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
              </button>
              <button
                onClick={onExport}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600
                           hover:bg-cyan-50 hover:text-cyan-700
                           disabled:opacity-50 transition-all"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

ConfiguracionHeader.displayName = 'ConfiguracionHeader';

export default ConfiguracionHeader;
