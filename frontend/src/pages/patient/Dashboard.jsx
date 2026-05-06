import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#16a34a' },
  pendente:   { background: '#fef9c3', color: '#ca8a04' },
  cancelado:  { background: '#fee2e2', color: '#dc2626' },
  concluido:  { background: '#ede9fe', color: '#5b21b6' },
};

const PGTO_COLORS = {
  pago:      { background: '#dcfce7', color: '#16a34a' },
  pendente:  { background: '#fef9c3', color: '#ca8a04' },
  cancelado: { background: '#f1f5f9', color: '#64748b' },
};

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Badge({ label, colors }) {
  return (
    <span style={{ ...s.badge, ...colors }}>{label}</span>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments').catch(() => []),
      api.get('/financial/my-debts').catch(() => []),
    ]).then(([appts, myDebts]) => {
      setAppointments(Array.isArray(appts) ? appts : []);
      setDebts(Array.isArray(myDebts) ? myDebts : []);
    }).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = appointments
    .filter((a) => {
      const d = new Date(`${a.data}T${a.hora}`);
      return d >= now && a.status !== 'cancelado';
    })
    .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));

  const nextSession = upcoming[0] ?? null;
  const pendingDebts = debts.filter((d) => d.status_pagamento === 'pendente');
  const totalPending = pendingDebts.reduce((s, d) => s + Number(d.valor), 0);

  if (loading) return <p style={{ color: '#94a3b8' }}>Carregando...</p>;

  return (
    <div>
      <h1 style={s.title}>Olá, {user?.user_metadata?.nome ?? 'Paciente'}</h1>
      <p style={s.subtitle}>Acompanhe suas consultas e situação financeira.</p>

      {/* Cards de resumo */}
      <div style={s.cards}>
        <div style={s.card}>
          <p style={s.cardLabel}>Próxima sessão</p>
          {nextSession ? (
            <>
              <p style={s.cardValue}>
                {new Date(`${nextSession.data}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
              </p>
              <p style={s.cardSub}>{nextSession.hora?.slice(0, 5)} — {nextSession.users?.nome ?? '—'}</p>
            </>
          ) : (
            <p style={s.cardValue}>Nenhuma agendada</p>
          )}
        </div>

        <div style={s.card}>
          <p style={s.cardLabel}>Sessões agendadas</p>
          <p style={s.cardValue}>{upcoming.length}</p>
          <p style={s.cardSub}>nos próximos dias</p>
        </div>

        <div style={{ ...s.card, borderLeft: totalPending > 0 ? '4px solid #f59e0b' : '4px solid #22c55e' }}>
          <p style={s.cardLabel}>Débitos pendentes</p>
          <p style={{ ...s.cardValue, color: totalPending > 0 ? '#b45309' : '#15803d' }}>
            {fmt(totalPending)}
          </p>
          <p style={s.cardSub}>{pendingDebts.length} transaç{pendingDebts.length === 1 ? 'ão' : 'ões'} em aberto</p>
        </div>

        <div style={s.card}>
          <p style={s.cardLabel}>Total de consultas</p>
          <p style={s.cardValue}>{appointments.filter((a) => a.status === 'concluido').length}</p>
          <p style={s.cardSub}>sessões concluídas</p>
        </div>
      </div>

      {/* Próxima sessão em destaque */}
      {nextSession && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Próxima consulta</h2>
          <div style={s.nextCard}>
            <div>
              <p style={s.nextDate}>
                {new Date(`${nextSession.data}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p style={s.nextInfo}>Horário: <strong>{nextSession.hora?.slice(0, 5)}</strong></p>
              <p style={s.nextInfo}>Psicólogo: <strong>{nextSession.users?.nome ?? '—'}</strong></p>
              <p style={s.nextInfo}>Sala: <strong>{nextSession.rooms?.nome ?? '—'}</strong></p>
            </div>
            <Badge label={nextSession.status} colors={STATUS_COLORS[nextSession.status] ?? {}} />
          </div>
        </div>
      )}

      {/* Débitos pendentes */}
      {pendingDebts.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Cobranças pendentes</h2>
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
                {pendingDebts.map((d) => (
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
                      <Badge label={d.status_pagamento} colors={PGTO_COLORS[d.status_pagamento] ?? {}} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ações rápidas */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Acesso rápido</h2>
        <div style={s.actions}>
          <button onClick={() => navigate('/paciente/agendamentos')} style={s.actionBtn}>
            Ver histórico de consultas
          </button>
          <button onClick={() => navigate('/paciente/documentos')} style={s.actionBtn}>
            Meus documentos
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem' },
  subtitle: { color: '#64748b', margin: '0 0 1.5rem', fontSize: '0.95rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: '4px solid #3b82f6' },
  cardLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 0.5rem' },
  cardValue: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem' },
  cardSub: { fontSize: '0.8rem', color: '#64748b', margin: 0 },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' },
  nextCard: { background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  nextDate: { fontSize: '1rem', fontWeight: 600, color: '#1e293b', margin: '0 0 0.5rem', textTransform: 'capitalize' },
  nextInfo: { fontSize: '0.9rem', color: '#475569', margin: '0.15rem 0' },
  badge: { padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#334155' },
  actions: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  actionBtn: { padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
};
