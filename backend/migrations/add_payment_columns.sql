-- Adicionar colunas de pagamento online à tabela transactions
-- Execute no Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT;

-- Índice para busca por payment_id (usado no webhook)
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
