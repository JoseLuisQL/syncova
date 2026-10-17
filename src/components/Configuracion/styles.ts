export const CONFIG_STYLES = {
  page: 'min-h-screen bg-app',
  shell: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-xl border border-line bg-surface shadow-none',
  panelSoft: 'rounded-xl border border-line bg-surface-soft',
  sectionHeader: 'border-b border-line-soft px-5 py-3.5',
  title: 'text-xl font-semibold tracking-tight text-ink',
  subtitle: 'text-sm text-muted-2',
  subtleBadge: 'inline-flex items-center rounded-md border border-line bg-surface px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-2',
  input:
    'min-h-9.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-[0.84rem] leading-5 text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all duration-150 placeholder:text-muted/80 hover:border-line-strong focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/12 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-65',
  buttonSecondary:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-[-0.005em] text-ink shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-150 hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-3 focus:ring-line-focus/80 disabled:cursor-not-allowed disabled:opacity-55',
  buttonPrimary:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 py-1.5 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:border-brand-600 hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand/20 active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-55',
  buttonDanger:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-55',
} as const;
