import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, Clock, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function NovoAgendamento() {
  const navigate = useNavigate();
  const { show: toast } = useToast();
  const [psychologists, setPsychologists] = useState([]);
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({ psicologo_id: '', data: '', hora: '' });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/psychologists').then(setPsychologists).catch(() => {});
    api.get('/patients/me').then(setPatient).catch(() => {});
  }, []);

  // Busca slots disponíveis ao selecionar psicólogo + data
  useEffect(() => {
    if (!form.psicologo_id || !form.data) { setSlots([]); return; }
    setLoadingSlots(true);
    setForm((f) => ({ ...f, hora: '' }));
    api.get(`/appointments/available-slots?psicologoId=${form.psicologo_id}&date=${form.data}`)
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.psicologo_id, form.data]);

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.psicologo_id || !form.data || !form.hora) {
      toast('Preencha todos os campos.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/appointments', {
        psicologo_id: form.psicologo_id,
        paciente_id: patient?.id,
        sala_id: null,
        data: form.data,
        hora: form.hora + ':00',
        tipo: patient?.plano_id ? 'convenio' : 'particular',
        status: 'pendente',
      });
      toast('Agendamento solicitado! Aguarde confirmação da clínica.', 'success');
      navigate('/paciente/agendamentos');
    } catch (err) {
      toast(err?.error ?? err?.message ?? 'Erro ao solicitar agendamento.', 'error');
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
            {loadingSlots && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />}
          </div>

          {!form.psicologo_id || !form.data ? (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Selecione psicólogo e data para ver os horários disponíveis.
            </p>
          ) : loadingSlots ? (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Carregando horários...</p>
          ) : (
            <>
              <div style={s.horarios}>
                {slots.map(({ hora, disponivel }) => {
                  const h = hora.slice(0, 5);
                  const selected = form.hora === h;
                  return (
                    <motion.button
                      key={h}
                      type="button"
                      disabled={!disponivel}
                      onClick={() => disponivel && setForm({ ...form, hora: h })}
                      whileHover={disponivel ? { scale: 1.04 } : {}}
                      whileTap={disponivel ? { scale: 0.97 } : {}}
                      transition={{ duration: 0.12 }}
                      title={!disponivel ? 'Horário ocupado' : undefined}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: '8px',
                        border: selected ? '2px solid #3b82f6' : !disponivel ? '1px solid #f3f4f6' : '1px solid #e2e8f0',
                        background: selected ? '#3b82f6' : !disponivel ? '#f9fafb' : '#fff',
                        color: selected ? '#fff' : !disponivel ? '#d1d5db' : '#475569',
                        fontWeight: selected ? 700 : 500,
                        fontSize: '0.9rem',
                        cursor: disponivel ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                        boxShadow: selected ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
                        fontFamily: 'inherit',
                        position: 'relative',
                      }}
                    >
                      {h}
                      {!disponivel && (
                        <span style={{ position: 'absolute', top: 2, right: 4, fontSize: '0.6rem', color: '#9ca3af' }}>✕</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                Horários com ✕ já estão ocupados.
              </p>
            </>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
