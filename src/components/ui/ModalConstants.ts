export const MODAL_STYLES = {
  button: {
    primary:
      'inline-flex h-9 items-center justify-center gap-2 rounded-[7px] bg-[#7c3aed] px-3.5 text-[13px] font-semibold text-white shadow-none transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#e7e7ef] bg-white px-3.5 text-[13px] font-semibold text-[#15171d] shadow-none transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#e7e7ef] bg-white px-3 text-[13px] font-semibold text-[#606571] transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  },

  input: {
    base:
      'min-h-9 w-full rounded-[7px] border border-[#e7e7ef] bg-white px-3 py-2 text-[13px] text-[#15171d] shadow-none transition placeholder:text-[#a0a4ae] focus:outline-none focus:ring-2 disabled:bg-[#fbfafd] disabled:opacity-60',
    normal: 'border-[#e7e7ef] hover:border-[#d7d8e2] focus:border-[#babdca] focus:ring-[#dedfea]/70',
    error: 'border-rose-300 focus:border-rose-300 focus:ring-rose-100',
    label: 'mb-1.5 block text-[12px] font-medium text-[#424750]',
    errorText: 'mt-1.5 text-xs font-medium text-rose-600',
    helpText: 'mt-1 text-[11px] leading-4 text-[#747986]',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-[#111318]/20 backdrop-blur-[2px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'relative w-full overflow-hidden rounded-t-[10px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:max-h-[88vh] sm:rounded-[10px]',
    header: 'border-b border-[#eeeef3] px-4 py-3.5 sm:px-5',
    headerIconWrapper:
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-[#e7e7ef] bg-[#fbfafd] text-[#606571]',
    body: 'max-h-[calc(100vh-150px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(88vh-136px)] sm:px-5',
    footer: 'border-t border-[#eeeef3] bg-[#fbfafd] px-4 py-3 sm:flex sm:flex-row-reverse sm:px-5',
    sideSheetPanel:
      'relative mt-auto flex h-[88vh] w-full flex-col border-l border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:mt-0 sm:h-full sm:max-w-xl',
  },
} as const;
