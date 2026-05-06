import supabase from '../../db.js';

// TODO: implementar criptografia AES-256 nos campos evolucao e anamnese (LGPD)
export const getRecordByConsultaService = (consultaId) =>
  supabase.from('medical_records').select('*').eq('consulta_id', consultaId).single();

export const createRecordService = (data) =>
  supabase.from('medical_records').insert(data).select().single();

export const updateRecordService = (id, data) =>
  supabase.from('medical_records').update(data).eq('id', id).select().single();
