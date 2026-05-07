import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, X } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const EMPTY_FORM = { nome: '', cpf: '', email: '', telefone: '', data_nascimento: '', historico_clinico: '', plano_id: '' };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      setError(err?.error ?? 'Erro ao carregar pacientes.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
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
    setError('');
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, plano_id: form.plano_id || null };
      if (editing) {
        await api.put(`/patients/${editing.id}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      setError(err?.error ?? 'Erro ao salvar paciente.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nome?.toLowerCase().includes(q) ||
      (p.cpf ?? '').includes(search) ||
      (p.email ?? '').toLowerCase().includes(q)
    );
  });

  if (loading) return <div style={{ padding: 32, color: '#6b7280' }}>Carregando...</div>;

  return (
    <motion.div {...pageAnim}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Users size={22} color="#3b82f6" />
          <h1 style={s.title}>Meus Pacientes</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.7rem' }} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.search}
            />
          </div>
          <button onClick={openCreate} style={s.btnPrimary}>
            <Plus size={15} />
            Novo paciente
          </button>
        </div>
      </div>

      {error && <p style={s.error}>{error}</p>}

      <div style={s.tableWrap}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, color: '#9ca3af', textAlign: 'center' }}>Nenhum paciente encontrado.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Nome', 'Email', 'Telefone', 'Convênio', 'Ações'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#111827' }}>{p.nome}</td>
                  <td style={s.td}>{p.email ?? '—'}</td>
                  <td style={s.td}>{p.telefone ?? '—'}</td>
                  <td style={s.td}>{p.insurance_plans?.nome ?? '—'}</td>
                  <td style={s.td}>
                    <button onClick={() => openEdit(p)} style={s.btnEdit}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
              <button onClick={() => setShowModal(false)} style={s.modalClose}><X size={18} /></button>
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
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  search: { padding: '0.5rem 0.75rem 0.5rem 2.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', width: 260, outline: 'none' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#374151' },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' },
  btnSecondary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnEdit: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
