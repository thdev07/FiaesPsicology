import { useEffect, useState } from 'react';
import { api } from '../../services/api';

function Field({ label, value }) {
  return (
    <div style={s.field}>
      <p style={s.fieldLabel}>{label}</p>
      <p style={s.fieldValue}>{value || '—'}</p>
    </div>
  );
}

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/patients/me')
      .then(setProfile)
      .catch((err) => setError(err?.error ?? 'Ficha não encontrada.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#94a3b8' }}>Carregando...</p>;

  return (
    <div>
      <h1 style={s.title}>Meu Perfil</h1>

      {error && (
        <div style={s.emptyBox}>
          <p style={s.emptyText}>Ficha clínica não encontrada.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Entre em contato com a clínica para cadastrar seus dados.
          </p>
        </div>
      )}

      {profile && (
        <>
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Dados pessoais</h2>
            <div style={s.grid}>
              <Field label="Nome completo" value={profile.nome} />
              <Field label="Email" value={profile.email} />
              <Field label="Telefone" value={profile.telefone} />
              <Field label="CPF" value={profile.cpf} />
              <Field
                label="Data de nascimento"
                value={
                  profile.data_nascimento
                    ? new Date(`${profile.data_nascimento}T00:00:00`).toLocaleDateString('pt-BR')
                    : null
                }
              />
              <Field label="Plano de convênio" value={profile.insurance_plans?.nome ?? 'Particular'} />
            </div>
          </div>

          {profile.historico_clinico && (
            <div style={s.card}>
              <h2 style={s.sectionTitle}>Histórico clínico</h2>
              <p style={s.historico}>{profile.historico_clinico}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: '0 0 1.5rem' },
  card: { background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#475569', margin: '0 0 1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  fieldLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: 0 },
  fieldValue: { fontSize: '0.95rem', color: '#1e293b', margin: 0, fontWeight: 500 },
  historico: { fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' },
  emptyBox: { background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '3rem', textAlign: 'center' },
  emptyText: { color: '#475569', margin: '0 0 0.5rem', fontWeight: 500 },
};
