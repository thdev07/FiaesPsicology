import { google } from 'googleapis';

function buildClient() {
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON ?? '{}');
  const token = JSON.parse(process.env.GOOGLE_TOKEN_JSON ?? '{}');

  const { client_id, client_secret, redirect_uris } = creds.installed ?? creds.web ?? {};
  if (!client_id) return null;

  const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris?.[0]);
  auth.setCredentials(token);
  return auth;
}

function formatDateTime(date, time) {
  return `${date}T${time}:00`;
}

export async function createCalendarEvent({ appointment, patientName, psychologistName, roomName }) {
  const auth = buildClient();
  if (!auth) {
    console.warn('[Google Calendar] Credenciais não configuradas — evento não criado.');
    return null;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  const start = formatDateTime(appointment.data, appointment.hora.slice(0, 5));
  const end = new Date(new Date(`${start}`).getTime() + 50 * 60 * 1000).toISOString().slice(0, 19);

  const event = {
    summary: `Consulta — ${patientName}`,
    description: `Psicólogo: ${psychologistName}\nSala: ${roomName ?? '—'}\nTipo: ${appointment.tipo}`,
    start: { dateTime: start, timeZone: 'America/Bahia' },
    end: { dateTime: `${appointment.data}T${end.split('T')[1]}`, timeZone: 'America/Bahia' },
  };

  const { data } = await calendar.events.insert({ calendarId: 'primary', requestBody: event });
  return data;
}

export async function deleteCalendarEvent(eventId) {
  const auth = buildClient();
  if (!auth || !eventId) return;

  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId: 'primary', eventId }).catch(() => {});
}
