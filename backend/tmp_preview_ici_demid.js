const { IciDemidService } = require('./dist/services/IciDemidService');
const fs = require('fs');
(async () => {
  const file = { buffer: fs.readFileSync('C:/Proyectos/syncova/ICI DEMID.xlsx'), originalname: 'ICI DEMID.xlsx' };
  const result = await IciDemidService.previewImport(file);
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => { console.error(err); process.exit(1); });
