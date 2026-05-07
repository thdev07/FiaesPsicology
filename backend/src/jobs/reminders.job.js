import cron from 'node-cron';
import supabase from '../db.js';
import { sendReminderEmail } from '../services/email.service.js';

export function startRemindersJob() {
  // Roda todo dia às 08:00
  cron.schedule('0 8 * * *', async () => {
    console.log('[Reminders] Verificando consultas para amanhã...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, patients(nome, email), users(nome), rooms(nome)')
      .eq('data', tomorrowStr)
      .eq('status', 'confirmado');

    if (error) {
      console.error('[Reminders] Erro ao buscar agendamentos:', error.message);
      return;
    }

    if (!appointments?.length) {
      console.log('[Reminders] Nenhuma consulta amanhã.');
      return;
    }

    for (const appt of appointments) {
      const email = appt.patients?.email;
      if (!email) continue;

      await sendReminderEmail({
        to: email,
        patientName: appt.patients?.nome ?? 'Paciente',
        psychologistName: appt.users?.nome ?? '—',
        date: appt.data,
        time: appt.hora,
        roomName: appt.rooms?.nome,
      }).catch((err) => console.error(`[Reminders] Erro ao enviar para ${email}:`, err.message));

      console.log(`[Reminders] Lembrete enviado → ${email}`);
    }
  }, { timezone: 'America/Bahia' });

  console.log('[Reminders] Job de lembretes iniciado (08:00 diário).');
}
