import * as service from './documents.service.js';

export async function getByConsulta(req, res, next) {
  try {
    const data = await service.listByConsulta(req.params.consultaId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function getMyDocuments(req, res, next) {
  try {
    const data = await service.listMyDocuments(req.user.email);
    res.json(data);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const data = await service.createDocument(req.body, req.user.email);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const data = await service.updateDocument(req.params.id, req.body, req.user.email);
    res.json(data);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await service.deleteDocument(req.params.id, req.user.email);
    res.status(204).end();
  } catch (err) { next(err); }
}
