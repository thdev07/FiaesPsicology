import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#166534' },
  pendente:   { background: '#fef9c3', color: '#854d0e' },
  cancelado:  { background: '#fee2e2', color: '#991b1b' },
  concluido:  { background: '#ede9fe', color: '#5b21b6' },
};

const TIPO_LABELS = { particular: 'Particular', convenio: 'Convênio' };

function Badge({ label, colors }) {
  return <span style={{ ...s.badge, ...colors }}>{label}</span>;
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    api.get('/appointments')
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.error ?? 'Erro ao carregar consultas.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterStatus
    ? appointments.filter((a) => a.status === filterStatus)
    : appointments;

  const upcoming = filtered.filter((a) => {
    const d = new Date(`${a.data}T${a.hora}`);
    return d >= new Date() && a.status !== 'cancelado';
  });
  const past = filtered.filter((a) => {
    const d = new Date(`${a.data}T${a.hora}`);
    return d < new Date() || a.status === 'cancelado' || a.status === 'concluido';
  });

  return (
    <motion.div {...pageAnim}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CalendarDays size={22} color="#3b82f6" />
          <h1 style={s.title}>Minhas consultas</h1>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={s.select}
        >
          <option value="">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {error && <p style={s.error}>{error}</p>}
      {loading && <p style={{ color: '#94a3b8' }}>Carregando...</p>}

      {!loading && (
        <>
          {upcoming.length > 0 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Próximas ({upcoming.length})</h2>
              <AppointmentTable rows={upcoming} />
            </div>
          )}

          <div style={s.section}>
            <h2 style={s.sectionTitle}>Histórico ({past.length})</h2>
            {past.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>Nenhuma consulta no histórico.</p>
            ) : (
              <AppointmentTable rows={past} />
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

function AppointmentTable({ rows }) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {['Data', 'Hora', 'Psicólogo', 'Sala', 'Tipo', 'Status'].map((h) => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} style={s.tr}>
              <td style={s.td}>
                {a.data
                  ? new Date(`${a.data}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </td>
              <td style={s.td}>{a.hora?.slice(0, 5) ?? '—'}</td>
              <td style={s.td}>{a.users?.nome ?? '—'}</td>
              <td style={s.td}>{a.rooms?.nome ?? '—'}</td>
              <td style={s.td}>{TIPO_LABELS[a.tipo] ?? a.tipo}</td>
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
  );
}

const s = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  select: { padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
};
