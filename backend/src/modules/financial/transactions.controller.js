import * as transactionsService from './transactions.service.js';
import { sendPaymentConfirmationEmail } from '../../services/email.service.js';
import { sendPaymentConfirmationWhatsApp } from '../../services/whatsapp.service.js';
import supabase from '../../db.js';

export async function getMyDebts(req, res, next) {
  try {
    const data = await transactionsService.getMyDebtsService(req.user.email);
    res.json(data);
  } catch (err) { next(err); }
}

export async function listTransactions(req, res, next) {
  try {
    const { data, error } = await transactionsService.listTransactionsService();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function createTransaction(req, res, next) {
  try {
    const { data, error } = await transactionsService.createTransactionService(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateTransaction(req, res, next) {
  try {
    const { data } = await transactionsService.updateTransactionService(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(data);
  } catch (err) { next(err); }
}

export async function getFinancialSummary(req, res, next) {
  try {
    const summary = await transactionsService.getFinancialSummaryService();
    res.json(summary);
  } catch (err) { next(err); }
}

export async function createPayment(req, res, next) {
  try {
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ error: 'transactionId é obrigatório' });
    const data = await transactionsService.createPaymentService(transactionId, req.user.email);
    res.json(data);
  } catch (err) { next(err); }
}

export async function paymentWebhook(req, res) {
  // Responde 200 imediatamente para o Mercado Pago não retentar
  res.sendStatus(200);

  try {
    const transaction = await transactionsService.handleWebhookService(req.body);
    if (!transaction?.consulta_id) return;

    // Envia e-mail de confirmação de pagamento (fire and forget)
    const { data: appt } = await supabase
      .from('appointments')
      .select('data, hora, patients(nome, email, telefone), users(nome), transactions(valor)')
      .eq('id', transaction.consulta_id)
      .single();

    if (appt?.patients?.email) {
      sendPaymentConfirmationEmail({
        to: appt.patients.email,
        patientName: appt.patients.nome ?? 'Paciente',
        psychologistName: appt.users?.nome ?? '—',
        date: appt.data,
        time: appt.hora,
        amount: transaction.valor,
      }).catch((err) => console.error('[Email] Erro pagamento:', err.message));
    }

    if (appt?.patients?.telefone) {
      sendPaymentConfirmationWhatsApp({
        to: appt.patients.telefone,
        patientName: appt.patients.nome ?? 'Paciente',
        psychologistName: appt.users?.nome ?? '—',
        date: appt.data,
        time: appt.hora,
        amount: transaction.valor,
      }).catch((err) => console.error('[WhatsApp] Erro pagamento:', err.message));
    }
  } catch (err) {
    console.error('[Webhook MP] Erro:', err.message);
  }
}

export async function getMyRepasse(req, res, next) {
  try {
    const data = await transactionsService.getMyRepasseService(req.user.email);
    res.json(data);
  } catch (err) { next(err); }
}

export async function getPaymentStatus(req, res, next) {
  try {
    const data = await transactionsService.getPaymentStatusService(req.params.transactionId, req.user.email);
    res.json(data);
  } catch (err) { next(err); }
}
