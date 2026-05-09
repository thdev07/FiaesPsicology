import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, X, TrendingUp, TrendingDown, Wallet, Search } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { SkeletonTable } from '../../components/ui/Skeleton';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const EMPTY_FORM = { tipo: 'receita', categoria: '', valor: '', status_pagamento: 'pendente', consulta_id: '' };

const TIPO_COLORS = {
  receita: { background: '#dcfce7', color: '#166534' },
  despesa: { background: '#fee2e2', color: '#991b1b' },
};

const PGTO_COLORS = {
  pago:      { background: '#dcfce7', color: '#166534' },
  pendente:  { background: '#fef9c3', color: '#854d0e' },
  cancelado: { background: '#f1f5f9', color: '#64748b' },
};

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Financial() {
  const { show: toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterTipo, setFilterTipo] = useState('');
  const [search, setSearch] = useState('');

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
      toast(err?.error ?? 'Erro ao carregar dados financeiros.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
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
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, valor: Number(form.valor), consulta_id: form.consulta_id || null };
      if (editing) {
        await api.put(`/financial/${editing.id}`, payload);
        toast('Transação atualizada.', 'success');
      } else {
        await api.post('/financial', payload);
        toast('Transação criada.', 'success');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast(err?.error ?? err?.message ?? 'Erro ao salvar transação.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkPaid(tx) {
    try {
      await api.put(`/financial/${tx.id}`, { status_pagamento: 'pago' });
      toast('Marcado como pago.', 'success');
      fetchAll();
    } catch (err) {
      toast(err?.error ?? 'Erro ao marcar como pago.', 'error');
    }
  }

  const q = search.toLowerCase();
  const filtered = transactions.filter((t) => {
    const matchTipo = !filterTipo || t.tipo === filterTipo;
    const matchSearch = !q ||
      t.categoria?.toLowerCase().includes(q) ||
      t.appointments?.patients?.nome?.toLowerCase().includes(q);
    return matchTipo && matchSearch;
  });

  return (
    <motion.div {...pageAnim}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <DollarSign size={22} color="#3b82f6" />
          <h1 style={s.title}>Financeiro</h1>
        </div>
        <button onClick={openCreate} style={s.btnPrimary}>
          <Plus size={15} />
          Nova transação
        </button>
      </div>

      {/* Summary cards */}
      <div style={s.summaryGrid}>
        {[
          { label: 'Receitas', value: fmt(summary.receitas), color: '#16a34a', Icon: TrendingUp },
          { label: 'Despesas', value: fmt(summary.despesas), color: '#dc2626', Icon: TrendingDown },
          { label: 'Saldo', value: fmt(summary.saldo), color: summary.saldo >= 0 ? '#3b82f6' : '#f59e0b', Icon: Wallet },
        ].map(({ label, value, color, Icon }) => (
          <motion.div key={label} whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{ ...s.summaryCard, borderTop: `3px solid ${color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Icon size={16} color={color} />
              <p style={s.summaryLabel}>{label}</p>
            </div>
            <p style={{ ...s.summaryValue, color }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={s.searchWrap}>
          <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            style={s.searchInput}
            placeholder="Buscar por categoria ou paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[['', 'Todos'], ['receita', 'Receitas'], ['despesa', 'Despesas']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterTipo(val)}
              style={{
                ...s.filterBtn,
                background: filterTipo === val ? '#3b82f6' : '#fff',
                color: filterTipo === val ? '#fff' : '#64748b',
                borderColor: filterTipo === val ? '#3b82f6' : '#e2e8f0',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>
          <DollarSign size={36} color="#e2e8f0" />
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 0' }}>Nenhuma transação encontrada.</p>
        </div>
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
                  <td style={{ ...s.td, fontWeight: 600, color: tx.tipo === 'receita' ? '#16a34a' : '#dc2626' }}>
                    {fmt(tx.valor)}
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...PGTO_COLORS[tx.status_pagamento] }}>
                      {tx.status_pagamento}
                    </span>
                  </td>
                  <td style={{ ...s.td }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(tx)} style={s.btnSmall}>Editar</button>
                      {tx.status_pagamento === 'pendente' && (
                        <button
                          onClick={() => handleMarkPaid(tx)}
                          style={{ ...s.btnSmall, background: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' }}
                        >
                          Pago
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

      {showModal && (
        <div style={overlay}>
          <motion.div
            style={modalBox}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editing ? 'Editar transação' : 'Nova transação'}</h2>
              <button onClick={() => setShowModal(false)} style={s.modalClose}><X size={18} /></button>
            </div>
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

              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>Cancelar</button>
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

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem',
};
const modalBox = {
  background: '#fff', borderRadius: '12px', padding: '1.75rem',
  width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
};

const s = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' },
  summaryCard: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  summaryLabel: { fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 },
  summaryValue: { fontSize: '1.6rem', fontWeight: 800, margin: 0, lineHeight: 1 },
  searchWrap: { flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.4rem 0.75rem' },
  searchInput: { border: 'none', outline: 'none', fontSize: '0.875rem', color: '#334155', width: '100%', background: 'transparent' },
  filterBtn: { padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 500, transition: 'all 0.15s', fontFamily: 'inherit' },
  emptyState: { padding: '3rem 1rem', textAlign: 'center', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'inherit' },
  btnSecondary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit' },
  btnSmall: { padding: '0.25rem 0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155', fontFamily: 'inherit' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
