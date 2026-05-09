import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.5rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <CheckCircle size={72} color="#16a34a" />
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: 0 }}>
        Pagamento confirmado!
      </h1>
      <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0, maxWidth: '360px' }}>
        Seu pagamento foi processado com sucesso. Você receberá um e-mail de confirmação em breve.
      </p>
      <button
        onClick={() => navigate('/paciente')}
        style={{
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.75rem 2rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Voltar ao início
      </button>
    </div>
  );
}
