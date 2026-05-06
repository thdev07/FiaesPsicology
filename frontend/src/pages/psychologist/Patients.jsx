import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/patients')
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return p.nome?.toLowerCase().includes(q) || p.cpf?.includes(q);
  });

  if (loading) return <div style={{ padding: 32, color: '#6b7280' }}>Carregando...</div>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Meus Pacientes</h1>
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 14, width: 260 }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, color: '#9ca3af', textAlign: 'center' }}>Nenhum paciente encontrado.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Nome', 'CPF', 'Nascimento', 'Convênio', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500 }}>{p.nome}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{p.cpf ?? '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{p.data_nascimento ?? '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{p.insurance_plans?.nome ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => navigate(`/psicologo/agenda?paciente=${p.id}`)}
                      style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
                    >
                      Ver consultas
                    </button>
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
