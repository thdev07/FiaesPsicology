ALTER TABLE insurance_plans ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE insurance_plans ADD COLUMN IF NOT EXISTS taxa_reembolso NUMERIC(5,2);
ALTER TABLE insurance_plans ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE insurance_plans ADD COLUMN IF NOT EXISTS valor_consulta NUMERIC(10,2);
