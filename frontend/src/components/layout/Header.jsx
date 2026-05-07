import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, Menu, X } from 'lucide-react';

const ROLE_LABEL = {
  admin: 'Administrador',
  psicologo: 'Psicólogo',
  paciente: 'Paciente',
};

function getInitials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Header({ mobile = false, onMenuToggle = () => {}, sidebarOpen = false }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const nome = user?.user_metadata?.nome ?? user?.email ?? '';
  const initials = getInitials(user?.user_metadata?.nome ?? '');

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {mobile && (
          <button
            onClick={onMenuToggle}
            style={styles.hamburger}
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? <X size={20} color="#475569" /> : <Menu size={20} color="#475569" />}
          </button>
        )}
        {!mobile && (
          <span style={styles.pageHint}>{ROLE_LABEL[role] ?? role}</span>
        )}
      </div>

      <div style={styles.right}>
        <button style={styles.iconBtn} title="Notificações" aria-label="Notificações">
          <Bell size={18} color="#64748b" />
        </button>

        <div style={styles.divider} />

        <div style={styles.userInfo}>
          <div style={styles.avatar}>{initials}</div>
          {!mobile && (
            <div style={styles.userText}>
              <span style={styles.nome}>{nome}</span>
              <span style={styles.roleLabel}>{ROLE_LABEL[role] ?? role}</span>
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn} title="Sair">
          <LogOut size={15} />
          {!mobile && <span>Sair</span>}
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    height: 56,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  hamburger: {
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  pageHint: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  divider: {
    width: 1,
    height: 28,
    background: '#e2e8f0',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  userText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.05rem',
  },
  nome: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#1e293b',
    lineHeight: 1.2,
  },
  roleLabel: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    lineHeight: 1.2,
  },
  logoutBtn: {
    padding: '0.4rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'all 0.2s ease',
  },
};
