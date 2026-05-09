import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, X } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const EMPTY_FORM = {
  paciente_id: '',
  psicologo_id: '',
  sala_id: '',
  data: '',
  hora: '',
  tipo: 'particular',
  status: 'pendente',
};

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#166534' },
  pendente: { background: '#fef9c3', color: '#854d0e' },
  cancelado: { background: '#fee2e2', color: '#991b1b' },
  concluido: { background: '#ede9fe', color: '#5b21b6' },
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    Promise.all([
      fetchAppointments(),
      api.get('/patients').then(setPatients).catch(() => {}),
      api.get('/users').then((d) => setPsychologists(d.filter((u) => u.role === 'psicologo'))).catch(() => {}),
      api.get('/rooms').then(setRooms).catch(() => {}),
    ]);
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const data = await api.get('/appointments');
      setAppointments(data);
    } catch (err) {
      setError(err?.error ?? 'Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/appointments', form);
      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      setError(err?.error ?? err?.message ?? 'Erro ao criar agendamento.');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirm(id) {
    if (!confirm('Confirmar este agendamento? Isso irá gerar a cobrança para o paciente.')) return;
    try {
      await api.put(`/appointments/${id}`, { status: 'confirmado' });
      fetchAppointments();
    } catch (err) {
      setError(err?.error ?? 'Erro ao confirmar agendamento.');
    }
  }

  async function handleCancel(id) {
    if (!confirm('Cancelar este agendamento?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (err) {
      setError(err?.error ?? 'Erro ao cancelar agendamento.');
    }
  }

  const filtered = filterStatus
    ? appointments.filter((a) => a.status === filterStatus)
    : appointments;

  const filterOptions = ['', 'confirmado', 'pendente', 'cancelado', 'concluido'];

  return (
    <motion.div {...pageAnim}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CalendarDays size={22} color="#3b82f6" />
          <h1 style={s.title}>Agendamentos</h1>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setError(''); setShowModal(true); }} style={s.btnPrimary}>
          <Plus size={15} />
          Novo agendamento
        </button>
      </div>

      <div style={s.filters}>
        {filterOptions.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              ...s.filterBtn,
              background: filterStatus === st ? '#3b82f6' : '#fff',
              color: filterStatus === st ? '#fff' : '#64748b',
              borderColor: filterStatus === st ? '#3b82f6' : '#e2e8f0',
            }}
          >
            {st === '' ? 'Todos' : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {error && <p style={s.error}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhum agendamento encontrado.</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Data', 'Hora', 'Paciente', 'Psicólogo', 'Sala', 'Tipo', 'Status', 'Ações'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={s.tr}>
                  <td style={s.td}>{new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td style={s.td}>{a.hora?.slice(0, 5)}</td>
                  <td style={s.td}>{a.patients?.nome ?? '—'}</td>
                  <td style={s.td}>{a.users?.nome ?? '—'}</td>
                  <td style={s.td}>{a.rooms?.nome ?? '—'}</td>
                  <td style={s.td}>{a.tipo}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(STATUS_COLORS[a.status] ?? {}) }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ ...s.td, display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {a.status === 'pendente' && (
                      <button onClick={() => handleConfirm(a.id)} style={s.btnConfirm}>
                        Confirmar
                      </button>
                    )}
                    {a.status !== 'cancelado' && a.status !== 'concluido' && (
                      <button onClick={() => handleCancel(a.id)} style={s.btnDelete}>
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={s.overlay}>
          <motion.div
            style={s.modal}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Novo agendamento</h2>
              <button onClick={() => setShowModal(false)} style={s.modalClose}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={s.form}>
              <label style={s.label}>Paciente *</label>
              <select required value={form.paciente_id} onChange={(e) => setForm({ ...form, paciente_id: e.target.value })} style={s.input}>
                <option value="">Selecione...</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              <label style={s.label}>Psicólogo *</label>
              <select required value={form.psicologo_id} onChange={(e) => setForm({ ...form, psicologo_id: e.target.value })} style={s.input}>
                <option value="">Selecione...</option>
                {psychologists.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              <label style={s.label}>Sala *</label>
              <select required value={form.sala_id} onChange={(e) => setForm({ ...form, sala_id: e.target.value })} style={s.input}>
                <option value="">Selecione...</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={s.label}>Data *</label>
                  <input type="date" required value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Hora *</label>
                  <input type="time" required value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={s.input} />
                </div>
              </div>

              <label style={s.label}>Tipo *</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={s.input}>
                <option value="particular">Particular</option>
                <option value="convenio">Convênio</option>
              </select>

              {error && <p style={s.error}>{error}</p>}

              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>Cancelar</button>
                <button type="submit" disabled={saving} style={s.btnPrimary}>
                  {saving ? 'Salvando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

const s = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  filterBtn: { padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 500, transition: 'all 0.15s' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' },
  btnSecondary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnConfirm: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 },
  btnDelete: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '500px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
