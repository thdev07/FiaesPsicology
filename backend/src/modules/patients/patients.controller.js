import * as patientsService from './patients.service.js';


export async function listPatients(req, res, next) {
  try {
    const { data, error } = await patientsService.listPatientsService();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function getPatientById(req, res, next) {
  try {
    const { data, error } = await patientsService.getPatientByIdService(req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function getMyPatient(req, res, next) {
  try {
    const { data, error } = await patientsService.getPatientByEmailService(req.user.email);
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Ficha clínica não encontrada para este usuário.' });
    res.json(data);
  } catch (err) { next(err); }
}

export async function createPatient(req, res, next) {
  try {
    const { data, error } = await patientsService.createPatientService(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updatePatient(req, res, next) {
  try {
    const { data, error } = await patientsService.updatePatientService(req.params.id, req.body);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function deletePatient(req, res, next) {
  try {
    const { error } = await patientsService.deletePatientService(req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
}

