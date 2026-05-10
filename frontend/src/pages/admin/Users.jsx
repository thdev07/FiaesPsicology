import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Plus, X, Search } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const EMPTY_FORM = { nome: '', email: '', password: '', role: 'psicologo', registro_profissional: '' };
const EMPTY_EDIT = { nome: '', valor_consulta_particular: '', percentual_repasse: '' };

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

const ROLE_LABEL = { admin: 'Administrador', psicologo: 'Psicólogo', paciente: 'Paciente' };
const ROLE_COLOR = { admin: '#7c3aed', psicologo: '#0284c7', paciente: '#059669' };
const ROLES = ['', 'psicologo', 'admin', 'paciente'];

export default function Users() {
  const mobile = useIsMobile();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

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
    setEditForm({
      nome: user.nome ?? '',
      valor_consulta_particular: user.valor_consulta_particular ?? '',
      percentual_repasse: user.percentual_repasse ?? '',
    });
    setError('');
    setShowEditModal(true);
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { nome: editForm.nome };
      if (editing.role === 'psicologo') {
        payload.valor_consulta_particular = editForm.valor_consulta_particular ? Number(editForm.valor_consulta_particular) : null;
        payload.percentual_repasse = editForm.percentual_repasse ? Number(editForm.percentual_repasse) : null;
      }
      await api.put(`/users/${editing.id}`, payload);
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

  const q = search.toLowerCase();
  const filtered = users.filter((u) => {
    const matchRole = !filterRole || u.role === filterRole;
    const matchSearch = !q || u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  return (
    <motion.div {...pageAnim}>
      <div style={{ ...s.topbar, flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UserCog size={22} color="#3b82f6" />
          <h1 style={s.title}>Usuários</h1>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setError(''); setShowModal(true); }} style={s.btnPrimary}>
          <Plus size={15} />
          Novo usuário
        </button>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            style={s.searchInput}
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              style={{ ...s.filterBtn, background: filterRole === r ? '#3b82f6' : '#fff', color: filterRole === r ? '#fff' : '#64748b', borderColor: filterRole === r ? '#3b82f6' : '#e2e8f0' }}
            >
              {r === '' ? 'Todos' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhum usuário encontrado.</p>
      ) : mobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((u) => {
            const roleColor = ROLE_COLOR[u.role] ?? '#64748b';
            return (
              <div key={u.id} style={{ background: '#fff', borderRadius: 10, padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `3px solid ${roleColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{u.nome}</p>
                  <span style={{ ...s.badge, background: roleColor + '20', color: roleColor, flexShrink: 0 }}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.8rem', color: '#64748b' }}>{u.email}</p>
                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.2rem 0.75rem', marginBottom: '0.5rem' }}>
                  {u.registro_profissional && <span>CRP: {u.registro_profissional}</span>}
                  {u.valor_consulta_particular != null && <span>Consulta: R$ {Number(u.valor_consulta_particular).toFixed(2)}</span>}
                  {u.percentual_repasse != null && <span>Repasse: {u.percentual_repasse}%</span>}
                  <span>Desde {new Date(u.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => openEdit(u)} style={s.btnEdit}>Editar</button>
                  <button onClick={() => handleDelete(u.id)} style={s.btnDelete}>Remover</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Nome', 'Email', 'Perfil', 'CRP', 'Valor consulta', 'Repasse %', 'Cadastro', 'Ações'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={s.tr}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1e293b' }}>{u.nome}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: ROLE_COLOR[u.role] + '20', color: ROLE_COLOR[u.role] }}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td style={s.td}>{u.registro_profissional ?? 'Não informado'}</td>
                  <td style={s.td}>
                    {u.valor_consulta_particular != null ? `R$ ${Number(u.valor_consulta_particular).toFixed(2)}` : 'Não definido'}
                  </td>
                  <td style={s.td}>
                    {u.percentual_repasse != null ? `${u.percentual_repasse}%` : 'Não definido'}
                  </td>
                  <td style={s.td}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEdit(u)} style={s.btnEdit}>Editar</button>
                      <button onClick={() => handleDelete(u.id)} style={s.btnDelete}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar */}
      {showModal && (
        <div style={s.overlay}>
          <motion.div style={s.modal} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Novo usuário</h2>
              <button onClick={() => setShowModal(false)} style={s.modalClose}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={s.form}>
              <label style={s.label}>Nome completo *</label>
              <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do profissional" style={s.input} />

              <label style={s.label}>Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" style={s.input} />

              <label style={s.label}>Senha *</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" style={s.input} />

              <label style={s.label}>Perfil *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={s.input}>
                <option value="psicologo">Psicólogo</option>
                <option value="admin">Administrador</option>
              </select>

              {form.role === 'psicologo' && (
                <>
                  <label style={s.label}>Registro profissional (CRP)</label>
                  <input value={form.registro_profissional} onChange={(e) => setForm({ ...form, registro_profissional: e.target.value })} placeholder="Ex: CRP-05/12345" style={s.input} />
                </>
              )}

              {error && <p style={s.error}>{error}</p>}

              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>Cancelar</button>
                <button type="submit" disabled={saving} style={s.btnPrimary}>{saving ? 'Criando...' : 'Criar usuário'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal editar */}
      {showEditModal && editing && (
        <div style={s.overlay}>
          <motion.div style={s.modal} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Editar: {editing.nome}</h2>
              <button onClick={() => setShowEditModal(false)} style={s.modalClose}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSave} style={s.form}>
              <label style={s.label}>Nome completo *</label>
              <input required value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} style={s.input} />

              {editing.role === 'psicologo' && (
                <>
                  <label style={s.label}>Valor padrão da consulta particular (R$)</label>
                  <input type="number" min="0" step="0.01" value={editForm.valor_consulta_particular} onChange={(e) => setEditForm({ ...editForm, valor_consulta_particular: e.target.value })} placeholder="Ex: 150.00" style={s.input} />

                  <label style={s.label}>Percentual de repasse (%)</label>
                  <input type="number" min="0" max="100" step="1" value={editForm.percentual_repasse} onChange={(e) => setEditForm({ ...editForm, percentual_repasse: e.target.value })} placeholder="Ex: 60" style={s.input} />
                  <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: '0.1rem 0' }}>
                    Percentual do valor da consulta repassado ao psicólogo.
                  </p>
                </>
              )}

              {error && <p style={s.error}>{error}</p>}
              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowEditModal(false)} style={s.btnSecondary}>Cancelar</button>
                <button type="submit" disabled={saving} style={s.btnPrimary}>{saving ? 'Salvando...' : 'Salvar'}</button>
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
  toolbar: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.4rem 0.75rem', flex: 1, minWidth: 200 },
  searchInput: { border: 'none', outline: 'none', fontSize: '0.875rem', color: '#334155', width: '100%', background: 'transparent' },
  filterBtn: { padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  btnSecondary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnEdit: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  btnDelete: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' },
  modal: { background: '#fff', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
