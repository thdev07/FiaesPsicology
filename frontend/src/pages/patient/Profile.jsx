import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, User, Mail, Phone, CreditCard, CalendarDays, Shield, FileText } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

function Field({ label, value, Icon }) {
  return (
    <div style={s.field}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
        {Icon && <Icon size={12} color="#94a3b8" />}
        <p style={s.fieldLabel}>{label}</p>
      </div>
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
    <motion.div {...pageAnim}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <UserCircle size={22} color="#3b82f6" />
        <h1 style={s.title}>Meu Perfil</h1>
      </div>

      {error && (
        <div style={s.emptyBox}>
          <UserCircle size={32} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
          <p style={s.emptyText}>Ficha clínica não encontrada.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Entre em contato com a clínica para cadastrar seus dados.
          </p>
        </div>
      )}

      {profile && (
        <>
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
                  {(profile.nome ?? '?')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{profile.nome}</p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Paciente</p>
              </div>
            </div>
            <h2 style={s.sectionTitle}>Dados pessoais</h2>
            <div style={s.grid}>
              <Field label="Nome completo" value={profile.nome} Icon={User} />
              <Field label="Email" value={profile.email} Icon={Mail} />
              <Field label="Telefone" value={profile.telefone} Icon={Phone} />
              <Field label="CPF" value={profile.cpf} Icon={CreditCard} />
              <Field
                label="Data de nascimento"
                value={
                  profile.data_nascimento
                    ? new Date(`${profile.data_nascimento}T00:00:00`).toLocaleDateString('pt-BR')
                    : null
                }
                Icon={CalendarDays}
              />
              <Field label="Plano de convênio" value={profile.insurance_plans?.nome ?? 'Particular'} Icon={Shield} />
            </div>
          </div>

          {profile.historico_clinico && (
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <FileText size={16} color="#64748b" />
                <h2 style={s.sectionTitle}>Histórico clínico</h2>
              </div>
              <p style={s.historico}>{profile.historico_clinico}</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

const s = {
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  card: { background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#475569', margin: '0 0 1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  fieldLabel: { fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: '0.03em' },
  fieldValue: { fontSize: '0.9rem', color: '#1e293b', margin: 0, fontWeight: 500 },
  historico: { fontSize: '0.9rem', color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' },
  emptyBox: { background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyText: { color: '#475569', margin: '0 0 0.5rem', fontWeight: 500 },
};
