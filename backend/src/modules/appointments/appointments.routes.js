import { Router } from 'express';
import { listAppointments, getAppointmentById, createAppointment, updateAppointment, cancelAppointment, concludeAppointment } from './appointments.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize('admin', 'psicologo', 'paciente'), listAppointments);
router.get('/:id', authorize('admin', 'psicologo', 'paciente'), getAppointmentById);
router.post('/', authorize('admin', 'psicologo', 'paciente'), createAppointment);
router.put('/:id', authorize('admin', 'psicologo'), updateAppointment);
router.patch('/:id/cancel', authorize('admin', 'psicologo', 'paciente'), cancelAppointment);
router.patch('/:id/conclude', authorize('admin', 'psicologo'), concludeAppointment);

export default router;
