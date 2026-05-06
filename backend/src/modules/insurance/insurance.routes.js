import { Router } from 'express';
import { listInsurancePlans, createInsurancePlan, updateInsurancePlan, deleteInsurancePlan } from './insurance.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize('admin', 'psicologo'), listInsurancePlans);
router.post('/', authorize('admin'), createInsurancePlan);
router.put('/:id', authorize('admin'), updateInsurancePlan);
router.delete('/:id', authorize('admin'), deleteInsurancePlan);

export default router;
