import React, { memo } from 'react';
import { COMPONENT_STYLES } from '../../Establecimientos/constants';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inventory-skeleton ${className}`} aria-hidden="true" />
);

const ConfiguracionSkeleton: React.FC = () => (
  <div className="space-y-5">
    <div className={`${COMPONENT_STYLES.panel} inventory-loading-shell p-5`}>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, columnIndex) => (
          <div key={`config-nav-skeleton-${columnIndex + 1}`} className="rounded-[18px] border border-zinc-200 bg-zinc-50/70 p-3">
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-28 rounded-full" />
              <SkeletonBlock className="h-3 w-44 rounded-full opacity-80" />
            </div>
            <div className="mt-3 grid gap-2 min-[520px]:grid-cols-2">
              {Array.from({ length: 2 }).map((__, buttonIndex) => (
                <div key={`config-button-skeleton-${columnIndex + 1}-${buttonIndex + 1}`} className="rounded-2xl border border-zinc-200 bg-white p-3">
                  <SkeletonBlock className="h-4 w-20 rounded-full" />
                  <SkeletonBlock className="mt-2 h-3 w-full rounded-full opacity-80" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <section key={`config-section-skeleton-${sectionIndex + 1}`} className={`${COMPONENT_STYLES.panel} inventory-loading-shell p-5`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-36 rounded-full" />
              <SkeletonBlock className="h-3 w-52 rounded-full opacity-80" />
            </div>
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((__, fieldIndex) => (
              <div key={`config-field-skeleton-${sectionIndex + 1}-${fieldIndex + 1}`} className="space-y-2">
                <SkeletonBlock className="h-3 w-24 rounded-full" />
                <SkeletonBlock className="h-11 w-full rounded-2xl" />
                <SkeletonBlock className="h-3 w-3/4 rounded-full opacity-75" />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <SkeletonBlock className="h-11 w-full rounded-2xl sm:w-28" />
            <SkeletonBlock className="h-11 w-full rounded-2xl sm:w-40" />
          </div>
        </section>
      ))}
    </div>
  </div>
);

export default memo(ConfiguracionSkeleton);
 