import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Search } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pct(v) {
  return `${Number(v).toFixed(1)}%`;
}

const STATUS_LABELS = { confirmado: 'Confirmado', pendente: 'Pendente', cancelado: 'Cancelado', concluido: 'Concluído' };
const STATUS_COLORS = {
  confirmado: '#16a34a', pendente: '#ca8a04', cancelado: '#dc2626', concluido: '#5b21b6',
};

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 7) + '-01';

  const [start, setStart] = useState(firstOfMonth);
  const [end, setEnd] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchReport() {
    setLoading(true);
    setError('');
    try {
      const result = await api.get(`/reports?start=${start}&end=${end}`);
      setData(result);
    } catch (err) {
      setError(err?.error ?? 'Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div {...pageAnim}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <BarChart2 size={22} color="#3b82f6" />
        <h1 style={s.title}>Relatórios</h1>
      </div>

      <div style={s.filterBar}>
        <div style={s.filterGroup}>
          <label style={s.label}>De</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={s.dateInput} />
        </div>
        <div style={s.filterGroup}>
          <label style={s.label}>Até</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={s.dateInput} />
        </div>
        <button onClick={fetchReport} disabled={loading} style={s.btnPrimary}>
          <Search size={15} />
          {loading ? 'Gerando...' : 'Gerar relatório'}
        </button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {!data && !loading && (
        <div style={s.emptyBox}>
          <BarChart2 size={32} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
          <p style={s.emptyText}>Selecione um período e clique em "Gerar relatório".</p>
        </div>
      )}

      {data && (
        <>
          <div style={s.cards}>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{ ...s.card, borderLeft: '4px solid #22c55e' }}>
              <p style={s.cardLabel}>Receitas</p>
              <p style={{ ...s.cardValue, color: '#15803d' }}>{fmt(data.financial.receitas)}</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{ ...s.card, borderLeft: '4px solid #f59e0b' }}>
              <p style={s.cardLabel}>Despesas</p>
              <p style={{ ...s.cardValue, color: '#b45309' }}>{fmt(data.financial.despesas)}</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{ ...s.card, borderLeft: `4px solid ${data.financial.saldo >= 0 ? '#3b82f6' : '#ef4444'}` }}>
              <p style={s.cardLabel}>Saldo</p>
              <p style={{ ...s.cardValue, color: data.financial.saldo >= 0 ? '#1d4ed8' : '#dc2626' }}>
                {fmt(data.financial.saldo)}
              </p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={s.card}>
              <p style={s.cardLabel}>Total de consultas</p>
              <p style={s.cardValue}>{data.appointments.total}</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{ ...s.card, borderLeft: '4px solid #ef4444' }}>
              <p style={s.cardLabel}>Taxa de cancelamento</p>
              <p style={{ ...s.cardValue, color: '#dc2626' }}>{pct(data.appointments.taxa_cancelamento)}</p>
            </motion.div>
          </div>

          <div style={s.grid}>
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Consultas por status</h2>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Status', 'Quantidade', 'Proporção'].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.appointments.por_status).map(([status, qty]) => (
                      <tr key={status} style={s.tr}>
                        <td style={s.td}>
                          <span style={{ ...s.dot, background: STATUS_COLORS[status] }} />
                          {STATUS_LABELS[status] ?? status}
                        </td>
                        <td style={s.td}>{qty}</td>
                        <td style={s.td}>
                          {data.appointments.total > 0
                            ? pct((qty / data.appointments.total) * 100)
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Por psicólogo</h2>
              {data.appointments.por_psicologo.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Nenhum dado disponível.</p>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {['Psicólogo', 'Total', 'Concluídas', 'Canceladas'].map((h) => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.appointments.por_psicologo.map((p) => (
                        <tr key={p.nome} style={s.tr}>
                          <td style={{ ...s.td, fontWeight: 500 }}>{p.nome}</td>
                          <td style={s.td}>{p.total}</td>
                          <td style={{ ...s.td, color: '#15803d' }}>{p.concluido}</td>
                          <td style={{ ...s.td, color: '#dc2626' }}>{p.cancelado}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {data.financial.categorias.length > 0 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Receitas por categoria</h2>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Categoria', 'Receita', 'Despesa'].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.financial.categorias.map((c) => (
                      <tr key={c.categoria} style={s.tr}>
                        <td style={s.td}>{c.categoria}</td>
                        <td style={{ ...s.td, color: '#15803d' }}>{fmt(c.receita)}</td>
                        <td style={{ ...s.td, color: '#b45309' }}>{fmt(c.despesa)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  filterBar: { display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', background: '#fff', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.775rem', fontWeight: 600, color: '#64748b' },
  dateInput: { padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  emptyBox: { background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyText: { color: '#64748b', margin: 0, fontWeight: 500 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #3b82f6', cursor: 'default' },
  cardLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 0.5rem' },
  cardValue: { fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' },
  section: { marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  dot: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: '0.5rem' },
};
