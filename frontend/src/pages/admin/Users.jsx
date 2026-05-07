import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Plus, X } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const EMPTY_FORM = { nome: '', email: '', password: '', role: 'psicologo', registro_profissional: '' };

const ROLE_LABEL = { admin: 'Administrador', psicologo: 'Psicólogo', paciente: 'Paciente' };
const ROLE_COLOR = { admin: '#7c3aed', psicologo: '#0284c7', paciente: '#059669' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ valor_consulta_particular: '' });
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

  function openEdit(user) {
    setEditing(user);
    setEditForm({ valor_consulta_particular: user.valor_consulta_particular ?? '' });
    setShowEditModal(true);
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/users/${editing.id}`, {
        valor_consulta_particular: editForm.valor_consulta_particular ? Number(editForm.valor_consulta_particular) : null,
      });
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setError(err?.error ?? 'Erro ao atualizar usuário.');
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
    <motion.div {...pageAnim}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UserCog size={22} color="#3b82f6" />
          <h1 style={s.title}>Usuários</h1>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setError(''); setShowModal(true); }} style={s.btnPrimary}>
          <Plus size={15} />
          Novo usuário
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
                {['Nome', 'Email', 'Role', 'CRP', 'Valor Consulta', 'Cadastro', 'Ações'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1e293b' }}>{u.nome}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: ROLE_COLOR[u.role] + '20', color: ROLE_COLOR[u.role] }}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td style={s.td}>{u.registro_profissional ?? '—'}</td>
                  <td style={s.td}>
                    {u.valor_consulta_particular != null
                      ? `R$ ${Number(u.valor_consulta_particular).toFixed(2)}`
                      : '—'}
                  </td>
                  <td style={s.td}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {u.role === 'psicologo' && (
                        <button onClick={() => openEdit(u)} style={s.btnEdit}>Editar</button>
                      )}
                      <button onClick={() => handleDelete(u.id)} style={s.btnDelete}>Remover</button>
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
              <h2 style={s.modalTitle}>Novo usuário</h2>
              <button onClick={() => setShowModal(false)} style={s.modalClose}><X size={18} /></button>
            </div>
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
          </motion.div>
        </div>
      )}

      {showEditModal && editing && (
        <div style={s.overlay}>
          <motion.div
            style={s.modal}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Editar — {editing.nome}</h2>
              <button onClick={() => setShowEditModal(false)} style={s.modalClose}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSave} style={s.form}>
              <label style={s.label}>Valor padrão da consulta particular (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.valor_consulta_particular}
                onChange={(e) => setEditForm({ valor_consulta_particular: e.target.value })}
                placeholder="Ex: 150.00"
                style={s.input}
              />
              <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: '0.1rem 0' }}>
                Usado para preencher automaticamente o valor das consultas particulares deste psicólogo.
              </p>
              {error && <p style={s.error}>{error}</p>}
              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowEditModal(false)} style={s.btnSecondary}>Cancelar</button>
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
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' },
  btnSecondary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnEdit: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  btnDelete: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
