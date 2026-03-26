const fs = require('fs');
const path = require('path');
const dir = 'c:/Proyectos/syncova/src/components/Usuarios';

function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  let o = c;
  c = c.replace(/\bLoader2\b/g, 'CircleNotch');
  c = c.replace(/\bRefreshCw\b/g, 'ArrowsClockwise');
  c = c.replace(/\bAlertTriangle\b/g, 'Warning');
  c = c.replace(/\bSearch\b/g, 'MagnifyingGlass');
  c = c.replace(/\bx\b/g, 'X'); // Just in case, but maybe risky. Better not.
  c = c.replace(/\bEdit\b/g, 'PencilSimple');
  c = c.replace(/\bTrash2\b/g, 'Trash');
  c = c.replace(/\bDownload\b/g, 'DownloadSimple');
  if (c !== o) { fs.writeFileSync(file, c); console.log('fixed', file); }
}

function walk(curr) {
  for(let f of fs.readdirSync(curr)) {
    let p = path.join(curr, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.tsx') || p.endsWith('.ts')) fixFile(p);
  }
}
walk(dir);
