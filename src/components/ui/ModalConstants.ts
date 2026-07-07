export const MODAL_STYLES = {
  button: {
    primary:
      'inline-flex h-9 items-center justify-center gap-2 rounded-[7px] bg-brand px-3.5 text-base font-semibold text-white shadow-none transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex h-9 items-center justify-center gap-2 rounded-[7px] border border-line bg-white px-3.5 text-base font-semibold text-ink shadow-none transition hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex h-9 items-center justify-center gap-2 rounded-[7px] border border-line bg-white px-3 text-base font-semibold text-muted-2 transition hover:border-line-strong hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  },

  input: {
    base:
      'min-h-9 w-full rounded-[7px] border border-line bg-white px-3 py-2 text-base text-ink shadow-none transition placeholder:text-[#a0a4ae] focus:outline-none focus:ring-2 disabled:bg-surface-soft disabled:opacity-60',
    normal: 'border-line hover:border-line-strong focus:border-line-focus-strong focus:ring-line-focus/70',
    error: 'border-rose-300 focus:border-rose-300 focus:ring-rose-100',
    label: 'mb-1.5 block text-sm font-medium text-[#424750]',
    errorText: 'mt-1.5 text-xs font-medium text-rose-600',
    helpText: 'mt-1 text-xs leading-4 text-muted-3',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-ink-soft/20 backdrop-blur-[2px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'relative w-full overflow-hidden rounded-t-[10px] border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:max-h-[88vh] sm:rounded-lg',
    header: 'border-b border-line-soft px-4 py-3.5 sm:px-5',
    headerIconWrapper:
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-line bg-surface-soft text-muted-2',
    body: 'max-h-[calc(100vh-150px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(88vh-136px)] sm:px-5',
    footer: 'border-t border-line-soft bg-surface-soft px-4 py-3 sm:flex sm:flex-row-reverse sm:px-5',
    sideSheetPanel:
      'relative mt-auto flex h-[88vh] w-full flex-col border-l border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:mt-0 sm:h-full sm:max-w-xl',
  },
} as const;
