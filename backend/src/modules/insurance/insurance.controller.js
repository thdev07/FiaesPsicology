import * as insuranceService from './insurance.service.js';

export async function listInsurancePlans(req, res, next) {
  try {
    const { data, error } = await insuranceService.listInsurancePlansService();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function createInsurancePlan(req, res, next) {
  try {
    const { data, error } = await insuranceService.createInsurancePlanService(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateInsurancePlan(req, res, next) {
  try {
    const { data, error } = await insuranceService.updateInsurancePlanService(req.params.id, req.body);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}
