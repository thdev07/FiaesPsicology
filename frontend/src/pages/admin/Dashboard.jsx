import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, CalendarDays, Clock, CheckCircle2, DoorOpen,
  ListChecks, TrendingUp, TrendingDown, Wallet, LayoutDashboard,
  UserPlus, CalendarPlus, AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#166534' },
  pendente:   { background: '#fef9c3', color: '#854d0e' },
  cancelado:  { background: '#fee2e2', color: '#991b1b' },
  concluido:  { background: '#ede9fe', color: '#5b21b6' },
};

function StatCard({ label, value, sub, color, Icon }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} style={s.card}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
        {Icon && <Icon size={18} color={color} />}
      </div>
      <p style={{ ...s.cardValue, color }}>{value}</p>
      <p style={s.cardLabel}>{label}</p>
      {sub && <p style={s.cardSub}>{sub}</p>}
    </motion.div>
  );
}

function fmtBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [financial, setFinancial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments').catch(() => []),
      api.get('/patients').catch(() => []),
      api.get('/rooms').catch(() => []),
      api.get('/financial/summary').catch(() => null),
    ]).then(([appts, pats, rms, fin]) => {
      setAppointments(Array.isArray(appts) ? appts : []);
      setPatients(Array.isArray(pats) ? pats : []);
      setRooms(Array.isArray(rms) ? rms : []);
      setFinancial(fin);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.data === today && a.status !== 'cancelado');
  const pendentes = appointments.filter((a) => a.status === 'pendente');
  const confirmados = appointments.filter((a) => a.status === 'confirmado');
  const recentes = [...appointments]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  if (loading) return (
    <motion.div {...pageAnim}>
      <div style={s.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LayoutDashboard size={22} color="#3b82f6" />
          <h1 style={s.title}>Dashboard</h1>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} height="3rem" />)}
      </div>
      <SkeletonTable rows={5} cols={6} />
    </motion.div>
  );

  return (
    <motion.div {...pageAnim}>
      <div style={s.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LayoutDashboard size={22} color="#3b82f6" />
          <h1 style={s.title}>Dashboard</h1>
        </div>
        <p style={s.date}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Banner de pendentes */}
      {pendentes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={s.alertBanner}
        >
          <AlertCircle size={16} color="#92400e" />
          <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 500 }}>
            <strong>{pendentes.length}</strong> agendamento{pendentes.length > 1 ? 's' : ''} aguardando sua confirmação.
          </span>
          <button
            onClick={() => navigate('/admin/agendamentos')}
            style={s.alertBtn}
          >
            Confirmar agora →
          </button>
        </motion.div>
      )}

      {/* KPIs */}
      <div style={s.grid}>
        <StatCard label="Pacientes" value={patients.length} sub="cadastrados" color="#3b82f6" Icon={Users} />
        <StatCard label="Sessões hoje" value={todayAppts.length} sub="agendamentos" color="#8b5cf6" Icon={CalendarDays} />
        <StatCard label="Pendentes" value={pendentes.length} sub="aguardando confirmação" color="#f59e0b" Icon={Clock} />
        <StatCard label="Confirmados" value={confirmados.length} sub="agendamentos ativos" color="#10b981" Icon={CheckCircle2} />
        <StatCard label="Salas" value={rooms.length} sub="cadastradas" color="#64748b" Icon={DoorOpen} />
        <StatCard label="Total agendamentos" value={appointments.length} sub="todos os registros" color="#ef4444" Icon={ListChecks} />
        {financial && (
          <>
            <StatCard label="Receitas" value={fmtBRL(financial.receitas)} color="#16a34a" Icon={TrendingUp} />
            <StatCard label="Despesas" value={fmtBRL(financial.despesas)} color="#dc2626" Icon={TrendingDown} />
            <StatCard label="Saldo" value={fmtBRL(financial.saldo)} color={financial.saldo >= 0 ? '#3b82f6' : '#f59e0b'} Icon={Wallet} />
          </>
        )}
      </div>

      {/* Agendamentos recentes */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Agendamentos recentes</h2>
          <button onClick={() => navigate('/admin/agendamentos')} style={s.linkBtn}>
            Ver todos →
          </button>
        </div>

        {recentes.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
            <CalendarDays size={36} color="#e2e8f0" style={{ marginBottom: '0.5rem' }} />
            <p style={{ margin: 0 }}>Nenhum agendamento cadastrado.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Data', 'Hora', 'Paciente', 'Psicólogo', 'Sala', 'Status'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentes.map((a) => (
                  <tr key={a.id} style={{ ...s.tr, background: a.status === 'pendente' ? '#fffbeb' : 'transparent' }}>
                    <td style={s.td}>{new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td style={s.td}>{a.hora?.slice(0, 5)}</td>
                    <td style={{ ...s.td, fontWeight: 500 }}>{a.patients?.nome ?? '—'}</td>
                    <td style={s.td}>{a.users?.nome ?? '—'}</td>
                    <td style={s.td}>{a.rooms?.nome ?? '—'}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...(STATUS_COLORS[a.status] ?? {}) }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ações rápidas */}
      <div style={s.quickLinks}>
        <h2 style={{ ...s.sectionTitle, marginBottom: '0.75rem' }}>Ações rápidas</h2>
        <div style={s.quickGrid}>
          {[
            { label: 'Novo paciente', path: '/admin/pacientes', color: '#3b82f6', Icon: UserPlus },
            { label: 'Novo agendamento', path: '/admin/agendamentos', color: '#10b981', Icon: CalendarPlus },
            { label: 'Ver financeiro', path: '/admin/financeiro', color: '#8b5cf6', Icon: Wallet },
          ].map(({ label, path, color, Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '8px',
                border: `1.5px solid ${color}30`,
                background: color + '0f', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                color, display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const s = {
  pageHeader: { marginBottom: '1.25rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  date: { color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.2rem', textTransform: 'capitalize' },
  alertBanner: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: '#fef3c7', border: '1px solid #fde68a',
    borderRadius: '8px', padding: '0.75rem 1rem',
    marginBottom: '1.25rem', flexWrap: 'wrap',
  },
  alertBtn: {
    marginLeft: 'auto', background: '#f59e0b', color: '#fff', border: 'none',
    borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.8rem',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardLabel: { fontSize: '0.8rem', color: '#64748b', fontWeight: 600, margin: '0 0 0.1rem' },
  cardValue: { fontSize: '1.9rem', fontWeight: 800, margin: '0 0 0.2rem', lineHeight: 1 },
  cardSub: { fontSize: '0.75rem', color: '#94a3b8', margin: 0 },
  section: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  linkBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9', background: '#f8fafc' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '0.65rem 0.75rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  quickLinks: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  quickGrid: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
};
