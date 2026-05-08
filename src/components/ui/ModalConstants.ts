export const MODAL_STYLES = {
  button: {
    primary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-[#7c3aed] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#15171d] shadow-sm transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3 py-1.5 text-sm font-semibold text-[#606571] transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-3.5 py-3 text-[0.875rem] text-gray-900 shadow-[0_1px_2px_0_rgba(27,36,53,0.04)] transition-all placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-20 disabled:opacity-60 disabled:bg-gray-50',
    normal: 'border-gray-200 hover:border-gray-300 focus:border-gray-300 focus:ring-gray-100',
    error: 'border-rose-300 focus:border-rose-300 focus:ring-rose-100',
    label: 'mb-1.5 block text-[0.875rem] font-semibold text-gray-700',
    errorText: 'mt-1.5 text-sm text-rose-600',
    helpText: 'mt-1 text-[0.8rem] text-gray-500',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-gray-900/50 backdrop-blur-sm',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-4 sm:items-center sm:p-6',
    panel:
      'relative w-full rounded-t-2xl bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] ring-1 ring-zinc-200/50 sm:max-h-[90vh] sm:rounded-[14px]',
    header: 'px-5 pt-5 pb-4 sm:px-6 sm:pt-6',
    headerIconWrapper:
      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm text-gray-700',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 pb-5 sm:max-h-[calc(90vh-156px)] sm:px-6 sm:pb-6',
    footer: 'bg-white px-5 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-[#eeeef3] rounded-b-[14px]',
    sideSheetPanel:
      'relative mt-auto flex h-[88vh] w-full flex-col bg-white shadow-2xl ring-1 ring-gray-900/5 sm:mt-0 sm:h-full sm:max-w-xl sm:rounded-none sm:rounded-l-2xl',
  },
} as const;
