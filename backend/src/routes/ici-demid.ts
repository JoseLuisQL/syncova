import { Router } from 'express';
import IciDemidController from '@/controllers/IciDemidController';
import { authenticate } from '@/middleware/auth';
import { denyRoles, requireCentroAcopioAssignment } from '@/middleware/accessControl';
import { requirePermissions } from '@/middleware/permissions';
import { handleUploadError, uploadSingleExcel } from '@/middleware/upload';
import { authorize } from '@/middleware/auth';

const router = Router();
const denyNonAdmin = denyRoles(['responsable_acopio', 'coordinador', 'operador']);

router.use(authenticate, authorize(['administrador']), requireCentroAcopioAssignment, requirePermissions(['ici_demid:read']));

router.get('/anios-disponibles', IciDemidController.getAniosDisponibles);
router.get('/', IciDemidController.getAll);
router.post('/preview-import', requirePermissions(['ici_demid:write']), denyNonAdmin, uploadSingleExcel, handleUploadError, IciDemidController.previewImport);
router.post('/importar', requirePermissions(['ici_demid:write']), denyNonAdmin, uploadSingleExcel, handleUploadError, IciDemidController.importFromExcel);

export default router;
