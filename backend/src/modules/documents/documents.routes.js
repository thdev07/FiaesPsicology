import { Router } from 'express';
import { getByConsulta, getMyDocuments, create, update, remove } from './documents.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();
router.use(authMiddleware);

router.get('/my', authorize('paciente'), getMyDocuments);
router.get('/consulta/:consultaId', authorize('psicologo', 'admin'), getByConsulta);
router.post('/', authorize('psicologo'), create);
router.put('/:id', authorize('psicologo'), update);
router.delete('/:id', authorize('psicologo'), remove);

export default router;
