-- ============================================================
-- Migration 002 — Adicionar status 'concluido' em appointments
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Remove a constraint CHECK existente
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Adiciona nova constraint com 'concluido' incluído
ALTER TABLE appointments
  ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('confirmado', 'pendente', 'cancelado', 'concluido'));
