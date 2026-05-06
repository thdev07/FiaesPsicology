import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const { role } = useAuth();

  return (
    <aside style={{ width: 240, background: '#1e293b', color: '#fff', padding: '1rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>PsyManager</h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {role === 'admin' && (
          <>
            <NavLink to="/admin">Dashboard</NavLink>
            <NavLink to="/admin/users">Usuários</NavLink>
            <NavLink to="/admin/financial">Financeiro</NavLink>
            <NavLink to="/admin/reports">Relatórios</NavLink>
          </>
        )}
        {role === 'psicologo' && (
          <>
            <NavLink to="/psicologo">Dashboard</NavLink>
            <NavLink to="/psicologo/agenda">Agenda</NavLink>
            <NavLink to="/psicologo/pacientes">Pacientes</NavLink>
            <NavLink to="/psicologo/prontuarios">Prontuários</NavLink>
          </>
        )}
        {role === 'paciente' && (
          <>
            <NavLink to="/paciente">Dashboard</NavLink>
            <NavLink to="/paciente/agendamentos">Agendamentos</NavLink>
            <NavLink to="/paciente/documentos">Documentos</NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
