import * as transactionsService from './transactions.service.js';

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
    const { data, error } = await transactionsService.updateTransactionService(req.params.id, req.body);
    if (error) throw error;
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
