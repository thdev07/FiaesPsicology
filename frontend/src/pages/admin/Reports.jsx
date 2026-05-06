import { useState } from 'react';
import { api } from '../../services/api';

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
    <div>
      <h1 style={s.title}>Relatórios</h1>

      {/* Filtro de período */}
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
          {loading ? 'Gerando...' : 'Gerar relatório'}
        </button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {!data && !loading && (
        <div style={s.emptyBox}>
          <p style={s.emptyText}>Selecione um período e clique em "Gerar relatório".</p>
        </div>
      )}

      {data && (
        <>
          {/* Cards financeiros */}
          <div style={s.cards}>
            <div style={{ ...s.card, borderLeftColor: '#22c55e' }}>
              <p style={s.cardLabel}>Receitas</p>
              <p style={{ ...s.cardValue, color: '#15803d' }}>{fmt(data.financial.receitas)}</p>
            </div>
            <div style={{ ...s.card, borderLeftColor: '#f59e0b' }}>
              <p style={s.cardLabel}>Despesas</p>
              <p style={{ ...s.cardValue, color: '#b45309' }}>{fmt(data.financial.despesas)}</p>
            </div>
            <div style={{ ...s.card, borderLeftColor: data.financial.saldo >= 0 ? '#3b82f6' : '#ef4444' }}>
              <p style={s.cardLabel}>Saldo</p>
              <p style={{ ...s.cardValue, color: data.financial.saldo >= 0 ? '#1d4ed8' : '#dc2626' }}>
                {fmt(data.financial.saldo)}
              </p>
            </div>
            <div style={s.card}>
              <p style={s.cardLabel}>Total de consultas</p>
              <p style={s.cardValue}>{data.appointments.total}</p>
            </div>
            <div style={{ ...s.card, borderLeftColor: '#ef4444' }}>
              <p style={s.cardLabel}>Taxa de cancelamento</p>
              <p style={{ ...s.cardValue, color: '#dc2626' }}>{pct(data.appointments.taxa_cancelamento)}</p>
            </div>
          </div>

          <div style={s.grid}>
            {/* Consultas por status */}
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

            {/* Por psicólogo */}
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

          {/* Por categoria financeira */}
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
    </div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 1.5rem' },
  filterBar: { display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#64748b' },
  dateInput: { padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' },
  btnPrimary: { padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', alignSelf: 'flex-end' },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' },
  emptyBox: { background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '3rem', textAlign: 'center' },
  emptyText: { color: '#64748b', margin: 0, fontWeight: 500 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: '4px solid #3b82f6' },
  cardLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 0.5rem' },
  cardValue: { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' },
  section: { marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#334155' },
  dot: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: '0.5rem' },
};
