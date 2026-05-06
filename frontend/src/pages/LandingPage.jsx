import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/imgLandingPage.png';

const THEME = {
  blue: '#3b82f6',
  blueHover: '#2563eb',
  indigo: '#6366f1',
  dark: '#1e293b',
  darkDeep: '#0f172a',
  slate: '#475569',
  muted: '#94a3b8',
  surface: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  green: '#10b981',
};

const FEATURES = [
  { icon: '📅', color: '#3b82f6', title: 'Agenda Inteligente', desc: 'Visualize e gerencie todos os agendamentos em um calendário interativo, com suporte a múltiplos psicólogos e salas.' },
  { icon: '📋', color: '#6366f1', title: 'Prontuários Digitais', desc: 'Registre evoluções clínicas com editor de texto rico, seguro e acessível a qualquer momento.' },
  { icon: '💰', color: '#10b981', title: 'Gestão Financeira', desc: 'Controle receitas, despesas e saldo em tempo real. Transações geradas automaticamente ao confirmar consultas.' },
  { icon: '👥', color: '#f59e0b', title: 'Gestão de Pacientes', desc: 'Cadastro completo com histórico de consultas, documentos e informações de convênio em um só lugar.' },
  { icon: '🏥', color: '#ef4444', title: 'Salas e Recursos', desc: 'Gerencie as salas da clínica, associando cada agendamento ao espaço correto para evitar conflitos.' },
  { icon: '🩺', color: '#8b5cf6', title: 'Convênios', desc: 'Cadastre convênios aceitos pela clínica e vincule pacientes aos seus planos de saúde com facilidade.' },
  { icon: '📊', color: '#0ea5e9', title: 'Dashboard em Tempo Real', desc: 'Painéis com métricas de sessões, pacientes, pendências e saldo financeiro atualizados em tempo real.' },
  { icon: '🔐', color: '#64748b', title: 'Segurança de Dados', desc: 'Prontuários com criptografia AES-256. Acesso por perfil com autenticação segura via Supabase Auth.' },
  { icon: '⚡', color: '#f97316', title: 'Multi-perfil', desc: 'Três perfis distintos — Administrador, Psicólogo e Paciente — cada um com seu próprio painel e permissões.' },
];

const PROFILES = [
  {
    icon: '👑',
    title: 'Administrador',
    color: '#3b82f6',
    desc: 'Visão completa da clínica com controle total sobre todos os módulos.',
    items: ['Dashboard com métricas globais', 'Gestão de usuários e psicólogos', 'Controle financeiro completo', 'Gerenciar salas e convênios', 'Todos os agendamentos'],
  },
  {
    icon: '🧠',
    title: 'Psicólogo',
    color: '#6366f1',
    desc: 'Foco na prática clínica com agenda própria e acesso aos pacientes.',
    items: ['Agenda pessoal interativa', 'Prontuários dos seus pacientes', 'Marcar sessões como concluídas', 'Lista de pacientes ativos', 'Dashboard com sessões do dia'],
  },
  {
    icon: '🙋',
    title: 'Paciente',
    color: '#10b981',
    desc: 'Portal dedicado para acompanhar sua jornada de cuidado.',
    items: ['Visualizar próximas sessões', 'Histórico de consultas', 'Acesso a documentos', 'Informações do convênio', 'Portal personalizado'],
  },
];

