export const CONFIG_STYLES = {
  page: 'min-h-screen bg-white',
  shell: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-xl border border-line bg-white shadow-none',
  panelSoft: 'rounded-[12px] border border-line bg-surface-soft',
  sectionHeader: 'border-b border-line-soft px-4 py-3',
  title: 'text-xl font-semibold tracking-tight text-zinc-950',
  subtitle: 'text-sm text-zinc-500',
  subtleBadge: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-2',
  input:
    'w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink shadow-sm transition placeholder:text-muted hover:border-line-strong focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/70',
  buttonSecondary:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink shadow-sm transition hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  buttonPrimary:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  buttonDanger:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60',
} as const;
