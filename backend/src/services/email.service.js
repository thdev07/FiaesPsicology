import nodemailer from 'nodemailer';

function transporter() {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const FROM = `FiaesPsychology <${process.env.GMAIL_USER}>`;

function fmtDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

export async function sendConfirmationEmail({ to, patientName, psychologistName, date, time, roomName }) {
  if (!to) return;
  return transporter().sendMail({
    from: FROM, to,
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
  return transporter().sendMail({
    from: FROM, to,
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

export async function sendPaymentConfirmationEmail({ to, patientName, psychologistName, date, time, amount }) {
  if (!to) return;
  const formatted = Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return transporter().sendMail({
    from: FROM, to,
    subject: 'Pagamento confirmado — FiaesPsychology',
    html: `
      <p>Olá, <strong>${patientName}</strong>!</p>
      <p>Recebemos seu pagamento com sucesso. 🎉</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Consulta</td><td><strong>${fmtDate(date)} às ${time?.slice(0, 5)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Psicólogo(a)</td><td><strong>${psychologistName}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Valor pago</td><td><strong>${formatted}</strong></td></tr>
      </table>
      <p style="color:#64748b;font-size:13px">Guarde este e-mail como comprovante.</p>
      <p style="color:#64748b;font-size:13px">— Equipe FiaesPsychology</p>
    `,
  });
}

export async function sendRescheduleNotificationEmail({ to, adminName, patientName, psychologistName, oldDate, oldTime, newDate, newTime }) {
  if (!to) return;
  return transporter().sendMail({
    from: FROM, to,
    subject: `Reagendamento solicitado — ${patientName}`,
    html: `
      <p>Olá${adminName ? `, <strong>${adminName}</strong>` : ''}!</p>
      <p>O paciente <strong>${patientName}</strong> solicitou reagendamento da consulta.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Psicólogo(a)</td><td><strong>${psychologistName}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Data anterior</td><td>${fmtDate(oldDate)} às ${oldTime?.slice(0,5)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Nova data solicitada</td><td><strong>${fmtDate(newDate)} às ${newTime?.slice(0,5)}</strong></td></tr>
      </table>
      <p style="color:#64748b;font-size:13px">Acesse o sistema para confirmar o novo horário.</p>
      <p style="color:#64748b;font-size:13px">— FiaesPsychology</p>
    `,
  });
}

export async function sendReminderEmail({ to, patientName, psychologistName, date, time, roomName }) {
  if (!to) return;
  return transporter().sendMail({
    from: FROM, to,
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
