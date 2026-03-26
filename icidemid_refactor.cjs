const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  'CheckCircle2': 'CheckCircle',
  'Database': 'Database',
  'FileSpreadsheet': 'MicrosoftExcelLogo',
  'Loader2': 'SpinnerGap',
  'Sparkles': 'Sparkle',
  'FileWarning': 'WarningCircle',
  'AlertTriangle': 'Warning',
  'Building2': 'Buildings',
  'Calculator': 'Calculator',
  'Package': 'Package',
  'RefreshCw': 'ArrowsClockwise',
  'ShieldCheck': 'ShieldCheck',
  'Upload': 'UploadSimple',
  'X': 'X'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Reemplazar imports de lucide-react por @phosphor-icons/react
  if (content.includes('lucide-react')) {
    content = content.replace(/import\s+(type\s+)?{([^}]+)}\s+from\s+['"]lucide-react['"];?/g, (match, isType, imports) => {
      let iconNames = imports.split(',').map(i => i.trim()).filter(Boolean);
      let newImports = iconNames.map(iconDef => ICON_MAP[iconDef] || iconDef);
      return `import { ${[...new Set(newImports)].join(', ')} } from '@phosphor-icons/react';`;
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
  
  // Reemplazar gradientes agresivos cyan/teal/emerald
  content = content.replace(/bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500/g, 'bg-zinc-800');
  content = content.replace(/from-slate-950 via-teal-950 to-cyan-900/g, 'bg-zinc-950');
  content = content.replace(/bg-cyan-400\/20 blur-3xl/g, 'bg-zinc-800\/20 blur-3xl');
  content = content.replace(/text-cyan-100/g, 'text-zinc-100');
  content = content.replace(/border-cyan-300\/30/g, 'border-zinc-300\/30');
  content = content.replace(/text-cyan-200/g, 'text-zinc-200');
  content = content.replace(/from-cyan-300 via-teal-300 to-emerald-300/g, 'bg-zinc-200');
  content = content.replace(/border-cyan-300\/40 bg-white\/14 shadow-\[0_0_0_1px_rgba\(103,232,249,0.08\)\]/g, 'border-zinc-300/40 bg-zinc-800/14');
  content = content.replace(/bg-emerald-400\/20 text-emerald-200/g, 'bg-zinc-800/20 text-zinc-200');
  content = content.replace(/bg-cyan-400\/20/g, 'bg-zinc-800/20');
  content = content.replace(/border-cyan-200 bg-cyan-50/g, 'border-zinc-200 bg-zinc-50');
  content = content.replace(/text-cyan-600/g, 'text-zinc-600');
  content = content.replace(/text-cyan-700/g, 'text-zinc-700');
  content = content.replace(/from-teal-500 via-teal-600 to-cyan-600/g, 'bg-zinc-800');
  
  content = content.replace(/\bteal-800\b/g, 'zinc-800');
  content = content.replace(/\bteal-900\b/g, 'zinc-900');
  content = content.replace(/\bcyan-500\b/g, 'zinc-500');

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

walkDir('c:/Proyectos/syncova/src/components/IciDemid');
