import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}
import { CalendarDays, ListChecks, Wallet, CheckCircle2, Clock, FileText, CreditCard, CalendarPlus, ArrowRight } from 'lucide-react';
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
  const mobile = useIsMobile();
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
  const nome = user?.user_metadata?.nome ?? 'Paciente';

  function reloadDebts() {
    api.get('/financial/my-debts').then((d) => setDebts(Array.isArray(d) ? d : [])).catch(() => {});
  }

  if (loading) return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ height: '1.5rem', background: '#e5e7eb', borderRadius: 6, width: '200px', marginBottom: '0.5rem', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable rows={4} cols={5} />
    </div>
  );

  return (
    <motion.div {...pageAnim}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={s.title}>Olá, {nome.split(' ')[0]}</h1>
        <p style={s.subtitle}>Acompanhe suas consultas e situação financeira.</p>
      </div>

      {/* Alerta de débitos */}
      {totalPending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={s.debtBanner}
        >
          <Wallet size={16} color="#92400e" />
          <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 500 }}>
            Você tem <strong>{fmt(totalPending)}</strong> em pagamentos pendentes.
          </span>
          <button
            onClick={() => document.getElementById('debts-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={s.bannerBtn}
          >
            Ver cobranças →
          </button>
        </motion.div>
      )}

      <div style={s.cards}>
        <StatCard label="Próxima sessão" color="#3b82f6" Icon={CalendarDays}>
          {nextSession ? (
            <>
              <p style={s.cardValue}>
                {new Date(`${nextSession.data}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
              </p>
              <p style={s.cardSub}>{nextSession.hora?.slice(0, 5)} com {nextSession.users?.nome ?? 'psicólogo'}</p>
            </>
          ) : (
            <p style={{ ...s.cardValue, fontSize: '0.9rem', color: '#94a3b8' }}>Nenhuma agendada</p>
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

      {/* CTA quando não há próxima sessão */}
      {!nextSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={s.ctaBanner}
        >
          <div>
            <p style={{ fontWeight: 700, color: '#1e40af', margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
              Nenhuma consulta agendada
            </p>
            <p style={{ color: '#3b82f6', margin: 0, fontSize: '0.825rem' }}>
              Agende sua próxima sessão com nossos psicólogos.
            </p>
          </div>
          <button onClick={() => navigate('/paciente/novo-agendamento')} style={s.ctaBtn}>
            <CalendarPlus size={15} />
            Agendar consulta
          </button>
        </motion.div>
      )}

      {/* Próxima consulta detalhada */}
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
              {nextSession.rooms?.nome && <p style={s.nextInfo}>Sala: <strong>{nextSession.rooms.nome}</strong></p>}
            </div>
            <Badge label={nextSession.status} colors={STATUS_COLORS[nextSession.status] ?? {}} />
          </div>
        </div>
      )}

      {/* Cobranças pendentes */}
      {pendingDebts.length > 0 && (
        <div style={s.section} id="debts-section">
          <h2 style={s.sectionTitle}>Cobranças pendentes</h2>
          {mobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingDebts.map((d) => (
                <div key={d.id} style={{ background: '#fff', borderRadius: 10, padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{d.categoria}</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                        {d.appointments?.data
                          ? new Date(`${d.appointments.data}T00:00:00`).toLocaleDateString('pt-BR')
                          : 'Sem data'} · {d.appointments?.users?.nome ?? 'Psicólogo não informado'}
                      </p>
                    </div>
                    <strong style={{ fontSize: '1rem', color: '#b45309' }}>{fmt(d.valor)}</strong>
                  </div>
                  <button onClick={() => setPayingTransaction(d)} style={{ ...s.payBtn, width: '100%', justifyContent: 'center' }}>
                    <CreditCard size={13} />
                    Pagar agora
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Data', 'Psicólogo', 'Descrição', 'Valor', ''].map((h) => (
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
                          : 'Sem data'}
                      </td>
                      <td style={s.td}>{d.appointments?.users?.nome ?? 'Não informado'}</td>
                      <td style={s.td}>{d.categoria}</td>
                      <td style={s.td}><strong>{fmt(d.valor)}</strong></td>
                      <td style={s.td}>
                        <button onClick={() => setPayingTransaction(d)} style={s.payBtn}>
                          <CreditCard size={13} />
                          Pagar agora
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {payingTransaction && (
        <PaymentModal
          transaction={payingTransaction}
          onClose={() => setPayingTransaction(null)}
          onPaid={() => { reloadDebts(); setPayingTransaction(null); }}
        />
      )}

      {/* Acesso rápido */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Acesso rápido</h2>
        <div style={s.actions}>
          <button onClick={() => navigate('/paciente/novo-agendamento')} style={s.actionPrimary}>
            <CalendarPlus size={15} />
            Solicitar consulta
          </button>
          <button onClick={() => navigate('/paciente/agendamentos')} style={s.actionBtn}>
            <CalendarDays size={15} />
            Ver todas as consultas
            <ArrowRight size={13} />
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
  subtitle: { color: '#64748b', margin: 0, fontSize: '0.9rem' },
  debtBanner: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: '#fef3c7', border: '1px solid #fde68a',
    borderRadius: '8px', padding: '0.75rem 1rem',
    marginBottom: '1.25rem', flexWrap: 'wrap',
  },
  bannerBtn: {
    marginLeft: 'auto', background: '#f59e0b', color: '#fff', border: 'none',
    borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.8rem',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  ctaBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    border: '1px solid #bfdbfe', borderRadius: '10px',
    padding: '1rem 1.25rem', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap',
  },
  ctaBtn: {
    background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.875rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontFamily: 'inherit', flexShrink: 0,
  },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: '0.03em' },
  cardValue: { fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0 0.15rem' },
  cardSub: { fontSize: '0.78rem', color: '#64748b', margin: 0 },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' },
  nextCard: { background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  nextDate: { fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', margin: 0, textTransform: 'capitalize' },
  nextInfo: { fontSize: '0.875rem', color: '#475569', margin: '0.2rem 0' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  actions: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  actionPrimary: {
    padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
    background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer',
    fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontFamily: 'inherit',
  },
  actionBtn: {
    padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0',
    background: '#fff', color: '#3b82f6', fontWeight: 600, cursor: 'pointer',
    fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontFamily: 'inherit',
  },
  payBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};
