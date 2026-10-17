export const MODULE_LAYOUT = {
  rootPage: 'min-h-full bg-canvas text-ink',
  fullWidth: 'w-full max-w-none',
  pageSpacingX: 'px-3 sm:px-6 lg:px-8',
  mainPadding: 'px-3 sm:px-6 lg:px-8 py-4 sm:py-6',
  sectionStack: 'space-y-4 sm:space-y-6',
  headerShell:
    'bg-surface/95 backdrop-blur-xl shadow-xs border-b border-line sticky top-0 z-10',
  headerRow: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4',
  headerLeft: 'flex items-center space-x-3 sm:space-x-4 min-w-0',
  headerActions: 'flex items-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto',
  panelSurface:
    'bg-surface rounded-xl sm:rounded-2xl shadow-xs border border-line overflow-hidden',
  subtleSurface:
    'bg-surface-soft/80 backdrop-blur-sm rounded-xl border border-line',
  filterGridFour: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4',
  statsGridFour: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6',
  tableOverflow: 'overflow-x-auto max-w-full -mx-px',
  tableMinWidth: 'w-full min-w-[680px]',
  mobileCardList: 'grid grid-cols-1 gap-3 md:hidden',
  desktopTableWrap: 'hidden md:block overflow-x-auto max-w-full',
} as const;
