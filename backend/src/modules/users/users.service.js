import supabase from '../../db.js';

export const listUsersService = () => supabase.from('users').select('*');

export const getUserByIdService = (id) => supabase.from('users').select('*').eq('id', id).single();

export const updateUserService = (id, data) =>
  supabase.from('users').update(data).eq('id', id).select().single();

export const deleteUserService = (id) => supabase.from('users').delete().eq('id', id);
