import { useEffect, useState } from 'react';
import { api } from '../../services/api';

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PGTO_COLORS = {
  pago:      { background: '#dcfce7', color: '#16a34a' },
  pendente:  { background: '#fef9c3', color: '#ca8a04' },
  cancelado: { background: '#f1f5f9', color: '#64748b' },
};

export default function PatientDocuments() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/financial/my-debts')
      .then((data) => setDebts(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.error ?? 'Erro ao carregar cobranças.'))
      .finally(() => setLoading(false));
  }, []);

  const totalPago = debts.filter((d) => d.status_pagamento === 'pago').reduce((s, d) => s + Number(d.valor), 0);
  const totalPendente = debts.filter((d) => d.status_pagamento === 'pendente').reduce((s, d) => s + Number(d.valor), 0);

  return (
    <div>
      <h1 style={s.title}>Meus documentos</h1>

      {/* Resumo financeiro */}
      <div style={s.cards}>
        <div style={s.card}>
          <p style={s.cardLabel}>Total pago</p>
          <p style={{ ...s.cardValue, color: '#15803d' }}>{fmt(totalPago)}</p>
        </div>
        <div style={{ ...s.card, borderLeftColor: '#f59e0b' }}>
          <p style={s.cardLabel}>Valor em aberto</p>
          <p style={{ ...s.cardValue, color: '#b45309' }}>{fmt(totalPendente)}</p>
        </div>
        <div style={{ ...s.card, borderLeftColor: '#64748b' }}>
          <p style={s.cardLabel}>Total de cobranças</p>
          <p style={s.cardValue}>{debts.length}</p>
        </div>
      </div>

      {/* Extrato de cobranças */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Extrato de cobranças</h2>
        {error && <p style={s.error}>{error}</p>}
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Carregando...</p>
        ) : debts.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Nenhuma cobrança encontrada.</p>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Data', 'Psicólogo', 'Descrição', 'Valor', 'Status'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.id} style={s.tr}>
                    <td style={s.td}>
                      {d.appointments?.data
                        ? new Date(`${d.appointments.data}T00:00:00`).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td style={s.td}>{d.appointments?.users?.nome ?? '—'}</td>
                    <td style={s.td}>{d.categoria}</td>
                    <td style={s.td}><strong>{fmt(d.valor)}</strong></td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...(PGTO_COLORS[d.status_pagamento] ?? {}) }}>
                        {d.status_pagamento}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documentos médicos — placeholder para fase futura */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Documentos médicos</h2>
        <div style={s.emptyBox}>
          <p style={s.emptyText}>Laudos e recibos liberados pelo psicólogo aparecerão aqui.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Funcionalidade disponível em breve.</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 1.5rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: '4px solid #3b82f6' },
  cardLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 0.5rem' },
  cardValue: { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#334155' },
  badge: { padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 },
  emptyBox: { background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '2rem', textAlign: 'center' },
  emptyText: { color: '#475569', margin: '0 0 0.5rem', fontWeight: 500 },
};
