import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, Clock } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const HORARIOS = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

export default function NovoAgendamento() {
  const navigate = useNavigate();
  const [psychologists, setPsychologists] = useState([]);
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({ psicologo_id: '', data: '', hora: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/psychologists').then(setPsychologists).catch(() => {});
    api.get('/patients/me').then(setPatient).catch(() => {});
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.psicologo_id || !form.data || !form.hora) {
      setError('Preencha todos os campos.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/appointments', {
        psicologo_id: form.psicologo_id,
        paciente_id: patient?.id,
        sala_id: null,
        data: form.data,
        hora: form.hora,
        tipo: patient?.plano_id ? 'convenio' : 'particular',
        status: 'pendente',
      });
      navigate('/paciente/agendamentos');
    } catch (err) {
      setError(err?.error ?? err?.message ?? 'Erro ao solicitar agendamento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div {...pageAnim} style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
        <CalendarPlus size={22} color="#3b82f6" />
        <h1 style={s.title}>Solicitar agendamento</h1>
      </div>
      <p style={s.sub}>Escolha o psicólogo, data e horário. A clínica confirmará sua consulta em breve.</p>

      <form onSubmit={handleSubmit} style={s.form}>
        <div style={s.fieldGroup}>
          <label style={s.label}>Psicólogo *</label>
          <select
            required
            value={form.psicologo_id}
            onChange={(e) => setForm({ ...form, psicologo_id: e.target.value })}
            style={s.input}
          >
            <option value="">Selecione um psicólogo...</option>
            {psychologists.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Data *</label>
          <input
            type="date"
            required
            min={today}
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            style={s.input}
          />
        </div>

        <div style={s.fieldGroup}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Clock size={14} color="#64748b" />
            <label style={{ ...s.label, margin: 0 }}>Horário *</label>
          </div>
          <div style={s.horarios}>
            {HORARIOS.map((h) => {
              const selected = form.hora === h;
              return (
                <motion.button
                  key={h}
                  type="button"
                  onClick={() => setForm({ ...form, hora: h })}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: selected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    background: selected ? '#3b82f6' : '#fff',
                    color: selected ? '#fff' : '#475569',
                    fontWeight: selected ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: selected ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {h}
                </motion.button>
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.6rem 0.85rem' }}>
            <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={s.actions}>
          <button type="button" onClick={() => navigate('/paciente/agendamentos')} style={s.btnSecondary}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} style={s.btnPrimary}>
            {saving ? 'Enviando...' : 'Solicitar agendamento'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

const s = {
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  sub: { fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff', padding: '1.75rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  horarios: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  btnSecondary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' },
};
