import React, { memo } from 'react';
import { BarChart3 } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface MovimientosShellProps {
  header: React.ReactNode;
  status?: React.ReactNode;
  children: React.ReactNode;
}

const MovimientosShell: React.FC<MovimientosShellProps> = ({ header, status, children }) => (
  <main className={COMPONENT_STYLES.pageBackground}>
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
      <section className={COMPONENT_STYLES.shell}>
        <div className="border-b border-slate-200/90 px-4 py-4 sm:px-6 lg:px-6">
          <div className="flex items-start gap-4">
            <div className={COMPONENT_STYLES.header.iconWrapper}>
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className={COMPONENT_STYLES.header.title}>Movimientos</h1>
              <p className={`${COMPONENT_STYLES.header.subtitle} mt-1`}>
                Gestión operativa de movimientos, entregas y control de stock por establecimiento.
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 sm:px-4 sm:py-3">
          <div className="space-y-3">
            {header}
            {status ? <div>{status}</div> : null}
            <div>{children}</div>
          </div>
        </div>
      </section>
    </div>
  </main>
);

export default memo(MovimientosShell);
