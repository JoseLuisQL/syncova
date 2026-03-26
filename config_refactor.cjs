const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  'AlertTriangle': 'Warning',
  'RefreshCw': 'ArrowsClockwise',
  'BellRing': 'BellRinging',
  'Database': 'Database',
  'Image': 'Image',
  'ImageIcon': 'Image', // if aliased
  'Loader2': 'SpinnerGap',
  'ShieldCheck': 'ShieldCheck',
  'Trash2': 'Trash',
  'Upload': 'UploadSimple',
  'Blocks': 'Cubes',
  'Building2': 'Buildings',
  'Globe2': 'Globe',
  'Layers3': 'Stack',
  'Mail': 'Envelope',
  'Server': 'HardDrives',
  'Settings2': 'Faders',
  'Siren': 'Siren',
  'ChevronLeft': 'CaretLeft',
  'ChevronRight': 'CaretRight',
  'ChevronDown': 'CaretDown',
  'ChevronUp': 'CaretUp',
  'ChevronsLeft': 'CaretDoubleLeft',
  'ChevronsRight': 'CaretDoubleRight',
  'X': 'X'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Reemplazar imports de lucide-react por @phosphor-icons/react
  if (content.includes('lucide-react')) {
    content = content.replace(/import\s+(type\s+)?{([^}]+)}\s+from\s+['"]lucide-react['"];?/g, (match, isType, imports) => {
      if (isType && imports.includes('LucideIcon')) {
        return `// import removed: LucideIcon`;
      }
      
      let iconNames = imports.split(',').map(i => i.trim()).filter(Boolean);
      
      // Handle aliases like "Image as ImageIcon"
      let newImports = [];
      let mappedAliases = {};
      
      iconNames.forEach(iconDef => {
        if (iconDef.includes(' as ')) {
          const [orig, alias] = iconDef.split(' as ').map(s => s.trim());
          const newOrig = ICON_MAP[orig] || orig;
          mappedAliases[alias] = newOrig; // We'll replace the alias usage in code with the direct newOrig
          newImports.push(newOrig);
        } else {
          newImports.push(ICON_MAP[iconDef] || iconDef);
        }
      });
      
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

  // Si había `ImageIcon`, el loop de arriba lo cambiará a `Image`.
  // Si en Types.ts había LucideIcon, lo cambiamos a any temporalmente o React.ElementType
  content = content.replace(/\bLucideIcon\b/g, 'React.ElementType');

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

walkDir('c:/Proyectos/syncova/src/components/Configuracion');
