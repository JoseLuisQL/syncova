import { Router } from 'express';
import IciDemidController from '@/controllers/IciDemidController';
import { authenticate } from '@/middleware/auth';
import { denyRoles, requireCentroAcopioAssignment } from '@/middleware/accessControl';
import { requirePermissions } from '@/middleware/permissions';
import { handleUploadError, uploadSingleExcel } from '@/middleware/upload';

const router = Router();
const denyResponsableAcopio = denyRoles(['responsable_acopio']);

router.use(authenticate, requireCentroAcopioAssignment, requirePermissions(['ici_demid:read', 'planificacion:read']));

router.get('/anios-disponibles', IciDemidController.getAniosDisponibles);
router.get('/', IciDemidController.getAll);
router.post('/preview-import', requirePermissions(['ici_demid:write', 'planificacion:write']), denyResponsableAcopio, uploadSingleExcel, handleUploadError, IciDemidController.previewImport);
router.post('/importar', requirePermissions(['ici_demid:write', 'planificacion:write']), denyResponsableAcopio, uploadSingleExcel, handleUploadError, IciDemidController.importFromExcel);

export default router;
