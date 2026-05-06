import { Router } from 'express';
import { signIn, signOut, getMe } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/signin', signIn);
router.post('/signout', authMiddleware, signOut);
router.get('/me', authMiddleware, getMe);

export default router;
