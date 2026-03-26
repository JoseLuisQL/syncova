import React from 'react';
import { FileText } from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

interface ReportesHeaderProps {
  children?: React.ReactNode;
}

const ReportesHeader: React.FC<ReportesHeaderProps> = ({ children }) => {
  return (
    <header className={COMPONENT_STYLES.header.container}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={COMPONENT_STYLES.header.iconWrapper}>
              <FileText weight="duotone" className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className={COMPONENT_STYLES.header.title}>
                Reportes
              </h1>
              <p className={COMPONENT_STYLES.header.subtitle}>
                Generacion de reportes y estadisticas
              </p>
            </div>
          </div>

          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(ReportesHeader);
