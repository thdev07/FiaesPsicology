import { Router } from 'express';
import { listTransactions, createTransaction, updateTransaction, getFinancialSummary, getMyDebts } from './transactions.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/my-debts', authorize('paciente'), getMyDebts);
router.get('/', authorize('admin'), listTransactions);
router.get('/summary', authorize('admin'), getFinancialSummary);
router.post('/', authorize('admin'), createTransaction);
router.put('/:id', authorize('admin'), updateTransaction);

export default router;
