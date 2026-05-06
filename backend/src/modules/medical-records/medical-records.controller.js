import * as service from './medical-records.service.js';

export async function getRecord(req, res, next) {
  try {
    const { data, error } = await service.getRecordByConsultaService(req.params.consultaId);
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Prontuário não encontrado' });
    res.json(data);
  } catch (err) { next(err); }
}

export async function createRecord(req, res, next) {
  try {
    if (!req.body.consulta_id) {
      return res.status(400).json({ error: 'consulta_id é obrigatório' });
    }
    const { data, error } = await service.createRecordService(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateRecord(req, res, next) {
  try {
    const { data, error } = await service.updateRecordService(req.params.id, req.body);
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Prontuário não encontrado' });
    res.json(data);
  } catch (err) { next(err); }
}
