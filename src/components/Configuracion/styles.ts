export const CONFIG_STYLES = {
  page: 'min-h-full bg-zinc-50/40',
  shell: 'rounded-[20px] border border-zinc-200 bg-white shadow-sm',
  panel: 'rounded-2xl border border-zinc-200 bg-white shadow-sm',
  panelSoft: 'rounded-2xl border border-zinc-200 bg-zinc-50/70',
  sectionHeader: 'border-b border-zinc-100 px-4 py-3',
  title: 'text-xl font-semibold tracking-tight text-zinc-950',
  subtitle: 'text-sm text-zinc-500',
  subtleBadge: 'inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-600',
  input:
    'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200',
  buttonSecondary:
    'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60',
  buttonPrimary:
    'inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60',
  buttonDanger:
    'inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60',
} as const;
