import supabase from '../../db.js';

export const listInsurancePlansService = () => supabase.from('insurance_plans').select('*');

export const createInsurancePlanService = (data) =>
  supabase.from('insurance_plans').insert(data).select().single();

export const updateInsurancePlanService = (id, data) =>
  supabase.from('insurance_plans').update(data).eq('id', id).select().single();
