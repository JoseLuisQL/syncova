const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  'BookOpen': 'BookOpenText',
  'Clock': 'Clock',
  'FileText': 'FileText',
  'Package2': 'Package',
  'Search': 'MagnifyingGlass',
  'Filter': 'Funnel',
  'Download': 'DownloadSimple',
  'ChevronLeft': 'CaretLeft',
  'ChevronRight': 'CaretRight',
  'ChevronsLeft': 'CaretDoubleLeft',
  'ChevronsRight': 'CaretDoubleRight',
  'ArrowUpCircle': 'ArrowCircleUp',
  'ArrowDownCircle': 'ArrowCircleDown',
  'ArrowRightLeft': 'ArrowsLeftRight',
  'Settings2': 'Faders',
  'AlertCircle': 'WarningCircle',
  'Plus': 'Plus',
  'Eye': 'Eye',
  'Calendar': 'CalendarBlank',
  'Activity': 'Activity',
  'Boxes': 'Cubes',
  'Hash': 'Hash',
  'Info': 'Info',
  'Loader2': 'SpinnerGap',
  'RefreshCw': 'ArrowsClockwise',
  'CalendarDots': 'Calendar',
  'CalendarIcon': 'Calendar',
  'Building2': 'Buildings',
  'Tag': 'Tag',
  'MapPin': 'MapPin',
  'Barcode': 'Barcode',
  'Truck': 'Truck'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Reemplazar imports de lucide-react por @phosphor-icons/react
  if (content.includes('lucide-react')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g, (match, imports) => {
      const iconNames = imports.split(',').map(i => i.trim()).filter(Boolean);
      const newIcons = iconNames.map(icon => ICON_MAP[icon] || icon);
      return `import { ${[...new Set(newIcons)].join(', ')} } from '@phosphor-icons/react';`;
    });
  }

  // 2. Reemplazar el uso de los componentes en JSX
  for (const [lucide, phosphor] of Object.entries(ICON_MAP)) {
    if (lucide !== phosphor) {
      const regex = new RegExp(`\\b${lucide}\\b`, 'g');
      content = content.replace(regex, phosphor);
    }
  }

  // 3. Reemplazar colores (Cockpit Mode)
  // Reemplazar teal/cyan/slate en variables
  content = content.replace(/\bteal-50\b/g, 'zinc-50');
  content = content.replace(/\bteal-100\b/g, 'zinc-100');
  content = content.replace(/\bteal-200\b/g, 'zinc-200');
  content = content.replace(/\bteal-600\b/g, 'zinc-600');
  content = content.replace(/\bteal-700\b/g, 'zinc-700');
  content = content.replace(/\bteal-900\b/g, 'zinc-900');
  content = content.replace(/\bfrom-teal-600/g, 'from-zinc-800');
  content = content.replace(/\bto-teal-800/g, 'to-zinc-950');
  content = content.replace(/\bto-teal-600/g, 'to-zinc-800');
  content = content.replace(/\bcyan-50\b/g, 'blue-50');
  content = content.replace(/\bcyan-200\b/g, 'blue-200');
  content = content.replace(/\bcyan-700\b/g, 'blue-700');
  // Reemplazar slate remanentes a zinc
  content = content.replace(/\bslate-50\b/g, 'zinc-50');
  content = content.replace(/\bslate-100\b/g, 'zinc-100');
  content = content.replace(/\bslate-200\b/g, 'zinc-200');
  content = content.replace(/\bslate-300\b/g, 'zinc-300');
  content = content.replace(/\bslate-400\b/g, 'zinc-400');
  content = content.replace(/\bslate-500\b/g, 'zinc-500');
  content = content.replace(/\bslate-600\b/g, 'zinc-600');
  content = content.replace(/\bslate-700\b/g, 'zinc-700');
  content = content.replace(/\bslate-800\b/g, 'zinc-800');
  content = content.replace(/\bslate-900\b/g, 'zinc-900');
  content = content.replace(/\bslate-950\b/g, 'zinc-950');

  // Ajustes especiales de sombras
  content = content.replace(/shadow-teal-900\/20/g, 'shadow-zinc-900/20');
  content = content.replace(/shadow-teal-500\/30/g, 'shadow-zinc-500/20');

  // Aplicar tabular-nums a todo lo que tenga text-right y sea número o en general
  // En Tufte KardexTabla las celdas numéricas deberían tener tabular-nums
  // Solo meterlo a las clases generales si vemos "font-mono"
  content = content.replace(/\bfont-mono\b/g, 'font-medium tabular-nums tracking-tight');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir('c:/Proyectos/syncova/src/components/Kardex');
