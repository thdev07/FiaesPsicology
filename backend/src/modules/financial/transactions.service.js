import supabase from '../../db.js';

export const listTransactionsService = () =>
  supabase
    .from('transactions')
    .select('*, appointments(data, hora, patients(nome), users(nome))')
    .order('created_at', { ascending: false });

export const createTransactionService = (data) =>
  supabase.from('transactions').insert(data).select().single();

export const updateTransactionService = (id, data) =>
  supabase.from('transactions').update(data).eq('id', id).select().single();

export async function autoCreateFromAppointmentService(appointmentId) {
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('consulta_id', appointmentId)
    .maybeSingle();

  if (existing) return;

  return supabase.from('transactions').insert({
    consulta_id: appointmentId,
    tipo: 'receita',
    categoria: 'Consulta',
    valor: 0,
    status_pagamento: 'pendente',
  }).select().single();
}

export async function getFinancialSummaryService() {
  const { data, error } = await supabase
    .from('transactions')
    .select('valor, tipo, status_pagamento');
  if (error) throw error;

  const receitas = data
    .filter((t) => t.tipo === 'receita')
    .reduce((s, t) => s + Number(t.valor), 0);
  const despesas = data
    .filter((t) => t.tipo === 'despesa')
    .reduce((s, t) => s + Number(t.valor), 0);

  return { receitas, despesas, saldo: receitas - despesas };
}
