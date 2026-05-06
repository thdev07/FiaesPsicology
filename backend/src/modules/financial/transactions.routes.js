import { Router } from 'express';
import { listTransactions, createTransaction, getFinancialSummary } from './transactions.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize('admin'), listTransactions);
router.get('/summary', authorize('admin'), getFinancialSummary);
router.post('/', authorize('admin'), createTransaction);

export default router;
