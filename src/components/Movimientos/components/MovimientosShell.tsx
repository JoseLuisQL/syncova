import React, { memo } from 'react';
import { MODULE_LAYOUT } from '../../../styles/layout';

interface MovimientosShellProps {
  header: React.ReactNode;
  status?: React.ReactNode;
  children: React.ReactNode;
}

const MovimientosShell: React.FC<MovimientosShellProps> = ({ header, status, children }) => (
  <main className="flex h-[calc(100vh-4rem)] flex-col bg-white">
    <div className={`${MODULE_LAYOUT.fullWidth} flex flex-1 flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3 lg:px-8`}>
      <section className="flex flex-1 flex-col overflow-hidden bg-white">
        <div className="shrink-0">
          {header}
        </div>
        {status ? <div className="shrink-0">{status}</div> : null}
        <div className="min-h-0 flex-1">{children}</div>
      </section>
    </div>
  </main>
);

export default memo(MovimientosShell);
