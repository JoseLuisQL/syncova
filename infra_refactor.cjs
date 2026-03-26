const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  'Building2': 'Buildings',
  'Building': 'Building',
  'MapPin': 'MapPin',
  'Phone': 'Phone',
  'Plus': 'Plus',
  'RefreshCw': 'ArrowsClockwise',
  'User': 'User',
  'Eye': 'Eye',
  'Loader2': 'SpinnerGap',
  'Pencil': 'Pencil',
  'Trash2': 'Trash',
  'AlertTriangle': 'Warning',
  'Search': 'MagnifyingGlass',
  'X': 'X',
  'GitBranch': 'GitBranch',
  'Network': 'TreeStructure',
  'LucideIcon': 'React.ElementType' // Handle dynamic icon types safely
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Reemplazar imports de lucide-react por @phosphor-icons/react
  if (content.includes('lucide-react')) {
    content = content.replace(/import\s+(type\s+)?{([^}]+)}\s+from\s+['"]lucide-react['"];?/g, (match, isType, imports) => {
      let iconNames = imports.split(',').map(i => i.trim()).filter(Boolean);
      let newImports = iconNames.map(iconDef => {
          let coreIcon = iconDef.split(' as ')[0].trim();
          if (coreIcon === 'LucideIcon') return ''; // We don't import React.ElementType from phosphor
          return ICON_MAP[coreIcon] || coreIcon;
      }).filter(Boolean);
      
      if (newImports.length === 0) return ''; // if only LucideIcon was imported
      return `import { ${[...new Set(newImports)].join(', ')} } from '@phosphor-icons/react';`;
    });
  }

  // 2. Reemplazar usos de `LucideIcon` por `React.ElementType` si existe
  content = content.replace(/\bLucideIcon\b/g, 'React.ElementType');

  // 3. Reemplazar el uso de los componentes en JSX
  for (const [lucide, phosphor] of Object.entries(ICON_MAP)) {
    if (lucide !== phosphor && lucide !== 'LucideIcon') {
      const regex = new RegExp(`\\b${lucide}\\b`, 'g');
      content = content.replace(regex, phosphor);
    }
  }

  // 4. Reemplazar colores (Cockpit Mode Zincification)
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

  // Any teal/cyan elements usually become zinc-900 or zinc-800 in this phase
  content = content.replace(/\bteal-50\b/g, 'zinc-100');
  content = content.replace(/\bteal-100\b/g, 'zinc-100');
  content = content.replace(/\bteal-200\b/g, 'zinc-200');
  content = content.replace(/\bteal-500\b/g, 'zinc-800');
  content = content.replace(/\bteal-600\b/g, 'zinc-900');
  content = content.replace(/\bteal-700\b/g, 'zinc-900');
  content = content.replace(/\bteal-800\b/g, 'zinc-900');
  
  content = content.replace(/\bcyan-50\b/g, 'zinc-100');
  content = content.replace(/\bcyan-500\b/g, 'zinc-800');
  content = content.replace(/\bcyan-600\b/g, 'zinc-900');
  content = content.replace(/\bcyan-700\b/g, 'zinc-900');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed:', filePath);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
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

['Establecimientos','Redes','Microredes','CentrosAcopio','Alertas'].forEach(dir => {
    console.log(`Scanning module: ${dir}`);
    walkDir(`c:/Proyectos/syncova/src/components/${dir}`);
});
