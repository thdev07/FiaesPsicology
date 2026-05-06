import { signInService, signOutService } from './auth.service.js';

export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await signInService(email, password);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function signOut(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    await signOutService(token);
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (err) {
    next(err);
  }
}

export function getMe(req, res) {
  res.json(req.user);
}
