import { Router } from 'express';
import { listRooms, getRoomById, createRoom, updateRoom, deleteRoom } from './rooms.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', authorize('admin', 'psicologo'), listRooms);
router.get('/:id', authorize('admin', 'psicologo'), getRoomById);
router.post('/', authorize('admin'), createRoom);
router.put('/:id', authorize('admin'), updateRoom);
router.delete('/:id', authorize('admin'), deleteRoom);

export default router;
