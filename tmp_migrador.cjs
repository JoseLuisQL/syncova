const fs = require('fs');

const files = [
  'c:/Proyectos/syncova/src/components/Vales/ConfirmacionModal.tsx',
  'c:/Proyectos/syncova/src/components/Vales/ValeDetalleModal.tsx',
  'c:/Proyectos/syncova/src/components/Vales/ValeExportModal.tsx',
  'c:/Proyectos/syncova/src/components/Vales/ValeTypeSelectionModal.tsx'
];

const iconMap = {
  'RotateCcw': 'ArrowCounterClockwise',
  'AlertTriangle': 'Warning',
  'Loader2': 'SpinnerGap',
  'Building2': 'Buildings',
  'Calendar': 'CalendarBlank',
  'FileSpreadsheet': 'FileXls',
  'RefreshCw': 'ArrowsClockwise',
  'AlertCircle': 'WarningCircle',
  'Download': 'DownloadSimple',
  'Eye': 'Eye',
  'Settings': 'Gear'
};

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Imports
  content = content.replace(/from\s+['"]lucide-react['"]/g, "from '@phosphor-icons/react'");
  
  // Tags
  for (const [lucide, phosphor] of Object.entries(iconMap)) {
    content = content.replace(new RegExp('\\b' + lucide + '\\b', 'g'), phosphor);
  }
  
  // Weights for specific icons to match the design language
  content = content.replace(/<SpinnerGap([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<SpinnerGap weight="bold"${p1}>`;
  });
  content = content.replace(/<ArrowCounterClockwise([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<ArrowCounterClockwise weight="bold"${p1}>`;
  });
  content = content.replace(/<Warning([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<Warning weight="duotone"${p1}>`;
  });
  content = content.replace(/<WarningCircle([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<WarningCircle weight="duotone"${p1}>`;
  });
  content = content.replace(/<X([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<X weight="bold"${p1}>`;
  });
  content = content.replace(/<CheckCircle([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<CheckCircle weight="bold"${p1}>`;
  });
  content = content.replace(/<FileText([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<FileText weight="duotone"${p1}>`;
  });

  // Cockpit styling replacments - remove gradients and saturated colors in headers and primary buttons
  content = content.replace(/bg-gradient-to-r from-amber-50 to-orange-50/g, 'bg-zinc-50 border-b border-zinc-200');
  content = content.replace(/bg-gradient-to-br from-amber-500 to-orange-500/g, 'bg-zinc-900 shadow-sm border border-zinc-800');
  content = content.replace(/bg-gradient-to-r from-amber-500 to-orange-500/g, 'bg-zinc-900 border border-zinc-800 text-white');
  content = content.replace(/bg-gradient-to-r from-teal-50 to-cyan-50/g, 'bg-zinc-50 border-b border-zinc-200');
  content = content.replace(/bg-gradient-to-br from-teal-600 to-cyan-600/g, 'bg-zinc-900 shadow-sm border border-zinc-800');
  content = content.replace(/bg-gradient-to-r from-teal-600 to-cyan-600/g, 'bg-zinc-900 border border-zinc-800 text-white');
  content = content.replace(/hover:from-amber-600 hover:to-orange-600/g, 'hover:bg-zinc-800');
  content = content.replace(/hover:from-teal-700 hover:to-cyan-700/g, 'hover:bg-zinc-800');
  
  // Mute saturated text
  content = content.replace(/text-teal-600/g, 'text-zinc-600');
  content = content.replace(/text-teal-700/g, 'text-zinc-700');
  content = content.replace(/bg-teal-50/g, 'bg-zinc-50');
  content = content.replace(/bg-teal-100/g, 'bg-zinc-100');
  content = content.replace(/border-teal-500/g, 'border-zinc-500');
  content = content.replace(/border-teal-200/g, 'border-zinc-200');

  // Specific to CheckboxOption in Export modal
  content = content.replace(/bg-teal-600/g, 'bg-zinc-900');
  content = content.replace(/text-amber-600/g, 'text-zinc-600');

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Modales migrados a Cockpit Mode');
