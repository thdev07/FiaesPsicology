import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, BrainCircuit,
  ArrowLeft, CalendarDays, TrendingUp, FileText, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const ROLE_REDIRECT = { admin: '/admin', psicologo: '/psicologo', paciente: '/paciente' };

const MOCK_CARDS = [
  {
    Icon: CalendarDays, color: '#3b82f6',
    title: 'Próxima consulta', value: 'Hoje às 14:00',
    sub: 'Maria Santos — Sala 2',
    style: { top: '14%', right: '-2%' }, delay: 0, floatDur: 4,
  },
  {
    Icon: TrendingUp, color: '#10b981',
    title: 'Receita do mês', value: 'R$ 12.400',
    sub: '↑ 18% vs mês anterior',
    style: { top: '43%', right: '-8%' }, delay: 0.25, floatDur: 5,
  },
  {
    Icon: FileText, color: '#8b5cf6',
    title: 'Prontuários hoje', value: '8 atualizados',
    sub: '3 sessões concluídas',
    style: { top: '70%', right: '0%' }, delay: 0.5, floatDur: 3.5,
  },
];

function FloatingCard({ Icon, color, title, value, sub, style, delay, floatDur }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0, y: [0, -7, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        x: { duration: 0.5, delay },
        y: { duration: floatDur, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 },
      }}
      style={{
        position: 'absolute', ...style,
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '0.9rem 1.15rem',
        minWidth: 210,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={13} color={color} />
        </div>
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      </div>
      <p style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', margin: '0 0 0.15rem', letterSpacing: '-0.01em' }}>{value}</p>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.73rem', margin: 0 }}>{sub}</p>
    </motion.div>
  );
}

const FEATURES = [
  'Agenda interativa com slots em tempo real',
  'Prontuários com criptografia AES-256',
  'Pagamento online via PIX e cartão',
  'Notificações por e-mail e WhatsApp',
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); return; }
      const role = data.user?.user_metadata?.role;
      if (!role) { setError('Usuário sem role definida. Contate o administrador.'); return; }
      navigate(ROLE_REDIRECT[role] ?? '/login');
    } catch {
      setError('Erro de conexão. Verifique suas configurações.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field) => ({
    width: '100%',
    padding: field === 'password' ? '0.72rem 2.6rem 0.72rem 2.5rem' : '0.72rem 0.85rem 0.72rem 2.5rem',
    borderRadius: 9,
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    border: `1.5px solid ${focused === field ? '#3b82f6' : '#e2e8f0'}`,
    outline: 'none',
    boxShadow: focused === field ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    color: '#0f172a',
    background: '#fff',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: '0 0 46%',
        background: 'linear-gradient(150deg, #050d1e 0%, #0c1a35 45%, #101827 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Orbs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }} transition={{ duration: 9, repeat: Infinity }} style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)', top: -120, left: -120, pointerEvents: 'none' }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 12, repeat: Infinity, delay: 3 }} style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)', bottom: -80, right: -80, pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '2.75rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59,130,246,0.4)' }}>
                <BrainCircuit size={24} color="#fff" />
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', margin: 0, letterSpacing: '-0.02em' }}>FiaesPsychology</p>
                <p style={{ color: '#4b6aaa', fontSize: '0.75rem', margin: 0, fontWeight: 500 }}>Gestão clínica inteligente</p>
              </div>
            </div>

            <h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.2rem)', fontWeight: 800, color: '#fff', margin: '0 0 0.8rem', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Gestão completa<br />
              <span style={{ background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                para sua clínica
              </span>
            </h2>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 2rem', maxWidth: 300 }}>
              Agenda, prontuários, financeiro e pacientes — tudo integrado e seguro.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {FEATURES.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={16} color="#22d3ee" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#7ea8d4', fontSize: '0.84rem', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating cards */}
        {MOCK_CARDS.map((c) => <FloatingCard key={c.title} {...c} />)}
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '2rem', position: 'relative' }}>
        <button
          onClick={() => navigate('/')}
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', background: 'rgba(255,255,255,0.7)', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          style={{
            background: '#fff', borderRadius: 18,
            padding: '2.75rem 2.5rem',
            width: '100%', maxWidth: 430,
            boxShadow: '0 8px 40px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)',
            border: '1px solid rgba(226,232,240,0.8)',
          }}
        >
          <div style={{ marginBottom: '2.25rem' }}>
            <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
              Bem-vindo de volta
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', letterSpacing: '0.01em' }}>Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={15} color={focused === 'email' ? '#3b82f6' : '#94a3b8'} style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input
                  type="email" value={email} required placeholder="seu@email.com"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle('email')}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', letterSpacing: '0.01em' }}>Senha</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} color={focused === 'password' ? '#3b82f6' : '#94a3b8'} style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none', transition: 'color 0.2s' }} />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} required placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle('password')}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  style={{ position: 'absolute', right: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '0.2rem' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                <p style={{ color: '#dc2626', fontSize: '0.84rem', margin: 0, fontWeight: 500 }}>{error}</p>
              </motion.div>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
              style={{
                marginTop: '0.15rem', padding: '0.85rem',
                borderRadius: 10, border: 'none',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.45)',
                transition: 'background 0.2s, box-shadow 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 17, height: 17, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                  />
                  Entrando...
                </>
              ) : 'Entrar na plataforma'}
            </motion.button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>
              FiaesPsychology &copy; {new Date().getFullYear()} — Todos os direitos reservados
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
