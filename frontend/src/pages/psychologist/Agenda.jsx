import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgendaCalendar from '../../components/calendar/AgendaCalendar';
import { api } from '../../services/api';

export default function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchAppointments() {
    try {
      const data = await api.get('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAppointments(); }, []);

  async function handleEventDrop(id, novaData, novaHora, revert) {
    try {
      await api.put(`/appointments/${id}`, { data: novaData, hora: novaHora });
      await fetchAppointments();
    } catch (err) {
      revert();
      alert(err?.error ?? 'Erro ao mover agendamento.');
    }
  }

  if (loading) return <div style={{ padding: 32, color: '#6b7280' }}>Carregando agenda...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#111827' }}>Minha Agenda</h1>
      <AgendaCalendar
        appointments={appointments}
        onEventClick={(id) => navigate(`/psicologo/prontuario/${id}`)}
        onEventDrop={handleEventDrop}
      />
    </div>
  );
}
