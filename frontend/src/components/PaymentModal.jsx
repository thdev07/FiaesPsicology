import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Copy, Check, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PaymentModal({ transaction, onClose, onPaid }) {
  const { show: toast } = useToast();
  const [step, setStep] = useState('loading'); // loading | ready | paid | error
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  const startPolling = useCallback((transactionId) => {
    pollRef.current = setInterval(async () => {
      try {
        const { status_pagamento } = await api.get(`/financial/payment/${transactionId}/status`);
        if (status_pagamento === 'pago') {
          clearInterval(pollRef.current);
          setStep('paid');
          toast('Pagamento confirmado!', 'success');
          setTimeout(() => { onPaid?.(); onClose(); }, 2500);
        }
      } catch (_) {}
    }, 5000);
  }, [toast, onClose, onPaid]);

  useEffect(() => {
    async function initPayment() {
      try {
        const data = await api.post('/financial/payment/create', { transactionId: transaction.id });
        setPixData(data);
        setStep('ready');
        startPolling(transaction.id);
      } catch (err) {
        setStep('error');
        toast(err?.error ?? 'Erro ao iniciar pagamento', 'error');
      }
    }
    initPayment();
    return () => clearInterval(pollRef.current);
  }, [transaction.id, startPolling, toast]);

  function copyPix() {
    if (!pixData?.qr_code) return;
    navigator.clipboard.writeText(pixData.qr_code).then(() => {
      setCopied(true);
      toast('Código PIX copiado!', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <button onClick={onClose} style={closeBtn} aria-label="Fechar"><X size={18} /></button>

        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
          Pagar consulta
        </h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          {transaction.categoria} — <strong>{fmt(transaction.valor)}</strong>
        </p>

        {step === 'loading' && (
          <div style={centered}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
            <p style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>Gerando QR Code PIX...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {step === 'ready' && pixData && (
          <>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textAlign: 'center', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pague via PIX
            </p>

            {pixData.qr_code_base64 ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <img
                  src={pixData.qr_code_base64}
                  alt="QR Code PIX"
                  style={{ width: 200, height: 200, borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                />
              </div>
            ) : (
              <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>QR Code indisponível — use o código abaixo</p>
              </div>
            )}

            {pixData.qr_code && (
              <button onClick={copyPix} style={copyBtn}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copiado!' : 'Copiar código PIX'}
              </button>
            )}

            <div style={divider}>
              <span style={dividerText}>ou</span>
            </div>

            <a href={pixData.checkout_url} target="_blank" rel="noreferrer" style={cardBtn}>
              <CreditCard size={15} />
              Pagar com cartão de crédito
            </a>

            <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '1.25rem' }}>
              Aguardando confirmação do pagamento…
            </p>
          </>
        )}

        {step === 'paid' && (
          <div style={{ ...centered, gap: '0.75rem' }}>
            <CheckCircle2 size={48} color="#16a34a" />
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', margin: 0 }}>Pago com sucesso!</p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Você receberá um e-mail de confirmação.</p>
          </div>
        )}

        {step === 'error' && (
          <div style={centered}>
            <p style={{ color: '#dc2626', fontWeight: 600 }}>Não foi possível gerar o pagamento.</p>
            <button onClick={onClose} style={{ ...copyBtn, background: '#fee2e2', color: '#b91c1c' }}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '1rem',
};
const modal = {
  background: '#fff', borderRadius: '1rem', padding: '1.75rem',
  width: '100%', maxWidth: '380px', position: 'relative',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};
const closeBtn = {
  position: 'absolute', top: '1rem', right: '1rem',
  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4,
};
const centered = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' };
const copyBtn = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
  borderRadius: '0.5rem', padding: '0.65rem', fontWeight: 600, fontSize: '0.875rem',
  cursor: 'pointer', marginBottom: '0.5rem',
};
const cardBtn = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb',
  borderRadius: '0.5rem', padding: '0.65rem', fontWeight: 600, fontSize: '0.875rem',
  cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box',
};
const divider = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0',
};
const dividerText = {
  flex: 1, textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af',
  background: '#fff', position: 'relative',
};
