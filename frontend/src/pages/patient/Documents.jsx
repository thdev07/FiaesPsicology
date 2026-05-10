import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, TrendingUp, AlertCircle, FileStack, Download, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { generateReceipt } from '../../utils/generateReceipt';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const PGTO_COLORS = {
  pago:      { background: '#dcfce7', color: '#166534' },
  pendente:  { background: '#fef9c3', color: '#854d0e' },
  cancelado: { background: '#f1f5f9', color: '#64748b' },
};

export default function PatientDocuments() {
  const [debts, setDebts] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/financial/my-debts').catch(() => []),
      api.get('/patients/me').catch(() => null),
    ]).then(([data, me]) => {
      setDebts(Array.isArray(data) ? data : []);
      setPatientName(me?.nome ?? '');
    }).catch((err) => setError(err?.error ?? 'Erro ao carregar dados.'))
      .finally(() => setLoading(false));
  }, []);

  const paid = debts.filter((d) => d.status_pagamento === 'pago');
  const totalPago = paid.reduce((sum, d) => sum + Number(d.valor), 0);
  const totalPendente = debts
    .filter((d) => d.status_pagamento === 'pendente')
    .reduce((sum, d) => sum + Number(d.valor), 0);

  return (
    <motion.div {...pageAnim}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <Receipt size={22} color="#3b82f6" />
        <h1 style={s.title}>Meus documentos</h1>
      </div>

      <div style={s.cards}>
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{ ...s.card, borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={14} color="#16a34a" />
            <p style={s.cardLabel}>Total pago</p>
          </div>
          <p style={{ ...s.cardValue, color: '#15803d' }}>{fmt(totalPago)}</p>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{ ...s.card, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={14} color="#f59e0b" />
            <p style={s.cardLabel}>Valor em aberto</p>
          </div>
          <p style={{ ...s.cardValue, color: '#b45309' }}>{fmt(totalPendente)}</p>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={{ ...s.card, borderLeft: '4px solid #64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <FileStack size={14} color="#64748b" />
            <p style={s.cardLabel}>Total de cobranças</p>
          </div>
          <p style={s.cardValue}>{debts.length}</p>
        </motion.div>
      </div>

      {/* Extrato de cobranças */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Extrato de cobranças</h2>
        {error && <p style={s.error}>{error}</p>}
        {loading ? (
          <SkeletonTable rows={4} cols={6} />
        ) : debts.length === 0 ? (
          <div style={s.emptyBox}>
            <FileStack size={28} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
            <p style={s.emptyText}>Nenhuma cobrança encontrada.</p>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Data', 'Psicólogo', 'Descrição', 'Valor', 'Status', 'Recibo'].map((h) => (
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
                    <td style={s.td}>
                      {d.status_pagamento === 'pago' ? (
                        <button
                          onClick={() => generateReceipt(d, patientName)}
                          style={s.receiptBtn}
                          title="Baixar recibo"
                        >
                          <Download size={13} />
                          Recibo
                        </button>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recibos disponíveis */}
      {!loading && paid.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Recibos disponíveis</h2>
          <div style={s.receiptGrid}>
            {paid.map((d) => {
              const dataConsulta = d.appointments?.data
                ? new Date(`${d.appointments.data}T00:00:00`).toLocaleDateString('pt-BR')
                : '—';
              return (
                <motion.div
                  key={d.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  style={s.receiptCard}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={s.receiptIcon}>
                      <FileText size={18} color="#3b82f6" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={s.receiptCardTitle}>{d.categoria ?? 'Consulta'}</p>
                      <p style={s.receiptCardMeta}>{dataConsulta} · {d.appointments?.users?.nome ?? '—'}</p>
                      <p style={{ ...s.receiptCardMeta, color: '#16a34a', fontWeight: 700 }}>{fmt(d.valor)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => generateReceipt(d, patientName)}
                    style={s.receiptCardBtn}
                  >
                    <Download size={14} />
                    Baixar recibo
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Documentos médicos (laudos) */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Documentos médicos</h2>
        <div style={s.emptyBox}>
          <Receipt size={28} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
          <p style={s.emptyText}>Laudos e atestados liberados pelo psicólogo aparecerão aqui.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Em breve disponível.</p>
        </div>
      </div>
    </motion.div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'default' },
  cardLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: '0.03em' },
  cardValue: { fontSize: '1.35rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  receiptBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  emptyBox: { background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyText: { color: '#475569', margin: '0 0 0.5rem', fontWeight: 500 },
  receiptGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  receiptCard: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' },
  receiptIcon: { width: 40, height: 40, borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  receiptCardTitle: { fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  receiptCardMeta: { fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0' },
  receiptCardBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};
