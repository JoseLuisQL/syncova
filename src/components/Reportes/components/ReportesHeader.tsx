import React from 'react';

interface ReportesHeaderProps {
  children?: React.ReactNode;
}

const ReportesHeader: React.FC<ReportesHeaderProps> = ({ children }) => {
  return (
    <header className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default React.memo(ReportesHeader);
