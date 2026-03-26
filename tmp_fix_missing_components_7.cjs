const fs = require('fs');
const path = require('path');
const file = 'c:/Proyectos/syncova/src/components/Usuarios/PermissionsModal.tsx';

let c = fs.readFileSync(file, 'utf8');
let o = c;
c = c.replace(/\bSettings\b/g, 'Gear');
if (c !== o) { fs.writeFileSync(file, c); console.log('fixed', file); }

// Force HMR again just in case
const dir = 'c:/Proyectos/syncova/src/components/Usuarios';
function walk(curr) {
  for(let f of fs.readdirSync(curr)) {
    let p = path.join(curr, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      fs.writeFileSync(p, content + ' ');
    }
  }
}
walk(dir);
