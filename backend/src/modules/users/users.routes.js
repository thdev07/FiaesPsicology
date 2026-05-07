import { Router } from 'express';
import { listUsers, getUserById, createUser, updateUser, deleteUser, listPsychologists } from './users.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/psychologists', authorize('admin', 'psicologo', 'paciente'), listPsychologists);
router.get('/', authorize('admin'), listUsers);
router.get('/:id', authorize('admin'), getUserById);
router.post('/', authorize('admin'), createUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
