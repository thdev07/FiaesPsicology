import supabase from '../../db.js';

export async function listAppointmentsService({ role, userId, userEmail } = {}) {
  let query = supabase.from('appointments').select('*, patients(nome, cpf), users(nome), rooms(nome)');

  if (role === 'psicologo' && userId) {
    query = query.eq('psicologo_id', userId);
  } else if (role === 'paciente' && userEmail) {
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();
    if (patient) {
      query = query.eq('paciente_id', patient.id);
    } else {
      return { data: [], error: null };
    }
  }

  return query.order('data', { ascending: false }).order('hora', { ascending: false });
}

export const getAppointmentByIdService = (id) =>
  supabase.from('appointments').select('*, patients(nome), users(nome), rooms(nome)').eq('id', id).single();

export async function getAppointmentByIdFullService(id) {
  const { data } = await supabase
    .from('appointments')
    .select('*, patients(nome, email, telefone), users(nome), rooms(nome)')
    .eq('id', id)
    .single();
  return data;
}

export const saveCalendarEventIdService = (id, eventId) =>
  supabase.from('appointments').update({ calendar_event_id: eventId }).eq('id', id);

export async function createAppointmentService(data) {
  // Valida conflito de sala apenas quando sala está definida
  if (data.sala_id) {
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('sala_id', data.sala_id)
      .eq('data', data.data)
      .eq('hora', data.hora)
      .neq('status', 'cancelado')
      .single();

    if (conflict) throw { status: 409, message: 'Sala já ocupada neste horário' };
  }

  return supabase.from('appointments').insert(data).select().single();
}

export const updateAppointmentService = (id, data) =>
  supabase.from('appointments').update(data).eq('id', id).select().single();

export const cancelAppointmentService = (id) =>
  supabase.from('appointments').update({ status: 'cancelado' }).eq('id', id).select().single();

export const concludeAppointmentService = (id) =>
  supabase.from('appointments').update({ status: 'concluido' }).eq('id', id).select().single();

const DEFAULT_SLOTS = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00'];

export async function getAvailableSlotsService(psicologoId, date) {
  const { data: booked } = await supabase
    .from('appointments')
    .select('hora')
    .eq('psicologo_id', psicologoId)
    .eq('data', date)
    .neq('status', 'cancelado');

  const bookedSet = new Set((booked ?? []).map((a) => a.hora));

  return DEFAULT_SLOTS.map((hora) => ({
    hora,
    disponivel: !bookedSet.has(hora),
  }));
}

export async function rescheduleAppointmentService(id, newData, newHora, userEmail) {
  // Verifica se o paciente é dono da consulta
  const { data: appt } = await supabase
    .from('appointments')
    .select('status, psicologo_id, paciente_id, patients(email)')
    .eq('id', id)
    .single();

  if (!appt) throw { status: 404, message: 'Consulta não encontrada' };
  if (appt.patients?.email !== userEmail) throw { status: 403, message: 'Acesso negado' };
  if (!['pendente', 'confirmado'].includes(appt.status)) {
    throw { status: 400, message: 'Só é possível reagendar consultas pendentes ou confirmadas' };
  }

  const today = new Date().toISOString().split('T')[0];
  if (newData < today) throw { status: 400, message: 'A nova data não pode ser no passado' };

  // Verifica disponibilidade do psicólogo no novo horário
  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('psicologo_id', appt.psicologo_id)
    .eq('data', newData)
    .eq('hora', newHora)
    .neq('status', 'cancelado')
    .neq('id', id)
    .maybeSingle();

  if (conflict) throw { status: 409, message: 'Psicólogo já tem consulta neste horário' };

  return supabase
    .from('appointments')
    .update({ data: newData, hora: newHora, status: 'pendente' })
    .eq('id', id)
    .select()
    .single();
}
