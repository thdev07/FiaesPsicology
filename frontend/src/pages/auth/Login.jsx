import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, BrainCircuit } from 'lucide-react';
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
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.brandRow}>
            <div style={styles.brandIcon}>
              <BrainCircuit size={28} color="#fff" />
            </div>
          </div>
          <h1 style={styles.brandTitle}>FiaesPsychology</h1>
          <p style={styles.brandSubtitle}>
            Gestão completa para sua clínica de psicologia — agenda, prontuários, financeiro e muito mais.
          </p>
          <div style={styles.featureList}>
            {[
              'Agenda inteligente e multi-perfil',
              'Prontuários digitais seguros',
              'Gestão financeira integrada',
              'Dashboard em tempo real',
            ].map((f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot} />
                <span style={styles.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={styles.rightPanel}>
        <motion.div
          style={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Bem-vindo de volta</h2>
            <p style={styles.cardSubtitle}>Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrap}>
                <Mail size={16} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Senha</label>
              <div style={styles.inputWrap}>
                <Lock size={16} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <p style={styles.errorText}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={styles.footer}>
            FiaesPsychology &copy; {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  leftPanel: {
    flex: '0 0 45%',
    background: 'linear-gradient(135deg, #0f172a 0%, #1a2942 50%, #1e3a5f 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 380,
  },
  brandRow: {
    marginBottom: '1.25rem',
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 0.75rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  brandSubtitle: {
    fontSize: '0.975rem',
    color: '#94a3b8',
    lineHeight: 1.7,
    margin: '0 0 2rem',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  featureDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: 'rgba(16,185,129,0.2)',
    border: '1px solid rgba(16,185,129,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    padding: '2rem',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2.25rem 2rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  },
  cardHeader: {
    marginBottom: '1.75rem',
  },
  cardTitle: {
    margin: '0 0 0.3rem',
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: '-0.01em',
  },
  cardSubtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.825rem',
    fontWeight: 600,
    color: '#374151',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.7rem',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#1e293b',
  },
  errorBox: {
    background: '#fff5f5',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '0.6rem 0.85rem',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.85rem',
    margin: 0,
  },
  button: {
    marginTop: '0.25rem',
    padding: '0.7rem',
    borderRadius: '6px',
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.78rem',
    color: '#94a3b8',
  },
};
