import { useEffect, useState } from 'react';
import { api } from '../../services/api';

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
  confirmado: { background: '#dcfce7', color: '#16a34a' },
  pendente: { background: '#fef9c3', color: '#ca8a04' },
  cancelado: { background: '#fee2e2', color: '#dc2626' },
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

  return (
    <div>
      <div style={s.topbar}>
        <h1 style={s.title}>Agendamentos</h1>
        <button onClick={() => { setForm(EMPTY_FORM); setError(''); setShowModal(true); }} style={s.btnPrimary}>
          + Novo agendamento
        </button>
      </div>

      <div style={s.filters}>
        {['', 'confirmado', 'pendente', 'cancelado'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              ...s.filterBtn,
              background: filterStatus === st ? '#3b82f6' : '#fff',
              color: filterStatus === st ? '#fff' : '#64748b',
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
                    <span style={{ ...s.badge, ...STATUS_COLORS[a.status] }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    {a.status !== 'cancelado' && (
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
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Novo agendamento</h2>
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
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  filterBtn: { padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSecondary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnDelete: { padding: '0.3rem 0.75rem', borderRadius: '4px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
