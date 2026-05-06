-- Adiciona campo de percentual de repasse ao psicólogo (padrão 60%)
ALTER TABLE users ADD COLUMN IF NOT EXISTS percentual_repasse NUMERIC(5,2) DEFAULT 60;
