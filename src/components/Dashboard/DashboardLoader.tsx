import React from 'react';
import { SkeletonBlock } from '../common/LoadingSkeleton';

export const DashboardLoader: React.FC = () => {
  return (
    <div
      className="min-h-[calc(100dvh-4rem)] w-full bg-app px-4 py-3 sm:px-5"
      role="status"
      aria-live="polite"
      aria-label="Cargando panel de control operativo"
    >
      <div className="space-y-4">
        {/* Top Context & Sync Bar Skeleton */}
        <div className="flex flex-col justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <SkeletonBlock className="h-4 w-48 rounded-md" />
            <span className="text-muted/40">·</span>
            <SkeletonBlock className="h-3.5 w-64 rounded-md opacity-75 hidden sm:block" />
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <SkeletonBlock className="h-3.5 w-32 rounded-md opacity-75" />
            <SkeletonBlock className="h-8 w-32 rounded-lg" />
          </div>
        </div>

        {/* 4 Primary KPI Metric Cards Skeleton */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="inventory-reveal flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-xs"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <SkeletonBlock className="h-3.5 w-36 rounded-md" />
                <SkeletonBlock className="h-7 w-7 shrink-0 rounded-lg" />
              </div>
              <div className="my-3 flex items-baseline gap-2">
                <SkeletonBlock className="h-7 w-28 rounded-md" />
                <SkeletonBlock className="h-3 w-12 rounded-full opacity-75" />
              </div>
              <div className="flex items-center justify-between border-t border-line-soft pt-2.5">
                <div className="flex items-center gap-1.5">
                  <SkeletonBlock className="h-2 w-2 rounded-full" />
                  <SkeletonBlock className="h-3 w-28 rounded-full" />
                </div>
                <SkeletonBlock className="h-3 w-20 rounded-full opacity-70" />
              </div>
            </div>
          ))}
        </div>

        {/* Analytical Row: Chart (6) + Stock Availability (3) + Permisos/Planificación (3) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Chart Skeleton */}
          <div className="flex h-[360px] flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-xs lg:col-span-6">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <SkeletonBlock className="h-4 w-48 rounded-md" />
                <SkeletonBlock className="h-3 w-64 rounded-md opacity-75" />
              </div>
              <SkeletonBlock className="h-7 w-40 rounded-lg" />
            </div>

            <div className="my-3 grid grid-cols-3 gap-2.5">
              {[1, 2, 3].map((k) => (
                <div key={k} className="rounded-lg border border-line-soft bg-surface-soft/50 p-2.5 space-y-1.5">
                  <SkeletonBlock className="h-2.5 w-16 rounded-full" />
                  <SkeletonBlock className="h-4 w-24 rounded-md" />
                </div>
              ))}
            </div>

            <div className="flex flex-1 items-end gap-3 pt-2">
              {[48, 72, 58, 86, 64, 92].map((heightPct, idx) => (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  <SkeletonBlock
                    className="w-full rounded-t-md opacity-80"
                    style={{ height: `${heightPct}%` }}
                  />
                  <SkeletonBlock className="h-2.5 w-8 rounded-full opacity-60" />
                </div>
              ))}
            </div>
          </div>

          {/* Stock Availability Skeleton */}
          <div className="flex h-[360px] flex-col rounded-xl border border-line bg-surface p-5 shadow-xs lg:col-span-3">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div className="space-y-1.5">
                <SkeletonBlock className="h-4 w-40 rounded-md" />
                <SkeletonBlock className="h-3 w-48 rounded-md opacity-75" />
              </div>
            </div>
            <div className="flex-1 space-y-3.5">
              {[1, 2, 3, 4, 5].map((r) => (
                <div key={r} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-3.5 w-28 rounded-md" />
                    <SkeletonBlock className="h-3.5 w-16 rounded-md" />
                  </div>
                  <SkeletonBlock className="h-2 w-full rounded-full opacity-75" />
                </div>
              ))}
            </div>
          </div>

          {/* Permisos & Planificación Skeleton */}
          <div className="flex h-[360px] flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-xs lg:col-span-3">
            <div className="space-y-1.5 border-b border-line-soft pb-3">
              <SkeletonBlock className="h-4 w-44 rounded-md" />
              <SkeletonBlock className="h-3 w-52 rounded-md opacity-75" />
            </div>
            <div className="my-3 space-y-2.5 flex-1">
              {[1, 2, 3].map((p) => (
                <div key={p} className="flex items-center justify-between rounded-lg border border-line-soft bg-surface-soft/40 p-3">
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-28 rounded-md" />
                    <SkeletonBlock className="h-2.5 w-20 rounded-md opacity-75" />
                  </div>
                  <SkeletonBlock className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
            <SkeletonBlock className="h-8 w-full rounded-lg" />
          </div>
        </div>

        {/* Bottom Operational Row: Centros/EESS (5) + Alertas (4) + Actividad (3) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex h-[320px] flex-col rounded-xl border border-line bg-surface shadow-xs lg:col-span-5">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="space-y-1.5">
                <SkeletonBlock className="h-4 w-36 rounded-md" />
                <SkeletonBlock className="h-3 w-48 rounded-md opacity-75" />
              </div>
              <SkeletonBlock className="h-6 w-16 rounded-md" />
            </div>
            <div className="divide-y divide-line-soft p-4 space-y-3 flex-1">
              {[1, 2, 3, 4].map((c) => (
                <div key={c} className="flex items-center justify-between pt-3 first:pt-0">
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-40 rounded-md" />
                    <SkeletonBlock className="h-2.5 w-24 rounded-md opacity-70" />
                  </div>
                  <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-3.5 w-14 rounded-md" />
                    <SkeletonBlock className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-[320px] flex-col rounded-xl border border-line bg-surface shadow-xs lg:col-span-4">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="space-y-1.5">
                <SkeletonBlock className="h-4 w-36 rounded-md" />
                <SkeletonBlock className="h-3 w-44 rounded-md opacity-75" />
              </div>
            </div>
            <div className="divide-y divide-line-soft p-4 space-y-3 flex-1">
              {[1, 2, 3].map((a) => (
                <div key={a} className="flex items-start gap-3 pt-3 first:pt-0">
                  <SkeletonBlock className="mt-0.5 h-6 w-6 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between">
                      <SkeletonBlock className="h-3.5 w-28 rounded-md" />
                      <SkeletonBlock className="h-2.5 w-14 rounded-full opacity-70" />
                    </div>
                    <SkeletonBlock className="h-3 w-full rounded-md opacity-80" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-[320px] flex-col rounded-xl border border-line bg-surface shadow-xs lg:col-span-3">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="space-y-1.5">
                <SkeletonBlock className="h-4 w-32 rounded-md" />
                <SkeletonBlock className="h-3 w-44 rounded-md opacity-75" />
              </div>
            </div>
            <div className="divide-y divide-line-soft p-4 space-y-3 flex-1">
              {[1, 2, 3].map((act) => (
                <div key={act} className="flex items-start gap-2.5 pt-3 first:pt-0">
                  <SkeletonBlock className="mt-0.5 h-6 w-6 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between">
                      <SkeletonBlock className="h-3 w-20 rounded-md" />
                      <SkeletonBlock className="h-2.5 w-12 rounded-full opacity-70" />
                    </div>
                    <SkeletonBlock className="h-3 w-4/5 rounded-md opacity-80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

