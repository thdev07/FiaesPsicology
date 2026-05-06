import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

export default function Header() {
  const { user } = useAuth();

  const handleLogout = () => supabase.auth.signOut();

  return (
    <header style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{user?.user_metadata?.nome ?? user?.email}</span>
      <button onClick={handleLogout}>Sair</button>
    </header>
  );
}
