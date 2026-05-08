import React, { memo } from 'react';
import { MODULE_LAYOUT } from '../../../styles/layout';

interface MovimientosShellProps {
  header: React.ReactNode;
  status?: React.ReactNode;
  children: React.ReactNode;
}

const MovimientosShell: React.FC<MovimientosShellProps> = ({ header, status, children }) => (
  <main className="h-[calc(100dvh-128px)] min-h-0 overflow-hidden rounded-[24px] border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] sm:-m-2">
    <div className={`${MODULE_LAYOUT.fullWidth} flex h-full min-h-0 flex-col overflow-hidden`}>
      <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="relative z-[80] shrink-0 overflow-visible">
          {header}
        </div>
        {status ? <div className="shrink-0">{status}</div> : null}
        <div className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-0 sm:p-6 sm:pt-0">{children}</div>
      </section>
    </div>
  </main>
);

export default memo(MovimientosShell);
