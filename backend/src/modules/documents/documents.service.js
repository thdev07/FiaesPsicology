import supabase from '../../db.js';

export async function listByConsulta(consultaId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*, users(nome)')
    .eq('consulta_id', consultaId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyDocuments(userEmail) {
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();
  if (!patient) return [];

  const { data, error } = await supabase
    .from('documents')
    .select('*, users(nome)')
    .eq('patient_id', patient.id)
    .eq('liberado', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createDocument(body, userEmail) {
  const { data: psicologo } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();
  if (!psicologo) throw { status: 403, message: 'Psicólogo não encontrado' };

  const { data, error } = await supabase
    .from('documents')
    .insert({ ...body, psicologo_id: psicologo.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDocument(id, body, userEmail) {
  const { data: psicologo } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();
  if (!psicologo) throw { status: 403, message: 'Psicólogo não encontrado' };

  const { data, error } = await supabase
    .from('documents')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('psicologo_id', psicologo.id)
    .select()
    .single();
  if (error) throw error;
  if (!data) throw { status: 404, message: 'Documento não encontrado' };
  return data;
}

export async function deleteDocument(id, userEmail) {
  const { data: psicologo } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();
  if (!psicologo) throw { status: 403, message: 'Psicólogo não encontrado' };

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('psicologo_id', psicologo.id);
  if (error) throw error;
}
