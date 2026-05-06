-- Vincula a ficha clínica do paciente ao seu usuário de autenticação
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS patients_user_id_idx ON patients(user_id);
