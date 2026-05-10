import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, X } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const EMPTY_FORM = { nome: '', cpf: '', email: '', telefone: '', data_nascimento: '', historico_clinico: '', plano_id: '', password: '' };

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function Patients() {
  const mobile = useIsMobile();
  const [patients, setPatients] = useState([]);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatients();
    api.get('/insurance').then(setInsurancePlans).catch(() => {});
  }, []);

  async function fetchPatients() {
    setLoading(true);
    try {
      const data = await api.get('/patients');
      setPatients(data);
    } catch (err) {
      setError(err?.error ?? err?.message ?? 'Erro ao carregar pacientes. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(patient) {
    setEditing(patient);
    setForm({
      nome: patient.nome ?? '',
      cpf: patient.cpf ?? '',
      email: patient.email ?? '',
      telefone: patient.telefone ?? '',
      data_nascimento: patient.data_nascimento ?? '',
      historico_clinico: patient.historico_clinico ?? '',
      plano_id: patient.plano_id ?? '',
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { password, ...rest } = form;
      const payload = { ...rest, plano_id: form.plano_id || null };
      if (editing) {
        await api.put(`/patients/${editing.id}`, payload);
      } else {
        await api.post('/patients', { ...payload, password: password || undefined });
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      setError(err?.error ?? err?.message ?? 'Erro ao salvar paciente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remover este paciente?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch {
      setError('Erro ao remover paciente.');
    }
  }

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.cpf ?? '').includes(search) ||
      (p.email ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <motion.div {...pageAnim}>
      <div style={{ ...s.topbar, flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Users size={22} color="#3b82f6" />
          <h1 style={s.title}>Pacientes</h1>
        </div>
        <button onClick={openCreate} style={s.btnPrimary}>
          <Plus size={15} />
          Novo paciente
        </button>
      </div>

      <div style={s.searchWrap}>
        <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
        <input
          placeholder="Buscar por nome, email ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={s.searchInput}
        />
      </div>

      {error && <p style={s.error}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhum paciente encontrado.</p>
      ) : mobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 10, padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '3px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{p.nome}</p>
                {p.insurance_plans?.nome && (
                  <span style={{ fontSize: '0.72rem', background: '#ede9fe', color: '#5b21b6', borderRadius: 4, padding: '0.15rem 0.5rem', fontWeight: 600, flexShrink: 0 }}>
                    {p.insurance_plans.nome}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.15rem', marginBottom: '0.6rem' }}>
                {p.email && <span>{p.email}</span>}
                {p.telefone && <span>{p.telefone}</span>}
                {p.cpf && <span>CPF: {p.cpf}</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => openEdit(p)} style={s.btnEdit}>Editar</button>
                <button onClick={() => handleDelete(p.id)} style={s.btnDelete}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Nome', 'Email', 'Telefone', 'CPF', 'Convênio', 'Ações'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1e293b' }}>{p.nome}</td>
                  <td style={s.td}>{p.email ?? 'Não informado'}</td>
                  <td style={s.td}>{p.telefone ?? 'Não informado'}</td>
                  <td style={s.td}>{p.cpf ?? 'Não informado'}</td>
                  <td style={s.td}>{p.insurance_plans?.nome ?? 'Particular'}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEdit(p)} style={s.btnEdit}>Editar</button>
                      <button onClick={() => handleDelete(p.id)} style={s.btnDelete}>Remover</button>
                    </div>
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
              <h2 style={s.modalTitle}>{editing ? 'Editar paciente' : 'Novo paciente'}</h2>
              <button onClick={() => setShowModal(false)} style={s.modalClose}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} style={s.form}>
              <label style={s.label}>Nome completo *</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                style={s.input}
              />

              <label style={s.label}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                style={s.input}
              />

              <label style={s.label}>Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(00) 90000-0000"
                style={s.input}
              />

              <label style={s.label}>CPF</label>
              <input
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                placeholder="000.000.000-00"
                style={s.input}
              />

              <label style={s.label}>Data de nascimento</label>
              <input
                type="date"
                value={form.data_nascimento}
                onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                style={s.input}
              />

              <label style={s.label}>Plano de convênio</label>
              <select
                value={form.plano_id}
                onChange={(e) => setForm({ ...form, plano_id: e.target.value })}
                style={s.input}
              >
                <option value="">Particular (sem convênio)</option>
                {insurancePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {p.coparticipacao_percentual}% copart.
                  </option>
                ))}
              </select>

              {!editing && (
                <>
                  <label style={s.label}>Senha de acesso ao portal</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Deixe em branco para não criar acesso"
                    style={s.input}
                  />
                  <p style={s.hint}>Se preenchido, o paciente poderá fazer login com este e-mail e senha.</p>
                </>
              )}

              <label style={s.label}>Histórico clínico</label>
              <textarea
                value={form.historico_clinico}
                onChange={(e) => setForm({ ...form, historico_clinico: e.target.value })}
                rows={3}
                style={{ ...s.input, resize: 'vertical' }}
              />

              {error && <p style={s.error}>{error}</p>}

              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={s.btnPrimary}>
                  {saving ? 'Salvando...' : 'Salvar'}
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
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.4rem 0.75rem', marginBottom: '1rem' },
  searchInput: { border: 'none', outline: 'none', fontSize: '0.875rem', color: '#334155', width: '100%', background: 'transparent' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' },
  btnSecondary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnEdit: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  btnDelete: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' },
  modal: { background: '#fff', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
  hint: { fontSize: '0.775rem', color: '#94a3b8', margin: '0.1rem 0 0.2rem' },
};
