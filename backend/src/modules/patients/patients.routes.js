import { Router } from 'express';
import { listPatients, getPatientById, getMyPatient, updateMyPatient, createPatient, updatePatient, deletePatient } from './patients.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', authorize('paciente'), getMyPatient);
router.patch('/me', authorize('paciente'), updateMyPatient);
router.get('/', authorize('admin', 'psicologo'), listPatients);
router.get('/:id', authorize('admin', 'psicologo'), getPatientById);
router.post('/', authorize('admin', 'psicologo'), createPatient);
router.put('/:id', authorize('admin', 'psicologo'), updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);

export default router;
