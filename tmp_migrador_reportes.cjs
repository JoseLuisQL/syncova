const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  'Loader2': 'SpinnerGap',
  'Save': 'FloppyDisk',
  'AlertCircle': 'WarningCircle',
  'AlertTriangle': 'Warning',
  'Package': 'Package',
  'Syringe': 'Syringe',
  'FileSpreadsheet': 'FileXls',
  'Download': 'DownloadSimple',
  'CheckSquare': 'CheckSquare',
  'Square': 'Square',
  'Archive': 'Archive',
  'Eye': 'Eye',
  'Target': 'Target',
  'ArrowRightLeft': 'ArrowsLeftRight',
  'Bell': 'Bell',
  'Clock3': 'Clock',
  'Edit': 'PencilSimple',
  'FileCog': 'FileGear',
  'Mail': 'EnvelopeSimple',
  'ShieldCheck': 'ShieldCheck',
  'Trash2': 'Trash',
  'Building2': 'Buildings',
  'Calendar': 'CalendarBlank',
  'FileText': 'FileText',
  'BarChart3': 'ChartBar',
  'FolderKanban': 'FolderDashed',
  'Package2': 'Package',
  'Settings2': 'Gear',
  'TrendingUp': 'TrendUp',
  'CheckCircle2': 'CheckCircle',
  'LucideIcon': 'IconProps'
};

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const dir = 'c:/Proyectos/syncova/src/components/Reportes';
const files = getAllFiles(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Imports
  content = content.replace(/from\s+['"]lucide-react['"]/g, "from '@phosphor-icons/react'");
  content = content.replace(/import\s*{\s*IconProps\s*}\s*from\s+['"]@phosphor-icons\/react['"];?\n?/g, '');
  if (content.includes('IconProps') && !content.includes("import { IconProps }")) {
    if (content.includes("@phosphor-icons/react")) {
      content = content.replace(/from '@phosphor-icons\/react'/, ", IconProps } from '@phosphor-icons/react'");
      content = content.replace(/{(\s*)(.*?), IconProps }/, '{$1$2, IconProps }');
    }
  }

  // 2. Icon Tags & Words
  for (const [lucide, phosphor] of Object.entries(ICON_MAP)) {
    content = content.replace(new RegExp('\\b' + lucide + '\\b', 'g'), phosphor);
  }

  // 3. Phosphor Weights (specific aesthetic rules)
  content = content.replace(/<SpinnerGap([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<SpinnerGap weight="bold"${p1}>`;
  });
  content = content.replace(/<Warning([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<Warning weight="duotone"${p1}>`;
  });
  content = content.replace(/<WarningCircle([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<WarningCircle weight="duotone"${p1}>`;
  });
  content = content.replace(/<FileText([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<FileText weight="duotone"${p1}>`;
  });
  content = content.replace(/<FileXls([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<FileXls weight="duotone"${p1}>`;
  });
  content = content.replace(/<ChartBar([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<ChartBar weight="duotone"${p1}>`;
  });
  content = content.replace(/<Syringe([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<Syringe weight="duotone"${p1}>`;
  });
  content = content.replace(/<Buildings([^>]*)>/g, (match, p1) => {
    if (p1.includes('weight=')) return match;
    return `<Buildings weight="duotone"${p1}>`;
  });

  // 4. Cockpit Colors & Shadows (Zinc-900 logic)
  content = content.replace(/bg-gradient-to-[a-z]+\s+from-[a-z]+-\d+\s+to-[a-z]+-\d+/g, 'bg-zinc-900 border border-zinc-800');
  content = content.replace(/bg-gradient-to-[a-z]+\s+from-[a-z]+-50\s+to-[a-z]+-50/g, 'bg-zinc-50 border border-zinc-200');
  content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm');
  content = content.replace(/shadow-[a-z]+-500\/\d+/g, 'shadow-sm');

  // Mute saturated text and backgrounds (Teal, Cyan, Slate, Sky) to Zinc
  content = content.replace(/teal-/g, 'zinc-');
  content = content.replace(/cyan-/g, 'zinc-');
  content = content.replace(/sky-/g, 'zinc-');
  content = content.replace(/slate-/g, 'zinc-');

  // Borders and rounded fixes
  content = content.replace(/rounded-\[.*?\]/g, 'rounded-xl');
  content = content.replace(/rounded-t-\[.*?\]/g, 'rounded-t-xl');
  
  // Hover & interaction
  content = content.replace(/hover:from-zinc-700 hover:to-zinc-700/g, 'hover:bg-zinc-800');
  content = content.replace(/hover:from-zinc-600 hover:to-zinc-600/g, 'hover:bg-zinc-800');
  content = content.replace(/bg-zinc-50\/80/g, 'bg-zinc-50');
  content = content.replace(/bg-zinc-50\/70/g, 'bg-zinc-50');
  content = content.replace(/bg-zinc-50\/85/g, 'bg-zinc-50');
  content = content.replace(/bg-zinc-200\/90/g, 'bg-zinc-200');
  content = content.replace(/bg-zinc-200\/80/g, 'bg-zinc-200');

  // Specifics for constants.ts pageBackground
  content = content.replace(/bg-\[linear-gradient.*?\]/g, 'bg-zinc-50');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Script masivo de Reportes ejecutado con éxito.');
