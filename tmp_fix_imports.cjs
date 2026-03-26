const fs = require('fs');
const path = require('path');
const dir = 'c:/Proyectos/syncova/src/components/Reportes/components/tabs';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let modifiedCount = 0;
files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  const initialContent = content;
  
  if (content.includes("from '..'")) {
    content = content.replace(
      "import { ReporteCard, ReportInlineStatus, ReportSectionCard, ReportTableColumn } from '..';", 
      "import ReporteCard from '../ReporteCard';\nimport { ReportInlineStatus, ReportSectionCard, ReportTableColumn } from '../ReportPrimitives';"
    );
    content = content.replace(
      "import { ReportSectionCard } from '..';",
      "import { ReportSectionCard } from '../ReportPrimitives';"
    );
    if (content !== initialContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log('Modified:', f);
    }
  }
});
console.log('Total modificados:', modifiedCount);
