const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace colors
  const replaces = [
    { from: /teal-/g, to: 'zinc-' },
    { from: /cyan-/g, to: 'zinc-' },
    { from: /slate-/g, to: 'zinc-' },
    { from: /gray-/g, to: 'zinc-' },
    { from: /indigo-/g, to: 'zinc-' },
    { from: /violet-/g, to: 'zinc-' },
  ];

  for (const r of replaces) {
    content = content.replace(r.from, r.to);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Modified colors: ${filePath}`);
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
      // Don't modify constants.ts because I already set standard colors there (which might contain cyan/teal for other things, though I removed them)
      if (!fullPath.endsWith('constants.ts')) {
        if (processFile(fullPath)) count++;
      }
    }
  }
  return count;
}

const rootDir = 'c:/Proyectos/syncova/src/components/Usuarios';
const changed = walkDir(rootDir);
console.log(`\nTotal files color-cleaned: ${changed}`);
