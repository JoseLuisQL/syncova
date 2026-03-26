const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src', 'components');
const targetFile = path.join(rootDir, 'ui', 'ModalElements');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const allFiles = walk(rootDir);

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (content.includes('ModalComponents')) {
        let relativeToTarget = path.relative(path.dirname(file), targetFile).replace(/\\/g, '/');
        if (!relativeToTarget.startsWith('.')) {
            relativeToTarget = './' + relativeToTarget;
        }

        const importRegex = /(import\s+[^'"]+from\s+['"])([^'"]+)ModalComponents(['"])/g;
        let modified = content.replace(importRegex, (match, prefix, oldPath, suffix) => {
            console.log(`Updated import in ${path.relative(rootDir, file)}: ${oldPath}ModalComponents -> ${relativeToTarget}`);
            return `${prefix}${relativeToTarget}${suffix}`;
        });

        const exportRegex = /(export\s+[^'"]+from\s+['"])([^'"]+)ModalComponents(['"])/g;
        modified = modified.replace(exportRegex, (match, prefix, oldPath, suffix) => {
            console.log(`Updated export in ${path.relative(rootDir, file)}: ${oldPath}ModalComponents -> ${relativeToTarget}`);
            return `${prefix}${relativeToTarget}${suffix}`;
        });

        if (content !== modified) {
            fs.writeFileSync(file, modified, 'utf8');
        }
    }
});

// Purga de redundancias
const dupes = [
    path.join(rootDir, 'Establecimientos', 'components', 'ModalComponents.tsx'),
    path.join(rootDir, 'Inventario', 'components', 'ModalComponents.tsx'),
    path.join(rootDir, 'Usuarios', 'components', 'ModalComponents.tsx')
];

dupes.forEach(dupe => {
    if (fs.existsSync(dupe)) {
        fs.unlinkSync(dupe);
        console.log(`Deleted duplicated primitive: ${path.relative(rootDir, dupe)}`);
    }
});
