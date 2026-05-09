import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays, FileText, DollarSign, Users, DoorOpen, Shield,
  LayoutDashboard, Lock, Zap, Crown, Brain, UserCheck,
  BrainCircuit, CheckCircle2, ArrowRight, TrendingUp,
  ClipboardList, Bell, Star, ChevronRight,
} from 'lucide-react';
import heroImg from '../assets/imgLandingPage.png';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

const FEATURES = [
  { Icon: CalendarDays, color: '#3b82f6', bg: '#eff6ff', title: 'Agenda Inteligente', desc: 'Calendário interativo com visualização de slots disponíveis em tempo real. Agendamentos por psicólogo, sala ou status.' },
  { Icon: FileText, color: '#6366f1', bg: '#eef2ff', title: 'Prontuários Digitais', desc: 'Editor rich text com salvamento automático. Dados criptografados com AES-256 para conformidade com LGPD.' },
  { Icon: DollarSign, color: '#10b981', bg: '#ecfdf5', title: 'Pagamento Online', desc: 'Pacientes pagam via PIX ou cartão diretamente pelo portal. Confirmação automática via webhook do Mercado Pago.' },
  { Icon: Users, color: '#f59e0b', bg: '#fffbeb', title: 'Gestão de Pacientes', desc: 'Ficha completa com histórico clínico, convênio, documentos e extrato financeiro em um só lugar.' },
  { Icon: Bell, color: '#ef4444', bg: '#fff1f2', title: 'Notificações Automáticas', desc: 'E-mails e mensagens WhatsApp de confirmação, cancelamento e lembretes 24h antes — enviados automaticamente.' },
  { Icon: Shield, color: '#8b5cf6', bg: '#f5f3ff', title: 'Convênios e Planos', desc: 'Cadastre planos com valor de consulta, taxa de reembolso e coparticipação. Vinculado ao paciente.' },
  { Icon: LayoutDashboard, color: '#0ea5e9', bg: '#f0f9ff', title: 'Dashboard em Tempo Real', desc: 'Métricas de sessões, pacientes, pendências e saldo atualizadas ao vivo para admin e psicólogos.' },
  { Icon: Lock, color: '#64748b', bg: '#f8fafc', title: 'Segurança de Dados', desc: 'Criptografia ponta a ponta nos prontuários. RBAC por perfil e autenticação segura via Supabase Auth.' },
  { Icon: Zap, color: '#f97316', bg: '#fff7ed', title: 'Multi-perfil', desc: 'Admin, Psicólogo e Paciente — cada um com painel personalizado, permissões e experiência distintas.' },
];

const PROFILES = [
  {
    Icon: Crown, title: 'Administrador', color: '#3b82f6',
    desc: 'Visão completa com controle total sobre todos os módulos da clínica.',
    items: ['Dashboard com métricas globais', 'Gestão de usuários e psicólogos', 'Controle financeiro completo', 'Salas, convênios e relatórios', 'Todos os agendamentos'],
  },
  {
    Icon: Brain, title: 'Psicólogo', color: '#8b5cf6',
    desc: 'Foco total na prática clínica com agenda própria e acesso aos seus pacientes.',
    items: ['Agenda pessoal interativa', 'Prontuários dos seus pacientes', 'Marcar sessões como concluídas', 'Lista de pacientes ativos', 'Dashboard com sessões do dia'],
  },
  {
    Icon: UserCheck, title: 'Paciente', color: '#10b981',
    desc: 'Portal dedicado para acompanhar sua jornada de cuidado com a clínica.',
    items: ['Solicitar e reagendar consultas', 'Histórico de consultas', 'Pagar online via PIX ou cartão', 'Perfil e dados do convênio', 'Notificações por e-mail e WhatsApp'],
  },
];

const STEPS = [
  { Icon: ClipboardList, color: '#3b82f6', step: '01', title: 'Cadastre sua clínica', desc: 'Crie as salas, psicólogos, convênios e pacientes em poucos minutos.' },
  { Icon: CalendarDays, color: '#6366f1', step: '02', title: 'Gerencie agendamentos', desc: 'Confirme sessões — o sistema notifica o paciente por e-mail e WhatsApp automaticamente.' },
  { Icon: TrendingUp, color: '#10b981', step: '03', title: 'Receba online e acompanhe', desc: 'Pacientes pagam via PIX ou cartão. Visualize receitas e métricas no dashboard em tempo real.' },
];

