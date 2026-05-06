import supabase from '../../db.js';

export const listTransactionsService = () =>
  supabase
    .from('transactions')
    .select('*, appointments(data, hora, patients(nome), users(nome))')
    .order('created_at', { ascending: false });

export const createTransactionService = (data) =>
  supabase.from('transactions').insert(data).select().single();

export async function updateTransactionService(id, data) {
  const { data: updated, error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!updated) return { data: null };

  // Cria/atualiza repasse automaticamente ao definir valor de consulta
  const valor = Number(data.valor ?? updated.valor);
  if (updated.consulta_id && updated.tipo === 'receita' && valor > 0) {
    await _upsertRepasse(updated.consulta_id, valor);
  }

  return { data: updated };
}

async function _upsertRepasse(consultaId, valorReceita) {
  const { data: appt } = await supabase
    .from('appointments')
    .select('psicologo_id, users(percentual_repasse)')
    .eq('id', consultaId)
    .single();

  if (!appt?.psicologo_id) return;

  const percentual = Number(appt.users?.percentual_repasse ?? 60);
  const valorRepasse = Number(((valorReceita * percentual) / 100).toFixed(2));

  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('consulta_id', consultaId)
    .eq('tipo', 'despesa')
    .eq('categoria', 'Repasse Psicólogo')
    .maybeSingle();

  if (existing) {
    await supabase
      .from('transactions')
      .update({ valor: valorRepasse })
      .eq('id', existing.id);
  } else {
    await supabase.from('transactions').insert({
      consulta_id: consultaId,
      tipo: 'despesa',
      categoria: 'Repasse Psicólogo',
      valor: valorRepasse,
      status_pagamento: 'pendente',
    });
  }
}

export async function autoCreateFromAppointmentService(appointmentId) {
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('consulta_id', appointmentId)
    .eq('tipo', 'receita')
    .maybeSingle();

  if (existing) return;

  // Busca dados do agendamento para definir categoria com coparticipação
  const { data: appt } = await supabase
    .from('appointments')
    .select('tipo, patients(plano_id, insurance_plans(nome, coparticipacao_percentual))')
    .eq('id', appointmentId)
    .single();

  let categoria = 'Consulta Particular';
  if (appt?.tipo === 'convenio') {
    const plano = appt.patients?.insurance_plans;
    categoria = plano
      ? `Consulta Convênio - ${plano.nome} (${plano.coparticipacao_percentual}% copart.)`
      : 'Consulta Convênio';
  }

  return supabase.from('transactions').insert({
    consulta_id: appointmentId,
    tipo: 'receita',
    categoria,
    valor: 0,
    status_pagamento: 'pendente',
  }).select().single();
}

export async function getMyDebtsService(userEmail) {
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();

  if (!patient) return [];

  const { data: appts } = await supabase
    .from('appointments')
    .select('id')
    .eq('paciente_id', patient.id);

  if (!appts?.length) return [];

  const apptIds = appts.map((a) => a.id);

  const { data, error } = await supabase
    .from('transactions')
    .select('*, appointments(data, hora, users(nome))')
    .eq('tipo', 'receita')
    .in('consulta_id', apptIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
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
