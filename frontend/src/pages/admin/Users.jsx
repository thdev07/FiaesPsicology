import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const EMPTY_FORM = { nome: '', email: '', password: '', role: 'psicologo', registro_profissional: '' };

const ROLE_LABEL = { admin: 'Administrador', psicologo: 'Psicólogo', paciente: 'Paciente' };
const ROLE_COLOR = { admin: '#7c3aed', psicologo: '#0284c7', paciente: '#059669' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError(err?.error ?? 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchUsers();
    } catch (err) {
      setError(err?.error ?? err?.message ?? 'Erro ao criar usuário.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remover este usuário? Esta ação é irreversível.')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      setError(err?.error ?? 'Erro ao remover usuário.');
    }
  }

  return (
    <div>
      <div style={s.topbar}>
        <h1 style={s.title}>Usuários</h1>
        <button onClick={() => { setForm(EMPTY_FORM); setError(''); setShowModal(true); }} style={s.btnPrimary}>
          + Novo usuário
        </button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : users.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhum usuário cadastrado.</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Nome', 'Email', 'Role', 'CRP', 'Cadastro', 'Ações'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}><strong>{u.nome}</strong></td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: ROLE_COLOR[u.role] + '20', color: ROLE_COLOR[u.role] }}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td style={s.td}>{u.registro_profissional ?? '—'}</td>
                  <td style={s.td}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={s.td}>
                    <button onClick={() => handleDelete(u.id)} style={s.btnDelete}>Remover</button>
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
            <h2 style={s.modalTitle}>Novo usuário</h2>
            <form onSubmit={handleSave} style={s.form}>
              <label style={s.label}>Nome completo *</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome do profissional"
                style={s.input}
              />

              <label style={s.label}>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                style={s.input}
              />

              <label style={s.label}>Senha *</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                style={s.input}
              />

              <label style={s.label}>Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={s.input}>
                <option value="psicologo">Psicólogo</option>
                <option value="admin">Administrador</option>
              </select>

              {form.role === 'psicologo' && (
                <>
                  <label style={s.label}>Registro profissional (CRP)</label>
                  <input
                    value={form.registro_profissional}
                    onChange={(e) => setForm({ ...form, registro_profissional: e.target.value })}
                    placeholder="Ex: CRP-05/12345"
                    style={s.input}
                  />
                </>
              )}

              {error && <p style={s.error}>{error}</p>}

              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>Cancelar</button>
                <button type="submit" disabled={saving} style={s.btnPrimary}>
                  {saving ? 'Criando...' : 'Criar usuário'}
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
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSecondary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnDelete: { padding: '0.3rem 0.75rem', borderRadius: '4px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '460px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
