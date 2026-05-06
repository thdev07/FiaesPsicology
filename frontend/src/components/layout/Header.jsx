import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_LABEL = {
  admin: 'Administrador',
  psicologo: 'Psicólogo',
  paciente: 'Paciente',
};

export default function Header() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const nome = user?.user_metadata?.nome ?? user?.email ?? '';

  return (
    <header style={styles.header}>
      <div style={styles.info}>
        <span style={styles.nome}>{nome}</span>
        <span style={styles.role}>{ROLE_LABEL[role] ?? role}</span>
      </div>
      <button onClick={handleLogout} style={styles.btn}>
        Sair
      </button>
    </header>
  );
}

const styles = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
  },
  nome: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#1e293b',
  },
  role: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  btn: {
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontWeight: 500,
  },
};
