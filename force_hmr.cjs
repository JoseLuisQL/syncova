const fs = require('fs');
const path = require('path');
const dir = 'c:/Proyectos/syncova/src/components/Usuarios';

function walk(curr) {
  for(let f of fs.readdirSync(curr)) {
    let p = path.join(curr, f);
    if(fs.statSync(p).isDirectory()) walk(p);
    else if(p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      fs.writeFileSync(p, c + ' ');
      console.log('Touched:', p);
    }
  }
}
walk(dir);
