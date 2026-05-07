import supabase from '../../db.js';

export const listPatientsService = () =>
  supabase.from('patients').select('*, insurance_plans(nome)');

export const getPatientByIdService = (id) =>
  supabase.from('patients').select('*, insurance_plans(nome)').eq('id', id).single();

export const getPatientByEmailService = (email) =>
  supabase.from('patients').select('*, insurance_plans(nome)').eq('email', email).maybeSingle();

export async function createPatientService({ password, ...patientData }) {
  if (password && patientData.email) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: patientData.email,
      password,
      email_confirm: true,
      user_metadata: { nome: patientData.nome, role: 'paciente' },
    });
    if (authError) throw authError;
  }

  return supabase.from('patients').insert(patientData).select().single();
}

export const updatePatientService = (id, data) =>
  supabase.from('patients').update(data).eq('id', id).select().single();

export const deletePatientService = (id) =>
  supabase.from('patients').delete().eq('id', id);
