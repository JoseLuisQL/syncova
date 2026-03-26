const fs = require('fs');
const path = require('path');

const files = [
  'c:/Proyectos/syncova/src/components/Vales/ValesTestSuite.tsx',
  'c:/Proyectos/syncova/src/components/Vales/ValesSyntaxTest.tsx',
  'c:/Proyectos/syncova/src/components/Vales/ValesErrorBoundary.tsx',
  'c:/Proyectos/syncova/src/components/Vales/ValesDataTest.tsx',
  'c:/Proyectos/syncova/src/components/Vales/ValesConnectionTest.tsx',
  'c:/Proyectos/syncova/src/components/Vales/GenerarValeModal.tsx'
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
  'Settings': 'Gear',
  'Info': 'Info',
  'Server': 'HardDrives',
  'Database': 'Database',
  'Home': 'House',
  'CheckCircle': 'CheckCircle',
  'Check': 'Check',
  'ChevronRight': 'CaretRight',
  'X': 'X',
  'MapPin': 'MapPin',
  'CalendarDays': 'CalendarBlank',
  'User': 'User',
  'Package': 'Package',
  'Plus': 'Plus'
};

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import
  content = content.replace(/from\s+['"]lucide-react['"]/g, "from '@phosphor-icons/react'");
  
  for (const [lucide, phosphor] of Object.entries(iconMap)) {
    content = content.replace(new RegExp('\\b' + lucide + '\\b', 'g'), phosphor);
  }

  content = content.replace(/<SpinnerGap([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<SpinnerGap weight="bold"${p1}>`;
  });
  content = content.replace(/<Warning([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<Warning weight="duotone"${p1}>`;
  });

  // Cockpit styling
  content = content.replace(/bg-gradient-to-r from-teal-50 to-cyan-50/g, 'bg-zinc-50 border-b border-zinc-200');
  content = content.replace(/bg-gradient-to-br from-teal-600 to-cyan-600/g, 'bg-zinc-900 border border-zinc-800 text-white shadow-sm');
  content = content.replace(/bg-gradient-to-r from-teal-600 to-cyan-600/g, 'bg-zinc-900 border border-zinc-800 text-white');

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Resto de archivos migrados.');
