-- Armazena o ID do evento no Google Calendar para poder deletar ao cancelar
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;
