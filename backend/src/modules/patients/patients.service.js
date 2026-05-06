import supabase from '../../db.js';

export const listPatientsService = () =>
  supabase.from('patients').select('*, insurance_plans(nome)');

export const getPatientByIdService = (id) =>
  supabase.from('patients').select('*, insurance_plans(nome)').eq('id', id).single();

export const getPatientByEmailService = (email) =>
  supabase.from('patients').select('*, insurance_plans(nome)').eq('email', email).maybeSingle();

export const createPatientService = (data) =>
  supabase.from('patients').insert(data).select().single();

export const updatePatientService = (id, data) =>
  supabase.from('patients').update(data).eq('id', id).select().single();

export const deletePatientService = (id) =>
  supabase.from('patients').delete().eq('id', id);
