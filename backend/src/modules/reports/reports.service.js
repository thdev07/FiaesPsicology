import supabase from '../../db.js';

export async function getReportsService({ start, end }) {
  const startDate = start ?? '2000-01-01';
  const endDate = end ?? '2099-12-31';

  const [{ data: transactions }, { data: appointments }] = await Promise.all([
    supabase
      .from('transactions')
      .select('valor, tipo, categoria, status_pagamento')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`),
    supabase
      .from('appointments')
      .select('status, users(nome)')
      .gte('data', startDate)
      .lte('data', endDate),
  ]);

  const txList = transactions ?? [];
  const apptList = appointments ?? [];

  // Financeiro
  const receitas = txList.filter((t) => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor), 0);
  const despesas = txList.filter((t) => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor), 0);

  const porCategoria = {};
  txList.forEach((t) => {
    if (!t.categoria) return;
    if (!porCategoria[t.categoria]) porCategoria[t.categoria] = { receita: 0, despesa: 0 };
    porCategoria[t.categoria][t.tipo] += Number(t.valor);
  });
  const categorias = Object.entries(porCategoria)
    .map(([categoria, vals]) => ({ categoria, ...vals }))
    .sort((a, b) => (b.receita + b.despesa) - (a.receita + a.despesa));

  // Agendamentos
  const porStatus = { confirmado: 0, pendente: 0, cancelado: 0, concluido: 0 };
  const porPsicologo = {};
  apptList.forEach((a) => {
    if (porStatus[a.status] !== undefined) porStatus[a.status]++;
    const nome = a.users?.nome ?? 'Sem psicólogo';
    if (!porPsicologo[nome]) porPsicologo[nome] = { total: 0, concluido: 0, cancelado: 0 };
    porPsicologo[nome].total++;
    if (a.status === 'concluido') porPsicologo[nome].concluido++;
    if (a.status === 'cancelado') porPsicologo[nome].cancelado++;
  });
  const psicologos = Object.entries(porPsicologo)
    .map(([nome, vals]) => ({ nome, ...vals }))
    .sort((a, b) => b.total - a.total);

  const total = apptList.length;
  const taxaCancelamento = total > 0 ? ((porStatus.cancelado / total) * 100).toFixed(1) : '0.0';

  return {
    financial: { receitas, despesas, saldo: receitas - despesas, categorias },
    appointments: { total, por_status: porStatus, por_psicologo: psicologos, taxa_cancelamento: taxaCancelamento },
  };
}
