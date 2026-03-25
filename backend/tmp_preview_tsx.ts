import fs from 'fs';
import { IciDemidService } from './src/services/IciDemidService';

(async () => {
  const file = { buffer: fs.readFileSync('C:/Proyectos/syncova/ICI DEMID.xlsx'), originalname: 'ICI DEMID.xlsx' } as Express.Multer.File;
  const result = await IciDemidService.previewImport(file);
  console.log(JSON.stringify(result.data?.mesesDetectadosPorAnio, null, 2));
})();
