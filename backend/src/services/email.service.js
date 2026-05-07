import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM ?? 'no-reply@fiaespsychology.com.br';

function client() {
  return new Resend(process.env.RESEND_API_KEY);
}

function fmtDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

export async function sendConfirmationEmail({ to, patientName, psychologistName, date, time, roomName }) {
  if (!to) return;
  return client().emails.send({
    from: FROM,
    to,
    subject: 'Consulta confirmada — FiaesPsychology',
    html: `
      <p>Olá, <strong>${patientName}</strong>!</p>
      <p>Sua consulta foi <strong>confirmada</strong>.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Data</td><td><strong>${fmtDate(date)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Horário</td><td><strong>${time.slice(0, 5)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Psicólogo(a)</td><td><strong>${psychologistName}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Sala</td><td>${roomName ?? '—'}</td></tr>
      </table>
      <p style="color:#64748b;font-size:13px">Em caso de dúvidas, entre em contato com a clínica.</p>
      <p style="color:#64748b;font-size:13px">— Equipe FiaesPsychology</p>
    `,
  });
}

export async function sendCancellationEmail({ to, patientName, date, time, psychologistName }) {
  if (!to) return;
  return client().emails.send({
    from: FROM,
    to,
    subject: 'Consulta cancelada — FiaesPsychology',
    html: `
      <p>Olá, <strong>${patientName}</strong>!</p>
      <p>Infelizmente sua consulta do dia <strong>${fmtDate(date)}</strong> às <strong>${time.slice(0, 5)}</strong>
      com <strong>${psychologistName}</strong> foi <strong>cancelada</strong>.</p>
      <p>Entre em contato com a clínica para reagendar.</p>
      <p style="color:#64748b;font-size:13px">— Equipe FiaesPsychology</p>
    `,
  });
}

export async function sendReminderEmail({ to, patientName, psychologistName, date, time, roomName }) {
  if (!to) return;
  return client().emails.send({
    from: FROM,
    to,
    subject: 'Lembrete de consulta — FiaesPsychology',
    html: `
      <p>Olá, <strong>${patientName}</strong>!</p>
      <p>Este é um lembrete de que você tem uma consulta <strong>amanhã</strong>.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Data</td><td><strong>${fmtDate(date)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Horário</td><td><strong>${time.slice(0, 5)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Psicólogo(a)</td><td><strong>${psychologistName}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Sala</td><td>${roomName ?? '—'}</td></tr>
      </table>
      <p style="color:#64748b;font-size:13px">— Equipe FiaesPsychology</p>
    `,
  });
}