const STATS = [
  { value: '3', label: 'Perfis de acesso', Icon: Users, color: '#3b82f6' },
  { value: '10+', label: 'Módulos integrados', Icon: LayoutDashboard, color: '#6366f1' },
  { value: 'PIX', label: 'Pagamento online', Icon: DollarSign, color: '#10b981' },
  { value: 'AES-256', label: 'Criptografia', Icon: Shield, color: '#f59e0b' },
];

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ onLogin }) {
  const mobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(9,17,32,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
            <BrainCircuit size={19} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>FiaesPsychology</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? '0.75rem' : '2rem' }}>
          {!mobile && (
            <>
              <a href="#como-funciona" style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Como funciona</a>
              <a href="#features" style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Funcionalidades</a>
              <a href="#perfis" style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Perfis</a>
            </>
          )}
          <motion.button
            onClick={onLogin}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)', fontFamily: 'inherit' }}
          >
            Entrar <ChevronRight size={14} />
          </motion.button>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ onLogin }) {
  const mobile = useIsMobile();

  return (
    <section style={{ background: 'linear-gradient(160deg, #060d1e 0%, #0c1932 50%, #111827 100%)', padding: mobile ? '4.5rem 1.5rem 3.5rem' : '7rem 1.5rem 5.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Animated orbs */}
      <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3], x: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 65%)', top: -200, left: -100, pointerEvents: 'none' }} />
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%)', bottom: -150, right: -100, pointerEvents: 'none' }} />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)', top: '40%', left: '40%', pointerEvents: 'none' }} />

      {/* Grid pattern */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '4rem', flexDirection: mobile ? 'column' : 'row', position: 'relative', zIndex: 1 }}>
        {/* Text */}
        <motion.div style={{ flex: '0 0 52%' }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '0.35rem 1rem', marginBottom: '1.75rem' }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />
            <span style={{ color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sistema de gestão clínica</span>
          </motion.div>

          <h1 style={{ fontSize: 'clamp(2.2rem,5.5vw,3.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.035em', margin: '0 0 1.5rem' }}>
            Gestão completa para{' '}
            <span style={{ background: 'linear-gradient(90deg,#60a5fa 0%,#a78bfa 50%,#34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              clínicas de psicologia
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', color: '#64748b', lineHeight: 1.75, margin: '0 0 2.25rem', maxWidth: 500 }}>
            Do agendamento ao prontuário, do financeiro ao paciente — tudo integrado em uma plataforma segura, moderna e fácil de usar.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <motion.button onClick={onLogin} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '0.9rem 2rem', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' }}>
              Acessar o sistema <ArrowRight size={16} />
            </motion.button>
            <motion.a href="#como-funciona" whileHover={{ scale: 1.02 }}
              style={{ padding: '0.9rem 2rem', borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', backdropFilter: 'blur(8px)', fontFamily: 'inherit' }}>
              Ver como funciona
            </motion.a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            {['Agenda inteligente', 'Prontuários criptografados', 'Financeiro automático'].map((f) => (
              <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#475569', fontSize: '0.84rem', fontWeight: 500 }}>
                <CheckCircle2 size={15} color="#22d3ee" />
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Image */}
        {!mobile && (
          <motion.div style={{ flex: 1 }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)', transform: 'rotate(1deg)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={heroImg} alt="FiaesPsychology dashboard" style={{ width: '100%', display: 'block' }} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const mobile = useIsMobile();
  return (
    <section style={{ background: '#070e1d', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4,1fr)' }}>
          {STATS.map(({ value, label, Icon, color }, i) => (
            <motion.div key={label}
              whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, delay: i * 0.08 }} viewport={{ once: true }}
              style={{
                padding: '1.75rem 1.5rem', textAlign: 'center',
                borderRight: (!mobile && i < 3) ? '1px solid rgba(255,255,255,0.05)' : 'none',
                borderBottom: mobile && i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
                <Icon size={18} color={color} />
              </div>
              <p style={{ fontSize: 'clamp(1.5rem,2.5vw,1.9rem)', fontWeight: 900, background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0, letterSpacing: '-0.02em' }}>{value}</p>
              <p style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Como Funciona ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const mobile = useIsMobile();
  return (
    <section id="como-funciona" style={{ background: '#fff', padding: mobile ? '4rem 1.5rem' : '6.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div style={{ textAlign: 'center', marginBottom: '4rem' }}
          whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4 }} viewport={{ once: true }}>
          <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '0.35rem 1rem', borderRadius: 20, marginBottom: '1.1rem', border: '1px solid #bfdbfe' }}>
            Como funciona
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem', letterSpacing: '-0.03em' }}>
            Simples assim em 3 passos
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 auto', maxWidth: 500, lineHeight: 1.65 }}>
            Configure, gerencie e acompanhe — tudo dentro de uma plataforma unificada.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)', gap: mobile ? '2rem' : '1.5rem', position: 'relative' }}>
          {/* Connecting line (desktop only) */}
          {!mobile && (
            <div style={{ position: 'absolute', top: 40, left: '16.5%', right: '16.5%', height: 2, background: 'linear-gradient(90deg,#3b82f6,#6366f1,#10b981)', opacity: 0.3, borderRadius: 2, zIndex: 0 }} />
          )}
          {STEPS.map(({ Icon, color, step, title, desc }, i) => (
            <motion.div key={step}
              whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: i * 0.12 }} viewport={{ once: true }}
              style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
            >
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${color}18, ${color}08)`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', position: 'relative', boxShadow: `0 8px 24px ${color}20` }}>
                <Icon size={30} color={color} />
                <span style={{ position: 'absolute', top: -8, right: -8, width: 26, height: 26, borderRadius: '50%', background: color, color: '#fff', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 10px ${color}50` }}>{step}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.6rem', letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const mobile = useIsMobile();
  return (
    <section id="features" style={{ background: '#f8fafc', padding: mobile ? '4rem 1.5rem' : '6.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4 }} viewport={{ once: true }}>
          <span style={{ display: 'inline-block', background: '#f5f3ff', color: '#6d28d9', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '0.35rem 1rem', borderRadius: 20, marginBottom: '1.1rem', border: '1px solid #ddd6fe' }}>
            Funcionalidades
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem', letterSpacing: '-0.03em' }}>
            Tudo que sua clínica precisa
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 auto', maxWidth: 500, lineHeight: 1.65 }}>
            Módulos integrados para cobrir cada aspecto da gestão, do administrativo ao clínico.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)', gap: '1rem' }}>
          {FEATURES.map(({ Icon, color, bg, title, desc }, i) => (
            <motion.div key={title}
              whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.08 }} viewport={{ once: true }}
              whileHover={{ y: -4, boxShadow: `0 16px 40px ${color}20` }}
              style={{ background: '#fff', borderRadius: 16, padding: '1.6rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'border-color 0.2s', cursor: 'default' }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem', border: `1px solid ${color}20` }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Profiles ──────────────────────────────────────────────────────────────────
function ProfilesSection() {
  const mobile = useIsMobile();
  return (
    <section id="perfis" style={{ background: '#fff', padding: mobile ? '4rem 1.5rem' : '6.5rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4 }} viewport={{ once: true }}>
          <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '0.35rem 1rem', borderRadius: 20, marginBottom: '1.1rem', border: '1px solid #bfdbfe' }}>
            Perfis de acesso
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem', letterSpacing: '-0.03em' }}>
            Um sistema, três experiências
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 auto', maxWidth: 500, lineHeight: 1.65 }}>
            Cada perfil tem painel personalizado com acesso apenas ao que é relevante para seu papel.
          </p>
        </motion.div>

        <div style={{ display: 'flex', gap: '1.25rem', flexDirection: mobile ? 'column' : 'row' }}>
          {PROFILES.map(({ Icon, title, color, desc, items }, i) => (
            <motion.div key={title}
              whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
              whileHover={{ y: -4, boxShadow: `0 16px 40px ${color}15` }}
              style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid #f1f5f9', borderTop: `3px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.25s', cursor: 'default' }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 14, background: color + '12', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Icon size={25} color={color} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, margin: '0 0 1.5rem' }}>{desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {items.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', color: '#475569' }}>
                    <CheckCircle2 size={14} color={color} style={{ flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonial bar ──────────────────────────────────────────────────────────
function TrustSection() {
  const mobile = useIsMobile();
  const TRUST = [
    { Icon: Shield, text: 'Dados com criptografia AES-256', color: '#10b981' },
    { Icon: Lock, text: 'Autenticação segura via Supabase', color: '#3b82f6' },
    { Icon: Bell, text: 'Notificações por e-mail e WhatsApp', color: '#6366f1' },
    { Icon: DollarSign, text: 'Pagamento PIX e cartão integrado', color: '#f59e0b' },
  ];
  return (
    <section style={{ background: '#fff', padding: mobile ? '2.5rem 1.5rem' : '3.5rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
        {TRUST.map(({ Icon, text, color }) => (
          <motion.div key={text}
            whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }} viewport={{ once: true }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} color={color} />
            </div>
            <span style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 600 }}>{text}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTASection({ onLogin }) {
  const mobile = useIsMobile();
  return (
    <section style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#4338ca 50%,#5b21b6 100%)', padding: mobile ? '4.5rem 1.5rem' : '7rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity }}
        style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 65%)', top: -150, left: -150, pointerEvents: 'none' }} />
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 10, repeat: Infinity, delay: 3 }}
        style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 65%)', bottom: -100, right: -100, pointerEvents: 'none' }} />

      <motion.div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}
        whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5 }} viewport={{ once: true }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '0.35rem 1rem', marginBottom: '1.75rem' }}>
          <BrainCircuit size={15} color="#fff" />
          <span style={{ color: '#c7d2fe', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>FiaesPsychology</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem,4.5vw,3rem)', fontWeight: 900, color: '#fff', margin: '0 0 1.1rem', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Pronto para digitalizar sua clínica?
        </h2>
        <p style={{ color: '#bfdbfe', fontSize: '1.05rem', lineHeight: 1.7, margin: '0 0 2.5rem' }}>
          Acesse agora e gerencie tudo em um só lugar — agenda, pacientes, prontuários e financeiro integrados.
        </p>
        <motion.button onClick={onLogin}
          whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
          style={{ padding: '1rem 2.75rem', borderRadius: 13, border: 'none', background: '#fff', color: '#1d4ed8', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.55rem', fontFamily: 'inherit', letterSpacing: '-0.01em', transition: 'all 0.2s' }}>
          Acessar o sistema agora <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ onLogin }) {
  const mobile = useIsMobile();
  return (
    <footer style={{ background: '#040a14', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '3rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit size={17} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>FiaesPsychology</span>
            </div>
            <p style={{ color: '#334155', fontSize: '0.82rem', margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
              Sistema completo de gestão para clínicas de psicologia. Seguro, moderno e integrado.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.75rem' }}>Navegação</p>
              {['Como funciona', 'Funcionalidades', 'Perfis'].map((l) => (
                <a key={l} href={`#${l === 'Como funciona' ? 'como-funciona' : l === 'Funcionalidades' ? 'features' : 'perfis'}`}
                  style={{ display: 'block', color: '#334155', fontSize: '0.84rem', textDecoration: 'none', marginBottom: '0.45rem', fontWeight: 500 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.75rem' }}>Acesso</p>
              <button onClick={onLogin} style={{ display: 'block', color: '#3b82f6', fontSize: '0.84rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, marginBottom: '0.45rem', fontFamily: 'inherit', textAlign: 'left' }}>
                Entrar na plataforma
              </button>
              <span style={{ display: 'block', color: '#334155', fontSize: '0.84rem', fontWeight: 500 }}>Portal do paciente</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: mobile ? 'column' : 'row', gap: '0.5rem' }}>
          <p style={{ color: '#1e293b', fontSize: '0.78rem', margin: 0 }}>© {new Date().getFullYear()} FiaesPsychology — thdev07. Todos os direitos reservados.</p>
          <p style={{ color: '#1e293b', fontSize: '0.78rem', margin: 0 }}>Construído com React + Supabase + Node.js</p>
        </div>
      </div>
    </footer>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const handleLogin = () => navigate('/login');

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
      <Navbar onLogin={handleLogin} />
      <HeroSection onLogin={handleLogin} />
      <StatsBar />
      <HowItWorks />
      <FeaturesSection />
      <TrustSection />
      <ProfilesSection />
      <CTASection onLogin={handleLogin} />
      <Footer onLogin={handleLogin} />
    </div>
  );
}
