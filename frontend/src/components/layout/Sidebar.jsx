import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, DoorOpen, CalendarDays, UserCog,
  DollarSign, Shield, BarChart2, Calendar, FileText,
  CalendarPlus, Receipt, UserCircle, BrainCircuit, X, LogOut,
} from 'lucide-react';

const ICON_MAP = {
  Dashboard: LayoutDashboard,
  Pacientes: Users,
  Salas: DoorOpen,
  Agendamentos: CalendarDays,
  'Usuários': UserCog,
  Financeiro: DollarSign,
  'Convênios': Shield,
  'Relatórios': BarChart2,
  Agenda: Calendar,
  'Prontuários': FileText,
  'Solicitar Consulta': CalendarPlus,
  Documentos: Receipt,
  'Meu Perfil': UserCircle,
};

const MENUS = {
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/pacientes', label: 'Pacientes' },
    { to: '/admin/agendamentos', label: 'Agendamentos' },
    { to: '/admin/usuarios', label: 'Usuários' },
    { to: '/admin/financeiro', label: 'Financeiro' },
    { to: '/admin/salas', label: 'Salas' },
    { to: '/admin/convenios', label: 'Convênios' },
    { to: '/admin/relatorios', label: 'Relatórios' },
  ],
  psicologo: [
    { to: '/psicologo', label: 'Dashboard', end: true },
    { to: '/psicologo/agenda', label: 'Agenda' },
    { to: '/psicologo/pacientes', label: 'Pacientes' },
    { to: '/psicologo/prontuarios', label: 'Prontuários' },
  ],
  paciente: [
    { to: '/paciente', label: 'Dashboard', end: true },
    { to: '/paciente/agendamentos', label: 'Agendamentos' },
    { to: '/paciente/novo-agendamento', label: 'Solicitar Consulta' },
    { to: '/paciente/documentos', label: 'Documentos' },
    { to: '/paciente/perfil', label: 'Meu Perfil' },
  ],
};

const ROLE_LABEL = { admin: 'Administrador', psicologo: 'Psicólogo', paciente: 'Paciente' };

function getInitials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar({ mobile = false, open = false, onClose = () => {} }) {
  const { role, user, signOut } = useAuth();
  const navigate = useNavigate();
  const items = MENUS[role] ?? [];
  const nome = user?.user_metadata?.nome ?? user?.email ?? '';

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const asideStyle = mobile
    ? {
        ...styles.aside,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '4px 0 24px rgba(0,0,0,0.35)' : 'none',
      }
    : styles.aside;

  return (
    <aside style={asideStyle}>
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <BrainCircuit size={20} color="#fff" />
        </div>
        <span style={styles.logoText}>FiaesPsychology</span>
        {mobile && (
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.2rem', borderRadius: 6 }}
            aria-label="Fechar menu"
          >
            <X size={20} color="#94a3b8" />
          </button>
        )}
      </div>

      <nav style={styles.nav}>
        {items.map(({ to, label, end }) => {
          const Icon = ICON_MAP[label] ?? LayoutDashboard;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => mobile && onClose()}
              style={({ isActive }) => ({
                ...styles.link,
                background: isActive ? '#2563eb' : 'transparent',
                color: isActive ? '#fff' : '#94a3b8',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} style={{ flexShrink: 0, color: isActive ? '#fff' : '#64748b' }} />
                  <span style={{ fontSize: '0.875rem' }}>{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={styles.footer}>
        <div style={styles.footerUser}>
          <div style={styles.avatar}>{getInitials(nome)}</div>
          <div style={styles.footerInfo}>
            <span style={styles.footerName}>{nome || 'Usuário'}</span>
            <span style={styles.footerRole}>{ROLE_LABEL[role] ?? role}</span>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn} title="Sair">
          <LogOut size={15} color="#64748b" />
        </button>
      </div>
    </aside>
  );
}

const styles = {
  aside: {
    width: 224,
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    borderRight: '1px solid #1e293b',
  },
  logoArea: {
    padding: '1.1rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 0.5rem',
    gap: '0.15rem',
    flex: 1,
    overflowY: 'auto',
  },
  link: {
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  footer: {
    padding: '0.75rem',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  footerUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  footerInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  footerName: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#e2e8f0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  footerRole: {
    fontSize: '0.68rem',
    color: '#64748b',
  },
  logoutBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    border: '1px solid #1e293b',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.2s',
  },
};
