import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const card = (label, value, color) => (
  <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.08)', borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{value}</div>
  </div>
);

const STATUS_BADGE = { confirmado: '#22c55e', pendente: '#f59e0b', cancelado: '#ef4444', concluido: '#6366f1' };

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
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#111827' }}>Meu Painel</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {card('Sessões hoje', sessionsToday.length, '#3b82f6')}
        {card('Próximos 7 dias', sessionsWeek.length, '#8b5cf6')}
        {card('Total de pacientes', uniquePatients, '#10b981')}
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#374151' }}>
          Próximas sessões
        </div>
        {upcoming.length === 0 ? (
          <div style={{ padding: 24, color: '#9ca3af', textAlign: 'center' }}>Nenhuma sessão agendada.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Paciente', 'Data', 'Hora', 'Status', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcoming.map((a) => (
                <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', color: '#111827' }}>{a.patients?.nome ?? '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{a.data}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{a.hora?.slice(0, 5)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: STATUS_BADGE[a.status] + '22', color: STATUS_BADGE[a.status], padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/psicologo/prontuario/${a.id}`)}
                      style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
                    >
                      Prontuário
                    </button>
                    {a.status !== 'concluido' && (
                      <button
                        onClick={() => handleConclude(a.id)}
                        style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
                      >
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
    </div>
  );
}
