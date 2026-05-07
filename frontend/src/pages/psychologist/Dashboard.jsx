import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarDays, Users, Clock, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#166534' },
  pendente: { background: '#fef9c3', color: '#854d0e' },
  cancelado: { background: '#fee2e2', color: '#991b1b' },
  concluido: { background: '#ede9fe', color: '#5b21b6' },
};

function StatCard({ label, value, color, Icon }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{ background: '#fff', borderRadius: 8, padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)', cursor: 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
}

export default function PsychologistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAppointments = useCallback(() => {
    api.get('/appointments')
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function handleConclude(id) {
    if (!confirm('Marcar esta sessão como concluída?')) return;
    try {
      await api.patch(`/appointments/${id}/conclude`);
      fetchAppointments();
    } catch (err) {
      alert(err?.error ?? 'Erro ao concluir sessão.');
    }
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const nextWeekDate = new Date(now); nextWeekDate.setDate(now.getDate() + 7);
  const nextWeek = `${nextWeekDate.getFullYear()}-${pad(nextWeekDate.getMonth() + 1)}-${pad(nextWeekDate.getDate())}`;

  const sessionsToday = appointments.filter((a) => a.data === today && a.status !== 'cancelado');
  const sessionsWeek = appointments.filter((a) => a.data >= today && a.data <= nextWeek && a.status !== 'cancelado');
  const uniquePatients = new Set(appointments.map((a) => a.paciente_id)).size;
  const upcoming = appointments
    .filter((a) => a.data >= today && a.status !== 'cancelado')
    .sort((a, b) => `${a.data}T${a.hora}` > `${b.data}T${b.hora}` ? 1 : -1)
    .slice(0, 10);

  if (loading) return <div style={{ padding: 32, color: '#6b7280' }}>Carregando...</div>;

  return (
    <motion.div {...pageAnim}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <LayoutDashboard size={22} color="#3b82f6" />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Meu Painel</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Sessões hoje" value={sessionsToday.length} color="#3b82f6" Icon={CalendarDays} />
        <StatCard label="Próximos 7 dias" value={sessionsWeek.length} color="#8b5cf6" Icon={Clock} />
        <StatCard label="Total de pacientes" value={uniquePatients} color="#10b981" Icon={Users} />
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={16} color="#64748b" />
          <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem' }}>Próximas sessões</span>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ padding: 32, color: '#9ca3af', textAlign: 'center' }}>Nenhuma sessão agendada.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Paciente', 'Data', 'Hora', 'Status', ''].map((h) => (
                  <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #f0f0f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcoming.map((a) => (
                <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#111827', fontWeight: 500 }}>{a.patients?.nome ?? '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#374151', fontSize: '0.875rem' }}>
                    {new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#374151', fontSize: '0.875rem' }}>{a.hora?.slice(0, 5)}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ ...STATUS_COLORS[a.status], padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/psicologo/prontuario/${a.id}`)}
                      style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <FileText size={12} />
                      Prontuário
                    </button>
                    {a.status !== 'concluido' && (
                      <button
                        onClick={() => handleConclude(a.id)}
                        style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <CheckCircle size={12} />
                        Concluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
