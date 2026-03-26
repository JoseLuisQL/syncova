export const MODAL_STYLES = {
  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:opacity-50',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
  },

  input: {
    base:
      'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] transition placeholder:text-gray-400 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:bg-gray-50',
    normal: 'border-gray-300 hover:border-gray-400 focus:border-gray-300 focus:ring-gray-100',
    error: 'border-rose-300 hover:border-rose-400 focus:border-rose-300 focus:ring-rose-100/50',
    label: 'mb-1.5 block text-sm font-medium text-gray-700',
    errorText: 'mt-1.5 text-sm text-rose-600',
    helpText: 'mt-1.5 text-sm text-gray-500',
  },

  modal: {
    overlay: 'fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-4 sm:items-center sm:p-6',
    panel:
      'relative w-full rounded-t-2xl bg-white shadow-xl ring-1 ring-gray-900/5 sm:max-h-[90vh] sm:rounded-xl',
    header: 'px-5 pt-5 pb-4 sm:px-6 sm:pt-6',
    headerIconWrapper:
      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[8px] border-gray-50 bg-gray-100 text-gray-600',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 pb-5 sm:max-h-[calc(90vh-156px)] sm:px-6 sm:pb-6',
    footer: 'bg-gray-50 px-5 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200 rounded-b-xl',
    sideSheetPanel:
      'relative mt-auto flex h-[88vh] w-full flex-col bg-white shadow-2xl ring-1 ring-gray-900/5 sm:mt-0 sm:h-full sm:max-w-xl sm:rounded-none sm:rounded-l-2xl',
  },
} as const;
