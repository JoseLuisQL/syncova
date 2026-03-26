import fs from 'fs';

const searchRecursive = (dir, pattern) => {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = dir + '/' + file;
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(searchRecursive(fullPath, pattern));
    } else if (fullPath.match(pattern)) {
      results.push(fullPath);
    }
  }
  return results;
};

const dirs = [
  'c:/Proyectos/syncova/src/components/Layout',
  'c:/Proyectos/syncova/src/components/auth',
  'c:/Proyectos/syncova/src/components/common'
];

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    const files = searchRecursive(dir, /\.tsx?$/);
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('zinc')) {
        content = content.replace(/zinc/g, 'gray');
        fs.writeFileSync(file, content);
        console.log(`Replaced in ${file}`);
      }
    }
  }
}
