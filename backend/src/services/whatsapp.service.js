const BASE_URL = 'https://api.z-api.io/instances';

function getConfig() {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const instanceToken = process.env.ZAPI_INSTANCE_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;
  if (!instanceId || !instanceToken || !clientToken) throw new Error('Z-API credentials não configuradas');
  return { instanceId, instanceToken, clientToken };
}

/** Normaliza telefone brasileiro para formato Z-API: apenas dígitos com DDI */
function normalizeBrPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return null;
}

async function sendWhatsApp(to, message) {
  const phone = normalizeBrPhone(to);
  if (!phone) return;

  const { instanceId, instanceToken, clientToken } = getConfig();
  const url = `${BASE_URL}/${instanceId}/token/${instanceToken}/send-text`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Client-Token': clientToken },
    body: JSON.stringify({ phone, message }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Z-API ${res.status}: ${body}`);
  }
  return res.json();
}

function fmtDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
}

export async function sendAppointmentConfirmationWhatsApp({ to, patientName, psychologistName, date, time, roomName }) {
  const msg = [
    `Olá, *${patientName}*! 👋`,
    `Sua consulta foi *confirmada* com sucesso.`,
    ``,
    `📅 *Data:* ${fmtDate(date)}`,
    `🕐 *Horário:* ${time.slice(0, 5)}`,
    `👤 *Psicólogo(a):* ${psychologistName}`,
    roomName ? `🚪 *Sala:* ${roomName}` : null,
    ``,
    `Em caso de dúvidas, entre em contato com a clínica.`,
    `— Equipe FiaesPsychology`,
  ].filter(Boolean).join('\n');
  return sendWhatsApp(to, msg);
}

export async function sendAppointmentCancellationWhatsApp({ to, patientName, date, time, psychologistName }) {
  const msg = [
    `Olá, *${patientName}*.`,
    `Sua consulta do dia *${fmtDate(date)}* às *${time.slice(0, 5)}* com *${psychologistName}* foi *cancelada*.`,
    ``,
    `Entre em contato com a clínica para reagendar.`,
    `— Equipe FiaesPsychology`,
  ].join('\n');
  return sendWhatsApp(to, msg);
}

export async function sendPaymentConfirmationWhatsApp({ to, patientName, psychologistName, date, time, amount }) {
  const formatted = Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const msg = [
    `Olá, *${patientName}*! 🎉`,
    `Recebemos seu pagamento com sucesso.`,
    ``,
    `📅 *Consulta:* ${fmtDate(date)} às ${time?.slice(0, 5)}`,
    `👤 *Psicólogo(a):* ${psychologistName}`,
    `💰 *Valor pago:* ${formatted}`,
    ``,
    `Guarde esta mensagem como comprovante.`,
    `— Equipe FiaesPsychology`,
  ].join('\n');
  return sendWhatsApp(to, msg);
}

export async function sendRescheduleNotificationWhatsApp({ to, adminName, patientName, psychologistName, oldDate, oldTime, newDate, newTime }) {
  const msg = [
    `Olá${adminName ? `, *${adminName}*` : ''}!`,
    `O paciente *${patientName}* solicitou reagendamento de consulta.`,
    ``,
    `👤 *Psicólogo(a):* ${psychologistName}`,
    `❌ *Data anterior:* ${fmtDate(oldDate)} às ${oldTime?.slice(0, 5)}`,
    `✅ *Nova data:* ${fmtDate(newDate)} às ${newTime?.slice(0, 5)}`,
    ``,
    `Acesse o sistema para confirmar o novo horário.`,
    `— FiaesPsychology`,
  ].join('\n');
  return sendWhatsApp(to, msg);
}
