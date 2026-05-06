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

export async function createAppointmentService(data) {
  // Valida conflito de sala antes de inserir
  const { data: conflict } = await supabase
    .from('appointments')
    .select('id')
    .eq('sala_id', data.sala_id)
    .eq('data', data.data)
    .eq('hora', data.hora)
    .neq('status', 'cancelado')
    .single();

  if (conflict) throw { status: 409, message: 'Sala já ocupada neste horário' };

  return supabase.from('appointments').insert(data).select().single();
}

export const updateAppointmentService = (id, data) =>
  supabase.from('appointments').update(data).eq('id', id).select().single();

export const cancelAppointmentService = (id) =>
  supabase.from('appointments').update({ status: 'cancelado' }).eq('id', id).select().single();

export const concludeAppointmentService = (id) =>
  supabase.from('appointments').update({ status: 'concluido' }).eq('id', id).select().single();
