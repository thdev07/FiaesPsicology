import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, X, Search, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { SkeletonTable } from '../../components/ui/Skeleton';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

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
  pendente:   { background: '#fef9c3', color: '#854d0e' },
  cancelado:  { background: '#fee2e2', color: '#991b1b' },
  concluido:  { background: '#ede9fe', color: '#5b21b6' },
};

function ConfirmModal({ title, message, confirmLabel, danger = false, onConfirm, onCancel }) {
  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <motion.div
        style={modalBox}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{title}</h3>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={s.btnGhost}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{ ...s.btnPrimary, background: danger ? '#dc2626' : '#3b82f6' }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Appointments() {
  const { show: toast } = useToast();
  const mobile = useIsMobile();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

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
      toast(err?.error ?? 'Erro ao carregar agendamentos.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/appointments', form);
      setShowModal(false);
      fetchAppointments();
      toast('Agendamento criado com sucesso.', 'success');
    } catch (err) {
      toast(err?.error ?? err?.message ?? 'Erro ao criar agendamento.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirm() {
    if (!confirmTarget) return;
    try {
      await api.put(`/appointments/${confirmTarget.id}`, { status: 'confirmado' });
      toast('Agendamento confirmado! Cobrança gerada para o paciente.', 'success');
      fetchAppointments();
    } catch (err) {
      toast(err?.error ?? 'Erro ao confirmar agendamento.', 'error');
    } finally {
      setConfirmTarget(null);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    try {
      await api.patch(`/appointments/${cancelTarget.id}/cancel`);
      toast('Agendamento cancelado.', 'info');
      fetchAppointments();
    } catch (err) {
      toast(err?.error ?? 'Erro ao cancelar agendamento.', 'error');
    } finally {
      setCancelTarget(null);
    }
  }

  const q = search.toLowerCase();
  const filtered = appointments.filter((a) => {
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchSearch = !q ||
      a.patients?.nome?.toLowerCase().includes(q) ||
      a.users?.nome?.toLowerCase().includes(q) ||
      a.rooms?.nome?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const filterOptions = ['', 'confirmado', 'pendente', 'cancelado', 'concluido'];
  const pendingCount = appointments.filter((a) => a.status === 'pendente').length;

  return (
    <motion.div {...pageAnim}>
      <div style={{ ...s.topbar, flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CalendarDays size={22} color="#3b82f6" />
          <div>
            <h1 style={s.title}>Agendamentos</h1>
            {pendingCount > 0 && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#b45309' }}>
                {pendingCount} aguardando confirmação
              </p>
            )}
          </div>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }} style={s.btnPrimary}>
          <Plus size={15} />
          Novo agendamento
        </button>
      </div>

      <div style={s.searchWrap}>
        <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
        <input
          style={s.searchInput}
          placeholder="Buscar por paciente, psicólogo ou sala..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            {st === 'pendente' && pendingCount > 0 && (
              <span style={{
                marginLeft: '0.35rem',
                background: filterStatus === 'pendente' ? 'rgba(255,255,255,0.3)' : '#fef3c7',
                color: filterStatus === 'pendente' ? '#fff' : '#92400e',
                borderRadius: '999px',
                padding: '0 0.4rem',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={mobile ? 3 : 8} />
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>
          <CalendarDays size={36} color="#e2e8f0" />
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 0' }}>Nenhum agendamento encontrado.</p>
        </div>
      ) : mobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((a) => {
            const dataFmt = new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR');
            const sc = STATUS_COLORS[a.status] ?? {};
            return (
              <div
                key={a.id}
                style={{
                  background: a.status === 'pendente' ? '#fffbeb' : '#fff',
                  borderRadius: 10,
                  padding: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  borderLeft: `3px solid ${sc.color ?? '#e2e8f0'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{dataFmt} às {a.hora?.slice(0, 5) ?? '--'}</p>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>{a.patients?.nome ?? 'Paciente não informado'}</p>
                  </div>
                  <span style={{ ...s.badge, ...sc, flexShrink: 0 }}>{a.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem', marginBottom: '0.6rem' }}>
                  {a.users?.nome && <span>Psicólogo: {a.users.nome}</span>}
                  {a.rooms?.nome && <span>Sala: {a.rooms.nome}</span>}
                  <span style={{ background: '#f1f5f9', borderRadius: 4, padding: '0.1rem 0.4rem', color: '#475569', fontSize: '0.75rem' }}>
                    {a.tipo === 'convenio' ? 'Convênio' : 'Particular'}
                  </span>
                </div>
                {(a.status === 'pendente' || (a.status !== 'cancelado' && a.status !== 'concluido')) && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {a.status === 'pendente' && (
                      <button onClick={() => setConfirmTarget(a)} style={s.btnConfirm}>
                        <CheckCircle2 size={12} /> Confirmar
                      </button>
                    )}
                    {a.status !== 'cancelado' && a.status !== 'concluido' && (
                      <button onClick={() => setCancelTarget(a)} style={s.btnCancel}>
                        <XCircle size={12} /> Cancelar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
                <tr key={a.id} style={{ ...s.tr, background: a.status === 'pendente' ? '#fffbeb' : 'transparent' }}>
                  <td style={s.td}>{new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td style={s.td}>{a.hora?.slice(0, 5)}</td>
                  <td style={{ ...s.td, fontWeight: 500 }}>{a.patients?.nome ?? 'Não informado'}</td>
                  <td style={s.td}>{a.users?.nome ?? 'Não informado'}</td>
                  <td style={s.td}>{a.rooms?.nome ?? 'Não informada'}</td>
                  <td style={s.td}>{a.tipo === 'convenio' ? 'Convênio' : 'Particular'}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(STATUS_COLORS[a.status] ?? {}) }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ ...s.td }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {a.status === 'pendente' && (
                        <button onClick={() => setConfirmTarget(a)} style={s.btnConfirm}>
                          <CheckCircle2 size={12} />
                          Confirmar
                        </button>
                      )}
                      {a.status !== 'cancelado' && a.status !== 'concluido' && (
                        <button onClick={() => setCancelTarget(a)} style={s.btnCancel}>
                          <XCircle size={12} />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal novo agendamento */}
      {showModal && (
        <div style={overlay}>
          <motion.div
            style={{ ...modalBox, maxWidth: 500 }}
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

              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnGhost}>Cancelar</button>
                <button type="submit" disabled={saving} style={s.btnPrimary}>
                  {saving ? 'Salvando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {confirmTarget && (
        <ConfirmModal
          title="Confirmar agendamento"
          message={`Confirmar a consulta de ${confirmTarget.patients?.nome ?? 'paciente'} em ${new Date(confirmTarget.data + 'T00:00:00').toLocaleDateString('pt-BR')} às ${confirmTarget.hora?.slice(0, 5)}? Isso irá gerar uma cobrança para o paciente.`}
          confirmLabel="Confirmar"
          onConfirm={handleConfirm}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancelar agendamento"
          message={`Deseja cancelar a consulta de ${cancelTarget.patients?.nome ?? 'paciente'} em ${new Date(cancelTarget.data + 'T00:00:00').toLocaleDateString('pt-BR')} às ${cancelTarget.hora?.slice(0, 5)}?`}
          confirmLabel="Sim, cancelar"
          danger
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </motion.div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 50, padding: '1rem',
};
const modalBox = {
  background: '#fff', borderRadius: '12px', padding: '1.75rem',
  width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  maxHeight: '90vh', overflowY: 'auto',
};

const s = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.4rem 0.75rem', marginBottom: '0.75rem' },
  searchInput: { border: 'none', outline: 'none', fontSize: '0.875rem', color: '#334155', width: '100%', background: 'transparent' },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
  filterBtn: { padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 500, transition: 'all 0.15s', display: 'flex', alignItems: 'center' },
  emptyState: { padding: '3rem 1rem', textAlign: 'center', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  btnGhost: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnConfirm: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' },
  btnCancel: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: '0.78rem', color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
