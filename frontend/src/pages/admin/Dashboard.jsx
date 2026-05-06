import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#16a34a' },
  pendente: { background: '#fef9c3', color: '#ca8a04' },
  cancelado: { background: '#fee2e2', color: '#dc2626' },
};

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ ...s.card, borderTop: `4px solid ${color}` }}>
      <p style={s.cardLabel}>{label}</p>
      <p style={{ ...s.cardValue, color }}>{value}</p>
      {sub && <p style={s.cardSub}>{sub}</p>}
    </div>
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

  if (loading) return <p style={{ color: '#94a3b8' }}>Carregando...</p>;

  return (
    <div>
      <h1 style={s.title}>Dashboard</h1>
      <p style={s.date}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div style={s.grid}>
        <StatCard label="Pacientes cadastrados" value={patients.length} sub="total no sistema" color="#3b82f6" />
        <StatCard label="Sessões hoje" value={todayAppts.length} sub="agendamentos do dia" color="#8b5cf6" />
        <StatCard label="Pendentes" value={pendentes.length} sub="aguardando confirmação" color="#f59e0b" />
        <StatCard label="Confirmados" value={confirmados.length} sub="agendamentos ativos" color="#10b981" />
        <StatCard label="Salas" value={rooms.length} sub="disponíveis" color="#64748b" />
        <StatCard label="Total de agendamentos" value={appointments.length} sub="todos os registros" color="#ef4444" />
        {financial && (
          <>
            <StatCard label="Receitas" value={fmtBRL(financial.receitas)} sub="total geral" color="#16a34a" />
            <StatCard label="Despesas" value={fmtBRL(financial.despesas)} sub="total geral" color="#dc2626" />
            <StatCard label="Saldo" value={fmtBRL(financial.saldo)} sub="receitas − despesas" color={financial.saldo >= 0 ? '#3b82f6' : '#f59e0b'} />
          </>
        )}
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Agendamentos recentes</h2>
          <button onClick={() => navigate('/admin/agendamentos')} style={s.linkBtn}>
            Ver todos →
          </button>
        </div>

        {recentes.length === 0 ? (
          <p style={{ color: '#94a3b8', padding: '1rem 0' }}>Nenhum agendamento cadastrado.</p>
        ) : (
          <div style={s.tableWrap}>
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
                  <tr key={a.id} style={s.tr}>
                    <td style={s.td}>{new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td style={s.td}>{a.hora?.slice(0, 5)}</td>
                    <td style={s.td}>{a.patients?.nome ?? '—'}</td>
                    <td style={s.td}>{a.users?.nome ?? '—'}</td>
                    <td style={s.td}>{a.rooms?.nome ?? '—'}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...STATUS_COLORS[a.status] }}>
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

      <div style={s.quickLinks}>
        <h2 style={{ ...s.sectionTitle, marginBottom: '0.75rem' }}>Ações rápidas</h2>
        <div style={s.quickGrid}>
          {[
            { label: '+ Novo paciente', path: '/admin/pacientes', color: '#3b82f6' },
            { label: '+ Nova sala', path: '/admin/salas', color: '#8b5cf6' },
            { label: '+ Novo agendamento', path: '/admin/agendamentos', color: '#10b981' },
          ].map(({ label, path, color }) => (
            <button key={path} onClick={() => navigate(path)} style={{ ...s.quickBtn, borderColor: color, color }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  title: { fontSize: '1.6rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.25rem' },
  date: { color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', textTransform: 'capitalize' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  cardLabel: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.5rem' },
  cardValue: { fontSize: '2rem', fontWeight: 800, margin: '0 0 0.25rem', lineHeight: 1 },
  cardSub: { fontSize: '0.78rem', color: '#94a3b8', margin: 0 },
  section: { background: '#fff', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '1.5rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  linkBtn: { background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '0.65rem 0.75rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
  quickLinks: { background: '#fff', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  quickGrid: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  quickBtn: { padding: '0.6rem 1.25rem', borderRadius: '8px', border: '2px solid', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
};