const STATS = [
  { value: '3', label: 'Perfis de acesso' },
  { value: '7', label: 'Módulos integrados' },
  { value: '100%', label: 'Digital e seguro' },
  { value: 'Real', label: 'Dados em tempo real' },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

function useHover() {
  const [hovered, setHovered] = useState(false);
  return [hovered, { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }];
}

function NavBtn({ onLogin }) {
  const [h, handlers] = useHover();
  return (
    <button
      onClick={onLogin}
      {...handlers}
      style={{
        padding: '0.5rem 1.25rem',
        borderRadius: '8px',
        border: 'none',
        background: h ? THEME.blueHover : THEME.blue,
        color: THEME.white,
        fontWeight: 700,
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'background 0.2s',
        letterSpacing: '0.01em',
      }}
    >
      Entrar no sistema →
    </button>
  );
}

function Navbar({ onLogin }) {
  const mobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(15,23,42,0.97)' : '#0f172a',
      backdropFilter: 'blur(8px)',
      borderBottom: scrolled ? '1px solid #1e293b' : '1px solid transparent',
      transition: 'all 0.2s',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🧠</span>
          <span style={{ color: THEME.white, fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>FiaesPsychology</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? '0.75rem' : '1.75rem' }}>
          {!mobile && (
            <>
              <a href="#features" style={{ color: THEME.muted, fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Funcionalidades</a>
              <a href="#perfis" style={{ color: THEME.muted, fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Perfis</a>
            </>
          )}
          <NavBtn onLogin={onLogin} />
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ onLogin }) {
  const mobile = useIsMobile();
  const [h1, hh1] = useHover();
  const [h2, hh2] = useHover();

  return (
    <section style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1a2942 45%, #1e293b 100%)',
      padding: mobile ? '4rem 1.5rem 3rem' : '6rem 1.5rem 5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)',
      }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '3rem', flexDirection: mobile ? 'column' : 'row' }}>
        <div style={{ flex: '0 0 55%', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 20, padding: '0.35rem 0.9rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
            <span style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sistema de gestão clínica</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.6rem)', fontWeight: 800, color: THEME.white, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 1.25rem' }}>
            Gestão completa para sua{' '}
            <span style={{ background: 'linear-gradient(90deg,#3b82f6,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              clínica de psicologia
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,2vw,1.125rem)', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 2rem', maxWidth: 520 }}>
            Do agendamento ao prontuário, do financeiro ao paciente — tudo integrado em uma plataforma segura, moderna e fácil de usar.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button
              onClick={onLogin}
              {...hh1}
              style={{
                padding: '0.875rem 2rem', borderRadius: 10, border: 'none',
                background: h1 ? '#2563eb' : 'linear-gradient(90deg,#3b82f6,#6366f1)',
                color: THEME.white, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: h1 ? '0 8px 24px rgba(59,130,246,0.45)' : '0 4px 14px rgba(59,130,246,0.3)',
                transform: h1 ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Acessar o sistema →
            </button>
            <a
              href="#features"
              {...hh2}
              style={{
                padding: '0.875rem 2rem', borderRadius: 10,
                border: `1px solid ${h2 ? '#475569' : '#334155'}`,
                background: h2 ? '#1e293b' : 'transparent',
                color: THEME.white, fontWeight: 600, fontSize: '0.95rem',
                textDecoration: 'none', display: 'inline-block',
                transition: 'all 0.2s',
              }}
            >
              Ver funcionalidades
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {['Agenda inteligente', 'Prontuários digitais', 'Gestão financeira'].map((f) => (
              <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#10b981' }}>✓</span>
                {f}
              </span>
            ))}
          </div>
        </div>

        {!mobile && (
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)',
              transform: 'rotate(1.5deg)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <img src={heroImg} alt="FiaesPsychology dashboard" style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatsBar() {
  const mobile = useIsMobile();
  return (
    <section style={{ background: '#0a1628', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4,1fr)' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '1.75rem 1.5rem', textAlign: 'center',
              borderRight: (!mobile && i < 3) ? '1px solid #1e293b' : 'none',
              borderBottom: mobile && i < 2 ? '1px solid #1e293b' : 'none',
            }}>
              <p style={{ fontSize: 'clamp(1.6rem,3vw,2rem)', fontWeight: 800, background: 'linear-gradient(90deg,#3b82f6,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 0.25rem' }}>{s.value}</p>
              <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, color, title, desc }) {
  const [h, handlers] = useHover();
  return (
    <div
      {...handlers}
      style={{
        background: THEME.white,
        borderRadius: 14,
        padding: '1.5rem',
        border: `1px solid ${h ? color + '55' : THEME.border}`,
        boxShadow: h ? `0 12px 32px ${color}22` : '0 1px 4px rgba(0,0,0,0.06)',
        transform: h ? 'translateY(-4px)' : 'none',
        transition: 'all 0.22s ease',
        cursor: 'default',
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: THEME.dark, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

function FeaturesSection() {
  const mobile = useIsMobile();
  return (
    <section id="features" style={{ background: THEME.surface, padding: mobile ? '4rem 1.5rem' : '6rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ display: 'inline-block', background: '#ede9fe', color: '#6d28d9', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.3rem 0.85rem', borderRadius: 20, marginBottom: '1rem' }}>
            Funcionalidades
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, color: THEME.dark, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
            Tudo que sua clínica precisa
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 auto', maxWidth: 520, lineHeight: 1.6 }}>
            Módulos integrados para cobrir cada aspecto da gestão clínica, do administrativo ao clínico.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)', gap: '1rem' }}>
          {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </section>
  );
}

function ProfileCard({ icon, title, color, desc, items }) {
  const [h, handlers] = useHover();
  return (
    <div
      {...handlers}
      style={{
        background: h ? '#0f1f35' : '#0d1b2e',
        borderRadius: 16,
        padding: '2rem',
        border: `1px solid ${h ? color + '55' : '#1e293b'}`,
        borderTop: `4px solid ${color}`,
        boxShadow: h ? `0 12px 32px ${color}22` : 'none',
        transform: h ? 'translateY(-4px)' : 'none',
        transition: 'all 0.22s ease',
        flex: 1,
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1.25rem' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: THEME.white, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1.25rem' }}>{desc}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item) => (
          <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color, flexShrink: 0 }}>✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfilesSection() {
  const mobile = useIsMobile();
  return (
    <section id="perfis" style={{ background: '#0a1628', padding: mobile ? '4rem 1.5rem' : '6rem 1.5rem', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ display: 'inline-block', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.3rem 0.85rem', borderRadius: 20, marginBottom: '1rem', border: '1px solid rgba(59,130,246,0.25)' }}>
            Perfis de acesso
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, color: THEME.white, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
            Um sistema, três experiências
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 auto', maxWidth: 520, lineHeight: 1.6 }}>
            Cada perfil tem seu próprio painel personalizado, com acesso apenas ao que é relevante para seu papel.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: mobile ? 'column' : 'row' }}>
          {PROFILES.map((p) => <ProfileCard key={p.title} {...p} />)}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onLogin }) {
  const mobile = useIsMobile();
  const [h, handlers] = useHover();
  return (
    <section style={{
      background: 'linear-gradient(135deg, #1e40af 0%, #4338ca 50%, #4f46e5 100%)',
      padding: mobile ? '4rem 1.5rem' : '6rem 1.5rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: THEME.white, margin: '0 0 1rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Pronto para digitalizar sua clínica?
        </h2>
        <p style={{ color: '#bfdbfe', fontSize: '1.05rem', lineHeight: 1.7, margin: '0 0 2.25rem' }}>
          Acesse agora e gerencie tudo em um só lugar — agenda, pacientes, prontuários e financeiro integrados.
        </p>
        <button
          onClick={onLogin}
          {...handlers}
          style={{
            padding: '1rem 2.5rem', borderRadius: 12, border: 'none',
            background: h ? '#f1f5f9' : THEME.white,
            color: '#1e40af', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
            boxShadow: h ? '0 8px 28px rgba(0,0,0,0.25)' : '0 4px 14px rgba(0,0,0,0.15)',
            transform: h ? 'translateY(-2px) scale(1.02)' : 'none',
            transition: 'all 0.2s',
            letterSpacing: '-0.01em',
          }}
        >
          Acessar o sistema agora →
        </button>
      </div>
    </section>
  );
}

function Footer({ onLogin }) {
  const mobile = useIsMobile();
  return (
    <footer style={{ background: '#060e1a', borderTop: '1px solid #1e293b', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: mobile ? 'column' : 'row', gap: '1.5rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🧠</span>
            <div>
              <p style={{ color: THEME.white, fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>FiaesPsychology</p>
              <p style={{ color: '#475569', fontSize: '0.78rem', margin: 0 }}>Gestão clínica inteligente</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: '#475569', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>Funcionalidades</a>
            <a href="#perfis" style={{ color: '#475569', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>Perfis</a>
            <button onClick={onLogin} style={{ background: 'none', border: '1px solid #334155', borderRadius: 6, color: '#94a3b8', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Entrar</button>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: mobile ? 'column' : 'row', gap: '0.5rem' }}>
          <p style={{ color: '#334155', fontSize: '0.8rem', margin: 0 }}>© 2025 FiaesPsychology — thdev07. Todos os direitos reservados.</p>
          <p style={{ color: '#1e293b', fontSize: '0.78rem', margin: 0 }}>Construído com React + Supabase</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const handleLogin = () => navigate('/login');

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  return (
    <div style={{ width: '100%', textAlign: 'left', fontFamily: "system-ui,'Segoe UI',Roboto,sans-serif", overflowX: 'hidden' }}>
      <Navbar onLogin={handleLogin} />
      <HeroSection onLogin={handleLogin} />
      <StatsBar />
      <FeaturesSection />
      <ProfilesSection />
      <CTASection onLogin={handleLogin} />
      <Footer onLogin={handleLogin} />
    </div>
  );
}
