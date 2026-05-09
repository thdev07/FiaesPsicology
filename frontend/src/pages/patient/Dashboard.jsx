import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, ListChecks, Wallet, CheckCircle2, Clock, FileText, CreditCard } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SkeletonTable, SkeletonCard } from '../../components/ui/Skeleton';
import PaymentModal from '../../components/PaymentModal';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#166534' },
  pendente:   { background: '#fef9c3', color: '#854d0e' },
  cancelado:  { background: '#fee2e2', color: '#991b1b' },
  concluido:  { background: '#ede9fe', color: '#5b21b6' },
};

const PGTO_COLORS = {
  pago:      { background: '#dcfce7', color: '#166534' },
  pendente:  { background: '#fef9c3', color: '#854d0e' },
  cancelado: { background: '#f1f5f9', color: '#64748b' },
};

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Badge({ label, colors }) {
  return <span style={{ ...s.badge, ...colors }}>{label}</span>;
}

function StatCard({ label, children, color, Icon }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{ ...s.card, borderLeft: `4px solid ${color}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <Icon size={14} color={color} />
        <p style={s.cardLabel}>{label}</p>
      </div>
      {children}
    </motion.div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { show: toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingTransaction, setPayingTransaction] = useState(null);

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
  const totalPending = pendingDebts.reduce((sum, d) => sum + Number(d.valor), 0);

  function reloadDebts() {
    api.get('/financial/my-debts').then((d) => setDebts(Array.isArray(d) ? d : [])).catch(() => {});
  }

  if (loading) return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable rows={4} cols={5} />
    </div>
  );

  return (
    <motion.div {...pageAnim}>
      <h1 style={s.title}>Olá, {user?.user_metadata?.nome ?? 'Paciente'}</h1>
      <p style={s.subtitle}>Acompanhe suas consultas e situação financeira.</p>

      <div style={s.cards}>
        <StatCard label="Próxima sessão" color="#3b82f6" Icon={CalendarDays}>
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
        </StatCard>

        <StatCard label="Sessões agendadas" color="#8b5cf6" Icon={ListChecks}>
          <p style={s.cardValue}>{upcoming.length}</p>
          <p style={s.cardSub}>nos próximos dias</p>
        </StatCard>

        <StatCard label="Débitos pendentes" color={totalPending > 0 ? '#f59e0b' : '#22c55e'} Icon={Wallet}>
          <p style={{ ...s.cardValue, color: totalPending > 0 ? '#b45309' : '#15803d' }}>
            {fmt(totalPending)}
          </p>
          <p style={s.cardSub}>{pendingDebts.length} transaç{pendingDebts.length === 1 ? 'ão' : 'ões'} em aberto</p>
        </StatCard>

        <StatCard label="Total de consultas" color="#10b981" Icon={CheckCircle2}>
          <p style={s.cardValue}>{appointments.filter((a) => a.status === 'concluido').length}</p>
          <p style={s.cardSub}>sessões concluídas</p>
        </StatCard>
      </div>

      {nextSession && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Próxima consulta</h2>
          <div style={s.nextCard}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CalendarDays size={16} color="#3b82f6" />
                <p style={s.nextDate}>
                  {new Date(`${nextSession.data}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <p style={s.nextInfo}><Clock size={13} color="#94a3b8" style={{ verticalAlign: 'middle', marginRight: 4 }} />Horário: <strong>{nextSession.hora?.slice(0, 5)}</strong></p>
              <p style={s.nextInfo}>Psicólogo: <strong>{nextSession.users?.nome ?? '—'}</strong></p>
              <p style={s.nextInfo}>Sala: <strong>{nextSession.rooms?.nome ?? '—'}</strong></p>
            </div>
            <Badge label={nextSession.status} colors={STATUS_COLORS[nextSession.status] ?? {}} />
          </div>
        </div>
      )}

      {pendingDebts.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Cobranças pendentes</h2>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Data', 'Psicólogo', 'Descrição', 'Valor', 'Status', ''].map((h) => (
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
                    <td style={s.td}>
                      <button onClick={() => setPayingTransaction(d)} style={s.payBtn}>
                        <CreditCard size={13} />
                        Pagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payingTransaction && (
        <PaymentModal
          transaction={payingTransaction}
          onClose={() => setPayingTransaction(null)}
          onPaid={() => { reloadDebts(); setPayingTransaction(null); }}
        />
      )}

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Acesso rápido</h2>
        <div style={s.actions}>
          <button onClick={() => navigate('/paciente/agendamentos')} style={s.actionBtn}>
            <CalendarDays size={15} />
            Ver histórico de consultas
          </button>
          <button onClick={() => navigate('/paciente/documentos')} style={s.actionBtn}>
            <FileText size={15} />
            Meus documentos
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.2rem' },
  subtitle: { color: '#64748b', margin: '0 0 1.5rem', fontSize: '0.9rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'default' },
  cardLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: '0.03em' },
  cardValue: { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0 0.15rem' },
  cardSub: { fontSize: '0.78rem', color: '#64748b', margin: 0 },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  nextCard: { background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  nextDate: { fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', margin: 0, textTransform: 'capitalize' },
  nextInfo: { fontSize: '0.875rem', color: '#475569', margin: '0.2rem 0' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  actions: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  actionBtn: { padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' },
  payBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
};
