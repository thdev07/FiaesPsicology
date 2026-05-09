import supabase from '../../db.js';

export const listUsersService = () => supabase.from('users').select('*').order('created_at', { ascending: false });

export const listPsychologistsService = () =>
  supabase.from('users').select('id, nome').eq('role', 'psicologo').order('nome');

export const getUserByIdService = (id) => supabase.from('users').select('*').eq('id', id).single();

export async function createUserService({ nome, email, password, role, registro_profissional }) {
  // Cria o usuário no Supabase Auth com role no metadata
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, role },
  });
  if (authError) throw authError;

  const userId = authData.user.id;

  // Insere na tabela users do sistema
  const { data, error } = await supabase.from('users').insert({
    id: userId,
    nome,
    email,
    role,
    registro_profissional: registro_profissional ?? null,
  }).select().single();

  if (error) {
    // Rollback: remove o usuário do Auth se falhar a inserção
    await supabase.auth.admin.deleteUser(userId);
    throw error;
  }

  return { data, error: null };
}

export const updateUserService = (id, data) =>
  supabase.from('users').update(data).eq('id', id).select().single();

export async function deleteUserService(id) {
  // Verifica FK antes de deletar do Auth para evitar estado inconsistente
  const { error: dbError } = await supabase.from('users').delete().eq('id', id);
  if (dbError) throw dbError;

  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) console.error('[deleteUser] Auth delete failed after DB delete:', authError.message);

  return { error: null };
}
