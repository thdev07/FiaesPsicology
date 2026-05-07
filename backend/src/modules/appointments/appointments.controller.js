import * as appointmentsService from './appointments.service.js';
import { autoCreateFromAppointmentService } from '../financial/transactions.service.js';
import { createCalendarEvent, deleteCalendarEvent } from '../../services/google-calendar.service.js';
import { sendConfirmationEmail, sendCancellationEmail } from '../../services/email.service.js';

export async function listAppointments(req, res, next) {
  try {
    const role = req.user.user_metadata?.role;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { data, error } = await appointmentsService.listAppointmentsService({ role, userId, userEmail });
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

      // Busca dados completos para Calendar e e-mail (fire and forget)
      appointmentsService.getAppointmentByIdFullService(req.params.id).then(async (appt) => {
        if (!appt) return;

        const calEvent = await createCalendarEvent({
          appointment: appt,
          patientName: appt.patients?.nome ?? 'Paciente',
          psychologistName: appt.users?.nome ?? '—',
          roomName: appt.rooms?.nome,
        }).catch((err) => { console.error('[Calendar] Erro ao criar evento:', err.message); return null; });

        if (calEvent?.id) {
          await appointmentsService.saveCalendarEventIdService(req.params.id, calEvent.id).catch(() => {});
        }

        await sendConfirmationEmail({
          to: appt.patients?.email,
          patientName: appt.patients?.nome ?? 'Paciente',
          psychologistName: appt.users?.nome ?? '—',
          date: appt.data,
          time: appt.hora,
          roomName: appt.rooms?.nome,
        }).catch((err) => console.error('[Email] Erro confirmação:', err.message));
      }).catch(() => {});
    }

    res.json(data);
  } catch (err) { next(err); }
}

export async function cancelAppointment(req, res, next) {
  try {
    const appt = await appointmentsService.getAppointmentByIdFullService(req.params.id).catch(() => null);
    const { data, error } = await appointmentsService.cancelAppointmentService(req.params.id);
    if (error) throw error;

    if (appt) {
      if (appt.calendar_event_id) {
        deleteCalendarEvent(appt.calendar_event_id).catch((err) =>
          console.error('[Calendar] Erro ao deletar evento:', err.message));
      }

      sendCancellationEmail({
        to: appt.patients?.email,
        patientName: appt.patients?.nome ?? 'Paciente',
        psychologistName: appt.users?.nome ?? '—',
        date: appt.data,
        time: appt.hora,
      }).catch((err) => console.error('[Email] Erro cancelamento:', err.message));
    }

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
