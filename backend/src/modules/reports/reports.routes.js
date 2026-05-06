import { Router } from 'express';
import { getReports } from './reports.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', authorize('admin'), getReports);

export default router;
