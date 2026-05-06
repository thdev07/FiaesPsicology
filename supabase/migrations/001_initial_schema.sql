-- ============================================================
-- Schema inicial - Sistema de Gestão Psicológica
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Tabela de perfis de usuário (estende o auth.users do Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'psicologo', 'paciente')),
  registro_profissional TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planos de convênio
CREATE TABLE insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  coparticipacao_percentual NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pacientes
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  data_nascimento DATE,
  historico_clinico TEXT,
  plano_id UUID REFERENCES insurance_plans(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salas
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  recursos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agendamentos
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  hora TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
  tipo TEXT NOT NULL CHECK (tipo IN ('particular', 'convenio')),
  sala_id UUID REFERENCES rooms(id),
  paciente_id UUID REFERENCES patients(id),
  psicologo_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prontuários (dados sensíveis - criptografar na aplicação)
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  evolucao TEXT,
  anamnese TEXT,
  arquivos_anexos TEXT[],
  versao INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transações financeiras
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valor NUMERIC(10,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT,
  consulta_id UUID REFERENCES appointments(id),
  status_pagamento TEXT DEFAULT 'pendente' CHECK (status_pagamento IN ('pendente', 'pago', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Admin tem acesso total
CREATE POLICY "admin_all" ON users FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Psicólogo vê apenas seus agendamentos
CREATE POLICY "psicologo_appointments" ON appointments FOR SELECT USING (
  psicologo_id = auth.uid() OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Psicólogo vê apenas prontuários de seus pacientes
CREATE POLICY "psicologo_records" ON medical_records FOR ALL USING (
  (SELECT psicologo_id FROM appointments WHERE id = consulta_id) = auth.uid() OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Apenas admin vê transações
CREATE POLICY "admin_transactions" ON transactions FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);
