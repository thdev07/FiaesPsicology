import { Router } from 'express';
import supabase from '../../db.js';
import { sendReminderEmail } from '../../services/email.service.js';
import { sendAppointmentConfirmationWhatsApp } from '../../services/whatsapp.service.js';

const router = Router();

router.get('/reminders', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers['authorization'] !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*, patients(nome, email, telefone), users(nome), rooms(nome)')
    .eq('data', tomorrowStr)
    .eq('status', 'confirmado');

  if (error) return res.status(500).json({ error: error.message });
  if (!appointments?.length) return res.json({ sent: 0 });

  let sent = 0;
  for (const appt of appointments) {
    const { nome: patientName, email, telefone } = appt.patients ?? {};
    const psychologistName = appt.users?.nome ?? '—';

    if (email) {
      await sendReminderEmail({
        to: email, patientName, psychologistName,
        date: appt.data, time: appt.hora, roomName: appt.rooms?.nome,
      }).catch(() => {});
    }

    if (telefone) {
      await sendAppointmentConfirmationWhatsApp({
        to: telefone, patientName, psychologistName,
        date: appt.data, time: appt.hora, roomName: appt.rooms?.nome,
      }).catch(() => {});
    }

    sent++;
  }

  res.json({ sent, date: tomorrowStr });
});

export default router;
