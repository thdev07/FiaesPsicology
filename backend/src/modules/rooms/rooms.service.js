import supabase from '../../db.js';

export const listRoomsService = () => supabase.from('rooms').select('*');

export const getRoomByIdService = (id) =>
  supabase.from('rooms').select('*').eq('id', id).single();

export const createRoomService = (data) =>
  supabase.from('rooms').insert(data).select().single();

export const updateRoomService = (id, data) =>
  supabase.from('rooms').update(data).eq('id', id).select().single();

export const deleteRoomService = (id) => supabase.from('rooms').delete().eq('id', id);
