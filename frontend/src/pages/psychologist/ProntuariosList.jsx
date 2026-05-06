import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#16a34a' },
  pendente:   { background: '#fef9c3', color: '#ca8a04' },
  cancelado:  { background: '#fee2e2', color: '#dc2626' },
  concluido:  { background: '#ede9fe', color: '#5b21b6' },
};

export default function ProntuariosList() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('concluido');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/appointments')
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.error ?? 'Erro ao carregar consultas.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = appointments
    .filter((a) => {
      const matchStatus = filterStatus ? a.status === filterStatus : true;
      const q = search.toLowerCase();
      const matchSearch = !q || (a.patients?.nome ?? '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      const da = new Date(`${a.data}T${a.hora}`);
      const db = new Date(`${b.data}T${b.hora}`);
      return db - da;
    });

  return (
    <div>
      <h1 style={s.title}>Prontuários</h1>

      <div style={s.toolbar}>
        <input
          type="text"
          placeholder="Buscar por paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={s.search}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={s.select}>
          <option value="">Todos os status</option>
          <option value="concluido">Concluído</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {error && <p style={s.error}>{error}</p>}
      {loading && <p style={{ color: '#94a3b8' }}>Carregando...</p>}

      {!loading && (
        <div style={s.tableWrap}>
          {filtered.length === 0 ? (
            <div style={{ padding: 32, color: '#9ca3af', textAlign: 'center' }}>
              Nenhuma consulta encontrada.
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Data', 'Hora', 'Paciente', 'Sala', 'Status', 'Prontuário'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} style={s.tr}>
                    <td style={s.td}>
                      {a.data
                        ? new Date(`${a.data}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={s.td}>{a.hora?.slice(0, 5) ?? '—'}</td>
                    <td style={{ ...s.td, fontWeight: 500, color: '#111827' }}>{a.patients?.nome ?? '—'}</td>
                    <td style={s.td}>{a.rooms?.nome ?? '—'}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, ...(STATUS_COLORS[a.status] ?? {}) }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        onClick={() => navigate(`/psicologo/prontuario/${a.id}`)}
                        style={s.btnEdit}
                        disabled={a.status === 'cancelado'}
                      >
                        {a.status === 'cancelado' ? '—' : 'Abrir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 1rem' },
  toolbar: { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  search: { padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', width: 240 },
  select: { padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem' },
  error: { color: '#e53e3e', fontSize: '0.875rem', margin: '0.5rem 0' },
  tableWrap: { background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#374151' },
  badge: { padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 },
  btnEdit: { padding: '0.3rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 },
};
