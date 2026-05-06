import supabase from '../../db.js';
import { encrypt, decrypt } from '../../utils/crypto.js';

const SELECT_FIELDS = `
  *,
  appointments(
    data,
    hora,
    status,
    patients(nome, cpf),
    users(nome)
  )
`;

function decryptRecord(record) {
  if (!record) return null;
  return {
    ...record,
    evolucao: decrypt(record.evolucao),
    anamnese: decrypt(record.anamnese),
  };
}

export async function getRecordByConsultaService(consultaId) {
  const { data, error } = await supabase
    .from('medical_records')
    .select(SELECT_FIELDS)
    .eq('consulta_id', consultaId)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data: decryptRecord(data), error: null };
}

export async function createRecordService(payload) {
  const { data, error } = await supabase
    .from('medical_records')
    .insert({
      consulta_id: payload.consulta_id,
      evolucao: encrypt(payload.evolucao ?? null),
      anamnese: encrypt(payload.anamnese ?? null),
      arquivos_anexos: payload.arquivos_anexos ?? [],
      versao: 1,
    })
    .select(SELECT_FIELDS)
    .single();

  if (error) return { data: null, error };
  return { data: decryptRecord(data), error: null };
}

export async function updateRecordService(id, payload) {
  const { data: existing, error: fetchError } = await supabase
    .from('medical_records')
    .select('versao')
    .eq('id', id)
    .single();

  if (fetchError) return { data: null, error: fetchError };

  const { data, error } = await supabase
    .from('medical_records')
    .update({
      evolucao: encrypt(payload.evolucao ?? null),
      anamnese: encrypt(payload.anamnese ?? null),
      versao: existing.versao + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(SELECT_FIELDS)
    .single();

  if (error) return { data: null, error };
  return { data: decryptRecord(data), error: null };
}
