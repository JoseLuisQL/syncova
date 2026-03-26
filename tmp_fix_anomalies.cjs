const fs = require('fs');
const files = [
  'c:/Proyectos/syncova/src/components/Reportes/modals/VisualizarReporteModal.tsx',
  'c:/Proyectos/syncova/src/components/Reportes/components/tabs/CenaresTable.tsx',
  'c:/Proyectos/syncova/src/components/Reportes/components/ReportPrimitives.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/Warning weight="duotone"Circle/g, 'WarningCircle weight="duotone"');
    fs.writeFileSync(f, c, 'utf8');
  }
});
console.log('Falsos positivos corregidos.');
