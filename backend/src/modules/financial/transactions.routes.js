import { Router } from 'express';
import { listTransactions, createTransaction, updateTransaction, getFinancialSummary, getMyDebts, createPayment, paymentWebhook, getPaymentStatus, getMyRepasse } from './transactions.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

// Webhook do Mercado Pago é público (sem auth), deve vir antes do authMiddleware
router.post('/payment/webhook', paymentWebhook);

router.use(authMiddleware);

router.get('/my-debts', authorize('paciente'), getMyDebts);
router.get('/my-repasse', authorize('psicologo'), getMyRepasse);
router.get('/', authorize('admin'), listTransactions);
router.get('/summary', authorize('admin'), getFinancialSummary);
router.post('/', authorize('admin'), createTransaction);
router.put('/:id', authorize('admin'), updateTransaction);

// Pagamento online (paciente)
router.post('/payment/create', authorize('paciente'), createPayment);
router.get('/payment/:transactionId/status', authorize('paciente'), getPaymentStatus);

export default router;
