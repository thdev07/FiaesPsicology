import * as medicalRecordsService from './medical-records.service.js';

export async function getRecord(req, res, next) {
  try {
    const { data, error } = await medicalRecordsService.getRecordByConsultaService(req.params.consultaId);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function createRecord(req, res, next) {
  try {
    const { data, error } = await medicalRecordsService.createRecordService(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateRecord(req, res, next) {
  try {
    const { data, error } = await medicalRecordsService.updateRecordService(req.params.id, req.body);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}
