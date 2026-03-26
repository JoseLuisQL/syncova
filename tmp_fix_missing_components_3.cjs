const fs = require('fs');
const path = require('path');
const dir = 'c:/Proyectos/syncova/src/components/Usuarios';

function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');
  let o = c;
  c = c.replace(/\bMail\b/g, 'EnvelopeSimple');
  // Additionally, handle ListFilter if any:
  c = c.replace(/\bListFilter\b/g, 'ListDashes');
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
