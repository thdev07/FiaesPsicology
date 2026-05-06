import supabase from '../../db.js';

export async function signInService(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutService(token) {
  const { error } = await supabase.auth.admin.signOut(token);
  if (error) throw error;
}
