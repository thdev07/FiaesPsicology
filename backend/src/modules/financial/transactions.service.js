import supabase from '../../db.js';
import { createMercadoPagoPayment, getMercadoPagoPaymentStatus } from '../../services/mercadopago.service.js';

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

  // Busca dados do agendamento para categoria e valor
  const { data: appt } = await supabase
    .from('appointments')
    .select('tipo, psicologo_id, users(valor_consulta_particular), patients(plano_id, insurance_plans(nome, coparticipacao_percentual, valor_consulta))')
    .eq('id', appointmentId)
    .single();

  let categoria = 'Consulta Particular';
  let valor = 0;

  if (appt?.tipo === 'convenio') {
    const plano = appt.patients?.insurance_plans;
    categoria = plano
      ? `Consulta Convênio - ${plano.nome} (${plano.coparticipacao_percentual}% copart.)`
      : 'Consulta Convênio';
    valor = Number(plano?.valor_consulta ?? 0);
  } else {
    valor = Number(appt?.users?.valor_consulta_particular ?? 0);
  }

  const { data: transaction, error } = await supabase.from('transactions').insert({
    consulta_id: appointmentId,
    tipo: 'receita',
    categoria,
    valor,
    status_pagamento: 'pendente',
  }).select().single();

  if (!error && valor > 0) {
    await _upsertRepasse(appointmentId, valor);
  }

  return { data: transaction, error };
}

export async function createPaymentService(transactionId, userEmail) {
  // Verifica se a transação pertence ao paciente
  const { data: patient } = await supabase
    .from('patients')
    .select('id, nome, email')
    .eq('email', userEmail)
    .maybeSingle();

  if (!patient) throw { status: 403, message: 'Paciente não encontrado' };

  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*, appointments(data, hora, paciente_id, users(nome))')
    .eq('id', transactionId)
    .eq('tipo', 'receita')
    .single();

  if (error || !transaction) throw { status: 404, message: 'Transação não encontrada' };
  if (transaction.appointments?.paciente_id !== patient.id) throw { status: 403, message: 'Acesso negado' };
  if (transaction.status_pagamento === 'pago') throw { status: 400, message: 'Esta transação já foi paga' };

  const description = transaction.categoria ?? 'Consulta FiaesPsychology';
  const amount = Number(transaction.valor);
  if (amount <= 0) throw { status: 400, message: 'Valor inválido para pagamento' };

  const mpData = await createMercadoPagoPayment({
    transactionId,
    amount,
    description,
    patientEmail: patient.email,
    patientName: patient.nome,
  });

  // Salva o payment_id e URL na transação para referência futura
  await supabase
    .from('transactions')
    .update({
      payment_id: mpData.pixPaymentId,
      payment_url: mpData.checkout_url,
    })
    .eq('id', transactionId);

  return mpData;
}

export async function handleWebhookService(body) {
  // MP envia { type: 'payment', data: { id: '...' } }
  const paymentId = body?.data?.id;
  if (!body?.type === 'payment' || !paymentId) return;

  const status = await getMercadoPagoPaymentStatus(paymentId);
  if (status !== 'approved') return;

  // Encontra transação pelo payment_id
  const { data: transaction } = await supabase
    .from('transactions')
    .select('id, consulta_id')
    .eq('payment_id', String(paymentId))
    .maybeSingle();

  if (!transaction || transaction.status_pagamento === 'pago') return;

  await supabase
    .from('transactions')
    .update({ status_pagamento: 'pago' })
    .eq('id', transaction.id);

  return transaction;
}

export async function getPaymentStatusService(transactionId, userEmail) {
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();

  if (!patient) throw { status: 403, message: 'Paciente não encontrado' };

  const { data: transaction } = await supabase
    .from('transactions')
    .select('status_pagamento, payment_id, appointments(paciente_id)')
    .eq('id', transactionId)
    .single();

  if (!transaction) throw { status: 404, message: 'Transação não encontrada' };
  if (transaction.appointments?.paciente_id !== patient.id) throw { status: 403, message: 'Acesso negado' };

  return { status_pagamento: transaction.status_pagamento };
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
