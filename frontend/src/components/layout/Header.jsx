import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X } from 'lucide-react';

const PAGE_TITLES = {
  // Admin
  '/admin': 'Dashboard',
  '/admin/pacientes': 'Pacientes',
  '/admin/salas': 'Salas',
  '/admin/agendamentos': 'Agendamentos',
  '/admin/usuarios': 'Usuários',
  '/admin/financeiro': 'Financeiro',
  '/admin/convenios': 'Convênios',
  '/admin/relatorios': 'Relatórios',
  // Psicologo
  '/psicologo': 'Meu Painel',
  '/psicologo/agenda': 'Agenda',
  '/psicologo/pacientes': 'Meus Pacientes',
  '/psicologo/prontuarios': 'Prontuários',
  // Paciente
  '/paciente': 'Início',
  '/paciente/agendamentos': 'Minhas Consultas',
  '/paciente/novo-agendamento': 'Solicitar Consulta',
  '/paciente/documentos': 'Documentos',
  '/paciente/perfil': 'Meu Perfil',
  '/paciente/pagamento/sucesso': 'Pagamento',
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/psicologo/prontuario/')) return 'Prontuário';
  return '';
}

export default function Header({ mobile = false, onMenuToggle = () => {}, sidebarOpen = false }) {
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);
  const nome = user?.user_metadata?.nome ?? '';
  const greeting = nome ? `Olá, ${nome.split(' ')[0]}` : '';

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {mobile ? (
          <button
            onClick={onMenuToggle}
            style={styles.hamburger}
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? <X size={20} color="#475569" /> : <Menu size={20} color="#475569" />}
          </button>
        ) : (
          <span style={styles.pageTitle}>{pageTitle}</span>
        )}
      </div>

      <div style={styles.right}>
        {!mobile && greeting && (
          <span style={styles.greeting}>{greeting}</span>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 1.25rem',
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
  pageTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  greeting: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 500,
  },
};
