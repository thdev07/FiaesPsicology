import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const EMPTY_FORM = { nome: '', cpf: '', email: '', telefone: '', data_nascimento: '', historico_clinico: '', plano_id: '' };

export default function Patients() {
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
    <div>
      <div style={s.topbar}>
        <h1 style={s.title}>Pacientes</h1>
        <button onClick={openCreate} style={s.btnPrimary}>+ Novo paciente</button>
      </div>

      <input
        placeholder="Buscar por nome ou CPF..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={s.search}
      />

      {error && <p style={s.error}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhum paciente encontrado.</p>
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
                  <td style={s.td}>{p.nome}</td>
                  <td style={s.td}>{p.email ?? '—'}</td>
                  <td style={s.td}>{p.telefone ?? '—'}</td>
                  <td style={s.td}>{p.cpf ?? '—'}</td>
                  <td style={s.td}>{p.insurance_plans?.nome ?? '—'}</td>
                  <td style={s.td}>
                    <button onClick={() => openEdit(p)} style={s.btnEdit}>Editar</button>
                    <button onClick={() => handleDelete(p.id)} style={s.btnDelete}>Remover</button>
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
            <h2 style={s.modalTitle}>{editing ? 'Editar paciente' : 'Novo paciente'}</h2>
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
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  search: { padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', width: '100%', maxWidth: 320, marginBottom: '1rem', fontSize: '0.9rem' },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#334155' },
  btnPrimary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSecondary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnEdit: { marginRight: '0.5rem', padding: '0.3rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  btnDelete: { padding: '0.3rem 0.75rem', borderRadius: '4px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
