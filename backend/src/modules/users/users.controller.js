import * as usersService from './users.service.js';

export async function listPsychologists(req, res, next) {
  try {
    const { data, error } = await usersService.listPsychologistsService();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function listUsers(req, res, next) {
  try {
    const { data, error } = await usersService.listUsersService();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function getUserById(req, res, next) {
  try {
    const { data, error } = await usersService.getUserByIdService(req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function createUser(req, res, next) {
  try {
    const { data, error } = await usersService.createUserService(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateUser(req, res, next) {
  try {
    const { data, error } = await usersService.updateUserService(req.params.id, req.body);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    const { error } = await usersService.deleteUserService(req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
}
