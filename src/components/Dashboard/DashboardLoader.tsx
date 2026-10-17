import React from 'react';

export const DashboardLoader: React.FC = () => {
  return (
    <div className="min-h-[calc(100dvh-4rem)] w-full bg-app px-4 py-4 sm:px-5">
      <div className="space-y-4">
        <div className="flex h-12 animate-pulse items-center justify-between rounded-xl border border-line bg-surface px-4">
          <div className="h-4 w-56 rounded bg-surface-soft" />
          <div className="h-8 w-28 rounded bg-surface-soft" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[132px] animate-pulse rounded-xl border border-line bg-surface p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-32 rounded bg-surface-soft" />
                <div className="h-4 w-4 rounded bg-surface-soft" />
              </div>
              <div className="mb-4 h-7 w-24 rounded bg-surface-soft" />
              <div className="h-3 w-40 rounded bg-surface-soft" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-[360px] animate-pulse rounded-xl border border-line bg-surface p-5 lg:col-span-6" />
          <div className="h-[360px] animate-pulse rounded-xl border border-line bg-surface p-5 lg:col-span-3" />
          <div className="h-[360px] animate-pulse rounded-xl border border-line bg-surface p-5 lg:col-span-3" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-[320px] animate-pulse rounded-xl border border-line bg-surface p-5 lg:col-span-5" />
          <div className="h-[320px] animate-pulse rounded-xl border border-line bg-surface p-5 lg:col-span-4" />
          <div className="h-[320px] animate-pulse rounded-xl border border-line bg-surface p-5 lg:col-span-3" />
        </div>
      </div>
    </div>
  );
};
