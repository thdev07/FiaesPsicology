import { Router } from 'express';
import { getRecord, createRecord, updateRecord } from './medical-records.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

// Apenas psicólogo responsável ou admin podem acessar prontuários
router.get('/:consultaId', authorize('admin', 'psicologo'), getRecord);
router.post('/', authorize('psicologo'), createRecord);
router.put('/:id', authorize('psicologo'), updateRecord);

export default router;
