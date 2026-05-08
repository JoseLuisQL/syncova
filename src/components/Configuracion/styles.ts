export const CONFIG_STYLES = {
  page: 'min-h-screen bg-white',
  shell: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-[14px] border border-[#e7e7ef] bg-white shadow-none',
  panelSoft: 'rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd]',
  sectionHeader: 'border-b border-[#eeeef3] px-4 py-3',
  title: 'text-xl font-semibold tracking-tight text-zinc-950',
  subtitle: 'text-sm text-zinc-500',
  subtleBadge: 'inline-flex items-center rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#606571]',
  input:
    'w-full rounded-[10px] border border-[#e7e7ef] bg-white px-4 py-2.5 text-sm text-[#15171d] shadow-sm transition placeholder:text-[#8b8f9b] hover:border-[#d7d8e2] focus:border-[#babdca] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
  buttonSecondary:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#15171d] shadow-sm transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  buttonPrimary:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-[#7c3aed] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
  buttonDanger:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60',
} as const;
