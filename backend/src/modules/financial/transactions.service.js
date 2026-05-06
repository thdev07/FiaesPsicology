import supabase from '../../db.js';

export const listTransactionsService = () =>
  supabase.from('transactions').select('*, appointments(data, hora)').order('created_at', { ascending: false });

export const createTransactionService = (data) =>
  supabase.from('transactions').insert(data).select().single();

// Calcula repasse: clínica recebe % definida, psicólogo recebe o restante
export async function getFinancialSummaryService() {
  const { data, error } = await supabase
    .from('transactions')
    .select('valor, tipo, status_pagamento');
  if (error) throw error;

  const receitas = data.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
  const despesas = data.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

  return { receitas, despesas, saldo: receitas - despesas };
}
