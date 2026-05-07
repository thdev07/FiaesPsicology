import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const EMPTY_FORM = { nome: '', codigo: '', valor_consulta: '', taxa_reembolso: '', observacoes: '' };

export default function Convenios() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPlans(); }, []);

  async function fetchPlans() {
    setLoading(true);
    try {
      const data = await api.get('/insurance');
      setPlans(data);
    } catch (err) {
      setError(err?.error ?? 'Erro ao carregar convênios.');
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

  function openEdit(plan) {
    setEditing(plan);
    setForm({
      nome: plan.nome ?? '',
      codigo: plan.codigo ?? '',
      valor_consulta: plan.valor_consulta ?? '',
      taxa_reembolso: plan.taxa_reembolso ?? '',
      observacoes: plan.observacoes ?? '',
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      nome: form.nome,
      codigo: form.codigo || null,
      valor_consulta: form.valor_consulta ? Number(form.valor_consulta) : null,
      taxa_reembolso: form.taxa_reembolso ? Number(form.taxa_reembolso) : null,
      observacoes: form.observacoes || null,
    };
    try {
      if (editing) {
        await api.put(`/insurance/${editing.id}`, payload);
      } else {
        await api.post('/insurance', payload);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      setError(err?.error ?? 'Erro ao salvar convênio.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remover este convênio? Pacientes vinculados perderão a associação.')) return;
    try {
      await api.delete(`/insurance/${id}`);
      fetchPlans();
    } catch (err) {
      setError(err?.error ?? 'Erro ao remover convênio.');
    }
  }

  return (
    <div>
      <div style={s.topbar}>
        <h1 style={s.title}>Convênios</h1>
        <button onClick={openCreate} style={s.btnPrimary}>+ Novo convênio</button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : plans.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhum convênio cadastrado.</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Nome', 'Código', 'Valor consulta', 'Taxa reembolso', 'Observações', 'Ações'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}><strong>{p.nome}</strong></td>
                  <td style={s.td}>{p.codigo ?? '—'}</td>
                  <td style={s.td}>
                    {p.valor_consulta != null
                      ? <span style={s.badgeBlue}>R$ {Number(p.valor_consulta).toFixed(2)}</span>
                      : '—'}
                  </td>
                  <td style={s.td}>
                    {p.taxa_reembolso != null
                      ? <span style={s.badge}>{p.taxa_reembolso}%</span>
                      : '—'}
                  </td>
                  <td style={{ ...s.td, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.observacoes ?? '—'}
                  </td>
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
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editing ? 'Editar convênio' : 'Novo convênio'}</h2>
            <form onSubmit={handleSave} style={s.form}>
              <label style={s.label}>Nome do convênio *</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Unimed, Bradesco Saúde"
                style={s.input}
              />

              <label style={s.label}>Código</label>
              <input
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                placeholder="Ex: UNI-001"
                style={s.input}
              />

              <label style={s.label}>Valor da consulta (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valor_consulta}
                onChange={(e) => setForm({ ...form, valor_consulta: e.target.value })}
                placeholder="Ex: 150.00"
                style={s.input}
              />

              <label style={s.label}>Taxa de reembolso (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.taxa_reembolso}
                onChange={(e) => setForm({ ...form, taxa_reembolso: e.target.value })}
                placeholder="Ex: 70"
                style={s.input}
              />

              <label style={s.label}>Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre o convênio..."
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
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 },
  badgeBlue: { background: '#dbeafe', color: '#1d4ed8', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSecondary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnEdit: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  btnDelete: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '460px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
