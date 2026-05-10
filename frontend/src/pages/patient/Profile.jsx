import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, User, Mail, Phone, CreditCard, CalendarDays, Shield, FileText, Pencil, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

function ReadField({ label, value, Icon }) {
  return (
    <div style={s.field}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
        {Icon && <Icon size={12} color="#94a3b8" />}
        <p style={s.fieldLabel}>{label}</p>
      </div>
      <p style={s.fieldValue}>{value || 'Não informado'}</p>
    </div>
  );
}

export default function PatientProfile() {
  const { show: toast } = useToast();
  const mobile = useIsMobile();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ telefone: '', data_nascimento: '' });

  useEffect(() => {
    api.get('/patients/me')
      .then((data) => {
        setProfile(data);
        setForm({ telefone: data.telefone ?? '', data_nascimento: data.data_nascimento ?? '' });
      })
      .catch((err) => setError(err?.error ?? 'Ficha não encontrada.'))
      .finally(() => setLoading(false));
  }, []);

  function startEdit() {
    setForm({ telefone: profile.telefone ?? '', data_nascimento: profile.data_nascimento ?? '' });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.patch('/patients/me', form);
      setProfile(updated);
      setEditing(false);
      toast('Perfil atualizado com sucesso.', 'success');
    } catch (err) {
      toast(err?.error ?? 'Erro ao salvar perfil.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: '#94a3b8' }}>Carregando...</p>;

  if (error) {
    return (
      <motion.div {...pageAnim}>
        <div style={s.emptyBox}>
          <UserCircle size={40} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
          <p style={s.emptyText}>Ficha clínica não encontrada.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Entre em contato com a clínica para cadastrar seus dados.
          </p>
        </div>
      </motion.div>
    );
  }

  const initials = (profile?.nome ?? '?')[0].toUpperCase();
  const birthFormatted = profile?.data_nascimento
    ? new Date(`${profile.data_nascimento}T00:00:00`).toLocaleDateString('pt-BR')
    : null;

  return (
    <motion.div {...pageAnim}>
      {/* Header */}
      <div style={{ ...s.headerCard, flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'flex-start' : 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={s.avatar}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: mobile ? '1.5rem' : '1.8rem' }}>{initials}</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: mobile ? '1.2rem' : '1.4rem', fontWeight: 800, color: '#1e293b' }}>
              {profile.nome}
            </h1>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>Paciente</p>
            {profile.insurance_plans?.nome && (
              <span style={{ display: 'inline-block', marginTop: '0.35rem', background: '#ede9fe', color: '#5b21b6', borderRadius: 6, padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
                {profile.insurance_plans.nome}
              </span>
            )}
          </div>
        </div>

        {!editing ? (
          <button onClick={startEdit} style={{ ...s.btnEdit, marginTop: mobile ? '0.75rem' : 0 }}>
            <Pencil size={14} /> Editar perfil
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: mobile ? '0.75rem' : 0 }}>
            <button onClick={cancelEdit} style={s.btnGhost}>
              <X size={14} /> Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} style={s.btnSave}>
              <Check size={14} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      {/* Dados pessoais */}
      <div style={s.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
          <User size={15} color="#64748b" />
          <h2 style={s.sectionTitle}>Dados pessoais</h2>
        </div>

        <div style={{ ...s.grid, gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(210px, 1fr))' }}>
          {/* Somente leitura */}
          <ReadField label="Nome completo" value={profile.nome} Icon={User} />
          <ReadField label="CPF" value={profile.cpf} Icon={CreditCard} />
          <ReadField
            label="Plano de convênio"
            value={profile.insurance_plans?.nome ?? 'Particular'}
            Icon={Shield}
          />

          {/* Editáveis */}
          <div style={s.field}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <Phone size={12} color="#94a3b8" />
              <p style={s.fieldLabel}>Telefone</p>
            </div>
            {editing ? (
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(00) 90000-0000"
                style={s.editInput}
              />
            ) : (
              <p style={s.fieldValue}>{profile.telefone || 'Não informado'}</p>
            )}
          </div>

          <div style={s.field}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <CalendarDays size={12} color="#94a3b8" />
              <p style={s.fieldLabel}>Data de nascimento</p>
            </div>
            {editing ? (
              <input
                type="date"
                value={form.data_nascimento}
                onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                style={s.editInput}
              />
            ) : (
              <p style={s.fieldValue}>{birthFormatted || 'Não informado'}</p>
            )}
          </div>

          <ReadField label="Email" value={profile.email} Icon={Mail} />
        </div>

        {editing && (
          <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#94a3b8' }}>
            Nome, CPF e convênio só podem ser alterados pela clínica.
          </p>
        )}
      </div>

      {/* Histórico clínico */}
      {profile.historico_clinico && (
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <FileText size={15} color="#64748b" />
            <h2 style={s.sectionTitle}>Histórico clínico</h2>
          </div>
          <p style={s.historico}>{profile.historico_clinico}</p>
        </div>
      )}
    </motion.div>
  );
}

const s = {
  headerCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    marginBottom: '1.25rem',
    display: 'flex',
    gap: '1rem',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.25rem' },
  sectionTitle: { fontSize: '0.88rem', fontWeight: 700, color: '#475569', margin: 0 },
  grid: { display: 'grid', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  fieldLabel: { fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: '0.04em' },
  fieldValue: { fontSize: '0.9rem', color: '#1e293b', margin: 0, fontWeight: 500 },
  editInput: {
    padding: '0.45rem 0.65rem',
    borderRadius: '6px',
    border: '1.5px solid #3b82f6',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#1e293b',
    background: '#f0f9ff',
    width: '100%',
    boxSizing: 'border-box',
  },
  btnEdit: {
    padding: '0.45rem 1rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  btnGhost: {
    padding: '0.45rem 1rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: 'inherit',
  },
  btnSave: {
    padding: '0.45rem 1rem',
    borderRadius: '6px',
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: 'inherit',
  },
  historico: { fontSize: '0.9rem', color: '#334155', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' },
  emptyBox: { background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyText: { color: '#475569', margin: '0 0 0.5rem', fontWeight: 500 },
};
