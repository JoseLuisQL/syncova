const fs = require('fs');
const path = require('path');

const ICON_MAP = {
  'AlertTriangle': 'Warning',
  'UserPlus': 'UserPlus',
  'RefreshCw': 'ArrowsClockwise',
  'Download': 'DownloadSimple',
  'Loader2': 'CircleNotch',
  'LucideIcon': 'Icon',
  'KeyRound': 'Key',
  'X': 'X',
  'Eye': 'Eye',
  'EyeOff': 'EyeSlash',
  'ShieldCheck': 'ShieldCheck',
  'UserCheck': 'UserCheck',
  'Trash2': 'Trash',
  'CheckCircle': 'CheckCircle',
  'XCircle': 'XCircle',
  'Users': 'Users',
  'Shield': 'Shield',
  'Key': 'Key',
  'Search': 'MagnifyingGlass',
  'Filter': 'Funnel',
  'Plus': 'Plus',
  'ChevronLeft': 'CaretLeft',
  'ChevronRight': 'CaretRight',
  'MoreVertical': 'DotsThreeVertical',
  'MoreHorizontal': 'DotsThree',
  'Lock': 'Lock',
  'Unlock': 'LockOpen',
  'Edit2': 'PencilSimple',
  'Edit': 'PencilSimple',
  'Database': 'Database',
  'Info': 'Info',
  'Settings': 'Gear',
  'Save': 'FloppyDisk',
  'FileText': 'FileText',
  'ArrowUpRight': 'ArrowUpRight',
  'ArrowDownRight': 'ArrowDownRight',
  'ListFilter': 'ListDashes'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Reemplazar importaciones de lucide-react por @phosphor-icons/react
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];?/g;
  content = content.replace(importRegex, (match, importsStr) => {
    const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
    const newImports = [];
    imports.forEach(imp => {
      let icon = imp;
      let alias = null;
      if (imp.includes(' as ')) {
        [icon, alias] = imp.split(' as ').map(i => i.trim());
      }
      const mapped = ICON_MAP[icon] || icon;
      if (alias) {
        newImports.push(`${mapped} as ${alias}`);
      } else {
        newImports.push(mapped);
      }
      
      // Si estamos cambiando a Phosphor, también necesitamos cambiar las ocurrencias en el JSX
      if (icon !== mapped && !alias) {
        const tagRegex1 = new RegExp(`<${icon}([\\s>])`, 'g');
        content = content.replace(tagRegex1, `<${mapped}$1`);
        
        const tagRegex2 = new RegExp(`icon={${icon}}`, 'g');
        content = content.replace(tagRegex2, `icon={${mapped}}`);
        
        const tagRegex3 = new RegExp(`Icon={${icon}}`, 'g');
        content = content.replace(tagRegex3, `Icon={${mapped}}`);

        const tagRegex4 = new RegExp(`(?<![a-zA-Z])${icon}(?![a-zA-Z])`, 'g');
        content = content.replace(tagRegex4, `${mapped}`);
      }
    });
    
    // Use Set to avoid duplicates
    const uniqueImports = [...new Set(newImports)];
    return `import { ${uniqueImports.join(', ')} } from '@phosphor-icons/react';`;
  });

  // 2. Romper dependencias circulares (import ... from '..')
  const barrelRegex = /import\s*{([^}]+)}\s*from\s*['"]\.\.['"]/g;
  content = content.replace(barrelRegex, (match, importsStr) => {
    const entities = importsStr.split(',').map(i => i.trim()).filter(Boolean);
    let newImports = '';
    entities.forEach(ent => {
      if (['DeleteConfirmModal', 'StatusBadge'].includes(ent)) {
        newImports += `import { ${ent} } from '../ModalComponents';\n`;
      } else {
        newImports += `// TODO: fix manual import for ${ent}\n`;
      }
    });
    return newImports ? newImports.trim() : match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Modified: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      count += walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (processFile(fullPath)) count++;
    }
  }
  return count;
}

const rootDir = 'c:/Proyectos/syncova/src/components/Usuarios';
const changed = walkDir(rootDir);
console.log(`\nTotal files modified: ${changed}`);
