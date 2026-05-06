import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const ROLE_REDIRECT = {
  admin: '/admin',
  psicologo: '/psicologo',
  paciente: '/paciente',
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(authError.message);
        return;
      }

      const role = data.user?.user_metadata?.role;
      if (!role) {
        setError('Usuário sem role definida. Contate o administrador.');
        return;
      }

      navigate(ROLE_REDIRECT[role] ?? '/login');
    } catch (err) {
      setError('Erro de conexão com o servidor. Verifique as configurações.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>FiaesPsychology</h1>
        <p style={styles.subtitle}>Acesse sua conta</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="seu@email.com"
          />

          <label style={styles.label}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="••••••••"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: {
    margin: '0 0 0.25rem',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1a202c',
  },
  subtitle: {
    margin: '0 0 1.5rem',
    color: '#718096',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#4a5568',
    marginTop: '0.5rem',
  },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '1rem',
    outline: 'none',
  },
  error: {
    color: '#e53e3e',
    fontSize: '0.875rem',
    margin: '0.25rem 0',
  },
  button: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    background: '#4299e1',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  link: {
    marginTop: '1.25rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#718096',
  },
};
