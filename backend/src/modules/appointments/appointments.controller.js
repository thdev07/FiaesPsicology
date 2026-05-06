import * as appointmentsService from './appointments.service.js';
import { autoCreateFromAppointmentService } from '../financial/transactions.service.js';

export async function listAppointments(req, res, next) {
  try {
    const role = req.user.user_metadata?.role;
    const userId = req.user.id;
    const { data, error } = await appointmentsService.listAppointmentsService({ role, userId });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function getAppointmentById(req, res, next) {
  try {
    const { data, error } = await appointmentsService.getAppointmentByIdService(req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function createAppointment(req, res, next) {
  try {
    const { data, error } = await appointmentsService.createAppointmentService(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateAppointment(req, res, next) {
  try {
    const { data, error } = await appointmentsService.updateAppointmentService(req.params.id, req.body);
    if (error) throw error;
    if (req.body.status === 'confirmado') {
      autoCreateFromAppointmentService(req.params.id).catch(() => {});
    }
    res.json(data);
  } catch (err) { next(err); }
}

export async function cancelAppointment(req, res, next) {
  try {
    const { data, error } = await appointmentsService.cancelAppointmentService(req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function concludeAppointment(req, res, next) {
  try {
    const { data, error } = await appointmentsService.concludeAppointmentService(req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}
