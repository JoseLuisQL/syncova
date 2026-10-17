export const MODAL_STYLES = {
  button: {
    primary:
      'inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:border-brand-600 hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand/20 active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-55',
    secondary:
      'inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-[0.8125rem] font-medium tracking-[-0.005em] text-ink shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-150 hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-3 focus:ring-line-focus/80 disabled:cursor-not-allowed disabled:opacity-55',
    danger:
      'inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-600 bg-rose-600 px-4 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:border-rose-700 hover:bg-rose-700 focus:outline-none focus:ring-3 focus:ring-rose-500/20 active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-55',
    ghost:
      'inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3.5 text-[0.8125rem] font-medium tracking-[-0.005em] text-muted-2 transition-colors duration-150 hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70 disabled:cursor-not-allowed disabled:opacity-55',
  },

  input: {
    base:
      'min-h-9.5 w-full rounded-xl border bg-surface px-3.5 py-2 text-[0.84rem] leading-5 text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all duration-150 placeholder:text-muted/80 focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted disabled:opacity-65',
    normal:
      'border-line hover:border-line-strong focus:border-brand focus:ring-brand/12',
    error:
      'border-rose-300 bg-rose-50/25 focus:border-rose-500 focus:ring-rose-500/15 dark:border-rose-500/50 dark:bg-rose-950/20',
    label:
      'mb-1.5 block text-[0.78rem] font-medium tracking-[-0.005em] text-ink',
    errorText:
      'mt-1.5 flex items-center gap-1 text-[0.73rem] font-medium leading-4 text-rose-600 dark:text-rose-400',
    helpText:
      'mt-1.5 text-[0.73rem] leading-4 text-muted-2',
  },

  modal: {
    overlay:
      'fixed inset-0 z-[300] bg-slate-950/45 backdrop-blur-[3px] transition-opacity duration-200 dark:bg-black/70',
    container:
      'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2.5 sm:items-center sm:p-6',
    panel:
      'relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface text-ink shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22),0_0_1px_0_rgba(15,23,42,0.08)] sm:max-h-[88vh] sm:rounded-2xl dark:shadow-[0_28px_72px_-16px_rgba(0,0,0,0.75),0_0_1px_0_rgba(255,255,255,0.08)]',
    header:
      'shrink-0 border-b border-line-soft bg-surface px-5 py-4 sm:px-6',
    headerIconWrapper:
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-soft text-brand shadow-[0_1px_2px_rgba(16,24,40,0.03)]',
    body:
      'flex-1 min-h-0 overflow-y-auto bg-surface px-5 py-5 sm:px-6',
    footer:
      'shrink-0 border-t border-line-soft bg-surface-soft/75 px-5 py-3.5 backdrop-blur-xs sm:flex sm:flex-row-reverse sm:items-center sm:px-6',
    sideSheetPanel:
      'relative mt-auto flex h-[90vh] w-full flex-col rounded-t-2xl border-l border-line bg-surface text-ink shadow-[0_24px_64px_-16px_rgba(15,23,42,0.25)] sm:mt-0 sm:h-full sm:max-w-xl sm:rounded-none dark:shadow-[0_28px_72px_-16px_rgba(0,0,0,0.75)]',
  },
} as const;
