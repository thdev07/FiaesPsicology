import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MENUS = {
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/pacientes', label: 'Pacientes' },
    { to: '/admin/salas', label: 'Salas' },
    { to: '/admin/agendamentos', label: 'Agendamentos' },
    { to: '/admin/usuarios', label: 'Usuários' },
    { to: '/admin/financeiro', label: 'Financeiro' },
    { to: '/admin/convenios', label: 'Convênios' },
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
    { to: '/paciente/documentos', label: 'Documentos' },
  ],
};

export default function Sidebar() {
  const { role } = useAuth();
  const items = MENUS[role] ?? [];

  return (
    <aside style={styles.aside}>
      <div style={styles.logo}>PsyManager</div>
      <nav style={styles.nav}>
        {items.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              ...styles.link,
              background: isActive ? '#334155' : 'transparent',
              color: isActive ? '#fff' : '#94a3b8',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  aside: {
    width: 220,
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  logo: {
    padding: '1.25rem 1rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#fff',
    borderBottom: '1px solid #1e293b',
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 0.5rem',
    gap: '0.25rem',
  },
  link: {
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
  },
};
