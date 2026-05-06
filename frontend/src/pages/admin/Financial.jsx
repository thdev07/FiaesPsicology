import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';

const EMPTY_FORM = { tipo: 'receita', categoria: '', valor: '', status_pagamento: 'pendente', consulta_id: '' };

const TIPO_COLORS = {
  receita: { background: '#dcfce7', color: '#16a34a' },
  despesa: { background: '#fee2e2', color: '#dc2626' },
};

const PGTO_COLORS = {
  pago: { background: '#dcfce7', color: '#16a34a' },
  pendente: { background: '#fef9c3', color: '#ca8a04' },
  cancelado: { background: '#f1f5f9', color: '#64748b' },
};

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Financial() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, sum] = await Promise.all([
        api.get('/financial'),
        api.get('/financial/summary'),
      ]);
      setTransactions(Array.isArray(txs) ? txs : []);
      setSummary(sum ?? { receitas: 0, despesas: 0, saldo: 0 });
    } catch (err) {
      setError(err?.error ?? 'Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  function openEdit(tx) {
    setEditing(tx);
    setForm({
      tipo: tx.tipo,
      categoria: tx.categoria ?? '',
      valor: tx.valor,
      status_pagamento: tx.status_pagamento,
      consulta_id: tx.consulta_id ?? '',
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        valor: Number(form.valor),
        consulta_id: form.consulta_id || null,
      };
      if (editing) {
        await api.put(`/financial/${editing.id}`, payload);
      } else {
        await api.post('/financial', payload);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setError(err?.error ?? err?.message ?? 'Erro ao salvar transação.');
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkPaid(tx) {
    try {
      await api.put(`/financial/${tx.id}`, { status_pagamento: 'pago' });
      fetchAll();
    } catch (err) {
      alert(err?.error ?? 'Erro ao marcar como pago.');
    }
  }

  const filtered = filterTipo ? transactions.filter((t) => t.tipo === filterTipo) : transactions;

  return (
    <div>
      <div style={s.topbar}>
        <h1 style={s.title}>Financeiro</h1>
        <button onClick={openCreate} style={s.btnPrimary}>+ Nova transação</button>
      </div>

      <div style={s.summaryGrid}>
        <div style={{ ...s.summaryCard, borderTop: '4px solid #16a34a' }}>
          <p style={s.summaryLabel}>Receitas</p>
          <p style={{ ...s.summaryValue, color: '#16a34a' }}>{fmt(summary.receitas)}</p>
        </div>
        <div style={{ ...s.summaryCard, borderTop: '4px solid #dc2626' }}>
          <p style={s.summaryLabel}>Despesas</p>
          <p style={{ ...s.summaryValue, color: '#dc2626' }}>{fmt(summary.despesas)}</p>
        </div>
        <div style={{ ...s.summaryCard, borderTop: `4px solid ${summary.saldo >= 0 ? '#3b82f6' : '#f59e0b'}` }}>
          <p style={s.summaryLabel}>Saldo</p>
          <p style={{ ...s.summaryValue, color: summary.saldo >= 0 ? '#3b82f6' : '#f59e0b' }}>{fmt(summary.saldo)}</p>
        </div>
      </div>

      <div style={s.filters}>
        {[['', 'Todos'], ['receita', 'Receitas'], ['despesa', 'Despesas']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterTipo(val)}
            style={{
              ...s.filterBtn,
              background: filterTipo === val ? '#3b82f6' : '#fff',
              color: filterTipo === val ? '#fff' : '#64748b',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p style={s.error}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhuma transação registrada.</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Data', 'Tipo', 'Categoria', 'Consulta', 'Valor', 'Pagamento', 'Ações'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} style={s.tr}>
                  <td style={s.td}>{new Date(tx.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...TIPO_COLORS[tx.tipo] }}>{tx.tipo}</span>
                  </td>
                  <td style={s.td}>{tx.categoria ?? '—'}</td>
                  <td style={s.td}>
                    {tx.appointments
                      ? `${tx.appointments.patients?.nome ?? '?'} — ${new Date(tx.appointments.data + 'T00:00:00').toLocaleDateString('pt-BR')}`
                      : '—'}
                  </td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{fmt(tx.valor)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...PGTO_COLORS[tx.status_pagamento] }}>
                      {tx.status_pagamento}
                    </span>
                  </td>
                  <td style={{ ...s.td, display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(tx)} style={s.btnSmall}>Editar</button>
                    {tx.status_pagamento === 'pendente' && (
                      <button
                        onClick={() => handleMarkPaid(tx)}
                        style={{ ...s.btnSmall, background: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' }}
                      >
                        Pago
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
            <h2 style={s.modalTitle}>{editing ? 'Editar transação' : 'Nova transação'}</h2>
            <form onSubmit={handleSave} style={s.form}>
              <label style={s.label}>Tipo *</label>
              <select required value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={s.input}>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>

              <label style={s.label}>Categoria</label>
              <input
                type="text"
                placeholder="Ex: Consulta, Aluguel, Material..."
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                style={s.input}
              />

              <label style={s.label}>Valor (R$) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                style={s.input}
              />

              <label style={s.label}>Status de pagamento</label>
              <select value={form.status_pagamento} onChange={(e) => setForm({ ...form, status_pagamento: e.target.value })} style={s.input}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>

              {error && <p style={s.error}>{error}</p>}

              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>Cancelar</button>
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
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  summaryCard: { background: '#fff', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  summaryLabel: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.5rem' },
  summaryValue: { fontSize: '1.75rem', fontWeight: 800, margin: 0, lineHeight: 1 },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  filterBtn: { padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSecondary: { padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnSmall: { padding: '0.25rem 0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  modalTitle: { margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
